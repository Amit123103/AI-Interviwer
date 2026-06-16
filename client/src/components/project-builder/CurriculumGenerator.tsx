import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, BrainCircuit, Code2, Layers, CheckCircle } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import { CurriculumData } from '@/app/dashboard/project-builder/page'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

export default function CurriculumGenerator({
    category,
    language,
    projectIdea,
    onGenerated,
    onBack
}: {
    category: string,
    language: string,
    projectIdea: string,
    onGenerated: (data: CurriculumData) => void,
    onBack: () => void
}) {
    const [loadingStep, setLoadingStep] = useState(0)

    const loadingSteps = [
        { icon: <BrainCircuit className="w-5 h-5 text-indigo-400" />, text: "Analyzing project requirements..." },
        { icon: <Layers className="w-5 h-5 text-emerald-400" />, text: "Structuring module curriculum..." },
        { icon: <Code2 className="w-5 h-5 text-rose-400" />, text: "Writing starter & solution code..." },
        { icon: <CheckCircle className="w-5 h-5 text-amber-400" />, text: "Finalizing project roadmap..." }
    ]

    useEffect(() => {
        let isMounted = true;

        const generateCurriculum = async () => {
            try {
                // Cycle through loading steps visually
                const interval = setInterval(() => {
                    setLoadingStep(prev => Math.min(prev + 1, 3))
                }, 4000)

                const token = localStorage.getItem('token')
                const res = await axios.post(`${API_URL}/projects/generate-curriculum`, {
                    category,
                    language,
                    projectIdea,
                    stack: "MERN Stack", // Placeholder, we can expand this
                    skillLevel: "Beginner"
                }, { 
                    headers: { 'Authorization': `Bearer ${token}` },
                    withCredentials: true, 
                    timeout: 60000 
                })

                clearInterval(interval)

                if (isMounted && res.data.success) {
                    onGenerated(res.data.curriculum)
                } else if (isMounted) {
                    toast.error("Failed to generate curriculum.")
                    onBack()
                }

            } catch (err: any) {
                console.error(err)
                if (isMounted) {
                    toast.error("An error occurred during AI generation.")
                    onBack()
                }
            }
        }

        generateCurriculum()

        return () => { isMounted = false }
    }, [category, language, projectIdea, onBack, onGenerated])

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center text-center py-20 px-4">
            <div className="relative mb-12">
                <div className="absolute inset-0 bg-indigo-500/20 blur-[50px] rounded-full w-40 h-40 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                <div className="w-24 h-24 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                    <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                </div>
            </div>

            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Designing your Learning Path</h2>
            <p className="text-zinc-400 mb-10 max-w-md text-lg">
                Our AI is drafting a step-by-step curriculum to build <strong className="text-white">{projectIdea}</strong> using <strong className="text-emerald-400">{language}</strong>.
            </p>

            <div className="w-full max-w-sm space-y-4 text-left">
                {loadingSteps.map((step, idx) => (
                    <div key={idx} className={`flex items-center gap-4 transition-all duration-700 ${idx <= loadingStep ? 'opacity-100 translate-y-0' : 'opacity-20 translate-y-4'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${idx < loadingStep ? 'bg-emerald-500/10 border-emerald-500/20' : idx === loadingStep ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/10'}`}>
                            {idx < loadingStep ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : step.icon}
                        </div>
                        <span className={`font-semibold text-sm ${idx <= loadingStep ? 'text-white' : 'text-zinc-500'}`}>{step.text}</span>
                    </div>
                ))}
            </div>

            <p className="text-zinc-500 text-xs mt-12 italic">This may take up to 30 seconds as the AI writes the complete project code.</p>
        </div>
    )
}
