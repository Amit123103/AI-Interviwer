"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle2, Monitor } from "lucide-react"

const PORTFOLIO_TEMPLATES = [
    {
        id: "modern",
        name: "Modern Minimal",
        description: "Clean, whitespace-heavy design putting focus strictly on your content.",
        previewColor: "from-zinc-100 to-zinc-300",
        textColor: "text-zinc-800"
    },
    {
        id: "cyber",
        name: "Cyber Developer",
        description: "Dark mode, neon accents, perfect for highlighting tech stacks and code.",
        previewColor: "from-zinc-900 via-indigo-950 to-black",
        textColor: "text-indigo-400"
    },
    {
        id: "creative",
        name: "Creative Professional",
        description: "Vibrant and expressive, designed for frontend devs and designers.",
        previewColor: "from-rose-400 to-orange-400",
        textColor: "text-slate-900 dark:text-white"
    }
]

export default function SelectTemplatePage() {
    const router = useRouter()
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

    const handleContinue = () => {
        if (!selectedTemplate) return

        // Save choice
        sessionStorage.setItem("portfolioTemplate", selectedTemplate)
        router.push("/dashboard/portfolio-builder/editor")
    }

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-white p-6 md:p-10 max-w-6xl mx-auto">
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-8 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
            </Button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 text-center"
            >
                <h1 className="text-3xl font-bold tracking-tight mb-4">Choose a <span className="text-indigo-400">Template</span></h1>
                <p className="text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto">Select a starting point for your portfolio. You can always change this later in the editor.</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
                {PORTFOLIO_TEMPLATES.map((template, idx) => (
                    <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => setSelectedTemplate(template.id)}
                        className="cursor-pointer"
                    >
                        <Card className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900/40 backdrop-blur-xl border-2 transition-all duration-300 ${selectedTemplate === template.id ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-white/[0.06] hover:border-zinc-500'}`}>

                            {/* Template Preview Mockup */}
                            <div className={`h-48 w-full bg-gradient-to-br ${template.previewColor} flex flex-col items-center justify-center p-4 relative`}>
                                <Monitor className={`w-12 h-12 mb-2 ${template.textColor} opacity-50`} />
                                <div className={`h-2 w-24 rounded-full bg-current opacity-20 ${template.textColor} mb-2`}></div>
                                <div className={`flex gap-2 w-full max-w-[120px]`}>
                                    <div className={`h-16 flex-1 rounded bg-current opacity-10 ${template.textColor}`}></div>
                                    <div className={`h-16 flex-1 rounded bg-current opacity-10 ${template.textColor}`}></div>
                                </div>

                                {selectedTemplate === template.id && (
                                    <div className="absolute top-4 right-4 bg-indigo-500 rounded-full p-1 shadow-lg">
                                        <CheckCircle2 className="w-5 h-5 text-slate-900 dark:text-white" />
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                <h3 className="text-lg font-bold mb-2">{template.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-zinc-400 line-clamp-2">{template.description}</p>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: !!selectedTemplate ? 1 : 0 }}
                className="mt-12 flex justify-center"
            >
                <Button
                    onClick={handleContinue}
                    disabled={!selectedTemplate}
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white min-w-[200px]"
                >
                    Continue to Editor
                </Button>
            </motion.div>
        </div>
    )
}
