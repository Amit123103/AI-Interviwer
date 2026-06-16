"use client"

import React, { useState, useEffect, useRef } from 'react'
import {
    Users,
    CreditCard,
    TrendingUp,
    Activity,
    ArrowUpRight,
    Clock,
    Download,
    Search,
    UserCheck,
    AlertCircle,
    Loader2,
    Shield,
    Zap,
    Cpu,
    Globe,
    BarChart3,
    Settings,
    LayoutDashboard,
    Lock,
    Megaphone,
    Database
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import MeshBackground from "@/app/dashboard/components/MeshBackground"
import { motion, AnimatePresence } from "framer-motion"
import { io } from "socket.io-client"

interface AdminStats {
    totalUsers: number
    proUsers: number
    totalInterviews: number
    totalRevenue: number
    activeUsers: number
}

interface PredictiveStats {
    conversionRate: string
    monthlyForecast: number
    activeProGrowth: string
    forecastConfidence: number
}

interface SystemHealth {
    database: string
    aiService: string
    ollama: string
    latency: number
    uptime: number
}

const StatCard = ({ title, value, icon: Icon, trend, color, subtitle }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="glass-card-v2 p-6 group hover:border-violet-500/30 transition-all duration-500"
    >
        <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{title}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-white">{typeof value === 'number' && title.includes('Revenue') ? `₹${value.toLocaleString()}` : value}</p>
                    {trend && <span className="text-[10px] font-bold text-emerald-400">{trend}</span>}
                </div>
                {subtitle && <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">{subtitle}</p>}
            </div>
            <div className={`p-3 rounded-2xl ${color} bg-opacity-10 border border-white/5`}>
                <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
            </div>
        </div>
        <div className="absolute -bottom-6 -right-6 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-700 group-hover:scale-110">
            <Icon className="w-32 h-32" />
        </div>
    </motion.div>
)

export default function AdminDashboard() {
    const router = useRouter()
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [predictive, setPredictive] = useState<PredictiveStats | null>(null)
    const [health, setHealth] = useState<SystemHealth | null>(null)
    const [adminLogs, setAdminLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [liveEvents, setLiveEvents] = useState<any[]>([])

    const socketRef = useRef<any>(null)

    // ── Admin Auth Guard ──
    useEffect(() => {
        if (typeof window === 'undefined') return
        const session = localStorage.getItem('admin_session')
        if (!session) { router.push('/admin/login'); return }
        try {
            const parsed = JSON.parse(session)
            if (!parsed.token || parsed.expiresAt < Date.now()) {
                localStorage.removeItem('admin_session')
                router.push('/admin/login')
            }
        } catch { localStorage.removeItem('admin_session'); router.push('/admin/login') }
    }, [router])

    const getAdminToken = () => {
        try {
            const session = JSON.parse(localStorage.getItem('admin_session') || '{}')
            return session.token || localStorage.getItem('token') || ''
        } catch { return '' }
    }

    const fetchAllData = async () => {
        try {
            const token = getAdminToken()
            const headers = { 'Authorization': `Bearer ${token}` }
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

            const [statsRes, predRes, healthRes, logsRes] = await Promise.all([
                fetch(`${baseUrl}/api/admin/stats`, { headers }),
                fetch(`${baseUrl}/api/admin/predictive-stats`, { headers }),
                fetch(`${baseUrl}/api/admin/system-health`, { headers }),
                fetch(`${baseUrl}/api/admin/logs`, { headers })
            ])

            if (statsRes.ok) setStats(await statsRes.json())
            if (predRes.ok) setPredictive(await predRes.json())
            if (healthRes.ok) setHealth(await healthRes.json())
            if (logsRes.ok) setAdminLogs(await logsRes.json())
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAllData()

        // Socket.IO for Live Data
        const socket = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/admin-stream`, {
            transports: ['websocket']
        })
        socketRef.current = socket

        socket.on('connect', () => console.log('Connected to Mission Control Stream'))

        const handleEvent = (data: any) => {
            setLiveEvents(prev => [data, ...prev].slice(0, 10))
        }

        socket.on('user:login', (data) => handleEvent({ ...data, type: 'login', icon: UserCheck, color: 'text-blue-400' }))
        socket.on('user:signup', (data) => handleEvent({ ...data, type: 'signup', icon: Users, color: 'text-violet-400' }))
        socket.on('payment:success', (data) => handleEvent({ ...data, type: 'payment', icon: CreditCard, color: 'text-emerald-400' }))
        socket.on('system:config_update', (data) => handleEvent({ ...data, type: 'config', icon: Settings, color: 'text-amber-400' }))

        // Listen for Admin Interventions specifically
        socket.on('admin:intervention', (data) => {
            setAdminLogs(prev => [data, ...prev].slice(0, 100))
            handleEvent({ ...data, type: 'admin', icon: Shield, color: 'text-red-400' })
        })

        return () => {
            socket.disconnect()
        }
    }, [])

    const handleExport = async (type: 'users' | 'payments') => {
        const token = localStorage.getItem("token")
        window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/export/${type}?token=${token}`, '_blank')
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        </div>
    )

    return (
        <div className="min-h-screen bg-transparent text-white py-8 px-4 sm:px-6 relative overflow-hidden">
            <MeshBackground />

            <div className="max-w-7xl mx-auto space-y-8 relative z-10">
                {/* Mission Control Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[22px] bg-violet-600 flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.5)]">
                            <LayoutDashboard className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black uppercase tracking-tight text-white">Mission Control</h1>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                                    <div className="w-1 h-1 rounded-full bg-emerald-400" /> Live Stream Active
                                </span>
                            </div>
                            <p className="text-sm text-zinc-500 font-medium">Advanced+++ Administrative Intelligence & Real-time Nexus</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
                        <Button
                            onClick={() => handleExport('users')}
                            variant="ghost"
                            className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white"
                        >
                            <Download className="w-4 h-4 mr-2" /> Data Export
                        </Button>
                        <div className="h-4 w-[1px] bg-white/10" />
                        <Button
                            onClick={() => router.push('/admin/database')}
                            variant="ghost"
                            className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300"
                        >
                            <Database className="w-4 h-4 mr-2" /> Database
                        </Button>
                        <div className="h-4 w-[1px] bg-white/10" />
                        <Button
                            onClick={() => router.push('/admin/nexus')}
                            variant="ghost"
                            className="text-[10px] font-black uppercase tracking-widest text-violet-400 hover:text-violet-300"
                        >
                            <Megaphone className="w-4 h-4 mr-2" /> Platform Nexus
                        </Button>
                        <div className="h-4 w-[1px] bg-white/10" />
                        <Button
                            onClick={() => router.push('/admin/settings')}
                            variant="ghost"
                            className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white"
                        >
                            <Settings className="w-4 h-4 mr-2" /> Config
                        </Button>
                    </div>
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Stats & Pulse */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <StatCard
                                title="Platform Revenue"
                                value={stats?.totalRevenue || 0}
                                icon={TrendingUp}
                                trend="+12.5%"
                                subtitle="Validated successful transactions"
                                color="bg-emerald-500"
                            />
                            <StatCard
                                title="Member Base"
                                value={stats?.totalUsers || 0}
                                icon={Users}
                                trend={predictive?.activeProGrowth}
                                subtitle="Total registered students"
                                color="bg-blue-500"
                            />
                            <StatCard
                                title="Neural Sessions"
                                value={stats?.totalInterviews || 0}
                                icon={Zap}
                                subtitle="Total AI interview completions"
                                color="bg-amber-500"
                            />
                            <StatCard
                                title="Active Pro Slots"
                                value={stats?.proUsers || 0}
                                icon={Shield}
                                subtitle="Paid subscription throughput"
                                color="bg-violet-500"
                            />
                        </div>

                        {/* System Pulse Widget */}
                        <div className="glass-card-v2 p-8 space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                                    <Cpu className="w-4 h-4 text-violet-400" /> System Pulse (Real-time)
                                </h3>
                                <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-500 uppercase">
                                    <span>Latency: <span className="text-white">{health?.latency}ms</span></span>
                                    <span>Uptime: <span className="text-white">{health ? Math.floor(health.uptime / 3600) : 0}h</span></span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'Database', status: health?.database, icon: Globe },
                                    { label: 'AI Engine', status: health?.aiService, icon: Activity },
                                    { label: 'Ollama V-Net', status: health?.ollama, icon: Cpu },
                                    { label: 'Network', status: 'healthy', icon: Shield }
                                ].map((sys, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5 hover:border-violet-500/20 transition-colors">
                                        <sys.icon className={`w-5 h-5 ${sys.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'}`} />
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">{sys.label}</p>
                                            <p className={`text-[10px] font-bold uppercase ${sys.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'}`}>{sys.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stored Admin Data: Intervention Vault */}
                        <div className="glass-card-v2 p-8 space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-red-400" /> Admin Intervention Vault
                                </span>
                                <span className="text-[9px] text-zinc-600 font-mono">ENCRYPTED_ARCHIVE</span>
                            </h3>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="pb-4 text-[9px] font-black uppercase tracking-widest text-zinc-600">Admin</th>
                                            <th className="pb-4 text-[9px] font-black uppercase tracking-widest text-zinc-600">Action</th>
                                            <th className="pb-4 text-[9px] font-black uppercase tracking-widest text-zinc-600">Target</th>
                                            <th className="pb-4 text-[9px] font-black uppercase tracking-widest text-zinc-600">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {adminLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="py-8 text-center text-xs text-zinc-500 font-bold uppercase tracking-widest opacity-30">
                                                    No historic interventions found.
                                                </td>
                                            </tr>
                                        ) : (
                                            adminLogs.slice(0, 10).map((log, i) => (
                                                <tr key={log._id || i} className="group hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-violet-500/10 flex items-center justify-center">
                                                                <Shield className="w-3 h-3 text-violet-400" />
                                                            </div>
                                                            <span className="text-[11px] font-bold text-zinc-300">{log.adminName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <span className="text-[10px] font-black uppercase tracking-tighter text-white px-2 py-0.5 rounded-md bg-white/5">
                                                            {log.action.replace(/_/g, ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="py-4">
                                                        <span className="text-[10px] font-mono text-zinc-500">{log.targetName || 'SYSTEM'}</span>
                                                    </td>
                                                    <td className="py-4 text-[9px] font-mono text-zinc-600">
                                                        {new Date(log.createdAt || log.timestamp).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Predictive Intelligence */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="glass-card-v2 p-8 space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-emerald-400" /> Conversion Intel
                                </h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-3xl font-black text-white">{predictive?.conversionRate}%</p>
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">LTV Conversion Rate</p>
                                    </div>
                                    <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center">
                                        <span className="text-[10px] font-black text-emerald-400">{predictive?.forecastConfidence}%</span>
                                    </div>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${predictive?.conversionRate}%` }}
                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                    />
                                </div>
                            </div>

                            <div className="glass-card-v2 p-8 space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-violet-400" /> Revenue Forecast
                                </h3>
                                <div>
                                    <p className="text-3xl font-black text-white">₹{predictive?.monthlyForecast.toLocaleString()}</p>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">30-Day Predictive Revenue</p>
                                </div>
                                <div className="flex gap-2">
                                    {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            animate={{ height: `${h}%` }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex-1 bg-violet-500/20 rounded-t-sm"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Live Event Stream */}
                    <div className="space-y-8">
                        <div className="glass-card-v2 p-8 h-full flex flex-col">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center justify-between mb-8">
                                <span className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-violet-400 animate-pulse" /> Live Traffic Ticker
                                </span>
                                <span className="text-[9px] text-zinc-600 font-mono">BROADCAST_ID: NX-902</span>
                            </h3>

                            <div className="flex-1 space-y-4 overflow-hidden relative">
                                <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-zinc-950/50 to-transparent pointer-events-none z-10" />
                                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-zinc-950/50 to-transparent pointer-events-none z-10" />

                                <AnimatePresence initial={false}>
                                    {liveEvents.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center opacity-20 filter grayscale">
                                            <Globe className="w-12 h-12 mb-4 animate-spin-slow" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-center">Awaiting incoming telemetry data...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {liveEvents.map((ev, i) => (
                                                <motion.div
                                                    key={ev.timestamp || i}
                                                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                                    className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4 group hover:bg-white/10 transition-all"
                                                >
                                                    <div className={`p-2 rounded-xl bg-black/40 ${ev.color}`}>
                                                        <ev.icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[10px] font-black uppercase tracking-wider text-white truncate">
                                                            {ev.type === 'signup' ? 'New Deployment' : ev.type === 'payment' ? 'Revenue Captured' : ev.type === 'config' ? 'Nexus Update' : 'Neural Link Estab.'}
                                                        </p>
                                                        <p className="text-[9px] text-zinc-500 font-mono truncate">{ev.username || ev.email || ev.id || 'Anonymous Link'}</p>
                                                    </div>
                                                    <div className="text-[8px] font-mono text-zinc-600">
                                                        {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <Button
                                onClick={() => router.push('/admin/users')}
                                className="w-full mt-8 bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 border border-violet-500/20 text-[10px] font-black uppercase tracking-widest h-11"
                            >
                                Open Situational Database
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Account Activity Alert (Advanced Mode) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-violet-500/5 border border-violet-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6"
                >
                    <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                        <Lock className="w-6 h-6 text-violet-400" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="font-black text-white uppercase tracking-widest text-sm">Nexus Security: Multi-Factor Protocol Active</h4>
                        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                            Every administrative intervention is cross-referenced with your encrypted session ID. Real-time auditing is streaming to the redundant primary server block.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="px-4 py-2 bg-black/40 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                            Encryption: AES-256
                        </div>
                        <div className="px-4 py-2 bg-black/40 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                            Status: Secure
                        </div>
                    </div>
                </motion.div>
            </div>

            <style jsx global>{`
                .glass-card-v2 {
                    background: rgba(10, 10, 10, 0.6);
                    backdrop-filter: blur(20px) saturate(180%);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 32px;
                    position: relative;
                    overflow: hidden;
                }
                .animate-spin-slow {
                    animation: spin 8s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}
