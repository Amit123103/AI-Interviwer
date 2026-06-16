"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ShieldCheck, AlertTriangle, Eye, MousePointer2, Copy, MonitorX, Camera, Mic } from "lucide-react"
import { motion } from "framer-motion"

export default function TechnicalRulesPage() {
    const router = useRouter()
    const [agreed, setAgreed] = useState(false)

    const handleStart = () => {
        if (agreed) {
            router.push("/interview/coding")
        }
    }

    const rules = [
        { icon: Copy, text: "Copy-paste is Strictly Prohibited inside the editor.", color: "text-red-400" },
        { icon: MousePointer2, text: "Tab switching & Window minimization are monitored.", color: "text-amber-400" },
        { icon: MonitorX, text: "Screenshots (Print Screen) are not allowed.", color: "text-red-400" },
        { icon: Camera, text: "Camera must remain ON and focused at all times.", color: "text-primary" },
        { icon: Mic, text: "Microphone must be enabled for interaction.", color: "text-primary" },
    ]

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-black to-black">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <Card className="bg-white dark:bg-zinc-900/40 border-slate-100 dark:border-white/5 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border-t border-t-white/10">
                    <CardHeader className="text-center pt-8">
                        <div className="mx-auto w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 ring-1 ring-amber-500/20">
                            <ShieldCheck className="text-amber-500 w-7 h-7" />
                        </div>
                        <CardTitle className="text-2xl font-bold uppercase tracking-widest italic">Interview Rules</CardTitle>
                        <p className="text-zinc-500 text-sm mt-2">Please read carefully before starting the coding round.</p>
                    </CardHeader>

                    <CardContent className="px-8 pb-8">
                        <div className="grid gap-4 mt-6">
                            {rules.map((rule, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5"
                                >
                                    <rule.icon className={`w-5 h-5 shrink-0 ${rule.color}`} />
                                    <span className="text-sm font-medium text-slate-600 dark:text-zinc-300">{rule.text}</span>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-8 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-start gap-4">
                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] leading-relaxed text-red-200/60 uppercase tracking-widest font-black uppercase">
                                Violation Detection is strictly monitored. Multiple offenses will lead to immediate termination.
                            </p>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-6 px-8 pb-10">
                        <label className="flex items-center gap-4 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                />
                                <div className="w-6 h-6 border-2 border-slate-300 dark:border-white/20 p-1 rounded-lg transition-all peer-checked:border-primary peer-checked:bg-primary/20" />
                                <div className="absolute inset-1 bg-primary rounded shadow-[0_0_10px_rgba(255,255,255,0.5)] scale-0 transition-transform peer-checked:scale-100" />
                            </div>
                            <span className="text-sm text-slate-500 dark:text-zinc-400 group-hover:text-slate-900 dark:text-zinc-200 transition-colors uppercase tracking-widest font-bold">
                                I agree to follow all rules and ethics
                            </span>
                        </label>

                        <Button
                            disabled={!agreed}
                            onClick={handleStart}
                            className={`w-full h-14 rounded-2xl font-black text-lg uppercase tracking-[0.2em] transition-all
                                ${agreed ? 'bg-primary text-black hover:bg-primary/80 shadow-[0_0_30px_rgba(var(--primary),0.3)]' : 'bg-zinc-800 text-zinc-600'}`}
                        >
                            Start Coding Round
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}
