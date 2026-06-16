"use client"
import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Lock, Play, Star, ArrowLeft, Terminal, Layout, Database, Award, BookOpen, ChevronRight, Search, Map, Zap, Target, Briefcase, Brain, Sparkles, Trophy } from "lucide-react"
import Link from "next/link"
import Logo from "@/components/ui/Logo"
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import TiltCard from "@/components/ui/TiltCard"

// Types
type NodeStatus = "locked" | "available" | "in-progress" | "completed";
type RolePath = "frontend" | "backend" | "fullstack";

interface SkillNode {
    id: string;
    title: string;
    description: string;
    status: NodeStatus;
    icon: React.ReactNode;
    resources: number;
    coinReward: number;
    dependsOn: string[]; // IDs of nodes that must be completed first
    x: number; // For manual positioning if needed, or we can auto-layout
    y: number;
    category: string;
}

// Mock Data
const BASE_NODES: SkillNode[] = [
    { id: "cs101", title: "CS Fundamentals", description: "Time & Space Complexity, Big O Notation", status: "completed", icon: <BookOpen className="w-5 h-5" />, resources: 3, coinReward: 100, dependsOn: [], x: 50, y: 10, category: "Fundamentals" },

    // Data Structures
    { id: "ds_arrays", title: "Arrays & Strings", description: "Two Pointers, Sliding Window", status: "completed", icon: <Database className="w-5 h-5" />, resources: 5, coinReward: 150, dependsOn: ["cs101"], x: 30, y: 25, category: "Data Structures" },
    { id: "ds_hash", title: "Hash Maps & Sets", description: "O(1) lookups, mapping relationships", status: "in-progress", icon: <Database className="w-5 h-5" />, resources: 4, coinReward: 150, dependsOn: ["cs101"], x: 70, y: 25, category: "Data Structures" },
    { id: "ds_linked", title: "Linked Lists", description: "Fast & slow pointers, reversals", status: "available", icon: <Database className="w-5 h-5" />, resources: 3, coinReward: 200, dependsOn: ["ds_arrays"], x: 30, y: 40, category: "Data Structures" },
    { id: "ds_trees", title: "Trees & Graphs", description: "DFS, BFS, Binary Search Trees", status: "locked", icon: <Database className="w-5 h-5" />, resources: 6, coinReward: 300, dependsOn: ["ds_hash"], x: 70, y: 40, category: "Data Structures" },

    // Algorithms
    { id: "algo_dp", title: "Dynamic Programming", description: "Memoization, Tabulation", status: "locked", icon: <Terminal className="w-5 h-5" />, resources: 4, coinReward: 400, dependsOn: ["ds_trees"], x: 50, y: 55, category: "Algorithms" },

    // Domain Specific (Frontend/Backend)
    { id: "fe_react", title: "React Deep Dive", description: "Hooks, Virtual DOM, State", status: "locked", icon: <Layout className="w-5 h-5" />, resources: 5, coinReward: 250, dependsOn: ["algo_dp"], x: 20, y: 70, category: "Frontend" },
    { id: "be_node", title: "Node & Express", description: "Event Loop, REST APIs", status: "locked", icon: <Terminal className="w-5 h-5" />, resources: 5, coinReward: 250, dependsOn: ["algo_dp"], x: 80, y: 70, category: "Backend" },

    // System Design
    { id: "sys_design", title: "System Design", description: "Scalability, Microservices", status: "locked", icon: <Map className="w-5 h-5" />, resources: 7, coinReward: 500, dependsOn: ["fe_react", "be_node"], x: 50, y: 85, category: "System Design" },

    // Final
    { id: "interview_ready", title: "Interview Ready", description: "Behavioral & Mock Interviews", status: "locked", icon: <Award className="w-5 h-5" />, resources: 2, coinReward: 1000, dependsOn: ["sys_design"], x: 50, y: 100, category: "Final" }
];

export default function CareerRoadmapPage() {
    const [path, setPath] = useState<RolePath>("fullstack");
    const [nodes, setNodes] = useState<SkillNode[]>(BASE_NODES);
    const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);

    // Filter nodes based on selected path
    useEffect(() => {
        let filtered = BASE_NODES;
        if (path === "frontend") {
            filtered = BASE_NODES.filter(n => n.category !== "Backend");
        } else if (path === "backend") {
            filtered = BASE_NODES.filter(n => n.category !== "Frontend");
        }
        setNodes(filtered);
    }, [path]);

    const getStatusColor = (status: NodeStatus) => {
        switch (status) {
            case "completed": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]";
            case "in-progress": return "bg-indigo-500/20 text-indigo-400 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.3)]";
            case "available": return "bg-white/10 text-slate-900 dark:text-white border-white/30 hover:bg-white/15 shadow-[0_0_15px_rgba(255,255,255,0.1)]";
            case "locked": return "bg-white dark:bg-black/50 text-zinc-600 border-slate-100 dark:border-white/5 opacity-60";
        }
    };

    const getStatusIcon = (status: NodeStatus) => {
        switch (status) {
            case "completed": return <CheckCircle className="w-4 h-4 text-emerald-400" />;
            case "in-progress": return <Play className="w-4 h-4 text-indigo-400" />;
            case "locked": return <Lock className="w-4 h-4 text-zinc-600" />;
            case "available": return <ChevronRight className="w-4 h-4 text-slate-500 dark:text-zinc-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white flex flex-col font-sans relative overflow-hidden aurora-glow">
            {/* Ambient Background Glows */}
            <div className="absolute top-20 left-10 w-80 h-80 bg-violet-500/10 rounded-full blur-[140px] orb-float pointer-events-none" />
            <div className="absolute bottom-32 right-16 w-72 h-72 bg-emerald-500/10 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />
            <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '6s' }} />

            {/* Topbar */}
            <div className="h-20 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-2xl flex items-center justify-between px-8 shrink-0 relative z-50">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white/10 transition-colors text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                            <Map className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="font-black text-2xl tracking-tight bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">Interactive Career Roadmap</h1>
                            <p className="text-sm font-medium text-zinc-500">Master the skills required for top tech roles.</p>
                        </div>
                    </div>
                </div>

                <div className="flex bg-white dark:bg-black/60 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-inner hidden md:flex">
                    {(["frontend", "fullstack", "backend"] as RolePath[]).map(r => (
                        <button
                            key={r}
                            onClick={() => setPath(r)}
                            className={`px-6 py-2 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${path === r ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-slate-900 dark:text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'text-zinc-500 hover:text-slate-900 dark:text-zinc-300'}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Interactive Map Area */}
            <div className="flex-1 flex overflow-hidden relative">
                <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative p-10 flex justify-center pb-40">

                    {/* SVG Connections Container */}
                    <div className="absolute inset-0 pointer-events-none flex justify-center w-full z-0 overflow-hidden">
                        <svg className="w-full max-w-5xl h-[1200px]" preserveAspectRatio="xMidYMin meet" viewBox="0 0 100 120">
                            {nodes.map(node => {
                                return node.dependsOn.map(depId => {
                                    const parent = nodes.find(n => n.id === depId);
                                    if (!parent) return null;

                                    const isCompleted = parent.status === "completed" && (node.status === "completed" || node.status === "in-progress" || node.status === "available");
                                    const isPathActive = isCompleted || (parent.status === "completed" && node.status === "in-progress");

                                    return (
                                        <g key={`${parent.id}-${node.id}`}>
                                            <path
                                                d={`M ${parent.x} ${parent.y + 4} C ${parent.x} ${parent.y + 12}, ${node.x} ${node.y - 12}, ${node.x} ${node.y - 4}`}
                                                fill="none"
                                                stroke={isPathActive ? "url(#activeGradient)" : "rgba(255,255,255,0.1)"}
                                                strokeWidth={isPathActive ? "0.6" : "0.3"}
                                                strokeDasharray={isPathActive ? "none" : "1 1"}
                                                className="transition-all duration-1000"
                                            />
                                        </g>
                                    );
                                });
                            })}

                            <defs>
                                <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="rgba(16,185,129,0.8)" />
                                    <stop offset="100%" stopColor="rgba(99,102,241,0.8)" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    {/* Nodes Container */}
                    <div className="w-full max-w-5xl h-[1200px] relative z-10 pt-10">
                        <AnimatePresence>
                            {nodes.map((node) => (
                                <motion.div
                                    key={node.id}
                                    layoutId={node.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                                >
                                    <button
                                        onClick={() => setSelectedNode(node)}
                                        disabled={node.status === "locked"}
                                        className={`w-64 p-5 rounded-3xl border backdrop-blur-2xl flex flex-col items-center text-center transition-all duration-300 group ${getStatusColor(node.status)} ${selectedNode?.id === node.id ? 'ring-2 ring-white ring-offset-4 ring-offset-[#050505] scale-110 z-20' : 'hover:scale-105 z-10'}`}
                                    >
                                        <div className="absolute -top-3 right-5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-white/20 rounded-full py-1 px-3 text-[10px] font-black tracking-widest text-slate-600 dark:text-zinc-300 flex items-center gap-1.5 shadow-lg">
                                            <Sparkles className="w-3 h-3 text-yellow-500" /> {node.coinReward} Intervyxa Coins
                                        </div>
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-slate-200 dark:border-white/10 ${node.status === "completed" ? "bg-emerald-500/20 text-emerald-400" : node.status === "in-progress" ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-slate-500 dark:text-zinc-400"}`}>
                                            {node.icon}
                                        </div>
                                        <h3 className="font-black text-base mb-1.5 tracking-tight">{node.title}</h3>
                                        <p className="text-[11px] font-medium opacity-70 mb-4 px-2 leading-relaxed">{node.description}</p>

                                        <div className="w-full flex justify-between items-center mt-auto pt-4 border-t border-current border-opacity-20">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-1.5">
                                                <BookOpen className="w-3.5 h-3.5" /> {node.resources} Modules
                                            </span>
                                            <div className="p-1.5 bg-white dark:bg-black/30 rounded-lg">
                                                {getStatusIcon(node.status)}
                                            </div>
                                        </div>
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Info Panel Sidebar */}
                <AnimatePresence>
                    {selectedNode && (
                        <motion.div
                            initial={{ x: 400, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 400, opacity: 0 }}
                            className="w-[420px] bg-white dark:bg-zinc-950/80 backdrop-blur-3xl border-l border-slate-200 dark:border-white/10 flex flex-col shadow-2xl z-40 relative overflow-hidden hidden lg:flex shrink-0"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

                            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col">
                                <div className="flex justify-between items-start mb-8">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl border border-slate-200 dark:border-white/10 ${getStatusColor(selectedNode.status)}`}>
                                        {selectedNode.icon}
                                    </div>
                                    <button onClick={() => setSelectedNode(null)} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white transition-all">
                                        <ArrowLeft className="w-5 h-5 rotate-180" />
                                    </button>
                                </div>

                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-slate-200 dark:border-white/10 w-max mb-4">
                                    <Target className="w-4 h-4 text-fuchsia-400" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-zinc-300">{selectedNode.category}</span>
                                </div>

                                <h2 className="text-3xl font-black mb-3 tracking-tight">{selectedNode.title}</h2>
                                <p className="text-sm text-slate-500 dark:text-zinc-400 mb-8 leading-relaxed font-medium">{selectedNode.description}. Master this module to unlock further career pathways, increase your interview readiness, and gain valuable experience points.</p>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-black/50 border border-slate-100 dark:border-white/5 shadow-inner">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                                                <Star className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm font-bold">Reward</span>
                                        </div>
                                        <span className="text-base font-black text-yellow-400">+{selectedNode.coinReward} Intervyxa Coins</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-black/50 border border-slate-100 dark:border-white/5 shadow-inner">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm font-bold">Resources</span>
                                        </div>
                                        <span className="text-sm font-black text-indigo-400">{selectedNode.resources} Core Lessons</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-black/50 border border-slate-100 dark:border-white/5 shadow-inner">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                                <Zap className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm font-bold">Status</span>
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest text-emerald-400">{selectedNode.status.replace("-", " ")}</span>
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 border-t border-slate-200 dark:border-white/10">
                                    <Link href={selectedNode.status === 'completed' ? '/dashboard/metrics' : '/dashboard/code'} className={`w-full h-14 rounded-2xl flex items-center justify-center font-black text-sm shadow-[0_0_30px_rgba(99,102,241,0.2)] transition-all uppercase tracking-widest gap-2 ${selectedNode.status === 'completed' ? 'bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-zinc-700' : 'bg-gradient-to-r from-indigo-500 to-violet-500 text-slate-900 dark:text-white hover:scale-[1.03]'}`}>
                                        {selectedNode.status === 'completed' ? (
                                            <>Review Mastery <CheckCircle className="w-4 h-4" /></>
                                        ) : (
                                            <>Engage Module <Play className="w-4 h-4 fill-current" /></>
                                        )}
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mobile Selected Node Overlay */}
                <AnimatePresence>
                    {selectedNode && (
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="lg:hidden absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white dark:bg-zinc-950/95 backdrop-blur-3xl border-t border-slate-200 dark:border-white/10 rounded-t-[2.5rem] p-8 shadow-[0_-30px_60px_rgba(0,0,0,0.6)] z-50 flex flex-col"
                        >
                            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8" />
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/10 ${getStatusColor(selectedNode.status)}`}>
                                        {selectedNode.icon}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black tracking-tight">{selectedNode.title}</h2>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-400">{selectedNode.category}</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedNode(null)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-500 dark:text-zinc-400 transition-colors">
                                    <ArrowLeft className="w-5 h-5 -rotate-90" />
                                </button>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-8 font-medium leading-relaxed">{selectedNode.description}. Master this module to unlock further career pathways and technical depth.</p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-white dark:bg-black/40 border border-slate-100 dark:border-white/5 p-4 rounded-2xl flex flex-col gap-2">
                                    <span className="text-[10px] font-black uppercase text-zinc-500">Reward</span>
                                    <span className="text-sm font-black text-yellow-400">+{selectedNode.coinReward} Intervyxa Coins</span>
                                </div>
                                <div className="bg-white dark:bg-black/40 border border-slate-100 dark:border-white/5 p-4 rounded-2xl flex flex-col gap-2">
                                    <span className="text-[10px] font-black uppercase text-zinc-500">Resources</span>
                                    <span className="text-sm font-black text-indigo-400">{selectedNode.resources} Lessons</span>
                                </div>
                            </div>

                            <Link href="/dashboard/code" className={`w-full h-14 rounded-2xl flex items-center justify-center font-black text-sm uppercase tracking-widest gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-slate-900 dark:text-white mt-auto`}>
                                Engage Module <Play className="w-4 h-4 fill-current" />
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
