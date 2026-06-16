
"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ChevronDown, ChevronUp, Loader2, Trophy, ArrowRight, Share2, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

interface RoundReport {
    _id: string;
    type: string;
    scores: { overall: number; technical: number; communication: number; cultural: number };
    summary: string;
    pros: string[];
    cons: string[];
}

interface OnsiteLoop {
    _id: string;
    company: string;
    role: string;
    status: string;
    finalDecision?: {
        recommendation: string;
        justification: string;
        committeeFeedback: string[];
    };
    rounds: {
        roundName: string;
        type: string;
        status: string;
        reportId: RoundReport;
    }[];
}

export default function OnsiteFinalReportPage() {
    const params = useParams()
    const router = useRouter()
    const [loop, setLoop] = useState<OnsiteLoop | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<number | null>(null)

    useEffect(() => {
        const fetchReport = async () => {
            try {
                // Check if decision is already finalized
                let res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/onsite/${params.id}`)
                let data = res.data

                if (data.status === 'Completed' && !data.finalDecision) {
                    // Try to finalize if completed but no decision (data migration case)
                    const finalizeRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/onsite/${params.id}/finalize`)
                    data = finalizeRes.data
                } else if (data.status !== 'Completed') {
                    // Check if all rounds are actually done, then finalize
                    const allDone = data.rounds.every((r: any) => r.status === 'Completed')
                    if (allDone) {
                        const finalizeRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/onsite/${params.id}/finalize`)
                        data = finalizeRes.data
                    }
                }

                setLoop(data)

                // Celebrate if hired
                if (data.finalDecision?.recommendation.includes('Hire')) {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                }
            } catch (err) {
                console.error("Error fetching report:", err)
            } finally {
                setLoading(false)
            }
        }

        if (params.id) fetchReport()
    }, [params.id])

    if (loading) return <div className="flex bg-slate-50 dark:bg-black min-h-screen items-center justify-center text-slate-900 dark:text-white"><Loader2 className="animate-spin mr-2" /> Generating Committee Report...</div>
    if (!loop || !loop.finalDecision) return <div className="bg-slate-50 dark:bg-black min-h-screen p-10 text-slate-900 dark:text-white">Report pending or not found. <Button onClick={() => window.location.reload()} variant="outline" className="ml-4">Retry</Button></div>

    const getDecisionColor = (rec: string) => {
        if (rec.includes('Strong Hire')) return "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)]";
        if (rec === 'Hire') return "bg-green-500 text-black";
        if (rec.includes('Leaning Hire')) return "bg-lime-500 text-black";
        if (rec.includes('No Hire')) return "bg-red-500 text-slate-900 dark:text-white";
        return "bg-zinc-500";
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-4 md:p-10 font-sans selection:bg-primary/30">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Hiring Committee Decision</h1>
                        <p className="text-slate-500 dark:text-zinc-400">Candidate Evaluation for <span className="text-slate-900 dark:text-white font-semibold">{loop.role}</span> at <span className="text-slate-900 dark:text-white font-semibold">{loop.company}</span></p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2"><Share2 className="w-4 h-4" /> Share</Button>
                        <Button variant="outline" size="sm" className="gap-2"><Download className="w-4 h-4" /> PDF</Button>
                        <Button onClick={() => router.push('/dashboard/onsite')} className="gap-2">Back to Dashboard <ArrowRight className="w-4 h-4" /></Button>
                    </div>
                </div>

                {/* Integration of Decision Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center"
                >
                    <Badge className={`text-4xl py-4 px-12 rounded-full font-black uppercase tracking-widest ${getDecisionColor(loop.finalDecision.recommendation)}`}>
                        {loop.finalDecision.recommendation}
                    </Badge>
                </motion.div>

                {/* Official Justification Card */}
                <Card className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Committee Justification
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-slate-600 dark:text-zinc-300 leading-relaxed text-lg">
                            {loop.finalDecision.justification}
                        </p>

                        <div className="bg-white dark:bg-black/40 p-4 rounded-lg border border-slate-100 dark:border-white/5">
                            <h4 className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-3">Key Observations</h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {loop.finalDecision.committeeFeedback.map((point, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-zinc-300">
                                        <span className="text-primary">•</span> {point}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                <Separator className="bg-white/10" />

                {/* Round by Round Breakdown */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Round Performance Breakdown</h2>
                    {loop.rounds.map((round, index) => {
                        const report = round.reportId as RoundReport | null; // Cast properly
                        if (!report) return null; // Skip pending rounds?

                        const isOpen = activeTab === index;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className={`bg-white dark:bg-zinc-950 border-slate-100 dark:border-white/5 overflow-hidden transition-all duration-300 ${isOpen ? 'ring-1 ring-primary/50' : ''}`}>
                                    <div
                                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                                        onClick={() => setActiveTab(isOpen ? null : index)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 flex items-center justify-center font-bold text-slate-500 dark:text-zinc-400">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{round.roundName}</h3>
                                                <div className="flex gap-3 text-xs text-slate-500 dark:text-zinc-400">
                                                    <span>Tech: <b className="text-blue-400">{report.scores.technical}</b></span>
                                                    <span>Comm: <b className="text-purple-400">{report.scores.communication}</b></span>
                                                    <span>Fit: <b className="text-emerald-400">{report.scores.cultural}</b></span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden md:block">
                                                <div className="text-2xl font-black text-slate-900 dark:text-white">{report.scores.overall}</div>
                                                <div className="text-[10px] uppercase text-zinc-500 font-bold">Overall Score</div>
                                            </div>
                                            {isOpen ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
                                        </div>
                                    </div>

                                    {isOpen && (
                                        <div className="p-4 pt-0 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-zinc-900/30">
                                            <div className="mt-4 space-y-4">
                                                <p className="text-sm text-slate-600 dark:text-zinc-300 italic">"{report.summary}"</p>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="text-xs font-bold text-emerald-500 uppercase mb-2">Strengths</h4>
                                                        <ul className="space-y-1">
                                                            {report.pros.map((p, i) => <li key={i} className="text-xs text-slate-500 dark:text-zinc-400">+ {p}</li>)}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-red-500 uppercase mb-2">Weaknesses</h4>
                                                        <ul className="space-y-1">
                                                            {report.cons.map((p, i) => <li key={i} className="text-xs text-slate-500 dark:text-zinc-400">- {p}</li>)}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>

            </div>
        </div>
    )
}
