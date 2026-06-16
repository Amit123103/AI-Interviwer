"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera, Plus, FolderOpen, Play, CheckCircle2,
    ChevronRight, ChevronLeft, Circle, Square,
    Download, RefreshCw, Edit2, Trash2,
    Sliders, Type, Film, Wand2, Type as TypeIcon, Save, ArrowLeft,
    Clock, AlignLeft, Sparkles, MonitorPlay, FileVideo
} from 'lucide-react';
import Link from 'next/link';

// === CONSTANTS & TYPES ===
type ViewState = 'menu' | 'create' | 'library' | 'editor';
type CreateStep = 1 | 2 | 3;

interface SavedVideo {
    id: string;
    title: string;
    date: string;
    duration: number; // in seconds
    blob: Blob;
    url: string;
    filter: string;
    overlay: string;
    textName?: string;
    textRole?: string;
}

const THEME = {
    bg: '#08080f',
    accent: '#6d5fd8', // electric indigo/violet
    highlight: '#22d3ee', // cyan
};

const FILTERS = [
    { name: 'Original', style: 'none' },
    { name: 'Vivid', style: 'saturate(150%) contrast(110%)' },
    { name: 'Cinema', style: 'contrast(120%) brightness(90%) sepia(20%)' },
    { name: 'Cool', style: 'hue-rotate(180deg) saturate(120%)' },
    { name: 'Warm', style: 'sepia(50%) saturate(150%)' },
    { name: 'B&W', style: 'grayscale(100%) contrast(120%)' },
    { name: 'Portrait', style: 'brightness(110%) contrast(110%) blur(0.5px)' },
    { name: 'Dramatic', style: 'contrast(150%) brightness(80%) grayscale(30%)' }
];

const OVERLAYS = [
    { name: 'None', class: '' },
    { name: 'Pro Frame', class: 'border-8 border-slate-200 dark:border-white/10 m-4 rounded-xl' },
    { name: 'Modern', class: 'border-l-8 border-cyan-400 pl-4 py-8 bg-gradient-to-r from-black/50 to-transparent absolute bottom-0 left-0 w-full' },
    { name: 'Elegant', class: 'border-y-2 border-white/50 py-12 m-8 absolute inset-0' },
    { name: 'Minimal', class: 'border border-slate-300 dark:border-white/20 m-2 rounded absolute inset-0' }
];

export default function VideoCVModule() {
    const [currentView, setCurrentView] = useState<ViewState>('menu');
    const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);

    // Create Flow State
    const [createStep, setCreateStep] = useState<CreateStep>(1);
    const [script, setScript] = useState("");
    const [useTeleprompter, setUseTeleprompter] = useState(true);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
    const [videoTitle, setVideoTitle] = useState("");

    // Editor State
    const [editingVideo, setEditingVideo] = useState<SavedVideo | null>(null);

    // Global Font Injection
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@600;700;800&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => { document.head.removeChild(link); }
    }, []);

    // Helper: format time
    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Screens Routing
    const navigateTo = (view: ViewState) => {
        setCurrentView(view);
        if (view === 'create') setCreateStep(1);
    };

    // ==========================================
    // SCREEN 1: MENU
    // ==========================================
    const renderMenu = () => (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="max-w-6xl mx-auto px-6 py-12 md:py-24"
        >
            <div className="mb-12">
                <Link href="/dashboard" className="inline-flex items-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white transition-colors mb-6 text-sm font-medium">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>
                <h1 className="text-4xl md:text-5xl font-[Syne] font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
                    Video <span style={{ color: THEME.accent }}>CV</span> Studio
                </h1>
                <p className="text-slate-500 dark:text-zinc-400 max-w-xl text-lg font-[DM Sans]">
                    Create, manage, and perfect your professional video pitches. Stand out to recruiters with a polished visual presentation.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Option A */}
                <div
                    onClick={() => navigateTo('create')}
                    className="p-8 rounded-3xl bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/10 hover:border-[#6d5fd8]/50 hover:shadow-[0_0_40px_rgba(109,95,216,0.15)] transition-all cursor-pointer group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#6d5fd8]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-[#6d5fd8]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                            <Camera className="w-8 h-8 text-[#6d5fd8]" />
                            <Plus className="w-4 h-4 text-[#6d5fd8] absolute bottom-4 right-4 bg-white dark:bg-[#111118] rounded-full" />
                        </div>
                        <h2 className="text-2xl font-[Syne] font-bold text-slate-900 dark:text-white mb-3">Create Video CV</h2>
                        <p className="text-slate-500 dark:text-zinc-400 font-[DM Sans] mb-8 leading-relaxed">
                            Record a new professional video CV with our built-in teleprompter, real-time filters, and dynamic overlays.
                        </p>
                        <button className="bg-[#6d5fd8] text-slate-900 dark:text-white px-6 py-3 rounded-xl font-bold font-[DM Sans] flex items-center group-hover:bg-[#5a4ec2] transition-colors">
                            Start Creating <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Option B */}
                <div
                    onClick={() => navigateTo('library')}
                    className="p-8 rounded-3xl bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/10 hover:border-[#22d3ee]/50 hover:shadow-[0_0_40px_rgba(34,211,238,0.15)] transition-all cursor-pointer group relative overflow-hidden flex flex-col"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#22d3ee]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-[#22d3ee]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                <FolderOpen className="w-8 h-8 text-[#22d3ee]" />
                            </div>
                            <span className="bg-[#22d3ee]/10 text-[#22d3ee] px-4 py-1.5 rounded-full text-sm font-bold font-[Syne]">
                                {savedVideos.length} Saved
                            </span>
                        </div>
                        <h2 className="text-2xl font-[Syne] font-bold text-slate-900 dark:text-white mb-3">My Video CVs</h2>
                        <p className="text-slate-500 dark:text-zinc-400 font-[DM Sans] mb-8 leading-relaxed">
                            View, edit, download and manage your saved Video CVs. Perfect your pitch before you send it out.
                        </p>
                        <button className="mt-auto bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 px-6 py-3 rounded-xl font-bold font-[DM Sans] flex items-center group-hover:bg-white/10 transition-colors self-start">
                            View My CVs <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    // ==========================================
    // SCREEN 2: CREATE FLOW
    // ==========================================
    const renderCreateFlow = () => {
        return (
            <div className="min-h-screen flex flex-col">
                {/* Header / Stepper */}
                <div className="h-20 border-b border-slate-200 dark:border-white/10 flex items-center px-6 shrink-0 bg-white dark:bg-[#08080f]/90 backdrop-blur-md sticky top-0 z-50">
                    <button onClick={() => navigateTo('menu')} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 dark:text-zinc-400 transition-colors mr-6">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2 max-w-md w-full mx-auto">
                        {[1, 2, 3].map((step) => (
                            <React.Fragment key={step}>
                                <div className={`flex flex-col items-center relative ${createStep >= step ? 'text-[#6d5fd8]' : 'text-zinc-600'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${createStep === step ? 'bg-[#6d5fd8] text-slate-900 dark:text-white ring-4 ring-[#6d5fd8]/20' :
                                        createStep > step ? 'bg-[#6d5fd8]/20 text-[#6d5fd8]' : 'bg-transparent border-2 border-zinc-700'
                                        }`}>
                                        {createStep > step ? <CheckCircle2 className="w-5 h-5" /> : step}
                                    </div>
                                    <span className="absolute top-10 text-[10px] font-bold font-[Syne] uppercase tracking-wider whitespace-nowrap">
                                        {step === 1 ? 'Script' : step === 2 ? 'Record' : 'Preview'}
                                    </span>
                                </div>
                                {step < 3 && (
                                    <div className="flex-1 h-0.5 mx-2 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#6d5fd8] transition-all duration-500"
                                            style={{ width: createStep > step ? '100%' : '0%' }}
                                        />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Body Transitions */}
                <div className="flex-1 flex overflow-hidden">
                    <AnimatePresence mode="wait">
                        {createStep === 1 && <CreateStep1 key="s1" />}
                        {createStep === 2 && <CreateStep2 key="s2" />}
                        {createStep === 3 && <CreateStep3 key="s3" />}
                    </AnimatePresence>
                </div>
            </div>
        );
    };

    const CreateStep1 = () => {
        const wordCount = script.trim() ? script.trim().split(/\s+/).length : 0;
        const estTime = Math.ceil((wordCount / 150) * 60); // 150 wpm

        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col lg:flex-row p-6 gap-6 overflow-y-auto"
            >
                {/* Left Panel: Script */}
                <div className="flex-[2] flex flex-col bg-white dark:bg-[#111118] border border-slate-100 dark:border-white/5 rounded-3xl p-6 shadow-xl relative">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#6d5fd8]/10 flex items-center justify-center">
                                <AlignLeft className="w-5 h-5 text-[#6d5fd8]" />
                            </div>
                            <h2 className="text-xl font-[Syne] font-bold">Write Your Script</h2>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded-xl transition-colors">
                            <span className="text-sm font-[DM Sans] text-slate-500 dark:text-zinc-400">Enable Teleprompter</span>
                            <div className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${useTeleprompter ? 'bg-[#22d3ee]' : 'bg-zinc-700'}`}>
                                <motion.div
                                    className="w-4 h-4 bg-white rounded-full shadow-md"
                                    animate={{ x: useTeleprompter ? 24 : 0 }}
                                />
                            </div>
                        </label>
                    </div>

                    <textarea
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        placeholder="Hi! I'm Jane Doe, a passionate software engineer..."
                        className="flex-1 bg-transparent border-none resize-none text-xl md:text-2xl font-[DM Sans] text-slate-600 dark:text-zinc-300 placeholder:text-zinc-700 focus:ring-0 focus:outline-none custom-scrollbar leading-relaxed"
                    />

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-zinc-500 font-[DM Sans] text-sm">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1"><TypeIcon className="w-4 h-4" /> {wordCount} words</span>
                            <span className="flex items-center gap-1 text-yellow-500/80"><Clock className="w-4 h-4" /> ~{formatTime(estTime)}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${wordCount > 50 && wordCount < 300 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-slate-500 dark:text-zinc-400'
                            }`}>
                            Quality Score: {wordCount < 50 ? 'Too Short' : wordCount > 300 ? 'Too Long' : 'Optimal'}
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="bg-white dark:bg-[#111118] border border-slate-100 dark:border-white/5 rounded-3xl p-8 shadow-xl flex-1 flex flex-col justify-center items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-6">
                            <Sparkles className="w-8 h-8 text-yellow-500" />
                        </div>
                        <h3 className="text-xl font-[Syne] font-bold mb-4">Pro Script Tips</h3>
                        <div className="space-y-4 text-slate-500 dark:text-zinc-400 font-[DM Sans] text-sm text-left mx-auto max-w-sm">
                            <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] mt-1.5 shrink-0" /> Start strong with your name and core professional identity.</div>
                            <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] mt-1.5 shrink-0" /> Highlight 2-3 key technical or soft skills.</div>
                            <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] mt-1.5 shrink-0" /> Keep it concise (60-90 seconds is the sweet spot).</div>
                            <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] mt-1.5 shrink-0" /> Smile and maintain good energy!</div>
                        </div>
                    </div>

                    <button
                        onClick={() => setCreateStep(2)}
                        className="bg-[#6d5fd8] hover:bg-[#5a4ec2] text-slate-900 dark:text-white w-full py-5 rounded-3xl font-[Syne] font-bold text-lg shadow-[0_0_30px_rgba(109,95,216,0.2)] transition-all hover:scale-[1.02] flex items-center justify-center"
                    >
                        Next: Set Up Camera <ChevronRight className="w-5 h-5 ml-2" />
                    </button>
                </div>
            </motion.div>
        );
    };

    const CreateStep2 = () => {
        const videoRef = useRef<HTMLVideoElement>(null);
        const [isRecording, setIsRecording] = useState(false);
        const [countdown, setCountdown] = useState<number | null>(null);
        const [recordingTime, setRecordingTime] = useState(0);
        const [cameraError, setCameraError] = useState<string | null>(null);

        const [activeFilter, setActiveFilter] = useState(FILTERS[0].style);
        const [activeOverlay, setActiveOverlay] = useState('');

        const mediaRecorderRef = useRef<MediaRecorder | null>(null);
        const chunksRef = useRef<BlobPart[]>([]);
        const streamRef = useRef<MediaStream | null>(null);
        const timerRef = useRef<NodeJS.Timeout | null>(null);

        // Teleprompter state
        const words = script.trim().split(/\s+/).filter(Boolean);
        const [currentWordIndex, setCurrentWordIndex] = useState(0);

        // Init Camera
        useEffect(() => {
            const startCamera = async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true });
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                    setCameraError(null);
                } catch (err: any) {
                    console.error("Camera access denied", err);
                    setCameraError(err.message || "Camera access is required to use this feature.");
                }
            };
            startCamera();

            return () => {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
            };
        }, []);

        const startRecording = () => {
            if (!streamRef.current) return;
            setCountdown(3);
        };

        const stopRecording = () => {
            if (mediaRecorderRef.current && isRecording) {
                mediaRecorderRef.current.stop();
                setIsRecording(false);
                if (timerRef.current) clearInterval(timerRef.current);
            }
        };

        // Handle Countdown Sequence
        useEffect(() => {
            if (countdown === null) return;
            if (countdown > 0) {
                const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                setCountdown(null);
                // Actually start recording
                if (!streamRef.current) return;
                chunksRef.current = [];
                const recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
                mediaRecorderRef.current = recorder;

                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) chunksRef.current.push(e.data);
                };

                recorder.onstop = () => {
                    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                    setRecordedBlob(blob);
                    setRecordedUrl(URL.createObjectURL(blob));
                    setVideoTitle(`My Video CV - ${new Date().toLocaleDateString()}`);
                    setCreateStep(3); // Auto advance
                };

                recorder.start();
                setIsRecording(true);
                setRecordingTime(0);
                setCurrentWordIndex(0);

                // Start Timers
                timerRef.current = setInterval(() => {
                    setRecordingTime(prev => prev + 1);
                    // Teleprompter advance logic: ~2.5 words per second
                    setCurrentWordIndex(prev => {
                        const next = prev + 2;
                        return next < words.length ? next : prev;
                    });
                }, 1000);
            }
        }, [countdown, words.length]);

        // Cleanup
        useEffect(() => {
            return () => {
                if (timerRef.current) clearInterval(timerRef.current);
            };
        }, []);

        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col lg:flex-row p-6 gap-6 h-full"
            >
                {/* Camera Panel */}
                <div className={`flex flex-col gap-4 transition-all duration-500 ${useTeleprompter ? 'lg:w-[60%]' : 'w-full max-w-5xl mx-auto'}`}>

                    <div className="relative flex-1 bg-slate-50 dark:bg-black rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl flex items-center justify-center">
                        {cameraError ? (
                            <div className="text-center p-8 z-20">
                                <MonitorPlay className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                                <h3 className="text-xl font-[Syne] font-bold text-slate-900 dark:text-white mb-2">Camera Access Denied</h3>
                                <p className="text-slate-500 dark:text-zinc-400 font-[DM Sans] mb-6">{cameraError}</p>
                                <button onClick={() => window.location.reload()} className="bg-[#6d5fd8] text-slate-900 dark:text-white px-6 py-2 rounded-xl text-sm font-bold font-[DM Sans] hover:bg-[#5a4ec2] transition-colors">
                                    Refresh Page & Allow Options
                                </button>
                            </div>
                        ) : (
                            <>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted // so user doesn't hear themselves echo
                                    className="absolute inset-0 w-full h-full object-cover transition-all"
                                    style={{
                                        transform: 'scaleX(-1)', // Mirror
                                        filter: activeFilter !== 'none' ? activeFilter : 'none'
                                    }}
                                />

                                {/* Overlay Frame */}
                                {activeOverlay && (
                                    <div className={`absolute inset-0 pointer-events-none ${activeOverlay}`} />
                                )}

                                {/* Top left recording badge */}
                                <AnimatePresence>
                                    {isRecording && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                            className="absolute top-4 left-4 bg-red-500/90 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 font-[DM Sans] text-sm font-bold tracking-wider z-20"
                                        >
                                            <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                                            REC {formatTime(recordingTime)}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Countdown Overlay */}
                                <AnimatePresence>
                                    {countdown !== null && (
                                        <motion.div
                                            initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 2, opacity: 0 }}
                                            className="absolute inset-0 bg-white dark:bg-black/50 z-30 flex items-center justify-center backdrop-blur-sm"
                                        >
                                            <span className="text-9xl font-[Syne] font-black text-slate-900 dark:text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                                                {countdown === 0 ? 'GO!' : countdown}
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                    </div>

                    {/* Camera Controls */}
                    <div className="h-24 bg-white dark:bg-[#111118] border border-slate-100 dark:border-white/5 rounded-3xl p-4 flex items-center justify-between shrink-0 shadow-xl overflow-x-auto custom-scrollbar">

                        {/* Record Button */}
                        <div className="shrink-0 mr-8">
                            {!isRecording ? (
                                <button
                                    onClick={startRecording}
                                    className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center hover:bg-red-500/30 transition-all border-2 border-red-500/50"
                                >
                                    <div className="w-6 h-6 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] hover:scale-110 transition-transform" />
                                </button>
                            ) : (
                                <button
                                    onClick={stopRecording}
                                    className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-all border-2 border-slate-300 dark:border-white/20"
                                >
                                    <div className="w-6 h-6 rounded-sm bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse" />
                                </button>
                            )}
                        </div>

                        {/* Filters strip */}
                        <div className="flex gap-2 mr-6 border-r border-slate-200 dark:border-white/10 pr-6 shrink-0 h-full items-center">
                            {FILTERS.map(f => (
                                <button
                                    key={f.name}
                                    onClick={() => setActiveFilter(f.style)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold font-[Syne] transition-all whitespace-nowrap ${activeFilter === f.style ? 'bg-[#6d5fd8] text-slate-900 dark:text-white' : 'bg-white/5 text-slate-500 dark:text-zinc-400 hover:bg-white/10 hover:text-slate-900 dark:text-white'
                                        }`}
                                >
                                    {f.name}
                                </button>
                            ))}
                        </div>

                        {/* Overlay strip */}
                        <div className="flex gap-2 shrink-0 h-full items-center">
                            {OVERLAYS.map(o => (
                                <button
                                    key={o.name}
                                    onClick={() => setActiveOverlay(o.class)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold font-[Syne] transition-all whitespace-nowrap ${activeOverlay === o.class ? 'bg-[#22d3ee]/20 text-[#22d3ee] border border-[#22d3ee]/50' : 'bg-white/5 text-slate-500 dark:text-zinc-400 hover:bg-white/10 hover:text-slate-900 dark:text-white border border-transparent'
                                        }`}
                                >
                                    {o.name} Frame
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Teleprompter Panel */}
                {useTeleprompter ? (
                    <div className="lg:w-[40%] bg-white dark:bg-[#111118] border border-slate-100 dark:border-white/5 rounded-3xl p-8 shadow-xl flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#111118] to-transparent z-10 pointer-events-none" />
                        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#111118] to-transparent z-10 pointer-events-none" />

                        <div className="text-zinc-500 text-xs font-bold tracking-widest uppercase mb-4 text-center">Teleprompter</div>

                        <div className="flex-1 overflow-hidden relative">
                            {words.length === 0 ? (
                                <div className="absolute inset-0 flex items-center justify-center text-zinc-600 font-[DM Sans] text-center px-8">
                                    Your script is empty. Go back to step 1 to write your pitch.
                                </div>
                            ) : (
                                <div
                                    className="absolute left-0 w-full transition-all duration-700 ease-linear"
                                    style={{
                                        // Auto-scroll trick: move text up based on current index
                                        top: '40%',
                                        transform: `translateY(-${currentWordIndex * 2}rem)`
                                    }}
                                >
                                    <p className="font-[Syne] text-4xl leading-tight text-center px-4 mix-blend-screen">
                                        {words.map((word, idx) => {
                                            const isPast = idx < currentWordIndex - 1;
                                            const isCurrent = idx >= currentWordIndex - 1 && idx <= currentWordIndex + 1;

                                            let color = 'text-zinc-700';
                                            if (isCurrent) color = 'text-[#22d3ee] font-extrabold pb-8 text-5xl drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]';
                                            else if (!isPast) color = 'text-slate-600 dark:text-zinc-300';

                                            return (
                                                <span key={idx} className={`${color} transition-all duration-300 inline-block mx-1.5`}>
                                                    {word}
                                                </span>
                                            );
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="lg:w-[40%] hidden lg:flex bg-white dark:bg-[#111118] border border-slate-100 dark:border-white/5 rounded-3xl p-8 shadow-xl flex-col justify-center items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-[#6d5fd8]/10 flex items-center justify-center mb-6">
                            <MonitorPlay className="w-10 h-10 text-[#6d5fd8]" />
                        </div>
                        <h3 className="text-2xl font-[Syne] font-bold mb-4">You're live!</h3>
                        <p className="text-slate-500 dark:text-zinc-400 font-[DM Sans] max-w-sm">
                            Teleprompter is disabled. Look directly into the camera lens to build a strong connection with your viewers.
                        </p>
                    </div>
                )}
            </motion.div>
        );
    };

    const CreateStep3 = () => {
        const handleSave = () => {
            if (!recordedBlob || !recordedUrl) return;
            const newVideo: SavedVideo = {
                id: Date.now().toString(),
                title: videoTitle || `My Video CV - ${new Date().toLocaleDateString()}`,
                date: new Date().toLocaleDateString(),
                duration: 60, // Placeholder, would need to inspect blob strictly
                blob: recordedBlob,
                url: recordedUrl,
                filter: FILTERS[0].style,
                overlay: "",
            };
            setSavedVideos(prev => [newVideo, ...prev]);
            navigateTo('library');
        };

        const handleDownload = () => {
            if (!recordedUrl) return;
            const a = document.createElement('a');
            a.href = recordedUrl;
            a.download = `${videoTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.webm`;
            a.click();
        };

        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col items-center justify-center p-6 h-full overflow-y-auto"
            >
                <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">

                    {/* Preview Player */}
                    <div className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
                        {recordedUrl && (
                            <video
                                src={recordedUrl}
                                controls
                                className="w-full aspect-video object-cover"
                            />
                        )}
                        <div className="absolute top-4 right-4 bg-white dark:bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-600 dark:text-zinc-300">
                            RAW PREVIEW
                        </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="bg-white dark:bg-[#111118] border border-slate-100 dark:border-white/5 rounded-3xl p-8 shadow-xl">
                        <h2 className="text-3xl font-[Syne] font-bold mb-6 text-slate-900 dark:text-white">Save & Finish</h2>

                        <div className="mb-8">
                            <label className="block text-sm font-bold text-slate-500 dark:text-zinc-400 font-[Syne] mb-2">Video Title</label>
                            <input
                                type="text"
                                value={videoTitle}
                                onChange={(e) => setVideoTitle(e.target.value)}
                                className="w-full bg-white dark:bg-[#08080f] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-[DM Sans] focus:outline-none focus:border-[#6d5fd8] transition-colors"
                            />
                            <p className="text-xs text-zinc-500 mt-2">File size: ~{((recordedBlob?.size || 0) / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>

                        <div className="space-y-3 font-[DM Sans]">
                            <button
                                onClick={handleSave}
                                className="w-full bg-[#6d5fd8] hover:bg-[#5a4ec2] text-slate-900 dark:text-white py-4 rounded-xl font-bold flex items-center justify-center transition-all shadow-lg"
                            >
                                <Save className="w-5 h-5 mr-2" /> Save to My Library
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleDownload}
                                    className="bg-white/5 hover:bg-white/10 text-slate-900 dark:text-white py-3 rounded-xl font-medium flex items-center justify-center transition-colors border border-slate-100 dark:border-white/5"
                                >
                                    <Download className="w-4 h-4 mr-2" /> Download
                                </button>
                                <button
                                    onClick={() => setCreateStep(2)}
                                    className="bg-white/5 hover:bg-[#e11d48]/20 hover:text-[#e11d48] text-slate-900 dark:text-white py-3 rounded-xl font-medium flex items-center justify-center transition-colors border border-slate-100 dark:border-white/5"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" /> Re-record
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    // ==========================================
    // SCREEN 3: SAVED LIBRARY
    // ==========================================
    const renderLibrary = () => {
        const handleDelete = (id: string, e: React.MouseEvent) => {
            e.stopPropagation();
            if (confirm("Are you sure you want to delete this video?")) {
                setSavedVideos(prev => prev.filter(v => v.id !== id));
            }
        };

        const handleEdit = (video: SavedVideo, e: React.MouseEvent) => {
            e.stopPropagation();
            setEditingVideo(video);
            navigateTo('editor');
        };

        const handleDownload = (video: SavedVideo, e: React.MouseEvent) => {
            e.stopPropagation();
            const a = document.createElement('a');
            a.href = video.url;
            a.download = `${video.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.webm`;
            a.click();
        };

        return (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="max-w-7xl mx-auto px-6 py-12"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <button onClick={() => navigateTo('menu')} className="inline-flex items-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white transition-colors mb-4 text-sm font-medium">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </button>
                        <h1 className="text-3xl md:text-5xl font-[Syne] font-bold text-slate-900 dark:text-white tracking-tight">
                            My Video CVs
                        </h1>
                    </div>
                    <button
                        onClick={() => navigateTo('create')}
                        className="bg-white/10 hover:bg-white/20 text-slate-900 dark:text-white px-6 py-3 rounded-2xl font-bold font-[DM Sans] flex items-center transition-all shadow-lg border border-slate-200 dark:border-white/10"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Create New
                    </button>
                </div>

                {savedVideos.length === 0 ? (
                    <div className="text-center py-32 bg-white dark:bg-[#111118] rounded-3xl border border-slate-100 dark:border-white/5">
                        <FileVideo className="w-20 h-20 text-zinc-700 mx-auto mb-6" />
                        <h3 className="text-2xl font-[Syne] font-bold text-slate-600 dark:text-zinc-300 mb-2">No Video CVs yet</h3>
                        <p className="text-zinc-500 font-[DM Sans] mb-8">It's time to record your first professional pitch.</p>
                        <button
                            onClick={() => navigateTo('create')}
                            className="bg-[#6d5fd8] text-slate-900 dark:text-white px-8 py-4 rounded-xl font-bold font-[DM Sans]"
                        >
                            Start Recording
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedVideos.map(video => (
                            <motion.div
                                key={video.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden group hover:border-[#22d3ee]/50 transition-all font-[DM Sans]"
                            >
                                <div className="aspect-video bg-white dark:bg-zinc-900 relative">
                                    <video src={video.url} className="w-full h-full object-cover opacity-50" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#111118] to-transparent" />
                                    <button
                                        className="absolute inset-0 flex items-center justify-center w-full h-full text-slate-900 dark:text-white/50 hover:text-slate-900 dark:text-white hover:bg-white dark:bg-black/20 transition-all"
                                    >
                                        <Play className="w-12 h-12 fill-current" />
                                    </button>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 truncate">{video.title}</h3>
                                    <div className="flex justify-between items-center text-xs text-zinc-500 mb-4">
                                        <span>{video.date}</span>
                                        <span className="bg-white/5 px-2 py-1 rounded">{(video.blob.size / (1024 * 1024)).toFixed(1)} MB</span>
                                    </div>
                                    <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
                                        <button
                                            onClick={(e) => handleEdit(video, e)}
                                            className="flex-1 bg-[#6d5fd8]/10 text-[#6d5fd8] hover:bg-[#6d5fd8]/20 py-2 rounded-lg font-bold text-xs flex items-center justify-center transition-colors"
                                        >
                                            <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit
                                        </button>
                                        <button
                                            onClick={(e) => handleDownload(video, e)}
                                            className="flex-1 bg-white/5 text-slate-600 dark:text-zinc-300 hover:bg-white/10 py-2 rounded-lg font-bold text-xs flex items-center justify-center transition-colors"
                                        >
                                            <Download className="w-3.5 h-3.5 mr-1.5" /> Save
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(video.id, e)}
                                            className="w-10 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 py-2 rounded-lg flex items-center justify-center transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        );
    };

    // ==========================================
    // SCREEN 4: EDITOR (ADVANCED)
    // ==========================================
    const renderEditor = () => {
        if (!editingVideo) return null;

        return (
            <motion.div
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
                className="h-screen flex flex-col bg-white dark:bg-[#08080f]"
            >
                {/* Header */}
                <div className="h-16 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-6 shrink-0 bg-white dark:bg-[#08080f]/90 relative z-50">
                    <button onClick={() => navigateTo('library')} className="inline-flex items-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white transition-colors text-sm font-bold font-[Syne]">
                        <ArrowLeft className="w-5 h-5 mr-3" /> Exit Editor
                    </button>
                    <div className="font-[Syne] font-bold text-slate-900 dark:text-white text-lg tracking-wide hidden md:block">
                        Editing: <span className="text-[#22d3ee]">{editingVideo.title}</span>
                    </div>
                    <button
                        onClick={() => navigateTo('library')} // Assuming save logic updates context if we had a global context. Here we just exit.
                        className="bg-[#22d3ee] hover:bg-cyan-400 text-black px-6 py-2 rounded-lg font-bold font-[DM Sans] transition-colors shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                    >
                        Save Changes
                    </button>
                </div>

                {/* Main Workspace */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                    {/* Left: Preview Canvas */}
                    <div className="flex-[2] md:flex-[3] bg-slate-50 dark:bg-black p-4 md:p-8 flex items-center justify-center relative overflow-hidden">

                        <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 group bg-white dark:bg-zinc-950">
                            <video
                                src={editingVideo.url}
                                controls
                                className="w-full h-full object-cover transition-all duration-300"
                                style={{ filter: editingVideo.filter !== 'none' ? editingVideo.filter : 'none' }}
                            />

                            {/* Visual Overlay Frame */}
                            {editingVideo.overlay && (
                                <div className={`absolute inset-0 pointer-events-none ${editingVideo.overlay}`} />
                            )}

                            {/* Text Overlay (Lower Third) */}
                            {(editingVideo.textName || editingVideo.textRole) && (
                                <div className="absolute bottom-12 left-8 md:bottom-16 md:left-12 pointer-events-none">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                        className="bg-white dark:bg-black/60 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl"
                                    >
                                        <h2 className="text-2xl md:text-3xl font-[Syne] font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
                                            {editingVideo.textName}
                                        </h2>
                                        <p className="text-[#22d3ee] font-[DM Sans] font-medium text-sm md:text-base uppercase tracking-wider">
                                            {editingVideo.textRole}
                                        </p>
                                    </motion.div>
                                </div>
                            )}
                        </div>

                        {/* Dummy Scrubber UI at bottom */}
                        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black to-transparent flex items-end px-8 pb-4">
                            <div className="w-full h-3 bg-white/10 rounded-full relative group/scrubber cursor-pointer">
                                <div className="absolute top-0 left-[10%] right-[20%] h-full bg-[#6d5fd8]/50 rounded-full border-x-2 border-white pointer-events-none" />
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white dark:bg-black/80 px-2 py-1 rounded text-[10px] text-emerald-400 font-mono opacity-0 group-hover/scrubber:opacity-100 transition-opacity">
                                    Trim applies on export
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Tools Panel */}
                    <div className="flex-1 w-full md:w-96 md:max-w-md bg-white dark:bg-[#111118] border-l border-slate-100 dark:border-white/5 flex flex-col relative z-20 overflow-y-auto custom-scrollbar">
                        <div className="p-6 border-b border-slate-100 dark:border-white/5">
                            <h3 className="text-xl font-[Syne] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Wand2 className="w-5 h-5 text-[#6d5fd8]" /> FX & Overlays
                            </h3>
                        </div>

                        <div className="p-6 space-y-10">

                            {/* Color & Filter */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold font-[Syne] text-slate-500 dark:text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
                                    <Sliders className="w-4 h-4" /> LUT Array
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {FILTERS.map(f => (
                                        <button
                                            key={f.name}
                                            onClick={() => setEditingVideo({ ...editingVideo, filter: f.style })}
                                            className={`aspect-square rounded-xl border flex items-center justify-center text-[10px] font-bold font-[Syne] transition-all overflow-hidden relative ${editingVideo.filter === f.style ? 'border-[#22d3ee] bg-[#22d3ee]/20 text-[#22d3ee]' : 'border-slate-100 dark:border-white/5 bg-white/5 text-zinc-500 hover:border-white/20 hover:text-slate-900 dark:text-white'
                                                }`}
                                        >
                                            {f.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Overlays */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold font-[Syne] text-slate-500 dark:text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
                                    <Film className="w-4 h-4" /> Cinematic Frame
                                </label>
                                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                    {OVERLAYS.map(o => (
                                        <button
                                            key={o.name}
                                            onClick={() => setEditingVideo({ ...editingVideo, overlay: o.class })}
                                            className={`min-w-[100px] h-16 rounded-xl border flex flex-col items-center justify-center text-xs font-bold font-[Syne] transition-all shrink-0 ${editingVideo.overlay === o.class ? 'border-[#6d5fd8] bg-[#6d5fd8]/20 text-[#6d5fd8]' : 'border-slate-100 dark:border-white/5 bg-white/5 text-slate-500 dark:text-zinc-400 hover:bg-white/10'
                                                }`}
                                        >
                                            {o.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Text / Lower Thirds */}
                            <div className="space-y-4 bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/5">
                                <label className="text-sm font-bold font-[Syne] text-slate-500 dark:text-zinc-400 flex items-center gap-2 uppercase tracking-wider mb-4">
                                    <Type className="w-4 h-4 text-pink-400" /> Lower Third UI
                                </label>
                                <div className="space-y-3 font-[DM Sans]">
                                    <input
                                        type="text" placeholder="Your Name"
                                        value={editingVideo.textName || ''}
                                        onChange={(e) => setEditingVideo({ ...editingVideo, textName: e.target.value })}
                                        className="w-full bg-white dark:bg-[#08080f] border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-pink-500/50"
                                    />
                                    <input
                                        type="text" placeholder="Professional Title / Role"
                                        value={editingVideo.textRole || ''}
                                        onChange={(e) => setEditingVideo({ ...editingVideo, textRole: e.target.value })}
                                        className="w-full bg-white dark:bg-[#08080f] border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-pink-500/50"
                                    />
                                </div>
                            </div>

                            {/* Export Control */}
                            <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                                <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-slate-900 dark:text-white rounded-xl py-4 flex items-center justify-center font-bold font-[DM Sans] transition-colors gap-2 mb-3">
                                    <Wand2 className="w-4 h-4 text-[#22d3ee]" /> Upscale & Enhance
                                </button>
                                <button
                                    onClick={() => {
                                        const a = document.createElement('a');
                                        a.href = editingVideo.url;
                                        a.download = `Edited_${editingVideo.title}.webm`;
                                        a.click();
                                    }}
                                    className="w-full bg-[#6d5fd8] hover:bg-[#5a4ec2] text-slate-900 dark:text-white rounded-xl py-4 flex items-center justify-center font-bold font-[DM Sans] transition-colors gap-2"
                                >
                                    <Download className="w-4 h-4" /> Download Final Cut
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    // ==========================================
    // MAIN RENDER SWITCH
    // ==========================================
    return (
        <div className="min-h-screen bg-white dark:bg-[#08080f] text-slate-900 dark:text-white overflow-hidden selection:bg-[#6d5fd8]/50">
            <AnimatePresence mode="wait">
                {currentView === 'menu' && renderMenu()}
                {currentView === 'create' && renderCreateFlow()}
                {currentView === 'library' && renderLibrary()}
                {currentView === 'editor' && renderEditor()}
            </AnimatePresence>
        </div>
    );
}
