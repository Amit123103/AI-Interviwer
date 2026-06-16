"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Rocket, Search, Star, Play, Users, GitBranch, Terminal, ArrowRight, CheckCircle2, X, Filter, Code2, Cpu, Globe } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Mock Data
const PROJECTS = [
    {
        id: "p1",
        title: "AI-Powered Code Reviewer",
        description: "Building an automated code review tool that connects to GitHub PRs and uses an LLM to suggest performance and security improvements.",
        creator: "Sarah J.",
        creatorRole: "Senior Backend Eng",
        image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=800",
        videoPlaceholder: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
        tags: ["Machine Learning", "Python", "FastAPI"],
        lookingFor: ["Frontend Dev", "DevOps"],
        matchScore: 92,
        members: 3,
        maxMembers: 5,
        difficulty: "Advanced"
    },
    {
        id: "p2",
        title: "Decentralized Freelance Marketplace",
        description: "A Web3 platform for freelancers to find work and get paid in crypto, with smart contracts handling escrow and dispute resolution.",
        creator: "Mike Chang",
        creatorRole: "Fullstack Developer",
        image: "https://images.unsplash.com/photo-1639762681485-074b7f438a19?auto=format&fit=crop&q=80&w=800",
        videoPlaceholder: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&q=80&w=800",
        tags: ["Web3", "Solidity", "NextJS"],
        lookingFor: ["Smart Contract Eng", "UI/UX Designer"],
        matchScore: 45,
        members: 2,
        maxMembers: 4,
        difficulty: "Intermediate"
    },
    {
        id: "p3",
        title: "Real-time Collaborative Whiteboard",
        description: "An infinite canvas tool where teams can draw, add notes, and collaborate in real-time. Think Figma but for quick brainstorming.",
        creator: "Emma W.",
        creatorRole: "Frontend Architect",
        image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800",
        videoPlaceholder: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800",
        tags: ["React", "WebSockets", "Canvas API"],
        lookingFor: ["Backend Eng (Node)"],
        matchScore: 88,
        members: 4,
        maxMembers: 5,
        difficulty: "Intermediate"
    }
]

const CATEGORIES = ["All Projects", "Frontend", "Backend", "Fullstack", "Web3", "AI/ML", "Mobile"]

export default function ProjectCollaborationPage() {
    const [selectedCategory, setSelectedCategory] = useState("All Projects")
    const [selectedProject, setSelectedProject] = useState<any>(null)
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
    const [joinStep, setJoinStep] = useState(1) // 1: Pitch/Form, 2: Success
    const [applicationNote, setApplicationNote] = useState("")

    const filteredProjects = PROJECTS.filter(p => {
        if (selectedCategory === "All Projects") return true;
        if (selectedCategory === "AI/ML" && p.tags.includes("Machine Learning")) return true;
        if (selectedCategory === "Web3" && p.tags.includes("Web3")) return true;
        if (selectedCategory === "Frontend" && p.tags.includes("React")) return true;
        if (selectedCategory === "Backend" && p.tags.includes("Python")) return true;
        if (selectedCategory === "Fullstack" && p.tags.includes("NextJS")) return true;
        return false;
    })

    const openVideoModal = (project: any) => {
        setSelectedProject(project)
        setIsVideoModalOpen(true)
    }

    const openJoinModal = (project: any) => {
        setSelectedProject(project)
        setJoinStep(1)
        setApplicationNote("")
        setIsJoinModalOpen(true)
    }

    const submitApplication = () => {
        setJoinStep(2)
        setTimeout(() => {
            setIsJoinModalOpen(false)
        }, 3000)
    }

    const getMatchColor = (score: number) => {
        if (score >= 80) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
        if (score >= 50) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
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
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <Rocket className="w-4 h-4 text-emerald-400" />
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">Project Collaboration</span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                {/* Intro Section */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                            Build Real <span className="text-emerald-400">Products</span>
                        </h1>
                        <p className="text-slate-500 dark:text-zinc-400 text-lg max-w-2xl">
                            Join open source projects or team up with peers to build portfolio-ready applications. Watch pitch videos, match your skills, and start coding.
                        </p>
                    </div>
                    <Button className="bg-white text-black font-bold hover:bg-zinc-200 border border-transparent shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:scale-105 shrink-0">
                        <Terminal className="w-4 h-4 mr-2" /> Start a Project
                    </Button>
                </div>

                {/* Filters */}
                <div className="bg-white/60 dark:bg-zinc-900/50 backdrop-blur-xl border border-slate-100 dark:border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 mb-8 sticky top-36 z-20">
                    <div className="flex-1 overflow-x-auto pb-2 md:pb-0 custom-scrollbar flex gap-2 w-full">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${selectedCategory === cat ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-slate-500 dark:text-zinc-400 hover:bg-white/10 hover:text-slate-900 dark:text-white'}`}
                            >
                                {cat === "Frontend" && <Globe className="w-4 h-4" />}
                                {cat === "Backend" && <Terminal className="w-4 h-4" />}
                                {cat === "Fullstack" && <Code2 className="w-4 h-4" />}
                                {cat === "AI/ML" && <Cpu className="w-4 h-4" />}
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="hidden md:block w-px h-8 bg-white/10 mx-2" />
                    <div className="w-full md:w-auto flex gap-2 items-center">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search skills, tags..."
                                className="w-full bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl pl-10 pr-4 py-2 outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-colors"
                            />
                        </div>
                        <Button variant="outline" className="border-slate-200 dark:border-white/10 px-3 bg-white/5">
                            <Filter className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredProjects.map((project, i) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-100 dark:border-white/5 p-6 md:p-8 hover:bg-white dark:bg-zinc-900/80 hover:border-emerald-500/30 transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
                                {/* Match Score Badge */}
                                <div className={`absolute top-6 right-6 px-3 py-1 rounded-full border text-xs font-bold ${getMatchColor(project.matchScore)}`}>
                                    {project.matchScore}% Skill Match
                                </div>

                                <div className="flex flex-col md:flex-row gap-6 mb-6">
                                    {/* Video Thumbnail */}
                                    <div
                                        className="w-full md:w-48 h-32 rounded-2xl relative overflow-hidden group/video cursor-pointer shrink-0 border border-slate-200 dark:border-white/10"
                                        onClick={() => openVideoModal(project)}
                                    >
                                        <img src={project.videoPlaceholder} alt={project.title} className="w-full h-full object-cover group-hover/video:scale-105 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-white dark:bg-black/40 group-hover/video:bg-white dark:bg-black/20 transition-colors" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover/video:scale-110 group-hover/video:bg-emerald-500/80 transition-all">
                                                <Play className="w-4 h-4 text-slate-900 dark:text-white fill-current ml-0.5" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-white dark:bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-slate-900 dark:text-white">
                                            Watch Pitch
                                        </div>
                                    </div>

                                    {/* Project Info */}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-xl group-hover:text-emerald-400 transition-colors mb-2 pr-24 leading-tight">{project.title}</h3>
                                        <p className="text-sm text-slate-500 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed">{project.description}</p>

                                        <div className="flex flex-wrap gap-2">
                                            {project.tags.map(tag => (
                                                <Badge key={tag} variant="secondary" className="bg-white/5 text-xs text-slate-600 dark:text-zinc-300 pointer-events-none">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
                                                <Users className="w-4 h-4 text-zinc-500" />
                                                <span className="font-medium">{project.members}/{project.maxMembers} Members</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
                                                <GitBranch className="w-4 h-4 text-zinc-500" />
                                                <span className="font-medium">{project.difficulty}</span>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-6 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                            onClick={() => openJoinModal(project)}
                                        >
                                            Request to Join
                                        </Button>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2 items-center">
                                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Looking for:</span>
                                        {project.lookingFor.map((role: string) => (
                                            <span key={role} className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}

                    {filteredProjects.length === 0 && (
                        <div className="col-span-full py-20 text-center text-zinc-500">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8" />
                            </div>
                            <p>No projects found matching your criteria.</p>
                        </div>
                    )}
                </div>

                {/* Request to Join Modal */}
                <AnimatePresence>
                    {isJoinModalOpen && selectedProject && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-white dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                onClick={() => setIsJoinModalOpen(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden"
                            >
                                {joinStep === 1 ? (
                                    <>
                                        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-start bg-white dark:bg-zinc-900/30">
                                            <div>
                                                <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-1">Join {selectedProject.title}</h2>
                                                <p className="text-sm text-slate-500 dark:text-zinc-400">Created by {selectedProject.creator}</p>
                                            </div>
                                            <button onClick={() => setIsJoinModalOpen(false)} className="text-zinc-500 hover:text-slate-900 dark:text-white p-2 bg-white/5 rounded-full transition-colors shrink-0">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="p-6 space-y-6">
                                            {/* Match Info */}
                                            <div className={`p-4 rounded-xl border flex items-center gap-4 ${getMatchColor(selectedProject.matchScore)}`}>
                                                <div className="w-12 h-12 rounded-full border-4 border-current flex items-center justify-center text-lg font-black shrink-0">
                                                    {selectedProject.matchScore}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold">Great Match!</h3>
                                                    <p className="text-xs opacity-80">Your profile matches the required skills for this project. Stand out by writing a short intro.</p>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Why do you want to join this project?</label>
                                                <textarea
                                                    className="w-full h-32 bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder:text-zinc-600 focus:border-emerald-500/50 outline-none resize-none transition-colors"
                                                    placeholder="Hey! I have experience building fast React frontends and I'd love to help tackle the UI for this..."
                                                    value={applicationNote}
                                                    onChange={(e) => setApplicationNote(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-zinc-900/30 flex justify-end gap-3">
                                            <Button variant="ghost" className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white hover:bg-white/5" onClick={() => setIsJoinModalOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button
                                                className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-8"
                                                onClick={submitApplication}
                                            >
                                                Send Request
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-12 text-center flex flex-col items-center justify-center">
                                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                                            <Rocket className="w-10 h-10 text-emerald-400" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Request Sent!</h2>
                                        <p className="text-slate-500 dark:text-zinc-400 mb-8 max-w-[280px]">
                                            {selectedProject.creator} will review your profile and message you if they think it&apos;s a good fit.
                                        </p>
                                        <Button
                                            variant="outline"
                                            className="w-full text-slate-900 dark:text-white border-slate-200 dark:border-white/10 hover:bg-white/5"
                                            onClick={() => setIsJoinModalOpen(false)}
                                        >
                                            Back to Projects
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Video Pitch Modal */}
                <AnimatePresence>
                    {isVideoModalOpen && selectedProject && (
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
                                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-slate-50 dark:bg-black rounded-3xl shadow-[0_0_100px_rgba(16,185,129,0.15)] z-[60] overflow-hidden border border-slate-200 dark:border-white/10"
                            >
                                <div className="absolute top-4 right-4 z-10 flex gap-2">
                                    <button onClick={() => setIsVideoModalOpen(false)} className="w-10 h-10 bg-white dark:bg-black/50 hover:bg-white dark:bg-black/80 backdrop-blur-md rounded-xl flex items-center justify-center text-slate-900 dark:text-white border border-slate-300 dark:border-white/20 transition-all">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Placeholder YouTube Video representing the project pitch */}
                                <div className="aspect-video w-full bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-white/10 relative">
                                    <iframe
                                        src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=0&controls=1"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="absolute inset-0 w-full h-full border-0"
                                    />
                                </div>
                                <div className="p-6 md:p-8 bg-white dark:bg-zinc-950 flex flex-col md:flex-row gap-6 items-start justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Project Pitch: {selectedProject.title}</h2>
                                        <p className="text-slate-500 dark:text-zinc-400 font-medium max-w-xl leading-relaxed">{selectedProject.description}</p>
                                    </div>
                                    <div className="shrink-0 flex flex-col gap-3">
                                        <Button
                                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-8"
                                            onClick={() => { setIsVideoModalOpen(false); openJoinModal(selectedProject); }}
                                        >
                                            Request to Join Team
                                        </Button>
                                        <div className="text-xs text-center font-bold text-zinc-500 uppercase tracking-widest">{selectedProject.members} / {selectedProject.maxMembers} Members currently</div>
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
