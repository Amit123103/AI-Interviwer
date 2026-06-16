import { Request, Response } from 'express';
import prisma from '../prisma';
import { executionService } from '../services/executionService';
import OpenAI from 'openai';
import { updateUserProgress } from '../services/gamificationService';

const openai = new OpenAI({
    baseURL: 'https://integrate.api.nvidia.com/v1',
    apiKey: process.env.NVIDIA_API_KEY || 'missing_key_check_env',
});

const MODEL = process.env.NVIDIA_MODEL || 'openai/gpt-oss-120b';

// ─── CV Parsing ──────────────────────────────────────────────────────────────

const LANG_KEYWORDS = ['python', 'javascript', 'typescript', 'java', 'c++', 'cpp', 'golang', 'go', 'ruby', 'kotlin', 'swift', 'rust', 'scala', 'php', 'r', 'matlab'];
const FRAMEWORK_KEYWORDS = ['react', 'angular', 'vue', 'next.js', 'nextjs', 'node', 'express', 'django', 'flask', 'spring', 'fastapi', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'mysql', 'mongodb', 'postgresql', 'redis', 'docker', 'kubernetes', 'aws', 'azure', 'gcp'];
const DOMAIN_KEYWORDS = ['machine learning', 'data science', 'web development', 'backend', 'frontend', 'full stack', 'devops', 'mobile', 'android', 'ios', 'data analysis', 'cloud', 'security', 'networking', 'algorithms', 'data structures'];
const TOPIC_MAP: Record<string, string[]> = {
    'python': ['Arrays', 'Strings', 'Dynamic Programming'],
    'javascript': ['Arrays', 'Strings', 'Trees'],
    'java': ['Arrays', 'Graphs', 'Sorting'],
    'cpp': ['Dynamic Programming', 'Graphs', 'Binary Search'],
    'machine learning': ['Arrays', 'Math', 'Sorting'],
    'data science': ['Arrays', 'Strings', 'Math'],
    'web development': ['Strings', 'Arrays', 'Trees'],
    'algorithms': ['Dynamic Programming', 'Graphs', 'Binary Search'],
};

function parseCVText(cvText: string): Partial<{
    languages: string[]; frameworks: string[]; domains: string[]; tools: string[];
    experienceLevel: 'Entry' | 'Mid' | 'Senior'; suggestedTopics: string[];
}> {
    const lower = cvText.toLowerCase();
    const languages = LANG_KEYWORDS.filter(k => lower.includes(k));
    const frameworks = FRAMEWORK_KEYWORDS.filter(k => lower.includes(k));
    const domains = DOMAIN_KEYWORDS.filter(k => lower.includes(k));

    let expLevel: 'Entry' | 'Mid' | 'Senior' = 'Entry';
    if (lower.includes('senior') || lower.includes('lead') || lower.includes('architect') || lower.includes('principal')) {
        expLevel = 'Senior';
    } else if (lower.includes('mid') || lower.includes('intermediate') || lower.includes('3 years') || lower.includes('4 years') || lower.includes('5 years')) {
        expLevel = 'Mid';
    }

    const topicSet = new Set<string>();
    [...languages, ...domains].forEach(k => {
        (TOPIC_MAP[k] || []).forEach(t => topicSet.add(t));
    });

    return {
        languages: [...new Set(languages)],
        frameworks: [...new Set(frameworks)],
        domains: [...new Set(domains)],
        tools: [],
        experienceLevel: expLevel,
        suggestedTopics: [...topicSet],
    };
}

// ─── Question Selection ───────────────────────────────────────────────────────

async function selectProblems(
    numQuestions: number,
    difficulty: string,
    language: string,
    cvData?: { languages?: string[]; domains?: string[]; suggestedTopics?: string[] },
    topicPreference?: string
): Promise<any[]> {
    const where: any = {};

    if (difficulty !== 'Auto') {
        where.difficulty = difficulty as any;
    } else {
        where.difficulty = { in: ['Easy', 'Medium'] };
    }

    const topics = topicPreference
        ? [topicPreference]
        : (cvData?.suggestedTopics || []);

    if (topics.length > 0) {
        where.OR = [
            { category: { in: topics } },
            { tags: { hasSome: topics } }
        ];
    }

    let problems = await prisma.problem.findMany({
        where,
        take: numQuestions * 3
    });

    problems = problems.sort(() => Math.random() - 0.5).slice(0, numQuestions);

    if (problems.length < numQuestions) {
        const fallback = await prisma.problem.findMany({
            where: { id: { notIn: problems.map(p => p.id) } },
            take: numQuestions - problems.length
        });
        problems = [...problems, ...fallback];
    }

    return problems;
}

// ─── AI Evaluation ───────────────────────────────────────────────────────────

async function evaluateSession(session: any): Promise<any> {
    const questions: any[] = session.questions || [];
    const solved = questions.filter((q: any) => q.status === 'accepted').length;
    const attempted = questions.filter((q: any) => ['accepted', 'wrong', 'attempted'].includes(q.status)).length;
    const total = questions.length;
    const accuracyPercent = attempted > 0 ? Math.round((solved / total) * 100) : 0;

    const totalTimeSeconds = questions.reduce((sum: number, q: any) => sum + (q.timeTakenSeconds || 0), 0);
    const avgTimePerQuestion = total > 0 ? totalTimeSeconds / total : 0;

    const technicalAccuracy = Math.min(10, Math.round((solved / Math.max(total, 1)) * 10));
    const timeManagement = avgTimePerQuestion < 300 ? 9 : avgTimePerQuestion < 600 ? 7 : 5;
    const debuggingAbility = questions.filter((q: any) => q.status === 'accepted' && (q.submissionResult?.runtime || 0) < 500).length * 2;
    const efficiency = Math.min(10, Math.max(1, debuggingAbility));
    const codeQuality = technicalAccuracy > 7 ? 8 : technicalAccuracy > 4 ? 6 : 4;
    const problemSolving = Math.round((technicalAccuracy + efficiency) / 2);

    const overallScore = Math.round(
        (technicalAccuracy * 0.30 + efficiency * 0.20 + codeQuality * 0.15 + problemSolving * 0.20 + timeManagement * 0.15) * 10
    );

    let readinessLevel: 'Beginner' | 'Developing' | 'Job Ready' | 'Interview Ready' = 'Beginner';
    if (overallScore >= 80) readinessLevel = 'Interview Ready';
    else if (overallScore >= 65) readinessLevel = 'Job Ready';
    else if (overallScore >= 45) readinessLevel = 'Developing';

    let aiSummary = '';
    try {
        const questionSummaries = questions.map((q: any, i: number) =>
            `Q${i + 1}: "${q.title}" (${q.difficulty}) - Status: ${q.status}, Time: ${q.timeTakenSeconds || 0}s`
        ).join('\n');

        const prompt = `You are an expert coding interview evaluator. A student completed a coding round with these results:\n\n${questionSummaries}\n\nOverall: ${solved}/${total} solved, Accuracy: ${accuracyPercent}%, Total time: ${Math.round(totalTimeSeconds / 60)} minutes.\nStudent level: ${session.studentDetails?.level || 'Unknown'}.\n\nIn 3-4 sentences, give a constructive, encouraging performance summary. Then list 3 specific improvement tips. Format as JSON:\n{\n  "summary": "...",\n  "tips": ["tip1", "tip2", "tip3"]\n}`;

        const response = await openai.chat.completions.create({
            model: MODEL,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 400,
        });

        const rawContent = response.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(rawContent.match(/\{[\s\S]*\}/)?.[0] || '{}');
        aiSummary = JSON.stringify(parsed);
    } catch (e) {
        aiSummary = JSON.stringify({
            summary: `You solved ${solved} out of ${total} problems with ${accuracyPercent}% accuracy. ${readinessLevel === 'Interview Ready' ? 'Excellent work!' : 'Keep practicing to improve your readiness.'}`,
            tips: ['Practice more dynamic programming problems', 'Focus on optimizing time complexity', 'Review data structure fundamentals']
        });
    }

    return {
        overallScore,
        accuracyPercent,
        questionsSolved: solved,
        readinessLevel,
        metrics: {
            technicalAccuracy,
            efficiency,
            codeQuality,
            problemSolving,
            timeManagement,
            debuggingAbility: Math.min(10, efficiency),
        },
        aiSummary,
    };
}

// ─── Controllers ─────────────────────────────────────────────────────────────

export const startSession = async (req: Request, res: Response) => {
    try {
        const { userId, studentDetails, cvText, config } = req.body;

        if (!userId || !studentDetails) {
            return res.status(400).json({ error: 'userId and studentDetails are required' });
        }

        let cvData: any = {};
        if (cvText) {
            const parsed = parseCVText(cvText as string);
            cvData = {
                ...parsed,
                rawText: (cvText as string).slice(0, 5000),
            };
        }

        const session = await prisma.codingRoundSession.create({
            data: {
                userId,
                studentDetails: studentDetails as any,
                cvData: Object.keys(cvData).length ? cvData as any : undefined,
                config: {
                    numQuestions: config?.numQuestions || 5,
                    difficulty: config?.difficulty || 'Auto',
                    language: config?.language || 'python',
                    topic: config?.topic,
                } as any,
                questions: [] as any,
                status: 'config',
            }
        });

        res.status(201).json({ sessionId: session.id, cvData, session });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const configureSession = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const { numQuestions, difficulty, language, topic } = req.body;

        const session = await prisma.codingRoundSession.findUnique({ where: { id: sessionId as string } });
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const config = (session.config as any) || {};
        const newConfig = {
            numQuestions: numQuestions || config.numQuestions,
            difficulty: difficulty || config.difficulty,
            language: language || config.language,
            topic: topic || config.topic,
        };

        const problems = await selectProblems(
            newConfig.numQuestions,
            newConfig.difficulty,
            newConfig.language,
            session.cvData as any,
            newConfig.topic
        );

        const questions = problems.map((p: any) => ({
            problemId: p.id,
            slug: p.slug,
            title: p.title,
            difficulty: p.difficulty,
            status: 'pending',
        }));

        const updatedSession = await prisma.codingRoundSession.update({
            where: { id: sessionId as string },
            data: {
                config: newConfig as any,
                questions: questions as any,
                status: 'active',
                startedAt: new Date()
            }
        });

        res.json({ session: updatedSession, problemSlugs: problems.map((p: any) => p.slug) });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getSession = async (req: Request, res: Response) => {
    try {
        const session = await prisma.codingRoundSession.findUnique({ where: { id: req.params.sessionId as string } });
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const questions = session.questions as any[];
        const currentQ = questions[session.currentQuestionIndex];
        let currentProblem: any = null;
        if (currentQ?.problemId) {
            currentProblem = await prisma.problem.findUnique({ where: { id: currentQ.problemId as string } });
            if (currentProblem) {
                (currentProblem as any).testCases = (currentProblem.testCases as any[]).filter((tc: any) => !tc.isHidden);
            }
        }

        res.json({ session, currentProblem });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const runCode = async (req: Request, res: Response) => {
    try {
        const { code, language, problemId, customInput } = req.body;

        if (customInput !== undefined && customInput !== '') {
            const scriptResult = await executionService.runScript(code, language, customInput);
            const statusMap: Record<string, string> = {
                compilation_error: 'Compilation Error',
                runtime_error: 'Runtime Error',
                time_limit_exceeded: 'Time Limit Exceeded',
            };
            return res.json({
                status: scriptResult.errorType ? (statusMap[scriptResult.errorType] || 'Error') : 'Accepted',
                output: scriptResult.stdout || scriptResult.output,
                passed: !scriptResult.errorType,
                results: [],
                runtime: 0,
                memory: 0,
                error: scriptResult.error,
                errorType: scriptResult.errorType,
                stdout: scriptResult.stdout,
                stderr: scriptResult.stderr,
            });
        }

        const problem = await prisma.problem.findUnique({ where: { id: problemId as string } });
        if (!problem) {
            const scriptResult = await executionService.runScript(code, language, '');
            return res.json({
                status: scriptResult.errorType ? 'Error' : 'Accepted',
                output: scriptResult.stdout || scriptResult.output,
                passed: !scriptResult.errorType,
                results: [],
                runtime: 0,
                memory: 0,
                error: scriptResult.error,
                stdout: scriptResult.stdout,
                stderr: scriptResult.stderr,
            });
        }

        const result = await executionService.execute(code, language, problem as any);

        const statusMap: Record<string, string> = {
            compilation_error: 'Compilation Error',
            runtime_error: 'Runtime Error',
            time_limit_exceeded: 'Time Limit Exceeded',
            memory_limit_exceeded: 'Memory Limit Exceeded',
        };

        res.json({
            status: result.passed ? 'Accepted' : (result.errorType ? statusMap[result.errorType] : 'Wrong Answer'),
            output: result.results.length > 0 ? result.results[0].actual : result.error,
            results: result.results,
            passed: result.passed,
            runtime: result.stats.runtime,
            memory: result.stats.memory,
            error: result.error,
            errorType: result.errorType,
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const submitQuestion = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const { code, language, timeTakenSeconds, skipToIndex } = req.body;

        const session = await prisma.codingRoundSession.findUnique({ where: { id: sessionId as string } });
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const questions = session.questions as any[];
        const idx = session.currentQuestionIndex;
        const currentQ = questions[idx];
        if (!currentQ) return res.status(400).json({ error: 'No current question' });

        if (code && language) {
            const problem = await prisma.problem.findUnique({ where: { id: (currentQ.problemId as string) } });
            if (problem) {
                const result = await executionService.execute(code, language, problem as any);
                currentQ.code = code;
                currentQ.language = language;
                currentQ.timeTakenSeconds = timeTakenSeconds || 0;
                currentQ.status = result.passed ? 'accepted' : 'wrong';
                currentQ.submissionResult = {
                    passed: result.passed,
                    runtime: result.stats.runtime,
                    memory: result.stats.memory,
                    testCasesPassed: result.results.filter(r => r.passed).length,
                    totalTestCases: result.results.length,
                    error: result.error,
                };
            }
        } else {
            currentQ.status = 'skipped';
            currentQ.timeTakenSeconds = timeTakenSeconds || 0;
        }

        const nextIndex = skipToIndex !== undefined ? skipToIndex : idx + 1;
        
        const updatedSession = await prisma.codingRoundSession.update({
            where: { id: sessionId as string },
            data: {
                questions: questions as any,
                currentQuestionIndex: nextIndex
            }
        });

        const hasMore = nextIndex < questions.length;
        res.json({
            questionResult: currentQ,
            hasMore,
            nextIndex,
            isComplete: !hasMore,
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const finishSession = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;

        const session = await prisma.codingRoundSession.findUnique({ where: { id: sessionId as string } });
        if (!session) return res.status(404).json({ error: 'Session not found' });

        if (session.status === 'completed') {
            return res.json({ session });
        }

        const questions = session.questions as any[];
        const finishedAt = new Date();
        const totalTimeTakenSeconds = questions.reduce(
            (sum, q) => sum + (q.timeTakenSeconds || 0), 0
        );

        const evaluation = await evaluateSession({ ...session, questions });
        
        const updatedSession = await prisma.codingRoundSession.update({
            where: { id: sessionId as string },
            data: {
                status: 'completed',
                finishedAt,
                totalTimeTakenSeconds,
                evaluation: evaluation as any
            }
        });

        // Award Progress
        const xpGained = 50 + (evaluation.overallScore || 0);
        await updateUserProgress(session.userId, xpGained, {
            type: 'CODING_COMPLETE',
            codingScore: evaluation.overallScore,
            solved: evaluation.questionsSolved
        });

        res.json({ session: updatedSession });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getReport = async (req: Request, res: Response) => {
    try {
        const session = await prisma.codingRoundSession.findUnique({ where: { id: req.params.sessionId as string } });
        if (!session) return res.status(404).json({ error: 'Session not found' });
        res.json(session);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getUserSessions = async (req: Request, res: Response) => {
    try {
        const sessions = await prisma.codingRoundSession.findMany({
            where: { userId: req.params.userId as string },
            select: {
                id: true,
                studentDetails: true,
                config: true,
                status: true,
                evaluation: true,
                createdAt: true,
                startedAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json(sessions);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

