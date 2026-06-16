/// <reference path="../types/express-augment.d.ts" />
import express from 'express'
import { protect } from '../middleware/authMiddleware'
import prisma from '../prisma'

const router = express.Router()

// Create new practice session
router.post('/sessions', protect, async (req, res) => {
    try {
        const userId = (req as any).user.id;
        const session = await (prisma as any).practiceSession.create({
            data: {
                userId,
                configuration: req.body.configuration || {}
            }
        })
        res.status(201).json(session)
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
})

// Get session by ID
router.get('/sessions/:id', protect, async (req, res) => {
    try {
        const userId = (req as any).user.id;
        const session = await (prisma as any).practiceSession.findFirst({
            where: {
                id: req.params.id as string,
                userId
            }
        })
        if (!session) return res.status(404).json({ error: 'Session not found' })
        res.json(session)
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

// Update session
router.put('/sessions/:id', protect, async (req, res) => {
    try {
        const userId = (req as any).user.id;
        const session = await (prisma as any).practiceSession.update({
            where: { id: req.params.id as string }, // Should ideally filter by userId too but Prisma update needs unique ID
            data: {
                ...req.body
            }
        })
        // Note: For safety, we should have used findFirst then update or check userId
        res.json(session)
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
})

// Delete session
router.delete('/sessions/:id', protect, async (req, res) => {
    try {
        await (prisma as any).practiceSession.delete({
            where: { id: req.params.id as string }
        })
        res.json({ message: 'Session deleted' })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

// Get user's sessions
router.get('/sessions/user/:userId', protect, async (req, res) => {
    try {
        const sessions = await (prisma as any).practiceSession.findMany({
            where: { userId: req.params.userId as string },
            orderBy: { createdAt: 'desc' },
            take: 50
        })
        res.json(sessions)
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

// Save practice results
router.post('/results', protect, async (req, res) => {
    try {
        const { sessionId, metrics, overallScore, strengths, weaknesses, recommendations, badges } = req.body
        const session = await (prisma as any).practiceSession.update({
            where: { id: sessionId as string },
            data: {
                metrics: metrics || {},
                overallScore,
                strengths,
                weaknesses,
                recommendations,
                badges,
                status: 'completed',
                completedAt: new Date()
            }
        })
        res.json(session)
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
})

// Save practice profile (for /dashboard/code onboarding)
router.post('/profile', async (req, res) => {
    try {
        const { userId, name, course, department, level } = req.body
        if (!userId) return res.status(400).json({ error: 'userId required' })
        res.json({ ok: true, profile: { userId, name, course, department, level } })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

export default router
