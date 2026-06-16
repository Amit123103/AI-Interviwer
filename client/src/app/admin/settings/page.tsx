"use client"

import React, { useState, useEffect } from 'react'
import {
    Save,
    Settings,
    ArrowLeft,
    Loader2,
    Zap,
    Trophy,
    Shield,
    Bell,
    Globe,
    Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import MeshBackground from "@/app/dashboard/components/MeshBackground"
import { motion } from "framer-motion"

interface ConfigItem {
    _id: string
    key: string
    value: any
    description: string
}

export default function AdminSettings() {
    const router = useRouter()
    const [configs, setConfigs] = useState<ConfigItem[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<string | null>(null)

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

    const getAdminToken = () => {
        try {
            const session = JSON.parse(localStorage.getItem('admin_session') || '{}')
            return session.token || localStorage.getItem('token') || ''
        } catch { return '' }
    }

    const fetchConfig = async () => {
        try {
            const token = getAdminToken()
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/config`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setConfigs(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchConfig()
    }, [])

    const handleUpdate = async (key: string, value: any) => {
        setSaving(key)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/config`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ key, value })
            })
            if (!res.ok) throw new Error('Save failed')
            fetchConfig()
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(null)
        }
    }

    const defaultConfigs = [
        { key: 'coin_multiplier', label: 'Coin Multiplier', description: 'Base multiplier for student Intervyxa Coin gains', icon: Zap, type: 'number', defaultValue: 1 },
        { key: 'default_difficulty', label: 'Default Difficulty', description: 'Starting difficulty for new interviews', icon: Trophy, type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'], defaultValue: 'Intermediate' },
        { key: 'maintenance_mode', label: 'Maintenance Mode', description: 'Global lock for non-admin users', icon: Lock, type: 'boolean', defaultValue: false },
        { key: 'max_daily_interviews', label: 'Max Daily Interviews', description: 'Limit for free tier users', icon: Shield, type: 'number', defaultValue: 3 }
    ]

    return (
        <div className="min-h-screen bg-transparent text-white py-8 px-4 sm:px-6 relative overflow-hidden">
            <MeshBackground />

            <div className="max-w-5xl mx-auto space-y-8 relative z-10">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/admin/dashboard')} className="text-zinc-400">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">System Configuration</h1>
                        <p className="text-xs text-zinc-500">Manage global project-wide parameters and database options</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {defaultConfigs.map((def) => {
                            const current = configs.find(c => c.key === def.key)
                            const val = current ? current.value : def.defaultValue

                            return (
                                <motion.div
                                    key={def.key}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-white/10 transition-all"
                                >
                                    <div className="flex items-center gap-6 flex-1">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-violet-500/10 transition-colors">
                                            <def.icon className="w-6 h-6 text-violet-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-white uppercase tracking-wider">{def.label}</h3>
                                            <p className="text-xs text-zinc-500 mt-1">{def.description}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        {def.type === 'number' && (
                                            <input
                                                type="number"
                                                defaultValue={val}
                                                onBlur={(e) => handleUpdate(def.key, Number(e.target.value))}
                                                className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold w-24 outline-none focus:border-violet-500/50"
                                            />
                                        )}
                                        {def.type === 'select' && (
                                            <select
                                                defaultValue={val}
                                                onChange={(e) => handleUpdate(def.key, e.target.value)}
                                                className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-violet-500/50 cursor-pointer"
                                            >
                                                {def.options?.map(opt => (
                                                    <option key={opt} value={opt} className="bg-zinc-950">{opt}</option>
                                                ))}
                                            </select>
                                        )}
                                        {def.type === 'boolean' && (
                                            <button
                                                onClick={() => handleUpdate(def.key, !val)}
                                                className={`w-14 h-8 rounded-full relative transition-all ${val ? 'bg-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.3)]' : 'bg-zinc-800'}`}
                                            >
                                                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${val ? 'right-1' : 'left-1'}`} />
                                            </button>
                                        )}

                                        <div className="w-8 flex items-center justify-center">
                                            {saving === def.key && <Loader2 className="w-4 h-4 animate-spin text-violet-400" />}
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}

                {/* Info Card */}
                <div className="bg-violet-500/5 border border-violet-500/10 rounded-[32px] p-8 flex gap-6 items-center">
                    <Globe className="w-10 h-10 text-violet-400 shrink-0" />
                    <div>
                        <h4 className="font-black text-white uppercase tracking-widest text-sm">Real-time Synchronization</h4>
                        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                            Changes saved here are propagated instantly across the entire platform. Sub-Admins have view-only access to this panel by default.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
