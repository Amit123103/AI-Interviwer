"use client"

import React from "react"
import { motion } from "framer-motion"
import {
    Upload, Brain, MessageSquare, BarChart3,
    FileText, Rocket, Check,
    Code2, Users, Video, BookOpen, GraduationCap
} from "lucide-react"

const STEPS = [
    {
        step: "01",
        title: "Upload Your Resume",
        subtitle: "Smart document analysis",
        desc: "Our system parses your resume, extracting skills, projects, and experience. It learns your unique background in seconds to personalize the interview.",
        features: ["PDF & DOCX Support", "Skill Extraction", "Experience Mapping", "Project Analysis"],
        icon: <Upload className="w-6 h-6" />,
        color: "indigo",
        illustration: <ResumeIllustration />,
    },
    {
        step: "02",
        title: "AI Interview Begins",
        subtitle: "Adaptive questioning",
        desc: "The AI asks personalized questions based on your profile and target role. It adapts in real-time — going deeper on your strengths and adjusting difficulty where needed.",
        features: ["Voice Recognition", "Sentiment Analysis", "Adaptive Difficulty", "Real-Time Feedback"],
        icon: <MessageSquare className="w-6 h-6" />,
        color: "blue",
        illustration: <InterviewIllustration />,
    },
    {
        step: "03",
        title: "Real-Time Analysis",
        subtitle: "Multi-dimensional evaluation",
        desc: "Every answer is analyzed across 12 dimensions — technical accuracy, communication clarity, confidence level, and problem-solving approach.",
        features: ["Voice Tone Analysis", "Confidence Tracking", "Technical Scoring", "Behavioral Assessment"],
        icon: <BarChart3 className="w-6 h-6" />,
        color: "teal",
        illustration: <AnalyticsIllustration />,
    },
    {
        step: "04",
        title: "Get Your Report",
        subtitle: "Actionable insights",
        desc: "Receive a comprehensive report with a STAR-method breakdown, improvement areas, and a readiness score that predicts your interview success.",
        features: ["STAR Method Report", "Improvement Plan", "Readiness Score", "Peer Comparison"],
        icon: <FileText className="w-6 h-6" />,
        color: "emerald",
        illustration: <ReportIllustration />,
    },
]

function ResumeIllustration() {
    return (
        <div className="relative w-full h-44 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
            <motion.div initial={{ rotate: -3 }} whileInView={{ rotate: 0 }}
                className="relative w-28 h-36 bg-white border border-zinc-200 rounded-xl p-3.5 shadow-lg">
                <div className="space-y-2">
                    <div className="h-2 w-14 bg-indigo-200 rounded-full" />
                    <div className="h-1.5 w-full bg-zinc-100 rounded-full" />
                    <div className="h-1.5 w-16 bg-zinc-100 rounded-full" />
                    <div className="h-px w-full bg-zinc-100 my-1.5" />
                    <div className="flex gap-1">
                        <div className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-200 rounded text-[7px] font-medium text-indigo-600">React</div>
                        <div className="px-1.5 py-0.5 bg-blue-50 border border-blue-200 rounded text-[7px] font-medium text-blue-600">Node</div>
                        <div className="px-1.5 py-0.5 bg-teal-50 border border-teal-200 rounded text-[7px] font-medium text-teal-600">AWS</div>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 rounded-full" />
                </div>
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity }}
                    className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-lg bg-indigo-100 border border-indigo-300 flex items-center justify-center">
                    <Upload className="w-3 h-3 text-indigo-600" />
                </motion.div>
            </motion.div>
        </div>
    )
}

function InterviewIllustration() {
    return (
        <div className="relative w-full h-44 flex items-center justify-center gap-6 bg-gradient-to-br from-blue-50 to-white">
            <div className="flex flex-col items-center gap-2">
                <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 3, repeat: Infinity }}
                    className="w-12 h-12 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-blue-600" />
                </motion.div>
                <span className="text-[9px] font-medium text-blue-600">AI</span>
            </div>
            <div className="flex items-center gap-1">
                {[0, 1, 2].map(i => (
                    <motion.div key={i} animate={{ opacity: [0.2, 0.8, 0.2], scaleY: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                        className="w-1 h-5 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full" />
                ))}
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                    <Users className="w-5 h-5 text-teal-600" />
                </div>
                <span className="text-[9px] font-medium text-teal-600">You</span>
            </div>
        </div>
    )
}

function AnalyticsIllustration() {
    const bars = [85, 92, 78, 96, 88, 72]
    const colors = ["bg-indigo-400", "bg-blue-400", "bg-teal-400", "bg-emerald-400", "bg-amber-400", "bg-rose-400"]
    return (
        <div className="relative w-full h-44 flex items-end justify-center gap-2.5 pb-5 bg-gradient-to-br from-teal-50 to-white">
            {bars.map((h, i) => (
                <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${h}%` }}
                    transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
                    className={`w-5 ${colors[i]} rounded-t-md opacity-60`} />
            ))}
        </div>
    )
}

function ReportIllustration() {
    return (
        <div className="relative w-full h-44 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white">
            <motion.div initial={{ scale: 0.9 }} whileInView={{ scale: 1 }}
                className="relative w-28 h-28 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-lg">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#f4f4f5" strokeWidth="3" />
                    <motion.circle cx="50" cy="50" r="42" fill="none" stroke="url(#reportGrad)" strokeWidth="3"
                        strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 42}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                        whileInView={{ strokeDashoffset: 2 * Math.PI * 42 * 0.08 }}
                        transition={{ duration: 2, ease: "easeOut" }} />
                    <defs>
                        <linearGradient id="reportGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="text-center">
                    <div className="text-xl font-bold text-emerald-600">92%</div>
                    <div className="text-[9px] text-zinc-400">Ready</div>
                </div>
            </motion.div>
        </div>
    )
}

const EXTRA_FEATURES = [
    { icon: <Code2 className="w-5 h-5" />, title: "Live Coding", desc: "Solve problems with real-time AI guidance and complexity analysis.", color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
    { icon: <Video className="w-5 h-5" />, title: "Video Analysis", desc: "Body language and expression analysis through computer vision.", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
    { icon: <BookOpen className="w-5 h-5" />, title: "Study Paths", desc: "Personalized study roadmaps based on your performance gaps.", color: "text-teal-600", bg: "bg-teal-50 border-teal-200" },
    { icon: <GraduationCap className="w-5 h-5" />, title: "Company Prep", desc: "Tailored question banks for FAANG, startups, and enterprise.", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
]

export default function HowItWorks() {
    const colorMap: Record<string, { text: string; border: string; bg: string }> = {
        indigo: { text: "text-indigo-600", border: "border-indigo-200", bg: "bg-indigo-50" },
        blue: { text: "text-blue-600", border: "border-blue-200", bg: "bg-blue-50" },
        teal: { text: "text-teal-600", border: "border-teal-200", bg: "bg-teal-50" },
        emerald: { text: "text-emerald-600", border: "border-emerald-200", bg: "bg-emerald-50" },
    }

    return (
        <section id="how-it-works" className="w-full py-24 sm:py-32 relative px-4 sm:px-6">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

            <div className="container mx-auto">
                <div className="flex flex-col items-center text-center mb-20 space-y-4">
                    <p className="text-sm font-medium text-amber-600 flex items-center gap-2">
                        <Rocket className="w-4 h-4" /> Step by step
                    </p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
                        How it{" "}
                        <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">works</span>
                    </h2>
                    <p className="text-zinc-500 max-w-2xl text-lg">
                        From resume upload to interview mastery — four simple steps to transform your preparation.
                    </p>
                </div>

                <div className="space-y-12 max-w-5xl mx-auto">
                    {STEPS.map((step, i) => {
                        const c = colorMap[step.color]
                        const isEven = i % 2 === 0
                        return (
                            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }} viewport={{ once: true, margin: "-50px" }}
                                className="grid lg:grid-cols-2 gap-8 items-center">
                                <div className={`space-y-5 ${!isEven ? 'lg:order-2' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center ${c.text}`}>{step.icon}</div>
                                        <div>
                                            <p className={`text-xs font-medium ${c.text}`}>Step {step.step}</p>
                                            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900">{step.title}</h3>
                                        </div>
                                    </div>
                                    <p className={`text-xs font-medium ${c.text}`}>{step.subtitle}</p>
                                    <p className="text-zinc-500 leading-relaxed">{step.desc}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {step.features.map((f, j) => (
                                            <div key={j} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-full text-xs text-zinc-600">
                                                <Check className="w-3 h-3 text-emerald-500" />{f}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className={`${!isEven ? 'lg:order-1' : ''}`}>
                                    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-md">{step.illustration}</div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                <div className="mt-28">
                    <div className="text-center mb-12">
                        <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900">And so much more</h3>
                        <p className="text-zinc-500 mt-3 max-w-lg mx-auto">Every tool you need to prepare, built into one platform.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
                        {EXTRA_FEATURES.map((f, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                className="p-6 bg-white border border-zinc-200 rounded-2xl hover:border-zinc-300 transition-all group space-y-3 hover:shadow-md">
                                <div className={`w-10 h-10 rounded-xl ${f.bg} border flex items-center justify-center ${f.color} group-hover:scale-105 transition-transform`}>{f.icon}</div>
                                <h4 className={`text-sm font-semibold ${f.color}`}>{f.title}</h4>
                                <p className="text-zinc-400 text-xs leading-relaxed group-hover:text-zinc-600 transition-colors">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
