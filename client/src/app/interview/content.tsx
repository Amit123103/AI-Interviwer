"use client"

import React, { useState, useRef, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Mic, MicOff, Video, CheckCircle2, MessageSquare, Settings, ShieldCheck, ArrowRight,
    Brain, Target, AlertCircle, User, Info, X, Activity, Camera, Database, Code, Sparkles,
    RefreshCw, Play, StopCircle, Zap, TrendingUp, ChevronRight, Loader2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { socket } from "@/lib/socket"
import { initializeFaceLandmarker } from "@/lib/tracking"
import type { FaceLandmarker } from "@mediapipe/tasks-vision"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import Waveform from "@/components/Waveform"
import RealTimeScript from "@/components/RealTimeScript"
import CodeWorkspace from "@/components/CodeWorkspace"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AIAvatar from "@/components/AIAvatar"
import { useAntiCheat } from "@/hooks/useAntiCheat"
import MeshBackground from "@/app/dashboard/components/MeshBackground"
import HolographicHud from "@/components/ui/HolographicHud"
import TiltCard from "@/components/ui/TiltCard"

function InterviewContent() {
    const router = useRouter()
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isRecording, setIsRecording] = useState(false)
    const [isInterviewOver, setIsInterviewOver] = useState(false)
    const [chat, setChat] = useState<{ role: 'ai' | 'user', text: string, evaluation?: any }[]>([])
    const scrollRef = useRef<HTMLDivElement>(null)
    const [focusAlert, setFocusAlert] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [focusLogs, setFocusLogs] = useState<number[]>([])
    const [isSessionRecording, setIsSessionRecording] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [hasStarted, setHasStarted] = useState(false)
    const [errorData, setErrorData] = useState<{ message: string, type: 'error' | 'warning' } | null>(null)
    const [aiThought, setAiThought] = useState<{ move: string, suggestion: string, quality: string } | null>(null)

    const [visionFeedback, setVisionFeedback] = useState<{ message: string, color: string } | null>(null)
    const [latestEmotion, setLatestEmotion] = useState("Neutral")
    const [currentFocusScore, setCurrentFocusScore] = useState(100)
    const [interimTranscript, setInterimTranscript] = useState("")
    const [persona, setPersona] = useState("Friendly Mentor")
    const [company, setCompany] = useState("General")
    const [hintData, setHintData] = useState<{ text: string, visible: boolean } | null>(null)
    const [isHinting, setIsHinting] = useState(false)

    const [reportId, setReportId] = useState<string | null>(null)
    const [lastViolationTime, setLastViolationTime] = useState(0)
    const [isMentorWatching, setIsMentorWatching] = useState(false)
    const [realtimeConfidence, setRealtimeConfidence] = useState(50)
    const [interviewType, setInterviewType] = useState("Mixed")
    const [currentQuestion, setCurrentQuestion] = useState("")
    const [liveMetrics, setLiveMetrics] = useState<any>(null)
    const [difficultyTrend, setDifficultyTrend] = useState("Stable")
    const [isFollowup, setIsFollowup] = useState(false)
    const [lastInsight, setLastInsight] = useState<{ score: number, feedback: string, visible: boolean } | null>(null)
    const [aiThinking, setAiThinking] = useState(false)
    const lastSpeechTimeRef = useRef(Date.now())

    // 3. Inactivity Detection (Nudge)
    useEffect(() => {
        if (isRecording && !isSpeaking && !isProcessing) {
            const checkInactivity = () => {
                const idleTime = Date.now() - lastSpeechTimeRef.current
                if (idleTime > 8000) { // 8 seconds of silence
                    setVisionFeedback({ message: "INTERVYXA: Whenever you're ready, I'm listening.", color: "text-primary" })
                    setTimeout(() => setVisionFeedback(null), 3000)
                    lastSpeechTimeRef.current = Date.now() // Reset to avoid spam
                }
            }
            const interval = setInterval(checkInactivity, 2000)
            return () => clearInterval(interval)
        }
    }, [isRecording, isSpeaking, isProcessing])

    // Anti-cheat hook â€” wired to socket and toast feedback
    const handleAntiCheatViolation = useCallback((type: string, detail: string) => {
        setVisionFeedback({
            message: type === 'paste' ? 'âš ï¸ Paste blocked during interview'
                : type === 'tabSwitch' ? 'âš ï¸ Tab switch detected'
                    : `âš ï¸ ${detail}`,
            color: 'text-red-500'
        })
        setTimeout(() => setVisionFeedback(null), 4000)
    }, [])

    useAntiCheat({
        socket: hasStarted ? socket : null,
        isActive: hasStarted && !isInterviewOver,
        sessionId: typeof window !== 'undefined' ? localStorage.getItem('current_interview_id') || undefined : undefined,
        onViolation: handleAntiCheatViolation,
    })

    const searchParams = useSearchParams()
    
    // Auto-start if redirecting from setup
    useEffect(() => {
        if (searchParams.get("autoStart") === "true") {
            setHasStarted(true)
        }
    }, [searchParams])

    // Monitoring: Tab Switching & Window Blur
    useEffect(() => {
        // Load interview config from localStorage
        setInterviewType(localStorage.getItem("interview_type") || "Mixed")

        if (!socket) return

        const handleVisibilityChange = () => {
            if (document.hidden && hasStarted && isRecording && !isSpeaking) {
                console.log("Tab Hidden - Pausing Recording")
                setIsRecording(false)
                setFocusAlert(true)
                setVisionFeedback({ message: "Recording Paused: Tab switched!", color: "text-red-500" })
                socket.emit('monitoring-event', {
                    type: 'tab_hidden',
                    timestamp: Date.now()
                })
            }
        }

        const handleWindowBlur = () => {
            // Only pause if we're actively recording (not during AI speech or processing)
            if (hasStarted && isRecording && !isSpeaking && !isProcessing) {
                setIsRecording(false)
                setFocusAlert(true)
                setVisionFeedback({ message: "Recording Paused: Window lost focus!", color: "text-red-500" })
                socket.emit('monitoring-event', {
                    type: 'window_blur',
                    timestamp: Date.now()
                })
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange)
        window.addEventListener("blur", handleWindowBlur)

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange)
            window.removeEventListener("blur", handleWindowBlur)
        }
    }, [socket, hasStarted, isRecording, isSpeaking, isProcessing])

    const handleEndSession = async () => {
        setIsProcessing(true)
        mediaRecorderRef.current?.stop()

        // Stop Session Recording
        if (sessionRecorderRef.current && sessionRecorderRef.current.state !== 'inactive') {
            sessionRecorderRef.current.stop()
        }

        // Small delay to ensure last chunk is processed
        await new Promise(resolve => setTimeout(resolve, 500))

        try {
            const onsiteId = localStorage.getItem("interview_onsiteId")

            if (reportId) {
                if (onsiteId) {
                    router.push(`/dashboard/onsite/${onsiteId}`)
                } else {
                    const finalId = reportId || (typeof reportId === 'object' ? (reportId as any).id || (reportId as any)._id : null);
                    if (finalId) {
                        router.push(`/dashboard/report/${finalId}`)
                    } else {
                        router.push("/dashboard")
                    }
                }
                return
            }

            const userStr = localStorage.getItem("user")
            if (!userStr) {
                router.push("/auth/login")
                return
            }
            const user = JSON.parse(userStr)

            const videoBlob = new Blob(sessionChunksRef.current, { type: 'video/webm' })
            const formData = new FormData()

            formData.append('userId', user._id)
            formData.append('transcript', JSON.stringify(chat.map(msg => ({
                role: msg.role,
                text: msg.text,
                evaluation: msg.evaluation
            }))))
            formData.append('focusLogs', JSON.stringify(focusLogs))
            formData.append('eventLogs', JSON.stringify(eventLogsRef.current))
            formData.append('difficulty', localStorage.getItem("interview_difficulty") || "Intermediate")
            formData.append('sector', localStorage.getItem("interview_sector") || "General")
            formData.append('persona', localStorage.getItem("interview_persona") || "Friendly Mentor")
            formData.append('targetCompany', localStorage.getItem("interview_target_company") || "")
            formData.append('jobDescription', localStorage.getItem("interview_jd") || "")
            formData.append('totalQuestions', "7") // Step based flow
            formData.append('video', videoBlob, 'interview_session.webm')

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/reports`, {
                method: "POST",
                body: formData
            })

            const data = await res.json()

            if (onsiteId) {
                router.push(`/dashboard/onsite/${onsiteId}`)
            } else {
                const finalId = data.id || data._id || data.reportId;
                if (finalId) {
                    router.push(`/dashboard/report/${finalId}`)
                } else {
                    router.push("/dashboard")
                }
            }
        } catch (error) {
            console.error("Error generating report:", error)
            const onsiteId = localStorage.getItem("interview_onsiteId")
            if (onsiteId) {
                router.push(`/dashboard/onsite/${onsiteId}`)
            } else {
                router.push("/dashboard")
            }
        }
    }

    const [currentStep, setCurrentStep] = useState(1)
    const [totalSteps, setTotalSteps] = useState(10)

    useEffect(() => {
        const count = parseInt(localStorage.getItem("interview_count") || '10')
        setTotalSteps(isNaN(count) || count < 1 ? 10 : count)
    }, [])

    const [isTracking, setIsTracking] = useState(false)
    const landmarkerRef = useRef<FaceLandmarker | null>(null)
    const landmarkerClosedRef = useRef<boolean>(false)
    const requestRef = useRef<number>(null)


    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const sessionRecorderRef = useRef<MediaRecorder | null>(null)
    const sessionChunksRef = useRef<Blob[]>([])
    const eventLogsRef = useRef<{ type: string, timestamp: number, metadata?: any }[]>([])
    const sessionStartTimeRef = useRef<number>(0)
    const chunksRef = useRef<Blob[]>([])
    const aiAudioRef = useRef<HTMLAudioElement | null>(null)
    const audioQueueRef = useRef<{ audio: string, isLast: boolean }[]>([])
    const isPlayingRef = useRef(false)
    const lastAiTextRef = useRef<string>("")  // Dedup guard for AI messages
    const lastAiTimeRef = useRef<number>(0)   // Timestamp for dedup
    const hasJoinedRef = useRef(false)         // Guard against double join-interview
    const isServerProcessingRef = useRef(false) // Blocks recording while server processes audio

    const predictWebcam = () => {
        if (!landmarkerRef.current || !videoRef.current) return

        const startTimeMs = performance.now()

        if (typeof landmarkerRef.current.detectForVideo !== 'function') {
            return
        }

        const results = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs)

        // Advanced Camera Monitoring
        const now = Date.now()
        // Throttle to avoid flooding (e.g., every 3 seconds)
        const canLog = (now - lastViolationTime) > 3000

        if (results.faceLandmarks.length === 0) {
            // Face Missing
            setFocusAlert(true)
            if (canLog) {
                console.log("Face Missing")
                socket.emit('monitoring-event', { type: 'face_missing', timestamp: now })
                setLastViolationTime(now)
                setVisionFeedback({ message: "Face not detected!", color: "text-red-500" })
            }
        } else if (results.faceLandmarks.length > 1) {
            // Multiple Faces
            setFocusAlert(true)
            if (canLog) {
                console.log("Multiple Faces Detected")
                socket.emit('monitoring-event', { type: 'multiple_faces', timestamp: now })
                setLastViolationTime(now)
                setVisionFeedback({ message: "Multiple faces detected!", color: "text-red-500" })
            }
        } else {
            // Single Face - Check Attention
            setFocusAlert(false)
            const face = results.faceLandmarks[0]

            // Eye Gaze Tracking (using blendshapes)
            if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
                const blendshapes = results.faceBlendshapes[0].categories;
                const lookLeft = blendshapes.find(b => b.categoryName === 'eyeLookOutLeft')?.score || 0;
                const lookRight = blendshapes.find(b => b.categoryName === 'eyeLookOutRight')?.score || 0;

                if (lookLeft > 0.6 || lookRight > 0.6) {
                    if (canLog) {
                        console.log("Looking Away")
                        socket.emit('monitoring-event', { type: 'looking_away', timestamp: now })
                        setLastViolationTime(now)
                        setVisionFeedback({ message: "Maintain eye contact", color: "text-amber-400" })
                    }
                }
            }
        }

        requestRef.current = requestAnimationFrame(predictWebcam)
    }

    // WebSocket Integration
    useEffect(() => {
        // Clean up any existing listeners before attaching new ones
        socket.off("connect")
        socket.off("ai-response")
        socket.off("transcript-update")
        socket.off("ai-hint")
        socket.off("mentor-joined")
        socket.off("realtime-confidence")
        socket.off("error")
        socket.off("processing-start")
        socket.off("processing-end")
        socket.off("interviewer:thinking")

        socket.connect()

        socket.on("connect", () => {
            console.log("Connected to WebSocket server")

            // Guard: Only emit join-interview once per component lifecycle
            if (hasJoinedRef.current) {
                console.log("Already joined, skipping duplicate join-interview")
                return
            }

            const userStr = localStorage.getItem("user")
            const savedPersona = localStorage.getItem("interview_persona") || "Friendly Mentor"
            const savedCompany = localStorage.getItem("interview_target_company") || ""
            const savedJD = localStorage.getItem("interview_jd") || ""
            setPersona(savedPersona)
            setCompany(savedCompany)

            if (userStr) {
                hasJoinedRef.current = true
                const user = JSON.parse(userStr)
                const prebuiltQuestions = (() => {
                    try { return JSON.parse(localStorage.getItem("interview_questions") || '[]') } catch { return [] }
                })()
                socket.emit('join-interview', {
                    userId: user._id,
                    candidateName: localStorage.getItem("interview_fullName") || user.username,
                    interviewId: localStorage.getItem('current_interview_id'),
                    difficulty: localStorage.getItem("interview_difficulty") || 'Intermediate',
                    totalQuestions: parseInt(localStorage.getItem("interview_count") || '10'),
                    voice: localStorage.getItem("interview_voice") || 'Female (Alloy)',
                    sector: localStorage.getItem("interview_sector") || 'General',
                    persona: savedPersona,
                    currentStep: currentStep,
                    targetCompany: savedCompany,
                    jobDescription: savedJD,
                    language: localStorage.getItem("interview_language") || "English",
                    onsiteId: localStorage.getItem("interview_onsiteId"),
                    round: parseInt(localStorage.getItem("interview_round") || "0"),
                    prebuiltQuestions,  // RAG-generated from setup build-context
                    apiKey: localStorage.getItem("sarah_nvidia_key") || undefined
                })
            }
        })

        // â”€â”€â”€ Processing state from server â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        socket.on('processing-start', () => {
            console.log("ðŸ”„ Server processing audio...")
            isServerProcessingRef.current = true
            setIsProcessing(true)
            // Auto-dismiss after 2s max â€” instant flow means it should clear fast
            setTimeout(() => setIsProcessing(false), 2000)
        })

        socket.on('processing-end', () => {
            console.log("âœ… Server finished processing")
            isServerProcessingRef.current = false
            setIsProcessing(false)
            setAiThinking(false)
        })

        // â”€â”€ Interviewer "thinking" indicator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        socket.on('interviewer:thinking', () => {
            setAiThinking(true)
            // Auto-clear after 4s in case server doesn't send processing-end
            setTimeout(() => setAiThinking(false), 4000)
        })

        // â”€â”€â”€ Delayed TTS audio (sent separately from question text) â”€â”€
        socket.on('tts-audio', (data: any) => {
            if (data?.audio) {
                try {
                    const audioBytes = atob(data.audio)
                    const audioArray = new Uint8Array(audioBytes.length)
                    for (let i = 0; i < audioBytes.length; i++) audioArray[i] = audioBytes.charCodeAt(i)
                    const blob = new Blob([audioArray], { type: 'audio/mp3' })
                    const url = URL.createObjectURL(blob)
                    const audioEl = new Audio(url)
                    
                    // Stop any fallback browser speech before playing high-quality AI audio
                    if (window.speechSynthesis) window.speechSynthesis.cancel()
                    if (aiAudioRef.current) {
                        aiAudioRef.current.pause()
                        aiAudioRef.current.currentTime = 0
                    }
                    aiAudioRef.current = audioEl
                    
                    audioEl.onended = () => {
                        URL.revokeObjectURL(url)
                        if (aiAudioRef.current === audioEl) aiAudioRef.current = null
                    }
                    audioEl.play().catch(() => { /* browser may block autoplay */ })
                } catch (e) {
                    console.warn('tts-audio playback failed:', e)
                }
            }
        })

        socket.on('ai-response', (data: any) => {
            const { text, audio, isLast, audioAnalysis, thoughtProcess, reportId, metrics, difficultyTrend: trend, isFollowup: followup } = data

            // Cancel any ongoing TTS/audio before playing new response
            if (window.speechSynthesis) window.speechSynthesis.cancel()
            if (aiAudioRef.current) {
                aiAudioRef.current.pause()
                aiAudioRef.current.currentTime = 0
                aiAudioRef.current = null
            }
            isPlayingRef.current = false
            isServerProcessingRef.current = false

            // DEDUP GUARD: Skip if same text received within 2 seconds
            const now = Date.now()
            if (text === lastAiTextRef.current && (now - lastAiTimeRef.current) < 2000) {
                console.log("Skipping duplicate ai-response:", text.substring(0, 40))
                return
            }
            lastAiTextRef.current = text
            lastAiTimeRef.current = now

            setIsFollowup(!!followup)

            setChat(prev => {
                const newChat = [...prev];
                // Attach metrics to the last user message if available
                if (metrics) {
                    for (let i = newChat.length - 1; i >= 0; i--) {
                        if (newChat[i].role === 'user' && !newChat[i].evaluation) {
                            newChat[i] = { ...newChat[i], evaluation: metrics };
                            break;
                        }
                    }
                }
                newChat.push({ role: 'ai', text });
                return newChat;
            })

            // Track current question text for avatar display
            setCurrentQuestion(text.slice(0, 200))

            if (!followup) {
                // Only advance step if it's a new main question
                setCurrentStep(prev => Math.min(prev + 1, totalSteps))
            }

            if (reportId) {
                setReportId(reportId)
            }

            const timestamp = now - sessionStartTimeRef.current
            eventLogsRef.current.push({
                type: 'ai_response',
                timestamp,
                metadata: {
                    text,
                    audioAnalysis // { tone, pace, pitch_variance }
                }
            })

            // Only queue audio if it's a real base64 string (not empty/placeholder)
            if (audio && typeof audio === 'string' && audio.length > 100) {
                audioQueueRef.current.push({ audio, isLast: !!isLast })
                processAudioQueue()
            } else {
                // NO base64 audio â€” use browser's native TTS as fallback
                // This ensures the student ALWAYS hears the question
                console.log("No audio from AI service, using browser TTS fallback...")
                speakWithBrowserTTS(text, !!isLast)
            }
            setIsProcessing(false) // AI finished generating
        })

        socket.on('transcript-update', (data: any) => {
            // Only handle USER messages here â€” AI messages come via 'ai-response'
            if (data.role === 'user') {
                setChat(prev => [...prev, { role: 'user', text: data.text }])

                const timestamp = Date.now() - sessionStartTimeRef.current
                eventLogsRef.current.push({ type: 'user_response', timestamp, metadata: { text: data.text } })

                // Note: currentStep is now incremented in ai-response only for non-followups
            }
            // AI role messages are intentionally ignored here to prevent duplicates
        })

        socket.on('ai-hint', (data: any) => {
            const { text, audio, isMentor } = data
            setHintData({ text, visible: true })
            setIsProcessing(false)
            if (isMentor) {
                setVisionFeedback({ message: "Mentor provided feedback!", color: "text-primary" })
            }
            if (audio) {
                const audioObj = new Audio(`data:audio/mp3;base64,${audio}`)
                audioObj.onended = () => {
                    setTimeout(() => setHintData(prev => prev ? { ...prev, visible: false } : null), 5000)
                }
                audioObj.play().catch(e => console.error("Error playing hint:", e))
            }
        })

        socket.on('mentor-joined', () => {
            setIsMentorWatching(true)
        })

        socket.on('realtime-confidence', (data: any) => {
            setRealtimeConfidence(data.score)
        })

        socket.on('live-metrics-update', (data: any) => {
            setLiveMetrics(data)
            setLastInsight({
                score: data.technicalScore + data.communicationScore, // sum out of 20
                feedback: data.feedback,
                visible: true
            })
            // Auto-hide after 6 seconds
            setTimeout(() => {
                setLastInsight(prev => prev ? { ...prev, visible: false } : null)
            }, 6000)
        })

        socket.on('error', (data: any) => {
            console.error("Socket error details:", data)
            // If data is {} but might have properties, inspect them
            if (data && typeof data === 'object' && Object.keys(data).length === 0) {
                console.group("Mysterious Socket Error ({})")
                console.log("Keys:", Object.getOwnPropertyNames(data))
                console.log("Message:", data?.message)
                console.log("Stack:", data?.stack)
                console.groupEnd()
            }

            setIsProcessing(false)
            setAiThinking(false)
            isServerProcessingRef.current = false

            // Show actionable errors to the user
            const msg = data?.message || (typeof data === 'string' ? data : "An unexpected connection error occurred.")
            const type = data?.type || 'error'
            
            setErrorData({ message: msg, type: type === 'error' ? 'error' : 'warning' })
            
            // Auto-hide after 8 seconds
            setTimeout(() => setErrorData(null), 8000)
        })

        // Handle reconnection
        socket.on('reconnect', () => {
            console.log("WebSocket reconnected")
            hasJoinedRef.current = false // Allow re-join on reconnect
        })

        return () => {
            socket.off("connect")
            socket.off("ai-response")
            socket.off("transcript-update")
            socket.off("ai-hint")
            socket.off("mentor-joined")
            socket.off("realtime-confidence")
            socket.off("error")
            socket.off("processing-start")
            socket.off("processing-end")
            socket.off("tts-audio")
            socket.off("interviewer:thinking")
            socket.off("reconnect")
            socket.disconnect()
        }
    }, [])

    // Auto-scroll transcript
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [chat])

    // MediaPipe & Camera Integration
    useEffect(() => {
        let isMounted = true

        if (!hasStarted) return

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })

                if (!isMounted) {
                    stream.getTracks().forEach(track => track.stop())
                    return
                }

                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    videoRef.current.addEventListener("loadeddata", predictWebcam)
                }

                const landmarker = await initializeFaceLandmarker()

                if (!isMounted) {
                    // Close immediately if component unmounted during initialization
                    try {
                        if (landmarker && typeof landmarker.close === 'function') {
                            landmarker.close()
                        }
                    } catch (e) {
                        // Ignore cleanup errors
                    }
                    return
                }

                if (landmarker) {
                    landmarkerRef.current = landmarker
                    landmarkerClosedRef.current = false // Reset closed flag
                    setIsTracking(true)
                }

                // Start Session Recording
                const sessionRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
                sessionRecorderRef.current = sessionRecorder
                sessionChunksRef.current = []
                sessionStartTimeRef.current = Date.now()

                sessionRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) sessionChunksRef.current.push(e.data)
                }
                sessionRecorder.start(1000) // Chunk every second
                setIsSessionRecording(true)

            } catch (err) {
                console.error("Error initializing camera/tracking:", err)
                if (isMounted) setIsTracking(false)
            }
        }

        startCamera()

        return () => {
            isMounted = false
            if (requestRef.current) cancelAnimationFrame(requestRef.current)

            // Stop camera tracks
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream
                stream.getTracks().forEach(track => track.stop())
                videoRef.current.removeEventListener("loadeddata", predictWebcam)
            }

            // Safely close landmarker with multiple guards
            if (landmarkerRef.current && !landmarkerClosedRef.current) {
                try {
                    // Check if close method exists and landmarker is valid
                    if (typeof landmarkerRef.current.close === 'function') {
                        landmarkerRef.current.close()
                        landmarkerClosedRef.current = true
                    }
                } catch (err) {
                    // Silently handle any close errors
                    console.debug("Landmarker cleanup completed")
                }
            }
            landmarkerRef.current = null
        }
    }, [hasStarted])

    // Vision Analysis Loop
    useEffect(() => {
        if (!hasStarted || isInterviewOver) return

        const interval = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
                try {
                    const canvas = document.createElement('canvas')
                    canvas.width = videoRef.current.videoWidth
                    canvas.height = videoRef.current.videoHeight
                    const ctx = canvas.getContext('2d')
                    if (ctx) {
                        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
                        canvas.toBlob(async (blob) => {
                            if (blob) {
                                const formData = new FormData()
                                formData.append('frame', blob, 'frame.jpg')

                                try {
                                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/reports/analyze-frame`, {
                                        method: 'POST',
                                        body: formData
                                    })
                                    const data = await res.json()

                                    // Log Vision Snapshot
                                    const timestamp = Date.now() - sessionStartTimeRef.current
                                    eventLogsRef.current.push({
                                        type: 'vision_snapshot',
                                        timestamp,
                                        metadata: {
                                            emotion: data.emotion,
                                            attentionScore: data.attention_score,
                                            lookingAway: data.looking_away
                                        }
                                    })

                                    if (data.engagement_score < 50 && Math.random() > 0.6) {
                                        setVisionFeedback({ message: "Stay focused!", color: "text-red-400" })
                                        setTimeout(() => setVisionFeedback(null), 3000)
                                    } else if (data.looking_away) {
                                        setVisionFeedback({ message: "Maintain eye contact", color: "text-amber-400" })
                                        setTimeout(() => setVisionFeedback(null), 3000)
                                    } else if (data.posture !== "Neutral") {
                                        setVisionFeedback({ message: `Posture Alert: ${data.posture}`, color: "text-blue-400" })
                                        setTimeout(() => setVisionFeedback(null), 3000)
                                    } else if (data.emotion === "Smiling" && Math.random() > 0.8) {
                                        setVisionFeedback({ message: "Great confidence!", color: "text-green-400" })
                                        setTimeout(() => setVisionFeedback(null), 3000)
                                    } else if (data.lighting === "Too Dark") {
                                        setVisionFeedback({ message: "Low lighting detected", color: "text-yellow-200" })
                                        setTimeout(() => setVisionFeedback(null), 3000)
                                    }
                                } catch (e) {
                                    // Silent fail
                                }
                            }
                        }, 'image/jpeg', 0.8)
                    }
                } catch (err) {
                    console.error("Frame capture error", err)
                }
            }
        }, 4000) // Every 4 seconds

        return () => clearInterval(interval)
    }, [hasStarted, isInterviewOver])



    const [volume, setVolume] = useState(0)
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)

    // Speech Recognition for Real-time Transcripts
    const recognitionRef = useRef<any>(null)

    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).webkitSpeechRecognition) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition
            const recognition = new SpeechRecognition()
            recognition.continuous = true
            recognition.interimResults = true
            recognition.lang = 'en-US'

            recognition.onresult = (event: any) => {
                let interim = ''
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        // Optional: Append to main chat if not handled by backend
                        // But backend handles the final transcript via socket, so we might just clear interim
                    } else {
                        interim += event.results[i][0].transcript
                    }
                }
                setInterimTranscript(interim)
            }

            recognition.onend = () => {
                // Auto-restart if still recording
                if (isRecording) {
                    try {
                        recognition.start()
                    } catch (e) {
                        // Ignore error if already started
                    }
                } else {
                    setInterimTranscript("")
                }
            }

            recognitionRef.current = recognition
        }
    }, [isRecording]) // Re-create if needed, or better, just on mount and manage start/stop in effect

    // Manage Recognition Start/Stop
    useEffect(() => {
        const recognition = recognitionRef.current
        if (!recognition) return

        if (isRecording) {
            try {
                recognition.start()
            } catch (e) {
                // Already started
            }
        } else {
            recognition.stop()
            setInterimTranscript("")
        }
    }, [isRecording])

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop()
        }
        setIsRecording(false)
    }

    const startRecording = async () => {
        try {
            if (isRecording) return
            // Block recording while server is still processing previous response
            if (isServerProcessingRef.current) {
                console.log("â³ Server still processing, delaying recording start...")
                setTimeout(startRecording, 500)
                return
            }
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            chunksRef.current = []

            // Silence Detection Logic â€” improved for reliable speech capture
            const audioContext = new AudioContext()
            audioContextRef.current = audioContext
            const source = audioContext.createMediaStreamSource(stream)
            const analyser = audioContext.createAnalyser()
            analyser.fftSize = 256
            source.connect(analyser)
            analyserRef.current = analyser

            const bufferLength = analyser.frequencyBinCount
            const dataArray = new Uint8Array(bufferLength)

            // Track recording state for smart silence detection
            const recordingStartTime = Date.now()
            let hasDetectedSpeech = false // Only stop after student actually speaks
            let lastSpeechTimestamp = 0   // Track when speech was last detected
            const MIN_RECORDING_MS = 500  // Minimum 0.5s before silence can stop recording
            const SILENCE_TIMEOUT_MS = 2000 // 2.0 seconds of silence â€” more "perfect" for students
            const SPEECH_THRESHOLD = 12 // Slightly more sensitive to capture soft voices
            const SILENCE_THRESHOLD = 8 // Lower silence floor


            const checkSilence = () => {
                if (!analyserRef.current) return
                analyserRef.current.getByteFrequencyData(dataArray)
                const sum = dataArray.reduce((a, b) => a + b, 0)
                const avg = sum / bufferLength
                setVolume(avg)

                const elapsed = Date.now() - recordingStartTime

                // 1. Barge-In Logic: If user speaks loudly (> 20 avg) while AI is talking
                if (avg > 20 && isPlayingRef.current) {
                    console.log("Barge-in detected! Stopping AI...")
                    if (aiAudioRef.current) {
                        aiAudioRef.current.pause()
                        aiAudioRef.current.currentTime = 0
                    }
                    audioQueueRef.current = []
                    isPlayingRef.current = false
                    setIsSpeaking(false)
                }

                // 2. Track if student has spoken
                if (avg >= SPEECH_THRESHOLD) {
                    hasDetectedSpeech = true
                    lastSpeechTimestamp = Date.now()
                    lastSpeechTimeRef.current = Date.now() // Update global inactivity ref
                    // Clear any silence timer when speech is detected
                    if (silenceTimerRef.current) {
                        clearTimeout(silenceTimerRef.current)
                        silenceTimerRef.current = null
                    }
                }

                // 3. Silence detection â€” only triggers AFTER:
                //    a) Minimum recording time (3s) has passed
                //    b) Student has actually spoken
                //    c) 1.2s of continuous silence
                //    d) At least 500ms since last speech (prevents false triggers)
                const timeSinceLastSpeech = Date.now() - lastSpeechTimestamp
                if (avg < SILENCE_THRESHOLD && elapsed > MIN_RECORDING_MS && hasDetectedSpeech && timeSinceLastSpeech > 500) {
                    if (!silenceTimerRef.current) {
                        silenceTimerRef.current = setTimeout(() => {
                            if (mediaRecorder.state === "recording") {
                                console.log(`Silence after speech detected (${(elapsed / 1000).toFixed(1)}s recorded), stopping...`)
                                mediaRecorder.stop()
                                // STT FALLBACK: If server-side Whisper fails or times out, we can use the interim/local transcript
                                const sttTimeout = setTimeout(() => {
                                    if (isProcessing && interimTranscript.length > 10) {
                                        console.log("Whisper STT timeout/fail, using local fallback transcript:", interimTranscript)
                                        socket.emit('text-response', {
                                            text: interimTranscript,
                                            currentQuestion: currentStep,
                                            totalQuestions: totalSteps,
                                            emotion: latestEmotion,
                                            focusScore: currentFocusScore
                                        })
                                        setInterimTranscript("")
                                    }
                                }, 8000) // 8s timeout for Whisper

                                socket.once('ai-response', () => clearTimeout(sttTimeout))
                                socket.once('transcript-update', () => clearTimeout(sttTimeout))
                            }
                        }, SILENCE_TIMEOUT_MS)
                    }
                } else if (avg >= SILENCE_THRESHOLD) {
                    if (silenceTimerRef.current) {
                        clearTimeout(silenceTimerRef.current)
                        silenceTimerRef.current = null
                    }
                }

                if (mediaRecorder.state === "recording") {
                    requestAnimationFrame(checkSilence)
                }
            }

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data)
                }
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
                const recordingDuration = Date.now() - recordingStartTime
                console.log(`Recording stopped. Duration: ${(recordingDuration / 1000).toFixed(1)}s, Speech detected: ${hasDetectedSpeech}`)

                // Only send if student actually spoke (avoid sending silence)
                if (hasDetectedSpeech && recordingDuration > 500) {
                    socket.emit('audio-response', {
                        audio: blob,
                        currentQuestion: currentStep,
                        totalQuestions: totalSteps,
                        emotion: latestEmotion,
                        focusScore: currentFocusScore
                    })
                } else {
                    console.log("No speech detected, not sending audio. Restarting recording...")
                    setIsRecording(false)
                    // Restart recording â€” give student another chance
                    setTimeout(startRecording, 500)
                    // Cleanup and return early
                    audioContext.close()
                    analyserRef.current = null
                    if (silenceTimerRef.current) {
                        clearTimeout(silenceTimerRef.current)
                        silenceTimerRef.current = null
                    }
                    return
                }

                setIsRecording(false)

                // Cleanup Audio Context
                audioContext.close()
                analyserRef.current = null
                if (silenceTimerRef.current) {
                    clearTimeout(silenceTimerRef.current)
                    silenceTimerRef.current = null
                }
            }

            mediaRecorder.start()
            setIsRecording(true)
            console.log("ðŸŽ¤ Recording started â€” speak your answer...")
            requestAnimationFrame(checkSilence)
        } catch (err) {
            console.error("Error accessing microphone:", err)
        }
    }



    // Playback and Auto-resume with Queue
    const processAudioQueue = () => {
        if (isPlayingRef.current || audioQueueRef.current.length === 0) return

        const next = audioQueueRef.current.shift()
        if (!next) return

        isPlayingRef.current = true
        setIsSpeaking(true)

        const audio = new Audio(`data:audio/mp3;base64,${next.audio}`)
        audio.volume = 1.0
        aiAudioRef.current = audio

        audio.onended = () => {
            isPlayingRef.current = false

            if (audioQueueRef.current.length > 0) {
                // Play next chunk immediately (Smooth Speaking)
                processAudioQueue()
            } else {
                setIsSpeaking(false)
                if (next.isLast) {
                    console.log("Interview concluded.")
                    setIsInterviewOver(true)
                    return
                }
                // AI finished speaking â€” wait 1 second then start recording
                console.log("AI finished speaking, starting recording in 1s...")
                setTimeout(startRecording, 1000)
            }
        }

        audio.play().catch(e => {
            console.error("Error playing base64 audio, falling back to browser TTS:", e)
            isPlayingRef.current = false
            setIsSpeaking(false)
            // Fallback: use browser TTS if audio playback fails
            speakWithBrowserTTS(currentQuestion || "Let me continue.", next.isLast)
        })
    }

    // Browser TTS Fallback â€” guarantees the student ALWAYS hears the AI
    const speakWithBrowserTTS = (text: string, isLast: boolean) => {
        if (!window.speechSynthesis) {
            console.error("Browser does not support SpeechSynthesis")
            // Last resort: just start recording after delay
            if (!isLast) setTimeout(startRecording, 2000)
            return
        }

        // Cancel any ongoing speech 
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 1.0
        utterance.pitch = 1.0
        utterance.volume = 1.0
        utterance.lang = 'en-US'

        // Voice selection based on user preference from localStorage
        const voicePref = (localStorage.getItem('interview_voice') || 'Female').toLowerCase()
        const voices = window.speechSynthesis.getVoices()

        let selectedVoice = null
        if (voicePref.includes('male') && !voicePref.includes('female')) {
            // Male voice preference
            selectedVoice = voices.find(v => v.name.includes('Male') || v.name.includes('David') || v.name.includes('James') || v.name.includes('Mark'))
                || voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male'))
                || voices.find(v => v.lang.startsWith('en'))
        } else {
            // Female voice preference (default)
            selectedVoice = voices.find(v => v.name.includes('Samantha') || v.name.includes('Google US English') || v.name.includes('Zira') || v.name.includes('Female'))
                || voices.find(v => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('woman')))
                || voices.find(v => v.name.includes('Google') || v.name.includes('Microsoft'))
                || voices.find(v => v.lang.startsWith('en'))
        }
        if (selectedVoice) utterance.voice = selectedVoice

        isPlayingRef.current = true
        setIsSpeaking(true)

        utterance.onend = () => {
            isPlayingRef.current = false
            setIsSpeaking(false)
            if (isLast) {
                setIsInterviewOver(true)
                return
            }
            // AI finished speaking via TTS â€” wait 1 second then start recording
            setTimeout(startRecording, 1000)
        }

        utterance.onerror = (e) => {
            console.error("TTS error:", e)
            isPlayingRef.current = false
            setIsSpeaking(false)
            // Even if TTS fails, start recording so flow doesn't stall
            if (!isLast) setTimeout(startRecording, 2000)
        }

        window.speechSynthesis.speak(utterance)
    }

    const playAIAudio = (base64Audio: string, isLast?: boolean) => {
        // Legacy wrapper if needed, but we use queue now
        audioQueueRef.current.push({ audio: base64Audio, isLast: !!isLast })
        processAudioQueue()
    }

    // Handle Mic Toggle (Manual fallback)
    const handleMicToggle = () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop()
        } else {
            startRecording()
        }
    }

    /* removed duplicate */

    const requestHint = () => {
        if (isProcessing || isSpeaking) return
        setIsProcessing(true)
        socket.emit('request-hint', {
            currentCode: "" // Optional for future technical hints
        })
    }

    return (
        <div className="min-h-screen bg-transparent text-white relative overflow-hidden font-sans">
            <MeshBackground />
            <HolographicHud />

            <div className="relative z-10 flex flex-col h-screen overflow-hidden">
                {/* START OVERLAY - ONLY SHOWN IF NOT STARTED */}
                {!hasStarted && (
                    <div className="absolute inset-0 z-[110] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="text-center space-y-12 max-w-2xl w-full"
                        >
                            <div className="relative mx-auto w-40 h-40">
                                <motion.div
                                    animate={{ scale: [1, 1.05, 1], rotate: -360 }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 rounded-[2.5rem] border border-dashed border-primary/20"
                                />
                                <div className="absolute inset-4 rounded-[2rem] bg-primary/5 flex items-center justify-center border border-primary/10 backdrop-blur-3xl shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)]">
                                    <Video className="w-12 h-12 text-primary drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h1 className="text-6xl font-black uppercase tracking-tighter leading-none italic">
                                        READY FOR <span className="text-primary tracking-widest">{localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!).username : "CANDIDATE"}</span>?
                                    </h1>
                                    <p className="text-zinc-500 text-xl font-medium tracking-tight">
                                        AI Interviewer has analyzed your profile for <span className="text-white font-bold">{localStorage.getItem("interview_target_company") || "Target Role"}</span>.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-6 text-left">
                                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-2 backdrop-blur-md">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Session Depth</p>
                                        <p className="text-xl font-bold tracking-tight italic">{totalSteps} TRANSMISSIONS</p>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-2 backdrop-blur-md">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Signal Integrity</p>
                                        <p className="text-xl font-bold tracking-tight italic uppercase">{localStorage.getItem("interview_difficulty") || "Medium"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 pt-6">
                                <Button
                                    className="w-full h-24 text-2xl font-black uppercase tracking-[0.3em] bg-primary hover:bg-white text-black shadow-[0_20px_60px_rgba(var(--primary-rgb),0.3)] rounded-[2.5rem] transition-all hover:-translate-y-2 group"
                                    onClick={() => setHasStarted(true)}
                                >
                                    START UPLINK <ArrowRight className="ml-4 w-8 h-8 group-hover:translate-x-2 transition-transform" />
                                </Button>
                                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] animate-pulse flex items-center justify-center gap-3">
                                    <ShieldCheck className="w-4 h-4" /> ENCRYPTED BIOMETRIC TERMINAL ACTIVE
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* â”€â”€ TOP NAVIGATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                <header className="min-h-[64px] border-b border-white/5 bg-black/40 backdrop-blur-2xl px-8 flex items-center justify-between shrink-0 relative z-50">
                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-4 group cursor-help">
                            <div className="relative w-10 h-10 flex items-center justify-center">
                                <div className="absolute inset-0 bg-primary/20 rounded-xl rotate-45 group-hover:rotate-90 transition-transform duration-700" />
                                <Brain className="text-primary w-6 h-6 relative z-10" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-lg font-black uppercase tracking-tighter leading-tight italic bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                                    NEURAL INTERFACE <span className="text-primary text-[10px] ml-2 font-mono not-italic opacity-50">X-4.0</span>
                                </h1>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[7px] font-black uppercase tracking-[0.3em] text-zinc-500">UPLINK ESTABLISHED // SECURE</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-8 w-px bg-white/5" />

                        <div className="hidden lg:flex items-center gap-8">
                            <div className="flex flex-col">
                                <span className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-1">Session Protocol</span>
                                <span className="text-[10px] font-bold text-primary tracking-widest">{interviewType} // {persona.toUpperCase()}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-1">Sector Analysis</span>
                                <span className="text-[10px] font-bold text-white tracking-widest">{company || 'GENERAL'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl">
                            <Activity className="w-3 h-3 text-primary animate-pulse" />
                            <span className="text-[9px] font-mono text-zinc-400 tracking-tighter">LAT: 42ms // JITTER: 2.1ms</span>
                        </div>
                        
                        <div className="h-8 w-px bg-white/5" />

                        <div className="flex items-center gap-4">
                            <div className={`flex px-4 py-2 rounded-full border items-center gap-3 text-[9px] font-black tracking-[0.2em] transition-all duration-700 ${isMentorWatching ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'bg-white/5 border-white/10 text-zinc-600'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${isMentorWatching ? 'bg-purple-500 animate-pulse shadow-[0_0_10px_#a855f7]' : 'bg-zinc-800'}`} />
                                {isMentorWatching ? 'MENTOR OVERRIDE ACTIVE' : 'AI-AUTONOMOUS'}
                            </div>
                            
                            <Button 
                                variant="destructive" 
                                className="h-10 px-6 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:scale-105"
                                onClick={handleEndSession}
                            >
                                TERMINATE
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex flex-col lg:flex-row overflow-hidden p-3 sm:p-6 gap-3 sm:gap-6">
                    {/* â”€â”€ LEFT PANEL: AVATAR & VISUALS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                    <div className="hidden lg:flex w-1/3 flex-col gap-6 overflow-hidden">
                        <TiltCard className="flex-1">
                            <Card className="h-full bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden relative group/avatar">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                                <CardContent className="h-full p-0 relative flex flex-col">
                                    {/* Vision Feedback HUD Alert */}
                                    <AnimatePresence>
                                        {visionFeedback && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                                exit={{ opacity: 0, scale: 1.1 }}
                                                className={`absolute top-6 left-6 z-50 px-4 py-2 bg-black/80 backdrop-blur-md rounded-xl border border-white/10 ${visionFeedback.color} text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-3`}
                                            >
                                                <div className="w-2 h-2 rounded-full bg-current animate-ping" />
                                                {visionFeedback.message}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* AI Avatar Hub */}
                                    <div className="flex-1 min-h-0 relative group">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <AIAvatar
                                                isSpeaking={isSpeaking || isPlayingRef.current}
                                                isThinking={aiThinking}
                                                persona={persona}
                                            />
                                        </div>

                                        {/* Status Indicators */}
                                        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">NEURAL ARCHITECTURE ACTIVE</span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5">
                                                    <Activity className="w-3 h-3 text-primary" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-primary/80">LATENCY: 42MS</span>
                                                </div>
                                            </div>

                                            <div className="w-24 h-24 relative opacity-40">
                                                <div className="absolute inset-0 border border-white/10 rounded-full animate-[spin_10s_linear_infinite]" />
                                                <div className="absolute inset-2 border border-primary/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white/20">CTRL</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Insight/Hint Panel */}
                                    <AnimatePresence>
                                        {hintData?.visible && (
                                            <motion.div
                                                initial={{ y: 50, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: 50, opacity: 0 }}
                                                className="absolute bottom-6 left-6 right-6 p-4 bg-primary/10 backdrop-blur-xl border border-primary/20 rounded-2xl z-40"
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Sparkles className="text-primary w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Strategic Insight</span>
                                                </div>
                                                <p className="text-xs text-white leading-relaxed">{hintData.text}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </CardContent>
                            </Card>
                        </TiltCard>

                        {/* Real-time Metrics Dashboard */}
                        <TiltCard>
                            <Card className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Confidence Score</span>
                                        <div className="flex flex-col gap-2">
                                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-primary"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${realtimeConfidence}%` }}
                                                    transition={{ type: "spring", damping: 15 }}
                                                />
                                            </div>
                                            <span className="text-xl font-black text-white">{realtimeConfidence}%</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Focus Stability</span>
                                        <div className="flex flex-col gap-2">
                                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-emerald-500"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${currentFocusScore}%` }}
                                                    transition={{ type: "spring", damping: 15 }}
                                                />
                                            </div>
                                            <span className="text-xl font-black text-white">{currentFocusScore}%</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </TiltCard>
                    </div>

                    {/* â”€â”€ CENTRAL PANEL: MAIN INTERACTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                        {/* Interview Content / Workspace */}
                        <Card className="flex-1 bg-zinc-900/10 backdrop-blur-sm border border-white/5 rounded-[2rem] overflow-hidden relative flex flex-col">
                            {/* Visual Progress HUD */}
                            <div className="absolute top-0 inset-x-0 h-1 flex">
                                {Array.from({ length: totalSteps }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`flex-1 h-full transition-all duration-700 ${i < currentStep ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]' : 'bg-white/5'}`}
                                        style={{ borderRight: i < totalSteps - 1 ? '1px solid black' : 'none' }}
                                    />
                                ))}
                            </div>

                            <Tabs defaultValue="session" className="flex-1 flex flex-col mt-1">
                                <div className="px-4 sm:px-8 pt-4 sm:pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shrink-0">
                                    <TabsList className="bg-white/5 p-1 rounded-xl">
                                        <TabsTrigger value="session" className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-lg text-[10px] font-black px-6 h-9 text-white">MISSION FEED</TabsTrigger>
                                        <TabsTrigger value="code" className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-lg text-[10px] font-black px-6 h-9 text-white">NEURAL WORKSPACE</TabsTrigger>
                                    </TabsList>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-xl border border-primary/20">
                                        <span className="text-[10px] font-black text-primary uppercase">PHASE {currentStep} OF {totalSteps}</span>
                                    </div>
                                </div>

                                <TabsContent value="session" className="flex-1 min-h-0 p-4 sm:p-8 pt-2 sm:pt-4">
                                    <div className="h-full flex flex-col gap-6">
                                        <div className="flex-1 bg-black/40 border border-white/10 rounded-3xl p-6 overflow-y-auto scrollbar-hide relative" ref={scrollRef}>
                                            <AnimatePresence>
                                                {chat.map((msg, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className={`flex gap-4 mb-6 ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                                                    >
                                                        {msg.role === 'ai' && (
                                                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 border border-primary/20">
                                                                <Brain className="w-4 h-4 text-primary" />
                                                            </div>
                                                        )}
                                                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'ai' ? 'bg-white/5 text-zinc-300 border border-white/5' : 'bg-primary text-black font-medium'}`}>
                                                            {msg.text}
                                                            {msg.evaluation && (
                                                                <div className="mt-3 pt-3 border-t border-black/10 text-[10px] font-bold opacity-60">
                                                                    SCORE: {msg.evaluation.overallScore}/10 | {msg.evaluation.feedback}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {msg.role === 'user' && (
                                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                                                <User className="w-4 h-4 text-emerald-500" />
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>

                                            {aiThought && (
                                                <div className="absolute top-6 right-6">
                                                    <motion.div
                                                        animate={{ opacity: [1, 0.4, 1] }}
                                                        transition={{ repeat: Infinity, duration: 2 }}
                                                        className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-[8px] font-black text-primary tracking-widest flex items-center gap-2"
                                                    >
                                                        <Zap className="w-3 h-3" />
                                                        AI ANALYZING: {aiThought.quality?.toUpperCase() || "SYNCING"}
                                                    </motion.div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="code" className="flex-1 min-h-0 p-6 pt-2">
                                    <div className="h-full border border-white/10 rounded-3xl overflow-hidden bg-zinc-950/50">
                                        <CodeWorkspace
                                            initialCode={localStorage.getItem("interview_code") || "// Initialize Neural Workspace...\n\nfunction solve() {\n  // Type your code here\n}"}
                                            onCodeChange={(code) => localStorage.setItem("interview_code", code)}
                                            onOutputChange={() => { }}
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </Card>

                        {/* Interactive HUD Control Footer */}
                        <div className="h-28 flex gap-6 shrink-0 relative z-20">
                            <Card className="flex-1 bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-4 flex items-center justify-between px-10 group overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex items-center gap-8">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-1">Signal Protocol</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            <span className="text-xs font-black text-emerald-400">ENCRYPTED</span>
                                        </div>
                                    </div>

                                    <div className="w-48 h-12 bg-white/5 rounded-xl border border-white/5 flex items-center px-4 gap-4 overflow-hidden relative">
                                        <Waveform isRecording={isRecording} volume={volume} />
                                        {interimTranscript && (
                                            <div className="flex-1 text-[10px] font-medium text-primary line-clamp-1 animate-pulse italic">
                                                "{interimTranscript}"
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end mr-6">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">System Ready</span>
                                        <span className="text-xs font-black text-white uppercase">{isRecording ? 'Listening' : 'Ready'}</span>
                                    </div>
                                    <Button
                                        size="lg"
                                        onClick={isRecording ? stopRecording : startRecording}
                                        disabled={isProcessing}
                                        className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${isRecording ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'bg-primary hover:bg-white text-black shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)]'}`}
                                    >
                                        {isRecording ? <StopCircle className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-16 w-16 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10"
                                    >
                                        <Video className="w-6 h-6 text-zinc-400" />
                                    </Button>
                                </div>
                            </Card>

                            <Card className="w-1/3 bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 flex flex-col justify-center gap-2 overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                                    <ShieldCheck size={60} />
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                                    <span>Anti-Cheat Engine</span>
                                    <span className="text-emerald-500">Active</span>
                                </div>
                                <div className="flex gap-1 h-3">
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`flex-1 rounded-sm ${i < 8 ? 'bg-primary/40' : 'bg-white/5'} animate-pulse`}
                                            style={{ animationDelay: `${i * 100}ms` }}
                                        />
                                    ))}
                                </div>
                                <p className="text-[8px] font-bold text-zinc-400 opacity-60">Neural monitoring for focus, engagement, and ethics.</p>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>

            {/* Global HUD Notifications */}
            <AnimatePresence>
                {errorData && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-500"
                    >
                        <AlertCircle className="w-5 h-5 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                        <span className="text-xs font-black uppercase tracking-widest">{errorData.message}</span>
                        <X className="w-4 h-4 cursor-pointer hover:scale-110" onClick={() => setErrorData(null)} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hidden Video for tracking */}
            <div className="fixed bottom-4 right-4 w-32 aspect-video rounded-xl overflow-hidden border border-white/20 shadow-2xl opacity-40 hover:opacity-100 transition-opacity z-[100] group">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                {focusAlert && (
                    <div className="absolute inset-0 bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center animate-pulse">
                        <AlertCircle className="text-red-500 w-6 h-6" />
                    </div>
                )}
                {!isTracking && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    </div>
                )}
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${isTracking ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                    <span className="text-[8px] font-black text-white/80 tracking-widest">BIOMETRIC FEED</span>
                </div>
            </div>
        </div>
    )
}

export default function InterviewPage() {
    return (
        <Suspense fallback={<div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>}>
            <InterviewContent />
        </Suspense>
    )
}
