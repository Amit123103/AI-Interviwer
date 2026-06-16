"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Camera, Mic, Wifi, ShieldCheck, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function TechnicalSetupPage() {
    const router = useRouter()
    const videoRef = useRef<HTMLVideoElement>(null)
    const [setup, setSetup] = useState({
        camera: false,
        mic: false,
        internet: true,
        questions: 5
    })
    const [isTesting, setIsTesting] = useState(false)

    const startTests = async () => {
        setIsTesting(true)
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
            }
            setSetup(prev => ({ ...prev, camera: true, mic: true }))
        } catch (err) {
            console.error("Device access failed:", err)
        }
        setIsTesting(false)
    }

    const handleContinue = () => {
        localStorage.setItem("technical_setup", JSON.stringify(setup))
        router.push("/dashboard/technical/rules")
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white flex items-center justify-center p-6 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
            <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-start">

                {/* Left: Preview */}
                <Card className="bg-white/60 dark:bg-zinc-900/50 border-slate-100 dark:border-white/5 overflow-hidden aspect-video relative flex items-center justify-center">
                    {setup.camera ? (
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto ring-1 ring-white/10">
                                <Camera className="w-8 h-8 text-zinc-500" />
                            </div>
                            <p className="text-sm text-zinc-500">Camera preview will appear here</p>
                        </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white dark:bg-black/60 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 border border-slate-200 dark:border-white/10 backdrop-blur-md">
                        <div className={`w-1.5 h-1.5 rounded-full ${setup.camera ? 'bg-green-500' : 'bg-red-500'}`} />
                        Live Preview
                    </div>
                </Card>

                {/* Right: Checklist */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">System Check</h1>
                        <p className="text-zinc-500 mt-2">Ensure your devices are ready for the interview.</p>
                    </div>

                    <div className="space-y-3">
                        <CheckItem icon={Camera} label="Camera Recognition" status={setup.camera} />
                        <CheckItem icon={Mic} label="Microphone Input" status={setup.mic} />
                        <CheckItem icon={Wifi} label="Stable Internet Connection" status={setup.internet} />
                    </div>

                    {!setup.camera && (
                        <Button
                            onClick={startTests}
                            disabled={isTesting}
                            className="w-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 h-12 rounded-xl"
                        >
                            {isTesting ? "Testing..." : "Test Devices"}
                        </Button>
                    )}

                    <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 block mb-4">Number of Coding Questions</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[3, 5, 10].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setSetup({ ...setup, questions: num })}
                                    className={`h-14 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1
                                        ${setup.questions === num
                                            ? 'bg-primary border-primary text-black'
                                            : 'bg-white/60 dark:bg-zinc-900/50 border-slate-100 dark:border-white/5 text-slate-500 dark:text-zinc-400 hover:border-white/10'}`}
                                >
                                    <span className="text-lg font-bold">{num}</span>
                                    <span className="text-[8px] uppercase tracking-widest opacity-80 font-black">Tasks</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        disabled={!setup.camera || !setup.mic}
                        onClick={handleContinue}
                        className="w-full h-14 bg-white text-black hover:bg-zinc-200 rounded-2xl font-bold text-lg group shadow-2xl shadow-white/5"
                    >
                        Save & Continue
                        <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

function CheckItem({ icon: Icon, label, status }: { icon: any, label: string, status: boolean }) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-zinc-900/50 border border-slate-100 dark:border-white/5 rounded-2xl transition-colors">
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${status ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    <Icon className={`w-5 h-5 ${status ? 'text-green-500' : 'text-zinc-500'}`} />
                </div>
                <span className={`text-sm font-medium ${status ? 'text-slate-900 dark:text-zinc-200' : 'text-zinc-500'}`}>{label}</span>
            </div>
            {status ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
                <AlertCircle className="w-5 h-5 text-red-500 opacity-50" />
            )}
        </div>
    )
}
