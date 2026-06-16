"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Building2, ArrowLeft, Play, FileText, CheckCircle2, Circle, Loader2, Trophy, AlertTriangle, MessageSquare, DollarSign, Quote, Users, Code2, Server, Lock, Sparkles } from "lucide-react"
import Link from "next/link"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"

import Confetti from "react-confetti"

export default function OnsiteDetailPage() {
    const router = useRouter()
    const params = useParams()
    const [loop, setLoop] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [finalizing, setFinalizing] = useState(false)
    const [showConfetti, setShowConfetti] = useState(false)

    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
    useEffect(() => {
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight })
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const fetchLoop = useCallback(async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/onsite/${params.id}`)
            setLoop(res.data)
            if (res.data.status === 'Completed' && ['Strong Hire', 'Hire', 'Leaning Hire'].includes(res.data.finalDecision?.recommendation)) {
                setShowConfetti(true)
                setTimeout(() => setShowConfetti(false), 8000)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [params.id])

    useEffect(() => {
        fetchLoop()
    }, [fetchLoop])

    const handleFinalize = async () => {
        setFinalizing(true)
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/onsite/${params.id}/finalize`)
            await fetchLoop()
        } catch (err) {
            console.error(err)
        } finally {
            setFinalizing(false)
        }
    }

    const startNegotiation = () => {
        const lastReportId = loop.rounds[loop.rounds.length - 1]?.reportId?._id || loop.rounds[loop.rounds.length - 1]?.reportId;
        if (lastReportId) {
            router.push(`/dashboard/negotiation?reportId=${lastReportId}`)
        } else {
            router.push('/dashboard/negotiation')
        }
    }

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-[#050505] relative overflow-hidden aurora-glow">
            <div className="absolute top-20 left-10 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.15)]">
                    <Loader2 className="animate-spin text-violet-400 w-8 h-8" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Loading Session...</span>
            </div>
        </div>
    )

    if (!loop) return (
        <div className="text-slate-900 dark:text-white text-center py-20 font-black italic uppercase tracking-widest bg-slate-50 dark:bg-[#050505] min-h-screen flex items-center justify-center aurora-glow">
            <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">404 // SESSION_NOT_FOUND</span>
        </div>
    )

    const allCompleted = loop.rounds.every((r: any) => r.status === 'Completed')
    const recommendation = loop.finalDecision?.recommendation
    const isHired = ['Strong Hire', 'Hire', 'Leaning Hire'].includes(recommendation)

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white p-6 md:p-16 selection:bg-violet-500 selection:text-slate-900 dark:text-white font-sans relative overflow-hidden aurora-glow">
            {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} numberOfPieces={300} recycle={false} gravity={0.15} colors={['#8b5cf6', '#06b6d4', '#d946ef', '#10b981', '#FFFFFF']} />}

            {/* Floating ambient orbs */}
            <div className="absolute top-20 left-10 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
            <div className="absolute bottom-32 right-16 w-72 h-72 bg-cyan-500/4 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-fuchsia-500/3 rounded-full blur-[160px] orb-float pointer-events-none" style={{ animationDelay: '5s' }} />

            <div className="max-w-5xl mx-auto space-y-16 relative z-10">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <Link href="/dashboard/onsite">
                        <Button variant="ghost" className="text-zinc-600 hover:text-violet-400 gap-3 mb-8 font-black uppercase tracking-widest text-[10px] bg-white dark:bg-zinc-900/40 backdrop-blur-xl px-6 rounded-full border border-white/[0.06] hover:border-violet-500/20 transition-all">
                            <ArrowLeft className="w-3 h-3" /> System Lobby
                        </Button>
                    </Link>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="flex gap-10 items-center">
                            <motion.div
                                whileHover={{ rotate: -5, scale: 1.05 }}
                                className="w-28 h-28 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/15 rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.1)] relative backdrop-blur-xl"
                            >
                                <Building2 className="w-14 h-14 text-violet-400" />
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 rounded-[2rem] animate-pulse pointer-events-none" />
                            </motion.div>
                            <div>
                                <h1 className="text-6xl font-black tracking-tighter leading-tight uppercase font-mono">
                                    <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x">
                                        {loop.company}
                                    </span>
                                    <span className="text-slate-900 dark:text-white">.Loop</span>
                                </h1>
                                <div className="flex items-center gap-4 mt-2">
                                    <p className="text-zinc-500 text-xl font-bold uppercase tracking-tight">{loop.role}</p>
                                    <div className="w-2 h-2 rounded-full bg-zinc-800" />
                                    <span className="text-zinc-700 font-black uppercase text-[10px] tracking-widest">ID: {loop._id.slice(-6)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Final Decision Reveal */}
                <AnimatePresence>
                    {loop.status === 'Completed' && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: 'spring', damping: 20 }}
                        >
                            <Card className={`bg-white dark:bg-zinc-900/40 backdrop-blur-2xl overflow-hidden relative border ${isHired ? 'border-emerald-500/20 shadow-[0_0_60px_rgba(16,185,129,0.1)]' : 'border-red-500/20 shadow-[0_0_60px_rgba(239,68,68,0.08)]'} rounded-[3rem]`}>
                                <div className={`absolute top-0 left-0 w-full h-[1px] ${isHired ? 'bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent' : 'bg-gradient-to-r from-transparent via-red-500/40 to-transparent'}`} />

                                <CardHeader className="p-12 pb-6">
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl ${isHired ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'} flex items-center justify-center`}>
                                                    <Trophy className={`w-5 h-5 ${isHired ? 'text-emerald-400' : 'text-red-400'}`} />
                                                </div>
                                                <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${isHired ? 'text-emerald-400' : 'text-red-400'}`}>Official Committee Verdict</span>
                                            </div>
                                            <CardTitle className={`text-7xl font-black tracking-tighter ${isHired ? 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent' : 'text-red-400'} uppercase leading-[0.8]`}>
                                                {recommendation}
                                            </CardTitle>
                                        </div>

                                        {isHired && (
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button onClick={startNegotiation} className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-slate-900 dark:text-white font-black px-12 h-20 rounded-2xl gap-4 shadow-[0_0_40px_rgba(16,185,129,0.25)] hover:shadow-[0_0_55px_rgba(16,185,129,0.4)] text-xl uppercase tracking-widest border-0 transition-all hover:scale-[1.02]">
                                                    <DollarSign className="w-8 h-8" /> Negotiate Offer
                                                </Button>
                                            </motion.div>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="p-12 pt-0 space-y-10">
                                    <div className="p-8 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 border border-violet-500/10 rounded-[2rem] relative backdrop-blur-xl">
                                        <Quote className="absolute -top-4 -left-4 w-12 h-12 text-violet-500/10" />
                                        <p className="text-slate-600 dark:text-zinc-300 leading-relaxed text-2xl font-medium italic">
                                            &ldquo;{loop.finalDecision.justification}&rdquo;
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        {loop.finalDecision.committeeFeedback?.map((f: string, i: number) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="flex gap-5 items-center p-5 bg-white dark:bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-white/[0.06] group hover:border-violet-500/15 transition-all"
                                            >
                                                <div className="w-10 h-10 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-xl flex items-center justify-center shrink-0 border border-violet-500/10 group-hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all">
                                                    <MessageSquare className="w-5 h-5 text-violet-400" />
                                                </div>
                                                <span className="text-sm text-slate-500 dark:text-zinc-400 font-bold tracking-tight">{f}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Interview Timeline Lifecycle */}
                <div className="space-y-12">
                    <div className="flex items-center justify-between px-4">
                        <div className="space-y-1">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Phase.02</h3>
                            <h2 className="text-3xl font-black tracking-tighter uppercase bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                                Interview Lifecycle
                            </h2>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Completed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-zinc-800" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Pending</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative pl-12 space-y-8">
                        {/* Vertical Progress Line */}
                        <div className="absolute left-6 top-4 bottom-4 w-[2px] bg-white dark:bg-zinc-900/60">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(loop.rounds.filter((r: any) => r.status === 'Completed').length / loop.rounds.length) * 100}%` }}
                                className="w-full bg-gradient-to-b from-emerald-500 to-cyan-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-1000"
                            />
                        </div>

                        {loop.rounds.map((round: any, i: number) => {
                            const isCompleted = round.status === 'Completed'
                            const isActive = !isCompleted && (i === 0 || loop.rounds[i - 1].status === 'Completed')
                            const icons = [Users, Code2, Server, FileText, Building2]
                            const RoundIcon = icons[i % icons.length]

                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`relative p-8 rounded-2xl border backdrop-blur-xl transition-all ${isCompleted
                                        ? 'bg-emerald-500/[0.03] border-emerald-500/15 shadow-[0_0_25px_rgba(16,185,129,0.05)]'
                                        : isActive
                                            ? 'bg-violet-500/[0.03] border-violet-500/20 shadow-[0_0_30px_rgba(139,92,246,0.08)]'
                                            : 'bg-white dark:bg-zinc-900/20 border-white/[0.04] opacity-50'
                                        }`}
                                >
                                    {/* Gradient top line */}
                                    {(isCompleted || isActive) && (
                                        <div className={`absolute top-0 left-0 w-full h-[1px] ${isCompleted ? 'bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent' : 'bg-gradient-to-r from-transparent via-violet-500/30 to-transparent'}`} />
                                    )}

                                    {/* Connection Point */}
                                    <div className={`absolute -left-[30px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-slate-300 dark:border-[#050505] z-10 ${isCompleted ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : isActive ? 'bg-violet-500 animate-pulse shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'bg-zinc-800'}`} />

                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all ${isCompleted
                                                ? 'bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 text-emerald-400 border border-emerald-500/15 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                                : isActive
                                                    ? 'bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15 text-violet-400 border border-violet-500/15 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                                                    : 'bg-white dark:bg-zinc-900/60 text-zinc-700 border border-white/[0.04]'
                                                }`}>
                                                <RoundIcon className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Round {i + 1}</span>
                                                    {isActive && (
                                                        <span className="bg-violet-500/10 text-violet-400 text-[8px] font-black uppercase px-2.5 py-0.5 rounded-full border border-violet-500/20 animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.2)]">
                                                            Live
                                                        </span>
                                                    )}
                                                    {isCompleted && (
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                    )}
                                                </div>
                                                <h4 className={`text-2xl font-black uppercase tracking-tight ${isCompleted ? 'text-slate-500 dark:text-zinc-400' : isActive ? 'text-slate-900 dark:text-white' : 'text-zinc-600'}`}>
                                                    {round.roundName}
                                                </h4>
                                                <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest mt-1">
                                                    Focus: {round.competencies.join(", ")}
                                                </p>
                                            </div>
                                        </div>

                                        {isCompleted ? (
                                            <Link href={`/dashboard/report/${round.reportId?._id || round.reportId}`}>
                                                <Button className="h-12 px-6 rounded-xl bg-white dark:bg-zinc-900/40 backdrop-blur-xl hover:bg-zinc-800/60 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[9px] border border-white/[0.06] hover:border-emerald-500/20 flex items-center gap-3 transition-all shadow-[0_0_15px_rgba(16,185,129,0.08)] hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                                                    <FileText className="w-4 h-4 text-emerald-400" /> Analysis Report
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Button
                                                onClick={() => router.push(`/dashboard/onsite/${loop._id}/round/${i}`)}
                                                className={`h-14 px-10 rounded-2xl font-black gap-4 text-[10px] tracking-widest transition-all border-0 ${isActive
                                                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-slate-900 dark:text-white hover:scale-105 shadow-[0_0_30px_rgba(139,92,246,0.25)] hover:shadow-[0_0_40px_rgba(139,92,246,0.4)]'
                                                    : 'bg-white dark:bg-zinc-900/40 text-slate-900 dark:text-white/20 border border-white/[0.04]'
                                                    }`}
                                                disabled={loop.status === 'Completed' || !isActive}
                                            >
                                                {isActive ? <Play className="w-4 h-4 fill-current" /> : <Lock className="w-4 h-4" />}
                                                {isActive ? "INITIATE SEQUENCE" : "ENCRYPTED"}
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>

                {/* Finalize Controller */}
                {allCompleted && loop.status !== 'Completed' && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="py-20 border-t border-white/[0.06] flex flex-col items-center gap-10"
                    >
                        <div className="flex items-center gap-4 font-black tracking-widest text-[10px] uppercase">
                            <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" />
                            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                                Evaluation cycle complete. Summoning the committee...
                            </span>
                        </div>
                        <Button
                            onClick={handleFinalize}
                            disabled={finalizing}
                            className="h-20 px-16 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 text-slate-900 dark:text-white font-black uppercase tracking-[0.2em] text-lg hover:scale-105 transition-all shadow-[0_0_50px_rgba(139,92,246,0.3)] hover:shadow-[0_0_65px_rgba(139,92,246,0.5)] border-0"
                        >
                            {finalizing ? <Loader2 className="animate-spin w-8 h-8" /> : "Request Hiring Decision"}
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
