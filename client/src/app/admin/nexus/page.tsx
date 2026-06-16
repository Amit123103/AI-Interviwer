"use client"

import React, { useState, useEffect, useCallback } from 'react'
import {
    Megaphone,
    FileText,
    TrendingUp,
    Plus,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    User,
    Shield,
    Calendar,
    ExternalLink,
    Loader2,
    ArrowLeft,
    Search,
    Filter,
    ArrowUpCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import MeshBackground from "@/app/dashboard/components/MeshBackground"
import { motion, AnimatePresence } from "framer-motion"

interface Announcement {
    _id: string
    title: string
    content: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    audience: 'all' | 'students' | 'pro'
    expiresAt: string
    createdAt: string
}

interface Resource {
    _id: string
    title: string
    description: string
    url: string
    type: 'pdf' | 'video' | 'link' | 'doc'
    category: string
    createdAt: string
}

interface UpgradeRequest {
    _id: string
    userId: {
        _id: string
        username: string
        email: string
    }
    requestedPlan: string
    status: 'pending' | 'approved' | 'rejected'
    studentNotes: string
    createdAt: string
}

export default function PlatformNexus() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'announcements' | 'resources' | 'upgrades'>('announcements')

    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [resources, setResources] = useState<Resource[]>([])
    const [upgrades, setUpgrades] = useState<UpgradeRequest[]>([])

    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    // ── Admin Auth Guard ──
    useEffect(() => {
        if (typeof window === 'undefined') return
        const session = localStorage.getItem('admin_session')
        if (!session) { router.push('/admin/login'); return }
        try {
            const parsed = JSON.parse(session)
            if (!parsed.token || parsed.expiresAt < Date.now()) {
                localStorage.removeItem('admin_session')
                router.push('/admin/login')
            }
        } catch { localStorage.removeItem('admin_session'); router.push('/admin/login') }
    }, [router])

    // Form States
    const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false)
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        content: '',
        priority: 'medium',
        audience: 'all',
        expiryDays: 7
    })

    const [showCreateResource, setShowCreateResource] = useState(false)
    const [newResource, setNewResource] = useState({
        title: '',
        description: '',
        url: '',
        type: 'pdf',
        category: 'Interview Prep'
    })

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            const headers = { 'Authorization': `Bearer ${token}` }

            // Fetch based on active tab
            if (activeTab === 'announcements') {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/announcements`, { headers })
                setAnnouncements(await res.json())
            } else if (activeTab === 'resources') {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/resources`, { headers })
                setResources(await res.json())
            } else {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/upgrades`, { headers })
                setUpgrades(await res.json())
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [activeTab])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleCreateAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault()
        setActionLoading('creating_announcement')
        try {
            const token = localStorage.getItem("token")
            const expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + newAnnouncement.expiryDays)

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/announcements`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...newAnnouncement, expiresAt })
            })
            if (res.ok) {
                setShowCreateAnnouncement(false)
                setNewAnnouncement({ title: '', content: '', priority: 'medium', audience: 'all', expiryDays: 7 })
                fetchData()
            }
        } catch (err) {
            console.error(err)
        } finally {
            setActionLoading(null)
        }
    }

    const handleDeleteAnnouncement = async (id: string) => {
        if (!confirm('Delete this announcement?')) return
        setActionLoading(id)
        try {
            const token = localStorage.getItem("token")
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/announcements/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            fetchData()
        } catch (err) {
            console.error(err)
        } finally {
            setActionLoading(null)
        }
    }

    const handleCreateResource = async (e: React.FormEvent) => {
        e.preventDefault()
        setActionLoading('creating_resource')
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/resources`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newResource)
            })
            if (res.ok) {
                setShowCreateResource(false)
                setNewResource({ title: '', description: '', url: '', type: 'pdf', category: 'Interview Prep' })
                fetchData()
            }
        } catch (err) {
            console.error(err)
        } finally {
            setActionLoading(null)
        }
    }

    const handleUpgradeResponse = async (id: string, status: 'approved' | 'rejected') => {
        setActionLoading(id)
        try {
            const token = localStorage.getItem("token")
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/upgrades/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status, adminNotes: `Manual processing: ${status}` })
            })
            fetchData()
        } catch (err) {
            console.error(err)
        } finally {
            setActionLoading(null)
        }
    }

    return (
        <div className="min-h-screen bg-transparent text-white py-8 px-4 sm:px-6 relative overflow-hidden">
            <MeshBackground />

            <div className="max-w-7xl mx-auto space-y-6 relative z-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-zinc-400">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tight">Platform Nexus</h1>
                            <p className="text-xs text-zinc-500">Global Announcements, Resources & Lifecycle Management</p>
                        </div>
                    </div>
                    <div className="flex bg-zinc-900/60 p-1 rounded-2xl border border-white/5 shadow-inner">
                        {[
                            { id: 'announcements', label: 'Broadcasts', icon: Megaphone },
                            { id: 'resources', label: 'Knowledge Base', icon: FileText },
                            { id: 'upgrades', label: 'Upgrade Vault', icon: ArrowUpCircle }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20' : 'text-zinc-500 hover:text-white'}`}
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid gap-6">
                    {activeTab === 'announcements' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-violet-400">Live Broadcasts</h2>
                                <Button
                                    onClick={() => setShowCreateAnnouncement(true)}
                                    className="bg-zinc-900/60 border border-white/10 hover:border-violet-500/50 text-[10px] font-black uppercase tracking-widest h-10 px-4 rounded-xl transition-all"
                                >
                                    <Plus className="w-3.5 h-3.5 mr-2" /> New Broadcast
                                </Button>
                            </div>

                            <div className="grid gap-4">
                                {loading ? <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div> :
                                    announcements.length === 0 ? <div className="py-20 text-center text-zinc-600 font-black uppercase bg-zinc-900/40 rounded-3xl border border-white/5">No active broadcasts</div> :
                                        announcements.map(ann => (
                                            <motion.div
                                                key={ann._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row gap-6 relative group overflow-hidden"
                                            >
                                                <div className={`absolute top-0 left-0 w-1 h-full ${ann.priority === 'urgent' ? 'bg-red-500' : ann.priority === 'high' ? 'bg-orange-500' : 'bg-violet-500'}`} />
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest ${ann.priority === 'urgent' ? 'bg-red-500/20 text-red-400' : 'bg-violet-500/20 text-violet-400'}`}>{ann.priority}</span>
                                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Target: {ann.audience}</span>
                                                    </div>
                                                    <h3 className="text-lg font-black text-white">{ann.title}</h3>
                                                    <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">{ann.content}</p>
                                                    <div className="flex items-center gap-4 pt-2 text-[9px] text-zinc-600 font-black uppercase">
                                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Expires: {new Date(ann.expiresAt).toLocaleDateString()}</span>
                                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Posted: {new Date(ann.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <button
                                                        onClick={() => handleDeleteAnnouncement(ann._id)}
                                                        disabled={actionLoading === ann._id}
                                                        className="p-3 bg-red-500/5 hover:bg-red-500/10 text-zinc-600 hover:text-red-500 rounded-2xl transition-all"
                                                    >
                                                        {actionLoading === ann._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'resources' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">Resource Repository</h2>
                                <Button
                                    onClick={() => setShowCreateResource(true)}
                                    className="bg-zinc-900/60 border border-white/10 hover:border-emerald-500/50 text-[10px] font-black uppercase tracking-widest h-10 px-4 rounded-xl transition-all"
                                >
                                    <Plus className="w-3.5 h-3.5 mr-2" /> Add Resource
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {loading ? <div className="col-span-full py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div> :
                                    resources.length === 0 ? <div className="col-span-full py-20 text-center text-zinc-600 font-black uppercase bg-zinc-900/40 rounded-3xl border border-white/5">Repository empty</div> :
                                        resources.map(res => (
                                            <motion.div
                                                key={res._id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="bg-zinc-900/50 border border-white/5 p-5 rounded-[32px] hover:border-white/10 transition-all group"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                                        <FileText className="w-6 h-6" />
                                                    </div>

                                                </div>
                                                <h3 className="font-black text-white text-base mb-1 truncate">{res.title}</h3>
                                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">{res.category}</p>
                                                <p className="text-xs text-zinc-400 line-clamp-2 mb-6 h-8">{res.description}</p>
                                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                    <a href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-400 hover:text-emerald-300 transition-colors">
                                                        View Asset <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                    <button className="text-zinc-600 hover:text-red-500 transition-colors">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'upgrades' && (
                        <div className="space-y-4">
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-amber-400">Pending Upgrade Requests</h2>
                            <div className="grid gap-4">
                                {loading ? <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div> :
                                    upgrades.filter(u => u.status === 'pending').length === 0 ? <div className="py-20 text-center text-zinc-600 font-black uppercase bg-zinc-900/40 rounded-3xl border border-white/5">No pending requests</div> :
                                        upgrades.filter(u => u.status === 'pending').map(upg => (
                                            <motion.div
                                                key={upg._id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-3xl flex flex-col md:flex-row md:items-center gap-6"
                                            >
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-black text-sm">
                                                            {upg.userId.username[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-black text-white text-sm">{upg.userId.username}</h3>
                                                            <p className="text-[10px] text-zinc-500 font-mono">{upg.userId.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="pt-3">
                                                        <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.15em]">Requested Plan: {upg.requestedPlan}</p>
                                                        <p className="text-xs text-zinc-400 mt-1 italic">"{upg.studentNotes || 'No notes provided'}"</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Button
                                                        onClick={() => handleUpgradeResponse(upg._id, 'approved')}
                                                        disabled={actionLoading === upg._id}
                                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[9px] h-10 px-6 rounded-xl"
                                                    >
                                                        {actionLoading === upg._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><CheckCircle className="w-3.5 h-3.5 mr-2" /> Approve</>}
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleUpgradeResponse(upg._id, 'rejected')}
                                                        disabled={actionLoading === upg._id}
                                                        className="bg-zinc-800 hover:bg-red-900/20 hover:text-red-500 text-zinc-400 font-black uppercase tracking-widest text-[9px] h-10 px-6 rounded-xl border border-white/5 transition-all"
                                                    >
                                                        <XCircle className="w-3.5 h-3.5 mr-2" /> Reject
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Announcement Modal */}
            <AnimatePresence>
                {showCreateAnnouncement && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateAnnouncement(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-[40px] p-10 shadow-2xl overflow-hidden">
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-8">Deploy Broadcast</h2>
                            <form onSubmit={handleCreateAnnouncement} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block px-1">Broadcast Title</label>
                                    <input type="text" required value={newAnnouncement.title} onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:border-violet-500/50 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block px-1">Content / Message</label>
                                    <textarea required value={newAnnouncement.content} onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium focus:border-violet-500/50 outline-none resize-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block px-1">Priority</label>
                                        <select value={newAnnouncement.priority} onChange={e => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value as any })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-violet-500/50 outline-none">
                                            <option value="low" className="bg-zinc-950">LOW</option>
                                            <option value="medium" className="bg-zinc-950">MEDIUM</option>
                                            <option value="high" className="bg-zinc-950">HIGH</option>
                                            <option value="urgent" className="bg-zinc-950">URGENT</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block px-1">Audience</label>
                                        <select value={newAnnouncement.audience} onChange={e => setNewAnnouncement({ ...newAnnouncement, audience: e.target.value as any })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-violet-500/50 outline-none">
                                            <option value="all" className="bg-zinc-950">ALL USERS</option>
                                            <option value="students" className="bg-zinc-950">FREE STUDENTS</option>
                                            <option value="pro" className="bg-zinc-950">PRO USERS</option>
                                        </select>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full h-14 bg-violet-600 hover:bg-violet-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-violet-500/20">{actionLoading === 'creating_announcement' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Launch Broadcast'}</Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Create Resource Modal */}
            <AnimatePresence>
                {showCreateResource && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateResource(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-[40px] p-10 shadow-2xl overflow-hidden">
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-8">Index New Asset</h2>
                            <form onSubmit={handleCreateResource} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block px-1">Asset Title</label>
                                    <input type="text" required value={newResource.title} onChange={e => setNewResource({ ...newResource, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:border-emerald-500/50 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block px-1">Resource URL / Link</label>
                                    <input type="url" required value={newResource.url} onChange={e => setNewResource({ ...newResource, url: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-mono focus:border-emerald-500/50 outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block px-1">Type</label>
                                        <select value={newResource.type} onChange={e => setNewResource({ ...newResource, type: e.target.value as any })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-emerald-500/50 outline-none">
                                            <option value="pdf" className="bg-zinc-950">PDF DOCUMENT</option>
                                            <option value="video" className="bg-zinc-950">VIDEO LESSON</option>
                                            <option value="link" className="bg-zinc-950">EXTERNAL LINK</option>
                                            <option value="doc" className="bg-zinc-950">WRITTEN DOC</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block px-1">Category</label>
                                        <input type="text" value={newResource.category} onChange={e => setNewResource({ ...newResource, category: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-emerald-500/50 outline-none" />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-emerald-500/20">{actionLoading === 'creating_resource' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Index Asset'}</Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
