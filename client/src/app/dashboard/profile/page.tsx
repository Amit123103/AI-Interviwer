
"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import axios from "axios"
import { Upload, CheckCircle, FileText, Loader2 } from "lucide-react"
import ProfileStats from "@/components/dashboard/ProfileStats";
import SubmissionHistory from "@/components/dashboard/SubmissionHistory";
import MeshBackground from "../components/MeshBackground"
import HolographicHud from "@/components/ui/HolographicHud"
import TiltCard from "@/components/ui/TiltCard"
import DashboardHeader from "@/components/dashboard/DashboardHeader"

export default function ProfilePage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        fullName: "",
        course: "",
        department: "",
        dreamCompany: "",
    })
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: "", text: "" })
    const [userId, setUserId] = useState<string>("")

    useEffect(() => {
        const fetchProfile = async () => {
            const savedUser = localStorage.getItem("user")
            if (!savedUser) {
                router.push("/auth/login")
                return
            }
            const { token, _id } = JSON.parse(savedUser)
            setUserId(_id)
            try {
                const { data } = await axios.get("http://localhost:5001/api/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (data) {
                    setFormData({
                        fullName: data.fullName || "",
                        course: data.course || "",
                        department: data.department || "",
                        dreamCompany: data.dreamCompany || "",
                    })
                }
            } catch (err) {
                console.log("No profile found yet")
            }
        }
        fetchProfile()
    }, [router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage({ type: "", text: "" })

        const savedUser = localStorage.getItem("user")
        const { token } = JSON.parse(savedUser!)

        const data = new FormData()
        data.append("fullName", formData.fullName)
        data.append("course", formData.course)
        data.append("department", formData.department)
        data.append("dreamCompany", formData.dreamCompany)
        if (file) {
            data.append("resume", file)
        }

        try {
            await axios.post("http://localhost:5001/api/profile", data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            })
            setMessage({ type: "success", text: "Profile updated successfully!" })
            setTimeout(() => router.push("/dashboard"), 1500)
        } catch (err: any) {
            setMessage({ type: "error", text: err.response?.data?.message || "Error updating profile" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-white relative overflow-hidden aurora-glow">
            <MeshBackground />
            <HolographicHud />

            {/* Floating ambient orbs */}
            <div className="absolute top-28 right-20 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
            <div className="absolute bottom-24 left-16 w-72 h-72 bg-cyan-500/4 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />

            <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-10 py-6 md:py-10 space-y-10 relative z-10">
                <DashboardHeader
                    title="Neural Identity Profile"
                    subtitle="Customize your professional persona for cross-sector interview calibration."
                    breadcrumbs={[{ label: "Profile" }]}
                />

                <TiltCard className="max-w-4xl mx-auto">
                    <Card className="bg-white/60 dark:bg-zinc-900/50 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden group hover:border-violet-500/20 hover:shadow-[0_0_40px_rgba(139,92,246,0.06)] transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="px-8 pt-8 pb-4">
                            <CardTitle className="text-3xl font-black italic uppercase tracking-tighter group-hover:text-violet-400 transition-colors italic"><span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Dossier</span> Configuration</CardTitle>
                            <CardDescription className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest leading-relaxed">
                                Supply metadata to fine-tune AI interview parameters.
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-6 px-6 sm:px-8">
                                {message.text && (
                                    <div className={`p-4 rounded-xl text-sm font-medium border ${message.type === "success"
                                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                                        : "bg-red-500/10 text-red-400 border-red-500/20"
                                        }`}>
                                        {message.text}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 group/input">
                                        <Label htmlFor="fullName" className="text-zinc-500 group-hover/input:text-violet-400 transition-colors text-[10px] font-black uppercase tracking-widest ml-1">
                                            Full Identification
                                        </Label>
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            required
                                            onChange={handleChange}
                                            className="h-14 bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus-visible:ring-violet-500/50 transition-all text-base font-medium px-4"
                                        />
                                    </div>
                                    <div className="space-y-2 group/input">
                                        <Label htmlFor="course" className="text-zinc-500 group-hover/input:text-primary transition-colors text-[10px] font-black uppercase tracking-widest ml-1">
                                            Academic Specialization
                                        </Label>
                                        <Input
                                            id="course"
                                            name="course"
                                            value={formData.course}
                                            placeholder="e.g. Cognitive Systems Engineering"
                                            required
                                            onChange={handleChange}
                                            className="h-14 bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-zinc-700 rounded-xl focus-visible:ring-violet-500/50 transition-all text-base font-medium px-4"
                                        />
                                    </div>
                                    <div className="space-y-2 group/input">
                                        <Label htmlFor="department" className="text-zinc-500 group-hover/input:text-primary transition-colors text-[10px] font-black uppercase tracking-widest ml-1">
                                            Sector / Department
                                        </Label>
                                        <Input
                                            id="department"
                                            name="department"
                                            value={formData.department}
                                            placeholder="e.g. Applied Intelligence"
                                            required
                                            onChange={handleChange}
                                            className="h-14 bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-zinc-700 rounded-xl focus-visible:ring-violet-500/50 transition-all text-base font-medium px-4"
                                        />
                                    </div>
                                    <div className="space-y-2 group/input">
                                        <Label htmlFor="dreamCompany" className="text-zinc-500 group-hover/input:text-primary transition-colors text-[10px] font-black uppercase tracking-widest ml-1">
                                            Target Authority
                                        </Label>
                                        <Input
                                            id="dreamCompany"
                                            name="dreamCompany"
                                            value={formData.dreamCompany}
                                            placeholder="e.g. Neuralink"
                                            required
                                            onChange={handleChange}
                                            className="h-14 bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-zinc-700 rounded-xl focus-visible:ring-primary/50 transition-all text-base font-medium px-4"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest ml-1">Professional Dossier (PDF / DOC)</Label>
                                    <div className="border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center space-y-4 hover:border-violet-500/40 hover:bg-white/5 transition-all cursor-pointer relative group/upload">
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleFileChange}
                                        />
                                        {/* File display logic */}
                                        {file ? (
                                            <div className="flex flex-col items-center space-y-3 animate-in zoom-in-95 duration-300">
                                                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                                                </div>
                                                <span className="text-sm font-black text-slate-900 dark:text-white italic">{file.name}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                                    className="h-8 px-4 font-black uppercase tracking-widest text-[9px] hover:bg-red-500/10 hover:text-red-500 transition-colors relative z-30"
                                                >
                                                    REPLACE DOSSIER
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center space-y-3 transition-transform group-hover/upload:scale-105 duration-500">
                                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-white/10 group-hover/upload:border-violet-500/40 transition-colors">
                                                    <Upload className="w-8 h-8 text-zinc-600 group-hover/upload:text-violet-400 transition-colors" />
                                                </div>
                                                <div className="text-center">
                                                    <span className="text-sm font-black text-slate-500 dark:text-zinc-400 block uppercase tracking-tighter">Click to upload or drag and drop</span>
                                                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-1 block">Maximum binary size: 5MB</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 border-t border-slate-100 dark:border-white/5 p-8 bg-white dark:bg-black/20">
                                <Button
                                    variant="ghost"
                                    type="button"
                                    onClick={() => router.back()}
                                    className="h-14 px-8 w-full sm:w-auto hover:bg-white/5 text-zinc-500 font-black uppercase tracking-widest text-xs rounded-xl transition-all"
                                >
                                    Abort Configuration
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="h-14 px-12 w-full sm:w-auto bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 text-slate-900 dark:text-white hover:from-violet-400 hover:via-fuchsia-400 hover:to-cyan-400 font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_25px_rgba(139,92,246,0.2)] hover:shadow-[0_0_40px_rgba(139,92,246,0.3)] transition-all duration-500"
                                >
                                    {loading ? <div className="flex items-center gap-2"><Loader2 className="animate-spin w-4 h-4" /> UPLOADING...</div> : "COMMIT CHANGES"}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TiltCard>

                {/* Neural Activity Section */}
                {userId && (
                    <div className="max-w-4xl mx-auto space-y-12">
                        <div className="relative group/activity">
                            <div className="absolute -left-10 top-0 w-[2px] h-full bg-gradient-to-b from-violet-500/40 to-transparent" />
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white mb-2 group-hover/activity:text-violet-400 transition-colors">Neural Activity</h2>
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Historical Telemetry Data</p>
                        </div>

                        <div className="space-y-12">
                            <TiltCard>
                                <div className="bg-white/60 dark:bg-zinc-900/50 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 hover:border-violet-500/15 transition-all duration-300">
                                    <ProfileStats userId={userId} />
                                </div>
                            </TiltCard>

                            <TiltCard>
                                <div className="bg-white/60 dark:bg-zinc-900/50 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 hover:border-violet-500/15 transition-all duration-300">
                                    <SubmissionHistory userId={userId} />
                                </div>
                            </TiltCard>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
