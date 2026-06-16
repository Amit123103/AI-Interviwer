"use client"

import React, { useEffect, useState, useMemo, useCallback } from "react"
import Logo from "@/components/ui/Logo"
import CareerGrowthHub from "./components/CareerGrowthHub"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Settings, LogOut, Play, History, Trophy, FileText, TrendingUp, Zap, Target, Code2, Search, Users, Building2, Sparkles, Brain, BookOpen, Award, Terminal, Video, Menu, X, PanelLeftClose, PanelLeft, PenTool, Coffee, Map, Mic, ChevronRight, Crown, Rocket, AudioWaveform, MessagesSquare } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import TiltCard from "@/components/ui/TiltCard"
import IntervyxaCoin from "@/components/reward-system/IntervyxaCoin"
import CoinRewardAnimation from "@/components/reward-system/CoinRewardAnimation"


const Shimmer = () => <div className="w-full h-full min-h-[100px] animate-pulse bg-zinc-100 rounded-3xl" />

// Dynamic loading heavy components with skeletons for perceived speed
const SuccessWall = dynamic(() => import("@/components/SuccessWall"), { ssr: false })
const GamificationPanel = dynamic(() => import("@/components/gamification/GamificationPanel"), { ssr: false, loading: () => <Shimmer /> })
const SarahBriefing = dynamic(() => import("./components/SarahBriefing"), { ssr: false, loading: () => <Shimmer /> })
const ActivityHeatmap = dynamic(() => import("./components/ActivityHeatmap"), { ssr: false, loading: () => <Shimmer /> })
const DailyGoals = dynamic(() => import("./components/DailyGoals"), { ssr: false, loading: () => <Shimmer /> })
const SkillRadar = dynamic(() => import("./components/SkillRadar"), { ssr: false, loading: () => <Shimmer /> })
const ReadinessGauge = dynamic(() => import("./components/ReadinessGauge"), { ssr: false, loading: () => <Shimmer /> })
const StudyTimer = dynamic(() => import("./components/StudyTimer"), { ssr: false, loading: () => <Shimmer /> })
const QuickTips = dynamic(() => import("./components/QuickTips"), { ssr: false, loading: () => <Shimmer /> })
const UpcomingSchedule = dynamic(() => import("./components/UpcomingSchedule"), { ssr: false, loading: () => <Shimmer /> })
const CommandPalette = dynamic(() => import("./components/CommandPalette"), { ssr: false })
const LiveStatsBar = dynamic(() => import("./components/LiveStatsBar"), { ssr: false, loading: () => <Shimmer /> })
const InterviewSimPreview = dynamic(() => import("./components/InterviewSimPreview"), { ssr: false, loading: () => <Shimmer /> })
const WeaknessRadar = dynamic(() => import("./components/WeaknessRadar"), { ssr: false, loading: () => <Shimmer /> })
const NotificationCenter = dynamic(() => import("./components/NotificationCenter"), { ssr: false })
const ActivityTimeline = dynamic(() => import("./components/ActivityTimeline"), { ssr: false, loading: () => <Shimmer /> })
const ResourcesVault = dynamic(() => import("./components/ResourcesVault"), { ssr: false, loading: () => <Shimmer /> })
const HiringPartners = dynamic(() => import("./components/HiringPartners"), { ssr: false })
const TopNavBar = dynamic(() => import("./components/TopNavBar"), { ssr: false, loading: () => <div className="h-16 w-full animate-pulse bg-white/5 rounded-2xl mb-8" /> })
const MeshBackground = dynamic(() => import("./components/MeshBackground"), { ssr: false })

// Recharts optimization with loaders
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false, loading: () => <div className="h-[300px] w-full bg-white/5 animate-pulse rounded-2xl" /> })
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false })
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false })

interface DashboardUser {
    _id?: string;
    username?: string;
    email?: string;
    intervyxaCoins?: number;
    level?: number;
    achievements?: Array<{ id: string; name: string; description: string }>;
}

interface DashboardStats {
    metrics?: {
        overallReadiness: number;
        interviewReadiness: number;
        codingProficiency: number;
        quizMastery: number;
        skillAlignment: number;
        confidenceScore: number;
    };
    stats?: {
        totalInterviews: number;
        totalCodingSessions: number;
        totalQuizzes: number;
        totalCodeLines: number;
    };
    recentActivities?: Array<{
        id: string;
        type: string;
        action: string;
        timestamp: string;
    }>;
    progressTrends?: Array<{
        date: string;
        score: number;
    }>;
    recentFeedback?: string[];
    progressData?: Array<{ technical: number; communication?: number }>;
}

interface NavItem {
    href: string;
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    bgGroup?: string;
    proOnly?: boolean;
    isNew?: boolean;
}

export default function DashboardPage() {
    const router = useRouter()
    const [user, setUser] = useState<DashboardUser | null>(null)
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [reports, setReports] = useState<any[]>([])
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true)

    // Reward animation state
    const [showReward, setShowReward] = useState(false)
    const [earnedAmount, setEarnedAmount] = useState(0)

    // UI Theme/Mood state
    const [uiMode, setUiMode] = useState<'professional' | 'technical' | 'creative'>('professional')


    useEffect(() => {
        const savedLayoutPrefs = localStorage.getItem('desktopSidebar');
        if (savedLayoutPrefs === 'closed') {
            setIsDesktopSidebarOpen(false);
        }
    }, [])

    const toggleDesktopSidebar = () => {
        setIsDesktopSidebarOpen(prev => {
            const newState = !prev;
            localStorage.setItem('desktopSidebar', newState ? 'open' : 'closed');
            return newState;
        })
    }

    useEffect(() => {
        const savedUser = localStorage.getItem("user")
        if (!savedUser) {
            router.push("/auth/login")
        } else {
            const userData = JSON.parse(savedUser)
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

            // Parallel Data Fetching
            const fetchData = async () => {
                try {
                    const token = userData.token || localStorage.getItem("token");
                    const headers = { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    };

                    const [gamificationRes, masteryRes, reportsRes] = await Promise.all([
                        fetch(`${apiUrl}/api/gamification/sync`, {
                            method: 'POST',
                            headers,
                            body: JSON.stringify({ userId: userData._id, action: 'SYNC' })
                        }),
                        fetch(`${apiUrl}/api/performance/mastery/${userData._id}`, { headers }),
                        fetch(`${apiUrl}/api/reports/user/${userData._id}`, { headers })
                    ])

                    const [gamificationData, masteryData, reportsData] = await Promise.all([
                        gamificationRes.json().catch(() => ({})),
                        masteryRes.json().catch(() => null),
                        reportsRes.json().catch(() => ({ reports: [] }))
                    ])

                    setStats(masteryData)

                    // Sync and update user
                    const updatedUser = { ...userData, ...gamificationData, ...masteryData }

                    // Check for reward trigger
                    const oldCoins = userData.intervyxaCoins || 0;
                    const newCoins = updatedUser.intervyxaCoins || 0;
                    if (newCoins > oldCoins) {
                        setEarnedAmount(newCoins - oldCoins);
                        setShowReward(true);
                    }

                    setUser(updatedUser)
                    localStorage.setItem("user", JSON.stringify(updatedUser))

                    // Update stats and reports
                    if (masteryData) setStats(masteryData)
                    if (reportsData.reports) {
                        setReports(reportsData.reports.reverse().slice(0, 3))
                    } else if (Array.isArray(reportsData)) {
                        setReports(reportsData.reverse().slice(0, 3))
                    }
                } catch (err) {
                    console.warn("Expected dashboard fetch failure (backend offline):", err)
                    setUser(userData) // Fallback to saved user
                }
            }

            fetchData()
        }
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem("user")
        router.push("/auth/login")
    }

    if (!user) return null

    return (
        <div className="flex h-screen text-zinc-900 dark:text-zinc-100 relative font-sans selection:bg-indigo-500/30 transition-colors duration-500 overflow-hidden">
            <MeshBackground variant={uiMode} />
            <CommandPalette />

            <CoinRewardAnimation
                isVisible={showReward}
                onComplete={() => setShowReward(false)}
                coinsEarned={earnedAmount}
            />

            {/* Mobile Top Bar */}
            <div className={`md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between px-4 transition-colors`}>
                <Link href="/dashboard" className="flex items-center">
                    <Logo size={32} showStatus />
                </Link>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-10 h-10 flex md:hidden items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-slate-900 dark:text-zinc-200 transition-colors">
                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Desktop Top Bar (Visible when sidebar is closed) */}
            <AnimatePresence>
                {!isDesktopSidebarOpen && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-white/10 items-center justify-between px-6 shadow-sm transition-colors"
                    >
                        <Link href="/dashboard" className="flex items-center group">
                            <Logo size={36} showStatus showText />
                        </Link>
                        <Button variant="ghost" size="icon" onClick={toggleDesktopSidebar} className="text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-slate-900 dark:text-zinc-100 transition-colors h-10 w-10">
                            <PanelLeft className="w-5 h-5" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-white dark:bg-black/60 z-30 md:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-white/10 z-40 flex flex-col md:hidden overflow-y-auto custom-scrollbar shadow-lg transition-colors"
                        >
                            <div className="p-6 pt-8">
                                <Link href="/dashboard" className="flex items-center" onClick={() => setSidebarOpen(false)}>
                                    <Logo size={36} showText showStatus />
                                </Link>
                            </div>
                            <nav className="flex-1 px-4 space-y-1 mt-2">
                                {[
                                    { href: "/dashboard", icon: <User className="w-4 h-4 text-slate-900 dark:text-white" />, label: "Dashboard", bg: "bg-gradient-to-br from-indigo-500 to-teal-500", active: true },
                                    { href: "/dashboard/cv-builder", icon: <FileText className="w-4 h-4 text-cyan-400" />, label: "CV Builder", bg: "bg-cyan-500/10" },
                                    { href: "/dashboard/portfolio-builder", icon: <Sparkles className="w-4 h-4 text-purple-400" />, label: "Portfolio Builder", bg: "bg-purple-500/10" },
                                    { href: "/dashboard/roadmap", icon: <Map className="w-4 h-4 text-amber-500" />, label: "Career Roadmap", bg: "bg-amber-500/10" },
                                    { href: "/dashboard/feynman", icon: <Brain className="w-4 h-4 text-blue-400" />, label: "Feynman Explainer", bg: "bg-blue-500/10" },
                                    { href: "/dashboard/resume", icon: <FileText className="w-4 h-4 text-emerald-400" />, label: "Resume Optimizer", bg: "bg-emerald-500/10" },
                                    { href: "/dashboard/code", icon: <Code2 className="w-4 h-4 text-purple-400" />, label: "Coding Hub", bg: "bg-purple-500/10" },
                                    { href: "/dashboard/technical/details", icon: <Terminal className="w-4 h-4 text-blue-400" />, label: "Round Prep", bg: "bg-blue-500/10" },
                                    { href: "/dashboard/advanced-notes", icon: <PenTool className="w-4 h-4 text-rose-400" />, label: "Advanced Notes", bg: "bg-rose-500/10" },
                                    { href: "/dashboard/project-builder", icon: <Rocket className="w-4 h-4 text-indigo-400" />, label: "Coding with Projects", bg: "bg-indigo-500/10" },
                                    { href: "/dashboard/quiz", icon: <Users className="w-4 h-4 text-fuchsia-400" />, label: "Peer to Peer Quiz", bg: "bg-fuchsia-500/10" },
                                    { href: "/dashboard/enhance-skill-interview", icon: <AudioWaveform className="w-4 h-4 text-violet-400" />, label: "Enhance Skill Interview", bg: "bg-violet-500/10" },
                                    { href: "/dashboard/group-discussion", icon: <MessagesSquare className="w-4 h-4 text-emerald-400" />, label: "Group Discussion", bg: "bg-emerald-500/10" },
                                    { href: "/dashboard/pomodoro", icon: <Coffee className="w-4 h-4 text-orange-400" />, label: "Pomodoro Hub", bg: "bg-orange-500/10" },
                                    { href: "/dashboard/history", icon: <History className="w-4 h-4 text-emerald-400" />, label: "Vault", bg: "bg-emerald-500/10" },
                                    { href: "/dashboard/leaderboard", icon: <Trophy className="w-4 h-4 text-yellow-400" />, label: "Global Rank", bg: "bg-yellow-500/10" },
                                    { href: "/dashboard/hackathons-events", icon: <Trophy className="w-4 h-4 text-amber-400" />, label: "Hackathons & Events", bg: "bg-amber-500/10" },
                                    { href: "/dashboard/hackathon-participate", icon: <Trophy className="w-4 h-4 text-violet-400" />, label: "Participate in Hackathon", bg: "bg-violet-500/10" },
                                ]
                                    .map(item => (
                                        <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${item.active ? 'bg-gradient-to-r from-indigo-500/15 to-teal-500/10 border border-indigo-500/20 text-slate-900 dark:text-white font-semibold shadow-lg' : 'text-slate-500 dark:text-zinc-400 hover:bg-white/5 hover:text-slate-900 dark:text-white'}`}>
                                            <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center shadow-inner`}>{item.icon}</div>
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </Link>
                                    ))}
                            </nav>
                            <div className="p-4 border-t border-slate-100 dark:border-white/5 font-medium">
                                <Button variant="ghost" className="w-full h-12 justify-start gap-3 text-zinc-500 hover:text-slate-900 dark:text-white hover:bg-white/5 rounded-xl px-4" onClick={() => { handleLogout(); setSidebarOpen(false); }}>
                                    <LogOut className="w-5 h-5" />
                                    <span>Logout</span>
                                </Button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={{
                    width: isDesktopSidebarOpen ? 256 : 0,
                    opacity: isDesktopSidebarOpen ? 1 : 0
                }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className={`shrink-0 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 hidden md:flex flex-col h-full z-20 overflow-x-hidden transition-colors ${isDesktopSidebarOpen ? 'border-r shadow-sm' : 'border-none overflow-y-hidden pointer-events-none'}`}
            >
                <div className="w-64 flex flex-col h-full overflow-y-auto custom-scrollbar">
                    <div className="p-6 pb-2 flex items-center justify-between">
                        <Link href="/dashboard" className="flex items-center group">
                            <Logo size={36} showText showStatus />
                        </Link>
                        <Button variant="ghost" size="icon" onClick={toggleDesktopSidebar} className="text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-slate-900 dark:text-zinc-100 h-8 w-8 shrink-0 transition-colors">
                            <PanelLeftClose className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* User Profile Card */}
                    <div className="mx-4 mb-6 mt-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 relative overflow-visible group/profile shadow-sm transition-colors">
                        <div className="flex items-center gap-3 mb-3 relative z-10 min-h-[44px]">
                            <div className="relative w-10 h-10 shrink-0 rounded-xl overflow-hidden bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center shadow-inner">
                                <User className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div className="min-w-0 flex-1 py-1">
                                <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate tracking-tight pb-1">{user?.username || 'Candidate'}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                        <>
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            <span className="text-[10px] text-emerald-400/80">Free Plan</span>
                                        </>
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium relative z-10">Welcome back! Keep up the momentum.</p>
                    </div>



                    <nav className="flex-1 px-4 space-y-1">
                        {[
                            { href: "/dashboard", icon: <User className="w-4 h-4 text-slate-900 dark:text-white" />, label: "Dashboard", active: true },
                            { href: "/dashboard/fresher-zone", icon: <Sparkles className="w-4 h-4 text-emerald-400" />, label: "🎉 Fresher Zone", bgGroup: "bg-emerald-500", isNew: true },
                            { href: "/dashboard/cv-builder", icon: <FileText className="w-4 h-4 text-cyan-400" />, label: "CV Builder", bgGroup: "bg-cyan-500", proOnly: true },
                            { href: "/dashboard/portfolio-builder", icon: <Sparkles className="w-4 h-4 text-purple-400" />, label: "Portfolio", bgGroup: "bg-purple-500", proOnly: true },
                            { href: "/dashboard/roadmap", icon: <Map className="w-4 h-4 text-amber-500" />, label: "Roadmap", bgGroup: "bg-amber-500" },
                            { href: "/dashboard/feynman", icon: <Brain className="w-4 h-4 text-blue-400" />, label: "Explainer", bgGroup: "bg-blue-500" },
                            { href: "/dashboard/resume", icon: <Target className="w-4 h-4 text-emerald-400" />, label: "Optimizer", bgGroup: "bg-emerald-500", proOnly: true },
                            { href: "/dashboard/code", icon: <Terminal className="w-4 h-4 text-blue-400" />, label: "Coding Hub", bgGroup: "bg-blue-500" },
                            { href: "/dashboard/technical/details", icon: <Brain className="w-4 h-4 text-purple-400" />, label: "Round Prep", bgGroup: "bg-purple-500" },
                            { href: "/dashboard/advanced-notes", icon: <PenTool className="w-4 h-4 text-rose-400" />, label: "Advanced Notes", bgGroup: "bg-rose-500", proOnly: true },
                            { href: "/dashboard/project-builder", icon: <Rocket className="w-4 h-4 text-indigo-400" />, label: "Build Projects", bgGroup: "bg-indigo-500", isNew: true },
                            { href: "/dashboard/quiz", icon: <Users className="w-4 h-4 text-fuchsia-400" />, label: "Peer to Peer Quiz", bgGroup: "bg-fuchsia-500" },
                            { href: "/dashboard/enhance-skill-interview", icon: <AudioWaveform className="w-4 h-4 text-violet-400" />, label: "Enhance Skills", bgGroup: "bg-violet-500", isNew: true },
                            { href: "/dashboard/group-discussion", icon: <MessagesSquare className="w-4 h-4 text-emerald-400" />, label: "Group Discussion", bgGroup: "bg-emerald-500", isNew: true },
                            { href: "/dashboard/pomodoro", icon: <Coffee className="w-4 h-4 text-orange-400" />, label: "Pomodoro Hub", bgGroup: "bg-orange-500" },
                            { href: "/dashboard/leaderboard", icon: <Trophy className="w-4 h-4 text-amber-400" />, label: "Leaderboard", bgGroup: "bg-amber-500" },
                            { href: "/dashboard/hackathons-events", icon: <Trophy className="w-4 h-4 text-amber-400" />, label: "Events Hub", bgGroup: "bg-amber-500" },
                            { href: "/dashboard/hackathon-participate", icon: <Trophy className="w-4 h-4 text-violet-400" />, label: "Participate in Hackathon", bgGroup: "bg-violet-500" },
                        ]
                            .map((item: NavItem) => (
                                item.active ? (
                                    <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 transition-all font-semibold group">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">{item.icon}</div>
                                        <span className="text-sm flex-1">{item.label}</span>
                                    </Link>
                                ) : (
                                    <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-slate-900 dark:text-zinc-100 group">
                                        <div className={`w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 flex items-center justify-center group-hover:border-zinc-300 dark:group-hover:border-white/20 transition-all`}>{item.icon}</div>
                                        <span className="text-sm font-medium flex-1">{item.label}</span>
                                    </Link>
                                )
                            ))}
                    </nav>

                    <div className="p-4 border-t border-slate-100 dark:border-white/5 space-y-4">
                        {/* Intervyxa Coins Progress */}
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2 shadow-inner">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</span>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-500">
                                    <span>{(user?.intervyxaCoins || 0).toLocaleString()}</span>
                                    <IntervyxaCoin size={12} animate={false} glow={false} />
                                </div>
                            </div>
                            <div className="h-1.5 bg-white dark:bg-zinc-950 rounded-full overflow-hidden border border-slate-100 dark:border-white/5">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(((user?.intervyxaCoins || 0) / ((user?.level || 1) * 2000)) * 100, 100)}%` }}
                                    transition={{ duration: 1.5, ease: "circOut" }}
                                />
                            </div>
                            <p className="text-[9px] text-zinc-600 font-medium">Rank {user?.level || 1} • Champion</p>
                        </div>

                        <div className="flex items-center gap-3 px-3">
                            <NotificationCenter position="bottom-left" />
                            <div className="h-6 w-[1px] bg-white/10" />
                            <button
                                onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                                className="flex-1 h-10 flex items-center gap-3 px-3 rounded-xl bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white/10 transition-all text-left shadow-inner group/cmd"
                            >
                                <Search className="w-4 h-4 text-zinc-500 group-hover/cmd:text-primary transition-colors" />
                                <span className="text-[10px] text-zinc-500 flex-1">Vault Search</span>
                                <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 text-[9px] font-black text-zinc-600">⌘K</kbd>
                            </button>
                        </div>

                        <Button variant="ghost" className="w-full h-12 justify-start gap-3 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-slate-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl px-4 transition-colors" onClick={handleLogout}>
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </Button>
                    </div>
                </div>
            </motion.aside>

            {/* Main Architectural Hub */}
            <main className="flex-1 min-w-0 h-full overflow-y-auto custom-scrollbar transition-all duration-500 bg-transparent relative scroll-smooth">
                <div className="max-w-[1700px] mx-auto px-8 md:px-16 py-8 md:py-12 space-y-12 md:space-y-16 pb-32">

                    {/* Dynamic Intelligent Navigation */}
                    <TopNavBar mood={uiMode} setMood={setUiMode} />

                    {/* Operational Core: Strategic HUD */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <SarahBriefing user={user} stats={stats} mood={uiMode} />
                    </motion.div>

                    {/* Primary Dashboard Actions */}
                    <motion.section
                        id="dashboard-actions"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                                    Quick Actions
                                </h2>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Everything you need to master your next interview</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Main Interview Card */}
                            <Link href="/dashboard/interview/setup" className="col-span-1 md:col-span-2">
                                <Card className="group border-zinc-200 shadow-sm hover:shadow-md transition-all h-full bg-indigo-600 border-none overflow-hidden relative">
                                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -z-0" />
                                    <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-slate-900 dark:text-white mb-8 group-hover:scale-105 transition-transform">
                                            <Play className="w-6 h-6 fill-current" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">Start Mock Interview</h3>
                                            <p className="text-sm text-indigo-100">Practice with our advanced AI interviewer across 50+ roles.</p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>

                            <Link href="/dashboard/code">
                                <Card className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-md transition-all h-full flex flex-col">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-105 transition-transform">
                                        <Code2 className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Coding Hub</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">DSA practice with intelligent AI hints.</p>
                                </Card>
                            </Link>

                            <Link href="/instant-interview">
                                <Card className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-md transition-all h-full flex flex-col relative">
                                    <span className="absolute top-4 right-4 text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">New</span>
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4 group-hover:scale-105 transition-transform">
                                        <Video className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Instant Session</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Jump right into voice interviews.</p>
                                </Card>
                            </Link>

                            <Link href="/coding-round/setup">
                                <Card className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-md transition-all h-full flex flex-col">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-105 transition-transform">
                                        <Terminal className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Coding Round</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">AI-proctored challenges.</p>
                                </Card>
                            </Link>

                            <Link href="/dashboard/enhance-skill-interview">
                                <Card className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-md transition-all h-full flex flex-col relative">
                                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 mb-4 group-hover:scale-105 transition-transform">
                                        <AudioWaveform className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Skill Building</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">54 AI-powered targeted practice modes.</p>
                                </Card>
                            </Link>

                            <Link href="/dashboard/group-discussion">
                                <Card className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-md transition-all h-full flex flex-col">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-105 transition-transform">
                                        <MessagesSquare className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Group Disc.</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Interactive group discussions.</p>
                                </Card>
                            </Link>

                            <Link href="/dashboard/advanced-notes">
                                <Card className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-md transition-all h-full flex flex-col">
                                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 mb-4 group-hover:scale-105 transition-transform">
                                        <PenTool className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Smart Notes</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">AI notes with hand gesture control.</p>
                                </Card>
                            </Link>
                        </div>
                    </motion.section>

                    {/* New Features Section */}
                    <motion.section
                        id="new-features"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-teal-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">
                                    <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">New</span> Features
                                </h2>
                                <p className="text-xs text-zinc-500">Explore what&apos;s new</p>
                            </div>
                            <div className="flex-1 h-[1px] bg-gradient-to-r from-teal-500/15 to-transparent" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                <Link href="/dashboard/video-cv">
                                    <Card className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-md transition-all h-full flex flex-col">
                                        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 mb-4 group-hover:scale-105 transition-transform">
                                            <Video className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Video CV</h3>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Create & manage professional video resume.</p>
                                    </Card>
                                </Link>
                            <Link href="/dashboard/templates">
                                <Card className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-md transition-all h-full flex flex-col">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-105 transition-transform">
                                        <Search className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Find Templates</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Job-role specific interview templates.</p>
                                </Card>
                            </Link>
                            <Link href="/dashboard/practice">
                                <Card className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-md transition-all h-full flex flex-col">
                                    <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 mb-4 group-hover:scale-105 transition-transform">
                                        <Brain className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Practice Mode</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Adaptive roleplay scenarios.</p>
                                </Card>
                            </Link>
                            <Link href="/dashboard/questions">
                                <Card className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-md transition-all h-full flex flex-col">
                                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 mb-4 group-hover:scale-105 transition-transform">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Question Bank</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">1000+ curated tech questions.</p>
                                </Card>
                            </Link>
                            <Link href="/dashboard/companies">
                                <Card className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-md transition-all h-full flex flex-col">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-105 transition-transform">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Company Prep</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Tailored preparation for FAANG.</p>
                                </Card>
                            </Link>
                            <Link href="/dashboard/feedback">
                                <Card className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-md transition-all h-full flex flex-col">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 mb-4 group-hover:scale-105 transition-transform">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Peer Feedback</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Get review from community.</p>
                                </Card>
                            </Link>
                        </div>
                    </motion.section>

                    {/* NEW CAREER GROWTH HUB */}
                    <motion.section
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <CareerGrowthHub />
                    </motion.section>

                    {/* VIDEO PRESENTATION STUDIO */}
                    <motion.section
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <Link href="/dashboard/presentation">
                            <Card className="group bg-white border border-zinc-200 p-6 hover:shadow-md hover:border-cyan-200 transition-all flex flex-col md:flex-row items-center gap-6 cursor-pointer mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-cyan-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <Mic className="w-8 h-8 text-cyan-600" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-xl font-semibold text-zinc-900 mb-1">Video Presentation Studio</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Record solo or collaborate live with teammates in real-time presentations</p>
                                </div>
                                <div className="hidden md:flex text-slate-500 dark:text-zinc-400 group-hover:text-cyan-600 transition-colors">
                                    <ChevronRight className="w-6 h-6" />
                                </div>
                            </Card>
                        </Link>
                    </motion.section>

                    {/* Hackathons Section */}
                    <motion.section
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link href="/dashboard/hackathons-events">
                                <Card className="group bg-white border border-zinc-200 p-6 hover:shadow-md hover:border-amber-200 transition-all h-full cursor-pointer">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">🏆</div>
                                        <h3 className="text-lg font-semibold text-zinc-900">Events Organizer</h3>
                                    </div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage & register for college events</p>
                                </Card>
                            </Link>

                            <Link href="/dashboard/hackathon-participate">
                                <Card className="group bg-white border border-zinc-200 p-6 hover:shadow-md hover:border-violet-200 transition-all h-full cursor-pointer">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                                            <Trophy className="w-6 h-6 text-violet-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-zinc-900">Join Hackathons</h3>
                                    </div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Submit solutions & collaborate</p>
                                </Card>
                            </Link>
                        </div>
                    </motion.section>

                    {/* Collaboration Section - Connect & Practice */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-4 mb-10"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center"><Users className="w-4 h-4 text-indigo-600" /></div>
                            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Connect & Practice Together</h2>
                        </div>
                        <p className="text-zinc-500 text-sm mb-4">
                            Join peer-to-peer rooms for mock interviews, collaborative coding, and system design discussions.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Link href="/dashboard/collaboration/new">
                                    <Card className="group relative overflow-hidden rounded-2xl bg-white border border-indigo-100 shadow-sm p-8 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer h-full">
                                        <div className="relative z-10">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-all">
                                                    <Video className="w-5 h-5" />
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold mb-2 text-zinc-900">Create Room</h3>
                                            <p className="text-sm text-zinc-500 mb-6 leading-relaxed">Start a real-time collaborative session format.</p>
                                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-slate-900 dark:text-white font-semibold rounded-xl h-11 text-sm transition-all border-none shadow-none">Go Live</Button>
                                        </div>
                                    </Card>
                                </Link>
                                <Link href="/dashboard/collaboration/join">
                                    <Card className="group relative overflow-hidden rounded-2xl bg-white border border-zinc-200 shadow-sm p-8 hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer h-full">
                                        <div className="relative z-10">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-600 group-hover:scale-105 transition-all">
                                                    <Users className="w-5 h-5" />
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold mb-2 text-zinc-900">Join Peer</h3>
                                            <p className="text-sm text-zinc-500 mb-6 leading-relaxed">Have an invite ID? Enter it here to join.</p>
                                            <Button variant="outline" className="w-full border-zinc-200 bg-transparent hover:bg-zinc-50 text-zinc-700 rounded-xl h-11 font-semibold text-sm shadow-none">Join Now</Button>
                                        </div>
                                    </Card>
                                </Link>
                        </div>
                    </motion.section>

                    {/* ── Section Divider ──────────────── */}
                    <div className="section-divider" />

                    {/* Interview Simulator Preview */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <InterviewSimPreview />
                    </motion.section>

                    {/* ── Section Divider ──────────────── */}
                    <div className="section-divider" />


                    {/* Schedule & Quick Tips Grid */}
                    <div id="upcoming" className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <UpcomingSchedule />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <QuickTips />
                        </motion.div>
                    </div>


                    {/* Option Cards - Quick Navigation */}
                    <motion.div
                        id="reports"
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.6 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12"
                    >
                        <Link href="/dashboard/history">
                            <Card className="group bg-white border border-zinc-200 p-6 hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer h-full">
                                <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-600 mb-4 group-hover:scale-105 transition-all">
                                    <History className="w-5 h-5" />
                                </div>
                                <h3 className="text-base font-semibold mb-1 text-zinc-900">Interview Reports</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">View detailed analysis and feedback from past sessions.</p>
                            </Card>
                        </Link>

                        <Link href="/dashboard/analytics">
                            <Card className="group bg-white border border-zinc-200 p-6 hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer h-full">
                                <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-600 mb-4 group-hover:scale-105 transition-all">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <h3 className="text-base font-semibold mb-1 text-zinc-900">Progress Tracker</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Track your improvement over time with detailed metrics.</p>
                            </Card>
                        </Link>

                        <Link href="/dashboard/analytics">
                            <Card className="group bg-white border border-zinc-200 p-6 hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer h-full">
                                <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-600 mb-4 group-hover:scale-105 transition-all">
                                    <Target className="w-5 h-5" />
                                </div>
                                <h3 className="text-base font-semibold mb-1 text-zinc-900">Performance Insights</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">AI-powered feedback and personalized recommendations for you.</p>
                            </Card>
                        </Link>
                    </motion.div>

                    {/* ── Section Divider ──────────────── */}
                    <div className="section-divider" />

                    {/* Operational Metrics Segment */}
                    <div id="performance" className="space-y-12">
                        <div className="flex items-center gap-8">
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-zinc-500">System Performance</span>
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                        </div>

                        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
                            <div className="lg:col-span-4 flex">
                                <div className="w-full bg-gradient-to-br from-indigo-500/10 to-teal-500/5 rounded-3xl p-8 border border-slate-100 dark:border-white/5 flex flex-col justify-center items-center text-center">
                                    <IntervyxaCoin size={80} glow animate />
                                    <h3 className="text-xl font-black mt-4 text-slate-900 dark:text-white">Elite Rewards</h3>
                                    <p className="text-sm text-zinc-500 mt-2">Earn Intervyxa Coins to unlock premium mentorship</p>
                                </div>
                            </div>
                            <div className="lg:col-span-8 flex">
                                <DailyGoals />
                            </div>
                        </div>
                    </div>

                    {/* Real-time Metric Hud */}
                    <LiveStatsBar user={user} stats={stats} />

                    {/* Strategic Alignment Sections */}
                    <div id="hiring" className="bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl">
                        <HiringPartners />
                    </div>

                    {/* Readiness, Skills, Focus & Weakness Grid */}
                    <div id="skills" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        <ReadinessGauge />
                        <SkillRadar />
                        <StudyTimer />
                        <WeaknessRadar />
                    </div>

                    {/* System Gamification Matrix */}
                    <div className="bg-white dark:bg-zinc-950/50 border border-slate-100 dark:border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl">
                        <GamificationPanel user={user} />
                    </div>

                    {/* Recent Activity */}
                    <motion.div
                        id="activity"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {user?._id && <ActivityTimeline userId={user._id as string} activities={stats?.recentActivities || []} />}
                    </motion.div>

                    {/* Performance & Activity Grid */}
                    <motion.div
                        id="growth"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div id="recent" className="lg:col-span-2 space-y-6">
                            <Card className="bg-white border border-zinc-200 p-6 space-y-6 rounded-2xl relative overflow-hidden group shadow-sm flex flex-col h-full">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10 block">
                                    <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900">
                                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-indigo-600" /></div>
                                        <span>Performance</span> <span className="text-zinc-500 font-medium">& Growth</span>
                                    </h2>
                                    <div className="flex gap-4 text-[10px] text-zinc-600 font-medium">
                                        <span className="flex items-center gap-2 text-indigo-600"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Actual</span>
                                        <span className="flex items-center gap-2 text-zinc-500"><div className="w-2 h-2 rounded-full border border-dashed border-zinc-400" /> Projected</span>
                                    </div>
                                </div>
                                <div className="h-[350px] w-full mt-6">
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                        <AreaChart data={stats?.progressTrends || []}>
                                                <defs>
                                                    <linearGradient id="colorTech" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" strokeOpacity={0.5} />
                                                <XAxis dataKey="date" stroke="#71717A" fontSize={10} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#71717A" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #E4E4E7', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                                    itemStyle={{ fontWeight: '600', fontSize: '11px', color: '#18181b' }}
                                                />
                                                <Area type="monotone" dataKey="technical" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTech)" />
                                                <Area type="monotone" dataKey="communication" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorComm)" />

                                                {/* Predictive Line — deterministic offset to avoid re-renders */}
                                                <Area
                                                    type="monotone"
                                                    dataKey={(d: { technical: number }) => (d.technical || 0) + (((d.technical || 0) % 5) + 2)}
                                                    stroke="#555"
                                                    strokeWidth={2}
                                                    strokeDasharray="5 5"
                                                    fill="none"
                                                    name="Projected"
                                                />
                                            </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            <ActivityHeatmap data={[]} />
                        </div>

                        <Card className="bg-white border border-zinc-200 p-6 flex flex-col rounded-2xl shadow-sm h-full">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-zinc-900">
                                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center"><Zap className="w-4 h-4 text-amber-600" /></div>
                                <span>Smart Insights</span>
                            </h2>
                            <div className="space-y-4 flex-1 overflow-auto pr-2 custom-scrollbar">
                                {(stats?.recentFeedback?.length ?? 0) > 0 ? (
                                    stats?.recentFeedback?.map((tip: string, i: number) => (
                                        <div key={`feedback-${i}-${tip.slice(0, 10)}`} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-white/10 group transition-colors">
                                            <p className="text-sm text-zinc-700 leading-relaxed">&quot;{tip}&quot;</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-zinc-500 text-sm mt-10">
                                        No sufficient data yet. Complete more interviews to unlock insights.
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>

                    {/* Achievements Section */}
                    <motion.div
                        id="achievements"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="bg-white border border-zinc-200 p-10 rounded-2xl relative overflow-hidden group shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold flex items-center gap-3 text-zinc-900">
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><Trophy className="w-6 h-6 text-amber-600" /></div>
                                        <span>Achievements</span>
                                    </h2>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Milestones you&apos;ve reached</p>
                                </div>

                                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-4 rounded-xl flex items-center gap-6 min-w-[300px]">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-zinc-600 font-medium">Next milestone</span>
                                            <span className="text-amber-600 font-bold">75%</span>
                                        </div>
                                        <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-amber-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: "75%" }}
                                                transition={{ duration: 2 }}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-amber-500 shadow-sm">
                                        <Award className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {user?.achievements && user?.achievements?.length > 0 ? (
                                    user?.achievements?.slice(0, 4).map((achievement: { id: string, name: string, description: string }) => (
                                        <div key={achievement.id} className="relative group/item aspect-square rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 flex flex-col items-center justify-center p-6 transition-all duration-300 hover:shadow-md hover:border-zinc-300 dark:hover:border-white/20">
                                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-amber-500 mb-4 shadow-sm border border-zinc-100 group-hover/item:scale-105 transition-all">
                                                <Award className="w-8 h-8" />
                                            </div>
                                            <div className="text-center">
                                                <div className="font-semibold text-zinc-900 mb-1">{achievement.name}</div>
                                                <div className="text-xs text-zinc-500">{achievement.description}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <div key={`achievement-skeleton-${i}`} className="relative aspect-square rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-white/10 flex flex-col items-center justify-center p-6 opacity-60">
                                            <div className="w-14 h-14 rounded-full border border-dashed border-zinc-300 flex items-center justify-center text-slate-500 dark:text-zinc-400 mb-4">
                                                <Trophy className="w-5 h-5 opacity-50" />
                                            </div>
                                            <div className="text-center space-y-2">
                                                <div className="w-20 h-2 bg-zinc-200 rounded-full mx-auto" />
                                                <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto" />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </motion.div>

                    {/* Recent Sessions */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <section className="space-y-6 pt-12">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold flex items-center gap-2 text-zinc-900">Recent Sessions</h2>
                                <Link href="/dashboard/history" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">View All</Link>
                            </div>
                            <div className="grid gap-4">
                                {reports.length === 0 ? (
                                    <Card className="p-12 text-center text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 border-dashed border-zinc-200 dark:border-white/10 rounded-xl">
                                        No recent interview sessions found.
                                    </Card>
                                ) : (
                                    reports.map((report, i) => (
                                        <Card key={report._id || `report-${i}`} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-md transition-all duration-300 rounded-2xl gap-4">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                                                    <Target className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <h3 className="font-semibold text-lg text-zinc-900">{report.sector || 'General'} Interview</h3>
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            <span className="text-[10px] text-emerald-700 font-medium tracking-wide border-0 py-0">Verified</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{new Date(report.createdAt).toLocaleDateString()} • {report.persona}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 sm:gap-10">
                                                <div className="text-center">
                                                    <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Score</div>
                                                    <div className="font-bold text-2xl text-zinc-900">
                                                        {Math.round(((report.scores?.technical || 0) + (report.scores?.communication || 0) + (report.scores?.focus || 0)) / 3)}<span className="text-xs text-slate-500 dark:text-zinc-400 font-medium ml-0.5">%</span>
                                                    </div>
                                                </div>
                                                <Link href={`/dashboard/report/${report._id}`}>
                                                    <Button className="bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-white/10 rounded-xl px-6 font-medium text-sm transition-all shadow-sm">
                                                        View Report
                                                    </Button>
                                                </Link>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </section>
                    </motion.div>
                </div>
            </main>
        </div>
    )
}
