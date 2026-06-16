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
                                        className="text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2 mb-4"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="grid grid-cols-2 gap-4">
                                <Button type="button" variant="outline" className="h-12 rounded-xl border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-sm" onClick={() => alert('Google integration pending backend setup!')}>
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                    </svg>
                                    Google
                                </Button>
                                <Button type="button" variant="outline" className="h-12 rounded-xl border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-sm" onClick={() => alert('Apple integration pending backend setup!')}>
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.86 3.77-.74 1.25.07 2.45.61 3.25 1.5-2.73 1.64-2.25 5.56.5 6.63-1.02 2.62-1.95 3.97-2.6 4.78zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                                    </svg>
                                    Apple
                                </Button>
                            </div>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-zinc-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-zinc-500">Or continue with email</span>
                                </div>
                            </div>

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
