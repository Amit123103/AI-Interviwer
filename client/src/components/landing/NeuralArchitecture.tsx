"use client"

import React from "react"
import { motion } from "framer-motion"
import { Cpu, Database, Network, Eye, Layers, Zap, Target, Brain, Sparkles, FileText, ShieldAlert } from "lucide-react"

export default function NeuralArchitecture() {
    return (
        <section className="w-full py-24 sm:py-32 relative px-4 sm:px-6 bg-zinc-50">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

            <div className="container mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <p className="text-sm font-medium text-indigo-600">Under the Hood</p>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight text-zinc-900">
                                Powered by{" "}
                                <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">advanced AI</span>
                            </h2>
                            <p className="text-lg text-zinc-500 leading-relaxed max-w-xl">
                                Our platform is built on a modern AI architecture optimized for fast, accurate interview evaluation. We combine real-time audio/visual analysis with deep reasoning to evaluate your performance across 12 key dimensions.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <TechFeature icon={<Network className="w-5 h-5" />} title="Smart Context" desc="Parses your resume and job description to generate personalized, context-aware questions." accentColor="text-indigo-600" bgColor="bg-indigo-50" />
                            <TechFeature icon={<Eye className="w-5 h-5" />} title="Attention Tracking" desc="Monitors eye contact and engagement patterns to help improve your on-camera presence." accentColor="text-blue-600" bgColor="bg-blue-50" />
                            <TechFeature icon={<Database className="w-5 h-5" />} title="Knowledge Base" desc="Backed by a large repository of system design patterns and algorithmic best practices." accentColor="text-teal-600" bgColor="bg-teal-50" />
                            <TechFeature icon={<ShieldAlert className="w-5 h-5" />} title="Focus Monitoring" desc="Detects tab switching and distractions, helping you build focused interview habits." accentColor="text-rose-600" bgColor="bg-rose-50" />
                        </div>
                    </div>

                    <div className="relative space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <MetricCard title="Technical Depth" score={94} icon={<Cpu />} barColor="from-indigo-500 to-violet-500" valueColor="text-indigo-600" />
                            <MetricCard title="System Design" score={88} icon={<Layers />} barColor="from-blue-500 to-cyan-500" valueColor="text-blue-600" />
                            <MetricCard title="Communication" score={91} icon={<Zap />} barColor="from-emerald-500 to-teal-500" valueColor="text-emerald-600" />
                            <MetricCard title="Confidence" score={85} icon={<Target />} barColor="from-amber-500 to-orange-500" valueColor="text-amber-600" />
                        </div>

                        <div className="p-6 bg-white border border-zinc-200 rounded-2xl space-y-5 shadow-sm">
                            <p className="text-xs font-medium text-zinc-400 flex items-center gap-2">
                                <Sparkles className="w-3 h-3 text-indigo-500" /> How it connects
                            </p>
                            <div className="flex items-center justify-center gap-6 py-3">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-600">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <span className="text-[9px] text-blue-500 font-medium">Resume</span>
                                </div>
                                <motion.div className="h-px flex-1 bg-gradient-to-r from-blue-200 via-indigo-400 to-indigo-200"
                                    animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-indigo-50 border border-indigo-200 rounded-full flex items-center justify-center text-indigo-600">
                                        <Brain className="w-5 h-5" />
                                    </div>
                                    <span className="text-[9px] text-indigo-600 font-medium">AI Engine</span>
                                </div>
                                <motion.div className="h-px flex-1 bg-gradient-to-r from-indigo-200 via-emerald-400 to-emerald-200"
                                    animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} />
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center text-emerald-600">
                                        <Target className="w-4 h-4" />
                                    </div>
                                    <span className="text-[9px] text-emerald-500 font-medium">Questions</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

function TechFeature({ icon, title, desc, accentColor, bgColor }: { icon: React.ReactNode, title: string, desc: string, accentColor: string, bgColor: string }) {
    return (
        <div className="space-y-3 group">
            <div className={`w-10 h-10 rounded-xl ${bgColor} border border-zinc-200 flex items-center justify-center transition-all ${accentColor}`}>{icon}</div>
            <h4 className={`text-sm font-semibold ${accentColor}`}>{title}</h4>
            <p className="text-sm text-zinc-400 leading-relaxed group-hover:text-zinc-600 transition-colors">{desc}</p>
        </div>
    )
}

function MetricCard({ title, score, icon, barColor, valueColor }: { title: string, score: number, icon: React.ReactNode, barColor: string, valueColor: string }) {
    return (
        <div className="p-6 bg-white border border-zinc-200 rounded-2xl hover:border-zinc-300 transition-all group hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl ${valueColor}`}>{icon}</div>
                <div className={`text-xl font-bold ${valueColor}`}>{score}%</div>
            </div>
            <div className="space-y-2">
                <p className="text-xs text-zinc-400 group-hover:text-zinc-600 transition-colors">{title}</p>
                <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${score}%` }} transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full bg-gradient-to-r ${barColor}`} />
                </div>
            </div>
        </div>
    )
}
