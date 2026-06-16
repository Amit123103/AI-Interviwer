"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic, Video, Users, Link as LinkIcon, Download, RefreshCw,
    Play, Edit2, Trash2, Camera, Monitor, Clock,
    CheckCircle2, ChevronRight, Share2, Square, Wand2, ArrowLeft,
    Type, Frame, Sparkles, Volume2, MonitorPlay, LayoutTemplate,
    MicOff, VideoOff, PenTool, StickyNote, X
} from 'lucide-react';
import Link from 'next/link';

// === TYPES & CONSTANTS ===
type ViewState = 'menu' | 'solo-setup' | 'solo-record' | 'solo-preview' | 'host-setup' | 'group-record' | 'join-input' | 'library' | 'editor';

interface SavedPresentation {
    id: string;
    title: string;
    type: 'SOLO' | 'GROUP' | 'JOINED';
    date: string;
    duration: number;
    url: string;
    blob: Blob;
    participants?: number;
}

export default function PresentationStudio() {
    const [currentView, setCurrentView] = useState<ViewState>('menu');
    const [savedPresentations] = useState<SavedPresentation[]>([]);

    // Solo State
    const [soloMode, setSoloMode] = useState<'camera' | 'screen' | 'pip'>('pip');
    const [quality, setQuality] = useState<'720p' | '1080p' | '4k'>('1080p');
    const [countdown, setCountdown] = useState<3 | 5 | 10>(3);
    const [presentationTitle, setPresentationTitle] = useState('');
    const [useBlur, setUseBlur] = useState(false);

    // Solo Live Workspace State
    const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused'>('idle');
    const [recordingTime, setRecordingTime] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [isAnnotating, setIsAnnotating] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [notesText, setNotesText] = useState('');

    // PiP Draggable State
    const [pipPos, setPipPos] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const pipRef = useRef<HTMLDivElement>(null);
    const offsetRef = useRef({ x: 0, y: 0 });

    // Recording Refs
    const screenVideoRef = useRef<HTMLVideoElement>(null);
    const cameraVideoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const rafRef = useRef<number>(0);

    const [recordedUrl, setRecordedUrl] = useState<string | null>(null);

    // Annotations
    const annotCanvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // Editor State
    const [editorSettings, setEditorSettings] = useState({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        hue: 0,
        sharpness: false,
        filterPreset: 'Original',
        overlayFrame: 'None',
        textName: '',
        textRole: '',
        introAnim: 'None',
        volume: 100,
        playbackSpeed: 1,
        enhanceMode: false
    });

    // Group State
    const [roomCode, setRoomCode] = useState('');
    const [joinInputCode, setJoinInputCode] = useState(['', '', '', '', '', '']);

    // Global Font Injection
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=Orbitron:wght@500;700;900&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => { document.head.removeChild(link); }
    }, []);

    // Hoisted Hooks for specific views
    const generateCode = useCallback(() => {
        setRoomCode(Math.random().toString(36).substr(2, 6).toUpperCase());
    }, []);

    useEffect(() => {
        if (currentView === 'host-setup' && !roomCode) {
            generateCode();
        }
    }, [currentView, roomCode, generateCode]);

    const editorVideoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        if (currentView === 'editor' && editorVideoRef.current) {
            editorVideoRef.current.playbackRate = editorSettings.playbackSpeed;
        }
    }, [editorSettings.playbackSpeed, currentView]);

    // Load from memory stub (Simulated LocalStorage logic would go here)
    useEffect(() => {
        // Hydration simulation
    }, []);

    const navigateTo = (view: ViewState) => {
        setCurrentView(view);
    };

    // ==========================================
    // RECORDING ENGINE (WebRTC + Canvas Compositing)
    // ==========================================

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (cameraVideoRef.current) {
                cameraVideoRef.current.srcObject = stream;
            }
        } catch (err) { console.error("Camera error:", err); }
    };

    const startScreenShare = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            if (screenVideoRef.current) {
                screenVideoRef.current.srcObject = stream;
            }
        } catch (err) { console.error("Screen share error:", err); }
    };

    const drawCompositeFrame = useCallback(function drawLoop() {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx || !canvasRef.current) return;

        // Set canvas to 1080p roughly
        const W = 1920;
        const H = 1080;
        if (canvasRef.current.width !== W) canvasRef.current.width = W;
        if (canvasRef.current.height !== H) canvasRef.current.height = H;

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);

        if (soloMode === 'screen' || soloMode === 'pip') {
            if (screenVideoRef.current && screenVideoRef.current.readyState >= 2) {
                ctx.drawImage(screenVideoRef.current, 0, 0, W, H);
            }
        }

        if (soloMode === 'camera' || soloMode === 'pip') {
            if (cameraVideoRef.current && cameraVideoRef.current.readyState >= 2 && !isCameraOff) {
                if (soloMode === 'pip') {
                    const pipW = 320;
                    const pipH = 180;
                    const margin = 20;
                    ctx.drawImage(cameraVideoRef.current, W - pipW - margin, H - pipH - margin, pipW, pipH);
                } else {
                    ctx.drawImage(cameraVideoRef.current, 0, 0, W, H);
                }
            }
        }

        rafRef.current = requestAnimationFrame(drawLoop);
    }, [soloMode, isCameraOff]);

    const toggleRecord = () => {
        if (recordingState === 'idle') {
            setRecordingState('recording');
            setRecordingTime(0);
            chunksRef.current = [];

            if (!rafRef.current) {
                drawCompositeFrame();
            }

            if (canvasRef.current) {
                const canvasStream = canvasRef.current.captureStream(30);

                const ctx = new AudioContext();
                const dest = ctx.createMediaStreamDestination();

                const camStream = cameraVideoRef.current?.srcObject as MediaStream;
                const srcStream = screenVideoRef.current?.srcObject as MediaStream;

                if (camStream && camStream.getAudioTracks().length > 0 && !isMuted) {
                    ctx.createMediaStreamSource(camStream).connect(dest);
                }
                if (srcStream && srcStream.getAudioTracks().length > 0) {
                    ctx.createMediaStreamSource(srcStream).connect(dest);
                }

                if (dest.stream.getAudioTracks().length > 0) {
                    canvasStream.addTrack(dest.stream.getAudioTracks()[0]);
                }

                const recorder = new MediaRecorder(canvasStream, { mimeType: 'video/webm' });
                recorder.ondataavailable = e => {
                    if (e.data.size > 0) chunksRef.current.push(e.data);
                };
                recorder.onstop = () => {
                    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    setRecordedUrl(url);
                    navigateTo('solo-preview');
                };

                mediaRecorderRef.current = recorder;
                recorder.start(1000); // 1s chunks
                timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
            }

        } else if (recordingState === 'recording') {
            setRecordingState('idle');
            if (timerRef.current) clearInterval(timerRef.current);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = 0;
        }
    };

    // ==========================================
    // SCREEN 1: MENU
    // ==========================================
    const renderMenu = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="max-w-7xl mx-auto px-6 py-12 md:py-20"
        >
            <div className="mb-12">
                <Link href="/dashboard" className="inline-flex items-center text-zinc-500 hover:text-slate-900 dark:text-white transition-colors mb-6 text-sm font-bold font-[Nunito]">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>
                <h1 className="text-4xl md:text-5xl font-[Orbitron] font-black text-slate-900 dark:text-white mb-4 tracking-wider flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#7c3aed]/20 flex items-center justify-center relative shadow-[0_0_30px_rgba(124,58,237,0.3)]">
                        <Mic className="text-[#7c3aed] w-7 h-7" />
                        <div className="absolute inset-0 rounded-2xl border-2 border-[#7c3aed]/50 animate-ping opacity-20" />
                    </div>
                    Presentation Studio
                </h1>
                <p className="text-slate-500 dark:text-zinc-400 max-w-2xl text-lg font-[Nunito] leading-relaxed">
                    Record professional video presentations, screen share your code, or collaborate in real-time with your peers.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-12">
                {/* Card 1: Solo */}
                <div onClick={() => navigateTo('solo-setup')} className="bg-white dark:bg-[#0f0e1a] border border-slate-200 dark:border-[#1a1830] hover:border-[#7c3aed]/50 hover:shadow-[0_0_40px_rgba(124,58,237,0.15)] rounded-3xl p-8 cursor-pointer group transition-all relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#7c3aed]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="w-16 h-16 rounded-2xl bg-[#7c3aed]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Video className="w-8 h-8 text-[#7c3aed]" />
                        </div>
                        <h2 className="text-2xl font-[Orbitron] font-bold text-slate-900 dark:text-white mb-3 tracking-wide">Create Solo Presentation</h2>
                        <p className="text-slate-500 dark:text-zinc-400 font-[Nunito] mb-8 leading-relaxed flex-1">
                            Record a professional presentation alone using screen sharing, PiP camera, and live annotations.
                        </p>
                        <button className="bg-[#7c3aed] hover:bg-[#6d28d9] text-slate-900 dark:text-white px-6 py-3.5 rounded-xl font-bold font-[Nunito] flex items-center justify-center transition-colors w-full">
                            Start Solo <ChevronRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </div>

                {/* Card 2: Host Group */}
                <div onClick={() => navigateTo('host-setup')} className="bg-white dark:bg-[#0f0e1a] border border-slate-200 dark:border-[#1a1830] hover:border-[#06b6d4]/50 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] rounded-3xl p-8 cursor-pointer group transition-all relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#06b6d4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="w-16 h-16 rounded-2xl bg-[#06b6d4]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Users className="w-8 h-8 text-[#06b6d4]" />
                        </div>
                        <h2 className="text-2xl font-[Orbitron] font-bold text-slate-900 dark:text-white mb-3 tracking-wide">Start Group Presentation</h2>
                        <p className="text-slate-500 dark:text-zinc-400 font-[Nunito] mb-8 leading-relaxed flex-1">
                            Host a live group session. Share a unique code for teammates to join and co-present safely.
                        </p>
                        <button className="bg-transparent border-2 border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4] hover:text-black px-6 py-3.5 rounded-xl font-bold font-[Nunito] flex items-center justify-center transition-colors w-full">
                            Host Session <ChevronRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </div>

                {/* Card 3: Join Group */}
                <div onClick={() => navigateTo('join-input')} className="bg-white dark:bg-[#0f0e1a] border border-slate-200 dark:border-[#1a1830] hover:border-[#10b981]/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] rounded-3xl p-8 cursor-pointer group transition-all relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#10b981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="w-16 h-16 rounded-2xl bg-[#10b981]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <LinkIcon className="w-8 h-8 text-[#10b981]" />
                        </div>
                        <h2 className="text-2xl font-[Orbitron] font-bold text-slate-900 dark:text-white mb-3 tracking-wide">Join Group Session</h2>
                        <p className="text-slate-500 dark:text-zinc-400 font-[Nunito] mb-6 leading-relaxed flex-1">
                            Enter a 6-digit room code to join an active session hosted by a peer.
                        </p>

                        <div className="flex gap-2 mb-4 justify-center">
                            {[0, 1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="w-10 h-10 border border-zinc-700 rounded flex items-center justify-center text-zinc-600 bg-slate-50 dark:bg-black font-[Orbitron] text-lg font-bold group-hover:border-[#10b981]/30 transition-colors">
                                    -
                                </div>
                            ))}
                        </div>

                        <button className="bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-white/10 px-6 py-3.5 rounded-xl font-bold font-[Nunito] flex items-center justify-center transition-colors w-full">
                            Join Workspace <ChevronRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="text-center">
                <button onClick={() => navigateTo('library')} className="inline-flex items-center justify-center gap-2 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white font-[Nunito] font-bold text-sm bg-white dark:bg-[#1a1830]/50 px-6 py-3 rounded-full hover:bg-white dark:bg-[#1a1830] transition-colors border border-transparent hover:border-white/10">
                    <Play className="w-4 h-4 fill-current" /> My Saved Presentations
                    <span className="ml-2 bg-zinc-800 text-xs px-2 py-0.5 rounded-full text-slate-600 dark:text-zinc-300">{savedPresentations.length}</span>
                </button>
            </div>
        </motion.div>
    );

    // ==========================================
    // SCREEN 2: SOLO PRESENTATION
    // ==========================================
    const renderSoloSetup = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="min-h-screen bg-white dark:bg-[#06060e] flex flex-col p-6">
            <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col pt-12">

                <div className="flex items-center gap-4 mb-10">
                    <button onClick={() => navigateTo('menu')} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-[Orbitron] font-bold tracking-wide">Solo Studio Setup</h1>
                        <p className="text-slate-500 dark:text-zinc-400 font-[Nunito]">Configure your recording environment</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0f0e1a] border border-slate-200 dark:border-[#1a1830] rounded-3xl p-8 shadow-2xl flex-1 flex flex-col md:flex-row gap-12">

                    {/* Left: Configuration Form */}
                    <div className="flex-1 space-y-8">
                        <div>
                            <label className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest block mb-3 font-[Orbitron]">Presentation Title</label>
                            <input
                                type="text"
                                value={presentationTitle}
                                onChange={e => setPresentationTitle(e.target.value)}
                                placeholder="e.g. Q3 Architecture Review"
                                className="w-full bg-white dark:bg-[#06060e] border border-slate-200 dark:border-white/10 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] rounded-xl px-4 py-3 text-slate-900 dark:text-white font-[Nunito] outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest block mb-3 font-[Orbitron]">Recording Mode</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { id: 'camera', icon: Camera, label: 'Camera Only' },
                                    { id: 'screen', icon: Monitor, label: 'Screen Only' },
                                    { id: 'pip', icon: LayoutTemplate, label: 'Camera + Screen' },
                                ].map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setSoloMode(m.id as 'camera' | 'screen' | 'pip')}
                                        className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all font-[Nunito] font-bold text-xs ${soloMode === m.id ? 'border-[#7c3aed] bg-[#7c3aed]/10 text-slate-900 dark:text-white shadow-[0_0_15px_rgba(124,58,237,0.2)]' : 'border-slate-200 dark:border-white/10 text-zinc-500 hover:bg-white/5'}`}
                                    >
                                        <m.icon className={`w-6 h-6 ${soloMode === m.id ? 'text-[#7c3aed]' : ''}`} />
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest block mb-3 font-[Orbitron]">Quality</label>
                                <select
                                    value={quality}
                                    onChange={e => setQuality(e.target.value as '720p' | '1080p' | '4k')}
                                    className="w-full bg-white dark:bg-[#06060e] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-[Nunito] outline-none appearance-none"
                                >
                                    <option value="720p">720p (Good)</option>
                                    <option value="1080p">1080p (HD)</option>
                                    <option value="4k">4K (Ultra)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest block mb-3 font-[Orbitron]">Countdown</label>
                                <div className="flex bg-white dark:bg-[#06060e] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden p-1">
                                    {[3, 5, 10].map(s => (
                                        <button
                                            key={s} onClick={() => setCountdown(s as 3 | 5 | 10)}
                                            className={`flex-1 py-2 font-[Nunito] font-bold text-sm rounded-lg transition-colors ${countdown === s ? 'bg-zinc-800 text-slate-900 dark:text-white' : 'text-zinc-500 hover:text-slate-900 dark:text-white'}`}
                                        >{s}s</button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                                <span className="font-[Nunito] font-bold flex-1">Enable Background Blur</span>
                                <div className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${useBlur ? 'bg-[#7c3aed]' : 'bg-zinc-800'}`}>
                                    <motion.div animate={{ x: useBlur ? 24 : 0 }} className="w-4 h-4 bg-white rounded-full shadow" />
                                </div>
                                <input type="checkbox" className="hidden" checked={useBlur} onChange={e => setUseBlur(e.target.checked)} />
                            </label>
                        </div>

                    </div>

                    {/* Right: Camera Preview & CTA */}
                    <div className="flex-[0.8] flex flex-col pt-8 border-t md:border-t-0 md:border-l border-slate-200 dark:border-white/10 pl-0 md:pl-12">
                        <div className="aspect-video bg-slate-50 dark:bg-black rounded-2xl border border-slate-200 dark:border-white/10 shadow-inner overflow-hidden relative mb-8 flex items-center justify-center">
                            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/80 to-transparent z-10 flex items-center px-4 gap-1">
                                {/* Fake audio meter */}
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className={`w-1 rounded-full ${i < 5 ? 'bg-emerald-400' : 'bg-zinc-700'}`} style={{ height: `${Math.random() * 60 + 20}%` }} />
                                ))}
                            </div>
                            <Video className="w-12 h-12 text-zinc-800" />
                            <span className="absolute z-20 text-xs font-bold text-zinc-500 font-[Orbitron]">PREVIEW</span>
                        </div>

                        <div className="mt-auto">
                            <button
                                onClick={() => navigateTo('solo-record')}
                                className="w-full bg-[#7c3aed] text-slate-900 dark:text-white py-4 rounded-xl font-bold font-[Nunito] text-lg hover:bg-[#6d28d9] transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                Next: Ready to Present <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    // ==========================================
    // SCREEN 3: SOLO LIVE WORKSPACE
    // ==========================================
    const renderSoloRecord = () => {
        // PiP Dragging logic
        const handleMouseDown = (e: React.MouseEvent) => {
            if (!pipRef.current) return;
            setIsDragging(true);
            const rect = pipRef.current.getBoundingClientRect();
            offsetRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            e.preventDefault();
        };

        const handleMouseMove = (e: React.MouseEvent) => {
            if (!isDragging) return;
            // Note: In a real robust implementation, we bounds-check against parent
            setPipPos({
                x: e.clientX - offsetRef.current.x,
                y: e.clientY - offsetRef.current.y
            });
        };

        const handleMouseUp = () => setIsDragging(false);

        // toggleRecord managed globally

        const formatTime = (s: number) => {
            const m = Math.floor(s / 60);
            const secs = s % 60;
            return `${m}:${secs < 10 ? '0' : ''}${secs}`;
        };

        return (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-screen bg-slate-50 dark:bg-black flex flex-col relative overflow-hidden"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Top Bar */}
                <div className="h-16 bg-white dark:bg-[#06060e]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-6 z-50 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigateTo('solo-setup')} className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h2 className="font-[Orbitron] font-bold text-slate-900 dark:text-white truncate max-w-[200px] md:max-w-md">
                            {presentationTitle || "Untitled Presentation"}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        {recordingState === 'recording' && (
                            <div className="flex items-center gap-2 bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                                <span className="font-[Orbitron] font-bold text-red-500 tracking-widest text-sm">{formatTime(recordingTime)}</span>
                            </div>
                        )}
                        <button onClick={() => navigateTo('solo-setup')} className="bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-lg text-sm font-bold transition-colors">
                            End Session
                        </button>
                    </div>
                </div>

                {/* Workspace Area */}
                <div className="flex-1 flex relative">

                    {/* Main Canvas Area */}
                    <div className="flex-1 relative bg-white dark:bg-zinc-950 overflow-hidden flex items-center justify-center">

                        {/* Hidden Combined Canvas for MediaRecorder */}
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Screen Share element */}
                        <video
                            ref={screenVideoRef}
                            className={`w-full h-full object-contain ${soloMode === 'camera' ? 'hidden' : ''}`}
                            autoPlay playsInline muted
                        />

                        {/* Draggable PiP (Camera) */}
                        <div
                            ref={pipRef}
                            onMouseDown={handleMouseDown}
                            style={{
                                left: Math.max(0, pipPos.x),
                                top: Math.max(0, pipPos.y),
                                cursor: isDragging ? 'grabbing' : 'grab'
                            }}
                            className={`absolute w-64 aspect-video bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-2 border-[#7c3aed]/50 group z-40 ${(soloMode === 'screen' || isCameraOff) ? 'hidden' : ''} ${soloMode === 'camera' ? 'w-full h-full border-none inset-0 rounded-none' : ''}`}
                        >
                            <video
                                ref={cameraVideoRef}
                                className="w-full h-full object-cover"
                                style={{ filter: useBlur ? 'blur(4px)' : 'none' }}
                                autoPlay playsInline muted
                            />
                            {soloMode === 'pip' && (
                                <div className="absolute inset-0 bg-white dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <LayoutTemplate className="w-8 h-8 text-slate-900 dark:text-white/50" />
                                </div>
                            )}
                        </div>

                        {/* Annotation Layer */}
                        {isAnnotating && (
                            <div className="absolute inset-0 z-30 cursor-crosshair">
                                <canvas
                                    ref={annotCanvasRef}
                                    className="w-full h-full"
                                    onMouseDown={(e) => {
                                        const ctx = annotCanvasRef.current?.getContext('2d');
                                        if (!ctx) return;
                                        const rect = annotCanvasRef.current!.getBoundingClientRect();
                                        ctx.beginPath();
                                        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                                        setIsDrawing(true);
                                    }}
                                    onMouseMove={(e) => {
                                        if (!isDrawing) return;
                                        const ctx = annotCanvasRef.current?.getContext('2d');
                                        if (!ctx) return;
                                        const rect = annotCanvasRef.current!.getBoundingClientRect();
                                        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                                        ctx.strokeStyle = '#06b6d4';
                                        ctx.lineWidth = 4;
                                        ctx.lineCap = 'round';
                                        ctx.stroke();
                                    }}
                                    onMouseUp={() => setIsDrawing(false)}
                                />
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#06b6d4] text-black px-4 py-1 rounded-full text-xs font-bold font-[Orbitron] animate-pulse pointer-events-none">
                                    Drawing Mode Active
                                </div>
                                <button
                                    onClick={() => {
                                        const ctx = annotCanvasRef.current?.getContext('2d');
                                        if (ctx) ctx.clearRect(0, 0, annotCanvasRef.current!.width, annotCanvasRef.current!.height);
                                    }}
                                    className="absolute top-4 right-20 bg-red-500 text-slate-900 dark:text-white px-3 py-1 rounded font-bold text-xs font-[Orbitron]"
                                >
                                    Clear Ink
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Notes Sidebar (Slide-in) */}
                    <AnimatePresence>
                        {showNotes && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 350, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                className="border-l border-slate-200 dark:border-white/10 bg-white dark:bg-[#06060e]/95 backdrop-blur-xl flex flex-col z-50"
                            >
                                <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                                    <h3 className="font-[Orbitron] font-bold text-[#06b6d4] flex items-center gap-2">
                                        <StickyNote className="w-4 h-4" /> Private Notes
                                    </h3>
                                    <button onClick={() => setShowNotes(false)} className="p-1 hover:bg-white/10 rounded">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <textarea
                                    value={notesText}
                                    onChange={e => setNotesText(e.target.value)}
                                    placeholder="Type your speaker notes here... This window is invisible to the recording."
                                    className="flex-1 bg-transparent p-4 resize-none outline-none font-[Nunito] text-lg leading-relaxed text-slate-600 dark:text-zinc-300 placeholder:text-zinc-700 custom-scrollbar"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom Control Bar */}
                <div className="h-24 bg-white dark:bg-[#06060e] border-t border-slate-200 dark:border-white/10 flex items-center justify-center px-8 z-50 shrink-0 relative">

                    {/* Left Controls */}
                    <div className="absolute left-8 flex gap-3">
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-slate-900 dark:text-white hover:bg-white/20'}`}
                        >
                            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => {
                                setIsCameraOff(!isCameraOff);
                                if (isCameraOff) startCamera();
                            }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isCameraOff ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-slate-900 dark:text-white hover:bg-white/20'}`}
                        >
                            {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                        </button>
                        {(soloMode === 'screen' || soloMode === 'pip') && (
                            <button onClick={startScreenShare} className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 h-12 rounded-full transition-colors text-sm font-bold font-[Nunito]">
                                <Monitor className="w-4 h-4" /> Share Screen
                            </button>
                        )}
                    </div>

                    {/* Center: Record Button */}
                    <div className="relative group">
                        {recordingState === 'recording' && (
                            <div className="absolute inset-0 bg-red-500 blur-xl opacity-30 rounded-full animate-pulse" />
                        )}
                        <button
                            onClick={toggleRecord}
                            className={`w-16 h-16 rounded-full flex items-center justify-center relative z-10 transition-all ${recordingState === 'idle' ? 'bg-red-500 hover:bg-red-400 hover:scale-105 shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 'bg-white/10 border-2 border-slate-300 dark:border-white/20 hover:bg-white/20'}`}
                        >
                            {recordingState === 'idle' ? (
                                <div className="w-6 h-6 bg-white rounded-full" />
                            ) : (
                                <Square className="w-6 h-6 text-red-500 fill-current" />
                            )}
                        </button>
                    </div>

                    {/* Right Controls */}
                    <div className="absolute right-8 flex gap-3">
                        <button
                            onClick={() => setIsAnnotating(!isAnnotating)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isAnnotating ? 'bg-[#06b6d4]/20 text-[#06b6d4] border border-[#06b6d4]/50' : 'bg-white/10 text-slate-900 dark:text-white hover:bg-white/20'}`}
                            title="Draw on Screen"
                        >
                            <PenTool className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setShowNotes(!showNotes)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${showNotes ? 'bg-[#7c3aed]/20 text-[#7c3aed] border border-[#7c3aed]/50' : 'bg-white/10 text-slate-900 dark:text-white hover:bg-white/20'}`}
                            title="Private Notes"
                        >
                            <StickyNote className="w-5 h-5" />
                        </button>
                    </div>

                </div>
            </motion.div>
        );
    };

    // ==========================================
    // SCREEN 4: SOLO PREVIEW & SAVE
    // ==========================================
    const renderSoloPreview = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-white dark:bg-[#06060e] flex flex-col p-6">
            <div className="max-w-5xl mx-auto w-full pt-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-[Orbitron] font-bold text-slate-900 dark:text-white mb-2">Review Recording</h1>
                        <p className="text-slate-500 dark:text-zinc-400 font-[Nunito]">Watch your presentation before saving or editing.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0f0e1a] border border-slate-200 dark:border-[#1a1830] rounded-3xl p-6 shadow-2xl">
                    <div className="aspect-video bg-slate-50 dark:bg-black rounded-2xl overflow-hidden relative mb-6 border border-slate-100 dark:border-white/5">
                        {recordedUrl ? (
                            <video src={recordedUrl} controls className="w-full h-full object-contain" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-4">
                                <Video className="w-16 h-16 opacity-50" />
                                <span className="font-[Orbitron]">No Recording Found</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                        <div className="flex-1 w-full">
                            <label className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest block mb-2 font-[Orbitron]">Title</label>
                            <input
                                type="text"
                                value={presentationTitle}
                                onChange={e => setPresentationTitle(e.target.value)}
                                className="w-full bg-white dark:bg-[#06060e] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-slate-900 dark:text-white font-[Nunito] outline-none focus:border-[#7c3aed] transition-colors"
                            />
                        </div>
                        <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            <button onClick={() => navigateTo('solo-record')} className="shrink-0 bg-white/5 hover:bg-white/10 text-slate-900 dark:text-white px-5 py-2.5 rounded-xl font-bold font-[Nunito] transition-colors flex items-center gap-2">
                                <RefreshCw className="w-4 h-4" /> Re-record
                            </button>
                            <button onClick={() => navigateTo('editor')} className="shrink-0 bg-white/5 hover:bg-white/10 text-slate-900 dark:text-white px-5 py-2.5 rounded-xl font-bold font-[Nunito] transition-colors flex items-center gap-2">
                                <Edit2 className="w-4 h-4" /> Edit
                            </button>
                            <button className="shrink-0 bg-zinc-800 hover:bg-zinc-700 text-slate-900 dark:text-white px-5 py-2.5 rounded-xl font-bold font-[Nunito] transition-colors flex items-center gap-2">
                                <Download className="w-4 h-4" /> Download
                            </button>
                            <button onClick={() => navigateTo('library')} className="shrink-0 bg-[#7c3aed] hover:bg-[#6d28d9] text-slate-900 dark:text-white px-6 py-2.5 rounded-xl font-bold font-[Nunito] transition-colors shadow-[0_0_20px_rgba(124,58,237,0.3)] flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Save to Library
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    // ==========================================
    // SCREEN 5: HOST GROUP SESSION
    // ==========================================
    const renderHostSetup = () => {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="min-h-screen bg-white dark:bg-[#06060e] flex items-center justify-center p-6">
                <div className="w-full max-w-xl bg-white dark:bg-[#0f0e1a] border border-cyan-200 dark:border-[#06b6d4]/30 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(6,182,212,0.1)] relative overflow-hidden">
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#06b6d4]/20 rounded-full blur-3xl pointer-events-none" />

                    <button onClick={() => navigateTo('menu')} className="absolute top-8 left-8 text-zinc-500 hover:text-slate-900 dark:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="text-center mt-8 mb-10 relative z-10">
                        <div className="w-20 h-20 rounded-full bg-[#06b6d4]/10 border-2 border-[#06b6d4]/50 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                            <Users className="w-10 h-10 text-[#06b6d4]" />
                        </div>
                        <h2 className="text-3xl font-[Orbitron] font-bold text-slate-900 dark:text-white mb-2 tracking-wider">Host Session</h2>
                        <p className="text-slate-500 dark:text-zinc-400 font-[Nunito]">Share this join code with your team</p>
                    </div>

                    <div className="bg-white dark:bg-[#06060e] border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-center mb-8 relative z-10">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 font-[Orbitron]">Room Code</div>
                        <div className="text-6xl font-[Orbitron] font-black text-[#06b6d4] tracking-[0.2em] mb-6 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                            {roomCode || '------'}
                        </div>
                        <div className="flex justify-center gap-4">
                            <button className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg font-bold font-[Nunito] text-sm flex items-center gap-2 transition-colors">
                                <Share2 className="w-4 h-4" /> Copy Link
                            </button>
                            <button onClick={generateCode} className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg font-bold font-[Nunito] text-sm flex items-center gap-2 transition-colors">
                                <RefreshCw className="w-4 h-4" /> Reset
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#06060e] rounded-2xl p-4 border border-slate-100 dark:border-white/5 mb-8 relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                            <span className="font-[Nunito] text-slate-600 dark:text-zinc-300">Waiting for participants...</span>
                        </div>
                        <div className="bg-white/10 px-3 py-1 rounded-lg text-xs font-bold text-slate-500 dark:text-zinc-400">
                            0 Joined
                        </div>
                    </div>

                    <button onClick={() => navigateTo('group-record')} className="w-full bg-[#06b6d4] text-black py-4 rounded-xl font-bold font-[Nunito] text-lg hover:bg-[#0891b2] transition-colors shadow-[0_0_20px_rgba(6,182,212,0.4)] relative z-10">
                        Start Session Now
                    </button>
                </div>
            </motion.div>
        );
    };

    // ==========================================
    // SCREEN 6: JOIN GROUP SESSION (Participant)
    // ==========================================
    const renderJoinInput = () => {
        const handleJoinInput = (index: number, val: string) => {
            const newArr = [...joinInputCode];
            newArr[index] = val.toUpperCase();
            setJoinInputCode(newArr);
            // Auto advance
            if (val && index < 5) {
                const nextInput = document.getElementById(`join-code-${index + 1}`);
                nextInput?.focus();
            }
        };

        const attemptJoin = () => {
            const entered = joinInputCode.join('');
            if (entered.length === 6) {
                // Simulate success regardless for demo, but normally check against `roomCode`
                navigateTo('group-record');
            }
        };

        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="min-h-screen bg-white dark:bg-[#06060e] flex items-center justify-center p-6">
                <div className="w-full max-w-xl bg-white dark:bg-[#0f0e1a] border border-[#10b981]/30 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(16,185,129,0.1)] relative overflow-hidden">
                    <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#10b981]/20 rounded-full blur-3xl pointer-events-none" />

                    <button onClick={() => navigateTo('menu')} className="absolute top-8 left-8 text-zinc-500 hover:text-slate-900 dark:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="text-center mt-8 mb-10 relative z-10">
                        <div className="w-20 h-20 rounded-full bg-[#10b981]/10 border-2 border-[#10b981]/50 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                            <LinkIcon className="w-10 h-10 text-[#10b981]" />
                        </div>
                        <h2 className="text-3xl font-[Orbitron] font-bold text-slate-900 dark:text-white mb-2 tracking-wider">Join Session</h2>
                        <p className="text-slate-500 dark:text-zinc-400 font-[Nunito]">Enter the 6-digit code provided by your host</p>
                    </div>

                    <div className="mb-10 relative z-10 flex justify-center gap-3 md:gap-4">
                        {[0, 1, 2, 3, 4, 5].map(i => (
                            <input
                                key={i}
                                id={`join-code-${i}`}
                                type="text"
                                maxLength={1}
                                value={joinInputCode[i]}
                                onChange={(e) => handleJoinInput(i, e.target.value)}
                                className="w-12 h-14 md:w-14 md:h-16 bg-white dark:bg-[#06060e] border-2 border-zinc-700 focus:border-[#10b981] rounded-xl text-center text-2xl font-[Orbitron] font-black text-slate-900 dark:text-white outline-none uppercase transition-colors shadow-inner"
                            />
                        ))}
                    </div>

                    <button
                        onClick={attemptJoin}
                        className={`w-full py-4 rounded-xl font-bold font-[Nunito] text-lg transition-all relative z-10 shadow-[0_0_20px_rgba(16,185,129,0.3)] ${joinInputCode.join('').length === 6 ? 'bg-[#10b981] text-black hover:bg-[#059669]' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none'}`}
                    >
                        Join Presentation
                    </button>
                </div>
            </motion.div>
        );
    };

    // ==========================================
    // SCREEN 7: GROUP LIVE WORKSPACE
    // ==========================================
    const renderGroupRecord = () => {
        // Very similar to renderSoloRecord but includes the sidebar
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-screen bg-slate-50 dark:bg-black flex flex-col relative overflow-hidden">
                {/* Top Bar */}
                <div className="h-16 bg-white dark:bg-[#06060e]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-6 z-50 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#06b6d4]/20 text-[#06b6d4] px-3 py-1 rounded-md font-[Orbitron] font-bold text-sm tracking-widest border border-[#06b6d4]/50 shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                            ROOM: {roomCode || joinInputCode.join('') || 'DEMO'}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="bg-white/5 hover:bg-white/10 px-4 py-1.5 rounded-lg text-sm font-bold transition-colors text-red-400">
                            Leave Session
                        </button>
                    </div>
                </div>

                {/* Workspace Area */}
                <div className="flex-1 flex relative">

                    {/* Main Canvas Area (Simulated Host Screen) */}
                    <div className="flex-1 relative bg-white dark:bg-zinc-950 overflow-hidden flex items-center justify-center">
                        <div className="w-full h-full border-4 border-dashed border-zinc-800 flex items-center justify-center text-zinc-600 font-[Orbitron] flex-col gap-4">
                            <MonitorPlay className="w-24 h-24 opacity-50 text-[#06b6d4]" />
                            <span className="text-[#06b6d4]">simulated_host_screen_share.webm</span>
                            <span className="text-zinc-500 text-sm">Receiving WebRTC Stream...</span>
                        </div>
                    </div>

                    {/* Participants Sidebar */}
                    <div className="w-72 border-l border-slate-200 dark:border-white/10 bg-white dark:bg-[#06060e]/95 backdrop-blur-xl flex flex-col z-40 shrink-0">
                        <div className="p-4 border-b border-slate-200 dark:border-white/10">
                            <h3 className="font-[Orbitron] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Users className="w-4 h-4 text-[#06b6d4]" /> Participants (3)
                            </h3>
                        </div>

                        <div className="p-2 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                            {[
                                { name: 'Host User (You)', role: 'Host', isPresenting: true, mic: true },
                                { name: 'Alex Chen', role: 'Participant', isPresenting: false, mic: false },
                                { name: 'Sarah Jenkins', role: 'Participant', isPresenting: false, mic: false },
                            ].map((p, i) => (
                                <div key={i} className={`p-3 rounded-xl flex items-center justify-between border ${p.isPresenting ? 'bg-[#06b6d4]/10 border-[#06b6d4]/50 relative overflow-hidden' : 'bg-white/5 border-transparent'}`}>
                                    {p.isPresenting && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#06b6d4] shadow-[0_0_10px_rgba(6,182,212,1)]" />}
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${p.isPresenting ? 'bg-[#06b6d4] text-black' : 'bg-zinc-800 text-slate-900 dark:text-white'}`}>
                                            {p.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white font-[Nunito] truncate max-w-[100px]">{p.name}</span>
                                            <span className="text-[10px] text-zinc-500 font-[Orbitron] uppercase tracking-wider">{p.role}</span>
                                        </div>
                                    </div>
                                    <div>
                                        {p.mic ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-red-500 opacity-50" />}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-slate-200 dark:border-white/10 flex flex-col gap-2">
                            <button className="w-full bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg font-bold font-[Nunito] text-sm flex items-center justify-center gap-2 transition-colors border border-slate-200 dark:border-white/10">
                                ✋ Raise Hand
                            </button>
                            <button onClick={() => navigateTo('solo-preview')} className="w-full bg-[#06b6d4]/20 text-[#06b6d4] hover:bg-[#06b6d4]/30 border border-[#06b6d4]/50 px-4 py-2 rounded-lg font-bold font-[Nunito] text-sm flex items-center justify-center gap-2 transition-colors">
                                <div className="w-2 h-2 rounded-full bg-[#06b6d4] animate-pulse" /> Record for Me
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    // ==========================================
    // SCREEN 8: SAVED LIBRARY
    // ==========================================
    const renderLibrary = () => {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-white dark:bg-[#06060e] flex flex-col p-6">
                <div className="max-w-7xl mx-auto w-full pt-8">

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigateTo('menu')} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-[Orbitron] font-bold tracking-wide">My Presentations</h1>
                                <p className="text-slate-500 dark:text-zinc-400 font-[Nunito]">Manage your saved video sessions</p>
                            </div>
                        </div>
                        <button onClick={() => navigateTo('menu')} className="bg-[#7c3aed] text-slate-900 dark:text-white px-6 py-2.5 rounded-xl font-bold font-[Nunito] hover:bg-[#6d28d9] transition-colors shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                            + New Presentation
                        </button>
                    </div>

                    <div className="flex gap-2 mb-8 border-b border-slate-200 dark:border-white/10 pb-4 overflow-x-auto">
                        {['All', 'Solo', 'Group', 'Shared'].map(tab => (
                            <button key={tab} className={`px-4 py-2 rounded-full font-bold font-[Nunito] text-sm whitespace-nowrap transition-colors ${tab === 'All' ? 'bg-white/10 text-slate-900 dark:text-white' : 'text-zinc-500 hover:bg-white/5'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    {savedPresentations.length === 0 ? (
                        <div className="bg-white dark:bg-[#0f0e1a] border border-slate-200 dark:border-[#1a1830] rounded-3xl p-16 text-center flex flex-col items-center justify-center min-h-[400px]">
                            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <Video className="w-10 h-10 text-zinc-600" />
                            </div>
                            <h3 className="text-xl font-[Orbitron] font-bold text-slate-900 dark:text-white mb-2">No Presentations Yet</h3>
                            <p className="text-slate-500 dark:text-zinc-400 font-[Nunito] mb-8 max-w-sm">
                                Your library is empty. Start a solo presentation or host a group session to fill it up!
                            </p>
                            <button onClick={() => navigateTo('solo-setup')} className="bg-[#7c3aed] text-slate-900 dark:text-white px-8 py-3 rounded-xl font-bold font-[Nunito] hover:bg-[#6d28d9] transition-colors">
                                Create Your First Video
                            </button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {/* Dummy Card Demo */}
                            <div className="bg-white dark:bg-[#0f0e1a] border border-slate-200 dark:border-[#1a1830] hover:border-[#7c3aed]/50 hover:shadow-[0_0_30px_rgba(124,58,237,0.1)] transition-all rounded-2xl overflow-hidden group">
                                <div className="aspect-video bg-white dark:bg-zinc-900 relative overflow-hidden group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
                                    <Play className="w-12 h-12 text-slate-900 dark:text-white/50 group-hover:text-slate-900 dark:text-white transition-colors" />
                                    <div className="absolute top-3 left-3 bg-[#7c3aed]/20 border border-[#7c3aed]/50 text-[#7c3aed] px-2 py-0.5 rounded text-[10px] font-bold font-[Orbitron] tracking-wider uppercase">
                                        SOLO
                                    </div>
                                </div>
                                <div className="p-5 flex flex-col h-[140px] justify-between relative z-10 bg-white dark:bg-[#0f0e1a]">
                                    <div>
                                        <h3 className="font-[Orbitron] font-bold text-slate-900 dark:text-white truncate mb-1">Q3 Arch Review</h3>
                                        <div className="flex items-center gap-3 text-xs text-zinc-500 font-[Nunito]">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 12:45</span>
                                            <span>Oct 24, 2023</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-white/5">
                                        <div className="flex gap-2">
                                            <button onClick={() => navigateTo('editor')} className="p-2 hover:bg-[#06b6d4]/10 hover:text-[#06b6d4] text-slate-500 dark:text-zinc-400 rounded transition-colors" title="Edit">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-emerald-500/10 hover:text-emerald-400 text-slate-500 dark:text-zinc-400 rounded transition-colors" title="Download">
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-indigo-500/10 hover:text-indigo-400 text-slate-500 dark:text-zinc-400 rounded transition-colors" title="Share">
                                                <Share2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <button className="p-2 hover:bg-red-500/10 hover:text-red-500 text-zinc-600 rounded transition-colors" title="Delete">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    // ==========================================
    // SCREEN 9: ADVANCED EDITOR
    // ==========================================
    const renderEditor = () => {
        const updateSetting = <K extends keyof typeof editorSettings>(key: K, val: typeof editorSettings[K]) => {
            setEditorSettings(prev => ({ ...prev, [key]: val }));
        };

        const filterStyle = `brightness(${editorSettings.brightness}%) contrast(${editorSettings.contrast}%) saturate(${editorSettings.saturation}%) hue-rotate(${editorSettings.hue}deg) ${editorSettings.sharpness ? 'contrast(1.02)' : ''}`;

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-screen bg-white dark:bg-[#06060e] flex overflow-hidden">

                {/* Main Video Viewport */}
                <div className="flex-1 flex flex-col p-6">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => navigateTo('library')} className="text-zinc-500 hover:text-slate-900 dark:text-white transition-colors flex items-center gap-2 font-[Nunito] font-bold text-sm">
                            <ArrowLeft className="w-4 h-4" /> Library
                        </button>
                        <h2 className="font-[Orbitron] font-bold tracking-widest text-[#06b6d4]">VIDEO EDITOR</h2>
                        <button className="bg-[#7c3aed] text-slate-900 dark:text-white px-6 py-2 rounded-lg font-bold font-[Nunito] text-sm hover:bg-[#6d28d9] transition-colors shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                            Export Project
                        </button>
                    </div>

                    <div className="flex-1 bg-white dark:bg-[#151421] rounded-3xl border border-slate-100 dark:border-white/5 flex flex-col overflow-hidden relative shadow-2xl items-center justify-center p-8">
                        {/* Video Container with Filters */}
                        <div className="relative w-full max-w-4xl aspect-video bg-slate-50 dark:bg-black rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">

                            <video
                                ref={editorVideoRef}
                                className="w-full h-full object-contain"
                                style={{ filter: filterStyle }}
                                controls
                                src={recordedUrl || undefined}
                            />

                            {/* Overlays */}
                            {editorSettings.overlayFrame !== 'None' && (
                                <div className="absolute inset-0 border-8 border-[#7c3aed] pointer-events-none opacity-50 mixing-blend-overlay" />
                            )}

                            {editorSettings.textName && (
                                <div className="absolute bottom-10 left-10 bg-white dark:bg-black/80 backdrop-blur-md px-6 py-4 rounded-xl border-l-4 border-[#06b6d4]">
                                    <h3 className="text-slate-900 dark:text-white font-[Orbitron] font-bold text-2xl">{editorSettings.textName}</h3>
                                    {editorSettings.textRole && <p className="text-[#06b6d4] font-[Nunito] text-sm">{editorSettings.textRole}</p>}
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Timeline Trimmer (Simulated UI) */}
                    <div className="h-32 mt-6 bg-white dark:bg-[#0f0e1a] rounded-2xl border border-slate-200 dark:border-white/10 p-4 flex flex-col select-none">
                        <div className="flex justify-between text-xs text-zinc-500 font-[Orbitron] mb-2 font-bold">
                            <span>0:00</span>
                            <span className="text-[#7c3aed]">Trim applied on download</span>
                            <span>15:23</span>
                        </div>
                        <div className="flex-1 relative bg-white dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-white/5 overflow-hidden flex items-center">
                            {/* Fake Waveform */}
                            <div className="w-full h-8 opacity-20 flex gap-0.5 px-2">
                                {[...Array(100)].map((_, i) => <div key={i} className="flex-1 bg-[#06b6d4] rounded-full" style={{ height: `${Math.random() * 100}%` }} />)}
                            </div>

                            {/* Scrubber Handles */}
                            <div className="absolute left-[10%] bottom-0 top-0 w-1 bg-[#7c3aed]" />
                            <div className="absolute right-[20%] bottom-0 top-0 w-1 bg-[#7c3aed]" />
                            <div className="absolute left-[10%] right-[20%] top-0 bottom-0 bg-[#7c3aed]/20 border-y-2 border-[#7c3aed]" />
                        </div>
                    </div>
                </div>

                {/* Right Settings Panel */}
                <div className="w-96 border-l border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f0e1a] flex flex-col z-10 shrink-0">
                    <div className="h-16 border-b border-slate-200 dark:border-white/10 flex items-center px-6 shrink-0">
                        <h3 className="font-[Orbitron] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Wand2 className="w-4 h-4 text-[#7c3aed]" /> Visual Effects
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-10">

                        {/* Section: Color Grading */}
                        <div>
                            <h4 className="font-[Orbitron] font-bold text-xs text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Sparkles className="w-3 h-3" /> Color Grading
                            </h4>

                            <div className="space-y-5">
                                <div>
                                    <div className="flex justify-between text-xs font-[Nunito] font-bold text-slate-500 dark:text-zinc-400 mb-2">
                                        <span>Brightness</span>
                                        <span>{editorSettings.brightness}%</span>
                                    </div>
                                    <input type="range" min="50" max="150" value={editorSettings.brightness} onChange={e => updateSetting('brightness', Number(e.target.value))} className="w-full accent-[#7c3aed]" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-[Nunito] font-bold text-slate-500 dark:text-zinc-400 mb-2">
                                        <span>Contrast</span>
                                        <span>{editorSettings.contrast}%</span>
                                    </div>
                                    <input type="range" min="50" max="150" value={editorSettings.contrast} onChange={e => updateSetting('contrast', Number(e.target.value))} className="w-full accent-[#7c3aed]" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-[Nunito] font-bold text-slate-500 dark:text-zinc-400 mb-2">
                                        <span>Saturation</span>
                                        <span>{editorSettings.saturation}%</span>
                                    </div>
                                    <input type="range" min="50" max="150" value={editorSettings.saturation} onChange={e => updateSetting('saturation', Number(e.target.value))} className="w-full accent-[#7c3aed]" />
                                </div>

                                <label className="flex items-center gap-3 cursor-pointer mt-4 p-3 bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 hover:border-cyan-200 dark:border-[#06b6d4]/30 transition-colors">
                                    <input type="checkbox" checked={editorSettings.sharpness} onChange={e => updateSetting('sharpness', e.target.checked)} className="accent-[#06b6d4]" />
                                    <span className="font-[Nunito] text-sm text-slate-900 dark:text-white font-bold">Sharpen Video</span>
                                </label>
                            </div>
                        </div>

                        <hr className="border-slate-100 dark:border-white/5" />

                        {/* Section: Typography overlay */}
                        <div>
                            <h4 className="font-[Orbitron] font-bold text-xs text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Type className="w-3 h-3" /> Text & Captions
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 block mb-2 font-[Nunito]">Presenter Name</label>
                                    <input type="text" value={editorSettings.textName} onChange={e => updateSetting('textName', e.target.value)} placeholder="e.g. John Doe" className="w-full bg-white dark:bg-[#06060e] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-[#06b6d4] outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 block mb-2 font-[Nunito]">Role / Title</label>
                                    <input type="text" value={editorSettings.textRole} onChange={e => updateSetting('textRole', e.target.value)} placeholder="e.g. Senior Engineer" className="w-full bg-white dark:bg-[#06060e] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-[#06b6d4] outline-none" />
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100 dark:border-white/5" />

                        {/* Section: Overlays */}
                        <div>
                            <h4 className="font-[Orbitron] font-bold text-xs text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Frame className="w-3 h-3" /> Studio Frames
                            </h4>
                            <select value={editorSettings.overlayFrame} onChange={e => updateSetting('overlayFrame', e.target.value)} className="w-full bg-white dark:bg-[#06060e] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none">
                                <option>None</option>
                                <option>Corporate Tech</option>
                                <option>Academic Minimal</option>
                                <option>Creative Purple</option>
                            </select>
                        </div>

                        <hr className="border-slate-100 dark:border-white/5" />

                        {/* Audio & Quality */}
                        <div>
                            <h4 className="font-[Orbitron] font-bold text-xs text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Volume2 className="w-3 h-3" /> Audio & Speed
                            </h4>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-[Nunito] font-bold text-slate-500 dark:text-zinc-400 mb-2">
                                        <span>Playback Speed</span>
                                        <span>{editorSettings.playbackSpeed}x</span>
                                    </div>
                                    <input type="range" min="0.5" max="2" step="0.25" value={editorSettings.playbackSpeed} onChange={e => updateSetting('playbackSpeed', parseFloat(e.target.value))} className="w-full accent-emerald-500" />
                                </div>

                                <label className="flex items-center gap-3 cursor-pointer p-3 bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 hover:border-[#10b981]/30 transition-colors">
                                    <input type="checkbox" checked={editorSettings.enhanceMode} onChange={e => updateSetting('enhanceMode', e.target.checked)} className="accent-emerald-500" />
                                    <span className="font-[Nunito] text-sm text-slate-900 dark:text-white font-bold flex flex-col">
                                        AI Quality Enhance
                                        <span className="text-[10px] text-zinc-500 font-normal">Denoise & Stabilize audio</span>
                                    </span>
                                </label>
                            </div>
                        </div>

                    </div>
                </div>
            </motion.div>
        );
    };


    // ==========================================
    // RENDERER
    // ==========================================
    return (
        <div className="min-h-screen bg-white dark:bg-[#06060e] text-slate-900 dark:text-white overflow-hidden selection:bg-[#7c3aed]/30">
            <AnimatePresence mode="wait">
                {currentView === 'menu' && <React.Fragment key="menu">{renderMenu()}</React.Fragment>}
                {currentView === 'solo-setup' && <React.Fragment key="solo-setup">{renderSoloSetup()}</React.Fragment>}
                {currentView === 'solo-record' && <React.Fragment key="solo-record">{renderSoloRecord()}</React.Fragment>}
                {currentView === 'solo-preview' && <React.Fragment key="solo-preview">{renderSoloPreview()}</React.Fragment>}
                {currentView === 'host-setup' && <React.Fragment key="host-setup">{renderHostSetup()}</React.Fragment>}
                {currentView === 'join-input' && <React.Fragment key="join-input">{renderJoinInput()}</React.Fragment>}
                {currentView === 'group-record' && <React.Fragment key="group-record">{renderGroupRecord()}</React.Fragment>}
                {currentView === 'library' && <React.Fragment key="library">{renderLibrary()}</React.Fragment>}
                {currentView === 'editor' && <React.Fragment key="editor">{renderEditor()}</React.Fragment>}
                {/* Fallback for unbuilt screens during dev */}
                {['menu', 'solo-setup', 'solo-record', 'solo-preview', 'host-setup', 'join-input', 'group-record', 'library', 'editor'].indexOf(currentView) === -1 && (
                    <motion.div key="dev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-12 text-center text-zinc-500 font-[Orbitron] flex flex-col items-center justify-center min-h-screen">
                        <Wand2 className="w-16 h-16 text-[#7c3aed] mb-6 animate-pulse" />
                        <h2 className="text-3xl mb-4">Building Workspace...</h2>
                        <button onClick={() => setCurrentView('menu')} className="mt-8 text-cyan-400 underline font-[Nunito]">Return to Menu</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
