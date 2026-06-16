import express from 'express';
import prisma from '../prisma';
import { executionService } from '../services/executionService';

const router = express.Router();

// GET /api/coding/problems
// Fetch problems with filters (difficulty, category, company, search)
router.get('/problems', async (req, res) => {
    try {
        const { difficulty, category, company, search, page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const where: any = {};
        if (difficulty) where.difficulty = difficulty;
        if (category) where.category = category;
        if (company) where.companies = { has: company as string };
        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { tags: { has: search as string } }
            ];
        }

        const [problems, total] = await Promise.all([
            prisma.problem.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    difficulty: true,
                    category: true,
                    tags: true,
                    companies: true,
                    stats: true
                },
                skip,
                take,
                orderBy: { stats: 'desc' } // Note: JSON sorting in Prisma depends on support, may need raw query or simplified sort
            }),
            prisma.problem.count({ where })
        ]);

        res.json({ problems, total, page: Number(page), pages: Math.ceil(total / take) });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/coding/problems/:slug
// Fetch single problem details
router.get('/problems/:slug', async (req, res) => {
    try {
        const problem = await prisma.problem.findUnique({
            where: { slug: req.params.slug }
        });
        if (!problem) return res.status(404).json({ error: "Problem not found" });

        // Hide hidden test cases from client
        const testCases = (problem.testCases as any[]) || [];
        const safeTestCases = testCases.filter((tc: any) => !tc.isHidden);

        res.json({ ...problem, testCases: safeTestCases });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/coding/run
// Execute code against test cases OR run as script with custom input
router.post('/run', async (req, res) => {
    try {
        const { code, language, problemId, stdin, customInput } = req.body;
        const inputStdin = stdin || customInput || '';

        // If no problemId or problem not found, run as script (playground mode)
        if (!problemId) {
            const scriptResult = await executionService.runScript(code, language, inputStdin);
            const statusMap: Record<string, string> = {
                compilation_error: 'Compilation Error',
                runtime_error: 'Runtime Error',
                time_limit_exceeded: 'Time Limit Exceeded',
            };
            return res.json({
                status: scriptResult.errorType ? (statusMap[scriptResult.errorType] || 'Error') : 'Accepted',
                output: scriptResult.stdout || scriptResult.output,
                passed: !scriptResult.errorType,
                runtime: 0,
                memory: 0,
                error: scriptResult.error,
                errorType: scriptResult.errorType,
                stdout: scriptResult.stdout,
                stderr: scriptResult.stderr,
            });
        }

        const problem = await prisma.problem.findUnique({ where: { id: problemId } });
        if (!problem) return res.status(404).json({ error: "Problem not found" });

        const result = await executionService.execute(code, language, problem as any);

        const statusMap: Record<string, string> = {
            compilation_error: 'Compilation Error',
            runtime_error: 'Runtime Error',
            time_limit_exceeded: 'Time Limit Exceeded',
            memory_limit_exceeded: 'Memory Limit Exceeded',
        };

        res.json({
            status: result.passed ? "Accepted" : (result.errorType ? statusMap[result.errorType] : "Wrong Answer"),
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
});

// POST /api/coding/submit
// Mock Submission Endpoint
router.post('/submit', async (req, res) => {
    try {
        const { userId, problemId, code, language } = req.body;

        const problem = await prisma.problem.findUnique({ where: { id: problemId } });
        if (!problem) return res.status(404).json({ error: "Problem not found" });

        // 1. Create Pending Submission
        let submission = await prisma.submission.create({
            data: {
                userId,
                problemId,
                code,
                language,
                status: 'Pending'
            }
        });

        // 2. Execute Code
        const result = await executionService.execute(code, language, problem as any);

        // 3. Update Submission
        const status = result.passed ? 'Accepted' : result.error ? 'Runtime Error' : 'Wrong Answer';
        
        let failureDetail: any = null;
        if (!result.passed && result.results.length > 0) {
            const firstFail = result.results.find(r => !r.passed);
            if (firstFail) {
                failureDetail = {
                    input: firstFail.input,
                    expectedOutput: firstFail.expected,
                    actualOutput: firstFail.actual,
                    error: firstFail.error || result.error || "Unknown Error"
                };
            }
        }

        if (result.error && !failureDetail) {
            failureDetail = {
                input: '-',
                expectedOutput: '-',
                actualOutput: '-',
                error: result.error || "Unknown Error"
            };
        }

        submission = await prisma.submission.update({
            where: { id: submission.id },
            data: {
                status,
                runtime: result.stats.runtime,
                memory: result.stats.memory,
                testCasesPassed: result.results.filter(r => r.passed).length,
                totalTestCases: result.results.length,
                failureDetail: failureDetail || undefined
            }
        });

        // 4. Update User & Problem Stats if Accepted
        if (result.passed) {
            // Update Problem Stats (using raw update or fetching if increment not easy for Json)
            const stats = (problem.stats as any) || { accepted: 0, submissions: 0 };
            stats.accepted = (stats.accepted || 0) + 1;
            stats.submissions = (stats.submissions || 0) + 1;

            await prisma.problem.update({
                where: { id: problemId },
                data: { stats }
            });

            // Update User XP
            await (prisma.user as any).update({
                where: { id: userId },
                data: {
                    xp: { increment: 50 }
                }
            });
            
            // Also update Profile totalCodeLines
            await prisma.profile.update({
                where: { userId },
                data: {
                    totalCodeLines: { increment: code.split('\n').length }
                }
            }).catch(() => {}); // Profile might not exist? (should have been created on signup)

        } else {
            const stats = (problem.stats as any) || { accepted: 0, submissions: 0 };
            stats.submissions = (stats.submissions || 0) + 1;
            await prisma.problem.update({
                where: { id: problemId },
                data: { stats }
            });
        }

        // Check if this is a Contest Submission
        if (req.body.contestId && submission.status === 'Accepted') {
            const contest = await prisma.contest.findUnique({ where: { id: req.body.contestId } });
            if (contest && contest.status === 'Live') {
                const leaderboard = (contest.leaderboard as any[]) || [];
                const existingIdx = leaderboard.findIndex(e => e.userId === userId);

                const points = 100;
                const minutesSinceStart = Math.floor((new Date().getTime() - new Date(contest.startTime).getTime()) / 60000);

                if (existingIdx !== -1) {
                    leaderboard[existingIdx].score += points;
                    leaderboard[existingIdx].finishTime = Math.max(leaderboard[existingIdx].finishTime, minutesSinceStart);
                } else {
                    const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
                    leaderboard.push({
                        userId: userId,
                        username: user?.username || 'Anonymous',
                        score: points,
                        finishTime: minutesSinceStart
                    });
                }

                await prisma.contest.update({
                    where: { id: contest.id },
                    data: { leaderboard: leaderboard as any }
                });

                // Broadcast Update (via global helper if exists)
                if ((global as any).broadcastAdminEvent) {
                    (global as any).broadcastAdminEvent('contest:leaderboard-update', {
                        contestId: contest.id,
                        leaderboard
                    });
                }
            }
        }

        res.json(submission);

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/coding/user/:userId/stats
// Aggregate user coding statistics
router.get('/user/:userId/stats', async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Fetch all accepted submissions for this user
        const submissions = await prisma.submission.findMany({
            where: { userId, status: 'Accepted' },
            select: { problemId: true }
        });
        
        const solvedProblemIds = Array.from(new Set(submissions.map(s => s.problemId)));

        // 2. Fetch details of solved problems to group by difficulty
        const problems = await prisma.problem.findMany({
            where: { id: { in: solvedProblemIds } },
            select: { difficulty: true }
        });

        const solvedStats = {
            Easy: problems.filter(p => p.difficulty === 'Easy').length,
            Medium: problems.filter(p => p.difficulty === 'Medium').length,
            Hard: problems.filter(p => p.difficulty === 'Hard').length,
            Total: problems.length
        };

        // 3. Calculate Total Submissions & Acceptance Rate
        const totalSubmissions = await prisma.submission.count({ where: { userId } });
        const acceptedSubmissions = await prisma.submission.count({ where: { userId, status: 'Accepted' } });
        const acceptanceRate = totalSubmissions > 0 ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(1) : 0;

        // 4. Generate Activity Heatmap (Last 365 days)
        const oneYearAgo = new Date();
        oneYearAgo.setDate(oneYearAgo.getDate() - 365);

        // SQL raw query for date formatting and grouping is often easier in Postgres
        const activity: any[] = await prisma.$queryRawUnsafe(`
            SELECT 
                TO_CHAR(DATE_TRUNC('day', "createdAt"), 'YYYY-MM-DD') as date,
                COUNT(*)::int as count
            FROM "submissions"
            WHERE "userId" = $1 AND "createdAt" >= $2
            GROUP BY 1
            ORDER BY 1 ASC
        `, userId, oneYearAgo);

        // 5. Recent Activity (Last 5)
        const recentActivity = await prisma.submission.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                problem: {
                    select: { title: true, slug: true, difficulty: true }
                }
            }
        });

        res.json({
            solved: solvedStats,
            totalSubmissions,
            acceptanceRate,
            activity: activity,
            recent: recentActivity
        });

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
