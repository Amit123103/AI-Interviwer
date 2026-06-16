"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Plus, Trash2, Play, BookOpen, ArrowLeft, Edit2, Check, X
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import BackToDashboard from "@/components/dashboard/BackToDashboard"

interface CustomList {
    id: string
    name: string
    description: string
    questionIds: string[]
    createdAt: string
}

export default function CustomListsPage() {
    const router = useRouter()
    const [lists, setLists] = useState<CustomList[]>([])
    const [isCreating, setIsCreating] = useState(false)
    const [newListName, setNewListName] = useState("")
    const [newListDesc, setNewListDesc] = useState("")

    useEffect(() => {
        // Load custom lists from localStorage
        const savedLists = localStorage.getItem("customQuestionLists")
        if (savedLists) {
            setLists(JSON.parse(savedLists))
        } else {
            // Create default lists
            const defaultLists: CustomList[] = [
                {
                    id: "list1",
                    name: "Technical Fundamentals",
                    description: "Core technical concepts every engineer should know",
                    questionIds: ["q1", "q5"],
                    createdAt: new Date().toISOString()
                },
                {
                    id: "list2",
                    name: "Behavioral Practice",
                    description: "STAR method practice questions",
                    questionIds: ["q2", "q6"],
                    createdAt: new Date().toISOString()
                }
            ]
            setLists(defaultLists)
            localStorage.setItem("customQuestionLists", JSON.stringify(defaultLists))
        }
    }, [])

    const createList = () => {
        if (!newListName.trim()) {
            toast.error("Please enter a list name")
            return
        }

        const newList: CustomList = {
            id: `list_${Date.now()}`,
            name: newListName,
            description: newListDesc,
            questionIds: [],
            createdAt: new Date().toISOString()
        }

        const updatedLists = [...lists, newList]
        setLists(updatedLists)
        localStorage.setItem("customQuestionLists", JSON.stringify(updatedLists))

        setNewListName("")
        setNewListDesc("")
        setIsCreating(false)
        toast.success("List created successfully")
    }

    const deleteList = (listId: string) => {
        const updatedLists = lists.filter(l => l.id !== listId)
        setLists(updatedLists)
        localStorage.setItem("customQuestionLists", JSON.stringify(updatedLists))
        toast.success("List deleted")
    }

    const practiceList = (listId: string) => {
        const list = lists.find(l => l.id === listId)
        if (!list || list.questionIds.length === 0) {
            toast.error("This list has no questions")
            return
        }
        toast.success("Starting practice session...")
        // In production, navigate to practice session with list questions
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-4 sm:p-6 md:p-10">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <BackToDashboard currentPage="Custom Lists" parents={[{ label: 'Questions', href: '/dashboard/questions' }]} />
                        <div className="flex items-center gap-3 text-primary mb-2">
                            <BookOpen className="w-6 h-6" />
                            <span className="text-sm font-bold uppercase tracking-widest">Custom Lists</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tighter">
                            My Practice Lists
                        </h1>
                        <p className="text-slate-500 dark:text-zinc-400 mt-2">
                            Organize questions into custom lists for focused practice
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreating(true)}
                        className="bg-primary hover:bg-primary/90 text-black font-bold"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New List
                    </Button>
                </div>

                {/* Create List Form */}
                {isCreating && (
                    <Card className="bg-white dark:bg-zinc-950 border-primary/20">
                        <CardHeader>
                            <CardTitle>Create New List</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-500 dark:text-zinc-400 mb-2 block">List Name</label>
                                <Input
                                    value={newListName}
                                    onChange={(e) => setNewListName(e.target.value)}
                                    placeholder="e.g., System Design Practice"
                                    className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-slate-500 dark:text-zinc-400 mb-2 block">Description (Optional)</label>
                                <Input
                                    value={newListDesc}
                                    onChange={(e) => setNewListDesc(e.target.value)}
                                    placeholder="e.g., Questions for system design interviews"
                                    className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10"
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={createList}
                                    className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold"
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    Create List
                                </Button>
                                <Button
                                    onClick={() => {
                                        setIsCreating(false)
                                        setNewListName("")
                                        setNewListDesc("")
                                    }}
                                    variant="outline"
                                    className="border-slate-200 dark:border-white/10 hover:bg-white/5"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Lists Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {lists.map((list) => (
                        <Card key={list.id} className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10 hover:border-primary/50 transition-all">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg mb-1">{list.name}</h3>
                                        {list.description && (
                                            <p className="text-sm text-slate-500 dark:text-zinc-400">{list.description}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => deleteList(list.id)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 text-sm">
                                    <div>
                                        <span className="text-zinc-500">Questions: </span>
                                        <span className="font-bold">{list.questionIds.length}</span>
                                    </div>
                                    <div className="w-px h-4 bg-white/10" />
                                    <div>
                                        <span className="text-zinc-500">Created: </span>
                                        <span className="font-medium">
                                            {new Date(list.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex gap-2">
                                    <Button
                                        onClick={() => practiceList(list.id)}
                                        className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold"
                                        disabled={list.questionIds.length === 0}
                                    >
                                        <Play className="w-4 h-4 mr-2" />
                                        Practice List
                                    </Button>
                                    <Button
                                        onClick={() => router.push("/dashboard/questions")}
                                        variant="outline"
                                        className="border-slate-200 dark:border-white/10 hover:bg-white/5"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Questions
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {lists.length === 0 && !isCreating && (
                    <Card className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10">
                        <CardContent className="p-12 text-center">
                            <BookOpen className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">No custom lists yet</h3>
                            <p className="text-slate-500 dark:text-zinc-400 mb-6">
                                Create your first list to organize questions for focused practice
                            </p>
                            <Button
                                onClick={() => setIsCreating(true)}
                                className="bg-primary hover:bg-primary/90 text-black font-bold"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Your First List
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Info Card */}
                <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
                    <CardContent className="p-6">
                        <h3 className="font-bold mb-2">How to use custom lists</h3>
                        <ul className="text-sm text-slate-600 dark:text-zinc-300 space-y-1">
                            <li>• Create lists to organize questions by topic or difficulty</li>
                            <li>• Add questions from the question bank to your lists</li>
                            <li>• Practice entire lists to focus on specific areas</li>
                            <li>• Track your progress on each list</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
