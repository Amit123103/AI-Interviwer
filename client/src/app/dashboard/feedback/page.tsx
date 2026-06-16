"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, MessageSquare, Star, Send, PlayCircle, Clock, CheckCircle2,
    ChevronRight, ThumbsUp, Lightbulb, Zap, User as UserIcon
} from 'lucide-react';
import Link from 'next/link';

// === TYPES ===
type Tab = 'my-submissions' | 'give-feedback';

interface Submission {
    _id: string;
    user: { _id: string, username: string };
    question: string;
    answer: string;
    type: string;
    status: string;
    createdAt: string;
}

interface Review {
    _id: string;
    reviewer: { username: string };
    clarityScore: number;
    accuracyScore: number;
    comments: string;
    createdAt: string;
}

export default function PeerFeedbackPage() {
    const [activeTab, setActiveTab] = useState<Tab>('give-feedback');
    const [feed, setFeed] = useState<Submission[]>([]);
    const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    // Submission Form State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitForm, setSubmitForm] = useState({ question: '', answer: '', type: 'behavioral' });

    // Review Form State
    const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
    const [reviewForm, setReviewForm] = useState({ clarityScore: 3, accuracyScore: 3, comments: '' });

    // Review Viewing State
    const [viewingReviewsForId, setViewingReviewsForId] = useState<string | null>(null);
    const [fetchedReviews, setFetchedReviews] = useState<Review[]>([]);

    // Fetch Feed
    useEffect(() => {
        fetchFeed();
    }, []);

    // Fetch My Submissions
    useEffect(() => {
        if (activeTab === 'my-submissions') {
            fetchMySubmissions();
        }
    }, [activeTab]);

    const fetchFeed = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/feedback/feed', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) setFeed(await res.json());
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const fetchMySubmissions = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/feedback/my-submissions', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) setMySubmissions(await res.json());
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleCreateSubmission = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/feedback/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(submitForm)
            });
            if (res.ok) {
                setIsSubmitting(false);
                setSubmitForm({ question: '', answer: '', type: 'behavioral' });
                fetchMySubmissions();
                setActiveTab('my-submissions');
            }
        } catch (err) { console.error(err); }
    };

    const handleSubmitReview = async (e: React.FormEvent, submissionId: string) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/feedback/review/${submissionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(reviewForm)
            });
            if (res.ok) {
                setActiveReviewId(null);
                setReviewForm({ clarityScore: 3, accuracyScore: 3, comments: '' });
                fetchFeed(); // Refresh feed to remove the reviewed item
            }
        } catch (err) { console.error(err); }
    };

    const loadReviewsForSubmission = async (id: string) => {
        if (viewingReviewsForId === id) {
            setViewingReviewsForId(null);
            return;
        }
        setViewingReviewsForId(id);
        try {
            const res = await fetch(`/api/feedback/reviews/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                setFetchedReviews(await res.json());
            }
        } catch (err) { console.error(err); }
    };

    // Helper renderers
    const renderStarRating = (value: number, onChange?: (val: number) => void) => (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type={onChange ? "button" : "submit"}
                    onClick={() => onChange && onChange(star)}
                    disabled={!onChange}
                    className={`focus:outline-none transition-transform ${onChange ? 'hover:scale-110' : ''}`}
                >
                    <Star className={`w-6 h-6 ${star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-600'} transition-all`} />
                </button>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-white dark:bg-[#08080f] text-slate-900 dark:text-white p-6 pb-24 font-[DM Sans]">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white dark:bg-[#111118] border border-slate-100 dark:border-white/5 p-8 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                    <div className="relative z-10 w-full">
                        <Link href="/dashboard" className="text-zinc-500 hover:text-slate-900 dark:text-white transition-colors text-sm font-bold flex items-center mb-4">
                            ❮ Back to Dashboard
                        </Link>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                <Users className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-[Syne] font-bold">Peer Feedback</h1>
                        </div>
                        <p className="text-slate-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
                            Grow together. Post your mock interview answers for anonymous community review, or earn Intervyxa Coins by providing constructive feedback to peers.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsSubmitting(true)}
                        className="shrink-0 bg-cyan-500 text-black px-6 py-3 rounded-xl font-bold font-[Syne] hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(34,211,238,0.3)] relative z-10"
                    >
                        + Ask for Feedback
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-white dark:bg-[#111118] border border-slate-100 dark:border-white/5 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab('give-feedback')}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'give-feedback' ? 'bg-zinc-800 text-slate-900 dark:text-white shadow-lg' : 'text-zinc-500 hover:text-slate-900 dark:text-zinc-300'}`}
                    >
                        <MessageSquare className="w-4 h-4" /> Give Feedback
                    </button>
                    <button
                        onClick={() => setActiveTab('my-submissions')}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'my-submissions' ? 'bg-zinc-800 text-slate-900 dark:text-white shadow-lg' : 'text-zinc-500 hover:text-slate-900 dark:text-zinc-300'}`}
                    >
                        <UserIcon className="w-4 h-4" /> My Submissions
                    </button>
                </div>

                {/* Tab Content */}
                <div className="mt-8">
                    {loading ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-white/60 dark:bg-zinc-900/50 animate-pulse rounded-3xl border border-slate-100 dark:border-white/5" />)}
                        </div>
                    ) : activeTab === 'give-feedback' ? (
                        /* FEED TAB */
                        <div className="space-y-6">
                            {feed.length === 0 ? (
                                <div className="text-center py-24 bg-white dark:bg-[#111118] border border-slate-100 dark:border-white/5 rounded-3xl">
                                    <CheckCircle2 className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white font-[Syne]">You're all caught up!</h3>
                                    <p className="text-zinc-500">There are no pending submissions to review right now.</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {feed.map((sub) => (
                                        <motion.div key={sub._id} layout className="bg-white dark:bg-[#111118] border border-slate-100 dark:border-white/5 hover:border-cyan-500/30 transition-colors rounded-3xl p-6 relative overflow-hidden flex flex-col">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="bg-zinc-800 text-slate-600 dark:text-zinc-300 text-xs px-3 py-1 rounded-full uppercase tracking-wider font-bold">
                                                    {sub.type}
                                                </span>
                                                <span className="text-xs text-zinc-500 flex items-center"><Clock className="w-3 h-3 mr-1" /> {new Date(sub.createdAt).toLocaleDateString()}</span>
                                            </div>

                                            <h3 className="text-lg font-bold font-[Syne] mb-3 text-slate-900 dark:text-white leading-tight">
                                                "{sub.question}"
                                            </h3>

                                            <div className="bg-white dark:bg-black/50 p-4 rounded-xl text-slate-500 dark:text-zinc-400 text-sm mb-6 flex-1 italic relative before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-zinc-800 before:rounded-full">
                                                <span className="ml-2 line-clamp-4">{sub.answer}</span>
                                            </div>

                                            <AnimatePresence>
                                                {activeReviewId !== sub._id ? (
                                                    <button
                                                        onClick={() => setActiveReviewId(sub._id)}
                                                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-cyan-400 font-bold rounded-xl transition-colors border border-slate-100 dark:border-white/5 flex items-center justify-center gap-2"
                                                    >
                                                        <Star className="w-4 h-4" /> Review Answer (+50 Coins)
                                                    </button>
                                                ) : (
                                                    <motion.form
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        onSubmit={(e) => handleSubmitReview(e, sub._id)}
                                                        className="space-y-4 bg-white dark:bg-zinc-900/80 p-5 rounded-2xl border border-slate-200 dark:border-white/10 mt-2"
                                                    >
                                                        <div>
                                                            <label className="text-xs font-bold text-zinc-500 uppercase flex justify-between mb-2">
                                                                <span>Clarity & Delivery</span>
                                                                <span className="text-yellow-400">{reviewForm.clarityScore}/5</span>
                                                            </label>
                                                            {renderStarRating(reviewForm.clarityScore, (v) => setReviewForm({ ...reviewForm, clarityScore: v }))}
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-bold text-zinc-500 uppercase flex justify-between mb-2">
                                                                <span>Technical Accuracy</span>
                                                                <span className="text-yellow-400">{reviewForm.accuracyScore}/5</span>
                                                            </label>
                                                            {renderStarRating(reviewForm.accuracyScore, (v) => setReviewForm({ ...reviewForm, accuracyScore: v }))}
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Constructive Comments</label>
                                                            <textarea
                                                                required
                                                                value={reviewForm.comments}
                                                                onChange={(e) => setReviewForm({ ...reviewForm, comments: e.target.value })}
                                                                placeholder="What did they do well? What could be improved?"
                                                                className="w-full bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500 resize-none h-24"
                                                            />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button type="button" onClick={() => setActiveReviewId(null)} className="flex-1 py-2 bg-transparent text-slate-500 dark:text-zinc-400 font-bold rounded-xl hover:text-slate-900 dark:text-white transition-colors">Cancel</button>
                                                            <button type="submit" className="flex-1 py-2 bg-cyan-500 text-black font-bold rounded-xl hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2">
                                                                <Send className="w-4 h-4" /> Submit
                                                            </button>
                                                        </div>
                                                    </motion.form>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* MY SUBMISSIONS TAB */
                        <div className="grid lg:grid-cols-2 gap-6">
                            {mySubmissions.length === 0 ? (
                                <div className="lg:col-span-2 text-center py-24 bg-white dark:bg-[#111118] border border-slate-100 dark:border-white/5 rounded-3xl">
                                    <Lightbulb className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white font-[Syne]">No Submissions Yet</h3>
                                    <p className="text-zinc-500">Ask the community for feedback on your first question!</p>
                                </div>
                            ) : (
                                mySubmissions.map((sub) => (
                                    <div key={sub._id} className="bg-white dark:bg-[#111118] border border-slate-100 dark:border-white/5 rounded-3xl overflow-hidden flex flex-col">
                                        <div className="p-6 border-b border-slate-100 dark:border-white/5">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="bg-indigo-500/20 text-indigo-300 text-xs px-3 py-1 rounded-full uppercase tracking-wider font-bold">
                                                        {sub.type}
                                                    </span>
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${sub.status === 'open' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                                        {sub.status}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-zinc-500">{new Date(sub.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <h3 className="font-bold text-lg mb-2 leading-snug">"{sub.question}"</h3>
                                            <p className="text-zinc-500 text-sm line-clamp-2">{sub.answer}</p>
                                        </div>

                                        <div className="bg-white/[0.02] p-6 flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-[Syne] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    <MessageSquare className="w-4 h-4 text-cyan-400" /> Community Feedback
                                                </h4>
                                                <button
                                                    onClick={() => loadReviewsForSubmission(sub._id)}
                                                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-400/10 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    {viewingReviewsForId === sub._id ? 'Close' : 'View Reviews'}
                                                </button>
                                            </div>

                                            <AnimatePresence>
                                                {viewingReviewsForId === sub._id && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4">
                                                        {fetchedReviews.length === 0 ? (
                                                            <p className="text-zinc-500 text-sm italic text-center py-4">Awaiting peer reviews...</p>
                                                        ) : (
                                                            fetchedReviews.map(rev => (
                                                                <div key={rev._id} className="bg-white dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-2xl p-4">
                                                                    <div className="flex justify-between mb-3 border-b border-slate-100 dark:border-white/5 pb-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center font-bold text-cyan-400 text-xs">
                                                                                {rev.reviewer?.username?.charAt(0).toUpperCase() || 'U'}
                                                                            </div>
                                                                            <span className="text-sm font-bold text-slate-600 dark:text-zinc-300">Peer Review</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-4 text-xs">
                                                                            <div className="flex items-center gap-1"><span className="text-zinc-500">Clarity:</span> <span className="text-yellow-400 font-bold">{rev.clarityScore}/5</span></div>
                                                                            <div className="flex items-center gap-1"><span className="text-zinc-500">Accuracy:</span> <span className="text-yellow-400 font-bold">{rev.accuracyScore}/5</span></div>
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-slate-500 dark:text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">{rev.comments}</p>
                                                                </div>
                                                            ))
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

            </div>

            {/* Creation Modal */}
            <AnimatePresence>
                {isSubmitting && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSubmitting(false)} className="absolute inset-0 bg-white dark:bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
                            <div className="p-8">
                                <h2 className="text-2xl font-[Syne] font-bold mb-2">Ask for Feedback</h2>
                                <p className="text-slate-500 dark:text-zinc-400 mb-8 border-b border-slate-100 dark:border-white/5 pb-6">Post a past interview answer to have it reviewed by the community.</p>

                                <form onSubmit={handleCreateSubmission} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className={`cursor-pointer border p-4 rounded-2xl transition-all ${submitForm.type === 'behavioral' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-slate-200 dark:border-white/10 text-zinc-500 hover:bg-white/5'}`}>
                                            <input type="radio" className="hidden" name="type" checked={submitForm.type === 'behavioral'} onChange={() => setSubmitForm({ ...submitForm, type: 'behavioral' })} />
                                            <div className="font-bold mb-1">Behavioral</div>
                                            <div className="text-xs opacity-70">Leadership, Conflict, etc.</div>
                                        </label>
                                        <label className={`cursor-pointer border p-4 rounded-2xl transition-all ${submitForm.type === 'technical' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-slate-200 dark:border-white/10 text-zinc-500 hover:bg-white/5'}`}>
                                            <input type="radio" className="hidden" name="type" checked={submitForm.type === 'technical'} onChange={() => setSubmitForm({ ...submitForm, type: 'technical' })} />
                                            <div className="font-bold mb-1">Technical</div>
                                            <div className="text-xs opacity-70">System Design, Algorithms</div>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-slate-500 dark:text-zinc-400 mb-2 block">The Question</label>
                                        <input
                                            required
                                            value={submitForm.question}
                                            onChange={e => setSubmitForm({ ...submitForm, question: e.target.value })}
                                            placeholder="e.g. Tell me about a time you had a conflict with a teammate."
                                            className="w-full bg-white dark:bg-[#08080f] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-slate-500 dark:text-zinc-400 mb-2 block">Your Answer</label>
                                        <textarea
                                            required
                                            value={submitForm.answer}
                                            onChange={e => setSubmitForm({ ...submitForm, answer: e.target.value })}
                                            placeholder="Paste your text answer, or drop a link to your Video CV."
                                            className="w-full h-32 resize-none bg-white dark:bg-[#08080f] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                        <button type="button" onClick={() => setIsSubmitting(false)} className="flex-1 py-3 font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white transition-colors">Cancel</button>
                                        <button type="submit" className="flex-[2] bg-cyan-500 hover:bg-cyan-400 text-black py-3 rounded-xl font-bold transition-colors">Post for Review</button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
