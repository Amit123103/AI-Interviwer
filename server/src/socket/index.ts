import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import axios from 'axios';
import FormData from 'form-data';
import prisma from '../prisma';
import { executionService } from '../services/executionService';
import { handlePeerEvents } from './peerHandler';
import { updateUserProgress } from '../services/gamificationService';
import { handleCollaborationEvents } from './collaborationHandler';
import { isAIOnline } from '../services/healthMonitor';
import { initializeStudentTracking } from './studentTrackingHandler';
import { generateCVBasedQuestions } from '../services/aiService';

// AI Service URL (Python FastAPI)
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Generate fallback questions from student profile if prebuilt questions aren't available
function generateFallbackQuestions(profile: any, sector: string, difficulty: string, count: number): string[] {
    const name = profile?.fullName || profile?.studentName || 'Candidate';
    const skills = profile?.skills || [];
    const projects = profile?.projects || [];
    const role = profile?.jobRole || 'Software Engineer';
    const company = profile?.dreamCompany || '';

    const questions: string[] = [];

    // Add skill-based questions
    if (skills.length > 0) {
        for (const skill of skills.slice(0, Math.min(3, count))) {
            questions.push(`Can you explain your experience with ${skill} and how you've used it in your projects?`);
        }
    }

    // Add project-based questions
    if (projects.length > 0) {
        for (const proj of projects.slice(0, Math.min(2, count - questions.length))) {
            const projName = typeof proj === 'string' ? proj : proj?.name || proj?.title || 'your project';
            questions.push(`Tell me about ${projName}. What was your role, what challenges did you face, and how did you solve them?`);
        }
    }

    // Add role/company-specific questions
    if (company) {
        questions.push(`Why do you want to work at ${company}, and what makes you a good fit for a ${role} role there?`);
    }

    // Fill remaining with generic but useful questions
    const generic = [
        `What is your approach to debugging complex issues in production?`,
        `Describe a situation where you had to learn a new technology quickly. How did you approach it?`,
        `Can you walk me through how you would design a scalable web application from scratch?`,
        `What's the most challenging technical problem you've solved? Walk me through your approach.`,
        `How do you handle disagreements with team members about technical decisions?`,
        `Tell me about a project that failed or didn't go as planned. What did you learn?`,
        `How do you stay updated with the latest technology trends in ${sector}?`,
        `If you had to refactor a legacy codebase, how would you plan and execute it?`,
        `Describe your understanding of system design principles and trade-offs.`,
        `What are your strengths and areas where you'd like to improve as a developer?`
    ];

    while (questions.length < count && generic.length > 0) {
        questions.push(generic.shift()!);
    }

    return questions.slice(0, count);
}

export const initializeSocket = (httpServer: HttpServer) => {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // Global Session Store
    interface QuestionMeta {
        text: string;
        category: string;
        difficulty: string;
        expected_depth: string;
        followup_seeds: string[];
        evaluation_criteria: string;
    }

    interface SessionData {
        socketId: string;
        userId: string;
        roomName: string;
        studentProfile: any;
        onsiteContext: { onsiteId: string, round: number } | null;
        interviewSettings: {
            difficulty: string;
            totalQuestions: number;
            voice: string;
            sector: string;
            persona: string;
            targetCompany: string;
            jobDescription: string;
            interviewType: string;
            language: string;
        };
        questionsRich: QuestionMeta[]; // Rich metadata from generation
        interviewPlan: string[];       // Just the strings for logic
        currentQuestionIndex: number;
        evaluations: any[];
        monitoringLogs: any[];
        hintCount: number;
        cumulativeScore: number;       // For adaptive difficulty
        followupCount: number;         // Tracking follow-ups per main question
        probeCount: number;            // Total probes in session
        isProbing: boolean;            // Flag for current turn
        sttRetryCount: number;         // Track STT failures per turn
        apiKey: string | null;         // Global dynamic API key for session
    }

    const sessions = new Map<string, SessionData>();

    io.on('connection', (socket) => {
        try {
            console.log('New client connected:', socket.id);

            // We no longer initialize local state here. 
            // We wait for 'join-interview' to retrieve or create the session.
            let currentUserId: string | null = null;
            let hasJoined = false; // Guard against duplicate join-interview events

            socket.on('join-interview', async (data) => {
                // ─── AI Service Guard ─────────────────────────────────────
                if (!isAIOnline()) {
                    console.warn(`[Socket] join-interview rejected: AI Service offline (user: ${data?.userId})`);
                    socket.emit('error', {
                        message: 'The AI service is temporarily offline. Please wait a moment and try again.',
                        code: 'AI_OFFLINE'
                    });
                    return;
                }
                const { userId, role, candidateId, candidateName, difficulty, totalQuestions, voice, sector, persona, onsiteId, round, targetCompany, jobDescription, prebuiltQuestions, questions_rich, interviewType, language, apiKey } = data;

                // GUARD: Prevent duplicate join-interview processing on same socket
                if (role !== 'mentor' && hasJoined) {
                    console.log(`[V3] Ignoring duplicate join-interview for user ${userId} on socket ${socket.id}`);
                    return;
                }

                // If mentor, join the candidate's room.
                if (role === 'mentor') {
                    const targetId = candidateId;
                    const rName = `interview_${targetId}`;
                    socket.join(rName);
                    console.log(`Mentor ${userId} joined room ${rName}`);
                    socket.emit('mentor-joined', { success: true });
                    return;
                }

                // CANDIDATE LOGIC
                hasJoined = true;
                currentUserId = userId;
                const rName = `interview_${userId}`;
                socket.join(rName);

                // Check if session exists (reconnect)
                if (sessions.has(userId)) {
                    console.log(`[V3] Resuming session for user ${userId}`);
                    const session = sessions.get(userId)!;
                    session.socketId = socket.id;
                    session.roomName = rName;

                    const lastQ = session.interviewPlan[session.currentQuestionIndex];
                    if (lastQ) {
                        socket.emit('ai-response', {
                            text: lastQ,
                            audio: "",
                            isLast: false,
                            resumed: true
                        });
                    }
                    return;
                }

                // ─── NEW SESSION ─────────────────────────────────────────────
                console.log(`[V3] Starting NEW session for user ${userId}`);

                let studentProfile: any = null;
                let onsiteCtx: { onsiteId: string, round: number } | null = null;
                if (onsiteId) onsiteCtx = { onsiteId, round };

                // Tracking to prevent multiple greetings in a single session
                if ((socket as any).greetingSent) {
                    console.log(`[V3] Greeting already sent for socket ${socket.id}, skipping join-interview re-emission.`);
                    return;
                }

                try {
                    // Use findFirst if userId is not the primary key to avoid TS errors
                    studentProfile = await prisma.profile.findFirst({ where: { userId } });

                    // ─── GENERATE QUESTIONS ───────────────────────────────────────
                    let questions: string[] = [];
                    let richMeta: QuestionMeta[] = [];

                    if (Array.isArray(prebuiltQuestions) && prebuiltQuestions.length > 0) {
                        // Extract text if questions are objects {text, category, ...}
                        questions = prebuiltQuestions.slice(0, totalQuestions || 10).map(q => 
                            typeof q === 'object' ? q.text : q
                        );
                        
                        richMeta = Array.isArray(questions_rich) && questions_rich.length > 0
                            ? questions_rich.slice(0, questions.length)
                            : prebuiltQuestions.slice(0, questions.length).map((q, idx) => ({
                                text: questions[idx], 
                                category: typeof q === 'object' ? q.category || 'general' : 'general',
                                difficulty: typeof q === 'object' ? q.difficulty || difficulty || 'Medium' : difficulty || 'Medium',
                                expected_depth: typeof q === 'object' ? q.expected_depth || 'Moderate' : 'Moderate',
                                followup_seeds: typeof q === 'object' ? q.followup_seeds || [] : [],
                                evaluation_criteria: typeof q === 'object' ? q.evaluation_criteria || 'Clear communication.' : 'Clear communication.'
                            }));
                    } else {
                        console.log(`[V3] No prebuilt questions, generating CV-based questions...`);
                        
                        // Priority 1: Generate personalized questions from CV via NVIDIA/OpenAI
                        try {
                            const cvQuestions = await generateCVBasedQuestions(
                                studentProfile,
                                studentProfile?.resumeText || "",
                                {
                                    difficulty: difficulty || 'Intermediate',
                                    count: totalQuestions || 7,
                                    sector: sector || 'General',
                                    targetCompany: targetCompany || '',
                                    interviewType: interviewType || 'Mixed',
                                    persona: persona || 'Friendly Mentor',
                                    apiKey: apiKey
                                }
                            );
                            if (cvQuestions.length > 0) {
                                questions = cvQuestions;
                                console.log(`[V3] Generated ${questions.length} CV-based personalized questions`);
                                richMeta = questions.map(q => ({
                                    text: q, category: sector || 'general', difficulty: difficulty || 'Medium',
                                    expected_depth: 'Moderate', followup_seeds: [], evaluation_criteria: 'Technical accuracy and depth.'
                                }));
                            }
                        } catch (cvErr: any) {
                            console.error(`[V3] CV-based question generation failed:`, cvErr.message);
                        }

                        // Priority 2: FastAPI resume endpoint fallback
                        if (questions.length === 0) {
                            try {
                                const genRes = await axios.post(`${AI_SERVICE_URL}/resume/generate-questions`, {
                                    resume_text: studentProfile?.resumeText || "",
                                    count: totalQuestions || 7,
                                    difficulty: difficulty || "Intermediate",
                                    topic: sector || "General",
                                    api_key: apiKey
                                }, { timeout: 120000 });

                                if (genRes.data?.questions) {
                                    questions = genRes.data.questions;
                                    richMeta = questions.map(q => ({
                                        text: q, category: sector || 'general', difficulty: difficulty || 'Medium',
                                        expected_depth: 'Moderate', followup_seeds: [], evaluation_criteria: 'Technical accuracy.'
                                    }));
                                }
                            } catch (genErr: any) {
                                console.error(`[V3] FastAPI question generation failed:`, genErr.message);
                            }
                        }

                        // Priority 3: Local fallback generation
                        if (questions.length === 0) {
                            questions = generateFallbackQuestions(studentProfile, sector, difficulty, totalQuestions || 10);
                            richMeta = questions.map(q => ({
                                text: q, category: 'general', difficulty: difficulty || 'Medium',
                                expected_depth: 'Moderate', followup_seeds: [], evaluation_criteria: 'General communication.'
                            }));
                        }
                    }

                    const newSession: SessionData = {
                        socketId: socket.id,
                        userId,
                        roomName: rName,
                        studentProfile,
                        onsiteContext: onsiteCtx,
                        interviewSettings: {
                            difficulty: difficulty || 'Intermediate',
                            totalQuestions: questions.length,
                            voice: voice || 'Female (Alloy)',
                            sector: sector || 'General',
                            persona: persona || 'Friendly Mentor',
                            targetCompany: targetCompany || '',
                            jobDescription: jobDescription || '',
                            interviewType: interviewType || 'Mixed',
                            language: language || 'English'
                        },
                        questionsRich: richMeta,
                        interviewPlan: questions,
                        currentQuestionIndex: 0,
                        evaluations: [],
                        monitoringLogs: [],
                        hintCount: 0,
                        cumulativeScore: 5.0,
                        followupCount: 0,
                        probeCount: 0,
                        isProbing: false,
                        sttRetryCount: 0,
                        apiKey: apiKey || null
                    };

                    sessions.set(userId, newSession);

                    const name = candidateName || studentProfile?.fullName || studentProfile?.studentName || 'there';
                    const isInstant = !studentProfile?.resumeText || studentProfile?.resumeText.length < 50;
                    const roleMention = sector ? ` for the ${sector} role` : '';
                    const firstQ = questions[0];
                    const isHindi = language === 'Hindi';

                    const greetingTexts: Record<string, string> = isHindi ? {
                        'Friendly Mentor': `नमस्ते ${name}! ${isInstant ? 'मैंने खास तौर पर आपके लिए यह इंटरव्यू तैयार किया है।' : 'मैंने आपकी प्रोफ़ाइल देखी है और मैं आपसे बात करने के लिए उत्साहित हूँ।'} मैं आपसे ${questions.length} सवाल पूछूँगी। आपका पहला सवाल यह है: ${firstQ}`,
                        'Strict Lead': `नमस्ते ${name}। ${isInstant ? 'यह इंटरव्यू आपके द्वारा चुने गए क्षेत्र के लिए डिज़ाइन किया गया है।' : 'मैंने आपकी प्रोफ़ाइल का मूल्यांकन किया है।'} आपका पहला सवाल: ${firstQ}`,
                        'Stress Tester': `स्वागत है ${name}। ${isInstant ? 'यह एक त्वरित परीक्षण सत्र है।' : 'आपकी प्रोफ़ाइल चुनौतीपूर्ण है।'} पहला सवाल: ${firstQ}`
                    } : {
                        'Friendly Mentor': `Hi ${name}! Welcome to your interview${roleMention}. ${isInstant ? "I've tailored this session specifically for your role." : "I've reviewed your profile and I'm excited to chat with you."} I'll ask you ${questions.length} questions. Speak naturally after each one. Here's your first question: ${firstQ}`,
                        'Strict Lead': `Good day, ${name}. Welcome to this interview${roleMention}. ${isInstant ? "This session has been configured for your specialization." : "I've evaluated your background."} I'll be evaluating your responses across ${questions.length} questions. Here's your first question: ${firstQ}`,
                        'Stress Tester': `Welcome, ${name}. This ${isInstant ? 'intensive' : 'personalized'} interview session will test your ability to think under pressure across ${questions.length} questions. First question: ${firstQ}`
                    };

                    const introText = greetingTexts[persona] ||
                        `Hello ${name}! Welcome to your interview${roleMention}. I'll ask you ${questions.length} questions. Here's your first question: ${firstQ}`;

                    // Synchronous Greeting TTS to prevent "double voice" (Browser TTS + Server TTS)
                    // Extract simple voice preference ("Male" / "Female") from voice setting
                    const voicePref = (voice || '').toLowerCase().includes('male') && !(voice || '').toLowerCase().includes('female') ? 'Male' : 'Female';

                    let introAudio = "";
                    try {
                        const ttsRes = await axios.post(`${AI_SERVICE_URL}/speak`, {
                            text: introText,
                            persona: persona || 'Friendly Mentor',
                            voice: voicePref,
                            api_key: apiKey
                        }, { timeout: 15000 });
                        introAudio = ttsRes.data?.audio_base64 || ttsRes.data?.audio_base_64 || "";
                    } catch (ttsErr: any) {
                        console.warn(`[V3] Greeting TTS failed, client will fallback:`, ttsErr.message);
                    }

                    // Combined response: emit text and audio together
                    socket.emit('ai-response', {
                        text: introText,
                        audio: introAudio,
                        isLast: false,
                        currentQuestion: firstQ,
                        totalQuestions: questions.length
                    });

                    (socket as any).greetingSent = true;
                    console.log(`[V3] Synchronized greeting emitted for "${name}" with ${introAudio ? 'server' : 'fallback'} audio.`);
                    console.log(`[V3] Interview initialized — ${questions.length} questions queued for user ${userId}`);

                } catch (err: any) {
                    console.error("Error joining interview:", err);
                    socket.emit('error', { 
                        message: `Failed to initialize session: ${err.message}`,
                        type: 'INITIALIZATION_ERROR'
                    });
                    sessions.delete(userId);
                }
            });

            socket.on('monitoring-event', (data) => {
                console.log("Monitoring Event:", data.type);
                if (currentUserId && sessions.has(currentUserId)) {
                    const session = sessions.get(currentUserId)!;
                    session.monitoringLogs.push(data);
                    // Broadcast violations to mentors too
                    io.to(session.roomName).emit('mentor-monitoring-update', data);
                }
            });

            // ── Anti-Cheat Violation Listener ───────────────────────────────
            socket.on('anti-cheat:violation', (data) => {
                const { type, detail, counts } = data;
                console.warn(`[AntiCheat] Violation from ${socket.id}: ${type} — ${detail}`);
                if (currentUserId && sessions.has(currentUserId)) {
                    const session = sessions.get(currentUserId)!;
                    session.monitoringLogs.push({
                        type: 'anti-cheat',
                        subType: type,
                        detail,
                        counts,
                        timestamp: Date.now()
                    });
                    // Warn mentors in real time
                    io.to(session.roomName).emit('mentor-monitoring-update', {
                        type: 'anti-cheat',
                        subType: type,
                        detail,
                        counts
                    });
                }
            });

            socket.on('audio-response', async (data) => {
                console.log(`[INSTANT] audio-response received from ${socket.id}`);

                if (!currentUserId || !sessions.has(currentUserId)) {
                    console.error("Session not found for audio response");
                    socket.emit('error', { 
                        message: 'Session or user context lost. Reconnecting...', 
                        code: 'SESSION_MISSING' 
                    });
                    return;
                }

                const session = sessions.get(currentUserId)!;
                const { audio } = data;

                // ─── Tell client we're processing (briefly) ────
                socket.emit('processing-start');

                try {
                    // ─── STEP 1: Transcribe audio with Whisper ─────
                    const formData = new FormData();
                    formData.append('file', Buffer.from(audio), { filename: 'audio.webm', contentType: 'audio/webm' });

                    let userText = "";
                    try {
                        const sttRes = await axios.post(`${AI_SERVICE_URL}/stt/transcribe`, formData, {
                            headers: formData.getHeaders(),
                            timeout: 60000 // Increased timeout
                        });
                        userText = sttRes.data?.transcript || "";
                    } catch (sttErr: any) {
                        console.error(`[INSTANT] Whisper STT failed: ${sttErr.message}`);
                        // Fall through to retry/advance logic
                    }

                    // If transcription is empty/too short, ask to repeat (with limit)
                    if (!userText || userText.length < 3) {
                        session.sttRetryCount++;
                        console.log(`[INSTANT] Empty/short transcript (count: ${session.sttRetryCount})`);

                        if (session.sttRetryCount < 2) {
                            const retryText = "I didn't quite catch that. Could you please repeat your answer?";
                            let retryAudio = "";
                            const sessionVoice = (session.interviewSettings.voice || '').toLowerCase().includes('male') && !(session.interviewSettings.voice || '').toLowerCase().includes('female') ? 'Male' : 'Female';
                            try {
                                const ttsRes = await axios.post(`${AI_SERVICE_URL}/speak`, {
                                    text: retryText,
                                    persona: session.interviewSettings.persona,
                                    voice: sessionVoice,
                                    api_key: session.apiKey
                                }, { timeout: 10000 });
                                retryAudio = ttsRes.data?.audio_base64 || "";
                            } catch { /* browser TTS fallback */ }

                            socket.emit('processing-end');
                            socket.emit('ai-response', {
                                text: retryText,
                                audio: retryAudio,
                                isLast: false,
                                isRetry: true
                            });
                            return;
                        } else {
                            console.log(`[INSTANT] Max STT retries reached. Advancing anyway.`);
                            userText = "[No clear response detected]"; // Continue with placeholder
                        }
                    }

                    // Reset retry count on successful transcription (or forced advance)
                    session.sttRetryCount = 0;

                    console.log(`[INSTANT] Student said: "${userText.substring(0, 80)}..."`);
                    io.to(session.roomName).emit('transcript-update', { text: userText, role: 'user' });

                    // ─── STEP 2: Adaptive Probe Logic (Phase 2) ──
                    const wordCount = userText.trim().split(/\s+/).length;
                    const isShort = wordCount < 15;
                    const canProbe = !session.isProbing && session.probeCount < 8; // Global limit for safety

                    if (isShort && canProbe) {
                        session.isProbing = true;
                        session.probeCount++;
                        const isHindi = session.interviewSettings.language === 'Hindi';

                        const probeText = isHindi
                            ? "क्या आप इसके बारे में थोड़ा और विस्तार से बता सकते हैं?"
                            : "That's a good start, but could you please elaborate on that or give a specific example?";

                        let probeAudio = "";
                        const probeVoice = (session.interviewSettings.voice || '').toLowerCase().includes('male') && !(session.interviewSettings.voice || '').toLowerCase().includes('female') ? 'Male' : 'Female';
                        try {
                            const ttsRes = await axios.post(`${AI_SERVICE_URL}/speak`, {
                                text: probeText,
                                persona: session.interviewSettings.persona,
                                voice: probeVoice,
                                api_key: session.apiKey
                            }, { timeout: 10000 });
                            probeAudio = ttsRes.data?.audio_base64 || "";
                        } catch { /* browser fallback */ }

                        socket.emit('processing-end');
                        socket.emit('ai-response', {
                            text: probeText,
                            audio: probeAudio,
                            isLast: false,
                            isFollowup: true
                        });
                        return; // EXIT early, don't advance to next question yet
                    }

                    // If we were in a probe, Reset flag now that they've answered it
                    session.isProbing = false;

                    // ─── STEP 3: INSTANTLY save answer & advance to next pre-built question ──
                    const currentQuestion = session.interviewPlan[session.currentQuestionIndex] || "Question";

                    // Record the answer with placeholder evaluation (background will update)
                    session.evaluations.push({
                        question: currentQuestion,
                        answer: userText,
                        voice_analysis: { emotion: data.emotion || 'Neutral' },
                        evaluation: { technical_score: 5, communication_score: 5, composite_score: 5, feedback: '' },
                        is_followup: false
                    });

                    // Advance index
                    session.currentQuestionIndex++;
                    const nextIdx = session.currentQuestionIndex;
                    const isLast = nextIdx >= session.interviewPlan.length;

                    // ─── STEP 4: Fire-and-forget background evaluation (NON-BLOCKING) ──
                    const evalIdx = nextIdx - 1; // Index of the question we just answered
                    const bgEvalData = {
                        question: currentQuestion,
                        answer: userText,
                        difficulty: session.interviewSettings.difficulty,
                        sector: session.interviewSettings.sector,
                        job_role: session.studentProfile?.jobRole || session.interviewSettings.targetCompany || 'Software Engineer',
                        language: session.interviewSettings.language || 'English'
                    };

                    // Background: don't await this — it updates session.evaluations[evalIdx] later
                    axios.post(`${AI_SERVICE_URL}/evaluate-answer`, { ...bgEvalData, api_key: session.apiKey }, { timeout: 30000 })
                        .then((evalRes) => {
                            if (evalRes.data?.evaluation && sessions.has(currentUserId!)) {
                                const s = sessions.get(currentUserId!)!;
                                if (s.evaluations[evalIdx]) {
                                    s.evaluations[evalIdx].evaluation = evalRes.data.evaluation;
                                    // Update cumulative score
                                    const score = evalRes.data.evaluation.composite_score || 5;
                                    s.cumulativeScore = (s.cumulativeScore * 0.7) + (score * 0.3);
                                    console.log(`[INSTANT] Background eval for Q${evalIdx + 1} complete: score=${score}`);

                                    // Phase 3: Emit live metrics update to client
                                    socket.emit('live-metrics-update', {
                                        technicalScore: evalRes.data.evaluation.technical_score || 5,
                                        communicationScore: evalRes.data.evaluation.communication_score || 5,
                                        confidenceScore: Math.round(s.cumulativeScore),
                                        feedback: evalRes.data.evaluation.feedback || "Good response!",
                                        questionIdx: evalIdx
                                    });

                                    // --- ADAPTIVE INTELLIGENCE: Plan Adjustment ---
                                    const upcomingIdx = s.currentQuestionIndex;
                                    if (upcomingIdx < s.interviewPlan.length) {
                                        const isStruggling = s.cumulativeScore < 4.5;
                                        const isExcelling = s.cumulativeScore > 8.5;

                                        if (isStruggling || isExcelling) {
                                            console.log(`[ADAPTIVE] Candidate is ${isStruggling ? 'struggling' : 'excelling'} (Score: ${s.cumulativeScore.toFixed(1)}). Adjusting upcoming question.`);

                                            // Regenerate next question with new difficulty context
                                            axios.post(`${AI_SERVICE_URL}/resume/generate-questions`, {
                                                resume_text: s.studentProfile?.resumeText || "",
                                                count: 1,
                                                difficulty: isExcelling ? "Hard" : "Easy",
                                                sector: s.interviewSettings.sector,
                                                api_key: s.apiKey,
                                                context: `PREVIOUS_SCORE: ${score}, REASON: ${isStruggling ? 'Simplify for fundamentals' : 'Challenge with deeper depth'}`
                                            }).then(res => {
                                                if (res.data?.questions?.[0]) {
                                                    console.log(`[ADAPTIVE] Question Q${upcomingIdx + 1} updated: "${res.data.questions[0].substring(0, 40)}..."`);
                                                    s.interviewPlan[upcomingIdx] = res.data.questions[0];
                                                }
                                            }).catch(err => console.warn(`[ADAPTIVE] Failed to adjust question: ${err.message}`));
                                        }
                                    }
                                }
                            }
                        })
                        .catch((bgErr) => {
                            console.warn(`[INSTANT] Background eval failed for Q${evalIdx + 1}: ${bgErr.message}`);
                            // Non-fatal — placeholder scores remain
                        });

                    // ─── STEP 5: Send next question or finish interview ──
                    if (isLast) {
                        // ═══ INTERVIEW COMPLETE ═══
                        console.log(`[INSTANT] All ${session.interviewPlan.length} questions answered. Finishing up...`);

                                 // ─── Generate report in background ─────────────────
                        // Wait a moment for any pending background evaluations to finish
                        setTimeout(async () => {
                            try {
                                const currentSession = sessions.get(currentUserId!);
                                if (!currentSession) return;

                                // ── Run speech analysis before report ───
                                let speechAnalysis = {};
                                try {
                                    const allAnswers = currentSession.evaluations.map(e => e.answer || '').join(' ');
                                    const speechRes = await axios.post(`${AI_SERVICE_URL}/interview/analyze-speech`, {
                                        transcript_text: allAnswers,
                                        duration_seconds: currentSession.evaluations.length * 60, // rough estimate
                                        audio_features: {},
                                        api_key: currentSession.apiKey
                                    }, { timeout: 15000 });
                                    speechAnalysis = speechRes.data || {};
                                } catch (speechErr: any) {
                                    console.warn('[INSTANT] Speech analysis failed:', speechErr.message);
                                }

                                const reportRes = await axios.post(`${AI_SERVICE_URL}/interview/generate-report`, {
                                    transcript: currentSession.evaluations.map(e => ({ role: 'user', text: e.answer })),
                                    evaluation_history: currentSession.evaluations,
                                    event_logs: currentSession.monitoringLogs,
                                    student_profile: currentSession.studentProfile,
                                    sector: currentSession.interviewSettings.sector,
                                    persona: currentSession.interviewSettings.persona,
                                    hint_count: currentSession.hintCount,
                                    target_company: currentSession.interviewSettings.targetCompany,
                                    job_description: currentSession.interviewSettings.jobDescription,
                                    interview_type: currentSession.interviewSettings.interviewType,
                                    language: currentSession.interviewSettings.language,
                                    speech_analysis: speechAnalysis,
                                    api_key: currentSession.apiKey
                                }, { timeout: 120000 });

                                const reportData = reportRes.data;

                                const newReport = await prisma.report.create({
                                    data: {
                                        userId: currentSession.studentProfile?.userId || currentSession.userId,
                                        overallScore: reportData.overall_score || 0,
                                        readinessLevel: reportData.readiness_level || 'Developing',
                                        interviewType: currentSession.interviewSettings.interviewType,
                                        aiEvaluation: {
                                            relevance: reportData.metrics?.relevance || 0,
                                            technicalCorrectness: reportData.metrics?.technical_correctness || 0,
                                            clarityStructure: reportData.metrics?.clarity_structure || 0,
                                            confidence: reportData.metrics?.confidence || 0,
                                            communication: reportData.metrics?.communication || 0,
                                            conceptCoverage: reportData.metrics?.concept_coverage || 0,
                                            strengths: reportData.strengths || [],
                                            improvementAreas: reportData.improvement_areas || [],
                                            aiSummary: reportData.executive_summary || ""
                                        } as any,
                                        questionFeedback: reportData.question_feedback || [] as any,
                                        scores: {
                                            technical: reportData.scores?.technical || 5,
                                            communication: reportData.scores?.communication || 5,
                                            confidence: reportData.scores?.confidence || 5
                                        } as any,
                                        feedback: reportData.interview_summary || reportData.ai_summary || 'Interview completed.',
                                        improvement_tips: reportData.areas_for_improvement || reportData.improvement_areas || [],
                                        sector: currentSession.interviewSettings.sector,
                                        persona: currentSession.interviewSettings.persona,
                                        targetCompany: currentSession.interviewSettings.targetCompany,
                                        jobDescription: currentSession.interviewSettings.jobDescription,
                                        skillMatrix: {
                                            technical: (reportData.scores?.technical || 5) * 10,
                                            delivery: (reportData.scores?.communication || 5) * 10,
                                            problem_solving: (reportData.scores?.problem_solving || 5) * 10,
                                            situational: (reportData.scores?.situational || 8) * 10,
                                            theoretical: (reportData.scores?.theoretical || 8) * 10,
                                            confidence: (reportData.scores?.confidence || 5) * 10
                                        } as any,
                                        integrityScore: reportData.scores?.integrity || 100,
                                        professionalismScore: reportData.scores?.professionalism || 10,
                                        advancedMetrics: reportData.advanced_metrics as any || {
                                            emotion: reportData.dominant_emotion || 'Neutral',
                                            stress: reportData.dominant_stress || 'Low',
                                            trust_level: 'High'
                                        } as any,
                                        voiceAnalysis: currentSession.evaluations.map(e => ({
                                            question: e.question,
                                            emotion: e.voice_analysis?.emotion || 'Neutral',
                                            stress_level: 'Low',
                                            speaking_pace: 'Normal',
                                            fluency: 'Fluent'
                                        })) as any,
                                        transcriptAnalysis: currentSession.evaluations.map(e => ({
                                            role: 'user',
                                            text: e.answer,
                                            confidenceScore: 70,
                                            sentiment: 'Neutral',
                                            feedback: ''
                                        })) as any,
                                        behavioralDNA: currentSession.evaluations.map((e, idx) => ({
                                            timestamp: idx,
                                            emotion: e.voice_analysis?.emotion || 'Neutral',
                                            intensity: 5
                                        })) as any,
                                        eventLogs: currentSession.monitoringLogs as any
                                    }
                                });

                                console.log(`[INSTANT] Report saved: ${newReport.id}`);

                                // --- PHASE 4: Gamification & XP ---
                                try {
                                    const xpBase = (newReport.overallScore || 0) * 10;
                                    const xpBonus = 50;
                                    const totalXP = Math.round(xpBase + xpBonus);

                                    const progress = await updateUserProgress(currentSession.studentProfile?.userId || currentSession.userId, totalXP, {
                                        interviews: 1,
                                        newScore: newReport.overallScore || 0
                                    });

                                    console.log(`[GAMIFICATION] User ${currentSession.userId} earned ${totalXP} XP. Level: ${progress.level}`);

                                    socket.emit('gamification-update', {
                                        xpGained: totalXP,
                                        level: progress.level,
                                        leveledUp: progress.leveledUp,
                                        achievements: progress.newAchievements
                                    });
                                } catch (gamifyErr: any) {
                                    console.warn(`[GAMIFICATION] Failed to update progress:`, gamifyErr.message);
                                }

                                if (currentSession.onsiteContext) {
                                    try {
                                        const loop = await (prisma as any).onsiteLoop.findUnique({ where: { id: currentSession.onsiteContext.onsiteId } });
                                        if (loop) {
                                            const rounds = (loop.rounds as any[]) || [];
                                            if (rounds[currentSession.onsiteContext.round]) {
                                                rounds[currentSession.onsiteContext.round].reportId = newReport.id;
                                                rounds[currentSession.onsiteContext.round].status = 'Completed';
                                                await (prisma as any).onsiteLoop.update({
                                                    where: { id: loop.id },
                                                    data: { rounds: rounds as any }
                                                });
                                            }
                                        }
                                    } catch (onsiteErr) {
                                        console.error("Error linking to onsite loop:", onsiteErr);
                                    }
                                }

                                // Notify client with report ID
                                socket.emit('ai-response', {
                                    text: 'Your report is ready!',
                                    audio: '',
                                    isLast: true,
                                    reportId: newReport.id,
                                    _id: newReport.id
                                });

                                // Clean up session
                                sessions.delete(currentUserId!);

                            } catch (reportErr: any) {
                                console.error("[INSTANT] Report generation failed:", reportErr);
                                socket.emit('error', { 
                                    message: 'Interview complete, but report generation encountered an error. Please check your dashboard later.',
                                    type: 'REPORT_GENERATION_ERROR'
                                });
                                socket.emit('ai-response', {
                                    text: 'Interview complete! Report generation is taking a moment.',
                                    audio: '',
                                    isLast: true
                                });
                            }
                        }, 3000);

                    } else {
                        // ═══ NEXT QUESTION: INSTANT from pre-built queue ═══
                        const nextQuestion = session.interviewPlan[nextIdx];
                        const persona = session.interviewSettings.persona;

                        // Build natural transition phrases
                        const transitions = [
                            `Good answer. Next question: ${nextQuestion}`,
                            `Thank you. Moving on. ${nextQuestion}`,
                            `Noted. Let's continue. ${nextQuestion}`,
                            `Alright. ${nextQuestion}`,
                            `I see. Next: ${nextQuestion}`,
                        ];
                        const transitionText = transitions[nextIdx % transitions.length];

                        console.log(`[INSTANT] → Q${nextIdx + 1}/${session.interviewPlan.length}: "${nextQuestion.substring(0, 60)}..."`);

                        // ── Human-like thinking pause (1–3s) before next question ──
                        socket.emit('interviewer:thinking');
                        const thinkDelay = 1000 + Math.random() * 2000;
                        await new Promise(r => setTimeout(r, thinkDelay));

                        // Start TTS request (but don't block question text delivery)
                        const transVoice = (session.interviewSettings.voice || '').toLowerCase().includes('male') && !(session.interviewSettings.voice || '').toLowerCase().includes('female') ? 'Male' : 'Female';
                        const ttsPromise = axios.post(`${AI_SERVICE_URL}/speak`, {
                            text: transitionText,
                            persona,
                            voice: transVoice,
                            api_key: session.apiKey
                        }, { timeout: 15000 }).catch(() => ({ data: { audio_base64: '' } }));

                        // Emit text immediately so client can show it while TTS loads
                        socket.emit('processing-end');
                        socket.emit('ai-response', {
                            text: transitionText,
                            audio: '', // Audio sent separately below
                            isLast: false,
                            currentQuestionIndex: nextIdx,
                            totalQuestions: session.interviewSettings.totalQuestions,
                            currentQuestion: nextQuestion
                        });

                        // When TTS finishes, send audio update
                        ttsPromise.then((ttsRes: any) => {
                            const audioData = ttsRes.data?.audio_base64 || '';
                            if (audioData) {
                                socket.emit('tts-audio', { audio: audioData });
                            }
                        });
                    }

                } catch (error: any) {
                    console.error('[INSTANT] CRITICAL Error processing audio:', error?.message || error);
                    socket.emit('processing-end');

                    // ─── GRACEFUL FALLBACK: Advance to next question ──
                    if (session && session.interviewPlan) {
                        session.currentQuestionIndex++;
                        const nextIdx = session.currentQuestionIndex;

                        if (nextIdx < session.interviewPlan.length) {
                            const fallbackQ = session.interviewPlan[nextIdx];
                            socket.emit('ai-response', {
                                text: `Let's continue. ${fallbackQ}`,
                                audio: '',
                                isLast: false,
                                currentQuestionIndex: nextIdx,
                                totalQuestions: session.interviewSettings.totalQuestions
                            });
                            return;
                        }
                    }

                    socket.emit('ai-response', {
                        text: "Let's take a moment. Could you repeat your last answer?",
                        audio: "",
                        isLast: false
                    });
                }
            });

            socket.on('request-hint', async (data) => {
                const { currentCode } = data;

                if (!currentUserId || !sessions.has(currentUserId)) return;
                const session = sessions.get(currentUserId)!;

                const currentQuestion = session.interviewPlan[session.currentQuestionIndex];
                console.log(`Hint requested for Q${session.currentQuestionIndex + 1}`);

                try {
                    session.hintCount++;
                    const hintRes = await axios.post(`${AI_SERVICE_URL}/generate-hint`, {
                        question: currentQuestion,
                        user_code: currentCode || "",
                        persona: session.interviewSettings.persona
                    });

                    io.to(session.roomName).emit('ai-hint', {
                        text: hintRes.data.hint,
                        audio: hintRes.data.audio
                    });
                } catch (err) {
                    console.error("Error generating hint:", err);
                    socket.emit('error', { message: 'Failed to generate hint.' });
                }
            });

            socket.on('mentor-hint', (data) => {
                const { text } = data;
                if (!currentUserId || !sessions.has(currentUserId)) return;
                const session = sessions.get(currentUserId)!;

                console.log(`Mentor Hint received for ${session.roomName}: ${text}`);
                // Broadcast a special "Mentor Hint" to the room
                io.to(session.roomName).emit('ai-hint', {
                    text: `[MENTOR FEEDBACK]: ${text}`,
                    isMentor: true
                });
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });

            socket.on('code-run', async (data) => {
                const { lang, code } = data;
                console.log(`[V2_FIXED] Running code (${lang}) for user ${socket.id}`);
                try {
                    const result = await executionService.runScript(code, lang);
                    socket.emit('code-output', {
                        stdout: result.stdout,
                        stderr: result.stderr,
                        output: result.output,
                        error: result.error,
                        exitCode: result.exitCode,
                    });
                } catch (err: any) {
                    console.error("Code execution error:", err);
                    socket.emit('code-output', { success: false, error: err.message || 'Execution failed' });
                }
            });

            // --- NEW TECHNICAL INTERVIEW HANDLERS ---
            socket.on('technical-start', async (data) => {
                console.log(`[V2_FIXED] technical-start received for user ${socket.id}`);
                const { codingLevel, department, userId } = data;

                try {
                    const response = await axios.post(`${AI_SERVICE_URL}/technical/evaluate`, {
                        user_id: socket.id, // Use socket.id as session key in AI service
                        is_initial: true,
                        coding_level: codingLevel,
                        department: department
                    });

                    socket.emit('technical-question', response.data);
                } catch (err: any) {
                    console.error("Error starting technical interview:", err);
                    socket.emit('error', { message: 'Failed to start technical challenge.' });
                }
            });

            socket.on('technical-submit', async (data) => {
                console.log(`[V2_FIXED] technical-submit received for user ${socket.id}`);
                const { question, code, output, duration, violations } = data;

                try {
                    const response = await axios.post(`${AI_SERVICE_URL}/technical/evaluate`, {
                        user_id: socket.id,
                        question,
                        student_code: code,
                        execution_output: typeof output === 'string' ? output : JSON.stringify(output),
                        duration,
                        violations,
                        is_initial: false
                    });

                    // Update session evaluations to include technical round data
                    if (currentUserId && sessions.has(currentUserId)) {
                        const session = sessions.get(currentUserId)!;
                        session.evaluations.push({
                            type: 'technical',
                            question: question,
                            code: code,
                            evaluation: response.data.evaluation,
                            difficulty_score: response.data.difficulty_score,
                            timestamp: Date.now()
                        });
                    }

                    socket.emit('technical-evaluation', response.data);
                } catch (err: any) {
                    console.error("Error submitting technical interview:", err);
                    socket.emit('error', { message: 'Failed to evaluate technical challenge.' });
                }
            });

            socket.on('technical-audio-answer', async (data) => {
                console.log(`[V2_FIXED] technical-audio-answer received for user ${socket.id}`);
                const { audio } = data;

                if (!currentUserId || !sessions.has(currentUserId)) return;
                const session = sessions.get(currentUserId)!;

                try {
                    const formData = new FormData();
                    formData.append('file', Buffer.from(audio), { filename: 'audio.webm', contentType: 'audio/webm' });

                    // For technical audio follow-up, we use the same interview-turn but maybe a different prompt mode?
                    // Actually, let's just transcribe it and send text back for now if needed,
                    // or just process it as a normal turn with code context.
                    const turnData = {
                        user_id: socket.id,
                        student_profile: session.studentProfile,
                        difficulty: session.interviewSettings.difficulty,
                        sector: "Technical",
                        persona: session.interviewSettings.persona,
                        current_code: data.currentCode || "",
                        current_step: session.currentQuestionIndex + 1,
                        total_steps: session.interviewSettings.totalQuestions,
                        previous_question: data.previousQuestion || "",
                        target_company: session.interviewSettings.targetCompany
                    };

                    formData.append('metadata', JSON.stringify(turnData));

                    const turnRes = await axios.post(`${AI_SERVICE_URL}/interview/turn`, formData, {
                        headers: formData.getHeaders(),
                        timeout: 60000
                    });

                    socket.emit('ai-response', turnRes.data);
                } catch (err: any) {
                    console.error("Error in technical audio answer:", err);
                }
            });

            // --- Peer Mock Interview Events ---
            handlePeerEvents(io, socket);

            // --- Real-Time Collaboration Events (NEW) ---
            handleCollaborationEvents(io, socket);

            // --- Contest Events ---
            socket.on('join-contest', (contestId) => {
                socket.join(`contest_${contestId}`);
                console.log(`User ${socket.id} joined contest room: contest_${contestId}`);
            });

            socket.on('leave-contest', (contestId) => {
                socket.leave(`contest_${contestId}`);
            });

        } catch (connectionErr: any) {
            // Safety net: catch any synchronous error during connection setup
            console.error('[Socket] Uncaught error in connection handler:', connectionErr?.message);
        }
    });

    // --- Admin Mission Control Streaming ---
    const adminNamespace = io.of('/admin-stream');

    adminNamespace.on('connection', (socket) => {
        console.log('[Socket] Admin connected to Mission Control:', socket.id);

        // In a production environment, we would verify the admin token here
        // For this version, we assume the frontend only connects if authorized

        socket.on('disconnect', () => {
            console.log('[Socket] Admin disconnected from Mission Control');
        });
    });

    // Global broadcast helper
    (global as any).broadcastAdminEvent = (event: string, data: any) => {
        adminNamespace.emit(event, {
            ...data,
            timestamp: Date.now()
        });
    };

    // Initialize real-time student tracking namespace
    initializeStudentTracking(io);

    return io;
};
