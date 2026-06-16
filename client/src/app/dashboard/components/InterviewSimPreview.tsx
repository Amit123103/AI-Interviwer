"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Radio, Brain, Sparkles, ChevronRight, CheckCircle2, Loader2, Disc3 } from "lucide-react"
import { useRouter } from "next/navigation"

const personas = [
    { id: "sarah", name: "Sarah", role: "Technical Lead", color: "from-violet-500 to-fuchsia-500", iconColor: "text-violet-400" },
    { id: "marcus", name: "Marcus", role: "System Design", color: "from-cyan-500 to-blue-500", iconColor: "text-cyan-400" },
    { id: "david", name: "David", role: "Behavioral", color: "from-emerald-500 to-teal-500", iconColor: "text-emerald-400" },
]

const recentTopics = ["React Component Lifecycle", "Microservices", "Conflict Resolution", "System Scaling"]

export default function InterviewSimPreview() {
    const router = useRouter()
    const [selectedPersona, setSelectedPersona] = useState(personas[0])
    const [selectedTopic, setSelectedTopic] = useState("React Component Lifecycle")
    const [isConnecting, setIsConnecting] = useState(false)

    // Animated waveform bars with deterministic heights to prevent hydration mismatch before client-side render
    const initialBars = Array.from({ length: 24 }, (_, i) => ({
        id: i,
        height: 10 + (Math.sin(i) * 10) + 10,
        delay: i * 0.05,
    }))

    const handleStart = () => {
        setIsConnecting(true)
        // Simulate a connection protocol before routing
        setTimeout(() => {
            router.push(`/dashboard/interview/setup?persona=${selectedPersona.id}&topic=${encodeURIComponent(selectedTopic)}`)
        }, 2000)
    }

    const activeColor = selectedPersona.color.split(" ")[0].replace('from-', '')

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900/80 via-zinc-950 to-zinc-900/80 backdrop-blur-3xl border border-white/5 p-6 sm:p-8 group transition-all duration-500">
            {/* Dynamic Rainbow Accent Bar */}
            <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${selectedPersona.color} transition-all duration-700`} />

            {/* Background Pulse based on Persona */}
            <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${selectedPersona.color} opacity-[0.03] transition-colors duration-700`}
                animate={{ opacity: [0.02, 0.05, 0.02] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <motion.div
                                key={selectedPersona.id}
                                initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedPersona.color} flex items-center justify-center p-0.5`}
                            >
                                <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${selectedPersona.color} opacity-20`} />
                                    <Brain className={`w-6 h-6 ${selectedPersona.iconColor} relative z-10`} />
                                </div>
                            </motion.div>

                            {/* Pulsing ring */}
                            <motion.div
                                className={`absolute inset-0 rounded-2xl border-2 border-${activeColor}/30`}
                                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                AI Interviewer
                            </h3>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedPersona.id}
                                    initial={{ y: 5, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -5, opacity: 0 }}
                                    className="flex items-center gap-2 mt-0.5"
                                >
                                    <span className={`text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r ${selectedPersona.color}`}>
                                        {selectedPersona.name} • {selectedPersona.role}
                                    </span>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Persona Selector */}
                <div className="mb-6">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Disc3 className="w-3.5 h-3.5 animate-spin-slow" /> Select AI Persona
                    </div>
                    <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5 backdrop-blur-md">
                        {personas.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedPersona(p)}
                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all relative z-10 ${selectedPersona.id === p.id ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-zinc-400 hover:text-slate-900 dark:text-zinc-200 hover:bg-white/5'}`}
                            >
                                {selectedPersona.id === p.id && (
                                    <motion.div
                                        layoutId="activePersonaBg"
                                        className="absolute inset-0 bg-white/10 rounded-lg -z-10 shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                {p.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Topic Focus Pills */}
                <div className="mb-6">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Suggested Focus</div>
                    <div className="flex flex-wrap gap-2">
                        {recentTopics.map(topic => (
                            <button
                                key={topic}
                                onClick={() => setSelectedTopic(topic)}
                                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-300 border ${selectedTopic === topic
                                        ? `bg-zinc-800 border-zinc-600 text-slate-900 dark:text-white shadow-sm ring-1 ring-white/10`
                                        : 'bg-white/5 border-white/5 text-slate-900 dark:text-zinc-400 hover:text-slate-900 dark:text-zinc-200 hover:bg-white/10'
                                    }`}
                            >
                                {topic}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Waveform Visualization mapped to active color */}
                <div className="flex items-end justify-center gap-1 h-12 mb-6 px-4 mask-linear-fade">
                    {initialBars.map((bar) => (
                        <motion.div
                            key={bar.id}
                            className={`w-1 rounded-t flex-shrink-0 bg-gradient-to-t ${selectedPersona.color} opacity-80`}
                            animate={isConnecting ? {
                                height: [10, 40, 10, 30, 10],
                            } : {
                                height: [bar.height * 0.4, bar.height, bar.height * 0.6, bar.height * 0.8, bar.height * 0.4],
                            }}
                            transition={{
                                duration: isConnecting ? 0.5 : 1.5 + (bar.delay * 2),
                                repeat: Infinity,
                                delay: isConnecting ? bar.delay : bar.delay * 10,
                                ease: "easeInOut",
                            }}
                        />
                    ))}
                </div>

                {/* Call to Action */}
                <button
                    onClick={handleStart}
                    disabled={isConnecting}
                    className={`w-full h-12 rounded-xl text-slate-900 dark:text-white font-bold text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 overflow-hidden relative group`}
                >
                    <div className={`absolute inset-0 bg-gradient-to-r ${selectedPersona.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                    <div className="absolute inset-0 bg-white dark:bg-black/10" />

                    <div className="relative z-10 flex items-center gap-2">
                        <AnimatePresence mode="wait">
                            {isConnecting ? (
                                <motion.div key="connecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Establishing Neuromorphic Link...
                                </motion.div>
                            ) : (
                                <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
                                    Initiate Local Inference
                                    <ChevronRight className="w-4 h-4 ml-1 opacity-60 group-hover:translate-x-1 transition-transform" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </button>
            </div>

            <style jsx>{`
                .mask-linear-fade {
                    -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                    mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                }
            `}</style>
        </div>
    )
}
