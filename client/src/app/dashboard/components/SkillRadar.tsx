"use client"

import React from "react"
import { motion } from "framer-motion"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { BrainCircuit } from "lucide-react"

const data = [
    { subject: 'Technical', A: 85, fullMark: 100 },
    { subject: 'Communication', A: 70, fullMark: 100 },
    { subject: 'Problem Solving', A: 90, fullMark: 100 },
    { subject: 'Confidence', A: 65, fullMark: 100 },
    { subject: 'Speed', A: 80, fullMark: 100 },
    { subject: 'Accuracy', A: 75, fullMark: 100 },
]

export default function SkillRadar() {
    return (
        <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl relative overflow-hidden group h-full flex flex-col">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                        <BrainCircuit className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Skill Radar</h3>
                        <p className="text-xs text-zinc-500">Your strengths at a glance</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-[320px] w-full relative">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                        <defs>
                            <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.6} />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
                            </linearGradient>
                        </defs>
                        <PolarGrid stroke="#333" strokeOpacity={0.5} />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }}
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(9, 9, 11, 0.95)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                backdropFilter: 'blur(20px)',
                                fontSize: '12px',
                                fontWeight: '500',
                                color: '#fff'
                            }}
                        />
                        <Radar
                            name="Skill Level"
                            dataKey="A"
                            stroke="#a855f7"
                            strokeWidth={3}
                            fill="url(#radarGradient)"
                            fillOpacity={0.6}
                            animationBegin={500}
                            animationDuration={1500}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-[11px] text-zinc-500 mb-1 font-medium">Strongest skill</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">Problem Solving</div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-[11px] text-zinc-500 mb-1 font-medium">Needs attention</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">Confidence</div>
                </div>
            </div>
        </div>
    )
}
