

"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trophy, Medal, User, Calendar, Award, CheckCircle2, Sparkles } from "lucide-react"
import IntervyxaCoin from "@/components/reward-system/IntervyxaCoin"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { BADGES } from "@/lib/badges"
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import MeshBackground from "../components/MeshBackground"
import HolographicHud from "@/components/ui/HolographicHud"
import TiltCard from "@/components/ui/TiltCard"
import { motion, AnimatePresence } from "framer-motion"

// Mapped icons for badges
const BADGE_ICONS: Record<string, any> = {
    'coin': IntervyxaCoin,
    'calendar': Calendar,
    'trophy': Trophy,
    'award': Award,
    'footprints': CheckCircle2,
    'code': User, // fallback
    'moon': User, // fallback
    'sun': User, // fallback
    'shield': User, // fallback
    'users': User, // fallback
    'briefcase': User // fallback
}

export default function LeaderboardPage() {
    const [user, setUser] = useState<any>(null)
    const [leaderboard, setLeaderboard] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState("all_time")

    useEffect(() => {
        const savedUser = localStorage.getItem("user")
        if (savedUser) {
            setUser(JSON.parse(savedUser))
        }
    }, [])

    useEffect(() => {
        setLoading(true)
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/gamification/leaderboard?period=${period}`)
            .then(res => res.json())
            .then(data => {
                setLeaderboard(data)
                setLoading(false)
            })
            .catch(err => {
                console.error("Error fetching leaderboard:", err)
                setLoading(false)
            })
    }, [period])

    const claimDaily = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/gamification/claim-daily`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            const data = await res.json()
            if (res.ok) {
                toast.success(`+100 Intervyxa Coins!`)
            } else {
                toast.error(data.message || "Failed to claim")
            }
        } catch (err) {
            toast.error("Error claiming reward")
        }
    }

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-white p-4 sm:p-6 md:p-10 relative overflow-hidden aurora-glow">
            <MeshBackground />
            <HolographicHud />
            {/* Floating ambient orbs */}
            <div className="absolute top-20 left-10 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
            <div className="absolute bottom-32 right-16 w-72 h-72 bg-amber-500/4 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />
            <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <DashboardHeader
                        title="Leaderboard"
                        subtitle="Compete with top engineers globally and track your ascent."
                        icon={<Trophy className="w-8 h-8 text-yellow-500" />}
                        breadcrumbs={[{ label: "Leaderboard" }]}
                    />
                    <Button onClick={claimDaily} className="bg-gradient-to-r from-yellow-500 via-amber-500 to-amber-600 hover:from-yellow-400 hover:via-amber-400 hover:to-amber-500 text-black font-black uppercase tracking-widest text-xs border-0 h-11 sm:h-12 w-full sm:w-auto shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] transition-all duration-300">
                        <Sparkles className="w-4 h-4 mr-2" /> Daily Check-in
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Left: Leaderboard */}
                    <div className="col-span-2">
                        <Tabs defaultValue="all_time" onValueChange={setPeriod} className="w-full">
                            <TabsList className="bg-white/60 dark:bg-zinc-900/50 border-white/[0.06] backdrop-blur-xl">
                                <TabsTrigger value="all_time" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-fuchsia-600 data-[state=active]:text-slate-900 dark:text-white">All Time</TabsTrigger>
                                <TabsTrigger value="weekly" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-fuchsia-600 data-[state=active]:text-slate-900 dark:text-white">This Week</TabsTrigger>
                            </TabsList>

                            <Card className="mt-4 bg-white dark:bg-zinc-900/40 border-white/[0.06] backdrop-blur-2xl">
                                <CardContent className="space-y-4 pt-6">
                                    {loading ? (
                                        <div className="text-center py-10 text-zinc-500 animate-pulse">Loading rankings...</div>
                                    ) : (
                                        leaderboard.map((u, index) => (
                                            <motion.div
                                                key={u._id || `leaderboard-${index}`}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <div className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:bg-zinc-800/50 relative overflow-hidden group ${index === 0 ? 'bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_25px_rgba(234,179,8,0.15)]' : index === 1 ? 'bg-zinc-400/5 border-zinc-500/20 shadow-[0_0_20px_rgba(161,161,170,0.08)]' : index === 2 ? 'bg-amber-700/5 border-amber-700/20 shadow-[0_0_20px_rgba(180,83,9,0.08)]' : 'bg-white dark:bg-black/50 border-slate-100 dark:border-white/5 hover:border-violet-500/15'}`}>
                                                    {/* Scanning Line for top ranks */}
                                                    {index < 3 && (
                                                        <motion.div
                                                            className="absolute top-0 left-0 w-1 h-full bg-violet-500/40 blur-sm"
                                                            animate={{ top: ["0%", "100%", "0%"] }}
                                                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                                        />
                                                    )}

                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold relative ${index === 0 ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' :
                                                            index === 1 ? 'bg-zinc-400 text-black' :
                                                                index === 2 ? 'bg-amber-700 text-slate-900 dark:text-white' : 'bg-zinc-800 text-zinc-500'
                                                            }`}>
                                                            {index + 1}
                                                            {index < 3 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-lg flex items-center gap-2">
                                                                <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">{u.username}</span>
                                                                {index === 0 && <Medal className="w-4 h-4 text-yellow-500" />}
                                                                {u.achievements?.length > 5 && <Award className="w-3 h-3 text-purple-500" />}
                                                            </div>
                                                            <div className="text-[10px] text-zinc-500 flex gap-2 font-black uppercase tracking-widest">
                                                                <span className="text-primary/70">Lvl {u.level || 1}</span>
                                                                <span>• {u.achievements?.length || 0} Badges</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center justify-end gap-1 font-mono text-xl font-bold text-yellow-500">
                                                            {(period === 'weekly' ? u.weeklyCoins || 0 : u.intervyxaCoins || 0).toLocaleString()}
                                                            <IntervyxaCoin size={16} animate={index < 3} glow={index === 0} />
                                                        </div>
                                                        {period === 'weekly' && <div className="text-[8px] text-zinc-600 uppercase tracking-[0.2em] font-black mt-1 text-right">Weekly Earnings</div>}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                    {!loading && leaderboard.length === 0 && (
                                        <div className="text-center py-10 text-zinc-500">No data available yet.</div>
                                    )}
                                </CardContent>
                            </Card>
                        </Tabs>
                    </div>

                    {/* Right: Your Stats & Badges */}
                    <div className="space-y-6">
                        <TiltCard className="bg-white dark:bg-zinc-900/40 border-slate-100 dark:border-white/5 bg-gradient-to-b from-violet-500/5 to-transparent backdrop-blur-2xl hover:border-violet-500/20 transition-all duration-500">
                            <CardHeader>
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Your Identity Matrix</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5 text-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Sparkles className="w-6 h-6 text-yellow-500 mx-auto mb-2 relative z-10" />
                                    <div className="text-2xl font-black relative z-10">{(user?.weeklyCoins || 0).toLocaleString()}</div>
                                    <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest relative z-10">Weekly Total</div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5 text-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <IntervyxaCoin size={24} className="mx-auto mb-2 relative z-10" animate />
                                    <div className="text-2xl font-black relative z-10">{(user?.intervyxaCoins || 0).toLocaleString()}</div>
                                    <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest relative z-10">Total Coins</div>
                                </div>
                            </CardContent>
                        </TiltCard>

                        <Card className="bg-white dark:bg-zinc-900/40 border-white/[0.06] backdrop-blur-2xl hover:border-violet-500/15 transition-all duration-500">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-purple-500" /> Your Badges
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-4 gap-2">
                                    {user?.achievements?.map((badge: any, i: number) => {
                                        const Icon = BADGE_ICONS[badge.icon] || Award
                                        return (
                                            <div key={badge.id || `badge-${i}`} className="aspect-square bg-white dark:bg-black/50 rounded-lg border border-white/[0.06] flex flex-col items-center justify-center p-2 group relative cursor-help hover:border-violet-500/20 hover:bg-violet-500/5 transition-all duration-300">
                                                <Icon className="w-6 h-6 text-violet-400 group-hover:text-fuchsia-400 transition-colors" />

                                                {/* Tooltip */}
                                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-32 bg-zinc-800 border border-zinc-700 p-2 rounded text-[10px] text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                    <div className="font-bold text-slate-900 dark:text-white mb-0.5">{badge.name}</div>
                                                    <div className="text-slate-500 dark:text-zinc-400">{badge.description}</div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {(!user?.achievements || user.achievements.length === 0) && (
                                        <div className="col-span-4 text-center text-xs text-zinc-500 py-4">
                                            No badges yet. Start practicing!
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div >
    )
}
