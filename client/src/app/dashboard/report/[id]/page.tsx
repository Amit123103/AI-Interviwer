"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Loader2, Share2, Check, Lock, Github, Download, Trophy, Video,
    Brain, Target, MessageSquare, TrendingUp, ChevronRight,
    Sparkles, Star, CheckCircle2, AlertCircle, BarChart3, Layers, Zap
} from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    LineChart, Line, ReferenceLine
} from 'recharts'

// ─── Readiness Config ─────────────────────────────────────────────────────────
const READINESS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
    'Beginner': { label: 'Beginner', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: '🌱' },
    'Developing': { label: 'Developing', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: '📈' },
    'Job Ready': { label: 'Job Ready', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: '💼' },
    'Interview Ready': { label: 'Interview Ready', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: '🏆' },
}

const METRIC_LABELS: Record<string, { label: string; color: string }> = {
    technicalCorrectness: { label: 'Technical Correctness', color: '#3b82f6' },
    communication: { label: 'Communication', color: '#8b5cf6' },
    confidence: { label: 'Confidence', color: '#f59e0b' },
    clarityStructure: { label: 'Clarity & Structure', color: '#06b6d4' },
    relevance: { label: 'Relevance', color: '#10b981' },
    conceptCoverage: { label: 'Concept Coverage', color: '#ec4899' },
}

function ReadinessBadge({ level }: { level: string }) {
    const cfg = READINESS_CONFIG[level] || READINESS_CONFIG['Developing']
    return (
        <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border font-black text-sm uppercase tracking-widest ${cfg.bg} ${cfg.border} ${cfg.color}`}>
            <span>{cfg.icon}</span>
            {cfg.label}
        </div>
    )
}

function ScoreBar({ value, color, label }: { value: number; color: string; label: string }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-zinc-400 font-medium">{label}</span>
                <span className="font-bold" style={{ color }}>{value}%</span>
            </div>
            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                />
            </div>
        </div>
    )
}

// ─── Answer Quality Timeline ──────────────────────────────────────────────────
function AnswerQualityTimeline({ questionFeedback }: { questionFeedback: { question: string; score: number; feedback: string }[] }) {
    const data = questionFeedback.map((qf, i) => ({ name: `Q${i + 1}`, score: qf.score, question: qf.question }))
    const avg = Math.round(data.reduce((s, d) => s + d.score, 0) / data.length)
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <Card className="bg-white dark:bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                            <TrendingUp className="w-4 h-4 text-primary" /> Answer Quality Timeline
                        </span>
                        <span className="text-xs font-bold text-zinc-500">Avg <span className="text-primary">{avg}%</span></span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -28 }}>
                                <defs>
                                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: 8 }}
                                    labelStyle={{ color: '#fff', fontWeight: 700, fontSize: 12 }}
                                    formatter={(val: any, _: any, props: any) => [
                                        <span key="v" className="text-primary font-black">{val}%</span>,
                                        props.payload?.question?.slice(0, 40) + '…'
                                    ]}
                                />
                                <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Target', fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }} />
                                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-2">Dashed line = 70% target threshold</p>
                </CardContent>
            </Card>
        </motion.div>
    )
}

// ─── Company Readiness Card ───────────────────────────────────────────────────
const AI_URL = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000'

function CompanyReadinessCard({ report, displayScore }: { report: any; displayScore: number }) {
    const [state, setState] = React.useState<'idle' | 'loading' | 'done' | 'error'>('idle')
    const [result, setResult] = React.useState<{ fitScore: number; verdict: string; companyInsight: string; actionPlan: string[] } | null>(null)

    const generate = async () => {
        setState('loading')
        try {
            const res = await fetch(`${AI_URL}/company-readiness`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    overall_score: displayScore,
                    sector: report.sector || 'General',
                    target_company: report.targetCompany || '',
                    job_description: report.jobDescription || '',
                    ollama_evaluation: report.ollamaEvaluation || {}
                })
            })
            if (!res.ok) throw new Error('AI service error')
            const data = await res.json()
            setResult(data)
            setState('done')
        } catch {
            setState('error')
        }
    }

    const fit = result?.fitScore ?? 0
    const radius = 54
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (circumference * fit) / 100
    const fitColor = fit >= 70 ? '#10b981' : fit >= 50 ? '#f59e0b' : '#ef4444'

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-white dark:bg-zinc-900 border-zinc-800 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                        <Target className="w-4 h-4 text-pink-400" />
                        {report.targetCompany ? `${report.targetCompany} Readiness` : 'Company Readiness Score'}
                    </CardTitle>
                    {state === 'idle' && (
                        <Button size="sm" onClick={generate}
                            className="h-8 px-4 text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-slate-900 dark:text-white border-0">
                            <Zap className="w-3.5 h-3.5 mr-1.5" /> Analyse Fit
                        </Button>
                    )}
                    {state === 'loading' && (
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Ollama thinking…
                        </div>
                    )}
                </CardHeader>

                <CardContent>
                    {state === 'idle' && (
                        <p className="text-sm text-zinc-500 py-4 text-center">
                            Click <span className="text-slate-900 dark:text-white font-bold">Analyse Fit</span> to see how ready you are for {report.targetCompany || 'your target company'}.
                        </p>
                    )}
                    {state === 'error' && (
                        <p className="text-sm text-red-400 py-4 text-center">AI service unavailable. Make sure Ollama is running.</p>
                    )}
                    {state === 'done' && result && (
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            {/* Circular gauge */}
                            <div className="relative shrink-0">
                                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r={radius} strokeWidth="9" fill="transparent" className="stroke-zinc-800" />
                                    <motion.circle
                                        cx="60" cy="60" r={radius} strokeWidth="9" fill="transparent"
                                        stroke={fitColor}
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        initial={{ strokeDashoffset: circumference }}
                                        animate={{ strokeDashoffset: offset }}
                                        transition={{ duration: 1.2, ease: 'easeOut' }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black" style={{ color: fitColor }}>{fit}%</span>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Fit Score</span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="p-3 rounded-xl bg-white dark:bg-black/40 border border-zinc-800">
                                    <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">Verdict</p>
                                    <p className="text-sm text-slate-900 dark:text-zinc-200 font-medium">{result.verdict}</p>
                                </div>
                                {result.companyInsight && (
                                    <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/20">
                                        <p className="text-xs font-black uppercase tracking-widest text-violet-400 mb-1">Company Insight</p>
                                        <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">{result.companyInsight}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-pink-400 mb-2 flex items-center gap-1.5">
                                        <ChevronRight className="w-3.5 h-3.5" /> 3-Step Action Plan
                                    </p>
                                    <ol className="space-y-2">
                                        {result.actionPlan.map((step, i) => (
                                            <li key={i} className="flex gap-3 items-start">
                                                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-[10px] font-black text-slate-900 dark:text-white shrink-0 mt-0.5">{i + 1}</span>
                                                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">{step}</p>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}


function ReportPageContent() {
    const params = useParams()
    const searchParams = useSearchParams()
    const [report, setReport] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isOwner, setIsOwner] = useState(false)
    const [copied, setCopied] = useState(false)
    const [mentorComment, setMentorComment] = useState("")
    const [isSubmittingComment, setIsSubmittingComment] = useState(false)

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const token = localStorage.getItem("token")
                const headers: any = {}
                if (token) headers.Authorization = `Bearer ${token}`
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/reports/${params.id}`, { headers })
                if (res.ok) {
                    const data = await res.json()
                    setReport(data)
                    if (token) {
                        try {
                            const user = JSON.parse(localStorage.getItem("user") || "{}")
                            if (data.userId === user._id || data.userId?._id === user._id) setIsOwner(true)
                        } catch { }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch report", error)
            } finally {
                setLoading(false)
            }
        }
        fetchReport()
    }, [params.id])

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleExportGithub = () => {
        const avgScore = displayScore
        const markdown = `# 🚀 Interview Report: ${report.sector || "General"}\n\n## 📊 Overall Score: ${avgScore}%\n**Readiness Level:** ${report.readinessLevel || 'N/A'}\n\n### Metrics\n${ollamaMetrics.map(m => `- **${m.metric}**: ${m.value}%`).join('\n')}\n\n### Strengths\n${(report.ollamaEvaluation?.strengths || report.feedback?.strengths || []).map((s: string) => `- ${s}`).join('\n')}\n\n### Areas for Improvement\n${(report.ollamaEvaluation?.improvementAreas || report.feedback?.improvements || []).map((s: string) => `- ${s}`).join('\n')}\n`
        const blob = new Blob([markdown], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Interview-Report-${new Date().toISOString().split('T')[0]}.md`
        a.click()
        setTimeout(() => URL.revokeObjectURL(url), 100)
    }

    const handleMentorComment = async () => {
        if (!mentorComment.trim()) return
        setIsSubmittingComment(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/reviews/mentor`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ reportId: report._id, text: mentorComment })
            })
            if (res.ok) {
                const d = await res.json()
                setReport(d.report)
                setMentorComment("")
            }
        } catch { } finally {
            setIsSubmittingComment(false)
        }
    }

    if (loading) return <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white"><Loader2 className="animate-spin w-8 h-8" /></div>
    if (!report) return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white gap-4">
            <Lock className="w-16 h-16 text-zinc-700" />
            <h1 className="text-2xl font-bold">Report Not Found or Private</h1>
            <Link href="/"><Button>Go Home</Button></Link>
        </div>
    )

    // ── Score resolution: prefer ollamaEvaluation ───────────────────────────
    const ollama = report.ollamaEvaluation || report
    const displayScore = report.overallScore || Math.round(((report.scores?.technical || 0) + (report.scores?.communication || 0) + (report.scores?.confidence || 0) + ((report.scores?.engagement || 0) / 10)) / 4)
    const readinessLevel = report.readinessLevel || (displayScore >= 80 ? 'Interview Ready' : displayScore >= 60 ? 'Job Ready' : 'Developing')
    const metrics = report.ollamaEvaluation?.metrics || report.scores || {}
    const ollamaMetrics = [
        { metric: 'Tech Correctness', value: metrics.technicalCorrectness || 0, key: 'technicalCorrectness' },
        { metric: 'Communication', value: metrics.communication || 0, key: 'communication' },
        { metric: 'Confidence', value: metrics.confidence || 0, key: 'confidence' },
        { metric: 'Clarity', value: metrics.clarityStructure || 0, key: 'clarityStructure' },
        { metric: 'Relevance', value: metrics.relevance || 0, key: 'relevance' },
        { metric: 'Concept Coverage', value: metrics.conceptCoverage || 0, key: 'conceptCoverage' },
    ]

    const radarData = ollamaMetrics.map(m => ({ subject: m.metric.split(' ')[0], value: m.value, fullMark: 100 }))

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-4 md:p-10 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header Nav */}
                <div className="flex flex-wrap justify-between items-center gap-3">
                    <Link href={isOwner ? "/dashboard" : "/"}>
                        <Button variant="outline" className="text-slate-500 dark:text-zinc-400 border-zinc-800 hover:text-slate-900 dark:text-white">
                            {isOwner ? "← Dashboard" : "Try AI Interviewer"}
                        </Button>
                    </Link>
                    <div className="flex flex-wrap gap-2">
                        {isOwner && <Button onClick={handleExportGithub} variant="outline" className="gap-2 border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white"><Github className="w-4 h-4" /> Export MD</Button>}
                        {isOwner && report.videoUrl && (
                            <Link href={`/dashboard/report/${report._id}/playback`}>
                                <Button variant="outline" className="gap-2 border-primary/20 text-primary hover:bg-primary/5"><Video className="w-4 h-4" /> Recording</Button>
                            </Link>
                        )}
                        {isOwner && displayScore >= 70 && (
                            <Link href={`/dashboard/negotiation?reportId=${report._id}`}>
                                <Button className="gap-2 bg-primary text-black font-black hover:bg-primary/90"><Trophy className="w-4 h-4" /> Salary Practice</Button>
                            </Link>
                        )}
                        <Button onClick={handleShare} className="gap-2 bg-zinc-800 hover:bg-zinc-700">
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                            {copied ? "Copied!" : "Share"}
                        </Button>
                    </div>
                </div>

                {/* ── HERO CARD ─────────────────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="bg-white dark:bg-zinc-900 border-zinc-800 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-cyan-500 to-emerald-500" />
                        <CardContent className="flex flex-col md:flex-row items-center gap-10 py-10 px-6">

                            {/* Score ring */}
                            <div className="relative shrink-0">
                                <svg className="w-36 h-36 -rotate-90">
                                    <circle cx="72" cy="72" r="62" strokeWidth="10" fill="transparent" className="stroke-zinc-800" />
                                    <circle cx="72" cy="72" r="62" strokeWidth="10" fill="transparent"
                                        strokeDasharray={390}
                                        strokeDashoffset={390 - (390 * displayScore) / 100}
                                        className={`transition-all duration-1000 ease-out ${displayScore >= 80 ? 'stroke-green-400' : displayScore >= 60 ? 'stroke-amber-400' : 'stroke-red-400'}`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-black">{displayScore}%</span>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Overall</span>
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">
                                        {report.sector || "General"} Interview · {report.interviewType || "Mixed"}
                                    </p>
                                    <h1 className="text-3xl md:text-4xl font-black leading-tight">
                                        {displayScore >= 80 ? "Excellent Performance!" : displayScore >= 60 ? "Good Effort!" : "Keep Practising!"}
                                    </h1>
                                    <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">
                                        {new Date(report.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>

                                {/* Readiness badge */}
                                <ReadinessBadge level={readinessLevel} />

                                {/* AI Summary */}
                                {ollama?.interview_summary && (
                                    <div className="bg-white dark:bg-black/40 border border-zinc-800 rounded-xl p-4 text-left">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">AI Insights</span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed italic">"{ollama.interview_summary}"</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* ── OLLAMA 6-METRIC BREAKDOWN ─────────────────────────────── */}
                {ollama && ollamaMetrics.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="bg-white dark:bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                                    <BarChart3 className="w-4 h-4 text-primary" /> AI Evaluation — 6 Dimensions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Bar breakdown */}
                                    <div className="space-y-4">
                                        {ollamaMetrics.map(m => (
                                            <ScoreBar
                                                key={m.key}
                                                value={m.value}
                                                color={METRIC_LABELS[m.key]?.color || '#6366f1'}
                                                label={m.metric}
                                            />
                                        ))}
                                    </div>

                                    {/* Radar chart */}
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                                                <PolarGrid stroke="#27272a" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                <Radar name="Score" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Strengths / Improvements from Ollama */}
                                <div className="grid md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-zinc-800">
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-widest text-green-400 mb-3 flex items-center gap-1.5"><CheckCircle2 size={12} /> Technical Strengths</h4>
                                        <ul className="space-y-2">
                                            {(ollama.technical_strengths ? [ollama.technical_strengths] : (ollama.strengths || [])).map((s: string, i: number) => (
                                                <li key={i} className="flex gap-2 items-start text-sm text-slate-600 dark:text-zinc-300">
                                                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-widest text-purple-400 mb-3 flex items-center gap-1.5"><Brain size={12} /> Behavioral Analysis</h4>
                                        <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                                            {ollama.behavioral_analysis || "Maintained consistent eye contact and technical confidence throughout the session."}
                                        </p>
                                    </div>
                                </div>

                                {ollama.system_design_review && ollama.system_design_review !== "No whiteboard data" && (
                                    <div className="mt-6 pt-6 border-t border-zinc-800">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-3 flex items-center gap-1.5"><Layers size={12} /> System Design Review</h4>
                                        <div className="p-4 bg-white dark:bg-black/40 rounded-xl border border-cyan-500/10">
                                            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">{ollama.system_design_review}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* ── Q-BY-Q FEEDBACK ───────────────────────────────────────── */}
                {report.questionFeedback && report.questionFeedback.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <Card className="bg-white dark:bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                                    <Layers className="w-4 h-4 text-cyan-400" /> Question-by-Question Feedback
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {report.questionFeedback.map((qf: any, i: number) => {
                                    const scoreColor = qf.score >= 80 ? 'text-green-400' : qf.score >= 60 ? 'text-amber-400' : 'text-red-400'
                                    const borderColor = qf.score >= 80 ? 'border-green-500/20' : qf.score >= 60 ? 'border-amber-500/20' : 'border-red-500/20'
                                    return (
                                        <div key={i} className={`p-5 rounded-xl bg-slate-50 dark:bg-black border ${borderColor} space-y-3`}>
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex items-start gap-3">
                                                    <span className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-black text-slate-500 dark:text-zinc-400 shrink-0">{i + 1}</span>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-zinc-200 leading-relaxed">{qf.question}</p>
                                                </div>
                                                <span className={`text-xl font-black shrink-0 ${scoreColor}`}>{qf.score}%</span>
                                            </div>
                                            {qf.feedback && (
                                                <div className="pl-10 flex gap-2">
                                                    <Brain className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">{qf.feedback}</p>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* ── BEHAVIORAL DNA ────────────────────────────────────────── */}
                {report.behavioralDNA && report.behavioralDNA.length > 0 && (
                    <Card className="bg-white dark:bg-zinc-950 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                <Brain className="w-4 h-4 text-primary" /> Behavioral DNA (Emotional Heatmap)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-32 pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={report.behavioralDNA}>
                                    <defs>
                                        <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="timestamp" hide />
                                    <YAxis hide domain={[0, 10]} />
                                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const d = payload[0].payload
                                                return (
                                                    <div className="bg-slate-50 dark:bg-black border border-zinc-800 p-2 rounded shadow-xl">
                                                        <p className="text-[10px] font-bold text-zinc-500 uppercase">{d.emotion}</p>
                                                        <p className="text-xs font-black text-slate-900 dark:text-white">Intensity: {d.intensity}/10</p>
                                                    </div>
                                                )
                                            }
                                            return null
                                        }} />
                                    <Area type="monotone" dataKey="intensity" stroke="#10b981" fillOpacity={1} fill="url(#colorIntensity)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* ── ANSWER QUALITY TIMELINE ───────────────────────────────── */}
                {report.questionFeedback && report.questionFeedback.length > 1 && (
                    <AnswerQualityTimeline questionFeedback={report.questionFeedback} />
                )}

                {/* ── COMPANY READINESS SCORE ───────────────────────────────── */}
                <CompanyReadinessCard report={report} displayScore={displayScore} />

                {/* ── TABS: OVERVIEW + DEEP AI ──────────────────────────────── */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-white dark:bg-zinc-900 border border-zinc-800 p-1">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-zinc-800">Overview</TabsTrigger>
                        <TabsTrigger value="deep-scan" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                            <Brain className="w-4 h-4 mr-2" /> Deep AI Analysis
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 outline-none">
                        {/* Fallback strengths/improvements when no Ollama */}
                        {!ollama && (
                            <div className="grid md:grid-cols-2 gap-6">
                                <Card className="bg-white/60 dark:bg-zinc-900/50 border-zinc-800">
                                    <CardHeader><CardTitle className="text-green-400">Strengths</CardTitle></CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {(report.feedback?.strengths || ["Great clarity", "Good technical depth"]).map((s: string, i: number) => (
                                                <li key={i} className="flex gap-2 items-start text-slate-600 dark:text-zinc-300">
                                                    <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white/60 dark:bg-zinc-900/50 border-zinc-800">
                                    <CardHeader><CardTitle className="text-orange-400">Areas for Improvement</CardTitle></CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {(report.feedback?.improvements || ["Be more concise", "Use STAR method"]).map((s: string, i: number) => (
                                                <li key={i} className="flex gap-2 items-start text-slate-600 dark:text-zinc-300">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" /> {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Basic 3-score grid */}
                        <Card className="bg-white/60 dark:bg-zinc-900/50 border-zinc-800">
                            <CardHeader><CardTitle>Session Metrics</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Technical', value: `${report.scores?.technical || 0}%`, color: 'text-blue-400' },
                                    { label: 'Communication', value: `${report.scores?.communication || 0}%`, color: 'text-purple-400' },
                                    { label: 'Engagement', value: `${report.scores?.engagement || 0}%`, color: 'text-pink-400' },
                                    { label: 'Integrity', value: `${report.scores?.integrity || 0}%`, color: 'text-emerald-400' },
                                ].map(m => (
                                    <div key={m.label} className="bg-slate-50 dark:bg-black p-4 rounded-lg border border-zinc-800 text-center">
                                        <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                                        <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">{m.label}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="deep-scan" className="space-y-8 outline-none">
                        {report.deepAnalysis ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="bg-white dark:bg-zinc-900 border-zinc-800">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> Conceptual Mastery</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {report.deepAnalysis.conceptual_mastery?.map((item: any, i: number) => (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="font-bold text-slate-600 dark:text-zinc-300">{item.skill}</span>
                                                        <span className="text-primary">{item.score}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary" style={{ width: `${item.score}%` }} />
                                                    </div>
                                                    <p className="text-[10px] text-zinc-500 italic">{item.justification}</p>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-white dark:bg-zinc-900 border-zinc-800">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-400" /> Delivery & Communication</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {['filler_usage', 'pacing', 'confidence_progression'].map(key => (
                                                <div key={key} className="bg-white dark:bg-black/40 p-4 rounded-xl border border-zinc-800/50">
                                                    <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">{key.replace(/_/g, ' ')}</h4>
                                                    <p className="text-sm text-slate-600 dark:text-zinc-300">{report.deepAnalysis.delivery_analysis?.[key]}</p>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </div>

                                {(ollama.growth_roadmap || report.deepAnalysis?.growth_plan) && (
                                    <Card className="bg-primary/5 border-primary/20">
                                        <CardHeader>
                                            <CardTitle className="text-primary flex items-center gap-2 font-black uppercase tracking-tighter"><Trophy className="w-6 h-6" /> Personalized Growth Roadmap</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {(ollama.growth_roadmap || report.deepAnalysis.growth_plan).map((plan: string, i: number) => (
                                                    <div key={i} className="flex gap-4 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-primary/10 items-center">
                                                        <div className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center font-bold shrink-0">{i + 1}</div>
                                                        <p className="text-sm font-medium text-slate-900 dark:text-zinc-200">{plan}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <Brain className="w-16 h-16 text-zinc-700" />
                                <h3 className="text-xl font-bold">Analysis in Progress…</h3>
                                <p className="text-sm text-zinc-500 max-w-xs">Our high-fidelity AI is scanning your session. Check back in a few seconds.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* ── MENTOR CRITIQUE ───────────────────────────────────────── */}
                <Card className="bg-white dark:bg-zinc-900 border-purple-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-400">
                            <MessageSquare className="w-5 h-5" /> Mentor Critique & Discussion
                        </CardTitle>
                        <CardDescription>Direct feedback from professionals who have reviewed your session.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            {report.mentorComments?.length > 0 ? report.mentorComments.map((comment: any, i: number) => (
                                <div key={i} className="p-4 bg-slate-50 dark:bg-black rounded-xl border border-zinc-800 space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                        <span>Mentor Reviewer</span>
                                        <span>{new Date(comment.timestamp).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-zinc-300">{comment.text}</p>
                                </div>
                            )) : (
                                <div className="text-center py-10 text-zinc-600 italic text-sm">
                                    No mentor critiques yet. Share this report for professional feedback.
                                </div>
                            )}
                        </div>
                        <div className="pt-4 border-t border-zinc-800 space-y-3">
                            <textarea
                                className="w-full bg-slate-50 dark:bg-black border border-zinc-800 rounded-xl p-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition-all min-h-[100px] resize-none"
                                placeholder="Add a professional critique or follow-up question..."
                                value={mentorComment}
                                onChange={e => setMentorComment(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <Button onClick={handleMentorComment} disabled={isSubmittingComment || !mentorComment.trim()} className="bg-purple-600 hover:bg-purple-700 font-bold">
                                    {isSubmittingComment ? "Submitting..." : "Post Critique"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function ReportPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white"><Loader2 className="animate-spin" /></div>}>
            <ReportPageContent />
        </Suspense>
    )
}
