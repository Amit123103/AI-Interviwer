"use client"

import React, { useState, useRef, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Upload, CheckCircle, Video, Mic, Settings, ArrowRight, ArrowLeft,
    Loader2, User, Briefcase, GraduationCap, Code2, Heart, Layers,
    Play, Wifi, WifiOff, Sun, Moon, Brain, Sparkles, Building2, Target,
    AlertCircle
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import axios from "axios"
import CompanyGallery from "@/components/CompanyGallery"
import { COMPANIES } from "@/lib/companies"
import { Search, ChevronDown } from "lucide-react"
import MeshBackground from "../../dashboard/components/MeshBackground"
import HolographicHud from "@/components/ui/HolographicHud"
import TiltCard from "@/components/ui/TiltCard"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

const STEPS = [
    { id: 1, name: "Details", icon: User },
    { id: 2, name: "Type", icon: Layers },
    { id: 3, name: "Checks", icon: Video },
    { id: 4, name: "Config", icon: Settings },
]

const INTERVIEW_TYPES = [
    { id: 'Technical', icon: Code2, desc: 'Algorithms, system design, data structures', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30', glow: 'shadow-[0_0_30px_rgba(6,182,212,0.15)]' },
    { id: 'HR', icon: Heart, desc: 'Behavioral, STAR method, culture fit', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30', glow: 'shadow-[0_0_30px_rgba(251,113,133,0.15)]' },
    { id: 'Friendly', icon: Sparkles, desc: 'Conversational and soft skills', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', glow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]' },
    { id: 'Mixed', icon: Layers, desc: 'Balanced technical & behavioral questions', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/30', glow: 'shadow-[0_0_30px_rgba(139,92,246,0.15)]' },
] as const

function InterviewSetupContent() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [cvText, setCvText] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([])

    const [formData, setFormData] = useState({
        fullName: "",
        course: "",
        department: "",
        targetCompany: "",
        jobDescription: "",
        questionCount: "5",
        difficulty: "Medium",
        interviewType: "Mixed" as 'Technical' | 'HR' | 'Friendly' | 'Mixed',
        voice: "Female",
        language: "English",
        persona: "Friendly Mentor"
    })

    const [deviceStatus, setDeviceStatus] = useState({ camera: false, mic: false, internet: true, face: false })
    const [micLevel, setMicLevel] = useState(0)
    const [permissionError, setPermissionError] = useState<string | null>(null)
    const micAnalyserRef = useRef<AnalyserNode | null>(null)
    const micRafRef = useRef<number | null>(null)

    const searchParams = useSearchParams()

    useEffect(() => {
        const saved = localStorage.getItem("user")
        if (!saved) { router.push("/auth/login"); return }

        const userData = JSON.parse(saved)
        setFormData(prev => ({ ...prev, fullName: userData.username || "" }))

        const onsiteId = searchParams.get('onsiteId')
        const company = searchParams.get('company')
        if (company) setFormData(prev => ({ ...prev, targetCompany: company }))
    }, [router, searchParams])

    const handleFileChange = async (f: File | null) => {
        setFile(f)
        if (!f) return
        // Optional: Pre-parse for UI feedback if needed, but we'll do main processing later
    }

    const processStep1 = async () => {
        if (!formData.fullName || !formData.course || !formData.department || !formData.targetCompany || !file) return

        setIsProcessing(true)
        const fd = new FormData()
        fd.append('resume', file)

        try {
            // Parse resume to get text for context
            const res = await axios.post(`${API_URL}/api/resume/parse`, fd)
            setCvText(res.data.text || res.data.rawText || "")
            setCurrentStep(2)
        } catch (err) {
            console.error("Resume processing failed", err)
            // Fallback: Proceed with basic details
            setCurrentStep(2)
        } finally {
            setIsProcessing(false)
        }
    }

    const generateQuestions = async () => {
        setIsProcessing(true)
        try {
            const res = await axios.post(`${API_URL}/api/interview/build-context`, {
                studentName: formData.fullName,
                course: formData.course,
                department: formData.department,
                dreamCompany: formData.targetCompany,
                jobRole: "Candidate",
                interviewType: formData.interviewType,
                difficulty: formData.difficulty,
                persona: formData.persona,
                cvText,
                jobDescription: formData.jobDescription,
                questionCount: parseInt(formData.questionCount)
            })
            setGeneratedQuestions(res.data.questions || [])
            localStorage.setItem("interview_questions", JSON.stringify(res.data.questions))
            localStorage.setItem("interview_context", JSON.stringify(res.data.context))
            // Streamlined: Skip review and go straight to Device Checks (Step 3)
            setCurrentStep(3)
        } catch (err) {
            console.error("Question generation failed", err)
            // Even if generation fails, allow proceeding — server will generate questions
            setCurrentStep(3)
        } finally {
            setIsProcessing(false)
        }
    }

    const startInterview = () => {
        // Save final settings
        localStorage.setItem("interview_fullName", formData.fullName)
        localStorage.setItem("interview_course", formData.course)
        localStorage.setItem("interview_department", formData.department)
        localStorage.setItem("interview_voice", formData.voice)
        localStorage.setItem("interview_language", formData.language)
        localStorage.setItem("interview_count", formData.questionCount)
        localStorage.setItem("interview_difficulty", formData.difficulty)
        localStorage.setItem("interview_type", formData.interviewType)
        localStorage.setItem("interview_target_company", formData.targetCompany)
        localStorage.setItem("interview_job_description", formData.jobDescription)
        localStorage.setItem("interview_persona", formData.persona)
        localStorage.setItem("interview_sector", formData.interviewType)

        router.push("/interview?autoStart=true")
    }

    const [systemStatus, setSystemStatus] = useState({ ai: true, ollama: true })

    const startDeviceCheck = async () => {
        setPermissionError(null)
        let videoStream: MediaStream | null = null
        let audioStream: MediaStream | null = null

        try {
            // First attempt: Both
            const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            setStream(s)
            if (videoRef.current) videoRef.current.srcObject = s
            setDeviceStatus(prev => ({ ...prev, camera: true, mic: true, face: true }))
            setupMicAnalysis(s)
        } catch (err: any) {
            console.warn("Full device acquisition failed, trying partial...", err)
            
            // Try Audio Only
            try {
                audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
                setStream(audioStream)
                setDeviceStatus(prev => ({ ...prev, mic: true, camera: false }))
                setupMicAnalysis(audioStream)
                setPermissionError("Note: Camera not found or blocked. You can proceed with voice-only.")
            } catch (audioErr) {
                console.error("Audio acquisition failed", audioErr)
                setDeviceStatus(prev => ({ ...prev, mic: false }))
                setPermissionError("Microphone not found or blocked. Please ensure you have a working mic.")
            }

            // Try Video Only (if just to see if it works)
            try {
                videoStream = await navigator.mediaDevices.getUserMedia({ video: true })
                if (videoRef.current) videoRef.current.srcObject = videoStream
                setDeviceStatus(prev => ({ ...prev, camera: true }))
            } catch (videoErr) {
                setDeviceStatus(prev => ({ ...prev, camera: false }))
            }
        }
    }

    const setupMicAnalysis = (s: MediaStream) => {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const source = audioCtx.createMediaStreamSource(s)
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 256
        source.connect(analyser)
        micAnalyserRef.current = analyser

        const checkMic = () => {
            const data = new Uint8Array(analyser.frequencyBinCount)
            analyser.getByteFrequencyData(data)
            const avg = data.reduce((a, b) => a + b) / data.length
            setMicLevel(avg)
            micRafRef.current = requestAnimationFrame(checkMic)
        }
        checkMic()
    }

    const stopStream = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
            setStream(null)
        }
        if (micRafRef.current) cancelAnimationFrame(micRafRef.current)
    }

    const stepIndicator = (
        <div className="w-full max-w-4xl mb-16 relative z-10 px-4">
            <div className="flex justify-between relative">
                {/* Background Line */}
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -z-10 -translate-y-1/2 rounded-full" />

                {/* Active Progress Line — Rainbow Gradient */}
                <motion.div
                    className="absolute top-1/2 left-0 h-[2px] -z-10 -translate-y-1/2 rounded-full"
                    style={{
                        background: 'linear-gradient(90deg, #8b5cf6, #3b82f6, #06b6d4, #10b981)',
                        boxShadow: '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2)'
                    }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                />

                {STEPS.map(step => {
                    const Icon = step.icon
                    const active = currentStep >= step.id
                    const isCurrent = currentStep === step.id

                    return (
                        <div key={step.id} className="flex flex-col items-center group">
                            <motion.div
                                className={`
                                    relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-700
                                    ${active ? 'bg-gradient-to-br from-violet-500 to-cyan-500 text-white scale-110' : 'bg-white/5 text-zinc-600 border border-white/10'}
                                    ${isCurrent ? 'shadow-[0_0_30px_rgba(139,92,246,0.4),0_0_60px_rgba(6,182,212,0.2)] ring-2 ring-violet-500/30' : ''}
                                `}
                                animate={isCurrent ? { scale: [1.1, 1.15, 1.1] } : {}}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                {isCurrent && (
                                    <div className="absolute inset-0 rounded-xl animate-ping opacity-20 bg-gradient-to-br from-violet-500 to-cyan-500" />
                                )}
                                <Icon className={`w-5 h-5 transition-transform duration-500 ${isCurrent ? 'scale-110' : ''}`} />

                                {/* Label */}
                                <div className={`absolute -bottom-8 whitespace-nowrap text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${active ? 'bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent opacity-100' : 'text-zinc-600 opacity-0'}`}>
                                    {step.name}
                                </div>
                            </motion.div>
                        </div>
                    )
                })}
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-transparent text-white p-6 md:p-12 flex flex-col items-center relative overflow-hidden aurora-glow">
            <MeshBackground />
            <HolographicHud />

            {/* Floating ambient orbs */}
            <div className="absolute top-20 left-20 w-96 h-96 bg-violet-500/6 rounded-full blur-[150px] orb-float pointer-events-none" />
            <div className="absolute top-[50%] right-10 w-80 h-80 bg-cyan-500/5 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />
            <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-fuchsia-500/4 rounded-full blur-[130px] orb-float pointer-events-none" style={{ animationDelay: '5s' }} />

            {stepIndicator}

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.05, y: -20 }}
                    transition={{ type: "spring", damping: 20, stiffness: 100 }}
                    className="w-full max-w-3xl"
                >
                    {/* ── SCREEN 1: DETAILS COLLECTION ────────────────────── */}
                    {currentStep === 1 && (
                        <TiltCard>
                            <Card className="bg-zinc-900/50 border-white/10 backdrop-blur-2xl overflow-hidden rounded-[2rem] relative group hover:border-violet-500/20 transition-all duration-500 hover:shadow-[0_0_60px_rgba(139,92,246,0.08)]">
                                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                                    <User size={120} />
                                </div>
                                {isProcessing && (
                                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-6">
                                        <div className="relative">
                                            <div className="w-20 h-20 border-4 border-violet-500/20 border-t-cyan-400 rounded-full animate-spin" />
                                            <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-b-fuchsia-400/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                                            <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-8 h-8" />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-xl font-bold mb-2">Analyzing Your Profile</h3>
                                            <p className="text-zinc-400 text-sm animate-pulse">De-constructing resume & building context...</p>
                                        </div>
                                    </div>
                                )}
                                <CardHeader className="pb-8">
                                    <CardTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/10">
                                            <User className="text-violet-400 w-6 h-6" />
                                        </div>
                                        <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">Welcome</span>, Let's Get Started
                                    </CardTitle>
                                    <CardDescription className="text-zinc-400 text-base">
                                        Fill in your details to create a 100% personalized interview experience.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-zinc-400 uppercase text-[10px] font-black tracking-widest">Full Name</Label>
                                            <Input className="bg-white/5 border-white/10 h-12 focus:border-primary/50 transition-all rounded-xl"
                                                placeholder="John Doe"
                                                value={formData.fullName}
                                                onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-400 uppercase text-[10px] font-black tracking-widest">Target Company</Label>
                                            <Input className="bg-white/5 border-white/10 h-12 focus:border-primary/50 transition-all rounded-xl"
                                                placeholder="e.g. Google, Amazon"
                                                value={formData.targetCompany}
                                                onChange={e => setFormData({ ...formData, targetCompany: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-400 uppercase text-[10px] font-black tracking-widest">Course Name</Label>
                                            <Input className="bg-white/5 border-white/10 h-12 focus:border-primary/50 transition-all rounded-xl"
                                                placeholder="e.g. B.Tech Computer Science"
                                                value={formData.course}
                                                onChange={e => setFormData({ ...formData, course: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-400 uppercase text-[10px] font-black tracking-widest">Department</Label>
                                            <Input className="bg-white/5 border-white/10 h-12 focus:border-primary/50 transition-all rounded-xl"
                                                placeholder="e.g. Engineering"
                                                value={formData.department}
                                                onChange={e => setFormData({ ...formData, department: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-zinc-400 uppercase text-[10px] font-black tracking-widest">No. of Questions</Label>
                                            <div className="flex gap-2">
                                                {['3', '5', '10'].map(n => (
                                                    <button key={n} onClick={() => setFormData({ ...formData, questionCount: n })}
                                                        className={`flex-1 h-10 rounded-xl border text-sm font-bold transition-all duration-300 ${formData.questionCount === n ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white border-transparent shadow-lg shadow-violet-500/20' : 'bg-white/5 border-white/10 text-zinc-500 hover:border-violet-500/30 hover:bg-white/10'}`}>
                                                        {n}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-400 uppercase text-[10px] font-black tracking-widest">Difficulty</Label>
                                            <div className="flex gap-2">
                                                {['Easy', 'Medium', 'Hard'].map(d => (
                                                    <button key={d} onClick={() => setFormData({ ...formData, difficulty: d })}
                                                        className={`flex-1 h-10 rounded-xl border text-sm font-bold transition-all duration-300 ${formData.difficulty === d ? (d === 'Easy' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent shadow-lg shadow-emerald-500/20' : d === 'Medium' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-lg shadow-amber-500/20' : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-transparent shadow-lg shadow-rose-500/20') : 'bg-white/5 border-white/10 text-zinc-500 hover:border-white/20 hover:bg-white/10'}`}>
                                                        {d}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-zinc-400 uppercase text-[10px] font-black tracking-widest">Upload Resume (PDF/DOCX)</Label>
                                        <label className={`group relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 transition-all duration-500 cursor-pointer ${file ? 'bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.08)]' : 'border-white/10 bg-white/5 hover:border-violet-500/30 hover:bg-violet-500/5 hover:shadow-[0_0_30px_rgba(139,92,246,0.08)]'}`}>
                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf,.docx" onChange={e => handleFileChange(e.target.files?.[0] || null)} />
                                            {file ? (
                                                <div className="flex items-center gap-3 text-emerald-400 font-bold">
                                                    <CheckCircle className="w-6 h-6" />
                                                    <span>{file.name}</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="w-8 h-8 text-zinc-600 group-hover:text-primary transition-colors" />
                                                    <div className="text-center">
                                                        <p className="text-sm font-bold">Drop resume or click to upload</p>
                                                        <p className="text-xs text-zinc-500 mt-1">We'll use this to generate relevant technical questions</p>
                                                    </div>
                                                </>
                                            )}
                                        </label>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-zinc-400 uppercase text-[10px] font-black tracking-widest">Job Description (Optional)</Label>
                                        <Textarea className="bg-white/5 border-white/10 min-h-[100px] rounded-xl focus:border-primary/50 transition-all text-sm"
                                            placeholder="Paste the target JD here..."
                                            value={formData.jobDescription}
                                            onChange={e => setFormData({ ...formData, jobDescription: e.target.value })} />
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-4 pb-8">
                                    <Button className="w-full h-14 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 text-white hover:from-violet-400 hover:via-fuchsia-400 hover:to-cyan-400 font-black text-lg rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.25)] hover:shadow-[0_0_60px_rgba(139,92,246,0.35)] transition-all duration-500 hover:-translate-y-0.5"
                                        disabled={!formData.fullName || !formData.course || !formData.department || !formData.targetCompany || !file}
                                        onClick={processStep1}>
                                        CONTINUE <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TiltCard>
                    )}

                    {/* ── SCREEN 2: QUESTION TYPE ──────────────────────────── */}
                    {currentStep === 2 && (
                        <TiltCard>
                            <Card className="bg-zinc-900/50 border-white/10 backdrop-blur-2xl overflow-hidden rounded-[2rem] relative group hover:border-fuchsia-500/20 transition-all duration-500 hover:shadow-[0_0_60px_rgba(232,121,249,0.08)]">
                                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                                    <Layers size={120} />
                                </div>
                                {isProcessing && (
                                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-6 text-center">
                                        <div className="relative">
                                            <div className="w-20 h-20 border-4 border-fuchsia-500/20 border-t-cyan-400 rounded-full animate-spin" />
                                            <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-b-violet-400/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                                            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-fuchsia-400 w-8 h-8 animate-pulse" />
                                        </div>
                                        <div className="px-6">
                                            <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">Generating Your Questions</h3>
                                            <p className="text-zinc-400 text-sm">Our AI is crafting {formData.questionCount} {formData.difficulty} level questions based on your profile.</p>
                                        </div>
                                    </div>
                                )}
                                <CardHeader className="pb-8 text-center">
                                    <CardTitle className="text-3xl font-black tracking-tighter"><span className="bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">SELECT</span> INTERVIEW TYPE</CardTitle>
                                    <CardDescription className="text-zinc-400">Choose the flavor of your interview. AI will adapt its personality.</CardDescription>
                                </CardHeader>
                                <CardContent className="px-8 pb-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {INTERVIEW_TYPES.map(({ id, icon: Icon, desc, color, bg, glow }) => (
                                            <button key={id} onClick={() => setFormData({ ...formData, interviewType: id as any })}
                                                className={`group relative p-6 rounded-3xl border-2 text-left transition-all duration-300 hover-shine ${formData.interviewType === id ? bg + ' ' + color + ' border-current ' + glow : 'bg-white/5 border-transparent text-zinc-400 hover:bg-white/10 hover:border-white/10'}`}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className={`p-3 rounded-2xl ${formData.interviewType === id ? 'bg-white/20' : 'bg-white/5'}`}>
                                                        <Icon className="w-6 h-6" />
                                                    </div>
                                                    {formData.interviewType === id && <CheckCircle className="w-5 h-5 text-primary" />}
                                                </div>
                                                <h4 className="text-lg font-black uppercase tracking-tight mb-1">{id}</h4>
                                                <p className="text-xs leading-relaxed opacity-60 font-medium">{desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter className="px-8 pb-10 flex gap-4">
                                    <Button variant="ghost" className="h-14 px-8 font-bold text-zinc-500 hover:text-white" onClick={() => setCurrentStep(1)}>BACK</Button>
                                    <Button className="flex-1 h-14 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500 text-white hover:from-fuchsia-400 hover:via-violet-400 hover:to-cyan-400 font-black text-lg rounded-2xl shadow-[0_0_40px_rgba(232,121,249,0.25)] hover:shadow-[0_0_60px_rgba(139,92,246,0.35)] transition-all duration-500 hover:-translate-y-0.5"
                                        onClick={generateQuestions}>
                                        GENERATE & CONTINUE <Brain className="ml-2 w-5 h-5" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TiltCard>
                    )}

                    {/* Step 3 (Review) removed — questions are generated in background
                       and sent directly to the interview via join-interview socket event */}

                    {/* ── SCREEN 3: DEVICE & ENVIRONMENT CHECK ───────────── */}
                    {currentStep === 3 && (
                        <TiltCard>
                            <Card className="bg-zinc-900/50 border-white/10 backdrop-blur-2xl overflow-hidden rounded-[2rem] relative group hover:border-blue-500/20 transition-all duration-500 hover:shadow-[0_0_60px_rgba(59,130,246,0.08)]">
                                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                                    <Video size={120} />
                                </div>
                                <CardHeader className="pb-6">
                                    <CardTitle className="text-2xl font-black flex items-center gap-3">
                                        <Video className="text-blue-400" /> <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Readiness</span> Check
                                    </CardTitle>
                                    <CardDescription className="text-zinc-400">Ensure your setup is professional for the best AI analysis.</CardDescription>
                                </CardHeader>
                                <CardContent className="px-8 space-y-6">
                                    <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/5 shadow-2xl group">
                                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                                        {!stream && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-900/40 backdrop-blur-sm">
                                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                                    <Video className="w-8 h-8 text-primary animate-pulse" />
                                                </div>
                                                <Button onClick={() => { startDeviceCheck() }} className="bg-primary text-white font-bold h-10 px-6 rounded-xl">
                                                    START DEVICE CHECK
                                                </Button>
                                            </div>
                                        )}

                                        {stream && (
                                            <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                                                <div className="flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full border border-white/10 w-fit">
                                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                    <span className="text-[10px] font-black tracking-widest">LIVE CAMERA FEED</span>
                                                </div>
                                                {micLevel > 10 && (
                                                    <div className="flex items-center gap-1.5 bg-primary/20 backdrop-blur px-3 py-1.5 rounded-full border border-primary/30 w-fit">
                                                        <Mic className="w-3 h-3 text-primary" />
                                                        <span className="text-[10px] font-black text-primary tracking-widest">AUDIO DETECTED</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {permissionError && (
                                        <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500 ${permissionError.includes('Note') ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                            <AlertCircle className="w-5 h-5 shrink-0" />
                                            <p className="text-xs font-bold leading-tight">{permissionError}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { key: 'camera', icon: Video, label: 'Camera', ok: 'Active', fail: 'Check Device' },
                                            { key: 'mic', icon: Mic, label: 'Audio', ok: 'Clear', fail: 'Silent' },
                                            { key: 'internet', icon: Wifi, label: 'Speed', ok: 'Stable', fail: 'Low' },
                                            { key: 'face', icon: User, label: 'Position', ok: 'Centered', fail: 'Incomplete' }
                                        ].map(({ key, icon: Icon, label, ok, fail }) => {
                                            const passed = deviceStatus[key as keyof typeof deviceStatus]
                                            return (
                                                <div key={key} className={`p-4 rounded-2xl border transition-all duration-300 ${passed ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-red-500/5 border-red-500/20 text-red-400'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-xl ${passed ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                                                            <Icon size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-0.5">{label}</p>
                                                            <p className="text-xs font-black uppercase tracking-tight">{passed ? ok : fail}</p>
                                                        </div>
                                                        {passed && <CheckCircle size={14} className="ml-auto" />}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                                <CardFooter className="px-8 pb-10 flex gap-4">
                                    <Button variant="ghost" className="h-14 px-8 font-bold text-zinc-500 hover:text-white" onClick={() => { stopStream(); setCurrentStep(2) }}>BACK</Button>
                                    <Button className="flex-1 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-400 hover:to-cyan-400 font-black text-lg rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:shadow-[0_0_50px_rgba(59,130,246,0.3)] transition-all duration-500 hover:-translate-y-0.5"
                                        disabled={!deviceStatus.mic}
                                        onClick={() => { stopStream(); setCurrentStep(4) }}>
                                        CONTINUE TO CONFIG <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TiltCard>
                    )}

                    {/* ── SCREEN 4: CONFIGURATION ─────────────────────────── */}
                    {currentStep === 4 && (
                        <TiltCard>
                            <Card className="bg-zinc-900/50 border-white/10 backdrop-blur-2xl overflow-hidden rounded-[2rem] relative group hover:border-amber-500/20 transition-all duration-500 hover:shadow-[0_0_60px_rgba(245,158,11,0.08)]">
                                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                                    <Settings size={120} />
                                </div>
                                <CardHeader className="pb-8 text-center">
                                    <CardTitle className="text-3xl font-black tracking-tight"><span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">FINAL</span> CONFIGURATION</CardTitle>
                                    <CardDescription className="text-zinc-400">Choose your mentor and interview language details.</CardDescription>
                                </CardHeader>
                                <CardContent className="px-8 space-y-8">
                                    <div className="space-y-4">
                                        <Label className="text-zinc-400 uppercase text-[10px] font-black tracking-widest">Select Mentor Voice</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { id: 'Male', label: 'Male (Alpha)', desc: 'Professional & Direct', color: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
                                                { id: 'Female', label: 'Female (Sigma)', desc: 'Empathetic & Guiding', color: 'bg-primary/10 border-primary/30 text-primary' }
                                            ].map(v => (
                                                <button key={v.id} onClick={() => setFormData({ ...formData, voice: v.id })}
                                                    className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 hover-shine ${formData.voice === v.id ? v.color + ' shadow-lg' : 'bg-white/5 border-transparent text-zinc-500 hover:bg-white/10 hover:border-white/15'}`}>
                                                    <h4 className="font-black uppercase tracking-tight mb-1">{v.label}</h4>
                                                    <p className="text-[10px] opacity-60 font-medium">{v.desc}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-zinc-400 uppercase text-[10px] font-black tracking-widest">Interview Language</Label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['English', 'Hindi', 'Mixed (Hinglish)'].map(l => (
                                                <button key={l} onClick={() => setFormData({ ...formData, language: l })}
                                                    className={`py-4 rounded-xl border-2 text-[10px] font-black uppercase transition-all duration-300 ${formData.language === l ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500 text-amber-400 shadow-lg shadow-amber-500/10' : 'bg-white/5 border-transparent text-zinc-500 hover:bg-white/10 hover:border-white/15'}`}>
                                                    {l}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-violet-500/5 border border-emerald-500/15 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Sparkles className="text-emerald-400 w-5 h-5" />
                                            <h4 className="text-sm font-black uppercase tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Interview Ready</h4>
                                        </div>
                                        <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                                            You are about to start a <span className="text-emerald-400 font-bold">{formData.difficulty}</span> level <span className="text-violet-400 font-bold">{formData.interviewType}</span> interview for <span className="text-cyan-400 font-bold">{formData.targetCompany}</span>. Good luck! 🚀
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter className="px-8 pb-10 flex gap-4">
                                    <Button variant="ghost" className="h-14 px-8 font-bold text-zinc-500 hover:text-white" onClick={() => setCurrentStep(3)}>BACK</Button>
                                    <Button className="flex-1 h-16 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 text-white hover:from-violet-400 hover:via-fuchsia-400 hover:to-cyan-400 font-black text-lg rounded-2xl shadow-[0_0_50px_rgba(139,92,246,0.3),0_0_100px_rgba(6,182,212,0.15)] hover:shadow-[0_0_70px_rgba(139,92,246,0.4),0_0_120px_rgba(6,182,212,0.2)] transition-all duration-500 hover:-translate-y-1 rainbow-border"
                                        onClick={startInterview}>
                                        🎙️ START INTERVIEW <Play className="ml-2 w-5 h-5 fill-current" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TiltCard>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* System Status Dot */}
            <div className={`fixed bottom-4 right-4 px-4 py-2.5 rounded-full border backdrop-blur-xl flex items-center gap-2 text-xs font-bold transition-all duration-500 ${systemStatus.ai ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)]'}`}>
                {systemStatus.ai ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                {systemStatus.ai ? "AI Online" : "AI Offline"}
            </div>
        </div>
    )
}

export default function InterviewSetupPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen bg-black text-white"><Loader2 className="animate-spin w-8 h-8" /></div>}>
            <InterviewSetupContent />
        </Suspense>
    )
}
