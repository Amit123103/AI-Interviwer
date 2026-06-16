"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Lightbulb, ChevronRight, ChevronLeft, Quote } from "lucide-react"

const tips = [
    {
        id: 1,
        category: "Behavioral",
        content: "Use the STAR method (Situation, Task, Action, Result) for behavioral questions to provide structured and impactful answers.",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10"
    },
    {
        id: 2,
        category: "Technical",
        content: "Always communicate your thought process while coding. Interviewers value how you think more than just the perfect solution.",
        color: "text-blue-400",
        bg: "bg-blue-500/10"
    },
    {
        id: 3,
        category: "System Design",
        content: "Don't jump into drawing. Start by clarifying requirements, scale (users, data), and constraints before proposing architecture.",
        color: "text-purple-400",
        bg: "bg-purple-500/10"
    },
    {
        id: 4,
        category: "Resume",
        content: "Use strong action verbs and quantify your achievements (e.g., 'Improved performance by 30%') to stand out to recruiters.",
        color: "text-amber-400",
        bg: "bg-amber-500/10"
    },
    {
        id: 5,
        category: "Confidence",
        content: "Maintain steady eye contact and an upright posture. Non-verbal cues account for over 50% of the first impression.",
        color: "text-rose-400",
        bg: "bg-rose-500/10"
    }
]

export default function QuickTips() {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % tips.length)
        }, 8000)
        return () => clearInterval(timer)
    }, [])

    const currentTip = tips[index]

    return (
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-white/5 p-8 rounded-2xl relative overflow-hidden group h-full flex flex-col shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-blue-500/50 via-indigo-500/50 to-transparent" />
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -z-10" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Quick Tips</h3>
                        <p className="text-xs text-slate-500">Sharpen your technique</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    {tips.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-500 ${i === index ? 'w-4 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'w-1 bg-white/10'}`}
                        />
                    ))}
                </div>
            </div>

            <div className="flex-1 relative flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                        className="space-y-6"
                    >
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 ${currentTip.bg} ${currentTip.color}`}>
                            <Lightbulb className="w-3.5 h-3.5" />
                            <span className="text-xs font-semibold">{currentTip.category}</span>
                        </div>

                        <div className="relative">
                            <Quote className="absolute -top-4 -left-4 w-10 h-10 text-slate-900 dark:text-white/5 -z-10" />
                            <p className="text-lg font-medium leading-relaxed text-slate-900 dark:text-slate-200 indent-2">
                                {currentTip.content}
                            </p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="mt-8 flex items-center justify-between relative z-10">
                <div className="flex gap-2">
                    <button
                        onClick={() => setIndex((prev) => (prev - 1 + tips.length) % tips.length)}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-slate-900 dark:text-white transition-all hover:bg-white/10"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIndex((prev) => (prev + 1) % tips.length)}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-slate-900 dark:text-white transition-all hover:bg-white/10"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
                <button className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5 group/btn uppercase tracking-wider">
                    More tips
                    <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    )
}
