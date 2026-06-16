/// <reference path="../types/express-augment.d.ts" />
import express, { Request, Response } from 'express'
import { protect } from '../middleware/authMiddleware'
import prisma from '../prisma'

const router = express.Router()

// Get all questions with filters
router.get('/', protect, async (req: Request, res: Response) => {
    try {
        const { role, difficulty, type, search, page = '1', limit = '20' } = req.query

        const where: any = {}
        if (role) where.role = { has: role as string }
        if (difficulty) where.difficulty = difficulty
        if (type) where.type = type
        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { explanation: { contains: search as string, mode: 'insensitive' } }
            ]
        }

        const pageNum = parseInt(page as string)
        const limitNum = parseInt(limit as string)

        const [questions, total] = await Promise.all([
            prisma.question.findMany({
                where,
                skip: (pageNum - 1) * limitNum,
                take: limitNum,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.question.count({ where })
        ])

        res.json({
            questions,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum)
        })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

// Get question by ID
router.get('/:id', protect, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const questionId = req.params.id as string;

        const question = await prisma.question.findUnique({
            where: { id: questionId }
        });
        if (!question) return res.status(404).json({ error: 'Question not found' })

        // Get user progress for this question
        const progress = await prisma.userQuestionProgress.findUnique({
            where: {
                userId_questionId: {
                    userId,
                    questionId: questionId as string
                }
            }
        });

        res.json({ question, progress })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

// Record practice
router.post('/practice', protect, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { questionId, score, duration, feedback } = req.body

        const existingProgress = await prisma.userQuestionProgress.findUnique({
            where: { userId_questionId: { userId, questionId } }
        });

        const now = new Date();
        const practiceHistory = (existingProgress?.practiceHistory as any[]) || [];
        practiceHistory.push({ date: now, score, duration, feedback });

        let progress;
        if (!existingProgress) {
            progress = await prisma.userQuestionProgress.create({
                data: {
                    userId,
                    questionId,
                    practiced: true,
                    attempts: 1,
                    averageScore: score,
                    bestScore: score,
                    lastPracticed: now,
                    practiceHistory: practiceHistory as any
                }
            });
        } else {
            const newAttempts = existingProgress.attempts + 1;
            const newAvgScore = ((existingProgress.averageScore || 0) * existingProgress.attempts + score) / newAttempts;
            const newBestScore = Math.max(existingProgress.bestScore || 0, score);
            const isMastered = (newAttempts >= 3 && newAvgScore >= 85) ? true : existingProgress.mastered;

            progress = await prisma.userQuestionProgress.update({
                where: { id: existingProgress.id },
                data: {
                    practiced: true,
                    attempts: newAttempts,
                    lastPracticed: now,
                    averageScore: newAvgScore,
                    bestScore: newBestScore,
                    practiceHistory: practiceHistory as any,
                    mastered: isMastered
                }
            });
        }

        res.json(progress)
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
})

// Get user progress
router.get('/user/progress', protect, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const progress = await prisma.userQuestionProgress.findMany({
            where: { userId },
            include: {
                question: {
                    select: { title: true, type: true, difficulty: true }
                }
            }
        })
        res.json(progress)
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

// Toggle bookmark
router.post('/bookmark', protect, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { questionId } = req.body

        const existing = await prisma.userQuestionProgress.findUnique({
            where: { userId_questionId: { userId, questionId } }
        });

        let progress;
        if (!existing) {
            progress = await prisma.userQuestionProgress.create({
                data: {
                    userId,
                    questionId,
                    bookmarked: true
                }
            });
        } else {
            progress = await prisma.userQuestionProgress.update({
                where: { id: existing.id },
                data: { bookmarked: !existing.bookmarked }
            });
        }

        res.json(progress)
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
})

// Get user's custom lists
router.get('/lists', protect, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const lists = await prisma.customQuestionList.findMany({
            where: { userId },
            include: {
                questions: {
                    select: { title: true, type: true, difficulty: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        res.json(lists)
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

// Create custom list
router.post('/lists', protect, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { name, description, questions } = req.body;

        const list = await prisma.customQuestionList.create({
            data: {
                userId,
                name,
                description,
                questions: {
                    connect: (questions || []).map((id: string) => ({ id }))
                }
            }
        })
        res.status(201).json(list)
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
})

// Update custom list
router.put('/lists/:id', protect, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { name, description, questions } = req.body;

        const list = await (prisma.customQuestionList as any).update({
            where: { id: req.params.id as string }, // Ideally check userId too
            data: {
                name,
                description,
                questions: questions ? {
                    set: (questions || []).map((id: string) => ({ id }))
                } : undefined
            },
            include: {
                questions: {
                    select: { title: true, type: true, difficulty: true }
                }
            }
        });

        res.json(list)
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
})

// Delete custom list
router.delete('/lists/:id', protect, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        // In Prisma we'd usually check permissions first
        await (prisma.customQuestionList as any).delete({
            where: { id: req.params.id as string }
        })
        res.json({ message: 'List deleted' })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

export default router

