"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, Video, ChevronRight, MoreHorizontal, Bell, BellOff, X, Settings, Info } from "lucide-react"
import { useRouter } from "next/navigation"

interface Session {
    id: number;
    title: string;
    role: string;
    time: string;
    countdown: number; // mins from now
    type: string;
    color: string;
}

export default function UpcomingSchedule() {
    const router = useRouter()
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)
    const [openMenuId, setOpenMenuId] = useState<number | null>(null)
    const [currentTime, setCurrentTime] = useState(new Date())

    // Simulated sessions with dynamic times based on current moment
    const [sessions, setSessions] = useState<Session[]>([
        {
            id: 1,
            title: "Mock Technical Interview",
            role: "Senior Frontend Engineer",
            time: "",
            countdown: 45,
            type: "AI Mentor",
            color: "indigo"
        },
        {
            id: 2,
            title: "System Design Prep",
            role: "Software Architect",
            time: "02:30 PM",
            countdown: 180,
            type: "Peer Review",
            color: "purple"
        },
        {
            id: 3,
            title: "Behavioral Drill",
            role: "Leadership Round",
            time: "Tomorrow, 10:00 AM",
            countdown: 1440,
            type: "AI Training",
            color: "blue"
        }
    ])

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000)

        // Update the first session's time to be 45 mins from 'now'
        const firstSessionTime = new Date(currentTime.getTime() + 45 * 60000)
        setSessions(prev => [
            {
                ...prev[0],
                time: firstSessionTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            },
            ...prev.slice(1)
        ])

        return () => clearInterval(timer)
    }, [])

    const handleAction = (sessionId: number) => {
        if (sessionId === 1) {
            router.push("/dashboard/interview/setup")
        } else {
            router.push("/dashboard/history")
        }
    }

    return (
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-white/5 p-8 rounded-2xl relative overflow-hidden group h-full flex flex-col shadow-2xl">
            {/* Blue accent bar */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-blue-500/50 to-transparent" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -z-10" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                        <Calendar className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Upcoming Sessions</h3>
                        <p className="text-xs text-slate-500">Stay prepared for what's next</p>
                    </div>
                </div>
                <button
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-300 ${notificationsEnabled
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                        : 'bg-white/5 border-white/5 text-zinc-500'
                        }`}
                >
                    {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                </button>
            </div>

            <div className="flex-1 space-y-6 relative z-10">
                <div className="absolute left-[19px] top-2 bottom-8 w-[2px] bg-gradient-to-b from-blue-500/30 to-transparent" />

                {sessions.map((session, idx) => (
                    <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="relative pl-12 group/item"
                    >
                        {/* Timeline Core */}
                        <div className={`absolute left-0 top-1 w-10 h-10 rounded-xl bg-white dark:bg-slate-950 border border-white/10 flex items-center justify-center z-20 transition-all duration-300 ${idx === 0 ? 'border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'group-hover/item:border-white/20'
                            }`}>
                            {idx === 0 ? <Video className="w-4 h-4 text-blue-400 animate-pulse" /> : <Clock className="w-4 h-4 text-slate-500 group-hover/item:text-slate-900 dark:text-slate-300" />}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-semibold text-blue-400">{session.time}</span>
                                {idx === 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-medium text-blue-400 animate-pulse">
                                        Starting Soon
                                    </span>
                                )}
                            </div>
                            <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl group-hover/item:bg-white/[0.06] group-hover/item:border-white/10 transition-all relative overflow-visible">
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{session.title}</h4>
                                <p className="text-[10px] text-slate-500 font-medium mb-3">{session.role} • {session.type}</p>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleAction(session.id)}
                                        className={`flex-1 h-8 rounded-lg ${idx === 0 ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20' : 'bg-white/5 hover:bg-white/10'} text-slate-900 dark:text-white font-semibold text-xs transition-all active:scale-95`}
                                    >
                                        {idx === 0 ? 'Enter Room' : 'Details'}
                                    </button>
                                    <div className="relative">
                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === session.id ? null : session.id)}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 transition-all ${openMenuId === session.id ? 'bg-white/15 text-slate-900 dark:text-white' : 'bg-white/5 hover:bg-white/10'}`}
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>

                                        {/* Dropdown Menu */}
                                        <AnimatePresence>
                                            {openMenuId === session.id && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9, y: 10, x: -80 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0, x: -80 }}
                                                        exit={{ opacity: 0, scale: 0.9, y: 10, x: -80 }}
                                                        className="absolute bottom-full mb-2 z-50 w-36 bg-white dark:bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-1 shadow-2xl"
                                                    >
                                                        {[
                                                            { icon: <Clock className="w-3 h-3" />, label: "Reschedule" },
                                                            { icon: <Info className="w-3 h-3" />, label: "Mentor Info" },
                                                            { icon: <X className="w-3 h-3 text-rose-500" />, label: "Cancel", color: "text-rose-500" },
                                                        ].map((option) => (
                                                            <button
                                                                key={option.label}
                                                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                                                                onClick={() => setOpenMenuId(null)}
                                                            >
                                                                <span className={option.color || "text-slate-900 dark:text-zinc-400"}>{option.icon}</span>
                                                                <span className={`text-[10px] font-bold ${option.color || "text-slate-900 dark:text-zinc-300"}`}>{option.label}</span>
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-8">
                <button
                    onClick={() => router.push("/dashboard/interview/setup")}
                    className="w-full py-3 rounded-2xl border border-dashed border-white/10 text-zinc-500 hover:text-slate-900 dark:text-white hover:border-white/30 hover:bg-white/5 transition-all flex items-center justify-center gap-2 group/add active:scale-[0.98]"
                >
                    <span className="text-xs font-semibold">Schedule a session</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    )
}
