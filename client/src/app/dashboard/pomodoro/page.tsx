"use client"
import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RotateCcw, Volume2, VolumeX, CheckCircle, Circle, Plus, Settings2, Coffee, BookOpen, Volume1, FileText, Trash2, MonitorSmartphone } from "lucide-react"
import Link from "next/link"
import Logo from "@/components/ui/Logo"

type Mode = "focus" | "shortBreak" | "longBreak";
type Task = { id: string; text: string; completed: boolean; pomodoros: number; totalPomodoros: number };

const POMODORO_TIMES = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
};

const AMBIENCE_URLS = {
    rain: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg",
    cafe: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
    none: ""
};

export default function PomodoroPage() {
    const [mode, setMode] = useState<Mode>("focus");
    const [timeLeft, setTimeLeft] = useState(POMODORO_TIMES.focus);
    const [isActive, setIsActive] = useState(false);

    const [tasks, setTasks] = useState<Task[]>([
        { id: "1", text: "Review System Design basics", completed: false, pomodoros: 0, totalPomodoros: 3 },
        { id: "2", text: "Implement Binary Tree traversal", completed: true, pomodoros: 2, totalPomodoros: 2 }
    ]);
    const [newTaskText, setNewTaskText] = useState("");
    const [isAddingTask, setIsAddingTask] = useState(false);

    const [ambience, setAmbience] = useState<"none" | "rain" | "cafe">("none");
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const alarmRef = useRef<HTMLAudioElement | null>(null);

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            // Timer ended
            setIsActive(false);
            if (alarmRef.current) {
                alarmRef.current.volume = 0.5;
                alarmRef.current.play().catch(e => console.log("Audio play blocked", e));
            }
            // Auto increment pomodoro count for first active task if focus mode ended
            if (mode === "focus") {
                setTasks(prev => {
                    const newTasks = [...prev];
                    const activeTaskIdx = newTasks.findIndex(t => !t.completed);
                    if (activeTaskIdx !== -1) {
                        newTasks[activeTaskIdx].pomodoros += 1;
                        if (newTasks[activeTaskIdx].pomodoros >= newTasks[activeTaskIdx].totalPomodoros) {
                            newTasks[activeTaskIdx].completed = true;
                        }
                    }
                    return newTasks;
                });
                // Switch to short break automatically
                handleModeSwitch("shortBreak");
            } else {
                handleModeSwitch("focus");
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode]);

    // Handle Ambience Audio
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.loop = true;
            audioRef.current.volume = 0.3; // Default volume
        }

        if (ambience === "none") {
            audioRef.current.pause();
            audioRef.current.src = "";
        } else {
            audioRef.current.src = AMBIENCE_URLS[ambience];
            audioRef.current.play().catch(e => console.log("Audio play blocked", e));
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, [ambience]);

    // Init Alarm Audio
    useEffect(() => {
        alarmRef.current = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
        return () => {
            if (alarmRef.current) alarmRef.current.pause();
        };
    }, []);

    const handleModeSwitch = (newMode: Mode) => {
        setMode(newMode);
        setTimeLeft(POMODORO_TIMES[newMode]);
        setIsActive(false);
    };

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(POMODORO_TIMES[mode]);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const addTask = () => {
        if (newTaskText.trim()) {
            setTasks([...tasks, { id: Date.now().toString(), text: newTaskText, completed: false, pomodoros: 0, totalPomodoros: 1 }]);
            setNewTaskText("");
            setIsAddingTask(false);
        }
    };

    const toggleTask = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const increaseEstimated = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setTasks(tasks.map(t => t.id === id ? { ...t, totalPomodoros: t.totalPomodoros + 1 } : t));
    };

    const deleteTask = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setTasks(tasks.filter(t => t.id !== id));
    };

    const progress = 1 - (timeLeft / POMODORO_TIMES[mode]);
    const glowColor = mode === "focus" ? "rgba(239,68,68," : mode === "shortBreak" ? "rgba(56,189,248," : "rgba(167,139,250,";
    const buttonGradient = mode === "focus"
        ? "from-red-500 to-orange-500 shadow-red-500/20"
        : mode === "shortBreak"
            ? "from-sky-400 to-blue-500 shadow-blue-500/20"
            : "from-purple-500 to-indigo-500 shadow-purple-500/20";

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-white p-6 relative flex flex-col items-center">
            {/* Ambient background */}
            <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none transition-colors duration-1000 ${mode === 'focus' ? 'bg-red-500/10' : mode === 'shortBreak' ? 'bg-sky-500/10' : 'bg-purple-500/10'}`} />
            <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none transition-colors duration-1000 ${mode === 'focus' ? 'bg-orange-500/10' : mode === 'shortBreak' ? 'bg-blue-500/10' : 'bg-indigo-500/10'}`} />

            <div className="w-full flex justify-between items-center max-w-6xl z-20 mb-8 mt-2">
                <Link href="/dashboard" className="flex items-center group">
                    <Logo size={32} showStatus showText />
                </Link>
                <Link href="/dashboard" className="px-4 py-2 bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white hover:bg-white/10 transition-colors">
                    Back to Dashboard
                </Link>
            </div>

            <div className="max-w-5xl w-full relative z-10 hidden md:block">
                <header className="mb-8 text-center">
                    <h1 className={`text-4xl font-black bg-gradient-to-r bg-clip-text text-transparent inline-block mb-2 ${mode === 'focus' ? 'from-red-400 to-orange-400' : mode === 'shortBreak' ? 'from-sky-400 to-blue-400' : 'from-purple-400 to-indigo-400'}`}>
                        {mode === 'focus' ? 'Deep Work Session' : mode === 'shortBreak' ? 'Short Break' : 'Rest Module'}
                    </h1>
                    <p className="text-zinc-500 text-lg">Immerse yourself. Eliminate distractions. Accomplish your goals.</p>
                </header>

                <div className="grid lg:grid-cols-12 gap-8 items-stretch">
                    {/* Timer Section */}
                    <div className="lg:col-span-7 flex">
                        <div className="w-full bg-white/60 dark:bg-zinc-900/50 backdrop-blur-xl border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-10 flex flex-col items-center justify-center relative shadow-2xl overflow-hidden">
                            {/* Progress Ring Background */}
                            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-10 pointer-events-none">
                                <svg width="100%" height="100%" viewBox="0 0 400 400" className="absolute">
                                    <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 8" className="text-slate-900 dark:text-white" />
                                    <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="1131" strokeDashoffset={1131 * (1 - progress)} className={mode === "focus" ? "text-red-500" : mode === "shortBreak" ? "text-sky-500" : "text-purple-500"} transform="rotate(-90 200 200)" />
                                </svg>
                            </div>

                            <div className="flex gap-2 mb-12 bg-white dark:bg-black/40 p-1.5 rounded-2xl relative z-10 w-full max-w-sm">
                                <button onClick={() => handleModeSwitch("focus")} className={`flex-1 py-2.5 rounded-xl font-semibold transition-all text-sm ${mode === "focus" ? "bg-white text-black shadow-md" : "text-slate-500 dark:text-zinc-400 hover:bg-white/5"}`}>Focus</button>
                                <button onClick={() => handleModeSwitch("shortBreak")} className={`flex-1 py-2.5 rounded-xl font-semibold transition-all text-sm ${mode === "shortBreak" ? "bg-white text-black shadow-md" : "text-slate-500 dark:text-zinc-400 hover:bg-white/5"}`}>Short Break</button>
                                <button onClick={() => handleModeSwitch("longBreak")} className={`flex-1 py-2.5 rounded-xl font-semibold transition-all text-sm ${mode === "longBreak" ? "bg-white text-black shadow-md" : "text-slate-500 dark:text-zinc-400 hover:bg-white/5"}`}>Long Break</button>
                            </div>

                            <div className={`text-[120px] font-black tracking-tighter tabular-nums leading-none z-10 transition-all duration-500 delay-100 ease-out`} style={{ textShadow: `0 0 40px ${glowColor}0.3)` }}>
                                {formatTime(timeLeft)}
                            </div>
                            <div className="text-zinc-500 font-medium tracking-widest uppercase text-sm mt-4 z-10 mb-12">
                                {isActive ? 'Session Active' : 'Paused'}
                            </div>

                            <div className="flex items-center gap-6 z-10">
                                <button onClick={resetTimer} className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/5 border border-slate-100 dark:border-white/5 hover:bg-white/10 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white transition-all hover:scale-105 active:scale-95 group">
                                    <RotateCcw className="w-6 h-6 group-hover:-rotate-45 transition-transform" />
                                </button>
                                <button onClick={toggleTimer} className={`w-24 h-24 rounded-[2rem] flex items-center justify-center bg-gradient-to-br text-slate-900 dark:text-white shadow-xl transition-all hover:scale-105 active:scale-95 ${buttonGradient}`}>
                                    {isActive ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-2" />}
                                </button>
                                <button onClick={() => setAmbience(ambience !== 'none' ? 'none' : 'cafe')} className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/5 border border-slate-100 dark:border-white/5 hover:bg-white/10 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white transition-all hover:scale-105 active:scale-95 group relative">
                                    {ambience !== 'none' ? <Volume2 className="w-6 h-6 text-emerald-400" /> : <VolumeX className="w-6 h-6" />}
                                    {ambience !== 'none' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Tasks & Ambience */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        {/* Ambience */}
                        <div className="bg-white/60 dark:bg-zinc-900/50 backdrop-blur-xl border border-slate-100 dark:border-white/5 rounded-3xl p-6 shadow-xl shrink-0">
                            <h2 className="text-lg font-bold mb-4 flex items-center justify-between">
                                <span className="flex items-center gap-2"><Volume1 className="w-5 h-5 text-orange-400" /> Soundscapes</span>
                                {ambience !== 'none' && <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">Active</span>}
                            </h2>
                            <div className="grid grid-cols-3 gap-3">
                                <button onClick={() => setAmbience('none')} className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 h-24 ${ambience === 'none' ? 'bg-white/10 border-slate-300 dark:border-white/20' : 'bg-white dark:bg-black/40 border-slate-100 dark:border-white/5 hover:bg-white/5'}`}>
                                    <VolumeX className={`w-6 h-6 ${ambience === 'none' ? 'text-slate-900 dark:text-white' : 'text-zinc-500'}`} />
                                    <span className={`text-xs font-semibold ${ambience === 'none' ? 'text-slate-900 dark:text-white' : 'text-zinc-500'}`}>None</span>
                                </button>
                                <button onClick={() => setAmbience('cafe')} className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 h-24 relative overflow-hidden group ${ambience === 'cafe' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-white dark:bg-black/40 border-slate-100 dark:border-white/5 hover:bg-white/5'}`}>
                                    {ambience === 'cafe' && <div className="absolute inset-0 bg-orange-500/5 backdrop-blur-md" />}
                                    <Coffee className={`w-6 h-6 relative z-10 ${ambience === 'cafe' ? 'text-orange-400' : 'text-slate-500 dark:text-zinc-400 group-hover:text-orange-300'}`} />
                                    <span className={`text-xs font-semibold relative z-10 ${ambience === 'cafe' ? 'text-orange-100' : 'text-zinc-500'}`}>Cafe</span>
                                </button>
                                <button onClick={() => setAmbience('rain')} className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 h-24 relative overflow-hidden group ${ambience === 'rain' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white dark:bg-black/40 border-slate-100 dark:border-white/5 hover:bg-white/5'}`}>
                                    {ambience === 'rain' && <div className="absolute inset-0 bg-blue-500/5 backdrop-blur-md" />}
                                    <div className={`text-2xl leading-none relative z-10 ${ambience === 'rain' ? 'opacity-100' : 'opacity-50 group-hover:opacity-80 grayscale'}`}>🌧️</div>
                                    <span className={`text-xs font-semibold relative z-10 ${ambience === 'rain' ? 'text-blue-100' : 'text-zinc-500'}`}>Rain</span>
                                </button>
                            </div>
                        </div>

                        {/* Tasks */}
                        <div className="bg-white/60 dark:bg-zinc-900/50 backdrop-blur-xl border border-slate-100 dark:border-white/5 rounded-3xl p-6 shadow-xl flex-1 flex flex-col overflow-hidden min-h-[300px]">
                            <h2 className="text-lg font-bold mb-4 flex items-center justify-between shrink-0">
                                <span className="flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-400" /> Focus Tasks</span>
                                <button onClick={() => setIsAddingTask(true)} className="w-8 h-8 rounded-full bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-white/10 text-slate-900 dark:text-white transition-all transform hover:scale-105 active:scale-95">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </h2>

                            <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
                                <AnimatePresence>
                                    {isAddingTask && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
                                            <div className="flex items-center gap-2 bg-white dark:bg-black/40 p-2 rounded-xl border border-indigo-500/30">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={newTaskText}
                                                    onChange={(e) => setNewTaskText(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                                                    placeholder="What are you working on?"
                                                    className="flex-1 bg-transparent border-none outline-none text-sm px-2 placeholder:text-zinc-600"
                                                />
                                                <button onClick={addTask} className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-xs font-bold transition-colors">Add</button>
                                                <button onClick={() => setIsAddingTask(false)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-colors text-slate-500 dark:text-zinc-400">Cancel</button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {tasks.map((task) => (
                                        <motion.div key={task.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                            onClick={() => { }}
                                            className={`p-4 bg-white dark:bg-black/40 border rounded-2xl flex items-start gap-3 group transition-all ${task.completed ? 'border-slate-100 dark:border-white/5 opacity-60' : 'border-slate-200 dark:border-white/10 hover:border-white/20'}`}>
                                            <button onClick={(e) => toggleTask(task.id, e)} className="shrink-0 mt-0.5 relative flex items-center justify-center w-6 h-6">
                                                {task.completed ? <CheckCircle className="w-6 h-6 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> : <Circle className="w-6 h-6 text-zinc-600 group-hover:text-indigo-400 transition-colors" />}
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <div className={`font-semibold text-sm truncate ${task.completed ? 'line-through text-zinc-500' : 'text-slate-900 dark:text-zinc-200'}`}>{task.text}</div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="text-[10px] font-medium text-zinc-500 bg-white/5 px-2 py-0.5 rounded flex items-center gap-1.5">
                                                        <span className="text-red-400">🍅</span> {task.pomodoros} / {task.totalPomodoros}
                                                        <button onClick={(e) => increaseEstimated(task.id, e)} className="ml-1 hover:text-slate-900 dark:text-white transition-colors"><Plus className="w-3 h-3" /></button>
                                                    </div>
                                                    <button onClick={(e) => deleteTask(task.id, e)} className="text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {tasks.length === 0 && !isAddingTask && (
                                        <div className="text-center py-10">
                                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <CheckCircle className="w-6 h-6 text-zinc-600" />
                                            </div>
                                            <p className="text-zinc-500 text-sm font-medium">No active tasks</p>
                                            <button onClick={() => setIsAddingTask(true)} className="text-indigo-400 text-xs font-bold mt-2 hover:underline">Add a task</button>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Mobile warning placeholder */}
            <div className="md:hidden min-h-screen flex items-center justify-center text-center p-6 z-10 relative">
                <div className="bg-white dark:bg-black/80 backdrop-blur-xl p-8 rounded-3xl border border-red-500/20 shadow-2xl">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MonitorSmartphone className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Focus Mode Recommends Desktop</h2>
                    <p className="text-slate-500 dark:text-zinc-400 text-sm max-w-xs mx-auto mb-6 leading-relaxed">
                        To maintain pure immersion and avoid mobile distractions, the Pomodoro Hub is exclusively optimized for desktop and tablet displays.
                    </p>
                    <Link href="/dashboard" className="px-6 py-3 bg-white text-black font-bold rounded-xl text-sm inline-block">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}
