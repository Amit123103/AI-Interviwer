import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Search, Filter } from 'lucide-react'
import { LANGUAGES_BY_CATEGORY, CATEGORIES } from './ProjectData'

export default function LanguageSelector({
    category,
    onSelect,
    onBack
}: {
    category: string,
    onSelect: (lang: any) => void,
    onBack: () => void
}) {
    const [searchQuery, setSearchQuery] = useState('')
    const [filterDiff, setFilterDiff] = useState('All')

    const categoryData = CATEGORIES.find(c => c.id === category)
    const languages = LANGUAGES_BY_CATEGORY[category] || []

    const filteredLanguages = languages.filter(lang => {
        const matchesSearch = lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lang.useCases.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesDiff = filterDiff === 'All' || lang.difficulty === filterDiff
        return matchesSearch && matchesDiff
    })

    const getBadgeColor = (diff: string) => {
        if (diff === 'Beginner') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        if (diff === 'Intermediate') return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    }

    return (
        <div className="w-full flex flex-col items-center">
            {/* Header / Nav */}
            <div className="w-full max-w-6xl flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-white/10 gap-4">
                <Button variant="ghost" onClick={onBack} className="text-zinc-400 hover:text-white shrink-0">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Categories
                </Button>

                {categoryData && (
                    <div className="flex items-center gap-3">
                        <span className="text-zinc-500 font-medium hidden sm:inline">Current Path:</span>
                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full bg-${categoryData.color}-500/10 border border-${categoryData.color}-500/20 text-${categoryData.color}-400 font-bold uppercase tracking-widest text-sm`}>
                            {categoryData.icon} {categoryData.title}
                        </div>
                    </div>
                )}
            </div>

            <div className="text-center mb-10 w-full max-w-3xl">
                <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
                    Choose your <span className={`text-${categoryData?.color || 'zinc'}-400`}>Language</span>
                </h2>
                <p className="text-zinc-400 text-lg">Pick the technology you want to use for your next real-world project.</p>
            </div>

            {/* Filters */}
            <div className="w-full max-w-6xl mb-8 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search languages or use-cases..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-white/10 text-white rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-indigo-500/50 focus:bg-zinc-900 transition-colors shadow-inner"
                    />
                </div>
                <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-white/10 shrink-0 w-full sm:w-auto overflow-x-auto">
                    {['All', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
                        <button
                            key={diff}
                            onClick={() => setFilterDiff(diff)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filterDiff === diff ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            {diff}
                        </button>
                    ))}
                </div>
            </div>

            {/* Language Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                {filteredLanguages.map((lang, i) => (
                    <motion.div
                        key={lang.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Card
                            onClick={() => onSelect(lang)}
                            className={`group relative overflow-hidden rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-6 hover:bg-zinc-800/80 hover:border-${categoryData?.color || 'zinc'}-500/30 cursor-pointer transition-all duration-300 hover:-translate-y-1 h-full flex flex-col`}
                        >
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-14 h-14 rounded-2xl bg-zinc-950/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner border border-white/5`}>
                                        {lang.icon}
                                    </div>
                                    <Badge variant="outline" className={getBadgeColor(lang.difficulty)}>
                                        {lang.difficulty}
                                    </Badge>
                                </div>

                                <h3 className="text-xl font-black text-white mb-2">{lang.name}</h3>
                                <div className="mt-auto pt-4 border-t border-white/5">
                                    <p className="text-sm font-medium text-zinc-500">Best for:</p>
                                    <p className="text-sm text-zinc-300">{lang.useCases}</p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}

                {filteredLanguages.length === 0 && (
                    <div className="col-span-full py-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-zinc-900/20">
                        <Search className="w-10 h-10 text-zinc-600 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No languages found</h3>
                        <p className="text-zinc-500">Try adjusting your filters or search query.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
