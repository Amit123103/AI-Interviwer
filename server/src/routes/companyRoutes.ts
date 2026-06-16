/// <reference path="../types/express-augment.d.ts" />
import express from 'express'
import { protect } from '../middleware/authMiddleware'
import prisma from '../prisma'

const router = express.Router()

// Get all companies
router.get('/', protect, async (req: any, res) => {
    try {
        const { category, search } = req.query

        const where: any = { isActive: true }
        if (category && category !== 'All') {
            where.category = category
        }
        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { overview: { contains: search as string, mode: 'insensitive' } }
            ]
        }

        const companies = await prisma.company.findMany({
            where,
            orderBy: { name: 'asc' }
        })
        res.json(companies)
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

// Get company by slug
router.get('/:slug', protect, async (req, res) => {
    try {
        const company = await prisma.company.findUnique({
            where: { slug: req.params.slug as string }
        })
        if (!company) return res.status(404).json({ error: 'Company not found' })
        res.json(company)
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

// Start mock interview
router.post('/mock', protect, async (req: any, res) => {
    try {
        const { companyId } = req.body
        const userId = req.user.id

        const mockInterview = await prisma.mockInterviewResult.create({
            data: {
                userId,
                companyId,
                rounds: []
            }
        })

        res.status(201).json(mockInterview)
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
})

// Update mock interview
router.put('/mock/:id', protect, async (req: any, res) => {
    try {
        const userId = req.user.id
        const mockInterview = await prisma.mockInterviewResult.update({
            where: { id: req.params.id as string },
            data: {
                ...req.body
                // Ensure userId matches if needed for safety
            }
        })
        res.json(mockInterview)
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
})

// Get user's mock results
router.get('/mock/results', protect, async (req: any, res) => {
    try {
        const userId = req.user.id
        const results = await prisma.mockInterviewResult.findMany({
            where: { userId },
            include: {
                company: {
                    select: { name: true, logo: true, category: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        })
        res.json(results)
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

export default router

