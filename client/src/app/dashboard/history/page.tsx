"use client"

import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { History, ArrowRight, Calendar, Trophy, TrendingUp, BarChart3, Sparkles } from "lucide-react"
import IntervyxaCoin from "@/components/reward-system/IntervyxaCoin"
import Link from "next/link"
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import MeshBackground from "../components/MeshBackground"
import HolographicHud from "@/components/ui/HolographicHud"

// ─── Quick Stats helpers ──────────────────────────────────────────────────────
function getScore(item: any): number {
    if (item.overallScore && item.overallScore > 0) return item.overallScore
    const t = item.scores?.technical || 0
    const c = item.scores?.communication || 0
    const f = item.scores?.focus || item.scores?.confidence || 0
    return Math.round((t + c + f) / 3)
}

function calcTotalCoins(history: any[]): number {
    return history.reduce((acc, curr) => acc + (curr.coinsGained || 0), 0)
}

function QuickStats({ history }: { history: any[] }) {
    const scores = history.map(getScore)
    const bestScore = scores.length ? Math.max(...scores) : 0
    const bestItem = history.find(r => getScore(r) === bestScore)
    const totalCoins = calcTotalCoins(history)
    const thisMonth = history.filter(r => {
        const d = new Date(r.createdAt)
        const now = new Date()
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

    const stats = [
        {
            icon: <Calendar className="w-5 h-5 text-violet-400" />,
            label: "This Month",
            value: `${thisMonth}`,
            sub: "sessions",
            color: "from-violet-500/20 to-violet-500/5",
            border: "border-violet-500/20"
        },
        {
            icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
            label: "Avg Score",
            value: `${avgScore}%`,
            sub: "overall",
            color: "from-emerald-500/20 to-emerald-500/5",
            border: "border-emerald-500/20"
        },
        {
            icon: <Trophy className="w-5 h-5 text-amber-400" />,
            label: "Best Score",
            value: `${bestScore}%`,
            sub: bestItem?.sector || "General",
            color: "from-amber-500/20 to-amber-500/5",
            border: "border-amber-500/20"
        },
        {
            icon: <IntervyxaCoin size={20} animate={false} />,
            label: "Coins Earned",
            value: `${totalCoins.toLocaleString()}`,
            sub: "from interviews",
            color: "from-yellow-500/20 to-yellow-500/5",
            border: "border-yellow-500/20"
        },
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {stats.map((s, i) => (
                <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                >
                    <Card className={`bg-gradient-to-br ${s.color} border ${s.border} overflow-hidden hover:shadow-[0_0_20px_rgba(139,92,246,0.05)] transition-all duration-300`}>
                        <CardContent className="p-4 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                {s.icon}
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">{s.label}</p>
                            </div>
                            <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{s.value}</p>
                            <p className="text-[11px] text-zinc-500 font-medium capitalize">{s.sub}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    )
}

export default function HistoryPage() {
    const [history, setHistory] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchHistory = async () => {
            const savedUser = localStorage.getItem("user")
            if (!savedUser) return
            const user = JSON.parse(savedUser)

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/reports/user/${user._id}`)
                const data = await res.json()
                if (Array.isArray(data)) {
                    setHistory(data.slice().reverse())
                }
            } catch (err) {
                console.error("Failed to fetch history", err)
            } finally {
                setLoading(false)
            }
        }
        fetchHistory()
    }, [])

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-white p-4 sm:p-6 md:p-10 relative overflow-hidden aurora-glow">
            <MeshBackground />
            <HolographicHud />

            {/* Floating ambient orbs */}
            <div className="absolute top-20 left-10 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
            <div className="absolute bottom-32 right-16 w-72 h-72 bg-cyan-500/4 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />
            <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 relative z-10">
                {/* Header */}
                <DashboardHeader
                    title="Interview History"
                    subtitle="Review your past performance and track your growth"
                    icon={<History className="w-8 h-8 text-violet-400" />}
                    breadcrumbs={[{ label: "History" }]}
                />

                {/* Quick Stats Strip */}
                {!loading && history.length > 0 && <QuickStats history={history} />}

                {/* History Cards */}
                <div className="grid gap-4 md:gap-6">
                    {loading ? (
                        <div className="text-center py-20 text-zinc-500">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            Loading history...
                        </div>
                    ) : history.length === 0 ? (
                        <Card className="bg-white/60 dark:bg-zinc-900/50 border-zinc-800">
                            <CardContent className="py-20 text-center">
                                <Calendar className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                                <p className="text-zinc-500 text-lg">No interview history found.</p>
                                <p className="text-zinc-600 text-sm mt-2">Complete your first interview to see it here!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        history.map((item: any, idx: number) => {
                            const score = getScore(item)
                            const scoreColor = score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-orange-500'
                            const readiness = item.readinessLevel
                            return (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                >
                                    <Card className="group hover:border-violet-500/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.06)] transition-all duration-300 bg-white/60 dark:bg-zinc-900/50 border-zinc-800 hover:bg-white dark:bg-zinc-900/80 hover-shine">
                                        <CardContent className="p-4 sm:p-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                {/* Left Section */}
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-violet-500/10 p-3 sm:p-4 rounded-xl shrink-0">
                                                        <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                                                            {item.sector || 'General'} Mock Interview
                                                        </h3>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="text-xs sm:text-sm text-zinc-500">
                                                                {new Date(item.createdAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric', month: 'short', day: 'numeric'
                                                                })}
                                                            </p>
                                                            {readiness && (
                                                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-zinc-700">
                                                                    {readiness}
                                                                </span>
                                                            )}
                                                            <IntervyxaCoin size={14} animate={false} />
                                                            <span className="text-yellow-500 font-bold">+{item.coinsGained}</span>
                                                            {item.targetCompany && (
                                                                <span className="text-[10px] font-bold text-violet-400/70">
                                                                    @ {item.targetCompany}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Section */}
                                                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8">
                                                    <div className="text-left sm:text-right hidden md:block">
                                                        <p className="text-xs uppercase text-zinc-500 font-bold">Focus</p>
                                                        <p className="font-medium text-sm text-slate-600 dark:text-zinc-300">{item.persona || 'General'}</p>
                                                    </div>

                                                    {/* Reward */}
                                                    <div className="text-left sm:text-right hidden sm:block">
                                                        <p className="text-xs uppercase text-zinc-500 font-bold">Reward</p>
                                                        <p className="font-bold text-sm text-yellow-500 flex items-center justify-end gap-1">
                                                            +{item.coinsGained || 0} <IntervyxaCoin size={14} animate={false} />
                                                        </p>
                                                    </div>

                                                    {/* Score */}
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-xs uppercase text-zinc-500 font-bold">Score</p>
                                                        <p className={`text-xl sm:text-2xl font-black ${scoreColor}`}>{score}%</p>
                                                    </div>

                                                    {/* View Button */}
                                                    <Link href={`/dashboard/report/${item._id}`} className="shrink-0">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-12 w-12 rounded-xl group-hover:translate-x-1 transition-transform hover:bg-violet-500/10"
                                                        >
                                                            <ArrowRight className="w-5 h-5 text-violet-400" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
