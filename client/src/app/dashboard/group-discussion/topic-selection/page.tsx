"use client"

import React, { useState, useMemo, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ChevronRight, Lightbulb, Sparkles, BookOpen, Dices, Search, X, Check, AlertTriangle, Clock, Users, Star, Flame, ThumbsUp, ThumbsDown, Heart, RefreshCw, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { topicCategories, topicStyles, difficultyLevels, topicLibrary, type DiscussionTopic } from "@/lib/groupDiscussionData"

const tabOptions = [
    { key: "own", label: "Type Your Own", icon: <Lightbulb className="w-4 h-4" />, emoji: "✍️" },
    { key: "ai", label: "AI Generate", icon: <Sparkles className="w-4 h-4" />, emoji: "🤖" },
    { key: "library", label: "Topic Library", icon: <BookOpen className="w-4 h-4" />, emoji: "📚" },
    { key: "surprise", label: "Surprise Me", icon: <Dices className="w-4 h-4" />, emoji: "🎲" },
]

function TopicSelectionContent() {
    const searchParams = useSearchParams()
    const mode = searchParams.get("mode") || "ai"

    const [activeTab, setActiveTab] = useState("own")
    const [ownTopic, setOwnTopic] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("")
    const [selectedDifficulty, setSelectedDifficulty] = useState("")
    const [selectedStyle, setSelectedStyle] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedTopic, setGeneratedTopic] = useState<DiscussionTopic | null>(null)
    const [librarySearch, setLibrarySearch] = useState("")
    const [libraryCategory, setLibraryCategory] = useState("all")
    const [surpriseTopic, setSurpriseTopic] = useState<DiscussionTopic | null>(null)
    const [isSpinning, setIsSpinning] = useState(false)
    const [confirmedTopic, setConfirmedTopic] = useState<DiscussionTopic | null>(null)
    const [savedTopics, setSavedTopics] = useState<Set<string>>(new Set())

    const modeLabel = { ai: "🤖 AI Discussion", friends: "🟢 Friends Room", code: "💻 Code & Tech", public: "🌐 Public Room" }[mode] || "Discussion"

    const isOwnTopicValid = ownTopic.length >= 10
    const ownTopicPreview: DiscussionTopic | null = isOwnTopicValid ? {
        id: "custom", title: ownTopic, description: "AI will analyze and set up this topic for your discussion.",
        category: "custom", difficulty: "medium", style: "open", rating: 0, timesDiscussed: 0,
        proSide: "Multiple perspectives can be explored", conSide: "Consider counter-arguments carefully",
        keyPoints: ["Explore different viewpoints", "Support with examples", "Consider real-world impact"],
        facts: [], controversyLevel: "medium", estimatedDuration: "15-20 min", idealGroupSize: "3-6",
    } : null

    const handleGenerate = () => {
        setIsGenerating(true)
        setTimeout(() => {
            const filtered = topicLibrary.filter(t =>
                (!selectedCategory || t.category === selectedCategory) &&
                (!selectedDifficulty || t.difficulty === selectedDifficulty) &&
                (!selectedStyle || t.style === selectedStyle)
            )
            const pool = filtered.length > 0 ? filtered : topicLibrary
            setGeneratedTopic(pool[Math.floor(Math.random() * pool.length)])
            setIsGenerating(false)
        }, 2000)
    }

    const filteredLibrary = useMemo(() => {
        let items = [...topicLibrary]
        if (libraryCategory !== "all") items = items.filter(t => t.category === libraryCategory)
        if (librarySearch) {
            const q = librarySearch.toLowerCase()
            items = items.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
        }
        return items
    }, [libraryCategory, librarySearch])

    const handleSurprise = () => {
        setIsSpinning(true)
        setTimeout(() => {
            setSurpriseTopic(topicLibrary[Math.floor(Math.random() * topicLibrary.length)])
            setIsSpinning(false)
        }, 1200)
    }

    const toggleSave = (id: string) => {
        setSavedTopics(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id); else next.add(id)
            return next
        })
    }

    // If confirmed topic set, show confirmation card
    if (confirmedTopic) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden">
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="particle-orb absolute w-72 h-72 rounded-full bg-emerald-500/10 blur-[120px] top-[20%] left-[20%]" />
                </div>
                <div className="relative z-10 max-w-2xl mx-auto px-6 py-16">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 rounded-2xl bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-emerald-500/20 shadow-2xl">
                        <div className="text-center mb-6">
                            <span className="text-5xl mb-3 block">✅</span>
                            <h2 className="text-2xl font-black">Topic Confirmed!</h2>
                            <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Ready to enter the discussion room</p>
                        </div>
                        <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{confirmedTopic.title}</h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400">{confirmedTopic.category}</span>
                                <span className="text-[10px] font-bold text-yellow-400">{difficultyLevels.find(d => d.id === confirmedTopic.difficulty)?.icon} {confirmedTopic.difficulty}</span>
                                <span className="text-[10px] text-zinc-500 flex items-center gap-1"><Clock className="w-3 h-3" />{confirmedTopic.estimatedDuration}</span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-3">{confirmedTopic.description}</p>
                            <div className="space-y-1.5">
                                {confirmedTopic.keyPoints.slice(0, 3).map((p, i) => (
                                    <p key={i} className="text-xs text-zinc-500 flex items-center gap-2"><span className="text-emerald-400">•</span> {p}</p>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 mb-4">
                            <div className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                                <p className="text-[9px] text-zinc-500 uppercase tracking-wider mb-0.5">Mode</p>
                                <p className="text-sm font-semibold">{modeLabel}</p>
                            </div>
                            <div className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                                <p className="text-[9px] text-zinc-500 uppercase tracking-wider mb-0.5">AI Moderator</p>
                                <p className="text-sm font-semibold text-emerald-400">On</p>
                            </div>
                            <div className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                                <p className="text-[9px] text-zinc-500 uppercase tracking-wider mb-0.5">Scoring</p>
                                <p className="text-sm font-semibold text-emerald-400">Enabled</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setConfirmedTopic(null)} className="flex-1 border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-xl bg-transparent hover:bg-white/5">
                                <ArrowLeft className="w-4 h-4 mr-2" /> Change Topic
                            </Button>
                            <Link href={`/dashboard/group-discussion/device-check?mode=${mode}&topic=${encodeURIComponent(confirmedTopic.title)}`} className="flex-1">
                                <Button className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-900 dark:text-white font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                    Let&apos;s Go! →
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="particle-orb absolute w-72 h-72 rounded-full bg-emerald-500/10 blur-[120px] top-[10%] left-[15%]" />
                <div className="particle-orb absolute w-96 h-96 rounded-full bg-teal-500/8 blur-[140px] top-[50%] right-[10%]" />
            </div>

            <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-16 py-8 pb-32">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
                    <Link href="/dashboard" className="hover:text-slate-900 dark:text-white transition-colors flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Dashboard</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <Link href="/dashboard/group-discussion" className="hover:text-slate-900 dark:text-white transition-colors">Group Discussion</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-emerald-400 font-medium">Select Topic</span>
                </div>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                    <span className="text-4xl mb-3 block">💡</span>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                        What Will You <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Discuss Today?</span>
                    </h1>
                    <p className="text-slate-500 dark:text-zinc-400">Type your own topic or let AI generate the perfect one for you</p>
                    <span className="inline-block mt-3 px-3 py-1 text-xs font-semibold bg-emerald-500/15 text-emerald-300 rounded-full border border-emerald-500/20">{modeLabel}</span>
                </motion.div>

                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                    {tabOptions.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.key
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                : "bg-white/[0.04] text-slate-500 dark:text-zinc-400 border border-white/[0.06] hover:bg-white/[0.08] hover:text-slate-900 dark:text-white"
                                }`}
                        >
                            {tab.emoji} {tab.label}
                        </button>
                    ))}
                </div>

                {/* ═════ TAB: TYPE YOUR OWN ═════ */}
                {activeTab === "own" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
                        <div className="relative mb-4">
                            <textarea
                                value={ownTopic}
                                onChange={e => setOwnTopic(e.target.value.slice(0, 200))}
                                placeholder='e.g., Should AI replace human teachers in schools?'
                                className="w-full h-28 px-5 py-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10 transition-all text-base resize-none"
                                spellCheck
                                aria-label="Enter your discussion topic"
                            />
                            <div className="absolute bottom-3 right-3 flex items-center gap-3">
                                {ownTopic && (
                                    <button onClick={() => setOwnTopic("")} className="text-zinc-500 hover:text-slate-900 dark:text-white transition-colors"><X className="w-4 h-4" /></button>
                                )}
                                <span className={`text-[10px] font-mono ${ownTopic.length >= 200 ? "text-red-400" : "text-zinc-600"}`}>{ownTopic.length}/200</span>
                            </div>
                        </div>
                        {/* Validation */}
                        {ownTopic.length > 0 && ownTopic.length < 10 && (
                            <p className="text-xs text-amber-400 flex items-center gap-1 mb-4"><AlertTriangle className="w-3 h-3" /> Minimum 10 characters required ({10 - ownTopic.length} more needed)</p>
                        )}
                        {isOwnTopicValid && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <p className="text-xs text-emerald-400 flex items-center gap-1 mb-4"><Check className="w-3 h-3" /> Topic is clear and discussable!</p>
                                {ownTopicPreview && (
                                    <div className="p-5 rounded-xl bg-white/[0.03] border border-emerald-500/15 mb-4">
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">{ownTopicPreview.title}</h3>
                                        <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">{ownTopicPreview.description}</p>
                                        <div className="flex items-center gap-3 text-[10px] text-zinc-500 mb-3">
                                            <span>🟡 Medium</span><span><Clock className="w-3 h-3 inline" /> {ownTopicPreview.estimatedDuration}</span><span><Users className="w-3 h-3 inline" /> {ownTopicPreview.idealGroupSize}</span>
                                        </div>
                                        <ul className="space-y-1">{ownTopicPreview.keyPoints.map((p, i) => <li key={i} className="text-xs text-zinc-500 flex items-center gap-2"><span className="text-emerald-400">•</span>{p}</li>)}</ul>
                                    </div>
                                )}
                                <Button onClick={() => setConfirmedTopic(ownTopicPreview!)} className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-900 dark:text-white font-bold rounded-xl">
                                    ✅ Use This Topic
                                </Button>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* ═════ TAB: AI GENERATE ═════ */}
                {activeTab === "ai" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-8">
                        {/* Step A: Category */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">📂 Choose Category</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                {topicCategories.map(cat => (
                                    <button key={cat.id} onClick={() => setSelectedCategory(selectedCategory === cat.id ? "" : cat.id)}
                                        className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${selectedCategory === cat.id
                                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                            : "bg-white/[0.03] text-slate-500 dark:text-zinc-400 border border-white/[0.06] hover:bg-white/[0.06]"
                                            }`}
                                    >
                                        {cat.icon} {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Step B: Difficulty */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">📐 Choose Difficulty</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {difficultyLevels.map(diff => (
                                    <button key={diff.id} onClick={() => setSelectedDifficulty(selectedDifficulty === diff.id ? "" : diff.id)}
                                        className={`p-4 rounded-xl text-center transition-all ${selectedDifficulty === diff.id
                                            ? `bg-${diff.color}-500/20 text-${diff.color}-300 border border-${diff.color}-500/30`
                                            : "bg-white/[0.03] text-slate-500 dark:text-zinc-400 border border-white/[0.06] hover:bg-white/[0.06]"
                                            }`}
                                    >
                                        <span className="text-2xl block mb-1">{diff.icon}</span>
                                        <p className="text-sm font-bold">{diff.label}</p>
                                        <p className="text-[10px] text-zinc-500">{diff.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Step C: Style */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">🎨 Choose Topic Style</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {topicStyles.map(style => (
                                    <button key={style.id} onClick={() => setSelectedStyle(selectedStyle === style.id ? "" : style.id)}
                                        className={`p-4 rounded-xl transition-all text-left ${selectedStyle === style.id
                                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                            : "bg-white/[0.03] text-slate-500 dark:text-zinc-400 border border-white/[0.06] hover:bg-white/[0.06]"
                                            }`}
                                    >
                                        <span className="text-xl mb-1 block">{style.icon}</span>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{style.label}</p>
                                        <p className="text-[10px] text-zinc-500">{style.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Step D: Generate */}
                        {!isGenerating && !generatedTopic && (
                            <Button onClick={handleGenerate} className="w-full h-14 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-900 dark:text-white font-bold rounded-xl text-lg shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                <Sparkles className="w-5 h-5 mr-2" /> 🤖 Generate Topic
                            </Button>
                        )}
                        {/* Loading Animation */}
                        {isGenerating && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/15 flex items-center justify-center">
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                                        <Sparkles className="w-10 h-10 text-emerald-400" />
                                    </motion.div>
                                </div>
                                <motion.p className="text-sm text-slate-500 dark:text-zinc-400" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                                    Crafting the perfect discussion topic...
                                </motion.p>
                            </motion.div>
                        )}
                        {/* Generated Topic */}
                        {generatedTopic && !isGenerating && (
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                                <TopicDetailCard topic={generatedTopic} saved={savedTopics.has(generatedTopic.id)} onSave={() => toggleSave(generatedTopic.id)} />
                                <div className="flex flex-wrap gap-3 mt-4">
                                    <Button onClick={handleGenerate} variant="outline" className="border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-xl bg-transparent hover:bg-white/5"><RefreshCw className="w-4 h-4 mr-2" /> Regenerate</Button>
                                    <Button onClick={() => { setOwnTopic(generatedTopic.title); setActiveTab("own"); setGeneratedTopic(null) }} variant="outline" className="border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-xl bg-transparent hover:bg-white/5"><Pencil className="w-4 h-4 mr-2" /> Edit Topic</Button>
                                    <Button onClick={() => setConfirmedTopic(generatedTopic)} className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 dark:text-white font-bold rounded-xl">✅ Use This Topic</Button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* ═════ TAB: TOPIC LIBRARY ═════ */}
                {activeTab === "library" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        {/* Search */}
                        <div className="relative mb-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input value={librarySearch} onChange={e => setLibrarySearch(e.target.value)} placeholder="Search topics..." className="w-full h-11 pl-11 pr-10 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/40 text-sm" />
                            {librarySearch && <button onClick={() => setLibrarySearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-slate-900 dark:text-white"><X className="w-4 h-4" /></button>}
                        </div>
                        {/* Category pills */}
                        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 mb-6">
                            <button onClick={() => setLibraryCategory("all")} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${libraryCategory === "all" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-white/[0.04] text-slate-500 dark:text-zinc-400 border border-white/[0.06] hover:bg-white/[0.08]"}`}>🔵 All</button>
                            {topicCategories.map(cat => (
                                <button key={cat.id} onClick={() => setLibraryCategory(cat.id)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${libraryCategory === cat.id ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-white/[0.04] text-slate-500 dark:text-zinc-400 border border-white/[0.06] hover:bg-white/[0.08]"}`}>
                                    {cat.icon} {cat.label}
                                </button>
                            ))}
                        </div>
                        {/* Trending Badge Section */}
                        {libraryCategory === "all" && !librarySearch && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2"><Flame className="w-4 h-4 text-orange-400" /> Trending This Week</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {topicLibrary.filter(t => t.isTrending).map(t => (
                                        <div key={t.id} onClick={() => setConfirmedTopic(t)} className="p-4 rounded-xl bg-white/[0.03] border border-orange-500/15 hover:bg-white/[0.05] cursor-pointer transition-all">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-1.5 py-0.5 text-[8px] font-bold bg-orange-500/20 text-orange-300 rounded">🔥 TRENDING</span>
                                                <span className="text-xs text-amber-400">⭐ {t.rating}</span>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.title}</p>
                                            <p className="text-[10px] text-zinc-500 mt-1">{t.timesDiscussed.toLocaleString()} discussions</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Topic List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredLibrary.map(topic => (
                                <div key={topic.id} onClick={() => setConfirmedTopic(topic)} className="p-4 rounded-xl bg-white dark:bg-zinc-900/40 border border-white/[0.06] hover:bg-white/[0.04] hover:border-emerald-500/20 cursor-pointer transition-all group">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                            {topic.isNew && <span className="px-1.5 py-0.5 text-[8px] font-bold bg-cyan-500/20 text-cyan-300 rounded">NEW</span>}
                                            <span className="text-[10px] text-zinc-500">{topicCategories.find(c => c.id === topic.category)?.icon} {topic.category}</span>
                                        </div>
                                        <button onClick={e => { e.stopPropagation(); toggleSave(topic.id) }} className="text-zinc-600 hover:text-red-400 transition-colors">
                                            <Heart className={`w-3.5 h-3.5 ${savedTopics.has(topic.id) ? "text-red-400 fill-red-400" : ""}`} />
                                        </button>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-emerald-300 transition-colors">{topic.title}</p>
                                    <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                                        <span>{difficultyLevels.find(d => d.id === topic.difficulty)?.icon} {topic.difficulty}</span>
                                        <span className="text-amber-400">⭐ {topic.rating}</span>
                                        <span>{topic.timesDiscussed.toLocaleString()} discussed</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filteredLibrary.length === 0 && <p className="text-center py-10 text-zinc-500">No topics found matching your search.</p>}
                    </motion.div>
                )}

                {/* ═════ TAB: SURPRISE ME ═════ */}
                {activeTab === "surprise" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center">
                        {!surpriseTopic && !isSpinning && (
                            <div className="py-12">
                                <p className="text-6xl mb-6">🎲</p>
                                <h3 className="text-xl font-bold mb-2">Feeling Spontaneous?</h3>
                                <p className="text-slate-500 dark:text-zinc-400 mb-8">Let fate choose your discussion topic!</p>
                                <Button onClick={handleSurprise} className="h-14 px-10 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 dark:text-white font-bold rounded-xl text-lg shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                                    🎲 Surprise Me!
                                </Button>
                            </div>
                        )}
                        {isSpinning && (
                            <div className="py-16">
                                <motion.div className="text-7xl inline-block" animate={{ rotate: 720 }} transition={{ duration: 1.2, ease: [0.17, 0.67, 0.21, 0.97] }}>🎲</motion.div>
                                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-6">Spinning the wheel...</p>
                            </div>
                        )}
                        {surpriseTopic && !isSpinning && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                                <TopicDetailCard topic={surpriseTopic} saved={savedTopics.has(surpriseTopic.id)} onSave={() => toggleSave(surpriseTopic.id)} />
                                <div className="flex gap-3 mt-4">
                                    <Button onClick={handleSurprise} variant="outline" className="flex-1 border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-xl bg-transparent hover:bg-white/5">🎲 Spin Again</Button>
                                    <Button onClick={() => setConfirmedTopic(surpriseTopic)} className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 dark:text-white font-bold rounded-xl">✅ Use This Topic</Button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    )
}

function TopicDetailCard({ topic, saved, onSave }: { topic: DiscussionTopic; saved: boolean; onSave: () => void }) {
    const diff = difficultyLevels.find(d => d.id === topic.difficulty)
    const cat = topicCategories.find(c => c.id === topic.category)
    return (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-emerald-500/15 text-left">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold">{cat?.icon} {cat?.label || topic.category}</span>
                    <span className="text-[10px] font-bold">{diff?.icon} {diff?.label}</span>
                </div>
                <button onClick={onSave} className="text-zinc-500 hover:text-red-400"><Heart className={`w-4 h-4 ${saved ? "text-red-400 fill-red-400" : ""}`} /></button>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{topic.title}</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-4">{topic.description}</p>
            <div className="flex items-center gap-4 text-[10px] text-zinc-500 mb-4">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{topic.estimatedDuration}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{topic.idealGroupSize} participants</span>
                <span className="text-amber-400 flex items-center gap-1">⭐ {topic.rating}</span>
                <span>🔥 {topic.controversyLevel} controversy</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/10">
                    <p className="text-[10px] text-emerald-400 font-bold mb-1 flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> Pro Side</p>
                    <p className="text-xs text-slate-600 dark:text-zinc-300">{topic.proSide}</p>
                </div>
                <div className="p-3 rounded-xl bg-red-500/[0.06] border border-red-500/10">
                    <p className="text-[10px] text-red-400 font-bold mb-1 flex items-center gap-1"><ThumbsDown className="w-3 h-3" /> Con Side</p>
                    <p className="text-xs text-slate-600 dark:text-zinc-300">{topic.conSide}</p>
                </div>
            </div>
            <div className="mb-3">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Key Discussion Points</p>
                <ul className="space-y-1">{topic.keyPoints.map((p, i) => <li key={i} className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-2"><span className="text-emerald-400">•</span>{p}</li>)}</ul>
            </div>
            {topic.facts.length > 0 && (
                <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Fun Facts</p>
                    <ul className="space-y-1">{topic.facts.map((f, i) => <li key={i} className="text-xs text-cyan-400/80 flex items-center gap-2">💡 {f}</li>)}</ul>
                </div>
            )}
        </div>
    )
}

export default function TopicSelectionPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <TopicSelectionContent />
        </Suspense>
    )
}
