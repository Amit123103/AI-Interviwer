"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Loader2, Upload, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import MeshBackground from "../components/MeshBackground"
import HolographicHud from "@/components/ui/HolographicHud"
import TiltCard from "@/components/ui/TiltCard"
import { motion, AnimatePresence } from "framer-motion"
import DashboardHeader from "@/components/dashboard/DashboardHeader"

export default function ResumePage() {
    const [file, setFile] = useState<File | null>(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [analysis, setAnalysis] = useState<any>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleUpload = async () => {
        if (!file) return

        setAnalyzing(true)
        const formData = new FormData()
        formData.append('resume', file)

        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/resume/analyze`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            const data = await res.json()
            if (res.ok) {
                setAnalysis(data.analysis)
                toast.success("Resume analyzed successfully!")
            } else {
                toast.error(data.message || "Analysis failed")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error uploading resume")
        } finally {
            setAnalyzing(false)
        }
    }

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-white relative overflow-hidden aurora-glow">
            <MeshBackground />
            <HolographicHud />

            {/* Floating ambient orbs */}
            <div className="absolute top-24 right-16 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
            <div className="absolute bottom-20 left-20 w-72 h-72 bg-emerald-500/4 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-10 py-6 md:py-10 space-y-8 relative z-10">
                <DashboardHeader
                    title="Neural Resume Analysis"
                    subtitle="AI-powered tactical feedback on your professional profile."
                    breadcrumbs={[{ label: "Resume Review" }]}
                />

                <TiltCard className="max-w-4xl">
                    <Card className="bg-white/60 dark:bg-zinc-900/50 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden group hover:border-violet-500/20 hover:shadow-[0_0_40px_rgba(139,92,246,0.06)] transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="pb-4">
                            <CardTitle className="text-2xl font-black italic uppercase tracking-tighter group-hover:text-violet-400 transition-colors"><span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Neural</span> Uplink (PDF)</CardTitle>
                            <CardDescription className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Connect your professional dossier for deep scans.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                                <div className="flex-1 relative group/input">
                                    <Input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-12 rounded-xl focus-visible:ring-primary/50 transition-all cursor-pointer file:bg-primary file:text-black file:font-black file:uppercase file:text-[9px] file:rounded-md file:border-none file:px-3 file:mr-4"
                                    />
                                    <div className="absolute -inset-0.5 bg-violet-500/20 rounded-xl blur opacity-0 group-hover/input:opacity-100 transition-opacity -z-10" />
                                </div>
                                <Button
                                    onClick={handleUpload}
                                    disabled={!file || analyzing}
                                    className="bg-gradient-to-r from-violet-500 to-cyan-500 text-slate-900 dark:text-white hover:from-violet-400 hover:to-cyan-400 h-12 px-8 font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all duration-500"
                                >
                                    {analyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                    {analyzing ? "Scanning..." : "Initiate Scan"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TiltCard>

                {analysis && (
                    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TiltCard>
                                <Card className="bg-white dark:bg-zinc-900/40 backdrop-blur-xl border-emerald-500/20 group hover:border-emerald-500/40 transition-all rounded-[2rem] h-full overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-emerald-500">
                                        <CheckCircle size={100} />
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="text-emerald-400 font-black italic flex items-center gap-3">
                                            <div className="p-2 bg-emerald-500/10 rounded-xl"><CheckCircle className="w-5 h-5" /></div>
                                            Tactical Strengths
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {analysis.strengths?.map((s: string, i: number) => (
                                                <li key={i} className="text-slate-500 dark:text-zinc-400 text-sm font-medium flex items-start gap-3 group-hover:text-slate-900 dark:text-zinc-200 transition-colors">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </TiltCard>

                            <TiltCard>
                                <Card className="bg-white dark:bg-zinc-900/40 backdrop-blur-xl border-red-500/20 group hover:border-red-500/40 transition-all rounded-[2rem] h-full overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-red-500">
                                        <AlertCircle size={100} />
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="text-red-400 font-black italic flex items-center gap-3">
                                            <div className="p-2 bg-red-500/10 rounded-xl"><AlertCircle className="w-5 h-5" /></div>
                                            Vulnerabilities
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {analysis.weaknesses?.map((w: string, i: number) => (
                                                <li key={i} className="text-slate-500 dark:text-zinc-400 text-sm font-medium flex items-start gap-3 group-hover:text-slate-900 dark:text-zinc-200 transition-colors">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0 shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                                                    {w}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </TiltCard>
                        </div>

                        <Card className="bg-white/60 dark:bg-zinc-900/50 backdrop-blur-2xl border-zinc-800 hover:border-violet-500/15 transition-all duration-300">
                            <CardHeader>
                                <CardTitle><span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">ATS Keywords</span> Missing</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.missingKeywords?.map((k: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-sm text-amber-300 hover:bg-amber-500/20 transition-colors">
                                            {k}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
