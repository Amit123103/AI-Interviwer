'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useStudentTracking } from '@/hooks/useStudentTracking';
import {
    Activity, Trophy, TrendingUp, Zap, Clock, Users, Star, Medal,
    Eye, BookOpen, Code2, MessageSquare, Target, Flame, ChevronUp,
    ChevronDown, Minus, Award, Sparkles, Timer, Radio, BarChart3,
    Crown, Shield, Rocket, GraduationCap, Wifi, WifiOff, RefreshCw
} from 'lucide-react';

// ─── Activity type icon & color mapping ─────────────────────────────
const ACTIVITY_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    login: { icon: Eye, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    quiz: { icon: BookOpen, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    interview: { icon: MessageSquare, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    practice: { icon: Target, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    code: { icon: Code2, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
    achievement: { icon: Trophy, color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
    levelup: { icon: Rocket, color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
    page_visit: { icon: Eye, color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
    submission: { icon: Code2, color: '#14b8a6', bg: 'rgba(20,184,166,0.1)' },
    note: { icon: BookOpen, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
    coin_earned: { icon: Zap, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
};

// ─── Format timesince ───────────────────────────────────────────────
function timeAgo(date: string | Date): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 10) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${Math.floor(diffHr / 24)}d ago`;
}

// ─── Format duration ────────────────────────────────────────────────
function formatDuration(startTime: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(startTime).getTime();
    const mins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m`;
}

export default function RealTimeTrackerPage() {
    // Get user info from localStorage
    const [userId, setUserId] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [sessionStart] = useState<Date>(new Date());
    const [currentTime, setCurrentTime] = useState<Date>(new Date());

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem('user');
                if (stored) {
                    const user = JSON.parse(stored);
                    setUserId(user._id || user.id || null);
                    setUsername(user.username || null);
                }
            } catch { /* ignore */ }
        }
    }, []);

    // Live clock for session duration
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const {
        isConnected,
        activities,
        performance,
        leaderboard,
        onlineCount,
        newAchievement,
        refreshPerformance,
        refreshLeaderboard,
    } = useStudentTracking(userId, username);

    // Session duration
    const sessionDuration = useMemo(() => formatDuration(sessionStart), [currentTime, sessionStart]);

    // Today's activities from full list
    const todayActivities = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return activities.filter(a => new Date(a.timestamp) >= today);
    }, [activities]);

    // Stats for today
    const todayStats = useMemo(() => {
        let quizzes = 0, interviews = 0, coinsEarned = 0;
        todayActivities.forEach(a => {
            if (a.type === 'quiz') quizzes++;
            if (a.type === 'interview') interviews++;
            if (a.metadata?.coinsEarned) coinsEarned += a.metadata.coinsEarned;
        });
        return { quizzes, interviews, coinsEarned, totalActions: todayActivities.length };
    }, [todayActivities]);

    // Level progress
    const levelProgress = useMemo(() => {
        if (!performance) return 0;
        const nextLevelCoins = performance.level * 500 * 2;
        return Math.min(100, Math.round((performance.coins / nextLevelCoins) * 100));
    }, [performance]);

    // Find current user rank in leaderboard
    const userRank = useMemo(() => {
        if (!userId) return 0;
        const entry = leaderboard.find(l => l.userId === userId);
        return entry?.rank || performance?.rank || 0;
    }, [leaderboard, userId, performance]);

    if (!userId) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#94a3b8',
                fontFamily: "'Inter', 'Segoe UI', sans-serif"
            }}>
                <div style={{ textAlign: 'center' }}>
                    <WifiOff size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                    <h2 style={{ fontSize: 20, color: '#e2e8f0' }}>Please log in to track your activity</h2>
                    <p style={{ fontSize: 14, marginTop: 8 }}>Real-time tracking requires authentication</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap');
                
                @keyframes pulseGlow {
                    0%, 100% { box-shadow: 0 0 8px rgba(16, 185, 129, 0.3); }
                    50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.6); }
                }
                @keyframes slideInLeft {
                    from { transform: translateX(-20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideInUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                @keyframes confetti-pop {
                    0% { transform: scale(0) rotate(0deg); opacity: 0; }
                    50% { transform: scale(1.3) rotate(180deg); opacity: 1; }
                    100% { transform: scale(1) rotate(360deg); opacity: 1; }
                }
                @keyframes borderGlow {
                    0%, 100% { border-color: rgba(16,185,129,0.2); }
                    50% { border-color: rgba(16,185,129,0.5); }
                }
                @keyframes rankChange {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.15); }
                    100% { transform: scale(1); }
                }
                @keyframes livePulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
                .glass-card {
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(148, 163, 184, 0.08);
                    border-radius: 16px;
                    transition: all 0.3s ease;
                }
                .glass-card:hover {
                    border-color: rgba(16, 185, 129, 0.15);
                    transform: translateY(-1px);
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
                }
                .activity-item {
                    animation: slideInLeft 0.3s ease-out forwards;
                }
                .stat-card {
                    animation: slideInUp 0.4s ease-out forwards;
                }
                .leaderboard-row:hover {
                    background: rgba(16, 185, 129, 0.05) !important;
                }
                .timeline-node {
                    animation: fadeIn 0.5s ease-out forwards;
                }
                .refresh-btn:hover {
                    background: rgba(16, 185, 129, 0.15) !important;
                    transform: rotate(180deg);
                }
                .achievement-glow {
                    animation: confetti-pop 0.6s ease-out forwards;
                }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.15); border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.3); }
            `}</style>

            {/* ─── Achievement Toast ────────────────────────────────── */}
            {newAchievement && (
                <div style={{
                    position: 'fixed', top: 24, right: 24, zIndex: 9999,
                    background: 'linear-gradient(135deg, rgba(234,179,8,0.15), rgba(245,158,11,0.1))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(234,179,8,0.3)',
                    borderRadius: 16, padding: '16px 24px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    animation: 'confetti-pop 0.6s ease-out, fadeIn 0.3s',
                    boxShadow: '0 8px 30px rgba(234,179,8,0.2)'
                }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: 'rgba(234,179,8,0.2)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Trophy size={24} color="#eab308" />
                    </div>
                    <div>
                        <p style={{ color: '#eab308', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                            🎉 Achievement Unlocked!
                        </p>
                        <p style={{ color: '#fef3c7', fontSize: 16, fontWeight: 600, marginTop: 2 }}>
                            {newAchievement.achievementName}
                        </p>
                    </div>
                </div>
            )}

            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e1e2e 50%, #0f172a 100%)',
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                color: '#e2e8f0',
                padding: '24px 24px 40px',
            }}>
                {/* ─── Header ─────────────────────────────────────────── */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: 24, flexWrap: 'wrap', gap: 12
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <div style={{
                                width: 10, height: 10, borderRadius: '50%',
                                background: isConnected ? '#10b981' : '#ef4444',
                                animation: isConnected ? 'livePulse 2s infinite' : 'none',
                                boxShadow: isConnected ? '0 0 8px rgba(16,185,129,0.5)' : '0 0 8px rgba(239,68,68,0.5)'
                            }} />
                            <h1 style={{
                                fontSize: 28, fontWeight: 800,
                                fontFamily: "'Outfit', sans-serif",
                                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                margin: 0
                            }}>
                                Real-Time Tracker
                            </h1>
                        </div>
                        <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
                            {isConnected ? 'Live' : 'Connecting...'} • Session: {sessionDuration} • {onlineCount} student{onlineCount !== 1 ? 's' : ''} online
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            onClick={refreshPerformance}
                            className="refresh-btn"
                            title="Refresh Performance"
                            style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: 'rgba(148,163,184,0.08)',
                                border: '1px solid rgba(148,163,184,0.1)',
                                color: '#94a3b8', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.4s ease'
                            }}
                        >
                            <RefreshCw size={14} />
                        </button>
                    </div>
                </div>

                {/* ─── Quick Stats Row ────────────────────────────────── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 12, marginBottom: 20
                }}>
                    {[
                        { label: 'Total Coins', value: performance?.coins?.toLocaleString() || '0', icon: Zap, color: '#f59e0b', gradient: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(234,179,8,0.05))' },
                        { label: 'Level', value: performance?.level || 1, icon: Rocket, color: '#ec4899', gradient: 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(219,39,119,0.05))' },
                        { label: 'Rank', value: userRank ? `#${userRank}` : '—', icon: Crown, color: '#eab308', gradient: 'linear-gradient(135deg, rgba(234,179,8,0.1), rgba(202,138,4,0.05))' },
                        { label: 'Avg Score', value: performance?.stats?.averageScore ? `${performance.stats.averageScore.toFixed(1)}/10` : '—', icon: BarChart3, color: '#3b82f6', gradient: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,99,235,0.05))' },
                        { label: "Today's Actions", value: todayStats.totalActions, icon: Activity, color: '#10b981', gradient: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))' },
                        { label: 'Weekly Coins', value: performance?.weeklyCoins?.toLocaleString() || '0', icon: TrendingUp, color: '#8b5cf6', gradient: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(124,58,237,0.05))' },
                    ].map((stat, i) => (
                        <div key={i} className="glass-card stat-card" style={{
                            padding: '16px 18px',
                            background: stat.gradient,
                            animationDelay: `${i * 0.08}s`, animationFillMode: 'backwards'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 6px' }}>{stat.label}</p>
                                    <p style={{ fontSize: 26, fontWeight: 800, color: stat.color, margin: 0, fontFamily: "'Outfit', sans-serif" }}>{stat.value}</p>
                                </div>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    background: `${stat.color}15`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <stat.icon size={18} color={stat.color} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ─── Level Progress Bar ─────────────────────────────── */}
                <div className="glass-card" style={{ padding: '14px 20px', marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <GraduationCap size={16} color="#10b981" />
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>Level {performance?.level || 1} Progress</span>
                        </div>
                        <span style={{ fontSize: 12, color: '#64748b' }}>{levelProgress}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 6, background: 'rgba(148,163,184,0.08)', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', borderRadius: 6,
                            background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                            width: `${levelProgress}%`,
                            transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
                            boxShadow: '0 0 10px rgba(16,185,129,0.3)'
                        }} />
                    </div>
                </div>

                {/* ─── Main Grid: Activity Feed + Leaderboard + Achievements */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 16, marginBottom: 20
                }}>
                    {/* ── Panel 1: Live Activity Feed ─────────────────── */}
                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid rgba(148,163,184,0.06)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Radio size={16} color="#10b981" />
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Live Activity</span>
                                <div style={{
                                    width: 6, height: 6, borderRadius: '50%',
                                    background: '#10b981', animation: 'livePulse 2s infinite'
                                }} />
                            </div>
                            <span style={{
                                fontSize: 11, color: '#64748b', background: 'rgba(148,163,184,0.06)',
                                padding: '3px 8px', borderRadius: 6
                            }}>{activities.length} events</span>
                        </div>
                        <div style={{ maxHeight: 420, overflowY: 'auto', padding: '8px 12px' }}>
                            {activities.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#475569' }}>
                                    <Activity size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                                    <p style={{ fontSize: 13 }}>No activities yet. Start learning!</p>
                                </div>
                            ) : (
                                activities.slice(0, 30).map((act, i) => {
                                    const config = ACTIVITY_CONFIG[act.type] || ACTIVITY_CONFIG.page_visit;
                                    const IconComp = config.icon;
                                    return (
                                        <div key={act._id || i} className="activity-item" style={{
                                            display: 'flex', alignItems: 'flex-start', gap: 10,
                                            padding: '10px 8px',
                                            borderBottom: '1px solid rgba(148,163,184,0.04)',
                                            animationDelay: `${i * 0.05}s`,
                                            animationFillMode: 'backwards'
                                        }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                                background: config.bg,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <IconComp size={14} color={config.color} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {act.action}
                                                </p>
                                                {act.details && (
                                                    <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {act.details}
                                                    </p>
                                                )}
                                            </div>
                                            <span style={{ fontSize: 10, color: '#475569', flexShrink: 0, marginTop: 2 }}>
                                                {timeAgo(act.timestamp)}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* ── Panel 2: Live Leaderboard ───────────────────── */}
                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid rgba(148,163,184,0.06)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Crown size={16} color="#eab308" />
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Leaderboard</span>
                            </div>
                            <button onClick={refreshLeaderboard} className="refresh-btn" style={{
                                width: 28, height: 28, borderRadius: 8,
                                background: 'rgba(148,163,184,0.06)',
                                border: 'none', color: '#64748b', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.4s ease'
                            }}>
                                <RefreshCw size={12} />
                            </button>
                        </div>
                        <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                            {leaderboard.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#475569' }}>
                                    <Crown size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                                    <p style={{ fontSize: 13 }}>No leaderboard data yet</p>
                                </div>
                            ) : (
                                leaderboard.map((entry, i) => {
                                    const isCurrentUser = entry.userId === userId;
                                    const rankColors = ['#eab308', '#94a3b8', '#cd7f32'];
                                    const rankColor = i < 3 ? rankColors[i] : '#475569';
                                    return (
                                        <div key={entry.userId} className="leaderboard-row" style={{
                                            display: 'flex', alignItems: 'center', gap: 12,
                                            padding: '10px 20px',
                                            borderBottom: '1px solid rgba(148,163,184,0.04)',
                                            background: isCurrentUser ? 'rgba(16,185,129,0.06)' : 'transparent',
                                            borderLeft: isCurrentUser ? '3px solid #10b981' : '3px solid transparent',
                                            transition: 'all 0.2s ease'
                                        }}>
                                            <div style={{
                                                width: 28, height: 28, borderRadius: 8,
                                                background: i < 3 ? `${rankColor}15` : 'rgba(148,163,184,0.06)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                {i < 3 ? (
                                                    <Medal size={14} color={rankColor} />
                                                ) : (
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{entry.rank}</span>
                                                )}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{
                                                    fontSize: 13, fontWeight: isCurrentUser ? 700 : 500,
                                                    color: isCurrentUser ? '#10b981' : '#e2e8f0',
                                                    margin: 0,
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                                }}>
                                                    {entry.username} {isCurrentUser && '(You)'}
                                                </p>
                                                <p style={{ fontSize: 10, color: '#64748b', margin: '1px 0 0' }}>
                                                    Level {entry.level} • {entry.achievementCount} badges
                                                </p>
                                            </div>
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <p style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', margin: 0 }}>
                                                    {entry.coins.toLocaleString()}
                                                </p>
                                                <p style={{ fontSize: 10, color: '#64748b', margin: 0 }}>coins</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* ── Panel 3: Achievements ───────────────────────── */}
                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid rgba(148,163,184,0.06)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Trophy size={16} color="#eab308" />
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Achievements</span>
                            </div>
                            <span style={{
                                fontSize: 11, color: '#10b981', background: 'rgba(16,185,129,0.1)',
                                padding: '3px 8px', borderRadius: 6, fontWeight: 600
                            }}>{performance?.achievements?.length || 0} unlocked</span>
                        </div>
                        <div style={{ maxHeight: 420, overflowY: 'auto', padding: '12px 16px' }}>
                            {(!performance?.achievements || performance.achievements.length === 0) ? (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#475569' }}>
                                    <Shield size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                                    <p style={{ fontSize: 13 }}>Complete activities to unlock achievements!</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    {performance.achievements.map((ach, i) => (
                                        <div key={ach.id || i} className="achievement-glow" style={{
                                            background: 'rgba(234,179,8,0.04)',
                                            border: '1px solid rgba(234,179,8,0.1)',
                                            borderRadius: 12, padding: '12px',
                                            textAlign: 'center',
                                            animationDelay: `${i * 0.1}s`,
                                            animationFillMode: 'backwards',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            <div style={{
                                                fontSize: 24, marginBottom: 6,
                                                filter: 'drop-shadow(0 0 4px rgba(234,179,8,0.3))'
                                            }}>
                                                {ach.icon || '🏆'}
                                            </div>
                                            <p style={{ fontSize: 11, fontWeight: 700, color: '#fef3c7', margin: 0 }}>{ach.name}</p>
                                            <p style={{ fontSize: 9, color: '#64748b', margin: '4px 0 0', lineHeight: '1.3' }}>{ach.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ─── Bottom: Session Timeline ────────────────────────── */}
                <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid rgba(148,163,184,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Timer size={16} color="#06b6d4" />
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Today&apos;s Session Timeline</span>
                        </div>
                        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b' }}>
                            <span>🎯 Quizzes: {todayStats.quizzes}</span>
                            <span>💬 Interviews: {todayStats.interviews}</span>
                            <span>💰 Coins: {todayStats.coinsEarned}</span>
                        </div>
                    </div>
                    <div style={{ padding: '16px 20px', overflowX: 'auto' }}>
                        {todayActivities.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '24px 20px', color: '#475569' }}>
                                <Clock size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
                                <p style={{ fontSize: 13 }}>No activities today yet. Your timeline will appear here.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 'max-content' }}>
                                {todayActivities.slice(-20).map((act, i) => {
                                    const config = ACTIVITY_CONFIG[act.type] || ACTIVITY_CONFIG.page_visit;
                                    const IconComp = config.icon;
                                    const time = new Date(act.timestamp);
                                    return (
                                        <React.Fragment key={act._id || i}>
                                            <div className="timeline-node" style={{
                                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                                animationDelay: `${i * 0.08}s`, animationFillMode: 'backwards',
                                                minWidth: 80
                                            }}>
                                                <span style={{ fontSize: 10, color: '#475569', marginBottom: 6 }}>
                                                    {time.getHours().toString().padStart(2, '0')}:{time.getMinutes().toString().padStart(2, '0')}
                                                </span>
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: 10,
                                                    background: config.bg,
                                                    border: `2px solid ${config.color}30`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    position: 'relative'
                                                }}>
                                                    <IconComp size={16} color={config.color} />
                                                </div>
                                                <span style={{
                                                    fontSize: 9, color: '#64748b', marginTop: 6,
                                                    maxWidth: 75, textAlign: 'center',
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                                }}>
                                                    {act.type}
                                                </span>
                                            </div>
                                            {i < todayActivities.slice(-20).length - 1 && (
                                                <div style={{
                                                    width: 30, height: 2,
                                                    background: 'linear-gradient(90deg, rgba(148,163,184,0.1), rgba(148,163,184,0.2), rgba(148,163,184,0.1))',
                                                    borderRadius: 2, flexShrink: 0,
                                                    marginTop: -8
                                                }} />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Daily Missions Section ──────────────────────────── */}
                {performance?.dailyMissions && performance.dailyMissions.length > 0 && (
                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginTop: 16 }}>
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid rgba(148,163,184,0.06)',
                            display: 'flex', alignItems: 'center', gap: 8
                        }}>
                            <Flame size={16} color="#f59e0b" />
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Daily Missions</span>
                        </div>
                        <div style={{ padding: '16px 20px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {performance.dailyMissions.map((mission, i) => {
                                const progress = Math.min(100, Math.round((mission.progress / mission.target) * 100));
                                return (
                                    <div key={mission.id || i} style={{
                                        flex: '1 1 200px',
                                        background: mission.completed ? 'rgba(16,185,129,0.06)' : 'rgba(148,163,184,0.03)',
                                        border: `1px solid ${mission.completed ? 'rgba(16,185,129,0.15)' : 'rgba(148,163,184,0.06)'}`,
                                        borderRadius: 12, padding: '14px 16px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: mission.completed ? '#10b981' : '#94a3b8', textTransform: 'capitalize' }}>
                                                {mission.type} {mission.completed && '✅'}
                                            </span>
                                            <span style={{ fontSize: 11, color: '#64748b' }}>
                                                {mission.progress}/{mission.target}
                                            </span>
                                        </div>
                                        <div style={{ height: 4, borderRadius: 4, background: 'rgba(148,163,184,0.08)', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%', borderRadius: 4,
                                                background: mission.completed ? '#10b981' : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                                                width: `${progress}%`,
                                                transition: 'width 0.8s ease'
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
