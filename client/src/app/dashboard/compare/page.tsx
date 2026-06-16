"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Calendar, Target, Award, Brain, Loader2, GitCompare } from "lucide-react"
import axios from "axios"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import MeshBackground from "../components/MeshBackground"
import HolographicHud from "@/components/ui/HolographicHud"

function ComparisonContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(true)
    const [comparisonData, setComparisonData] = useState<any>(null)
    const [reports, setReports] = useState<any[]>([])

    const id1 = searchParams.get('id1')
    const id2 = searchParams.get('id2')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userStr = localStorage.getItem("user")
                if (!userStr) {
                    router.push("/auth/login")
                    return
                }
                const { token } = JSON.parse(userStr)
                const config = { headers: { Authorization: `Bearer ${token}` } }

                // 1. Fetch available reports for selection if IDs are missing
                const reportsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/reports`, config)
                setReports(reportsRes.data)

                // 2. Fetch comparison if IDs are present
                if (id1 && id2) {
                    const compareRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/analytics/compare?reportId1=${id1}&reportId2=${id2}`, config)
                    setComparisonData(compareRes.data)
                }
            } catch (err) {
                console.error("Failed to fetch comparison data:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id1, id2])

    const getRadarData = () => {
        if (!comparisonData) return []
        const { report1, report2 } = comparisonData
        const keys = ['technical', 'delivery', 'problem_solving', 'situational', 'theoretical']
        return keys.map(key => ({
            subject: key.replace('_', ' ').toUpperCase(),
            A: report1.skillMatrix[key] || 0,
            B: report2.skillMatrix[key] || 0,
            fullMark: 100
        }))
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-slate-500 dark:text-zinc-400 font-medium animate-pulse">Running delta analysis...</p>
            </div>
        )
    }

    if (!id1 || !id2) {
        return (
            <div className="min-h-screen bg-transparent text-slate-900 dark:text-white p-4 sm:p-6 md:p-10 relative overflow-hidden aurora-glow">
                <MeshBackground />
                <HolographicHud />
                {/* Floating ambient orbs */}
                <div className="absolute top-20 left-10 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
                <div className="absolute bottom-32 right-16 w-72 h-72 bg-cyan-500/4 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />
                <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 relative z-10">
                    <DashboardHeader
                        title="Compare Sessions"
                        subtitle="Detailed delta analysis between two interview sessions to visualize your trajectory."
                        icon={<GitCompare className="w-8 h-8 text-primary" />}
                        breadcrumbs={[{ label: "Comparison" }]}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {reports.map((r) => (
                            <Card
                                key={r._id}
                                className={`bg-white dark:bg-zinc-900/40 border-white/[0.06] backdrop-blur-2xl hover:border-violet-500/20 hover:shadow-[0_0_30px_rgba(139,92,246,0.06)] transition-all duration-500 cursor-pointer ${id1 === r._id ? 'bg-gradient-to-b from-violet-500/5 to-transparent border-violet-500/20' : id2 === r._id ? 'bg-gradient-to-b from-cyan-500/5 to-transparent border-cyan-500/20' : ''}`}
                                onClick={() => {
                                    if (!id1) router.push(`/dashboard/compare?id1=${r._id}`)
                                    else if (r._id !== id1 && r._id !== id2) router.push(`/dashboard/compare?id1=${id1}&id2=${r._id}`)
                                }}
                            >
                                <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                                            {r.sector[0]}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm sm:text-base truncate">{r.sector} Session</p>
                                            <p className="text-xs text-zinc-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-base sm:text-lg font-black">{r.scores.technical + r.scores.communication + r.scores.focus}/30</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const { delta, report1, report2 } = comparisonData

    const DeltaCard = ({ title, value, unit = "" }: any) => {
        const isPositive = value > 0
        const isNeutral = value === 0
        return (
            <div className="bg-white dark:bg-zinc-900/40 border border-white/[0.06] backdrop-blur-2xl p-4 rounded-xl space-y-1 hover:border-violet-500/15 transition-all">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{title}</p>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black">{isPositive ? `+${value}` : value}{unit}</span>
                    {isPositive ? <TrendingUp className="text-emerald-400 w-5 h-5" /> : isNeutral ? <Minus className="text-zinc-500 w-5 h-5" /> : <TrendingDown className="text-red-400 w-5 h-5" />}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-white p-4 sm:p-6 md:p-10 relative overflow-hidden aurora-glow">
            <MeshBackground />
            <HolographicHud />
            {/* Floating ambient orbs */}
            <div className="absolute top-20 left-10 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
            <div className="absolute bottom-32 right-16 w-72 h-72 bg-cyan-500/4 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />
            <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 relative z-10">
                <DashboardHeader
                    title="Interview Comparison"
                    subtitle={`Growth analysis between ${new Date(report1.createdAt).toLocaleDateString()} and ${new Date(report2.createdAt).toLocaleDateString()}`}
                    icon={<GitCompare className="w-8 h-8 text-violet-400" />}
                    breadcrumbs={[
                        { label: "Comparison", href: "/dashboard/compare" },
                        { label: "Head-to-Head" }
                    ]}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Growth Stats */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Award className="w-5 h-5 text-violet-400" /> <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Growth Delta</span>
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            <DeltaCard title="Technical Logic" value={delta.technical} />
                            <DeltaCard title="Communication" value={delta.communication} />
                            <DeltaCard title="Trust & Integrity" value={delta.integrity} />
                            <DeltaCard title="Professionalism" value={delta.professionalism} />
                        </div>
                    </div>

                    {/* Radar Chart */}
                    <Card className="lg:col-span-2 bg-white dark:bg-zinc-900/40 border-white/[0.06] backdrop-blur-2xl p-6">
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Brain className="w-5 h-5 text-cyan-400" /> <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Skill Mastery Shift</span>
                            </CardTitle>
                        </CardHeader>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getRadarData()}>
                                    <PolarGrid stroke="#333" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Initial Session"
                                        dataKey="A"
                                        stroke="rgba(255,255,255,0.2)"
                                        fill="rgba(255,255,255,0.1)"
                                        fillOpacity={0.6}
                                    />
                                    <Radar
                                        name="Latest Session"
                                        dataKey="B"
                                        stroke="#a78bfa"
                                        fill="#a78bfa"
                                        fillOpacity={0.3}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                                <div className="w-3 h-3 bg-white/10 border border-slate-300 dark:border-white/20 rounded-full" /> Initial
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-violet-400">
                                <div className="w-3 h-3 bg-violet-500/30 border border-violet-500 rounded-full" /> Latest
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Session Summaries */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="bg-white dark:bg-zinc-900/40 border-white/[0.06] backdrop-blur-2xl hover:border-violet-500/15 transition-all duration-500">
                        <CardHeader>
                            <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Baseline</p>
                            <CardTitle>Session 1</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                <span className="text-slate-500 dark:text-zinc-400">Total Score</span>
                                <span className="text-2xl font-black">{report1.scores.technical + report1.scores.communication + report1.scores.focus}/30</span>
                            </div>
                            <Button className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-slate-900 dark:text-white border-0" onClick={() => router.push(`/dashboard/report/${report1.id}`)}>View Report</Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-zinc-900/40 border-white/[0.06] backdrop-blur-2xl hover:border-violet-500/15 transition-all duration-500">
                        <CardHeader>
                            <p className="text-xs font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent uppercase tracking-widest">Progress</p>
                            <CardTitle>Session 2</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-violet-500/5 border border-violet-500/20 rounded-xl">
                                <span className="text-slate-500 dark:text-zinc-400">Total Score</span>
                                <span className="text-2xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{report2.scores.technical + report2.scores.communication + report2.scores.focus}/30</span>
                            </div>
                            <Button className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-slate-900 dark:text-white border-0" onClick={() => router.push(`/dashboard/report/${report2.id}`)}>View Report</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default function ComparisonPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white"><Loader2 className="animate-spin" /></div>}>
            <ComparisonContent />
        </Suspense>
    )
}
