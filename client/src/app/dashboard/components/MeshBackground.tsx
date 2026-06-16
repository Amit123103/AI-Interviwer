"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"


/* ──────────────────────────────────
   Detect low-end devices
   ────────────────────────────────── */
function useIsSlowDevice() {
    const [isSlow, setIsSlow] = useState(false)
    useEffect(() => {
        const cores = navigator.hardwareConcurrency || 4
        // Treat ≤ 4 logical cores as "slow"
        if (cores <= 4) setIsSlow(true)
    }, [])
    return isSlow
}

/* ──────────────────────────────────
   Tiny canvas-based star-field
   GPU-accelerated with adaptive quality
   ────────────────────────────────── */
function Starfield({ reducedQuality }: { reducedQuality: boolean }) {
    const ref = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = ref.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        let animId: number
        let frameCount = 0
        let stars: { x: number; y: number; r: number; a: number; da: number }[] = []

        const STAR_COUNT = reducedQuality ? 40 : 120
        const FRAME_SKIP = reducedQuality ? 2 : 1 // render every Nth frame on slow devices

        const resize = () => {
            const dpr = reducedQuality ? 1 : Math.min(window.devicePixelRatio, 2)
            canvas.width = window.innerWidth * dpr
            canvas.height = window.innerHeight * dpr
            canvas.style.width = `${window.innerWidth}px`
            canvas.style.height = `${window.innerHeight}px`
            ctx.scale(dpr, dpr)

            stars = Array.from({ length: STAR_COUNT }, () => ({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                r: Math.random() * 1.2 + 0.3,
                a: Math.random(),
                da: (Math.random() - 0.5) * 0.008,
            }))
        }

        const draw = () => {
            frameCount++
            // Skip frames on slow devices
            if (frameCount % FRAME_SKIP !== 0) {
                animId = requestAnimationFrame(draw)
                return
            }

            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
            for (const s of stars) {
                s.a += s.da
                if (s.a > 1 || s.a < 0.1) s.da *= -1
                ctx.beginPath()
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(255,255,255,${s.a * 0.35})`
                ctx.fill()
            }
            animId = requestAnimationFrame(draw)
        }

        resize()
        draw()
        window.addEventListener("resize", resize)
        return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animId) }
    }, [reducedQuality])

    return <canvas ref={ref} className="absolute inset-0 pointer-events-none" style={{ transform: 'translateZ(0)' }} />
}

const palettes = {
    professional: {
        orb1: "bg-indigo-500/15",
        orb2: "bg-violet-600/12",
        orb3: "bg-blue-500/10",
        aurora1: "from-indigo-600/15 via-violet-500/10 to-transparent",
        aurora2: "from-blue-500/10 via-indigo-500/8 to-transparent",
        bg: "bg-slate-50 dark:bg-zinc-950",
    },
    technical: {
        orb1: "bg-emerald-500/15",
        orb2: "bg-teal-600/12",
        orb3: "bg-cyan-500/10",
        aurora1: "from-emerald-600/15 via-teal-500/10 to-transparent",
        aurora2: "from-cyan-500/10 via-emerald-500/8 to-transparent",
        bg: "bg-white dark:bg-[#020617] dark:bg-[#020617]",
    },
    creative: {
        orb1: "bg-rose-500/15",
        orb2: "bg-amber-600/12",
        orb3: "bg-fuchsia-500/10",
        aurora1: "from-rose-600/15 via-amber-500/10 to-transparent",
        aurora2: "from-fuchsia-500/10 via-rose-500/8 to-transparent",
        bg: "bg-white dark:bg-[#0c0a09]",
    },
    auth: {
        orb1: "bg-primary/15",
        orb2: "bg-rose-500/10",
        orb3: "bg-amber-500/8",
        aurora1: "from-primary/18 via-purple-500/12 to-transparent",
        aurora2: "from-rose-500/10 via-pink-500/8 to-transparent",
        bg: "bg-slate-50 dark:bg-zinc-950",
    }
}

interface MeshBackgroundProps {
    variant?: 'professional' | 'technical' | 'creative' | 'auth'
}

export default function MeshBackground({ variant = 'professional' }: MeshBackgroundProps) {
    const p = palettes[variant] || palettes.professional
    const isSlow = useIsSlowDevice()

    // On slow devices, reduce animation complexity
    const orbTransitionBase = isSlow ? 35 : 22

    return (
        <div
            className={`fixed inset-0 -z-50 overflow-hidden ${p.bg} pointer-events-none transition-colors duration-500`}
            style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
        >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(120,80,200,0.12),transparent)]" />
            <Starfield reducedQuality={isSlow} />

            {/* Aurora Ribbon 1 */}
            <motion.div
                className={`absolute -top-[30%] -left-[20%] w-[140%] h-[60%] bg-gradient-to-br ${p.aurora1} rounded-[50%] blur-[100px] will-change-transform`}
                animate={{
                    rotate: [0, 6, -3, 0],
                    scaleX: [1, 1.08, 0.96, 1],
                    y: [0, 30, -20, 0],
                }}
                transition={{ duration: orbTransitionBase + 3, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Aurora Ribbon 2 */}
            <motion.div
                className={`absolute -bottom-[25%] -right-[15%] w-[120%] h-[50%] bg-gradient-to-tl ${p.aurora2} rounded-[50%] blur-[120px] will-change-transform`}
                animate={{
                    rotate: [0, -5, 4, 0],
                    scaleY: [1, 1.06, 0.94, 1],
                    x: [0, -40, 20, 0],
                }}
                transition={{ duration: orbTransitionBase + 8, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Primary Orb */}
            <motion.div
                animate={{
                    x: [0, 120, -60, 0],
                    y: [0, -80, 40, 0],
                    scale: [1, 1.25, 0.9, 1],
                }}
                transition={{ duration: orbTransitionBase, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute top-[-8%] left-[-8%] w-[55%] h-[55%] ${p.orb1} rounded-full blur-[140px] will-change-transform`}
            />

            {/* Secondary Orb */}
            <motion.div
                animate={{
                    x: [0, -100, 60, 0],
                    y: [0, 120, -60, 0],
                    scale: [1, 1.15, 0.85, 1],
                }}
                transition={{ duration: orbTransitionBase + 6, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute bottom-[-8%] right-[-8%] w-[45%] h-[45%] ${p.orb2} rounded-full blur-[130px] will-change-transform`}
            />

            {/* Accent Orb */}
            <motion.div
                animate={{ opacity: [0.08, 0.25, 0.08], scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute top-[25%] right-[8%] w-[28%] h-[28%] ${p.orb3} rounded-full blur-[100px] will-change-transform`}
            />

            {/* Center glow pulse */}
            <motion.div
                animate={{ opacity: [0.04, 0.14, 0.04], scale: [0.85, 1.1, 0.85] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[40%] left-[35%] w-[30%] h-[30%] bg-primary/8 rounded-full blur-[160px] will-change-transform"
            />

            {/* Subtle grain texture */}
            <div
                className="absolute inset-0 opacity-[0.035]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundSize: "200px 200px",
                }}
            />

            {/* Grid overlay */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
                    `,
                    backgroundSize: '48px 48px',
                }}
            />

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_0%,rgba(255,255,255,0.7)_100%)] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_0%,rgba(9,9,11,0.7)_100%)] neural:bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_0%,rgba(2,44,34,0.7)_100%)] transition-colors duration-500" />
        </div>
    )
}
