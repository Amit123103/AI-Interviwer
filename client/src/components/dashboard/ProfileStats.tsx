
"use client"

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Card } from '@/components/ui/card';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';
import { Flame, CheckCircle, XCircle, Code2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface Stats {
    solved: { Easy: number; Medium: number; Hard: number; Total: number };
    totalSubmissions: number;
    acceptanceRate: number;
    activity: { date: string; count: number }[];
    recent: any[];
}

export default function ProfileStats({ userId }: { userId: string }) {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/coding/user/${userId}/stats`);
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch stats", err);
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchStats();
    }, [userId]);

    if (loading) return <div className="p-8 text-center text-zinc-500">Loading stats...</div>;
    if (!stats) return null;

    const data = [
        { name: 'Easy', value: stats.solved.Easy, color: '#10b981' },
        { name: 'Medium', value: stats.solved.Medium, color: '#f59e0b' },
        { name: 'Hard', value: stats.solved.Hard, color: '#f43f5e' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Solved Problems Chart */}
                <Card className="bg-zinc-900 border-zinc-800 p-6 flex flex-col items-center">
                    <h3 className="text-zinc-400 font-bold mb-4">Solved Problems</h3>
                    <div className="w-40 h-40 relative">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <PieChart>
                                <Pie
                                    data={data}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                            <span className="text-3xl font-bold text-white">{stats.solved.Total}</span>
                            <span className="text-xs text-zinc-500">Solved</span>
                        </div>
                    </div>
                    <div className="w-full mt-4 space-y-2">
                        {data.map(item => (
                            <div key={item.name} className="flex justify-between text-sm">
                                <span className="text-zinc-400 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    {item.name}
                                </span>
                                <span className="font-bold text-white">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* KPI Cards */}
                <div className="space-y-6 md:col-span-2">
                    <div className="grid grid-cols-2 gap-6">
                        <Card className="bg-zinc-900 border-zinc-800 p-6 flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">{stats.acceptanceRate}%</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Acceptance Rate</div>
                            </div>
                        </Card>
                        <Card className="bg-zinc-900 border-zinc-800 p-6 flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                                <Code2 className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">{stats.totalSubmissions}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Total Submissions</div>
                            </div>
                        </Card>
                    </div>

                    {/* Heatmap */}
                    <Card className="bg-zinc-900 border-zinc-800 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Flame className="w-5 h-5 text-amber-500" />
                            <h3 className="text-zinc-400 font-bold">Activity (Last 365 Days)</h3>
                        </div>
                        <div className="h-32 text-xs">
                            <CalendarHeatmap
                                startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                                endDate={new Date()}
                                values={stats.activity}
                                classForValue={(value) => {
                                    if (!value) return 'color-empty';
                                    return `color-scale-${Math.min(value.count, 4)}`;
                                }}
                                tooltipDataAttrs={(value: any) => {
                                    return {
                                        'data-tip': `${value.date} has count: ${value.count}`,
                                    };
                                }}
                                showWeekdayLabels={true}
                            />
                        </div>
                        <style jsx global>{`
                            .react-calendar-heatmap .color-empty { fill: #27272a; }
                            .react-calendar-heatmap .color-scale-1 { fill: #064e3b; }
                            .react-calendar-heatmap .color-scale-2 { fill: #065f46; }
                            .react-calendar-heatmap .color-scale-3 { fill: #10b981; }
                            .react-calendar-heatmap .color-scale-4 { fill: #34d399; }
                            .react-calendar-heatmap text { fill: #71717a; font-size: 10px; }
                        `}</style>
                    </Card>
                </div>
            </div>

            {/* Recent Submissions */}
            <Card className="bg-zinc-900 border-zinc-800 p-6">
                <h3 className="text-zinc-400 font-bold mb-4">Recent Submissions</h3>
                <div className="space-y-3">
                    {stats.recent.map((sub: any) => (
                        <div key={sub._id} className="flex justify-between items-center p-3 rounded bg-zinc-950/50">
                            <div>
                                <div className="font-medium text-white">{sub.problemId?.title || 'Unknown Problem'}</div>
                                <div className="text-xs text-zinc-500 flex gap-2 mt-1">
                                    <span className={sub.status === 'Accepted' ? 'text-emerald-500' : 'text-rose-500'}>{sub.status}</span>
                                    <span>•</span>
                                    <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <Badge variant="outline" className="border-zinc-800 text-zinc-400">
                                {sub.language}
                            </Badge>
                        </div>
                    ))}
                    {stats.recent.length === 0 && <div className="text-zinc-500 text-sm italic">No recent activity.</div>}
                </div>
            </Card>
        </div>
    );
}
