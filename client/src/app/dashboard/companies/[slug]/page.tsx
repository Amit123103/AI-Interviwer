"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Play, CheckCircle2, Clock, Users, TrendingUp,
    AlertCircle, Lightbulb, Target, Zap, Building2,
    Briefcase, ShieldCheck, HelpCircle, XCircle
} from "lucide-react"
import DashboardHeader from "@/components/dashboard/DashboardHeader"

const DIFFICULTY_COLORS = {
    easy: "bg-green-500/10 text-green-500 border-green-500/20",
    medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    hard: "bg-orange-500/10 text-orange-500 border-orange-500/20"
}

export default function CompanyDetailPage() {
    const router = useRouter()
    const { slug } = useParams()
    const [company, setCompany] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (slug) {
            fetchCompanyDetails()
        }
    }, [slug])

    const fetchCompanyDetails = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/companies/${slug}`, {
                headers: {
                    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user') || '{}').token}`
                }
            })
            const data = await response.json()
            setCompany(data)
        } catch (error) {
            console.error("Error fetching company details:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-4 sm:p-6 md:p-10 flex items-center justify-center">
                <Zap className="w-12 h-12 text-primary animate-pulse" />
            </div>
        )
    }

    if (!company) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-4 sm:p-6 md:p-10 flex flex-col items-center justify-center space-y-4">
                <AlertCircle className="w-16 h-16 text-zinc-700" />
                <h1 className="text-2xl font-bold">Company Not Found</h1>
                <Button onClick={() => router.push("/dashboard/companies")}>
                    Back to Companies
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-4 sm:p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <DashboardHeader
                    title={company.name}
                    subtitle={company.category}
                    icon={<div className="text-4xl">{company.logo || "🏢"}</div>}
                    breadcrumbs={[
                        { label: "Companies", href: "/dashboard/companies" },
                        { label: company.name }
                    ]}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Overview & Hiring Process */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Company Card */}
                        <Card className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10 overflow-hidden">
                            <div className="h-2 bg-primary w-full" />
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <Building2 className="w-6 h-6 text-primary" />
                                        Company Overview
                                    </h2>
                                    <p className="text-slate-500 dark:text-zinc-400 leading-relaxed text-lg">
                                        {company.overview}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100 dark:border-white/5">
                                    <div className="space-y-1">
                                        <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Difficulty</div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={`${DIFFICULTY_COLORS[company.difficulty as keyof typeof DIFFICULTY_COLORS]}`}>
                                                {company.difficulty}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Success Rate</div>
                                        <div className="flex items-center gap-2 font-bold text-primary">
                                            <TrendingUp className="w-4 h-4" />
                                            {company.successRate}%
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Salary Range</div>
                                        <div className="font-bold">{company.salaryRange}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Timeline</div>
                                        <div className="flex items-center gap-2 font-bold">
                                            <Clock className="w-4 h-4" />
                                            {company.timeline}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Hiring Process */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2 px-2">
                                <Zap className="w-6 h-6 text-yellow-500" />
                                Hiring Process Breakdown
                            </h2>
                            <div className="space-y-4">
                                {company.hiringProcess.map((round: any, index: number) => (
                                    <Card key={index} className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10 group hover:border-white/20 transition-all">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col md:flex-row md:items-start gap-6">
                                                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 flex items-center justify-center font-black text-xl text-primary flex-shrink-0">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 space-y-4">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div>
                                                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                                                                {round.title}
                                                            </h3>
                                                            <div className="flex flex-wrap gap-3 mt-2">
                                                                <Badge variant="outline" className="bg-white dark:bg-zinc-900 border-slate-100 dark:border-white/5 text-slate-500 dark:text-zinc-400 capitalize">
                                                                    <Clock className="w-3 h-3 mr-1.5" />
                                                                    {round.duration}
                                                                </Badge>
                                                                <Badge variant="outline" className="bg-white dark:bg-zinc-900 border-slate-100 dark:border-white/5 text-slate-500 dark:text-zinc-400 capitalize">
                                                                    <Briefcase className="w-3 h-3 mr-1.5" />
                                                                    {round.format}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <Badge className={`${DIFFICULTY_COLORS[round.difficulty as keyof typeof DIFFICULTY_COLORS]}`}>
                                                            {round.difficulty}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-slate-500 dark:text-zinc-400 text-sm leading-relaxed">
                                                        {round.description}
                                                    </p>
                                                    <div className="space-y-2">
                                                        <div className="text-[10px] uppercase tracking-widest font-black text-zinc-600">Key Topics Focus</div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {round.topics.map((topic: string, i: number) => (
                                                                <span key={i} className="px-2 py-1 rounded bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 text-xs font-medium border border-slate-100 dark:border-white/5">
                                                                    {topic}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Interaction & Prep Materials */}
                    <div className="space-y-8">
                        {/* Start Mock Interview Action */}
                        <Card className="bg-primary border-none text-black">
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">Ready to Prep?</h3>
                                    <p className="text-black/70 font-medium">
                                        Launch an AI-powered mock interview tailored to {company.name}'s specific hiring style and expectations.
                                    </p>
                                </div>
                                <Button
                                    className="w-full h-14 bg-slate-50 dark:bg-black text-slate-900 dark:text-white hover:bg-white dark:bg-zinc-900 font-black text-lg gap-3"
                                    onClick={() => router.push(`/dashboard/companies/${slug}/mock`)}
                                >
                                    <Play className="w-6 h-6 fill-current" />
                                    START SIMULATION
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Common Questions */}
                        <Card className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <HelpCircle className="w-5 h-5 text-primary" />
                                    Hot Questions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {company.commonQuestions.map((q: string, i: number) => (
                                    <div key={i} className="flex gap-3 text-sm group">
                                        <div className="w-5 h-5 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-500 flex-shrink-0 group-hover:border-primary/50 group-hover:text-primary transition-colors">
                                            {i + 1}
                                        </div>
                                        <span className="text-slate-600 dark:text-zinc-300 leading-snug">{q}</span>
                                    </div>
                                ))}
                                <Button variant="link" className="text-primary p-0 h-auto text-xs font-bold hover:no-underline">
                                    VIEW MORE PATTERNS
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Tips & Expert Advice */}
                        <Card className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                                    Expert Tips
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {company.tips.map((tip: string, i: number) => (
                                    <div key={i} className="flex items-start gap-3 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                                        <span className="text-slate-500 dark:text-zinc-400">{tip}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Common Mistakes */}
                        <Card className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <XCircle className="w-5 h-5 text-red-500" />
                                    Common Pitfalls
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {company.commonMistakes.map((mistake: string, i: number) => (
                                    <div key={i} className="flex items-start gap-3 text-sm">
                                        <AlertCircle className="w-4 h-4 text-red-500/50 mt-1 flex-shrink-0" />
                                        <span className="text-slate-500 dark:text-zinc-400">{mistake}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
