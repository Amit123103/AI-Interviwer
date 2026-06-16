"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Logo from "@/components/ui/Logo"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Video, BarChart3, ShieldCheck, ArrowRight, Play, CheckCircle2, Zap, Brain, Sparkles, Trophy, Globe, Menu, X } from "lucide-react"
import SystemDemo from "@/components/landing/SystemDemo"
import NeuralArchitecture from "@/components/landing/NeuralArchitecture"
import SuccessWall from "@/components/landing/SuccessWall"
import HowItWorks from "@/components/landing/HowItWorks"
import Pricing from "@/components/landing/Pricing"

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const }
  })
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-white text-zinc-900 selection:bg-indigo-500/20 selection:text-indigo-900 overflow-x-hidden">
      {/* Soft ambient gradient */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-100/60 blur-[180px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-100/40 blur-[160px] rounded-full" />
      </div>

      {/* ── Navbar ──────────────────────────────────────── */}
      <header className="px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between border-b border-zinc-200 fixed w-full z-[100] bg-white/80 backdrop-blur-xl">
        <Link className="flex items-center gap-3" href="/">
          <Logo size={36} showText showStatus animate={false} />
        </Link>

        <nav className="hidden md:flex gap-1 items-center">
          {[
            { label: "Features", href: "#features" },
            { label: "How It Works", href: "#how-it-works" },
            { label: "Demo", href: "#demo" },
            { label: "Testimonials", href: "#testimonials" },
            { label: "Pricing", href: "#pricing" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              className="text-sm font-medium text-zinc-500 hover:text-zinc-900 px-4 py-2 rounded-lg hover:bg-zinc-100 transition-all"
              href={href}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors hidden sm:block px-4 py-2">
            Log in
          </Link>
          <Link href="/auth/signup">
            <Button className="bg-indigo-600 text-white hover:bg-indigo-500 h-10 px-6 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30">
              Get Started Free
            </Button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-600"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[99] bg-white/98 backdrop-blur-2xl pt-20 px-6 flex flex-col gap-4 md:hidden"
          >
            <nav className="flex flex-col gap-1">
              {["Features", "How It Works", "Demo", "Testimonials", "Pricing"].map((label) => (
                <Link
                  key={label}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium text-zinc-600 hover:text-zinc-900 py-3 border-b border-zinc-100 transition-colors"
                  href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-3 pt-4">
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full h-12 rounded-xl border-zinc-200 text-zinc-700 font-medium">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full h-12 rounded-xl bg-indigo-600 text-white font-medium">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 relative z-10">
        {/* ── Hero ──────────────────────────────────────── */}
        <section className="w-full min-h-screen flex items-center justify-center pt-20 sm:pt-24 pb-10 sm:pb-16 relative">
          <div className="container px-4 sm:px-6 mx-auto">
            <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">


              <motion.h1
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={1}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-zinc-900"
              >
                Ace your next interview{" "}
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-500 bg-clip-text text-transparent">
                  with confidence
                </span>
              </motion.h1>

              <motion.p
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={2}
                className="text-lg sm:text-xl text-zinc-500 max-w-2xl leading-relaxed"
              >
                Practice with a realistic AI interviewer that gives you real-time feedback on your answers, body language, and communication skills.
              </motion.p>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={3}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Link href="/auth/signup">
                  <Button size="lg" className="w-full sm:w-auto h-13 px-8 text-base font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all group">
                    Start Practicing Free
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-13 px-8 text-base font-semibold rounded-xl border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 transition-all">
                    <Play className="mr-2 w-4 h-4" /> Watch Demo
                  </Button>
                </Link>
              </motion.div>


            </div>
          </div>
        </section>



        <SystemDemo />
        <HowItWorks />
        <NeuralArchitecture />
        <SuccessWall />
        <Pricing />





        {/* ── CTA ──────────────────────────────── */}
        <section className="w-full py-24 sm:py-32 relative px-4 sm:px-6 bg-zinc-900">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/[0.06] blur-[200px] rounded-full pointer-events-none" />

          <div className="container mx-auto flex flex-col items-center text-center space-y-8 relative">
            <p className="text-sm font-medium text-indigo-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Start for free
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              Ready to ace your next interview?
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl">
              Transform your interview performance today. <span className="text-emerald-400 font-semibold">No credit card required.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto h-13 px-8 text-base font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 transition-all group">
                  Start Free Practice
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-13 px-8 text-base font-semibold rounded-xl border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white transition-all">
                  <Play className="mr-2 w-4 h-4" /> Watch Demo
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-4 pt-6">
              <div className="flex -space-x-2">
                {["bg-indigo-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"].map((c, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-zinc-900 flex items-center justify-center text-xs font-semibold text-white`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-sm">★</span>)}
                </div>
                <p className="text-xs text-zinc-500">4.9/5 from <span className="text-white">12,400+</span> reviews</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────── */}
      <footer className="border-t border-zinc-200 bg-zinc-50 relative z-10 px-4 sm:px-6 py-12 sm:py-16">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-12">
            <div className="col-span-2 md:col-span-1 space-y-4">
              <Link className="flex items-center gap-3" href="/">
                <Logo size={32} showText showStatus animate={false} />
              </Link>
              <p className="text-sm text-zinc-500 leading-relaxed">
                The smart way to prepare for technical interviews. Powered by advanced AI.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-zinc-700">Product</h4>
              <div className="flex flex-col gap-2.5">
                {["AI Interviewer", "System Design", "Code Challenges", "Resume Analysis"].map(item => (
                  <Link key={item} href="#" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">{item}</Link>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-zinc-700">Resources</h4>
              <div className="flex flex-col gap-2.5">
                {["Documentation", "Question Bank", "Study Roadmap", "Community Forum"].map(item => (
                  <Link key={item} href="#" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">{item}</Link>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-zinc-700">Company</h4>
              <div className="flex flex-col gap-2.5">
                {["About Us", "Careers", "Privacy Policy", "Terms of Service"].map(item => (
                  <Link key={item} href="#" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">{item}</Link>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-400">
              © 2026 Intervyxa. Built with <span className="text-rose-500">♥</span> for engineers worldwide.
            </p>
            <div className="flex items-center gap-6">
              {["GitHub", "Twitter", "Discord", "LinkedIn"].map(s => (
                <Link key={s} href="#" className="text-sm text-zinc-400 hover:text-zinc-900 transition-colors">{s}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
  const colorMap: Record<string, string> = {
    indigo: "group-hover:text-indigo-600 group-hover:bg-indigo-50 group-hover:border-indigo-200",
    blue: "group-hover:text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-200",
    violet: "group-hover:text-violet-600 group-hover:bg-violet-50 group-hover:border-violet-200",
    teal: "group-hover:text-teal-600 group-hover:bg-teal-50 group-hover:border-teal-200",
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group p-8 bg-white border border-zinc-200 hover:border-zinc-300 rounded-2xl transition-all duration-300 space-y-4 hover:shadow-lg"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-50 border border-zinc-200 text-zinc-400 transition-all duration-300 ${colorMap[color]}`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
      <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  )
}

function CheckItem({ text, icon, color, bgColor }: { text: string, icon?: React.ReactNode, color?: string, bgColor?: string }) {
  return (
    <div className="flex items-center gap-3 group">
      <div className={`${bgColor || 'bg-indigo-50'} p-2 rounded-lg transition-colors`}>
        {icon || <CheckCircle2 className={`w-5 h-5 ${color || 'text-indigo-600'}`} />}
      </div>
      <span className="text-zinc-500 text-sm group-hover:text-zinc-700 transition-colors">{text}</span>
    </div>
  )
}
