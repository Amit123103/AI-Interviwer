import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Rocket, Terminal, Layout, Sparkles, Shuffle } from 'lucide-react'
import { PROJECT_IDEAS } from './ProjectData'

export default function ProjectSelector({
    category,
    language,
    onSelect,
    onBack
}: {
    category: string,
    language: any,
    onSelect: (idea: string) => void,
    onBack: () => void
}) {
    const [customIdea, setCustomIdea] = useState('')
    const suggestions = PROJECT_IDEAS[category] || PROJECT_IDEAS['core']

    const getDiffColor = (diff: string) => {
        if (diff === 'Beginner') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        if (diff === 'Intermediate') return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    }

    const selectSurprise = () => {
        const randomProj = suggestions[Math.floor(Math.random() * suggestions.length)]
        onSelect(randomProj.title)
    }

    return (
        <div className="w-full flex-col max-w-6xl mx-auto pb-20">
            {/* Header / Nav */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-white/10 gap-4">
                <Button variant="ghost" onClick={onBack} className="text-zinc-400 hover:text-white shrink-0">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Languages
                </Button>
                <div className="flex items-center gap-3">
                    <span className="text-zinc-500 font-medium hidden md:inline">Building with</span>
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-black tracking-widest text-sm shadow-sm">
                        {language.icon} <span className="uppercase">{language.name}</span>
                    </div>
                </div>
            </div>

            <div className="text-center mb-10 w-full max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
                    What do you want to <span className="text-emerald-400">Build?</span>
                </h2>
                <p className="text-zinc-400 text-lg">
                    Select one of our curated {language.name} projects below, or let the AI guide you through your own custom idea.
                </p>
            </div>

            {/* Custom Project Builder Input */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl mx-auto mb-12">
                <Card className="bg-black/60 backdrop-blur-3xl border-2 border-indigo-500/30 rounded-[2rem] p-6 md:p-8 shadow-[0_0_50px_rgba(99,102,241,0.15)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-fuchsia-500/5 to-emerald-500/5 opacity-50" />

                    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30 shadow-inner">
                            <Sparkles className="w-8 h-8 text-indigo-400" />
                        </div>
                        <div className="flex-1 w-full space-y-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                Have a specific idea?
                            </h3>
                            <div className="relative">
                                <textarea
                                    value={customIdea}
                                    onChange={(e) => setCustomIdea(e.target.value)}
                                    placeholder={`e.g. "I want to build a ${language.name} script that scrapes Hacker News and sends me an email summary of top posts..."`}
                                    className="w-full bg-zinc-950/80 border border-white/10 rounded-2xl p-4 min-h-[120px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/80 resize-none transition-all shadow-inner text-lg leading-relaxed"
                                />
                                <div className="absolute right-4 bottom-4 flex gap-3">
                                    <Button
                                        disabled={customIdea.trim().length < 10}
                                        onClick={() => onSelect(customIdea)}
                                        className="bg-indigo-500 hover:bg-indigo-400 text-white font-black px-8 py-6 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all focus:scale-95 disabled:opacity-50"
                                    >
                                        Generate Custom Path <Rocket className="w-5 h-5 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Suggested Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 w-full max-w-5xl mx-auto">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <Layout className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight">Curated Projects</h3>
                </div>
                <Button variant="outline" onClick={selectSurprise} className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 font-bold px-6 rounded-xl shrink-0">
                    <Shuffle className="w-4 h-4 mr-2" /> Surprise Me!
                </Button>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
                {suggestions.map((proj, i) => (
                    <motion.div
                        key={proj.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card
                            className="group relative overflow-hidden rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-6 md:p-8 hover:bg-zinc-800/80 hover:border-emerald-500/40 transition-all duration-500 flex flex-col h-full cursor-pointer hover:-translate-y-2 shadow-lg"
                            onClick={() => onSelect(proj.title)}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-6">
                                    <Badge variant="outline" className={`font-bold px-3 py-1 ${getDiffColor(proj.difficulty)}`}>
                                        {proj.difficulty}
                                    </Badge>
                                    <div className="text-xs font-black text-zinc-500 uppercase tracking-widest bg-zinc-950/50 px-3 py-1 rounded-full border border-white/5">
                                        {proj.estimated}
                                    </div>
                                </div>

                                <h4 className="text-2xl font-black text-white mb-3 group-hover:text-emerald-400 transition-colors tracking-tight leading-snug">{proj.title}</h4>
                                <p className="text-zinc-400 mb-8 leading-relaxed flex-1 text-sm">{proj.desc}</p>

                                <div className="space-y-6 mt-auto">
                                    <div className="flex flex-wrap gap-2">
                                        {proj.tags.map((tag: string) => (
                                            <Badge key={tag} variant="secondary" className="bg-white/5 text-[10px] text-zinc-300 pointer-events-none border-white/10 uppercase tracking-wider font-bold">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="w-full flex items-center justify-between text-sm font-bold text-emerald-500 group-hover:text-emerald-400 border-t border-white/5 pt-4">
                                        <span>Start Project</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
