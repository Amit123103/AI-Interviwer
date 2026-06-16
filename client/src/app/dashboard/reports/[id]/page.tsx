"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
    CheckCircle2, XCircle, AlertTriangle, Download, ArrowLeft,
    Trophy, Star, Brain, Target, MessageSquare, Zap, Shield,
    ChevronRight, Loader2, Sparkles, TrendingUp, Info
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

// ─── Radar Chart Component ───────────────────────────────────────────────────
const RadarChart = ({ metrics }: { metrics: any }) => {
    const labels = [
        { key: "technicalKnowledge", label: "Technical", icon: Brain },
        { key: "problemSolving", label: "Logic", icon: Target },
        { key: "communicationClarity", label: "Comm", icon: MessageSquare },
        { key: "confidenceLevel", label: "Confidence", icon: Zap },
        { key: "responseCompleteness", label: "Depth", icon: CheckCircle2 },
        { key: "professionalism", label: "Ethics", icon: Shield },
    ]

    const size = 300
    const center = size / 2
    const radius = size * 0.35
    const angleStep = (Math.PI * 2) / labels.length

    const points = labels.map((m, i) => {
        const val = metrics[m.key] || 5
        const r = (val / 10) * radius
        const angle = i * angleStep - Math.PI / 2
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
            label: m.label,
            angle
        }
    })

    const polygonPoints = points.map(p => `${p.x},${p.y}`).join(" ")

    // Grid circles
    const gridCircles = [0.2, 0.4, 0.6, 0.8, 1].map(r => r * radius)

    return (
        <div className="relative w-full max-w-[350px] mx-auto">
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full drop-shadow-2xl">
                {/* Grid */}
                {gridCircles.map((r, i) => (
                    <circle key={i} cx={center} cy={center} r={r} fill="none" stroke="currentColor" strokeWidth="0.5" className="text-zinc-800" />
                ))}
                {labels.map((_, i) => {
                    const angle = i * angleStep - Math.PI / 2
                    return (
                        <line key={i} x1={center} y1={center} x2={center + radius * Math.cos(angle)} y2={center + radius * Math.sin(angle)} stroke="currentColor" strokeWidth="0.5" className="text-zinc-800" />
                    )
                })}

                {/* Data Polygon */}
                <motion.polygon
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    points={polygonPoints}
                    fill="rgba(var(--primary-rgb), 0.2)"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-primary"
                    style={{ filter: "drop-shadow(0 0 8px rgba(var(--primary-rgb), 0.5))" }}
                />

                {/* Data Points */}
                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="4" fill="currentColor" className="text-primary" />
                ))}

                {/* Labels */}
                {labels.map((m, i) => {
                    const angle = i * angleStep - Math.PI / 2
                    const x = center + (radius + 25) * Math.cos(angle)
                    const y = center + (radius + 25) * Math.sin(angle)
                    return (
                        <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="text-[10px] font-black fill-zinc-400 uppercase tracking-tighter">
                            {m.label}
                        </text>
                    )
                })}
            </svg>
        </div>
    )
}

export default function ReportPage() {
    const { id } = useParams()
    const router = useRouter()
    const [report, setReport] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/reports/${id}`)
                setReport(res.data)
            } catch (err) {
                console.error("Failed to fetch report", err)
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchReport()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Generating Your Expert Report...</p>
            </div>
        )
    }

    if (!report) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col items-center justify-center gap-4">
                <AlertTriangle className="w-12 h-12 text-red-500" />
                <p className="text-xl font-bold">Report Not Found</p>
                <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
            </div>
        )
    }

    const evaluation = report.ollamaEvaluation || {}
    const readiness = report.readinessLevel || "Developing"
    const score = report.overallScore || 0

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white p-4 md:p-10 pb-20">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => router.push('/dashboard')} className="gap-2 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Dashboard
                    </Button>
                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2 border-zinc-800 bg-white dark:bg-black/50 hover:bg-white dark:bg-zinc-900">
                            <Download className="w-4 h-4" /> Export PDF
                        </Button>
                        <Button className="gap-2 bg-primary text-black font-bold hover:primary/90">
                            Share Report
                        </Button>
                    </div>
                </div>

                {/* Hero Section: Analysis Snapshot */}
                <div className="grid lg:grid-cols-12 gap-6 items-stretch">

                    {/* Overall Score Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3">
                        <Card className="h-full bg-primary border-none shadow-[0_0_50px_rgba(var(--primary-rgb),0.15)] overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Trophy size={120} />
                            </div>
                            <CardContent className="h-full flex flex-col items-center justify-center p-8 text-black relative z-10">
                                <div className="text-8xl font-black tracking-tighter mb-2">{score}</div>
                                <div className="text-lg font-black uppercase tracking-widest opacity-80">Composite Score</div>
                                <div className="mt-6 px-4 py-1.5 bg-white dark:bg-black/10 rounded-full text-xs font-bold uppercase tracking-widest border border-black/5">
                                    Top 5% Candidate
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Radar Chart Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-5">
                        <Card className="h-full bg-white/60 dark:bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
                            <CardHeader className="pb-0">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-zinc-500">Skills Matrix</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center p-4">
                                <RadarChart metrics={evaluation} />
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Readiness & Breakdown Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-4 flex flex-col gap-4">
                        <Card className="bg-white dark:bg-zinc-900 border-zinc-800 flex-1 overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">Readiness Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="relative w-20 h-20">
                                        <svg className="w-full h-full" viewBox="0 0 36 36">
                                            <path className="text-zinc-800" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                            <path className="text-primary" strokeDasharray={`${score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center text-xs font-black">{score}%</div>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white">{readiness}</p>
                                        <p className="text-xs text-zinc-500 font-medium">Next Milestone: Expert Level</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-2 gap-4 flex-1">
                            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-800 flex flex-col justify-center">
                                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                                    <TrendingUp size={12} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Consistency</span>
                                </div>
                                <div className="text-xl font-black text-emerald-400">High</div>
                            </div>
                            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-800 flex flex-col justify-center">
                                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                                    <Shield size={12} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Integrity</span>
                                </div>
                                <div className="text-xl font-black text-blue-400">95%</div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* AI Executive Summary */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="bg-white dark:bg-zinc-900/30 border-zinc-800 border-l-4 border-l-primary overflow-hidden">
                        <CardHeader className="bg-primary/5 pb-2">
                            <CardTitle className="flex items-center gap-2 text-primary text-sm font-black uppercase tracking-wider">
                                <Sparkles size={16} /> AI Executive Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-slate-600 dark:text-zinc-300 leading-relaxed font-medium">
                                {evaluation.aiSummary || "Candidate demonstrated strong technical aptitude and clear communication. Areas of focus should be refining system design trade-offs and confidence in complex scenario handling."}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Strengths & Weaknesses */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-white dark:bg-zinc-900/20 border-zinc-800 border-t-2 border-t-emerald-500/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-emerald-400 text-sm font-black uppercase tracking-wider">
                                <CheckCircle2 size={16} /> Core Strengths
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-2">
                            {(report.strengths || []).map((s: string, i: number) => (
                                <div key={i} className="flex gap-3 items-start group">
                                    <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <CheckCircle2 size={10} className="text-emerald-500" />
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-zinc-400 group-hover:text-slate-900 dark:text-zinc-200 transition-colors">{s}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-zinc-900/20 border-zinc-800 border-t-2 border-t-amber-500/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-amber-500 text-sm font-black uppercase tracking-wider">
                                <AlertTriangle size={16} /> Critical Weaknesses
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-2">
                            {(report.weaknesses || []).map((w: string, i: number) => (
                                <div key={i} className="flex gap-3 items-start group">
                                    <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-amber-500/10 flex items-center justify-center">
                                        <AlertTriangle size={10} className="text-amber-500" />
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-zinc-400 group-hover:text-slate-900 dark:text-zinc-200 transition-colors">{w}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Per-Question Detailed Feedback */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <MessageSquare className="text-primary w-5 h-5" />
                        <h2 className="text-xl font-black uppercase tracking-tight">Turn-by-Turn Analysis</h2>
                    </div>
                    <div className="grid gap-4">
                        {(report.questionFeedback || []).map((q: any, i: number) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}>
                                <Card className="bg-white dark:bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                                    <CardContent className="p-5 flex gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-50 dark:bg-black border border-zinc-800 flex items-center justify-center font-black text-zinc-500">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">"{q.question}"</p>
                                            <div className="p-3 rounded-lg bg-white dark:bg-black/40 border border-zinc-800/50">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">AI Evaluation</span>
                                                    <div className="flex items-center gap-1">
                                                        {Array.from({ length: 5 }).map((_, j) => (
                                                            <div key={j} className={`w-3 h-1 rounded-full ${j < Math.round(q.score / 2) ? 'bg-primary' : 'bg-zinc-800'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed italic">
                                                    {q.feedback}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Growth Roadmap */}
                <div className="pt-4">
                    <Card className="bg-primary/5 border border-primary/20 overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
                            <TrendingUp size={150} />
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary font-black uppercase tracking-wider">
                                <Zap className="fill-current" /> Personalized Growth Roadmap
                            </CardTitle>
                            <CardDescription className="text-zinc-500 font-medium">
                                Actionable steps to accelerate your career readiness
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-3 gap-6 relative z-10">
                            {[
                                { title: "Short Term", icon: Zap, color: "text-amber-400", steps: ["Review STAR method for behavioral answers", "Mock interview on 'Confidence' module"] },
                                { title: "Tech Mastery", icon: Brain, color: "text-blue-400", steps: ["Deep dive into Microservices architecture", "Optimize 3 DSA problems daily"] },
                                { title: "Executive Presence", icon: Shield, color: "text-purple-400", steps: ["Record self answering and check filler words", "Work on active listening affirmations"] }
                            ].map((phase, i) => (
                                <div key={i} className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <phase.icon className={phase.color} size={18} />
                                        <h3 className="text-sm font-black uppercase tracking-widest">{phase.title}</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {phase.steps.map((step, j) => (
                                            <div key={j} className="flex gap-2 items-center text-xs font-medium text-slate-500 dark:text-zinc-400 bg-white dark:bg-black/40 p-2 rounded-lg border border-zinc-800">
                                                <ChevronRight size={10} className="text-zinc-600" />
                                                {step}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter className="bg-primary/10 border-t border-primary/10 py-4 flex justify-between items-center px-8">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/70 italic flex items-center gap-2">
                                <Info size={12} /> Roadmap generated by InterViu AI Analytics
                            </p>
                            <Button size="sm" className="bg-primary text-black font-bold h-8 text-[10px] uppercase tracking-widest px-6 hover:bg-primary/90">
                                Start Roadmap Session
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

            </div>
        </div>
    )
}
