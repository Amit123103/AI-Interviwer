"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Trash2, Save, ArrowLeft, Copy, CheckCircle2,
    Sparkles, Brain, Code2, Server, Database, Globe,
    Layout, Shield, Clock, Loader2, Wand2, BookOpen,
    Cpu, Layers, Image as ImageIcon, GripVertical,
    ChevronDown, Zap, Target, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Question {
    text: string;
    type: "multiple_choice" | "theoretical";
    options: string[];
    correctAnswer: string;
    imageUrl?: string;
}

const TOPIC_CATEGORIES = [
    { name: "Data Structures & Algorithms", icon: Brain, color: "from-violet-500 to-purple-600", shortName: "DSA" },
    { name: "System Design", icon: Server, color: "from-cyan-500 to-blue-600", shortName: "System Design" },
    { name: "Frontend Development", icon: Layout, color: "from-amber-500 to-orange-600", shortName: "Frontend" },
    { name: "Backend Development", icon: Code2, color: "from-emerald-500 to-green-600", shortName: "Backend" },
    { name: "Database & SQL", icon: Database, color: "from-pink-500 to-rose-600", shortName: "Database" },
    { name: "DevOps & Cloud", icon: Globe, color: "from-sky-500 to-indigo-600", shortName: "DevOps" },
    { name: "Cybersecurity", icon: Shield, color: "from-red-500 to-orange-600", shortName: "Security" },
    { name: "Machine Learning & AI", icon: Cpu, color: "from-fuchsia-500 to-pink-600", shortName: "ML / AI" },
    { name: "Operating Systems", icon: Layers, color: "from-teal-500 to-cyan-600", shortName: "OS" },
];

const DIFFICULTY_LEVELS = [
    { label: "Easy", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", activeColor: "bg-emerald-500 text-slate-900 dark:text-white", icon: "🟢" },
    { label: "Medium", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", activeColor: "bg-amber-500 text-slate-900 dark:text-white", icon: "🟡" },
    { label: "Hard", color: "bg-rose-500/20 text-rose-400 border-rose-500/30", activeColor: "bg-rose-500 text-slate-900 dark:text-white", icon: "🔴" },
];

const TIMER_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

export default function CreateQuizPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [difficulty, setDifficulty] = useState("Medium");
    const [timeLimit, setTimeLimit] = useState(15);
    const [questions, setQuestions] = useState<Question[]>([
        { text: "", type: "multiple_choice", options: ["", ""], correctAnswer: "0" }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [aiQuestionCount, setAiQuestionCount] = useState(5);
    const [showAiPanel, setShowAiPanel] = useState(false);

    const handleTopicSelect = (topicName: string) => {
        setSelectedTopic(topicName);
        if (!title) setTitle(topicName + " Quiz");
    };

    const handleAddQuestion = () => {
        setQuestions([...questions, { text: "", type: "multiple_choice", options: ["", ""], correctAnswer: "0" }]);
    };

    const handleRemoveQuestion = (index: number) => {
        if (questions.length === 1) return;
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
        const newQuestions = [...questions];
        if (field === "type") {
            newQuestions[index].type = value;
            if (value === "theoretical") {
                newQuestions[index].options = [];
                newQuestions[index].correctAnswer = "";
            } else {
                newQuestions[index].options = ["", ""];
                newQuestions[index].correctAnswer = "0";
            }
        } else {
            (newQuestions[index] as any)[field] = value;
        }
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const handleAddOption = (qIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options.push("");
        setQuestions(newQuestions);
    };

    const handleRemoveOption = (qIndex: number, oIndex: number) => {
        const newQuestions = [...questions];
        if (newQuestions[qIndex].options.length <= 2) return;
        newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
        if (parseInt(newQuestions[qIndex].correctAnswer) === oIndex) {
            newQuestions[qIndex].correctAnswer = "0";
        }
        setQuestions(newQuestions);
    };

    const handleAiGenerate = useCallback(async () => {
        if (!selectedTopic && !title.trim()) {
            toast.error("Please select a topic or enter a quiz title first");
            return;
        }

        setIsAiGenerating(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/quiz/ai-suggest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    topic: selectedTopic || title,
                    difficulty,
                    count: aiQuestionCount,
                    questionType: "multiple_choice"
                })
            });

            const data = await res.json();
            if (data.success && data.questions?.length > 0) {
                setQuestions(data.questions);
                toast.success(`✨ ${data.questions.length} questions generated by AI!`);
                setShowAiPanel(false);
            } else {
                toast.error(data.error || "AI couldn't generate questions. Try again.");
            }
        } catch (error) {
            console.error(error);
            toast.error("AI Service is unavailable. Please add questions manually.");
        } finally {
            setIsAiGenerating(false);
        }
    }, [selectedTopic, title, difficulty, aiQuestionCount]);

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.error("Please enter a quiz title");
            return;
        }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.text.trim()) {
                toast.error(`Question ${i + 1} is empty`);
                return;
            }
            if (q.type === "multiple_choice") {
                for (let j = 0; j < q.options.length; j++) {
                    if (!q.options[j].trim()) {
                        toast.error(`Option ${j + 1} in Question ${i + 1} is empty`);
                        return;
                    }
                }
            } else {
                if (!q.correctAnswer.trim()) {
                    toast.error(`Please provide expected keywords for Question ${i + 1}`);
                    return;
                }
            }
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/quiz/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    isPublic,
                    questions,
                    difficulty,
                    timeLimit
                })
            });

            const data = await res.json();
            if (data.success) {
                toast.success("Quiz created successfully!");
                setGeneratedCode(data.quiz.code);
            } else {
                toast.error(data.message || "Failed to create quiz");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while creating the quiz");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filledQuestions = questions.filter(q => q.text.trim()).length;
    const completionPercent = questions.length > 0 ? Math.round((filledQuestions / questions.length) * 100) : 0;

    // --- Success Screen ---
    if (generatedCode) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 p-6 md:p-12 font-sans flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 text-center relative z-10"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6"
                    >
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Quiz Created!</h2>
                    <p className="text-slate-500 dark:text-zinc-400 mb-8">Share this code with your peers so they can join.</p>

                    <div className="bg-white dark:bg-zinc-950/50 border border-fuchsia-500/30 rounded-2xl p-6 mb-8 relative group">
                        <p className="text-5xl font-mono text-fuchsia-400 tracking-[0.2em] font-black">{generatedCode}</p>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(generatedCode);
                                toast.success("Code copied to clipboard!");
                            }}
                            className="absolute top-2 right-2 p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-500 hover:text-slate-900 dark:text-white"
                        >
                            <Copy className="w-5 h-5" />
                        </button>
                    </div>

                    <Link href="/dashboard/quiz">
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white rounded-xl h-12">
                            Return to Quiz Hub
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    // --- Main Create Quiz Page ---
    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans relative overflow-x-hidden">
            {/* Ambient Background Glows */}
            <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-fuchsia-500/8 rounded-full blur-[150px] pointer-events-none -translate-y-1/3 translate-x-1/4" />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/8 rounded-full blur-[130px] pointer-events-none translate-y-1/3 -translate-x-1/4" />
            <div className="fixed top-1/2 left-1/2 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />

            <div className="relative z-10 p-6 md:p-12">
                <div className="max-w-5xl mx-auto">

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10"
                    >
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/quiz">
                                <Button variant="ghost" size="icon" className="hover:bg-white/5 text-slate-500 dark:text-zinc-400 rounded-xl">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Create New <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-indigo-400">Quiz</span>
                                </h1>
                                <p className="text-slate-500 dark:text-zinc-400 mt-1">Design your questions, share the code, challenge your peers.</p>
                            </div>
                        </div>

                        {/* Progress Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-4"
                        >
                            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl">
                                <BookOpen className="w-4 h-4 text-fuchsia-400" />
                                <span className="text-sm text-slate-600 dark:text-zinc-300">
                                    <span className="text-fuchsia-400 font-bold">{filledQuestions}</span>/{questions.length} questions
                                </span>
                                <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden ml-2">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${completionPercent}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    <div className="space-y-8">

                        {/* ─── Topic Category Selector ─── */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-indigo-500/20 flex items-center justify-center">
                                    <Target className="w-5 h-5 text-fuchsia-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Choose a Topic</h2>
                                    <p className="text-xs text-zinc-500">Select a category or enter a custom topic below</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
                                {TOPIC_CATEGORIES.map((cat) => {
                                    const Icon = cat.icon;
                                    const isSelected = selectedTopic === cat.name;
                                    return (
                                        <motion.button
                                            key={cat.name}
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleTopicSelect(cat.name)}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300 ${isSelected
                                                ? `bg-gradient-to-br ${cat.color} border-slate-300 dark:border-white/20 shadow-lg shadow-indigo-500/10`
                                                : 'bg-white dark:bg-zinc-950/50 border-slate-100 dark:border-white/5 hover:border-white/15 hover:bg-white dark:bg-zinc-900/60'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-zinc-400'}`} />
                                            <span className={`text-[10px] font-medium text-center leading-tight ${isSelected ? 'text-slate-900 dark:text-white' : 'text-zinc-500'}`}>
                                                {cat.shortName}
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* ─── Quiz Details Card ─── */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 space-y-6"
                        >
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-2">Quiz Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Advanced System Design"
                                        className="w-full bg-white dark:bg-zinc-950/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/20 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-2">Description <span className="text-zinc-600">(Optional)</span></label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="What is this quiz about?"
                                        className="w-full bg-white dark:bg-zinc-950/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Difficulty + Timer + Public Row */}
                            <div className="grid md:grid-cols-3 gap-6">
                                {/* Difficulty Selector */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-3">Difficulty Level</label>
                                    <div className="flex gap-2">
                                        {DIFFICULTY_LEVELS.map((level) => (
                                            <button
                                                key={level.label}
                                                onClick={() => setDifficulty(level.label)}
                                                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-300 ${difficulty === level.label
                                                    ? level.activeColor + ' border-transparent shadow-lg'
                                                    : level.color + ' hover:opacity-80'
                                                    }`}
                                            >
                                                {level.icon} {level.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Timer */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-3">
                                        <Clock className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                                        Time Limit
                                    </label>
                                    <div className="flex gap-2 flex-wrap">
                                        {TIMER_OPTIONS.map((mins) => (
                                            <button
                                                key={mins}
                                                onClick={() => setTimeLimit(mins)}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${timeLimit === mins
                                                    ? 'bg-indigo-500 text-slate-900 dark:text-white border-indigo-400 shadow-lg shadow-indigo-500/20'
                                                    : 'bg-white dark:bg-zinc-950/50 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-white/10 hover:border-white/20'
                                                    }`}
                                            >
                                                {mins}m
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Public Toggle */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-3">Visibility</label>
                                    <button
                                        onClick={() => setIsPublic(!isPublic)}
                                        className={`w-full py-2.5 rounded-xl text-sm font-semibold border transition-all duration-300 flex items-center justify-center gap-2 ${isPublic
                                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                                            : 'bg-white dark:bg-zinc-950/50 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <Globe className="w-4 h-4" />
                                        {isPublic ? "Public — Visible in Catalog" : "Private — Code Only"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* ─── AI Question Suggestion Panel ─── */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-fuchsia-500/5 via-zinc-900/40 to-indigo-500/5 backdrop-blur-xl border border-fuchsia-500/20 rounded-3xl overflow-hidden"
                        >
                            <button
                                onClick={() => setShowAiPanel(!showAiPanel)}
                                className="w-full p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500/30 to-indigo-500/30 flex items-center justify-center">
                                        <Sparkles className="w-6 h-6 text-fuchsia-300" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Question Generator</h3>
                                        <p className="text-sm text-slate-500 dark:text-zinc-400">Let AI craft professional quiz questions instantly</p>
                                    </div>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-slate-500 dark:text-zinc-400 transition-transform duration-300 ${showAiPanel ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {showAiPanel && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-6 space-y-5">
                                            <div className="h-px bg-gradient-to-r from-transparent via-fuchsia-500/30 to-transparent" />

                                            <div className="grid md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-zinc-500 mb-2">Topic</label>
                                                    <div className="bg-white dark:bg-zinc-950/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-600 dark:text-zinc-300">
                                                        {selectedTopic || title || "Select a topic above"}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-zinc-500 mb-2">Number of Questions</label>
                                                    <div className="flex gap-2">
                                                        {[3, 5, 10, 15].map((n) => (
                                                            <button
                                                                key={n}
                                                                onClick={() => setAiQuestionCount(n)}
                                                                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${aiQuestionCount === n
                                                                    ? 'bg-fuchsia-500 text-slate-900 dark:text-white border-fuchsia-400'
                                                                    : 'bg-white dark:bg-zinc-950/50 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-white/10 hover:border-fuchsia-500/30'
                                                                    }`}
                                                            >
                                                                {n}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-zinc-500 mb-2">Difficulty</label>
                                                    <div className="bg-white dark:bg-zinc-950/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-600 dark:text-zinc-300 flex items-center gap-2">
                                                        {difficulty === "Easy" ? "🟢" : difficulty === "Medium" ? "🟡" : "🔴"} {difficulty}
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={handleAiGenerate}
                                                disabled={isAiGenerating || (!selectedTopic && !title.trim())}
                                                className="w-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-slate-900 dark:text-white rounded-xl h-14 text-base font-semibold disabled:opacity-50 transition-all relative overflow-hidden group"
                                            >
                                                {isAiGenerating ? (
                                                    <span className="flex items-center gap-3">
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        AI is crafting your quiz...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-3">
                                                        <Wand2 className="w-5 h-5" />
                                                        Generate {aiQuestionCount} Questions with AI
                                                    </span>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                            </Button>

                                            {(!selectedTopic && !title.trim()) && (
                                                <p className="flex items-center gap-2 text-xs text-amber-400/80">
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    Select a topic or enter a quiz title to enable AI generation
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* ─── AI Loading Skeleton ─── */}
                        <AnimatePresence>
                            {isAiGenerating && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-4"
                                >
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="bg-white dark:bg-zinc-900/40 border border-slate-100 dark:border-white/5 rounded-3xl p-6 animate-pulse">
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-zinc-800" />
                                                <div className="flex-1 space-y-3">
                                                    <div className="h-4 bg-zinc-800 rounded-lg w-3/4" />
                                                    <div className="h-3 bg-zinc-800/60 rounded-lg w-1/3" />
                                                    <div className="grid grid-cols-2 gap-2 mt-4">
                                                        <div className="h-10 bg-zinc-800/40 rounded-xl" />
                                                        <div className="h-10 bg-zinc-800/40 rounded-xl" />
                                                        <div className="h-10 bg-zinc-800/40 rounded-xl" />
                                                        <div className="h-10 bg-zinc-800/40 rounded-xl" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ─── Questions List ─── */}
                        {!isAiGenerating && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-amber-400" />
                                        Questions
                                    </h2>
                                    <span className="text-xs text-zinc-500 bg-white dark:bg-zinc-900/60 px-3 py-1.5 rounded-full border border-slate-100 dark:border-white/5">
                                        {questions.length} {questions.length === 1 ? 'question' : 'questions'}
                                    </span>
                                </div>

                                <AnimatePresence>
                                    {questions.map((q, qIndex) => (
                                        <motion.div
                                            key={qIndex}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ delay: qIndex * 0.05 }}
                                            className="bg-white dark:bg-zinc-900/40 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-3xl p-6 relative group hover:border-white/15 transition-all"
                                        >
                                            {questions.length > 1 && (
                                                <button
                                                    onClick={() => handleRemoveQuestion(qIndex)}
                                                    className="absolute top-6 right-6 text-zinc-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-rose-500/10 rounded-xl"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}

                                            <div className="flex flex-col md:flex-row gap-4 mb-6 pr-12">
                                                <div className="flex items-start gap-3 md:gap-4">
                                                    <span className="bg-gradient-to-br from-fuchsia-500/20 to-indigo-500/20 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-fuchsia-300 shrink-0 text-sm border border-fuchsia-500/20">
                                                        {qIndex + 1}
                                                    </span>
                                                </div>
                                                <div className="flex-1 space-y-4">
                                                    <input
                                                        type="text"
                                                        value={q.text}
                                                        onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                                                        placeholder="Enter question text..."
                                                        className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 px-0 py-2 text-slate-900 dark:text-white text-lg focus:outline-none focus:border-fuchsia-500/50 transition-colors placeholder:text-zinc-600"
                                                    />

                                                    <select
                                                        value={q.type}
                                                        onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
                                                        className="bg-white dark:bg-zinc-950/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-600 dark:text-zinc-300 text-sm focus:outline-none focus:border-fuchsia-500/50 cursor-pointer"
                                                    >
                                                        <option value="multiple_choice">Multiple Choice</option>
                                                        <option value="theoretical">Theoretical (Keyword Match)</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Multiple Choice Options */}
                                            {q.type === 'multiple_choice' && (
                                                <div className="pl-0 md:pl-14 space-y-3">
                                                    {q.options.map((opt, oIndex) => (
                                                        <div key={oIndex} className="flex items-center gap-3">
                                                            <input
                                                                type="radio"
                                                                name={`correct-${qIndex}`}
                                                                checked={q.correctAnswer === String(oIndex)}
                                                                onChange={() => handleQuestionChange(qIndex, 'correctAnswer', String(oIndex))}
                                                                className="w-4 h-4 text-emerald-500 bg-white dark:bg-zinc-900 border-slate-300 dark:border-white/20 focus:ring-emerald-500 focus:ring-offset-zinc-900 cursor-pointer"
                                                                title="Mark as correct answer"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={opt}
                                                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                                placeholder={`Option ${oIndex + 1}`}
                                                                className={`flex-1 bg-white dark:bg-zinc-950/50 border rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none ${q.correctAnswer === String(oIndex)
                                                                    ? 'border-emerald-500/50 text-emerald-100 bg-emerald-500/5'
                                                                    : 'border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-fuchsia-500/50'
                                                                    }`}
                                                            />
                                                            {q.options.length > 2 && (
                                                                <button
                                                                    onClick={() => handleRemoveOption(qIndex, oIndex)}
                                                                    className="text-zinc-600 hover:text-rose-400 p-2 hover:bg-rose-500/10 rounded-lg transition-all"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => handleAddOption(qIndex)}
                                                        className="text-fuchsia-400 text-sm font-medium hover:text-fuchsia-300 flex items-center gap-1 mt-2 transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" /> Add Option
                                                    </button>
                                                </div>
                                            )}

                                            {/* Theoretical */}
                                            {q.type === 'theoretical' && (
                                                <div className="pl-0 md:pl-14">
                                                    <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-2">Expected Keywords (comma separated)</label>
                                                    <input
                                                        type="text"
                                                        value={q.correctAnswer}
                                                        onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                                                        placeholder="e.g. scalable, database, index"
                                                        className="w-full bg-white dark:bg-zinc-950/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                                    />
                                                    <p className="text-xs text-zinc-500 mt-2">If the student&apos;s answer contains any of these keywords, it will be marked correct.</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                <Button
                                    onClick={handleAddQuestion}
                                    variant="outline"
                                    className="w-full border-dashed border-slate-300 dark:border-white/20 bg-transparent hover:bg-white/5 text-slate-600 dark:text-zinc-300 rounded-2xl h-14 transition-all hover:border-fuchsia-500/30"
                                >
                                    <Plus className="w-5 h-5 mr-2" /> Add Next Question
                                </Button>
                            </div>
                        )}

                        {/* ─── Submit Section ─── */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-3 text-sm text-zinc-500">
                                <div className={`w-2.5 h-2.5 rounded-full ${filledQuestions === questions.length && questions.length > 0 ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                                {filledQuestions === questions.length && questions.length > 0
                                    ? <span className="text-emerald-400">All questions filled — Ready to publish</span>
                                    : <span>{questions.length - filledQuestions} question(s) still need text</span>
                                }
                            </div>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-slate-900 dark:text-white px-10 h-12 rounded-xl text-base font-semibold min-w-[220px] shadow-lg shadow-fuchsia-500/20 transition-all relative overflow-hidden group"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" /> Generating Code...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Save className="w-5 h-5" /> Create & Share
                                    </span>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </Button>
                        </motion.div>

                    </div>
                </div>
            </div>
        </div>
    );
}
