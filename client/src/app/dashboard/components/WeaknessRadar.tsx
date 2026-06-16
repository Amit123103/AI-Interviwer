"use client"

import React from "react"
import { motion } from "framer-motion"
import { AlertTriangle, Shield, Brain, ArrowRight, Crosshair } from "lucide-react"

interface WeaknessArea {
    name: string
    severity: "critical" | "moderate" | "low"
    score: number
    recommendation: string
}

export default function WeaknessRadar() {
    const weaknesses: WeaknessArea[] = [
        { name: "System Design", severity: "critical", score: 38, recommendation: "Practice distributed systems patterns" },
        { name: "Behavioral — STAR", severity: "moderate", score: 55, recommendation: "Structure answers with STAR method" },
        { name: "Time Complexity", severity: "low", score: 72, recommendation: "Review Big-O for common algorithms" },
    ]

    const getSeverityConfig = (severity: string) => {
        switch (severity) {
            case "critical": return { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", glow: "shadow-red-500/20", badge: "bg-red-500/20 text-red-400", pulse: true }
            case "moderate": return { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "shadow-amber-500/15", badge: "bg-amber-500/20 text-amber-400", pulse: false }
            default: return { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "shadow-blue-500/10", badge: "bg-blue-500/20 text-blue-400", pulse: false }
        }
    }

    return (
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-950/40 backdrop-blur-3xl border border-white/10 p-8 group">
            {/* Rainbow accent bar */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-500 via-amber-400 via-blue-500 to-violet-500" />
            {/* Scanning radar animation */}
            <div className="absolute top-8 right-8 w-24 h-24 opacity-10">
                <motion.div
                    className="absolute inset-0 border-2 border-red-500/30 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.div
                    className="absolute inset-2 border border-red-500/20 rounded-full"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                />
                <div className="absolute inset-4 border border-dashed border-red-500/10 rounded-full" />
                <motion.div
                    className="absolute top-1/2 left-1/2 w-0.5 h-12 bg-gradient-to-b from-red-500/40 to-transparent origin-bottom -translate-x-1/2 -translate-y-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
            </div>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <Crosshair className="w-5 h-5 text-red-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Areas to Improve</h3>
                    <p className="text-xs text-zinc-500">Skills that need a little more practice</p>
                </div>
            </div>

            {/* Weakness Cards */}
            <div className="space-y-4 relative z-10">
                {weaknesses.map((w, i) => {
                    const config = getSeverityConfig(w.severity)
                    return (
                        <motion.div
                            key={w.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.15, duration: 0.5 }}
                            className={`p-4 rounded-2xl ${config.bg} border ${config.border} shadow-lg ${config.glow} hover:scale-[1.02] transition-all group/item cursor-default`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-xl ${config.bg} flex items-center justify-center ${config.color}`}>
                                        {config.pulse && (
                                            <motion.div
                                                className="absolute w-8 h-8 rounded-xl border border-red-500/30"
                                                animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            />
                                        )}
                                        <AlertTriangle className="w-4 h-4 relative z-10" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{w.name}</h4>
                                        <span className={`text-[10px] font-medium ${config.color}`}>{w.severity} priority</span>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full ${config.badge} text-[10px] font-semibold`}>
                                    {w.score}%
                                </div>
                            </div>

                            {/* Score bar */}
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                                <motion.div
                                    className={`h-full rounded-full ${w.severity === 'critical' ? 'bg-red-500' : w.severity === 'moderate' ? 'bg-amber-500' : 'bg-blue-500'}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${w.score}%` }}
                                    transition={{ duration: 1.2, delay: i * 0.2, ease: "circOut" }}
                                />
                            </div>

                            <div className="flex items-center gap-2 text-[10px] text-slate-900 dark:text-zinc-400 group-hover/item:text-slate-900 dark:text-zinc-300 transition-colors">
                                <Brain className="w-3 h-3 text-primary shrink-0" />
                                <span className="italic">{w.recommendation}</span>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Footer CTA */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 relative z-10"
            >
                <button className="w-full h-11 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/20 transition-all text-xs font-semibold text-slate-900 dark:text-zinc-400 hover:text-slate-900 dark:text-white flex items-center justify-center gap-2 group/btn">
                    <Shield className="w-3.5 h-3.5 group-hover/btn:text-primary transition-colors" />
                    <span>View Full Analysis</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </motion.div>
        </div>
    )
}
