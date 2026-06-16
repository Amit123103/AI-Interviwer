"use client"

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Smartphone as Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const cycleTheme = () => {
        if (theme === 'dark') setTheme('light');
        else if (theme === 'light') setTheme('neural');
        else setTheme('dark');
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            <button
                onClick={cycleTheme}
                className="w-14 h-14 rounded-full bg-white/90 dark:bg-zinc-950/90 neural:bg-emerald-950/90 backdrop-blur-xl border border-black/10 dark:border-white/10 neural:border-emerald-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] neural:shadow-[0_10px_40px_rgba(16,185,129,0.3)] flex items-center justify-center hover:scale-105 active:scale-95 hover:bg-slate-50 dark:hover:bg-zinc-800 neural:hover:bg-emerald-900 transition-all duration-300 group"
                title={`Switch Mode (Current: ${theme?.toUpperCase()})`}
            >
                <AnimatePresence mode="wait">
                    {theme === 'dark' && (
                        <motion.div key="dark" initial={{ opacity: 0, scale: 0.5, rotate: -45 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.5, rotate: 45 }} transition={{ duration: 0.2 }}>
                            <Moon className="w-6 h-6 text-sky-400 fill-sky-400/20 group-hover:scale-110 transition-transform" />
                        </motion.div>
                    )}
                    {theme === 'light' && (
                        <motion.div key="light" initial={{ opacity: 0, scale: 0.5, rotate: -45 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.5, rotate: 45 }} transition={{ duration: 0.2 }}>
                            <Sun className="w-6 h-6 text-amber-500 fill-amber-500/20 group-hover:scale-110 transition-transform" />
                        </motion.div>
                    )}
                    {theme === 'neural' && (
                        <motion.div key="neural" initial={{ opacity: 0, scale: 0.5, rotate: -45 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.5, rotate: 45 }} transition={{ duration: 0.2 }}>
                            <Phone className="w-6 h-6 text-emerald-400 fill-emerald-400/20 group-hover:scale-110 transition-transform" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10 blur-xl">
                    {theme === 'dark' && <div className="absolute inset-0 bg-sky-500/30" />}
                    {theme === 'light' && <div className="absolute inset-0 bg-amber-500/30" />}
                    {theme === 'neural' && <div className="absolute inset-0 bg-emerald-500/30" />}
                </div>
            </button>
        </div>
    );
}
