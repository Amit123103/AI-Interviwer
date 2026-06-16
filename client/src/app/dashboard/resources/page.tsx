"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { ArrowLeft, BookOpen, Sparkles, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const Shimmer = () => <div className="w-full h-full min-h-[400px] animate-pulse bg-white/5 rounded-[40px]" />

const MeshBackground = dynamic(() => import("../components/MeshBackground"), { ssr: false })
const ResourcesVault = dynamic(() => import("../components/ResourcesVault"), { ssr: false, loading: () => <Shimmer /> })
const NotificationCenter = dynamic(() => import("../components/NotificationCenter"), { ssr: false })

export default function ResourcesPage() {
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const savedUser = localStorage.getItem("user")
        if (savedUser) setUser(JSON.parse(savedUser))
    }, [])

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white selection:bg-emerald-500/30 overflow-x-hidden">
            <MeshBackground />

            {/* Nav Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black/20 backdrop-blur-xl border-b border-slate-100 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/dashboard" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 group-hover:border-emerald-500/40 transition-all">
                                <ArrowLeft className="w-5 h-5 text-slate-500 dark:text-zinc-400 group-hover:text-emerald-400" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-zinc-500 group-hover:text-slate-900 dark:text-white transition-colors">Return to Bridge</span>
                        </Link>

                        <div className="h-6 w-[1px] bg-white/10" />

                        <div className="flex items-center gap-3">
                            <BookOpen className="w-5 h-5 text-emerald-400" />
                            <h1 className="text-sm font-black uppercase tracking-[0.3em]">Learning Library</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <NotificationCenter />
                        <div className="h-4 w-[1px] bg-white/10" />
                        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-slate-100 dark:border-white/5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Library Sync Active</span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    {/* Hero Section */}
                    <div className="relative p-12 rounded-[48px] bg-white dark:bg-zinc-900/40 border border-slate-100 dark:border-white/5 overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <BookOpen className="w-64 h-64 rotate-12" />
                        </div>

                        <div className="relative z-10 max-w-2xl space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Knowledge Repository v4.0</span>
                            </div>
                            <h2 className="text-5xl font-black tracking-tighter leading-none">
                                NEURAL <br />
                                <span className="text-emerald-400">ASSETS.</span>
                            </h2>
                            <p className="text-lg text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">
                                Access the platform's curated selection of technical documentation, video training sessions, and high-tier prep materials approved by the Intervyxa board.
                            </p>
                        </div>
                    </div>

                    <ResourcesVault />
                </motion.div>
            </div>
        </main>
    )
}
