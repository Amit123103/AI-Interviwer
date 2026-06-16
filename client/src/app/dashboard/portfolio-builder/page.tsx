"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FileText, Link as LinkIcon, Sparkles, UploadCloud, ChevronRight, User } from "lucide-react"
import { motion } from "framer-motion"
import TiltCard from "@/components/ui/TiltCard"

export default function PortfolioBuilderPage() {
    const router = useRouter()
    const [linkedinUrl, setLinkedinUrl] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleScratchStart = () => {
        router.push("/dashboard/portfolio-builder/select-template")
    }

    const handleLinkedInImport = async () => {
        if (!linkedinUrl.includes("linkedin.com/in/")) {
            setError("Please enter a valid LinkedIn profile URL.")
            return
        }
        setError("")
        setIsLoading(true)

        try {
            const savedUser = localStorage.getItem("user")
            const token = savedUser ? JSON.parse(savedUser).token : ""
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

            const res = await fetch(`${apiUrl}/api/portfolio/import/linkedin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ url: linkedinUrl })
            })

            if (!res.ok) {
                throw new Error("Failed to import LinkedIn data")
            }

            const data = await res.json()

            // Save imported data to session storage to use in editor/templates
            sessionStorage.setItem("portfolioDraft", JSON.stringify(data.data))

            router.push("/dashboard/portfolio-builder/select-template")
        } catch (err: any) {
            setError(err.message || "An error occurred during import.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsLoading(true)
        setError("")

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
            const formData = new FormData()
            formData.append("resume", file)

            const res = await fetch(`${apiUrl}/api/resume/parse`, {
                method: "POST",
                body: formData
            })

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                throw new Error(errorData.message || "Failed to parse resume.")
            }

            const data = await res.json()

            // The AI parser returns fields like `name`, `email`, `skills`, `experienceLevel`, `text`
            // Let's map it into our expected `portfolioDraft` schema where possible.
            const draftData = {
                personalDetails: {
                    fullName: data.name || "",
                    email: data.email || "",
                    headline: data.suggestedRole || data.experienceLevel ? `${data.experienceLevel} Professional` : "",
                    about: data.summary || "Parsed from resume. Please review and edit.",
                    location: data.location || "",
                },
                skills: Array.isArray(data.skills) ? data.skills : [],
                // We'll leave experience and education empty as the parse route
                // provides a flat text string typically. The user can add them in the editor.
                experience: [],
                education: []
            }

            sessionStorage.setItem("portfolioDraft", JSON.stringify(draftData))
            router.push("/dashboard/portfolio-builder/select-template")

        } catch (err: any) {
            setError(err.message || "An error occurred parsing the resume.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-white p-6 md:p-10 max-w-6xl mx-auto aurora-glow">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Portfolio <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Builder</span></h1>
                        <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Create a stunning developer portfolio in minutes to showcase your skills and projects.</p>
                    </div>
                </div>
                <div className="h-[1px] w-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-transparent" />
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* LinkedIn Import Option */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="h-full">
                    <TiltCard className="h-full">
                        <Card className="h-full group relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-white/[0.06] p-6 hover:border-blue-400/30 transition-all flex flex-col">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6">
                                <LinkIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Import LinkedIn</h3>
                            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 flex-1">
                                Automatically fetch your experience, skills, and summary from your LinkedIn profile.
                            </p>

                            <div className="space-y-3 mt-auto">
                                <Input
                                    className="bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-zinc-600 focus:border-blue-500/50"
                                    placeholder="https://linkedin.com/in/username"
                                    value={linkedinUrl}
                                    onChange={(e) => setLinkedinUrl(e.target.value)}
                                />
                                {error && <p className="text-xs text-red-400">{error}</p>}
                                <Button
                                    onClick={handleLinkedInImport}
                                    disabled={isLoading || !linkedinUrl}
                                    className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30"
                                >
                                    {isLoading ? 'Importing...' : 'Import Profile'}
                                </Button>
                            </div>
                        </Card>
                    </TiltCard>
                </motion.div>

                {/* CV Upload Option */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="h-full">
                    <TiltCard className="h-full">
                        <Card className="h-full group relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-white/[0.06] p-6 hover:border-emerald-400/30 transition-all flex flex-col">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Upload Resume</h3>
                            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 flex-1">
                                Let our AI parse your existing CV/Resume PDF to instantly generate your portfolio structure.
                            </p>

                            <div className="mt-auto">
                                <Input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleCVUpload}
                                    className="hidden"
                                    id="cv-upload"
                                />
                                <Button asChild className="w-full bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 cursor-pointer">
                                    <label htmlFor="cv-upload">
                                        <UploadCloud className="w-4 h-4 mr-2" />
                                        {isLoading ? 'Processing...' : 'Upload File'}
                                    </label>
                                </Button>
                            </div>
                        </Card>
                    </TiltCard>
                </motion.div>

                {/* Start from Scratch */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="h-full">
                    <TiltCard className="h-full">
                        <Card className="h-full group relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-white/[0.06] p-6 hover:border-purple-400/30 transition-all flex flex-col">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">From Scratch</h3>
                            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 flex-1">
                                Build your portfolio manually. Total control over every aspect of your data and presentation.
                            </p>

                            <div className="mt-auto">
                                <Button
                                    onClick={handleScratchStart}
                                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-slate-900 dark:text-white shadow-lg shadow-purple-500/25"
                                >
                                    Select Template <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </Card>
                    </TiltCard>
                </motion.div>
            </div>
        </div>
    )
}
