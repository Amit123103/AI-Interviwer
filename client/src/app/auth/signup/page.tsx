"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Lock, User as UserIcon, ShieldCheck, ArrowRight, ArrowLeft, Sparkles, Fingerprint, Zap, Eye, EyeOff, CheckCircle2, Circle, Shield, Wifi, PartyPopper } from "lucide-react"
import axios from "axios"


/* ── Password requirement item ── */
function RequirementItem({ met, label }: { met: boolean; label: string }) {
    return (
        <motion.div
            layout
            className="flex items-center gap-2"
        >
            <AnimatePresence mode="wait">
                {met ? (
                    <motion.div key="check" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} className="text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                    </motion.div>
                ) : (
                    <motion.div key="circle" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-zinc-600">
                        <Circle className="w-3 h-3" />
                    </motion.div>
                )}
            </AnimatePresence>
            <span className={`text-[10px] font-bold tracking-wide transition-colors duration-300 ${met ? 'text-emerald-400' : 'text-zinc-600'}`}>
                {label}
            </span>
        </motion.div>
    )
}

export default function SignupPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({ username: "", email: "", password: "", confirmPassword: "" })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [signupSuccess, setSignupSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [focusedField, setFocusedField] = useState<string | null>(null)

    // Password analysis
    const pw = formData.password
    const requirements = [
        { met: pw.length >= 8, label: "At least 8 characters" },
        { met: /[A-Z]/.test(pw), label: "One uppercase letter" },
        { met: /[a-z]/.test(pw), label: "One lowercase letter" },
        { met: /[0-9]/.test(pw), label: "One number" },
        { met: /[^A-Za-z0-9]/.test(pw), label: "One special character" },
    ]
    const metCount = requirements.filter(r => r.met).length
    const strengthPercent = (metCount / requirements.length) * 100
    const strengthLabel = metCount <= 2 ? "Weak" : metCount <= 3 ? "Medium" : metCount <= 4 ? "Strong" : "Excellent"
    const strengthColor = metCount <= 2 ? "#ef4444" : metCount <= 3 ? "#f59e0b" : metCount <= 4 ? "#10b981" : "#06b6d4"
    const passwordsMatch = formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (metCount < 3) {
            setError("Password is too weak. Meet at least 3 requirements.")
            return
        }

        setLoading(true)
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/register`, {
                username: formData.username.trim(),
                email: formData.email.trim(),
                password: formData.password,
            })
            setSignupSuccess(true)
            setTimeout(() => router.push("/auth/login"), 3000)
        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 bg-zinc-950">
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-lg relative z-10"
            >
                {/* ── Back arrow ── */}
                <motion.button
                    onClick={() => router.back()}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="group flex items-center gap-2 mb-5 px-1 cursor-pointer"
                >
                    <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.1] group-hover:border-purple-500/30 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                        <ArrowLeft className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 transition-colors duration-300 group-hover:-translate-x-0.5 transform" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 group-hover:text-zinc-400 transition-colors duration-300">Back</span>
                </motion.button>
                <Card className="bg-zinc-900/40 backdrop-blur-3xl border border-white/[0.08] shadow-[0_0_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] rounded-[2.5rem] overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.04] via-transparent to-rose-500/[0.03] pointer-events-none" />
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                    <CardHeader className="space-y-5 px-8 pt-10 pb-4 relative text-center">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.25 }}
                            className="relative mx-auto"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-rose-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(139,92,246,0.3)] relative">
                                <AnimatePresence mode="wait">
                                    {signupSuccess ? (
                                        <motion.div key="success" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}>
                                            <PartyPopper className="text-white w-8 h-8 drop-shadow-lg" />
                                        </motion.div>
                                    ) : (
                                        <motion.div key="user" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                            <UserIcon className="text-white w-8 h-8 drop-shadow-lg" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <motion.div
                                    animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 2.5, repeat: Infinity }}
                                    className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.8)]"
                                    style={{ background: "linear-gradient(135deg, #f43f5e, #f59e0b)" }}
                                />
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                                    className="absolute -inset-2 rounded-2xl border border-dashed border-rose-500/20"
                                />
                            </div>
                        </motion.div>

                        <div className="space-y-2">
                            <CardTitle className="text-3xl font-black tracking-tighter italic uppercase">
                                <AnimatePresence mode="wait">
                                    {signupSuccess ? (
                                        <motion.span key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                            WELCOME ABOARD! 🎉
                                        </motion.span>
                                    ) : (
                                        <motion.span key="title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gradient-to-r from-purple-300 via-rose-300 to-amber-300 bg-clip-text text-transparent">
                                            INITIALIZE PROFILE
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </CardTitle>
                            <CardDescription className="text-zinc-500 font-medium tracking-wide text-sm">
                                {signupSuccess ? "Check your email for a welcome message!" : "Join the elite circle of prepared candidates"}
                            </CardDescription>
                        </div>
                    </CardHeader>

                    {signupSuccess ? (
                        <CardContent className="px-8 pb-10">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center space-y-4"
                            >
                                <div className="bg-emerald-500/[0.08] backdrop-blur-lg p-6 rounded-xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                                    <p className="text-emerald-400 text-sm font-bold">Account created successfully!</p>
                                    <p className="text-zinc-500 text-xs mt-2">A welcome email has been sent to <strong className="text-white">{formData.email}</strong></p>
                                    <p className="text-zinc-600 text-xs mt-3">Redirecting to login...</p>
                                </div>
                                <Link href="/auth/login" className="inline-block text-primary hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                                    Login Now →
                                </Link>
                            </motion.div>
                        </CardContent>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-5 px-8">
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, y: -10 }}
                                            animate={{ opacity: 1, height: "auto", y: 0 }}
                                            exit={{ opacity: 0, height: 0, y: -10 }}
                                            className="text-red-400 text-xs font-black uppercase tracking-widest text-center bg-red-500/[0.08] backdrop-blur-lg p-3.5 rounded-xl border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)] mb-5"
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                                {error}
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="grid grid-cols-2 gap-4">
                                    <Button type="button" variant="outline" className="h-12 rounded-2xl bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.1] hover:border-purple-500/40 text-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.02)] hover:shadow-[0_0_25px_rgba(139,92,246,0.1)]" onClick={() => alert('Google integration pending backend setup!')}>
                                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                        </svg>
                                        Google
                                    </Button>
                                    <Button type="button" variant="outline" className="h-12 rounded-2xl bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.1] hover:border-cyan-500/40 text-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.02)] hover:shadow-[0_0_25px_rgba(6,182,212,0.1)]" onClick={() => alert('Apple integration pending backend setup!')}>
                                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.86 3.77-.74 1.25.07 2.45.61 3.25 1.5-2.73 1.64-2.25 5.56.5 6.63-1.02 2.62-1.95 3.97-2.6 4.78zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                                        </svg>
                                        Apple
                                    </Button>
                                </div>

                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/[0.06]"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-3 bg-zinc-900/40 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Or continue with alias</span>
                                    </div>
                                </div>


                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Username */}
                                    <div className="space-y-2">
                                        <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1 flex items-center gap-1.5">
                                            <Fingerprint className="w-3 h-3 text-purple-400/60" />
                                            Operative Alias
                                        </Label>
                                        <div className="relative group">
                                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'username' ? 'text-purple-400' : 'text-zinc-600'}`}>
                                                <UserIcon className="w-4 h-4" />
                                            </div>
                                            <Input id="username" name="username" placeholder="johndoe" required value={formData.username} onChange={handleChange}
                                                onFocus={() => setFocusedField('username')} onBlur={() => setFocusedField(null)}
                                                className="h-14 pl-12 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-zinc-700 focus:bg-white/[0.06] focus:border-purple-500/40 focus:shadow-[0_0_25px_rgba(139,92,246,0.1)] transition-all duration-300 rounded-2xl"
                                            />
                                            <motion.div animate={{ scaleX: focusedField === 'username' ? 1 : 0 }} className="absolute bottom-0 left-4 right-4 h-px origin-left"
                                                style={{ background: "linear-gradient(90deg, #7c3aed, #ec4899)" }} />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1 flex items-center gap-1.5">
                                            <Zap className="w-3 h-3 text-amber-400/60" />
                                            Comms Channel
                                        </Label>
                                        <div className="relative group">
                                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'email' ? 'text-amber-400' : 'text-zinc-600'}`}>
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <Input id="email" name="email" type="email" placeholder="m@example.com" required value={formData.email} onChange={handleChange}
                                                onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                                                className="h-14 pl-12 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-zinc-700 focus:bg-white/[0.06] focus:border-amber-500/40 focus:shadow-[0_0_25px_rgba(245,158,11,0.1)] transition-all duration-300 rounded-2xl"
                                            />
                                            <motion.div animate={{ scaleX: focusedField === 'email' ? 1 : 0 }} className="absolute bottom-0 left-4 right-4 h-px origin-left"
                                                style={{ background: "linear-gradient(90deg, #f59e0b, #f43f5e)" }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1 flex items-center gap-1.5">
                                        <ShieldCheck className="w-3 h-3 text-cyan-400/60" />
                                        Secure Key
                                    </Label>
                                    <div className="relative group">
                                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'password' ? 'text-cyan-400' : 'text-zinc-600'}`}>
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <Input id="password" name="password" type={showPassword ? "text" : "password"} required value={formData.password} onChange={handleChange}
                                            onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                                            placeholder="Min. 8 characters"
                                            className="h-14 pl-12 pr-12 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-zinc-700 focus:bg-white/[0.06] focus:border-cyan-500/40 focus:shadow-[0_0_25px_rgba(6,182,212,0.1)] transition-all duration-300 rounded-2xl"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-cyan-400 transition-all duration-300 hover:scale-110">
                                            <AnimatePresence mode="wait">
                                                {showPassword ? (
                                                    <motion.div key="off" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ duration: 0.2 }}>
                                                        <EyeOff className="w-4 h-4" />
                                                    </motion.div>
                                                ) : (
                                                    <motion.div key="on" initial={{ scale: 0, rotate: 90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ duration: 0.2 }}>
                                                        <Eye className="w-4 h-4" />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </button>
                                        <motion.div animate={{ scaleX: focusedField === 'password' ? 1 : 0 }} className="absolute bottom-0 left-4 right-4 h-px origin-left"
                                            style={{ background: "linear-gradient(90deg, #06b6d4, #7c3aed, #f43f5e)" }} />
                                    </div>

                                    {/* ── Animated strength bar + requirements ── */}
                                    <AnimatePresence>
                                        {pw.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="space-y-3 pt-2"
                                            >
                                                {/* Strength bar */}
                                                <div className="space-y-1.5">
                                                    <div className="h-1.5 rounded-full bg-zinc-800/50 overflow-hidden relative">
                                                        <motion.div
                                                            animate={{ width: `${strengthPercent}%` }}
                                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                                            className="h-full rounded-full relative"
                                                            style={{
                                                                background: `linear-gradient(90deg, ${strengthColor}, ${strengthColor}aa)`,
                                                                boxShadow: `0 0 12px ${strengthColor}40`,
                                                            }}
                                                        >
                                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                                                        </motion.div>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: strengthColor }}>
                                                            {strengthLabel}
                                                        </span>
                                                        <span className="text-[9px] text-zinc-600">{metCount}/{requirements.length}</span>
                                                    </div>
                                                </div>

                                                {/* Requirements checklist */}
                                                <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04] grid grid-cols-2 gap-1.5">
                                                    {requirements.map((req, i) => (
                                                        <RequirementItem key={i} met={req.met} label={req.label} />
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1 flex items-center gap-1.5">
                                        <ShieldCheck className="w-3 h-3 text-rose-400/60" />
                                        Verify Key
                                    </Label>
                                    <div className="relative group">
                                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'confirm' ? 'text-rose-400' : 'text-zinc-600'}`}>
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} required value={formData.confirmPassword} onChange={handleChange}
                                            onFocus={() => setFocusedField('confirm')} onBlur={() => setFocusedField(null)}
                                            placeholder="Re-enter password"
                                            className="h-14 pl-12 pr-12 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-zinc-700 focus:bg-white/[0.06] focus:border-rose-500/40 focus:shadow-[0_0_25px_rgba(244,63,94,0.1)] transition-all duration-300 rounded-2xl"
                                        />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-rose-400 transition-all duration-300 hover:scale-110">
                                            <AnimatePresence mode="wait">
                                                {showConfirmPassword ? (
                                                    <motion.div key="off" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.2 }}>
                                                        <EyeOff className="w-4 h-4" />
                                                    </motion.div>
                                                ) : (
                                                    <motion.div key="on" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.2 }}>
                                                        <Eye className="w-4 h-4" />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </button>
                                        <motion.div animate={{ scaleX: focusedField === 'confirm' ? 1 : 0 }} className="absolute bottom-0 left-4 right-4 h-px origin-left"
                                            style={{ background: "linear-gradient(90deg, #f43f5e, #7c3aed)" }} />
                                    </div>
                                    {/* Match indicator */}
                                    <AnimatePresence>
                                        {formData.confirmPassword.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0 }}
                                                className={`flex items-center gap-1.5 ml-1 ${passwordsMatch ? 'text-emerald-400' : 'text-red-400'}`}
                                            >
                                                {passwordsMatch ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                                                <span className="text-[10px] font-bold">{passwordsMatch ? '✓ Passwords match' : 'Passwords do not match'}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </CardContent>

                            <CardFooter className="flex flex-col space-y-6 px-8 pb-10 pt-6">
                                <Button
                                    className="w-full h-14 font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] group relative overflow-hidden transition-all duration-500 hover:-translate-y-0.5 border-0"
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        background: "linear-gradient(135deg, #7c3aed, #f43f5e, #f59e0b)",
                                        boxShadow: "0 10px 40px rgba(139,92,246,0.25), 0 0 60px rgba(244,63,94,0.1)",
                                    }}
                                >
                                    <motion.div
                                        animate={{ x: ["-100%", "200%"] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent w-1/2"
                                    />
                                    <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                                        {loading ? (
                                            <>
                                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                                    <Zap className="w-4 h-4" />
                                                </motion.div>
                                                Initializing...
                                            </>
                                        ) : (
                                            <>
                                                Register Operative
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                                            </>
                                        )}
                                    </span>
                                </Button>

                                <div className="text-[11px] font-bold text-center text-zinc-500 tracking-wider">
                                    Already identified?{" "}
                                    <Link href="/auth/login" className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-cyan-300 transition-all uppercase tracking-[0.1em] font-black">
                                        Return to Command
                                    </Link>
                                </div>
                            </CardFooter>
                        </form>
                    )}
                </Card>

                {/* ── Bottom feature badges ── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-8 flex justify-center gap-6"
                >
                    {[
                        { icon: ShieldCheck, label: "Quantum Security", color: "text-purple-400/50" },
                        { icon: Sparkles, label: "AI Enhanced", color: "text-rose-400/50" },
                        { icon: Wifi, label: "Live Sync", color: "text-cyan-400/50" },
                    ].map(({ icon: Icon, label, color }, i) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2 + i * 0.15 }}
                            className="flex items-center gap-1.5 text-zinc-600"
                        >
                            <Icon className={`w-3 h-3 ${color}`} />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    )
}
