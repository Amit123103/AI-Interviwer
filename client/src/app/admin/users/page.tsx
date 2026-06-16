"use client"

import React, { useState, useEffect, useCallback } from 'react'
import {
    Search,
    Filter,
    MoreVertical,
    User,
    Shield,
    ShieldAlert,
    Calendar,
    Ban,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Loader2,
    ArrowLeft,
    Crown,
    Zap,
    UserPlus,
    Trash2,
    AlertCircle,
    Mail,
    X,
    Settings,
    TrendingUp,
    Activity,
    Save
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import MeshBackground from "@/app/dashboard/components/MeshBackground"
import { motion, AnimatePresence } from "framer-motion"

interface UserEntry {
    _id: string
    username: string
    email: string
    role: 'student' | 'admin' | 'sub-admin'
    accountStatus: 'active' | 'suspended'
    intervyxaCoins: number
    level: number
    weeklyCoins: number
    stats: {
        totalInterviews: number
        totalCodeLines: number
        averageScore: number
    }
    proSubscription: {
        isActive: boolean
        plan: string | null
        expiryDate: string | null
    }
    createdAt: string
}

interface UserDetails {
    user: UserEntry
    logins: any[]
    payments: any[]
}

export default function UserManagement() {
    const router = useRouter()
    const [users, setUsers] = useState<UserEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [details, setDetails] = useState<UserDetails | null>(null)
    const [showDetails, setShowDetails] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [editData, setEditData] = useState<any>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'student' })

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

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            const params = new URLSearchParams({
                page: String(page),
                limit: '15',
                search,
                status: statusFilter
            })
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/users?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setUsers(data.users || [])
            setTotalPages(data.totalPages || 1)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [page, search, statusFilter])

    useEffect(() => {
        const timer = setTimeout(fetchUsers, 500)
        return () => clearTimeout(timer)
    }, [fetchUsers])

    const fetchUserDetails = async (userId: string) => {
        setActionLoading(userId)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/users/${userId}/details`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!res.ok) throw new Error('Failed')
            const data = await res.json()
            setDetails(data)
            setShowDetails(true)
        } catch (err) {
            console.error(err)
        } finally {
            setActionLoading(null)
        }
    }

    const handleUpdateStatus = async (userId: string, status: string) => {
        setActionLoading(userId)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/users/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, status })
            })
            if (!res.ok) throw new Error('Failed')
            fetchUsers()
            if (details && details.user._id === userId) {
                setDetails({ ...details, user: { ...details.user, accountStatus: status as any } })
            }
        } catch (err) {
            console.error(err)
        } finally {
            setActionLoading(null)
        }
    }

    const handleManualPro = async (userId: string, isActive: boolean) => {
        setActionLoading(userId)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/users/pro-manual`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, isActive, plan: 'yearly', durationDays: 365 })
            })
            if (!res.ok) throw new Error('Failed')
            fetchUsers()
            if (details && details.user._id === userId) {
                setDetails({
                    ...details,
                    user: {
                        ...details.user,
                        proSubscription: { ...details.user.proSubscription, isActive }
                    }
                })
            }
        } catch (err) {
            console.error(err)
        } finally {
            setActionLoading(null)
        }
    }

    const handleUpdateDetailed = async () => {
        if (!details) return
        setActionLoading(details.user._id)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/users/detailed`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: details.user._id, ...editData })
            })
            if (!res.ok) throw new Error('Failed')
            const updatedUser = await res.json()
            setDetails({ ...details, user: updatedUser })
            setEditMode(false)
            fetchUsers()
        } catch (err) {
            console.error(err)
        } finally {
            setActionLoading(null)
        }
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/users`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            })
            if (!res.ok) {
                const err = await res.json()
                alert(err.message || 'Failed to create user')
                return
            }
            setShowCreateModal(false)
            setNewUser({ username: '', email: '', password: '', role: 'student' })
            fetchUsers()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('CRITICAL: This will permanently erase this student account and all related neural data. Proceed?')) return
        setActionLoading(userId)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!res.ok) throw new Error('Failed')
            fetchUsers()
            if (showDetails) setShowDetails(false)
        } catch (err) {
            console.error(err)
        } finally {
            setActionLoading(null)
        }
    }

    const handleUpdateRole = async (userId: string, role: string) => {
        setActionLoading(userId)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/users/role`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, role })
            })
            if (!res.ok) throw new Error('Failed')
            fetchUsers()
            if (details && details.user._id === userId) {
                setDetails({ ...details, user: { ...details.user, role: role as any } })
            }
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
                            <h1 className="text-2xl font-black uppercase tracking-tight">User Database</h1>
                            <p className="text-xs text-zinc-500">Manage and control all registered students</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-violet-600 hover:bg-violet-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl h-12 px-6 shadow-[0_0_30px_rgba(139,92,246,0.4)]"
                    >
                        <UserPlus className="w-4 h-4 mr-2" /> Create Student Account
                    </Button>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-violet-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or ID..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                            className="w-full bg-zinc-900/60 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-all shadow-inner"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {[
                            { id: '', label: 'All' },
                            { id: 'pro', label: 'Pro' },
                            { id: 'free', label: 'Free' },
                            { id: 'suspended', label: 'Suspended' }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => { setStatusFilter(f.id); setPage(1) }}
                                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${statusFilter === f.id
                                    ? 'bg-violet-500 border-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                                    : 'bg-zinc-900/60 border-white/10 text-zinc-500 hover:text-white'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* User List */}
                <div className="grid gap-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-20 bg-zinc-900/40 border border-white/5 rounded-3xl">
                            <Search className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                            <p className="text-zinc-500 font-bold uppercase tracking-wider">No users found matching your query</p>
                        </div>
                    ) : (
                        users.map((u) => (
                            <motion.div
                                key={u._id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4 group hover:border-white/20 transition-all ${u.accountStatus === 'suspended' ? 'opacity-60 bg-red-500/5' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black ${u.accountStatus === 'suspended' ? 'bg-red-500/20 text-red-500' : 'bg-violet-500/10 text-violet-400'
                                        }`}>
                                        {u.username[0].toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-black text-white truncate max-w-[200px]">{u.username}</h3>
                                            {u.proSubscription.isActive && <Crown className="w-3.5 h-3.5 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]" />}
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-[11px] text-zinc-500 font-medium">
                                            <span className="flex items-center gap-1 cursor-pointer hover:text-violet-400 transition-colors" onClick={() => fetchUserDetails(u._id)}><Mail className="w-3 h-3" /> {u.email}</span>
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(u.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 text-sm">
                                    <div className="space-y-1 min-w-[120px]">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-zinc-600">Pro Status</p>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${u.proSubscription.isActive ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
                                            <span className={`font-bold uppercase text-[10px] tracking-widest ${u.proSubscription.isActive ? 'text-emerald-400' : 'text-zinc-600'}`}>
                                                {u.proSubscription.isActive ? 'Active' : 'Free'}
                                            </span>
                                        </div>
                                    </div>

                                    {u.proSubscription.expiryDate && (
                                        <div className="space-y-1 min-w-[120px]">
                                            <p className="text-[9px] font-black uppercase tracking-wider text-zinc-600">Expiry Date</p>
                                            <p className="font-bold text-xs text-zinc-400">{new Date(u.proSubscription.expiryDate).toLocaleDateString('en-IN')}</p>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 ml-auto">
                                        <Button
                                            onClick={() => fetchUserDetails(u._id)}
                                            disabled={actionLoading === u._id}
                                            variant="outline"
                                            size="sm"
                                            className="h-9 px-4 font-black uppercase tracking-wider text-[10px] border-white/10 hover:bg-violet-500/10 hover:text-violet-400"
                                        >
                                            Details
                                        </Button>
                                        <Button
                                            onClick={() => handleManualPro(u._id, !u.proSubscription.isActive)}
                                            disabled={actionLoading === u._id}
                                            variant="outline"
                                            size="sm"
                                            className={`h-9 px-4 font-black uppercase tracking-wider text-[10px] border-white/10 ${u.proSubscription.isActive ? 'hover:bg-red-500/10 hover:text-red-400' : 'hover:bg-emerald-500/10 hover:text-emerald-400'
                                                }`}
                                        >
                                            {u.proSubscription.isActive ? 'Revoke Pro' : 'Grant Pro'}
                                        </Button>
                                        <Button
                                            onClick={() => handleUpdateStatus(u._id, u.accountStatus === 'active' ? 'suspended' : 'active')}
                                            disabled={actionLoading === u._id}
                                            variant="outline"
                                            size="sm"
                                            className={`h-9 px-4 font-black uppercase tracking-wider text-[10px] border-white/10 ${u.accountStatus === 'active' ? 'hover:bg-red-500/10 hover:text-red-400' : 'hover:bg-emerald-500/10 hover:text-emerald-400'
                                                }`}
                                        >
                                            {u.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                                        </Button>
                                        <Button
                                            onClick={() => handleDeleteUser(u._id)}
                                            disabled={actionLoading === u._id}
                                            variant="ghost"
                                            size="sm"
                                            className="h-9 w-9 p-0 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 pt-4">
                        <Button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="bg-zinc-900 border border-white/10 hover:bg-white/5 transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-bold text-zinc-500">
                            Page <span className="text-white">{page}</span> of {totalPages}
                        </span>
                        <Button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="bg-zinc-900 border border-white/10 hover:bg-white/5 transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Detail Modal Overlay */}
            <AnimatePresence>
                {showDetails && details && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDetails(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-white/10 rounded-[32px] overflow-hidden flex flex-col shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-white/5 bg-zinc-900/20">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-6 items-center">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-2xl font-black text-white shadow-xl">
                                            {details.user.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-2xl font-black uppercase tracking-tight text-white">{details.user.username}</h2>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${details.user.accountStatus === 'suspended' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                                                    }`}>
                                                    {details.user.accountStatus}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-white/10 text-zinc-400 border border-white/5`}>
                                                    {details.user.role}
                                                </span>
                                            </div>
                                            <p className="text-zinc-500 text-sm font-medium">{details.user.email} • User ID: {details.user._id}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                if (!editMode) {
                                                    setEditData({
                                                        intervyxaCoins: details.user.intervyxaCoins,
                                                        level: details.user.level,
                                                        weeklyCoins: details.user.weeklyCoins,
                                                        stats: { ...details.user.stats }
                                                    })
                                                }
                                                setEditMode(!editMode)
                                            }}
                                            className={`p-2 rounded-full transition-all ${editMode ? 'bg-amber-500/20 text-amber-500' : 'hover:bg-white/5 text-zinc-500 hover:text-white'}`}
                                        >
                                            {editMode ? <X className="w-6 h-6" /> : <Settings className="w-6 h-6" />}
                                        </button>
                                        <button
                                            onClick={() => setShowDetails(false)}
                                            className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
                                        >
                                            <ChevronLeft className="w-6 h-6 rotate-90" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                                {editMode && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-violet-500/5 border border-violet-500/20 rounded-3xl p-6 mb-4 space-y-6"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-violet-400">Account Configuration</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-zinc-500 uppercase">Change Role:</span>
                                                <div className="flex bg-black/40 p-1 rounded-xl gap-1">
                                                    {['student', 'sub-admin', 'admin'].map(r => (
                                                        <button
                                                            key={r}
                                                            onClick={() => handleUpdateRole(details.user._id, r)}
                                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${details.user.role === r ? 'bg-violet-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                                                        >
                                                            {r}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">Intervyxa Coins</label>
                                                <input
                                                    type="number"
                                                    value={editData.intervyxaCoins}
                                                    onChange={e => setEditData({ ...editData, intervyxaCoins: Number(e.target.value) })}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold focus:border-violet-500/50 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">Current Level</label>
                                                <input
                                                    type="number"
                                                    value={editData.level}
                                                    onChange={e => setEditData({ ...editData, level: Number(e.target.value) })}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold focus:border-violet-500/50 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">Weekly Coins</label>
                                                <input
                                                    type="number"
                                                    value={editData.weeklyCoins}
                                                    onChange={e => setEditData({ ...editData, weeklyCoins: Number(e.target.value) })}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold focus:border-violet-500/50 outline-none"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <Button
                                                    onClick={handleUpdateDetailed}
                                                    disabled={!!actionLoading}
                                                    className="w-full h-10 bg-violet-600 hover:bg-violet-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-violet-500/20"
                                                >
                                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-3.5 h-3.5 mr-2" /> Save Data</>}
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                <div className="grid md:grid-cols-3 gap-8">
                                    <div className="md:col-span-2 space-y-8">
                                        {/* Subscriptions */}
                                        <section className="space-y-4">
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Subscription History</h3>
                                            {details.payments.length === 0 ? (
                                                <div className="bg-white/5 rounded-2xl p-6 text-center text-zinc-600 text-sm font-bold uppercase">No payment records</div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {details.payments.map((p: any) => (
                                                        <div key={p._id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex justify-between items-center group hover:border-white/10 transition-all">
                                                            <div>
                                                                <p className="text-xs font-black text-white uppercase tracking-wider">{p.selectedPlan} Plan</p>
                                                                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{new Date(p.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs font-black text-white">₹{p.amount}</p>
                                                                <p className={`text-[9px] font-black uppercase tracking-widest ${p.status === 'approved' ? 'text-emerald-400' : p.status === 'pending' ? 'text-amber-400' : 'text-red-400'
                                                                    }`}>{p.status}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </section>

                                        {/* Login History */}
                                        <section className="space-y-4">
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Recent Login Activity</h3>
                                            {details.logins.length === 0 ? (
                                                <div className="bg-white/5 rounded-2xl p-6 text-center text-zinc-600 text-sm font-bold uppercase">No login history recorded</div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {details.logins.map((l: any, i: number) => (
                                                        <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex gap-4 items-center overflow-hidden">
                                                            <Activity className="w-4 h-4 text-violet-400 flex-shrink-0" />
                                                            <div className="min-w-0">
                                                                <p className="text-[10px] text-zinc-400 truncate font-mono">{l.userAgent}</p>
                                                                <div className="flex gap-3 text-[9px] text-zinc-600 font-bold uppercase tracking-tighter mt-1">
                                                                    <span>{l.ipAddress}</span>
                                                                    <span>•</span>
                                                                    <span>{new Date(l.timestamp).toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </section>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Student Progression & Stats</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[
                                                { label: 'Intervyxa Coins', value: (details.user.intervyxaCoins || 0).toLocaleString(), icon: TrendingUp, color: 'text-yellow-400' },
                                                { label: 'Current Level', value: `LVL ${details.user.level}`, icon: Crown, color: 'text-amber-400' },
                                                { label: 'Weekly Earnings', value: (details.user.weeklyCoins || 0).toLocaleString(), icon: Zap, color: 'text-yellow-500' },
                                                { label: 'Avg Interview Score', value: `${details.user.stats.averageScore}%`, icon: Shield, color: 'text-emerald-400' }
                                            ].map((stat, i) => (
                                                <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
                                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{stat.label}</p>
                                                        <p className="text-xl font-black text-white mt-1">{stat.value}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 bg-zinc-900/40 border-t border-white/5 flex gap-3 justify-end items-center">
                                <Button
                                    onClick={() => handleManualPro(details.user._id, !details.user.proSubscription.isActive)}
                                    className={`font-black uppercase tracking-wider text-[10px] h-10 ${details.user.proSubscription.isActive ? 'bg-red-500/10 hover:bg-red-500/20 text-red-500' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500'
                                        }`}
                                    variant="ghost"
                                >
                                    {details.user.proSubscription.isActive ? 'Revoke Subscription' : 'Grant Full Access'}
                                </Button>
                                <Button
                                    onClick={() => handleUpdateStatus(details.user._id, details.user.accountStatus === 'active' ? 'suspended' : 'active')}
                                    className={`font-black uppercase tracking-wider text-[10px] h-10 ${details.user.accountStatus === 'active' ? 'bg-red-500/10 hover:bg-red-500/20 text-red-500' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500'
                                        }`}
                                    variant="ghost"
                                >
                                    {details.user.accountStatus === 'active' ? 'Freeze Account' : 'Reactivate User'}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Create User Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateModal(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-[40px] p-10 overflow-hidden"
                        >
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Build Profile</h2>
                            <p className="text-xs text-zinc-500 mb-8 uppercase font-bold tracking-widest">Manual Neural Account Authorization</p>

                            <form onSubmit={handleCreateUser} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block px-1">Username Identifier</label>
                                    <input
                                        type="text"
                                        required
                                        value={newUser.username}
                                        onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-violet-500/50 transition-all font-bold"
                                        placeholder="e.g. amit_singh"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block px-1">Network Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={newUser.email}
                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-violet-500/50 transition-all font-bold"
                                        placeholder="neural@network.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block px-1">Pass-Key</label>
                                    <input
                                        type="text"
                                        required
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-violet-500/50 transition-all font-mono"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block px-1">Role Permission</label>
                                    <select
                                        value={newUser.role}
                                        onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-violet-500/50 transition-all font-bold"
                                    >
                                        <option value="student" className="bg-zinc-950">STUDENT</option>
                                        <option value="sub-admin" className="bg-zinc-950">SUB-ADMIN</option>
                                        <option value="admin" className="bg-zinc-950">ADMIN</option>
                                    </select>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-14 bg-violet-600 hover:bg-violet-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-[0_10px_30px_rgba(139,92,246,0.3)]"
                                >
                                    Authorize Account
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
