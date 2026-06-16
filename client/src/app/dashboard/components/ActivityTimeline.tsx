"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Zap,
    Play,
    CreditCard,
    History,
    Clock,
    Trophy,
    ArrowUpRight,
    Rocket
} from 'lucide-react'

interface ActivityItem {
    id: string
    type: string
    action: string
    details?: string
    timestamp: string
    metadata?: any
}

export default function ActivityTimeline({ activities = [] }: { userId?: string, activities?: ActivityItem[] }) {
    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 p-8 md:p-10 h-full rounded-3xl shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-10">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
                        <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    Recent Activity
                </h3>
                <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-2 px-3 py-1 bg-zinc-50 dark:bg-white/5 rounded-full border border-zinc-200 dark:border-white/5">
                    <Clock className="w-3 h-3 text-emerald-500" /> Live Updates
                </span>
            </div>

            <div className="space-y-6">
                {!activities || activities.length === 0 ? (
                    <div className="py-14 text-center flex flex-col items-center gap-5 group/empty">
                        <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-zinc-900 flex items-center justify-center border border-indigo-100 dark:border-white/10 group-hover/empty:border-indigo-500/30 transition-all duration-700 shadow-sm">
                            <Rocket className="w-10 h-10 text-indigo-500 animate-bounce" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Your journey starts here 🚀</p>
                            <p className="text-xs text-zinc-500 font-medium max-w-[240px] mx-auto leading-relaxed">
                                Complete a quiz or interview to unlock insights and track your progress.
                            </p>
                        </div>
                    </div>
                ) : (
                    activities.map((act, i) => (
                        <div
                            key={act.id}
                            className="flex gap-5 group"
                        >
                            <div className="flex flex-col items-center">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-white/5 transition-all group-hover:border-zinc-300 dark:group-hover:border-white/10 ${act.type === 'INTERVIEW_COMPLETE' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                                    act.type === 'CODING_COMPLETE' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                        act.type === 'LOGIN' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                                            'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                    }`}>
                                    {act.type === 'INTERVIEW_COMPLETE' ? <Play className="w-4 h-4" /> :
                                        act.type === 'CODING_COMPLETE' ? <Zap className="w-4 h-4" /> :
                                            act.type === 'LOGIN' ? <ArrowUpRight className="w-4 h-4" /> :
                                                <Trophy className="w-4 h-4" />}
                                </div>
                                {i !== activities.length - 1 && <div className="w-[1px] h-full bg-zinc-100 dark:bg-white/5 mt-3" />}
                            </div>
                            <div className="flex-1 pb-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{act.action}</h4>
                                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">{act.type.replace('_', ' ')}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 text-right">
                                        <span className="text-[10px] font-bold text-slate-900 dark:text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter">
                                            {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </span>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400`}>
                                            Completed
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <button className="w-full py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-indigo-500/40 hover:bg-white dark:hover:bg-indigo-500/5 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group active:scale-[0.98]">
                View Learning Journal <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
        </div>
    )
}
