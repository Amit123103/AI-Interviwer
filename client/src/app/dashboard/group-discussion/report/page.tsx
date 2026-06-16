"use client"

import React, { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, ChevronRight, Download, Share2, RefreshCw, Users, Trophy, CheckCircle2, XCircle, AlertTriangle, Star, Clock, Mic, MessageSquare, Target, Volume2, HandshakeIcon, Brain, Ear, ChevronDown, ChevronUp, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"

const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false })
const RadarChart = dynamic(() => import("recharts").then(m => m.RadarChart), { ssr: false })
const PolarGrid = dynamic(() => import("recharts").then(m => m.PolarGrid), { ssr: false })
const PolarAngleAxis = dynamic(() => import("recharts").then(m => m.PolarAngleAxis), { ssr: false })
const Radar = dynamic(() => import("recharts").then(m => m.Radar), { ssr: false })

const performanceScores = [
    { skill: "Confidence", value: 82, icon: <Mic className="w-3.5 h-3.5" />, color: "violet" },
    { skill: "Communication", value: 76, icon: <MessageSquare className="w-3.5 h-3.5" />, color: "blue" },
    { skill: "Relevance", value: 88, icon: <Target className="w-3.5 h-3.5" />, color: "emerald" },
    { skill: "Voice Modulation", value: 71, icon: <Volume2 className="w-3.5 h-3.5" />, color: "cyan" },
    { skill: "Time Balance", value: 65, icon: <Clock className="w-3.5 h-3.5" />, color: "amber" },
    { skill: "Team Participation", value: 79, icon: <HandshakeIcon className="w-3.5 h-3.5" />, color: "pink" },
    { skill: "Point Quality", value: 84, icon: <Brain className="w-3.5 h-3.5" />, color: "violet" },
    { skill: "Active Listening", value: 72, icon: <Ear className="w-3.5 h-3.5" />, color: "teal" },
]

const grammarErrors = [
    { wrong: "I doesn't think that is correct", correct: "I don't think that is correct", type: "Subject-Verb Agreement" },
    { wrong: "We should focusing on the main issue", correct: "We should focus on the main issue", type: "Verb Form" },
    { wrong: "This is more better than the alternative", correct: "This is better than the alternative", type: "Comparative Form" },
]

const fillerWords = { total: 8, breakdown: [{ word: "Umm", count: 3 }, { word: "Like", count: 3 }, { word: "Basically", count: 2 }] }

const strengths = [
    { quote: "The real question is whether long-term sustainability outweighs short-term economic gains for developing nations.", label: "Strong analytical point" },
    { quote: "If we look at the Finland model, minimal tech in classrooms actually produced better outcomes.", label: "Excellent use of evidence" },
    { quote: "Let me summarize what we've discussed so far before we move forward.", label: "Leadership moment" },
]

const transcript = [
    { time: "01:15", text: "I think we need to consider both sides of this argument.", quality: "good" },
    { time: "02:30", text: "The data clearly shows that, umm, there is a correlation between...", quality: "warning" },
    { time: "03:45", text: "I doesn't think that is correct based on what Priya said.", quality: "error" },
    { time: "05:00", text: "The real question is whether long-term sustainability outweighs short-term economic gains.", quality: "excellent" },
    { time: "06:15", text: "We should focusing on the main issue here.", quality: "error" },
    { time: "07:30", text: "If we look at the Finland model, minimal tech in classrooms actually produced better outcomes.", quality: "excellent" },
    { time: "09:00", text: "Like, basically, I agree with what everyone is, like, saying.", quality: "warning" },
    { time: "10:15", text: "Let me summarize what we've discussed so far before we move forward.", quality: "excellent" },
]

function ReportContent() {
    const searchParams = useSearchParams()
    const topic = decodeURIComponent(searchParams.get("topic") || "Discussion Topic")
    const [showFullTranscript, setShowFullTranscript] = useState(false)
    const overallScore = 77
    const grade = "B+"

    const radarData = performanceScores.map(s => ({ skill: s.skill, value: s.value }))

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="particle-orb absolute w-72 h-72 rounded-full bg-emerald-500/10 blur-[120px] top-[10%] left-[15%]" />
                <div className="particle-orb absolute w-96 h-96 rounded-full bg-violet-500/8 blur-[140px] top-[50%] right-[10%]" />
            </div>

            <div className="relative z-10 max-w-[1000px] mx-auto px-6 md:px-16 py-8 pb-32">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
                    <Link href="/dashboard/group-discussion" className="hover:text-slate-900 dark:text-white transition-colors flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Group Discussion</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-emerald-400 font-medium">Report Card</span>
                </div>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
                        <div className="flex-1">
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Session Report</p>
                            <h1 className="text-2xl md:text-3xl font-black mb-2">{topic}</h1>
                            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-zinc-400">
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 22 min</span>
                                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> 5 participants</span>
                                <span>March 8, 2026</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-center px-6 py-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 border border-emerald-500/20">
                                <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.3 }} className="text-4xl font-black text-emerald-400">{grade}</motion.p>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Grade</p>
                            </div>
                            <div className="text-center px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-4xl font-black text-slate-900 dark:text-white">{overallScore}</motion.p>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">/ 100</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Section 1: Performance Scores */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">📊 Performance Scores</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Radar Chart */}
                        <div className="p-5 rounded-2xl bg-white/60 dark:bg-zinc-900/50 border border-white/[0.06]">
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                                        <PolarAngleAxis dataKey="skill" tick={{ fill: "#9ca3af", fontSize: 10 }} />
                                        <Radar name="Score" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        {/* Progress Bars */}
                        <div className="space-y-3">
                            {performanceScores.map(s => (
                                <div key={s.skill} className="p-3 rounded-xl bg-white dark:bg-zinc-900/30 border border-white/[0.04]">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs font-semibold text-slate-600 dark:text-zinc-300 flex items-center gap-1.5">{s.icon} {s.skill}</span>
                                        <span className={`text-xs font-bold text-${s.color}-400`}>{s.value}/100</span>
                                    </div>
                                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${s.value}%` }} transition={{ duration: 1, delay: 0.5 }} className={`h-full bg-${s.color}-500 rounded-full`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Section 2: Errors (Red) */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">❌ Errors Found</h2>
                    <div className="space-y-3 mb-4">
                        {grammarErrors.map((err, i) => (
                            <div key={i} className="p-4 rounded-xl bg-red-500/[0.05] border border-red-500/15">
                                <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">{err.type}</span>
                                <p className="text-sm text-red-300 line-through mt-1">❌ {err.wrong}</p>
                                <p className="text-sm text-emerald-300 mt-1">✅ {err.correct}</p>
                            </div>
                        ))}
                    </div>
                    {/* Filler Words */}
                    <div className="p-4 rounded-xl bg-amber-500/[0.05] border border-amber-500/15">
                        <p className="text-sm font-bold text-amber-300 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Filler Words: {fillerWords.total} total</p>
                        <div className="flex gap-3">
                            {fillerWords.breakdown.map(fw => (
                                <span key={fw.word} className="px-3 py-1 rounded-full bg-amber-500/10 text-xs text-amber-300">{fw.word}: {fw.count}</span>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Section 3: Strengths (Green) */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">✅ What You Did Well</h2>
                    <div className="space-y-3">
                        {strengths.map((s, i) => (
                            <div key={i} className="p-4 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/15">
                                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">{i === 0 ? "⭐ Best Moment" : "✅"} {s.label}</span>
                                <p className="text-sm text-emerald-200 mt-1 italic">&ldquo;{s.quote}&rdquo;</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Section 4: Transcript */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">📋 Your Transcript</h2>
                        <button onClick={() => setShowFullTranscript(!showFullTranscript)} className="text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white flex items-center gap-1 transition-colors">
                            {showFullTranscript ? <><ChevronUp className="w-3 h-3" /> Show Less</> : <><ChevronDown className="w-3 h-3" /> Show All</>}
                        </button>
                    </div>
                    <div className="space-y-2">
                        {(showFullTranscript ? transcript : transcript.slice(0, 4)).map((t, i) => (
                            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${t.quality === "excellent" ? "bg-emerald-500/[0.04] border-emerald-500/15" : t.quality === "error" ? "bg-red-500/[0.04] border-red-500/15" : t.quality === "warning" ? "bg-amber-500/[0.04] border-amber-500/15" : "bg-white/[0.02] border-white/[0.04]"}`}>
                                <span className="text-[10px] text-zinc-500 font-mono shrink-0 mt-0.5">{t.time}</span>
                                <p className={`text-sm ${t.quality === "excellent" ? "text-emerald-300" : t.quality === "error" ? "text-red-300" : t.quality === "warning" ? "text-amber-300" : "text-slate-600 dark:text-zinc-300"}`}>{t.text}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Section 5: Action Plan */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-violet-500/[0.06] to-cyan-500/[0.06] border border-violet-500/15">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">🎯 Action Plan</h2>
                    <div className="space-y-3">
                        {[
                            "Practice eliminating filler words — try the Filler Word Eliminator interview mode",
                            "Work on speaking time balance — aim for 20-25% in a 5-person group",
                            "Continue using evidence-based arguments — this is your strongest skill",
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <span className="text-emerald-400 mt-0.5 shrink-0">{i + 1}.</span>
                                <p className="text-sm text-slate-600 dark:text-zinc-300">{item}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                    <Button variant="outline" className="border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-xl bg-transparent hover:bg-white/5"><Download className="w-4 h-4 mr-2" /> Download PDF</Button>
                    <Button variant="outline" className="border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-xl bg-transparent hover:bg-white/5"><Share2 className="w-4 h-4 mr-2" /> Share</Button>
                    <Button variant="outline" className="border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-xl bg-transparent hover:bg-white/5"><RefreshCw className="w-4 h-4 mr-2" /> Retry Same Topic</Button>
                    <Button variant="outline" className="border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-xl bg-transparent hover:bg-white/5"><Users className="w-4 h-4 mr-2" /> Group Report</Button>
                    <Link href="/dashboard/group-discussion">
                        <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 dark:text-white font-bold rounded-xl"><Home className="w-4 h-4 mr-2" /> Back to Group Discussion</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function ReportPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <ReportContent />
        </Suspense>
    )
}
