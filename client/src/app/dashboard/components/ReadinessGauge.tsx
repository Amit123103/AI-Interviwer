"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ShieldCheck, Activity, Code2, UserCheck } from "lucide-react"

export default function ReadinessGauge() {
    const [score, setScore] = useState(0)
    const targetScore = 84

    useEffect(() => {
        const timer = setTimeout(() => {
            setScore(targetScore)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const getColor = (s: number) => {
        if (s < 40) return "#ef4444"
        if (s < 70) return "#eab308"
        return "#10b981"
    }

    const getLevel = (s: number) => {
        if (s >= 90) return "Expert"
        if (s >= 75) return "Advanced"
        if (s >= 50) return "Intermediate"
        return "Beginner"
    }

    const currentColor = getColor(score)

    return (
        <div className="bg-white dark:bg-zinc-950/40 backdrop-blur-3xl border border-white/10 p-8 rounded-2xl relative overflow-hidden group flex flex-col items-center">
            {/* Rainbow accent */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

            {/* Ambient Glow */}
            <div
                className="absolute inset-0 opacity-10 transition-colors duration-1000 blur-[80px] -z-10"
                style={{ backgroundColor: currentColor }}
            />

            <div className="w-full flex justify-between items-start mb-8 relative z-10 gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">Interview Readiness</h3>
                        <p className="text-xs text-zinc-500 truncate">How ready are you?</p>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-xs text-zinc-500 whitespace-nowrap">Level</div>
                    <div className="text-sm font-bold text-emerald-400">{getLevel(score)}</div>
                </div>
            </div>

            {/* Large Gauge */}
            <div className="relative w-48 h-48 mb-10">
                <svg className="w-full h-full -rotate-90">
                    <circle
                        cx="96" cy="96" r="88"
                        className="stroke-white/5 fill-none"
                        strokeWidth="12"
                    />
                    <motion.circle
                        cx="96" cy="96" r="88"
                        className="fill-none transition-colors duration-1000"
                        stroke={currentColor}
                        strokeWidth="12"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: 553, strokeDashoffset: 553 }}
                        animate={{ strokeDashoffset: 553 - (553 * score) / 100 }}
                        transition={{ duration: 2, ease: "circOut" }}
                        style={{ filter: `drop-shadow(0 0 8px ${currentColor}66)` }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-5xl font-bold text-slate-900 dark:text-white"
                    >
                        {score}<span className="text-xl opacity-50 ml-1">%</span>
                    </motion.div>
                    <div className="text-xs text-zinc-500 mt-1 font-medium">Ready</div>
                </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-4 w-full relative z-10">
                {[
                    { label: "Resume", val: 92, icon: <Activity className="w-3 h-3" /> },
                    { label: "Coding", val: 78, icon: <Code2 className="w-3 h-3" /> },
                    { label: "Soft Skills", val: 82, icon: <UserCheck className="w-3 h-3" /> }
                ].map((m) => (
                    <div key={m.label} className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-slate-900 dark:text-zinc-400 mb-2">
                            {m.icon}
                        </div>
                        <div className="text-[11px] text-zinc-500 mb-1 font-medium">{m.label}</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{m.val}%</div>
                    </div>
                ))}
            </div>

            <div className="mt-8 w-full">
                <button className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-slate-900 dark:text-white font-semibold text-sm shadow-lg shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Get full report
                </button>
            </div>
        </div>
    )
}
