"use client"

import React, { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, ArrowRight, Sparkles, Shield, ShieldCheck, Eye, EyeOff, CheckCircle2, AlertTriangle, Circle, Wifi, KeyRound } from "lucide-react"
import MeshBackground from "../../dashboard/components/MeshBackground"
import axios from "axios"

/* ── Particle ── */
function FloatingParticle({ delay, size, color, x, y, duration = 4 }: { delay: number; size: number; color: string; x: string; y: string, duration?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 0] }}
            transition={{ delay, duration, repeat: Infinity, ease: "easeInOut" }}
            className="absolute pointer-events-none" style={{ left: x, top: y }}
        >
            <div className="rounded-full blur-[1px]" style={{ width: size, height: size, background: color }} />
        </motion.div>
    )
}

/* ── Gradient ring ── */
function GradientRing() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2.5rem]">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-[1px] rounded-[2.5rem]"
                style={{
                    background: "conic-gradient(from 0deg, transparent 0%, #10b981 10%, transparent 20%, #06b6d4 30%, transparent 40%, #7c3aed 50%, transparent 60%, #ec4899 70%, transparent 80%, #f59e0b 90%, transparent 100%)",
                    opacity: 0.12,
                }}
            />
        </div>
    )
}

/* ── Requirement item ── */
function RequirementItem({ met, label }: { met: boolean; label: string }) {
    return (
        <motion.div layout className="flex items-center gap-2">
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

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [focusedField, setFocusedField] = useState<string | null>(null)
    const [redirectCountdown, setRedirectCountdown] = useState(0)

    // Password analysis
    const requirements = [
        { met: password.length >= 8, label: "At least 8 characters" },
        { met: /[A-Z]/.test(password), label: "One uppercase letter" },
        { met: /[a-z]/.test(password), label: "One lowercase letter" },
        { met: /[0-9]/.test(password), label: "One number" },
        { met: /[^A-Za-z0-9]/.test(password), label: "One special character" },
    ]
    const metCount = requirements.filter(r => r.met).length
    const strengthPercent = (metCount / requirements.length) * 100
    const strengthLabel = metCount <= 2 ? "Weak" : metCount <= 3 ? "Medium" : metCount <= 4 ? "Strong" : "Excellent"
    const strengthColor = metCount <= 2 ? "#ef4444" : metCount <= 3 ? "#f59e0b" : metCount <= 4 ? "#10b981" : "#06b6d4"
    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword

    // Redirect countdown
    useEffect(() => {
        if (redirectCountdown <= 0) {
            if (success) {
                router.push("/auth/login")
            }
            return
        }
        const t = setTimeout(() => {
            setRedirectCountdown(c => c - 1)
        }, 1000)
        return () => clearTimeout(t)
    }, [redirectCountdown, success, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }
        if (metCount < 3) {
            setError("Password is too weak. Meet at least 3 requirements.")
            return
        }

        setLoading(true)
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/reset-password`, {
                token, password, confirmPassword,
            })
            setSuccess(true)
            setRedirectCountdown(5)
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || "Something went wrong. Please try again.")
            } else {
                setError("Something went wrong. Please try again.")
            }
        } finally {
            setLoading(false)
        }
    }

    // Invalid / missing token
    if (!token) {
        return (
            <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#030305]">
                <MeshBackground variant="auth" />
                <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-red-500/[0.05] rounded-full blur-[150px]" />
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <Card className="bg-white/[0.03] backdrop-blur-3xl border border-red-500/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] rounded-[2.5rem] max-w-md w-full p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.03] to-transparent pointer-events-none" />
                        <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                            <AlertTriangle className="w-14 h-14 text-red-400 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]" />
                        </motion.div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Invalid Link</h2>
                        <p className="text-zinc-500 text-sm mb-6">This reset link is invalid or has expired.</p>
                        <Link href="/auth/forgot-password">
                            <Button className="font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] px-8 h-12 border-0"
                                style={{ background: "linear-gradient(135deg, #ef4444, #f97316)", boxShadow: "0 10px 30px rgba(239,68,68,0.2)" }}>
                                Request New Link
                            </Button>
                        </Link>
                    </Card>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#030305]">
            <MeshBackground variant="auth" />

            {/* ── Ambient blobs ── */}
            <div className="absolute top-[8%] left-[8%] w-[450px] h-[450px] bg-emerald-500/[0.06] rounded-full blur-[150px] animate-pulse" />
            <div className="absolute bottom-[8%] right-[8%] w-[400px] h-[400px] bg-cyan-500/[0.05] rounded-full blur-[130px]" />
            <div className="absolute top-[50%] right-[20%] w-[300px] h-[300px] bg-purple-500/[0.04] rounded-full blur-[120px]" />

            {/* ── Particles ── */}
            <FloatingParticle delay={0} size={4} color="#10b981" x="12%" y="22%" />
            <FloatingParticle delay={1.4} size={3} color="#06b6d4" x="83%" y="16%" />
            <FloatingParticle delay={0.7} size={5} color="#7c3aed" x="70%" y="72%" />
            <FloatingParticle delay={2.0} size={3} color="#ec4899" x="18%" y="80%" />
            <FloatingParticle delay={1.2} size={4} color="#f59e0b" x="88%" y="45%" />

            {/* ── Grid overlay ── */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: "linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }} />

            {/* ── Side accent ── */}
            <motion.div
                initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 2, delay: 0.3 }}
                className="absolute right-[5%] top-[12%] w-px h-[76%] origin-top hidden lg:block"
                style={{ background: "linear-gradient(to bottom, transparent, rgba(16,185,129,0.3), rgba(6,182,212,0.2), transparent)" }}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md relative z-10"
            >
                <Card className="bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] shadow-[0_0_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] rounded-[2.5rem] overflow-hidden relative">
                    <GradientRing />
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.04] via-transparent to-cyan-500/[0.03] pointer-events-none" />
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                    <CardHeader className="space-y-5 px-8 pt-10 pb-4 relative text-center">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.25 }}
                            className="relative mx-auto"
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto relative`}
                                style={{
                                    background: success ? "linear-gradient(135deg, #10b981, #06b6d4)" : "linear-gradient(135deg, #10b981, #7c3aed, #06b6d4)",
                                    boxShadow: `0 0 50px ${success ? 'rgba(16,185,129,0.4)' : 'rgba(16,185,129,0.3)'}`,
                                }}>
                                <AnimatePresence mode="wait">
                                    {success ? (
                                        <motion.div key="success" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}>
                                            <CheckCircle2 className="text-white w-8 h-8 drop-shadow-lg" />
                                        </motion.div>
                                    ) : (
                                        <motion.div key="shield" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                            <KeyRound className="text-white w-8 h-8 drop-shadow-lg" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <motion.div
                                    animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 2.5, repeat: Infinity }}
                                    className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full"
                                    style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)", boxShadow: "0 0 12px rgba(16,185,129,0.8)" }}
                                />
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                                    className="absolute -inset-2 rounded-2xl border border-dashed border-emerald-500/20"
                                />
                            </div>
                        </motion.div>

                        <div className="space-y-2">
                            <CardTitle className="text-3xl font-black tracking-tighter italic uppercase">
                                <AnimatePresence mode="wait">
                                    {success ? (
                                        <motion.span key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                            ACCESS RESTORED ✨
                                        </motion.span>
                                    ) : (
                                        <motion.span key="title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent">
                                            NEW CREDENTIALS
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </CardTitle>
                            <CardDescription className="text-zinc-500 font-medium tracking-wide text-sm">
                                {success ? `Redirecting in ${redirectCountdown}s...` : "Set your new secure password"}
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div key="success-panel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <CardContent className="px-8 pb-8 space-y-4">
                                    <div className="bg-emerald-500/[0.08] backdrop-blur-lg p-6 rounded-xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                                        <p className="text-emerald-400 text-sm font-bold text-center">Password updated successfully!</p>
                                        <p className="text-zinc-600 text-xs mt-2 text-center">You can now log in with your new password.</p>
                                    </div>
                                    {/* Redirect countdown bar */}
                                    <div className="h-1.5 rounded-full bg-zinc-800/50 overflow-hidden">
                                        <motion.div
                                            initial={{ width: "100%" }}
                                            animate={{ width: "0%" }}
                                            transition={{ duration: 5, ease: "linear" }}
                                            className="h-full rounded-full"
                                            style={{ background: "linear-gradient(90deg, #10b981, #06b6d4)", boxShadow: "0 0 12px rgba(16,185,129,0.4)" }}
                                        />
                                    </div>
                                    <div className="flex justify-center">
                                        <Link href="/auth/login" className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent hover:from-emerald-300 hover:to-cyan-300 transition-all">
                                            Login Now →
                                        </Link>
                                    </div>
                                </CardContent>
                            </motion.div>
                        ) : (
                            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <form onSubmit={handleSubmit}>
                                    <CardContent className="space-y-5 px-8">
                                        <AnimatePresence>
                                            {error && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="text-red-400 text-xs font-black uppercase tracking-widest text-center bg-red-500/[0.08] backdrop-blur-lg p-3.5 rounded-xl border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                                                >
                                                    <span className="flex items-center justify-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                                        {error}
                                                    </span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* New Password */}
                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1 flex items-center gap-1.5">
                                                <ShieldCheck className="w-3 h-3 text-emerald-400/60" />
                                                New Password
                                            </Label>
                                            <div className="relative group">
                                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'password' ? 'text-emerald-400' : 'text-zinc-600'}`}>
                                                    <Lock className="w-4 h-4" />
                                                </div>
                                                <Input
                                                    id="password" type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" required
                                                    value={password} onChange={e => setPassword(e.target.value)}
                                                    onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                                                    className="h-14 pl-12 pr-12 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-zinc-700 focus:bg-white/[0.06] focus:border-emerald-500/40 focus:shadow-[0_0_25px_rgba(16,185,129,0.1)] transition-all duration-300 rounded-2xl"
                                                />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-emerald-400 transition-all duration-300 hover:scale-110">
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
                                                    style={{ background: "linear-gradient(90deg, #10b981, #06b6d4, #7c3aed)" }} />
                                            </div>

                                            {/* Strength bar + requirements */}
                                            <AnimatePresence>
                                                {password.length > 0 && (
                                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 pt-2">
                                                        <div className="space-y-1.5">
                                                            <div className="h-1.5 rounded-full bg-zinc-800/50 overflow-hidden">
                                                                <motion.div
                                                                    animate={{ width: `${strengthPercent}%` }}
                                                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                                                    className="h-full rounded-full relative"
                                                                    style={{ background: `linear-gradient(90deg, ${strengthColor}, ${strengthColor}aa)`, boxShadow: `0 0 12px ${strengthColor}40` }}
                                                                >
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                                                                </motion.div>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: strengthColor }}>{strengthLabel}</span>
                                                                <span className="text-[9px] text-zinc-600">{metCount}/{requirements.length}</span>
                                                            </div>
                                                        </div>
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
                                                <ShieldCheck className="w-3 h-3 text-cyan-400/60" />
                                                Confirm Password
                                            </Label>
                                            <div className="relative group">
                                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'confirm' ? 'text-cyan-400' : 'text-zinc-600'}`}>
                                                    <Lock className="w-4 h-4" />
                                                </div>
                                                <Input
                                                    id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Re-enter password" required
                                                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                                    onFocus={() => setFocusedField('confirm')} onBlur={() => setFocusedField(null)}
                                                    className="h-14 pl-12 pr-12 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-zinc-700 focus:bg-white/[0.06] focus:border-cyan-500/40 focus:shadow-[0_0_25px_rgba(6,182,212,0.1)] transition-all duration-300 rounded-2xl"
                                                />
                                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-cyan-400 transition-all duration-300 hover:scale-110">
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
                                                    style={{ background: "linear-gradient(90deg, #06b6d4, #7c3aed)" }} />
                                            </div>
                                            <AnimatePresence>
                                                {confirmPassword.length > 0 && (
                                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                                                        className={`flex items-center gap-1.5 ml-1 ${passwordsMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {passwordsMatch ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                                                        <span className="text-[10px] font-bold">{passwordsMatch ? '✓ Passwords match' : 'Passwords do not match'}</span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="flex flex-col space-y-6 px-8 pb-10 pt-4">
                                        <Button
                                            className="w-full h-14 font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] group relative overflow-hidden transition-all duration-500 hover:-translate-y-0.5 border-0"
                                            type="submit" disabled={loading}
                                            style={{
                                                background: "linear-gradient(135deg, #10b981, #06b6d4, #7c3aed)",
                                                boxShadow: "0 10px 40px rgba(16,185,129,0.25), 0 0 60px rgba(6,182,212,0.1)",
                                            }}
                                        >
                                            <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent w-1/2" />
                                            <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                                                {loading ? (
                                                    <>
                                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                                            <ShieldCheck className="w-4 h-4" />
                                                        </motion.div>
                                                        Updating...
                                                    </>
                                                ) : (
                                                    <>
                                                        Reset Password
                                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                                                    </>
                                                )}
                                            </span>
                                        </Button>

                                        <div className="text-[11px] font-bold text-center text-zinc-500 tracking-wider">
                                            <Link href="/auth/login" className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent hover:from-emerald-300 hover:to-cyan-300 transition-all uppercase tracking-[0.1em] font-black">
                                                Back to Login
                                            </Link>
                                        </div>
                                    </CardFooter>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>

                {/* ── Bottom badges ── */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-8 flex justify-center gap-6">
                    {[
                        { icon: Sparkles, label: "AI Secured", color: "text-emerald-400/50" },
                        { icon: Shield, label: "256-bit", color: "text-cyan-400/50" },
                        { icon: Wifi, label: "Instant Sync", color: "text-purple-400/50" },
                    ].map(({ icon: Icon, label, color }, i) => (
                        <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 + i * 0.15 }} className="flex items-center gap-1.5 text-zinc-600">
                            <Icon className={`w-3 h-3 ${color}`} />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#030305] flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <ShieldCheck className="w-8 h-8 text-emerald-400/50" />
                </motion.div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}
