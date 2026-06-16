"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Target, Trophy, CheckCircle2, Code2, Zap, TrendingUp, Sparkles } from "lucide-react"
import IntervyxaCoin from "@/components/reward-system/IntervyxaCoin"

interface Goal {
    id: string;
    label: string;
    current: number;
    target: number;
    done: boolean;
    type: string;
    reward: number;
}

const CircularProgress = ({ progress, icon, color }: { progress: number; icon: React.ReactNode; color: string }) => {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
                <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    className="text-slate-900 dark:text-white/5"
                />
                <motion.circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={color === "emerald" ? "text-emerald-500" : "text-blue-500"}
                    strokeLinecap="round"
                />
            </svg>
            <div className={`absolute inset-0 flex items-center justify-center ${color === "emerald" ? "text-emerald-500" : "text-blue-400"}`}>
                {icon}
            </div>
        </div>
    );
};

export default function DailyGoals() {
    const goals: Goal[] = [
        { id: "1", label: "Interview Simulation", current: 2, target: 3, done: false, type: "practice", reward: 100 },
        { id: "2", label: "Question Practice", current: 4, target: 5, done: false, type: "questions", reward: 50 },
        { id: "3", label: "Skill Milestone", current: 1, target: 1, done: true, type: "milestone", reward: 50 }
    ]

    return (
        <div className="neural-card p-8 h-full bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[80px]" />

            <div className="flex flex-col h-full justify-between gap-8 relative z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-zinc-400 uppercase tracking-widest mb-1 shadow-sm">Daily Missions</h3>
                        <p className="text-xs font-semibold text-zinc-500">Complete these to earn bonus Intervyxa Coins</p>
                    </div>
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner group-hover:scale-110 transition-transform">
                        <Trophy className="w-6 h-6" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {goals.map((goal) => (
                        <div key={goal.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group/goal">
                            <div className="flex flex-col items-center text-center gap-3">
                                <CircularProgress
                                    progress={(goal.current / goal.target) * 100}
                                    icon={goal.type === 'practice' ? <Target className="w-4 h-4" /> : goal.type === 'questions' ? <Code2 className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                                    color={goal.done ? "emerald" : "blue"}
                                />
                                <div className="space-y-1">
                                    <span className={`text-[10px] font-black uppercase tracking-widest block transition-colors ${goal.done ? 'text-emerald-500' : 'text-slate-900 dark:text-zinc-400 group-hover/goal:text-blue-400'}`}>
                                        {goal.label}
                                    </span>
                                    <div className="flex items-center justify-center gap-1">
                                        <IntervyxaCoin size={12} animate={false} />
                                        <span className="text-[10px] font-black tracking-widest text-yellow-500">+{goal.reward}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 text-black text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-yellow-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                    Claim Bonus 200 Intervyxa Coins <TrendingUp className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
