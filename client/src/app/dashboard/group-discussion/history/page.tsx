"use client"

import React, { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, ChevronRight, Search, Clock, Users, Trophy, TrendingUp, BarChart3, Calendar, Eye, RefreshCw, LayoutGrid, List, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { mockSessionHistory, modeLabels, topicCategories } from "@/lib/groupDiscussionData"

const gradeColors: Record<string, string> = {
    "A+": "text-emerald-400 bg-emerald-500/15",
    "A": "text-emerald-400 bg-emerald-500/15",
    "B+": "text-blue-400 bg-blue-500/15",
    "B": "text-blue-400 bg-blue-500/15",
    "C": "text-amber-400 bg-amber-500/15",
    "D": "text-red-400 bg-red-500/15",
    "F": "text-red-400 bg-red-500/15",
}

export default function HistoryPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [sortBy, setSortBy] = useState<"newest" | "highest" | "longest">("newest")

    const filtered = mockSessionHistory.filter(s =>
        !searchQuery || s.topic.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const totalSessions = mockSessionHistory.length
    const avgScore = Math.round(mockSessionHistory.reduce((a, s) => a + s.score, 0) / totalSessions)
    const bestScore = Math.max(...mockSessionHistory.map(s => s.score))

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="particle-orb absolute w-72 h-72 rounded-full bg-emerald-500/10 blur-[120px] top-[10%] left-[15%]" />
            </div>

            <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-16 py-8 pb-32">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
                    <Link href="/dashboard" className="hover:text-slate-900 dark:text-white transition-colors flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Dashboard</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <Link href="/dashboard/group-discussion" className="hover:text-slate-900 dark:text-white transition-colors">Group Discussion</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-emerald-400 font-medium">History</span>
                </div>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                        Session <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">History</span>
                    </h1>
                    <p className="text-slate-500 dark:text-zinc-400">Review past discussions, track your improvement, and retry topics</p>
                </motion.div>

                {/* Stats Dashboard */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                    {[
                        { label: "Total Sessions", value: totalSessions, icon: <BarChart3 className="w-4 h-4 text-emerald-400" /> },
                        { label: "Avg Score", value: `${avgScore}/100`, icon: <TrendingUp className="w-4 h-4 text-violet-400" /> },
                        { label: "Best Score", value: `${bestScore}/100`, icon: <Trophy className="w-4 h-4 text-amber-400" /> },
                        { label: "This Week", value: "3", icon: <Calendar className="w-4 h-4 text-cyan-400" /> },
                    ].map(stat => (
                        <div key={stat.label} className="p-4 rounded-2xl bg-white/60 dark:bg-zinc-900/50 border border-white/[0.06]">
                            <div className="flex items-center gap-2 mb-2">{stat.icon}<span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{stat.label}</span></div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Search + Controls */}
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search sessions..." className="w-full h-11 pl-11 pr-10 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/40 text-sm" />
                        {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-slate-900 dark:text-white"><X className="w-4 h-4" /></button>}
                    </div>
                    <div className="flex items-center gap-2">
                        {(["newest", "highest", "longest"] as const).map(s => (
                            <button key={s} onClick={() => setSortBy(s)} className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${sortBy === s ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-white/[0.04] text-slate-500 dark:text-zinc-400 border border-white/[0.06] hover:bg-white/[0.08]"}`}>
                                {s === "newest" ? "Newest" : s === "highest" ? "Highest Score" : "Longest"}
                            </button>
                        ))}
                        <div className="flex gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                            <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md ${viewMode === "grid" ? "bg-emerald-500/20 text-emerald-300" : "text-zinc-500"}`}><LayoutGrid className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md ${viewMode === "list" ? "bg-emerald-500/20 text-emerald-300" : "text-zinc-500"}`}><List className="w-3.5 h-3.5" /></button>
                        </div>
                    </div>
                </div>

                {/* Session Cards */}
                <div className={viewMode === "list" ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
                    {filtered.map((session, i) => {
                        const ml = modeLabels[session.mode]
                        const gc = gradeColors[session.grade] || "text-slate-500 dark:text-zinc-400 bg-zinc-500/15"

                        return (
                            <motion.div key={session.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/40 border border-white/[0.06] hover:bg-white/[0.04] hover:border-emerald-500/20 transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold bg-${ml?.color || "zinc"}-500/15 text-${ml?.color || "zinc"}-400`}>{ml?.icon} {ml?.label}</span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${gc}`}>{session.grade}</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">{session.topic}</h3>
                                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-zinc-500 mb-3">
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{session.date}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{session.duration}</span>
                                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{session.participants}</span>
                                        <span className="font-bold text-violet-400">Score: {session.score}/100</span>
                                        <span>Rank: #{session.rank}</span>
                                    </div>
                                    {session.topError !== "None significant" && (
                                        <p className="text-[10px] text-amber-400/80 mb-3">⚠️ {session.topError}</p>
                                    )}
                                    <div className="flex gap-2">
                                        <Link href={`/dashboard/group-discussion/report?topic=${encodeURIComponent(session.topic)}`} className="flex-1">
                                            <Button variant="outline" className="w-full h-8 text-xs border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-lg bg-transparent hover:bg-white/5"><Eye className="w-3 h-3 mr-1" /> View Report</Button>
                                        </Link>
                                        <Link href={`/dashboard/group-discussion/topic-selection?mode=${session.mode}`} className="flex-1">
                                            <Button variant="outline" className="w-full h-8 text-xs border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-lg bg-transparent hover:bg-white/5"><RefreshCw className="w-3 h-3 mr-1" /> Retry</Button>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-4xl mb-4">📭</p>
                        <p className="text-lg font-semibold text-slate-500 dark:text-zinc-400">No sessions found</p>
                        <p className="text-sm text-zinc-500 mt-1">Try a different search term</p>
                    </div>
                )}

                <div className="mt-8">
                    <Link href="/dashboard/group-discussion">
                        <Button variant="outline" className="border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-xl bg-transparent hover:bg-white/5"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Group Discussion</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
