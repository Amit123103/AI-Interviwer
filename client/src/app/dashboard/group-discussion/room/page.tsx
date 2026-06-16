"use client"

import React, { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Video, VideoOff, Hand, MessageSquare, Clock, BarChart3, Settings, LogOut, Pin, Send, Smile, X, ChevronRight, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const mockParticipants = [
    { id: "p1", name: "You", initials: "YO", isSelf: true, isSpeaking: false, micOn: true, camOn: true },
    { id: "p2", name: "Priya S.", initials: "PS", isSelf: false, isSpeaking: true, micOn: true, camOn: true },
    { id: "p3", name: "Rahul V.", initials: "RV", isSelf: false, isSpeaking: false, micOn: true, camOn: false },
    { id: "p4", name: "Ananya K.", initials: "AK", isSelf: false, isSpeaking: false, micOn: false, camOn: true },
    { id: "p5", name: "AI Moderator", initials: "AI", isSelf: false, isSpeaking: false, micOn: true, camOn: false },
]

const mockMessages = [
    { id: "m1", sender: "AI Moderator", text: "Welcome everyone! Today we discuss the selected topic. Let's begin with opening statements.", time: "00:02", isAI: true },
    { id: "m2", sender: "Priya S.", text: "I think this is a really important topic. Let me share my perspective...", time: "01:15", isAI: false },
    { id: "m3", sender: "Rahul V.", text: "Great point Priya! I'd like to add that we should also consider the economic implications.", time: "02:30", isAI: false },
    { id: "m4", sender: "AI Moderator", text: "📋 Summary so far: 2 participants shared opening views. Priya focused on social impact, Rahul on economics. Let's hear from others.", time: "03:00", isAI: true },
]

const reactions = ["👏", "🔥", "💡", "❤️", "😂", "🤔"]

function RoomContent() {
    const searchParams = useSearchParams()
    const topic = decodeURIComponent(searchParams.get("topic") || "Discussion Topic")
    const roomCode = searchParams.get("code")

    const [copied, setCopied] = useState(false)
    const [micOn, setMicOn] = useState(true)
    const [camOn, setCamOn] = useState(true)
    const [handRaised, setHandRaised] = useState(false)
    const [chatOpen, setChatOpen] = useState(true)
    const [showStats, setShowStats] = useState(false)
    const [messages, setMessages] = useState(mockMessages)
    const [newMsg, setNewMsg] = useState("")
    const [timer, setTimer] = useState(0)
    const [floatingReactions, setFloatingReactions] = useState<{ id: number; emoji: string }[]>([])

    useEffect(() => {
        const interval = setInterval(() => setTimer(t => t + 1), 1000)
        return () => clearInterval(interval)
    }, [])

    const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`

    const sendMessage = () => {
        if (!newMsg.trim()) return
        setMessages(prev => [...prev, { id: `m${Date.now()}`, sender: "You", text: newMsg, time: formatTime(timer), isAI: false }])
        setNewMsg("")
    }

    const sendReaction = (emoji: string) => {
        const id = Date.now()
        setFloatingReactions(prev => [...prev, { id, emoji }])
        setTimeout(() => setFloatingReactions(prev => prev.filter(r => r.id !== id)), 2000)
    }

    return (
        <div className="h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col overflow-hidden">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-zinc-900/80 border-b border-white/[0.06] shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                    <Pin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <p className="text-sm font-semibold truncate max-w-md">{topic}</p>
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-red-500/20 text-red-300 rounded-full flex items-center gap-1 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-red-500 live-dot" /> LIVE</span>
                </div>
                <div className="flex items-center gap-3">
                    {roomCode && (
                        <div
                            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] cursor-pointer hover:bg-white/[0.08] transition-all"
                            onClick={() => { navigator.clipboard.writeText(roomCode); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                        >
                            <span className="text-xs text-slate-500 dark:text-zinc-400">Code:</span>
                            <span className="text-sm font-mono font-bold text-violet-400 tracking-wider">{roomCode}</span>
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                        </div>
                    )}
                    <span className="text-sm font-mono text-slate-500 dark:text-zinc-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatTime(timer)}</span>
                    <span className="text-xs text-zinc-500">{mockParticipants.length} participants</span>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Floating Reactions */}
                <AnimatePresence>
                    {floatingReactions.map(r => (
                        <motion.div key={r.id} initial={{ opacity: 1, y: 0, x: Math.random() * 200 + 100 }} animate={{ opacity: 0, y: -200 }} exit={{ opacity: 0 }} className="fixed bottom-24 text-3xl z-50 pointer-events-none">{r.emoji}</motion.div>
                    ))}
                </AnimatePresence>

                {/* Video Grid */}
                <div className="flex-1 p-4 flex flex-col gap-2">
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2 auto-rows-fr">
                        {mockParticipants.map(p => (
                            <div key={p.id} className={`relative rounded-xl overflow-hidden bg-white dark:bg-zinc-900 border ${p.isSpeaking ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "border-white/[0.06]"} transition-all`}>
                                {p.camOn ? (
                                    <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center text-xl font-bold">{p.initials}</div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-white dark:bg-zinc-900 flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-xl font-bold text-zinc-500">{p.initials}</div>
                                    </div>
                                )}
                                {/* Name bar */}
                                <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 bg-white dark:bg-black/60 backdrop-blur-sm flex items-center justify-between">
                                    <span className="text-xs font-semibold truncate">{p.name} {p.isSelf && "(You)"}</span>
                                    <div className="flex items-center gap-1.5">
                                        {p.isSpeaking && <span className="w-2 h-2 rounded-full bg-emerald-500 live-dot" />}
                                        {!p.micOn && <MicOff className="w-3 h-3 text-red-400" />}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Live Transcript Ticker */}
                    <div className="h-10 px-4 rounded-lg bg-white dark:bg-zinc-900/60 border border-white/[0.06] flex items-center gap-2 overflow-hidden">
                        <span className="text-emerald-400 text-[10px] font-bold shrink-0">🎙️ LIVE</span>
                        <p className="text-xs text-slate-600 dark:text-zinc-300 truncate animate-pulse">Priya is speaking: &ldquo;I believe we need to consider multiple perspectives on this issue...&rdquo;</p>
                    </div>
                </div>

                {/* Chat Sidebar */}
                <AnimatePresence>
                    {chatOpen && (
                        <motion.div initial={{ width: 0 }} animate={{ width: 320 }} exit={{ width: 0 }} className="border-l border-white/[0.06] bg-white/60 dark:bg-zinc-900/50 flex flex-col overflow-hidden shrink-0">
                            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between shrink-0">
                                <h3 className="text-sm font-bold">💬 Chat</h3>
                                <button onClick={() => setChatOpen(false)} className="text-zinc-500 hover:text-slate-900 dark:text-white"><X className="w-4 h-4" /></button>
                            </div>
                            {/* Pinned Topic */}
                            <div className="px-3 py-2 mx-3 mt-2 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/15">
                                <p className="text-[9px] text-emerald-400 font-bold flex items-center gap-1"><Pin className="w-2.5 h-2.5" /> TOPIC</p>
                                <p className="text-xs text-slate-600 dark:text-zinc-300 line-clamp-2">{topic}</p>
                            </div>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
                                {messages.map(m => (
                                    <div key={m.id} className={`p-2.5 rounded-lg ${m.isAI ? "bg-emerald-500/[0.06] border border-emerald-500/10" : "bg-white/[0.02]"}`}>
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <span className={`text-[10px] font-bold ${m.isAI ? "text-emerald-400" : "text-slate-900 dark:text-white"}`}>{m.sender}</span>
                                            <span className="text-[9px] text-zinc-600">{m.time}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-zinc-300">{m.text}</p>
                                    </div>
                                ))}
                            </div>
                            {/* Reactions */}
                            <div className="px-3 py-1.5 flex gap-1.5 border-t border-white/[0.04]">
                                {reactions.map(emoji => (
                                    <button key={emoji} onClick={() => sendReaction(emoji)} className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center text-sm transition-all hover:scale-110">{emoji}</button>
                                ))}
                            </div>
                            {/* Input */}
                            <div className="px-3 py-2 border-t border-white/[0.06] flex gap-2 shrink-0">
                                <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Type a message..." className="flex-1 h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-900 dark:text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500/40" />
                                <button onClick={sendMessage} className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/30 transition-all"><Send className="w-4 h-4" /></button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* AI Stats Panel */}
                <AnimatePresence>
                    {showStats && (
                        <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-zinc-950/95 backdrop-blur-xl border-r border-white/[0.06] p-4 overflow-y-auto z-40">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold">📊 Your Live Stats</h3>
                                <button onClick={() => setShowStats(false)} className="text-zinc-500 hover:text-slate-900 dark:text-white"><X className="w-4 h-4" /></button>
                            </div>
                            {[
                                { label: "Speaking Time", value: `${Math.floor(timer * 0.3)}s`, pct: 30, color: "emerald" },
                                { label: "Confidence", value: "76%", pct: 76, color: "violet" },
                                { label: "Filler Words", value: "3", pct: 15, color: "amber" },
                                { label: "Relevance", value: "82%", pct: 82, color: "cyan" },
                                { label: "Grammar", value: "91%", pct: 91, color: "emerald" },
                                { label: "Voice Pace", value: "Good", pct: 70, color: "blue" },
                                { label: "Point Quality", value: "Strong", pct: 85, color: "violet" },
                            ].map(stat => (
                                <div key={stat.label} className="mb-4">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-500 dark:text-zinc-400">{stat.label}</span>
                                        <span className={`font-bold text-${stat.color}-400`}>{stat.value}</span>
                                    </div>
                                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className={`h-full bg-${stat.color}-500 rounded-full transition-all duration-1000`} style={{ width: `${stat.pct}%` }} />
                                    </div>
                                </div>
                            ))}
                            <div className="mt-6 p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15">
                                <p className="text-[10px] text-emerald-400 font-bold mb-1">💡 AI Tip</p>
                                <p className="text-xs text-slate-600 dark:text-zinc-300">Try to back your points with specific examples or data to strengthen your argument.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Toolbar */}
            <div className="flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-zinc-900/80 border-t border-white/[0.06] shrink-0">
                <button onClick={() => setMicOn(!micOn)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${micOn ? "bg-zinc-800 hover:bg-zinc-700" : "bg-red-500"}`}>
                    {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>
                <button onClick={() => setCamOn(!camOn)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${camOn ? "bg-zinc-800 hover:bg-zinc-700" : "bg-red-500"}`}>
                    {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
                <button onClick={() => setHandRaised(!handRaised)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${handRaised ? "bg-amber-500" : "bg-zinc-800 hover:bg-zinc-700"}`}>
                    <Hand className="w-5 h-5" />
                </button>
                <button onClick={() => setChatOpen(!chatOpen)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${chatOpen ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 hover:bg-zinc-700"}`}>
                    <MessageSquare className="w-5 h-5" />
                </button>
                <button onClick={() => setShowStats(!showStats)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${showStats ? "bg-violet-500/20 text-violet-400" : "bg-zinc-800 hover:bg-zinc-700"}`}>
                    <BarChart3 className="w-5 h-5" />
                </button>
                <span className="text-sm font-mono text-slate-500 dark:text-zinc-400 mx-2">{formatTime(timer)}</span>
                <Link href={`/dashboard/group-discussion/report?topic=${encodeURIComponent(topic)}`}>
                    <button className="h-10 px-5 rounded-full bg-red-500 hover:bg-red-400 text-slate-900 dark:text-white font-semibold text-sm flex items-center gap-2 transition-all">
                        <LogOut className="w-4 h-4" /> End Session
                    </button>
                </Link>
            </div>
        </div>
    )
}

export default function RoomPage() {
    return (
        <Suspense fallback={<div className="h-screen bg-white dark:bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <RoomContent />
        </Suspense>
    )
}
