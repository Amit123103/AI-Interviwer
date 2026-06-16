"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Building2, Search, TrendingUp, Users, Zap, Target, ArrowRight, Star, HardHat
} from "lucide-react"
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import MeshBackground from "../components/MeshBackground"
import HolographicHud from "@/components/ui/HolographicHud"
import TiltCard from "@/components/ui/TiltCard"
import { motion, AnimatePresence } from "framer-motion"

// Category mapping for display
const CATEGORY_MAP: Record<string, string> = {
    "All": "All",
    "Product": "Product-Based",
    "Indian IT": "Service-Based",
    "Startups": "Startups",
    "Consulting": "Finance & Consulting",
    "FAANG": "Big Tech / FAANG"
}

const CATEGORIES = ["All", "Product", "Indian IT", "Startups", "Consulting", "FAANG"]

const DIFFICULTY_COLORS = {
    easy: "bg-green-500/10 text-green-500 border-green-500/20",
    medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    hard: "bg-orange-500/10 text-orange-500 border-orange-500/20"
}

export default function CompaniesPage() {
    const router = useRouter()
    const [companies, setCompanies] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCompanies()
    }, [selectedCategory])

    const fetchCompanies = async () => {
        try {
            setLoading(true)
            const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/companies`)
            if (selectedCategory !== "All") {
                url.searchParams.append("category", selectedCategory)
            }

            const response = await fetch(url.toString(), {
                headers: {
                    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user') || '{}').token}`
                }
            })
            const data = await response.json()
            setCompanies(data)
        } catch (error) {
            console.error("Error fetching companies:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredCompanies = companies.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-white p-4 sm:p-6 md:p-10 relative overflow-hidden aurora-glow">
            <MeshBackground />
            <HolographicHud />

            {/* Floating ambient orbs */}
            <div className="absolute top-24 right-16 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
            <div className="absolute bottom-20 left-12 w-72 h-72 bg-cyan-500/4 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />
            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 relative z-10">
                {/* Header */}
                <DashboardHeader
                    title="Company-Specific Prep"
                    subtitle="Prepare for specific companies with realistic mock interviews, common questions, and insider tips"
                    icon={<Building2 className="w-8 h-8" />}
                    breadcrumbs={[{ label: "Companies" }]}
                />

                {/* Search & Category Filter */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3 space-y-6">
                        <Card className="bg-white dark:bg-zinc-950/40 border-slate-100 dark:border-white/5 backdrop-blur-3xl relative overflow-hidden group">
                            {/* Decorative HUD scanning effect */}
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-violet-500/20 animate-pulse pointer-events-none" />

                            <CardContent className="p-4 sm:p-6 space-y-4 relative z-10">
                                {/* Search */}
                                <div className="relative group/search">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within/search:text-violet-400 transition-colors" />
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search 100+ global & Indian companies..."
                                        className="pl-10 h-14 bg-white dark:bg-zinc-900/40 border-slate-100 dark:border-white/5 text-lg rounded-2xl focus-visible:ring-violet-500/40 focus:bg-white dark:bg-zinc-900/60 transition-all font-black tracking-tight"
                                    />
                                    <div className="absolute inset-0 bg-violet-500/0 group-focus-within/search:bg-violet-500/5 -z-10 rounded-2xl transition-colors" />
                                </div>

                                {/* Category Tabs */}
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                                    {CATEGORIES.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(category)}
                                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-300 relative overflow-hidden ${selectedCategory === category
                                                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-slate-900 dark:text-white shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                                                : "bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-slate-900 dark:text-white border border-slate-100 dark:border-white/5"
                                                }`}
                                        >
                                            {CATEGORY_MAP[category]}
                                            {selectedCategory === category && (
                                                <motion.div layoutId="comp-cat-active" className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 -z-10" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Results Count */}
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500 dark:text-zinc-400">
                                Showing <span className="font-bold text-slate-900 dark:text-white">{filteredCompanies.length}</span> companies
                            </p>
                        </div>

                        {/* Company Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="h-64 bg-white dark:bg-zinc-950 border border-slate-100 dark:border-white/5 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredCompanies.map((company, index) => (
                                    <TiltCard
                                        key={company._id}
                                        className="bg-white dark:bg-zinc-950/40 border-slate-100 dark:border-white/5 hover:border-violet-500/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.06)] transition-all duration-300 cursor-pointer group flex flex-col relative overflow-hidden backdrop-blur-2xl hover-shine"
                                        onClick={() => router.push(`/dashboard/companies/${company.slug}`)}
                                    >
                                        {/* Holographic scanner for Top Results */}
                                        {index < 3 && (
                                            <motion.div
                                                className="absolute left-0 w-[1px] h-full bg-violet-500/40"
                                                animate={{ top: ["0%", "100%", "0%"] }}
                                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                            />
                                        )}

                                        <CardContent className="p-6 space-y-4 flex-1 flex flex-col relative z-10">
                                            {/* Header */}
                                            <div className="flex items-start justify-between">
                                                <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center text-2xl border border-slate-100 dark:border-white/5 group-hover:scale-110 transition-transform shadow-2xl">
                                                    {company.logo || "🏢"}
                                                </div>
                                                <Badge className={`${DIFFICULTY_COLORS[company.difficulty as keyof typeof DIFFICULTY_COLORS]} border text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-md`}>
                                                    {company.difficulty}
                                                </Badge>
                                            </div>

                                            <div className="space-y-1">
                                                <h3 className="font-black text-xl tracking-tighter group-hover:text-violet-400 transition-colors">
                                                    {company.name}
                                                </h3>
                                                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                                    {CATEGORY_MAP[company.category]}
                                                </div>
                                            </div>

                                            <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-medium">
                                                {company.overview}
                                            </p>

                                            <div className="pt-4 border-t border-slate-100 dark:border-white/5 mt-auto">
                                                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest mb-4">
                                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                                                        <Zap className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
                                                        <span>{company.hiringProcess?.length || 0} PHASES</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                                                        <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
                                                        <span>{company.successRate}% HIT</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    className="w-full bg-gradient-to-r from-violet-500/10 to-cyan-500/10 hover:from-violet-500 hover:to-cyan-500 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:text-white border-violet-500/15 font-black uppercase tracking-widest transition-all duration-500 h-10 rounded-xl"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        router.push(`/dashboard/companies/${company.slug}`)
                                                    }}
                                                >
                                                    Analysis
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </TiltCard>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && filteredCompanies.length === 0 && (
                            <Card className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10">
                                <CardContent className="p-12 text-center text-zinc-500">
                                    <Building2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <h3 className="text-xl font-bold text-slate-600 dark:text-zinc-300">No companies found</h3>
                                    <p className="mt-1">Try adjusting your search or filters</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <Card className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10 overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 w-full" />
                            <CardContent className="p-6 space-y-4">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Star className="w-4 h-4 text-violet-400" />
                                    Preparation Pack
                                </h3>
                                <div className="space-y-4 text-sm">
                                    {[
                                        { label: "Mock Interviews", icon: <Target className="w-4 h-4" /> },
                                        { label: "Past Questions", icon: <Search className="w-4 h-4" /> },
                                        { label: "Culture Guide", icon: <Users className="w-4 h-4" /> },
                                        { label: "Salary Insights", icon: <TrendingUp className="w-4 h-4" /> }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 text-slate-500 dark:text-zinc-400">
                                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-500">
                                                {item.icon}
                                            </div>
                                            <span>{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-violet-500/20">
                            <CardContent className="p-6">
                                <p className="text-sm font-medium text-slate-600 dark:text-zinc-300 mb-4 italic">
                                    "Our company-specific prep modules are modeled after real interview experiences from over 10,000 candidates."
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800" />
                                    <div>
                                        <div className="text-sm font-bold">James Wilson</div>
                                        <div className="text-xs text-zinc-500">Principal Recruiter</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
