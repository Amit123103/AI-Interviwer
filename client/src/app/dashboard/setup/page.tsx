"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Camera, Mic, Video, Volume2, Settings2, PlayCircle } from "lucide-react"
import BackToDashboard from "@/components/dashboard/BackToDashboard"

export default function InterviewSetupPage() {
    const router = useRouter()
    const videoRef = useRef<HTMLVideoElement>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [micActive, setMicActive] = useState(false)
    const [settings, setSettings] = useState({
        level: "intermediate",
        voice: "female",
        questionCount: 10,
    })

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            setStream(mediaStream)
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
            }
            setMicActive(true)
        } catch (err) {
            console.error("Error accessing media devices:", err)
            alert("Please allow camera and microphone access")
        }
    }

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }
        }
    }, [stream])

    const handleStart = () => {
        // Save settings and proceed to interview
        localStorage.setItem("interviewSettings", JSON.stringify(settings))
        router.push("/dashboard/interview/setup")
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white p-4 md:p-10 relative overflow-hidden aurora-glow">
            {/* Floating ambient orbs */}
            <div className="absolute top-20 left-10 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
            <div className="absolute bottom-32 right-16 w-72 h-72 bg-cyan-500/4 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-fuchsia-500/3 rounded-full blur-[160px] orb-float pointer-events-none" style={{ animationDelay: '5s' }} />

            <div className="max-w-5xl mx-auto space-y-8 relative z-10">
                <BackToDashboard currentPage="Interview Setup" />
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent bg-[length:200%] animate-gradient-x">Interview Setup</h1>
                    <p className="text-zinc-500 font-medium mt-1">Check your hardware and set your preferences before we begin.</p>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Device Check */}
                    <Card className="bg-white dark:bg-zinc-900/40 border-white/[0.06] backdrop-blur-2xl shadow-2xl">
                        <CardHeader className="border-b border-white/[0.04]">
                            <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                <Video className="w-5 h-5 text-emerald-400" />
                                Hardware Check
                            </CardTitle>
                            <CardDescription className="text-zinc-500">Make sure you are visible and audible.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 p-6">
                            <div className="aspect-video bg-slate-50 dark:bg-black rounded-2xl overflow-hidden flex items-center justify-center relative border border-white/[0.06]">
                                {stream ? (
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center space-y-3">
                                        <p className="text-zinc-600 text-sm px-4">Camera is currently disabled</p>
                                        <Button variant="secondary" onClick={startCamera} className="bg-gradient-to-r from-violet-600 to-cyan-600 text-slate-900 dark:text-white font-black uppercase tracking-widest text-xs border-0 shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-105 transition-all">
                                            Enable Camera & Mic
                                        </Button>
                                    </div>
                                )}
                                {stream && (
                                    <div className="absolute bottom-4 left-4 flex gap-2">
                                        <div className="bg-white dark:bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] text-emerald-400 font-black uppercase tracking-widest flex items-center gap-1.5 border border-emerald-500/20">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                                            Camera Live
                                        </div>
                                        {micActive && (
                                            <div className="bg-white dark:bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] text-blue-400 font-black uppercase tracking-widest flex items-center gap-1.5 border border-blue-500/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
                                                Mic Active
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-around py-2">
                                <div className="flex flex-col items-center gap-1.5 text-xs">
                                    <div className={`p-3 rounded-xl transition-all ${stream ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]" : "bg-white/5 text-zinc-600 border border-white/[0.06]"}`}>
                                        <Camera className="w-4 h-4" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Camera</span>
                                </div>
                                <div className="flex flex-col items-center gap-1.5 text-xs">
                                    <div className={`p-3 rounded-xl transition-all ${micActive ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.1)]" : "bg-white/5 text-zinc-600 border border-white/[0.06]"}`}>
                                        <Mic className="w-4 h-4" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Microphone</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Settings */}
                    <Card className="bg-white dark:bg-zinc-900/40 border-white/[0.06] backdrop-blur-2xl shadow-2xl">
                        <CardHeader className="border-b border-white/[0.04]">
                            <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                                <Settings2 className="w-5 h-5 text-violet-400" />
                                Interview Settings
                            </CardTitle>
                            <CardDescription className="text-zinc-500">Customize your interview experience.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 p-6">
                            <div className="space-y-2">
                                <Label htmlFor="level" className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Interview Level</Label>
                                <select
                                    id="level"
                                    value={settings.level}
                                    onChange={(e) => setSettings({ ...settings, level: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl border border-white/[0.06] bg-white dark:bg-black/40 text-slate-900 dark:text-white font-bold focus:border-violet-500/50 transition-all outline-none"
                                >
                                    <option value="easy">Easy (Casual & Warm-up)</option>
                                    <option value="intermediate">Intermediate (Standard Mock)</option>
                                    <option value="advanced">Advanced (High Pressure)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="voice" className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">AI Interviewer Voice</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        variant={settings.voice === "male" ? "default" : "outline"}
                                        onClick={() => setSettings({ ...settings, voice: "male" })}
                                        className={`gap-2 h-12 font-black uppercase tracking-widest text-xs transition-all ${settings.voice === "male" ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-slate-900 dark:text-white border-0 shadow-[0_0_15px_rgba(139,92,246,0.3)]" : "border-white/[0.06] text-slate-500 dark:text-zinc-400 hover:border-violet-500/30 hover:text-slate-900 dark:text-white"}`}
                                    >
                                        <Volume2 className="w-4 h-4" /> Male
                                    </Button>
                                    <Button
                                        variant={settings.voice === "female" ? "default" : "outline"}
                                        onClick={() => setSettings({ ...settings, voice: "female" })}
                                        className={`gap-2 h-12 font-black uppercase tracking-widest text-xs transition-all ${settings.voice === "female" ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-slate-900 dark:text-white border-0 shadow-[0_0_15px_rgba(139,92,246,0.3)]" : "border-white/[0.06] text-slate-500 dark:text-zinc-400 hover:border-violet-500/30 hover:text-slate-900 dark:text-white"}`}
                                    >
                                        <Volume2 className="w-4 h-4" /> Female
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="questions" className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Number of Questions</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[5, 10, 15, 20].map((num) => (
                                        <Button
                                            key={num}
                                            variant={settings.questionCount === num ? "default" : "outline"}
                                            onClick={() => setSettings({ ...settings, questionCount: num })}
                                            size="sm"
                                            className={`h-10 font-black transition-all ${settings.questionCount === num ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-slate-900 dark:text-white border-0 shadow-[0_0_12px_rgba(139,92,246,0.3)]" : "border-white/[0.06] text-slate-500 dark:text-zinc-400 hover:border-violet-500/30 hover:text-slate-900 dark:text-white"}`}
                                        >
                                            {num}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-white dark:bg-black/20 border-t border-white/[0.04] p-6">
                            <Button onClick={handleStart} className="w-full gap-2 h-14 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-cyan-500 text-slate-900 dark:text-white font-black text-lg uppercase tracking-tighter shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.5)] transition-all active:scale-[0.98] border-0" size="lg" disabled={!stream}>
                                <PlayCircle className="w-5 h-5" />
                                Start My Interview
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
