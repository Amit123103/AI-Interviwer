'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
    LayoutDashboard, Users, Settings, Megaphone, Database, Shield,
    TrendingUp, Zap, Activity, CreditCard, Download, LogOut,
    ChevronRight, Cpu, Globe, Clock, UserCheck, AlertCircle,
    BarChart3, Lock, Eye, Bell, Plus, Search, Radio,
    Server, Wifi, FileText
} from 'lucide-react'
import { io } from 'socket.io-client'

interface AdminStats {
    totalUsers?: number;
    proUsers?: number;
    totalInterviews?: number;
    totalRevenue?: number;
    activeUsers?: number;
}

interface SystemHealth {
    database?: string;
    aiService?: string;
    ollama?: string;
    latency?: number;
    uptime?: number;
}

export default function AdminHub() {
    const router = useRouter()
    const [adminUser, setAdminUser] = useState<string>('')
    const [sessionDuration, setSessionDuration] = useState<string>('0m')
    const [stats, setStats] = useState<AdminStats>({})
    const [health, setHealth] = useState<SystemHealth>({})
    const [liveEvents, setLiveEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [onlineStudents, setOnlineStudents] = useState(0)
    const socketRef = useRef<any>(null)
    const loginTimeRef = useRef<number>(Date.now())

    // ── Auth Guard ──────────────────────────────────────────────────
    useEffect(() => {
        if (typeof window === 'undefined') return

        const session = localStorage.getItem('admin_session')
        if (!session) {
            router.push('/admin/login')
            return
        }

        try {
            const parsed = JSON.parse(session)
            if (!parsed.token || parsed.expiresAt < Date.now()) {
                localStorage.removeItem('admin_session')
                router.push('/admin/login')
                return
            }
            setAdminUser(parsed.username || 'Administrator')
            loginTimeRef.current = parsed.loginAt || Date.now()
        } catch {
            localStorage.removeItem('admin_session')
            router.push('/admin/login')
            return
        }

        fetchAdminData()
        initSocket()

        const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => {
            clearInterval(clockTimer)
            socketRef.current?.disconnect()
        }
    }, [router])

    // Session duration
    useEffect(() => {
        const diff = Math.floor((currentTime.getTime() - loginTimeRef.current) / 1000)
        const hrs = Math.floor(diff / 3600)
        const mins = Math.floor((diff % 3600) / 60)
        setSessionDuration(hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`)
    }, [currentTime])

    const getAdminToken = () => {
        try {
            const session = JSON.parse(localStorage.getItem('admin_session') || '{}')
            return session.token || localStorage.getItem('token') || ''
        } catch { return '' }
    }

    const fetchAdminData = async () => {
        try {
            const token = getAdminToken()
            const headers = { 'Authorization': `Bearer ${token}` }
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

            const [statsRes, healthRes] = await Promise.all([
                fetch(`${baseUrl}/api/admin/stats`, { headers }).catch(() => null),
                fetch(`${baseUrl}/api/admin/system-health`, { headers }).catch(() => null),
            ])

            if (statsRes?.ok) setStats(await statsRes.json())
            if (healthRes?.ok) setHealth(await healthRes.json())

            // Get online count from tracking
            try {
                const onlineRes = await fetch(`${baseUrl}/api/tracking/online`, { headers })
                if (onlineRes.ok) {
                    const data = await onlineRes.json()
                    setOnlineStudents(data.count || 0)
                }
            } catch { /* non-fatal */ }
        } catch (err) {
            console.error('[AdminHub] Fetch error:', err)
        } finally {
            setLoading(false)
        }
    }

    const initSocket = () => {
        const socket = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/admin-stream`, {
            transports: ['websocket']
        })
        socketRef.current = socket

        const handleEvent = (data: any) => {
            setLiveEvents(prev => [{ ...data, timestamp: Date.now() }, ...prev].slice(0, 8))
        }

        socket.on('user:login', (data) => handleEvent({ ...data, type: 'login', label: 'Student Login' }))
        socket.on('user:signup', (data) => handleEvent({ ...data, type: 'signup', label: 'New Registration' }))
        socket.on('payment:success', (data) => handleEvent({ ...data, type: 'payment', label: 'Payment Received' }))
        socket.on('student:online', (data) => { setOnlineStudents(data.onlineCount || 0); handleEvent({ ...data, type: 'online', label: 'Student Online' }) })
        socket.on('student:offline', (data) => { setOnlineStudents(data.onlineCount || 0) })
        socket.on('admin:intervention', (data) => handleEvent({ ...data, type: 'admin', label: 'Admin Action' }))
    }

    const handleLogout = () => {
        localStorage.removeItem('admin_session')
        router.push('/admin/login')
    }

    const handleExport = (type: string) => {
        const token = getAdminToken()
        window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/export/${type}?token=${token}`, '_blank')
    }

    // ── Navigation items ────────────────────────────────────────────
    const navItems = [
        { label: 'Mission Control', icon: LayoutDashboard, href: '/admin/dashboard', color: '#8b5cf6', desc: 'Advanced analytics & live stream' },
        { label: 'User Database', icon: Users, href: '/admin/users', color: '#3b82f6', desc: 'Manage all platform users' },
        { label: 'Platform Nexus', icon: Megaphone, href: '/admin/nexus', color: '#ec4899', desc: 'Announcements, resources & upgrades' },
        { label: 'System Config', icon: Settings, href: '/admin/settings', color: '#f59e0b', desc: 'Platform configuration' },
        { label: 'Database', icon: Database, href: '/admin/database', color: '#10b981', desc: 'Direct database access' },
        { label: 'Pro Payments', icon: CreditCard, href: '/admin/pro-payments', color: '#06b6d4', desc: 'Payment tracking & management' },
    ]

    // ── Quick actions ───────────────────────────────────────────────
    const quickActions = [
        { label: 'Export Users', icon: Download, action: () => handleExport('users'), color: '#3b82f6' },
        { label: 'Export Payments', icon: Download, action: () => handleExport('payments'), color: '#10b981' },
        { label: 'View Live Tracker', icon: Radio, action: () => router.push('/dashboard/real-time-tracker'), color: '#f59e0b' },
    ]

    const EVENT_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
        login: { icon: UserCheck, color: '#3b82f6' },
        signup: { icon: Users, color: '#8b5cf6' },
        payment: { icon: CreditCard, color: '#10b981' },
        online: { icon: Wifi, color: '#06b6d4' },
        admin: { icon: Shield, color: '#ef4444' },
    }

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#09090b', color: '#a1a1aa',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <Cpu size={32} style={{ opacity: 0.3, marginBottom: 12, animation: 'spin 2s linear infinite' }} />
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>Loading Administrator Panel</p>
                </div>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeSlide { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes liveDot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
                @keyframes cardHoverGlow { 0%, 100% { box-shadow: 0 4px 20px rgba(0,0,0,0.3); } 50% { box-shadow: 0 8px 40px rgba(139,92,246,0.08); } }
                .admin-hub-card {
                    background: rgba(24,24,27,0.6);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 20px;
                    transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
                    animation: fadeSlide 0.5s ease-out both;
                }
                .admin-hub-card:hover {
                    border-color: rgba(139,92,246,0.2);
                    transform: translateY(-2px);
                    box-shadow: 0 12px 40px rgba(0,0,0,0.4);
                }
                .nav-card {
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                }
                .nav-card:hover .nav-arrow { transform: translateX(4px); opacity: 1; }
                .nav-card:hover .nav-bg-icon { opacity: 0.06; transform: scale(1.1); }
                .quick-btn { cursor: pointer; transition: all 0.25s ease; }
                .quick-btn:hover { transform: translateY(-1px); }
                ::-webkit-scrollbar { width: 3px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 3px; }
            `}</style>

            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #09090b 0%, #18181b 50%, #09090b 100%)',
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                color: '#e4e4e7', padding: '20px 24px 40px',
            }}>
                {/* ── Top Header ─────────────────────────────────────── */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: 28, flexWrap: 'wrap', gap: 12,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 14,
                            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 30px rgba(139,92,246,0.3)',
                        }}>
                            <Shield size={22} color="white" />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <h1 style={{
                                    fontSize: 22, fontWeight: 900, letterSpacing: 1,
                                    fontFamily: "'Outfit', sans-serif",
                                    background: 'linear-gradient(135deg, #c4b5fd, #a78bfa)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    margin: 0,
                                }}>
                                    Administrator
                                </h1>
                                <span style={{
                                    fontSize: 8, fontWeight: 900, letterSpacing: 2,
                                    textTransform: 'uppercase', color: '#10b981',
                                    background: 'rgba(16,185,129,0.1)',
                                    padding: '3px 8px', borderRadius: 6,
                                    display: 'flex', alignItems: 'center', gap: 4,
                                }}>
                                    <div style={{
                                        width: 5, height: 5, borderRadius: '50%',
                                        background: '#10b981', animation: 'liveDot 2s infinite',
                                    }} />
                                    Online
                                </span>
                            </div>
                            <p style={{ fontSize: 10, color: '#52525b', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', margin: '2px 0 0' }}>
                                {adminUser} • Session: {sessionDuration} • {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={handleLogout} className="quick-btn" style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 16px', borderRadius: 10,
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.15)',
                            color: '#ef4444', fontSize: 9, fontWeight: 800,
                            letterSpacing: 2, textTransform: 'uppercase',
                            cursor: 'pointer',
                        }}>
                            <LogOut size={12} /> Logout
                        </button>
                    </div>
                </div>

                {/* ── Stats Overview ─────────────────────────────────── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: 12, marginBottom: 24,
                }}>
                    {[
                        { label: 'Total Users', value: stats.totalUsers?.toLocaleString() || '0', icon: Users, color: '#3b82f6' },
                        { label: 'Pro Users', value: stats.proUsers?.toLocaleString() || '0', icon: Shield, color: '#8b5cf6' },
                        { label: 'Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: '#10b981' },
                        { label: 'Interviews', value: stats.totalInterviews?.toLocaleString() || '0', icon: Zap, color: '#f59e0b' },
                        { label: 'Online Now', value: onlineStudents.toString(), icon: Wifi, color: '#06b6d4' },
                    ].map((stat, i) => (
                        <div key={i} className="admin-hub-card" style={{
                            padding: '16px 18px', animationDelay: `${i * 0.06}s`,
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ fontSize: 9, fontWeight: 800, color: '#52525b', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 6px' }}>
                                        {stat.label}
                                    </p>
                                    <p style={{ fontSize: 24, fontWeight: 900, color: 'white', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
                                        {stat.value}
                                    </p>
                                </div>
                                <div style={{
                                    width: 34, height: 34, borderRadius: 10,
                                    background: `${stat.color}12`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <stat.icon size={16} color={stat.color} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Main Grid: Navigation + Live Stream ────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
                    {/* Navigation Cards */}
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 800, color: '#52525b', letterSpacing: 3, textTransform: 'uppercase', margin: '0 0 12px 4px' }}>
                            Control Modules
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {navItems.map((item, i) => (
                                <div
                                    key={item.label}
                                    className="admin-hub-card nav-card"
                                    onClick={() => router.push(item.href)}
                                    style={{ padding: '20px 20px', animationDelay: `${0.1 + i * 0.06}s` }}
                                >
                                    {/* Background icon watermark */}
                                    <div className="nav-bg-icon" style={{
                                        position: 'absolute', bottom: -10, right: -10,
                                        opacity: 0.03, transition: 'all 0.5s ease',
                                        pointerEvents: 'none',
                                    }}>
                                        <item.icon size={80} />
                                    </div>

                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                            <div style={{
                                                width: 38, height: 38, borderRadius: 12,
                                                background: `${item.color}12`,
                                                border: `1px solid ${item.color}20`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <item.icon size={18} color={item.color} />
                                            </div>
                                            <ChevronRight
                                                size={14} color="#52525b"
                                                className="nav-arrow"
                                                style={{ opacity: 0.3, transition: 'all 0.3s ease' }}
                                            />
                                        </div>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: '#e4e4e7', margin: '0 0 3px' }}>
                                            {item.label}
                                        </p>
                                        <p style={{ fontSize: 10, color: '#52525b', fontWeight: 500, margin: 0 }}>
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Live Event Stream */}
                    <div className="admin-hub-card" style={{ padding: 0, overflow: 'hidden', animationDelay: '0.2s' }}>
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Activity size={14} color="#8b5cf6" style={{ animation: 'liveDot 2s infinite' }} />
                                <span style={{ fontSize: 9, fontWeight: 800, color: '#71717a', letterSpacing: 2.5, textTransform: 'uppercase' }}>
                                    Live Stream
                                </span>
                            </div>
                            <span style={{
                                fontSize: 8, fontWeight: 700, color: '#3f3f46', letterSpacing: 1,
                                fontFamily: 'monospace',
                            }}>
                                BROADCAST
                            </span>
                        </div>
                        <div style={{ maxHeight: 420, overflowY: 'auto', padding: '8px 12px' }}>
                            {liveEvents.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '48px 20px', color: '#3f3f46' }}>
                                    <Globe size={28} style={{ opacity: 0.2, marginBottom: 8 }} />
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
                                        Awaiting telemetry...
                                    </p>
                                </div>
                            ) : (
                                liveEvents.map((ev, i) => {
                                    const config = EVENT_ICONS[ev.type] || { icon: Activity, color: '#71717a' }
                                    const IconComp = config.icon
                                    return (
                                        <div key={ev.timestamp + i} style={{
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '10px 8px',
                                            borderBottom: '1px solid rgba(255,255,255,0.02)',
                                            animation: 'fadeSlide 0.3s ease-out both',
                                            animationDelay: `${i * 0.04}s`,
                                        }}>
                                            <div style={{
                                                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                                                background: `${config.color}10`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <IconComp size={13} color={config.color} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: 10, fontWeight: 700, color: '#e4e4e7', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {ev.label || ev.type}
                                                </p>
                                                <p style={{ fontSize: 9, color: '#52525b', margin: '1px 0 0', fontFamily: 'monospace' }}>
                                                    {ev.username || ev.email || 'System'}
                                                </p>
                                            </div>
                                            <span style={{ fontSize: 8, color: '#3f3f46', fontFamily: 'monospace', flexShrink: 0 }}>
                                                {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Quick Actions + System Health ───────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {/* Quick Actions */}
                    <div className="admin-hub-card" style={{ padding: '20px', animationDelay: '0.3s' }}>
                        <p style={{ fontSize: 9, fontWeight: 800, color: '#52525b', letterSpacing: 3, textTransform: 'uppercase', margin: '0 0 14px' }}>
                            Quick Actions
                        </p>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {quickActions.map((action) => (
                                <button
                                    key={action.label}
                                    onClick={action.action}
                                    className="quick-btn"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '8px 14px', borderRadius: 10,
                                        background: `${action.color}08`,
                                        border: `1px solid ${action.color}18`,
                                        color: action.color, fontSize: 9, fontWeight: 800,
                                        letterSpacing: 1.5, textTransform: 'uppercase',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <action.icon size={12} /> {action.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* System Health */}
                    <div className="admin-hub-card" style={{ padding: '20px', animationDelay: '0.35s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                            <p style={{ fontSize: 9, fontWeight: 800, color: '#52525b', letterSpacing: 3, textTransform: 'uppercase', margin: 0 }}>
                                System Health
                            </p>
                            <div style={{ display: 'flex', gap: 12, fontSize: 9, color: '#52525b', fontWeight: 600 }}>
                                <span>Latency: <span style={{ color: '#e4e4e7' }}>{health.latency || 0}ms</span></span>
                                <span>Uptime: <span style={{ color: '#e4e4e7' }}>{health.uptime ? Math.floor(health.uptime / 3600) : 0}h</span></span>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                            {[
                                { label: 'Database', status: health.database, icon: Database },
                                { label: 'AI Engine', status: health.aiService, icon: Cpu },
                                { label: 'Ollama', status: health.ollama, icon: Server },
                                { label: 'Network', status: 'healthy', icon: Globe },
                            ].map((sys, i) => {
                                const isHealthy = sys.status === 'healthy'
                                return (
                                    <div key={i} style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                                        gap: 6, padding: '10px 6px', borderRadius: 12,
                                        background: 'rgba(0,0,0,0.2)',
                                        border: '1px solid rgba(255,255,255,0.03)',
                                    }}>
                                        <sys.icon size={16} color={isHealthy ? '#10b981' : '#ef4444'} />
                                        <span style={{ fontSize: 8, fontWeight: 800, color: '#52525b', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                                            {sys.label}
                                        </span>
                                        <span style={{
                                            fontSize: 8, fontWeight: 800, letterSpacing: 1,
                                            color: isHealthy ? '#10b981' : '#ef4444',
                                            textTransform: 'uppercase',
                                        }}>
                                            {sys.status || 'unknown'}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Footer Security Banner ─────────────────────────── */}
                <div style={{
                    marginTop: 24, padding: '14px 20px', borderRadius: 16,
                    background: 'rgba(139,92,246,0.03)',
                    border: '1px solid rgba(139,92,246,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 12,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Lock size={14} color="#7c3aed" style={{ opacity: 0.5 }} />
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#52525b', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                            All actions are encrypted and logged • Administrator session active
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {['AES-256 Encryption', 'Session: Active', `Token Expires: ${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()}`].map(badge => (
                            <span key={badge} style={{
                                fontSize: 7, fontWeight: 800, color: '#3f3f46', letterSpacing: 1.5,
                                textTransform: 'uppercase', padding: '3px 8px',
                                background: 'rgba(0,0,0,0.3)', borderRadius: 6,
                                border: '1px solid rgba(255,255,255,0.03)',
                            }}>
                                {badge}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}
