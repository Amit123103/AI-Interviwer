"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Zap, Trophy, Target, Users, TrendingUp, Mic, Code2, Clock, Sparkles } from "lucide-react"
import IntervyxaCoin from "@/components/reward-system/IntervyxaCoin"

interface LiveStatsBarProps {
    stats?: any
    user: any
}

function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (target === 0) return
        const duration = 1800
        const steps = 40
        const increment = target / steps
        let current = 0
        const timer = setInterval(() => {
            current += increment
            if (current >= target) {
                setCount(target)
                clearInterval(timer)
            } else {
                setCount(Math.floor(current))
            }
        }, duration / steps)
        return () => clearInterval(timer)
    }, [target])

    return <span>{prefix}{count.toLocaleString()}{suffix}</span>
}

const StatCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) => (
    <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-white dark:bg-slate-900/40 border border-white/5 hover:border-blue-500/30 transition-all group/stat relative overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity" />
        <div className={`w-10 h-10 rounded-xl bg-white dark:bg-slate-950 border border-white/5 flex items-center justify-center ${color} shadow-inner shrink-0 relative z-10`}>
            <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">{label}</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight group-hover/stat:text-blue-400 transition-colors uppercase">{value}</span>
        </div>
    </div>
)

export default function LiveStatsBar({ user, stats }: LiveStatsBarProps) {
    const statsData = [
        { icon: Sparkles, label: "Weekly Coins", value: (user?.weeklyCoins || 0).toLocaleString(), color: "text-amber-500" },
        { icon: () => <IntervyxaCoin size={20} animate={false} />, label: "Total Coins", value: (user?.intervyxaCoins || 0).toLocaleString(), color: "text-yellow-500" },
        { icon: Target, label: "Readiness", value: "84%", color: "text-emerald-500" },
        { icon: Users, label: "Global Rank", value: `#${user?.rank_pos || '---'}`, color: "text-indigo-500" },
    ]

    return (
        <div className="neural-card p-6 bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-white/5 shadow-2xl relative overflow-hidden">
            {/* Decorative subtle pulse */}
            <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-l from-blue-500/50 to-transparent" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsData.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>
        </div>
    )
}
