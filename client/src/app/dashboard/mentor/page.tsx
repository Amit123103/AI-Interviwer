"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, Send, User, Sparkles, Code2, Briefcase, FileText, ChevronRight, Target, Flame, CalendarClock, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

const QUICK_PROMPTS = [
    { icon: FileText, label: "Review my resume for a Fullstack role" },
    { icon: Briefcase, label: "What should I prep for a Google interview?" },
    { icon: Code2, label: "Give me a daily System Design task" },
    { icon: Target, label: "How to negotiate a higher salary step?" }
]

const DAILY_TASKS = [
    { label: "Complete 1 Graph problem", done: true },
    { label: "Review React DOM diffing", done: false },
    { label: "Read 1 System Design chapter", done: false }
]

type Message = {
    id: string
    role: "user" | "mentor"
    content: string
}

export default function MentorPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "mentor",
            content: "Welcome back! I'm your dedicated AI Career Mentor. I noticed you've been working hard on your frontend skills lately. How can we accelerate your path to a senior role today?"
        }
    ])
    const [inputValue, setInputValue] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    const handleSend = async (text: string) => {
        if (!text.trim()) return

        const newUserMsg: Message = { id: Date.now().toString(), role: "user", content: text }
        setMessages(prev => [...prev, newUserMsg])
        setInputValue("")
        setIsTyping(true)

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
            const res = await fetch(`${apiUrl}/api/mentor/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, newUserMsg], userId: localStorage.getItem('userId') || '' })
            })

            if (!res.ok) throw new Error("Chat failed")

            const data = await res.json()
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "mentor",
                content: data.reply
            }])
        } catch (error) {
            console.error(error)
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "mentor",
                content: "I'm having a little trouble connecting right now, but I'm here to support your career growth. Could you repeat that?"
            }])
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col pt-16 md:pt-20">
            {/* Header / Nav */}
            <div className="border-b border-slate-100 dark:border-white/5 bg-white dark:bg-zinc-950/50 backdrop-blur-xl shrink-0 z-10 sticky top-16 md:top-20">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-zinc-500 hover:text-slate-900 dark:text-white transition-colors">
                            Dashboard
                        </Link>
                        <ChevronRight className="w-4 h-4 text-zinc-700" />
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <Bot className="w-4 h-4 text-blue-400" />
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">AI Career Mentor</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest hidden sm:flex">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 h-[calc(100vh-8rem)]">

                {/* Left Panel: The Chat Interface */}
                <div className="lg:col-span-8 flex flex-col bg-white dark:bg-zinc-900/40 border border-slate-100 dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
                    {/* Background glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

                    {/* Chat History */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 custom-scrollbar">
                        <AnimatePresence initial={false}>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                                >
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.role === "user"
                                        ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                                        : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                        }`}>
                                        {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>

                                    {/* Bubble */}
                                    <div className={`max-w-[75%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${msg.role === "user"
                                        ? "bg-indigo-500 text-slate-900 dark:text-white rounded-tr-sm shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                                        : "bg-white/5 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-white/10 rounded-tl-sm shadow-xl"
                                        }`}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-4"
                                >
                                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl rounded-tl-sm px-5 py-4 flex flex-col gap-2 min-w-[120px]">
                                        <div className="flex gap-1">
                                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1" />
                                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1" />
                                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-zinc-950/80 backdrop-blur-md border-t border-slate-100 dark:border-white/5 relative z-10">
                        {/* Quick Prompts */}
                        {messages.length === 1 && (
                            <div className="flex overflow-x-auto gap-2 mb-4 pb-2 custom-scrollbar mask-gradient-right">
                                {QUICK_PROMPTS.map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(prompt.label)}
                                        className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white hover:bg-white/10 transition-colors whitespace-nowrap"
                                    >
                                        <prompt.icon className="w-3.5 h-3.5" />
                                        {prompt.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleSend(inputValue)
                            }}
                            className="relative flex items-center group"
                        >
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask about resume, interviews, or career growth..."
                                className="w-full bg-white/5 border-slate-200 dark:border-white/10 h-14 pl-6 pr-14 text-sm rounded-2xl focus-visible:ring-1 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 shadow-inner group-hover:bg-white/[0.07] transition-colors"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!inputValue.trim() || isTyping}
                                className="absolute right-2 h-10 w-10 bg-blue-500 hover:bg-blue-400 text-slate-900 dark:text-white rounded-xl disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Right Panel: Progress & Tasks Dashboard */}
                <div className="lg:col-span-4 hidden lg:flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">

                    {/* Goal Card */}
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/20 rounded-full blur-[30px] group-hover:bg-indigo-400/30 transition-colors" />
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <Target className="w-5 h-5 text-indigo-400" />
                            <h3 className="font-semibold text-slate-900 dark:text-white">Current Target</h3>
                        </div>
                        <div className="text-2xl font-bold mb-1 relative z-10">Senior SDE</div>
                        <div className="text-sm text-slate-500 dark:text-zinc-400 mb-4 relative z-10">Google / Microsoft Track</div>

                        <div className="space-y-1.5 relative z-10">
                            <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                <span>Readiness</span>
                                <span className="text-indigo-400">68%</span>
                            </div>
                            <div className="h-1.5 bg-white dark:bg-zinc-950 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[68%] rounded-full relative">
                                    <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Daily Tasks */}
                    <div className="bg-white dark:bg-zinc-900/40 border border-slate-100 dark:border-white/5 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
                                    <Flame className="w-4 h-4" />
                                </div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Daily Setup</h3>
                            </div>
                            <span className="text-xs font-medium text-orange-400">1 of 3</span>
                        </div>

                        <div className="space-y-3">
                            {DAILY_TASKS.map((task, i) => (
                                <div key={i} className={`flex items-start gap-3 p-3 rounded-2xl border transition-colors ${task.done
                                    ? "bg-emerald-500/5 border-emerald-500/10 opacity-70"
                                    : "bg-white/[0.02] border-slate-100 dark:border-white/5 hover:bg-white/[0.04]"
                                    }`}>
                                    <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${task.done ? "bg-emerald-500 border-emerald-500" : "border-zinc-600"
                                        }`}>
                                        {task.done && <Sparkles className="w-2.5 h-2.5 text-zinc-950" />}
                                    </div>
                                    <span className={`text-sm ${task.done ? "text-zinc-500 line-through" : "text-slate-600 dark:text-zinc-300"}`}>
                                        {task.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <Button className="w-full mt-6 bg-white/5 hover:bg-white/10 text-slate-600 dark:text-zinc-300 border border-slate-100 dark:border-white/5">
                            Auto-Generate New Tasks
                        </Button>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-zinc-900/40 border border-slate-100 dark:border-white/5 rounded-3xl p-5 flex flex-col items-center justify-center text-center">
                            <CalendarClock className="w-6 h-6 text-blue-400 mb-2" />
                            <div className="text-2xl font-bold">14</div>
                            <div className="text-[10px] uppercase tracking-widest text-zinc-500">Days Active</div>
                        </div>
                        <div className="bg-white dark:bg-zinc-900/40 border border-slate-100 dark:border-white/5 rounded-3xl p-5 flex flex-col items-center justify-center text-center">
                            <Trophy className="w-6 h-6 text-amber-400 mb-2" />
                            <div className="text-2xl font-bold">Lvl 4</div>
                            <div className="text-[10px] uppercase tracking-widest text-zinc-500">Coach Tier</div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}
