
"use client"

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { contestApi, Contest } from '@/lib/api/contest';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, Trophy, ArrowRight, Code2 } from 'lucide-react';
import { formatDistance } from 'date-fns';
import BackToDashboard from '@/components/dashboard/BackToDashboard';

export default function ContestDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [contest, setContest] = useState<Contest | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'problems' | 'leaderboard'>('problems');

    useEffect(() => {
        const fetchContest = async () => {
            try {
                const data = await contestApi.getContest(id as string);
                setContest(data);
            } catch (err) {
                console.error("Failed to fetch contest", err);
            } finally {
                setLoading(false);
            }
        };
        fetchContest();
    }, [id]);

    // Real-time Leaderboard Update
    useEffect(() => {
        if (!contest || contest.status !== 'Live') return;

        // Connect to namespace or room
        // Assuming global socket instance is available or we create one
        // For MVP, we'll use a simple polling or if we have a global socket context
        // Let's assume we import the socket client helper/hook if it exists, or just poll for now to be safe and simple
        // ACTUALLY: The requirement is Socket.io. Let's add the basic client setup here.

        const io = require('socket.io-client'); // Fallback if not globally available
        const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001');

        socket.emit('join-contest', contest._id);
        console.log("Joined contest room", contest._id);

        socket.on('leaderboard-update', (newLeaderboard: any) => {
            console.log("Received leaderboard update", newLeaderboard);
            setContest(prev => prev ? { ...prev, leaderboard: newLeaderboard } : null);
        });

        return () => {
            socket.emit('leave-contest', contest._id);
            socket.disconnect();
        };
    }, [contest?._id, contest?.status]);

    // Timer Logic
    useEffect(() => {
        if (!contest) return;
        const target = contest.status === 'Upcoming' ? new Date(contest.startTime) : new Date(contest.endTime);

        const interval = setInterval(() => {
            const now = new Date();
            const diff = target.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft(contest.status === 'Upcoming' ? 'Starting...' : 'Ended');
                clearInterval(interval);
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [contest]);


    if (loading) return <div className="p-8 text-center text-zinc-500">Loading contest...</div>;
    if (!contest) return <div className="p-8 text-center text-slate-900 dark:text-white">Contest not found</div>;

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="h-16 border-b border-zinc-800 bg-white dark:bg-zinc-950 px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <BackToDashboard currentPage={contest.title} parents={[{ label: 'Contests', href: '/dashboard/contests' }]} />
                    <h1 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-3">
                        {contest.title}
                        <Badge variant="outline" className={`border-0 ${contest.status === 'Live' ? 'bg-rose-500/10 text-rose-500 animate-pulse' :
                            contest.status === 'Upcoming' ? 'bg-emerald-500/10 text-emerald-500' :
                                'bg-zinc-500/10 text-zinc-500'
                            }`}>
                            {contest.status}
                        </Badge>
                    </h1>
                    <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                        {contest.status === 'Upcoming' ? 'Starts in:' : contest.status === 'Live' ? 'Ends in:' : 'Ended'}
                        <span className="font-mono text-slate-900 dark:text-white font-medium">{timeLeft}</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant={activeTab === 'problems' ? "secondary" : "ghost"}
                        onClick={() => setActiveTab('problems')}
                        className="text-sm"
                    >
                        <Code2 className="w-4 h-4 mr-2" /> Problems
                    </Button>
                    <Button
                        variant={activeTab === 'leaderboard' ? "secondary" : "ghost"}
                        onClick={() => setActiveTab('leaderboard')}
                        className="text-sm"
                    >
                        <Trophy className="w-4 h-4 mr-2" /> Leaderboard
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 bg-slate-50 dark:bg-black overflow-y-auto">
                <div className="max-w-5xl mx-auto space-y-6">

                    {activeTab === 'problems' ? (
                        <>
                            <div className="bg-white/60 dark:bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Instructions</h2>
                                <p className="text-slate-500 dark:text-zinc-400 text-sm whitespace-pre-wrap">{contest.description}</p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-zinc-500 font-bold text-sm uppercase tracking-wider">Problem Set</h3>
                                {contest.problems && contest.problems.length > 0 ? (
                                    contest.problems.map((prob: any, index: number) => (
                                        <Card key={prob._id} className="bg-white dark:bg-zinc-900 border-zinc-800 p-4 hover:border-zinc-700 transition-colors flex items-center justify-between group cursor-pointer" onClick={() => router.push(`/dashboard/code/${prob.slug}?contestId=${contest._id}`)}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 font-bold text-sm">
                                                    {String.fromCharCode(65 + index)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{prob.title}</div>
                                                    <div className="text-xs text-zinc-500 flex gap-2">
                                                        <span className={`${prob.difficulty === 'Easy' ? 'text-emerald-500' :
                                                            prob.difficulty === 'Medium' ? 'text-amber-500' :
                                                                'text-rose-500'
                                                            }`}>{prob.difficulty}</span>
                                                        <span>•</span>
                                                        <span>{prob.category}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="ghost" className="text-zinc-500 group-hover:text-slate-900 dark:text-white">
                                                Solve <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="text-center py-10 bg-white dark:bg-zinc-900/30 rounded border border-zinc-900 text-zinc-500 italic">
                                        {contest.status === 'Upcoming' ?
                                            "Problems will be revealed when the contest starts." :
                                            "No problems linked to this contest."}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                                <div className="text-sm text-slate-500 dark:text-zinc-400">
                                    Top 10 Participants
                                </div>
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => window.location.reload()}>
                                    Refresh
                                </Button>
                            </div>

                            <div className="bg-white dark:bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                                {contest.leaderboard && contest.leaderboard.length > 0 ? (
                                    <table className="w-full text-sm text-left text-slate-500 dark:text-zinc-400">
                                        <thead className="bg-white dark:bg-zinc-950 text-xs uppercase text-zinc-500">
                                            <tr>
                                                <th className="px-6 py-3">Rank</th>
                                                <th className="px-6 py-3">User</th>
                                                <th className="px-6 py-3 text-right">Score</th>
                                                <th className="px-6 py-3 text-right">Finish Time</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-800">
                                            {contest.leaderboard.map((entry, i) => (
                                                <tr key={i} className="hover:bg-zinc-800/50">
                                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">#{i + 1}</td>
                                                    <td className="px-6 py-4">{entry.username}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-emerald-400">{entry.score}</td>
                                                    <td className="px-6 py-4 text-right">{entry.finishTime}m</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-8 text-center text-zinc-500 italic">
                                        Leaderboard is empty. Be the first to solve a problem!
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
