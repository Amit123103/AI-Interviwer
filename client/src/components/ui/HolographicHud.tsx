"use client"

import React, { useEffect } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

export default function HolographicHud() {
    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {/* Corner Brackets */}
            <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-primary/30" />
            <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-primary/30" />
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-primary/30" />
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-primary/30" />

            {/* Coordinate Trackers */}
            <div className="absolute top-10 left-24 flex flex-col">
                <span className="text-[6px] font-mono text-primary/40 uppercase tracking-widest">LAT: 42.3601</span>
                <span className="text-[6px] font-mono text-primary/40 uppercase tracking-widest">LON: -71.0589</span>
            </div>
            <div className="absolute bottom-10 right-24 flex flex-col items-end">
                <span className="text-[6px] font-mono text-primary/40 uppercase tracking-widest">SIGNAL: 98.4%</span>
                <span className="text-[6px] font-mono text-primary/40 uppercase tracking-widest">UPTIME: 00:42:15</span>
            </div>

            {/* Dynamic HUD Side Ticks */}
            <div className="absolute top-1/2 left-4 -translate-y-1/2 flex flex-col gap-1.5">
                {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={`tick_l_${i}`}
                        className="h-[1px] bg-primary/20"
                        style={{ width: i % 5 === 0 ? 12 : 6 }}
                        animate={{ opacity: [0.1, 0.4, 0.1], x: [0, 2, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.05 }}
                    />
                ))}
            </div>

            <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col items-end gap-1.5">
                {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={`tick_r_${i}`}
                        className="h-[1px] bg-primary/20"
                        style={{ width: i % 5 === 0 ? 12 : 6 }}
                        animate={{ opacity: [0.1, 0.4, 0.1], x: [0, -2, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.05 }}
                    />
                ))}
            </div>

            {/* Central Focal Crosshair Overlay (Very Subtle) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
                <div className="w-[80vw] h-px bg-primary" />
                <div className="h-[80vh] w-px bg-primary" />
                <div className="absolute w-32 h-32 border border-primary rounded-full" />
            </div>

            {/* High-Frequency Digital Scanning Line */}
            <motion.div
                className="absolute left-0 w-full h-[60px] bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none opacity-40"
                animate={{ top: ["-10%", "110%"] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
                className="absolute left-0 w-full h-[1px] bg-primary/20 pointer-events-none"
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />

            {/* Neural Static Overlay (Very subtle flickering) */}
            <motion.div
                className="absolute inset-0 bg-white shadow-inner opacity-[0.015]"
                animate={{ opacity: [0.01, 0.02, 0.01] }}
                transition={{ duration: 0.1, repeat: Infinity }}
            />

            {/* Static HUD Text Overlay */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                <div className="px-4 py-1 bg-black/40 border border-primary/20 backdrop-blur-md rounded-full flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)]" />
                    <span className="text-[8px] font-black text-primary uppercase tracking-[0.5em]">
                        Neural Uplink Protocol // Phase 01.05.
                    </span>
                </div>
            </div>
        </div>
    )
}
