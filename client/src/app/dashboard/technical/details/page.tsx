"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Cpu, ChevronRight, User } from "lucide-react"
import { motion } from "framer-motion"

export default function TechnicalDetailsPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        fullName: "",
        course: "",
        department: "",
        codingLevel: "Intermediate"
    })

    const [sessionId, setSessionId] = useState("")

    useEffect(() => {
        setSessionId(`AI-${Math.random().toString(36).substring(7).toUpperCase()}`)
        const savedUser = localStorage.getItem("user")
        if (savedUser) {
            const user = JSON.parse(savedUser)
            setFormData(prev => ({ ...prev, fullName: user.username || "" }))
        }
    }, [])

    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault()
        localStorage.setItem("technical_details", JSON.stringify(formData))
        router.push("/dashboard/technical/setup")
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-xl"
            >
                <Card className="bg-white/60 dark:bg-zinc-900/50 border-slate-100 dark:border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />

                    <CardHeader className="pt-10 pb-6 text-center">
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-primary/20">
                            <Cpu className="text-primary w-8 h-8" />
                        </div>
                        <CardTitle className="text-3xl font-bold tracking-tight">Technical Interview</CardTitle>
                        <p className="text-zinc-500 mt-2">Enter your technical details to customize the session.</p>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleContinue} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                                    <Input
                                        required
                                        className="bg-slate-50 dark:bg-black border-slate-200 dark:border-white/10 pl-10 h-12 rounded-xl focus:ring-primary/20"
                                        placeholder="Enter your full name"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Course</Label>
                                    <Input
                                        required
                                        className="bg-slate-50 dark:bg-black border-slate-200 dark:border-white/10 h-12 rounded-xl focus:ring-primary/20"
                                        placeholder="e.g. B.Tech"
                                        value={formData.course}
                                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Department</Label>
                                    <Input
                                        required
                                        className="bg-slate-50 dark:bg-black border-slate-200 dark:border-white/10 h-12 rounded-xl focus:ring-primary/20"
                                        placeholder="e.g. CSE"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Coding Level</Label>
                                <Select
                                    value={formData.codingLevel}
                                    onValueChange={(val: string) => setFormData({ ...formData, codingLevel: val })}
                                >
                                    <SelectTrigger className="bg-slate-50 dark:bg-black border-slate-200 dark:border-white/10 h-12 rounded-xl focus:ring-primary/20 text-slate-600 dark:text-zinc-300">
                                        <SelectValue placeholder="Select Level" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                                        <SelectItem value="Advanced">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 bg-white text-black hover:bg-zinc-200 rounded-2xl font-bold text-lg group transition-all"
                            >
                                Continue to Setup
                                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="pb-8 pt-0 justify-center">
                        {sessionId && (
                            <p className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] font-medium">Session ID: {sessionId}</p>
                        )}
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}
