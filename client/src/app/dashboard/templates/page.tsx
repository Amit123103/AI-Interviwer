"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Play, Eye, Filter, CheckCircle2, Clock } from "lucide-react"
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { INTERVIEW_TEMPLATES, CATEGORIES, INTERVIEW_TYPES, DIFFICULTY_LEVELS, InterviewTemplate } from "./data"
import MeshBackground from "../components/MeshBackground"
import HolographicHud from "@/components/ui/HolographicHud"
import TiltCard from "@/components/ui/TiltCard"
import { motion, AnimatePresence } from "framer-motion"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export default function TemplatesPage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All Categories")
    const [selectedType, setSelectedType] = useState("All Types")
    const [selectedDifficulty, setSelectedDifficulty] = useState("All Levels")
    const [previewTemplate, setPreviewTemplate] = useState<InterviewTemplate | null>(null)
    const [activeTab, setActiveTab] = useState("Company") // Default active tab

    // Filter Logic
    const isFiltering = searchQuery !== "" || selectedCategory !== "All Categories" || selectedType !== "All Types" || selectedDifficulty !== "All Levels"

    const filteredTemplates = useMemo(() => {
        return INTERVIEW_TEMPLATES.filter(template => {
            const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
                template.topicsCovered.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))

            const matchesCategory = selectedCategory === "All Categories" || template.category === selectedCategory
            const matchesType = selectedType === "All Types" || template.interviewType === selectedType
            const matchesDifficulty = selectedDifficulty === "All Levels" || template.difficulty === selectedDifficulty

            return matchesSearch && matchesCategory && matchesType && matchesDifficulty
        })
    }, [searchQuery, selectedCategory, selectedType, selectedDifficulty])

    // Section Logic for "Company", "Government", "Medical"
    const companyTemplates = useMemo(() => filteredTemplates.filter(t => t.section === "Company"), [filteredTemplates])
    const govtTemplates = useMemo(() => filteredTemplates.filter(t => t.section === "Government"), [filteredTemplates])
    const medicalTemplates = useMemo(() => filteredTemplates.filter(t => t.section === "Medical"), [filteredTemplates])

    const handleStartInterview = (template: InterviewTemplate) => {
        localStorage.setItem("selected_template", JSON.stringify(template))
        router.push("/dashboard/interview/setup")
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "Beginner": return "bg-green-500/10 text-green-500 border-green-500/20"
            case "Intermediate": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
            case "Advanced": return "bg-red-500/10 text-red-500 border-red-500/20"
            default: return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case "Technical": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
            case "Coding": return "bg-purple-500/10 text-purple-500 border-purple-500/20"
            case "Mixed": return "bg-primary/10 text-primary border-primary/20"
            case "Behavioral": return "bg-pink-500/10 text-pink-500 border-pink-500/20"
            case "HR": return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
            case "Situational": return "bg-orange-500/10 text-orange-500 border-orange-500/20"
            case "Personality": return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
            case "Case Study": return "bg-slate-500/10 text-slate-500 border-slate-500/20"
            default: return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
        }
    }

    // Single Template Card Component for Reusability
    const TemplateCard = ({ template }: { template: InterviewTemplate }) => {
        const Icon = template.icon
        return (
            <TiltCard
                className="group relative overflow-hidden rounded-2xl bg-white/60 dark:bg-zinc-900/50 border border-slate-100 dark:border-white/5 hover:bg-white dark:bg-zinc-900/80 hover:border-violet-500/20 hover:shadow-[0_0_35px_rgba(139,92,246,0.06)] transition-all duration-500 backdrop-blur-2xl hover-shine"
            >
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                {/* Holographic Accent */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-violet-500/5 rounded-full blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />

                <CardContent className="p-6 space-y-4 relative z-10">
                    {/* Tags */}
                    {template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 min-h-[26px]">
                            {template.tags.slice(0, 2).map(tag => (
                                <span
                                    key={tag}
                                    className="px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.15em] bg-violet-500/10 text-violet-400 rounded-md border border-violet-500/20"
                                >
                                    {tag}
                                </span>
                            ))}
                            {template.tags.length > 2 && (
                                <span className="px-2 py-0.5 text-[9px] text-zinc-600 font-black uppercase tracking-widest">+{template.tags.length - 2}</span>
                            )}
                        </div>
                    )}

                    {/* Icon & Title */}
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-white dark:bg-zinc-950 border border-slate-100 dark:border-white/5 flex items-center justify-center ${template.color} shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-xl relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-white/5 animate-pulse" />
                            {Icon ? <Icon className="w-6 h-6 relative z-10" /> : <Clock className="w-6 h-6 relative z-10" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-black tracking-tight mb-1 leading-tight group-hover:text-violet-400 transition-colors">{template.title}</h3>
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest truncate">{template.category}</p>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 min-h-[32px] font-medium leading-relaxed">
                        {template.description}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2">
                        <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-md border ${getTypeColor(template.interviewType)}`}>
                            {template.interviewType}
                        </span>
                        <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-md border ${getDifficultyColor(template.difficulty)}`}>
                            {template.difficulty}
                        </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-[10px] text-zinc-500 border-t border-slate-100 dark:border-white/5 pt-3 mt-2 font-black uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-violet-400/60" /> {template.duration}M</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60" /> {template.questionCount} Q</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewTemplate(template)}
                            className="flex-1 h-9 rounded-xl border-slate-200 dark:border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest"
                        >
                            <Eye className="w-3 h-3 mr-2" />
                            Scanner
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handleStartInterview(template)}
                            className="flex-1 h-9 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-slate-900 dark:text-white hover:from-violet-400 hover:to-fuchsia-400 font-black text-[10px] uppercase tracking-widest shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] transition-all duration-300"
                        >
                            <Play className="w-3 h-3 mr-2 fill-current" />
                            Uplink
                        </Button>
                    </div>
                </CardContent>
            </TiltCard>
        )
    }

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-white relative overflow-hidden aurora-glow">
            <MeshBackground />
            <HolographicHud />

            {/* Floating ambient orbs */}
            <div className="absolute top-28 right-16 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
            <div className="absolute bottom-24 left-20 w-72 h-72 bg-fuchsia-500/4 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />
            <div className="absolute top-[50%] left-1/2 w-64 h-64 bg-cyan-500/3 rounded-full blur-[110px] orb-float pointer-events-none" style={{ animationDelay: '5s' }} />
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10 space-y-6 relative z-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <DashboardHeader
                        title="Template Library"
                        subtitle={`Explore ${INTERVIEW_TEMPLATES.length}+ curated interview templates across industries.`}
                        breadcrumbs={[{ label: "Templates" }]}
                    />
                    {/* Search Bar - Positioned in header on desktop */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                            type="text"
                            placeholder="Search roles (Direct filtering)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-11 bg-white/60 dark:bg-zinc-900/50 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-zinc-500 rounded-xl text-sm focus-visible:ring-primary/50"
                        />
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="bg-white dark:bg-zinc-900/30 p-1.5 rounded-xl border border-slate-100 dark:border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="bg-transparent border-0 h-9 min-w-[140px] focus:ring-0 text-slate-500 dark:text-zinc-400 data-[state=open]:text-slate-900 dark:text-white hover:text-slate-900 dark:text-white transition-colors">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="w-px bg-white/10 my-1" />
                        <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger className="bg-transparent border-0 h-9 min-w-[140px] focus:ring-0 text-slate-500 dark:text-zinc-400 data-[state=open]:text-slate-900 dark:text-white hover:text-slate-900 dark:text-white transition-colors">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {INTERVIEW_TYPES.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="w-px bg-white/10 my-1" />
                        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                            <SelectTrigger className="bg-transparent border-0 h-9 min-w-[140px] focus:ring-0 text-slate-500 dark:text-zinc-400 data-[state=open]:text-slate-900 dark:text-white hover:text-slate-900 dark:text-white transition-colors">
                                <SelectValue placeholder="Difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                {DIFFICULTY_LEVELS.map(level => (
                                    <SelectItem key={level} value={level}>{level}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {isFiltering && (
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setSearchQuery("")
                                setSelectedCategory("All Categories")
                                setSelectedType("All Types")
                                setSelectedDifficulty("All Levels")
                            }}
                            className="text-zinc-500 hover:text-slate-900 dark:text-white h-12 lg:w-auto w-full"
                        >
                            Clear Filters
                        </Button>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="min-h-[600px]">
                    {isFiltering ? (
                        // If Filtering: Show Unified Grid
                        <div>
                            <div className="mb-4 text-sm text-zinc-500">
                                Found {filteredTemplates.length} matching templates
                            </div>
                            {filteredTemplates.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredTemplates.map(t => <TemplateCard key={t.id} template={t} />)}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white dark:bg-zinc-900/30 rounded-2xl border border-slate-100 dark:border-white/5 border-dashed">
                                    <p className="text-zinc-500">No templates found matching your criteria.</p>
                                    <Button variant="link" onClick={() => setSearchQuery("")}>Clear Search</Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        // If NOT Filtering: Show Tabs
                        <Tabs defaultValue="Company" className="space-y-6" onValueChange={setActiveTab}>
                            <TabsList className="bg-white/60 dark:bg-zinc-900/50 p-1 border border-slate-100 dark:border-white/5 h-12 w-full md:w-auto inline-flex">
                                <TabsTrigger value="Company" className="h-10 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-slate-900 dark:text-white data-[state=active]:shadow-[0_0_15px_rgba(139,92,246,0.15)] text-slate-500 dark:text-zinc-400 transition-all">Company Roles ({companyTemplates.length})</TabsTrigger>
                                <TabsTrigger value="Government" className="h-10 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-cyan-500 data-[state=active]:text-slate-900 dark:text-white data-[state=active]:shadow-[0_0_15px_rgba(16,185,129,0.15)] text-slate-500 dark:text-zinc-400 transition-all">Government ({govtTemplates.length})</TabsTrigger>
                                <TabsTrigger value="Medical" className="h-10 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-slate-900 dark:text-white data-[state=active]:shadow-[0_0_15px_rgba(244,63,94,0.15)] text-slate-500 dark:text-zinc-400 transition-all">Medical ({medicalTemplates.length})</TabsTrigger>
                            </TabsList>

                            <TabsContent value="Company" className="mt-0 animate-in fade-in slide-in-from-left-4 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {companyTemplates.map(t => <TemplateCard key={t.id} template={t} />)}
                                </div>
                            </TabsContent>

                            <TabsContent value="Government" className="mt-0 animate-in fade-in slide-in-from-left-4 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {govtTemplates.map(t => <TemplateCard key={t.id} template={t} />)}
                                </div>
                            </TabsContent>

                            <TabsContent value="Medical" className="mt-0 animate-in fade-in slide-in-from-left-4 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {medicalTemplates.map(t => <TemplateCard key={t.id} template={t} />)}
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </div>

            {/* Preview Modal */}
            <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
                <DialogContent className="bg-white dark:bg-zinc-950/95 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white max-w-2xl max-h-[85vh] overflow-y-auto p-0 gap-0 rounded-2xl backdrop-blur-2xl shadow-[0_0_60px_rgba(139,92,246,0.08)]">
                    {previewTemplate && (
                        <>
                            <div className={`h-32 w-full bg-gradient-to-r from-violet-500/10 via-zinc-900 to-fuchsia-500/10 relative overflow-hidden flex items-center px-8 border-b border-white/5`}>
                                <div className="absolute inset-0 bg-white/5 opacity-50 pattern-grid-lg" />
                                <div className="flex items-center gap-6 relative z-10">
                                    <div className={`w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 flex items-center justify-center ${previewTemplate.color} shadow-2xl`}>
                                        {React.createElement(previewTemplate.icon, { className: "w-8 h-8" })}
                                    </div>
                                    <div className="space-y-1">
                                        <DialogTitle className="text-2xl font-bold">{previewTemplate.title}</DialogTitle>
                                        <DialogDescription className="text-slate-500 dark:text-zinc-400 text-base">{previewTemplate.category}</DialogDescription>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-3 rounded-xl bg-white/60 dark:bg-zinc-900/50 border border-slate-100 dark:border-white/5 text-center">
                                        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Type</div>
                                        <div className="font-bold text-sm">{previewTemplate.interviewType}</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/60 dark:bg-zinc-900/50 border border-slate-100 dark:border-white/5 text-center">
                                        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Level</div>
                                        <div className="font-bold text-sm">{previewTemplate.difficulty}</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/60 dark:bg-zinc-900/50 border border-slate-100 dark:border-white/5 text-center">
                                        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Time</div>
                                        <div className="font-bold text-sm">{previewTemplate.duration}m</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/60 dark:bg-zinc-900/50 border border-slate-100 dark:border-white/5 text-center">
                                        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Count</div>
                                        <div className="font-bold text-sm">{previewTemplate.questionCount} Qs</div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mb-3">Overview</h4>
                                    <p className="text-slate-600 dark:text-zinc-300 leading-relaxed text-sm md:text-base">{previewTemplate.description}</p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent mb-3">Key Topics</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {previewTemplate.topicsCovered.map(topic => (
                                            <span key={topic} className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-600 dark:text-zinc-300 text-sm border border-slate-100 dark:border-white/5">
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {previewTemplate.sampleQuestions && (
                                    <div>
                                        <h4 className="text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-3">Sample Questions</h4>
                                        <ul className="space-y-3">
                                            {previewTemplate.sampleQuestions.map((q, i) => (
                                                <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-zinc-300 bg-white dark:bg-zinc-900/30 p-3 rounded-lg border border-slate-100 dark:border-white/5">
                                                    <span className="text-zinc-500 font-mono text-xs pt-0.5">0{i + 1}</span>
                                                    <span>{q}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="pt-4">
                                    <Button size="lg" className="w-full h-14 text-lg font-bold bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 text-slate-900 dark:text-white hover:from-violet-400 hover:via-fuchsia-400 hover:to-cyan-400 shadow-[0_0_30px_rgba(139,92,246,0.2)] hover:shadow-[0_0_50px_rgba(139,92,246,0.3)] transition-all duration-500 hover:-translate-y-0.5" onClick={() => handleStartInterview(previewTemplate)}>
                                        Start Interview Session <Play className="w-5 h-5 ml-2 fill-current" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
