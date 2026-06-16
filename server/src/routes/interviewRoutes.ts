
import express, { Request, Response } from 'express'
import * as interviewController from '../controllers/interviewController'
import { buildRAGContext, generateInterviewQuestions, evaluateInterview, RAGContext } from '../services/aiService'

const router = express.Router()

// ─── Existing Routes ─────────────────────────────────────────────────────────
router.post('/initiate', interviewController.initiateInterview)
router.post('/start', interviewController.startInterview)
router.post('/submit', interviewController.submitInterview)
router.get('/:id', interviewController.getSession)

// ─── NEW: RAG Context Builder ────────────────────────────────────────────────
/**
 * POST /api/interview/build-context
 * Accepts profile + CV text + JD → returns structured RAG context + generated questions
 */
router.post('/build-context', async (req: Request, res: Response) => {
    try {
        const {
            studentName, course, department, dreamCompany, jobRole,
            interviewType = 'Mixed', difficulty = 'Medium',
            persona = 'Friendly Mentor', cvText = '', jobDescription = '',
            questionCount = 10
        } = req.body

        if (!studentName) {
            return res.status(400).json({ error: 'studentName is required' })
        }

        // Build RAG context
        const context = await buildRAGContext({
            studentName, course: course || '', department: department || '',
            dreamCompany: dreamCompany || 'General', jobRole: jobRole || 'Software Engineer',
            interviewType: interviewType as 'Technical' | 'HR & Behavioral' | 'Mixed',
            difficulty, persona, cvText, jobDescription
        })

        // Generate questions using Ollama (or fallback)
        const questions = await generateInterviewQuestions(context, parseInt(questionCount) || 10)

        res.json({
            context,
            questions,
            cvInsights: context.cvInsights,
            companyStyle: context.companyStyle,
            focusAreas: context.companyFocusAreas
        })
    } catch (error: any) {
        console.error('[/build-context]', error)
        res.status(500).json({ error: error.message || 'Context build failed' })
    }
})

// ─── NEW: AI Evaluation ──────────────────────────────────────────────────────
/**
 * POST /api/interview/evaluate
 * Accepts transcript + RAG context → returns weighted scores + readiness + feedback
 */
router.post('/evaluate', async (req: Request, res: Response) => {
    try {
        const { transcript, context } = req.body

        if (!transcript || !Array.isArray(transcript)) {
            return res.status(400).json({ error: 'transcript array is required' })
        }

        const ragContext: RAGContext = context || {
            studentName: 'Candidate',
            course: '', department: '',
            dreamCompany: 'General', jobRole: 'Software Engineer',
            interviewType: 'Mixed', difficulty: 'Medium',
            persona: 'Friendly Mentor',
            cvInsights: { skills: [], experienceLevel: 'Mid-level', hasProjects: false, hasCertifications: false, keyTopics: [] },
            companyStyle: 'balanced', companyFocusAreas: [],
            jdKeywords: [], contextSummary: ''
        }

        const evaluation = await evaluateInterview(transcript, ragContext)

        res.json({ evaluation })
    } catch (error: any) {
        console.error('[/evaluate]', error)
        res.status(500).json({ error: error.message || 'Evaluation failed' })
    }
})


// ─── Instant Interview Chat ──────────────────────────────────────────────────
router.post('/instant/chat', async (req: Request, res: Response) => {
    try {
        const { messages, cvText } = req.body
        const { generateInstantChatResponse } = await import('../services/aiService')

        const reply = await generateInstantChatResponse(messages || [], cvText || '')
        res.json({ reply })
    } catch (error: any) {
        console.error('[/instant/chat]', error)
        res.status(500).json({ error: 'Chat failed' })
    }
})

export default router
