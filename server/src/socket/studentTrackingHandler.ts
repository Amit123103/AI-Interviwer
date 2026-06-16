import { Server as SocketIOServer, Namespace } from 'socket.io';
import prisma from '../prisma';

// In-memory store of online students
interface OnlineStudent {
    socketId: string;
    userId: string;
    username: string;
    joinedAt: Date;
    lastActivity: Date;
    sessionId: string;
    currentPage: string;
}

const onlineStudents = new Map<string, OnlineStudent>();

// Generate a unique session ID
function generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Get the leaderboard data
async function fetchLeaderboard() {
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

        return topUsers.map((u, idx) => ({
            rank: idx + 1,
            userId: u.id,
            username: u.username,
            coins: u.intervyxaCoins || 0,
            level: u.level || 1,
            weeklyCoins: u.weeklyCoins || 0,
            achievementCount: (u.profile?.achievements as any[])?.length || 0
        }));
    } catch (err) {
        console.error('[StudentTracking] Leaderboard fetch error:', err);
        return [];
    }
}

export function initializeStudentTracking(io: SocketIOServer): Namespace {
    const trackingNamespace = io.of('/student-tracking');

    trackingNamespace.on('connection', (socket) => {
        console.log('[StudentTracking] Client connected:', socket.id);

        let studentUserId: string | null = null;
        let studentSessionId: string | null = null;

        // ─── Student Joins Tracking ───────────────────────────────────
        socket.on('track:join', async (data: { userId: string; username: string }) => {
            const { userId, username } = data;
            if (!userId) return;

            studentUserId = userId;
            studentSessionId = generateSessionId();

            // Store in online map
            onlineStudents.set(userId, {
                socketId: socket.id,
                userId,
                username: username || 'Unknown',
                joinedAt: new Date(),
                lastActivity: new Date(),
                sessionId: studentSessionId,
                currentPage: 'dashboard'
            });

            // Join personal room for targeted events
            socket.join(`student_${userId}`);
            socket.join('leaderboard_room');

            // Persist login activity
            try {
                await prisma.studentActivity.create({
                    data: {
                        userId,
                        type: 'login',
                        action: 'Student logged in',
                        details: `${username} started a new session`,
                        metadata: { sessionId: studentSessionId } as any,
                        sessionId: studentSessionId
                    }
                });
            } catch (err: any) {
                console.warn('[StudentTracking] Failed to log login activity:', err.message);
            }

            // Send initial data to the student
            try {
                // Recent activities
                const recentActivities = await prisma.studentActivity.findMany({
                    where: { userId },
                    orderBy: { timestamp: 'desc' },
                    take: 50
                });

                // User performance data
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

                // Leaderboard
                const leaderboard = await fetchLeaderboard();

                // Find user rank
                const userRank = leaderboard.findIndex(l => l.userId === userId) + 1;

                socket.emit('tracking:init', {
                    activities: recentActivities,
                    performance: user ? {
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
                        rank: userRank || 0
                    } : null,
                    leaderboard,
                    onlineCount: onlineStudents.size,
                    sessionId: studentSessionId
                });
            } catch (err: any) {
                console.warn('[StudentTracking] Failed to send init data:', err.message);
            }

            // Broadcast to admins
            if ((global as any).broadcastAdminEvent) {
                (global as any).broadcastAdminEvent('student:online', {
                    userId,
                    username,
                    onlineCount: onlineStudents.size
                });
            }

            console.log(`[StudentTracking] ${username} (${userId}) joined. Online: ${onlineStudents.size}`);
        });

        // ─── Track Generic Activity ─────────────────────────────────
        socket.on('track:activity', async (data: {
            type: string;
            action: string;
            details?: string;
            metadata?: any;
        }) => {
            if (!studentUserId) return;

            const student = onlineStudents.get(studentUserId);
            if (student) student.lastActivity = new Date();

            try {
                const activity = await prisma.studentActivity.create({
                    data: {
                        userId: studentUserId,
                        type: data.type,
                        action: data.action,
                        details: data.details || '',
                        metadata: data.metadata || {},
                        sessionId: studentSessionId || ''
                    }
                });

                // Emit back to the student
                socket.emit('student:activity-update', {
                    activity: activity,
                    timestamp: Date.now()
                });

                // Broadcast to admin
                if ((global as any).broadcastAdminEvent) {
                    (global as any).broadcastAdminEvent('student:activity', {
                        userId: studentUserId,
                        username: student?.username,
                        ...data
                    });
                }
            } catch (err: any) {
                console.warn('[StudentTracking] Failed to log activity:', err.message);
            }
        });

        // ─── Track Page Visit ───────────────────────────────────────
        socket.on('track:page-visit', async (data: { page: string }) => {
            if (!studentUserId) return;

            const student = onlineStudents.get(studentUserId);
            if (student) {
                student.lastActivity = new Date();
                student.currentPage = data.page;
            }

            try {
                await prisma.studentActivity.create({
                    data: {
                        userId: studentUserId,
                        type: 'page_visit',
                        action: `Visited ${data.page}`,
                        details: `Navigated to ${data.page}`,
                        metadata: { page: data.page } as any,
                        sessionId: studentSessionId || ''
                    }
                });
            } catch {
                // Non-fatal
            }
        });

        // ─── Track Quiz Complete ─────────────────────────────────────
        socket.on('track:quiz-complete', async (data: {
            quizId: string;
            score: number;
            coinsEarned: number;
            totalQuestions: number;
        }) => {
            if (!studentUserId) return;

            try {
                const activity = await prisma.studentActivity.create({
                    data: {
                        userId: studentUserId,
                        type: 'quiz',
                        action: 'Completed a quiz',
                        details: `Scored ${data.score}% (${data.coinsEarned} coins earned)`,
                        metadata: {
                            quizId: data.quizId,
                            score: data.score,
                            coinsEarned: data.coinsEarned,
                            totalQuestions: data.totalQuestions
                        } as any,
                        sessionId: studentSessionId || ''
                    }
                });

                // Emit live update
                socket.emit('student:activity-update', {
                    activity: activity,
                    timestamp: Date.now()
                });

                // Re-fetch and broadcast leaderboard
                const leaderboard = await fetchLeaderboard();
                trackingNamespace.to('leaderboard_room').emit('leaderboard:update', {
                    leaderboard,
                    timestamp: Date.now()
                });
            } catch (err: any) {
                console.warn('[StudentTracking] Quiz tracking failed:', err.message);
            }
        });

        // ─── Track Interview Complete ────────────────────────────────
        socket.on('track:interview-complete', async (data: {
            interviewId?: string;
            score: number;
            coinsEarned: number;
        }) => {
            if (!studentUserId) return;

            try {
                const activity = await prisma.studentActivity.create({
                    data: {
                        userId: studentUserId,
                        type: 'interview',
                        action: 'Completed an interview',
                        details: `Score: ${data.score}/10 (${data.coinsEarned} XP earned)`,
                        metadata: {
                            interviewId: data.interviewId,
                            score: data.score,
                            coinsEarned: data.coinsEarned
                        } as any,
                        sessionId: studentSessionId || ''
                    }
                });

                socket.emit('student:activity-update', {
                    activity: activity,
                    timestamp: Date.now()
                });

                // Update leaderboard
                const leaderboard = await fetchLeaderboard();
                trackingNamespace.to('leaderboard_room').emit('leaderboard:update', {
                    leaderboard,
                    timestamp: Date.now()
                });
            } catch (err: any) {
                console.warn('[StudentTracking] Interview tracking failed:', err.message);
            }
        });

        // ─── Track Achievement Unlocked ──────────────────────────────
        socket.on('track:achievement', async (data: {
            achievementId: string;
            achievementName: string;
            description: string;
            icon: string;
        }) => {
            if (!studentUserId) return;

            try {
                const activity = await prisma.studentActivity.create({
                    data: {
                        userId: studentUserId,
                        type: 'achievement',
                        action: `Unlocked: ${data.achievementName}`,
                        details: data.description,
                        metadata: {
                            achievementId: data.achievementId,
                            achievementName: data.achievementName,
                            icon: data.icon
                        } as any,
                        sessionId: studentSessionId || ''
                    }
                });

                socket.emit('student:achievement-unlocked', {
                    activity: activity,
                    achievement: data,
                    timestamp: Date.now()
                });
            } catch (err: any) {
                console.warn('[StudentTracking] Achievement tracking failed:', err.message);
            }
        });

        // ─── Request Performance Update ──────────────────────────────
        socket.on('track:request-performance', async () => {
            if (!studentUserId) return;

            try {
                const user = await prisma.user.findUnique({
                    where: { id: studentUserId },
                    select: {
                        username: true,
                        intervyxaCoins: true,
                        level: true,
                        weeklyCoins: true,
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

                if (user) {
                    const leaderboard = await fetchLeaderboard();
                    const userRank = leaderboard.findIndex(l => l.userId === studentUserId) + 1;

                    socket.emit('student:performance-update', {
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
                        rank: userRank || 0,
                        timestamp: Date.now()
                    });
                }
            } catch (err: any) {
                console.warn('[StudentTracking] Performance fetch failed:', err.message);
            }
        });

        // ─── Request Leaderboard ─────────────────────────────────────
        socket.on('track:request-leaderboard', async () => {
            try {
                const leaderboard = await fetchLeaderboard();
                socket.emit('leaderboard:update', {
                    leaderboard,
                    timestamp: Date.now()
                });
            } catch (err: any) {
                console.warn('[StudentTracking] Leaderboard fetch failed:', err.message);
            }
        });

        // ─── Disconnect ─────────────────────────────────────────────
        socket.on('disconnect', async () => {
            if (studentUserId) {
                const student = onlineStudents.get(studentUserId);
                onlineStudents.delete(studentUserId);

                // Log session end
                try {
                    const sessionDuration = student
                        ? Math.round((Date.now() - student.joinedAt.getTime()) / 1000)
                        : 0;

                    await prisma.studentActivity.create({
                        data: {
                            userId: studentUserId,
                            type: 'login',
                            action: 'Session ended',
                            details: `Session lasted ${Math.round(sessionDuration / 60)} minutes`,
                            metadata: {
                                sessionId: studentSessionId,
                                duration: sessionDuration
                            } as any,
                            sessionId: studentSessionId || ''
                        }
                    });
                } catch {
                    // Non-fatal
                }

                if ((global as any).broadcastAdminEvent) {
                    (global as any).broadcastAdminEvent('student:offline', {
                        userId: studentUserId,
                        username: student?.username,
                        onlineCount: onlineStudents.size
                    });
                }

                console.log(`[StudentTracking] ${student?.username || studentUserId} disconnected. Online: ${onlineStudents.size}`);
            }
        });
    });

    // Export helper: broadcast performance update to a specific student
    (global as any).broadcastStudentPerformance = async (userId: string) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    username: true,
                    intervyxaCoins: true,
                    level: true,
                    weeklyCoins: true,
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

            if (user) {
                const leaderboard = await fetchLeaderboard();
                const userRank = leaderboard.findIndex(l => l.userId === userId) + 1;

                trackingNamespace.to(`student_${userId}`).emit('student:performance-update', {
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
                    rank: userRank || 0,
                    timestamp: Date.now()
                });

                // Also broadcast leaderboard to everyone
                trackingNamespace.to('leaderboard_room').emit('leaderboard:update', {
                    leaderboard,
                    timestamp: Date.now()
                });
            }
        } catch (err: any) {
            console.warn('[StudentTracking] Broadcast performance failed:', err.message);
        }
    };

    // Export online students getter
    (global as any).getOnlineStudents = () => {
        return Array.from(onlineStudents.values());
    };

    console.log('[StudentTracking] Real-time tracking namespace initialized');
    return trackingNamespace;
}
