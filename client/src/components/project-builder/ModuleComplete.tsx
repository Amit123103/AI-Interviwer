import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, ArrowRight, BrainCircuit, CheckCircle, LayoutPanelLeft } from 'lucide-react'

export default function ModuleComplete({
    module,
    isLast,
    onContinue,
    onBackToDashboard
}: {
    module: any,
    isLast: boolean,
    onContinue: () => void,
    onBackToDashboard: () => void
}) {
    return (
        <div className="w-full max-w-3xl mx-auto py-12 px-4 flex flex-col items-center text-center">

            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-32 h-32 rounded-full bg-emerald-500/10 flex items-center justify-center border-4 border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.3)] mb-8 relative"
            >
                <Trophy className="w-16 h-16 text-emerald-400 relative z-10" />
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
            </motion.div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold uppercase tracking-wider mb-4">
                <CheckCircle className="w-4 h-4" /> Module {module.moduleNumber} Completed!
            </div>

            <h2 className="text-4xl font-black text-white mb-4 tracking-tight">
                {module.title}
            </h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-xl">
                Fantastic job! You've successfully passed the code validation and mastered the core concepts of this module.
            </p>

            <Card className="w-full bg-zinc-900/50 backdrop-blur-sm border border-white/10 p-8 rounded-3xl mb-12 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-amber-400" /> Concepts Mastered
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                    {module.conceptsCovered?.map((concept: string, i: number) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-black border border-white/5 text-zinc-300 font-mono text-sm px-4 py-2 rounded-xl"
                        >
                            {concept}
                        </motion.div>
                    ))}
                </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <Button
                    onClick={onContinue}
                    className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all hover:-translate-y-1"
                >
                    {isLast ? 'Finish Project' : 'Start Next Module'} <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <Button
                    variant="outline"
                    onClick={onBackToDashboard}
                    className="h-14 px-8 rounded-2xl border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 font-bold"
                >
                    <LayoutPanelLeft className="w-5 h-5 mr-2" /> Return to Roadmap
                </Button>
            </div>
        </div>
    )
}
