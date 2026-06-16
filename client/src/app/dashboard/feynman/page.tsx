"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, BookOpen, Brain, MessageSquare, Send, Sparkles, Star, Target, Lightbulb, User, ShieldCheck, ChevronRight, CheckCircle, Coins, Sun, Moon } from "lucide-react"
import IntervyxaCoin from "@/components/reward-system/IntervyxaCoin"
import Link from "next/link"
import Logo from "@/components/ui/Logo"
import { useTheme } from "next-themes"

// Theme Helper
function t(dark: boolean, darkClass: string, lightClass: string) {
    return dark ? darkClass : lightClass;
}

// Types
type ChatMessage = {
    id: string;
    role: "student" | "ai" | "system";
    content: string;
    timestamp: Date;
};

type Topic = {
    id: string;
    title: string;
    description: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
};

const TOPICS: Topic[] = [
    { id: "react-hooks", title: "React Hooks", description: "Explain how useState and useEffect work under the hood.", difficulty: "Intermediate" },
    { id: "event-loop", title: "JavaScript Event Loop", description: "How does JS handle asynchronous operations single-threaded?", difficulty: "Advanced" },
    { id: "rest-api", title: "REST APIs", description: "What makes an API RESTful? Explain the constraints.", difficulty: "Beginner" },
    { id: "db-indexing", title: "Database Indexing", description: "Explain B-Trees and how indexing speeds up queries.", difficulty: "Advanced" },
];

export default function FeynmanExplainerPage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [sessionPhase, setSessionPhase] = useState<"select" | "explain" | "chat" | "evaluation">("select");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const isDark = mounted && theme === 'dark';

    const handleSelectTopic = (topic: Topic) => {
        setSelectedTopic(topic);
        setSessionPhase("explain");
        setMessages([
            { id: "sys-1", role: "system", content: `Topic selected: ${topic.title}. Start by typing out an initial explanation like you are teaching a beginner.`, timestamp: new Date() }
        ]);
    };

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const newMsg: ChatMessage = {
            id: Date.now().toString(),
            role: "student",
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMsg]);
        setInputValue("");
        setIsTyping(true);

        if (sessionPhase === "explain") {
            setSessionPhase("chat");
        }

        // Simulate AI response
        setTimeout(() => {
            setIsTyping(false);

            // Mock AI behavior based on phase
            if (sessionPhase === "explain" || messages.length < 5) {
                const beginnerQuestions = [
                    "I'm a bit confused, what do you mean by that exactly?",
                    "Could you give me an analogy for that? It sounds complicated.",
                    "Wait, why does it work that way? Can you break it down further?",
                    "That makes sense, but what happens if an error occurs there?",
                    "I think I get it. So is it similar to how a library organizes books?"
                ];
                const randomQ = beginnerQuestions[Math.floor(Math.random() * beginnerQuestions.length)];

                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: "ai",
                    content: randomQ,
                    timestamp: new Date()
                }]);
            } else if (messages.length >= 5 && sessionPhase !== "evaluation") {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: "ai",
                    content: "I think I fully understand it now! You can 'End Session' to get your evaluation.",
                    timestamp: new Date()
                }]);
            }
        }, 1500);
    };

    const handleEndSession = () => {
        setSessionPhase("evaluation");
        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);
        }, 2000);
    };

    return (
        <div className={`min-h-screen flex flex-col font-sans relative overflow-hidden transition-colors duration-700 ${t(isDark, 'bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white', 'bg-slate-50 text-slate-900')}`}>
            {/* Ambient Background Glows */}
            <div className={`absolute top-0 left-10 w-[500px] h-[500px] rounded-full blur-[150px] orb-float pointer-events-none transition-colors duration-1000 ${t(isDark, 'bg-blue-500/10', 'bg-blue-300/30')}`} />
            <div className={`absolute bottom-0 right-10 w-[400px] h-[400px] rounded-full blur-[120px] orb-float pointer-events-none transition-colors duration-1000 ${t(isDark, 'bg-indigo-500/10', 'bg-indigo-300/30')}`} style={{ animationDelay: '2s' }} />

            {/* Header */}
            <div className={`h-24 border-b backdrop-blur-2xl flex items-center justify-between px-8 shrink-0 relative z-50 transition-colors duration-500 ${t(isDark, 'bg-white/80 dark:bg-zinc-950/60 border-slate-200 dark:border-white/10', 'bg-white/80 border-slate-200 shadow-sm')}`}>
                <div className="flex items-center gap-6 py-4">
                    <Link href="/dashboard" className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all group ${t(isDark, 'bg-white/5 border-slate-200 dark:border-white/10 hover:bg-white/10 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white', 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900 shadow-sm')}`}>
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div className="flex items-center gap-4 hidden sm:flex">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg ${t(isDark, 'bg-blue-500/10 border-blue-500/20 shadow-blue-500/20', 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-blue-200/50')}`}>
                            <Brain className={`w-6 h-6 ${t(isDark, 'text-blue-400', 'text-blue-600')}`} />
                        </div>
                        <div>
                            <h1 className="font-black text-2xl tracking-tight bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">Feynman Explainer</h1>
                            <p className={`text-sm font-bold ${t(isDark, 'text-zinc-500', 'text-slate-500')}`}>Learn by teaching. Break down concepts simply.</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {sessionPhase === "chat" && (
                        <button
                            onClick={handleEndSession}
                            className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-slate-900 dark:text-white shadow-lg shadow-blue-500/30 hover:scale-105 transition-all"
                        >
                            End & Evaluate
                        </button>
                    )}
                    
                    {/* Dark Mode Toggle */}
                    {mounted && (
                        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className={`relative w-16 h-9 rounded-full transition-all duration-500 flex items-center px-1 ${
                                isDark
                                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/30'
                                    : 'bg-gradient-to-r from-amber-400 to-orange-400 shadow-lg shadow-amber-400/30'
                            }`}>
                            <motion.div
                                layout
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md ${
                                    isDark ? 'bg-white ml-auto' : 'bg-white'
                                }`}>
                                {isDark ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-amber-500" />}
                            </motion.div>
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden relative z-10 max-w-7xl mx-auto w-full p-6 gap-6">

                {/* Left Sidebar (Topics or Status) */}
                <div className="w-full max-w-sm flex flex-col gap-6">

                    {/* Active Topic Card */}
                    {selectedTopic ? (
                        <div className={`backdrop-blur-xl border rounded-[32px] p-8 shadow-2xl relative overflow-hidden group transition-colors duration-500 ${t(isDark, 'bg-white/60 dark:bg-zinc-900/50 border-slate-200 dark:border-white/10', 'bg-white border-slate-200 shadow-slate-200/50')}`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-start justify-between mb-6">
                                <div className={`p-4 rounded-[20px] border ${t(isDark, 'bg-blue-500/10 text-blue-400 border-blue-500/20', 'bg-blue-50 text-blue-600 border-blue-100')}`}>
                                    <Lightbulb className="w-7 h-7" />
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border shadow-sm ${
                                    selectedTopic.difficulty === 'Beginner' ? t(isDark, 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', 'bg-emerald-50 border-emerald-200 text-emerald-600') :
                                    selectedTopic.difficulty === 'Intermediate' ? t(isDark, 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400', 'bg-yellow-50 border-yellow-200 text-yellow-600') : 
                                    t(isDark, 'bg-rose-500/10 border-rose-500/20 text-rose-400', 'bg-rose-50 border-rose-200 text-rose-600')
                                }`}>
                                    {selectedTopic.difficulty}
                                </span>
                            </div>
                            <h2 className={`text-2xl font-black mb-3 ${t(isDark, 'text-slate-900 dark:text-white', 'text-slate-900')}`}>{selectedTopic.title}</h2>
                            <p className={`text-[15px] leading-relaxed font-bold ${t(isDark, 'text-slate-500 dark:text-zinc-400', 'text-slate-600')}`}>{selectedTopic.description}</p>

                            <button
                                onClick={() => { setSelectedTopic(null); setSessionPhase("select"); setMessages([]); }}
                                className={`mt-8 text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2 ${t(isDark, 'text-zinc-500 hover:text-slate-900 dark:text-white', 'text-slate-500 hover:text-blue-600')}`}
                            >
                                <ArrowLeft className="w-4 h-4" /> Change Topic
                            </button>
                        </div>
                    ) : (
                        <div className={`backdrop-blur-xl border rounded-[32px] p-8 shadow-2xl flex-1 overflow-y-auto custom-scrollbar transition-colors duration-500 ${t(isDark, 'bg-white/60 dark:bg-zinc-900/50 border-slate-200 dark:border-white/10', 'bg-white border-slate-200 shadow-slate-200/50')}`}>
                            <h2 className={`text-xl font-black mb-8 flex items-center gap-3 ${t(isDark, 'text-slate-900 dark:text-white', 'text-slate-900')}`}>
                                <div className={`p-2 rounded-xl ${t(isDark, 'bg-blue-500/10 text-blue-400', 'bg-blue-50 text-blue-600')}`}><Target className="w-5 h-5" /></div> Select a Topic
                            </h2>
                            <div className="space-y-4">
                                {TOPICS.map(topic => (
                                    <button
                                        key={topic.id}
                                        onClick={() => handleSelectTopic(topic)}
                                        className={`w-full text-left p-6 rounded-[24px] border transition-all group ${t(isDark, 'bg-white dark:bg-black/40 border-slate-100 dark:border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5', 'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-100/40')}`}
                                    >
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className={`font-black text-[15px] transition-colors ${t(isDark, 'text-slate-900 dark:text-white group-hover:text-blue-400', 'text-slate-800 group-hover:text-blue-600')}`}>{topic.title}</h3>
                                            <ChevronRight className={`w-5 h-5 transition-all group-hover:translate-x-1 ${t(isDark, 'text-zinc-600 group-hover:text-blue-400', 'text-slate-900 dark:text-slate-400 group-hover:text-blue-600')}`} />
                                        </div>
                                        <p className={`text-[13px] font-bold line-clamp-2 leading-relaxed ${t(isDark, 'text-zinc-500', 'text-slate-500')}`}>{topic.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* How it works card */}
                    <div className={`border rounded-[32px] p-8 shadow-sm text-[13px] leading-relaxed font-bold hidden lg:block transition-colors duration-500 ${t(isDark, 'bg-white dark:bg-zinc-900/40 border-slate-100 dark:border-white/5 text-slate-500 dark:text-zinc-400', 'bg-white/60 border-slate-200 text-slate-600')}`}>
                        <strong className={`flex items-center gap-2 text-[14px] mb-4 ${t(isDark, 'text-slate-900 dark:text-white', 'text-slate-900')}`}><BookOpen className="w-5 h-5" /> The Feynman Technique:</strong>
                        <ol className="list-decimal pl-5 space-y-3 opacity-90 marker:text-blue-500 marker:font-black">
                            <li>Choose a concept to master</li>
                            <li>Teach it to a beginner (the AI)</li>
                            <li>Identify your knowledge gaps</li>
                            <li>Review and simplify</li>
                        </ol>
                    </div>
                </div>

                {/* Right Area (Chat & Interactions) */}
                <div className={`flex-1 backdrop-blur-xl border rounded-[32px] shadow-2xl flex flex-col relative overflow-hidden transition-colors duration-500 ${t(isDark, 'bg-white/60 dark:bg-zinc-900/50 border-slate-200 dark:border-white/10', 'bg-white border-slate-200 shadow-slate-200/50')}`}>

                    {sessionPhase === "select" ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                            <div className={`w-32 h-32 rounded-[32px] flex items-center justify-center mb-8 border shadow-2xl ${t(isDark, 'bg-blue-500/5 border-blue-500/10 shadow-blue-500/10', 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-blue-200/40')}`}>
                                <MessageSquare className={`w-14 h-14 ${t(isDark, 'text-blue-400 opacity-50', 'text-blue-500')}`} />
                            </div>
                            <h3 className={`text-4xl font-black mb-5 tracking-tight ${t(isDark, 'text-slate-600 dark:text-zinc-300', 'text-slate-800')}`}>Awaiting Topic Selection</h3>
                            <p className={`max-w-md mx-auto font-bold text-[15px] leading-relaxed ${t(isDark, 'text-zinc-500', 'text-slate-500')}`}>Pick a topic from the sidebar you wish to master. Once selected, you'll enter teaching mode where our AI will act as your curious student.</p>
                        </div>
                    ) : sessionPhase === "evaluation" ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                            <AnimatePresence>
                                {isTyping ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full gap-5">
                                        <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center border shadow-xl ${t(isDark, 'bg-blue-500/10 border-blue-500/20 shadow-blue-500/20', 'bg-blue-50 border-blue-200 shadow-blue-200/40')}`}>
                                            <Brain className={`w-12 h-12 animate-pulse ${t(isDark, 'text-blue-400', 'text-blue-600')}`} />
                                        </div>
                                        <h3 className="text-2xl font-black bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent tracking-tight">Evaluating your explanation...</h3>
                                    </motion.div>
                                ) : (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-8 pb-10">
                                        <div className="text-center space-y-4 mb-12 mt-8">
                                            <div className={`inline-flex w-24 h-24 border rounded-full items-center justify-center shadow-2xl mb-4 ${t(isDark, 'bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/20', 'bg-emerald-50 border-emerald-200 shadow-emerald-200/40')}`}>
                                                <ShieldCheck className={`w-12 h-12 ${t(isDark, 'text-emerald-400', 'text-emerald-500')}`} />
                                            </div>
                                            <h2 className="text-5xl font-black bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent tracking-tighter">Great Job!</h2>
                                            <p className={`text-lg font-bold ${t(isDark, 'text-slate-500 dark:text-zinc-400', 'text-slate-600')}`}>You scored <span className={t(isDark, 'text-slate-900 dark:text-white', 'text-slate-900')}>85% Mastery</span> on {selectedTopic?.title}.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className={`p-8 border rounded-[32px] transition-colors ${t(isDark, 'bg-white dark:bg-black/40 border-slate-100 dark:border-white/5', 'bg-emerald-50/50 border-emerald-100 shadow-sm')}`}>
                                                <h4 className={`font-black mb-6 flex items-center gap-3 text-lg ${t(isDark, 'text-emerald-400', 'text-emerald-600')}`}><CheckCircle className="w-6 h-6" /> What you got right</h4>
                                                <ul className={`space-y-4 font-bold text-[15px] ${t(isDark, 'text-slate-600 dark:text-zinc-300', 'text-slate-700')}`}>
                                                    <li className="flex items-start gap-4"><span className="text-emerald-500 mt-0.5">●</span> Clearly explained the primary purpose.</li>
                                                    <li className="flex items-start gap-4"><span className="text-emerald-500 mt-0.5">●</span> Used an excellent real-world analogy.</li>
                                                    <li className="flex items-start gap-4"><span className="text-emerald-500 mt-0.5">●</span> Handled follow-up questions well.</li>
                                                </ul>
                                            </div>
                                            <div className={`p-8 border rounded-[32px] transition-colors ${t(isDark, 'bg-white dark:bg-black/40 border-slate-100 dark:border-white/5', 'bg-amber-50/50 border-amber-100 shadow-sm')}`}>
                                                <h4 className={`font-black mb-6 flex items-center gap-3 text-lg ${t(isDark, 'text-yellow-400', 'text-amber-600')}`}><Star className="w-6 h-6" /> Areas to improve</h4>
                                                <ul className={`space-y-4 font-bold text-[15px] ${t(isDark, 'text-slate-600 dark:text-zinc-300', 'text-slate-700')}`}>
                                                    <li className="flex items-start gap-4"><span className="text-amber-500 mt-0.5">●</span> You skipped over edge-case scenarios.</li>
                                                    <li className="flex items-start gap-4"><span className="text-amber-500 mt-0.5">●</span> Jargon usage: try to explain "asynchronous" more simply next time.</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className={`p-8 border rounded-[32px] flex items-center justify-between ${t(isDark, 'bg-yellow-500/5 border-yellow-500/20', 'bg-amber-50 border-amber-200 shadow-sm')}`}>
                                            <div>
                                                <h4 className={`font-black mb-2 flex items-center gap-3 text-xl ${t(isDark, 'text-yellow-400', 'text-amber-600')}`}>
                                                    <IntervyxaCoin size={24} animate={true} /> Intervyxa Coins Earned
                                                </h4>
                                                <p className={`text-[15px] font-bold ${t(isDark, 'text-slate-500 dark:text-zinc-400', 'text-amber-700/70')}`}>Reward for completing a teaching session.</p>
                                            </div>
                                            <p className={`text-4xl font-black tracking-tighter ${t(isDark, 'text-slate-900 dark:text-white', 'text-amber-600')}`}>+500</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <>
                            {/* Chat Messages */}
                            <div className={`flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 space-y-8 ${t(isDark, '', 'bg-slate-50/50')}`}>
                                <AnimatePresence>
                                    {messages.map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, scale: 0.95, originY: 1 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={`flex ${msg.role === 'student' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}
                                        >
                                            {msg.role === 'system' ? (
                                                <div className={`px-6 py-3 border rounded-full text-[11px] uppercase tracking-[0.2em] font-black shadow-sm ${t(isDark, 'bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400', 'bg-white border-slate-200 text-slate-500')}`}>
                                                    {msg.content}
                                                </div>
                                            ) : (
                                                <div className={`flex gap-5 max-w-[85%] lg:max-w-[75%] ${msg.role === 'student' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    <div className={`w-12 h-12 shrink-0 rounded-[20px] flex items-center justify-center shadow-lg border ${
                                                        msg.role === 'ai' 
                                                            ? t(isDark, 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400', 'bg-indigo-100 border-indigo-200 text-indigo-600') 
                                                            : t(isDark, 'bg-blue-500/20 border-blue-500/30 text-blue-400', 'bg-blue-100 border-blue-200 text-blue-600')
                                                        }`}>
                                                        {msg.role === 'ai' ? <Brain className="w-6 h-6" /> : <User className="w-6 h-6" />}
                                                    </div>
                                                    <div className={`p-6 rounded-3xl text-[16px] font-medium leading-relaxed shadow-lg ${
                                                        msg.role === 'student' 
                                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-slate-900 dark:text-white rounded-tr-sm' 
                                                            : t(isDark, 'bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-300 rounded-tl-sm', 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm')
                                                        }`}>
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                    {isTyping && (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-start">
                                            <div className="flex gap-5 max-w-[85%]">
                                                <div className={`w-12 h-12 shrink-0 rounded-[20px] flex items-center justify-center shadow-lg border ${t(isDark, 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400', 'bg-indigo-100 border-indigo-200 text-indigo-600')}`}>
                                                    <Brain className="w-6 h-6" />
                                                </div>
                                                <div className={`px-6 py-5 rounded-3xl border flex items-center gap-2.5 rounded-tl-sm shadow-lg ${t(isDark, 'bg-white dark:bg-black/50 border-slate-200 dark:border-white/10', 'bg-white border-slate-200')}`}>
                                                    <span className={`w-2.5 h-2.5 rounded-full animate-bounce ${t(isDark, 'bg-indigo-400', 'bg-indigo-500')}`} />
                                                    <span className={`w-2.5 h-2.5 rounded-full animate-bounce ${t(isDark, 'bg-indigo-400', 'bg-indigo-500')}`} style={{ animationDelay: '0.2s' }} />
                                                    <span className={`w-2.5 h-2.5 rounded-full animate-bounce ${t(isDark, 'bg-indigo-400', 'bg-indigo-500')}`} style={{ animationDelay: '0.4s' }} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input */}
                            <div className={`p-6 border-t ${t(isDark, 'bg-white dark:bg-black/40 border-slate-100 dark:border-white/5', 'bg-white border-slate-200')}`}>
                                <form
                                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                                    className="flex gap-4 max-w-4xl mx-auto"
                                >
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={e => setInputValue(e.target.value)}
                                            placeholder="Explain the concept simply..."
                                            className={`w-full h-16 border rounded-[22px] px-8 outline-none transition-all font-bold text-[16px] shadow-sm ${t(isDark, 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 hover:border-white/20 focus:border-blue-500/50 text-slate-900 dark:text-white placeholder:text-zinc-600', 'bg-slate-50 border-slate-200 hover:border-slate-300 focus:border-blue-500 text-slate-900 placeholder:text-slate-900 dark:text-slate-400')}`}
                                            disabled={isTyping}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!inputValue.trim() || isTyping}
                                        className="h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-slate-900 dark:text-white rounded-[22px] flex items-center justify-center transition-transform active:scale-95 shadow-lg shadow-blue-500/30 shrink-0"
                                    >
                                        <Send className="w-6 h-6 ml-1 drop-shadow-md" />
                                    </button>
                                </form>
                                <p className={`text-center text-[10px] font-black uppercase tracking-[0.25em] mt-5 flex items-center justify-center gap-2 ${t(isDark, 'text-zinc-600', 'text-slate-900 dark:text-slate-400')}`}>
                                    <Sparkles className="w-3.5 h-3.5 text-blue-500" /> AI powered learning module
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
