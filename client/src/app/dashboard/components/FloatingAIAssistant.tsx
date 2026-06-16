"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, X, Send, User, Sparkles, MessageSquare, Briefcase, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
    id: string
    role: "user" | "mentor"
    content: string
}

export default function FloatingAIAssistant() {
    const [isOpen, setIsOpen] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [tempApiKey, setTempApiKey] = useState("")
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", role: "mentor", content: "Hi! I'm Sarah, your Career Mentor. Need help with a technical concept or career strategy today?" }
    ])
    const [inputValue, setInputValue] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Load existing key if any
        const savedKey = localStorage.getItem("sarah_nvidia_key")
        if (savedKey) setTempApiKey(savedKey)
    }, [])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const saveApiKey = () => {
        if (tempApiKey.trim()) {
            localStorage.setItem("sarah_nvidia_key", tempApiKey.trim())
            setShowSettings(false)
        }
    }

    const getEngineLabel = () => {
        const key = localStorage.getItem("sarah_nvidia_key") || ""
        if (key.startsWith("nvapi-")) return "NVIDIA QWEN-3 CODER"
        if (key.startsWith("mistral-")) return "MISTRAL AI TACTICAL"
        if (key.startsWith("sk-")) return "OPENAI NEURAL CORE"
        return "QWEN-3 CODER POWERED"
    }

    const handleSend = async () => {
        if (!inputValue.trim()) return
        
        const userMsg: Message = { id: Date.now().toString(), role: "user", content: inputValue }
        setMessages(prev => [...prev, userMsg])
        setInputValue("")
        setIsTyping(true)

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
            const savedKey = localStorage.getItem("sarah_nvidia_key")
            
            const res = await fetch(`${apiUrl}/api/mentor/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    messages: [...messages, userMsg],
                    userId: localStorage.getItem("userId") || "",
                    apiKey: savedKey || undefined
                })
            })
            
            const data = await res.json()
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "mentor", content: data.reply }])
        } catch (error) {
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "mentor", content: "I encountered a minor logic glitch. Ask me anything else!" }])
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-[60]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: "bottom right" }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="mb-4 w-[380px] h-[520px] bg-white dark:bg-zinc-900/90 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
                    >
                        {/* Premium Neural Glow */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.05),transparent)] opacity-50" />

                        {/* Header */}
                        <div className="p-5 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center text-slate-900 dark:text-white shadow-lg shadow-indigo-500/20 relative group">
                                    <Bot className="w-5 h-5" />
                                    <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Sarah AI</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{getEngineLabel()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => setShowSettings(!showSettings)} 
                                    className={`h-9 w-9 rounded-xl border transition-all duration-300 ${
                                        showSettings 
                                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-inner" 
                                        : "hover:bg-zinc-100 dark:hover:bg-white/5 border-transparent"
                                    }`}
                                >
                                    <Zap className={`w-4 h-4 ${showSettings ? "fill-current animate-pulse" : "text-slate-900 dark:text-zinc-400 group-hover:text-amber-500"}`} />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => setIsOpen(false)} 
                                    className="h-9 w-9 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 border border-transparent"
                                >
                                    <X className="w-4 h-4 text-slate-900 dark:text-zinc-400" />
                                </Button>
                            </div>
                        </div>

                        {/* Chat Area / Settings Area */}
                        <div className="flex-1 relative overflow-hidden flex flex-col">
                            <AnimatePresence>
                                {showSettings && (
                                    <motion.div 
                                        initial={{ x: "100%" }}
                                        animate={{ x: 0 }}
                                        exit={{ x: "100%" }}
                                        className="absolute inset-0 z-50 bg-white dark:bg-zinc-900 p-6 flex flex-col space-y-6"
                                    >
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Sarah AI Tactical Configuration
                                            </h4>
                                            <p className="text-xs text-zinc-500 leading-relaxed">
                                                 Sarah is now optimized for **Qwen-3 Coder (480B)**. Enter your **NVIDIA** or **Mistral** API key below to unlock her full strategic reasoning and coding potential.
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-zinc-400">Mistral or NVIDIA API Key</label>
                                            <Input 
                                                type="password"
                                                value={tempApiKey}
                                                onChange={(e) => setTempApiKey(e.target.value)}
                                                placeholder="mistral-... or nvapi-..."
                                                className="h-12 bg-zinc-50 dark:bg-black border-zinc-200 dark:border-white/10 rounded-xl font-mono text-xs"
                                            />
                                        </div>

                                        <div className="pt-2">
                                            <Button 
                                                onClick={saveApiKey}
                                                className="w-full h-12 bg-indigo-500 hover:bg-indigo-400 text-slate-900 dark:text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20"
                                            >
                                                Save Strategy Configuration
                                            </Button>
                                            <Button 
                                                variant="ghost"
                                                onClick={() => setShowSettings(false)}
                                                className="w-full h-10 mt-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-slate-900 dark:text-white text-xs"
                                            >
                                                Discard Changes
                                            </Button>
                                        </div>

                                        <div className="mt-auto p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                                            <p className="text-[10px] text-indigo-400 leading-tight">
                                                Note: Sarah is currently utilizing **Qwen-3 Coder 480B** via NVIDIA NIM for maximum technical accuracy.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.03),transparent)]">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                                        <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center border ${
                                            msg.role === "user" ? "bg-indigo-500 text-slate-900 dark:text-white border-indigo-400" : "bg-zinc-100 dark:bg-white/5 text-indigo-400 border-zinc-200 dark:border-white/10"
                                        }`}>
                                            {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                                        </div>
                                        <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                            msg.role === "user" ? "bg-indigo-500 text-slate-900 dark:text-white rounded-tr-none" : "bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-white/5 text-zinc-700 dark:text-zinc-200 rounded-tl-none"
                                        }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-white/5 text-indigo-400 border border-zinc-200 dark:border-white/10 flex items-center justify-center">
                                            <Bot className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-white/5 rounded-2xl rounded-tl-none flex gap-1 items-center">
                                            <div className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce" />
                                            <div className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                                            <div className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-950/50">
                            <div className="flex gap-2">
                                <Input 
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    placeholder="Ask Sarah anything..."
                                    className="h-11 rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 focus-visible:ring-indigo-500"
                                />
                                <Button onClick={handleSend} disabled={!inputValue.trim() || isTyping} className="h-11 w-11 shrink-0 rounded-xl bg-indigo-500 hover:bg-indigo-400">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center relative overflow-hidden transition-colors ${
                    isOpen ? "bg-white dark:bg-zinc-900 dark:bg-white text-slate-900 dark:text-white dark:text-zinc-900" : "bg-indigo-500 text-slate-900 dark:text-white"
                }`}
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                {isOpen ? <X className="w-6 h-6" /> : (
                    <div className="relative">
                        <MessageSquare className="w-6 h-6" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-indigo-500 rounded-full" />
                    </div>
                )}
            </motion.button>
        </div>
    )
}
