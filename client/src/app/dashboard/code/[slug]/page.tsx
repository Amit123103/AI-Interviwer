
"use client"

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Editor from "@monaco-editor/react";
import { codingApi, ProblemDetail } from '@/lib/api/coding';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Loader2, Play, Send, ChevronLeft, CheckCircle2, XCircle,
    AlertTriangle, Terminal, Sparkles, Code2, Clock,
    Copy, Check, Lightbulb, Search, Zap, Brain, Eye
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import ReactConfetti from 'react-confetti';
import { CodeRunner } from '@/components/dashboard/code/CodeRunner';
import { motion, AnimatePresence } from 'framer-motion';

// Language icon mapping
const LANG_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
    javascript: { label: 'JavaScript', color: 'text-amber-400', icon: 'JS' },
    python: { label: 'Python', color: 'text-blue-400', icon: 'PY' },
    java: { label: 'Java', color: 'text-orange-400', icon: 'JV' },
    cpp: { label: 'C++', color: 'text-cyan-400', icon: 'C++' },
};

export default function CodingWorkspace() {
    const { slug } = useParams();
    const router = useRouter();

    // State
    const [problem, setProblem] = useState<ProblemDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState('');
    const [output, setOutput] = useState<any>(null);
    const [executing, setExecuting] = useState(false);
    const [activeTab, setActiveTab] = useState<'description' | 'submissions'>('description');
    const [showConfetti, setShowConfetti] = useState(false);
    const [consoleOutput, setConsoleOutput] = useState<string>('');
    const [analysisOutput, setAnalysisOutput] = useState<string>('');
    const [executionStats, setExecutionStats] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const [timer, setTimer] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const timerRef = useRef<any>(null);

    // Timer
    useEffect(() => {
        if (timerActive) {
            timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [timerActive]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    // Fetch Problem
    useEffect(() => {
        if (!slug) return;
        const fetchProblem = async () => {
            try {
                const data = await codingApi.getProblem(slug as string);
                setProblem(data);
                setCode(data.starterCode?.javascript || '// Write your solution here\n');
                setTimerActive(true);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProblem();
    }, [slug]);

    // Handle Language Change
    const handleLanguageChange = (lang: string) => {
        setLanguage(lang);
        if (problem?.starterCode) {
            const langKey = lang as keyof typeof problem.starterCode;
            const starter = problem.starterCode[langKey];
            setCode(starter || `// No starter code available for ${LANG_CONFIG[lang]?.label || lang}`);
        }
    };

    // Run Code — Real API
    const handleRun = useCallback(async () => {
        if (!problem) return;
        setExecuting(true);
        setOutput(null);
        setConsoleOutput('');
        setAnalysisOutput('');
        setExecutionStats(null);

        try {
            const result = await codingApi.runCode({
                code,
                language,
                problemId: problem._id
            });

            // Handle response — server returns { status, output, results, passed, runtime, memory, error, errorType }
            if (result.results && result.results.length > 0) {
                // Structured test results from execution service
                setOutput(result.results);
                setExecutionStats({ runtime: result.runtime || 0, memory: result.memory || 0 });
                setConsoleOutput(result.results.map((r: any, i: number) =>
                    `${r.passed ? '✅' : '❌'} Case ${i + 1}: ${r.passed ? 'Passed' : 'Failed'} | Input: ${r.input} | Expected: ${r.expected} | Got: ${r.actual}${r.error ? ' | Error: ' + r.error : ''}`
                ).join('\n'));
            } else if (result.output && !result.error) {
                // Script/playground-style output
                setConsoleOutput(result.stdout || result.output || '');
                setOutput(null);
            } else if (result.error) {
                const errorLabel = result.errorType ? `[${result.status || 'Error'}]` : '[Error]';
                setOutput({ error: result.error });
                setConsoleOutput(`${errorLabel} ${result.error}`);
            }
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data?.error || err.message || 'Failed to execute code';
            setOutput({ error: errorMsg });
            setConsoleOutput(`[Error] ${errorMsg}`);
        } finally {
            setExecuting(false);
        }
    }, [problem, code, language]);

    // Submit Code
    const handleSubmit = useCallback(async () => {
        if (!problem) return;
        setExecuting(true);
        setOutput(null);
        setConsoleOutput('');
        setAnalysisOutput('');
        setExecutionStats(null);

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const urlParams = new URLSearchParams(window.location.search);
            const contestId = urlParams.get('contestId');

            const res = await codingApi.submitCode({
                userId: user._id,
                problemId: problem._id,
                code,
                language,
                contestId: contestId || undefined
            });

            // Submit returns a Submission object: { _id, status, runtime, memory, testCasesPassed, totalTestCases, failureDetail, ... }
            const submission = res.submission || res;
            setExecutionStats({ runtime: submission.runtime || 0, memory: submission.memory || 0 });

            // Build test result display from submission data
            if (submission.totalTestCases) {
                const passed = submission.testCasesPassed || 0;
                const total = submission.totalTestCases || 0;
                const results = Array.from({ length: total }, (_, i) => ({
                    passed: i < passed,
                    input: i === 0 && submission.failureDetail?.input ? submission.failureDetail.input : `Case ${i + 1}`,
                    expected: i === 0 && submission.failureDetail?.expectedOutput ? submission.failureDetail.expectedOutput : '-',
                    actual: i === 0 && submission.failureDetail?.actualOutput ? submission.failureDetail.actualOutput : (i < passed ? '✓' : '-'),
                    error: i === 0 && !submission.failureDetail ? undefined : (i >= passed && submission.failureDetail?.error) ? submission.failureDetail.error : undefined,
                }));
                setOutput(results);
            }

            if (submission.status === 'Accepted') {
                setShowConfetti(true);
                setTimerActive(false);
                setTimeout(() => setShowConfetti(false), 5000);
                setConsoleOutput(`✅ All test cases passed! Solution accepted! 🎉\n⏱ Runtime: ${submission.runtime || 0}ms | 💾 Memory: ${((submission.memory || 0) / 1024).toFixed(1)}MB`);
            } else {
                const statusMsg = submission.status || 'Wrong Answer';
                let detail = `❌ ${statusMsg}`;
                if (submission.testCasesPassed !== undefined) {
                    detail += ` — ${submission.testCasesPassed}/${submission.totalTestCases} test cases passed`;
                }
                if (submission.failureDetail?.error) {
                    detail += `\nError: ${submission.failureDetail.error}`;
                }
                setConsoleOutput(detail);
            }
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data?.error || 'Failed to submit code';
            setOutput({ status: 'Error', error: errorMsg });
            setConsoleOutput(`[Error] ${errorMsg}`);
        } finally {
            setExecuting(false);
        }
    }, [problem, code, language]);

    // AI Features
    const handleHint = useCallback(async () => {
        if (!problem) return;
        setAnalysisOutput('💡 Generating hint...');
        try {
            const res = await codingApi.getHint({
                problem_title: problem.title,
                problem_description: problem.description,
                user_code: code,
                language
            });
            setAnalysisOutput(`💡 Hint:\n\n${res.hint}`);
        } catch {
            setAnalysisOutput('[Error] Failed to get hint');
        }
    }, [problem, code, language]);

    const handleAnalyze = useCallback(async () => {
        if (!problem) return;
        setAnalysisOutput('🔍 Analyzing code complexity...');
        try {
            const res = await codingApi.analyzeCode({
                problem_title: problem.title,
                user_code: code,
                language
            });
            setAnalysisOutput(
                `🔍 Code Analysis\n\n⏱ Time Complexity: ${res.timeComplexity}\n💾 Space Complexity: ${res.spaceComplexity}\n⭐ Rating: ${res.rating}\n\nImprovements:\n${(res.improvements || []).map((i: any) => `  • ${i}`).join('\n')}`
            );
        } catch {
            setAnalysisOutput('[Error] Failed to analyze code');
        }
    }, [problem, code, language]);

    const handleAutoFix = useCallback(async () => {
        if (!problem) return;
        setAnalysisOutput('🔧 AI is reviewing your code for fixes...');
        try {
            const res = await codingApi.autoFix({
                problem_title: problem.title,
                user_code: code,
                language,
                error_message: output?.error || ''
            });
            let fixText = `🔧 Auto-Fix Report  (Score: ${res.overallScore}/10)\n${res.summary}\n\n`;
            if (res.fixes?.length > 0) {
                res.fixes.forEach((f: any, i: number) => {
                    fixText += `━━━ Fix ${i + 1} [${f.type?.toUpperCase()}] ━━━\n`;
                    fixText += `Issue: ${f.issue}\nFix: ${f.suggestion}\n`;
                    if (f.improvedCode) fixText += `Code: ${f.improvedCode}\n`;
                    fixText += '\n';
                });
            } else {
                fixText += '✅ No issues found! Your code looks clean.';
            }
            setAnalysisOutput(fixText);
        } catch {
            setAnalysisOutput('[Error] Failed to get auto-fix suggestions');
        }
    }, [problem, code, language, output]);

    const handleEdgeCases = useCallback(async () => {
        if (!problem) return;
        setAnalysisOutput('🎯 Generating tricky edge cases...');
        try {
            const res = await codingApi.getEdgeCases({
                problem_title: problem.title,
                problem_description: problem.description || '',
                user_code: code,
                language
            });
            let text = '🎯 Edge Case Analysis\n\n';
            if (res.edgeCases?.length > 0) {
                res.edgeCases.forEach((ec: any, i: number) => {
                    text += `${i + 1}. Input: ${ec.input}\n   Expected: ${ec.expectedBehavior}\n   Why tricky: ${ec.whyTricky}\n\n`;
                });
            }
            if (res.vulnerabilities?.length > 0) {
                text += '⚠️ Vulnerabilities:\n' + res.vulnerabilities.map((v: any) => `  • ${v}`).join('\n');
            }
            setAnalysisOutput(text);
        } catch {
            setAnalysisOutput('[Error] Failed to generate edge cases');
        }
    }, [problem, code, language]);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleRun();
            }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handleRun, handleSubmit]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white aurora-glow relative overflow-hidden">
                <div className="absolute top-20 left-10 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
                <div className="absolute bottom-20 right-20 w-72 h-72 bg-cyan-500/4 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-5 relative z-10"
                >
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center border border-violet-500/20 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
                        <Loader2 className="animate-spin text-violet-400 w-7 h-7" />
                    </div>
                    <div className="text-center space-y-1">
                        <h2 className="text-base font-black uppercase tracking-tight bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Loading Workspace</h2>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-black">Preparing your coding environment...</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white aurora-glow relative overflow-hidden">
                <div className="absolute top-20 left-10 w-80 h-80 bg-red-500/3 rounded-full blur-[140px] pointer-events-none" />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-zinc-900/40 backdrop-blur-2xl border border-red-500/10 p-8 rounded-2xl text-center max-w-sm relative z-10">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
                    <Code2 className="w-10 h-10 text-red-400 mx-auto mb-4" />
                    <h2 className="text-lg font-black text-red-300 mb-2">Problem Not Found</h2>
                    <p className="text-zinc-500 text-sm mb-4">The problem you&apos;re looking for doesn&apos;t exist.</p>
                    <Button onClick={() => router.back()} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-slate-900 dark:text-white border-0 font-black text-[10px] uppercase tracking-widest">Go Back</Button>
                </motion.div>
            </div>
        );
    }

    const diffConfig = {
        Easy: { color: 'text-emerald-400', bgColor: 'bg-emerald-400/10', borderColor: 'border-emerald-500/20', shadow: 'shadow-[0_0_12px_rgba(16,185,129,0.1)]' },
        Medium: { color: 'text-amber-400', bgColor: 'bg-amber-400/10', borderColor: 'border-amber-500/20', shadow: 'shadow-[0_0_12px_rgba(245,158,11,0.1)]' },
        Hard: { color: 'text-rose-400', bgColor: 'bg-rose-400/10', borderColor: 'border-rose-500/20', shadow: 'shadow-[0_0_12px_rgba(244,63,94,0.1)]' },
    };
    const diff = diffConfig[problem.difficulty as keyof typeof diffConfig] || diffConfig.Easy;
    const langConf = LANG_CONFIG[language] || LANG_CONFIG.javascript;

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white overflow-hidden relative aurora-glow">
            {/* Ambient glow */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-violet-500/3 rounded-full blur-[140px] pointer-events-none orb-float" />
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-500/3 rounded-full blur-[120px] pointer-events-none orb-float" style={{ animationDelay: '3s' }} />
            {showConfetti && <ReactConfetti numberOfPieces={200} recycle={false} />}

            {/* Header HUD */}
            <div className="h-14 border-b border-white/[0.06] flex items-center justify-between px-3 sm:px-4 bg-white dark:bg-zinc-900/60 backdrop-blur-2xl relative z-10">
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500/15 to-transparent" />

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-zinc-600 hover:text-violet-400 transition-colors w-8 h-8">
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-2.5">
                        <h1 className="font-black text-sm tracking-tight truncate max-w-[200px] sm:max-w-[300px]">{problem.title}</h1>
                        <Badge variant="outline" className={`border-0 text-[8px] font-black uppercase tracking-widest ${diff.color} ${diff.bgColor} ${diff.shadow} px-2 py-0.5`}>
                            {problem.difficulty}
                        </Badge>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Timer */}
                    <div className="hidden sm:flex items-center gap-1.5 bg-zinc-800/50 border border-white/[0.04] rounded-lg px-2.5 py-1">
                        <Clock className="w-3 h-3 text-violet-400" />
                        <span className="text-[10px] font-mono font-black text-slate-500 dark:text-zinc-400">{formatTime(timer)}</span>
                    </div>

                    {/* Language selector */}
                    <Select value={language} onValueChange={handleLanguageChange}>
                        <SelectTrigger className="w-[110px] h-8 bg-white dark:bg-black/40 border-white/[0.06] text-[10px] font-black uppercase tracking-widest focus:ring-violet-500/20 rounded-lg">
                            <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(LANG_CONFIG).map(([key, conf]) => (
                                <SelectItem key={key} value={key}>
                                    <span className={conf.color}>{conf.label}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Run button */}
                    <Button
                        size="sm"
                        className="h-8 gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-slate-900 dark:text-white font-black text-[9px] uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] border-0 transition-all rounded-lg"
                        onClick={handleRun}
                        disabled={executing}
                    >
                        {executing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                        <span className="hidden sm:inline">Run</span>
                    </Button>

                    {/* Submit button */}
                    <Button
                        size="sm"
                        className="h-8 gap-1.5 bg-gradient-to-r from-emerald-600 to-green-600 text-slate-900 dark:text-white font-black text-[9px] uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] border-0 transition-all rounded-lg"
                        onClick={handleSubmit}
                        disabled={executing}
                    >
                        {executing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        <span className="hidden sm:inline">Submit</span>
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                {/* Left Panel: Problem Description */}
                <div className="w-full md:w-[380px] lg:w-[420px] border-r border-white/[0.06] flex flex-col bg-white dark:bg-zinc-900/30 backdrop-blur-xl relative z-10 shrink-0">

                    {/* Tabs */}
                    <div className="flex border-b border-white/[0.06] justify-between items-center pr-2">
                        <div className="flex">
                            {['description', 'submissions'].map(tab => (
                                <button
                                    key={tab}
                                    className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === tab
                                        ? 'border-violet-500 text-violet-400 shadow-[0_2px_10px_rgba(139,92,246,0.15)]'
                                        : 'border-transparent text-zinc-600 hover:text-slate-900 dark:text-zinc-400'
                                        }`}
                                    onClick={() => setActiveTab(tab as any)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[9px] font-black uppercase tracking-widest text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                            onClick={handleHint}
                        >
                            <Lightbulb className="w-3 h-3 mr-1" /> Hint
                        </Button>
                    </div>

                    {/* Description Content */}
                    <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                        {activeTab === 'description' ? (
                            <div className="space-y-6">
                                {/* Problem description */}
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <div className="whitespace-pre-wrap text-slate-500 dark:text-zinc-400 text-sm leading-relaxed">
                                        {problem.description}
                                    </div>
                                </div>

                                {/* Examples */}
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.15em] bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Examples</h3>
                                    {problem.examples.map((ex, i) => (
                                        <div key={i} className="bg-white dark:bg-black/40 rounded-xl p-4 border border-white/[0.04] hover:border-violet-500/10 transition-all space-y-2 group">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-violet-400/50">Example {i + 1}</div>
                                            <div className="font-mono text-sm">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-700 block mb-1">Input</span>
                                                <div className="text-cyan-300 bg-white dark:bg-black/30 rounded-lg p-2 border border-white/[0.03]">{ex.input}</div>
                                            </div>
                                            <div className="font-mono text-sm">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-700 block mb-1">Output</span>
                                                <div className="text-emerald-300 bg-white dark:bg-black/30 rounded-lg p-2 border border-white/[0.03]">{ex.output}</div>
                                            </div>
                                            {ex.explanation && (
                                                <div className="text-xs text-zinc-500 mt-2 p-2 bg-white/[0.02] rounded-lg border border-white/[0.03]">
                                                    <Eye className="w-3 h-3 inline mr-1 text-zinc-600" /> {ex.explanation}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Constraints */}
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-cyan-400/60 mb-3">Constraints</h3>
                                    <ul className="space-y-1.5">
                                        {problem.constraints.map((c, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-zinc-500">
                                                <span className="text-cyan-500/40 mt-1 shrink-0">•</span>
                                                <code className="text-slate-500 dark:text-zinc-400 text-xs bg-zinc-800/50 px-1.5 py-0.5 rounded">{c}</code>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Tags */}
                                {problem.tags && problem.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.04]">
                                        {problem.tags.map((tag, i) => (
                                            <span key={i} className="text-[9px] font-bold text-zinc-600 bg-zinc-800/50 px-2 py-1 rounded-md border border-white/[0.03]">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-12 h-12 bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-3 border border-white/[0.04]">
                                    <Terminal className="w-5 h-5 text-zinc-600" />
                                </div>
                                <p className="text-sm text-zinc-600 font-medium">No past submissions yet</p>
                                <p className="text-[10px] text-zinc-700 mt-1">Submit your solution to see it here</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Editor & Terminal */}
                <div className="flex-1 flex flex-col min-w-0 relative z-10">

                    {/* Editor Area */}
                    <div className="flex-1 min-h-0 relative">
                        {/* AI Tool Buttons — floating over editor */}
                        <div className="absolute top-2 right-4 z-20 flex gap-1.5">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-7 text-[9px] font-black uppercase tracking-widest bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.05)] transition-all rounded-lg"
                                onClick={handleAnalyze}
                            >
                                <Search className="w-3 h-3 mr-1" /> Analyze
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-7 text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)] transition-all rounded-lg"
                                onClick={handleAutoFix}
                            >
                                <Zap className="w-3 h-3 mr-1" /> Fix
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-7 text-[9px] font-black uppercase tracking-widest bg-amber-500/10 backdrop-blur-xl border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.05)] transition-all rounded-lg"
                                onClick={handleEdgeCases}
                            >
                                <Brain className="w-3 h-3 mr-1" /> Edge
                            </Button>
                            <button
                                onClick={handleCopy}
                                className="h-7 w-7 flex items-center justify-center rounded-lg bg-zinc-800/50 backdrop-blur-xl border border-white/[0.06] text-zinc-500 hover:text-slate-900 dark:text-white hover:bg-zinc-700/50 transition-all"
                            >
                                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                        </div>

                        {/* Language badge */}
                        <div className="absolute top-2 left-4 z-20">
                            <div className={`flex items-center gap-1 bg-white dark:bg-black/60 backdrop-blur-xl border border-white/[0.06] rounded-md px-2 py-1`}>
                                <span className={`text-[9px] font-black ${langConf.color}`}>{langConf.icon}</span>
                                <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">{langConf.label}</span>
                            </div>
                        </div>

                        <Editor
                            height="100%"
                            defaultLanguage={language}
                            language={language}
                            theme="vs-dark"
                            value={code}
                            onChange={(value) => setCode(value || "")}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                padding: { top: 42 },
                                fontFamily: 'JetBrains Mono, Fira Code, Cascadia Code, monospace',
                                fontLigatures: true,
                                lineHeight: 22,
                                renderLineHighlight: 'all',
                                cursorBlinking: 'smooth',
                                cursorSmoothCaretAnimation: 'on',
                                smoothScrolling: true,
                                scrollBeyondLastLine: false,
                                bracketPairColorization: { enabled: true },
                                guides: { bracketPairs: true },
                            }}
                        />
                    </div>

                    {/* Terminal / Code Runner */}
                    <div className="h-[280px] min-h-[200px] shrink-0">
                        <CodeRunner
                            onRun={handleRun}
                            onSubmit={handleSubmit}
                            isRunning={executing}
                            isSubmitting={false}
                            testCases={problem?.examples.map(ex => ({
                                input: ex.input,
                                output: ex.output
                            })) || []}
                            testResults={Array.isArray(output) ? output : null}
                            executionStats={executionStats}
                            error={output && !Array.isArray(output) && output.error ? output.error : undefined}
                            consoleOutput={consoleOutput}
                            analysisOutput={analysisOutput}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
