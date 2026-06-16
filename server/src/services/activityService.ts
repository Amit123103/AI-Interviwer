import prisma from '../prisma';

export type ActivityType = 
    | 'INTERVIEW_COMPLETE'
    | 'CODING_COMPLETE'
    | 'QUIZ_COMPLETE'
    | 'LOGIN'
    | 'DAILY_CLAIM'
    | 'FORUM_POST'
    | 'FORUM_COMMENT'
    | 'RESUME_ANALYSIS'
    | 'SQL_PRACTICE'
    | 'PROJECT_BUILD'
    | 'ONBOARDING_COMPLETE';

export const logStudentActivity = async (
    userId: string,
    type: ActivityType,
    action: string,
    details?: string,
    metadata?: any,
    sessionId?: string
) => {
    try {
        await prisma.studentActivity.create({
            data: {
                userId,
                type,
                action,
                details,
                metadata: metadata || {},
                sessionId,
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error(`[ActivityService] Failed to log activity ${type}:`, error);
    }
};

export const getRecentActivities = async (userId: string, limit: number = 20) => {
    return await prisma.studentActivity.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit
    });
};
