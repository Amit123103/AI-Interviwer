"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter
} from "../../../components/ui/sheet"
import {
    Search, Filter, BookOpen, CheckCircle2, Bookmark, Mic, Brain,
    ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown, Star, Eye,
    Lightbulb, Check, GraduationCap, Building2, Code2, Terminal,
    Landmark, Monitor, Cpu
} from "lucide-react"
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import { QUESTIONS, CATEGORIES, COMPANIES, ROLES, Question, Difficulty } from "./data"
import MeshBackground from "../components/MeshBackground"
import HolographicHud from "@/components/ui/HolographicHud"
import TiltCard from "@/components/ui/TiltCard"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function QuestionBankPage() {
    const router = useRouter()

    // -- State --
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All Categories")
    const [selectedCompany, setSelectedCompany] = useState("All Companies")
    const [selectedRole, setSelectedRole] = useState("All Roles")
    const [selectedDifficulty, setSelectedDifficulty] = useState("All Levels")
    const [selectedType, setSelectedType] = useState("All Types") // New Filter
    const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([])
    const [practicedIds, setPracticedIds] = useState<string[]>([])

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 12

    // Sorting
    const [sortBy, setSortBy] = useState("recommended") // recommended, recent, views

    // -- Effects --
    useEffect(() => {
        const savedBookmarks = localStorage.getItem("question_bookmarks")
        if (savedBookmarks) setBookmarkedIds(JSON.parse(savedBookmarks))

        const savedPracticed = localStorage.getItem("question_practiced")
        if (savedPracticed) setPracticedIds(JSON.parse(savedPracticed))
    }, [])

    useEffect(() => {
        setCurrentPage(1) // Reset to page 1 on filter change
    }, [searchQuery, selectedCategory, selectedCompany, selectedRole, selectedDifficulty, selectedType])

    // -- Handlers --
    const toggleBookmark = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation()
        const newBookmarks = bookmarkedIds.includes(id)
            ? bookmarkedIds.filter(b => b !== id)
            : [...bookmarkedIds, id]

        setBookmarkedIds(newBookmarks)
        localStorage.setItem("question_bookmarks", JSON.stringify(newBookmarks))
        toast(bookmarkedIds.includes(id) ? "Removed from bookmarks" : "Added to bookmarks")
    }

    const markAsPracticed = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation()
        if (!practicedIds.includes(id)) {
            const newPracticed = [...practicedIds, id]
            setPracticedIds(newPracticed)
            localStorage.setItem("question_practiced", JSON.stringify(newPracticed))
            toast.success("Marked as practiced")
        }
    }

    const clearFilters = () => {
        setSearchQuery("")
        setSelectedCategory("All Categories")
        setSelectedCompany("All Companies")
        setSelectedRole("All Roles")
        setSelectedDifficulty("All Levels")
        setSelectedType("All Types")
    }

    // -- Filtering & Sorting Logic --
    const filteredQuestions = useMemo(() => {
        let result = QUESTIONS.filter(q => {
            const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (q.subcategory && q.subcategory.toLowerCase().includes(searchQuery.toLowerCase()))

            const matchesCategory = selectedCategory === "All Categories" || q.category === selectedCategory
            const matchesCompany = selectedCompany === "All Companies" || (q.company && q.company.includes(selectedCompany))
            const matchesRole = selectedRole === "All Roles" || (q.role && q.role.includes(selectedRole))
            const matchesDifficulty = selectedDifficulty === "All Levels" || q.difficulty === selectedDifficulty

            // Type filter covers broad types or specific exam types if we wanted
            const matchesType = selectedType === "All Types" || q.type === selectedType

            return matchesSearch && matchesCategory && matchesCompany && matchesRole && matchesDifficulty && matchesType
        })

        // Sort
        if (sortBy === "recent") {
            result.sort((a, b) => (new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()))
        } else if (sortBy === "views") {
            result.sort((a, b) => (b.views || 0) - (a.views || 0))
        }
        // Recommended is default (as is in array)

        return result
    }, [searchQuery, selectedCategory, selectedCompany, selectedRole, selectedDifficulty, selectedType, sortBy])

    // -- Pagination Logic --
    const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE)
    const paginatedQuestions = filteredQuestions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-white pb-20 relative overflow-hidden aurora-glow">
            <MeshBackground />
            <HolographicHud />
            {/* Floating ambient orbs */}
            <div className="absolute top-20 left-10 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
            <div className="absolute bottom-32 right-16 w-72 h-72 bg-cyan-500/4 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />
            <div className="absolute top-[50%] right-[30%] w-64 h-64 bg-fuchsia-500/3 rounded-full blur-[100px] orb-float pointer-events-none" style={{ animationDelay: '6s' }} />
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10 space-y-8 relative z-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <DashboardHeader
                        title="Question Bank"
                        subtitle={`Master ${QUESTIONS.length.toLocaleString()}+ expert-curated questions across domains.`}
                        breadcrumbs={[{ label: "Question Bank" }]}
                    />

                    {/* Stats */}
                    <div className="flex gap-4">
                        <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-3xl border border-slate-100 dark:border-white/5 rounded-[1.25rem] p-4 flex items-center gap-4 group hover:border-violet-500/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)] transition-all duration-300">
                            <div className="p-2.5 bg-violet-500/10 rounded-xl text-violet-400 group-hover:bg-violet-500/20 transition-colors"><CheckCircle2 className="w-5 h-5" /></div>
                            <div>
                                <div className="text-xl font-bold leading-none bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{practicedIds.length}</div>
                                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Practiced</div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-3xl border border-slate-100 dark:border-white/5 rounded-[1.25rem] p-4 flex items-center gap-4 group hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all duration-300">
                            <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400 group-hover:bg-cyan-500/20 transition-colors"><Bookmark className="w-5 h-5" /></div>
                            <div>
                                <div className="text-xl font-bold leading-none bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{bookmarkedIds.length}</div>
                                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Saved</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="sticky top-0 z-30 bg-white dark:bg-zinc-950/40 backdrop-blur-3xl border-b border-slate-100 dark:border-white/5 py-6 -mx-4 px-4 md:-mx-8 md:px-8 space-y-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <Input
                                placeholder="Search questions, topics, keywords..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-11 bg-white/60 dark:bg-zinc-900/50 border-slate-200 dark:border-white/10 focus-visible:ring-primary/50 text-slate-900 dark:text-white placeholder:text-zinc-500 rounded-xl"
                            />
                        </div>

                        {/* Desktop Filters */}
                        <div className="hidden lg:flex flex-wrap gap-2">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-[180px] h-11 bg-white/60 dark:bg-zinc-900/50 border-slate-200 dark:border-white/10 rounded-xl">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All Categories">All Categories</SelectItem>
                                    {CATEGORIES.map(cat => (
                                        <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                                <SelectTrigger className="w-[160px] h-11 bg-white/60 dark:bg-zinc-900/50 border-slate-200 dark:border-white/10 rounded-xl">
                                    <SelectValue placeholder="Company" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All Companies">All Companies</SelectItem>
                                    {COMPANIES.map(comp => (
                                        <SelectItem key={comp} value={comp}>{comp}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger className="w-[160px] h-11 bg-white/60 dark:bg-zinc-900/50 border-slate-200 dark:border-white/10 rounded-xl">
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All Roles">All Roles</SelectItem>
                                    {ROLES.map(role => (
                                        <SelectItem key={role} value={role}>{role}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                                <SelectTrigger className="w-[140px] h-11 bg-white/60 dark:bg-zinc-900/50 border-slate-200 dark:border-white/10 rounded-xl">
                                    <SelectValue placeholder="Difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All Levels">All Levels</SelectItem>
                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                    <SelectItem value="Expert">Expert</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger className="w-[140px] h-11 bg-white/60 dark:bg-zinc-900/50 border-slate-200 dark:border-white/10 rounded-xl">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All Types">All Types</SelectItem>
                                    <SelectItem value="Technical">Technical</SelectItem>
                                    <SelectItem value="Coding">Coding</SelectItem>
                                    <SelectItem value="System Design">System Design</SelectItem>
                                    <SelectItem value="Aptitude & Logical">Aptitude & Logical</SelectItem>
                                    <SelectItem value="Government Exams">Government Exams</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[160px] h-11 bg-white/60 dark:bg-zinc-900/50 border-slate-200 dark:border-white/10 rounded-xl">
                                    <ArrowUpDown className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Sort By" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="recommended">Recommended</SelectItem>
                                    <SelectItem value="recent">Recently Added</SelectItem>
                                    <SelectItem value="views">Most Viewed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Mobile Filter Sheet */}
                        <div className="lg:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="h-11 bg-white/60 dark:bg-zinc-900/50 border-slate-200 dark:border-white/10">
                                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                                        Filters
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10 w-full sm:w-[540px]">
                                    <SheetHeader>
                                        <SheetTitle>Filter Questions</SheetTitle>
                                        <SheetDescription>Refine your search with specific criteria.</SheetDescription>
                                    </SheetHeader>
                                    <div className="grid gap-6 py-6">
                                        <div className="space-y-2">
                                            <h4 className="font-medium leading-none">Category</h4>
                                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="All Categories">All Categories</SelectItem>
                                                    {CATEGORIES.map(cat => <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-medium leading-none">Company</h4>
                                            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="All Companies">All Companies</SelectItem>
                                                    {COMPANIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-medium leading-none">Role</h4>
                                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="All Roles">All Roles</SelectItem>
                                                    {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-medium leading-none">Difficulty</h4>
                                            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="All Levels">All Levels</SelectItem>
                                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                                    <SelectItem value="Expert">Expert</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-medium leading-none">Question Type</h4>
                                            <Select value={selectedType} onValueChange={setSelectedType}>
                                                <SelectContent>
                                                    <SelectItem value="All Types">All Types</SelectItem>
                                                    <SelectItem value="Technical">Technical</SelectItem>
                                                    <SelectItem value="Coding">Coding</SelectItem>
                                                    <SelectItem value="System Design">System Design</SelectItem>
                                                    <SelectItem value="Aptitude & Logical">Aptitude & Logical</SelectItem>
                                                    <SelectItem value="Government Exams">Government Exams</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <SheetFooter>
                                        <Button variant="outline" onClick={clearFilters}>Reset</Button>
                                        <Button onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'Escape' }))}>Apply Filters</Button>
                                    </SheetFooter>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {(selectedCategory !== "All Categories" || selectedCompany !== "All Companies" || selectedRole !== "All Roles" || selectedDifficulty !== "All Levels") && (
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider mr-2">Active:</span>
                            {selectedCategory !== "All Categories" && <Badge variant="secondary" className="bg-white/5 hover:bg-white/10" onClick={() => setSelectedCategory("All Categories")}>{selectedCategory} <span className="ml-1 cursor-pointer">×</span></Badge>}
                            {selectedCompany !== "All Companies" && <Badge variant="secondary" className="bg-white/5 hover:bg-white/10" onClick={() => setSelectedCompany("All Companies")}>{selectedCompany} <span className="ml-1 cursor-pointer">×</span></Badge>}
                            {selectedRole !== "All Roles" && <Badge variant="secondary" className="bg-white/5 hover:bg-white/10" onClick={() => setSelectedRole("All Roles")}>{selectedRole} <span className="ml-1 cursor-pointer">×</span></Badge>}
                            {selectedDifficulty !== "All Levels" && <Badge variant="secondary" className="bg-white/5 hover:bg-white/10" onClick={() => setSelectedDifficulty("All Levels")}>{selectedDifficulty} <span className="ml-1 cursor-pointer">×</span></Badge>}
                            {selectedType !== "All Types" && <Badge variant="secondary" className="bg-white/5 hover:bg-white/10" onClick={() => setSelectedType("All Types")}>{selectedType} <span className="ml-1 cursor-pointer">×</span></Badge>}
                            <Button variant="link" size="sm" onClick={clearFilters} className="text-zinc-500 h-auto p-0 ml-2">Clear All</Button>
                        </div>
                    )}
                </div>

                {/* Content Grid */}
                {paginatedQuestions.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {paginatedQuestions.map((question) => (
                                <QuestionCard
                                    key={question.id}
                                    question={question}
                                    isBookmarked={bookmarkedIds.includes(question.id)}
                                    isPracticed={practicedIds.includes(question.id)}
                                    onBookmark={toggleBookmark}
                                    onPractice={markAsPracticed}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-8">
                            <div className="text-sm text-zinc-500">
                                Showing <span className="font-bold text-slate-900 dark:text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-bold text-slate-900 dark:text-white">{Math.min(currentPage * ITEMS_PER_PAGE, filteredQuestions.length)}</span> of <span className="font-bold text-slate-900 dark:text-white">{filteredQuestions.length.toLocaleString()}</span> questions
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="border-slate-200 dark:border-white/10"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="border-slate-200 dark:border-white/10"
                                >
                                    Next <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900/20 rounded-2xl border border-slate-100 dark:border-white/5 border-dashed">
                        <div className="w-16 h-16 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-zinc-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No questions found</h3>
                        <p className="text-zinc-500 mt-2 max-w-md mx-auto">We couldn't find any questions matching your filters. Try adjusting your search or clearing some filters.</p>
                        <Button variant="outline" className="mt-6 border-slate-200 dark:border-white/10" onClick={clearFilters}>Clear All Filters</Button>
                    </div>
                )}

            </div>
        </div>
    )
}

// -- Sub-Components --

function QuestionCard({
    question,
    isBookmarked,
    isPracticed,
    onBookmark,
    onPractice
}: {
    question: Question,
    isBookmarked: boolean,
    isPracticed: boolean,
    onBookmark: (id: string, e: React.MouseEvent) => void
    onPractice: (id: string, e: React.MouseEvent) => void
}) {
    const [expanded, setExpanded] = useState(false)

    // Get Category Icon
    const CategoryIcon = CATEGORIES.find(c => c.name === question.category)?.icon || Brain

    return (
        <TiltCard className={cn(
            "bg-white dark:bg-zinc-900/40 border-slate-100 dark:border-white/5 hover:border-violet-500/20 hover:shadow-[0_0_30px_rgba(139,92,246,0.06)] transition-all duration-500 group flex flex-col h-full backdrop-blur-2xl rounded-[2rem] overflow-hidden relative hover-shine",
            expanded && "bg-white dark:bg-zinc-900/80 ring-1 ring-violet-500/20"
        )}>
            {/* Scanning Line overlay */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent animate-pulse pointer-events-none" />
            <CardHeader className="space-y-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className={cn(
                            "border-opacity-20 bg-opacity-10",
                            question.difficulty === "Beginner" && "text-green-500 border-green-500 bg-green-500 text-xs",
                            question.difficulty === "Intermediate" && "text-yellow-500 border-yellow-500 bg-yellow-500 text-xs",
                            question.difficulty === "Advanced" && "text-orange-500 border-orange-500 bg-orange-500 text-xs",
                            question.difficulty === "Expert" && "text-red-500 border-red-500 bg-red-500 text-xs",
                        )}>
                            {question.difficulty}
                        </Badge>

                        {/* Category Badge */}
                        <span className="text-[10px] uppercase font-bold text-zinc-500 border border-slate-100 dark:border-white/5 bg-white/5 px-2 py-1 rounded-md flex items-center gap-1.5">
                            <CategoryIcon className="w-3 h-3" /> {question.subcategory || question.category.split(" ")[0]}
                        </span>

                        {/* Exam Type Badge for Govt/Aptitude */}
                        {question.examType && question.examType.length > 0 && (
                            <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px]">
                                {question.examType[0]}
                            </Badge>
                        )}
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => onBookmark(question.id, e)}
                        className="h-8 w-8 text-zinc-500 hover:text-blue-500 hover:bg-blue-500/10 -mt-2 -mr-2"
                    >
                        <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current text-blue-500")} />
                    </Button>
                </div>

                <CardTitle className="text-lg font-bold leading-snug group-hover:text-violet-400 transition-colors line-clamp-3">
                    {question.title}
                </CardTitle>

                {question.company && question.company.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {Array.from(new Set(question.company)).slice(0, 3).map((c, i) => (
                            <span key={`${c}-${i}`} className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full flex items-center">
                                <Building2 className="w-3 h-3 mr-1 opacity-70" /> {c}
                            </span>
                        ))}
                        {question.company.length > 3 && (
                            <span className="text-[10px] text-zinc-500 px-1 py-0.5">+{question.company.length - 3} more</span>
                        )}
                    </div>
                )}
            </CardHeader>

            <CardContent className="flex-1 flex flex-col gap-4">
                {/* Expandable Answer Section */}
                <div className={cn(
                    "grid transition-all duration-300 ease-in-out bg-white dark:bg-black/40 rounded-xl overflow-hidden border border-slate-100 dark:border-white/5",
                    expanded ? "grid-rows-[1fr] mt-2 opacity-100" : "grid-rows-[0fr] opacity-0"
                )}>
                    <div className="overflow-hidden">
                        <div className="p-4 space-y-4">

                            {/* Code Snippet Display */}
                            {question.codeSnippet && (
                                <div className="space-y-2">
                                    <div className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                                        <Code2 className="w-3 h-3 text-cyan-500" /> Code Solution
                                    </div>
                                    <div className="bg-white dark:bg-zinc-950 p-4 rounded-lg border border-slate-200 dark:border-white/10 overflow-x-auto">
                                        <pre className="text-xs md:text-sm font-mono text-slate-600 dark:text-zinc-300">
                                            {question.codeSnippet}
                                        </pre>
                                    </div>
                                </div>
                            )}



                            {/* Key Points */}
                            <div className="space-y-2">
                                <div className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                                    <Lightbulb className="w-3 h-3 text-yellow-500" /> Key Points
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {question.keyPoints.map((point, i) => (
                                        <span key={i} className="text-xs bg-white/5 text-slate-600 dark:text-zinc-300 px-2 py-1 rounded border border-slate-100 dark:border-white/5">
                                            {point}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Answer Snippet */}
                            <div className="space-y-2">
                                <div className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                                    <GraduationCap className="w-3 h-3 text-primary" /> Expert Answer
                                </div>
                                <div className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed bg-white dark:bg-zinc-900 p-3 rounded-lg border border-slate-100 dark:border-white/5 whitespace-pre-line">
                                    {question.answer}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(!expanded)}
                        className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-zinc-200"
                    >
                        {expanded ? "Hide Answer" : "Show Answer"}
                    </Button>

                    <Button
                        variant={isPracticed ? "outline" : "default"}
                        size="sm"
                        onClick={(e) => onPractice(question.id, e)}
                        className={cn(
                            "flex-1 font-bold",
                            isPracticed
                                ? "bg-transparent border-emerald-500/50 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                : "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 text-slate-900 dark:text-white hover:from-violet-500 hover:via-fuchsia-500 hover:to-cyan-500 shadow-[0_0_20px_rgba(139,92,246,0.3)] border-0"
                        )}
                    >
                        {isPracticed ? (
                            <><CheckCircle2 className="w-4 h-4 mr-2" /> Practiced</>
                        ) : (
                            <><Mic className="w-4 h-4 mr-2" /> {question.type === "Coding" ? "Solve Now" : "Practice"}</>
                        )}
                    </Button>
                </div>
            </CardContent>
        </TiltCard>
    )
}
