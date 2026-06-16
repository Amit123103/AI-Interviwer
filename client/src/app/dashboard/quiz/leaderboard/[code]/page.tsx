"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Star, ArrowLeft, Loader2, Check, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import IntervyxaCoin from "@/components/reward-system/IntervyxaCoin";

interface LeaderboardEntry {
    _id: string; // Attempt ID
    user: { _id: string; name: string; username: string; avatar?: string };
    score: number;
    coinsEarned: number;
}

export default function QuizLeaderboardPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = use(params);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [loading, setLoading] = useState(true);
    // Real-time could be implemented via socket.io, for now we fetch once.

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/quiz/code/${code}/leaderboard`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setLeaderboard(data.leaderboard);
                    setTotalQuestions(data.totalQuestions);
                }
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();

        // Simple polling for live updates every 5 seconds
        const interval = setInterval(fetchLeaderboard, 5000);
        return () => clearInterval(interval);
    }, [code]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-yellow-500 animate-spin mb-4" />
                <p className="text-slate-500 dark:text-zinc-400">Tallying scores...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans relative overflow-x-hidden p-6 md:p-12">

            {/* Ambient Backgrounds */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
            <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 -translate-x-1/3" />

            <div className="max-w-4xl mx-auto relative z-10">

                <div className="flex items-center justify-between mb-8">
                    <Link href="/dashboard/quiz">
                        <Button variant="ghost" size="icon" className="hover:bg-white/5 text-slate-500 dark:text-zinc-400">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="text-right">
                        <p className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase mb-1">Session Code</p>
                        <p className="text-2xl font-mono text-slate-900 dark:text-white tracking-widest">{code}</p>
                    </div>
                </div>

                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 mb-6 shadow-[0_0_40px_rgba(250,204,21,0.3)]">
                        <Trophy className="w-10 h-10 text-yellow-950" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">Leaderboard</span>
                    </h1>
                    <p className="text-slate-500 dark:text-zinc-400 mt-4 text-lg">See who conquered the quiz and earned the most Intervyxa coins.</p>
                </div>

                {/* Top 3 Podium (Optional enhanced view, simplified for now) */}

                <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="grid grid-cols-12 gap-4 p-6 border-b border-slate-100 dark:border-white/5 bg-white/[0.02] text-xs font-bold tracking-wider text-zinc-500 uppercase">
                        <div className="col-span-2 md:col-span-1 text-center">Rank</div>
                        <div className="col-span-6 md:col-span-7">Participant</div>
                        <div className="col-span-4 text-right">Score / Coins</div>
                    </div>

                    <div className="divide-y divide-white/5">
                        {leaderboard.length === 0 ? (
                            <div className="p-12 text-center text-zinc-500">
                                No one has completed this quiz yet. Waiting for results...
                            </div>
                        ) : (
                            leaderboard.map((entry, index) => {
                                const isFirst = index === 0;
                                const isSecond = index === 1;
                                const isThird = index === 2;

                                return (
                                    <motion.div
                                        key={entry.user._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`grid grid-cols-12 gap-4 p-6 items-center transition-colors hover:bg-white/[0.02] ${isFirst ? 'bg-yellow-500/[0.03]' : ''
                                            }`}
                                    >
                                        <div className="col-span-2 md:col-span-1 flex justify-center">
                                            {isFirst ? <Medal className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" /> :
                                                isSecond ? <Medal className="w-7 h-7 text-slate-600 dark:text-zinc-300 drop-shadow-[0_0_8px_rgba(212,212,216,0.5)]" /> :
                                                    isThird ? <Medal className="w-6 h-6 text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]" /> :
                                                        <span className="text-xl font-bold text-zinc-600">{index + 1}</span>}
                                        </div>

                                        <div className="col-span-6 md:col-span-7 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-slate-200 dark:border-white/10 shrink-0 overflow-hidden">
                                                <span className="text-sm font-bold text-slate-500 dark:text-zinc-400">
                                                    {entry.user.username?.charAt(0).toUpperCase() || entry.user.name?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="truncate">
                                                <p className={`font-semibold truncate ${isFirst ? 'text-yellow-400' : 'text-slate-900 dark:text-zinc-200'}`}>
                                                    {entry.user.username || entry.user.name}
                                                </p>
                                                {isFirst && <p className="text-[10px] text-yellow-500/80 font-medium">TOP SCORER</p>}
                                            </div>
                                        </div>

                                        <div className="col-span-4 text-right">
                                            <p className="text-lg font-bold text-slate-900 dark:text-white mb-0.5">
                                                {entry.score} <span className="text-sm text-zinc-500 font-medium">/ {totalQuestions}</span>
                                            </p>
                                            <p className="text-xs font-medium text-yellow-500 flex items-center justify-end gap-1">
                                                +{entry.coinsEarned} <IntervyxaCoin size={12} animate={false} />
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-sm text-zinc-500 mb-6">Want to review your specific answers?</p>
                    <Link href="/dashboard/quiz">
                        <Button className="bg-white hover:bg-zinc-200 text-zinc-950 px-8 h-12 rounded-xl text-sm font-bold">
                            Back to Quiz Hub
                        </Button>
                    </Link>
                </div>
            </div>

        </div>
    );
}
