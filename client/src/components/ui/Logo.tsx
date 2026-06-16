"use client";

import React from "react";
import { motion } from "framer-motion";

interface LogoProps {
    size?: number;        // px for the icon height
    showText?: boolean;   // show the brand name on the side
    showStatus?: boolean; // show green online dot
    className?: string;
    animate?: boolean;    // enable advanced hover/floating animations
}

export default function Logo({
    size = 36,
    showText = true,      // default to true for modern branding
    showStatus = false,
    className = "",
    animate = true,
}: LogoProps) {
    return (
        <div className={`relative inline-flex items-center gap-3 ${className}`}>
            <div className="relative flex items-center justify-center">
                {animate && (
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.4, 0.7, 0.4],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-xl rounded-full"
                        style={{ width: size, height: size }}
                    />
                )}

                <motion.img
                    animate={animate ? {
                        y: [-2, 2, -2],
                    } : {}}
                    whileHover={animate ? {
                        scale: 1.05,
                        rotate: [0, -2, 2, 0],
                        filter: "drop-shadow(0px 0px 25px rgba(139,92,246,0.6))"
                    } : {}}
                    transition={{
                        y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: 0.5 },
                        scale: { duration: 0.2 }
                    }}
                    src="/assets/main-logo.png"
                    alt="Intervyxa AI Logo"
                    className="relative z-10 object-contain rounded-2xl drop-shadow-[0_0_15px_rgba(59,130,246,0.4)] cursor-pointer border border-white/5 shadow-2xl"
                    style={{
                        width: size,
                        height: size,
                    }}
                />

                {/* Online status dot */}
                {showStatus && (
                    <div
                        className="absolute rounded-full ring-2 ring-zinc-950 z-20"
                        style={{
                            width: size * 0.22,
                            height: size * 0.22,
                            bottom: -size * 0.05,
                            right: -size * 0.05,
                            background: "linear-gradient(135deg, #10b981, #34d399)",
                            boxShadow: "0 0 8px rgba(16, 185, 129, 0.5)",
                        }}
                    />
                )}
            </div>

            {showText && (
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex flex-col leading-none"
                >
                    <span className="text-xl font-black tracking-tight bg-gradient-to-r from-zinc-900 via-indigo-600 to-zinc-900 dark:from-white dark:via-indigo-400 dark:to-zinc-300 bg-clip-text text-transparent uppercase italic drop-shadow-md">
                        Intervyxa
                    </span>
                    <span className="text-[9px] font-black tracking-[0.3em] bg-gradient-to-r from-indigo-400 via-slate-400 to-indigo-500 bg-clip-text text-transparent uppercase mt-1 ml-0.5">
                        AI
                    </span>
                </motion.div>
            )}
        </div>
    );
}
