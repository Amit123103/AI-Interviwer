"use client"

import React, { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Loader2, Send, DollarSign, TrendingUp, Briefcase,
    ChevronRight, MessageSquare, Play, Sparkles,
    User, BrainCircuit, Target, ArrowRight, Zap, Shield
} from "lucide-react"
import axios from "axios"
import DashboardHeader from "@/components/dashboard/DashboardHeader"

/* ── Typing Indicator ── */
function TypingIndicator() {
    return (
        <div className="flex gap-3 justify-start">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-violet-500/20 shrink-0">
                <BrainCircuit className="w-4 h-4 text-violet-400" />
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 border border-violet-500/10 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    );
}

function NegotiationContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const reportId = searchParams.get('reportId')

    const [loading, setLoading] = useState(true)
    const [targetSalary, setTargetSalary] = useState(120000)
    const [userMessage, setUserMessage] = useState("")
    const [chat, setChat] = useState<any[]>([])
    const [currentOffer, setCurrentOffer] = useState<any>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [sessionStarted, setSessionStarted] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const chatEndRef = useRef<HTMLDivElement>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chat, isTyping])

    const getTimestamp = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    const startNegotiationSession = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/negotiation/start`,
                { reportId, targetSalary },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setChat([{ role: 'HR', text: res.data.message, time: getTimestamp() }])
            setCurrentOffer(res.data.offer)
            setSessionStarted(true)
        } catch (err) {
            console.error("Failed to start negotiation", err)
        } finally {
            setLoading(false)
        }
    }

    const handleSendMessage = async () => {
        if (!userMessage.trim()) return
        setIsSubmitting(true)
        const currentMsg = userMessage
        setUserMessage("")
        setChat(prev => [...prev, { role: 'Me', text: currentMsg, time: getTimestamp() }])

        setIsTyping(true)
        try {
            const token = localStorage.getItem("token")
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/negotiation/offer`,
                { reportId, userMessage: currentMsg, targetSalary },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setIsTyping(false)
            setChat(prev => [...prev, { role: 'HR', text: res.data.message, time: getTimestamp() }])
            setCurrentOffer(res.data.offer)

            if (res.data.audio) {
                const audio = new Audio(`data:audio/mp3;base64,${res.data.audio}`)
                audioRef.current = audio
                audio.play()
            }
        } catch (err) {
            setIsTyping(false)
            console.error("Negotiation error", err)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!reportId) {
        return (
            <div className="h-screen bg-slate-50 dark:bg-[#050505] flex items-center justify-center p-6 aurora-glow relative overflow-hidden">
                <div className="absolute top-20 left-10 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
                <div className="absolute bottom-20 right-20 w-72 h-72 bg-fuchsia-500/5 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />
                <Card className="max-w-md bg-white dark:bg-zinc-900/40 backdrop-blur-2xl border-white/[0.06] p-8 text-center space-y-6 relative z-10 rounded-2xl">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-2xl flex items-center justify-center mx-auto border border-violet-500/20 shadow-[0_0_25px_rgba(139,92,246,0.15)]">
                        <Briefcase className="w-8 h-8 text-violet-400" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">No Session Selected</h1>
                    <p className="text-zinc-500 text-sm">Please select a completed interview to start a negotiation simulation.</p>
                    <Button onClick={() => router.push('/dashboard/history')} className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-slate-900 dark:text-white border-0 shadow-[0_0_25px_rgba(139,92,246,0.3)] hover:shadow-[0_0_35px_rgba(139,92,246,0.5)] transition-all font-black uppercase tracking-widest text-[10px]">
                        View History
                    </Button>
                </Card>
            </div>
        )
    }

    if (!sessionStarted) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white p-4 sm:p-6 md:p-8 flex items-center justify-center relative overflow-hidden aurora-glow">
                <div className="absolute top-20 left-10 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
                <div className="absolute bottom-32 right-16 w-72 h-72 bg-cyan-500/4 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-fuchsia-500/3 rounded-full blur-[160px] orb-float pointer-events-none" style={{ animationDelay: '5s' }} />

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full space-y-8 relative z-10">
                    <DashboardHeader
                        title="Salary Negotiator"
                        subtitle="Practice high-stakes salary negotiations with AI powered by your interview performance data."
                        icon={<Briefcase className="w-8 h-8 text-violet-400" />}
                        breadcrumbs={[{ label: "Negotiation" }]}
                    />

                    <Card className="bg-white dark:bg-zinc-900/40 backdrop-blur-2xl border-white/[0.06] overflow-hidden rounded-2xl">
                        <div className="h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500" />
                        <CardHeader className="p-6 sm:p-8 md:p-10 pb-0">
                            <CardTitle className="text-2xl sm:text-3xl font-black tracking-tighter mb-2 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Prepare Your Strategy</CardTitle>
                            <CardDescription className="text-zinc-500 text-base sm:text-lg">
                                You&apos;ve cleared the technical hurdles. Now, it&apos;s time to secure your value.
                                Practice negotiating with our HR AI based on your performance in Report #{reportId.slice(-4)}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 sm:p-8 md:p-10 pt-6 space-y-6 md:space-y-8">
                            <div className="space-y-3">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Your Target Annual Base Salary ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400 w-5 h-5" />
                                    <Input
                                        type="number"
                                        value={targetSalary}
                                        onChange={(e) => setTargetSalary(parseInt(e.target.value))}
                                        className="bg-white dark:bg-black/40 border-white/[0.06] p-5 sm:p-6 pl-12 text-lg sm:text-xl font-bold h-14 sm:h-16 focus:border-violet-500/30 transition-colors rounded-xl"
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={startNegotiationSession}
                                className="w-full py-6 sm:py-8 text-base sm:text-lg font-black bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 text-slate-900 dark:text-white h-14 sm:h-16 shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_45px_rgba(139,92,246,0.5)] hover:scale-[1.02] transition-all duration-300 border-0 uppercase tracking-widest rounded-xl"
                            >
                                <Play className="w-5 h-5 mr-3" /> Start Simulation
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        )
    }

    const totalComp = (currentOffer?.base || 0) + (currentOffer?.bonus || 0) + (currentOffer?.equity || 0)

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white flex flex-col relative overflow-hidden aurora-glow">
            {/* Floating ambient orbs */}
            <div className="absolute top-20 left-10 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
            <div className="absolute bottom-32 right-16 w-72 h-72 bg-cyan-500/4 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />
            <div className="absolute top-1/2 right-0 w-64 h-64 bg-fuchsia-500/3 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '6s' }} />

            {/* Header HUD */}
            <div className="h-16 sm:h-18 border-b border-white/[0.06] bg-white dark:bg-zinc-900/60 backdrop-blur-2xl flex items-center justify-between px-4 sm:px-6 md:px-8 shrink-0 relative z-10">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-xl flex items-center justify-center border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                        <DollarSign className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                        <h2 className="text-xs sm:text-sm font-black uppercase tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Negotiation Lab</h2>
                        <p className="text-[8px] sm:text-[9px] text-zinc-600 font-black uppercase tracking-widest hidden sm:block">Candidate vs HR AI</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-8 md:gap-10">
                    {/* Live indicator */}
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">Active</span>
                    </div>

                    <div className="text-right">
                        <span className="text-[8px] uppercase font-black text-zinc-600 block tracking-widest">Current</span>
                        <span className="text-sm sm:text-base font-black">${currentOffer?.base.toLocaleString() || '0'}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-[8px] uppercase font-black text-zinc-600 block tracking-widest">Target</span>
                        <span className="text-sm sm:text-base font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">${targetSalary.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Chat Interface */}
                <div className="flex-1 flex flex-col bg-white dark:bg-[#050505]/50">
                    <div className="flex-1 overflow-auto p-6 sm:p-8 md:p-10 space-y-6">
                        <AnimatePresence>
                            {chat.map((m, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex gap-3 ${m.role === 'Me' ? 'flex-row-reverse' : ''}`}
                                >
                                    {/* Avatar */}
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${m.role === 'HR'
                                        ? 'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-400 border border-violet-500/20'
                                        : 'bg-zinc-800/80 text-cyan-400 border border-white/[0.06]'
                                        }`}>
                                        {m.role === 'HR' ? <BrainCircuit className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                    </div>

                                    <div className={`flex flex-col gap-1 max-w-[75%] ${m.role === 'Me' ? 'items-end' : ''}`}>
                                        <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">{m.role === 'HR' ? 'HR Manager' : 'You'}</span>
                                        <div className={`p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'Me'
                                            ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/10 text-cyan-100'
                                            : 'bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 border border-violet-500/10 text-slate-600 dark:text-zinc-300'
                                            }`}>
                                            {m.text}
                                        </div>
                                        <span className="text-[7px] font-black uppercase tracking-widest text-zinc-700">{m.time}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {isTyping && <TypingIndicator />}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 sm:p-6 border-t border-white/[0.06] bg-white dark:bg-zinc-900/30 backdrop-blur-xl">
                        <div className="max-w-4xl mx-auto flex gap-3">
                            <Input
                                placeholder="Type your counter-offer or question..."
                                className="bg-white dark:bg-black/40 border-white/[0.06] p-5 h-12 rounded-xl focus:border-violet-500/30 transition-colors placeholder:text-zinc-600"
                                value={userMessage}
                                onChange={(e) => setUserMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <Button
                                onClick={handleSendMessage}
                                disabled={isSubmitting || !userMessage.trim()}
                                className="h-12 w-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-slate-900 dark:text-white font-black shadow-[0_0_20px_rgba(139,92,246,0.25)] hover:shadow-[0_0_30px_rgba(139,92,246,0.45)] border-0 rounded-xl transition-all"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Offer Details Sidebar */}
                <div className="w-[340px] border-l border-white/[0.06] bg-white dark:bg-zinc-900/30 backdrop-blur-2xl p-6 space-y-6 overflow-auto relative z-10 hidden lg:block">
                    {/* Current Offer */}
                    <div className="space-y-3">
                        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                            Current Offer Details
                        </h3>
                        <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5 space-y-4">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent rounded-t-xl" />
                            {[
                                { label: 'Base Salary', value: currentOffer?.base, color: 'text-slate-900 dark:text-white', icon: DollarSign },
                                { label: 'Sign-on Bonus', value: currentOffer?.bonus, color: 'text-emerald-400', icon: Zap },
                                { label: 'Equity (RSUs)', value: currentOffer?.equity, color: 'text-violet-400', icon: TrendingUp },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-0">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-white/[0.03] flex items-center justify-center border border-white/[0.06]">
                                            <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                                        </div>
                                        <span className="text-xs text-zinc-500 font-medium">{item.label}</span>
                                    </div>
                                    <span className={`text-sm font-black ${item.color}`}>${item.value?.toLocaleString()}</span>
                                </div>
                            ))}

                            <div className="pt-3 border-t border-white/[0.06]">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Total Comp</span>
                                    <span className="text-xl font-black bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                                        ${totalComp.toLocaleString()}
                                    </span>
                                </div>
                                {/* Progress to target */}
                                <div className="mt-3">
                                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-zinc-700 mb-1">
                                        <span>Progress to Target</span>
                                        <span>{Math.min(100, Math.round((currentOffer?.base / targetSalary) * 100))}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${Math.min(100, (currentOffer?.base / targetSalary) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Negotiation Tips */}
                    <div className="space-y-3">
                        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Strategy Guide</h3>
                        <div className="space-y-2">
                            {[
                                { text: "Negotiate based on the value you demonstrated.", icon: Target },
                                { text: "Mention competing offers if you have them.", icon: Shield },
                                { text: "Focus on the 'Total Package' not just base.", icon: Briefcase },
                                { text: "Be polite but persistent.", icon: MessageSquare },
                            ].map((tip, i) => (
                                <div key={i} className="flex gap-3 p-3 bg-white dark:bg-zinc-900/40 rounded-xl border border-white/[0.04] hover:border-violet-500/10 transition-all group">
                                    <div className="w-7 h-7 rounded-lg bg-violet-500/5 flex items-center justify-center shrink-0 border border-violet-500/10 group-hover:shadow-[0_0_10px_rgba(139,92,246,0.1)] transition-all">
                                        <tip.icon className="w-3.5 h-3.5 text-violet-400/60" />
                                    </div>
                                    <span className="text-xs text-zinc-500 leading-relaxed">{tip.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full border-white/[0.06] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all font-black text-[9px] uppercase tracking-widest rounded-xl"
                        onClick={() => router.push('/dashboard/history')}
                    >
                        End Simulation
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function NegotiationPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white aurora-glow relative overflow-hidden">
                <div className="absolute top-20 left-10 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-2xl flex items-center justify-center border border-violet-500/20 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
                        <Loader2 className="animate-spin text-violet-400 w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Loading...</span>
                </div>
            </div>
        }>
            <NegotiationContent />
        </Suspense>
    )
}
