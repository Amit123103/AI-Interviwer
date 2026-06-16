"use client"

import React, { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Download, Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { CVData } from "@/components/cv-templates/ModernTemplate"
import ModernTemplate from "@/components/cv-templates/ModernTemplate"
import ClassicTemplate from "@/components/cv-templates/ClassicTemplate"
import MinimalTemplate from "@/components/cv-templates/MinimalTemplate"
import MeshBackground from "../../components/MeshBackground"
import HolographicHud from "@/components/ui/HolographicHud"
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import { toast } from "sonner"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

const EMPTY_DATA: CVData = {
    personal: {
        firstName: "", lastName: "", title: "", email: "", phone: "", location: "", linkedin: "", website: "", summary: ""
    },
    experience: [],
    education: [],
    skills: []
}

function EditorContent() {
    const searchParams = useSearchParams()
    const templateId = searchParams.get('template') || 'modern'
    const mode = searchParams.get('mode') || 'manual'

    const [data, setData] = useState<CVData>(EMPTY_DATA)
    const [isLoading, setIsLoading] = useState(true)
    const [isExporting, setIsExporting] = useState(false)
    const resumeRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchSimulatedData = async () => {
            if (mode === 'linkedin') {
                const url = sessionStorage.getItem('cv_linkedin_url')
                // Simulate backend parsing based on url (mocking response)
                await new Promise(resolve => setTimeout(resolve, 2000))

                // MOCK DATA for LinkedIn 
                setData({
                    personal: {
                        firstName: "Alex",
                        lastName: "Developer",
                        title: "Senior Full-Stack Engineer",
                        email: "alex.dev@example.com",
                        phone: "+1 (555) 019-2834",
                        location: "San Francisco, CA",
                        linkedin: url || "linkedin.com/in/alex-dev",
                        website: "alexdev.io",
                        summary: "Versatile Full-Stack Engineer with 6+ years of experience architecting secure and scalable web applications. Recognized for streamlining deployment pipelines and optimizing database queries resulting in a 40% performance increase."
                    },
                    experience: [
                        {
                            id: "exp1",
                            company: "TechNova Solutions",
                            role: "Lead Software Engineer",
                            startDate: "2021",
                            endDate: "Present",
                            current: true,
                            description: "• Architected microservices leveraging Node.js and Docker.\n• Mentored a team of 5 junior developers.\n• Reduced latency by 30% through caching strategies."
                        },
                        {
                            id: "exp2",
                            company: "Innovate AI",
                            role: "Frontend Developer",
                            startDate: "2018",
                            endDate: "2021",
                            current: false,
                            description: "• Built responsive, dynamic user interfaces using React and Redux.\n• Collaborated with design team to construct a comprehensive UI component library."
                        }
                    ],
                    education: [
                        {
                            id: "edu1",
                            institution: "University of Technology",
                            degree: "B.S. in Computer Science",
                            year: "2018"
                        }
                    ],
                    skills: ["React", "Node.js", "TypeScript", "Python", "AWS", "Docker", "GraphQL", "MongoDB"]
                })
                toast.success("Profile parsed successfully")
            }
            setIsLoading(false)
        }

        fetchSimulatedData()
    }, [mode])

    const handleDownloadPdf = async () => {
        if (!resumeRef.current) return

        try {
            setIsExporting(true)
            toast.loading("Compiling PDF parameters...")

            const element = resumeRef.current
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight
            })

            const imgData = canvas.toDataURL('image/png')

            // A4 dimensions in mm
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(`${data.personal.firstName || 'My'}_${data.personal.lastName || 'CV'}.pdf`)

            toast.dismiss()
            toast.success("CV Downloaded Successfully")
        } catch (error) {
            console.error(error)
            toast.dismiss()
            toast.error("Failed to generate PDF")
        } finally {
            setIsExporting(false)
        }
    }

    const updatePersonal = (field: string, value: string) => {
        setData(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }))
    }

    const addExperience = () => {
        setData(prev => ({
            ...prev,
            опыт: [
                ...prev.experience,
                { id: Date.now().toString(), company: "", role: "", startDate: "", endDate: "", current: false, description: "" }
            ]
        }))
    }

    const updateExperience = (id: string, field: string, value: string | boolean) => {
        setData(prev => ({
            ...prev,
            experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
        }))
    }

    const removeExperience = (id: string) => {
        setData(prev => ({ ...prev, experience: prev.experience.filter(exp => exp.id !== id) }))
    }

    const addEducation = () => {
        setData(prev => ({
            ...prev,
            education: [
                ...prev.education,
                { id: Date.now().toString(), institution: "", degree: "", year: "" }
            ]
        }))
    }

    const updateEducation = (id: string, field: string, value: string) => {
        setData(prev => ({
            ...prev,
            education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
        }))
    }

    const removeEducation = (id: string) => {
        setData(prev => ({ ...prev, education: prev.education.filter(edu => edu.id !== id) }))
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black text-slate-900 dark:text-white">
                <div className="flex flex-col items-center gap-4 text-cyan-500">
                    <Loader2 className="w-12 h-12 animate-spin" />
                    <p className="font-mono text-sm uppercase tracking-widest">{mode === 'linkedin' ? 'Extracting Neural Data Link...' : 'Initializing Canvas...'}</p>
                </div>
            </div>
        )
    }

    const CurrentTemplate = templateId === 'classic' ? ClassicTemplate : templateId === 'minimal' ? MinimalTemplate : ModernTemplate

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-white relative overflow-hidden flex flex-col h-screen">
            <MeshBackground />
            <div className="relative z-10 flex-none px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/cv-builder/templates">
                        <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-full">
                            <ArrowLeft className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Live Editor</h1>
                        <p className="text-xs text-zinc-500 font-medium">Auto-syncing changes to preview</p>
                    </div>
                </div>
                <Button
                    onClick={handleDownloadPdf}
                    disabled={isExporting}
                    className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold tracking-wide rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                >
                    {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    Export PDF
                </Button>
            </div>

            <div className="flex-1 flex overflow-hidden relative z-10">
                {/* Editor Sidebar */}
                <div className="w-[45%] lg:w-[40%] bg-white dark:bg-zinc-950/90 backdrop-blur-xl border-r border-slate-100 dark:border-white/5 overflow-y-auto custom-scrollbar p-6">
                    <div className="space-y-10 max-w-xl mx-auto pb-20">
                        {/* Personal Details */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-2">
                                <div className="w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                                <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-200">Personal Identity</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500">First Name</label>
                                    <Input value={data.personal.firstName} onChange={(e) => updatePersonal('firstName', e.target.value)} className="bg-white/5 border-slate-200 dark:border-white/10 max-h-10" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500">Last Name</label>
                                    <Input value={data.personal.lastName} onChange={(e) => updatePersonal('lastName', e.target.value)} className="bg-white/5 border-slate-200 dark:border-white/10 max-h-10" />
                                </div>
                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500">Professional Title</label>
                                    <Input value={data.personal.title} onChange={(e) => updatePersonal('title', e.target.value)} className="bg-white/5 border-slate-200 dark:border-white/10 max-h-10" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500">Email</label>
                                    <Input value={data.personal.email} onChange={(e) => updatePersonal('email', e.target.value)} className="bg-white/5 border-slate-200 dark:border-white/10 max-h-10" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500">Phone</label>
                                    <Input value={data.personal.phone} onChange={(e) => updatePersonal('phone', e.target.value)} className="bg-white/5 border-slate-200 dark:border-white/10 max-h-10" />
                                </div>
                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500">Location</label>
                                    <Input value={data.personal.location} onChange={(e) => updatePersonal('location', e.target.value)} className="bg-white/5 border-slate-200 dark:border-white/10 max-h-10" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500">LinkedIn</label>
                                    <Input value={data.personal.linkedin} onChange={(e) => updatePersonal('linkedin', e.target.value)} className="bg-white/5 border-slate-200 dark:border-white/10 max-h-10" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500">Website</label>
                                    <Input value={data.personal.website} onChange={(e) => updatePersonal('website', e.target.value)} className="bg-white/5 border-slate-200 dark:border-white/10 max-h-10" />
                                </div>
                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500">Professional Summary</label>
                                    <Textarea value={data.personal.summary} onChange={(e) => updatePersonal('summary', e.target.value)} className="bg-white/5 border-slate-200 dark:border-white/10 min-h-[100px]" />
                                </div>
                            </div>
                        </section>

                        {/* Experience */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                    <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-200">Experience</h2>
                                </div>
                                <Button onClick={addExperience} variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 h-8 px-2">
                                    <Plus className="w-4 h-4 mr-1" /> Add
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {data.experience.map((exp, index) => (
                                    <div key={exp.id} className="p-4 rounded-xl bg-white/5 border border-slate-200 dark:border-white/10 relative group">
                                        <button onClick={() => removeExperience(exp.id)} className="absolute top-3 right-3 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="grid grid-cols-2 gap-3 pr-6">
                                            <div className="col-span-2 space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-zinc-500">Role / Title</label>
                                                <Input value={exp.role} onChange={e => updateExperience(exp.id, 'role', e.target.value)} className="bg-white dark:bg-black/40 border-slate-100 dark:border-white/5 h-9" />
                                            </div>
                                            <div className="col-span-2 space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-zinc-500">Company</label>
                                                <Input value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} className="bg-white dark:bg-black/40 border-slate-100 dark:border-white/5 h-9" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-zinc-500">Start Date</label>
                                                <Input value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} className="bg-white dark:bg-black/40 border-slate-100 dark:border-white/5 h-9" placeholder="e.g. 2021" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-zinc-500">End Date</label>
                                                <Input value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} disabled={exp.current} className="bg-white dark:bg-black/40 border-slate-100 dark:border-white/5 h-9 disabled:opacity-50" placeholder="e.g. Present" />
                                            </div>
                                            <div className="col-span-2 mt-2">
                                                <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-zinc-400 cursor-pointer">
                                                    <input type="checkbox" checked={exp.current} onChange={e => updateExperience(exp.id, 'current', e.target.checked)} className="rounded border-zinc-700 bg-white dark:bg-black/50" />
                                                    I currently work here
                                                </label>
                                            </div>
                                            <div className="col-span-2 space-y-1 mt-2">
                                                <label className="text-[10px] uppercase font-bold text-zinc-500">Description / Achievements</label>
                                                <Textarea value={exp.description} onChange={e => updateExperience(exp.id, 'description', e.target.value)} className="bg-white dark:bg-black/40 border-slate-100 dark:border-white/5 min-h-[80px]" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Education */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                    <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-200">Education</h2>
                                </div>
                                <Button onClick={addEducation} variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 h-8 px-2">
                                    <Plus className="w-4 h-4 mr-1" /> Add
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {data.education.map((edu) => (
                                    <div key={edu.id} className="p-4 rounded-xl bg-white/5 border border-slate-200 dark:border-white/10 relative group">
                                        <button onClick={() => removeEducation(edu.id)} className="absolute top-3 right-3 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="grid grid-cols-2 gap-3 pr-6">
                                            <div className="col-span-2 space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-zinc-500">Institution</label>
                                                <Input value={edu.institution} onChange={e => updateEducation(edu.id, 'institution', e.target.value)} className="bg-white dark:bg-black/40 border-slate-100 dark:border-white/5 h-9" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-zinc-500">Degree</label>
                                                <Input value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} className="bg-white dark:bg-black/40 border-slate-100 dark:border-white/5 h-9" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-zinc-500">Graduation Year</label>
                                                <Input value={edu.year} onChange={e => updateEducation(edu.id, 'year', e.target.value)} className="bg-white dark:bg-black/40 border-slate-100 dark:border-white/5 h-9" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Skills */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-200">Skills</h2>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-zinc-500">Comma Separated Skills</label>
                                <Textarea
                                    value={data.skills.join(", ")}
                                    onChange={e => setData(prev => ({ ...prev, skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))}
                                    className="bg-white/5 border-slate-200 dark:border-white/10 min-h-[80px]"
                                    placeholder="React, CSS, Machine Learning, Leadership..."
                                />
                            </div>
                        </section>

                    </div>
                </div>

                {/* Live Preview Area */}
                <div className="flex-1 bg-white dark:bg-black/60 overflow-y-auto p-4 md:p-8 flex justify-center custom-scrollbar">
                    {/* CV Paper Constraint */}
                    <div
                        ref={resumeRef}
                        className="bg-white shadow-[0_0_50px_rgba(0,0,0,0.5)] transform-origin-top-center transition-all"
                        // Standard A4 aspect ratio 210x297. Max width limits scaling on massive screens while keeping it contained mostly.
                        style={{ width: '100%', maxWidth: '794px', height: 'fit-content', minHeight: '1123px' }}
                    >
                        <CurrentTemplate data={data} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function CvEditorPage() {
    return (
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black text-slate-900 dark:text-white"><Loader2 className="w-12 h-12 animate-spin text-cyan-500" /></div>}>
            <EditorContent />
        </React.Suspense>
    )
}
