import { Request, Response } from 'express';
import prisma from '../prisma';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Initialize a new Coding Interview Session
export const initiateInterview = async (req: Request, res: Response) => {
    try {
        const { userId, resumeText, difficulty } = req.body;

        console.log(`[INITIATE] New session request for User: ${userId}, Difficulty: ${difficulty}`);

        if (!userId) {
            console.error("[ERROR] Missing userId in initiateInterview request body.");
            return res.status(400).json({ error: "User ID is required to start an interview session." });
        }

        let skills = {
            languages: ['JavaScript', 'Python'],
            frameworks: [],
            difficulty: difficulty || 'Medium',
            suggestedRole: 'Fullstack Developer'
        };

        // 2. Generate Questions via AI Service
        let problems: any[] = [];
        try {
            console.log(`[AI] Requesting Questions from AI Service at ${AI_SERVICE_URL}...`);
            const aiRes = await axios.post(`${AI_SERVICE_URL}/resume/generate-questions`, {
                resume_text: resumeText || "",
                count: 3,
                difficulty: difficulty || 'Medium',
                topic: 'General'
            }, { timeout: 8000 }); // Add timeout to prevent hanging

            const generatedQuestions = aiRes.data.questions;

            if (generatedQuestions && Array.isArray(generatedQuestions) && generatedQuestions.length > 0) {
                console.log(`[AI] Successfully generated ${generatedQuestions.length} questions.`);
                // Save generated problems
                const savedProblems = await Promise.all(generatedQuestions.map(async (q: any) => {
                    return prisma.problem.create({
                        data: {
                            title: q.title || "Untitled Problem",
                            description: q.description || q.title || "No description provided.",
                            difficulty: (q.difficulty as any) || 'Medium',
                            category: q.category || 'General',
                            slug: (q.slug || 'gen-' + uuidv4().substring(0, 8)) + '-' + uuidv4().substring(0, 8),
                            starterCode: q.starterCode || {},
                            testCases: q.testCases || [],
                            examples: q.examples || [],
                            isGenerated: true,
                            stats: { accepted: 0, submissions: 0, acceptanceRate: 0 }
                        }
                    });
                }));

                problems = savedProblems.map(p => ({
                    problemId: p.id,
                    status: 'Pending',
                    score: 0
                }));
            } else {
                console.warn("[AI] AI Service returned empty question array. Falling back to DB...");
                throw new Error("Empty questions from AI");
            }
        } catch (err: any) {
            console.warn(`[FALLBACK] AI Question Generation Failed (${err.message}). Using database challenges...`);
            
            const targetDifficulty = difficulty || 'Medium';
            let existingProblems = await prisma.problem.findMany({
                where: { difficulty: targetDifficulty as any },
                take: 3,
                orderBy: { createdAt: 'desc' }
            });

            if (existingProblems.length === 0) {
                console.warn(`[FALLBACK] No ${targetDifficulty} problems found. Fetching any 3 available problems...`);
                existingProblems = await prisma.problem.findMany({
                    take: 3,
                    orderBy: { createdAt: 'desc' }
                });
            }

            problems = existingProblems.map(p => ({
                problemId: p.id,
                status: 'Pending',
                score: 0
            }));
        }

        if (problems.length === 0) {
            console.error("[CRITICAL] Failed to generate or find ANY problems in the database.");
            return res.status(500).json({ 
                error: "The Interview Lab is currently undergoing maintenance (No problems available). Please try again in 5 minutes.",
                code: "NO_PROBLEMS_AVAILABLE"
            });
        }

        // 3. Create Session
        console.log(`[DB] Creating InterviewSession for User: ${userId} with ${problems.length} problems.`);
        const session = await prisma.interviewSession.create({
            data: {
                userId,
                problems: problems as any,
                currentProblemIndex: 0,
                status: 'Setup',
                resumeText,
                extractedSkills: skills as any,
                startTime: new Date(),
                durationMinutes: 60
            }
        });

        console.log(`[SUCCESS] Session created: ${session.id}`);
        res.json({
            sessionId: session.id,
            problemCount: problems.length,
            firstProblemId: problems[0].problemId,
            skills
        });

    } catch (error: any) {
        console.error("[FATAL] Initiate Error:", error);
        res.status(500).json({ error: "Internal Server Error during session initiation. " + (error.message || "") });
    }
};

// Start the Interview (Status -> Live)
export const startInterview = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.body;

        console.log(`[START] Attempting to start session: ${sessionId}`);

        const session = await prisma.interviewSession.findUnique({
            where: { id: sessionId }
        });

        if (!session) {
            console.error(`[START] Session ${sessionId} not found.`);
            return res.status(404).json({ error: "Session not found" });
        }

        // Idempotency check: If already Live, just return the data
        if (session.status === 'Live') {
            console.log(`[START] Session ${sessionId} is already Live. Returning current state.`);
            const problems = session.problems as any[];
            const currentProblemIndex = session.currentProblemIndex || 0;
            const currentProblemRef = problems[currentProblemIndex];
            
            const currentProblem = await prisma.problem.findUnique({
                where: { id: currentProblemRef.problemId }
            });

            return res.json({
                session,
                problem: currentProblem,
                message: "Session already in progress"
            });
        }

        if (session.status !== 'Setup') {
            console.warn(`[START] Session ${sessionId} has invalid status for start: ${session.status}`);
            return res.status(400).json({ error: `Interview cannot be started in ${session.status} status.` });
        }

        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + session.durationMinutes * 60000);

        console.log(`[START] Transitioning Session ${sessionId} to Live...`);
        const updatedSession = await prisma.interviewSession.update({
            where: { id: sessionId },
            data: {
                status: 'Live',
                startTime,
                endTime
            }
        });

        // Get the first problem details
        const problems = updatedSession.problems as any[];
        const currentProblemIndex = updatedSession.currentProblemIndex || 0;
        const firstProblemRef = problems[currentProblemIndex];
        
        const currentProblem = await prisma.problem.findUnique({
            where: { id: firstProblemRef.problemId }
        });

        console.log(`[SUCCESS] Session ${sessionId} is now Live.`);
        res.json({
            session: updatedSession,
            problem: currentProblem
        });
    } catch (error: any) {
        console.error("[FATAL] Start Interview Error:", error);
        res.status(500).json({ error: "Failed to start interview session. " + (error.message || "") });
    }
};

// Submit Interview (Status -> Completed)
export const submitInterview = async (req: Request, res: Response) => {
    try {
        const { sessionId, code, language } = req.body;
        const session = await prisma.interviewSession.findUnique({
            where: { id: sessionId }
        });

        if (!session) return res.status(404).json({ error: "Session not found" });

        let qualityScore = 0;
        let correctnessScore = Math.floor(Math.random() * 40) + 60; 

        // 2. Generate AI Feedback Report
        let feedback = "Good effort. Consider optimizing for time complexity.";
        try {
            const aiRes = await axios.post(`${AI_SERVICE_URL}/coding/analyze`, {
                problem_title: "Interview Problem",
                user_code: code,
                language: language
            });
            if (aiRes.data) {
                qualityScore = aiRes.data.qualityScore || 85;
                feedback = aiRes.data.feedback || feedback;
            }
        } catch (err) {
            console.error("AI Analysis Failed", err);
        }

        const score = {
            correctness: correctnessScore,
            quality: qualityScore,
            efficiency: 80,
            total: (correctnessScore + qualityScore + 80) / 3
        };

        const updatedSession = await prisma.interviewSession.update({
            where: { id: sessionId },
            data: {
                status: 'Completed',
                codeSnapshot: code,
                score: score as any,
                feedback: feedback,
                endTime: new Date()
            }
        });

        res.json({
            message: "Interview Submitted",
            score: updatedSession.score,
            feedback: updatedSession.feedback
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Get Session Status/Details
export const getSession = async (req: Request, res: Response) => {
    try {
        const session = await prisma.interviewSession.findUnique({
            where: { id: req.params.id as string }
        });
        
        if (!session) return res.status(404).json({ error: "Session not found" });
        
        // Populate problems manually since they are stored as JSON references
        const problemRefs = session.problems as any[];
        const populatedProblems = await Promise.all(problemRefs.map(async (ref: any) => {
            const problem = await prisma.problem.findUnique({ where: { id: ref.problemId } });
            return { ...ref, problemId: problem };
        }));

        res.json({ ...session, problems: populatedProblems });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

