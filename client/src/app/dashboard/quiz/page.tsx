"use client";

import { motion } from "framer-motion";
import { Copy, Plus, Users, Zap, BookOpen, KeyRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import IntervyxaCoin from "@/components/reward-system/IntervyxaCoin";

export default function QuizHubPage() {
    const [joinCode, setJoinCode] = useState("");
    const [isJoining, setIsJoining] = useState(false);
    const router = useRouter();

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinCode || joinCode.length !== 6) {
            toast.error("Please enter a valid 6-character code.");
            return;
        }
        setIsJoining(true);
        // Navigate to the join/play screen immediately. 
        // We'll validate the code on that page via the API.
        router.push(`/dashboard/quiz/join/${joinCode.toUpperCase()}`);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 p-6 md:p-12 font-sans relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

            <div className="max-w-6xl mx-auto space-y-12 relative z-10">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300 text-sm font-medium mb-4">
                        <Zap className="w-4 h-4" />
                        <span>Peer-to-Peer Learning</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        Interactive <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-indigo-400">Live Quizzes</span>
                    </h1>
                    <p className="text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto text-lg pt-2 leading-relaxed">
                        Host or join real-time technical and theoretical quizzes. Practice with your peers, test your knowledge, and earn <span className="text-yellow-400 font-bold">500 Intervyxa Coins</span> for every correct answer!
                    </p>
                </motion.div>

                {/* Main Action Grid */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto pb-12">

                    {/* Create Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 hover:border-fuchsia-500/30 transition-all group flex flex-col h-full relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center mb-6">
                                <Plus className="w-7 h-7 text-fuchsia-400" />
                            </div>

                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Host a Quiz</h2>
                            <p className="text-slate-500 dark:text-zinc-400 mb-8 leading-relaxed flex-1">
                                Create a custom quiz with multiple choice or theoretical questions. Generate a unique code and invite your peers to compete.
                            </p>

                            <ul className="space-y-3 mb-8 text-sm text-slate-600 dark:text-zinc-300">
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" /> Mix theoretical and MCQ questions</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" /> Public & Private modes</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" /> Live real-time leaderboard</li>
                            </ul>

                            <Link href="/dashboard/quiz/create" className="mt-auto block">
                                <Button className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-slate-900 dark:text-white rounded-xl h-12 text-base font-semibold transition-all">
                                    Create New Quiz
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Join Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 hover:border-indigo-500/30 transition-all group flex flex-col h-full relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
                                <KeyRound className="w-7 h-7 text-indigo-400" />
                            </div>

                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Join a Session</h2>
                            <p className="text-slate-500 dark:text-zinc-400 mb-8 leading-relaxed">
                                Enter a 6-digit access code from your instructor or peer to join a live quiz session immediately.
                            </p>

                            <form onSubmit={handleJoin} className="mt-auto space-y-4">
                                <div className="space-y-4">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Copy className="w-5 h-5 text-zinc-500" />
                                        </div>
                                        <input
                                            type="text"
                                            value={joinCode}
                                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                            maxLength={6}
                                            placeholder="Enter 6-digit code..."
                                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-950/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-mono text-center tracking-[0.2em] text-lg uppercase placeholder:text-zinc-600 placeholder:tracking-normal focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={isJoining || joinCode.length !== 6}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-slate-900 dark:text-white rounded-xl h-12 text-base font-semibold transition-all relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                                        {isJoining ? "Connecting..." : "Join Quiz"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}
