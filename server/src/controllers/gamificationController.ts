import { Request, Response } from 'express';
import prisma from '../prisma';
import { updateUserProgress } from '../services/gamificationService';

export const updateProgress = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id;
        const { coinsGained, statsUpdate } = req.body;

        const result = await updateUserProgress(userId!, coinsGained, statsUpdate);

        res.json(result);

    } catch (error) {
        res.status(500).json({ message: 'Error updating gamification', error });
    }
};

export const getLeaderboard = async (req: any, res: Response) => {
    try {
        const { period } = req.query;
        let sortField = 'intervyxaCoins';

        if (period === 'weekly') {
            sortField = 'weeklyCoins';
        }

        const topUsers = await prisma.user.findMany({
            orderBy: { [sortField]: 'desc' },
            take: 10,
            select: {
                username: true,
                intervyxaCoins: true,
                level: true,
                weeklyCoins: true
            }
        });

        res.json(topUsers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leaderboard', error });
    }
};

export const claimDailyReward = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id;
        const result = await updateUserProgress(userId!, 100, { type: 'daily_claim' }); // 100 Coins for checking in
        res.json({ message: 'Intervyxa Coins claimed!', ...result });
    } catch (error) {
        res.status(500).json({ message: 'Error claiming reward', error });
    }
};
