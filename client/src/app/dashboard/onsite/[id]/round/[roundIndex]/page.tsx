"use client"

import React, { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Editor } from "@monaco-editor/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Mic, MicOff, Video, VideoOff, PhoneOff,
    MessageSquare, Code2, Layout, Timer,
    ChevronRight, CheckCircle2, AlertCircle, Play, Loader2
} from "lucide-react"
import axios from "axios"

// Mock hook for speech-to-text (will implement properly later)
const useSpeechRecognition = () => {
    return {
        isListening: false,
        startListening: () => { },
        stopListening: () => { },
        transcript: ""
    }
}

export default function OnsiteRoundPage() {
    const params = useParams()
    const router = useRouter()
    const [loop, setLoop] = useState<any>(null)
    const [currentRound, setCurrentRound] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [elapsed, setElapsed] = useState(0)

    // UI State
    const [cameraOn, setCameraOn] = useState(true)
    const [micOn, setMicOn] = useState(true)
    const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([])
    const [processing, setProcessing] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [code, setCode] = useState("// Start coding here...")
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const handleSendMessage = async () => {
        if (!loop || !currentRound || processing) return
        setProcessing(true)

        // Mock user input for now (replace with STT later)
        const userInput = "I am ready to solve the problem."
        const newHistory: { role: 'ai' | 'user', text: string }[] = [...messages, { role: 'user', text: userInput }]
        setMessages(newHistory)

        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}")
            const res = await axios.post(`${process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000'}/onsite/chat`, {
                user_id: user._id,
                round_id: currentRound._id,
                company: loop.company,
                round_type: currentRound.type,
                history: newHistory.map(m => ({ role: m.role, content: m.text })),
                user_input: userInput,
                context: code
            })

            const aiResponse = res.data
            setMessages(prev => [...prev, { role: 'ai', text: aiResponse.text }])

            // Play Audio
            if (aiResponse.audio) {
                const audio = new Audio(`data:audio/mp3;base64,${aiResponse.audio}`)
                audioRef.current = audio
                audio.play()
            }

        } catch (err) {
            console.error("Error sending message:", err)
        } finally {
            setProcessing(false)
        }
    }

    const handleCompleteRound = async () => {
        if (!loop || !currentRound || submitting) return
        setSubmitting(true)

        try {
            // 1. Get deep evaluation from AI Service
            const evalRes = await axios.post(`${process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000'}/onsite/evaluate-round`, {
                user_id: loop.user,
                round_id: currentRound._id,
                company: loop.company,
                round_type: currentRound.type,
                history: messages.map(m => ({ role: m.role, content: m.text })),
                context: code
            })

            const { scores, feedback } = evalRes.data

            // 2. Submit results to backend
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/onsite/${params.id}/round/${currentRound._id}/complete`, {
                scores,
                feedback,
                transcript: messages.map(m => ({ role: m.role, text: m.text }))
            })

            // 3. Navigate back
            router.push(`/dashboard/onsite/${params.id}`)
        } catch (err) {
            console.error("Error completing round:", err)
            // Fallback for safety
            router.push(`/dashboard/onsite/${params.id}`)
        } finally {
            setSubmitting(false)
        }
    }

    useEffect(() => {
        const fetchLoop = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/onsite/${params.id}`)
                setLoop(res.data)
                const roundIdx = parseInt(params.roundIndex as string)
                if (res.data.rounds[roundIdx]) {
                    setCurrentRound(res.data.rounds[roundIdx])
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchLoop()
    }, [params.id, params.roundIndex])

    // Timer
    useEffect(() => {
        const interval = setInterval(() => setElapsed(e => e + 1), 1000)
        return () => clearInterval(interval)
    }, [])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (loading) return <div className="h-screen bg-slate-50 dark:bg-black flex items-center justify-center text-slate-900 dark:text-white">Loading Simulation...</div>
    if (!loop || !currentRound) return <div className="h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-10">Round not found</div>

    return (
        <div className="h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-white flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-6 bg-white/60 dark:bg-zinc-900/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10 px-3 py-1">
                        {loop.company} Onsite
                    </Badge>
                    <div className="h-6 w-px bg-white/10" />
                    <span className="font-bold text-slate-900 dark:text-zinc-100">{currentRound.roundName}</span>
                    <Badge variant="secondary" className="bg-zinc-800 text-slate-500 dark:text-zinc-400">
                        {currentRound.type === 'coding' ? 'Technical Assessment' : 'Interview'}
                    </Badge>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 font-mono text-lg bg-white dark:bg-black/40 px-3 py-1 rounded-md">
                        <Timer className="w-4 h-4 text-emerald-500" />
                        {formatTime(elapsed)}
                    </div>
                    <Button
                        variant="default"
                        className="gap-2 bg-primary text-black hover:bg-primary/90 font-black uppercase tracking-widest text-xs h-10 px-6 rounded-full shadow-[0_0_20px_rgba(var(--primary),0.2)]"
                        onClick={handleCompleteRound}
                        disabled={submitting}
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Complete Round</>}
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden">
                {/* Left Panel: Interaction */}
                <div className="w-[400px] border-r border-slate-200 dark:border-white/10 flex flex-col bg-white dark:bg-zinc-900/30">
                    {/* AI Avatar / Video Feed */}
                    <div className="aspect-video bg-white dark:bg-zinc-900 relative border-b border-slate-200 dark:border-white/10">
                        <div className="absolute inset-0 flex items-center justify-center">
                            {/* Placeholder for AI Avatar */}
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-3 animate-pulse">
                                    <Layout className="w-10 h-10 text-indigo-400" />
                                </div>
                                <p className="text-sm font-medium text-indigo-300">AI Interviewer Active</p>
                            </div>
                        </div>

                        {/* User Camera Overlay */}
                        <div className="absolute bottom-4 right-4 w-28 aspect-video bg-slate-50 dark:bg-black rounded-lg border border-slate-300 dark:border-white/20 overflow-hidden shadow-2xl">
                            {cameraOn ? (
                                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                    <Video className="w-4 h-4 text-zinc-500" />
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-red-900/20">
                                    <VideoOff className="w-4 h-4 text-red-500" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Conversation History */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="bg-zinc-800/50 p-3 rounded-lg rounded-tl-none border border-slate-100 dark:border-white/5 mr-8">
                            <p className="text-sm text-slate-600 dark:text-zinc-300">
                                Hello! Welcome to the {currentRound.roundName}. I'm your interviewer today.
                                {currentRound.type === 'coding' && " We'll be focusing on data structures and algorithms."}
                                Ready to begin?
                            </p>
                        </div>
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-lg text-sm ${m.role === 'user'
                                    ? 'bg-primary/20 text-primary-foreground rounded-tr-none border border-primary/20'
                                    : 'bg-zinc-800/50 text-slate-600 dark:text-zinc-300 rounded-tl-none border border-slate-100 dark:border-white/5'
                                    }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-white/60 dark:bg-zinc-900/50 backdrop-blur">
                        <div className="flex items-center justify-center gap-4">
                            <Button
                                variant={micOn ? "secondary" : "destructive"}
                                size="icon"
                                className="rounded-full w-12 h-12"
                                onClick={() => setMicOn(!micOn)}
                            >
                                {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                            </Button>
                            <Button
                                variant={cameraOn ? "secondary" : "destructive"}
                                size="icon"
                                className="rounded-full w-12 h-12"
                                onClick={() => setCameraOn(!cameraOn)}
                            >
                                {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                            </Button>
                            <Button
                                className="rounded-full px-6"
                                onClick={handleSendMessage}
                                disabled={processing}
                            >
                                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Response"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Workspace */}
                <div className="flex-1 bg-white dark:bg-[#1e1e1e] flex flex-col">
                    {currentRound.type === 'coding' ? (
                        <div className="flex-1 relative">
                            <div className="absolute top-0 left-0 right-0 h-10 bg-white dark:bg-[#252526] flex items-center px-4 border-b border-[#333] justify-between">
                                <span className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                                    <Code2 className="w-3 h-3" /> solution.js
                                </span>
                                <Button size="sm" className="h-6 text-xs bg-emerald-600 hover:bg-emerald-700">Run Code</Button>
                            </div>
                            <div className="pt-10 h-full">
                                <Editor
                                    height="100%"
                                    defaultLanguage="javascript"
                                    defaultValue="// Write your solution here..."
                                    theme="vs-dark"
                                    value={code}
                                    onChange={(val) => setCode(val || "")}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-zinc-500 bg-white dark:bg-zinc-900/20">
                            <div className="text-center">
                                <Layout className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <h3 className="text-xl font-bold mb-2">Discussion Round</h3>
                                <p className="max-w-md mx-auto">This round focuses on verbal communication and system design concepts. Use the whiteboard if needed.</p>
                                <Button variant="outline" className="mt-6">Open Whiteboard</Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
