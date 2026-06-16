"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    FeedbackOverlay,
    type RealtimeFeedbackData
} from "@/components/realtime"
import { Play, Pause, RotateCcw, Zap } from "lucide-react"
import BackToDashboard from "@/components/dashboard/BackToDashboard"

export default function FeedbackDemoPage() {
    const [isRunning, setIsRunning] = useState(false)
    const [showFeedback, setShowFeedback] = useState(true)

    // Simulated real-time feedback data
    const [feedbackData, setFeedbackData] = useState<RealtimeFeedbackData>({
        confidence: 65,
        fillerWords: {
            count: 3,
            rate: 1.5,
            recent: ["um", "like", "uh"]
        },
        pace: {
            wpm: 145,
            history: [130, 135, 140, 142, 145]
        },
        accuracy: {
            score: 72,
            keywordCoverage: 68,
            technicalDepth: 75,
            structureQuality: 73
        }
    })

    // Simulate real-time updates
    useEffect(() => {
        if (!isRunning) return

        const interval = setInterval(() => {
            setFeedbackData(prev => ({
                confidence: Math.min(100, Math.max(0, prev.confidence + (Math.random() - 0.5) * 10)),
                fillerWords: {
                    count: Math.max(0, prev.fillerWords.count + (Math.random() > 0.7 ? 1 : 0)),
                    rate: Math.max(0, prev.fillerWords.rate + (Math.random() - 0.5) * 0.5),
                    recent: Math.random() > 0.7
                        ? [...prev.fillerWords.recent, ["um", "uh", "like", "you know"][Math.floor(Math.random() * 4)]].slice(-6)
                        : prev.fillerWords.recent
                },
                pace: {
                    wpm: Math.min(200, Math.max(80, prev.pace.wpm + (Math.random() - 0.5) * 15)),
                    history: [...prev.pace.history, prev.pace.wpm].slice(-10)
                },
                accuracy: {
                    score: Math.min(100, Math.max(0, prev.accuracy.score + (Math.random() - 0.5) * 8)),
                    keywordCoverage: Math.min(100, Math.max(0, prev.accuracy.keywordCoverage + (Math.random() - 0.5) * 10)),
                    technicalDepth: Math.min(100, Math.max(0, prev.accuracy.technicalDepth + (Math.random() - 0.5) * 10)),
                    structureQuality: Math.min(100, Math.max(0, prev.accuracy.structureQuality + (Math.random() - 0.5) * 10))
                }
            }))
        }, 2000)

        return () => clearInterval(interval)
    }, [isRunning])

    const reset = () => {
        setFeedbackData({
            confidence: 65,
            fillerWords: { count: 0, rate: 0, recent: [] },
            pace: { wpm: 145, history: [130, 135, 140, 142, 145] },
            accuracy: { score: 72, keywordCoverage: 68, technicalDepth: 75, structureQuality: 73 }
        })
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-4 sm:p-6 md:p-10 relative overflow-hidden aurora-glow">
            {/* Floating ambient orbs */}
            <div className="absolute top-20 left-10 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
            <div className="absolute bottom-32 right-16 w-72 h-72 bg-cyan-500/4 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />
            <div className="max-w-4xl mx-auto space-y-6 relative z-10">
                <BackToDashboard currentPage="Feedback Demo" />
                {/* Header */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-violet-400">
                        <Zap className="w-6 h-6" />
                        <span className="text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Real-Time Feedback Demo</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter">
                        Live Interview Coaching
                    </h1>
                    <p className="text-base sm:text-lg text-slate-500 dark:text-zinc-400 max-w-2xl">
                        Experience real-time AI feedback during interviews with live metrics and instant coaching
                    </p>
                </div>

                {/* Controls */}
                <Card className="bg-white dark:bg-zinc-950/80 border-white/[0.06] backdrop-blur-2xl">
                    <CardHeader>
                        <CardTitle>Simulation Controls</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-3">
                            <Button
                                onClick={() => setIsRunning(!isRunning)}
                                className={`${isRunning
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-primary hover:bg-primary/90"
                                    } text-slate-900 dark:text-white font-bold border-0`}
                            >
                                {isRunning ? (
                                    <>
                                        <Pause className="w-4 h-4 mr-2" />
                                        Stop Simulation
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4 mr-2" />
                                        Start Simulation
                                    </>
                                )}
                            </Button>

                            <Button
                                onClick={reset}
                                variant="outline"
                                className="border-white/[0.06] hover:bg-white/5 hover:border-violet-500/20"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset
                            </Button>

                            <Button
                                onClick={() => setShowFeedback(!showFeedback)}
                                variant="outline"
                                className="border-white/[0.06] hover:bg-white/5 hover:border-violet-500/20"
                            >
                                {showFeedback ? "Hide" : "Show"} Feedback
                            </Button>
                        </div>

                        {isRunning && (
                            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 border shadow-[0_0_10px_rgba(34,197,94,0.15)]">
                                🔴 Live Simulation Running
                            </Badge>
                        )}
                    </CardContent>
                </Card>

                {/* Features Overview */}
                <Card className="bg-white dark:bg-zinc-950/80 border-white/[0.06] backdrop-blur-2xl">
                    <CardHeader>
                        <CardTitle>What You're Seeing</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h4 className="font-bold text-violet-400">Confidence Meter</h4>
                                <p className="text-sm text-slate-500 dark:text-zinc-400">
                                    Circular gauge showing speaker confidence based on voice analysis (0-100%)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-fuchsia-400">Filler Word Counter</h4>
                                <p className="text-sm text-slate-500 dark:text-zinc-400">
                                    Tracks "um", "uh", "like" and other fillers with rate per minute
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-cyan-400">Speaking Pace</h4>
                                <p className="text-sm text-slate-500 dark:text-zinc-400">
                                    Words per minute with optimal range (130-170 WPM) and trend analysis
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-emerald-400">Technical Accuracy</h4>
                                <p className="text-sm text-slate-500 dark:text-zinc-400">
                                    Multi-metric scoring: keywords, technical depth, and structure quality
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Current Metrics Display */}
                <Card className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-violet-500/20 backdrop-blur-2xl">
                    <CardHeader>
                        <CardTitle>Current Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-xs text-zinc-500 mb-1">Confidence</div>
                                <div className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                                    {Math.round(feedbackData.confidence)}%
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-zinc-500 mb-1">Filler Words</div>
                                <div className="text-2xl font-bold text-orange-500">
                                    {feedbackData.fillerWords.count}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-zinc-500 mb-1">Speaking Pace</div>
                                <div className="text-2xl font-bold text-blue-500">
                                    {Math.round(feedbackData.pace.wpm)} WPM
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-zinc-500 mb-1">Accuracy</div>
                                <div className="text-2xl font-bold text-green-500">
                                    {Math.round(feedbackData.accuracy.score)}%
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Integration Info */}
                <Card className="bg-white dark:bg-zinc-950/80 border-white/[0.06] backdrop-blur-2xl">
                    <CardHeader>
                        <CardTitle>Integration Ready</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-slate-600 dark:text-zinc-300">
                            This real-time feedback system is ready to integrate into:
                        </p>
                        <ul className="text-sm text-slate-500 dark:text-zinc-400 space-y-2">
                            <li>✅ Interview pages - Live coaching during interviews</li>
                            <li>✅ Practice sessions - Instant feedback on answers</li>
                            <li>✅ Mock interviews - Company-specific coaching</li>
                            <li>✅ Question practice - Voice-based learning</li>
                        </ul>
                        <div className="pt-3 border-t border-slate-100 dark:border-white/5">
                            <p className="text-xs text-zinc-500">
                                <strong>Backend:</strong> Connects to adaptive intelligence API at localhost:8000
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Feedback Overlay */}
            <FeedbackOverlay
                data={feedbackData}
                isVisible={showFeedback}
                onToggle={() => setShowFeedback(!showFeedback)}
            />
        </div>
    )
}
