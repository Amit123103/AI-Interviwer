import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, Sparkles, Target, Users, ArrowRight, X, Briefcase, Zap, CheckCircle2, Bookmark, BookmarkCheck, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

const partners = [
    {
        id: 1, name: "Google", role: "Software Engineer", category: "Engineering", matching: "98%", status: "Actively Hiring", logo: "G",
        description: "Join Google's core engineering team to build scalable planetary systems. We are looking for top-tier algorithms experts.",
        requirements: ["Advanced Data Structures", "System Design", "Cloud Infrastructure"],
        locations: "Mountain View, CA / Remote",
        skillMatch: [
            { name: "Algorithms", score: 98 },
            { name: "System Design", score: 95 },
            { name: "Problem Solving", score: 99 }
        ]
    },
    {
        id: 2, name: "Microsoft", role: "Cloud Solutions", category: "Cloud", matching: "95%", status: "Reviewing Profiles", logo: "M",
        description: "Develop enterprise-grade cloud solutions on Azure. Focus on high-availability and security.",
        requirements: ["C# / .NET Core", "Azure Services", "Microservices Architecture"],
        locations: "Redmond, WA / Hybrid",
        skillMatch: [
            { name: "Cloud Arch", score: 96 },
            { name: "Backend APIs", score: 94 },
            { name: "Security", score: 92 }
        ]
    },
    {
        id: 3, name: "Amazon", role: "Backend Dev", category: "Engineering", matching: "92%", status: "Early Access", logo: "A",
        description: "Scale AWS services and build the next generation of e-commerce backend logic.",
        requirements: ["Java / Python", "AWS DynamoDB", "Distributed Systems"],
        locations: "Seattle, WA",
        skillMatch: [
            { name: "Distributed Sys", score: 91 },
            { name: "Database Design", score: 94 },
            { name: "Optimization", score: 90 }
        ]
    },
    {
        id: 4, name: "Meta", role: "Frontend UI/UX", category: "Design", matching: "89%", status: "Upcoming", logo: "M",
        description: "Create immersive web experiences for billions of interconnected global users.",
        requirements: ["React / GraphQL", "WebGL", "Performance Optimization"],
        locations: "Menlo Park, CA",
        skillMatch: [
            { name: "React/Redux", score: 92 },
            { name: "UI Architecture", score: 88 },
            { name: "Performance", score: 85 }
        ]
    },
    {
        id: 5, name: "Netflix", role: "Data Engineer", category: "Data", matching: "94%", status: "Actively Hiring", logo: "N",
        description: "Build robust data pipelines to process petabytes of streaming analytics data.",
        requirements: ["Spark / Kafka", "Python", "Data Warehousing"],
        locations: "Los Gatos, CA",
        skillMatch: [
            { name: "Data Pipelines", score: 95 },
            { name: "Python / SQL", score: 97 },
            { name: "Stream Processing", score: 91 }
        ]
    },
    {
        id: 6, name: "Apple", role: "iOS Developer", category: "Mobile", matching: "91%", status: "Reviewing Profiles", logo: "A",
        description: "Design and build revolutionary mobile applications for the iOS ecosystem.",
        requirements: ["Swift / SwiftUI", "Core Data", "Memory Management"],
        locations: "Cupertino, CA",
        skillMatch: [
            { name: "Swift / iOS SDK", score: 93 },
            { name: "App Architecture", score: 89 },
            { name: "UI/UX Fidelity", score: 92 }
        ]
    }
]

const categories = ["All", "Engineering", "Cloud", "Data", "Design", "Mobile"]

export default function HiringPartners() {
    const [selectedPartner, setSelectedPartner] = useState<any | null>(null)
    const [isApplying, setIsApplying] = useState(false)
    const [applied, setApplied] = useState(false)
    const [activeCategory, setActiveCategory] = useState("All")
    const [savedJobs, setSavedJobs] = useState<number[]>([])

    const filteredPartners = activeCategory === "All"
        ? partners
        : partners.filter(p => p.category === activeCategory)

    const toggleSaveJob = (id: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSavedJobs(prev =>
            prev.includes(id) ? prev.filter(jobId => jobId !== id) : [...prev, id]
        )
    }

    const handleApply = () => {
        setIsApplying(true)
        setTimeout(() => {
            setIsApplying(false)
            setApplied(true)
            setTimeout(() => {
                setApplied(false)
                setSelectedPartner(null)
            }, 2500)
        }, 1500)
    }
    return (
        <section className="space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900/40 border border-white/10 flex flex-shrink-0 items-center justify-center shadow-2xl backdrop-blur-xl">
                        <Building2 className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Hiring <span className="text-blue-500">Network</span>
                        </h2>
                        <p className="text-[10px] sm:text-[11px] text-slate-900 dark:text-slate-400 font-medium uppercase tracking-wider">
                            Direct opportunities with top companies
                        </p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar scroll-smooth">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border ${activeCategory === cat
                                ? 'bg-blue-600 border-blue-500 text-slate-900 dark:text-white shadow-[0_5px_15px_rgba(37,99,235,0.3)]'
                                : 'bg-white dark:bg-slate-900/40 border-white/5 text-slate-900 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:border-white/10'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scroller / Grid Container */}
            <div className={`relative flex overflow-hidden group select-none py-4 ${filteredPartners.length > 3 ? 'mask-linear-fade' : ''}`}>
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={activeCategory}
                        className={`flex ${filteredPartners.length > 3 ? 'space-x-6 pr-6' : 'gap-6 flex-wrap'}`}
                        animate={filteredPartners.length > 3 ? { x: ["0%", "-50%"] } : { x: 0 }}
                        transition={filteredPartners.length > 3 ? {
                            duration: 40,
                            ease: "linear",
                            repeat: Infinity,
                        } : { duration: 0 }}
                    >
                        {/* If scrolling, duplicate array. Else show single array. */}
                        {(filteredPartners.length > 3 ? [...filteredPartners, ...filteredPartners] : filteredPartners).map((partner, i) => (
                            <div
                                key={i}
                                className="flex-shrink-0 w-[280px] sm:w-[320px] rounded-[1.5rem] bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-white/5 p-6 relative overflow-hidden group/card hover:bg-white dark:bg-slate-900/60 hover:border-blue-500/30 transition-all duration-500 shadow-xl"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-950 border border-white/5 flex items-center justify-center font-bold text-xl text-slate-900 dark:text-white group-hover/card:border-blue-500/30 group-hover/card:text-blue-400 transition-all duration-300 shadow-inner">
                                                {partner.logo}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-base text-slate-900 dark:text-white tracking-tight group-hover/card:text-blue-50 transition-colors">
                                                    {partner.name}
                                                </h3>
                                                <div className="text-[10px] text-slate-900 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                                    {partner.role}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="text-[9px] font-bold uppercase text-slate-500 tracking-wider mb-1.5">Match</div>
                                            <div className="text-[11px] font-bold text-blue-400 bg-blue-500/5 px-2.5 py-1 rounded-lg border border-blue-500/10">
                                                {partner.matching}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between pt-5 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${partner.status === 'Actively Hiring' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse' :
                                                partner.status === 'Reviewing Profiles' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                    'bg-indigo-500'
                                                }`} />
                                            <span className="text-[10px] text-slate-900 dark:text-slate-400 font-bold uppercase tracking-wider">
                                                {partner.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={(e) => toggleSaveJob(partner.id, e)}
                                                className="text-slate-500 hover:text-blue-500 transition-colors"
                                            >
                                                {savedJobs.includes(partner.id) ? (
                                                    <BookmarkCheck className="w-4 h-4 text-blue-500" />
                                                ) : (
                                                    <Bookmark className="w-4 h-4" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setSelectedPartner(partner)}
                                                className="text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:text-slate-900 dark:text-white flex items-center gap-1.5 group/btn transition-colors"
                                            >
                                                Details
                                                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
            {/* ── Partner Details Modal ── */}
            <AnimatePresence>
                {selectedPartner && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedPartner(null)}
                            className="fixed inset-0 bg-white dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white dark:bg-slate-900 border border-white/10 w-full max-w-lg rounded-[2rem] overflow-hidden relative shadow-2xl backdrop-blur-3xl"
                            >
                                {/* Header Background Gradient */}
                                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />

                                {/* Header Actions */}
                                <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                                    <button
                                        onClick={() => toggleSaveJob(selectedPartner.id)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-full border transition-colors ${savedJobs.includes(selectedPartner.id)
                                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-900 dark:text-slate-400'
                                            }`}
                                    >
                                        {savedJobs.includes(selectedPartner.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => setSelectedPartner(null)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-900 dark:text-zinc-400 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="p-8 relative z-10">
                                    <div className="flex items-center gap-5 mb-6">
                                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 border border-white/10 flex items-center justify-center text-3xl font-black text-slate-900 dark:text-white shadow-lg">
                                            {selectedPartner.logo}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{selectedPartner.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Briefcase className="w-4 h-4 text-slate-500" />
                                                <span className="text-sm font-medium text-slate-900 dark:text-slate-400">{selectedPartner.role}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Company Match</span>
                                            <div className="flex items-center gap-2">
                                                <Target className="w-5 h-5 text-blue-400" />
                                                <span className="text-lg font-black text-blue-400">{selectedPartner.matching}</span>
                                            </div>
                                        </div>
                                        <div className="w-px h-10 bg-white/10" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-1">Location</span>
                                            <span className="text-sm font-medium text-slate-900 dark:text-zinc-300">{selectedPartner.locations}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                                <Users className="w-4 h-4 text-blue-400" />
                                                About the Role
                                            </h4>
                                            <p className="text-sm text-slate-900 dark:text-zinc-400 leading-relaxed">
                                                {selectedPartner.description}
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-blue-400" />
                                                Key Requirements
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedPartner.requirements.map((req: string, i: number) => (
                                                    <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-900 dark:text-zinc-300">
                                                        {req}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* AI Match Analysis */}
                                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                                                <span className="flex items-center gap-2">
                                                    <Target className="w-4 h-4 text-emerald-400" />
                                                    AI Skill Match Analysis
                                                </span>
                                                <span className="text-[10px] text-zinc-500 font-medium">Based on your mock interviews</span>
                                            </h4>
                                            <div className="space-y-4">
                                                {selectedPartner.skillMatch?.map((skill: any, idx: number) => (
                                                    <div key={idx}>
                                                        <div className="flex justify-between items-end mb-1.5">
                                                            <span className="text-xs font-semibold text-slate-900 dark:text-zinc-300">{skill.name}</span>
                                                            <span className="text-xs font-black text-emerald-400">{skill.score}%</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${skill.score}%` }}
                                                                transition={{ duration: 1, delay: 0.2 + (idx * 0.1) }}
                                                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-white/5">
                                        <Button
                                            onClick={handleApply}
                                            disabled={isApplying || applied}
                                            className="w-full h-12 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white overflow-hidden relative group border-0 shadow-lg shadow-blue-900/20"
                                        >
                                            <AnimatePresence mode="wait">
                                                {applied ? (
                                                    <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-emerald-50">
                                                        <CheckCircle2 className="w-5 h-5" />
                                                        Application Sent!
                                                    </motion.div>
                                                ) : isApplying ? (
                                                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                                        <Zap className="w-5 h-5 animate-pulse" />
                                                        Processing Profile...
                                                    </motion.div>
                                                ) : (
                                                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                                        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                                        1-Click Quick Apply
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </Button>
                                        <p className="text-center text-[10px] text-zinc-500 mt-3">
                                            Your profile and performance history will be securely shared with {selectedPartner.name}.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style jsx>{`
                .mask-linear-fade {
                    -webkit-mask-image: linear-gradient(to right, transparent, black 2%, black 98%, transparent);
                    mask-image: linear-gradient(to right, transparent, black 2%, black 98%, transparent);
                }
                .mask-linear-fade-right {
                    -webkit-mask-image: linear-gradient(to right, black 80%, transparent);
                    mask-image: linear-gradient(to right, black 80%, transparent);
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    )
}
