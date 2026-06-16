"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
    Search, User, FileText, Code2, Terminal, History,
    Building2, Trophy, TrendingUp, Settings, Brain,
    Video, BookOpen, Users, Zap, Play, X, Command
} from "lucide-react"

interface PaletteItem {
    id: string
    label: string
    description: string
    icon: React.ReactNode
    href: string
    category: string
    keywords: string[]
}

const ITEMS: PaletteItem[] = [
    { id: "dashboard", label: "Dashboard", description: "Go to home", icon: <User className="w-4 h-4" />, href: "/dashboard", category: "Navigation", keywords: ["home", "main"] },
    { id: "interview", label: "Start Interview", description: "Begin a mock interview", icon: <Play className="w-4 h-4 text-primary" />, href: "/dashboard/interview/setup", category: "Actions", keywords: ["start", "begin", "mock", "practice"] },
    { id: "instant", label: "Instant Interview", description: "Jump into voice interview", icon: <Video className="w-4 h-4 text-amber-400" />, href: "/dashboard/interview/setup", category: "Actions", keywords: ["quick", "voice", "fast"] },
    { id: "code", label: "Coding Practice", description: "DSA & Algorithms", icon: <Code2 className="w-4 h-4 text-purple-400" />, href: "/dashboard/code", category: "Practice", keywords: ["coding", "dsa", "algorithm", "leetcode"] },
    { id: "technical", label: "Technical Round", description: "AI-proctored coding", icon: <Terminal className="w-4 h-4 text-blue-400" />, href: "/dashboard/technical/details", category: "Practice", keywords: ["tech", "coding", "round"] },
    { id: "resume", label: "Resume Review", description: "AI resume analysis", icon: <FileText className="w-4 h-4 text-emerald-400" />, href: "/dashboard/resume", category: "Tools", keywords: ["resume", "cv", "review"] },
    { id: "history", label: "History", description: "Past interview sessions", icon: <History className="w-4 h-4 text-emerald-400" />, href: "/dashboard/history", category: "Navigation", keywords: ["past", "previous", "sessions"] },
    { id: "analytics", label: "Analytics", description: "Performance metrics", icon: <TrendingUp className="w-4 h-4 text-orange-400" />, href: "/dashboard/analytics", category: "Navigation", keywords: ["stats", "performance", "metrics"] },
    { id: "leaderboard", label: "Leaderboard", description: "Global rankings", icon: <Trophy className="w-4 h-4 text-yellow-400" />, href: "/dashboard/leaderboard", category: "Navigation", keywords: ["rank", "top", "global"] },
    { id: "questions", label: "Question Bank", description: "1000+ curated questions", icon: <BookOpen className="w-4 h-4 text-cyan-400" />, href: "/dashboard/questions", category: "Practice", keywords: ["questions", "bank", "browse"] },
    { id: "companies", label: "Company Prep", description: "FAANG-specific prep", icon: <Building2 className="w-4 h-4 text-indigo-400" />, href: "/dashboard/companies", category: "Practice", keywords: ["company", "faang", "google", "amazon", "meta"] },
    { id: "templates", label: "Templates", description: "Job-role templates", icon: <Search className="w-4 h-4 text-emerald-400" />, href: "/dashboard/templates", category: "Tools", keywords: ["template", "role", "job"] },
    { id: "collab", label: "Collaboration", description: "Create or join rooms", icon: <Users className="w-4 h-4 text-indigo-400" />, href: "/dashboard/collaboration/new", category: "Actions", keywords: ["collab", "peer", "room", "video"] },
    { id: "roadmap", label: "Roadmap", description: "Learning path", icon: <Brain className="w-4 h-4 text-pink-400" />, href: "/dashboard/roadmap", category: "Tools", keywords: ["roadmap", "path", "learn"] },
    { id: "settings", label: "Settings", description: "Account preferences", icon: <Settings className="w-4 h-4 text-slate-900 dark:text-zinc-400" />, href: "/dashboard/settings", category: "Navigation", keywords: ["settings", "account", "profile", "preferences"] },
]

export default function CommandPalette() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    // Keyboard shortcut to toggle
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault()
                setOpen(prev => !prev)
            }
            if (e.key === "Escape") setOpen(false)
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [])

    // Focus input when opened
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 100)
            setQuery("")
            setSelectedIndex(0)
        }
    }, [open])

    const filtered = query.length === 0
        ? ITEMS
        : ITEMS.filter(item => {
            const q = query.toLowerCase()
            return item.label.toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q) ||
                item.keywords.some(k => k.includes(q))
        })

    // Keyboard nav
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault()
            setSelectedIndex(i => Math.min(i + 1, filtered.length - 1))
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setSelectedIndex(i => Math.max(i - 1, 0))
        } else if (e.key === "Enter" && filtered[selectedIndex]) {
            router.push(filtered[selectedIndex].href)
            setOpen(false)
        }
    }, [filtered, selectedIndex, router])

    // Group by category
    const grouped = filtered.reduce<Record<string, PaletteItem[]>>((acc, item) => {
        if (!acc[item.category]) acc[item.category] = []
        acc[item.category].push(item)
        return acc
    }, {})

    let globalIndex = -1

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-white dark:bg-black/60 backdrop-blur-sm z-[100]"
                        onClick={() => setOpen(false)}
                    />

                    {/* Palette */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 400 }}
                        className="fixed top-[15%] left-1/2 -translate-x-1/2 w-[90vw] max-w-[600px] bg-white dark:bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 z-[101] overflow-hidden"
                    >
                        {/* Search Input */}
                        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
                            <Search className="w-5 h-5 text-slate-900 dark:text-zinc-400 shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={e => { setQuery(e.target.value); setSelectedIndex(0) }}
                                onKeyDown={handleKeyDown}
                                placeholder="Search commands, pages, actions..."
                                className="flex-1 bg-transparent text-slate-900 dark:text-white text-sm font-medium outline-none placeholder:text-zinc-500"
                            />
                            <div className="flex items-center gap-1">
                                <kbd className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-black text-slate-900 dark:text-zinc-400 uppercase">ESC</kbd>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="max-h-[50vh] overflow-y-auto py-3 px-3">
                            {filtered.length === 0 ? (
                                <div className="text-center py-12 text-zinc-500 text-sm">
                                    No results for "{query}"
                                </div>
                            ) : (
                                Object.entries(grouped).map(([category, items]) => (
                                    <div key={category} className="mb-3">
                                        <div className="px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">{category}</div>
                                        {items.map((item) => {
                                            globalIndex++
                                            const idx = globalIndex
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => { router.push(item.href); setOpen(false) }}
                                                    onMouseEnter={() => setSelectedIndex(idx)}
                                                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-left transition-all ${idx === selectedIndex
                                                        ? 'bg-gradient-to-r from-primary/15 to-blue-500/10 border border-primary/20 shadow-lg shadow-primary/5'
                                                        : 'hover:bg-white/5 border border-transparent'
                                                        }`}
                                                >
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${idx === selectedIndex ? 'bg-primary/20' : 'bg-white/5'} transition-colors`}>
                                                        {item.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.label}</div>
                                                        <div className="text-[11px] text-zinc-500 truncate">{item.description}</div>
                                                    </div>
                                                    {idx === selectedIndex && (
                                                        <kbd className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-black text-zinc-500">↵</kbd>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between px-6 py-3 border-t border-white/5 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px]">↑↓</kbd> Navigate</span>
                                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px]">↵</kbd> Select</span>
                            </div>
                            <span className="text-primary italic">Intervyxa Command</span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
