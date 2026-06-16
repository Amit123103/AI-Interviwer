"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react"
import Logo from "@/components/ui/Logo"
import axios from "axios"

export default function LoginPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({ identifier: "", password: "" })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [loginSuccess, setLoginSuccess] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            const payload = {
                ...formData,
                identifier: formData.identifier.trim()
            }
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/login`, payload)
            localStorage.setItem("user", JSON.stringify(data))
            setLoginSuccess(true)
            setTimeout(() => router.push("/dashboard"), 1500)
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid credentials")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-zinc-50 relative overflow-hidden">
            {/* Subtle light background decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to home
                </Link>

                <Card className="bg-white border-zinc-200 shadow-xl shadow-zinc-200/50 rounded-2xl overflow-hidden">
                    <CardHeader className="space-y-4 px-8 pt-10 pb-6 text-center">
                        <div className="mx-auto flex justify-center mb-2">
                            <Logo size={40} />
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold text-zinc-900 tracking-tight">
                                Welcome back
                            </CardTitle>
                            <CardDescription className="text-zinc-500">
                                Sign in to your account to continue
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4 px-8">
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, y: -10 }}
                                        animate={{ opacity: 1, height: "auto", y: 0 }}
                                        exit={{ opacity: 0, height: 0, y: -10 }}
                                        className="text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-2">
                                <Label htmlFor="identifier" className="text-sm font-medium text-zinc-700">
                                    Email or Username
                                </Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <Input
                                        id="identifier"
                                        name="identifier"
                                        type="text"
                                        placeholder="m@example.com"
                                        required
                                        value={formData.identifier}
                                        onChange={handleChange}
                                        className="h-12 pl-10 bg-white border-zinc-200 text-zinc-900 focus-visible:ring-indigo-500 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-medium text-zinc-700">
                                        Password
                                    </Label>
                                    <Link
                                        href="/auth/forgot-password"
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="h-12 pl-10 pr-10 bg-white border-zinc-200 text-zinc-900 focus-visible:ring-indigo-500 rounded-xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-6 px-8 pb-10 pt-4">
                            <Button
                                className="w-full h-12 font-medium rounded-xl text-base text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all flex items-center justify-center gap-2"
                                type="submit"
                                disabled={loading || loginSuccess}
                            >
                                {loginSuccess ? (
                                    "Redirecting..."
                                ) : loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </Button>

                            <div className="text-sm text-center text-zinc-500">
                                Don&apos;t have an account?{" "}
                                <Link
                                    href="/auth/signup"
                                    className="font-semibold text-indigo-600 hover:text-indigo-500"
                                >
                                    Sign up
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
