"use client"

import React from "react"
import { motion } from "framer-motion"
import { Trophy, TrendingUp } from "lucide-react"

const mockLeaderboard = [
    { rank: 1, name: "Priya Sharma", xp: 12450, sessions: 84, trend: "up" },
    { rank: 2, name: "Rahul Verma", xp: 11200, sessions: 76, trend: "up" },
    { rank: 3, name: "Ananya Singh", xp: 10890, sessions: 72, trend: "same" },
    { rank: 4, name: "Kiran Patel", xp: 9800, sessions: 68, trend: "up" },
    { rank: 5, name: "Deepak Kumar", xp: 9450, sessions: 65, trend: "down" },
    { rank: 6, name: "Neha Gupta", xp: 8900, sessions: 61, trend: "up" },
    { rank: 7, name: "Arjun Reddy", xp: 8650, sessions: 58, trend: "same" },
    { rank: 8, name: "Simran Kaur", xp: 8200, sessions: 55, trend: "up" },
    { rank: 9, name: "Vikram Joshi", xp: 7800, sessions: 52, trend: "down" },
    { rank: 10, name: "Tara Nair", xp: 7500, sessions: 49, trend: "up" },
]

const rankColors = ["text-amber-400", "text-slate-900 dark:text-zinc-300", "text-amber-700"]

export default function LeaderboardPanel() {
    return (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-white/[0.06]">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Leaderboard</h3>
                    <p className="text-[10px] text-zinc-500">Top students this week</p>
                </div>
            </div>
            <div className="space-y-2">
                {mockLeaderboard.map((student, i) => (
                    <motion.div
                        key={student.rank}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${i < 3 ? "bg-white/[0.04] border border-white/[0.06]" : "hover:bg-white/[0.02]"} transition-all`}
                    >
                        <span className={`text-sm font-black w-6 text-center ${rankColors[i] || "text-zinc-500"}`}>
                            {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${student.rank}`}
                        </span>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center text-[10px] font-bold text-slate-900 dark:text-white shrink-0">
                            {student.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{student.name}</p>
                            <p className="text-[10px] text-zinc-500">{student.sessions} sessions</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-violet-400">{student.xp.toLocaleString()}</p>
                            <p className="text-[9px] text-zinc-600">XP</p>
                        </div>
                        {student.trend === "up" && <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />}
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
