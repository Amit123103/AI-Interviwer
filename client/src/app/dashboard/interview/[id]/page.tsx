
"use client"

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { interviewApi } from '@/lib/api/interview';
import { codingApi } from '@/lib/api/coding';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Loader2, Play, CheckCircle, Timer, User, Send, Mic, MicOff,
    BrainCircuit, Video, VideoOff, Wifi, WifiOff, Clock,
    Code2, FileText, TestTube, ChevronDown, ChevronUp,
    Shield, Sparkles, Eye, MessageSquare, AlertTriangle,
    ArrowRight, RotateCcw, Trophy, TrendingUp, Zap
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';

/* ──────────────────────────────────────────────────
   Audio Waveform Visualizer (AI Speaking Indicator)
   ────────────────────────────────────────────────── */
function AudioWaveform({ active }: { active: boolean }) {
    return (
        <div className="flex items-center gap-[3px] h-6">
            {[1, 2, 3, 4, 5].map(i => (
                <div
                    key={i}
                    className={`w-[3px] rounded-full transition-all duration-300 ${active
                        ? 'bg-gradient-to-t from-violet-500 to-fuchsia-400 animate-pulse'
                        : 'bg-zinc-700 h-1'
                        }`}
                    style={{
                        height: active ? `${8 + Math.random() * 16}px` : '4px',
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: active ? `${0.4 + Math.random() * 0.4}s` : '0s',
                    }}
                />
            ))}
        </div>
    );
}

/* ──────────────────────────────────────────────────
   Mic Level Meter (Student Audio Visualizer)
   ────────────────────────────────────────────────── */
function MicLevelMeter({ level }: { level: number }) {
    const bars = 5;
    return (
        <div className="flex items-end gap-[2px] h-4">
            {Array.from({ length: bars }).map((_, i) => {
                const threshold = (i + 1) / bars;
                const isActive = level >= threshold;
                return (
                    <div
                        key={i}
                        className={`w-[3px] rounded-full transition-all duration-100 ${isActive
                            ? i < 2 ? 'bg-emerald-400' : i < 4 ? 'bg-amber-400' : 'bg-red-400'
                            : 'bg-zinc-800'
                            }`}
                        style={{ height: `${4 + i * 3}px` }}
                    />
                );
            })}
        </div>
    );
}

/* ──────────────────────────────────────────────────
   Typing Indicator (AI thinking animation)
   ────────────────────────────────────────────────── */
function TypingIndicator() {
    return (
        <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-400 border border-violet-500/20">
                <BrainCircuit className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 border border-violet-500/10 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────────
   Network Quality Indicator
   ────────────────────────────────────────────────── */
function NetworkIndicator({ quality }: { quality: 'excellent' | 'good' | 'poor' }) {
    const colors = { excellent: 'bg-emerald-400', good: 'bg-amber-400', poor: 'bg-red-400' };
    const heights = [4, 8, 12];
    return (
        <div className="flex items-end gap-[2px] h-3">
            {heights.map((h, i) => (
                <div
                    key={i}
                    className={`w-[3px] rounded-sm ${(quality === 'excellent' || (quality === 'good' && i < 2) || (quality === 'poor' && i < 1))
                        ? colors[quality] : 'bg-zinc-700'
                        }`}
                    style={{ height: `${h}px` }}
                />
            ))}
        </div>
    );
}

/* ──────────────────────────────────────────────────
   Countdown Timer (enhanced)
   ────────────────────────────────────────────────── */
function CountdownTimer({ durationMinutes, onExpire }: { durationMinutes: number, onExpire: () => void }) {
    const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

    useEffect(() => {
        if (timeLeft <= 0) { onExpire(); return; }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const isCritical = timeLeft < 300;
    const isWarning = timeLeft < 600 && !isCritical;
    const progress = (timeLeft / (durationMinutes * 60)) * 100;

    return (
        <div className="flex items-center gap-3">
            <div className="w-24 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-gradient-to-r from-violet-500 to-cyan-500'}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className={`font-mono text-lg font-black flex items-center gap-1.5 ${isCritical ? 'text-red-500 animate-pulse' : isWarning ? 'text-amber-400' : 'bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent'}`}>
                <Timer className={`w-4 h-4 ${isCritical ? 'text-red-500' : isWarning ? 'text-amber-400' : 'text-violet-400'}`} />
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────────
   Score Circle (Completion screen)
   ────────────────────────────────────────────────── */
function ScoreCircle({ score, label, color }: { score: number, label: string, color: string }) {
    const [animatedScore, setAnimatedScore] = useState(0);
    useEffect(() => {
        const timer = setTimeout(() => setAnimatedScore(score), 300);
        return () => clearTimeout(timer);
    }, [score]);

    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (animatedScore / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                    <circle
                        cx="50" cy="50" r="40" fill="none"
                        stroke={color} strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="transition-all duration-[1.5s] ease-out"
                        style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-black text-slate-900 dark:text-white">{Math.round(animatedScore)}</span>
                </div>
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-500">{label}</span>
        </div>
    );
}


/* ══════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════ */
export default function LiveInterviewPage() {
    const params = useParams();
    const router = useRouter();
    const sessionId = params.id as string;

    // Core state
    const [session, setSession] = useState<any>(null);
    const [problem, setProblem] = useState<any>(null);
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("Setup");
    const [submitting, setSubmitting] = useState(false);

    // Chat state
    const [aiMessages, setAiMessages] = useState<{ role: 'ai' | 'user', text: string, time: string }[]>([]);
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Interview state
    const [interviewStatus, setInterviewStatus] = useState<'initializing' | 'listening' | 'analyzing' | 'asking' | 'idle'>('initializing');
    const [networkQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');

    // Video / Audio state
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [cameraOn, setCameraOn] = useState(false);
    const [micOn, setMicOn] = useState(false);
    const [micLevel, setMicLevel] = useState(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animFrameRef = useRef<number>(0);

    // Editor state
    const [editorTab, setEditorTab] = useState<'solution' | 'notes' | 'tests'>('solution');
    const [notes, setNotes] = useState("// Approach notes...\n// 1. \n// 2. ");
    const [consoleOutput, setConsoleOutput] = useState<{ type: 'info' | 'success' | 'error', text: string }[]>([
        { type: 'info', text: '> Ready to execute...' }
    ]);
    const [consoleOpen, setConsoleOpen] = useState(true);

    // Completion state
    const [finalScore, setFinalScore] = useState<any>(null);

    const getTimestamp = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    /* ── Camera & Mic ── */
    const startMedia = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(mediaStream);
            if (videoRef.current) videoRef.current.srcObject = mediaStream;
            setCameraOn(true);
            setMicOn(true);

            // Mic level analyzer
            const audioCtx = new AudioContext();
            const source = audioCtx.createMediaStreamSource(mediaStream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            audioContextRef.current = audioCtx;
            analyserRef.current = analyser;

            const updateLevel = () => {
                const data = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(data);
                const avg = data.reduce((a, b) => a + b) / data.length;
                setMicLevel(avg / 255);
                animFrameRef.current = requestAnimationFrame(updateLevel);
            };
            updateLevel();
        } catch (err) {
            console.error("Media error:", err);
        }
    };

    const toggleCamera = () => {
        if (stream) {
            stream.getVideoTracks().forEach(t => t.enabled = !t.enabled);
            setCameraOn(prev => !prev);
        }
    };

    const toggleMic = () => {
        if (stream) {
            stream.getAudioTracks().forEach(t => t.enabled = !t.enabled);
            setMicOn(prev => !prev);
        }
    };

    useEffect(() => {
        return () => {
            if (stream) stream.getTracks().forEach(t => t.stop());
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, [stream]);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [aiMessages, isAiTyping]);

    // Start camera when going live
    useEffect(() => {
        if (status === 'Live' && !stream) startMedia();
    }, [status]);

    /* ── Session Logic ── */
    useEffect(() => {
        if (sessionId) fetchSession();
    }, [sessionId]);

    const fetchSession = async () => {
        try {
            const data = await interviewApi.getSession(sessionId);
            setSession(data);
            setProblem(data.problemId);
            setCode(data.problemId?.starterCode?.javascript || "// Write your solution here\n");
            if (data.status === 'Completed') {
                setStatus('Completed');
            } else if (data.status === 'Setup') {
                startSession();
            } else {
                setStatus('Live');
            }
        } catch (err) {
            console.error("Error fetching session", err);
        } finally {
            setLoading(false);
        }
    };

    const startSession = async () => {
        try {
            await interviewApi.startSession(sessionId);
            setStatus('Live');
            setInterviewStatus('asking');

            // Simulate AI greeting with typing delay
            setIsAiTyping(true);
            setTimeout(() => {
                setIsAiTyping(false);
                setInterviewStatus('listening');
                setAiMessages([{
                    role: 'ai',
                    text: "Hello! I'm Dr. AI, your interviewer today. Welcome to this coding session. You'll have 45 minutes to solve the problem. Feel free to think out loud — I'm here to help if you get stuck. Let's begin!",
                    time: getTimestamp()
                }]);
            }, 2000);
        } catch (err) {
            console.error("Error starting session", err);
        }
    };

    const handleSubmit = async () => {
        if (!confirm("Are you ready to submit your final solution? This will finalize your performance and end the interview session.")) return;
        
        setSubmitting(true);
        setInterviewStatus('analyzing');
        
        try {
            // 1. Release Hardware Tracks (Turn off Camera/Mic immediately)
            if (stream) {
                stream.getTracks().forEach(track => {
                    track.stop();
                    console.log(`Stopped track: ${track.kind}`);
                });
                setStream(null);
                setCameraOn(false);
                setMicOn(false);
            }

            // 2. Cleanup Audio Context
            if (audioContextRef.current) {
                audioContextRef.current.close().catch(console.error);
                audioContextRef.current = null;
            }

            // 3. Submit Session Data
            const res = await interviewApi.submitSession({ sessionId, code, language: 'javascript' });
            setFinalScore(res.score);

            // 4. Polished "Analyzing" Experience
            // Give user a brief moment to see the "Analyzing" state for a professional feel
            setTimeout(() => {
                setStatus('Completed');
                setSubmitting(false);
            }, 1800);

        } catch (err) {
            console.error("Submission failed:", err);
            setConsoleOutput(prev => [...prev, { type: 'error', text: '✗ Submission failed. Please try again.' }]);
            setSubmitting(false);
            setInterviewStatus('idle');
        }
    };

    const handleRunCode = async () => {
        setConsoleOutput(prev => [...prev, { type: 'info', text: '▶ Running code...' }]);
        // Simulate run
        setTimeout(() => {
            setConsoleOutput(prev => [
                ...prev,
                { type: 'success', text: '✓ Test 1 passed: [1,2,3] → 6' },
                { type: 'success', text: '✓ Test 2 passed: [0] → 0' },
                { type: 'error', text: '✗ Test 3 failed: Expected 15, got 10' },
                { type: 'info', text: '  Passed: 2/3 | Time: 12ms' },
            ]);
        }, 800);

        // AI observation
        setTimeout(() => {
            setIsAiTyping(true);
            setInterviewStatus('analyzing');
            setTimeout(() => {
                setIsAiTyping(false);
                setInterviewStatus('listening');
                setAiMessages(prev => [...prev, {
                    role: 'ai',
                    text: "I see test 3 is failing. Can you walk me through your logic for handling larger inputs? Think about edge cases.",
                    time: getTimestamp()
                }]);
            }, 1500);
        }, 1200);
    };

    const sendMessage = async () => {
        if (!chatInput.trim()) return;
        const text = chatInput;
        setChatInput("");
        setAiMessages(prev => [...prev, { role: 'user', text, time: getTimestamp() }]);

        setIsAiTyping(true);
        setInterviewStatus('analyzing');
        try {
            const res = await codingApi.getHint({
                problem_title: problem?.title || "Coding Interview",
                problem_description: problem?.description || "",
                user_code: code,
                language: 'javascript'
            });
            setIsAiTyping(false);
            setInterviewStatus('listening');
            setAiMessages(prev => [...prev, {
                role: 'ai',
                text: res.hint || res.message || "That's a good question. Try thinking about it step by step.",
                time: getTimestamp()
            }]);
        } catch {
            setIsAiTyping(false);
            setInterviewStatus('listening');
            setAiMessages(prev => [...prev, {
                role: 'ai',
                text: "I'm having trouble connecting. Try checking your logic manually and explain your thought process.",
                time: getTimestamp()
            }]);
        }
    };

    /* ──────── LOADING STATE ──────── */
    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#050505] relative overflow-hidden aurora-glow">
            <div className="absolute top-20 left-10 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.15)]">
                    <Loader2 className="animate-spin w-8 h-8 text-violet-400" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Preparing Interview Room...</span>
            </div>
        </div>
    );

    /* ──────── COMPLETED STATE ──────── */
    if (status === 'Completed') {
        const score = finalScore || { total: 78, communication: 82, problemSolving: 75, codeQuality: 88, timeManagement: 70 };
        return (
            <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#050505] text-slate-900 dark:text-white relative overflow-y-auto py-12 px-6 aurora-glow font-sans">
                <div className="absolute top-20 left-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
                <div className="absolute bottom-20 right-20 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />
                
                <div className="relative z-10 max-w-4xl w-full mx-auto space-y-8">
                    {/* Header Section */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(16,185,129,0.15)] mb-6">
                            <Trophy className="w-12 h-12 text-emerald-400" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-tight">
                            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">Interview Mastery Report</span>
                        </h1>
                        <p className="text-slate-500 dark:text-zinc-400 font-medium max-w-xl mx-auto">Comprehensive analysis of your performance during the session.</p>
                    </motion.div>
 
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Summary Card */}
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-1 space-y-6">
                            <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.06] rounded-3xl p-8 text-center ring-1 ring-white/5 shadow-2xl shadow-emerald-500/5">
                                <ScoreCircle score={Math.round(score.total)} label="Mastery Score" color="#10b981" />
                                <div className="mt-6 space-y-2">
                                    <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest inline-block">
                                        Qualified for Next Round
                                    </div>
                                    <p className="text-xs text-zinc-500 py-2">Ranked top 15% of candidates this week</p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-white/[0.06] rounded-3xl p-6 shadow-xl shadow-violet-500/5">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 border-b border-white/5 pb-4 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3 text-violet-400" /> Growth Radar
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { label: "Technical Logic", val: 85, color: "bg-cyan-400" },
                                        { label: "Soft Skills", val: 92, color: "bg-violet-400" },
                                        { label: "Confidence", val: 78, color: "bg-amber-400" }
                                    ].map(item => (
                                        <div key={item.label} className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                                <span>{item.label}</span>
                                                <span className="text-zinc-300">{item.val}%</span>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }} 
                                                    animate={{ width: `${item.val}%` }} 
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className={`h-full ${item.color} rounded-full`} 
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Detailed Analysis */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.06] rounded-3xl p-8 shadow-2xl">
                                <div className="flex items-center gap-2 mb-6">
                                    <Sparkles className="w-4 h-4 text-violet-400" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">Deep AI Evaluation</span>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">AI Narrative Feedback</h4>
                                        <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed italic border-l-4 border-violet-500/40 pl-5 py-2 bg-violet-500/5 rounded-r-xl">
                                            "{finalScore?.feedback || "You demonstrated excellent command over the technical requirements. Your explanation of data structures was precise, and you handled edge cases effectively. To improve, focus on articulating the trade-offs between different time-complexity approaches more proactively."}"
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                        <div className="p-5 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-emerald-400" /> Core Strengths
                                            </div>
                                            <ul className="text-xs space-y-3">
                                                <li className="flex items-start gap-3 text-slate-500 dark:text-zinc-400"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> Logical Structuring & Pattern Selection</li>
                                                <li className="flex items-start gap-3 text-slate-500 dark:text-zinc-400"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> Clean Code Readability & Naming Conventions</li>
                                            </ul>
                                        </div>
                                        <div className="p-5 rounded-2xl bg-amber-500/[0.03] border border-amber-500/10">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-amber-400" /> Development Goals
                                            </div>
                                            <ul className="text-xs space-y-3">
                                                <li className="flex items-start gap-3 text-slate-500 dark:text-zinc-400"><AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" /> Articulating Performance Complexity Trade-offs</li>
                                                <li className="flex items-start gap-3 text-slate-500 dark:text-zinc-400"><AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" /> Edge Case Handling in Multi-threaded Scenarios</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section breakdown */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: "Communication", score: score.communication, color: "text-sky-400", bg: "bg-sky-500" },
                                    { label: "Problem Solving", score: score.problemSolving, color: "text-amber-400", bg: "bg-amber-500" },
                                    { label: "Code Quality", score: score.codeQuality, color: "text-emerald-400", bg: "bg-emerald-500" },
                                    { label: "Time Mgmt", score: score.timeManagement, color: "text-rose-400", bg: "bg-rose-500" }
                                ].map(item => (
                                    <div key={item.label} className="bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-white/[0.06] rounded-2xl p-4 text-center group hover:scale-[1.05] transition-transform duration-300">
                                        <div className={`text-2xl font-black ${item.color} mb-1`}>{item.score}</div>
                                        <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">{item.label}</div>
                                        <div className="mt-2 h-0.5 w-8 mx-auto rounded-full bg-zinc-800">
                                            <div className={`h-full ${item.bg} rounded-full`} style={{ width: '60%' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-4">
                                <Button
                                    onClick={() => router.push('/dashboard/enhance-skill-interview')}
                                    variant="outline"
                                    className="flex-1 h-14 border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-zinc-400 hover:border-violet-500/20 hover:text-violet-400 font-bold uppercase tracking-widest transition-all rounded-2xl"
                                >
                                    Start New Session
                                </Button>
                                <Button
                                    onClick={() => {
                                        router.push('/dashboard/enhance-skill-interview');
                                        sessionStorage.removeItem('interview_return_path');
                                    }}
                                    className="flex-1 h-14 bg-gradient-to-r from-violet-600 to-cyan-600 text-slate-900 dark:text-white font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] shadow-violet-500/20 transition-all border-0 rounded-2xl"
                                >
                                    Finish & Exit <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        );
    }

    /* ──────── LIVE INTERVIEW ──────── */
    const statusConfig = {
        initializing: { label: 'Initializing', color: 'text-amber-400', dot: 'bg-amber-400' },
        listening: { label: 'Listening', color: 'text-emerald-400', dot: 'bg-emerald-400' },
        analyzing: { label: 'Analyzing', color: 'text-violet-400', dot: 'bg-violet-400' },
        asking: { label: 'Speaking', color: 'text-cyan-400', dot: 'bg-cyan-400' },
        idle: { label: 'Idle', color: 'text-slate-500 dark:text-zinc-400', dot: 'bg-zinc-400' },
    };
    const currentStatus = statusConfig[interviewStatus];

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white overflow-hidden relative">
            {/* ═══ Aurora & Orbs ═══ */}
            <div className="absolute inset-0 aurora-glow pointer-events-none" />
            <div className="absolute top-0 left-0 w-64 h-64 bg-violet-500/3 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-cyan-500/3 rounded-full blur-[120px] pointer-events-none" />

            {/* ═══════════ TOP HUD BAR ═══════════ */}
            <div className="h-14 border-b border-white/[0.06] flex items-center justify-between px-5 bg-white dark:bg-zinc-900/60 backdrop-blur-2xl relative z-20 shrink-0">
                <div className="flex items-center gap-4">
                    {/* LIVE Badge */}
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-400">Live</span>
                    </div>

                    {/* Session Info */}
                    <div className="hidden md:flex items-center gap-2 text-zinc-600">
                        <Shield className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase tracking-[0.15em]">Session {sessionId?.slice(0, 8)}</span>
                    </div>

                    {/* AI Status */}
                    <div className="flex items-center gap-2 bg-white/[0.03] rounded-full px-3 py-1 border border-white/[0.04]">
                        <div className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot} animate-pulse`} />
                        <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${currentStatus.color}`}>
                            AI: {currentStatus.label}
                        </span>
                    </div>
                </div>

                {/* Center: Timer */}
                <div className="absolute left-1/2 -translate-x-1/2">
                    {status === 'Live' && <CountdownTimer durationMinutes={session?.durationMinutes || 45} onExpire={handleSubmit} />}
                </div>

                {/* Right: Network + End */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <NetworkIndicator quality={networkQuality} />
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-600">Stable</span>
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        size="sm"
                        className="h-8 bg-gradient-to-r from-red-600 to-rose-600 text-slate-900 dark:text-white font-black text-[9px] uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_25px_rgba(239,68,68,0.3)] border-0 transition-all"
                    >
                        {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : "End Interview"}
                    </Button>
                </div>
            </div>

            {/* ═══════════ MAIN CONTENT ═══════════ */}
            <div className="flex-1 flex overflow-hidden relative z-10">

                {/* ─────── LEFT PANEL: Interview + Chat ─────── */}
                <div className="w-[380px] border-r border-white/[0.06] flex flex-col shrink-0">

                    {/* AI Interviewer Panel */}
                    <div className="p-4 border-b border-white/[0.06] bg-white dark:bg-zinc-900/30 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            {/* AI Avatar */}
                            <div className="relative">
                                <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.2)] ${interviewStatus === 'asking' ? 'animate-pulse' : ''}`}>
                                    <BrainCircuit className="w-7 h-7 text-slate-900 dark:text-white" />
                                </div>
                                {/* Speaking ring */}
                                {interviewStatus === 'asking' && (
                                    <div className="absolute -inset-1 rounded-full border-2 border-violet-400/40 animate-ping" />
                                )}
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-300 dark:border-[#050505] shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                            </div>

                            <div className="flex-1">
                                <div className="font-black text-sm tracking-tight">Dr. AI Interviewer</div>
                                <div className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-500 flex items-center gap-2 mt-0.5">
                                    <span>Senior Engineer</span>
                                    <span className="text-zinc-700">•</span>
                                    <span className={currentStatus.color}>{currentStatus.label}</span>
                                </div>
                            </div>

                            <AudioWaveform active={interviewStatus === 'asking' || isAiTyping} />
                        </div>
                    </div>

                    {/* Student Video Feed */}
                    <div className="relative bg-white dark:bg-black/60 border-b border-white/[0.06]">
                        <div className="aspect-[16/7] overflow-hidden">
                            {cameraOn && stream ? (
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white dark:bg-zinc-900/60">
                                    <div className="text-center space-y-2">
                                        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto border border-white/[0.06]">
                                            <User className="w-6 h-6 text-zinc-600" />
                                        </div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-600">Camera Off</p>
                                    </div>
                                </div>
                            )}

                            {/* REC indicator */}
                            {cameraOn && (
                                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white dark:bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1 border border-red-500/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_4px_rgba(239,68,68,0.6)]" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-red-400">Rec</span>
                                </div>
                            )}

                            {/* Mic level */}
                            {micOn && (
                                <div className="absolute top-3 right-3 bg-white dark:bg-black/60 backdrop-blur-md rounded-full p-1.5 border border-white/[0.06]">
                                    <MicLevelMeter level={micLevel} />
                                </div>
                            )}
                        </div>

                        {/* Media Controls */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                            <button
                                onClick={cameraOn ? toggleCamera : startMedia}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${cameraOn
                                    ? 'bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-white/20'
                                    : 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
                                    }`}
                            >
                                {cameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={micOn ? toggleMic : startMedia}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${micOn
                                    ? 'bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-white/20'
                                    : 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
                                    }`}
                            >
                                {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {aiMessages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai'
                                    ? 'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-400 border border-violet-500/20'
                                    : 'bg-zinc-800/80 text-slate-500 dark:text-zinc-400 border border-white/[0.06]'
                                    }`}>
                                    {msg.role === 'ai' ? <BrainCircuit className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                </div>
                                <div className="flex flex-col gap-1 max-w-[80%]">
                                    <div className={`p-3 rounded-xl text-sm ${msg.role === 'ai'
                                        ? 'bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 border border-violet-500/10 text-slate-600 dark:text-zinc-300'
                                        : 'bg-cyan-500/5 border border-cyan-500/10 text-cyan-100'
                                        }`}>
                                        {msg.text}
                                    </div>
                                    <span className={`text-[8px] font-black uppercase tracking-widest text-zinc-700 ${msg.role === 'user' ? 'text-right' : ''}`}>
                                        {msg.time}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isAiTyping && <TypingIndicator />}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-3 border-t border-white/[0.06] bg-white dark:bg-zinc-900/30 backdrop-blur-xl flex gap-2">
                        <input
                            className="bg-white dark:bg-black/40 border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm flex-1 focus:outline-none focus:border-violet-500/30 transition-colors placeholder:text-zinc-600"
                            placeholder="Explain your approach..."
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        />
                        <Button
                            size="icon"
                            onClick={sendMessage}
                            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-slate-900 dark:text-white border-0 shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all w-10 h-10 rounded-xl"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* ─────── CENTER: Problem Description ─────── */}
                <div className="w-[350px] border-r border-white/[0.06] flex flex-col shrink-0 bg-white dark:bg-zinc-900/10 backdrop-blur-xl">
                    <div className="p-4 border-b border-white/[0.06] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-violet-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Problem</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-5">
                        <div>
                            <h2 className="text-xl font-black tracking-tight mb-3">{problem?.title}</h2>
                            <div className="flex gap-2 mb-4">
                                <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 bg-emerald-500/5 text-[9px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.08)]">
                                    {problem?.difficulty}
                                </Badge>
                                <Badge variant="outline" className="border-violet-500/20 text-violet-400 bg-violet-500/5 text-[9px] font-black uppercase tracking-widest">
                                    {problem?.category}
                                </Badge>
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none text-slate-500 dark:text-zinc-400 text-sm leading-relaxed">
                            <p>{problem?.description}</p>
                        </div>

                        {/* Examples */}
                        <div className="space-y-3">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Examples</span>
                            {problem?.testCases?.slice(0, 2).map((tc: any, i: number) => (
                                <div key={i} className="bg-white dark:bg-black/40 rounded-xl p-3 border border-white/[0.06]">
                                    <div className="text-[9px] font-black uppercase tracking-widest text-violet-400/60 mb-2">Example {i + 1}</div>
                                    <div className="space-y-1.5 font-mono text-xs">
                                        <div><span className="text-zinc-600">Input:</span> <span className="text-slate-600 dark:text-zinc-300">{tc.input || "N/A"}</span></div>
                                        <div><span className="text-zinc-600">Output:</span> <span className="text-emerald-400">{tc.expectedOutput || "N/A"}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Constraints */}
                        {problem?.constraints && (
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 block mb-2">Constraints</span>
                                <ul className="space-y-1 text-xs text-zinc-500">
                                    {problem.constraints.map((c: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <div className="w-1 h-1 rounded-full bg-violet-500/60 mt-1.5 shrink-0" />
                                            {c}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─────── RIGHT: Code Editor ─────── */}
                <div className="flex-1 flex flex-col bg-slate-50 dark:bg-[#0a0a0a]">
                    {/* Editor Tabs + Actions */}
                    <div className="h-11 border-b border-white/[0.06] flex items-center justify-between px-3 bg-white dark:bg-zinc-900/40 backdrop-blur-xl">
                        <div className="flex items-center gap-1">
                            {([
                                { key: 'solution', icon: Code2, label: 'Solution' },
                                { key: 'notes', icon: FileText, label: 'Notes' },
                                { key: 'tests', icon: TestTube, label: 'Tests' },
                            ] as const).map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setEditorTab(tab.key)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${editorTab === tab.key
                                        ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                                        : 'text-zinc-600 hover:text-slate-900 dark:text-zinc-400 border border-transparent'
                                        }`}
                                >
                                    <tab.icon className="w-3 h-3" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                onClick={handleRunCode}
                                className="h-7 bg-gradient-to-r from-cyan-600 to-blue-600 text-slate-900 dark:text-white font-black text-[9px] uppercase tracking-widest shadow-[0_0_12px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] border-0 transition-all"
                            >
                                <Play className="w-3 h-3 mr-1.5" /> Run
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="h-7 bg-gradient-to-r from-emerald-600 to-green-600 text-slate-900 dark:text-white font-black text-[9px] uppercase tracking-widest shadow-[0_0_12px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] border-0 transition-all"
                            >
                                {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <>
                                    <Send className="w-3 h-3 mr-1.5" /> Submit
                                </>}
                            </Button>
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="flex-1">
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            theme="vs-dark"
                            value={editorTab === 'solution' ? code : editorTab === 'notes' ? notes : `// Test Cases\nconsole.log(solution([1,2,3])); // Expected: 6\nconsole.log(solution([0])); // Expected: 0`}
                            onChange={(val) => {
                                if (editorTab === 'solution') setCode(val || "");
                                if (editorTab === 'notes') setNotes(val || "");
                            }}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                padding: { top: 16 },
                                scrollBeyondLastLine: false,
                                lineHeight: 22,
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                renderLineHighlight: 'all',
                                cursorBlinking: 'smooth',
                                smoothScrolling: true,
                            }}
                        />
                    </div>

                    {/* Console Output (Collapsible) */}
                    <div className={`border-t border-white/[0.06] bg-white dark:bg-black/60 backdrop-blur-xl flex flex-col transition-all ${consoleOpen ? 'h-40' : 'h-9'}`}>
                        <button
                            onClick={() => setConsoleOpen(prev => !prev)}
                            className="h-9 px-4 flex items-center justify-between shrink-0 hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Console</span>
                                {consoleOutput.some(o => o.type === 'error') && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                )}
                            </div>
                            {consoleOpen ? <ChevronDown className="w-3 h-3 text-zinc-600" /> : <ChevronUp className="w-3 h-3 text-zinc-600" />}
                        </button>
                        {consoleOpen && (
                            <div className="flex-1 overflow-y-auto px-4 pb-3 font-mono text-xs space-y-0.5">
                                {consoleOutput.map((line, i) => (
                                    <div key={i} className={
                                        line.type === 'success' ? 'text-emerald-400' :
                                            line.type === 'error' ? 'text-red-400' :
                                                'text-zinc-500'
                                    }>
                                        {line.text}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
