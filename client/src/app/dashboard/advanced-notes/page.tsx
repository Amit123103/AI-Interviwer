"use client";

import React, { useState } from 'react';
import SavedNotes from '@/components/advanced-notes/SavedNotes';
import WriteNotes from '@/components/advanced-notes/WriteNotes';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdvancedNotesPage() {
    const [view, setView] = useState<'saved' | 'write'>('saved');
    const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* Minimal Header */}
            <header className="h-14 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-zinc-950/80 backdrop-blur-md flex items-center px-6 shrink-0 justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white">
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div className="h-4 w-[1px] bg-white/10" />
                    <h1 className="text-lg font-semibold tracking-tight">
                        <span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">Advanced</span> Notes
                    </h1>
                </div>

                <div className="flex bg-white/5 p-1 rounded-lg border border-slate-100 dark:border-white/5">
                    <button
                        onClick={() => { setView('saved'); setCurrentNoteId(null); }}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${view === 'saved' ? 'bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-zinc-200'} `}
                    >
                        Saved Notes
                    </button>
                    <button
                        onClick={() => { setView('write'); setCurrentNoteId(null); }}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${view === 'write' ? 'bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-zinc-200'} `}
                    >
                        Write Notes
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-hidden bg-white dark:bg-slate-950/50">
                {view === 'saved' ? (
                    <SavedNotes
                        onOpenNote={(id) => {
                            setCurrentNoteId(id);
                            setView('write');
                        }}
                        onNewNote={() => {
                            setCurrentNoteId(null);
                            setView('write');
                        }}
                    />
                ) : (
                    <WriteNotes noteId={currentNoteId} onExit={() => setView('saved')} />
                )}
            </main>
        </div>
    );
}
