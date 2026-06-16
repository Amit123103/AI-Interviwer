"use client"

import React, { useState, useEffect, useRef, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, ChevronRight, Camera, Mic, Speaker, Monitor, Settings, Video, VolumeX, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"

function DeviceCheckContent() {
    const searchParams = useSearchParams()
    const mode = searchParams.get("mode") || "ai"
    const topic = searchParams.get("topic") || "Discussion Topic"
    const roomCode = searchParams.get("code")
    const videoRef = useRef<HTMLVideoElement>(null)
    const [cameraOn, setCameraOn] = useState(false)
    const [micOn, setMicOn] = useState(false)
    const [micLevel, setMicLevel] = useState(0)
    const [bgBlur, setBgBlur] = useState(false)
    const [stream, setStream] = useState<MediaStream | null>(null)

    useEffect(() => {
        startCamera()
        return () => { stream?.getTracks().forEach(t => t.stop()) }
    }, [])

    const startCamera = async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            setStream(s)
            setCameraOn(true)
            setMicOn(true)
            if (videoRef.current) videoRef.current.srcObject = s
            // Mic level animation
            const ctx = new AudioContext()
            const analyser = ctx.createAnalyser()
            const src = ctx.createMediaStreamSource(s)
            src.connect(analyser)
            analyser.fftSize = 256
            const data = new Uint8Array(analyser.frequencyBinCount)
            const tick = () => {
                analyser.getByteFrequencyData(data)
                const avg = data.reduce((a, b) => a + b, 0) / data.length
                setMicLevel(Math.min(avg / 128, 1))
                requestAnimationFrame(tick)
            }
            tick()
        } catch {
            setCameraOn(false)
            setMicOn(false)
        }
    }

    const toggleCamera = () => {
        if (stream) {
            stream.getVideoTracks().forEach(t => { t.enabled = !t.enabled })
            setCameraOn(prev => !prev)
        }
    }

    const toggleMic = () => {
        if (stream) {
            stream.getAudioTracks().forEach(t => { t.enabled = !t.enabled })
            setMicOn(prev => !prev)
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="particle-orb absolute w-72 h-72 rounded-full bg-emerald-500/10 blur-[120px] top-[20%] left-[30%]" />
            </div>
            <div className="relative z-10 max-w-3xl mx-auto px-6 py-8 pb-32">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
                    <Link href="/dashboard/group-discussion" className="hover:text-slate-900 dark:text-white transition-colors flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Group Discussion</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-emerald-400 font-medium">Device Check</span>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-black mb-2">Camera & Microphone Setup</h1>
                    <p className="text-slate-500 dark:text-zinc-400 text-sm">Make sure everything looks and sounds great before joining</p>
                    <p className="text-xs text-emerald-400 mt-2 font-medium">📌 Topic: {decodeURIComponent(topic)}</p>
                </motion.div>

                {/* Camera Preview */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-white/[0.06]">
                        {cameraOn ? (
                            <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${bgBlur ? "blur-sm" : ""}`} />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-2xl font-bold text-zinc-500 mb-3">S</div>
                                <p className="text-sm text-zinc-500">Camera is off</p>
                            </div>
                        )}
                        {/* Controls overlay */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                            <button onClick={toggleMic} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${micOn ? "bg-zinc-800 hover:bg-zinc-700 text-slate-900 dark:text-white" : "bg-red-500 text-slate-900 dark:text-white"}`}>
                                {micOn ? <Mic className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                            </button>
                            <button onClick={toggleCamera} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${cameraOn ? "bg-zinc-800 hover:bg-zinc-700 text-slate-900 dark:text-white" : "bg-red-500 text-slate-900 dark:text-white"}`}>
                                {cameraOn ? <Video className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Mic Level */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6 p-4 rounded-xl bg-white/60 dark:bg-zinc-900/50 border border-white/[0.06]">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold flex items-center gap-2"><Mic className="w-4 h-4 text-emerald-400" /> Microphone Level</p>
                        <span className={`text-xs font-bold ${micOn ? "text-emerald-400" : "text-red-400"}`}>{micOn ? "Active" : "Muted"}</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" animate={{ width: `${micOn ? micLevel * 100 : 0}%` }} transition={{ duration: 0.1 }} />
                    </div>
                </motion.div>

                {/* Settings */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                    <div className="p-4 rounded-xl bg-white/60 dark:bg-zinc-900/50 border border-white/[0.06]">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-zinc-300 flex items-center gap-2"><Monitor className="w-4 h-4" /> Background Blur</span>
                            <button onClick={() => setBgBlur(!bgBlur)} className={`w-10 h-5 rounded-full transition-all ${bgBlur ? "bg-emerald-500" : "bg-zinc-700"}`}>
                                <div className={`w-4 h-4 rounded-full bg-white transition-all ${bgBlur ? "translate-x-5" : "translate-x-0.5"}`} />
                            </button>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/60 dark:bg-zinc-900/50 border border-white/[0.06]">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-zinc-300 flex items-center gap-2"><Volume2 className="w-4 h-4" /> Noise Cancellation</span>
                            <span className="text-xs text-emerald-400 font-semibold">On</span>
                        </div>
                    </div>
                </motion.div>

                {/* Join Button */}
                <Link href={`/dashboard/group-discussion/room?mode=${mode}&topic=${encodeURIComponent(topic)}${roomCode ? `&code=${roomCode}` : ""}`}>
                    <Button className="w-full h-14 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-900 dark:text-white font-bold rounded-xl text-lg shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                        ✅ Everything Looks Good — Join Room
                    </Button>
                </Link>
            </div>
        </div>
    )
}

export default function DeviceCheckPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <DeviceCheckContent />
        </Suspense>
    )
}
