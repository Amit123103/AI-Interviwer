"use client"

import React, { useMemo, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Sun, Zap, Target, Trophy, Mic, Code2 } from "lucide-react"

interface SarahBriefingProps {
    user: any
    stats: any
    mood?: 'professional' | 'technical' | 'creative'
}

export default function SarahBriefing({ user, stats, mood = 'professional' }: SarahBriefingProps) {
    const accents = {
        professional: { text: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-500/10", border: "border-indigo-100 dark:border-indigo-500/20", progress: "bg-indigo-500", icon: "text-indigo-600" },
        technical: { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-100 dark:border-emerald-500/20", progress: "bg-emerald-500", icon: "text-emerald-600" },
        creative: { text: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10", border: "border-rose-100 dark:border-rose-500/20", progress: "bg-rose-500", icon: "text-rose-600" }
    }
    const a = accents[mood] || accents.professional;
    const [currentEmoji, setCurrentEmoji] = useState("👋")

    useEffect(() => {
        const emojis = ["👋", "🤝", "🚀", "💡", "🌟", "🔥", "🧑‍💻"]
        let i = 0
        const timer = setInterval(() => {
            i = (i + 1) % emojis.length
            setCurrentEmoji(emojis[i])
        }, 3000)
        return () => clearInterval(timer)
    }, [])

    const greetingBase = useMemo(() => {
        const hour = new Date().getHours()
        if (hour < 12) return "Good morning"
        if (hour < 17) return "Good afternoon"
        return "Good evening"
    }, [])

    const slogan = useMemo(() => {
        const slogans = [
            "Tech Visionary",
            "Future Builder",
            "Placement Pioneer",
            "Architect of Tomorrow"
        ]
        return slogans[Math.floor(Math.random() * slogans.length)]
    }, [])

    const briefing = useMemo(() => {
        return "Stay consistent. Your future self will thank you."
    }, [])

    const nextAction = useMemo(() => {
        if (!stats?.metrics) return { label: "System Design", area: "Scalability" }
        const tech = stats.metrics.interviewReadiness || 0
        if (tech > 80) return { label: "Leadership", area: "Conflict Resolution" }
        if (tech < 60) return { label: "Tech Basics", area: "Data Structures" }
        return { label: "Mock Interview", area: "Behavioral" }
    }, [stats])

    const overallProgress = useMemo(() => {
        if (!stats?.metrics) return 0
        return stats.metrics.skillAlignment || 0
    }, [stats])

    const confidenceScore = useMemo(() => {
        if (!stats?.metrics) return 0
        return stats.metrics.overallReadiness || 0
    }, [stats])

    const engagementScore = useMemo(() => {
        if (!stats?.metrics) return 0
        return stats.metrics.peerRanking || stats.metrics.engagementScore || 0
    }, [stats])

    const levelProgression = useMemo(() => {
        if (!user) return 0
        const currentLevel = user.level || 1
        const currentCoins = user.intervyxaCoins || 0
        const COINS_PER_LEVEL_BASE = 500
        const nextLevelThreshold = currentLevel * COINS_PER_LEVEL_BASE * 2
        const prevLevelThreshold = (currentLevel - 1) * COINS_PER_LEVEL_BASE * 2
        
        const progress = ((currentCoins - prevLevelThreshold) / (nextLevelThreshold - prevLevelThreshold)) * 100
        return Math.min(100, Math.max(0, Math.round(progress)))
    }, [user])

    const strategicInsight = useMemo(() => {
        if (!stats?.metrics) return { priority: "Complete Initial Assessment", icon: <Target className="w-5 h-5" />, label: "Diagnostic Phase" }
        const { interviewReadiness, codingProficiency, quizMastery } = stats.metrics
        
        if (interviewReadiness < codingProficiency && interviewReadiness < 70) {
            return { priority: "Refine Interview Performance", icon: <Mic className="w-5 h-5 text-rose-500" />, label: "Mock Simulation" }
        }
        if (codingProficiency < 70) {
            return { priority: "Strengthen Technical Core", icon: <Code2 className="w-5 h-5 text-emerald-500" />, label: "Algo Practice" }
        }
        if (quizMastery < 80) {
            return { priority: "Reinforce Concepts", icon: <Zap className="w-5 h-5 text-amber-500" />, label: "Quiz Sprint" }
        }
        return { priority: "Optimize Technical Proficiency", icon: <Zap className="w-5 h-5 text-indigo-500" />, label: "Placement Ready Path" }
    }, [stats])

    return (
        <div className="relative w-full h-full">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 p-8 md:p-12 h-full rounded-3xl shadow-sm flex flex-col justify-center transition-colors">

                {/* Responsive Grid Flow */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

                    {/* Visual Anchor (Col 1-2) */}
                    <div className="lg:col-span-2 flex justify-center lg:justify-start">
                        <motion.div
                            className="w-24 h-24 md:w-28 md:h-28 rounded-[1.5rem] bg-indigo-50 dark:bg-zinc-900 border border-indigo-100 dark:border-white/10 flex items-center justify-center relative overflow-hidden shadow-sm"
                            whileHover={{ rotate: 5, scale: 1.05 }}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentEmoji}
                                    className="text-5xl md:text-6xl select-none absolute"
                                    initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                                    animate={{ opacity: 1, scale: 1, rotate: [0, 10, -10, 0] }}
                                    exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    {currentEmoji}
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* Main Content (Col 3-8) */}
                    <div className="lg:col-span-6 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 rounded-full border border-indigo-100 dark:border-indigo-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">Learning System Synced</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 pb-1">
                                {greetingBase}, <span className={`${a.text} break-all`}>{user?.username || "Candidate"}</span>
                            </h2>
                            <p className="text-sm font-bold tracking-[0.15em] uppercase text-zinc-500 dark:text-zinc-400">
                                {slogan}
                            </p>
                        </div>
                        <p className="text-base font-medium leading-relaxed max-w-xl text-zinc-600 dark:text-zinc-400">
                            Your career momentum is building. <br />
                            <span className="text-zinc-500 dark:text-zinc-500 italic">"Sarah: Let's focus on targeted technical excellence today."</span>
                        </p>

                        {/* Integrated Milestone Hud */}
                        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-md transition-all group/ms relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-5">
                                <div className={`w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 flex items-center justify-center ${a.icon} shadow-sm`}>
                                    {strategicInsight.icon}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-bold mb-0.5">Strategic Priority</span>
                                    <span className="text-zinc-900 dark:text-zinc-100 text-base font-bold tracking-tight">{strategicInsight.priority}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full ${a.progress}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${levelProgression}%` }}
                                        transition={{ duration: 2 }}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                                    <span className="text-zinc-600 dark:text-zinc-400">Level Progression: {levelProgression}%</span>
                                    <span className={a.text}>{strategicInsight.label}</span>
                                </div>
                                <button className={`w-full py-3 rounded-xl bg-white dark:bg-zinc-900 dark:bg-zinc-100 text-slate-900 dark:text-white dark:text-zinc-900 hover:opacity-90 text-xs font-semibold uppercase tracking-wider transition-all shadow-sm mt-2`}>
                                    Activate High-Focus Mode →
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats HUD (Col 9-12) */}
                    <div className="lg:col-span-4 lg:pl-10 lg:border-l border-zinc-200 dark:border-white/10">
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Architecture Skills</span>
                                        <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{overallProgress}%</span>
                                    </div>
                                    <div className={`w-8 h-8 rounded-lg ${a.bg} flex items-center justify-center ${a.icon} mb-1 border ${a.border}`}>
                                        <Trophy className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div className={`h-full ${a.progress} rounded-full`} style={{ width: `${overallProgress}%` }} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Interview IQ</span>
                                        <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{confidenceScore}%</span>
                                    </div>
                                    <div className={`w-8 h-8 rounded-lg ${a.bg} flex items-center justify-center ${a.icon} mb-1 border ${a.border}`}>
                                        <Target className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div className={`h-full ${a.progress} rounded-full`} style={{ width: `${confidenceScore}%` }} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Peer Ranking</span>
                                        <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{engagementScore}%</span>
                                    </div>
                                    <div className={`w-8 h-8 rounded-lg ${a.bg} flex items-center justify-center ${a.icon} mb-1 border ${a.border}`}>
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div className={`h-full ${a.progress} rounded-full`} style={{ width: `${engagementScore}%` }} />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-zinc-200 dark:border-white/10">
                                <div className={`w-full py-2.5 rounded-xl ${a.bg} border ${a.border} text-xs font-bold uppercase tracking-widest text-center ${a.text}`}>
                                    Elite Strategy Active
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
