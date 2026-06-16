import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'
import { CATEGORIES } from './ProjectData'

export default function CategorySelector({ onSelect }: { onSelect: (category: string) => void }) {
    return (
        <div className="w-full flex flex-col items-center">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
                    Select a <span className="text-indigo-400">Learning Path</span>
                </h2>
                <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                    What area of software engineering do you want to master? Choose a path to explore languages and build real projects.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                {CATEGORIES.map((cat, i) => (
                    <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card
                            onClick={() => onSelect(cat.id)}
                            className={`group relative overflow-hidden rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-8 hover:bg-zinc-800/80 hover:border-${cat.color}-500/50 cursor-pointer transition-all duration-500 hover:-translate-y-2 h-full flex flex-col shadow-lg`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br from-${cat.color}-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className={`w-16 h-16 rounded-2xl bg-${cat.color}-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-${cat.color}-500/20 shadow-[0_0_20px_rgba(var(--${cat.color}-500),0.2)]`}>
                                    {cat.icon}
                                </div>

                                <h3 className="text-2xl font-black text-white mb-2 group-hover:text-white transition-colors">{cat.title}</h3>
                                <p className="text-zinc-400 font-medium mb-8 flex-1 text-lg">{cat.description}</p>

                                <div className="space-y-4 mt-auto">
                                    <div className="flex flex-wrap gap-2">
                                        {cat.popularTags.map(tag => (
                                            <Badge key={tag} variant="secondary" className="bg-white/5 text-zinc-300 pointer-events-none text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className={`flex items-center text-sm font-bold text-${cat.color}-400 group-hover:translate-x-1 transition-transform`}>
                                        Explore Path <ArrowRight className="w-4 h-4 ml-2" />
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
