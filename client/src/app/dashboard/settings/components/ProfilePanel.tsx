"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import axios from "axios"
import { Camera, Save, Loader2, User, Sparkles, Link as LinkIcon, Github, Linkedin, Target } from "lucide-react"
import { motion } from "framer-motion"

export default function ProfilePanel({ user }: { user: any }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        fullName: "",
        course: "",
        department: "",
        dreamCompany: "",
        bio: "",
        profilePhoto: "",
        interviewGoal: "",
        githubLinked: false,
        linkedinLinked: false
    })

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/profile`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                })
                setFormData(prev => ({
                    ...prev,
                    ...res.data,
                    fullName: res.data.fullName || "",
                    course: res.data.course || "",
                    department: res.data.department || "",
                    dreamCompany: res.data.dreamCompany || "",
                    bio: res.data.bio || "",
                    profilePhoto: res.data.profilePhoto || "",
                    interviewGoal: res.data.interviewGoal || "",
                    githubLinked: res.data.githubLinked || false,
                    linkedinLinked: res.data.linkedinLinked || false
                }))
            } catch (err) {
                console.error("Error fetching profile:", err)
            }
        }
        if (user) fetchProfile()
    }, [user])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const data = new FormData()
            data.append("fullName", formData.fullName)
            data.append("course", formData.course)
            data.append("department", formData.department)
            data.append("dreamCompany", formData.dreamCompany)
            if (formData.bio) data.append("bio", formData.bio)
            if (formData.interviewGoal) data.append("interviewGoal", formData.interviewGoal)
            data.append("githubLinked", String(formData.githubLinked))
            data.append("linkedinLinked", String(formData.linkedinLinked))

            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/profile`,
                data,
                { headers: { Authorization: `Bearer ${user.token}` } }
            )

            toast.success("Profile updated")
        } catch (err) {
            console.error("Error updating profile:", err)
            toast.error("Failed to update profile")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-3xl">
            <section className="grid gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-slate-100 dark:border-white/5">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-hidden flex items-center justify-center">
                            {formData.profilePhoto ? (
                                <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-slate-300 dark:text-zinc-600" />
                            )}
                        </div>
                        <button className="absolute -bottom-2 -right-2 p-2 bg-blue-600 rounded-xl text-white shadow-lg hover:bg-blue-700 transition-colors">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Profile picture</h3>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mb-3">PNG, JPG or GIF. Max size 2MB.</p>
                        <Button variant="outline" size="sm" className="h-9 rounded-lg">Upload new photo</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Full name</label>
                        <Input
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="e.g. John Doe"
                            className="h-11 rounded-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Dream company</label>
                        <Input
                            name="dreamCompany"
                            value={formData.dreamCompany}
                            onChange={handleChange}
                            placeholder="e.g. Google"
                            className="h-11 rounded-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Degree / Course</label>
                        <Input
                            name="course"
                            value={formData.course}
                            onChange={handleChange}
                            placeholder="e.g. B.Tech Computer Science"
                            className="h-11 rounded-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Department</label>
                        <Input
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            placeholder="e.g. Engineering"
                            className="h-11 rounded-lg"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Bio</label>
                    <Textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell us a little about yourself..."
                        className="min-h-[100px] rounded-lg resize-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Current interview goal</label>
                    <Input
                        name="interviewGoal"
                        value={formData.interviewGoal}
                        onChange={handleChange}
                        placeholder="e.g. I want to land a SDE role at Meta"
                        className="h-11 rounded-lg"
                    />
                </div>
            </section>

            <section className="pt-6 border-t border-slate-100 dark:border-white/5 space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">Connected accounts</h3>
                <div className="grid gap-3">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                        <div className="flex items-center gap-3">
                            <Github className="w-5 h-5" />
                            <div>
                                <p className="text-sm font-medium">GitHub</p>
                                <p className="text-xs text-slate-500">{formData.githubLinked ? 'Connected' : 'Not connected'}</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setFormData(p => ({ ...p, githubLinked: !p.githubLinked }))}>
                            {formData.githubLinked ? 'Disconnect' : 'Connect'}
                        </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                        <div className="flex items-center gap-3">
                            <Linkedin className="w-5 h-5 text-[#0077b5]" />
                            <div>
                                <p className="text-sm font-medium">LinkedIn</p>
                                <p className="text-xs text-slate-500">{formData.linkedinLinked ? 'Connected' : 'Not connected'}</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setFormData(p => ({ ...p, linkedinLinked: !p.linkedinLinked }))}>
                            {formData.linkedinLinked ? 'Disconnect' : 'Connect'}
                        </Button>
                    </div>
                </div>
            </section>

            <div className="flex justify-end pt-6">
                <Button onClick={handleSave} disabled={loading} className="h-11 px-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save changes
                </Button>
            </div>
        </div>
    )
}

