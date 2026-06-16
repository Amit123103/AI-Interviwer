"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import axios from "axios"
import { ShieldCheck, Loader2, Lock, Fingerprint, Eye, EyeOff, KeyRound, Shield, Laptop, Smartphone, Globe } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function SecurityPanel({ user }: { user: any }) {
    const [loading, setLoading] = useState(false)
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: ""
    })
    const [twoFactor, setTwoFactor] = useState(user.twoFactorEnabled || false)

    const handlePasswordChange = async () => {
        if (passwords.new !== passwords.confirm) {
            toast.error("New passwords do not match")
            return
        }
        if (passwords.new.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        setLoading(true)
        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/user/settings/security/password`,
                { currentPassword: passwords.current, newPassword: passwords.new },
                { headers: { Authorization: `Bearer ${user.token}` } }
            )
            toast.success("Password updated")
            setPasswords({ current: "", new: "", confirm: "" })
        } catch (err: any) {
            console.error("Error changing password:", err)
            toast.error(err.response?.data?.message || "Failed to update password")
        } finally {
            setLoading(false)
        }
    }

    const toggle2FA = async (checked: boolean) => {
        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/user/settings/security/2fa`,
                { enabled: checked },
                { headers: { Authorization: `Bearer ${user.token}` } }
            )
            setTwoFactor(checked)
            toast.success(checked ? "2FA enabled" : "2FA disabled")
        } catch (err) {
            console.error("Error toggling 2FA:", err)
            toast.error("Failed to update 2FA")
        }
    }

    const getStrength = (pw: string) => {
        let s = 0
        if (pw.length >= 6) s++
        if (pw.length >= 10) s++
        if (/[A-Z]/.test(pw)) s++
        if (/[0-9]/.test(pw)) s++
        if (/[^A-Za-z0-9]/.test(pw)) s++
        return s
    }
    const strength = getStrength(passwords.new)
    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent']
    const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-blue-500']

    return (
        <div className="space-y-10 max-w-3xl">
            <section className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Change password</h3>
                <div className="grid gap-4 max-w-md">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Current password</label>
                        <div className="relative">
                            <Input
                                type={showCurrent ? "text" : "password"}
                                value={passwords.current}
                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                placeholder="••••••••"
                                className="h-11 pr-10 rounded-lg"
                            />
                            <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">New password</label>
                        <div className="relative">
                            <Input
                                type={showNew ? "text" : "password"}
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                placeholder="••••••••"
                                className="h-11 pr-10 rounded-lg"
                            />
                            <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {passwords.new.length > 0 && (
                            <div className="space-y-1 mt-2">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(l => (
                                        <div key={l} className={`h-1 flex-1 rounded-full ${strength >= l ? strengthColors[strength] : 'bg-slate-200 dark:bg-white/10'}`} />
                                    ))}
                                </div>
                                <span className="text-[10px] font-medium text-slate-500">{strengthLabels[strength]}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Confirm new password</label>
                        <div className="relative">
                            <Input
                                type={showConfirm ? "text" : "password"}
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                placeholder="••••••••"
                                className="h-11 pr-10 rounded-lg"
                            />
                            <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <Button onClick={handlePasswordChange} disabled={loading || !passwords.current || !passwords.new} className="mt-2 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Update password
                    </Button>
                </div>
            </section>

            <section className="pt-10 border-t border-slate-100 dark:border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Two-factor authentication</h3>
                        <p className="text-sm text-slate-500 dark:text-zinc-400">Add an extra layer of security to your account.</p>
                    </div>
                    <Switch checked={twoFactor} onCheckedChange={toggle2FA} />
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-start gap-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                        <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium">Authenticator app</h4>
                        <p className="text-xs text-slate-500 mt-1">Use an app like Google Authenticator or 1Password to generate one-time codes.</p>
                        {twoFactor && (
                            <Button variant="link" className="p-0 h-auto text-xs text-blue-600 hover:text-blue-700 mt-2">Configure authenticator</Button>
                        )}
                    </div>
                </div>
            </section>

            <section className="pt-10 border-t border-slate-100 dark:border-white/5 space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Active sessions</h3>
                <div className="grid gap-3">
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Laptop className="w-5 h-5 text-slate-400" />
                            <div>
                                <p className="text-sm font-medium">Windows PC • Chrome</p>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Current session</p>
                            </div>
                        </div>
                        <span className="text-xs text-slate-400">United States</span>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-white/5 opacity-70">
                        <div className="flex items-center gap-4">
                            <Smartphone className="w-5 h-5 text-slate-400" />
                            <div>
                                <p className="text-sm font-medium">iPhone 14 Pro • Safari</p>
                                <p className="text-xs text-slate-500">Last active 2 hours ago</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">Log out</Button>
                    </div>
                </div>
            </section>
        </div>
    )
}
