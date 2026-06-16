'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface Activity {
    _id?: string;
    userId: string;
    type: string;
    action: string;
    details: string;
    metadata: Record<string, any>;
    sessionId?: string;
    timestamp: string | Date;
}

interface Performance {
    coins: number;
    level: number;
    weeklyCoins: number;
    stats: {
        totalInterviews: number;
        totalCodeLines: number;
        averageScore: number;
    };
    achievements: Array<{
        id: string;
        name: string;
        description: string;
        icon: string;
        unlockedAt: string | Date;
    }>;
    dailyMissions: Array<{
        id: string;
        type: string;
        target: number;
        progress: number;
        completed: boolean;
    }>;
    rank: number;
}

interface LeaderboardEntry {
    rank: number;
    userId: string;
    username: string;
    coins: number;
    level: number;
    weeklyCoins: number;
    achievementCount: number;
}

export function useStudentTracking(userId: string | null, username: string | null) {
    const [isConnected, setIsConnected] = useState(false);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [performance, setPerformance] = useState<Performance | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [onlineCount, setOnlineCount] = useState(0);
    const [sessionId, setSessionId] = useState<string>('');
    const [newAchievement, setNewAchievement] = useState<any>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!userId || !username || typeof window === 'undefined') return;

        // Connect to the student-tracking namespace
        const socket = io(`${SOCKET_URL}/student-tracking`, {
            transports: ['websocket'],
            autoConnect: true,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            // Join tracking with user info
            socket.emit('track:join', { userId, username });
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        // Initial data payload
        socket.on('tracking:init', (data) => {
            if (data.activities) setActivities(data.activities);
            if (data.performance) setPerformance(data.performance);
            if (data.leaderboard) setLeaderboard(data.leaderboard);
            if (data.onlineCount) setOnlineCount(data.onlineCount);
            if (data.sessionId) setSessionId(data.sessionId);
        });

        // Live activity updates
        socket.on('student:activity-update', (data) => {
            if (data.activity) {
                setActivities(prev => [data.activity, ...prev].slice(0, 100));
            }
        });

        // Live performance updates
        socket.on('student:performance-update', (data) => {
            setPerformance(prev => ({
                ...(prev || {
                    coins: 0,
                    level: 1,
                    weeklyCoins: 0,
                    stats: { totalInterviews: 0, totalCodeLines: 0, averageScore: 0 },
                    achievements: [],
                    dailyMissions: [],
                    rank: 0
                }),
                coins: data.coins ?? prev?.coins ?? 0,
                level: data.level ?? prev?.level ?? 1,
                weeklyCoins: data.weeklyCoins ?? prev?.weeklyCoins ?? 0,
                stats: data.stats ?? prev?.stats ?? { totalInterviews: 0, totalCodeLines: 0, averageScore: 0 },
                achievements: data.achievements ?? prev?.achievements ?? [],
                dailyMissions: data.dailyMissions ?? prev?.dailyMissions ?? [],
                rank: data.rank ?? prev?.rank ?? 0
            }));
        });

        // Achievement unlocked
        socket.on('student:achievement-unlocked', (data) => {
            setNewAchievement(data.achievement);
            if (data.activity) {
                setActivities(prev => [data.activity, ...prev].slice(0, 100));
            }
            // Auto-clear after 5s
            setTimeout(() => setNewAchievement(null), 5000);
        });

        // Leaderboard updates
        socket.on('leaderboard:update', (data) => {
            if (data.leaderboard) setLeaderboard(data.leaderboard);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [userId, username]);

    // Track page visit
    const trackPageVisit = useCallback((page: string) => {
        socketRef.current?.emit('track:page-visit', { page });
    }, []);

    // Track generic activity
    const trackActivity = useCallback((type: string, action: string, details?: string, metadata?: Record<string, any>) => {
        socketRef.current?.emit('track:activity', { type, action, details, metadata });
    }, []);

    // Track quiz completion
    const trackQuizComplete = useCallback((quizId: string, score: number, coinsEarned: number, totalQuestions: number) => {
        socketRef.current?.emit('track:quiz-complete', { quizId, score, coinsEarned, totalQuestions });
    }, []);

    // Track interview completion
    const trackInterviewComplete = useCallback((interviewId: string, score: number, coinsEarned: number) => {
        socketRef.current?.emit('track:interview-complete', { interviewId, score, coinsEarned });
    }, []);

    // Track achievement
    const trackAchievement = useCallback((achievement: { achievementId: string; achievementName: string; description: string; icon: string }) => {
        socketRef.current?.emit('track:achievement', achievement);
    }, []);

    // Request fresh performance data
    const refreshPerformance = useCallback(() => {
        socketRef.current?.emit('track:request-performance');
    }, []);

    // Request fresh leaderboard
    const refreshLeaderboard = useCallback(() => {
        socketRef.current?.emit('track:request-leaderboard');
    }, []);

    return {
        isConnected,
        activities,
        performance,
        leaderboard,
        onlineCount,
        sessionId,
        newAchievement,
        trackPageVisit,
        trackActivity,
        trackQuizComplete,
        trackInterviewComplete,
        trackAchievement,
        refreshPerformance,
        refreshLeaderboard,
    };
}
