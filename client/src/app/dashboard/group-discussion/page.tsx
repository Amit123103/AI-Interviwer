"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, ChevronRight, MessagesSquare, Users, Code2, Globe, Flame, Clock, History, LogIn } from "lucide-react"
import TiltCard from "@/components/ui/TiltCard"
import { Card } from "@/components/ui/card"

const stats = [
    { label: "Live Sessions", value: "1,240", icon: "🟢" },
    { label: "Students Online", value: "8,400", icon: "👥" },
    { label: "AI Modes", value: "3", icon: "🤖" },
    { label: "Countries", value: "80+", icon: "🌍" },
]

const modes = [
    {
        id: "ai",
        title: "AI Group Discussion",
        subtitle: "Practice with AI participants who debate, challenge, and score you in real-time",
        icon: "🤖",
        color: "violet",
        gradient: "from-violet-500/20 to-purple-500/20",
        border: "border-violet-500/20 hover:border-violet-400/40",
        cta: "Start AI Discussion →",
        badge: "Most Popular",
    },
    {
        id: "friends",
        title: "Group Discussion With Friends",
        subtitle: "Create a private room or join your friends with a code. Topic + Camera + Scoring",
        icon: "👥",
        color: "emerald",
        gradient: "from-emerald-500/20 to-teal-500/20",
        border: "border-emerald-500/20 hover:border-emerald-400/40",
        cta: "Create or Join Room →",
        badge: "Multiplayer",
    },
    {
        id: "code",
        title: "Code & Tech Group Discussion",
        subtitle: "Discuss tech topics with integrated code editor. Perfect for coding interviews and system design",
        icon: "💻",
        color: "blue",
        gradient: "from-blue-500/20 to-cyan-500/20",
        border: "border-blue-500/20 hover:border-blue-400/40",
        cta: "Start Coding Discussion →",
        badge: "Tech Focus",
    },
    {
        id: "public",
        title: "Open Public Discussion",
        subtitle: "Browse live public rooms and jump into conversations with students from around the world",
        icon: "🌐",
        color: "amber",
        gradient: "from-amber-500/20 to-orange-500/20",
        border: "border-amber-500/20 hover:border-amber-400/40",
        cta: "Browse Live Rooms →",
        badge: "🔴 LIVE",
    },
]

export default function GroupDiscussionPage() {
    const [joinCode, setJoinCode] = useState("")
    const router = useRouter()

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault()
        if (joinCode.trim()) {
            router.push(`/dashboard/group-discussion/device-check?mode=friends&topic=${encodeURIComponent("Custom Private Room")}&code=${joinCode.trim()}`)
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden">
            {/* Floating Particles */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="particle-orb absolute w-72 h-72 rounded-full bg-emerald-500/10 blur-[120px] top-[10%] left-[15%]" />
                <div className="particle-orb absolute w-96 h-96 rounded-full bg-teal-500/8 blur-[140px] top-[40%] right-[10%]" />
                <div className="particle-orb absolute w-56 h-56 rounded-full bg-cyan-500/10 blur-[100px] bottom-[15%] left-[50%]" />
            </div>

            <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-16 py-8 pb-32">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
                    <Link href="/dashboard" className="hover:text-slate-900 dark:text-white transition-colors flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Dashboard</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-slate-500 dark:text-zinc-400">Quick Actions</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-emerald-400 font-medium">Group Discussion</span>
                </div>

                {/* Hero */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-2xl gd-card-gradient flex items-center justify-center shadow-lg">
                                    <MessagesSquare className="w-6 h-6 text-slate-900 dark:text-white" />
                                </div>
                                <span className="px-3 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30 badge-pulse">🤖 AI Powered</span>
                                <span className="px-2 py-0.5 text-[10px] font-semibold text-red-300 rounded-full flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 live-dot inline-block" /> 1,240 Live Now</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
                                Speak. Discuss.{" "}
                                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">Dominate Every Room.</span>
                            </h1>
                            <p className="text-lg text-slate-500 dark:text-zinc-400 max-w-2xl">Join AI-powered discussions, practice with friends, or build your own group — all in one place.</p>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] shrink-0">
                            <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center text-sm">👤</div>
                            <div>
                                <p className="text-sm font-semibold">Student</p>
                                <div className="flex items-center gap-1 text-[10px] text-orange-400 font-bold"><Flame className="w-3 h-3" /> 2,450 XP</div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
                        {stats.map((stat, i) => (
                            <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                                className="px-5 py-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center hover:bg-white/[0.05] transition-all"
                            >
                                <span className="text-xl">{stat.icon}</span>
                                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</p>
                                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* 4 Mode Cards — 2×2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {modes.map((mode, i) => (
                        <motion.div key={mode.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
                            <Link href={`/dashboard/group-discussion/topic-selection?mode=${mode.id}`}>
                                <TiltCard className="h-full">
                                    <Card className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${mode.gradient} backdrop-blur-sm border ${mode.border} p-8 transition-all duration-500 cursor-pointer h-full min-h-[200px] hover:shadow-lg`}>
                                        <span className={`absolute top-5 right-5 px-2.5 py-0.5 text-[10px] font-bold bg-${mode.color}-500/20 text-${mode.color}-300 rounded-full border border-${mode.color}-500/20`}>
                                            {mode.badge}
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10">
                                            <span className="text-5xl mb-5 block group-hover:scale-110 transition-transform duration-500">{mode.icon}</span>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{mode.title}</h3>
                                            <p className="text-sm text-slate-500 dark:text-zinc-400 group-hover:text-slate-900 dark:text-zinc-300 transition-colors leading-relaxed mb-5">{mode.subtitle}</p>
                                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-${mode.color}-500/15 border border-${mode.color}-500/20 text-sm font-semibold text-${mode.color}-300 group-hover:bg-${mode.color}-500/25 transition-all`}>
                                                {mode.cta}
                                            </div>
                                        </div>
                                    </Card>
                                </TiltCard>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row items-center gap-5 p-5 mb-8 rounded-2xl bg-white dark:bg-zinc-900/60 border border-white/[0.06] backdrop-blur-xl">
                    <div className="flex-1 w-full flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400 shrink-0">
                            <LogIn className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-0.5">Join a Private Room</h3>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">Have an invite code from a teammate? Enter it below to join instantly.</p>
                        </div>
                    </div>
                    <form onSubmit={handleJoin} className="w-full md:w-auto flex items-center gap-3">
                        <input
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            placeholder="e.g. ROOM-X7Y9"
                            maxLength={10}
                            className="h-12 px-5 rounded-xl bg-white dark:bg-black/40 border border-white/[0.08] text-slate-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 uppercase tracking-widest text-sm w-full md:w-48 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!joinCode.trim()}
                            className="h-12 px-8 rounded-xl bg-violet-500 hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white font-bold text-sm transition-all whitespace-nowrap shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
                        >
                            Join Room
                        </button>
                    </form>
                </div>

                {/* Quick Links */}
                <div className="flex flex-wrap gap-3">
                    <Link href="/dashboard/group-discussion/history" className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white hover:bg-white/[0.06] transition-all">
                        <History className="w-4 h-4" /> View Session History
                    </Link>
                    <Link href="/dashboard/group-discussion/topic-selection?mode=ai" className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300 hover:bg-emerald-500/20 transition-all">
                        <MessagesSquare className="w-4 h-4" /> Quick Start — AI Discussion
                    </Link>
                </div>
            </div>
        </div>
    )
}
