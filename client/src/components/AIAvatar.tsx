"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, Sparkles, Activity, Trophy } from "lucide-react"

interface AIAvatarProps {
    isSpeaking: boolean
    isListening?: boolean
    isThinking?: boolean
    isEvaluating?: boolean
    persona?: string
    company?: string
    currentQuestion?: string
    currentStep?: number
    currentQuestionIndex?: number
    totalSteps?: number
    interviewType?: string
    volume?: number
    className?: string
}

export default function AIAvatar({
    isSpeaking,
    isListening = false,
    isThinking = false,
    isEvaluating = false,
    persona = "Friendly Mentor",
    company = "General",
    currentQuestion = "",
    currentStep = 1,
    currentQuestionIndex = 0,
    totalSteps = 10,
    volume = 0,
    className = ""
}: AIAvatarProps) {
    const baseColor = persona === "Strict Lead"
        ? "#ef4444"
        : persona === "Stress Tester"
            ? "#f97316"
            : "#22c55e"

    // Dynamic color based on state
    const activeColor = isThinking ? "#f59e0b" // Amber
        : isEvaluating ? "#8b5cf6" // Violet
            : isListening ? "#3b82f6" // Blue
                : baseColor;

    return (
        <div className={`flex flex-col items-center gap-8 select-none p-6 ${className}`}>
            {/* Animated Avatar Orb - Premium Version */}
            <div className="relative flex items-center justify-center w-52 h-52 md:w-64 md:h-64">

                {/* Quantum Particle Field */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                            key={`particle_${i}`}
                            className="absolute w-1 h-1 rounded-full bg-primary/40"
                            initial={{
                                x: "50%",
                                y: "50%",
                                opacity: 0,
                                scale: 0
                            }}
                            animate={{
                                x: [`${45 + Math.random() * 10}%`, `${Math.random() * 100}%`],
                                y: [`${45 + Math.random() * 10}%`, `${Math.random() * 100}%`],
                                opacity: [0, 0.6, 0],
                                scale: [0, 1.5, 0]
                            }}
                            transition={{
                                duration: 2 + Math.random() * 3,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeOut"
                            }}
                            style={{ backgroundColor: activeColor }}
                        />
                    ))}
                </div>

                {/* Background Crystalline Grid */}
                <div className="absolute inset-0 rounded-full border border-white/5 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0,transparent_70%)]" />

                {/* Displacement Filter Definitions (Inline for simplicity) */}
                <svg className="hidden">
                    <defs>
                        <filter id="displacementFilter">
                            <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence" />
                            <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="10" xChannelSelector="R" yChannelSelector="G" />
                        </filter>
                    </defs>
                </svg>

                {/* Reactive Radial Rings */}
                <AnimatePresence>
                    {(isSpeaking || isThinking || isListening || isEvaluating) && (
                        <>
                            {/* Orbital Data Rings */}
                            <motion.div
                                key="ring_outer"
                                className="absolute rounded-full border border-dashed"
                                style={{ borderColor: activeColor + '15' }}
                                initial={{ width: "60%", height: "60%", opacity: 0, rotate: 0 }}
                                animate={{ width: "115%", height: "115%", opacity: [0, 0.4, 0], rotate: 360 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            />
                            
                            <motion.div
                                key="ring_data"
                                className="absolute rounded-full border border-primary/5 border-t-primary/30 border-b-primary/30"
                                style={{ width: "130%", height: "130%" }}
                                animate={{
                                    rotate: -360,
                                    scale: isSpeaking ? [1, 1.02, 1] : 1,
                                }}
                                transition={{
                                    rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                                    scale: { duration: 0.1, repeat: Infinity }
                                }}
                            />
                            
                            <motion.div
                                key="ring_inner"
                                className="absolute rounded-full border-2"
                                style={{ borderColor: activeColor + '25', filter: 'url(#displacementFilter)' }}
                                initial={{ width: "50%", height: "50%", opacity: 0 }}
                                animate={{
                                    width: isSpeaking ? ["85%", "90%", "85%"] : "85%",
                                    opacity: [0.1, 0.4, 0.1],
                                    rotate: isThinking ? [0, 360] : 0
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </>
                    )}
                </AnimatePresence>

                {/* Core Liquid Orb */}
                <motion.div
                    className="relative w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                    style={{
                        background: `radial-gradient(circle at 35% 35%, ${activeColor}33, #0a0a0a 80%)`,
                        border: `1px solid ${activeColor}44`,
                        backdropFilter: 'blur(10px)'
                    }}
                    animate={{
                        scale: isSpeaking ? [1, 1.05, 1] : isListening ? (1 + (volume / 120)) : isThinking ? [1, 0.98, 1] : 1,
                        boxShadow: isSpeaking ? [`0 0 20px ${activeColor}22`, `0 0 40px ${activeColor}44`, `0 0 20px ${activeColor}22`] : `0 0 20px rgba(0,0,0,0.5)`
                    }}
                    transition={{ duration: isListening ? 0.05 : 1, repeat: Infinity, ease: "easeInOut" }}
                >
                    {/* Interior depth glow */}
                    <div
                        className="absolute inset-0 opacity-20 bg-[conic-gradient(from_0deg,transparent,white,transparent)] animate-spin-slow"
                        style={{ maskImage: 'radial-gradient(circle, black, transparent)' }}
                    />

                    {/* Chromatic Aberration & Internal Depth */}
                    <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
                        <div className="absolute inset-0 bg-indigo-500/10 blur-[3px] translate-x-1" />
                        <div className="absolute inset-0 bg-cyan-500/10 blur-[3px] -translate-x-1" />
                    </div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

                    <Brain className="w-14 h-14 md:w-16 md:h-16 relative z-10" style={{ color: activeColor, filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))' }} />

                    {/* Active State Scanner Line */}
                    {(isThinking || isEvaluating) && (
                        <motion.div
                            className="absolute inset-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent"
                            animate={{ top: ["0%", "100%", "0%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                    )}
                </motion.div>

                {/* Status Badge */}
                <AnimatePresence>
                    {(isSpeaking || isListening || isThinking || isEvaluating) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="absolute -top-2 -right-2 px-3 py-1 bg-zinc-950 border border-white/10 rounded-full flex items-center gap-2 shadow-2xl backdrop-blur-xl"
                        >
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: activeColor }} />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                {isThinking ? "Thinking" : isEvaluating ? "Evaluating" : isSpeaking ? "Speaking" : "Active"}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Liquid Waveform Feed */}
            <div className="h-10 flex items-center gap-1">
                <AnimatePresence mode="wait">
                    {isSpeaking ? (
                        <div className="flex items-center gap-1 h-full">
                            {Array.from({ length: 18 }).map((_, i) => (
                                <motion.div
                                    key={`bar_${i}`}
                                    className="w-1 rounded-full"
                                    style={{ backgroundColor: activeColor }}
                                    animate={{ height: ['8px', `${12 + Math.random() * 24}px`, '8px'] }}
                                    transition={{ duration: 0.3 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.03, ease: "easeInOut" }}
                                />
                            ))}
                        </div>
                    ) : isListening ? (
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Voice Input Active</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 opacity-20">
                            {Array.from({ length: 18 }).map((_, i) => (
                                <div key={`dot_${i}`} className="w-1 h-1 rounded-full bg-zinc-500" />
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* AI Profile Nameplate */}
            <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-3 h-3 text-primary/60" />
                    <p className="text-sm font-black tracking-[0.1em] uppercase italic bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                        AI <span className="text-primary">CORE</span>
                    </p>
                    <Sparkles className="w-3 h-3 text-primary/60" />
                </div>
                <div className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
                    <p className="text-[9px] text-zinc-500 uppercase tracking-[0.3em] font-black">
                        {company && company !== 'General' ? company : 'System'} Profile · {persona}
                    </p>
                </div>
            </div>

            {/* Strategic Insights Display */}
            <AnimatePresence>
                {currentQuestion && (
                    <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-sm"
                    >
                        <div className="relative p-6 bg-zinc-950/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-all shadow-[0_0_15px_rgba(var(--primary),0.3)]" />
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Transmission {currentStep}</span>
                                <div className="flex gap-1">
                                    {Array.from({ length: totalSteps }).map((_, i) => (
                                        <div key={i} className={`h-1 rounded-full transition-all ${i < currentStep ? 'bg-primary w-4' : 'bg-zinc-800 w-1'}`} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs font-medium text-zinc-300 leading-relaxed italic pr-2">
                                "{currentQuestion}"
                            </p>

                            <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                                <div className="flex items-center gap-2">
                                    <Trophy className="w-3 h-3 text-amber-500/50" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Active Evaluation</span>
                                </div>
                                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-primary tabular-nums">
                                    {Math.round((currentStep / totalSteps) * 100)}% Complete
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
