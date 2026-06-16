"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    Mic, MicOff, Volume2, Clock, Zap, Target, Brain,
    Lightbulb, SkipForward, RotateCcw, CheckCircle2, AlertCircle
} from "lucide-react"
import { toast } from "sonner"

interface PerformanceMetrics {
    confidence: number
    clarity: number
    technicalAccuracy: number
    fillerWords: number
}

export default function PracticeSessionPage() {
    const router = useRouter()
    const [config, setConfig] = useState<any>(null)
    const [isRecording, setIsRecording] = useState(false)
    const [currentQuestion, setCurrentQuestion] = useState("")
    const [questionNumber, setQuestionNumber] = useState(1)
    const [totalQuestions, setTotalQuestions] = useState(10)
    const [timeRemaining, setTimeRemaining] = useState(0)
    const [transcript, setTranscript] = useState("")
    const [isAISpeaking, setIsAISpeaking] = useState(false)
    const [showFeedback, setShowFeedback] = useState(false)
    const [currentFeedback, setCurrentFeedback] = useState("")
    const [sessionId] = useState(() => `session_${Date.now()}`)

    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        confidence: 0,
        clarity: 0,
        technicalAccuracy: 0,
        fillerWords: 0
    })

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        // Load practice configuration
        const savedConfig = localStorage.getItem("practiceConfig")
        if (!savedConfig) {
            router.push("/dashboard/practice")
            return
        }

        const parsedConfig = JSON.parse(savedConfig)
        setConfig(parsedConfig)
        setTimeRemaining(parsedConfig.duration * 60) // Convert to seconds

        // Start first question
        askQuestion(parsedConfig)
    }, [router])

    useEffect(() => {
        // Timer countdown
        if (timeRemaining > 0 && !showFeedback) {
            timerRef.current = setTimeout(() => {
                setTimeRemaining(prev => prev - 1)
            }, 1000)
        } else if (timeRemaining === 0 && config) {
            endSession()
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [timeRemaining, showFeedback, config])

    const askQuestion = async (cfg: any) => {
        setIsAISpeaking(true)

        // Mock question generation (in production, call AI service)
        const questions = {
            technical: [
                "Explain the difference between stack and heap memory allocation.",
                "What is the time complexity of binary search and why?",
                "How would you implement a LRU cache?",
                "Explain the concept of closures in JavaScript.",
                "What are the SOLID principles in object-oriented programming?"
            ],
            behavioral: [
                "Tell me about a time when you had to work with a difficult team member.",
                "Describe a situation where you had to meet a tight deadline.",
                "How do you handle constructive criticism?",
                "Tell me about your biggest professional achievement.",
                "Describe a time when you failed and what you learned from it."
            ],
            system_design: [
                "Design a URL shortening service like bit.ly",
                "How would you design Instagram's feed?",
                "Design a distributed caching system",
                "How would you design a rate limiter?",
                "Design a notification system for a social media platform"
            ],
            coding: [
                "Reverse a linked list",
                "Find the longest substring without repeating characters",
                "Implement a function to detect a cycle in a linked list",
                "Find the kth largest element in an array",
                "Merge two sorted arrays"
            ]
        }

        const questionList = questions[cfg.interviewType as keyof typeof questions] || questions.technical
        const question = questionList[Math.floor(Math.random() * questionList.length)]

        setCurrentQuestion(question)

        // Simulate AI speaking
        setTimeout(() => {
            setIsAISpeaking(false)
            toast.success("Question ready! Click the microphone to answer.")
        }, 2000)
    }

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data)
            }

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
                await processAnswer(audioBlob)
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorder.start()
            setIsRecording(true)
            setTranscript("")
        } catch (error) {
            toast.error("Microphone access denied. Please enable microphone permissions.")
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }

    const processAnswer = async (audioBlob: Blob) => {
        // Simulate processing (in production, send to AI service)
        setTranscript("Processing your answer...")

        // Mock transcript
        setTimeout(() => {
            setTranscript("This is a sample transcript of your answer. In production, this would be the actual transcription from the AI service.")

            // Mock performance metrics
            const mockMetrics: PerformanceMetrics = {
                confidence: Math.floor(Math.random() * 30) + 70, // 70-100
                clarity: Math.floor(Math.random() * 30) + 65, // 65-95
                technicalAccuracy: Math.floor(Math.random() * 35) + 60, // 60-95
                fillerWords: Math.floor(Math.random() * 5) // 0-5
            }

            setMetrics(mockMetrics)

            // Generate feedback
            const feedbackMessages = [
                "Great answer! Your explanation was clear and concise.",
                "Good effort. Try to provide more specific examples next time.",
                "Excellent technical depth. Consider structuring your answer with an intro, body, and conclusion.",
                "Nice work! Reduce filler words like 'um' and 'uh' for better clarity.",
                "Strong answer. You could improve by speaking a bit slower for better clarity."
            ]

            setCurrentFeedback(feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)])
            setShowFeedback(true)
        }, 2000)
    }

    const nextQuestion = () => {
        setShowFeedback(false)
        setTranscript("")
        setCurrentFeedback("")

        if (questionNumber < totalQuestions) {
            setQuestionNumber(prev => prev + 1)
            askQuestion(config)
        } else {
            endSession()
        }
    }

    const skipQuestion = () => {
        toast.info("Question skipped")
        nextQuestion()
    }

    const retryQuestion = () => {
        setShowFeedback(false)
        setTranscript("")
        setCurrentFeedback("")
        toast.info("Try answering again!")
    }

    const getHint = () => {
        const hints = [
            "Think about the core concept and build your answer from there.",
            "Consider using the STAR method: Situation, Task, Action, Result.",
            "Break down the problem into smaller parts and explain each one.",
            "Start with a high-level overview, then dive into details.",
            "Think about real-world examples you can relate to this question."
        ]
        toast.info(hints[Math.floor(Math.random() * hints.length)])
    }

    const endSession = () => {
        // Save session data
        const sessionData = {
            sessionId,
            config,
            questionsAnswered: questionNumber,
            averageMetrics: metrics,
            completedAt: new Date().toISOString()
        }

        localStorage.setItem(`practiceSession_${sessionId}`, JSON.stringify(sessionData))
        router.push(`/dashboard/practice/results/${sessionId}`)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const getMetricColor = (value: number) => {
        if (value >= 80) return "text-emerald-400"
        if (value >= 60) return "text-blue-400"
        if (value >= 40) return "text-amber-400"
        return "text-rose-400"
    }

    if (!config) return null

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white p-4 sm:p-6 md:p-10 relative overflow-hidden aurora-glow">
            {/* Floating ambient orbs */}
            <div className="absolute top-20 left-10 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
            <div className="absolute bottom-32 right-16 w-72 h-72 bg-cyan-500/4 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-fuchsia-500/3 rounded-full blur-[160px] orb-float pointer-events-none" style={{ animationDelay: '5s' }} />

            <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 relative z-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-violet-400 text-[9px] mb-2">
                            <Brain className="w-4 h-4" />
                            <span className="font-black uppercase tracking-[0.2em]">Practice Session</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tighter bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent bg-[length:200%] animate-gradient-x">
                            {config.role} - {config.interviewType}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Time Remaining</div>
                            <div className="text-2xl font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">{formatTime(timeRemaining)}</div>
                        </div>
                        <Button
                            onClick={endSession}
                            variant="outline"
                            className="border-red-500/20 text-red-400 hover:bg-red-500/10 font-black text-[9px] uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.05)]"
                        >
                            End Session
                        </Button>
                    </div>
                </div>

                {/* Progress */}
                <Card className="bg-white dark:bg-zinc-900/40 border-white/[0.06] backdrop-blur-2xl">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Question {questionNumber} of {totalQuestions}</span>
                            <span className="text-sm font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{Math.round((questionNumber / totalQuestions) * 100)}%</span>
                        </div>
                        <Progress value={(questionNumber / totalQuestions) * 100} className="h-2" />
                    </CardContent>
                </Card>

                {/* Live Performance Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="bg-white dark:bg-zinc-900/40 border-white/[0.06] backdrop-blur-2xl">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-4 h-4 text-blue-400 drop-shadow-[0_0_4px_rgba(59,130,246,0.5)]" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Confidence</span>
                            </div>
                            <div className={`text-2xl font-black ${getMetricColor(metrics.confidence)}`}>
                                {metrics.confidence}%
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-zinc-900/40 border-white/[0.06] backdrop-blur-2xl">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Volume2 className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Clarity</span>
                            </div>
                            <div className={`text-2xl font-black ${getMetricColor(metrics.clarity)}`}>
                                {metrics.clarity}%
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-zinc-900/40 border-white/[0.06] backdrop-blur-2xl">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4 text-violet-400 drop-shadow-[0_0_4px_rgba(139,92,246,0.5)]" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Technical</span>
                            </div>
                            <div className={`text-2xl font-black ${getMetricColor(metrics.technicalAccuracy)}`}>
                                {metrics.technicalAccuracy}%
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-zinc-900/40 border-white/[0.06] backdrop-blur-2xl">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-amber-400 drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Filler Words</span>
                            </div>
                            <div className="text-2xl font-black text-amber-400">
                                {metrics.fillerWords}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Question Card */}
                <Card className="bg-gradient-to-br from-zinc-900/60 to-zinc-900/30 border-violet-500/10 backdrop-blur-2xl shadow-[0_0_40px_rgba(139,92,246,0.04)]">
                    <CardContent className="p-6 sm:p-8">
                        {isAISpeaking ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-16 h-16 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full flex items-center justify-center mb-4 animate-pulse border border-violet-500/20 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
                                    <Volume2 className="w-8 h-8 text-violet-400" />
                                </div>
                                <p className="text-lg text-zinc-500 font-medium">AI is asking a question...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <div className="text-[9px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-3">
                                        Question {questionNumber}
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-black leading-relaxed tracking-tight">
                                        {currentQuestion}
                                    </h2>
                                </div>

                                {/* Recording Controls */}
                                {!showFeedback && (
                                    <div className="flex flex-col items-center gap-4 py-6">
                                        <button
                                            onClick={isRecording ? stopRecording : startRecording}
                                            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isRecording
                                                ? "bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 animate-pulse shadow-[0_0_40px_rgba(239,68,68,0.3)]"
                                                : "bg-gradient-to-br from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 shadow-[0_0_40px_rgba(139,92,246,0.25)]"
                                                }`}
                                        >
                                            {isRecording ? (
                                                <MicOff className="w-10 h-10 text-slate-900 dark:text-white" />
                                            ) : (
                                                <Mic className="w-10 h-10 text-slate-900 dark:text-white" />
                                            )}
                                        </button>
                                        <p className="text-sm text-slate-500 dark:text-zinc-400">
                                            {isRecording ? "Click to stop recording" : "Click to start answering"}
                                        </p>
                                    </div>
                                )}

                                {/* Transcript */}
                                {transcript && (
                                    <div className="bg-white dark:bg-black/40 rounded-xl p-4 border border-white/[0.06]">
                                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Your Answer:</div>
                                        <p className="text-sm text-slate-600 dark:text-zinc-300">{transcript}</p>
                                    </div>
                                )}

                                {/* Feedback */}
                                {showFeedback && (
                                    <div className="bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 border border-violet-500/15 rounded-xl p-4">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-violet-400 mt-0.5 flex-shrink-0 drop-shadow-[0_0_4px_rgba(139,92,246,0.5)]" />
                                            <div>
                                                <div className="font-black text-sm uppercase tracking-widest bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-1">Feedback</div>
                                                <p className="text-sm text-slate-600 dark:text-zinc-300">{currentFeedback}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {config.hintsEnabled && !showFeedback && (
                        <Button
                            onClick={getHint}
                            variant="outline"
                            className="h-12 border-amber-500/20 text-amber-400 hover:bg-amber-500/10 font-black text-[9px] uppercase tracking-widest shadow-[0_0_10px_rgba(245,158,11,0.05)]"
                        >
                            <Lightbulb className="w-4 h-4 mr-2" />
                            Get Hint
                        </Button>
                    )}

                    {showFeedback && (
                        <>
                            <Button
                                onClick={retryQuestion}
                                variant="outline"
                                className="h-12 border-violet-500/20 text-violet-400 hover:bg-violet-500/10 font-black text-[9px] uppercase tracking-widest"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Retry
                            </Button>
                            <Button
                                onClick={nextQuestion}
                                className="h-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-slate-900 dark:text-white font-black text-[9px] uppercase tracking-widest shadow-[0_0_25px_rgba(139,92,246,0.3)] hover:shadow-[0_0_35px_rgba(139,92,246,0.5)] hover:scale-[1.02] transition-all border-0"
                            >
                                Next Question
                                <SkipForward className="w-4 h-4 ml-2" />
                            </Button>
                        </>
                    )}

                    {!showFeedback && (
                        <Button
                            onClick={skipQuestion}
                            variant="outline"
                            className="h-12 border-white/[0.06] text-slate-500 dark:text-zinc-400 hover:bg-white/5 font-black text-[9px] uppercase tracking-widest hover:border-violet-500/20 hover:text-violet-400 transition-all"
                        >
                            <SkipForward className="w-4 h-4 mr-2" />
                            Skip
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
