"use client"

import React from "react"
import { motion } from "framer-motion"
import { Bot, Video, Users, Rocket, ExternalLink, ArrowRight, Play, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import TiltCard from "@/components/ui/TiltCard"

export default function CareerGrowthHub() {
    return (
        <section className="mt-24 space-y-8">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-orange-500/20 flex items-center justify-center">
                    <Rocket className="w-5 h-5 text-fuchsia-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        <span className="bg-gradient-to-r from-fuchsia-400 to-orange-400 bg-clip-text text-transparent">Career Growth</span> Hub
                    </h2>
                    <p className="text-xs text-zinc-500">Accelerate your journey to becoming job-ready</p>
                </div>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-fuchsia-500/15 to-transparent" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. AI Career Mentor */}
                <TiltCard>
                    <Card className="group relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900/30 backdrop-blur-xl border border-white/[0.06] p-8 hover:bg-white/[0.04] hover:border-blue-400/30 transition-all duration-500 h-[280px] flex flex-col hover-shine">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                                    <Bot className="w-7 h-7" />
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Online 24/7
                                </div>
                            </div>

                            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">AI Career Mentor</h3>
                            <p className="text-sm text-slate-900 dark:text-zinc-400 leading-relaxed mb-6 flex-1">
                                Receive personalized guidance, resume feedback, and daily tasks tailored to your goals. Step-by-step motivation.
                            </p>

                            <Link href="/dashboard/mentor" className="inline-flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors w-fit group/btn">
                                Chat with Mentor <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </Card>
                </TiltCard>

                {/* 2. Industry Expert Webinars */}
                <TiltCard>
                    <Card className="group relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900/30 backdrop-blur-xl border border-white/[0.06] p-8 hover:bg-white/[0.04] hover:border-rose-400/30 transition-all duration-500 h-[280px] flex flex-col hover-shine">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                                    <Video className="w-7 h-7" />
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Next Session</div>
                                    <div className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">Today, 5:00 PM</div>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Expert Webinars</h3>
                            <p className="text-sm text-slate-900 dark:text-zinc-400 leading-relaxed mb-6 flex-1">
                                Join live and recorded sessions from FAANG engineers. Master interviews and learn real-world industry trends.
                            </p>

                            <div className="flex items-center justify-between w-full">
                                <Link href="/dashboard/webinars" className="inline-flex items-center gap-2 text-sm font-bold text-rose-400 hover:text-rose-300 transition-colors group/btn">
                                    Browse Library <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors delay-100">
                                    <Play className="w-3.5 h-3.5 text-slate-900 dark:text-zinc-400 group-hover:text-rose-400 fill-current ml-0.5" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </TiltCard>

                {/* 3. Alumni Mentorship Network */}
                <TiltCard>
                    <Card className="group relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900/30 backdrop-blur-xl border border-white/[0.06] p-8 hover:bg-white/[0.04] hover:border-amber-400/30 transition-all duration-500 h-[280px] flex flex-col hover-shine">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-all duration-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                                    <Users className="w-7 h-7" />
                                </div>
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center overflow-hidden z-10 hover:z-20 hover:-translate-y-1 transition-transform">
                                            <div className="opacity-50 blur-[2px] bg-gradient-to-br from-amber-200 to-amber-600 w-full h-full" />
                                        </div>
                                    ))}
                                    <div className="w-8 h-8 rounded-full bg-amber-500/20 border-2 border-zinc-950 flex items-center justify-center text-[9px] font-bold text-amber-400 z-10">
                                        +42
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Alumni Mentorship</h3>
                            <p className="text-sm text-slate-900 dark:text-zinc-400 leading-relaxed mb-6 flex-1">
                                Connect with alumni in top tech roles. Schedule 1-on-1s, ask questions, and overcome workplace challenges.
                            </p>

                            <Link href="/dashboard/network" className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors w-fit group/btn">
                                Find a Mentor <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </Card>
                </TiltCard>

                {/* 4. Real Project Collaboration */}
                <TiltCard>
                    <Card className="group relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900/30 backdrop-blur-xl border border-white/[0.06] p-8 hover:bg-white/[0.04] hover:border-emerald-400/30 transition-all duration-500 h-[280px] flex flex-col hover-shine">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                                    <Rocket className="w-7 h-7" />
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Open Projects</div>
                                    <div className="flex items-center gap-1.5 justify-end">
                                        <div className="h-1.5 w-12 bg-zinc-800 rounded-full overflow-hidden">
                                            <div className="h-full w-2/3 bg-emerald-400 rounded-full" />
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-400">12</span>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Project Collaboration</h3>
                            <p className="text-sm text-slate-900 dark:text-zinc-400 leading-relaxed mb-4 flex-1">
                                Team up to build real-world, portfolio-ready applications. Share tasks, peer review code, and deploy.
                            </p>

                            <div className="flex flex-wrap gap-2 mb-6">
                                <span className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-400 bg-white/5 border border-white/10 rounded-md">Frontend</span>
                                <span className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-400 bg-white/5 border border-white/10 rounded-md">Fullstack</span>
                                <span className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Actively Hiring Teams</span>
                            </div>

                            <Link href="/dashboard/projects" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors w-fit group/btn">
                                Browse Projects <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </Card>
                </TiltCard>

            </div>
        </section>
    )
}
