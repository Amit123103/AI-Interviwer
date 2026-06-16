"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    Code2, Search, Star, CheckCircle2, Clock, TrendingUp,
    Brain, Target, X, ChevronRight,
    User, GraduationCap, Building2, Loader2, Sparkles, BarChart2, Play, BookOpen, Trophy, Layers
} from "lucide-react"
import IntervyxaCoin from "@/components/reward-system/IntervyxaCoin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { codingApi, Problem } from "@/lib/api/coding"
import MeshBackground from "../components/MeshBackground"
import HolographicHud from "@/components/ui/HolographicHud"
import BackToDashboard from "@/components/dashboard/BackToDashboard"

const DIFF_CONFIG: Record<string, { color: string }> = {
    Easy: { color: 'text-green-400' },
    Medium: { color: 'text-yellow-400' },
    Hard: { color: 'text-red-400' },
}

const CATEGORIES = ['All', 'Arrays', 'Strings', 'Linked List', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Binary Search', 'Hash Maps', 'Stack/Queue']
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard']

// ─── Profile Setup Modal ──────────────────────────────────────────────────────
function PracticeProfileSetup({ onComplete }: { onComplete: (profile: any) => void }) {
    const [form, setForm] = useState({ name: '', course: '', department: '', level: 'Beginner' })

    const handleSave = () => {
        if (!form.name) return
        const profile = { ...form, createdAt: Date.now() }
        localStorage.setItem('practice_profile', JSON.stringify(profile))
        onComplete(profile)
    }

    return (
        <div className="fixed inset-0 bg-white dark:bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-white/10 rounded-3xl p-8 max-w-md w-full space-y-6 backdrop-blur-2xl shadow-[0_0_60px_rgba(139,92,246,0.1)]">
                <div className="text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/10">
                        <Brain className="w-7 h-7 text-violet-400" />
                    </div>
                    <h2 className="text-2xl font-bold"><span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Welcome</span> to Code Practice</h2>
                    <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Set up your profile for personalized recommendations.</p>
                </div>

                <div className="space-y-4">
                    {[
                        { key: 'name', label: 'Full Name', icon: User, placeholder: 'e.g. Priya Sharma' },
                        { key: 'course', label: 'Course / Degree', icon: GraduationCap, placeholder: 'e.g. B.Tech CSE' },
                        { key: 'department', label: 'Department', icon: Building2, placeholder: 'e.g. Computer Science' },
                    ].map(({ key, label, icon: Icon, placeholder }) => (
                        <div key={key}>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                <Icon className="w-3.5 h-3.5 text-violet-400" />{label}
                            </label>
                            <Input value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                                placeholder={placeholder}
                                className="bg-white dark:bg-black/50 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-zinc-600 focus-visible:ring-violet-500/50 h-11 rounded-xl" />
                        </div>
                    ))}
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                            <Layers className="w-3.5 h-3.5 text-violet-400" />Skill Level
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {['Beginner', 'Intermediate', 'Advanced'].map(l => (
                                <button key={l} onClick={() => setForm({ ...form, level: l })}
                                    className={`h-10 rounded-xl border text-xs font-bold transition-all duration-300 ${form.level === l ? 'bg-gradient-to-r from-violet-500 to-cyan-500 border-violet-500/30 text-slate-900 dark:text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]' : 'bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-violet-500/20'}`}>
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <Button onClick={handleSave} disabled={!form.name}
                    className="w-full h-12 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 hover:from-violet-400 hover:via-fuchsia-400 hover:to-cyan-400 text-slate-900 dark:text-white font-bold rounded-2xl gap-2 shadow-[0_0_25px_rgba(139,92,246,0.2)] hover:shadow-[0_0_40px_rgba(139,92,246,0.3)] transition-all duration-500">
                    <Sparkles className="w-4 h-4" />Start Practicing
                </Button>
            </motion.div>
        </div>
    )
}

// ─── Problem Card ─────────────────────────────────────────────────────────────
function ProblemCard({ problem, solved }: { problem: Problem; solved: boolean }) {
    const router = useRouter()
    const diff = DIFF_CONFIG[problem.difficulty] || DIFF_CONFIG.Easy

    return (
        <div onClick={() => router.push(`/dashboard/code/${problem.slug}`)}
            className="group flex items-center gap-4 p-4 bg-white/60 dark:bg-zinc-900/50 border border-slate-100 dark:border-white/5 rounded-2xl hover:bg-white dark:bg-zinc-900/80 hover:border-violet-500/15 hover:shadow-[0_0_25px_rgba(139,92,246,0.04)] transition-all duration-300 cursor-pointer hover-shine">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${solved ? 'bg-green-500/10' : 'bg-zinc-800'}`}>
                {solved ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Code2 className="w-4 h-4 text-zinc-500" />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-violet-300 transition-colors truncate">{problem.title}</h3>
                    {problem.companies?.slice(0, 2).map((c: string) => (
                        <span key={c} className="text-[10px] text-zinc-600 border border-slate-100 dark:border-white/5 px-1.5 py-0.5 rounded hidden sm:inline">{c}</span>
                    ))}
                </div>
                <div className="flex items-center gap-3 mt-1">
                    <span className={`text-xs font-bold ${diff.color}`}>{problem.difficulty}</span>
                    <span className="text-xs text-zinc-600">{problem.category}</span>
                    {problem.stats.submissions > 0 && (
                        <span className="text-xs text-zinc-600">{Math.round((problem.stats.accepted / problem.stats.submissions) * 100)}% acceptance</span>
                    )}
                </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CodingPracticePage() {
    const [profile, setProfile] = useState<any>(null)
    const [showSetup, setShowSetup] = useState(false)
    const [problems, setProblems] = useState<Problem[]>([])
    const [loading, setLoading] = useState(true)
    const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set())
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('All')
    const [difficulty, setDifficulty] = useState('All')
    const [user, setUser] = useState<any>(null)
    const [userStats, setUserStats] = useState({ totalSolved: 0, coins: 0 })

    useEffect(() => {
        const stored = localStorage.getItem('practice_profile')
        if (stored) setProfile(JSON.parse(stored))
        else setShowSetup(true)

        const savedUser = localStorage.getItem('user')
        if (savedUser) setUser(JSON.parse(savedUser))

        loadProblems()
    }, [])

    const loadProblems = async () => {
        try {
            const data = await codingApi.getProblems({ limit: 100 })
            setProblems(data.problems)
            const user = JSON.parse(localStorage.getItem('user') || '{}')
            setUserStats({ totalSolved: user.stats?.accepted || 0, coins: user.intervyxaCoins || 0 })
        } catch {
            // fallback empty
        } finally {
            setLoading(false)
        }
    }

    const filtered = useMemo(() => {
        return problems.filter(p => {
            const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase())
            const matchCat = category === 'All' || p.category === category
            const matchDiff = difficulty === 'All' || p.difficulty === difficulty
            return matchSearch && matchCat && matchDiff
        })
    }, [problems, search, category, difficulty])

    const recommended = useMemo(() => {
        const lvlMap: Record<string, string[]> = {
            'Beginner': ['Easy'],
            'Intermediate': ['Easy', 'Medium'],
            'Advanced': ['Medium', 'Hard'],
        }
        const diffs = lvlMap[profile?.level ?? 'Intermediate'] || ['Easy', 'Medium']
        return problems.filter(p => diffs.includes(p.difficulty)).slice(0, 8)
    }, [problems, profile])

    if (showSetup) {
        return <PracticeProfileSetup onComplete={p => { setProfile(p); setShowSetup(false) }} />
    }

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-white aurora-glow relative overflow-hidden">
            <MeshBackground />
            <HolographicHud />

            {/* Floating ambient orbs */}
            <div className="absolute top-24 left-16 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
            <div className="absolute bottom-32 right-12 w-72 h-72 bg-cyan-500/4 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />

            <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10 space-y-8 relative z-10">

                <BackToDashboard currentPage="Code Practice" />

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
                            <Code2 className="w-9 h-9 text-violet-400" />
                            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">Smart Code</span> Practice
                        </h1>
                        <p className="text-slate-500 dark:text-zinc-400 mt-1">AI-personalized challenges. {problems.length}+ problems available.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button asChild variant="outline" className="border-slate-200 dark:border-white/10 hover:bg-white/5 gap-2">
                            <Link href="/coding-round/setup">
                                <Trophy className="w-4 h-4 text-violet-400" /> Start Coding Round
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Solved', value: userStats.totalSolved, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                        { label: 'Level', value: `LVL ${user?.level || 1}`, icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                        { label: 'Coins', value: userStats.coins.toLocaleString(), icon: () => <IntervyxaCoin size={18} animate={false} glow={false} />, color: 'text-yellow-400', bg: 'bg-yellow-500/5' },
                        { label: 'Directory', value: problems.length, icon: BarChart2, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                    ].map(({ icon: Icon, label, value, color, bg }) => (
                        <Card key={label} className="bg-white dark:bg-zinc-900/60 border-slate-100 dark:border-white/5 rounded-2xl p-4 flex items-center gap-3 hover:border-violet-500/10 hover:shadow-[0_0_20px_rgba(139,92,246,0.04)] transition-all duration-300">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <div>
                                <div className="text-xl font-black">{value}</div>
                                <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{label}</div>
                            </div>
                        </Card>
                    ))}
                </div>

                <Tabs defaultValue="recommended" className="space-y-6">
                    <TabsList className="bg-white/60 dark:bg-zinc-900/50 border border-slate-100 dark:border-white/5 p-1 rounded-xl h-12 inline-flex">
                        <TabsTrigger value="recommended" className="h-9 px-5 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-slate-900 dark:text-white data-[state=active]:shadow-[0_0_15px_rgba(139,92,246,0.15)] text-slate-500 dark:text-zinc-400 font-bold text-sm gap-2">
                            <Sparkles className="w-4 h-4" />Recommended
                        </TabsTrigger>
                        <TabsTrigger value="all" className="h-9 px-5 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-slate-900 dark:text-white data-[state=active]:shadow-[0_0_15px_rgba(139,92,246,0.15)] text-slate-500 dark:text-zinc-400 font-bold text-sm gap-2">
                            <BookOpen className="w-4 h-4" />All Problems
                        </TabsTrigger>
                        <TabsTrigger value="progress" className="h-9 px-5 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-slate-900 dark:text-white data-[state=active]:shadow-[0_0_15px_rgba(139,92,246,0.15)] text-slate-500 dark:text-zinc-400 font-bold text-sm gap-2">
                            <TrendingUp className="w-4 h-4" />Progress
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="recommended" className="space-y-5">
                        <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-2xl">
                            <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
                            <p className="text-sm text-slate-600 dark:text-zinc-300">
                                Showing <span className="text-violet-300 font-bold">{profile?.level || 'Intermediate'}-level</span> problems tailored for you.
                                <button onClick={() => setShowSetup(true)} className="ml-2 text-violet-400 hover:underline text-xs">Update profile</button>
                            </p>
                        </div>
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 bg-white/60 dark:bg-zinc-900/50 rounded-2xl animate-pulse" />)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {recommended.map(p => <ProblemCard key={p._id} problem={p} solved={solvedIds.has(p._id)} />)}
                                {recommended.length === 0 && (
                                    <p className="col-span-2 text-center text-zinc-600 py-12">No recommended problems yet. Try refreshing or updating your profile.</p>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="all" className="space-y-5">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search problems..."
                                    className="pl-9 bg-white/60 dark:bg-zinc-900/50 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-zinc-500 h-11 rounded-xl focus-visible:ring-purple-500/50" />
                                {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-slate-900 dark:text-white"><X className="w-4 h-4" /></button>}
                            </div>
                            <div className="flex gap-2 overflow-x-auto">
                                {DIFFICULTIES.map(d => (
                                    <button key={d} onClick={() => setDifficulty(d)}
                                        className={`shrink-0 px-3 py-2 rounded-xl border text-xs font-bold h-11 transition-all duration-300
                                            ${difficulty === d ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-slate-900 dark:text-white border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]' : 'bg-white/60 dark:bg-zinc-900/50 border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-violet-500/20'}`}>
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {CATEGORIES.map(c => (
                                <button key={c} onClick={() => setCategory(c)}
                                    className={`shrink-0 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-300
                                        ${category === c ? 'bg-gradient-to-r from-violet-500 to-cyan-500 border-violet-500/30 text-slate-900 dark:text-white shadow-[0_0_12px_rgba(139,92,246,0.12)]' : 'bg-white/60 dark:bg-zinc-900/50 border-slate-200 dark:border-white/10 text-zinc-500 hover:border-violet-500/20 hover:text-slate-900 dark:text-white'}`}>
                                    {c}
                                </button>
                            ))}
                        </div>
                        <div className="space-y-2">
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-16 bg-white/60 dark:bg-zinc-900/50 rounded-2xl animate-pulse" />)
                            ) : filtered.length > 0 ? (
                                filtered.map(p => <ProblemCard key={p._id} problem={p} solved={solvedIds.has(p._id)} />)
                            ) : (
                                <div className="text-center py-16 bg-white dark:bg-zinc-900/30 rounded-2xl border border-slate-100 dark:border-white/5 border-dashed">
                                    <Code2 className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                                    <p className="text-zinc-500">No problems found.</p>
                                    <Button variant="outline" onClick={() => { setSearch(''); setCategory('All'); setDifficulty('All') }} className="mt-4 border-slate-200 dark:border-white/10">Clear Filters</Button>
                                </div>
                            )}
                        </div>
                        <p className="text-center text-xs text-zinc-600">{filtered.length} of {problems.length} problems</p>
                    </TabsContent>

                    <TabsContent value="progress" className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'Easy', diffs: 'Easy', color: 'green', barColor: 'bg-green-500', textColor: 'text-green-400' },
                                { label: 'Medium', diffs: 'Medium', color: 'yellow', barColor: 'bg-yellow-500', textColor: 'text-yellow-400' },
                                { label: 'Hard', diffs: 'Hard', color: 'red', barColor: 'bg-red-500', textColor: 'text-red-400' },
                            ].map(({ label, diffs, barColor, textColor }) => {
                                const tot = problems.filter(p => p.difficulty === diffs).length
                                const slv = 0
                                const pct = tot > 0 ? Math.round((slv / tot) * 100) : 0
                                return (
                                    <Card key={label} className="bg-white dark:bg-zinc-900/60 border-slate-100 dark:border-white/5 rounded-2xl p-5 text-center">
                                        <p className={`text-2xl font-black ${textColor}`}>{slv}</p>
                                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{label}</p>
                                        <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                                                className={`h-full rounded-full ${barColor}`} />
                                        </div>
                                        <p className="text-[10px] text-zinc-600 mt-1">{pct}% of {tot}</p>
                                    </Card>
                                )
                            })}
                        </div>
                        <Card className="bg-white dark:bg-zinc-900/60 border-slate-100 dark:border-white/5 rounded-2xl p-6 text-center">
                            <Code2 className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                            <p className="text-sm text-zinc-500 mb-4">Submit solutions to see your activity history here.</p>
                            <Button variant="outline" className="border-slate-200 dark:border-white/10 gap-2" onClick={() => { }}>
                                <Play className="w-4 h-4" /> Start Practicing
                            </Button>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
