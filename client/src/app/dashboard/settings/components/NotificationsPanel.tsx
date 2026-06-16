"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import axios from "axios"
import { Bell, Save, Loader2, Mail, Clock, Zap } from "lucide-react"

export default function NotificationsPanel({ user }: { user: any }) {
    const [loading, setLoading] = useState(false)
    const [notifs, setNotifs] = useState({
        email: user.preferences?.notifications?.email ?? true,
        reminders: user.preferences?.notifications?.reminders ?? true,
        updates: user.preferences?.notifications?.updates ?? true
    })

    const handleSave = async () => {
        setLoading(true)
        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/user/settings/notifications`,
                notifs,
                { headers: { Authorization: `Bearer ${user.token}` } }
            )
            toast.success("Notification settings saved")
            const newUser = {
                ...user,
                preferences: {
                    ...user.preferences,
                    notifications: notifs
                }
            }
            localStorage.setItem("user", JSON.stringify(newUser))
        } catch (err) {
            console.error("Error saving notifications:", err)
            toast.error("Failed to save settings")
        } finally {
            setLoading(false)
        }
    }

    const ToggleItem = ({ label, desc, checked, onChange, icon: Icon }: any) => (
        <div className="flex items-center justify-between p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 transition-all mb-3 last:mb-0">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                    <label className="text-sm font-semibold text-slate-900 dark:text-white leading-none">{label}</label>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{desc}</p>
                </div>
            </div>
            <Switch checked={checked} onCheckedChange={onChange} className="data-[state=checked]:bg-blue-600" />
        </div>
    )

    return (
        <div className="space-y-8 max-w-2xl">
            <section className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Notification Preferences</h3>
                <div className="grid gap-2">
                    <ToggleItem
                        label="Email notifications"
                        desc="Weekly summaries, feedback reports, and account activity."
                        checked={notifs.email}
                        onChange={(v: boolean) => setNotifs({ ...notifs, email: v })}
                        icon={Mail}
                    />
                    <ToggleItem
                        label="Interview reminders"
                        desc="Receive alerts before your scheduled interview sessions."
                        checked={notifs.reminders}
                        onChange={(v: boolean) => setNotifs({ ...notifs, reminders: v })}
                        icon={Clock}
                    />
                    <ToggleItem
                        label="System updates"
                        desc="News about new features, improvements, and service updates."
                        checked={notifs.updates}
                        onChange={(v: boolean) => setNotifs({ ...notifs, updates: v })}
                        icon={Zap}
                    />
                </div>
            </section>

            <div className="flex justify-end pt-4">
                <Button onClick={handleSave} disabled={loading} className="h-11 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save settings
                </Button>
            </div>
        </div>
    )
}
