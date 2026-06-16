"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    ArrowLeft, Bookmark, CheckCircle2, Mic, Play,
    Lightbulb, AlertTriangle, Target, Link as LinkIcon, Share2
} from "lucide-react"
import { toast } from "sonner"
import BackToDashboard from "@/components/dashboard/BackToDashboard"

// Mock question details
const QUESTION_DETAILS: Record<string, any> = {
    q1: {
        id: "q1",
        title: "Explain the difference between stack and heap memory",
        difficulty: "medium",
        type: "technical",
        role: ["Software Engineer", "Backend Developer"],
        subject: ["Memory Management", "Computer Science"],
        explanation: "Stack and heap are two different memory allocation strategies. The stack is used for static memory allocation and follows LIFO (Last In First Out) principle. It stores local variables, function parameters, and return addresses. The heap is used for dynamic memory allocation and allows more flexible memory management.",
        sampleAnswer: "Stack memory is automatically managed and used for local variables with a known size at compile time. It's fast but limited in size. Heap memory is manually managed (or garbage collected in languages like Java/Python) and used for objects whose size may change or isn't known at compile time. Heap is slower but offers more flexibility and larger capacity. For example, in C++, local variables go on the stack, while objects created with 'new' go on the heap.",
        keyPoints: [
            "Stack: LIFO structure, automatic management, faster access",
            "Heap: Dynamic allocation, manual/GC management, flexible size",
            "Stack: Limited size, local scope",
            "Heap: Larger capacity, global access",
            "Stack overflow vs heap fragmentation issues"
        ],
        expectations: [
            "Clear distinction between stack and heap",
            "Mention of allocation/deallocation mechanisms",
            "Real-world examples or use cases",
            "Understanding of performance implications",
            "Knowledge of potential issues (overflow, fragmentation)"
        ],
        mistakes: [
            "Confusing stack with data structure stack",
            "Not mentioning scope and lifetime differences",
            "Ignoring performance characteristics",
            "Failing to provide concrete examples"
        ],
        relatedQuestions: ["q5", "q3"]
    },
    q2: {
        id: "q2",
        title: "Tell me about a time you had to meet a tight deadline",
        difficulty: "easy",
        type: "behavioral",
        role: ["All Roles"],
        subject: ["Time Management", "Soft Skills"],
        explanation: "This is a behavioral question designed to assess your time management, prioritization, and stress-handling skills. Use the STAR method (Situation, Task, Action, Result) to structure your answer.",
        sampleAnswer: "At my previous company, we had a critical client demo scheduled in 3 days, but our main developer fell ill. I was tasked with completing the remaining features. I immediately prioritized the must-have features, delegated documentation to a junior developer, and worked extended hours focusing on core functionality. I also set up hourly check-ins with the team to ensure alignment. We successfully delivered the demo on time, secured the client contract worth $500K, and I learned valuable lessons about crisis management and delegation.",
        keyPoints: [
            "Use STAR method structure",
            "Describe specific situation with context",
            "Explain your actions and decision-making",
            "Quantify results when possible",
            "Mention lessons learned"
        ],
        expectations: [
            "Structured response using STAR",
            "Specific, real example (not hypothetical)",
            "Clear explanation of your role",
            "Positive outcome or learning",
            "Professional tone"
        ],
        mistakes: [
            "Being too vague or generic",
            "Not following STAR structure",
            "Blaming others for the tight deadline",
            "Failing to mention the outcome",
            "Making up a story"
        ],
        relatedQuestions: ["q6"]
    }
}

const DIFFICULTY_COLORS = {
    easy: "bg-green-500/10 text-green-500 border-green-500/20",
    medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    hard: "bg-orange-500/10 text-orange-500 border-orange-500/20"
}

export default function QuestionDetailPage() {
    const router = useRouter()
    const params = useParams()
    const questionId = params.id as string
    const [question, setQuestion] = useState<any>(null)
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [isPracticed, setIsPracticed] = useState(false)
    const [showPracticeMode, setShowPracticeMode] = useState(false)

    useEffect(() => {
        const questionData = QUESTION_DETAILS[questionId]
        if (!questionData) {
            router.push("/dashboard/questions")
            return
        }
        setQuestion(questionData)

        // Load user progress
        const bookmarks = JSON.parse(localStorage.getItem("questionBookmarks") || "[]")
        const practiced = JSON.parse(localStorage.getItem("questionsPracticed") || "[]")
        setIsBookmarked(bookmarks.includes(questionId))
        setIsPracticed(practiced.includes(questionId))
    }, [questionId, router])

    const toggleBookmark = () => {
        const bookmarks = JSON.parse(localStorage.getItem("questionBookmarks") || "[]")
        if (isBookmarked) {
            const updated = bookmarks.filter((id: string) => id !== questionId)
            localStorage.setItem("questionBookmarks", JSON.stringify(updated))
            setIsBookmarked(false)
            toast.success("Removed from bookmarks")
        } else {
            bookmarks.push(questionId)
            localStorage.setItem("questionBookmarks", JSON.stringify(bookmarks))
            setIsBookmarked(true)
            toast.success("Added to bookmarks")
        }
    }

    const markAsPracticed = () => {
        const practiced = JSON.parse(localStorage.getItem("questionsPracticed") || "[]")
        if (!practiced.includes(questionId)) {
            practiced.push(questionId)
            localStorage.setItem("questionsPracticed", JSON.stringify(practiced))
            setIsPracticed(true)
            toast.success("Marked as practiced")
        }
    }

    const startPractice = () => {
        setShowPracticeMode(true)
        markAsPracticed()
    }

    if (!question) return null

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-4 sm:p-6 md:p-10">
            <div className="max-w-4xl mx-auto space-y-6">
                <BackToDashboard currentPage="Question Detail" parents={[{ label: 'Questions', href: '/dashboard/questions' }]} />

                {/* Question Header */}
                <Card className="bg-gradient-to-br from-zinc-950 to-zinc-900 border-primary/20">
                    <CardContent className="p-6 sm:p-8 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge className={`${DIFFICULTY_COLORS[question.difficulty as keyof typeof DIFFICULTY_COLORS]} border`}>
                                        {question.difficulty}
                                    </Badge>
                                    <Badge variant="outline" className="border-slate-200 dark:border-white/10">
                                        {question.type.replace('_', ' ')}
                                    </Badge>
                                    {isPracticed && (
                                        <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 border">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Practiced
                                        </Badge>
                                    )}
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                                    {question.title}
                                </h1>
                                <div className="flex items-center gap-2 flex-wrap text-sm text-slate-500 dark:text-zinc-400">
                                    {question.subject.map((s: string, idx: number) => (
                                        <span key={idx}>
                                            {s}
                                            {idx < question.subject.length - 1 && " • "}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <Button
                                onClick={toggleBookmark}
                                variant="outline"
                                className={`border-white/10 ${isBookmarked ? 'bg-orange-500/10 border-orange-500/50' : ''}`}
                            >
                                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-orange-500 text-orange-500' : ''}`} />
                            </Button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Button
                                onClick={startPractice}
                                className="flex-1 h-12 bg-primary hover:bg-primary/90 text-black font-bold"
                            >
                                <Mic className="w-5 h-5 mr-2" />
                                Practice This Question
                            </Button>
                            <Button
                                variant="outline"
                                className="border-slate-200 dark:border-white/10 hover:bg-white/5"
                                onClick={() => toast.success("Link copied to clipboard")}
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Practice Mode */}
                {showPracticeMode && (
                    <Card className="bg-white dark:bg-zinc-950 border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mic className="w-5 h-5 text-primary" />
                                Practice Mode
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-slate-500 dark:text-zinc-400">
                                Click the microphone to record your answer. You'll receive AI feedback on your response.
                            </p>
                            <div className="flex flex-col items-center gap-4 py-6 bg-white/60 dark:bg-zinc-900/50 rounded-lg">
                                <button className="w-20 h-20 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center transition-all">
                                    <Mic className="w-10 h-10 text-black" />
                                </button>
                                <p className="text-sm text-zinc-500">Click to start recording</p>
                            </div>
                            <Button
                                onClick={() => setShowPracticeMode(false)}
                                variant="outline"
                                className="w-full border-slate-200 dark:border-white/10 hover:bg-white/5"
                            >
                                Close Practice Mode
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Explanation */}
                <Card className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-primary" />
                            Explanation
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">{question.explanation}</p>
                    </CardContent>
                </Card>

                {/* Sample Answer */}
                <Card className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            Sample Strong Answer
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-white/60 dark:bg-zinc-900/50 rounded-lg p-4 border border-slate-100 dark:border-white/5">
                            <p className="text-slate-600 dark:text-zinc-300 leading-relaxed italic">
                                "{question.sampleAnswer}"
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Key Points */}
                <Card className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-500" />
                            Key Points to Cover
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {question.keyPoints.map((point: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-slate-600 dark:text-zinc-300">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* What Interviewers Expect */}
                <Card className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10">
                    <CardHeader>
                        <CardTitle>What Interviewers Expect</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {question.expectations.map((exp: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-bold text-primary">{idx + 1}</span>
                                    </div>
                                    <span className="text-slate-600 dark:text-zinc-300">{exp}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Common Mistakes */}
                <Card className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            Common Mistakes to Avoid
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {question.mistakes.map((mistake: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-slate-600 dark:text-zinc-300">{mistake}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Related Questions */}
                {question.relatedQuestions && question.relatedQuestions.length > 0 && (
                    <Card className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LinkIcon className="w-5 h-5 text-primary" />
                                Related Questions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {question.relatedQuestions.map((relatedId: string) => {
                                    const related = QUESTION_DETAILS[relatedId]
                                    if (!related) return null

                                    return (
                                        <button
                                            key={relatedId}
                                            onClick={() => router.push(`/dashboard/questions/${relatedId}`)}
                                            className="w-full p-3 bg-white/60 dark:bg-zinc-900/50 hover:bg-white dark:bg-zinc-900 rounded-lg text-left transition-all border border-slate-100 dark:border-white/5 hover:border-primary/50"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">{related.title}</span>
                                                <Badge className={`${DIFFICULTY_COLORS[related.difficulty as keyof typeof DIFFICULTY_COLORS]} border text-xs`}>
                                                    {related.difficulty}
                                                </Badge>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Bottom Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        onClick={startPractice}
                        className="flex-1 h-14 bg-primary hover:bg-primary/90 text-black font-bold"
                    >
                        <Play className="w-5 h-5 mr-2" />
                        Start Practice
                    </Button>
                    <Button
                        onClick={() => router.push("/dashboard/questions")}
                        variant="outline"
                        className="h-14 border-slate-200 dark:border-white/10 hover:bg-white/5"
                    >
                        Browse More Questions
                    </Button>
                </div>
            </div>
        </div>
    )
}
