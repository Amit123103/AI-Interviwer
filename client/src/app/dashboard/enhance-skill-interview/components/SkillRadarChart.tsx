"use client"

import React from "react"
import dynamic from "next/dynamic"

const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false })
const RadarChart = dynamic(() => import("recharts").then(m => m.RadarChart), { ssr: false })
const PolarGrid = dynamic(() => import("recharts").then(m => m.PolarGrid), { ssr: false })
const PolarAngleAxis = dynamic(() => import("recharts").then(m => m.PolarAngleAxis), { ssr: false })
const PolarRadiusAxis = dynamic(() => import("recharts").then(m => m.PolarRadiusAxis), { ssr: false })
const Radar = dynamic(() => import("recharts").then(m => m.Radar), { ssr: false })

interface SkillRadarChartProps {
    data?: { skill: string; value: number }[]
}

const defaultData = [
    { skill: "Confidence", value: 72 },
    { skill: "Communication", value: 85 },
    { skill: "Persuasion", value: 58 },
    { skill: "Defense", value: 64 },
    { skill: "Professional", value: 78 },
    { skill: "Roleplay", value: 45 },
]

export default function SkillRadarChart({ data = defaultData }: SkillRadarChartProps) {
    return (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-white/[0.06]">
            <h3 className="text-lg font-bold mb-4">
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Skill</span> Radar
            </h3>
            <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                        <PolarAngleAxis dataKey="skill" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Skills" dataKey="value" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.25} strokeWidth={2} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
