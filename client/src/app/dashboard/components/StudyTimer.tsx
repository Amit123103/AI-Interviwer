"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Timer, Play, Pause, RotateCcw, Coffee, Zap, Brain } from "lucide-react"

export default function StudyTimer() {
    const [seconds, setSeconds] = useState(25 * 60)
    const [isActive, setIsActive] = useState(false)
    const [sessions, setSessions] = useState(0)
    const [mode, setMode] = useState<'work' | 'break'>('work')

    const initialSeconds = mode === 'work' ? 25 * 60 : 5 * 60

    useEffect(() => {
        let interval: any = null
        if (isActive && seconds > 0) {
            interval = setInterval(() => {
                setSeconds(s => s - 1)
            }, 1000)
        } else if (seconds === 0) {
            setIsActive(false)
            if (mode === 'work') {
                setSessions(s => s + 1)
                // In a real app, play a sound or show notification
            }
        }
        return () => clearInterval(interval)
    }, [isActive, seconds, mode])

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60)
        const secs = s % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const toggle = () => setIsActive(!isActive)
    const reset = () => {
        setIsActive(false)
        setSeconds(initialSeconds)
    }

    const setDuration = (m: number) => {
        setIsActive(false)
        setSeconds(m * 60)
    }

    const percent = (seconds / initialSeconds) * 100

    return (
        <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl relative overflow-hidden group flex flex-col h-full">
            {/* Rainbow accent bar */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 via-pink-500 to-rose-500" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10 group-hover:bg-indigo-500/20 transition-all duration-700" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <Timer className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Focus Timer</h3>
                        <p className="text-xs text-zinc-500">Stay in the zone</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] font-medium text-slate-900 dark:text-zinc-300">{sessions} sessions</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                {/* Timer Display */}
                <div className="relative w-40 h-40">
                    <svg className="w-full h-full -rotate-90">
                        <circle
                            cx="80" cy="80" r="74"
                            className="stroke-white/5 fill-none"
                            strokeWidth="4"
                        />
                        <motion.circle
                            cx="80" cy="80" r="74"
                            className="fill-none stroke-indigo-500"
                            strokeWidth="4"
                            strokeLinecap="round"
                            initial={{ strokeDasharray: "465", strokeDashoffset: "0" }}
                            animate={{ strokeDashoffset: 465 - (465 * percent) / 100 }}
                            transition={{ duration: 0.5 }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                            {formatTime(seconds)}
                        </div>
                        <div className="text-[10px] font-medium text-zinc-500 mt-1">
                            {mode === 'work' ? 'Deep Work' : 'Refuel'}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4 relative z-10">
                    <button
                        onClick={reset}
                        className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-900 dark:text-zinc-400 hover:text-slate-900 dark:text-white hover:bg-white/10 transition-all"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={toggle}
                        className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-slate-900 dark:text-white shadow-2xl transition-all hover:scale-110 active:scale-95 ${isActive ? 'bg-zinc-800 shadow-zinc-900/40' : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/40'}`}
                    >
                        {isActive ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
                    </button>
                    <button
                        onClick={() => {
                            setMode(mode === 'work' ? 'break' : 'work')
                            setSeconds(mode === 'work' ? 5 * 60 : 25 * 60)
                            setIsActive(false)
                        }}
                        className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-900 dark:text-zinc-400 hover:text-slate-900 dark:text-white hover:bg-white/10 transition-all"
                    >
                        {mode === 'work' ? <Coffee className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
                    </button>
                </div>

                {/* Quick Presets */}
                <div className="flex gap-2 w-full pt-4 relative z-10">
                    {[15, 25, 45].map(m => (
                        <button
                            key={m}
                            onClick={() => setDuration(m)}
                            className="flex-1 py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-medium text-zinc-500 hover:text-slate-900 dark:text-white hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all"
                        >
                            {m}m
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
