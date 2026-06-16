"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import axios from "axios"
import { Settings, Save, Loader2, Mic, Gauge, Languages, BrainCircuit, Zap, Target, Sparkles, ShieldAlert, Timer } from "lucide-react"

export default function PreferencesPanel({ user }: { user: any }) {
    const [loading, setLoading] = useState(false)
    const [prefs, setPrefs] = useState({
        defaultVoice: user.preferences?.defaultVoice || "Female (Alloy)",
        defaultDifficulty: user.preferences?.defaultDifficulty || "Intermediate",
        defaultQuestionCount: user.preferences?.defaultQuestionCount || 10,
        language: user.preferences?.language || "English",
        strictness: user.preferences?.strictness || "Balanced",
        pace: user.preferences?.pace || "Standard"
    })

    const applySmartProfile = (profile: 'faang' | 'beginner' | 'behavioral') => {
        let newPrefs = { ...prefs };
        switch (profile) {
            case 'faang':
                newPrefs = { ...newPrefs, defaultDifficulty: 'Advanced', strictness: 'Strict', pace: 'Rapid-Fire', defaultQuestionCount: 15 };
                toast.success("FAANG profile applied");
                break;
            case 'beginner':
                newPrefs = { ...newPrefs, defaultDifficulty: 'Easy', strictness: 'Lenient', pace: 'Deliberate', defaultQuestionCount: 5 };
                toast.success("Beginner profile applied");
                break;
            case 'behavioral':
                newPrefs = { ...newPrefs, defaultDifficulty: 'Intermediate', strictness: 'Balanced', pace: 'Standard', defaultQuestionCount: 8 };
                toast.success("Behavioral profile applied");
                break;
        }
        setPrefs(newPrefs);
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/user/settings/preferences`,
                prefs,
                { headers: { Authorization: `Bearer ${user.token}` } }
            )
            toast.success("Preferences saved")
            const newUser = { ...user, preferences: { ...user.preferences, ...prefs } }
            localStorage.setItem("user", JSON.stringify(newUser))
        } catch (err) {
            console.error("Error saving preferences:", err)
            toast.error("Failed to save preferences")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <section className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Quick Presets</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={() => applySmartProfile('faang')} className="p-5 border border-slate-200 dark:border-white/10 rounded-2xl text-left hover:border-blue-500 transition-all bg-white dark:bg-white/5 shadow-sm group">
                        <ShieldAlert className="w-6 h-6 text-rose-500 mb-3" />
                        <h4 className="font-bold text-slate-900 dark:text-white">FAANG Prep</h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Advanced difficulty, strict feedback, rapid pace.</p>
                    </button>
                    <button onClick={() => applySmartProfile('beginner')} className="p-5 border border-slate-200 dark:border-white/10 rounded-2xl text-left hover:border-blue-500 transition-all bg-white dark:bg-white/5 shadow-sm">
                        <Target className="w-6 h-6 text-emerald-500 mb-3" />
                        <h4 className="font-bold text-slate-900 dark:text-white">Beginner</h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Easy difficulty, lenient feedback, steady pace.</p>
                    </button>
                    <button onClick={() => applySmartProfile('behavioral')} className="p-5 border border-slate-200 dark:border-white/10 rounded-2xl text-left hover:border-blue-500 transition-all bg-white dark:bg-white/5 shadow-sm">
                        <BrainCircuit className="w-6 h-6 text-blue-500 mb-3" />
                        <h4 className="font-bold text-slate-900 dark:text-white">Behavioral</h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Intermediate difficulty, balanced feedback.</p>
                    </button>
                </div>
            </section>

            <section className="grid gap-8 p-6 border border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-white/5 shadow-sm">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                            <Gauge className="w-4 h-4 text-slate-400" /> Technical difficulty
                        </label>
                        <div className="flex bg-slate-100 dark:bg-black/20 p-1 rounded-lg">
                            {["Easy", "Intermediate", "Advanced"].map(level => (
                                <button
                                    key={level}
                                    onClick={() => setPrefs({ ...prefs, defaultDifficulty: level })}
                                    className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${prefs.defaultDifficulty === level ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-slate-400" /> Feedback strictness
                        </label>
                        <div className="flex bg-slate-100 dark:bg-black/20 p-1 rounded-lg">
                            {["Lenient", "Balanced", "Strict"].map(level => (
                                <button
                                    key={level}
                                    onClick={() => setPrefs({ ...prefs, strictness: level })}
                                    className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${prefs.strictness === level ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                            <Mic className="w-4 h-4 text-slate-400" /> Interview voice
                        </label>
                        <Select value={prefs.defaultVoice} onValueChange={(val) => setPrefs({ ...prefs, defaultVoice: val })}>
                            <SelectTrigger className="h-10 rounded-lg">
                                <SelectValue placeholder="Voice" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Female (Alloy)">Female (Alloy)</SelectItem>
                                <SelectItem value="Female (Emma)">Female (Emma)</SelectItem>
                                <SelectItem value="Male (Echo)">Male (Echo)</SelectItem>
                                <SelectItem value="Male (Ryan)">Male (Ryan)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                            <Languages className="w-4 h-4 text-slate-400" /> Language
                        </label>
                        <Select value={prefs.language} onValueChange={(val) => setPrefs({ ...prefs, language: val })}>
                            <SelectTrigger className="h-10 rounded-lg">
                                <SelectValue placeholder="Lang" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="English">English</SelectItem>
                                <SelectItem value="Hindi">Hindi</SelectItem>
                                <SelectItem value="Spanish">Spanish</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Session length</label>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 px-2 py-1 bg-blue-50 dark:bg-blue-500/10 rounded">{prefs.defaultQuestionCount} questions</span>
                    </div>
                    <Slider
                        value={[prefs.defaultQuestionCount]}
                        max={15}
                        min={3}
                        step={1}
                        onValueChange={(val) => setPrefs({ ...prefs, defaultQuestionCount: val[0] })}
                    />
                </div>
            </section>

            <div className="flex justify-end pt-4">
                <Button onClick={handleSave} disabled={loading} className="h-11 px-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save preferences
                </Button>
            </div>
        </div>
    )
}

function Layers(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polygon points="12 2 22 8.5 12 15 2 8.5 12 2" />
            <polyline points="2 12 12 18.5 22 12" />
            <polyline points="2 15.5 12 22 22 15.5" />
        </svg>
    )
}
