import { Request, Response } from 'express';
import prisma from '../prisma';

export const getMasteryProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id || req.params.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const [user, reports, codingSessions, quizAttempts, activities, allActivities] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                include: { profile: true }
            }),
            prisma.report.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 10
            }),
            prisma.codingRoundSession.findMany({
                where: { userId, status: 'completed' },
                orderBy: { createdAt: 'desc' },
                take: 10
            }),
            prisma.quizAttempt.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 10
            }),
            prisma.studentActivity.findMany({
                where: { userId },
                orderBy: { timestamp: 'desc' },
                take: 5
            }),
            prisma.studentActivity.findMany({
                where: { userId },
                orderBy: { timestamp: 'desc' },
                take: 100
            })
        ]);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // --- Calculate Interview Readiness ---
        const interviewScores = reports.map(r => r.overallScore || 0);
        const interviewReadiness = interviewScores.length > 0 
            ? Math.round(interviewScores.reduce((a, b) => a + b, 0) / interviewScores.length)
            : 0;

        // --- Calculate Coding Proficiency ---
        const codingScores = codingSessions.map(s => (s.evaluation as any)?.overallScore || 0);
        const codingProficiency = codingScores.length > 0
            ? Math.round(codingScores.reduce((a, b) => a + b, 0) / codingScores.length)
            : 0;

        // --- Calculate Quiz Mastery ---
        const quizScores = quizAttempts.map(a => a.score || 0);
        const quizMastery = quizScores.length > 0
            ? Math.round((quizScores.reduce((a, b) => a + b, 0) / quizScores.length) * 10) 
            : 0;

        // --- Calculate Engagement Score (New) ---
        const forumActs = allActivities.filter(a => a.type === 'FORUM_POST' || a.type === 'FORUM_COMMENT').length;
        const sqlActs = allActivities.filter(a => a.type === 'SQL_PRACTICE').length;
        const projectActs = allActivities.filter(a => a.type === 'PROJECT_BUILD').length;
        const interviewActs = reports.length;
        
        // Engagement is a blend of activity and consistency
        const engagementScore = Math.min(100, (forumActs * 8) + (sqlActs * 5) + (projectActs * 12) + (interviewActs * 10));

        // --- Global Readiness Score (V2) ---
        const overallReadiness = Math.round(
            (Math.max(interviewReadiness, 0) * 0.45) + 
            (Math.max(codingProficiency, 0) * 0.25) + 
            (Math.min(quizMastery, 100) * 0.15) +
            (engagementScore * 0.15)
        );

        // --- Skill Analysis ---
        const skillsFromProfile = user.profile?.skills || [];
        const skillsFromCoding = codingSessions.flatMap(s => (s.cvData as any)?.languages || []);
        const uniqueSkills = [...new Set([...skillsFromProfile, ...skillsFromCoding])];

        // Skill alignment increases as they use more unique skills/technologies
        const skillAlignment = Math.min(100, (uniqueSkills.length * 7) + (sqlActs > 0 ? 10 : 0));

        // Simulated Peer Ranking based on engagement and readiness
        const peerRanking = Math.min(99, Math.round((engagementScore * 0.6) + (overallReadiness * 0.4)));

        res.json({
            userId,
            username: user.username,
            level: user.level,
            coins: user.intervyxaCoins,
            streak: user.streak,
            metrics: {
                overallReadiness,
                interviewReadiness,
                codingProficiency,
                quizMastery: Math.min(quizMastery, 100),
                skillAlignment,
                engagementScore,
                peerRanking,
                confidenceScore: Math.round(overallReadiness * 1.05)
            },
            stats: {
                totalInterviews: user.profile?.totalInterviews || 0,
                totalCodingSessions: codingSessions.length,
                totalQuizzes: quizAttempts.length,
                totalCodeLines: user.profile?.totalCodeLines || 0
            },
            recentActivities: activities.map(a => ({
                id: a.id,
                type: a.type,
                action: a.action,
                timestamp: a.timestamp
            })),
            progressTrends: reports.slice().reverse().map(r => ({
                date: r.createdAt,
                score: r.overallScore
            }))
        });

    } catch (error: any) {
        console.error('[MasteryProfile] Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
