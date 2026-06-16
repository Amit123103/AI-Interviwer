"use client"

import React, { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Eye, Moon, Sun, Smartphone, Palette } from "lucide-react"

export default function AppearancePanel({ user }: { user: any }) {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <div className="space-y-10 max-w-3xl">
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Theme preference</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400">Choose how the application looks to you.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <button
                        onClick={() => setTheme('light')}
                        className={`p-6 rounded-2xl border-2 text-left transition-all ${theme === 'light' ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-white/10 hover:border-slate-300'}`}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-xl ${theme === 'light' ? 'bg-white text-blue-600 shadow-sm' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                                <Sun className="w-6 h-6" />
                            </div>
                        </div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">Light mode</h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">A clean and bright look for well-lit environments.</p>
                    </button>

                    <button
                        onClick={() => setTheme('dark')}
                        className={`p-6 rounded-2xl border-2 text-left transition-all ${theme === 'dark' ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-white/10 hover:border-slate-300'}`}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                                <Moon className="w-6 h-6" />
                            </div>
                        </div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">Dark mode</h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">A sleek and modern look, easier on the eyes in the dark.</p>
                    </button>
                </div>
            </section>

            <section className="pt-10 border-t border-slate-100 dark:border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">High contrast</h4>
                        <p className="text-sm text-slate-500 dark:text-zinc-400">Increase contrast for better legibility.</p>
                    </div>
                    <Switch />
                </div>
            </section>
        </div>
    )
}
