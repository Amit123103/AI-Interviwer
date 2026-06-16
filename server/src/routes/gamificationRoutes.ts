import express from 'express';
import prisma from '../prisma';

const router = express.Router();

// Helper to check if date is today
const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
};

// 1. Sync / Get Gamification State
router.post('/sync', async (req, res) => {
    try {
        const { userId, action, value } = req.body;
        console.log('Gamification Sync Request:', { userId, action, value });

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true }
        });

        if (!user) {
            console.warn(`Gamification Sync: User not found for ID ${userId}`);
            return res.status(404).json({ message: "User not found" });
        }

        let currentCoins = user.intervyxaCoins || 0;
        let currentWeeklyCoins = user.weeklyCoins || 0;
        let currentLevel = user.level || 1;
        let lastPracticeDate = user.lastPracticeDate;
        
        const profile = user.profile;
        let dailyMissions = (profile?.dailyMissions as any[]) || [];
        let achievements = (profile?.achievements as any) || [];

        // A. Handle Coin Update
        if (action === 'ADD_COINS' && typeof value === 'number' && value > 0) {
            currentCoins += value;
            currentWeeklyCoins += value;

            // Level Up Logic (Coins threshold)
            const requiredCoins = currentLevel * 1000 * 2;
            if (currentCoins >= requiredCoins) {
                currentLevel += 1;
            }
        }

        // B. Handle Session Activity
        if (action === 'PRACTICE_COMPLETE') {
            lastPracticeDate = new Date();
            currentCoins += 50;
            currentWeeklyCoins += 50;
        }

        // C. Daily Missions Check
        const todayStr = new Date().toDateString();
        const hasTodayMissions = dailyMissions.some(m => new Date(m.date).toDateString() === todayStr);

        if (!hasTodayMissions) {
            dailyMissions = [
                { id: 'm1', type: 'practice', target: 1, progress: 0, completed: false, date: new Date() },
                { id: 'm2', type: 'questions', target: 5, progress: 0, completed: false, date: new Date() },
                { id: 'm3', type: 'code', target: 100, progress: 0, completed: false, date: new Date() }
            ];
        }

        // Update Mission Progress
        if (action === 'UPDATE_MISSION') {
            const { missionType, progressDelta } = req.body;
            dailyMissions.forEach(m => {
                if (m.type === missionType && !m.completed && isToday(new Date(m.date))) {
                    m.progress += progressDelta;
                    if (m.progress >= m.target) {
                        m.completed = true;
                        currentCoins += 50; 
                        currentWeeklyCoins += 50;
                    }
                }
            });
        }

        // Save Updates
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                intervyxaCoins: currentCoins,
                weeklyCoins: currentWeeklyCoins,
                level: currentLevel,
                lastPracticeDate,
                profile: {
                    upsert: {
                        create: {
                            dailyMissions: dailyMissions as any,
                            achievements: achievements as any
                        },
                        update: {
                            dailyMissions: dailyMissions as any,
                            achievements: achievements as any
                        }
                    }
                }
            },
            include: { profile: true }
        });

        // Broadcast live performance update
        if ((global as any).broadcastStudentPerformance) {
            (global as any).broadcastStudentPerformance(userId).catch(() => {});
        }

        res.json({
            intervyxaCoins: updatedUser.intervyxaCoins || 0,
            level: updatedUser.level || 1,
            dailyMissions: (updatedUser.profile?.dailyMissions as any) || [],
            achievements: (updatedUser.profile?.achievements as any) || []
        });

    } catch (err: any) {
        console.error('Gamification Sync Error:', err.message);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// 2. Get Leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const topUsers = await (prisma.user as any).findMany({
            orderBy: { intervyxaCoins: 'desc' },
            take: 10,
            select: {
                username: true,
                intervyxaCoins: true,
                level: true,
                profile: {
                    select: {
                        profilePhoto: true,
                        achievements: true
                    }
                }
            }
        });

        res.json((topUsers as any[]).map(u => ({
            username: u.username,
            intervyxaCoins: u.intervyxaCoins,
            level: u.level,
            avatar: u.profile?.profilePhoto,
            achievements: u.profile?.achievements
        })));
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
