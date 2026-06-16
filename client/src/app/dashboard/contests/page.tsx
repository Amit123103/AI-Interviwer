
"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { contestApi, Contest } from '@/lib/api/contest';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Trophy, Users, ArrowRight, Timer, CheckCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import MeshBackground from "../components/MeshBackground"
import HolographicHud from "@/components/ui/HolographicHud"
import BackToDashboard from "@/components/dashboard/BackToDashboard"

export default function ContestLobbyPage() {
    const router = useRouter();
    const [contests, setContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }

        const fetchContests = async () => {
            try {
                const data = await contestApi.getContests();
                setContests(data);
            } catch (err) {
                console.error("Failed to fetch contests", err);
            } finally {
                setLoading(false);
            }
        };
        fetchContests();
    }, []);

    const handleRegister = async (contestId: string) => {
        if (!user) return router.push('/auth/login');
        try {
            await contestApi.register(contestId, user._id);
            // Refresh list to update participant count/status
            const data = await contestApi.getContests();
            setContests(data);
        } catch (err: any) {
            alert(err.response?.data?.error || "Registration failed");
        }
    };

    if (loading) return <div className="p-8 text-center text-zinc-500">Loading contests...</div>;

    const liveContests = contests.filter(c => c.status === 'Live');
    const upcomingContests = contests.filter(c => c.status === 'Upcoming');
    const pastContests = contests.filter(c => c.status === 'Ended');

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-white p-4 sm:p-6 md:p-10 relative overflow-hidden aurora-glow">
            <MeshBackground />
            <HolographicHud />
            {/* Floating ambient orbs */}
            <div className="absolute top-20 left-10 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
            <div className="absolute bottom-32 right-16 w-72 h-72 bg-fuchsia-500/4 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />
            <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                <BackToDashboard currentPage="Contests" />
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Compete & Rank Up</h1>
                    <p className="text-slate-500 dark:text-zinc-400">Join global customized contests to test your skills and earn badges.</p>
                </div>

                {/* Live Contests */}
                {liveContests.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-lg font-black bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" /> Live Now
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {liveContests.map(contest => (
                                <ContestCard key={contest._id} contest={contest} user={user} onRegister={handleRegister} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Upcoming Contests */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-emerald-500" />
                        <h2 className="text-lg font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Upcoming</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingContests.map(contest => (
                            <ContestCard key={contest._id} contest={contest} user={user} onRegister={handleRegister} />
                        ))}
                        {upcomingContests.length === 0 && <div className="text-zinc-500 italic">No upcoming contests scheduled.</div>}
                    </div>
                </section>

                {/* Past Contests */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        <h2 className="text-lg font-black bg-gradient-to-r from-zinc-400 to-zinc-500 bg-clip-text text-transparent">Past Contests</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pastContests.map(contest => (
                            <ContestCard key={contest._id} contest={contest} user={user} onRegister={handleRegister} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

function ContestCard({ contest, user, onRegister }: { contest: Contest, user: any, onRegister: (id: string) => void }) {
    const isRegistered = user && contest.participants.includes(user._id);
    const router = useRouter();

    return (
        <Card className="bg-white dark:bg-zinc-900/40 border-white/[0.06] overflow-hidden hover:border-violet-500/20 hover:shadow-[0_0_30px_rgba(139,92,246,0.06)] transition-all duration-500 group backdrop-blur-2xl hover-shine">
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-violet-400 transition-colors">{contest.title}</h3>
                        <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {format(new Date(contest.startTime), "MMM d, h:mm a")}
                            <span className="text-zinc-700">•</span>
                            {formatDistanceToNow(new Date(contest.startTime), { addSuffix: true })}
                        </div>
                    </div>
                    <Badge variant="outline" className={`border-0 ${contest.status === 'Live' ? 'bg-rose-500/10 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]' :
                        contest.status === 'Upcoming' ? 'bg-emerald-500/10 text-emerald-400' :
                            'bg-zinc-500/10 text-zinc-500'
                        }`}>
                        {contest.status}
                    </Badge>
                </div>

                <p className="text-sm text-slate-500 dark:text-zinc-400 line-clamp-2">{contest.description}</p>

                <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {contest.participants.length} Registered
                    </div>
                    {contest.prizes.length > 0 && (
                        <div className="flex items-center gap-1 text-amber-500/80">
                            <Trophy className="w-3 h-3" />
                            Prizes
                        </div>
                    )}
                </div>

                <div className="pt-2">
                    {contest.status === 'Upcoming' ? (
                        isRegistered ? (
                            <Button className="w-full bg-zinc-800 text-slate-500 dark:text-zinc-400 cursor-default hover:bg-zinc-800" disabled>
                                <CheckCircle className="w-4 h-4 mr-2" /> Registered
                            </Button>
                        ) : (
                            <Button className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-slate-900 dark:text-white border-0 shadow-[0_0_20px_rgba(139,92,246,0.3)]" onClick={() => onRegister(contest._id)}>
                                Register Now
                            </Button>
                        )
                    ) : contest.status === 'Live' ? (
                        <Button className="w-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-slate-900 dark:text-white border-0 shadow-[0_0_20px_rgba(244,63,94,0.3)]" onClick={() => router.push(`/dashboard/contests/${contest._id}`)}>
                            Enter Contest <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button variant="outline" className="w-full border-white/[0.06] text-slate-500 dark:text-zinc-400 hover:text-violet-400 hover:border-violet-500/20 hover:bg-violet-500/5 transition-all" onClick={() => router.push(`/dashboard/contests/${contest._id}`)}>
                            View Leaderboard
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}
