"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Code2, Brain, BarChart3, Users, Zap,
    ChevronRight, ArrowLeft, Play, Globe,
    Smartphone, Database, Shield, Layout,
    Timer, Target, Mic2, MessageSquare
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import AIAvatar from "@/components/AIAvatar"

const ROLES = [
    { id: 'software-eng', name: 'Software Engineer', icon: Code2, desc: 'Full-stack, Frontend, or Backend roles', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'ai-data', name: 'AI & Data Science', icon: Brain, desc: 'ML, Data Engineering, & Analytics', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'product', name: 'Product Manager', icon: BarChart3, desc: 'Strategy, Execution, & Design', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'hr-behavioral', name: 'HR & Behavioral', icon: Users, desc: 'Soft skills & culture fit', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'mobile', name: 'Mobile Developer', icon: Smartphone, desc: 'iOS, Android & Cross-platform', color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { id: 'devops', name: 'DevOps & Cloud', icon: Globe, desc: 'Infrastructure & SRE', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { id: 'cybersecurity', name: 'Cybersecurity', icon: Shield, desc: 'Security & Penetration Testing', color: 'text-red-500', bg: 'bg-red-500/10' },
    { id: 'uiux', name: 'UI/UX Designer', icon: Layout, desc: 'User experience & interface design', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
]

const DIFFICULTIES = [
    { id: 'Easy', name: 'Starter', desc: 'Focus on fundamentals & soft skills' },
    { id: 'Intermediate', name: 'Professional', desc: 'Industry standard technical depth' },
    { id: 'Hard', name: 'Expert', desc: 'Deep technical & architecture focus' },
]

const MODES = [
    { id: 'voice', name: 'Voice Mode', icon: Mic2, desc: 'Talk to our AI Interviewer naturally' },
    { id: 'text', name: 'Text Mode', icon: MessageSquare, desc: 'Type your answers' },
]

export default function InstantInterviewPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [config, setConfig] = useState({
        role: '',
        difficulty: 'Intermediate',
        mode: 'voice',
        questionCount: 5,
    })
    const [isLaunching, setIsLaunching] = useState(false)

    const handleBack = () => {
        if (step > 1) setStep(step - 1)
        else router.back()
    }

    const handleNext = () => {
        if (step < 3) setStep(step + 1)
        else startInterview()
    }

    const startInterview = () => {
        setIsLaunching(true)

        // Mocking setup sequence
        const selectedRole = ROLES.find(r => r.id === config.role)?.name || 'General'

        // Store config for the interview page
        localStorage.setItem("interview_sector", selectedRole)
        localStorage.setItem("interview_difficulty", config.difficulty)
        localStorage.setItem("interview_mode", config.mode)
        localStorage.setItem("interview_count", config.questionCount.toString())
        localStorage.setItem("interview_type", config.role === 'hr-behavioral' ? 'HR & Behavioral' : 'Technical')
        localStorage.setItem("interview_persona", "AI Interviewer (Senior Recruiter)")
        localStorage.setItem("interview_language", "English")

        // Remove old questions to trigger fresh generation
        localStorage.removeItem("interview_questions")
        localStorage.removeItem("current_interview_id")

        // Bypassing setup page hardware checks (will handle in interview page)
        setTimeout(() => {
            router.push("/dashboard/interview/setup")
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary/30">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Header */}
            <header className="relative z-10 p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
                <Button
                    variant="ghost"
                    className="gap-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full px-4"
                    onClick={handleBack}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>

                <div className="flex items-center gap-1">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? 'w-8 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]' :
                                step > i ? 'w-4 bg-primary/40' : 'w-4 bg-zinc-800'
                                }`}
                        />
                    ))}
                </div>

                <div className="w-24" /> {/* Spacer */}
            </header>

            <main className="relative z-10 max-w-5xl mx-auto px-6 py-10 md:py-20">
                <AnimatePresence mode="wait">
                    {isLaunching ? (
                        <motion.div
                            key="launching"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center space-y-8 py-20"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                                <AIAvatar isSpeaking={false} className="relative w-32 h-32" />
                            </div>
                            <div className="text-center space-y-4">
                                <h2 className="text-3xl font-bold tracking-tight">Preparing your session...</h2>
                                <p className="text-zinc-400 max-w-md">Our AI is gathering technical challenges for the {ROLES.find(r => r.id === config.role)?.name} role.</p>
                                <div className="flex gap-1 justify-center mt-6">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                </div>
                            </div>
                        </motion.div>
                    ) : step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-10"
                        >
                            <div className="text-center space-y-4 max-w-2xl mx-auto">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-widest mb-2">
                                    <Zap className="w-3 h-3 fill-current" />
                                    Instant Interview
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Choose your specialized path</h1>
                                <p className="text-zinc-400 text-lg">Select the role you're targeting. Our AI will adapt the questions to your specific field.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {ROLES.map((role) => (
                                    <Card
                                        key={role.id}
                                        className={`group cursor-pointer transition-all duration-300 border rounded-2xl overflow-hidden h-full ${config.role === role.id ? 'bg-white/10 border-primary ring-1 ring-primary shadow-[0_0_30px_rgba(var(--primary),0.1)]' :
                                            'bg-zinc-900/50 border-white/5 hover:bg-white/5 hover:border-white/10'
                                            }`}
                                        onClick={() => setConfig({ ...config, role: role.id })}
                                    >
                                        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${role.bg}`}>
                                                <role.icon className={`w-6 h-6 ${role.color}`} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{role.name}</h3>
                                                <p className="text-xs text-zinc-500 mt-1">{role.desc}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div className="flex justify-center pt-6">
                                <Button
                                    size="lg"
                                    className="bg-primary text-white hover:bg-primary/90 rounded-full px-10 font-bold h-14 text-lg shadow-xl shadow-primary/20 group"
                                    disabled={!config.role}
                                    onClick={handleNext}
                                >
                                    Select Difficulty
                                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </motion.div>
                    ) : step === 2 ? (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-4xl mx-auto space-y-12"
                        >
                            <div className="text-center space-y-4">
                                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Set the challenge level</h2>
                                <p className="text-zinc-400">Higher difficulty means more complex scenarios and deeper technical follow-ups.</p>
                            </div>

                            <div className="space-y-10">
                                {/* Difficulty selection */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {DIFFICULTIES.map((diff) => (
                                        <div
                                            key={diff.id}
                                            className={`relative group cursor-pointer transition-all duration-300 p-8 rounded-3xl border ${config.difficulty === diff.id ? 'bg-zinc-900 border-primary ring-1 ring-primary' :
                                                'bg-zinc-950 border-white/5 hover:border-white/20'
                                                }`}
                                            onClick={() => setConfig({ ...config, difficulty: diff.id })}
                                        >
                                            <div className="flex flex-col space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="text-xl font-bold">{diff.name}</h3>
                                                    {config.difficulty === diff.id && (
                                                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                                            <Zap className="w-3 h-3 text-white fill-current" />
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-sm text-zinc-500">{diff.desc}</p>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3].map((i) => (
                                                        <div key={i} className={`h-1 w-8 rounded-full ${diff.id === 'Easy' ? (i === 1 ? 'bg-green-500' : 'bg-zinc-800') :
                                                            diff.id === 'Intermediate' ? (i <= 2 ? 'bg-amber-500' : 'bg-zinc-800') :
                                                                'bg-red-500'
                                                            }`} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Question Count */}
                                <div className="bg-zinc-900/50 rounded-3xl p-8 border border-white/5 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                                                <Timer className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold">Interview Duration</h3>
                                                <p className="text-xs text-zinc-500">How many questions should the AI ask?</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 bg-black rounded-full p-1.5 border border-white/10">
                                            {[5, 10, 15].map((num) => (
                                                <button
                                                    key={num}
                                                    onClick={() => setConfig({ ...config, questionCount: num })}
                                                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${config.questionCount === num ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                                                        }`}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center pt-4">
                                <Button
                                    size="lg"
                                    className="bg-primary text-white hover:bg-primary/90 rounded-full px-10 font-bold h-14 text-lg"
                                    onClick={handleNext}
                                >
                                    Select Interview Mode
                                    <ChevronRight className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-4xl mx-auto space-y-12"
                        >
                            <div className="text-center space-y-4">
                                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Choose your interaction</h2>
                                <p className="text-zinc-400">Our AI can interact with you via voice for maximum realism, or text for quiet environments.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {MODES.map((mode) => (
                                    <div
                                        key={mode.id}
                                        className={`relative cursor-pointer transition-all duration-500 group rounded-[2.5rem] overflow-hidden ${config.mode === mode.id ? 'ring-2 ring-primary shadow-[0_20px_50px_rgba(var(--primary),0.15)]' : 'opacity-70 grayscale hover:grayscale-0 hover:opacity-100'
                                            }`}
                                        onClick={() => setConfig({ ...config, mode: mode.id })}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br transition-opacity ${mode.id === 'voice' ? 'from-primary/20 to-purple-500/20' : 'from-blue-500/20 to-cyan-500/20'
                                            } ${config.mode === mode.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

                                        <div className="relative bg-zinc-950/80 backdrop-blur-xl p-10 h-full border border-white/5 flex flex-col items-center text-center space-y-6">
                                            <div className={`p-5 rounded-3xl ${mode.id === 'voice' ? 'bg-primary/20 text-primary shadow-[0_0_20px_rgba(var(--primary),0.3)]' : 'bg-blue-500/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                                                }`}>
                                                <mode.icon className="w-10 h-10" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-bold tracking-tight">{mode.name}</h3>
                                                <p className="text-zinc-500 leading-relaxed px-4">{mode.desc}</p>
                                            </div>

                                            {config.mode === mode.id && (
                                                <motion.div
                                                    layoutId="mode-check"
                                                    className="mt-2 bg-white text-black px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest"
                                                >
                                                    Active
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col items-center gap-6 pt-10">
                                <Button
                                    size="lg"
                                    className="bg-primary text-white hover:bg-primary/90 rounded-full px-16 font-bold h-16 text-xl shadow-2xl shadow-primary/30 group relative overflow-hidden"
                                    onClick={startInterview}
                                >
                                    <span className="relative z-10 flex items-center">
                                        Launch Instant Interview
                                        <Play className="w-6 h-6 ml-3 fill-current" />
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                </Button>
                                <p className="text-zinc-500 text-sm flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    AI Core is ready. No resume required.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}
