import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Play, ChevronRight, Terminal, BookOpen, Lightbulb, Loader2, RefreshCcw, LayoutPanelLeft } from 'lucide-react'
import Editor from '@monaco-editor/react'
import axios from 'axios'
import { toast } from 'sonner'
import { CurriculumData } from '@/app/dashboard/project-builder/page'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

export default function ModuleInterface({
    curriculum,
    currentModuleIndex,
    onCompleteModule,
    onBackToDashboard
}: {
    curriculum: CurriculumData,
    currentModuleIndex: number,
    onCompleteModule: () => void,
    onBackToDashboard: () => void
}) {
    const module = curriculum.modules[currentModuleIndex]

    // We assume a single file for simplicity in this V2 MVP, but state supports maps.
    const initialCode = module.starterCode?.[0]?.code || '// Start coding here...'
    const [userCode, setUserCode] = useState(initialCode)

    // Hint System State
    const [aiHints, setAiHints] = useState<{ hint: string, level: number }[]>([])
    const [isGeneratingHint, setIsGeneratingHint] = useState(false)
    const [hintLevel, setHintLevel] = useState(1) // 1, 2, or 3

    // Validation System State
    const [isValidating, setIsValidating] = useState(false)
    const [terminalOutput, setTerminalOutput] = useState<string[]>([])
    const [moduleCompleted, setModuleCompleted] = useState(false)

    // Reset code when module changes
    useEffect(() => {
        setUserCode(module.starterCode?.[0]?.code || '// Start coding here...')
        setAiHints([])
        setHintLevel(1)
        setTerminalOutput([])
        setModuleCompleted(false)
    }, [currentModuleIndex, module])

    const handleGenerateHint = async () => {
        if (hintLevel > 3) {
            toast.info("Maximum hint level reached. Try reviewing the lesson concepts!")
            return
        }

        const token = localStorage.getItem('token')
        try {
            const res = await axios.post(`${API_URL}/projects/hint`, {
                studentCode: userCode,
                language: curriculum.language,
                moduleContext: `Module: ${module.title}. Objectives: ${module.objectives.join(', ')}.`,
                progressionLevel: hintLevel
            }, { 
                headers: { 'Authorization': `Bearer ${token}` },
                withCredentials: true 
            })

            if (res.data.success && res.data.hintData) {
                setAiHints(prev => [...prev, { hint: res.data.hintData.hint, level: hintLevel }])
                setHintLevel(hintLevel + 1)
            } else {
                toast.error("Failed to generate hint.")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error connecting to AI Tutor.")
        } finally {
            setIsGeneratingHint(false)
        }
    }

    const handleRunAndValidate = async () => {
        setIsValidating(true)
        setTerminalOutput(['Running code validation against module objectives...'])

        const token = localStorage.getItem('token')
        try {
            const res = await axios.post(`${API_URL}/projects/validate-module`, {
                studentCode: userCode,
                solutionCode: module.solutionCode?.[0]?.code || '',
                language: curriculum.language,
                moduleContext: `Module: ${module.title}. Expected Output: ${module.expectedOutput}`
            }, { 
                headers: { 'Authorization': `Bearer ${token}` },
                withCredentials: true 
            })

            if (res.data.success && res.data.validation) {
                const val = res.data.validation
                const newOutput = [
                    '> ' + (val.passed ? 'Execution Successful' : 'Execution Failed'),
                    val.feedback,
                    ...(val.missingParts && val.missingParts.length > 0 ? ['\nMissing Requirements:', ...val.missingParts.map((m: string) => `- ${m}`)] : [])
                ]

                setTerminalOutput(prev => [...prev, ...newOutput])

                if (val.passed) {
                    setModuleCompleted(true)
                    setTerminalOutput(prev => [...prev, '\n✅ All checks passed! You may proceed to the next module.'])
                }
            } else {
                setTerminalOutput(prev => [...prev, '❌ Validation error occurred.'])
            }
        } catch (error) {
            console.error(error)
            setTerminalOutput(prev => [...prev, '❌ AI Service Connection Error. Could not validate.'])
        } finally {
            setIsValidating(false)
        }
    }

    const handleResetCode = () => {
        setUserCode(initialCode)
        setTerminalOutput([])
    }

    // Determine syntax highlighting language
    let editorLang = 'javascript'
    const langLower = curriculum.language.toLowerCase()
    if (langLower.includes('python')) editorLang = 'python'
    else if (langLower.includes('typescript')) editorLang = 'typescript'
    else if (langLower.includes('html')) editorLang = 'html'
    else if (langLower.includes('css')) editorLang = 'css'
    else if (langLower.includes('java ') || langLower === 'java') editorLang = 'java'
    else if (langLower.includes('c++') || langLower.includes('cpp')) editorLang = 'cpp'
    else if (langLower.includes('rust')) editorLang = 'rust'

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-black font-sans text-sm rounded-3xl border border-white/10 shadow-2xl">
            {/* Split Pane: Left Side (Instructions 35%) */}
            <div className="w-[35%] h-full border-r border-white/10 flex flex-col bg-zinc-950/80 overflow-y-auto custom-scrollbar">
                <div className="p-6 border-b border-white/5 sticky top-0 bg-zinc-950/90 backdrop-blur z-10 flex flex-col gap-4">
                    <Button variant="ghost" onClick={onBackToDashboard} className="self-start -ml-2 text-zinc-400 hover:text-white h-8 mb-2">
                        <LayoutPanelLeft className="w-4 h-4 mr-2" /> Back to Roadmap
                    </Button>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-bold uppercase tracking-wider">
                            Module {module.moduleNumber} / {curriculum.modules.length}
                        </Badge>
                        <span className="text-zinc-500 font-medium text-xs">~{module.estimatedMinutes} min</span>
                    </div>
                    <h2 className="text-2xl font-black text-white leading-tight">{module.title}</h2>
                </div>

                <div className="p-6 space-y-8 flex-1">
                    {/* Lesson Concept */}
                    <section>
                        <h3 className="flex items-center gap-2 font-bold text-amber-400 mb-4 tracking-tight uppercase text-xs">
                            <BookOpen className="w-4 h-4" /> The Concept
                        </h3>
                        <div className="text-zinc-300 leading-relaxed bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                            {module.lessonContent}
                            <div className="mt-4 p-3 bg-amber-500/10 border-l-2 border-amber-500 text-amber-200/90 text-sm italic rounded-r-lg">
                                💡 <strong>Analogy:</strong> {module.realWorldAnalogy}
                            </div>
                        </div>
                    </section>

                    {/* Step by Step Tasks */}
                    <section>
                        <h3 className="flex items-center gap-2 font-bold text-emerald-400 mb-4 tracking-tight uppercase text-xs">
                            <CheckCircle2 className="w-4 h-4" /> Your Tasks
                        </h3>
                        <div className="space-y-4">
                            {module.steps?.map((step: any, idx: number) => (
                                <div key={idx} className="bg-white/5 rounded-xl border border-white/10 p-4 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/50 group-hover:bg-emerald-400 transition-colors" />
                                    <h4 className="font-bold text-white mb-1 pl-2">Step {step.stepNumber}: {step.title}</h4>
                                    <p className="text-zinc-400 text-sm leading-relaxed pl-2">{step.instruction}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Footer / Dynamic AI Hints */}
                <div className="p-6 border-t border-white/5 bg-zinc-950 mt-auto">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-zinc-500 uppercase">AI Tutor Assistance</span>
                        <span className="text-xs text-amber-500/50 font-mono">{aiHints.length}/3 Hints Used</span>
                    </div>

                    <div className="space-y-3 mb-4">
                        {aiHints.map((h, i) => (
                            <div key={i} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-100 text-sm animate-in fade-in slide-in-from-bottom-2">
                                <span className="font-bold text-amber-400 block mb-1">Hint Level {h.level}:</span>
                                {h.hint}
                            </div>
                        ))}
                    </div>

                    {hintLevel <= 3 && (
                        <Button
                            variant="outline"
                            onClick={handleGenerateHint}
                            disabled={isGeneratingHint}
                            className="w-full justify-start text-amber-400 border-amber-500/30 hover:bg-amber-500/10 h-10 rounded-xl font-bold"
                        >
                            {isGeneratingHint ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lightbulb className="w-4 h-4 mr-2" />}
                            {isGeneratingHint ? 'Generating Hint...' : `Get Hint Level ${hintLevel}`}
                        </Button>
                    )}
                </div>
            </div>

            {/* Split Pane: Right Side (IDE & Console 65%) */}
            <div className="w-[65%] h-full flex flex-col bg-[#1e1e1e] border-l border-black relative">
                {/* Editor Header Pane */}
                <div className="h-12 border-b border-black flex items-center justify-between px-4 bg-[#181818]">
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 rounded-md bg-zinc-800 text-zinc-300 text-xs font-mono font-medium border border-zinc-700 select-none">
                            {module.starterCode?.[0]?.filename || 'index.js'}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResetCode}
                            className="text-zinc-500 hover:text-zinc-300 h-8"
                        >
                            <RefreshCcw className="w-3.5 h-3.5 mr-2" /> Reset
                        </Button>

                        <Button
                            onClick={handleRunAndValidate}
                            disabled={isValidating || moduleCompleted}
                            className={`h-8 rounded px-4 font-bold text-xs flex items-center gap-2 transition-all ${moduleCompleted ? 'bg-emerald-500/20 text-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]'}`}
                        >
                            {isValidating ? <Loader2 className="w-3 h-3 animate-spin" /> : moduleCompleted ? <CheckCircle2 className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                            {moduleCompleted ? 'Validation Passed' : 'Run & Validate'}
                        </Button>

                        {moduleCompleted && (
                            <Button
                                onClick={onCompleteModule}
                                className="h-8 rounded px-4 font-bold text-xs bg-indigo-500 hover:bg-indigo-400 text-white flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.3)] animate-in fade-in slide-in-from-right-2"
                            >
                                Continue <ChevronRight className="w-3 h-3" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Monaco Editor Wrapper */}
                <div className="flex-1 w-full relative">
                    <Editor
                        height="100%"
                        language={editorLang}
                        theme="vs-dark"
                        value={userCode}
                        onChange={(val) => setUserCode(val || '')}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                            padding: { top: 20 },
                            scrollBeyondLastLine: false,
                            smoothScrolling: true,
                            cursorBlinking: "smooth",
                            cursorSmoothCaretAnimation: "on",
                            formatOnPaste: true,
                            bracketPairColorization: { enabled: true }
                        }}
                    />
                </div>

                {/* Simulated AI Terminal / Output Console */}
                <div className="h-64 border-t border-black bg-[#111111] flex flex-col shrink-0">
                    <div className="h-8 border-b border-black flex items-center justify-between px-4 bg-[#181818]">
                        <div className="flex items-center">
                            <Terminal className="w-3.5 h-3.5 text-zinc-500 mr-2" />
                            <span className="text-xs font-mono text-zinc-400 select-none">Terminal Output</span>
                        </div>
                        <span className="text-[10px] text-zinc-600 font-mono">Powered by Claude Validation</span>
                    </div>
                    <div className="flex-1 p-4 font-mono text-xs text-zinc-300 overflow-y-auto custom-scrollbar leading-relaxed">
                        {terminalOutput.length === 0 ? (
                            <span className="text-zinc-600">Click &apos;Run &amp; Validate&apos; to submit your code against the module objectives...</span>
                        ) : (
                            terminalOutput.map((line, i) => {
                                let textColor = 'text-zinc-300'
                                if (line.includes('❌') || line.includes('Failed') || line.includes('Missing')) textColor = 'text-rose-400'
                                if (line.includes('✅') || line.includes('Successful')) textColor = 'text-emerald-400'
                                if (line.startsWith('>')) textColor = 'text-blue-400 font-bold'

                                return (
                                    <div key={i} className={`mb-1 ${textColor}`}>
                                        {line}
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
