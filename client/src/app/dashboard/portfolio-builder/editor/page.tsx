"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowLeft, Save, UploadCloud, Eye, MonitorSmartphone, Github, Globe, RefreshCw } from "lucide-react"

// Types matching the backend model
interface Project {
    id: string;
    title: string;
    description: string;
    link: string;
    technologies: string[];
    imageUrl?: string;
}
interface Experience {
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
}

interface PersonalDetails {
    fullName: string;
    headline: string;
    about: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    website: string;
    profileImage: string;
}

export default function PortfolioEditorPage() {
    const router = useRouter()

    const [templateId, setTemplateId] = useState("modern")
    const [customSlug, setCustomSlug] = useState("")
    const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
        fullName: "", headline: "", about: "", email: "", phone: "",
        location: "", linkedin: "", github: "", website: "", profileImage: ""
    })
    const [experience, setExperience] = useState<Experience[]>([])
    const [skills, setSkills] = useState<string[]>([])
    const [projects, setProjects] = useState<Project[]>([])

    const [isSaving, setIsSaving] = useState(false)
    const [isPublishing, setIsPublishing] = useState(false)
    const [isPublished, setIsPublished] = useState(false)
    const [isFetchingGithub, setIsFetchingGithub] = useState(false)
    const [githubError, setGithubError] = useState("")
    const [showPreview, setShowPreview] = useState(false) // For mobile view toggle

    useEffect(() => {
        const fetchExistingPortfolio = async () => {
            const savedUser = localStorage.getItem("user")
            const token = savedUser ? JSON.parse(savedUser).token : ""
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

            try {
                const res = await fetch(`${apiUrl}/api/portfolio`, {
                    headers: { "Authorization": `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    // If we have database data, use it as baseline
                    if (data.userId) {
                        setPersonalDetails(prev => ({ ...prev, ...data.personalDetails }))
                        if (data.experience) setExperience(data.experience)
                        if (data.skills) setSkills(data.skills)
                        if (data.customSlug) setCustomSlug(data.customSlug)
                        if (data.projects) setProjects(data.projects)
                        if (data.templateId) setTemplateId(data.templateId)
                        setIsPublished(data.isPublished)
                    }
                }
            } catch (error) {
                // In dev, Next.js error overlay can trigger on caught console.error. Use warn instead.
                console.warn("Expected backend fetch failed or server is offline", error)
            }
        }

        // Load drafted data from session or fetch from API
        const draftedTemplate = sessionStorage.getItem("portfolioTemplate")
        if (draftedTemplate) setTemplateId(draftedTemplate)

        const draftedData = sessionStorage.getItem("portfolioDraft")
        if (draftedData) {
            try {
                const parsed = JSON.parse(draftedData)
                if (parsed.personalDetails) setPersonalDetails(prev => ({ ...prev, ...parsed.personalDetails }))
                if (parsed.experience) setExperience(parsed.experience)
                if (parsed.skills) setSkills(parsed.skills)
                if (parsed.customSlug) setCustomSlug(parsed.customSlug)
                if (parsed.projects) setProjects(parsed.projects)
            } catch (e) {
                console.error("Failed to parse drafted data", e)
            }
        } else {
            fetchExistingPortfolio()
        }
    }, [])

    const handleSave = async (showToast = true) => {
        setIsSaving(true)
        try {
            const savedUser = localStorage.getItem("user")
            const token = savedUser ? JSON.parse(savedUser).token : ""
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

            const payload = {
                templateId,
                customSlug: customSlug || undefined,
                personalDetails,
                experience,
                skills,
                projects,
            }

            const res = await fetch(`${apiUrl}/api/portfolio/save`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            if (!res.ok) throw new Error("Failed to save")

            if (showToast) {
                alert("Progress saved successfully!")
            }
        } catch (error) {
            console.warn("Save failed:", error)
            alert("Error saving progress. Make sure the backend server is running.")
        } finally {
            setIsSaving(false)
        }
    }

    const handlePublish = async () => {
        setIsPublishing(true)
        await handleSave(false) // Save first, no toast

        try {
            const savedUser = localStorage.getItem("user")
            const token = savedUser ? JSON.parse(savedUser).token : ""
            const userId = savedUser ? JSON.parse(savedUser)._id : ""
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

            const res = await fetch(`${apiUrl}/api/portfolio/publish`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            })

            if (!res.ok) throw new Error("Failed to publish")

            setIsPublished(true)
            alert("Portfolio published successfully!")
            router.push(`/portfolio/${customSlug || userId}`)
        } catch (error) {
            console.warn("Publish failed:", error)
            alert("Failed to publish. Make sure the backend server is running.")
        } finally {
            setIsPublishing(false)
        }
    }

    const handleUnpublish = async () => {
        if (!confirm("Are you sure you want to unpublish your portfolio? It will no longer be visible to others.")) return

        try {
            const savedUser = localStorage.getItem("user")
            const token = savedUser ? JSON.parse(savedUser).token : ""
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

            const res = await fetch(`${apiUrl}/api/portfolio/unpublish`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            })

            if (!res.ok) throw new Error("Failed to unpublish")

            setIsPublished(false)
            alert("Portfolio unpublished.")
        } catch (error) {
            console.error(error)
            alert("Failed to unpublish.")
        }
    }

    const handleShare = () => {
        const savedUser = localStorage.getItem("user")
        const userId = savedUser ? JSON.parse(savedUser)._id : ""
        const url = `${window.location.origin}/portfolio/${customSlug || userId}`
        navigator.clipboard.writeText(url)
        alert("Portfolio link copied to clipboard!")
    }

    const checkSlugAvailability = async () => {
        if (!customSlug) return

        try {
            const savedUser = localStorage.getItem("user")
            const token = savedUser ? JSON.parse(savedUser).token : ""
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

            const res = await fetch(`${apiUrl}/api/portfolio/check-slug/${customSlug}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.available) {
                alert("This slug is available!")
            } else {
                alert(data.message || "This slug is already taken.")
            }
        } catch (error) {
            alert("Error checking slug availability.")
        }
    }

    const fetchGithubRepos = async () => {
        if (!personalDetails.github) {
            setGithubError("Please enter a GitHub username or URL in the Basics tab first.")
            return
        }
        setIsFetchingGithub(true)
        setGithubError("")
        try {
            const savedUser = localStorage.getItem("user")
            const token = savedUser ? JSON.parse(savedUser).token : ""
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

            let username = personalDetails.github
            if (username.includes('github.com/')) {
                username = username.split('github.com/')[1].replace('/', '')
            }

            const res = await fetch(`${apiUrl}/api/portfolio/github/${username}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (!res.ok) throw new Error("Could not fetch repositories")
            const data = await res.json()
            setProjects(data) // Overwrite or append based on preference. Let's overwrite for simplicity.
        } catch (e: any) {
            setGithubError(e.message || "Failed to fetch GitHub projects.")
        } finally {
            setIsFetchingGithub(false)
        }
    }

    // --- TEMPLATES (Mini-components for preview) ---
    const ModernTemplate = () => (
        <div className="bg-white text-zinc-900 min-h-full p-8 font-sans transition-all duration-500">
            <header className="mb-12 text-center md:text-left">
                <h1 className="text-4xl font-black mb-2">{personalDetails.fullName || "Your Name"}</h1>
                <h2 className="text-xl text-zinc-500 mb-6">{personalDetails.headline || "Your Title"}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-zinc-600 justify-center md:justify-start">
                    {personalDetails.email && <span>{personalDetails.email}</span>}
                    {personalDetails.location && <span>{personalDetails.location}</span>}
                </div>
            </header>

            {personalDetails.about && (
                <section className="mb-12">
                    <h3 className="text-2xl font-bold border-b border-zinc-200 pb-2 mb-4">About Me</h3>
                    <p className="text-zinc-700 leading-relaxed max-w-3xl">{personalDetails.about}</p>
                </section>
            )}

            {experience.length > 0 && (
                <section className="mb-12">
                    <h3 className="text-2xl font-bold border-b border-zinc-200 pb-2 mb-4">Experience</h3>
                    <div className="space-y-6">
                        {experience.map(exp => (
                            <div key={exp.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="text-lg font-bold">{exp.title}</h4>
                                    <span className="text-sm text-zinc-500 font-mono">{exp.startDate} - {exp.endDate}</span>
                                </div>
                                <div className="text-indigo-600 font-medium mb-2">{exp.company} <span className="text-slate-500 dark:text-zinc-400 font-normal">| {exp.location}</span></div>
                                <p className="text-zinc-700">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {skills.length > 0 && (
                <section>
                    <h3 className="text-2xl font-bold border-b border-zinc-200 pb-2 mb-4">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-zinc-100 text-zinc-700 text-sm font-medium rounded-full">
                                {skill}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {projects.length > 0 && (
                <section className="mt-12">
                    <h3 className="text-2xl font-bold border-b border-zinc-200 pb-2 mb-4">Projects</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        {projects.map(proj => (
                            <div key={proj.id} className="border border-zinc-200 p-4 rounded-xl">
                                <h4 className="text-lg font-bold mb-2">
                                    {proj.link ? <a href={proj.link} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">{proj.title}</a> : proj.title}
                                </h4>
                                <p className="text-zinc-600 text-sm mb-3">{proj.description}</p>
                                <div className="flex flex-wrap gap-2">
                                    {proj.technologies.map((tech, i) => (
                                        <span key={i} className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-2 py-1 rounded">{tech}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )

    const CyberTemplate = () => (
        <div className="bg-white dark:bg-zinc-950 text-indigo-400 min-h-full p-8 font-mono border-l-4 border-indigo-500 transition-all duration-500 shadow-[inset_0_0_100px_rgba(99,102,241,0.1)]">
            <header className="mb-12">
                <div className="text-xs text-indigo-500/50 mb-2">{'>'} IDENT_INIT</div>
                <h1 className="text-4xl font-black mb-2 text-slate-900 dark:text-white glow-text">{personalDetails.fullName || "GUEST_USER"}</h1>
                <h2 className="text-xl text-indigo-400 mb-6">{personalDetails.headline || "UNKNOWN_ROLE"}</h2>
                <div className="flex flex-col gap-2 text-sm text-indigo-200/60">
                    {personalDetails.email && <div>[EMAIL]: {personalDetails.email}</div>}
                    {personalDetails.location && <div>[LOC]: {personalDetails.location}</div>}
                </div>
            </header>

            {personalDetails.about && (
                <section className="mb-12 relative overflow-hidden p-6 bg-indigo-500/[0.02] border border-indigo-500/20">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
                    <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">_ABOUT</h3>
                    <p className="text-indigo-200/80 leading-relaxed max-w-3xl">{personalDetails.about}</p>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-indigo-500/50"></div>
                </section>
            )}

            {experience.length > 0 && (
                <section className="mb-12">
                    <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">_EXPERIENCE</h3>
                    <div className="space-y-8 pl-4 border-l border-indigo-500/30">
                        {experience.map(exp => (
                            <div key={exp.id} className="relative">
                                <div className="absolute -left-[21px] top-1 w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
                                <h4 className="text-lg font-bold text-indigo-300">{exp.title} <span className="text-indigo-500/50">@ {exp.company}</span></h4>
                                <div className="text-sm text-indigo-500/50 mb-3">[{exp.startDate} - {exp.endDate}] :: {exp.location}</div>
                                <p className="text-indigo-200/70">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {skills.length > 0 && (
                <section>
                    <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">_SYS.SKILLS</h3>
                    <div className="flex flex-wrap gap-3">
                        {skills.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-indigo-950 border border-indigo-500/30 text-indigo-300 text-sm align-middle">
                                <span className="text-indigo-500 mr-2">*</span>{skill}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {projects.length > 0 && (
                <section className="mt-12">
                    <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">_PROJECTS</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {projects.map(proj => (
                            <div key={proj.id} className="bg-indigo-950/30 border border-indigo-500/20 p-4 relative">
                                <div className="absolute top-0 right-0 p-1 bg-indigo-500/10 text-[10px] text-indigo-500">EXE</div>
                                <h4 className="text-lg font-bold text-indigo-300 mb-2">
                                    {proj.link ? <a href={proj.link} target="_blank" rel="noreferrer" className="hover:text-indigo-100">{proj.title}</a> : proj.title}
                                </h4>
                                <p className="text-indigo-200/60 text-sm mb-4 line-clamp-2">{proj.description}</p>
                                <div className="text-xs text-indigo-500/80">
                                    [ {proj.technologies.join(" | ")} ]
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )

    const CreativeTemplate = () => (
        <div className="bg-gradient-to-br from-rose-50 to-orange-50 text-zinc-800 min-h-full p-8 md:p-12 font-sans transition-all duration-500">
            <header className="mb-16 text-center">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-rose-400 to-orange-400 rounded-full mb-6 shadow-xl shadow-orange-500/20 border-4 border-white flex items-center justify-center text-slate-900 dark:text-white text-2xl font-black">
                    {personalDetails.fullName ? personalDetails.fullName.charAt(0).toUpperCase() : "P"}
                </div>
                <h1 className="text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">{personalDetails.fullName || "Your Name"}</h1>
                <h2 className="text-2xl font-medium text-zinc-600">{personalDetails.headline || "Your Creative Title"}</h2>
            </header>

            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-zinc-200/50 p-8 md:p-12">
                {personalDetails.about && (
                    <section className="mb-12">
                        <h3 className="text-xl uppercase tracking-widest text-rose-400 font-bold mb-6">Hello World.</h3>
                        <p className="text-zinc-600 leading-loose text-lg">{personalDetails.about}</p>
                    </section>
                )}

                {experience.length > 0 && (
                    <section className="mb-12">
                        <h3 className="text-xl uppercase tracking-widest text-rose-400 font-bold mb-8">Journey</h3>
                        <div className="space-y-8">
                            {experience.map(exp => (
                                <div key={exp.id} className="relative pl-8 border-l-2 border-orange-200">
                                    <div className="absolute -left-1.5 top-2 w-3 h-3 bg-gradient-to-br from-rose-400 to-orange-400 rounded-full border-2 border-white"></div>
                                    <h4 className="text-xl font-bold text-zinc-800">{exp.title}</h4>
                                    <div className="text-orange-500 font-medium mb-2">{exp.company} <span className="text-slate-500 dark:text-zinc-400 text-sm font-normal ml-2">{exp.startDate} — {exp.endDate}</span></div>
                                    <p className="text-zinc-600 leading-relaxed">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {skills.length > 0 && (
                    <section>
                        <h3 className="text-xl uppercase tracking-widest text-rose-400 font-bold mb-6">Toolkit</h3>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill, i) => (
                                <span key={i} className="px-4 py-2 bg-gradient-to-br from-rose-100 to-orange-100 text-rose-600 font-bold text-sm rounded-xl">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {projects.length > 0 && (
                    <section className="mt-12">
                        <h3 className="text-xl uppercase tracking-widest text-rose-400 font-bold mb-6">Creations</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            {projects.map(proj => (
                                <div key={proj.id} className="bg-orange-50/50 border border-orange-100 p-6 rounded-2xl hover:shadow-lg transition-shadow">
                                    <h4 className="text-xl font-bold text-zinc-800 mb-2">
                                        {proj.title}
                                    </h4>
                                    <p className="text-zinc-600 mb-4">{proj.description}</p>
                                    <div className="mb-4 flex flex-wrap gap-2">
                                        {proj.technologies.map((tech, i) => (
                                            <span key={i} className="text-xs font-bold text-orange-500 bg-white px-2 py-1 rounded-md shadow-sm">{tech}</span>
                                        ))}
                                    </div>
                                    {proj.link && (
                                        <a href={proj.link} target="_blank" rel="noreferrer" className="text-rose-500 font-bold hover:text-rose-600 flex items-center gap-1 text-sm uppercase tracking-wider">
                                            View Project <ArrowLeft className="w-4 h-4 rotate-135" />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )

    return (
        <div className="h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-white flex flex-col overflow-hidden">
            {/* Topbar */}
            <div className="h-16 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950 flex items-center justify-between px-6 shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()} className="w-8 h-8 p-0 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="font-semibold hidden sm:block">Portfolio Editor</h1>
                </div>

                {/* Mobile view toggle */}
                <div className="lg:hidden">
                    <Button
                        variant="outline"
                        className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10"
                        onClick={() => setShowPreview(!showPreview)}
                    >
                        {showPreview ? <><MonitorSmartphone className="w-4 h-4 mr-2" /> Edit</> : <><Eye className="w-4 h-4 mr-2" /> Preview</>}
                    </Button>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => handleSave(true)}
                        disabled={isSaving}
                        className="bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 hover:bg-white/5 text-slate-600 dark:text-zinc-300 hidden sm:flex"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? "Saving..." : "Save Draft"}
                    </Button>
                    <Button
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-slate-900 dark:text-white shadow-lg shadow-purple-500/20"
                    >
                        <UploadCloud className="w-4 h-4 mr-2" />
                        {isPublishing ? "Publishing..." : (isPublished ? "Update Portfolio" : "Publish")}
                    </Button>

                    {isPublished && (
                        <>
                            <Button
                                onClick={handleShare}
                                variant="outline"
                                className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                            >
                                <Globe className="w-4 h-4 mr-2" />
                                Share
                            </Button>
                            <Button
                                onClick={handleUnpublish}
                                variant="ghost"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                                Unpublish
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Layout Split */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* LEFT: Editor Panel */}
                <div className={`w-full lg:w-[450px] xl:w-[500px] h-full bg-white dark:bg-zinc-950 border-r border-slate-100 dark:border-white/5 overflow-y-auto custom-scrollbar flex-shrink-0 relative z-20 transition-transform duration-300 ${showPreview ? '-translate-x-full absolute lg:relative lg:translate-x-0' : 'translate-x-0'}`}>
                    <div className="p-6">
                        <Tabs defaultValue="basics" className="w-full">
                            <TabsList className="w-full bg-white dark:bg-zinc-900 border border-white/[0.06] mb-6 p-1 rounded-xl">
                                <TabsTrigger value="basics" className="flex-1 rounded-lg data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400 text-xs">Basics</TabsTrigger>
                                <TabsTrigger value="experience" className="flex-1 rounded-lg data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400 text-xs">Experience</TabsTrigger>
                                <TabsTrigger value="projects" className="flex-1 rounded-lg data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400 text-xs">Projects</TabsTrigger>
                                <TabsTrigger value="design" className="flex-1 rounded-lg data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400 text-xs">Design</TabsTrigger>
                            </TabsList>

                            {/* BASICS TAB */}
                            <TabsContent value="basics" className="space-y-6 animate-in fade-in-50">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1.5 block">Full Name</label>
                                        <Input
                                            value={personalDetails.fullName}
                                            onChange={(e) => setPersonalDetails({ ...personalDetails, fullName: e.target.value })}
                                            className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1.5 block">Headline</label>
                                        <Input
                                            value={personalDetails.headline}
                                            onChange={(e) => setPersonalDetails({ ...personalDetails, headline: e.target.value })}
                                            className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10"
                                            placeholder="Senior Frontend Developer"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1.5 block">About Me</label>
                                        <Textarea
                                            value={personalDetails.about}
                                            onChange={(e) => setPersonalDetails({ ...personalDetails, about: e.target.value })}
                                            className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 min-h-[120px]"
                                            placeholder="Passionate about building scalable web applications..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1.5 block">Location</label>
                                            <Input
                                                value={personalDetails.location}
                                                onChange={(e) => setPersonalDetails({ ...personalDetails, location: e.target.value })}
                                                className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10"
                                                placeholder="San Francisco, CA"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1.5 block">Email</label>
                                            <Input
                                                type="email"
                                                value={personalDetails.email}
                                                onChange={(e) => setPersonalDetails({ ...personalDetails, email: e.target.value })}
                                                className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1.5 block">LinkedIn URL</label>
                                            <Input
                                                value={personalDetails.linkedin}
                                                onChange={(e) => setPersonalDetails({ ...personalDetails, linkedin: e.target.value })}
                                                className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10"
                                                placeholder="https://linkedin.com/in/johndoe"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1.5 block flex items-center gap-1"><Github className="w-3 h-3" /> GitHub</label>
                                            <Input
                                                value={personalDetails.github}
                                                onChange={(e) => setPersonalDetails({ ...personalDetails, github: e.target.value })}
                                                className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10"
                                                placeholder="Username or URL"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1.5 block">Skills (comma separated)</label>
                                        <Textarea
                                            value={skills.join(", ")}
                                            onChange={(e) => setSkills(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                                            className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10"
                                            placeholder="React, Node.js, TypeScript"
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* EXPERIENCE TAB */}
                            <TabsContent value="experience" className="space-y-6 animate-in fade-in-50">
                                {experience.map((exp, idx) => (
                                    <Card key={exp.id || idx} className="p-4 bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 mb-4 relative overflow-visible">
                                        <Button
                                            variant="ghost"
                                            className="absolute -top-3 -right-3 w-6 h-6 p-0 rounded-full bg-red-500 hover:bg-red-600 text-slate-900 dark:text-white shadow-lg"
                                            onClick={() => setExperience(experience.filter((_, i) => i !== idx))}
                                        >
                                            ×
                                        </Button>
                                        <div className="space-y-3">
                                            <Input
                                                value={exp.title}
                                                onChange={(e) => {
                                                    const newExp = [...experience];
                                                    newExp[idx].title = e.target.value;
                                                    setExperience(newExp);
                                                }}
                                                placeholder="Job Title"
                                                className="bg-white dark:bg-black/50 border-slate-100 dark:border-white/5 font-semibold"
                                            />
                                            <Input
                                                value={exp.company}
                                                onChange={(e) => {
                                                    const newExp = [...experience];
                                                    newExp[idx].company = e.target.value;
                                                    setExperience(newExp);
                                                }}
                                                placeholder="Company Name"
                                                className="bg-white dark:bg-black/50 border-slate-100 dark:border-white/5"
                                            />
                                            <div className="grid grid-cols-2 gap-3">
                                                <Input
                                                    value={exp.startDate}
                                                    onChange={(e) => {
                                                        const newExp = [...experience];
                                                        newExp[idx].startDate = e.target.value;
                                                        setExperience(newExp);
                                                    }}
                                                    placeholder="Start (e.g. 2020)"
                                                    className="bg-white dark:bg-black/50 border-slate-100 dark:border-white/5 text-sm"
                                                />
                                                <Input
                                                    value={exp.endDate}
                                                    onChange={(e) => {
                                                        const newExp = [...experience];
                                                        newExp[idx].endDate = e.target.value;
                                                        setExperience(newExp);
                                                    }}
                                                    placeholder="End (e.g. Present)"
                                                    className="bg-white dark:bg-black/50 border-slate-100 dark:border-white/5 text-sm"
                                                />
                                            </div>
                                            <Textarea
                                                value={exp.description}
                                                onChange={(e) => {
                                                    const newExp = [...experience];
                                                    newExp[idx].description = e.target.value;
                                                    setExperience(newExp);
                                                }}
                                                placeholder="Description of responsibilities..."
                                                className="bg-white dark:bg-black/50 border-slate-100 dark:border-white/5 min-h-[80px] text-sm"
                                            />
                                        </div>
                                    </Card>
                                ))}

                                <Button
                                    variant="outline"
                                    className="w-full border-dashed border-slate-300 dark:border-white/20 bg-transparent hover:bg-white/5"
                                    onClick={() => setExperience([...experience, { id: Date.now().toString(), title: "", company: "", location: "", startDate: "", endDate: "", description: "" }])}
                                >
                                    + Add Experience
                                </Button>
                            </TabsContent>

                            {/* PROJECTS TAB */}
                            <TabsContent value="projects" className="space-y-6 animate-in fade-in-50">
                                <Card className="p-5 border border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-2">
                                            <Github className="w-5 h-5 text-indigo-400" />
                                            <h4 className="font-semibold text-indigo-100">Sync with GitHub</h4>
                                        </div>
                                        <p className="text-sm text-indigo-200/60">Automatically fetch and display your top repositories. Ensure your GitHub username is set in the Basics tab.</p>
                                        <Button
                                            onClick={fetchGithubRepos}
                                            disabled={isFetchingGithub}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-slate-900 dark:text-white mt-1 w-full"
                                        >
                                            {isFetchingGithub ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Github className="w-4 h-4 mr-2" />}
                                            {isFetchingGithub ? "Fetching..." : "Fetch Top Repositories"}
                                        </Button>
                                        {githubError && <p className="text-xs text-red-400 mt-1">{githubError}</p>}
                                    </div>
                                </Card>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200 dark:border-white/10"></span></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-zinc-950 px-2 text-zinc-500">Or add manually</span></div>
                                </div>

                                {projects.map((proj, idx) => (
                                    <Card key={proj.id || idx} className="p-4 bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 mb-4 relative overflow-visible">
                                        <Button
                                            variant="ghost"
                                            className="absolute -top-3 -right-3 w-6 h-6 p-0 rounded-full bg-red-500 hover:bg-red-600 text-slate-900 dark:text-white shadow-lg"
                                            onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                                        >
                                            ×
                                        </Button>
                                        <div className="space-y-3">
                                            <Input
                                                value={proj.title}
                                                onChange={(e) => {
                                                    const newProj = [...projects];
                                                    newProj[idx].title = e.target.value;
                                                    setProjects(newProj);
                                                }}
                                                placeholder="Project Title"
                                                className="bg-white dark:bg-black/50 border-slate-100 dark:border-white/5 font-semibold"
                                            />
                                            <Input
                                                value={proj.link}
                                                onChange={(e) => {
                                                    const newProj = [...projects];
                                                    newProj[idx].link = e.target.value;
                                                    setProjects(newProj);
                                                }}
                                                placeholder="Project URL (e.g. https://github.com/..)"
                                                className="bg-white dark:bg-black/50 border-slate-100 dark:border-white/5"
                                            />
                                            <Input
                                                value={proj.technologies.join(", ")}
                                                onChange={(e) => {
                                                    const newProj = [...projects];
                                                    newProj[idx].technologies = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                                                    setProjects(newProj);
                                                }}
                                                placeholder="Technologies (comma separated)"
                                                className="bg-white dark:bg-black/50 border-slate-100 dark:border-white/5 text-sm"
                                            />
                                            <Textarea
                                                value={proj.description}
                                                onChange={(e) => {
                                                    const newProj = [...projects];
                                                    newProj[idx].description = e.target.value;
                                                    setProjects(newProj);
                                                }}
                                                placeholder="Short description of the project..."
                                                className="bg-white dark:bg-black/50 border-slate-100 dark:border-white/5 min-h-[80px] text-sm"
                                            />
                                        </div>
                                    </Card>
                                ))}

                                <Button
                                    variant="outline"
                                    className="w-full border-dashed border-slate-300 dark:border-white/20 bg-transparent hover:bg-white/5"
                                    onClick={() => setProjects([...projects, { id: Date.now().toString(), title: "", link: "", technologies: [], description: "" }])}
                                >
                                    + Add Custom Project
                                </Button>
                            </TabsContent>

                            {/* DESIGN TAB */}
                            <TabsContent value="design" className="space-y-6 animate-in fade-in-50">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1.5 flex items-center gap-2"><Globe className="w-3 h-3" /> Custom URL Slug</label>
                                    <div className="flex shadow-sm rounded-md">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-200 dark:border-white/10 bg-white dark:bg-black/50 text-zinc-500 sm:text-sm">
                                            /portfolio/
                                        </span>
                                        <Input
                                            type="text"
                                            value={customSlug}
                                            onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                            className="flex-1 min-w-0 block w-full rounded-none bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10"
                                            placeholder="amit-kumar-sd"
                                        />
                                        <Button
                                            variant="ghost"
                                            onClick={checkSlugAvailability}
                                            className="rounded-l-none rounded-r-md border border-l-0 border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 hover:bg-zinc-800 text-indigo-400 text-xs"
                                        >
                                            Check
                                        </Button>
                                    </div>
                                    <p className="mt-1.5 text-[10px] text-zinc-500">Leave blank to use your default ID. Only letters, numbers, and hyphens allowed.</p>
                                </div>

                                <div className="mt-8">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-3 block">Global Template</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { id: "modern", name: "Modern Minimal" },
                                            { id: "cyber", name: "Cyber Developer" },
                                            { id: "creative", name: "Creative Professional" }
                                        ].map(t => (
                                            <div
                                                key={t.id}
                                                onClick={() => setTemplateId(t.id)}
                                                className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${templateId === t.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 hover:border-white/20'}`}
                                            >
                                                <div className="font-semibold">{t.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                        </Tabs>
                    </div>
                </div>

                {/* RIGHT: Live Preview */}
                <div className={`flex-1 h-full bg-white dark:bg-zinc-900 overflow-y-auto relative transition-transform duration-300 ${!showPreview ? 'translate-x-full absolute w-full lg:relative lg:translate-x-0' : 'translate-x-0 w-full absolute lg:relative'}`}>
                    {/* Shadow overlay for depth */}
                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] z-10" />

                    {/* Preview Container Container */}
                    <div className="min-h-full p-4 md:p-8 lg:p-12 flex items-center justify-center">
                        <div className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl shadow-black/50 bg-white ring-1 ring-white/10">
                            {/* Render Selected Template Component */}
                            {templateId === "modern" && <ModernTemplate />}
                            {templateId === "cyber" && <CyberTemplate />}
                            {templateId === "creative" && <CreativeTemplate />}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
