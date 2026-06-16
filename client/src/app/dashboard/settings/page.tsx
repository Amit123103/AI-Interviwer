"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Shield, Settings, Bell, Lock, Eye, HelpCircle, LogOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

// Panels
import ProfilePanel from "./components/ProfilePanel"
import SecurityPanel from "./components/SecurityPanel"
import PreferencesPanel from "./components/PreferencesPanel"
import NotificationsPanel from "./components/NotificationsPanel"
import PrivacyPanel from "./components/PrivacyPanel"
import AppearancePanel from "./components/AppearancePanel"
import HelpPanel from "./components/HelpPanel"
import { motion, AnimatePresence } from "framer-motion"
import BackToDashboard from "@/components/dashboard/BackToDashboard"

export default function SettingsPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("profile")
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const userStr = localStorage.getItem("user")
        if (!userStr) {
            router.push("/auth/login")
            return
        }
        setUser(JSON.parse(userStr))
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        router.push("/auth/login")
        toast.success("Logged out successfully")
    }

    const menuItems = [
        { id: "profile", label: "Profile", icon: User, description: "Manage your public profile" },
        { id: "security", label: "Security", icon: Shield, description: "Account security & password" },
        { id: "preferences", label: "Interview", icon: Settings, description: "Personalize your sessions" },
        { id: "notifications", label: "Notifications", icon: Bell, description: "Choose what you hear from us" },
        { id: "privacy", label: "Privacy", icon: Lock, description: "Data & privacy controls" },
        { id: "appearance", label: "Appearance", icon: Eye, description: "Theme and visual settings" },
        { id: "help", label: "Support", icon: HelpCircle, description: "Get help & documentation" },
    ]

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans flex flex-col md:flex-row relative">
            <Toaster position="top-right" theme="dark" />
            
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-indigo-500/5 blur-[100px] pointer-events-none" />

            <div className="p-4 md:p-8 relative z-20 flex flex-col md:flex-row gap-8 w-full max-w-7xl mx-auto">
                <BackToDashboard currentPage="Settings" />

                {/* Left Sidebar */}
                <aside className="w-full md:w-72 shrink-0 space-y-6">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold tracking-tight mb-1">Account settings</h1>
                        <p className="text-sm text-slate-500 dark:text-zinc-400">Manage your profile and preferences.</p>
                    </div>

                    <nav className="space-y-1">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium relative group ${
                                    activeTab === item.id
                                        ? "bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-white/10"
                                        : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-200/50 dark:hover:bg-white/5"
                                }`}
                            >
                                <item.icon className={`w-4 h-4 ${activeTab === item.id ? "text-blue-500" : "text-slate-400"}`} />
                                <span className="flex-1 text-left">{item.label}</span>
                                {activeTab === item.id && (
                                    <motion.div layoutId="active-indicator" className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                )}
                            </button>
                        ))}
                    </nav>

                    <div className="pt-6 border-t border-slate-200 dark:border-white/5">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors group text-left"
                        >
                            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            Log out
                        </button>
                    </div>
                </aside>

                {/* Right Content Panel */}
                <main className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-10 shadow-sm min-h-[600px] relative overflow-hidden">
                    <div className="relative mb-8">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                {React.createElement(menuItems.find(m => m.id === activeTab)?.icon || User, { className: "w-6 h-6" })}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">{menuItems.find(m => m.id === activeTab)?.label}</h2>
                                <p className="text-sm text-slate-500 dark:text-zinc-400">{menuItems.find(m => m.id === activeTab)?.description}</p>
                            </div>
                        </div>
                        <div className="h-px w-full bg-slate-100 dark:bg-white/5 mt-6" />
                    </div>

                    <AnimatePresence mode="wait">
                        {user ? (
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="w-full h-full"
                            >
                                {activeTab === "profile" && <ProfilePanel user={user} />}
                                {activeTab === "security" && <SecurityPanel user={user} />}
                                {activeTab === "preferences" && <PreferencesPanel user={user} />}
                                {activeTab === "notifications" && <NotificationsPanel user={user} />}
                                {activeTab === "privacy" && <PrivacyPanel user={user} />}
                                {activeTab === "appearance" && <AppearancePanel user={user} />}
                                {activeTab === "help" && <HelpPanel user={user} />}
                            </motion.div>
                        ) : (
                            <div className="flex h-[400px] items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            </div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    )
}

