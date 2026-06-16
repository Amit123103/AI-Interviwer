"use client"

import React from "react"
import { motion } from "framer-motion"
import { Flame, Star, Trophy, Calendar } from "lucide-react"

interface GamificationBarProps {
    xp?: number
    streak?: number
    badges?: number
    weeklyChallenge?: string
}

export default function GamificationBar({ xp = 2450, streak = 7, badges = 12, weeklyChallenge = "Complete 3 Advanced interviews" }: GamificationBarProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* XP */}
            <motion.div whileHover={{ y: -2 }} className="p-4 rounded-2xl bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-white/[0.06] group hover:border-violet-500/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                        <Star className="w-4 h-4 text-violet-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">XP Points</span>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{xp.toLocaleString()}</p>
                <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${Math.min((xp % 1000) / 10, 100)}%` }} transition={{ duration: 1.5, ease: "circOut" }} />
                </div>
                <p className="text-[9px] text-zinc-600 mt-1">{1000 - (xp % 1000)} XP to next level</p>
            </motion.div>

            {/* Streak */}
            <motion.div whileHover={{ y: -2 }} className="p-4 rounded-2xl bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-white/[0.06] group hover:border-orange-500/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
                        <Flame className="w-4 h-4 text-orange-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Daily Streak</span>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{streak} <span className="text-base text-orange-400">days</span></p>
                <p className="text-[9px] text-zinc-600 mt-1">🔥 Keep it going!</p>
            </motion.div>

            {/* Badges */}
            <motion.div whileHover={{ y: -2 }} className="p-4 rounded-2xl bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-white/[0.06] group hover:border-amber-500/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Badges</span>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{badges}</p>
                <p className="text-[9px] text-zinc-600 mt-1">3 more to unlock</p>
            </motion.div>

            {/* Weekly Challenge */}
            <motion.div whileHover={{ y: -2 }} className="p-4 rounded-2xl bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-white/[0.06] group hover:border-cyan-500/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Weekly Challenge</span>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{weeklyChallenge}</p>
                <p className="text-[9px] text-cyan-400 mt-1">+500 bonus XP</p>
            </motion.div>
        </div>
    )
}
