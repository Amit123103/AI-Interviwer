"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Building2, Plus, ArrowRight, CheckCircle2, Circle, Loader2, Sparkles, Info } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { COMPANIES, CompanyConfig } from "./data/companies"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import MeshBackground from "../components/MeshBackground"
import HolographicHud from "@/components/ui/HolographicHud"
import TiltCard from "@/components/ui/TiltCard"
import DashboardHeader from "@/components/dashboard/DashboardHeader"

export default function OnsiteLobbyPage() {
    const router = useRouter()
    const [loops, setLoops] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        const fetchLoops = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user") || "{}")
                if (!user._id) return router.push("/auth/login")

                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/onsite/user/${user._id}`)
                setLoops(res.data)
            } catch (err) {
                console.error("Error fetching loops:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchLoops()
    }, [router])

    const startNewLoop = async (company: CompanyConfig) => {
        setCreating(true)
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}")

            const rounds = company.rounds.map(r => ({
                roundId: r.id,
                roundName: r.name,
                type: r.type,
                description: r.description,
                competencies: r.competencies,
                status: 'Pending'
            }))

            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/onsite`, {
                userId: user._id,
                company: company.name,
                role: "Software Engineer",
                rounds: rounds
            })
            setLoops([res.data, ...loops])
            setCreating(false)
            router.push(`/dashboard/onsite/${res.data._id}`)
        } catch (err) {
            console.error("Error creating loop:", err)
            setCreating(false)
        }
    }

    if (loading) return <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-black"><Loader2 className="animate-spin text-primary" /></div>

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-white relative overflow-hidden aurora-glow">
            <MeshBackground />
            <HolographicHud />

            <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-10 py-6 md:py-10 space-y-16 relative z-10">
                {/* Floating ambient orbs */}
                <div className="absolute top-20 left-10 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
                <div className="absolute bottom-32 right-16 w-72 h-72 bg-cyan-500/4 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <DashboardHeader
                        title="Neural Onsite Simulation"
                        subtitle="Simulate high-stakes hiring loops at top-tier companies. Receive a final committee decision based on your performance."
                        breadcrumbs={[{ label: "Virtual Onsite" }]}
                    />

                    <Dialog open={creating} onOpenChange={setCreating}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 text-slate-900 dark:text-white hover:from-violet-500 hover:via-fuchsia-500 hover:to-cyan-500 gap-3 font-black px-10 h-16 rounded-2xl shadow-[0_0_50px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.5)] hover:scale-105 transition-all text-lg uppercase tracking-widest border-0">
                                <Plus className="w-6 h-6 stroke-[3]" /> INITIALIZE NEW LOOP
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white dark:bg-zinc-950/80 border-white/[0.06] max-w-5xl max-h-[90vh] overflow-hidden p-0 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl">
                            <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-white/60 dark:bg-zinc-900/50 relative">
                                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                    <Building2 size={120} />
                                </div>
                                <DialogHeader>
                                    <DialogTitle className="text-4xl font-black tracking-tighter uppercase italic">Select Target Authority</DialogTitle>
                                    <DialogDescription className="text-zinc-500 text-lg font-bold uppercase tracking-tight">Choose a company to unlock their proprietary interview framework.</DialogDescription>
                                </DialogHeader>
                            </div>

                            <div className="p-8 bg-white dark:bg-black/40 overflow-y-auto max-h-[60vh] scrollbar-hide">
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {COMPANIES.map(company => (
                                        <TiltCard key={company.id}>
                                            <div
                                                onClick={() => startNewLoop(company)}
                                                className="group relative p-8 bg-white dark:bg-zinc-900/40 border border-slate-100 dark:border-white/5 rounded-3xl cursor-pointer hover:border-violet-500/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)] transition-all overflow-hidden h-full"
                                            >
                                                <div className="relative z-10 space-y-6">
                                                    <div className={`w-14 h-14 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 flex items-center justify-center transition-all group-hover:bg-primary/10 group-hover:border-primary/20 shadow-xl`}>
                                                        <company.logo className="w-8 h-8" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-black tracking-tighter mb-1 mt-2 group-hover:text-violet-400 transition-colors uppercase italic">{company.name}</h3>
                                                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-relaxed mb-4">{company.description}</p>
                                                    </div>
                                                    <div className="space-y-3 pt-2">
                                                        {company.rounds.map((round, i) => (
                                                            <div key={i} className="flex items-center text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 gap-3">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${getRoundColor(round.type)} shadow-[0_0_8px_currentColor]`} />
                                                                {round.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                                    <ArrowRight className="text-primary w-6 h-6" />
                                                </div>
                                            </div>
                                        </TiltCard>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 bg-primary/5 border-t border-slate-100 dark:border-white/5 flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                                    <Info className="text-primary w-4 h-4" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">
                                    Neural simulations are derived from real-world data points and private hiring intelligence.
                                </p>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-8">
                    <AnimatePresence mode="popLayout">
                        {loops.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="col-span-full py-32 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[40px] flex flex-col items-center text-center space-y-6"
                            >
                                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center">
                                    <Building2 className="w-12 h-12 text-zinc-700" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black tracking-tighter uppercase">No Active Simulations</h3>
                                    <p className="text-zinc-500 text-lg font-medium max-w-sm mx-auto italic">
                                        "The best way to predict the future is to create it." — Start your first loop above.
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            loops.map((loop, idx) => (
                                <TiltCard key={loop._id}>
                                    <div
                                        onClick={() => router.push(`/dashboard/onsite/${loop._id}`)}
                                        className="group relative bg-white dark:bg-zinc-950/40 backdrop-blur-3xl border border-white/[0.06] rounded-[2.5rem] p-10 cursor-pointer hover:border-violet-500/30 hover:bg-white dark:bg-zinc-900/40 hover:shadow-[0_0_40px_rgba(139,92,246,0.08)] transition-all shadow-2xl overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
                                        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                            <Building2 size={160} />
                                        </div>

                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative z-10">
                                            <div className="flex items-center gap-8">
                                                <div className="w-24 h-24 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-3xl flex items-center justify-center group-hover:bg-primary/10 transition-all shadow-inner relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                                                    <Building2 className="w-12 h-12 text-zinc-500 group-hover:text-primary transition-colors relative z-10" />
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-4">
                                                        <h2 className="text-5xl font-black tracking-tighter group-hover:text-violet-400 transition-colors italic uppercase">{loop.company}</h2>
                                                        <div className={`px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded-md ${loop.status === 'Completed' ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]'}`}>
                                                            {loop.status}
                                                        </div>
                                                    </div>
                                                    <p className="text-zinc-500 text-lg font-black tracking-widest uppercase">
                                                        {loop.role} <span className="mx-3 opacity-20">|</span> <span className="text-zinc-600 font-bold">{new Date(loop.createdAt).toLocaleDateString()}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-8">
                                                <div className="flex -space-x-4">
                                                    {loop.rounds.map((round: any, i: number) => (
                                                        <TooltipProvider key={i}>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div className={`w-14 h-14 rounded-2xl border-2 border-black flex items-center justify-center shadow-xl transition-all hover:scale-110 hover:-translate-y-2 z-10 ${round.status === 'Completed' ? 'bg-primary text-black' : 'bg-white dark:bg-zinc-900 text-zinc-600 border-slate-100 dark:border-white/5'}`}>
                                                                        {round.status === 'Completed' ? <CheckCircle2 className="w-7 h-7" /> : <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />}
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl shadow-2xl">
                                                                    {round.roundName}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    ))}
                                                </div>

                                                <div className="h-14 w-[1px] bg-white/10 mx-2 hidden lg:block" />

                                                <Button variant="ghost" className="h-20 px-10 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] text-primary/80 hover:text-slate-900 dark:text-white group-hover:bg-primary/5 transition-all">
                                                    CONTINUE SIMULATION <ArrowRight className="ml-4 w-6 h-6 stroke-[3] group-hover:translate-x-2 transition-transform" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </TiltCard>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

function getRoundColor(type: string) {
    switch (type) {
        case 'coding': return 'bg-blue-500';
        case 'system-design': return 'bg-orange-500';
        case 'behavioral': return 'bg-purple-500';
        case 'aptitude': return 'bg-indigo-500';
        default: return 'bg-zinc-500';
    }
}
