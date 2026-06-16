import express from 'express';
import prisma from '../prisma';

const router = express.Router();

// GET /api/contests
// Fetch list of contests (Upcoming/Live/Past)
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        const where: any = {};
        if (status) where.status = status;

        const contests = await prisma.contest.findMany({
            where,
            orderBy: { startTime: 'asc' },
            select: {
                id: true,
                title: true,
                description: true,
                startTime: true,
                endTime: true,
                status: true,
                prizes: true,
                createdAt: true,
                updatedAt: true
                // Exclude leaderboard which is heavy
            }
        });

        res.json(contests);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/contests/:id
// Fetch single contest details (and problems if Live/Ended)
router.get('/:id', async (req, res) => {
    try {
        const contest = await prisma.contest.findUnique({
            where: { id: req.params.id },
            include: {
                problems: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        difficulty: true,
                        category: true
                    }
                }
            }
        });

        if (!contest) return res.status(404).json({ error: "Contest not found" });

        // Security: Don't show problems if contest is Upcoming
        const now = new Date();
        const contestWithSafeProblems = { ...contest };
        if (contest.startTime > now) {
            contestWithSafeProblems.problems = [];
        }

        res.json(contestWithSafeProblems);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/contests/:id/register
// Register a user for a contest
router.post('/:id/register', async (req, res) => {
    try {
        const { userId } = req.body;
        const contestId = req.params.id;

        const contest = await prisma.contest.findUnique({
            where: { id: contestId },
            include: { participants: { select: { id: true } } }
        });

        if (!contest) return res.status(404).json({ error: "Contest not found" });
        
        const isRegistered = contest.participants.some(p => p.id === userId);
        if (isRegistered) {
            return res.status(400).json({ error: "Already registered" });
        }

        const updated = await prisma.contest.update({
            where: { id: contestId },
            data: {
                participants: {
                    connect: { id: userId }
                }
            },
            include: { _count: { select: { participants: true } } }
        });

        res.json({ message: "Registered successfully", participants: updated._count.participants });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/contests/:id/leaderboard
// Fetch scheduling/realtime leaderboard
router.get('/:id/leaderboard', async (req, res) => {
    try {
        const contest = await prisma.contest.findUnique({
            where: { id: req.params.id },
            select: { leaderboard: true }
        });
        if (!contest) return res.status(404).json({ error: "Contest not found" });

        const leaderboard = (contest.leaderboard as any[]) || [];

        // Sort leaderboard by Score (Desc), then Time (Asc)
        const sortedBoard = leaderboard.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.finishTime - b.finishTime;
        });

        res.json(sortedBoard);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
