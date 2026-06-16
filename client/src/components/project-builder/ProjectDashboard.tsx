import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, CheckCircle, Lock, Package, Clock, Target, ArrowRight } from 'lucide-react'
import { CurriculumData } from '@/app/dashboard/project-builder/page'

export default function ProjectDashboard({
    curriculum,
    completedModules,
    onStartModule
}: {
    curriculum: CurriculumData,
    completedModules: number[],
    onStartModule: (index: number) => void
}) {
    // Find the first module that isn't completed to be the "Active" one
    let activeModuleIndex = 0;
    for (let i = 0; i < curriculum.modules.length; i++) {
        if (!completedModules.includes(i)) {
            activeModuleIndex = i;
            break;
        }
    }

    const progressPercentage = Math.round((completedModules.length / curriculum.modules.length) * 100)

    return (
        <div className="w-full max-w-5xl mx-auto py-10 px-4">
            {/* Header & Meta */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 pb-8 border-b border-white/10">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 uppercase tracking-widest font-black">
                            {curriculum.category}
                        </Badge>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold uppercase">
                            {curriculum.language}
                        </Badge>
                        <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-white/10">
                            {curriculum.difficulty}
                        </Badge>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
                        {curriculum.projectTitle}
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl leading-relaxed">
                        {curriculum.description}
                    </p>
                </div>

                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/10 shrink-0 w-full md:w-auto">
                    <div className="text-sm font-bold text-zinc-500 mb-2 uppercase tracking-widest">Overall Progress</div>
                    <div className="flex items-end gap-3 mb-3">
                        <span className="text-4xl font-black text-white">{progressPercentage}%</span>
                        <span className="text-zinc-400 mb-1">{completedModules.length} of {curriculum.modules.length} Modules</span>
                    </div>
                    <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                            className="h-full bg-emerald-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: The Roadmap Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                        <Target className="w-6 h-6 text-indigo-400" /> Project Curriculum
                    </h2>

                    <div className="relative border-l-2 border-zinc-800 ml-4 space-y-8 pb-8">
                        {curriculum.modules.map((mod, index) => {
                            const isCompleted = completedModules.includes(index)
                            const isLocked = index > activeModuleIndex
                            const isActive = index === activeModuleIndex

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`relative pl-8 ${isLocked ? 'opacity-50' : 'opacity-100'}`}
                                >
                                    {/* Timeline Marker */}
                                    <div className={`absolute -left-[13px] top-0 w-6 h-6 rounded-full border-4 border-black flex items-center justify-center ${isCompleted ? 'bg-emerald-500' : isActive ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-zinc-700'
                                        }`}>
                                        {isCompleted && <CheckCircle className="w-4 h-4 text-black absolute" />}
                                    </div>

                                    <Card className={`bg-zinc-900/60 backdrop-blur-sm border ${isActive ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'border-white/5'} p-6 rounded-2xl`}>
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                            <div>
                                                <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    Module {mod.moduleNumber}
                                                    {isCompleted && <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Completed</span>}
                                                    {isLocked && <span className="text-rose-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Locked</span>}
                                                </div>
                                                <h3 className="text-xl font-bold text-white mb-2">{mod.title}</h3>
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {mod.conceptsCovered?.map(concept => (
                                                        <span key={concept} className="text-[10px] font-mono text-zinc-400 bg-black px-2 py-1 rounded border border-white/5">
                                                            {concept}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="shrink-0 w-full sm:w-auto flex flex-col items-end gap-3">
                                                <div className="flex items-center text-sm font-medium text-zinc-400 bg-zinc-950 px-3 py-1.5 rounded-lg border border-white/5">
                                                    <Clock className="w-4 h-4 mr-2 text-zinc-500" /> {mod.estimatedMinutes} min
                                                </div>

                                                {isActive && (
                                                    <Button
                                                        onClick={() => onStartModule(index)}
                                                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                                                    >
                                                        Start Module <Play className="w-4 h-4 ml-2 fill-current" />
                                                    </Button>
                                                )}
                                                {isCompleted && (
                                                    <Button
                                                        onClick={() => onStartModule(index)}
                                                        variant="outline"
                                                        className="w-full sm:w-auto border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                                    >
                                                        Review <ArrowRight className="w-4 h-4 ml-2" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>

                {/* Right Column: Meta info */}
                <div className="space-y-6">
                    <Card className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-amber-400" /> Prerequisites
                        </h3>
                        <ul className="space-y-3">
                            {curriculum.prerequisites?.map((prereq, i) => (
                                <li key={i} className="flex gap-3 text-sm text-zinc-400">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50 mt-1.5 shrink-0" />
                                    <span>{prereq}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
                        <h3 className="text-lg font-bold text-white mb-4">Learning Outcomes</h3>
                        <ul className="space-y-3">
                            {curriculum.learningOutcomes?.map((outcome, i) => (
                                <li key={i} className="flex gap-3 text-sm text-zinc-400">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 mt-1.5 shrink-0" />
                                    <span>{outcome}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    )
}
