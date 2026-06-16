"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, ChevronRight, Trophy, Target, Calendar, Star, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { interviewTypes, difficultyConfig } from "@/lib/interviewTypes"
import dynamic from "next/dynamic"

const SkillRadarChart = dynamic(() => import("../components/SkillRadarChart"), { ssr: false })
const GamificationBar = dynamic(() => import("../components/GamificationBar"), { ssr: false })
const LeaderboardPanel = dynamic(() => import("../components/LeaderboardPanel"), { ssr: false })

const badges = [
    { id: "first-session", name: "First Steps", description: "Complete your first interview session", icon: "🎯", earned: true },
    { id: "confident-speaker", name: "Confident Speaker", description: "Score 80%+ on Confidence Interview", icon: "💪", earned: true },
    { id: "error-free", name: "Error-Free Champion", description: "Complete a session with 0 errors", icon: "✨", earned: true },
    { id: "streak-7", name: "Week Warrior", description: "Maintain a 7-day streak", icon: "🔥", earned: true },
    { id: "master-debater", name: "Master Debater", description: "Complete all Debate interviews", icon: "⚔️", earned: false },
    { id: "50-sessions", name: "50-Session Streak", description: "Complete 50 total sessions", icon: "🏆", earned: false },
    { id: "polyglot", name: "Polyglot Pro", description: "Complete Multilingual Interview", icon: "🌍", earned: false },
    { id: "all-beginner", name: "Foundation Master", description: "Complete all Beginner interviews", icon: "🎓", earned: false },
]

export default function ProgressPage() {
    const [completedSessions, setCompletedSessions] = useState<Set<string>>(new Set())
    const [goalTarget, setGoalTarget] = useState(10)
    const [goalProgress, setGoalProgress] = useState(4)

    useEffect(() => {
        try {
            const saved = localStorage.getItem("esi-completed")
            if (saved) setCompletedSessions(new Set(JSON.parse(saved)))
        } catch { }
    }, [])

    const totalCompleted = completedSessions.size
    const beginnerCompleted = interviewTypes.filter(i => i.difficulty === "beginner" && completedSessions.has(i.id)).length
    const intermediateCompleted = interviewTypes.filter(i => i.difficulty === "intermediate" && completedSessions.has(i.id)).length
    const advancedCompleted = interviewTypes.filter(i => i.difficulty === "advanced" && completedSessions.has(i.id)).length

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="particle-orb absolute w-72 h-72 rounded-full bg-violet-500/10 blur-[120px] top-[10%] left-[15%]" />
                <div className="particle-orb absolute w-96 h-96 rounded-full bg-cyan-500/8 blur-[140px] top-[50%] right-[10%]" />
            </div>

            <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-16 py-8 pb-32">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
                    <Link href="/dashboard" className="hover:text-slate-900 dark:text-white transition-colors flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Dashboard</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <Link href="/dashboard/enhance-skill-interview" className="hover:text-slate-900 dark:text-white transition-colors">Enhance Skill Interview</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-violet-400 font-medium">Progress & Analytics</span>
                </div>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                        Your <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Progress</span> & Analytics
                    </h1>
                    <p className="text-slate-500 dark:text-zinc-400">Track your improvement across all interview categories</p>
                </motion.div>

                {/* Gamification Bar */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <GamificationBar />
                </motion.div>

                {/* Completion Stats */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Completed", value: totalCompleted, total: 54, color: "violet" },
                        { label: "Beginner", value: beginnerCompleted, total: interviewTypes.filter(i => i.difficulty === "beginner").length, color: "emerald" },
                        { label: "Intermediate", value: intermediateCompleted, total: interviewTypes.filter(i => i.difficulty === "intermediate").length, color: "yellow" },
                        { label: "Advanced", value: advancedCompleted, total: interviewTypes.filter(i => i.difficulty === "advanced").length, color: "red" },
                    ].map(stat => (
                        <div key={stat.label} className="p-4 rounded-2xl bg-white/60 dark:bg-zinc-900/50 border border-white/[0.06]">
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}<span className="text-sm text-zinc-500 font-medium">/{stat.total}</span></p>
                            <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div className={`h-full bg-${stat.color}-500 rounded-full transition-all duration-1000`} style={{ width: `${stat.total > 0 ? (stat.value / stat.total) * 100 : 0}%` }} />
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Radar + Leaderboard */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <SkillRadarChart />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <LeaderboardPanel />
                    </motion.div>
                </div>

                {/* Personal Goal */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8 p-6 rounded-2xl bg-white/60 dark:bg-zinc-900/50 border border-white/[0.06]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center"><Target className="w-4 h-4 text-cyan-400" /></div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personal Goal</h3>
                            <p className="text-[10px] text-zinc-500">Complete {goalTarget} interviews this month</p>
                        </div>
                    </div>
                    <div className="h-3 bg-zinc-800 rounded-full overflow-hidden mb-2">
                        <motion.div className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${(goalProgress / goalTarget) * 100}%` }} transition={{ duration: 1.5, ease: "circOut" }} />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">{goalProgress} of {goalTarget} completed</p>
                </motion.div>

                {/* Badges & Achievements */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center"><Trophy className="w-4 h-4 text-amber-400" /></div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Badges & Achievements</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {badges.map(badge => (
                            <div key={badge.id} className={`p-4 rounded-2xl border text-center transition-all ${badge.earned ? "bg-violet-500/[0.06] border-violet-500/20" : "bg-white dark:bg-zinc-900/30 border-white/[0.04] opacity-50"}`}>
                                <div className="text-3xl mb-2">{badge.icon}</div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{badge.name}</p>
                                <p className="text-[10px] text-zinc-500">{badge.description}</p>
                                {badge.earned && <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mt-2" />}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Back button */}
                <div className="mt-12">
                    <Link href="/dashboard/enhance-skill-interview">
                        <Button variant="outline" className="border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-xl"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Interviews</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
