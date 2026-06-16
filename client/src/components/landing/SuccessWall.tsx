"use client"

import React from "react"
import { motion } from "framer-motion"
import { Quote, Star, TrendingUp, Award, Sparkles, Users, Briefcase, Trophy, GraduationCap } from "lucide-react"

const TESTIMONIALS = [
    {
        name: "Alex Rivera",
        role: "Senior Frontend Engineer @ Google",
        text: "The AI interviewer challenged my system design thinking in ways I didn't expect. I went into my final rounds with zero anxiety.",
        growth: "+45% Confidence",
        accentColor: "text-indigo-600",
        borderHover: "hover:border-indigo-300",
        badgeBg: "bg-indigo-50 border-indigo-200",
    },
    {
        name: "Priya Sharma",
        role: "Fullstack Developer @ Uber",
        text: "The real-time feedback caught when I was getting too defensive. After a few sessions, my communication skills improved dramatically.",
        growth: "+30% Communication",
        accentColor: "text-blue-600",
        borderHover: "hover:border-blue-300",
        badgeBg: "bg-blue-50 border-blue-200",
    },
    {
        name: "Marcus Chen",
        role: "Staff Engineer @ Meta",
        text: "The live performance metrics helped me see exactly where my explanations were losing clarity. Game changer for system design interviews.",
        growth: "Offered L6 Role",
        accentColor: "text-emerald-600",
        borderHover: "hover:border-emerald-300",
        badgeBg: "bg-emerald-50 border-emerald-200",
    },
    {
        name: "Sofia Martinez",
        role: "ML Engineer @ Amazon",
        text: "I was skeptical at first. After 5 sessions, I nailed every behavioral question and got a 40% higher offer than expected.",
        growth: "+40% Offer",
        accentColor: "text-amber-600",
        borderHover: "hover:border-amber-300",
        badgeBg: "bg-amber-50 border-amber-200",
    },
    {
        name: "James Wilson",
        role: "Backend Lead @ Stripe",
        text: "It pushed me on CAP theorem trade-offs I hadn't considered. My system design rounds went from weak to my strongest area.",
        growth: "+52% Technical",
        accentColor: "text-rose-600",
        borderHover: "hover:border-rose-300",
        badgeBg: "bg-rose-50 border-rose-200",
    },
    {
        name: "Aisha Patel",
        role: "iOS Engineer @ Apple",
        text: "The voice analysis caught my filler words. After 3 sessions, I reduced them by 80%. My interviewer commented on how articulate I was.",
        growth: "Landed Dream Job",
        accentColor: "text-teal-600",
        borderHover: "hover:border-teal-300",
        badgeBg: "bg-teal-50 border-teal-200",
    },
]

export default function SuccessWall() {
    return (
        <section id="testimonials" className="w-full py-24 sm:py-32 relative px-4 sm:px-6">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

            <div className="container mx-auto">
                <div className="flex flex-col items-center text-center mb-20 space-y-4">
                    <p className="text-sm font-medium text-emerald-600 flex items-center gap-2">
                        <Award className="w-4 h-4" /> Success Stories
                    </p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
                        What engineers{" "}
                        <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">say</span>
                    </h2>
                    <p className="text-zinc-500 max-w-lg text-lg">
                        Real results from engineers who used Intervyxa to land positions at top tech companies.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-3xl mx-auto mb-16">
                    {[
                        { icon: <Users className="w-5 h-5" />, value: "50K+", label: "Active Users", color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
                        { icon: <Briefcase className="w-5 h-5" />, value: "89%", label: "Got Hired", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
                        { icon: <Trophy className="w-5 h-5" />, value: "12K+", label: "FAANG Offers", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
                        { icon: <GraduationCap className="w-5 h-5" />, value: "4.9★", label: "Avg Rating", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
                    ].map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                            className="flex flex-col items-center gap-2.5 p-5 bg-white border border-zinc-200 rounded-2xl hover:border-zinc-300 transition-all hover:shadow-md">
                            <div className={`w-10 h-10 rounded-xl ${s.bg} border flex items-center justify-center ${s.color}`}>{s.icon}</div>
                            <span className={`text-2xl font-bold tracking-tight ${s.color}`}>{s.value}</span>
                            <span className="text-xs text-zinc-400">{s.label}</span>
                        </motion.div>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TESTIMONIALS.map((t, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                            className={`bg-white border border-zinc-200 p-7 rounded-2xl space-y-6 relative group ${t.borderHover} transition-all duration-300 hover:shadow-lg`}>
                            <div className="absolute top-7 right-7 text-zinc-100 group-hover:text-zinc-200 transition-colors">
                                <Quote className="w-12 h-12" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex gap-0.5 text-amber-400">
                                    {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 fill-current" />)}
                                </div>
                                <p className="text-sm text-zinc-600 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                            </div>
                            <div className="flex items-end justify-between pt-4 border-t border-zinc-100">
                                <div>
                                    <h4 className={`text-sm font-semibold ${t.accentColor}`}>{t.name}</h4>
                                    <p className="text-xs text-zinc-400 mt-0.5">{t.role}</p>
                                </div>
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 ${t.badgeBg} border rounded-lg`}>
                                    <TrendingUp className={`w-3 h-3 ${t.accentColor}`} />
                                    <span className={`text-xs font-medium ${t.accentColor}`}>{t.growth}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-16 flex flex-col items-center gap-6">
                    <p className="text-xs text-zinc-400 font-medium flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-indigo-400" /> Trusted by engineers from <Sparkles className="w-3 h-3 text-indigo-400" />
                    </p>
                    <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
                        {[
                            { name: "Google", color: "text-blue-500" },
                            { name: "Uber", color: "text-zinc-600" },
                            { name: "Meta", color: "text-teal-500" },
                            { name: "Amazon", color: "text-amber-500" },
                            { name: "Apple", color: "text-zinc-600" },
                            { name: "Stripe", color: "text-emerald-500" },
                            { name: "Netflix", color: "text-rose-500" },
                            { name: "Microsoft", color: "text-blue-600" },
                        ].map((brand) => (
                            <span key={brand.name} className={`text-lg font-bold tracking-tight ${brand.color} opacity-30 hover:opacity-80 transition-all cursor-default`}>
                                {brand.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
