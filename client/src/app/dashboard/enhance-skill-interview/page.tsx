"use client"

import React, { useState, useMemo, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, ChevronRight, Heart, Lock, Play, Star, Clock, Users, Filter, LayoutGrid, List, ArrowUpDown, AudioWaveform, Flame, Calendar, ChevronDown, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import TiltCard from "@/components/ui/TiltCard"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { interviewTypes, filterCategories, fuzzyMatch, difficultyConfig, categoryColors, type InterviewType, type Category } from "@/lib/interviewTypes"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { interviewApi } from "@/lib/api/interview"

const SkillRadarChart = dynamic(() => import("./components/SkillRadarChart"), { ssr: false, loading: () => <div className="h-[380px] bg-white/60 dark:bg-zinc-900/50 rounded-2xl animate-pulse" /> })
const GamificationBar = dynamic(() => import("./components/GamificationBar"), { ssr: false, loading: () => <div className="h-24 bg-white/60 dark:bg-zinc-900/50 rounded-2xl animate-pulse" /> })
const LeaderboardPanel = dynamic(() => import("./components/LeaderboardPanel"), { ssr: false, loading: () => <div className="h-[400px] bg-white/60 dark:bg-zinc-900/50 rounded-2xl animate-pulse" /> })

type SortOption = "popular" | "newest" | "easiest" | "hardest" | "recommended"
type ViewMode = "grid" | "list" | "compact"

const sortOptions: { key: SortOption; label: string }[] = [
    { key: "popular", label: "Most Popular" },
    { key: "newest", label: "Newest" },
    { key: "easiest", label: "Easiest First" },
    { key: "hardest", label: "Hardest First" },
    { key: "recommended", label: "Recommended" },
]

const difficultyOrder: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 }

const stats = [
    { label: "Interview Types", value: "54+", icon: "🎯" },
    { label: "Sessions Completed", value: "500K+", icon: "🎙️" },
    { label: "Avg Rating", value: "4.9★", icon: "⭐" },
    { label: "Countries", value: "120+", icon: "🌍" },
]

export default function EnhanceSkillInterviewPage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")
    const [activeFilter, setActiveFilter] = useState("all")
    const [sortBy, setSortBy] = useState<SortOption>("popular")
    const [viewMode, setViewMode] = useState<ViewMode>("grid")
    const [showSortDropdown, setShowSortDropdown] = useState(false)
    const [selectedInterview, setSelectedInterview] = useState<InterviewType | null>(null)
    const [favourites, setFavourites] = useState<Set<string>>(new Set())
    const [completedSessions, setCompletedSessions] = useState<Set<string>>(new Set())
    const [isScheduling, setIsScheduling] = useState(false)
    const [scheduledId, setScheduledId] = useState<string | null>(null)
    const [isStarting, setIsStarting] = useState(false)

    // Load from localStorage
    useEffect(() => {
        try {
            const savedFavs = localStorage.getItem("esi-favourites")
            if (savedFavs) setFavourites(new Set(JSON.parse(savedFavs)))
            const savedCompleted = localStorage.getItem("esi-completed")
            if (savedCompleted) setCompletedSessions(new Set(JSON.parse(savedCompleted)))
        } catch { }
    }, [])

    const handleStartInterview = async () => {
        if (!selectedInterview) return
        setIsStarting(true)
        try {
            const savedUser = localStorage.getItem("user")
            if (!savedUser) {
                router.push("/auth/login")
                return
            }
            const userData = JSON.parse(savedUser)
            const res = await interviewApi.initiateSession({
                userId: userData._id || userData.id,
                difficulty: selectedInterview.difficulty,
                resumeText: userData.resumeText || ""
            })
            if (res.sessionId) {
                router.push(`/dashboard/interview/${res.sessionId}`)
            }
        } catch (err) {
            console.error("Failed to start session:", err)
            alert("Failed to create session. Please try again.")
        } finally {
            setIsStarting(false)
        }
    }

    const toggleFavourite = useCallback((id: string) => {
        setFavourites(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id); else next.add(id)
            localStorage.setItem("esi-favourites", JSON.stringify([...next]))
            return next
        })
    }, [])

    const isLocked = useCallback((item: InterviewType): boolean => {
        if (item.prerequisites.length === 0) return false
        return item.prerequisites.some(p => !completedSessions.has(p))
    }, [completedSessions])

    const filteredInterviews = useMemo(() => {
        let items = [...interviewTypes]

        // Search filter
        if (searchQuery) {
            items = items.filter(i =>
                fuzzyMatch(i.title, searchQuery) ||
                fuzzyMatch(i.description, searchQuery) ||
                i.tags.some(t => fuzzyMatch(t, searchQuery))
            )
        }

        // Category filter
        if (activeFilter !== "all") {
            switch (activeFilter) {
                case "beginner": items = items.filter(i => i.difficulty === "beginner"); break
                case "intermediate": items = items.filter(i => i.difficulty === "intermediate"); break
                case "advanced": items = items.filter(i => i.difficulty === "advanced"); break
                case "trending": items = items.filter(i => i.sessionsCompleted > 30000); break
                case "recommended": items = items.filter(i => i.rating >= 4.8); break
                case "favourites": items = items.filter(i => favourites.has(i.id)); break
                case "completed": items = items.filter(i => completedSessions.has(i.id)); break
                case "locked": items = items.filter(i => isLocked(i)); break
                default: items = items.filter(i => i.category === activeFilter); break
            }
        }

        // Sort
        switch (sortBy) {
            case "popular": items.sort((a, b) => b.sessionsCompleted - a.sessionsCompleted); break
            case "easiest": items.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]); break
            case "hardest": items.sort((a, b) => difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]); break
            case "recommended": items.sort((a, b) => b.rating - a.rating); break
        }

        return items
    }, [searchQuery, activeFilter, sortBy, favourites, completedSessions, isLocked])

    const getCategoryColor = (cat: Category) => {
        const c = categoryColors[cat]
        return {
            bg: `bg-${c}-500/15`,
            text: `text-${c}-400`,
            border: `border-${c}-500/20`,
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden">
            {/* Floating Particle Orbs */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="particle-orb absolute w-72 h-72 rounded-full bg-violet-500/10 blur-[120px] top-[10%] left-[15%]" />
                <div className="particle-orb absolute w-96 h-96 rounded-full bg-cyan-500/8 blur-[140px] top-[40%] right-[10%]" />
                <div className="particle-orb absolute w-56 h-56 rounded-full bg-indigo-500/10 blur-[100px] bottom-[15%] left-[50%]" />
                <div className="particle-orb absolute w-64 h-64 rounded-full bg-blue-500/8 blur-[120px] top-[60%] left-[5%]" />
                <div className="particle-orb absolute w-80 h-80 rounded-full bg-purple-500/6 blur-[150px] bottom-[5%] right-[30%]" />
            </div>

            <div className="relative z-10 max-w-[1700px] mx-auto px-6 md:px-16 py-8 pb-32">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
                    <Link href="/dashboard" className="hover:text-slate-900 dark:text-white transition-colors flex items-center gap-1">
                        <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-slate-500 dark:text-zinc-400">Quick Actions</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-violet-400 font-medium">Enhance Skill Interview</span>
                </div>

                {/* Hero Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-2xl enhance-card-gradient flex items-center justify-center shadow-lg">
                                    <AudioWaveform className="w-6 h-6 text-slate-900 dark:text-white" />
                                </div>
                                <span className="px-3 py-1 text-xs font-bold bg-violet-500/20 text-violet-300 rounded-full border border-violet-500/30 badge-pulse">🤖 AI Powered</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
                                Master Every Interview.{" "}
                                <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">Conquer Every Conversation.</span>
                            </h1>
                            <p className="text-lg text-slate-500 dark:text-zinc-400 max-w-2xl">54+ AI-powered interview modes. Real-time feedback. Instant improvement.</p>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] shrink-0">
                            <div className="w-9 h-9 rounded-full bg-violet-500/15 flex items-center justify-center text-sm">👤</div>
                            <div>
                                <p className="text-sm font-semibold">Student</p>
                                <div className="flex items-center gap-1 text-[10px] text-orange-400 font-bold">
                                    <Flame className="w-3 h-3" /> 7-day streak
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Animated Stats Bar */}
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

                {/* Search & Filter */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search interview types..."
                            className="w-full h-12 pl-12 pr-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/10 transition-all text-sm"
                            aria-label="Search interview types"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-slate-900 dark:text-white transition-colors" aria-label="Clear search">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter Pills + Sort + View Toggle */}
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                        {/* Category Pills */}
                        <div className="flex-1 overflow-x-auto scrollbar-none">
                            <div className="flex gap-2 pb-1">
                                {filterCategories.map(cat => (
                                    <button
                                        key={cat.key}
                                        onClick={() => setActiveFilter(cat.key)}
                                        className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${activeFilter === cat.key
                                            ? "bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-[0_0_15px_rgba(124,58,237,0.2)]"
                                            : "bg-white/[0.04] text-slate-500 dark:text-zinc-400 border border-white/[0.06] hover:bg-white/[0.08] hover:text-slate-900 dark:text-white"
                                            }`}
                                        aria-pressed={activeFilter === cat.key}
                                    >
                                        {cat.icon} {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative shrink-0">
                            <button onClick={() => setShowSortDropdown(!showSortDropdown)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white hover:bg-white/[0.07] transition-all"
                            >
                                <ArrowUpDown className="w-3.5 h-3.5" />
                                {sortOptions.find(s => s.key === sortBy)?.label}
                                <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <AnimatePresence>
                                {showSortDropdown && (
                                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                        className="absolute right-0 top-full mt-2 w-48 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 shadow-2xl z-50"
                                    >
                                        {sortOptions.map(opt => (
                                            <button key={opt.key} onClick={() => { setSortBy(opt.key); setShowSortDropdown(false) }}
                                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${sortBy === opt.key ? "text-violet-400 bg-violet-500/10" : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white hover:bg-white/5"}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06] shrink-0">
                            {[
                                { key: "grid" as ViewMode, icon: <LayoutGrid className="w-3.5 h-3.5" /> },
                                { key: "list" as ViewMode, icon: <List className="w-3.5 h-3.5" /> },
                            ].map(v => (
                                <button key={v.key} onClick={() => setViewMode(v.key)}
                                    className={`p-2 rounded-md transition-all ${viewMode === v.key ? "bg-violet-500/20 text-violet-300" : "text-zinc-500 hover:text-slate-900 dark:text-white"}`}
                                    aria-label={`${v.key} view`}
                                >
                                    {v.icon}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Results Count */}
                <p className="text-sm text-zinc-500 mb-6">{filteredInterviews.length} interview types found</p>

                {/* Interview Cards Grid */}
                <div className={viewMode === "list" ? "space-y-3" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"}>
                    <AnimatePresence mode="popLayout">
                        {filteredInterviews.map((item, i) => {
                            const locked = isLocked(item)
                            const diff = difficultyConfig[item.difficulty]
                            const isFav = favourites.has(item.id)
                            const catColor = categoryColors[item.category]

                            if (viewMode === "list") {
                                return (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: Math.min(i * 0.02, 0.3) }}
                                    >
                                        <div
                                            onClick={() => !locked && setSelectedInterview(item)}
                                            className={`flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-zinc-900/40 backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.04] hover:border-violet-500/20 transition-all cursor-pointer ${locked ? "opacity-50" : ""}`}
                                            role="button" tabIndex={0} aria-label={`${item.title}${locked ? " (Locked)" : ""}`}
                                            onKeyDown={e => e.key === "Enter" && !locked && setSelectedInterview(item)}
                                        >
                                            <span className="text-2xl shrink-0">{item.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">{item.title}</h3>
                                                    {locked && <Lock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />}
                                                </div>
                                                <p className="text-xs text-zinc-500 truncate">{item.description}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold ${diff.color} shrink-0`}>{diff.dot} {diff.label}</span>
                                            <span className="text-xs text-zinc-500 shrink-0 flex items-center gap-1"><Clock className="w-3 h-3" />{item.duration}</span>
                                            <span className="text-xs text-amber-400 shrink-0">⭐ {item.rating}</span>
                                            <button onClick={e => { e.stopPropagation(); toggleFavourite(item.id) }} className="shrink-0" aria-label={isFav ? "Remove from favourites" : "Add to favourites"}>
                                                <Heart className={`w-4 h-4 transition-colors ${isFav ? "text-red-400 fill-red-400" : "text-zinc-600 hover:text-red-400"}`} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )
                            }

                            return (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: Math.min(i * 0.03, 0.5) }}
                                >
                                    <TiltCard className="h-full">
                                        <Card
                                            onClick={() => !locked && setSelectedInterview(item)}
                                            className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900/40 backdrop-blur-sm border border-white/[0.06] p-5 hover:bg-white/[0.04] hover:border-violet-500/25 transition-all duration-500 cursor-pointer h-full hover-shine ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
                                            role="button" tabIndex={0} aria-label={`${item.title}${locked ? " (Locked)" : ""}`}
                                            onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && !locked && setSelectedInterview(item)}
                                        >
                                            {/* Glow overlay */}
                                            <div className={`absolute inset-0 bg-gradient-to-br from-${catColor}-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />

                                            {/* Favourite button */}
                                            <button onClick={e => { e.stopPropagation(); toggleFavourite(item.id) }}
                                                className="absolute top-4 right-4 z-20" aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
                                            >
                                                <Heart className={`w-4 h-4 transition-all ${isFav ? "text-red-400 fill-red-400 scale-110" : "text-zinc-600 hover:text-red-400"}`} />
                                            </button>

                                            {/* Lock icon */}
                                            {locked && <Lock className="absolute top-4 left-4 w-4 h-4 text-zinc-500 z-20" />}

                                            <div className="relative z-10">
                                                {/* Icon */}
                                                <div className={`w-12 h-12 rounded-xl bg-${catColor}-500/10 flex items-center justify-center text-2xl mb-4 group-hover:scale-105 transition-all duration-500`}>
                                                    {item.icon}
                                                </div>

                                                {/* Title */}
                                                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 leading-tight">{item.title}</h3>

                                                {/* Description */}
                                                <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mb-3 group-hover:text-slate-900 dark:text-zinc-300 transition-colors leading-relaxed">{item.description}</p>

                                                {/* Category + Difficulty tags */}
                                                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold bg-${catColor}-500/10 text-${catColor}-400 border border-${catColor}-500/15`}>
                                                        {item.category.replace("-", " ")}
                                                    </span>
                                                    <span className={`text-[10px] font-bold ${diff.color}`}>{diff.dot} {diff.label}</span>
                                                </div>

                                                {/* Duration + Rating + Sessions */}
                                                <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.duration}</span>
                                                    <span className="flex items-center gap-1 text-amber-400">⭐ {item.rating}</span>
                                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{(item.sessionsCompleted / 1000).toFixed(1)}K</span>
                                                </div>

                                                {/* Start CTA */}
                                                <div className="mt-4 flex items-center gap-2">
                                                    <div className={`flex-1 h-8 rounded-lg bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-violet-500/15 flex items-center justify-center text-xs font-semibold text-violet-300 gap-1 group-hover:from-violet-500/30 group-hover:to-cyan-500/30 transition-all ${locked ? "opacity-40" : ""}`}>
                                                        {locked ? <><Lock className="w-3 h-3" /> Locked</> : <><Play className="w-3 h-3 fill-current" /> Start</>}
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </TiltCard>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>

                {filteredInterviews.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-4xl mb-4">🔍</p>
                        <p className="text-lg font-semibold text-slate-500 dark:text-zinc-400">No interviews found</p>
                        <p className="text-sm text-zinc-500 mt-1">Try a different search or filter</p>
                    </div>
                )}

                {/* Gamification Section */}
                <div className="mt-20 space-y-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center"><Star className="w-4 h-4 text-violet-400" /></div>
                        <h2 className="text-2xl font-bold tracking-tight"><span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Your</span> Progress</h2>
                    </div>
                    <GamificationBar />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <SkillRadarChart />
                        <LeaderboardPanel />
                    </div>
                </div>
            </div>

            {/* Detail Drawer */}
            <AnimatePresence>
                {selectedInterview && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-white dark:bg-black/60 backdrop-blur-sm z-50" onClick={() => setSelectedInterview(null)} />
                        <motion.div
                            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-white/10 z-50 overflow-y-auto custom-scrollbar shadow-2xl"
                            role="dialog" aria-modal="true" aria-label={`${selectedInterview.title} details`}
                        >
                            <div className="p-8">
                                {/* Close button */}
                                <button onClick={() => setSelectedInterview(null)} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white hover:bg-white/10 transition-all" aria-label="Close drawer">
                                    <X className="w-4 h-4" />
                                </button>

                                {/* Icon + Title */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-violet-500/15 flex items-center justify-center text-3xl">{selectedInterview.icon}</div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">{selectedInterview.title}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs font-bold ${difficultyConfig[selectedInterview.difficulty].color}`}>
                                                {difficultyConfig[selectedInterview.difficulty].dot} {difficultyConfig[selectedInterview.difficulty].label}
                                            </span>
                                            <span className="text-xs text-zinc-500">•</span>
                                            <span className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1"><Clock className="w-3 h-3" />{selectedInterview.duration}</span>
                                            <span className="text-xs text-zinc-500">•</span>
                                            <span className="text-xs text-amber-400">⭐ {selectedInterview.rating}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed mb-8">{selectedInterview.description}</p>

                                {/* What you will practice */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">🎯 What You Will Practice</h3>
                                    <ul className="space-y-2">
                                        {selectedInterview.whatYouPractice.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-500 dark:text-zinc-400"><span className="text-emerald-400 mt-0.5">✓</span> {item}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* What AI will measure */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">📊 What AI Will Measure</h3>
                                    <ul className="space-y-2">
                                        {selectedInterview.whatAIMeasures.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-500 dark:text-zinc-400"><span className="text-cyan-400 mt-0.5">◆</span> {item}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Sample Question */}
                                <div className="mb-6 p-4 rounded-xl bg-violet-500/[0.06] border border-violet-500/15">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">💡 Sample Question</h3>
                                    <p className="text-sm text-slate-600 dark:text-zinc-300 italic">&ldquo;{selectedInterview.sampleQuestion}&rdquo;</p>
                                </div>

                                {/* Prerequisites */}
                                {selectedInterview.prerequisites.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">🔒 Prerequisites</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedInterview.prerequisites.map(p => {
                                                const prereq = interviewTypes.find(i => i.id === p)
                                                return (
                                                    <span key={p} className={`px-3 py-1 rounded-full text-xs font-medium ${completedSessions.has(p) ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-zinc-800 text-zinc-500 border border-slate-100 dark:border-white/5"}`}>
                                                        {completedSessions.has(p) ? "✅" : "🔒"} {prereq?.title || p}
                                                    </span>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Reviews */}
                                <div className="mb-8">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">💬 Student Reviews</h3>
                                    <div className="space-y-3">
                                        {selectedInterview.reviews.map((review, i) => (
                                            <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-[9px] font-bold text-violet-300">{review.name[0]}</div>
                                                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{review.name}</span>
                                                    <span className="text-xs text-amber-400">{"⭐".repeat(review.rating)}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-zinc-400">{review.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button
                                            disabled={isLocked(selectedInterview) || isStarting}
                                            onClick={handleStartInterview}
                                            className="w-full h-12 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-400 hover:to-cyan-400 text-slate-900 dark:text-white font-black rounded-xl text-sm shadow-[0_0_20px_rgba(124,58,237,0.3)] disabled:opacity-40 transition-all uppercase tracking-widest"
                                        >
                                            {isStarting ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <><Play className="w-4 h-4 mr-2 fill-current" /> Start Interview Session</>
                                            )}
                                        </Button>
                                    </motion.div>
                                    <div className="flex gap-3">
                                        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Button 
                                                variant="outline" 
                                                onClick={() => {
                                                    setIsScheduling(true);
                                                    setTimeout(() => {
                                                        setIsScheduling(false);
                                                        setScheduledId(selectedInterview.id);
                                                        setTimeout(() => setScheduledId(null), 3000);
                                                    }, 1200);
                                                }}
                                                className={`w-full h-10 border-slate-200 dark:border-zinc-700 bg-transparent hover:bg-white/5 font-bold rounded-xl text-xs transition-all ${scheduledId === selectedInterview.id ? "text-emerald-400 border-emerald-500/30" : "text-slate-600 dark:text-zinc-300"}`}
                                            >
                                                {isScheduling ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : scheduledId === selectedInterview.id ? (
                                                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Scheduled</>
                                                ) : (
                                                    <><Calendar className="w-4 h-4 mr-2" /> Schedule</>
                                                )}
                                            </Button>
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                            <Button
                                                variant="outline"
                                                onClick={() => toggleFavourite(selectedInterview.id)}
                                                className={`h-10 px-4 border-slate-200 dark:border-zinc-700 bg-transparent hover:bg-white/5 rounded-xl text-sm ${favourites.has(selectedInterview.id) ? "text-red-400 border-red-500/30" : "text-slate-600 dark:text-zinc-300"}`}
                                            >
                                                <Heart className={`w-4 h-4 ${favourites.has(selectedInterview.id) ? "fill-red-400" : ""}`} />
                                            </Button>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
