"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RotateCcw, Volume2, Brain, Activity, Sparkles, Mic, MicOff, MessageSquare, BarChart3, Shield, Cpu } from "lucide-react"
import { Button } from "@/components/ui/button"

function VoiceWaveform({ active, color = "indigo", label }: { active: boolean; color?: string; label: string }) {
    const bars = 20
    const colorMap: Record<string, string> = {
        indigo: "bg-indigo-500",
        teal: "bg-teal-500",
    }
    return (
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-zinc-800' : 'bg-zinc-800/60'} transition-colors`}>
                {active ? <Mic className={`w-4 h-4 ${color === 'indigo' ? 'text-indigo-400' : 'text-teal-400'}`} /> : <MicOff className="w-4 h-4 text-zinc-600" />}
            </div>
            <div className="flex items-end gap-[2px] h-5">
                {Array.from({ length: bars }).map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ height: active ? [3, Math.random() * 16 + 3, 3] : 3 }}
                        transition={{ duration: 0.5 + Math.random() * 0.3, repeat: active ? Infinity : 0, delay: i * 0.03, ease: "easeInOut" }}
                        className={`w-[2px] rounded-full ${active ? colorMap[color] || colorMap.indigo : 'bg-zinc-700'} transition-colors`}
                        style={{ minHeight: 3 }}
                    />
                ))}
            </div>
            <span className={`text-xs font-medium ${active ? 'text-zinc-300' : 'text-zinc-600'}`}>{label}</span>
        </div>
    )
}

const CONVERSATION = [
    { speaker: "ai", text: "Hi! I'm your AI interviewer today. Let's start — can you walk me through your most challenging project?", delay: 0 },
    { speaker: "user", text: "Sure! I built a real-time collaboration platform using CRDTs for conflict-free editing across distributed nodes...", delay: 3 },
    { speaker: "ai", text: "Great approach! How did you handle the consistency-availability trade-off?", delay: 7 },
    { speaker: "user", text: "We used operation-based CRDTs with a causal broadcast layer, falling back to Raft for strong consistency...", delay: 11 },
    { speaker: "ai", text: "Excellent depth! Your confidence is rising. Let's move to system design — how would you architect a global CDN?", delay: 16 },
]

function LiveTranscript({ isPlaying, elapsed }: { isPlaying: boolean; elapsed: number }) {
    const visibleMessages = CONVERSATION.filter(m => isPlaying && elapsed >= m.delay)
    return (
        <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2">
            <AnimatePresence>
                {visibleMessages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                        className={`flex gap-2.5 ${msg.speaker === 'ai' ? '' : 'flex-row-reverse'}`}>
                        <div className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center text-xs font-semibold ${msg.speaker === 'ai' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-teal-500/20 text-teal-400'}`}>
                            {msg.speaker === 'ai' ? <Brain className="w-3 h-3" /> : 'Y'}
                        </div>
                        <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed max-w-[85%] ${msg.speaker === 'ai' ? 'bg-zinc-800 border border-zinc-700 text-zinc-300' : 'bg-teal-500/10 border border-teal-500/20 text-zinc-300'}`}>
                            {msg.text}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
            {visibleMessages.length === 0 && (
                <div className="text-center text-zinc-600 text-xs py-6">Press play to start the demo...</div>
            )}
        </div>
    )
}

function LiveMetrics({ isPlaying, elapsed }: { isPlaying: boolean; elapsed: number }) {
    const metrics = [
        { label: "Confidence", value: Math.min(88, 45 + elapsed * 3), color: "from-emerald-500 to-teal-400" },
        { label: "Technical", value: Math.min(94, 50 + elapsed * 3.5), color: "from-indigo-500 to-violet-400" },
        { label: "Communication", value: Math.min(91, 60 + elapsed * 2), color: "from-blue-500 to-cyan-400" },
        { label: "Engagement", value: Math.min(96, 55 + elapsed * 3), color: "from-amber-500 to-orange-400" },
    ]
    return (
        <div className="space-y-3">
            {metrics.map((m, i) => (
                <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                        <span className="text-zinc-500">{m.label}</span>
                        <span className="text-zinc-300 font-semibold">{isPlaying ? Math.round(m.value) : '--'}%</span>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div className={`h-full bg-gradient-to-r ${m.color} rounded-full`}
                            animate={{ width: isPlaying ? `${m.value}%` : '0%' }} transition={{ duration: 1, ease: "easeOut" }} />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function SystemDemo() {
    const [isPlaying, setIsPlaying] = useState(false)
    const [elapsed, setElapsed] = useState(0)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (isPlaying) { timerRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000) }
        else { if (timerRef.current) clearInterval(timerRef.current) }
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [isPlaying])

    const togglePlay = () => { if (!isPlaying) setElapsed(0); setIsPlaying(!isPlaying) }
    const reset = () => { setIsPlaying(false); setElapsed(0) }
    const currentSpeaker = CONVERSATION.reduce((acc: string, m) => elapsed >= m.delay ? m.speaker : acc, '')
    const progress = Math.min((elapsed / 20) * 100, 100)

    return (
        <section id="demo" className="w-full py-24 sm:py-32 relative overflow-hidden px-4 sm:px-6 bg-zinc-50">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

            <div className="container mx-auto">
                <div className="flex flex-col items-center text-center mb-16 space-y-4">
                    <p className="text-sm font-medium text-teal-600">Interactive Demo</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
                        See it in{" "}
                        <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">action</span>
                    </h2>
                    <p className="text-zinc-500 max-w-2xl text-lg">
                        Experience a live simulated interview with real-time voice analysis, feedback, and adaptive questioning. Press play to watch.
                    </p>
                </div>

                <div className="relative max-w-5xl mx-auto">
                    <div className="absolute -inset-4 bg-gradient-to-r from-indigo-100/50 via-violet-50/30 to-teal-100/50 blur-3xl rounded-3xl" />

                    <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-800">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                                </div>
                                <span className="text-xs text-zinc-500 font-medium ml-2">AI Interview Session</span>
                            </div>
                            <motion.div animate={isPlaying ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.3 }} transition={{ duration: 1.5, repeat: Infinity }}>
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500' : 'bg-zinc-700'}`} />
                                    <span className="text-xs text-zinc-500 font-medium">{isPlaying ? 'REC' : 'IDLE'}</span>
                                </div>
                            </motion.div>
                        </div>

                        <div className="grid lg:grid-cols-3 min-h-[400px]">
                            <div className="lg:col-span-2 p-5 space-y-5 border-r border-zinc-800">
                                <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 aspect-[16/9]">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="relative">
                                            <motion.div animate={isPlaying && currentSpeaker === 'ai' ? { scale: [1, 1.12, 1], opacity: [0.2, 0.4, 0.2] } : {}}
                                                transition={{ duration: 1.5, repeat: Infinity }} className="absolute -inset-4 rounded-full bg-indigo-500/15" />
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg border border-indigo-400/20">
                                                <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                    {!isPlaying && elapsed === 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                                            <Button onClick={togglePlay} className="w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105 transition-transform shadow-lg">
                                                <Play className="w-7 h-7 fill-current" />
                                            </Button>
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-lg px-2.5 py-1.5">
                                        <Brain className="w-3 h-3 text-indigo-400" />
                                        <span className="text-xs font-medium text-indigo-400">AI Interviewer</span>
                                    </div>
                                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md rounded-lg px-2.5 py-1.5">
                                        <span className="text-xs font-mono text-zinc-400">
                                            {String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-4 px-1">
                                    <VoiceWaveform active={isPlaying && currentSpeaker === 'ai'} color="indigo" label="AI" />
                                    <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/15 via-zinc-800 to-teal-500/15" />
                                    <VoiceWaveform active={isPlaying && currentSpeaker === 'user'} color="teal" label="You" />
                                </div>
                            </div>
                            <div className="p-5 space-y-5">
                                <div>
                                    <p className="text-xs font-medium text-zinc-500 mb-3 flex items-center gap-2"><MessageSquare className="w-3.5 h-3.5 text-blue-400" /> Live Transcript</p>
                                    <LiveTranscript isPlaying={isPlaying} elapsed={elapsed} />
                                </div>
                                <div className="h-px bg-zinc-800" />
                                <div>
                                    <p className="text-xs font-medium text-zinc-500 mb-3 flex items-center gap-2"><BarChart3 className="w-3.5 h-3.5 text-emerald-400" /> Live Metrics</p>
                                    <LiveMetrics isPlaying={isPlaying} elapsed={elapsed} />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-zinc-800 space-y-3">
                            <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button onClick={togglePlay} className="text-zinc-400 hover:text-white transition-colors">
                                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                    </button>
                                    <button onClick={reset} className="text-zinc-500 hover:text-white transition-colors"><RotateCcw className="w-4 h-4" /></button>
                                    <div className="flex items-center gap-2">
                                        <Volume2 className="w-4 h-4 text-zinc-500" />
                                        <div className="h-1 w-14 bg-zinc-800 rounded-full"><div className="h-full w-2/3 bg-indigo-400/40 rounded-full" /></div>
                                    </div>
                                    <span className="text-xs font-mono text-zinc-500">{String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')} / 0:20</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-20">
                    {[
                        { label: "Avg. Improvement", value: "+40%", desc: "Confidence Score", color: "text-emerald-600", icon: <BarChart3 className="w-4 h-4" /> },
                        { label: "Interviews", value: "512K+", desc: "Sessions Processed", color: "text-indigo-600", icon: <Brain className="w-4 h-4" /> },
                        { label: "Hire Rate", value: "92%", desc: "For Active Users", color: "text-blue-600", icon: <Shield className="w-4 h-4" /> },
                        { label: "Latency", value: "280ms", desc: "Avg Response Time", color: "text-teal-600", icon: <Cpu className="w-4 h-4" /> },
                    ].map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="flex flex-col items-center text-center space-y-2">
                            <div className={`w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center ${s.color} shadow-sm`}>{s.icon}</div>
                            <span className="text-xs text-zinc-400">{s.label}</span>
                            <span className={`text-2xl font-bold tracking-tight ${s.color}`}>{s.value}</span>
                            <span className="text-xs text-zinc-400">{s.desc}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
