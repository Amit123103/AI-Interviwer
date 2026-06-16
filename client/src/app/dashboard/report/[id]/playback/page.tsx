"use client"

import React, { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, Maximize, Brain, TrendingUp, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export default function PlaybackPage() {
    const params = useParams()
    const router = useRouter()
    const videoRef = useRef<HTMLVideoElement>(null)
    const [report, setReport] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [activeFeedback, setActiveFeedback] = useState<any>(null)
    const [activeVision, setActiveVision] = useState<any>(null)

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/reports/${params.id}`)
                const data = await res.json()
                setReport(data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchReport()
    }, [params.id])

    // Synchronize overlays with video time
    useEffect(() => {
        if (!report?.eventLogs) return

        const interval = setInterval(() => {
            if (videoRef.current) {
                const time = videoRef.current.currentTime * 1000 // Convert to ms
                setCurrentTime(videoRef.current.currentTime)

                // Find relevant vision snapshot
                const visionLogs = report.eventLogs.filter((l: any) => l.eventType === 'vision_snapshot')
                const currentVision = visionLogs.findLast((l: any) => l.timestamp <= time)
                setActiveVision(currentVision?.metadata || null)

                // Find active AI/User response if needed, or feedback markers
                const aiLogs = report.eventLogs.filter((l: any) => l.eventType === 'ai_response')
                const currentAI = aiLogs.findLast((l: any) => l.timestamp <= time)

                // Show feedback if the AI response was within the last 5 seconds of playback
                if (currentAI && (time - currentAI.timestamp) < 5000) {
                    setActiveFeedback(currentAI.metadata.text)
                } else {
                    setActiveFeedback(null)
                }
            }
        }, 100)

        return () => clearInterval(interval)
    }, [report])

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause()
            else videoRef.current.play()
            setIsPlaying(!isPlaying)
        }
    }

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value)
        if (videoRef.current) {
            videoRef.current.currentTime = time
            setCurrentTime(time)
        }
    }

    if (loading) return <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white"><Loader2 className="animate-spin text-primary" /></div>
    if (!report?.videoUrl) return <div className="text-slate-900 dark:text-white text-center py-20">No recording available for this session.</div>

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-4 md:p-10 font-sans select-none">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <Link href={`/dashboard/report/${params.id}`}>
                        <Button variant="ghost" className="text-zinc-500 hover:text-slate-900 dark:text-white gap-2">
                            <ArrowLeft className="w-4 h-4" /> Back to Analysis
                        </Button>
                    </Link>
                    <div className="text-center">
                        <h1 className="text-2xl font-black uppercase tracking-tighter">Session Playback</h1>
                        <p className="text-xs text-zinc-500">{report.sector} Round • {new Date(report.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="w-24" /> {/* Spacer */}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Video Player Column */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="relative aspect-video bg-white dark:bg-zinc-950 rounded-3xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-2xl group">
                            <video
                                ref={videoRef}
                                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}${report.videoUrl}`}
                                className="w-full h-full object-contain"
                                onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                onClick={togglePlay}
                            />

                            {/* Synchronized Overlays */}
                            <AnimatePresence>
                                {activeVision && (
                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                                        <div className="bg-white dark:bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 flex items-center gap-2">
                                            <TrendingUp className={`w-3 h-3 ${activeVision.attentionScore > 70 ? 'text-green-400' : 'text-amber-400'}`} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Focus: {activeVision.attentionScore}%</span>
                                        </div>
                                        <div className="bg-white dark:bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Emotion: {activeVision.emotion}</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence>
                                {activeFeedback && (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-20 left-6 right-6 z-10">
                                        <div className="bg-primary/20 backdrop-blur-xl border border-primary/40 p-4 rounded-2xl shadow-2xl">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Brain className="w-3 h-3 text-primary" />
                                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary">Live Coaching Feedback</span>
                                            </div>
                                            <p className="text-xs text-slate-900 dark:text-white/90 leading-relaxed italic">"{activeFeedback}"</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Playback Controls Buffer */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex flex-col gap-3">
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration}
                                        step="0.1"
                                        value={currentTime}
                                        onChange={handleSeek}
                                        className="w-full accent-primary h-1 rounded-full cursor-pointer bg-white/20"
                                    />
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <button onClick={togglePlay} className="text-slate-900 dark:text-white hover:text-primary transition-colors">
                                                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                                            </button>
                                            <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                                                {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Volume2 className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                                            <Maximize className="w-4 h-4 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white cursor-pointer" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Event Roadmap */}
                        <div className="bg-white/60 dark:bg-zinc-900/50 border border-slate-100 dark:border-white/5 rounded-3xl p-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6 px-2">Session Timeline Highlights</h3>
                            <div className="space-y-4">
                                {report.eventLogs?.filter((l: any) => l.eventType === 'looking_away' || l.eventType === 'ai_response').slice(0, 5).map((log: any, i: number) => (
                                    <div key={i} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors" onClick={() => {
                                        if (videoRef.current) videoRef.current.currentTime = log.timestamp / 1000
                                    }}>
                                        <div className="w-16 text-[10px] font-mono text-zinc-600">
                                            {Math.floor(log.timestamp / 1000 / 60)}:{Math.floor(log.timestamp / 1000 % 60).toString().padStart(2, '0')}
                                        </div>
                                        <div className={`p-2 rounded-lg ${log.eventType === 'looking_away' ? 'bg-red-500/10' : 'bg-primary/10'}`}>
                                            {log.eventType === 'looking_away' ? <AlertCircle className="w-4 h-4 text-red-500" /> : <Brain className="w-4 h-4 text-primary" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{log.eventType === 'looking_away' ? 'Engagement Drop' : 'AI Feedback Point'}</p>
                                            <p className="text-[10px] text-zinc-500 mt-0.5">{log.eventType === 'looking_away' ? 'Attention drifted away from screen' : 'Strategic coaching provided'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Performance Stats Column */}
                    <div className="space-y-6">
                        <Card className="bg-white dark:bg-zinc-900 border-zinc-800 rounded-3xl overflow-hidden p-6 space-y-6">
                            <h2 className="text-xl font-bold">Deep Scan Metrics</h2>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs font-bold text-zinc-500 uppercase">Avg Attention</span>
                                        <span className="text-lg font-black text-slate-900 dark:text-white">{report.scores?.focus || 0}%</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${report.scores?.focus || 0}%` }} className="h-full bg-zinc-400" />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs font-bold text-zinc-500 uppercase">Trust Level</span>
                                        <span className={`text-lg font-black uppercase tracking-tighter ${report.integrityScore > 80 ? 'text-green-500' : 'text-amber-500'}`}>
                                            {report.integrityScore > 80 ? 'Verified' : 'Flagged'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-zinc-600 italic">Score: {report.integrityScore}/100. Based on eye tracking and tab activity.</p>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500">Sentiment Over Time</h4>
                                    <div className="flex gap-2">
                                        {['Happy', 'Neutral', 'Confident', 'Thoughtful'].map((s) => (
                                            <div key={s} className="px-3 py-1 bg-white/5 border border-slate-100 dark:border-white/5 rounded-full text-[10px] text-slate-500 dark:text-zinc-400">
                                                {s}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-primary/5 border border-primary/20 rounded-3xl p-6">
                            <h3 className="text-sm font-bold text-primary mb-3">AI Coach Summary</h3>
                            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed italic">
                                "{report.feedback || "Your overall performance was solid. Pay close attention to the points marked in the video where you looked away or hesitated."}"
                            </p>
                            <Button className="w-full mt-6 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-xl">
                                Generate Improvement Training
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
