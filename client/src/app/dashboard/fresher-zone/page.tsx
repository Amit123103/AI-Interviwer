"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft, Check, MapPin, Calendar, Users, Package, BookOpen,
    Award, HelpCircle, ChevronDown, ChevronRight, MessageCircle,
    Search, Star, Lock, PartyPopper, Sparkles, Clock, Zap, Heart,
    Shield, Coffee, Laptop, Headphones, Bookmark, Bot, X, Send, Moon,
    Compass, Target, Sun, GraduationCap, Trophy, Flame, Eye,
    TrendingUp, Globe, Lightbulb, Rocket
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

// ══════ DATA ══════

const DAY1_ITEMS = [
    { id: 1, icon: '🪪', text: 'Collect your Student ID card from Admin Office' },
    { id: 2, icon: '📧', text: 'Set up your official university email account' },
    { id: 3, icon: '🗺️', text: 'Download the campus map to your phone' },
    { id: 4, icon: '📅', text: 'Check and save your full timetable' },
    { id: 5, icon: '📚', text: 'Register your library card at the library desk' },
    { id: 6, icon: '🔑', text: 'Collect your accommodation key (if on campus)' },
    { id: 7, icon: '👤', text: 'Meet your personal academic tutor' },
    { id: 8, icon: '🚨', text: 'Save campus security number: 0800-CAMPUS' },
    { id: 9, icon: '💻', text: 'Connect to the campus Wi-Fi network' },
    { id: 10, icon: '🎒', text: 'Attend your department\'s welcome session' },
]

const CAMPUS_LOCATIONS = [
    { id: 'lib', icon: '📚', name: 'Library', desc: 'Open 24/7 during term. Get your card on Day 1.', color: 'from-sky-500 to-blue-600', glow: 'shadow-sky-500/20', details: 'The central library spans 5 floors. Group study on Floor 1-2, Silent study on 3-5. Bring your student ID for entry.' },
    { id: 'can', icon: '🍽️', name: 'Main Canteen', desc: 'Hot meals, salads, and coffee. Opens at 7:30am.', color: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/20', details: 'Serving breakfast, lunch, and dinner. Vegan and Halal options available daily. Peak hours are 12pm-2pm.' },
    { id: 'med', icon: '🏥', name: 'Health Centre', desc: 'Free GP & counselling for all students. No appointment needed for urgent care.', color: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/20', details: 'Located in Block B. Register online before your first visit. Free flu jabs in November.' },
    { id: 'adm', icon: '🏛️', name: 'Admin Office', desc: 'Student records, ID cards, and enrolment queries.', color: 'from-violet-500 to-purple-600', glow: 'shadow-violet-500/20', details: 'Ground floor of the Main Building. Open Monday to Friday, 9am - 4pm.' },
    { id: 'su', icon: '🎭', name: 'Student Union', desc: 'Clubs, events, societies, and student support.', color: 'from-rose-500 to-pink-600', glow: 'shadow-rose-500/20', details: 'The heart of student life! Includes a bar, cafe, club spaces, and independent advice centre.' },
    { id: 'gym', icon: '⚽', name: 'Sports Centre', desc: 'Free gym access for all enrolled students.', color: 'from-cyan-500 to-blue-600', glow: 'shadow-cyan-500/20', details: 'Features a 50m pool, 3 basketball courts, and a fully equipped gym. Bring your own towel!' },
]

const EVENTS = [
    { day: 'Day 1 (Mon)', icon: '🎓', title: 'University Orientation', details: 'Main Hall, 10:00am. Meet the Vice Chancellor and get your welcome pack.', color: 'from-violet-500 to-fuchsia-500' },
    { day: 'Day 2 (Tue)', icon: '🗺️', title: 'Campus Walking Tour', details: 'Meet at Main Gate, 11:00am. Guided tour of all key buildings and facilities.', color: 'from-sky-500 to-blue-500' },
    { day: 'Day 3 (Wed)', icon: '🎓', title: 'Department Welcome', details: 'CS Building Room 101, 9:00am. Meet your lecturers and course coordinator.', color: 'from-emerald-500 to-teal-500' },
    { day: 'Day 4 (Thu)', icon: '🎪', title: 'Clubs & Societies Fair', details: 'Student Union, 12:00pm–4:00pm. Join clubs, meet people, find your tribe.', color: 'from-amber-500 to-orange-500' },
    { day: 'Day 5 (Fri)', icon: '🎉', title: 'Fresher Social Night', details: 'Student Union Bar, 7:00pm. Free entry, live DJ, meet your whole year group.', color: 'from-rose-500 to-pink-500' },
]

const STUDY_PARTNERS = [
    { name: 'Ravi Kumar', subject: 'Mathematics', tag: 'Morning Studier', avatar: '👨‍💻', color: 'text-amber-400' },
    { name: 'Priya Sharma', subject: 'Biology', tag: 'Group Sessions', avatar: '👩‍🔬', color: 'text-emerald-400' },
    { name: 'Tom Wilson', subject: 'Physics', tag: 'Online Study', avatar: '👨‍🎓', color: 'text-sky-400' },
]

const STATIONERY = [
    { icon: '📓', text: 'Notebooks (at least 3)' },
    { icon: '🖊️', text: 'Pens and pencils' },
    { icon: '🖍️', text: 'Highlighters (4 colours)' },
    { icon: '📐', text: 'Calculator (scientific)' },
    { icon: '📁', text: 'Ring binders / folders' },
    { icon: '🗒️', text: 'Sticky notes / index cards' },
]

const TECH_ITEMS = [
    { icon: '💻', text: 'Laptop with charger' },
    { icon: '🎧', text: 'Headphones / earphones' },
    { icon: '💾', text: 'USB flash drive (16GB+)' },
    { icon: '🔋', text: 'Power bank' },
    { icon: '📱', text: 'Smartphone with storage' },
    { icon: '☁️', text: 'Cloud storage account' },
]

const STUDY_GUIDE = [
    {
        icon: '📄', title: 'How to Read a Syllabus',
        content: 'Start by finding assessment dates and deadlines. Then review weekly topics to understand the course flow. Check grading weights — know what\'s worth 10% vs 40%. Finally, note all required textbooks and pre-reading materials. Your syllabus is your roadmap for the entire semester.'
    },
    {
        icon: '✏️', title: 'How to Take Lecture Notes',
        content: 'Use the Cornell Method: divide your page into cues (left), notes (right), and summary (bottom). Use abbreviations to keep up with the lecturer. Highlight key terms and definitions. Most importantly — review your notes within 24 hours while they\'re still fresh in your memory.'
    },
    {
        icon: '🙋', title: 'When and How to Ask for Help',
        content: 'Visit office hours — lecturers expect you to come! Use the tutor system for academic support. Student services cover everything else. The golden rule: never wait more than 2 weeks when confused about something. Early help prevents small problems from becoming big ones.'
    },
    {
        icon: '📚', title: 'How to Use the University Library',
        content: 'Learn the OPAC search system to find physical books. Access digital journals through the library portal — thousands are free for students. Know about interlibrary loans for rare materials. Find your favourite study zone: quiet floors for deep focus, group rooms for collaboration.'
    },
    {
        icon: '⏰', title: 'Time Management Basics for Freshers',
        content: 'Create a weekly plan every Sunday evening. Use time blocking: assign specific tasks to specific hours. Apply the 2-minute rule — if it takes less than 2 minutes, do it now. Avoid procrastination by starting with the smallest step. Build a Sunday reset routine to prepare for each week.'
    },
]

const BADGES = [
    { icon: '🏆', title: 'First Class', desc: 'Attended your very first lecture', unlocked: false },
    { icon: '📚', title: 'Library Hero', desc: 'Activated your library card', unlocked: false },
    { icon: '📧', title: 'Email Pro', desc: 'Set up your university email', unlocked: true },
    { icon: '🤝', title: 'Buddy Connected', desc: 'Met and messaged your buddy', unlocked: false },
    { icon: '🎪', title: 'Club Joiner', desc: 'Joined at least one society', unlocked: false },
    { icon: '💪', title: 'Week 1 Warrior', desc: 'Survived your first full week!', unlocked: false },
]

const FAQS = [
    { q: 'How do I get my student ID card?', a: 'Visit the Admin Office (Block A, Ground Floor) with your offer letter and passport. It takes about 10 minutes to process.' },
    { q: 'What if I miss a lecture?', a: 'Check the LMS for recorded sessions. Email the lecturer within 48 hours if no recording exists. Always attend tutorials — they can\'t be recorded.' },
    { q: 'How do my end-of-year exams work?', a: 'Exams are in May/June. Check your module guide for weightings — usually 60–70% of your final grade. Past papers are available in the library.' },
    { q: 'Can I change my course or modules?', a: 'Yes, within the first 2 weeks of term. Visit your academic advisor with reasons for your request. They\'ll guide you through the process.' },
    { q: 'Is there mental health support available?', a: 'Yes — the Student Wellbeing Centre offers free counselling. Walk-ins welcome Mon–Fri 9am–5pm, Block C Level 2. Everything is confidential.' },
    { q: 'How does grading work at university?', a: 'First Class: 70%+, 2:1: 60–69%, 2:2: 50–59%, Third: 40–49%. Below 40% is a fail. Module credits accumulate each year.' },
    { q: 'Can I work part-time during my studies?', a: 'Yes, up to 20 hours/week on a student visa. The careers office maintains a part-time jobs board updated weekly.' },
    { q: 'What is the plagiarism policy?', a: 'All work must be your own. Use TurnItIn before submitting. First offence = formal warning. Repeat offence = possible expulsion. Always cite your sources.' },
]

const QUICK_STATS = [
    { icon: GraduationCap, label: 'Courses Available', value: '120+', color: 'from-violet-500 to-purple-600' },
    { icon: Users, label: 'Active Students', value: '8,500', color: 'from-sky-500 to-blue-600' },
    { icon: Trophy, label: 'Awards Won', value: '45', color: 'from-amber-500 to-orange-600' },
    { icon: Globe, label: 'Countries', value: '60+', color: 'from-emerald-500 to-teal-600' },
]

// ══════ THEME HELPER ══════

function t(dark: boolean, darkClass: string, lightClass: string) {
    return dark ? darkClass : lightClass
}

// ══════ COMPONENT ══════

export default function FresherZonePage() {
    const router = useRouter()

    // State
    const [day1Checked, setDay1Checked] = useState<Set<number>>(new Set())
    const [rsvps, setRsvps] = useState<Set<number>>(new Set())
    const [stationeryChecked, setStationeryChecked] = useState<Set<number>>(new Set())
    const [techChecked, setTechChecked] = useState<Set<number>>(new Set())
    const [openAccordion, setOpenAccordion] = useState<number | null>(null)
    const [openFaq, setOpenFaq] = useState<number | null>(null)
    const [showConfetti, setShowConfetti] = useState(false)
    const [toast, setToast] = useState<string | null>(null)
    const [partnerSearch, setPartnerSearch] = useState('')
    const [user, setUser] = useState<any>({})

    // Add-on State
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    const [isAIOpen, setIsAIOpen] = useState(false)
    const [aiChat, setAiChat] = useState<{ role: 'user' | 'ai', msg: string }[]>([{ role: 'ai', msg: "Hi! I'm your AI Study Helper. Ask me anything about notes, exams, library, etc.!" }])
    const [aiInput, setAiInput] = useState('')
    const [isDark, setIsDark] = useState(false) // DEFAULT: Light mode (white background)
    const [selectedLocation, setSelectedLocation] = useState<typeof CAMPUS_LOCATIONS[0] | null>(null)

    // Cohort AI Counseling State
    const [counselStep, setCounselStep] = useState(0) // 0: Start, 1: Quiz, 2: Result
    const [counselAnswers, setCounselAnswers] = useState<string[]>([])
    const [isThinking, setIsThinking] = useState(false)
    const [cohortResult, setCohortResult] = useState<{ name: string, percent: number, desc: string, icon: string, why: string } | null>(null)

    // 3D Hover State
    const [hoveredCard, setHoveredCard] = useState<number | null>(null)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

    // Active nav tab
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        try {
            const saved = localStorage.getItem('user')
            if (saved) setUser(JSON.parse(saved))
            
            const savedTheme = localStorage.getItem('fresher-theme')
            if (savedTheme) setIsDark(savedTheme === 'dark')
        } catch { }

        // Timer Logic
        const target = new Date('2026-09-15T09:00:00').getTime()
        const timer = setInterval(() => {
            const now = new Date().getTime()
            const diff = target - now
            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
                clearInterval(timer)
            } else {
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((diff % (1000 * 60)) / 1000),
                })
            }
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        localStorage.setItem('fresher-theme', isDark ? 'dark' : 'light')
    }, [isDark])


    const sendAIMessage = () => {
        if (!aiInput.trim()) return
        const userMsg = aiInput.trim()
        setAiChat(prev => [...prev, { role: 'user', msg: userMsg }])
        setAiInput('')

        setTimeout(() => {
            let reply = "I'm still learning! Check the Fresher FAQ or ask your buddy."
            const text = userMsg.toLowerCase()
            if (text.includes('note')) reply = "Try the Cornell Method! Check the Study Guide section for details."
            else if (text.includes('exam') || text.includes('grade')) reply = "Exams are usually 60-70% of your final grade. Don't stress, just plan ahead!"
            else if (text.includes('stress')) reply = "Take a deep breath. 🌿 The Student Wellbeing Centre offers free walk-in counselling."
            else if (text.includes('friend') || text.includes('club')) reply = "Definitely check out the Clubs & Societies Fair on Thursday!"
            else if (text.includes('library')) reply = "The library is open 24/7 during term. Perfect for quiet study."
            else if (text.includes('timetable')) reply = "You can download your full timetable from the university portal. Don't forget to save it!"
            else if (text.includes('assignment')) reply = "Start early and use TurnItIn to check for plagiarism before submitting."

            setAiChat(prev => [...prev, { role: 'ai', msg: reply }])
        }, 600)
    }

    const startTour = () => {
        showToast("🗺️ Starting interactive campus tour... (Coming Soon)")
    }

    const showToast = (msg: string) => {
        setToast(msg)
        setTimeout(() => setToast(null), 3000)
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        setMousePos({ x, y })
        setHoveredCard(idx)
    }

    const startCounseling = () => {
        setCounselStep(1)
        setCounselAnswers([])
        setCohortResult(null)
    }

    const selectAnswer = (ans: string) => {
        const nextAnswers = [...counselAnswers, ans]
        setCounselAnswers(nextAnswers)

        if (nextAnswers.length === 3) {
            analyzeCohort(nextAnswers)
        }
    }

    const analyzeCohort = (answers: string[]) => {
        setIsThinking(true)
        setCounselStep(2)

        setTimeout(() => {
            const combined = answers.join(' ').toLowerCase()
            let result = {
                name: 'Full Stack Web Development',
                percent: 92,
                desc: 'The foundation of the modern internet.',
                icon: '🌐',
                why: 'Since you enjoy visual building and immediate feedback, Web Dev is your perfect match.'
            }

            if (combined.includes('logic') || combined.includes('brain') || combined.includes('future')) {
                result = {
                    name: 'Artificial Intelligence & ML',
                    percent: 98,
                    desc: 'Build systems that think and learn.',
                    icon: '🧠',
                    why: 'Your focus on deep logic and automation makes AI the ideal frontier for you.'
                }
            } else if (combined.includes('protect') || combined.includes('lock') || combined.includes('secure')) {
                result = {
                    name: 'Cyber Security & Ethical Hacking',
                    percent: 96,
                    desc: 'Become a digital guardian.',
                    icon: '🛡️',
                    why: 'Your interest in security and problem-solving is exactly what the industry needs.'
                }
            } else if (combined.includes('data') || combined.includes('pattern') || combined.includes('math')) {
                result = {
                    name: 'Data Science & Analytics',
                    percent: 95,
                    desc: 'Turn raw data into golden insights.',
                    icon: '📊',
                    why: 'Your analytical mindset will thrive in uncovering high-value business insights.'
                }
            } else if (combined.includes('scale') || combined.includes('architect') || combined.includes('cloud')) {
                result = {
                    name: 'Cloud Computing & DevOps',
                    percent: 94,
                    desc: 'Manage global-scale infrastructure.',
                    icon: '☁️',
                    why: 'Your structural thinking is perfect for designing robust, scalable systems.'
                }
            }

            setCohortResult(result)
            setIsThinking(false)
            showToast(`🎯 AI Recommendation: ${result.name}`)
        }, 2000)
    }

    const toggleDay1 = (id: number) => {
        setDay1Checked(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            if (next.size === 10) {
                setShowConfetti(true)
                showToast('🎉 Day 1 Complete! You\'re officially a student!')
                setTimeout(() => setShowConfetti(false), 4000)
            }
            return next
        })
    }

    const toggleRsvp = (idx: number) => {
        setRsvps(prev => {
            const next = new Set(prev)
            next.has(idx) ? next.delete(idx) : next.add(idx)
            return next
        })
    }

    const toggleSupply = (type: 'stationery' | 'tech', idx: number) => {
        const setter = type === 'stationery' ? setStationeryChecked : setTechChecked
        setter(prev => { const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n })
    }

    const supplyProgress = Math.round(((stationeryChecked.size + techChecked.size) / 12) * 100)
    const day1Progress = Math.round((day1Checked.size / 10) * 100)
    const profileProgress = 40

    const filteredPartners = STUDY_PARTNERS.filter(p =>
        p.name.toLowerCase().includes(partnerSearch.toLowerCase()) ||
        p.subject.toLowerCase().includes(partnerSearch.toLowerCase())
    )

    const targetPassed = new Date().getTime() >= new Date('2026-09-15T09:00:00').getTime()

    // ═══ THEME CLASSES ═══
    const pageBg = t(isDark, 'bg-white dark:bg-[#04060e]', 'bg-white')
    const pageText = t(isDark, 'text-slate-900 dark:text-white', 'text-gray-900')
    const cardBg = t(isDark, 'bg-white dark:bg-zinc-950/40 backdrop-blur-3xl border-white/[0.08]', 'bg-white border-gray-200/80 shadow-xl shadow-gray-100/50')
    const cardBgHover = t(isDark, 'hover:border-blue-500/50', 'hover:border-blue-400/50 hover:shadow-2xl hover:shadow-blue-100/30')
    const subtitleText = t(isDark, 'text-zinc-500', 'text-gray-500')
    const mutedText = t(isDark, 'text-slate-500 dark:text-zinc-400', 'text-gray-600')
    const headingText = t(isDark, 'text-slate-900 dark:text-white', 'text-gray-900')
    const bodyText = t(isDark, 'text-slate-600 dark:text-zinc-300', 'text-gray-700')
    const borderColor = t(isDark, 'border-white/[0.08]', 'border-gray-200')
    const inputBg = t(isDark, 'bg-white/60 dark:bg-zinc-900/50 border-slate-100 dark:border-white/5 text-slate-900 dark:text-white placeholder:text-zinc-700', 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400')
    const innerCardBg = t(isDark, 'bg-white/[0.02] border-white/[0.05]', 'bg-gray-50/80 border-gray-100')
    const innerCardHover = t(isDark, 'hover:bg-white/[0.05] hover:border-white/20', 'hover:bg-blue-50/50 hover:border-blue-200')

    return (
        <div className={`min-h-screen relative overflow-hidden transition-all duration-700 ${pageBg} ${pageText}`}>
            {/* ── Background Decorations ── */}
            <div className="absolute inset-0 pointer-events-none transition-all duration-1000">
                {isDark ? (
                    <>
                        <div className="absolute -top-40 left-0 w-[700px] h-[700px] rounded-full blur-[200px] bg-gradient-to-br from-emerald-600/6 to-teal-600/4" />
                        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full blur-[160px] bg-gradient-to-br from-violet-600/5 to-fuchsia-600/3" />
                        <div className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] rounded-full blur-[180px] bg-gradient-to-br from-amber-600/4 to-rose-600/3" />
                        <div className="absolute inset-0 opacity-[0.012]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                    </>
                ) : (
                    <>
                        <div className="absolute -top-40 left-0 w-[700px] h-[700px] rounded-full blur-[200px] bg-gradient-to-br from-blue-100/60 to-sky-100/40" />
                        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full blur-[160px] bg-gradient-to-br from-violet-100/50 to-purple-100/30" />
                        <div className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] rounded-full blur-[180px] bg-gradient-to-br from-rose-100/40 to-orange-100/30" />
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                    </>
                )}
            </div>

            {/* ── Toast ── */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-gradient-to-r from-blue-600 to-sky-500 text-slate-900 dark:text-white text-sm font-bold rounded-2xl shadow-2xl shadow-blue-500/30">
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Confetti ── */}
            <AnimatePresence>
                {showConfetti && (
                    <div className="fixed inset-0 z-40 pointer-events-none">
                        {Array.from({ length: 50 }).map((_, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 1, y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200), rotate: 0 }}
                                animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 100, rotate: Math.random() * 720, opacity: 0 }}
                                transition={{ duration: 2.5 + Math.random() * 2, delay: Math.random() * 0.5 }}
                                className="absolute text-2xl"
                            >
                                {['🎉', '⭐', '🎊', '✨', '🥳', '🎆'][Math.floor(Math.random() * 6)]}
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">

                {/* ── Header ── */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-10">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}
                        className={`rounded-xl ${t(isDark, 'text-zinc-500 hover:text-slate-900 dark:text-white hover:bg-white/5', 'text-gray-400 hover:text-gray-900 hover:bg-gray-100')}`}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Sparkles className="w-5 h-5 text-slate-900 dark:text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-violet-500 to-purple-500 bg-clip-text text-transparent`}>
                                Fresher Zone
                            </h1>
                            <p className={`text-xs ${subtitleText}`}>Everything you need for Day 1 and beyond</p>
                        </div>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        {/* Dark/Light Mode Toggle */}
                        <button onClick={() => setIsDark(!isDark)}
                            className={`relative w-16 h-9 rounded-full transition-all duration-500 flex items-center px-1 ${
                                isDark
                                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/30'
                                    : 'bg-gradient-to-r from-amber-400 to-orange-400 shadow-lg shadow-amber-400/30'
                            }`}>
                            <motion.div
                                layout
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md ${
                                    isDark ? 'bg-white ml-auto' : 'bg-white'
                                }`}>
                                {isDark ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-amber-500" />}
                            </motion.div>
                        </button>
                        <div className={`px-3 py-1.5 rounded-full hidden sm:flex items-center gap-1.5 ${
                            t(isDark, 'bg-blue-500/10 border border-blue-500/20', 'bg-blue-50 border border-blue-200')
                        }`}>
                            <Flame className={`w-3 h-3 ${t(isDark, 'text-blue-400', 'text-blue-500')}`} />
                            <span className={`text-[9px] font-black uppercase tracking-widest ${t(isDark, 'text-blue-400', 'text-blue-600')}`}>New</span>
                        </div>
                    </div>
                </motion.div>

                {/* ── Quick Stats Bar ── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {QUICK_STATS.map((stat, i) => (
                        <motion.div key={i} whileHover={{ y: -4, scale: 1.02 }} transition={{ type: 'spring', stiffness: 400 }}
                            className={`relative p-5 rounded-[24px] border overflow-hidden group cursor-pointer transition-all duration-500 ${cardBg} ${cardBgHover}`}>
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500`} />
                            <div className="relative z-10 flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                    <stat.icon className="w-6 h-6 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <p className={`text-2xl font-black ${headingText}`}>{stat.value}</p>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest ${subtitleText}`}>{stat.label}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ════════════════════════════════════════════════════════
                    0. PRE-FLIGHT SMART GUIDE
                   ════════════════════════════════════════════════════════ */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="mb-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 relative p-8 rounded-[32px] overflow-hidden group">
                        <div className={`absolute inset-0 rounded-[32px] transition-all duration-700 ${
                            isDark
                                ? 'bg-white dark:bg-zinc-950/40 backdrop-blur-3xl border border-white/[0.08]'
                                : 'bg-gradient-to-br from-blue-50/80 via-white to-violet-50/50 border border-gray-200/80 shadow-xl shadow-blue-50/50'
                        }`} />
                        <div className={`absolute inset-0 bg-gradient-to-br from-blue-600/20 via-violet-500/10 to-purple-400/15 ${
                            isDark ? 'opacity-30 group-hover:opacity-50' : 'opacity-10 group-hover:opacity-20'
                        } transition-opacity duration-700`} />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-purple-500 shadow-xl shadow-blue-500/20">
                                    <Sparkles className="w-6 h-6 text-slate-900 dark:text-white" />
                                </div>
                                <h2 className={`text-2xl font-black tracking-tight ${headingText}`}>AI Smart Guide for Students</h2>
                            </div>

                            <p className={`text-sm leading-relaxed mb-8 max-w-xl ${bodyText}`}>
                                Welcome to your high-tech orientation. We've optimized your first week with <span className="text-blue-500 font-bold">real-time tracking</span>,
                                <span className="text-violet-500 font-bold"> AI pathfinding</span>, and <span className="text-purple-500 font-bold">gamified milestones</span>.
                                Follow the roadmap below to start your "perfect" academic journey.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <div className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
                                    t(isDark, 'bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white/10', 'bg-blue-50 border border-blue-200/60 hover:bg-blue-100/60')
                                }`}>
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${t(isDark, 'text-slate-500 dark:text-zinc-400', 'text-blue-600')}`}>Live Status: Active</span>
                                </div>
                                <div className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
                                    t(isDark, 'bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white/10', 'bg-rose-50 border border-rose-200/60 hover:bg-rose-100/60')
                                }`}>
                                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${t(isDark, 'text-slate-500 dark:text-zinc-400', 'text-rose-600')}`}>Next Event: Orientation</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`relative p-8 rounded-[32px] overflow-hidden group flex flex-col justify-center border transition-all duration-500 ${cardBg} ${cardBgHover}`}>
                        <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                        <div className="relative z-10 text-center">
                            <div className={`inline-flex w-16 h-16 rounded-[24px] items-center justify-center mb-4 shadow-inner ${
                                t(isDark, 'bg-blue-500/10 border border-blue-500/20', 'bg-blue-50 border border-blue-200')
                            }`}>
                                <Shield className={`w-8 h-8 drop-shadow-lg ${t(isDark, 'text-blue-400', 'text-blue-500')}`} />
                            </div>
                            <h3 className={`text-lg font-black mb-2 uppercase tracking-wide ${headingText}`}>Secure Your Spot</h3>
                            <p className={`text-xs leading-relaxed mb-6 ${subtitleText}`}>Choose your cohort today to unlock specialized workshops and premium resources.</p>
                            <Button onClick={() => {
                                const el = document.getElementById('ai-counselor-section');
                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                setTimeout(() => {
                                    startCounseling();
                                    showToast('🎯 Starting your AI Guidance Session...');
                                }, 800);
                            }} className="w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-400 hover:to-violet-400 text-slate-900 dark:text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl h-12 shadow-lg shadow-blue-500/20 hover:scale-[1.03] active:scale-95 transition-all duration-300">
                                Enroll Now
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* ════════════════════════════════════════════════════════
                    0.5. AI COHORT COUNSELOR
                   ════════════════════════════════════════════════════════ */}
                <SectionHeading icon="🤖" title="Interactive AI Counselor" delay={0.15} isDark={isDark} />
                <motion.div id="ai-counselor-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className={`mb-12 relative rounded-[32px] overflow-hidden shadow-2xl border transition-all duration-500 ${cardBg}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br from-blue-600/10 via-violet-500/5 to-purple-400/10 ${isDark ? 'opacity-100' : 'opacity-30'}`} />

                    <div className="relative p-6 sm:p-10">
                        <AnimatePresence mode="wait">
                            {counselStep === 0 && (
                                <motion.div key="intro" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col lg:flex-row gap-8 items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">
                                                <Bot className="w-6 h-6 text-slate-900 dark:text-white" />
                                            </div>
                                            <h2 className={`text-2xl font-black tracking-tight uppercase ${headingText}`}>AI Student Guider</h2>
                                        </div>
                                        <p className={`text-base leading-relaxed mb-8 ${bodyText}`}>
                                            "Hello! I am your AI Counselor. Finding the right specialization is the first step to a successful career. Answer <span className="text-blue-500 font-bold">3 quick questions</span> about your personality, and I will recommend the perfect cohort for you."
                                        </p>
                                        <Button onClick={startCounseling} className="bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 text-slate-900 dark:text-white font-black px-8 py-6 rounded-2xl shadow-2xl shadow-blue-500/30 hover:scale-105 transition-transform uppercase tracking-[0.2em] text-xs">
                                            Start Guidance Session
                                        </Button>
                                    </div>
                                    <div className={`w-full lg:w-80 h-64 rounded-3xl flex items-center justify-center grayscale opacity-50 border ${
                                        t(isDark, 'bg-white/5 border-slate-200 dark:border-white/10', 'bg-gray-100 border-gray-200')
                                    }`}>
                                        <div className="text-center">
                                            <Bot className={`w-16 h-16 mx-auto mb-4 ${t(isDark, 'text-zinc-600', 'text-gray-300')}`} />
                                            <p className={`text-[10px] uppercase font-black tracking-widest ${t(isDark, 'text-zinc-600', 'text-gray-400')}`}>Counselor Offline</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {counselStep === 1 && (
                                <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <div className="mb-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-500">Step {counselAnswers.length + 1} of 3</p>
                                            <p className={`text-xs font-bold uppercase ${subtitleText}`}>{counselAnswers.length === 0 ? 'Personality' : counselAnswers.length === 1 ? 'Interest' : 'Goal'}</p>
                                        </div>
                                        <div className={`h-1.5 w-full rounded-full overflow-hidden ${t(isDark, 'bg-white/5', 'bg-gray-200')}`}>
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${(counselAnswers.length / 3) * 100}%` }} className="h-full bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500" />
                                        </div>
                                    </div>

                                    {counselAnswers.length === 0 && (
                                        <div className="space-y-6">
                                            <h3 className={`text-xl font-black ${headingText}`}>How do you prefer to solve problems?</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {[
                                                    { id: 'logic', text: 'Deep logic and step-by-step thinking', icon: '🧩' },
                                                    { id: 'creative', text: 'Visual building and creative design', icon: '🎨' },
                                                    { id: 'guardian', text: 'Protecting systems and finding flaws', icon: '🛡️' },
                                                    { id: 'data', text: 'Analyzing patterns and large datasets', icon: '📈' },
                                                ].map(opt => (
                                                    <button key={opt.id} onClick={() => selectAnswer(opt.id)}
                                                        className={`p-6 rounded-2xl border text-left transition-all group ${
                                                            t(isDark,
                                                                'bg-white/5 border-slate-100 dark:border-white/5 hover:border-blue-500/50 hover:bg-blue-500/10',
                                                                'bg-gray-50 border-gray-200 hover:border-blue-400/50 hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-100/30'
                                                            )
                                                        }`}>
                                                        <span className="text-2xl mb-3 block group-hover:scale-110 transition-transform">{opt.icon}</span>
                                                        <span className={`text-sm font-bold ${t(isDark, 'text-slate-600 dark:text-zinc-300 group-hover:text-slate-900 dark:text-white', 'text-gray-700 group-hover:text-gray-900')}`}>{opt.text}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {counselAnswers.length === 1 && (
                                        <div className="space-y-6">
                                            <h3 className={`text-xl font-black ${headingText}`}>What type of technology excites you most?</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {[
                                                    { id: 'web', text: 'Web application & Digital platforms', icon: '🌐' },
                                                    { id: 'ai', text: 'Next-gen Intelligence & Robotics', icon: '🧠' },
                                                    { id: 'cloud', text: 'Global infrastructure & Networks', icon: '☁️' },
                                                    { id: 'secure', text: 'Security, Encryption & Privacy', icon: '🔒' },
                                                ].map(opt => (
                                                    <button key={opt.id} onClick={() => selectAnswer(opt.id)}
                                                        className={`p-6 rounded-2xl border text-left transition-all group ${
                                                            t(isDark,
                                                                'bg-white/5 border-slate-100 dark:border-white/5 hover:border-violet-500/50 hover:bg-violet-500/10',
                                                                'bg-gray-50 border-gray-200 hover:border-violet-400/50 hover:bg-violet-50 hover:shadow-lg hover:shadow-violet-100/30'
                                                            )
                                                        }`}>
                                                        <span className="text-2xl mb-3 block group-hover:scale-110 transition-transform">{opt.icon}</span>
                                                        <span className={`text-sm font-bold ${t(isDark, 'text-slate-600 dark:text-zinc-300 group-hover:text-slate-900 dark:text-white', 'text-gray-700 group-hover:text-gray-900')}`}>{opt.text}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {counselAnswers.length === 2 && (
                                        <div className="space-y-6">
                                            <h3 className={`text-xl font-black ${headingText}`}>What is your primary career goal?</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {[
                                                    { id: 'build', text: 'Building products from scratch', icon: '🏗️' },
                                                    { id: 'leads', text: 'Leading tech teams and architecture', icon: '👔' },
                                                    { id: 'solve', text: 'Solving complex security threats', icon: '🕵️' },
                                                    { id: 'discover', text: 'Discovering insights from information', icon: '🔍' },
                                                ].map(opt => (
                                                    <button key={opt.id} onClick={() => selectAnswer(opt.id)}
                                                        className={`p-6 rounded-2xl border text-left transition-all group ${
                                                            t(isDark,
                                                                'bg-white/5 border-slate-100 dark:border-white/5 hover:border-purple-400/50 hover:bg-purple-400/10',
                                                                'bg-gray-50 border-gray-200 hover:border-purple-400/50 hover:bg-purple-50 hover:shadow-lg hover:shadow-purple-100/30'
                                                            )
                                                        }`}>
                                                        <span className="text-2xl mb-3 block group-hover:scale-110 transition-transform">{opt.icon}</span>
                                                        <span className={`text-sm font-bold ${t(isDark, 'text-slate-600 dark:text-zinc-300 group-hover:text-slate-900 dark:text-white', 'text-gray-700 group-hover:text-gray-900')}`}>{opt.text}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {counselStep === 2 && (
                                <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                                    {isThinking ? (
                                        <div className="py-12 flex flex-col items-center justify-center text-center">
                                            <div className="relative w-24 h-24 mb-6">
                                                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                                    className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Bot className="w-10 h-10 text-blue-500 animate-pulse" />
                                                </div>
                                            </div>
                                            <h3 className={`text-xl font-black mb-2 uppercase tracking-widest ${headingText}`}>Synthesizing Profile...</h3>
                                            <p className={`text-xs font-bold uppercase tracking-[0.2em] ${subtitleText}`}>Finding the perfect path</p>
                                        </div>
                                    ) : cohortResult ? (
                                        <div className="flex flex-col lg:flex-row gap-10 items-center">
                                            <div className="w-full lg:w-[400px] shrink-0">
                                                <div className="relative p-8 rounded-[40px] bg-gradient-to-br from-blue-500 via-violet-500 to-purple-500 shadow-3xl shadow-blue-500/20 group">
                                                    <div className={`absolute inset-1 rounded-[38px] z-0 ${t(isDark, 'bg-white dark:bg-zinc-950', 'bg-white')}`} />
                                                    <div className="relative z-10 text-center">
                                                        <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-blue-500 to-violet-500 mx-auto mb-6 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                                            <span className="text-5xl drop-shadow-lg">{cohortResult.icon}</span>
                                                        </div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-2">Perfect Harmony</p>
                                                        <h3 className={`text-3xl font-black mb-4 italic leading-tight ${headingText}`}>{cohortResult.name}</h3>
                                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 ${
                                                            t(isDark, 'bg-blue-500/10 border border-blue-500/20', 'bg-blue-50 border border-blue-200')
                                                        }`}>
                                                            <Zap className="w-3.5 h-3.5 text-blue-500" />
                                                            <span className="text-xs font-black text-blue-500 uppercase tracking-widest">{cohortResult.percent}% Match Found</span>
                                                        </div>

                                                        <Button className={`w-full font-black px-6 py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl ${
                                                            t(isDark, 'bg-white text-black hover:bg-zinc-200', 'bg-gray-900 text-slate-900 dark:text-white hover:bg-gray-800')
                                                        }`}>
                                                            Confirm My Path
                                                        </Button>
                                                        <button onClick={startCounseling} className={`mt-4 text-[9px] font-bold uppercase tracking-widest transition-colors ${
                                                            t(isDark, 'text-zinc-500 hover:text-slate-900 dark:text-white', 'text-gray-400 hover:text-gray-900')
                                                        }`}>
                                                            Retake Assessment
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-10 bg-gradient-to-b from-blue-500 to-violet-500 rounded-full" />
                                                    <h4 className={`text-2xl font-black italic ${headingText}`}>Why this is perfect for you?</h4>
                                                </div>
                                                <p className={`text-lg leading-relaxed font-medium ${bodyText}`}>
                                                    {cohortResult.why}
                                                </p>
                                                <div className={`p-6 rounded-3xl flex items-start gap-4 border ${innerCardBg}`}>
                                                    <div className={`p-2 rounded-xl shrink-0 ${t(isDark, 'bg-blue-400/10', 'bg-blue-50')}`}>
                                                        <BookOpen className="w-5 h-5 text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <p className={`text-xs font-black uppercase mb-1 ${headingText}`}>Key Specialization</p>
                                                        <p className={`text-xs ${subtitleText}`}>{cohortResult.desc}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* ════════════════════════════════════════════════════════
                    1. WELCOME ONBOARDING BANNER
                   ════════════════════════════════════════════════════════ */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    className={`mb-10 relative rounded-[32px] overflow-hidden group border transition-all duration-500 ${cardBg}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br from-blue-600/20 via-violet-500/10 to-purple-400/15 ${isDark ? 'opacity-40 group-hover:opacity-60' : 'opacity-10 group-hover:opacity-20'} transition-opacity duration-700`} />
                    <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] animate-pulse ${t(isDark, 'bg-blue-500/10', 'bg-blue-200/30')}`} />

                    <div className="relative p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center gap-10">
                        <div className="flex-1">
                            <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 0.4 }}
                                className="text-6xl mb-6 drop-shadow-2xl">👋</motion.div>
                            <h2 className={`text-4xl sm:text-5xl font-black mb-2 tracking-tighter ${headingText}`}>
                                Welcome, <span className="bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 bg-clip-text text-transparent">{user.username || 'Student'}</span>!
                            </h2>
                            <p className={`text-sm font-bold tracking-[0.1em] mb-2 uppercase ${mutedText}`}>BSc Computer Science · <span className="text-blue-500">Year 1 — Semester 1</span></p>
                            <p className="text-lg bg-gradient-to-r from-blue-500 via-violet-500 to-purple-400 bg-clip-text text-transparent font-black italic mt-4">Your "Perfect" Adventure Begins Today! 🚀</p>

                            <div className="flex flex-wrap gap-4 mt-8">
                                <Button onClick={() => router.push('/dashboard/profile')} className="bg-gradient-to-r from-blue-600 to-violet-500 text-slate-900 dark:text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl h-12 px-8 shadow-xl shadow-blue-500/20 hover:scale-105 transition-transform">
                                    Complete Profile
                                </Button>
                                <Button onClick={startTour} variant="outline"
                                    className={`font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl h-12 px-8 ${
                                        t(isDark, 'border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-white/5', 'border-gray-300 text-gray-700 hover:bg-gray-100')
                                    }`}>
                                    Campus Tour 🗺️
                                </Button>
                            </div>

                            {/* Countdown Timer */}
                            <div className={`mt-10 flex flex-col items-start pt-8 border-t ${borderColor}`}>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500 mb-4 flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> Time until Day 1
                                </p>
                                {targetPassed ? (
                                    <div className={`px-6 py-3 rounded-2xl ${
                                        t(isDark, 'bg-gradient-to-r from-blue-500/20 to-violet-500/10 border border-blue-500/30', 'bg-blue-50 border border-blue-200')
                                    }`}>
                                        <p className={`text-sm font-black uppercase tracking-[0.1em] ${headingText}`}>Your journey has officially begun! 🎓</p>
                                    </div>
                                ) : (
                                    <div className="flex gap-3 sm:gap-4">
                                        {[
                                            { label: 'Days', value: timeLeft.days, color: 'from-blue-500 to-blue-600' },
                                            { label: 'Hours', value: timeLeft.hours, color: 'from-violet-500 to-purple-600' },
                                            { label: 'Mins', value: timeLeft.minutes, color: 'from-sky-500 to-blue-500' },
                                            { label: 'Secs', value: timeLeft.seconds, color: 'from-indigo-500 to-violet-500' },
                                        ].map((ti, i) => (
                                            <div key={i} className={`flex flex-col items-center justify-center w-[70px] h-[70px] sm:w-[84px] sm:h-[84px] rounded-3xl border relative overflow-hidden group ${
                                                t(isDark,
                                                    'bg-white/80 dark:bg-zinc-950/60 border-slate-200 dark:border-white/10 backdrop-blur-2xl shadow-2xl',
                                                    'bg-white border-gray-200 shadow-lg shadow-gray-100/50'
                                                )
                                            }`}>
                                                <div className={`absolute inset-0 bg-gradient-to-br ${ti.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                                                <span className={`text-2xl sm:text-3xl font-black leading-none mb-1 bg-gradient-to-br ${ti.color} bg-clip-text text-transparent`}>{ti.value.toString().padStart(2, '0')}</span>
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${subtitleText}`}>{ti.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile Progress Ring */}
                        <div className="relative w-40 h-40 shrink-0">
                            <svg className="w-full h-full -rotate-90 drop-shadow-lg" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="52" fill="none" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"} strokeWidth="10" />
                                <circle cx="60" cy="60" r="52" fill="none" stroke="url(#fresher_grad)" strokeWidth="10" strokeDasharray={`${profileProgress * 3.27} 327`} strokeLinecap="round" />
                                <defs>
                                    <linearGradient id="fresher_grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="50%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#a855f7" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-3xl font-black ${headingText}`}>{profileProgress}%</span>
                                <span className={`text-[9px] uppercase tracking-[0.2em] font-black ${subtitleText}`}>Profile</span>
                            </div>
                        </div>
                    </div>
                </motion.div>


                {/* ════════════════════════════════════════════════════════
                    2. DAY 1 SURVIVAL CHECKLIST
                   ════════════════════════════════════════════════════════ */}
                <SectionHeading icon="⚔️" title="Ultimate Survival Checklist" delay={0.3} isDark={isDark} />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                    className={`mb-12 relative rounded-[32px] overflow-hidden border transition-all duration-500 ${cardBg}`}>
                    <div className="relative p-6 sm:p-10">
                        {/* Progress */}
                        <div className="flex items-center justify-between mb-6">
                            <p className={`text-xs font-black uppercase tracking-[0.2em] ${subtitleText}`}>{day1Checked.size} of 10 tasks secured</p>
                            <span className={`text-sm font-black px-3 py-1 rounded-full ${
                                t(isDark, 'text-blue-400 bg-blue-400/10 border border-blue-400/20', 'text-blue-600 bg-blue-50 border border-blue-200')
                            }`}>{day1Progress}% Complete</span>
                        </div>
                        <div className={`h-3 rounded-full overflow-hidden mb-10 p-0.5 ${
                            t(isDark, 'bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5', 'bg-gray-100 border border-gray-200')
                        }`}>
                            <motion.div className="h-full bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 rounded-full" animate={{ width: `${day1Progress}%` }} transition={{ duration: 0.8, ease: "circOut" }} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {DAY1_ITEMS.map(item => {
                                const isChecked = day1Checked.has(item.id);
                                return (
                                    <motion.div key={item.id} whileTap={{ scale: 0.98 }}
                                        onClick={() => toggleDay1(item.id)}
                                        className={`group flex items-center gap-5 p-5 rounded-[24px] cursor-pointer transition-all duration-500 border ${
                                            isChecked
                                                ? t(isDark,
                                                    'bg-blue-500/10 border-blue-500/30 shadow-[0_10px_30px_rgba(59,130,246,0.1)]',
                                                    'bg-blue-50/80 border-blue-300 shadow-lg shadow-blue-100/40')
                                                : t(isDark,
                                                    'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/20',
                                                    'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md')
                                        }`}>
                                        <div className={`w-10 h-10 rounded-[14px] shrink-0 flex items-center justify-center transition-all duration-500 ${
                                            isChecked
                                                ? 'bg-gradient-to-br from-blue-500 to-violet-500 shadow-[0_0_20px_rgba(59,130,246,0.4)] scale-110'
                                                : t(isDark,
                                                    'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 group-hover:border-white/30',
                                                    'bg-gray-100 border border-gray-200 group-hover:border-gray-400')
                                        }`}>
                                            {isChecked ? (
                                                <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}><Check className="w-5 h-5 text-slate-900 dark:text-white stroke-[3px]" /></motion.div>
                                            ) : (
                                                <div className={`w-2 h-2 rounded-full transition-colors ${t(isDark, 'bg-zinc-700 group-hover:bg-blue-400', 'bg-gray-300 group-hover:bg-blue-400')}`} />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-2xl transition-transform duration-500 ${isChecked ? 'scale-125' : 'group-hover:scale-125 rotate-6'}`}>{item.icon}</span>
                                                <span className={`text-sm font-bold tracking-tight transition-all duration-500 ${
                                                    isChecked
                                                        ? 'text-blue-500 line-through opacity-60 italic'
                                                        : t(isDark, 'text-slate-600 dark:text-zinc-300 group-hover:text-slate-900 dark:text-white', 'text-gray-700 group-hover:text-gray-900')
                                                }`}>{item.text}</span>
                                            </div>
                                        </div>
                                        {isChecked && (
                                            <div className={`px-2 py-0.5 rounded-full ${t(isDark, 'bg-blue-500/20 border border-blue-500/20', 'bg-blue-100 border border-blue-200')}`}>
                                                <span className="text-[8px] font-black uppercase text-blue-500 tracking-widest">Done</span>
                                            </div>
                                        )}
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                </motion.div>


                {/* ════════════════════════════════════════════════════════
                    3. CAMPUS QUICK-GUIDE CARDS
                   ════════════════════════════════════════════════════════ */}
                <SectionHeading icon="🛰️" title="Nexus Hub — Campus Points" delay={0.4} isDark={isDark} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 perspective-1000">
                    {CAMPUS_LOCATIONS.map((loc, i) => {
                        const isHovered = hoveredCard === i;
                        return (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 + i * 0.06 }}
                                onMouseMove={(e) => handleMouseMove(e, i)}
                                onMouseLeave={() => setHoveredCard(null)}
                                style={{
                                    transform: isHovered ? `perspective(1000px) rotateX(${mousePos.y * -15}deg) rotateY(${mousePos.x * 15}deg) scale3d(1.02, 1.02, 1.02)` : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
                                    transition: isHovered ? 'none' : 'transform 0.5s ease'
                                }}
                                className="h-full relative z-10"
                            >
                                <div className={`group relative rounded-[32px] overflow-hidden h-full border transition-all duration-500 ${cardBg} ${cardBgHover}`}>
                                    {/* Advanced Hover Glow */}
                                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                                        style={{
                                            background: isHovered ? `radial-gradient(circle at ${mousePos.x * 100 + 50}% ${mousePos.y * 100 + 50}%, ${isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)'} 0%, transparent 60%)` : 'transparent'
                                        }}
                                    />
                                    <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/10 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                                    <div className="relative p-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border ${
                                                t(isDark, 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 group-hover:border-blue-500/50', 'bg-gray-50 border-gray-200 group-hover:border-blue-400/50')
                                            }`}>
                                                <span className="text-3xl drop-shadow-lg">{loc.icon}</span>
                                            </div>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 ${
                                                t(isDark, 'bg-white/5', 'bg-blue-50')
                                            }`}>
                                                <ArrowLeft className="w-5 h-5 text-blue-500 rotate-135" />
                                            </div>
                                        </div>
                                        <h4 className={`text-xl font-black mb-3 group-hover:text-blue-500 transition-colors uppercase tracking-tight ${headingText}`}>{loc.name}</h4>
                                        <p className={`text-xs leading-relaxed mb-8 h-10 ${subtitleText}`}>{loc.desc}</p>
                                        <button onClick={(e) => { e.stopPropagation(); setSelectedLocation(loc); }}
                                            className={`w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border ${
                                                t(isDark,
                                                    'bg-white/5 hover:bg-blue-500/10 text-slate-900 dark:text-white border-slate-100 dark:border-white/5 hover:border-blue-500/30',
                                                    'bg-gray-50 hover:bg-blue-50 text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600')
                                            }`}>
                                            Access Data <MapPin className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>


                {/* ════════════════════════════════════════════════════════
                    4. FRESHER WEEK EVENT TIMELINE
                   ════════════════════════════════════════════════════════ */}
                <SectionHeading icon="🛰️" title="Mission Timeline" delay={0.5} isDark={isDark} />
                <div className="mb-12 relative">
                    {/* Vertical line */}
                    <div className={`absolute left-[27px] sm:left-[31px] top-0 bottom-0 w-px bg-gradient-to-b opacity-30 ${
                        isDark ? 'from-blue-500 via-violet-500 to-transparent' : 'from-blue-400 via-violet-400 to-transparent'
                    }`} />

                    <div className="space-y-6">
                        {EVENTS.map((evt, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + i * 0.08 }}
                                className="relative pl-16 sm:pl-20">
                                {/* Dot */}
                                <div className={`absolute left-4 sm:left-5 top-8 w-6 h-6 rounded-full flex items-center justify-center z-10 border-2 ${
                                    t(isDark, 'bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10', 'bg-white border-gray-200')
                                }`}>
                                    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${rsvps.has(i) ? 'bg-blue-500 scale-125 shadow-[0_0_10px_rgba(59,130,246,0.8)]' : t(isDark, 'bg-zinc-700', 'bg-gray-300')}`} />
                                </div>

                                <div className={`relative rounded-[28px] overflow-hidden transition-all duration-500 border ${
                                    rsvps.has(i)
                                        ? 'border-l-4 border-l-blue-500 shadow-2xl shadow-blue-500/10'
                                        : 'hover:border-l-4 hover:border-l-blue-300'
                                } ${cardBg}`}>
                                    <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-500 mb-2 italic">{evt.day}</p>
                                            <h4 className={`text-xl font-black flex items-center gap-3 ${headingText}`}>
                                                <span className="text-2xl">{evt.icon}</span> {evt.title}
                                            </h4>
                                            <p className={`text-xs mt-2 leading-relaxed ${subtitleText}`}>{evt.details}</p>
                                        </div>
                                        <button onClick={() => toggleRsvp(i)}
                                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shrink-0 ${rsvps.has(i)
                                                ? t(isDark, 'bg-blue-500/20 border border-blue-500/30 text-blue-400', 'bg-blue-50 border border-blue-300 text-blue-600')
                                                : t(isDark, 'bg-white/5 border border-slate-200 dark:border-white/10 text-zinc-500 hover:text-slate-900 dark:text-white hover:border-white/20', 'bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400')
                                            }`}>
                                            {rsvps.has(i) ? '✓ Registered' : 'Secure RSVP'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>


                {/* ════════════════════════════════════════════════════════
                    5. BUDDY & MENTOR SYSTEM
                   ════════════════════════════════════════════════════════ */}
                <SectionHeading icon="🛰️" title="Neural Network — Buddies" delay={0.6} isDark={isDark} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Buddy Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
                        <div className={`relative rounded-[32px] overflow-hidden h-full group border transition-all duration-500 ${cardBg} ${cardBgHover}`}>
                            <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                            <div className="relative p-8">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6">Senior Command Buddy</p>
                                <div className="flex items-center gap-6 mb-6">
                                    <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-blue-500 via-violet-500 to-purple-500 flex items-center justify-center text-4xl shadow-2xl p-1 group-hover:scale-110 transition-transform duration-500">
                                        <div className={`w-full h-full rounded-[20px] flex items-center justify-center ${t(isDark, 'bg-white dark:bg-zinc-950', 'bg-white')}`}>👩‍💻</div>
                                    </div>
                                    <div>
                                        <h4 className={`text-2xl font-black italic group-hover:text-blue-500 transition-colors ${headingText}`}>Sarah Chen</h4>
                                        <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${subtitleText}`}>3rd Year · BSc Computer Science</p>
                                    </div>
                                </div>
                                <p className={`text-base italic mb-8 pl-4 border-l-2 border-blue-500/30 leading-relaxed ${bodyText}`}>&ldquo;Mission Control here! I was just as confused as you in Year 1. Let's sync and get you up to speed.&rdquo;</p>
                                <div className="flex gap-4">
                                    <Button onClick={() => showToast('💬 Opening encrypted channel with Sarah...')} size="sm"
                                        className={`rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] h-11 px-6 ${
                                            t(isDark, 'bg-blue-600/20 text-blue-300 border border-blue-600/20 hover:bg-blue-600/30 shadow-xl shadow-blue-500/10',
                                                'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 shadow-lg shadow-blue-100/30')
                                        }`}>
                                        <MessageCircle className="w-4 h-4 mr-2" /> Open Bridge
                                    </Button>
                                    <Button onClick={() => showToast('👤 Accessing Sarah\'s profile database...')} size="sm" variant="ghost"
                                        className={`text-[10px] font-black uppercase tracking-[0.2em] h-11 px-5 rounded-2xl transition-colors ${
                                            t(isDark, 'text-zinc-500 hover:text-slate-900 dark:text-white', 'text-gray-500 hover:text-gray-900')
                                        }`}>
                                        View Dossier →
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Study Partners */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                        <div className={`relative rounded-[32px] overflow-hidden h-full border transition-all duration-500 ${cardBg}`}>
                            <div className="relative p-8 text-center sm:text-left">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-violet-500 mb-6">Partner Matchmaking</p>
                                <div className="relative mb-6">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                        <Search className={`w-4 h-4 ${t(isDark, 'text-zinc-600', 'text-gray-400')}`} />
                                    </div>
                                    <Input placeholder="Search subject registry..." value={partnerSearch} onChange={e => setPartnerSearch(e.target.value)}
                                        className={`rounded-2xl h-12 pl-12 text-sm focus-visible:ring-violet-500/50 ${inputBg}`} />
                                </div>

                                <div className="space-y-4">
                                    {filteredPartners.map((p, i) => (
                                        <motion.div key={i} whileHover={{ x: 5 }}
                                            className={`group flex items-center gap-5 p-4 rounded-[24px] border transition-all duration-300 cursor-pointer ${
                                                t(isDark,
                                                    'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.05] hover:border-blue-500/20',
                                                    'bg-gray-50/50 border-gray-100 hover:bg-blue-50/50 hover:border-blue-200 hover:shadow-md')
                                            }`}>
                                            <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 shadow-inner border ${
                                                t(isDark, 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10', 'bg-white border-gray-200')
                                            }`}>{p.avatar}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-lg font-black group-hover:text-blue-500 transition-colors italic ${headingText}`}>{p.name}</p>
                                                <p className={`text-[10px] font-bold uppercase tracking-widest ${subtitleText}`}>{p.subject}</p>
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${
                                                t(isDark, 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-white/5', 'bg-gray-100 border-gray-200')
                                            } ${p.color}`}>{p.tag}</span>
                                        </motion.div>
                                    ))}
                                    {filteredPartners.length === 0 && (
                                        <div className={`py-10 border border-dashed rounded-3xl text-center ${t(isDark, 'border-slate-200 dark:border-white/10', 'border-gray-300')}`}>
                                            <Users className={`w-8 h-8 mx-auto mb-3 ${t(isDark, 'text-zinc-800', 'text-gray-300')}`} />
                                            <p className={`text-xs font-bold uppercase tracking-widest ${t(isDark, 'text-zinc-600', 'text-gray-400')}`}>No Matches Found in Registry</p>
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => showToast('🔍 Running Matchmaker Algorithm...')}
                                    className={`w-full mt-6 text-[10px] font-black uppercase tracking-[0.2em] py-4 rounded-2xl border transition-all ${
                                        t(isDark,
                                            'text-violet-400 hover:text-violet-300 bg-violet-500/5 hover:bg-violet-500/10 border-violet-500/10',
                                            'text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 border-violet-200')
                                    }`}>
                                    Refresh Registry <Sparkles className="w-4 h-4 inline ml-2" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>


                {/* ════════════════════════════════════════════════════════
                    6. ESSENTIAL SUPPLIES CHECKLIST
                   ════════════════════════════════════════════════════════ */}
                <SectionHeading icon="🛰️" title="Logistics & Supplies" delay={0.7} isDark={isDark} />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
                    className={`mb-12 relative rounded-[32px] overflow-hidden border transition-all duration-500 ${cardBg}`}>
                    <div className="relative p-6 sm:p-10">
                        {/* Progress */}
                        <div className="flex items-center justify-between mb-4">
                            <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${subtitleText}`}>{stationeryChecked.size + techChecked.size} of 12 supplies deployed</p>
                            <span className={`text-sm font-black px-3 py-1 rounded-full ${
                                t(isDark, 'text-violet-400 bg-violet-400/10 border border-violet-400/20', 'text-violet-600 bg-violet-50 border border-violet-200')
                            }`}>{supplyProgress}% Status</span>
                        </div>
                        <div className={`h-3 rounded-full overflow-hidden mb-12 p-0.5 ${
                            t(isDark, 'bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5', 'bg-gray-100 border border-gray-200')
                        }`}>
                            <motion.div className="h-full bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 rounded-full" animate={{ width: `${supplyProgress}%` }} transition={{ duration: 1, ease: "circOut" }} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div>
                                <div className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6 flex items-center gap-3">
                                    <div className="w-6 h-px bg-blue-500/30" /> Stationery Ops
                                </div>
                                <div className="space-y-3">
                                    {STATIONERY.map((item, i) => (
                                        <div key={i} onClick={() => toggleSupply('stationery', i)}
                                            className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                                                stationeryChecked.has(i)
                                                    ? t(isDark, 'bg-blue-500/5 border-blue-500/20', 'bg-blue-50 border-blue-200')
                                                    : t(isDark, 'bg-white dark:bg-zinc-900/40 border-slate-100 dark:border-white/5 hover:border-white/20', 'bg-gray-50/50 border-gray-100 hover:border-gray-300')
                                            }`}>
                                            <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center transition-all ${
                                                stationeryChecked.has(i)
                                                    ? 'bg-blue-500 shadow-lg shadow-blue-500/30'
                                                    : t(isDark, 'bg-zinc-800 border border-slate-200 dark:border-white/10', 'bg-gray-200 border border-gray-300')
                                            }`}>
                                                {stationeryChecked.has(i) ? <Check className="w-4 h-4 text-slate-900 dark:text-white stroke-[3px]" /> : <div className={`w-1.5 h-1.5 rounded-full ${t(isDark, 'bg-zinc-700', 'bg-gray-400')}`} />}
                                            </div>
                                            <span className="text-xl mr-1">{item.icon}</span>
                                            <span className={`text-sm font-bold tracking-tight transition-all duration-300 ${
                                                stationeryChecked.has(i) ? 'text-blue-500 line-through opacity-50' : t(isDark, 'text-slate-600 dark:text-zinc-300', 'text-gray-700')
                                            }`}>{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="text-[11px] font-black uppercase tracking-[0.4em] text-violet-500 mb-6 flex items-center gap-3">
                                    <div className="w-6 h-px bg-violet-500/30" /> Tech Registry
                                </div>
                                <div className="space-y-3">
                                    {TECH_ITEMS.map((item, i) => (
                                        <div key={i} onClick={() => toggleSupply('tech', i)}
                                            className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                                                techChecked.has(i)
                                                    ? t(isDark, 'bg-violet-500/5 border-violet-500/20', 'bg-violet-50 border-violet-200')
                                                    : t(isDark, 'bg-white dark:bg-zinc-900/40 border-slate-100 dark:border-white/5 hover:border-white/20', 'bg-gray-50/50 border-gray-100 hover:border-gray-300')
                                            }`}>
                                            <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center transition-all ${
                                                techChecked.has(i)
                                                    ? 'bg-violet-500 shadow-lg shadow-violet-500/30'
                                                    : t(isDark, 'bg-zinc-800 border border-slate-200 dark:border-white/10', 'bg-gray-200 border border-gray-300')
                                            }`}>
                                                {techChecked.has(i) ? <Check className="w-4 h-4 text-slate-900 dark:text-white stroke-[3px]" /> : <div className={`w-1.5 h-1.5 rounded-full ${t(isDark, 'bg-zinc-700', 'bg-gray-400')}`} />}
                                            </div>
                                            <span className="text-xl mr-1">{item.icon}</span>
                                            <span className={`text-sm font-bold tracking-tight transition-all duration-300 ${
                                                techChecked.has(i) ? 'text-violet-500 line-through opacity-50' : t(isDark, 'text-slate-600 dark:text-zinc-300', 'text-gray-700')
                                            }`}>{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>


                {/* ════════════════════════════════════════════════════════
                    7. FIRST WEEK STUDY GUIDE — ACCORDION
                   ════════════════════════════════════════════════════════ */}
                <SectionHeading icon="🛰️" title="Academic Roadmap" delay={0.8} isDark={isDark} />
                <div className="mb-12 space-y-4">
                    {STUDY_GUIDE.map((item, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 + i * 0.05 }}
                            className={`relative rounded-[28px] overflow-hidden transition-all duration-500 cursor-pointer group border ${
                                openAccordion === i
                                    ? t(isDark,
                                        'shadow-2xl shadow-blue-500/10 bg-blue-600/10 border-blue-500/40',
                                        'shadow-2xl shadow-blue-100/50 bg-blue-50/80 border-blue-300')
                                    : `hover:-translate-y-1 ${cardBg} ${t(isDark, 'hover:bg-white/[0.04] hover:border-white/10', 'hover:bg-gray-50 hover:border-gray-300')}`
                            }`}>

                            <div className="relative">
                                <button onClick={() => setOpenAccordion(openAccordion === i ? null : i)}
                                    className="w-full flex items-center gap-6 p-6 sm:p-7 text-left transition-all">
                                    <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center transition-all duration-500 shrink-0 ${
                                        openAccordion === i
                                            ? 'bg-gradient-to-br from-blue-500 to-violet-500 shadow-lg shadow-blue-500/30 text-slate-900 dark:text-white'
                                            : t(isDark, 'bg-white dark:bg-zinc-900 text-zinc-500 group-hover:text-slate-900 dark:text-zinc-200', 'bg-gray-100 text-gray-400 group-hover:text-gray-700')
                                    }`}>
                                        <span className="text-3xl drop-shadow-md">{item.icon}</span>
                                    </div>
                                    <span className={`text-lg font-black italic flex-1 transition-colors duration-300 tracking-tight ${
                                        openAccordion === i ? 'text-blue-500' : t(isDark, 'text-slate-600 dark:text-zinc-300 group-hover:text-slate-900 dark:text-white', 'text-gray-700 group-hover:text-gray-900')
                                    }`}>{item.title}</span>
                                    <ChevronDown className={`w-6 h-6 transition-transform duration-500 ${
                                        openAccordion === i ? 'rotate-180 text-blue-500' : t(isDark, 'text-zinc-600 group-hover:text-slate-900 dark:text-zinc-300', 'text-gray-400 group-hover:text-gray-600')
                                    }`} />
                                </button>
                                <AnimatePresence>
                                    {openAccordion === i && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}>
                                            <div className="px-7 pb-10 pt-2 pl-24">
                                                <div className={`text-base leading-relaxed border-l-4 border-blue-500/40 pl-8 py-6 rounded-r-[24px] shadow-inner ${
                                                    t(isDark, 'text-slate-600 dark:text-zinc-300 bg-blue-500/[0.03]', 'text-gray-700 bg-blue-50/60')
                                                }`}>{item.content}</div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ))}
                </div>


                {/* ════════════════════════════════════════════════════════
                    8. FRESHER ACHIEVEMENT BADGES
                   ════════════════════════════════════════════════════════ */}
                <SectionHeading icon="🛰️" title="Achievement Medals" delay={0.9} isDark={isDark} />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
                    {BADGES.map((badge, i) => (
                        <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.95 + i * 0.05 }}
                            onClick={() => {
                                if (badge.unlocked) {
                                    setShowConfetti(true);
                                    showToast(`⭐ Achievement Unlocked: ${badge.title}`);
                                    setTimeout(() => setShowConfetti(false), 3000);
                                } else {
                                    showToast('🔒 System Lock: Complete objective to unlock medal');
                                }
                            }}
                            className={`group relative rounded-[32px] overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-3 border ${
                                badge.unlocked
                                    ? `shadow-[0_20px_40px_rgba(59,130,246,0.15)] ${t(isDark, 'bg-white dark:bg-zinc-950/40 border-blue-500/40 group-hover:border-violet-400/60', 'bg-white border-blue-200 group-hover:border-violet-400/60 shadow-blue-100/50')}`
                                    : `grayscale-[0.9] opacity-40 hover:opacity-60 hover:grayscale-[0.4] ${t(isDark, 'bg-white dark:bg-zinc-900/40 border-slate-100 dark:border-white/5', 'bg-gray-100 border-gray-200')}`
                            }`}>

                            <div className="relative p-7 flex flex-col items-center justify-center text-center h-full min-h-[180px]">
                                {badge.unlocked && (
                                    <motion.div initial={{ rotate: -15 }} animate={{ rotate: 15 }} transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
                                        className="absolute top-4 right-4 text-xl drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]">✨</motion.div>
                                )}
                                {!badge.unlocked && <Lock className={`absolute top-4 right-4 w-4 h-4 ${t(isDark, 'text-zinc-700', 'text-gray-300')}`} />}

                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 transition-transform duration-700 group-hover:scale-125 group-hover:rotate-12 ${
                                    badge.unlocked
                                        ? t(isDark,
                                            'bg-gradient-to-br from-blue-500/20 to-violet-400/20 shadow-2xl shadow-blue-500/20 border border-blue-500/30',
                                            'bg-gradient-to-br from-blue-100 to-violet-100 shadow-lg shadow-blue-200/30 border border-blue-200')
                                        : t(isDark, 'bg-zinc-800', 'bg-gray-200')
                                }`}>
                                    <span className="text-5xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]">{badge.icon}</span>
                                </div>
                                <p className={`text-sm font-black mb-1 transition-colors uppercase tracking-widest ${badge.unlocked ? headingText : t(isDark, 'text-zinc-600', 'text-gray-400')}`}>{badge.title}</p>
                                <p className={`text-[10px] font-bold leading-tight uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${subtitleText}`}>{badge.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>


                {/* ════════════════════════════════════════════════════════
                    9. FRESHER FAQ
                   ════════════════════════════════════════════════════════ */}
                <SectionHeading icon="🛰️" title="Neural FAQ Registry" delay={1} isDark={isDark} />
                <div className="mb-20 space-y-4">
                    {FAQS.map((faq, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 + i * 0.04 }}
                            className={`relative rounded-[28px] overflow-hidden transition-all duration-500 cursor-pointer group border ${
                                openFaq === i
                                    ? t(isDark,
                                        'shadow-2xl shadow-violet-500/10 -translate-y-1 bg-violet-600/10 border-violet-500/40',
                                        'shadow-2xl shadow-violet-100/50 -translate-y-1 bg-violet-50/80 border-violet-300')
                                    : `hover:-translate-y-1 ${cardBg} ${t(isDark, 'hover:bg-white/[0.04] hover:border-white/10', 'hover:bg-gray-50 hover:border-gray-300')}`
                            }`}>

                            <div className="relative">
                                <div className="p-6 sm:p-7 flex items-center justify-between" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center transition-all duration-500 shrink-0 ${
                                            openFaq === i
                                                ? 'bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/30 text-slate-900 dark:text-white'
                                                : t(isDark, 'bg-white dark:bg-zinc-900 text-zinc-600 group-hover:text-slate-900 dark:text-zinc-400', 'bg-gray-100 text-gray-400 group-hover:text-gray-600')
                                        }`}>
                                            <HelpCircle className="w-6 h-6" />
                                        </div>
                                        <h3 className={`text-base font-black italic transition-colors duration-300 tracking-tight ${
                                            openFaq === i ? 'text-violet-500' : t(isDark, 'text-slate-500 dark:text-zinc-400 group-hover:text-slate-900 dark:text-white', 'text-gray-600 group-hover:text-gray-900')
                                        }`}>{faq.q}</h3>
                                    </div>
                                    <ChevronRight className={`w-6 h-6 transition-transform duration-500 ${
                                        openFaq === i ? 'rotate-90 text-violet-500' : t(isDark, 'text-zinc-700 group-hover:text-slate-900 dark:text-zinc-400', 'text-gray-300 group-hover:text-gray-500')
                                    }`} />
                                </div>
                                <AnimatePresence>
                                    {openFaq === i && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}>
                                            <div className="px-7 pb-10 pt-2 pl-24">
                                                <div className={`text-base leading-relaxed border-l-4 border-violet-500/40 pl-8 py-6 rounded-r-[24px] shadow-inner ${
                                                    t(isDark, 'text-slate-600 dark:text-zinc-300 bg-violet-500/[0.03]', 'text-gray-700 bg-violet-50/60')
                                                }`}>{faq.a}</div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ════ AI STUDY HELPER ════ */}
                <div className="fixed bottom-6 right-6 z-50">
                    <AnimatePresence>
                        {isAIOpen && (
                            <motion.div initial={{ opacity: 0, y: 20, scale: 0.9, originX: 1, originY: 1 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}
                                className={`absolute bottom-16 right-0 w-[340px] h-[420px] backdrop-blur-xl rounded-[24px] shadow-2xl flex flex-col overflow-hidden border ${
                                    t(isDark, 'bg-white dark:bg-zinc-950/95 border-blue-500/20 shadow-blue-500/10', 'bg-white/95 border-gray-200 shadow-gray-200/50')
                                }`}>
                                {/* Header */}
                                <div className={`h-14 px-4 flex items-center justify-between shadow-sm border-b ${
                                    t(isDark, 'bg-gradient-to-r from-blue-500/10 to-violet-500/5 border-slate-100 dark:border-white/5', 'bg-gradient-to-r from-blue-50 to-violet-50 border-gray-100')
                                }`}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t(isDark, 'bg-blue-500/20', 'bg-blue-100')}`}>
                                            <Bot className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <span className={`text-sm font-black uppercase tracking-wider ${headingText}`}>AI Study Helper</span>
                                    </div>
                                    <button onClick={() => setIsAIOpen(false)} className={`p-1.5 rounded-lg transition-colors ${
                                        t(isDark, 'text-zinc-500 hover:text-slate-900 dark:text-white hover:bg-white/10', 'text-gray-400 hover:text-gray-900 hover:bg-gray-100')
                                    }`}>
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {aiChat.map((c, i) => (
                                        <div key={i} className={`flex ${c.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] p-3 text-[13px] leading-relaxed shadow-sm ${
                                                c.role === 'user'
                                                    ? 'bg-gradient-to-br from-blue-500 to-violet-500 text-slate-900 dark:text-white rounded-2xl rounded-tr-sm'
                                                    : t(isDark,
                                                        'bg-white/[0.04] border border-white/[0.08] text-slate-600 dark:text-zinc-300 rounded-2xl rounded-tl-sm',
                                                        'bg-gray-100 border border-gray-200 text-gray-700 rounded-2xl rounded-tl-sm')
                                            }`}>
                                                {c.msg}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Input */}
                                <div className={`p-3 flex gap-2 border-t ${t(isDark, 'bg-white/[0.02] border-slate-100 dark:border-white/5', 'bg-gray-50 border-gray-100')}`}>
                                    <Input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendAIMessage()}
                                        placeholder="Ask about notes, library..."
                                        className={`flex-1 text-xs h-10 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500 ${
                                            t(isDark, 'bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 placeholder:text-zinc-600', 'bg-white border-gray-200 placeholder:text-gray-400')
                                        }`} />
                                    <Button onClick={sendAIMessage} size="icon" className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 hover:from-blue-400 hover:to-violet-500 rounded-xl shrink-0 text-slate-900 dark:text-white shadow-lg shadow-blue-500/20">
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsAIOpen(!isAIOpen)}
                        className={`w-14 h-14 rounded-[20px] flex items-center justify-center shadow-2xl transition-all duration-300 ${
                            isAIOpen
                                ? t(isDark, 'bg-white/10 text-slate-900 dark:text-white rotate-90 border border-slate-200 dark:border-white/10 hover:bg-white/20', 'bg-gray-100 text-gray-900 rotate-90 border border-gray-200 hover:bg-gray-200')
                                : 'bg-gradient-to-br from-blue-500 to-violet-600 text-slate-900 dark:text-white shadow-blue-500/30'
                        }`}>
                        {isAIOpen ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
                    </motion.button>
                </div>

                {/* ════ LOCATION MODAL ════ */}
                <AnimatePresence>
                    {selectedLocation && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedLocation(null)}
                                className="absolute inset-0 bg-white dark:bg-black/60 backdrop-blur-sm" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className={`relative w-full max-w-lg backdrop-blur-xl rounded-[32px] overflow-hidden shadow-2xl border ${
                                    t(isDark, 'bg-white dark:bg-zinc-950/90 border-slate-200 dark:border-white/10', 'bg-white border-gray-200')
                                }`}>
                                <div className={`h-32 bg-gradient-to-br ${selectedLocation.color} opacity-20 absolute top-0 left-0 right-0`} />
                                <div className="relative p-8">
                                    <button onClick={() => setSelectedLocation(null)} className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${
                                        t(isDark, 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white bg-white/5 hover:bg-white/10', 'text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200')
                                    }`}>
                                        <X className="w-5 h-5" />
                                    </button>

                                    <div className={`w-20 h-20 rounded-[28px] bg-gradient-to-br ${selectedLocation.color} flex items-center justify-center mb-6 shadow-lg ${selectedLocation.glow}`}>
                                        <span className="text-4xl">{selectedLocation.icon}</span>
                                    </div>

                                    <h3 className={`text-2xl font-black mb-2 ${headingText}`}>{selectedLocation.name}</h3>
                                    <div className="flex items-center gap-2 mb-6">
                                        <MapPin className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm font-bold text-blue-500">Main Campus</span>
                                    </div>

                                    <div className="space-y-4">
                                        <div className={`rounded-2xl p-5 text-sm leading-relaxed border ${
                                            t(isDark, 'bg-white/5 border-slate-100 dark:border-white/5 text-slate-600 dark:text-zinc-300', 'bg-gray-50 border-gray-200 text-gray-700')
                                        }`}>
                                            {selectedLocation.details}
                                        </div>
                                        <div className="flex gap-3 pt-4">
                                            <Button className={`flex-1 h-12 rounded-xl font-bold ${
                                                t(isDark, 'bg-white text-black hover:bg-zinc-200', 'bg-gray-900 text-slate-900 dark:text-white hover:bg-gray-800')
                                            }`}>
                                                Open in Maps
                                            </Button>
                                            <Button variant="outline" className={`flex-1 h-12 rounded-xl font-bold ${
                                                t(isDark, 'border-slate-200 dark:border-white/10 hover:bg-white/5', 'border-gray-200 hover:bg-gray-100')
                                            }`} onClick={() => setSelectedLocation(null)}>
                                                Close
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    )
}

// ── Section Heading Component ──
function SectionHeading({ icon, title, delay, isDark }: { icon: string; title: string; delay: number; isDark: boolean }) {
    return (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
            className="flex items-center gap-3 mb-8">
            <span className="text-2xl drop-shadow-lg">{icon}</span>
            <h3 className="text-xl font-black bg-gradient-to-r from-blue-600 via-violet-500 to-purple-500 bg-clip-text text-transparent uppercase tracking-[0.1em] italic">{title}</h3>
        </motion.div>
    )
}
