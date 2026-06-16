"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Mic, MicOff, Volume2, Clock, CheckCircle2, ArrowRight, Home
} from "lucide-react"
import { toast } from "sonner"
import DashboardHeader from "@/components/dashboard/DashboardHeader"

export default function CompanyMockPage() {
    const router = useRouter()
    const params = useParams()
    const companySlug = params.slug as string
    const [companyName, setCompanyName] = useState("")
    const [currentRound, setCurrentRound] = useState(1)
    const [totalRounds, setTotalRounds] = useState(5)
    const [isRecording, setIsRecording] = useState(false)
    const [currentQuestion, setCurrentQuestion] = useState("")
    const [questionNumber, setQuestionNumber] = useState(1)
    const [isAISpeaking, setIsAISpeaking] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [showFeedback, setShowFeedback] = useState(false)
    const [sessionComplete, setSessionComplete] = useState(false)
    const [overallScore, setOverallScore] = useState(0)

    useEffect(() => {
        // Load company data
        const companyNames: Record<string, string> = {
            google: "Google",
            tcs: "TCS",
            amazon: "Amazon",
            meta: "Meta"
        }

        setCompanyName(companyNames[companySlug] || "Company")

        // Set rounds based on company
        const rounds: Record<string, number> = {
            google: 5,
            tcs: 3,
            amazon: 6,
            meta: 5
        }

        setTotalRounds(rounds[companySlug] || 4)

        // Start first question
        askQuestion()
    }, [companySlug])

    const askQuestion = () => {
        setIsAISpeaking(true)

        // Mock questions by company
        const questions: Record<string, string[]> = {
            google: [
                "Implement an LRU Cache",
                "Design a distributed caching system",
                "Tell me about a time you solved a complex problem"
            ],
            tcs: [
                "What is polymorphism in OOP?",
                "Explain normalization in databases",
                "Why do you want to join TCS?"
            ]
        }

        const questionList = questions[companySlug] || [
            "Tell me about your experience",
            "What are your strengths?",
            "Why this company?"
        ]

        const question = questionList[Math.floor(Math.random() * questionList.length)]
        setCurrentQuestion(question)

        setTimeout(() => {
            setIsAISpeaking(false)
            toast.success("Question ready! Click microphone to answer.")
        }, 2000)
    }

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            setIsRecording(true)
            setTranscript("")

            // Simulate recording
            setTimeout(() => {
                stream.getTracks().forEach(track => track.stop())
            }, 100)
        } catch (error) {
            toast.error("Microphone access denied")
        }
    }

    const stopRecording = () => {
        setIsRecording(false)

        // Simulate processing
        setTimeout(() => {
            setTranscript("This is a sample transcript of your answer...")
            setShowFeedback(true)
        }, 1500)
    }

    const nextQuestion = () => {
        setShowFeedback(false)
        setTranscript("")

        if (questionNumber < 3) {
            setQuestionNumber(prev => prev + 1)
            askQuestion()
        } else if (currentRound < totalRounds) {
            setCurrentRound(prev => prev + 1)
            setQuestionNumber(1)
            toast.success(`Round ${currentRound} complete! Moving to Round ${currentRound + 1}`)
            askQuestion()
        } else {
            completeSession()
        }
    }

    const completeSession = () => {
        const score = Math.floor(Math.random() * 30) + 70 // 70-100
        setOverallScore(score)
        setSessionComplete(true)

        // Save to localStorage
        const mockData = {
            company: companyName,
            score,
            completedAt: new Date().toISOString()
        }
        localStorage.setItem(`mock_${companySlug}_${Date.now()}`, JSON.stringify(mockData))
    }

    if (sessionComplete) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-4 sm:p-6 md:p-10">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-full mb-4">
                            <CheckCircle2 className="w-10 h-10 text-primary" />
                        </div>
                        <h1 className="text-4xl font-black">Mock Interview Complete!</h1>
                        <p className="text-lg text-slate-500 dark:text-zinc-400">
                            Great job completing the {companyName} mock interview
                        </p>
                    </div>

                    <Card className="bg-gradient-to-br from-primary/20 to-purple-500/20 border-primary/20">
                        <CardContent className="p-8 text-center">
                            <div className="text-sm text-slate-500 dark:text-zinc-400 mb-2">Overall Score</div>
                            <div className="text-6xl font-black text-primary mb-4">{overallScore}%</div>
                            <div className="text-lg font-bold">
                                {overallScore >= 85 ? "Excellent Performance!" :
                                    overallScore >= 70 ? "Good Performance!" : "Keep Practicing!"}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button
                            onClick={() => router.push(`/dashboard/companies/${companySlug}`)}
                            className="h-14 bg-primary hover:bg-primary/90 text-black font-bold"
                        >
                            <ArrowRight className="w-5 h-5 mr-2" />
                            Try Again
                        </Button>
                        <Button
                            onClick={() => router.push("/dashboard/companies")}
                            variant="outline"
                            className="h-14 border-slate-200 dark:border-white/10 hover:bg-white/5"
                        >
                            <Home className="w-5 h-5 mr-2" />
                            Browse Companies
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-4 sm:p-6 md:p-10">
            <div className="max-w-4xl mx-auto space-y-6">
                <DashboardHeader
                    title={`${companyName} Mock Interview`}
                    subtitle="Practice real-world interview scenarios with AI."
                    breadcrumbs={[
                        { label: "Companies", href: "/dashboard/companies" },
                        { label: companyName, href: `/dashboard/companies/${companySlug}` },
                        { label: "Mock Interview" }
                    ]}
                />

                {/* Progress */}
                <Card className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10">
                    <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500 dark:text-zinc-400">Round {currentRound} of {totalRounds}</span>
                            <span className="font-bold">Question {questionNumber}/3</span>
                        </div>
                        <Progress value={(currentRound / totalRounds) * 100} className="h-2" />
                    </CardContent>
                </Card>

                {/* Question Card */}
                <Card className="bg-gradient-to-br from-zinc-950 to-zinc-900 border-primary/20">
                    <CardContent className="p-6 sm:p-8">
                        {isAISpeaking ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                    <Volume2 className="w-8 h-8 text-primary" />
                                </div>
                                <p className="text-lg text-slate-500 dark:text-zinc-400">AI interviewer is asking a question...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <div className="text-xs text-primary font-bold uppercase tracking-widest mb-3">
                                        Round {currentRound} - Question {questionNumber}
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold leading-relaxed">
                                        {currentQuestion}
                                    </h2>
                                </div>

                                {/* Recording Controls */}
                                {!showFeedback && (
                                    <div className="flex flex-col items-center gap-4 py-6">
                                        <button
                                            onClick={isRecording ? stopRecording : startRecording}
                                            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isRecording
                                                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                                                : "bg-primary hover:bg-primary/90"
                                                }`}
                                        >
                                            {isRecording ? (
                                                <MicOff className="w-10 h-10 text-slate-900 dark:text-white" />
                                            ) : (
                                                <Mic className="w-10 h-10 text-black" />
                                            )}
                                        </button>
                                        <p className="text-sm text-slate-500 dark:text-zinc-400">
                                            {isRecording ? "Click to stop recording" : "Click to start answering"}
                                        </p>
                                    </div>
                                )}

                                {/* Transcript */}
                                {transcript && (
                                    <div className="bg-white/60 dark:bg-zinc-900/50 rounded-lg p-4 border border-slate-100 dark:border-white/5">
                                        <div className="text-xs text-zinc-500 mb-2">Your Answer:</div>
                                        <p className="text-sm text-slate-600 dark:text-zinc-300">{transcript}</p>
                                    </div>
                                )}

                                {/* Feedback */}
                                {showFeedback && (
                                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                                            <div>
                                                <div className="font-bold mb-1">Feedback</div>
                                                <p className="text-sm text-slate-600 dark:text-zinc-300">
                                                    Good answer! Your response was clear and well-structured.
                                                    Consider adding more specific examples next time.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Next Button */}
                                {showFeedback && (
                                    <Button
                                        onClick={nextQuestion}
                                        className="w-full h-12 bg-primary hover:bg-primary/90 text-black font-bold"
                                    >
                                        Next Question
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
