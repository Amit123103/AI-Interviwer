import express from 'express';
import prisma from '../prisma';

const router = express.Router();

// GET /api/tracking/activities/:userId — paginated activity history
router.get('/activities/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = '1', limit = '50', type } = req.query;

        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        const where: any = { userId };
        if (type && typeof type === 'string') {
            where.type = type;
        }

        const pageNum = Math.max(1, parseInt(page as string));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));

        const [activities, total] = await Promise.all([
            prisma.studentActivity.findMany({
                where,
                orderBy: { timestamp: 'desc' },
                skip: (pageNum - 1) * limitNum,
                take: limitNum
            }),
            prisma.studentActivity.count({ where })
        ]);

        res.json({
            activities,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (err: any) {
        console.error('[Tracking] Activities fetch error:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/tracking/performance/:userId — performance summary
router.get('/performance/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                username: true,
                intervyxaCoins: true,
                level: true,
                weeklyCoins: true,
                lastPracticeDate: true,
                profile: {
                    select: {
                        achievements: true,
                        dailyMissions: true,
                        totalInterviews: true,
                        totalCodeLines: true,
                        averageScore: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get today's activities summary (Aggregations in Prisma for Json fields are limited, so we use raw query or fetch and process)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fetch today's activities to process in JS (safest for cross-DB compatibility with JSON metadata)
        const todaysActivitiesRaw = await prisma.studentActivity.findMany({
            where: {
                userId,
                timestamp: { gte: today }
            }
        });

        const todaySummaryMap = new Map<string, any>();
        todaysActivitiesRaw.forEach(act => {
            const stats = todaySummaryMap.get(act.type) || { count: 0, totalCoins: 0, scores: [] };
            stats.count += 1;
            const metadata = act.metadata as any || {};
            if (metadata.coinsEarned) stats.totalCoins += metadata.coinsEarned;
            if (metadata.score) stats.scores.push(metadata.score);
            todaySummaryMap.set(act.type, stats);
        });

        const todayActivities = Array.from(todaySummaryMap.entries()).map(([type, stats]) => ({
            _id: type,
            count: stats.count,
            totalCoins: stats.totalCoins,
            avgScore: stats.scores.length > 0 ? stats.scores.reduce((a: number, b: number) => a + b, 0) / stats.scores.length : null
        }));

        // Get weekly trend (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const weeklyTrend: any[] = await prisma.$queryRawUnsafe(`
            SELECT 
                TO_CHAR(DATE_TRUNC('day', "timestamp"), 'YYYY-MM-DD') as _id,
                COUNT(*)::int as activities,
                SUM(CAST("metadata"->>'coinsEarned' AS integer))::int as "coinsEarned"
            FROM "student_activities"
            WHERE "userId" = $1 AND "timestamp" >= $2
            GROUP BY 1
            ORDER BY 1 ASC
        `, userId, weekAgo);

        // Get leaderboard rank
        const rank = await prisma.user.count({ 
            where: { intervyxaCoins: { gt: user.intervyxaCoins || 0 } } 
        }) + 1;

        res.json({
            user: {
                coins: user.intervyxaCoins || 0,
                level: user.level || 1,
                weeklyCoins: user.weeklyCoins || 0,
                stats: {
                    totalInterviews: user.profile?.totalInterviews || 0,
                    totalCodeLines: user.profile?.totalCodeLines || 0,
                    averageScore: user.profile?.averageScore || 0
                },
                achievements: user.profile?.achievements || [],
                dailyMissions: user.profile?.dailyMissions || [],
                rank,
                lastPracticeDate: user.lastPracticeDate
            },
            todayActivities,
            weeklyTrend
        });
    } catch (err: any) {
        console.error('[Tracking] Performance fetch error:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/tracking/leaderboard — real-time leaderboard
router.get('/leaderboard', async (_req, res) => {
    try {
        const topUsers = await prisma.user.findMany({
            orderBy: { intervyxaCoins: 'desc' },
            take: 20,
            select: {
                id: true,
                username: true,
                intervyxaCoins: true,
                level: true,
                weeklyCoins: true,
                profile: {
                    select: {
                        achievements: true
                    }
                }
            }
        });

        const leaderboard = topUsers.map((u, idx) => ({
            rank: idx + 1,
            userId: u.id,
            username: u.username,
            coins: u.intervyxaCoins || 0,
            level: u.level || 1,
            weeklyCoins: u.weeklyCoins || 0,
            achievementCount: (u.profile?.achievements as any[])?.length || 0
        }));

        res.json(leaderboard);
    } catch (err: any) {
        console.error('[Tracking] Leaderboard fetch error:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/tracking/online — currently online students
router.get('/online', (_req, res) => {
    try {
        const online = (global as any).getOnlineStudents?.() || [];
        res.json({
            count: online.length,
            students: online.map((s: any) => ({
                userId: s.userId,
                username: s.username,
                currentPage: s.currentPage,
                joinedAt: s.joinedAt,
                lastActivity: s.lastActivity
            }))
        });
    } catch (err: any) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/tracking/session-timeline/:userId — today's session timeline
router.get('/session-timeline/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const timeline = await prisma.studentActivity.findMany({
            where: {
                userId,
                timestamp: { gte: today }
            },
            orderBy: { timestamp: 'asc' },
            select: {
                type: true,
                action: true,
                details: true,
                metadata: true,
                timestamp: true
            }
        });

        res.json(timeline);
    } catch (err: any) {
        console.error('[Tracking] Timeline fetch error:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

export default router;
