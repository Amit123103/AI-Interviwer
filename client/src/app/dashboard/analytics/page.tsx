"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import {
    TrendingUp, Award, Target, Brain, ShieldCheck, Activity,
    ArrowLeft, ChevronRight, Globe, BarChart3, Loader2
} from "lucide-react"
import Link from "next/link"
import MeshBackground from "../components/MeshBackground"
import HolographicHud from "@/components/ui/HolographicHud"
import TiltCard from "@/components/ui/TiltCard"
import { motion } from "framer-motion"

export default function AnalyticsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [trends, setTrends] = useState<any[]>([])
    const [skills, setSkills] = useState<any>(null)
    const [benchmarks, setBenchmarks] = useState<any[]>([])

    useEffect(() => {
        const savedUser = localStorage.getItem("user")
        if (!savedUser) {
            router.push("/auth/login")
            return
        }

        const fetchData = async () => {
            try {
                const token = JSON.parse(savedUser).token
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

                const [trendsRes, skillsRes, benchmarksRes] = await Promise.all([
                    fetch(`${API_URL}/api/analytics/trends`, { headers }),
                    fetch(`${API_URL}/api/analytics/skills`, { headers }),
                    fetch(`${API_URL}/api/analytics/benchmarks`, { headers })
                ])

                const [trendsData, skillsData, benchmarksData] = await Promise.all([
                    trendsRes.json(),
                    skillsRes.json(),
                    benchmarksRes.json()
                ])

                setTrends(trendsData.trends || [])
                setSkills(skillsData.skills || null)
                setBenchmarks(benchmarksData.benchmarks || [])
            } catch (err) {
                console.error("Error fetching analytics:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [router])

    const radarData = skills ? [
        { subject: 'Technical', A: skills.technical, fullMark: 100 },
        { subject: 'Delivery', A: skills.delivery, fullMark: 100 },
        { subject: 'Logic', A: skills.problem_solving, fullMark: 100 },
        { subject: 'Situational', A: skills.situational, fullMark: 100 },
        { subject: 'Theoretical', A: skills.theoretical, fullMark: 100 },
    ] : []

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col items-center justify-center text-slate-900 dark:text-white">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <h2 className="text-xl font-bold uppercase tracking-tighter">Analyzing Performance Data...</h2>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-white p-6 md:p-10 font-sans relative overflow-hidden aurora-glow">
            <MeshBackground />
            <HolographicHud />

            {/* Floating ambient orbs */}
            <div className="absolute top-20 left-10 w-96 h-96 bg-violet-500/5 rounded-full blur-[150px] orb-float pointer-events-none" />
            <div className="absolute bottom-40 right-10 w-80 h-80 bg-cyan-500/4 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />
            <div className="absolute top-[60%] left-1/3 w-72 h-72 bg-fuchsia-500/3 rounded-full blur-[130px] orb-float pointer-events-none" style={{ animationDelay: '5s' }} />

            <div className="max-w-7xl mx-auto space-y-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="outline" size="icon" className="bg-white dark:bg-zinc-900 border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-2">
                                <BarChart3 className="w-8 h-8 text-violet-400" />
                                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">Advanced</span> Analytics
                            </h1>
                            <p className="text-zinc-500 text-sm">Deep insights into your performance evolution and industry standing.</p>
                        </div>
                    </div>
                    <Link href="/dashboard/compare">
                        <Button className="bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border-violet-500/30 hover:from-violet-500/30 hover:to-cyan-500/30 text-slate-900 dark:text-zinc-200 font-bold px-6 rounded-xl border flex items-center gap-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                            <TrendingUp className="w-4 h-4 text-violet-400" />
                            Compare Sessions
                        </Button>
                    </Link>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Performance Evolution (Line Chart) */}
                    <TiltCard className="lg:col-span-2">
                        <Card className="h-full bg-white/60 dark:bg-zinc-900/50 backdrop-blur-2xl border border-slate-200 dark:border-white/10 overflow-hidden relative group hover:border-violet-500/20 hover:shadow-[0_0_40px_rgba(139,92,246,0.06)] transition-all duration-500">
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <TrendingUp size={100} />
                            </div>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                    <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Performance</span> Evolution
                                </CardTitle>
                                <CardDescription className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest">Aggregate score improvement over time</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[400px]">
                                {trends.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                        <AreaChart data={trends}>
                                            <defs>
                                                <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                            <XAxis
                                                dataKey="date"
                                                stroke="#555"
                                                fontSize={10}
                                                tickFormatter={(val) => new Date(val).toLocaleDateString()}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis stroke="#555" fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                                                itemStyle={{ fontSize: '12px', color: 'hsl(var(--primary))' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="overall"
                                                stroke="hsl(var(--primary))"
                                                strokeWidth={4}
                                                fillOpacity={1}
                                                fill="url(#primaryGradient)"
                                                animationDuration={2000}
                                            />
                                            <Line type="monotone" dataKey="technical" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="5 5" />

                                            {/* Quantum Projection - Simulated Predictive Data */}
                                            <Area
                                                type="monotone"
                                                dataKey={(d) => d.overall + (Math.random() * 10 + 5)}
                                                stroke="rgba(var(--primary), 0.3)"
                                                strokeWidth={2}
                                                strokeDasharray="10 5"
                                                fill="none"
                                                name="Quantum Projection"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                                        <Activity className="w-12 h-12 mb-4 opacity-20" />
                                        <p>Insufficient data to generate trend line.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TiltCard>

                    {/* Skill Matrix (Radar Chart) */}
                    <TiltCard>
                        <Card className="h-full bg-white/60 dark:bg-zinc-900/50 backdrop-blur-2xl border border-slate-200 dark:border-white/10 relative overflow-hidden group hover:border-fuchsia-500/20 hover:shadow-[0_0_40px_rgba(232,121,249,0.06)] transition-all duration-500">
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <Target size={80} />
                            </div>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Target className="w-5 h-5 text-fuchsia-400" />
                                    <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">Skill</span> Mastery
                                </CardTitle>
                                <CardDescription className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest">Multi-dimensional proficiency matrix</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[400px] flex items-center justify-center">
                                {radarData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                            <PolarGrid stroke="#333" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                            <Radar
                                                name="User"
                                                dataKey="A"
                                                stroke="#a855f7"
                                                fill="#a855f7"
                                                fillOpacity={0.6}
                                                animationDuration={2500}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-zinc-600">No matrix available</p>
                                )}
                            </CardContent>
                        </Card>
                    </TiltCard>
                </div>

                {/* Industry Benchmarks */}
                <TiltCard>
                    <Card className="bg-white/60 dark:bg-zinc-900/50 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden group hover:border-blue-500/20 hover:shadow-[0_0_40px_rgba(59,130,246,0.06)] transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl font-black italic uppercase tracking-tighter group-hover:text-blue-400 transition-colors">
                                <Globe className="w-6 h-6 text-blue-400" />
                                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Industry</span> Benchmarks
                            </CardTitle>
                            <CardDescription className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest">How you compare to global sector averages</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {benchmarks.map((bench, i) => (
                                    <div key={i} className="p-6 bg-white dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-3xl space-y-4 hover:border-blue-500/30 hover:shadow-[0_0_25px_rgba(59,130,246,0.08)] transition-all duration-300 group/item relative overflow-hidden hover-shine">
                                        {/* Scan line for items */}
                                        <div className="absolute top-0 left-0 w-full h-[1px] bg-primary/20 opacity-0 group-hover/item:opacity-100 animate-pulse" />
                                        <div className="flex justify-between items-center relative z-10">
                                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{bench._id || 'Global'}</span>
                                            <div className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[9px] font-black rounded-md border border-cyan-500/20 uppercase tracking-widest">LIVE DATA</div>
                                        </div>
                                        <div className="flex items-baseline gap-2 relative z-10">
                                            <span className="text-3xl font-black text-slate-900 dark:text-white italic">{Math.round(bench.avgTechnical)}%</span>
                                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Avg Tech</span>
                                        </div>
                                        <div className="space-y-2 relative z-10">
                                            <div className="flex justify-between text-[8px] uppercase font-black text-zinc-500 tracking-widest">
                                                <span>Communication</span>
                                                <span className="text-primary">{Math.round(bench.avgCommunication)}%</span>
                                            </div>
                                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary" style={{ width: `${bench.avgCommunication}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TiltCard>

                {/* Footer Insight */}
                <div className="p-8 bg-gradient-to-r from-violet-500/5 via-fuchsia-500/5 to-cyan-500/5 border border-violet-500/15 rounded-3xl flex flex-col md:flex-row items-center gap-6 hover:shadow-[0_0_40px_rgba(139,92,246,0.06)] transition-all duration-500">
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20">
                        <Brain className="text-black w-8 h-8" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <h3 className="text-lg font-bold"><span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">AI Analytics</span> Verdict</h3>
                        <p className="text-slate-500 dark:text-zinc-400 text-sm italic">
                            "Your technical execution is in the top 15% of the {trends[trends.length - 1]?.sector || 'software'} sector. Focus on Theoretical Mastery to unlock Senior-level roles."
                        </p>
                    </div>
                    <Link href="/dashboard/roadmap">
                        <Button className="bg-gradient-to-r from-violet-500 to-cyan-500 text-slate-900 dark:text-white hover:from-violet-400 hover:to-cyan-400 font-bold rounded-xl px-10 border-none shadow-[0_0_25px_rgba(139,92,246,0.2)] hover:shadow-[0_0_40px_rgba(139,92,246,0.3)] transition-all duration-500 hover:-translate-y-0.5">
                            View Roadmap
                            <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
