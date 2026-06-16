import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Megaphone, X, Clock, Bell, Info, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react'
import io from 'socket.io-client'

interface Announcement {
    _id: string
    title: string
    content: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    createdAt: string
}

interface NotificationCenterProps {
    position?: 'bottom-left' | 'top-right' | 'bottom-right'
}

export default function NotificationCenter({ position = 'top-right' }: NotificationCenterProps) {
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [isVisible, setIsVisible] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
                buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                setIsVisible(false)
            }
        }
        if (isVisible) {
            document.addEventListener('mousedown', handleClickOutside)
            window.addEventListener('scroll', () => setIsVisible(false), true)
            window.addEventListener('resize', () => setIsVisible(false))
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            window.removeEventListener('scroll', () => setIsVisible(false), true)
            window.removeEventListener('resize', () => setIsVisible(false))
        }
    }, [isVisible])

    const toggleVisibility = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            setCoords({
                top: rect.top,
                left: rect.left + rect.width / 2
            })
        }
        setIsVisible(!isVisible)
    }

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem("user") || "{}");
                const token = userData.token || localStorage.getItem("token");
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/content/announcements`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setAnnouncements(data)
                    setUnreadCount(data.length)
                }
            } catch (err) {
                console.warn("Notification fetch failed (Backend could be offline):", err)
            }
        }
        fetchAnnouncements()

        const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001')
        socket.on('platform:announcement', (newAnn: Announcement) => {
            setAnnouncements(prev => [newAnn, ...prev])
            setUnreadCount(prev => prev + 1)
        })

        return () => { socket.disconnect() }
    }, [])

    const dropdownContent = (
        <AnimatePresence>
            {isVisible && coords && (
                <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, scale: 0.95, y: position.includes('bottom') ? 10 : -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: position.includes('bottom') ? 10 : -10 }}
                    transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                    style={{
                        position: 'fixed',
                        top: position.includes('bottom') ? 'auto' : `${coords.top + 50}px`,
                        bottom: position.includes('bottom') ? `${window.innerHeight - coords.top + 10}px` : 'auto',
                        left: position === 'bottom-left' ? `${coords.left - 20}px` : 'auto',
                        right: position === 'top-right' ? `${window.innerWidth - coords.left - 40}px` : 'auto',
                    }}
                    className="w-80 sm:w-[400px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-[9999]"
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-white/[0.02]">
                        <div>
                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <Megaphone className="w-5 h-5 text-indigo-500" /> 
                                Platform Alerts
                            </h3>
                            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mt-0.5">Stay updated with Intervyxa</p>
                        </div>
                        <button 
                            onClick={() => setIsVisible(false)} 
                            className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="max-h-[450px] overflow-y-auto custom-scrollbar p-4 space-y-3">
                        {announcements.length === 0 ? (
                            <div className="py-16 text-center">
                                <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-300 dark:text-zinc-600">
                                    <Bell className="w-8 h-8" />
                                </div>
                                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">All caught up!</h4>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-[200px] mx-auto">No new notifications at the moment. We'll alert you when something happens.</p>
                            </div>
                        ) : (
                            announcements.map((ann) => (
                                <motion.div
                                    key={ann._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="group p-4 rounded-2xl bg-white dark:bg-zinc-800/20 border border-zinc-100 dark:border-white/5 hover:border-indigo-500/20 hover:bg-zinc-50 dark:hover:bg-indigo-500/[0.03] transition-all relative overflow-hidden"
                                >
                                    <div className={`absolute top-0 left-0 w-1.5 h-full ${
                                        ann.priority === 'urgent' ? 'bg-rose-500' : 
                                        ann.priority === 'high' ? 'bg-amber-500' : 'bg-indigo-500'
                                    }`} />
                                    
                                    <div className="flex justify-between items-start mb-2.5">
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                            ann.priority === 'urgent' 
                                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' 
                                                : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                                        }`}>
                                            {ann.priority}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-400">
                                            <Clock className="w-3 h-3" />
                                            {new Date(ann.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    
                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1.5 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {ann.title}
                                    </h4>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                                        {ann.content}
                                    </p>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-zinc-50/50 dark:bg-white/[0.01] border-t border-zinc-100 dark:border-white/5">
                        <button 
                            onClick={() => setUnreadCount(0)}
                            className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Mark all as read
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={toggleVisibility}
                className={`relative p-2.5 rounded-xl transition-all group shadow-sm border ${
                    isVisible 
                        ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-500/20 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400' 
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
                title="View Notifications"
            >
                <Bell className={`w-5 h-5 ${unreadCount > 0 && !isVisible ? 'animate-[bell-swing_2s_infinite]' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 ring-4 ring-rose-500/20">
                        {unreadCount}
                    </span>
                )}
            </button>

            {mounted && createPortal(dropdownContent, document.body)}

            <style jsx global>{`
                @keyframes bell-swing {
                    0%, 100% { transform: rotate(0); }
                    10%, 30%, 50%, 70%, 90% { transform: rotate(15deg); }
                    20%, 40%, 60%, 80% { transform: rotate(-15deg); }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #27272a;
                }
            `}</style>
        </div>
    )
}
