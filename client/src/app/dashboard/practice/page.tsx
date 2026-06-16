"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Play, Filter, Activity, Users, Store, Wrench, Globe, Building2, Briefcase, HeartPulse, GraduationCap, X } from "lucide-react"
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { COMPANY_TRACKS, ROLE_TRACKS, PracticeModule } from "./practiceData"
import MeshBackground from "../components/MeshBackground"
import HolographicHud from "@/components/ui/HolographicHud"
import TiltCard from "@/components/ui/TiltCard"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

const COMPANIES_CATEGORIES = [
    { id: "all", name: "All Companies" },
    { id: "Big Tech", name: "Big Tech (MAANG)" },
    { id: "Service & Consulting", name: "Service & Consulting" },
    { id: "Product & Startup", name: "Product & Startups" },
    { id: "Finance Tech", name: "Finance Tech" },
    { id: "Product Giant", name: "Product Giants" }
]

const ROLES_CATEGORIES = [
    { id: "all", name: "All Roles" },
    { id: "Software & IT", name: "Software & IT" },
    { id: "Data & AI", name: "Data & AI" },
    { id: "Government", name: "Government" },
    { id: "Healthcare", name: "Healthcare" },
    { id: "Engineering", name: "Engineering" },
    { id: "Business", name: "Business" },
]

export default function PracticePage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCompanyCategory, setSelectedCompanyCategory] = useState("all")
    const [selectedRoleCategory, setSelectedRoleCategory] = useState("all")
    const [activeTab, setActiveTab] = useState("companies") // 'companies' | 'roles'

    const filteredCompanies = useMemo(() => {
        return COMPANY_TRACKS.filter(module => {
            const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                module.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))

            const matchesCategory = selectedCompanyCategory === "all" || module.category === selectedCompanyCategory

            return matchesSearch && matchesCategory
        })
    }, [searchQuery, selectedCompanyCategory])

    const filteredRoles = useMemo(() => {
        return ROLE_TRACKS.filter(module => {
            const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                module.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))

            const matchesCategory = selectedRoleCategory === "all" || module.category === selectedRoleCategory

            return matchesSearch && matchesCategory
        })
    }, [searchQuery, selectedRoleCategory])

    const handleStartPractice = (module: PracticeModule) => {
        localStorage.setItem("selected_practice_module", JSON.stringify(module))
        router.push("/dashboard/interview/setup")
    }

    const PracticeCard = ({ module }: { module: PracticeModule }) => {
        const Icon = module.icon
        return (
            <TiltCard
                key={module.id}
                className="group relative overflow-hidden rounded-2xl bg-white/60 dark:bg-zinc-900/50 border border-slate-100 dark:border-white/5 hover:bg-white dark:bg-zinc-900/80 hover:border-violet-500/20 hover:shadow-[0_0_35px_rgba(139,92,246,0.06)] transition-all duration-500 cursor-pointer backdrop-blur-2xl hover-shine"
                onClick={() => handleStartPractice(module)}
            >
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                {/* HUD Decoration */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <CardContent className="p-6 relative z-10">
                    <div className="flex justify-between items-start mb-5">
                        <div className={`w-12 h-12 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-100 dark:border-white/5 flex items-center justify-center ${module.color} shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-xl relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-white/5 animate-pulse" />
                            {Icon ? <Icon className="w-6 h-6 relative z-10" /> : <Activity className="w-6 h-6 relative z-10" />}
                        </div>
                        <div className="flex gap-1.5">
                            {module.difficultyLevels.includes("Expert") && (
                                <span className="px-2.5 py-1 bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest rounded-md border border-red-500/20">Elite</span>
                            )}
                            <span className="px-2.5 py-1 bg-white/5 text-zinc-500 text-[9px] font-black uppercase tracking-widest rounded-md border border-slate-100 dark:border-white/5 group-hover:bg-white/10 transition-colors">
                                {module.category}
                            </span>
                        </div>
                    </div>

                    <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors italic">{module.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 h-10 mb-5 group-hover:text-slate-900 dark:text-zinc-300 transition-colors leading-relaxed font-medium">{module.description}</p>

                    <div className="flex flex-wrap gap-1.5 mb-6">
                        {module.topics.slice(0, 3).map(topic => (
                            <span key={topic} className="px-2 py-1 text-[9px] font-black uppercase tracking-wider bg-white dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-md text-zinc-600 group-hover:border-primary/20 group-hover:text-slate-900 dark:text-zinc-400 transition-all">
                                {topic}
                            </span>
                        ))}
                    </div>

                    <Button className="w-full bg-gradient-to-r from-violet-500/10 to-cyan-500/10 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:text-white border border-violet-500/15 hover:border-violet-500/30 hover:from-violet-500 hover:to-cyan-500 hover:text-slate-900 dark:text-white font-black uppercase tracking-[0.2em] h-10 rounded-xl transition-all duration-500 text-[10px] shadow-lg group-hover:shadow-violet-500/20">
                        Initiate Prep
                    </Button>
                </CardContent>
            </TiltCard>
        )
    }

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-white relative overflow-hidden aurora-glow">
            <MeshBackground />
            <HolographicHud />

            {/* Floating ambient orbs */}
            <div className="absolute top-32 right-20 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
            <div className="absolute bottom-20 left-20 w-72 h-72 bg-cyan-500/4 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '4s' }} />
            <div className="absolute top-[40%] left-1/2 w-64 h-64 bg-fuchsia-500/3 rounded-full blur-[110px] orb-float pointer-events-none" style={{ animationDelay: '2s' }} />
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10 space-y-8 relative z-10">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <DashboardHeader
                        title="AI Practice Hub"
                        subtitle={`Access ${COMPANY_TRACKS.length} Companies & ${ROLE_TRACKS.length} Roles for realistic interview prep.`}
                        breadcrumbs={[{ label: "Practice Mode" }]}
                    />

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                            type="text"
                            placeholder={activeTab === "companies" ? "Search Google, Amazon, TCS..." : "Search Roles, Govt, Medical..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-12 bg-white/60 dark:bg-zinc-900/50 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-zinc-500 rounded-xl text-sm focus-visible:ring-primary/50 transition-all focus:bg-white dark:bg-zinc-900"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-slate-900 dark:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                <Tabs defaultValue="companies" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between sticky top-0 z-10 bg-white dark:bg-zinc-950/40 backdrop-blur-3xl py-4 -mx-4 px-4 border-b border-slate-100 dark:border-white/5 md:static md:bg-transparent md:border-0 md:p-0 md:backdrop-blur-none">
                        <TabsList className="bg-white/60 dark:bg-zinc-900/50 p-1 border border-slate-200 dark:border-white/10 h-14 w-full md:w-auto inline-flex rounded-2xl overflow-hidden relative">
                            {/* Animated focus background */}
                            <TabsTrigger value="companies" className="h-12 px-8 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-slate-900 dark:text-white data-[state=active]:shadow-[0_0_20px_rgba(139,92,246,0.2)] text-[10px] font-black uppercase tracking-widest transition-all z-10">
                                <Store className="w-4 h-4 mr-2" />
                                Companies ({COMPANY_TRACKS.length})
                            </TabsTrigger>
                            <TabsTrigger value="roles" className="h-12 px-8 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-slate-900 dark:text-white data-[state=active]:shadow-[0_0_20px_rgba(6,182,212,0.2)] text-[10px] font-black uppercase tracking-widest transition-all z-10">
                                <Users className="w-4 h-4 mr-2" />
                                Roles ({ROLE_TRACKS.length})
                            </TabsTrigger>
                        </TabsList>

                        {/* Contextual Filters based on Active Tab */}
                        <div className="w-full md:w-auto overflow-x-auto no-scrollbar pb-1">
                            {activeTab === "companies" ? (
                                <div className="flex gap-2">
                                    {COMPANIES_CATEGORIES.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCompanyCategory(cat.id)}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border duration-300 ${selectedCompanyCategory === cat.id
                                                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-slate-900 dark:text-white border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                                                : "bg-white/60 dark:bg-zinc-900/50 text-slate-500 dark:text-zinc-400 border-slate-100 dark:border-white/5 hover:border-violet-500/20 hover:text-slate-900 dark:text-white"
                                                }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    {ROLES_CATEGORIES.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedRoleCategory(cat.id)}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border duration-300 ${selectedRoleCategory === cat.id
                                                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-900 dark:text-white border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                                                : "bg-white/60 dark:bg-zinc-900/50 text-slate-500 dark:text-zinc-400 border-slate-100 dark:border-white/5 hover:border-cyan-500/20 hover:text-slate-900 dark:text-white"
                                                }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <TabsContent value="companies" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {filteredCompanies.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredCompanies.map(module => <PracticeCard key={module.id} module={module} />)}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-zinc-900/30 rounded-2xl border border-slate-100 dark:border-white/5 border-dashed">
                                <Store className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">No companies found</h3>
                                <p className="text-zinc-500 max-w-md mx-auto mb-6">We couldn't find any company tracks matching "{searchQuery}" in the selected category.</p>
                                <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedCompanyCategory("all") }}>Clear Filters</Button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="roles" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {filteredRoles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredRoles.map(module => <PracticeCard key={module.id} module={module} />)}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-zinc-900/30 rounded-2xl border border-slate-100 dark:border-white/5 border-dashed">
                                <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">No roles found</h3>
                                <p className="text-zinc-500 max-w-md mx-auto mb-6">We couldn't find any roles matching "{searchQuery}" in the selected category.</p>
                                <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedRoleCategory("all") }}>Clear Filters</Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
