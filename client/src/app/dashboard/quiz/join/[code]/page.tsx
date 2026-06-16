"use client";

import { useEffect, useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowRight, BrainCircuit, CheckCircle2, ChevronRight, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Question {
    _id: string;
    text: string;
    type: "multiple_choice" | "theoretical";
    options?: string[];
}

interface Quiz {
    _id: string;
    title: string;
    description: string;
    code: string;
    questions: Question[];
    creator: { name: string; avatar?: string };
}

export default function JoinQuizPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = use(params);
    const router = useRouter();

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/quiz/code/${code}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setQuiz(data.quiz);
                } else {
                    toast.error(data.message || "Quiz not found");
                    router.push("/dashboard/quiz");
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to fetch quiz");
                router.push("/dashboard/quiz");
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [code, router]);

    const handleSelectOption = (questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleNext = () => {
        if (!quiz) return;
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        if (!quiz) return;

        // Format answers for API
        const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
            questionId,
            selectedOption
        }));

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/quiz/code/${code}/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ answers: formattedAnswers })
            });

            const data = await res.json();
            if (data.success) {
                toast.success(`You earned ${data.coinsEarned} Intervyxa Coins!`);
                // Redirect straight to the leaderboard to see results
                router.push(`/dashboard/quiz/leaderboard/${code}`);
            } else {
                toast.error(data.message || "Failed to submit quiz");
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred during submission");
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center font-sans relative overflow-hidden">
                {/* Advanced Loading Animations */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />

                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 relative mb-6">
                        <div className="absolute inset-0 rounded-2xl border-4 border-indigo-500/20" />
                        <div className="absolute inset-0 rounded-2xl border-4 border-indigo-500 border-t-transparent animate-spin" />
                        <BrainCircuit className="absolute inset-0 m-auto w-6 h-6 text-indigo-400" />
                    </div>
                    <p className="text-slate-600 dark:text-zinc-300 font-bold tracking-widest uppercase text-sm animate-pulse">Initializing Session</p>
                    <p className="text-indigo-400/60 font-medium tracking-widest uppercase text-[10px] mt-2">{code}</p>
                </motion.div>
            </div>
        );
    }

    if (!quiz || quiz.questions.length === 0) return null;

    const currentQ = quiz.questions[currentQuestionIndex];
    const progressPercent = ((currentQuestionIndex) / quiz.questions.length) * 100;
    const isAnswered = !!answers[currentQ._id];

    const keyboardShortcuts = ['A', 'B', 'C', 'D', 'E', 'F'];

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans relative flex flex-col pt-16 md:pt-24 pb-12 px-6 overflow-hidden">
            {/* Global Ambient Glows */}
            <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col relative z-10">

                {/* Header Info */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-2 mb-2 rounded-2xl bg-white/[0.03] border border-white/[0.05] shadow-lg backdrop-blur-xl">
                        <BrainCircuit className="w-5 h-5 text-indigo-400 mr-2" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-600 dark:text-zinc-300">Live Quiz</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-zinc-400 tracking-tight pb-1">{quiz.title}</h1>
                    <p className="text-zinc-500 text-sm font-medium tracking-wide">Hosted by <span className="text-indigo-400 font-bold">{quiz.creator?.name || 'Instructor'}</span></p>
                </motion.div>

                {/* Advanced Progress Bar */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-12">
                    <div className="flex justify-between items-end mb-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                            Question {currentQuestionIndex + 1} <span className="text-zinc-600">/ {quiz.questions.length}</span>
                        </span>
                        <span className="text-xs text-slate-500 dark:text-zinc-400 font-black tracking-wider">
                            {Math.round(progressPercent)}%
                        </span>
                    </div>
                    <div className="w-full h-3 bg-white/60 dark:bg-zinc-900/50 rounded-full overflow-hidden border border-white/[0.05] relative backdrop-blur-sm">
                        <div
                            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 transition-all duration-700 ease-out shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                            style={{ width: `${progressPercent}%` }}
                        >
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
                        </div>
                    </div>
                </motion.div>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="relative"
                    >
                        {/* 3D Glassmorphism Container */}
                        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl border border-white/[0.08] rounded-[32px] shadow-2xl" />

                        {/* Inner subtle glow based on answer state */}
                        <div className={`absolute inset-0 rounded-[32px] transition-opacity duration-500 pointer-events-none ${isAnswered ? 'opacity-100' : 'opacity-0'} bg-gradient-to-br from-indigo-500/5 to-transparent border border-indigo-500/20`} />

                        <div className="relative p-8 md:p-12">
                            <h2 className="text-2xl md:text-3xl text-slate-900 dark:text-white font-bold mb-10 leading-relaxed tracking-tight">
                                {currentQ.text}
                            </h2>

                            {currentQ.type === 'multiple_choice' ? (
                                <div className="space-y-4">
                                    {currentQ.options?.map((opt, idx) => {
                                        const isSelected = answers[currentQ._id] === String(idx);
                                        return (
                                            <motion.button
                                                key={idx}
                                                whileHover={{ scale: 1.01, x: 4 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleSelectOption(currentQ._id, String(idx))}
                                                className={`w-full text-left p-5 rounded-[20px] border transition-all duration-300 flex items-center justify-between group overflow-hidden relative ${isSelected
                                                    ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_4px_25px_rgba(99,102,241,0.2)]'
                                                    : 'bg-white dark:bg-black/20 border-white/[0.05] hover:border-white/20 hover:bg-white/[0.04]'
                                                    }`}
                                            >
                                                {/* Selected gradient sweep */}
                                                {isSelected && (
                                                    <motion.div layoutId="selected-outline" className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 rounded-l-[19px]" />
                                                )}

                                                <div className="flex items-center gap-4 relative z-10 w-full pr-4">
                                                    {/* Keyboard visualizer */}
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 transition-colors ${isSelected ? 'bg-indigo-500 text-slate-900 dark:text-white shadow-lg shadow-indigo-500/30' : 'bg-white/5 text-zinc-500 border border-slate-200 dark:border-white/10 group-hover:bg-white/10 group-hover:text-slate-900 dark:text-zinc-300'}`}>
                                                        {keyboardShortcuts[idx] || (idx + 1)}
                                                    </div>

                                                    <span className={`text-lg font-medium transition-colors leading-snug ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-zinc-300 group-hover:text-slate-900 dark:text-zinc-100'}`}>
                                                        {opt}
                                                    </span>
                                                </div>

                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors relative z-10 ${isSelected ? 'border-indigo-400 bg-indigo-500/20' : 'border-zinc-700 bg-white dark:bg-black/40 group-hover:border-zinc-500'}`}>
                                                    {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}><CheckCircle2 className="w-5 h-5 text-indigo-400 absolute inset-[-2px]" /></motion.div>}
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-500 pointer-events-none" />
                                    <textarea
                                        autoFocus
                                        value={answers[currentQ._id] || ""}
                                        onChange={(e) => handleSelectOption(currentQ._id, e.target.value)}
                                        placeholder="Type your answer here... Be as descriptive as possible."
                                        rows={6}
                                        className="relative w-full bg-white dark:bg-black/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-slate-900 dark:text-white text-lg focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none shadow-inner placeholder:text-zinc-600"
                                    />
                                    {answers[currentQ._id] && (
                                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute bottom-4 right-4 bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/30 flex items-center gap-1 backdrop-blur-md">
                                            <CheckCircle2 className="w-3 h-3" /> Recorded
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Footer Controls */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 flex items-center justify-between backdrop-blur-xl bg-white/[0.02] border border-white/[0.05] p-4 rounded-3xl shadow-2xl"
                >
                    <div className="flex items-center gap-3 pl-4 hidden md:flex">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20 flex items-center justify-center border border-yellow-500/30 shadow-[0_0_15px_rgba(250,204,21,0.15)]">
                            <span className="text-xl drop-shadow-md">🪙</span>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Reward</p>
                            <p className="text-sm text-slate-900 dark:text-white font-black"><span className="text-yellow-400">500</span> Coins / Correct</p>
                        </div>
                    </div>

                    <Button
                        onClick={handleNext}
                        disabled={!isAnswered || isSubmitting}
                        className={`ml-auto px-8 h-14 rounded-[20px] text-sm md:text-base font-black tracking-widest uppercase transition-all duration-300 relative overflow-hidden group ${isAnswered
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-slate-900 dark:text-white shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] hover:scale-[1.02]'
                            : 'bg-white/5 text-zinc-500 border border-slate-100 dark:border-white/5'
                            }`}
                    >
                        {isAnswered && (
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            {isSubmitting ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Grading...</>
                            ) : currentQuestionIndex === quiz.questions.length - 1 ? (
                                <><BrainCircuit className="w-5 h-5" /> Submit Full Quiz</>
                            ) : (
                                <>Next Question <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </span>
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
