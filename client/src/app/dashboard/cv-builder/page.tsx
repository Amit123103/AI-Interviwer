"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Linkedin, ArrowRight, Sparkles, UserPlus } from "lucide-react"
import { toast } from "sonner"
import MeshBackground from "../components/MeshBackground"
import HolographicHud from "@/components/ui/HolographicHud"
import TiltCard from "@/components/ui/TiltCard"
import DashboardHeader from "@/components/dashboard/DashboardHeader"

export default function CvBuilderLanding() {
    const router = useRouter()
    const [linkedInUrl, setLinkedInUrl] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleManualCreate = () => {
        router.push('/dashboard/cv-builder/templates?mode=manual')
    }

    const handleLinkedInImport = async () => {
        if (!linkedInUrl) {
            toast.error("Please enter a valid LinkedIn URL")
            return
        }
        if (!linkedInUrl.includes("linkedin.com/in/")) {
            toast.error("URL must be a valid LinkedIn profile (e.g., linkedin.com/in/username)")
            return
        }

        setIsLoading(true)
        // Store the URL in sessionStorage to access it on the next page
        sessionStorage.setItem('cv_linkedin_url', linkedInUrl)

        // Simulate a brief backend call delay before routing
        setTimeout(() => {
            setIsLoading(false)
            router.push('/dashboard/cv-builder/templates?mode=linkedin')
        }, 1000)
    }

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-white relative overflow-hidden aurora-glow">
            <MeshBackground />
            <HolographicHud />

            {/* Floating ambient orbs */}
            <div className="absolute top-24 right-16 w-80 h-80 bg-cyan-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
            <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-500/4 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />

            <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-10 py-6 md:py-10 space-y-8 relative z-10">
                <DashboardHeader
                    title="Neural CV Architect"
                    subtitle="Craft a high-impact, ATS-optimized resume in minutes."
                    breadcrumbs={[{ label: "CV Builder" }]}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-12">
                    {/* Manual Creation Option */}
                    <TiltCard>
                        <Card className="bg-white/60 dark:bg-zinc-900/50 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden group hover:border-cyan-500/30 hover:shadow-[0_0_40px_rgba(34,211,238,0.06)] transition-all duration-500 h-full flex flex-col">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            <CardHeader className="pb-4 relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                                    <UserPlus className="w-7 h-7 text-cyan-400" />
                                </div>
                                <CardTitle className="text-3xl font-black italic uppercase tracking-tighter group-hover:text-cyan-400 transition-colors">
                                    <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Manual</span> Protocol
                                </CardTitle>
                                <CardDescription className="text-slate-500 dark:text-zinc-400 font-medium text-sm mt-2">
                                    Start with a blank canvas. Choose your template and input your professional milestones structure by structure.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto relative z-10">
                                <ul className="space-y-3 mb-8">
                                    {['Full creative control', 'Step-by-step guided input', 'Multiple ATS-friendly templates'].map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-zinc-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    onClick={handleManualCreate}
                                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-slate-900 dark:text-white border border-slate-100 dark:border-white/5 h-14 rounded-xl font-bold uppercase tracking-wider text-sm transition-all"
                                >
                                    Start from Scratch <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    </TiltCard>

                    {/* LinkedIn Import Option */}
                    <TiltCard>
                        <Card className="bg-white/60 dark:bg-zinc-900/50 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden group hover:border-indigo-500/30 hover:shadow-[0_0_40px_rgba(99,102,241,0.06)] transition-all duration-500 h-full flex flex-col relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            <div className="absolute top-0 right-0 p-6 pointer-events-none">
                                <Sparkles className="w-6 h-6 text-indigo-400/20" />
                            </div>
                            <CardHeader className="pb-4 relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-[#0A66C2]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                                    <Linkedin className="w-7 h-7 text-[#0A66C2]" />
                                </div>
                                <CardTitle className="text-3xl font-black italic uppercase tracking-tighter group-hover:text-indigo-400 transition-colors">
                                    <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">LinkedIn</span> Uplink
                                </CardTitle>
                                <CardDescription className="text-slate-500 dark:text-zinc-400 font-medium text-sm mt-2">
                                    Neural extraction sequence. Paste your profile URL and let our AI instantly map your career trajectory into a formatted CV.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto relative z-10 space-y-6">
                                <div className="space-y-4">
                                    <div className="relative group/input">
                                        <Input
                                            value={linkedInUrl}
                                            onChange={(e) => setLinkedInUrl(e.target.value)}
                                            placeholder="https://linkedin.com/in/your-profile"
                                            className="bg-white dark:bg-black/50 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-14 rounded-xl focus-visible:ring-indigo-500/50 transition-all pl-4 text-sm font-medium placeholder:text-zinc-600"
                                        />
                                        <div className="absolute -inset-0.5 bg-indigo-500/20 rounded-xl blur opacity-0 group-hover/input:opacity-100 transition-opacity -z-10" />
                                    </div>
                                    <Button
                                        onClick={handleLinkedInImport}
                                        disabled={isLoading}
                                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-slate-900 dark:text-white h-14 rounded-xl font-bold uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                                Establishing Link...
                                            </span>
                                        ) : (
                                            <span className="flex items-center">
                                                Auto-Generate CV <Sparkles className="w-4 h-4 ml-2 fill-current" />
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TiltCard>
                </div>
            </div>
        </div>
    )
}
