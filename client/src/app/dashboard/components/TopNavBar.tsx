"use client"

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Zap, Sparkles, Map, Video, Trophy, Crosshair, Users,
    Calendar, FileText, Activity, Building2, Target,
    History, TrendingUp, Award, Play, ChevronLeft, ChevronRight
} from "lucide-react";

const navItems = [
    { label: "Quick Action", icon: <Zap className="w-4 h-4" />, href: "#quick-actions", color: "text-amber-600", bg: "bg-amber-50" },
    { label: "New Features", icon: <Sparkles className="w-4 h-4" />, href: "#new-features", color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Career Growth Hub", icon: <Map className="w-4 h-4" />, href: "/dashboard/roadmap", color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Video Presentation", icon: <Video className="w-4 h-4" />, href: "/dashboard/presentation", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Hackathons & Events", icon: <Calendar className="w-4 h-4" />, href: "/dashboard/hackathons-events", color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Participate Hackathon", icon: <Trophy className="w-4 h-4" />, href: "/dashboard/hackathon-participate", color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Connect & Practice Together", icon: <Users className="w-4 h-4" />, href: "/dashboard/quiz", color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Upcoming Session", icon: <Calendar className="w-4 h-4" />, href: "#upcoming", color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Interview Reports", icon: <FileText className="w-4 h-4" />, href: "#reports", color: "text-rose-600", bg: "bg-rose-50" },
    { label: "System Performance", icon: <Activity className="w-4 h-4" />, href: "#performance", color: "text-cyan-600", bg: "bg-cyan-50" },
    { label: "Hiring Networks", icon: <Building2 className="w-4 h-4" />, href: "#hiring", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Skill Readers", icon: <Target className="w-4 h-4" />, href: "#skills", color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Recent Activity", icon: <History className="w-4 h-4" />, href: "#activity", color: "text-zinc-600", bg: "bg-zinc-100" },
    { label: "Performance Growth", icon: <TrendingUp className="w-4 h-4" />, href: "#growth", color: "text-green-600", bg: "bg-green-50" },
    { label: "Achievements", icon: <Award className="w-4 h-4" />, href: "#achievements", color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Recent Session", icon: <Play className="w-4 h-4" />, href: "#recent", color: "text-purple-600", bg: "bg-purple-50" },
];

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/5" />;

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-sm flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-zinc-600 dark:text-zinc-400 group relative overflow-hidden"
            title={`Toggle ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
            <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                    <motion.div key="dark" initial={{ opacity: 0, scale: 0.5, rotate: -45 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.5, rotate: 45 }} transition={{ duration: 0.2 }}>
                        <Moon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </motion.div>
                ) : (
                    <motion.div key="light" initial={{ opacity: 0, scale: 0.5, rotate: -45 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.5, rotate: 45 }} transition={{ duration: 0.2 }}>
                        <Sun className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    );
}

function MoodSwitcher({ currentMood, onMoodChange }: { currentMood: string, onMoodChange: (mood: any) => void }) {
    const moods = [
        { id: 'professional', icon: <Building2 className="w-4 h-4" />, label: 'Professional' },
        { id: 'technical', icon: <Terminal className="w-4 h-4" />, label: 'Technical' },
        { id: 'creative', icon: <Sparkles className="w-4 h-4" />, label: 'Creative' }
    ];

    const cycleMood = () => {
        const currentIndex = moods.findIndex(m => m.id === currentMood);
        const nextIndex = (currentIndex + 1) % moods.length;
        onMoodChange(moods[nextIndex].id);
    };

    const activeMood = moods.find(m => m.id === currentMood) || moods[0];

    return (
        <button
            onClick={cycleMood}
            className="h-10 px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-sm flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-zinc-600 dark:text-zinc-400 group"
            title="Change Dashboard Mood"
        >
            <div className="w-5 h-5 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                {activeMood.icon}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline-block">
                {activeMood.label}
            </span>
        </button>
    );
}

import { Terminal } from "lucide-react";

interface TopNavBarProps {
    mood: 'professional' | 'technical' | 'creative';
    setMood: (mood: any) => void;
}

export default function TopNavBar({ mood, setMood }: TopNavBarProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 20);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(checkScroll, 500);
        window.addEventListener("resize", checkScroll);
        return () => {
            clearTimeout(timeout);
            window.removeEventListener("resize", checkScroll);
        };
    }, []);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = direction === "left" ? -400 : 400;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    return (
        <div className="relative w-full group/nav mb-8 flex gap-4 items-center">
            
            <div className="flex-shrink-0 flex items-center gap-2">
                <ThemeToggle />
                <MoodSwitcher currentMood={mood} onMoodChange={setMood} />
            </div>

            {/* Main Bar with Clean Aesthetic */}
            <div className="relative flex-1 bg-white dark:bg-zinc-900 transition-colors duration-500 border border-zinc-200 dark:border-white/10 rounded-2xl p-2 shadow-sm flex items-center overflow-hidden">

                {/* Left Scroll Trigger */}
                <AnimatePresence>
                    {canScrollLeft && (
                        <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            onClick={() => scroll("left")}
                            className="absolute left-2 z-20 w-8 h-8 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Right Scroll Trigger */}
                <AnimatePresence>
                    {canScrollRight && (
                        <motion.button
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            onClick={() => scroll("right")}
                            className="absolute right-2 z-20 w-8 h-8 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Items Container */}
                <div
                    ref={scrollRef}
                    onScroll={checkScroll}
                    className="flex items-center gap-2 overflow-x-auto custom-scrollbar px-6 py-1 scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {navItems.map((item, index) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
                            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.02 }}
                            className="flex-shrink-0"
                        >
                            <Link href={item.href}>
                                <div className={`group relative px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all duration-300 flex items-center gap-3 cursor-pointer`}>
                                    <div className={`w-8 h-8 rounded-lg ${item.bg} dark:bg-zinc-800 dark:border dark:border-white/5 flex items-center justify-center ${item.color} group-hover:scale-105 transition-transform duration-300`}>
                                        {item.icon}
                                    </div>
                                    <span className="relative text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-slate-900 dark:text-zinc-100 transition-colors whitespace-nowrap">
                                        {item.label}
                                    </span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Inline styles to hide scrollbar for webkit */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}} />
        </div>
    );
}
