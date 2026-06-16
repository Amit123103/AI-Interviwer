"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Trophy, TrendingUp, TrendingDown, Target, Brain,
    Award, ArrowRight, RotateCcw, Home, CheckCircle2, AlertCircle, Sparkles
} from "lucide-react"
import IntervyxaCoin from "@/components/reward-system/IntervyxaCoin"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

export default function PracticeResultsPage() {
    const router = useRouter()
    const params = useParams()
    const sessionId = params.sessionId as string
    const [sessionData, setSessionData] = useState<any>(null)
    const [overallScore, setOverallScore] = useState(0)

    useEffect(() => {
        // Load session data
        const savedSession = localStorage.getItem(`practiceSession_${sessionId}`)
        if (!savedSession) {
            router.push("/dashboard/practice")
            return
        }

        const data = JSON.parse(savedSession)
        setSessionData(data)

        // Calculate overall score
        const avg = (
            data.averageMetrics.confidence +
            data.averageMetrics.clarity +
            data.averageMetrics.technicalAccuracy
        ) / 3
        setOverallScore(Math.round(avg))

        // Award Intervyxa Coins (mock logic for results page)
        const earned = Math.round(avg * 2); // e.g., 100% = 200 coins
        setSessionData((prev: any) => ({ ...prev, coinsEarned: earned }))
    }, [sessionId, router])

    const getPerformanceLevel = (score: number) => {
        if (score >= 85) return { label: "Excellent", color: "text-green-500", bg: "bg-green-500/10" }
        if (score >= 70) return { label: "Good", color: "text-blue-500", bg: "bg-blue-500/10" }
        if (score >= 55) return { label: "Average", color: "text-orange-500", bg: "bg-orange-500/10" }
        return { label: "Needs Improvement", color: "text-red-500", bg: "bg-red-500/10" }
    }

    const mockStrengths = [
        "Clear and structured communication",
        "Strong technical knowledge",
        "Good use of examples"
    ]

    const mockWeaknesses = [
        "Reduce filler words (um, uh, like)",
        "Speak at a more consistent pace",
        "Provide more specific details"
    ]

    const mockRecommendations = [
        "Practice STAR method for behavioral questions",
        "Review data structures and algorithms",
        "Work on speaking confidence and clarity",
        "Practice more system design scenarios"
    ]

    const mockBadges = [
        { id: 1, name: "First Practice", icon: "🎯", earned: true },
        { id: 2, name: "Coin Collector", icon: "🪙", earned: true },
        { id: 3, name: "Perfect Score", icon: "⭐", earned: false },
        { id: 4, name: "10 Sessions", icon: "🏆", earned: false }
    ]

    if (!sessionData) return null

    const performance = getPerformanceLevel(overallScore)

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-4 sm:p-6 md:p-10">
            <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-full mb-4">
                        <Trophy className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter">
                        Practice Complete!
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-zinc-400">
                        Great job! Here's your performance summary
                    </p>
                </div>

                {/* Overall Score */}
                <Card className="bg-gradient-to-br from-primary/20 to-purple-500/20 border-primary/20">
                    <CardContent className="p-6 sm:p-8 text-center">
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm text-slate-500 dark:text-zinc-400 mb-2">Overall Performance</div>
                                <div className="text-6xl sm:text-7xl font-black text-primary mb-2">
                                    {overallScore}%
                                </div>
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${performance.bg}`}>
                                    <span className={`text-lg font-bold ${performance.color}`}>
                                        {performance.label}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-6 text-sm">
                                <div>
                                    <div className="text-zinc-500">Questions</div>
                                    <div className="text-xl font-bold">{sessionData.questionsAnswered}</div>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div>
                                    <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 font-mono text-sm">
                                        <div className="flex items-center gap-2">
                                            <IntervyxaCoin size={18} animate={false} />
                                            <span>Coins Gained</span>
                                        </div>
                                        <span className="text-yellow-500 font-bold">+{sessionData.coinsEarned || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-slate-500 dark:text-zinc-400">Confidence</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="text-3xl font-bold text-blue-500">
                                    {sessionData.averageMetrics.confidence}%
                                </div>
                                <Progress value={sessionData.averageMetrics.confidence} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-slate-500 dark:text-zinc-400">Clarity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="text-3xl font-bold text-green-500">
                                    {sessionData.averageMetrics.clarity}%
                                </div>
                                <Progress value={sessionData.averageMetrics.clarity} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-slate-500 dark:text-zinc-400">Technical Accuracy</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="text-3xl font-bold text-purple-500">
                                    {sessionData.averageMetrics.technicalAccuracy}%
                                </div>
                                <Progress value={sessionData.averageMetrics.technicalAccuracy} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Strengths */}
                    <Card className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                <TrendingUp className="w-5 h-5 text-green-500" />
                                Strengths
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {mockStrengths.map((strength, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-slate-600 dark:text-zinc-300">{strength}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Weaknesses */}
                    <Card className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                <TrendingDown className="w-5 h-5 text-orange-500" />
                                Areas to Improve
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {mockWeaknesses.map((weakness, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-slate-600 dark:text-zinc-300">{weakness}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recommendations */}
                <Card className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                            <Target className="w-5 h-5 text-primary" />
                            Recommended Next Steps
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {mockRecommendations.map((rec, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 p-3 bg-white/60 dark:bg-zinc-900/50 rounded-lg border border-slate-100 dark:border-white/5"
                                >
                                    <Brain className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-slate-600 dark:text-zinc-300">{rec}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Achievement Badges */}
                <Card className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                            <Award className="w-5 h-5 text-primary" />
                            Achievement Badges
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {mockBadges.map((badge) => (
                                <div
                                    key={badge.id}
                                    className={`p-4 rounded-xl text-center transition-all ${badge.earned
                                        ? "bg-primary/20 border-2 border-primary"
                                        : "bg-white/60 dark:bg-zinc-900/50 border border-slate-100 dark:border-white/5 opacity-50"
                                        }`}
                                >
                                    <div className="text-3xl mb-2">{badge.icon}</div>
                                    <div className="text-xs font-medium">{badge.name}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button
                        onClick={() => router.push("/dashboard/practice")}
                        className="h-14 bg-primary hover:bg-primary/90 text-black font-bold"
                    >
                        <RotateCcw className="w-5 h-5 mr-2" />
                        Practice Again
                    </Button>
                    <Button
                        onClick={() => router.push("/dashboard/analytics")}
                        variant="outline"
                        className="h-14 border-slate-200 dark:border-white/10 hover:bg-white/5"
                    >
                        <TrendingUp className="w-5 h-5 mr-2" />
                        View Analytics
                    </Button>
                    <Button
                        onClick={() => router.push("/dashboard")}
                        variant="outline"
                        className="h-14 border-slate-200 dark:border-white/10 hover:bg-white/5"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        Dashboard
                    </Button>
                </div>

                {/* Next Session Suggestion */}
                <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-lg mb-1">Keep the momentum going!</h3>
                                <p className="text-sm text-slate-500 dark:text-zinc-400">
                                    Practice daily to improve your interview skills and build confidence
                                </p>
                            </div>
                            <Button
                                onClick={() => router.push("/dashboard/practice")}
                                className="bg-primary hover:bg-primary/90 text-black font-bold whitespace-nowrap"
                            >
                                Start New Session
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
