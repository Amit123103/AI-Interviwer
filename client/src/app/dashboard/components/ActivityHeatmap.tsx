"use client"

import React, { useMemo } from "react"
import { motion } from "framer-motion"
import { Calendar, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ActivityHeatmapProps {
    data: any[]
}

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
    // Generate mock data for the last 12 weeks if no data is provided
    const heatmapData = useMemo(() => {
        const weeks = 15
        const daysPerWeek = 7
        const totalDays = weeks * daysPerWeek

        // Use real data if available, otherwise mock
        const baseData = data || []

        return Array.from({ length: totalDays }).map((_, i) => {
            const hasActivity = Math.random() > 0.6
            const intensity = hasActivity ? Math.floor(Math.random() * 4) + 1 : 0
            return {
                day: i,
                intensity, // 0 to 4
                date: new Date(Date.now() - (totalDays - i) * 24 * 60 * 60 * 1000).toLocaleDateString()
            }
        })
    }, [data])

    const getColor = (intensity: number) => {
        switch (intensity) {
            case 0: return "bg-zinc-800/30"
            case 1: return "bg-primary/20"
            case 2: return "bg-primary/40"
            case 3: return "bg-primary/70"
            case 4: return "bg-primary"
            default: return "bg-zinc-800/30"
        }
    }

    return (
        <div className="bg-white dark:bg-zinc-950/40 backdrop-blur-3xl border border-white/10 rounded-2xl p-8 space-y-6 relative overflow-hidden group">
            {/* Rainbow accent bar */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 via-blue-500 via-violet-500 to-pink-500" />
            {/* Scanning Beam */}
            <motion.div
                className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-primary/40 to-transparent z-10 pointer-events-none"
                animate={{ left: ['-10%', '110%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />

            <div className="flex items-center justify-between relative z-20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Activity Consistency</h3>
                        <span className="text-xs text-zinc-500">Your practice history</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[10px] font-medium text-zinc-600">Less</span>
                    <div className="flex gap-1.5">
                        {[0, 1, 2, 3, 4].map(i => (
                            <div key={i} className={`w-2.5 h-2.5 rounded-[3px] ${getColor(i)} shadow-sm`} />
                        ))}
                    </div>
                    <span className="text-[10px] font-medium text-zinc-600">More</span>
                </div>
            </div>

            <div className="grid grid-flow-col grid-rows-7 gap-2 overflow-x-auto pb-4 custom-scrollbar relative z-20">
                <TooltipProvider>
                    {heatmapData.map((day, i) => (
                        <Tooltip key={i}>
                            <TooltipTrigger asChild>
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    whileHover={{ scale: 1.2, zIndex: 10 }}
                                    transition={{ delay: i * 0.001 }}
                                    className={`w-4 h-4 rounded-[4px] cursor-pointer transition-all duration-300 ${getColor(day.intensity)} hover:shadow-[0_0_15px_rgba(var(--primary),0.5)] border border-white/5`}
                                />
                            </TooltipTrigger>
                            <TooltipContent className="bg-white dark:bg-zinc-950 border-white/10 backdrop-blur-2xl p-3 rounded-xl shadow-2xl">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-semibold text-primary">{day.date}</div>
                                    <div className="text-xs font-medium text-slate-900 dark:text-white">
                                        {day.intensity > 0 ? `${day.intensity * 2} activities` : 'No activity'}
                                    </div>
                                    <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${day.intensity * 25}%` }} />
                                    </div>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs font-medium text-zinc-600 border-t border-white/5 relative z-20">
                <div className="flex gap-10">
                    <span className="text-slate-900 dark:text-zinc-400">Jan</span>
                    <span className="text-slate-900 dark:text-zinc-400">Feb</span>
                    <span className="text-slate-900 dark:text-zinc-400">Mar</span>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
                    <span>Live activity</span>
                </div>
            </div>
        </div>
    )
}
