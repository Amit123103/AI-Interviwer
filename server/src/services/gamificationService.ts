import prisma from '../prisma';
import { checkBadges } from './badgeService';
import { logStudentActivity } from './activityService';

const COINS_PER_LEVEL_BASE = 500;

export const updateUserProgress = async (userId: string, coinsGained: number, statsUpdate: any) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
    });
    if (!user) throw new Error('User not found');

    // Update Coins & Stats
    let intervyxaCoins = user.intervyxaCoins + coinsGained;

    // Weekly Coins Logic
    const currentWeekInfo = getWeekNumber(new Date());
    const weekString = `${currentWeekInfo[0]}-W${currentWeekInfo[1]}`;

    let weeklyCoins = user.weeklyCoins;
    let currentWeek = user.currentWeek;

    if (currentWeek !== weekString) {
        weeklyCoins = coinsGained;
        currentWeek = weekString;
    } else {
        weeklyCoins = (weeklyCoins || 0) + coinsGained;
    }

    // Prepare profile updates
    const profileUpdate: any = {};
    if (statsUpdate && user.profile) {
        profileUpdate.totalInterviews = (user.profile.totalInterviews || 0) + (statsUpdate.interviews || 0);
        profileUpdate.totalCodeLines = (user.profile.totalCodeLines || 0) + (statsUpdate.codeLines || 0);

        if (statsUpdate.newScore) {
            const currentAvg = user.profile.averageScore || 0;
            const count = profileUpdate.totalInterviews;
            if (count > 0) {
                const previousCount = count - (statsUpdate.interviews || 0);
                if (previousCount >= 0) {
                    profileUpdate.averageScore = ((currentAvg * previousCount) + statsUpdate.newScore) / count;
                }
            } else {
                profileUpdate.averageScore = statsUpdate.newScore;
            }
        }
    }

    // Level Up Logic (using coins)
    let level = user.level;
    const nextLevelCoins = level * COINS_PER_LEVEL_BASE * 2;
    let leveledUp = false;
    if (intervyxaCoins >= nextLevelCoins) {
        level += 1;
        leveledUp = true;
    }

    const now = new Date();
    
    // Badge Logic via Service
    const context = {
        ...statsUpdate,
        timestamp: now
    };

    function getWeekNumber(d: Date) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        var weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        return [d.getUTCFullYear(), weekNo];
    }

    // Mock checkBadges call or update it later (assuming it returns achievements)
    // const newAchievements = checkBadges(user as any, context);
    const newAchievements: string[] = []; 

    await prisma.user.update({
        where: { id: userId },
        data: {
            intervyxaCoins,
            weeklyCoins,
            currentWeek,
            level,
            lastPracticeDate: now,
            profile: Object.keys(profileUpdate).length > 0 ? {
                update: profileUpdate
            } : undefined
        }
    });

    // Log Activity
    if (coinsGained > 0) {
        await logStudentActivity(
            userId,
            (statsUpdate?.type as any) || 'DAILY_CLAIM',
            `Gained ${coinsGained} Intervyxa Coins`,
            `Level: ${level}`,
            { coinsGained, leveledUp, xp: coinsGained }
        );
    }

    return {
        level,
        intervyxaCoins,
        leveledUp,
        newAchievements
    };
};
