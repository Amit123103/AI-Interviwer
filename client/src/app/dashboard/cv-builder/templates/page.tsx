"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LayoutTemplate, Check, ArrowRight, Loader2 } from "lucide-react"
import MeshBackground from "../../components/MeshBackground"
import HolographicHud from "@/components/ui/HolographicHud"
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import { motion } from "framer-motion"

const TEMPLATES = [
    {
        id: "modern",
        name: "Modern Executive",
        description: "A striking two-column design optimized for readability.",
        color: "cyan"
    },
    {
        id: "classic",
        name: "Classic ATS",
        description: "Traditional single-column layout strictly for ATS bots.",
        color: "indigo"
    },
    {
        id: "minimal",
        name: "Minimalist Focus",
        description: "Typography-driven clean design highlighting achievements.",
        color: "emerald"
    }
]

function TemplateSelectionContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const mode = searchParams.get('mode')

    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
    const [isExtracting, setIsExtracting] = useState(false)

    useEffect(() => {
        if (!mode) {
            router.push('/dashboard/cv-builder')
        }
    }, [mode, router])

    const handleContinue = () => {
        if (!selectedTemplate) return

        setIsExtracting(true)
        // Simulate data matching generation 
        setTimeout(() => {
            router.push(`/dashboard/cv-builder/editor?template=${selectedTemplate}&mode=${mode}`)
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-white relative overflow-hidden aurora-glow">
            <MeshBackground />
            <HolographicHud />

            <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-10 py-6 md:py-10 space-y-8 relative z-10">
                <DashboardHeader
                    title="Design Matrix"
                    subtitle={`Select a chassis for your professional profile${mode === 'linkedin' ? ' (LinkedIn Data Loaded)' : ''}.`}
                    breadcrumbs={[{ label: "CV Builder", href: "/dashboard/cv-builder" }, { label: "Templates" }]}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-5xl mx-auto">
                    {TEMPLATES.map((tpl, i) => {
                        const isSelected = selectedTemplate === tpl.id
                        return (
                            <motion.div
                                key={tpl.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card
                                    onClick={() => setSelectedTemplate(tpl.id)}
                                    className={`relative overflow-hidden transition-all duration-300 cursor-pointer h-full border ${isSelected
                                        ? `bg-white dark:bg-zinc-900 border-${tpl.color}-500 shadow-[0_0_30px_rgba(var(--${tpl.color}-500),0.15)] scale-105`
                                        : 'bg-white dark:bg-zinc-900/40 border-slate-200 dark:border-white/10 hover:border-white/20 hover:bg-white dark:bg-zinc-900/60'
                                        }`}
                                >
                                    {isSelected && (
                                        <div className={`absolute top-4 right-4 w-6 h-6 rounded-full bg-${tpl.color}-500 flex items-center justify-center z-20`}>
                                            <Check className="w-4 h-4 text-black" />
                                        </div>
                                    )}
                                    <div className="h-48 w-full bg-white dark:bg-black/40 border-b border-slate-200 dark:border-white/10 flex items-center justify-center relative overflow-hidden group">
                                        <LayoutTemplate className={`w-16 h-16 text-zinc-700 transition-colors ${isSelected ? `text-${tpl.color}-400/20` : 'group-hover:text-slate-900 dark:text-white/10'}`} />

                                        {/* Simulated wireframe lines for aesthetic */}
                                        <div className="absolute inset-x-8 top-8 h-4 bg-white/5 rounded" />
                                        <div className="absolute inset-x-8 top-16 h-2 bg-white/5 rounded w-1/2" />
                                        <div className="absolute inset-x-8 top-20 h-2 bg-white/5 rounded w-3/4" />

                                        {tpl.id === 'modern' && (
                                            <div className="absolute right-8 top-8 bottom-8 w-1/3 bg-white/5 rounded" />
                                        )}
                                    </div>
                                    <CardContent className="p-6">
                                        <h3 className={`text-xl font-bold mb-2 ${isSelected ? `text-${tpl.color}-400` : 'text-slate-900 dark:text-zinc-200'}`}>
                                            {tpl.name}
                                        </h3>
                                        <p className="text-sm text-zinc-500 leading-relaxed">
                                            {tpl.description}
                                        </p>
                                    </CardContent>

                                    {isSelected && (
                                        <div className={`absolute inset-0 border-2 border-${tpl.color}-500/50 rounded-xl pointer-events-none`} />
                                    )}
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>

                <div className="flex justify-center mt-12">
                    <Button
                        onClick={handleContinue}
                        disabled={!selectedTemplate || isExtracting}
                        className="bg-white text-black hover:bg-zinc-200 h-14 px-8 rounded-xl font-bold uppercase tracking-wider text-sm transition-all min-w-[200px]"
                    >
                        {isExtracting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Initializing Core...
                            </>
                        ) : (
                            <>
                                Initialize Engine <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function TemplateSelectionPage() {
    return (
        <React.Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-black flex justify-center items-center text-slate-900 dark:text-white"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
            <TemplateSelectionContent />
        </React.Suspense>
    )
}
