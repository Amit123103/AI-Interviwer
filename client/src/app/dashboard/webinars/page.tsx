"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Calendar, Users, Star, ArrowLeft, Clock, Tv, ChevronRight, Lock, X } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const UPCOMING_WEBINARS = [
    {
        id: 1,
        title: "Cracking the System Design Interview at Google",
        speaker: "Alex Xu",
        role: "Ex-Google Engineer & Author",
        date: "Today, 5:00 PM PST",
        attendees: 1240,
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
        tags: ["System Design", "FAANG"]
    },
    {
        id: 2,
        title: "React Performance Optimization Deep Dive",
        speaker: "Sarah Drasner",
        role: "Director of Engineering",
        date: "Tomorrow, 10:00 AM PST",
        attendees: 856,
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600",
        tags: ["Frontend", "React"]
    }
]

const RECORDED_WEBINARS = [
    {
        id: 101,
        title: "Mastering the Behavioral Interview (STAR Method)",
        speaker: "David Lee",
        role: "Senior Recruiter at Meta",
        duration: "45 mins",
        views: "12.5K",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80&w=600",
        tags: ["Behavioral", "HR"]
    },
    {
        id: 102,
        title: "Dynamic Programming Patterns for Interviews",
        speaker: "Neetcode",
        role: "Algorithmic Educator",
        duration: "1h 15m",
        views: "45K",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600",
        tags: ["Algorithms", "LeetCode"]
    },
    {
        id: 103,
        title: "Navigating Salary Negotiation in Tech",
        speaker: "Posh Consultant",
        role: "Career Strategist",
        duration: "55 mins",
        views: "8.2K",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=600",
        tags: ["Career", "Negotiation"]
    }
]

export default function WebinarsPage() {
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
    const [selectedVideoInfo, setSelectedVideoInfo] = useState({ title: "", speaker: "" })

    const openVideo = (title: string, speaker: string) => {
        setSelectedVideoInfo({ title, speaker })
        setIsVideoModalOpen(true)
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 pb-20 pt-16 md:pt-20">
            {/* Header / Nav */}
            <div className="border-b border-slate-100 dark:border-white/5 bg-white dark:bg-zinc-950/50 backdrop-blur-xl shrink-0 z-10 sticky top-16 md:top-20">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-zinc-500 hover:text-slate-900 dark:text-white transition-colors">
                            Dashboard
                        </Link>
                        <ChevronRight className="w-4 h-4 text-zinc-700" />
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                                <Tv className="w-4 h-4 text-rose-400" />
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">Expert Webinars</span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                {/* Hero Feature */}
                <div className="mb-12 relative rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 group">
                    <div className="absolute inset-0">
                        <img
                            src="https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&q=80&w=1200"
                            alt="Live Event"
                            className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
                    </div>

                    <div className="relative z-10 p-8 md:p-12 w-full md:max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            Live Now
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                            Inside the Mind of a <br /> Netflix Hiring Manager
                        </h1>
                        <p className="text-slate-500 dark:text-zinc-400 text-lg mb-8 leading-relaxed">
                            Join our exclusive roundtable with current Netflix VPs of Engineering as they discuss what actually matters in senior technical interviews.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <button
                                className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-slate-900 dark:text-white font-bold rounded-xl flex items-center gap-2 transition-colors"
                                onClick={() => openVideo("Inside the Mind of a Netflix Hiring Manager", "Netflix VP of Eng")}
                            >
                                <Play className="w-5 h-5 fill-current" /> Join Broadcast
                            </button>
                            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-900" />
                                    ))}
                                </div>
                                <div className="text-sm font-medium text-slate-600 dark:text-zinc-300">
                                    <span className="text-slate-900 dark:text-white font-bold">3.2k</span> tuning in
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upcoming */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-rose-400" /> Upcoming Sessions
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {UPCOMING_WEBINARS.map(webinar => (
                            <Card key={webinar.id} className="bg-white/60 dark:bg-zinc-900/50 border-slate-100 dark:border-white/5 hover:border-white/10 transition-colors overflow-hidden group">
                                <div className="h-48 relative overflow-hidden">
                                    <img src={webinar.image} alt={webinar.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        {webinar.tags.map(tag => (
                                            <Badge key={tag} className="bg-white dark:bg-black/50 backdrop-blur-md text-slate-900 dark:text-white border-slate-200 dark:border-white/10">{tag}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="text-rose-400 font-semibold text-sm mb-2">{webinar.date}</div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">{webinar.title}</h3>
                                    <p className="text-slate-500 dark:text-zinc-400 text-sm mb-4">{webinar.speaker} • {webinar.role}</p>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-1.5 text-zinc-500 text-sm font-medium">
                                            <Users className="w-4 h-4" /> {webinar.attendees} RSVP'd
                                        </div>
                                        <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-900 dark:text-white text-sm font-bold rounded-lg transition-colors border border-slate-100 dark:border-white/5 hover:border-white/20">
                                            RSVP
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Library */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Play className="w-6 h-6 text-blue-400" /> Masterclass Library
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {RECORDED_WEBINARS.map(recording => (
                            <Card
                                key={recording.id}
                                className="bg-white/60 dark:bg-zinc-900/50 border-slate-100 dark:border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-colors p-3 group cursor-pointer flex gap-4 items-center"
                                onClick={() => openVideo(recording.title, recording.speaker)}
                            >
                                <div className="relative w-32 h-24 rounded-lg overflow-hidden shrink-0">
                                    <img src={recording.image} alt={recording.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-white dark:bg-black/20 group-hover:bg-transparent transition-colors" />
                                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-white dark:bg-black/70 backdrop-blur-md text-slate-900 dark:text-white text-[10px] font-bold rounded">
                                        {recording.duration}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0 py-1">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">{recording.title}</h3>
                                    <p className="text-zinc-500 text-xs mb-2 line-clamp-1">{recording.speaker}</p>
                                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                                        <span>{recording.views} views</span>
                                        <div className="flex items-center gap-1 text-amber-400">
                                            <Star className="w-3 h-3 fill-current" /> {recording.rating}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Video Modal */}
                <AnimatePresence>
                    {isVideoModalOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-white dark:bg-black/95 backdrop-blur-xl z-[60] flex items-center justify-center p-4 md:p-10"
                                onClick={() => setIsVideoModalOpen(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-slate-50 dark:bg-black rounded-3xl shadow-[0_0_100px_rgba(244,63,94,0.15)] z-[60] overflow-hidden border border-slate-200 dark:border-white/10"
                            >
                                <div className="absolute top-4 right-4 z-10 flex gap-2">
                                    <button onClick={() => setIsVideoModalOpen(false)} className="w-10 h-10 bg-white dark:bg-black/50 hover:bg-white dark:bg-black/80 backdrop-blur-md rounded-xl flex items-center justify-center text-slate-900 dark:text-white border border-slate-300 dark:border-white/20 transition-all">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="aspect-video w-full bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-white/10 relative flex items-center justify-center">
                                    {/* Placeholder YouTube Embed */}
                                    <iframe
                                        src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="absolute inset-0 w-full h-full border-0"
                                    />
                                </div>
                                <div className="p-6 md:p-8 bg-white dark:bg-zinc-950">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge className="bg-rose-500/20 text-rose-400 border border-rose-500/30">Masterclass</Badge>
                                        <span className="text-sm font-bold text-zinc-500">{selectedVideoInfo.speaker}</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{selectedVideoInfo.title}</h2>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

            </main>
        </div>
    )
}
