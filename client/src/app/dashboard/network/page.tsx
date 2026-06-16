"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Search, Star, Play, Calendar as CalendarIcon, Clock, ArrowRight, CheckCircle2, X, Building2, Briefcase, Video } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import TiltCard from "@/components/ui/TiltCard"

// Mock Data
const FEATURED_MENTORS = [
    {
        id: "f1",
        name: "Elena Rodriguez",
        role: "Sr. Engineering Manager",
        company: "Google",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
        videoPlaceholder: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800",
        rating: 4.9,
        reviews: 124,
        tags: ["System Design", "Leadership", "Career Growth"],
        availability: "Next week"
    },
    {
        id: "f2",
        name: "David Chen",
        role: "Staff Software Engineer",
        company: "Meta",
        image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=600",
        videoPlaceholder: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
        rating: 5.0,
        reviews: 89,
        tags: ["Frontend Architecture", "React", "Tech Lead"],
        availability: "Tomorrow"
    },
    {
        id: "f3",
        name: "Sarah Jenkins",
        role: "Principal Product Designer",
        company: "Netflix",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600",
        videoPlaceholder: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
        rating: 4.8,
        reviews: 215,
        tags: ["UX Design", "Product Strategy", "Portfolio Review"],
        availability: "Available Now"
    }
]

const MENTORS = [
    {
        id: "m1",
        name: "James Wilson",
        role: "Backend Developer",
        company: "Amazon",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
        rating: 4.7,
        reviews: 42,
        tags: ["AWS", "Node.js", "Microservices"]
    },
    {
        id: "m2",
        name: "Priya Patel",
        role: "Data Scientist",
        company: "Apple",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
        rating: 4.9,
        reviews: 76,
        tags: ["Machine Learning", "Python", "Data Structure"]
    },
    {
        id: "m3",
        name: "Marcus Johnson",
        role: "Frontend Engineer",
        company: "Stripe",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
        rating: 4.8,
        reviews: 55,
        tags: ["React", "Typescript", "UI/UX"]
    },
    {
        id: "m4",
        name: "Chloe Kim",
        role: "DevOps Engineer",
        company: "Netflix",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300",
        rating: 4.6,
        reviews: 31,
        tags: ["CI/CD", "Kubernetes", "AWS"]
    },
    {
        id: "m5",
        name: "Alex Thorne",
        role: "Security Engineer",
        company: "Google",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300",
        rating: 5.0,
        reviews: 112,
        tags: ["Cybersecurity", "Networking", "System Design"]
    },
    {
        id: "m6",
        name: "Nina Simone",
        role: "Product Manager",
        company: "Atlassian",
        image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=300",
        rating: 4.9,
        reviews: 67,
        tags: ["Agile", "Product Management", "Interviews"]
    }
]

const COMPANIES = ["All", "Google", "Meta", "Netflix", "Amazon", "Apple", "Stripe", "Atlassian"]
const ROLES = ["All Roles", "Software Engineer", "Product Manager", "Data Scientist", "Designer", "DevOps"]

export default function AlumniNetworkPage() {
    const [selectedCompany, setSelectedCompany] = useState("All")
    const [selectedRole, setSelectedRole] = useState("All Roles")
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
    const [selectedMentor, setSelectedMentor] = useState<any>(null)
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
    const [bookingStep, setBookingStep] = useState(1) // 1: DateTime, 2: Success
    const [selectedDate, setSelectedDate] = useState<number | null>(null)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)

    // Derived states for filtering
    const filteredMentors = MENTORS.filter(m => {
        const matchCompany = selectedCompany === "All" || m.company === selectedCompany;
        const matchRole = selectedRole === "All Roles" || m.role.includes(selectedRole.split(' ')[0]); // Simple matching
        return matchCompany && matchRole;
    })

    const openBookingModal = (mentor: any) => {
        setSelectedMentor(mentor)
        setBookingStep(1)
        setSelectedDate(null)
        setSelectedTime(null)
        setIsBookingModalOpen(true)
    }

    const confirmBooking = () => {
        setBookingStep(2)
        setTimeout(() => {
            setIsBookingModalOpen(false)
        }, 3000)
    }

    const openVideoModal = (mentor: any) => {
        setSelectedMentor(mentor)
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
                        <span className="text-zinc-700">/</span>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                <Users className="w-4 h-4 text-amber-400" />
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">Alumni Mentorship</span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                {/* Intro Section */}
                <div className="mb-12">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                        Connect with <span className="text-amber-400">Industry Leaders</span>
                    </h1>
                    <p className="text-slate-500 dark:text-zinc-400 text-lg max-w-2xl">
                        Schedule 1-on-1 sessions, get resume feedback, or do mock interviews with alumni who are now working at your dream companies.
                    </p>
                </div>

                {/* Featured Video Intros */}
                <div className="mb-16">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Video className="w-5 h-5 text-amber-400" /> Featured Video Intros
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {FEATURED_MENTORS.map((mentor, i) => (
                            <motion.div
                                key={mentor.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card
                                    className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer border-slate-100 dark:border-white/5 hover:border-amber-500/30 transition-all duration-500 shadow-2xl"
                                    onClick={() => openVideoModal(mentor)}
                                >
                                    <img src={mentor.videoPlaceholder} alt={mentor.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                                    {/* Play Button Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-slate-300 dark:border-white/20 shadow-xl group-hover:scale-110 transition-transform">
                                            <Play className="w-6 h-6 text-slate-900 dark:text-white fill-current ml-1" />
                                        </div>
                                    </div>

                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-md">Featured</Badge>
                                    </div>

                                    <div className="absolute bottom-0 left-0 w-full p-6 text-slate-900 dark:text-white">
                                        <div className="flex items-center gap-3 mb-2">
                                            <img src={mentor.image} alt={mentor.name} className="w-10 h-10 rounded-full border-2 border-slate-300 dark:border-white/20 object-cover" />
                                            <div>
                                                <h3 className="font-bold text-lg leading-tight">{mentor.name}</h3>
                                                <p className="text-sm text-slate-600 dark:text-zinc-300 font-medium">{mentor.company}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white/60 dark:bg-zinc-900/50 backdrop-blur-xl border border-slate-100 dark:border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 mb-8 sticky top-36 z-20">
                    <div className="flex-1 overflow-x-auto pb-2 md:pb-0 custom-scrollbar flex gap-2">
                        {COMPANIES.map(company => (
                            <button
                                key={company}
                                onClick={() => setSelectedCompany(company)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${selectedCompany === company ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20' : 'bg-white/5 text-slate-500 dark:text-zinc-400 hover:bg-white/10 hover:text-slate-900 dark:text-white'}`}
                            >
                                {company}
                            </button>
                        ))}
                    </div>
                    <div className="hidden md:block w-px bg-white/10" />
                    <div className="w-full md:w-64 shrink-0 relative">
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-2 appearance-none outline-none focus:border-amber-500/50"
                        >
                            {ROLES.map(role => (
                                <option key={role} value={role} className="bg-white dark:bg-zinc-900">{role}</option>
                            ))}
                        </select>
                        <Briefcase className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>
                </div>

                {/* Mentor Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMentors.map(mentor => (
                        <TiltCard key={mentor.id}>
                            <Card className="bg-white dark:bg-zinc-900/30 backdrop-blur-xl border border-slate-100 dark:border-white/5 p-6 hover:bg-white/[0.02] hover:border-amber-500/30 transition-all duration-300 group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img src={mentor.image} alt={mentor.name} className="w-16 h-16 rounded-2xl object-cover" />
                                            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center p-0.5">
                                                <div className="w-full h-full bg-emerald-500 rounded-full animate-pulse" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-amber-400 transition-colors">{mentor.name}</h3>
                                            <p className="text-sm text-slate-500 dark:text-zinc-400">{mentor.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg">
                                        <Star className="w-3 h-3 text-amber-500 fill-current" />
                                        <span className="text-xs font-bold text-amber-500">{mentor.rating}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-6">
                                    <Building2 className="w-4 h-4 text-zinc-500" />
                                    <span className="text-sm font-semibold text-slate-600 dark:text-zinc-300">{mentor.company}</span>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {mentor.tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="bg-white/5 hover:bg-white/10 text-xs text-slate-600 dark:text-zinc-300 pointer-events-none font-medium">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex gap-3">
                                    <Button
                                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold"
                                        onClick={() => openBookingModal(mentor)}
                                    >
                                        Book Session
                                    </Button>
                                    <Button variant="outline" className="px-4 border-slate-200 dark:border-white/10 hover:bg-white/5 text-slate-900 dark:text-white">
                                        View Profile
                                    </Button>
                                </div>
                            </Card>
                        </TiltCard>
                    ))}

                    {filteredMentors.length === 0 && (
                        <div className="col-span-full py-20 text-center text-zinc-500">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8" />
                            </div>
                            <p>No mentors found matching your filters.</p>
                            <Button variant="link" className="text-amber-400" onClick={() => { setSelectedCompany("All"); setSelectedRole("All Roles"); }}>Clear Filters</Button>
                        </div>
                    )}
                </div>

                {/* Booking Modal */}
                <AnimatePresence>
                    {isBookingModalOpen && selectedMentor && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-white dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                onClick={() => setIsBookingModalOpen(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden"
                            >
                                {bookingStep === 1 ? (
                                    <>
                                        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-start bg-white dark:bg-zinc-900/30">
                                            <div className="flex items-center gap-4">
                                                <img src={selectedMentor.image} alt={selectedMentor.name} className="w-12 h-12 rounded-full object-cover" />
                                                <div>
                                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{selectedMentor.name}</h2>
                                                    <p className="text-sm text-slate-500 dark:text-zinc-400">1-on-1 Mentorship (45 min)</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setIsBookingModalOpen(false)} className="text-zinc-500 hover:text-slate-900 dark:text-white p-2 bg-white/5 rounded-full transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="p-6 space-y-6">
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                                    <CalendarIcon className="w-4 h-4 text-amber-500" /> Select Date
                                                </h3>
                                                <div className="grid grid-cols-4 gap-3">
                                                    {[1, 2, 3, 4, 5, 8, 9, 10].map(day => (
                                                        <button
                                                            key={day}
                                                            onClick={() => setSelectedDate(day)}
                                                            className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${selectedDate === day ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' : 'bg-white/5 border-slate-100 dark:border-white/5 hover:border-white/20 text-slate-500 dark:text-zinc-400'}`}
                                                        >
                                                            <span className="text-xs uppercase font-medium">Oct</span>
                                                            <span className="text-lg font-bold">{day + 10}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <motion.div
                                                initial={{ opacity: selectedDate ? 1 : 0.5, height: 'auto' }}
                                                animate={{ opacity: selectedDate ? 1 : 0.5 }}
                                            >
                                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                                    <Clock className="w-4 h-4 text-amber-500" /> Select Time
                                                </h3>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {["09:00 AM", "11:30 AM", "01:00 PM", "03:45 PM", "05:00 PM"].map(time => (
                                                        <button
                                                            key={time}
                                                            disabled={!selectedDate}
                                                            onClick={() => setSelectedTime(time)}
                                                            className={`py-2 rounded-lg border text-sm font-semibold transition-all ${!selectedDate ? 'opacity-50 cursor-not-allowed bg-white dark:bg-zinc-900 border-slate-100 dark:border-white/5 text-zinc-600' : selectedTime === time ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' : 'bg-white/5 border-slate-100 dark:border-white/5 hover:border-white/20 text-slate-600 dark:text-zinc-300'}`}
                                                        >
                                                            {time}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        </div>

                                        <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-zinc-900/30">
                                            <Button
                                                className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-lg"
                                                disabled={!selectedDate || !selectedTime}
                                                onClick={confirmBooking}
                                            >
                                                Confirm Booking for 500 Coins
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-12 text-center flex flex-col items-center justify-center">
                                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                                            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Session Confirmed!</h2>
                                        <p className="text-slate-500 dark:text-zinc-400 mb-8 max-w-[280px]">
                                            You&apos;re all set for a 1-on-1 session with {selectedMentor.name}. We&apos;ll send an email with the Google Meet link.
                                        </p>
                                        <Button
                                            variant="outline"
                                            className="w-full text-slate-900 dark:text-white border-slate-200 dark:border-white/10 hover:bg-white/5"
                                            onClick={() => setIsBookingModalOpen(false)}
                                        >
                                            Done
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Video Intro Modal */}
                <AnimatePresence>
                    {isVideoModalOpen && selectedMentor && (
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
                                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-slate-50 dark:bg-black rounded-3xl shadow-[0_0_100px_rgba(245,158,11,0.15)] z-[60] overflow-hidden border border-slate-200 dark:border-white/10"
                            >
                                <div className="absolute top-4 right-4 z-10 flex gap-2">
                                    <button onClick={() => { setIsVideoModalOpen(false); openBookingModal(selectedMentor); }} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-sm transition-colors">
                                        Book Session
                                    </button>
                                    <button onClick={() => setIsVideoModalOpen(false)} className="w-10 h-10 bg-white dark:bg-black/50 hover:bg-white dark:bg-black/80 backdrop-blur-md rounded-xl flex items-center justify-center text-slate-900 dark:text-white border border-slate-300 dark:border-white/20 transition-all">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Placeholder YouTube Video */}
                                <div className="aspect-video w-full bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-white/10 relative">
                                    <iframe
                                        src="https://www.youtube.com/embed/M1_1kH02qL0?autoplay=1&mute=0&controls=1"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="absolute inset-0 w-full h-full border-0"
                                    />
                                </div>
                                <div className="p-6 md:p-8 bg-white dark:bg-zinc-950 flex flex-col md:flex-row gap-6 items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <img src={selectedMentor.image} alt={selectedMentor.name} className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/50" />
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{selectedMentor.name}</h2>
                                            <p className="text-slate-500 dark:text-zinc-400 font-medium">{selectedMentor.role} at <span className="text-slate-900 dark:text-white">{selectedMentor.company}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                                        {selectedMentor.tags.map((tag: string) => (
                                            <Badge key={tag} className="bg-white/5 hover:bg-white/10 text-slate-600 dark:text-zinc-300 font-medium border-slate-200 dark:border-white/10">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}
