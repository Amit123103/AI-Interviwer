"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, ExternalLink, Lock, Search, Filter, Loader2, Sparkles } from 'lucide-react'
import { Button } from "@/components/ui/button"
import io from 'socket.io-client'

interface Resource {
    _id: string
    title: string
    description: string
    url: string
    type: 'pdf' | 'video' | 'link' | 'doc'
    category: string
}

export default function ResourcesVault() {
    const [resources, setResources] = useState<Resource[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const token = localStorage.getItem("token")
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/content/resources`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    setResources(await res.json())
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchResources()

        const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001')
        socket.on('platform:resource_new', (newRes: Resource) => {
            setResources(prev => [newRes, ...prev])
        })

        return () => { socket.disconnect() }
    }, [])

    const filteredResources = resources.filter(res => {
        const matchesSearch = res.title.toLowerCase().includes(search.toLowerCase()) ||
            res.category.toLowerCase().includes(search.toLowerCase())
        const matchesFilter = filter === 'all' || res.type === filter
        return matchesSearch && matchesFilter
    })

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[20px] bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Learning Library</h2>
                        <p className="text-xs text-zinc-500">Curated resources to level up</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search assets..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-64 bg-white dark:bg-zinc-950/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-xs font-bold focus:border-emerald-500/40 outline-none transition-all"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-white dark:bg-zinc-950/50 border border-white/5 rounded-2xl px-4 py-3 text-xs font-bold focus:border-emerald-500/40 outline-none transition-all text-slate-900 dark:text-zinc-400"
                    >
                        <option value="all">All formats</option>
                        <option value="pdf">PDF documents</option>
                        <option value="video">Video training</option>
                        <option value="link">Links</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 flex justify-center">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                    </div>
                ) : filteredResources.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-zinc-600 font-semibold bg-white dark:bg-zinc-900/40 rounded-2xl border border-white/5 border-dashed">
                        No resources found
                    </div>
                ) : (
                    filteredResources.map((res, i) => (
                        <motion.div
                            key={res._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="group relative bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-6 hover:border-emerald-500/40 hover:bg-white dark:bg-zinc-900/60 transition-all duration-500 overflow-hidden"
                        >


                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-500">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] font-medium text-zinc-500">
                                    {res.type}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-emerald-400 transition-colors truncate">{res.title}</h3>
                            <p className="text-xs font-medium text-emerald-500/60 mb-4">{res.category}</p>
                            <p className="text-xs text-slate-900 dark:text-zinc-400 line-clamp-2 leading-relaxed h-8 mb-8">{res.description}</p>

                            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                <span className="text-xs text-zinc-600 font-medium">Verified</span>
                                <a
                                    href={res.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2 text-xs font-semibold transition-all text-emerald-400 hover:text-emerald-300`}
                                >
                                    Open resource <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    )
}
