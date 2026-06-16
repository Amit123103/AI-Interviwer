"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { toast } from "sonner"
import { HelpCircle, Send, Bug, BookOpen, Loader2, MessageCircle } from "lucide-react"

export default function HelpPanel({ user }: { user: any }) {
    const [message, setMessage] = useState("")
    const [subject, setSubject] = useState("")
    const [sending, setSending] = useState(false)

    const handleSend = async () => {
        if (!message || !subject) {
            toast.error("Please fill in all fields")
            return
        }
        setSending(true)
        setTimeout(() => {
            setSending(false)
            toast.success("Support ticket created. We'll be in touch.")
            setMessage("")
            setSubject("")
        }, 1500)
    }

    return (
        <div className="space-y-10 max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-left hover:border-blue-500 transition-all shadow-sm group">
                    <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-xl w-fit mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:text-white" />
                    </div>
                    <h4 className="font-semibold">Documentation</h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Learn how to make the most of your interview sessions.</p>
                </button>
                <button className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-left hover:border-rose-500 transition-all shadow-sm group">
                    <div className="p-3 bg-rose-100 dark:bg-rose-500/20 rounded-xl w-fit mb-4 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                        <Bug className="w-6 h-6 text-rose-600 dark:text-rose-400 group-hover:text-white" />
                    </div>
                    <h4 className="font-semibold">Report a bug</h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Found something wrong? Let us know so we can fix it.</p>
                </button>
            </div>

            <section className="space-y-4">
                <h3 className="text-lg font-semibold">Frequently asked questions</h3>
                <Accordion type="single" collapsible className="w-full">
                    {[
                        { q: "How does the AI grading work?", a: "Our AI analyzes your implementation for correctness, efficiency, and code style. It also evaluates your communication skills based on transcript sentiment and clarity." },
                        { q: "Can I retry an interview?", a: "Yes! You can retry as many times as you like. We recommend trying different scenarios (e.g., 'Strict' vs 'Friendly') to broaden your experience." },
                        { q: "How secure is my data?", a: "Extremely secure. We use industry-standard encryption for all data storage and transmission." },
                        { q: "What languages are supported?", a: "Currently we support English and Hindi. We are actively working on adding more languages." }
                    ].map((item, i) => (
                        <AccordionItem key={i} value={`item-${i}`} className="border-slate-200 dark:border-white/10">
                            <AccordionTrigger className="text-sm font-medium hover:no-underline">{item.q}</AccordionTrigger>
                            <AccordionContent className="text-sm text-slate-500 dark:text-zinc-400">{item.a}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </section>

            <section className="pt-10 border-t border-slate-100 dark:border-white/5 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold">Contact support</h3>
                    <p className="text-sm text-slate-500">Need help with something else? Send us a message.</p>
                </div>

                <div className="grid gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Subject</label>
                        <Input
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="How can we help?"
                            className="h-11 rounded-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Message</label>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Describe your issue in detail..."
                            className="min-h-[120px] rounded-lg resize-none"
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleSend} disabled={sending} className="h-11 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2">
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Send message
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}
