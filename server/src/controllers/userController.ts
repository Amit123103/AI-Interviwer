import { Request, Response } from 'express'
import prisma from '../prisma'

export const getAnnouncements = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user
        const now = new Date()
        
        let audienceValues: string[] = ['all', 'students']

        const announcements = await prisma.announcement.findMany({
            where: {
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gte: now } }
                ],
                audience: { in: audienceValues }
            },
            orderBy: { createdAt: 'desc' }
        })

        res.json(announcements)
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export const getResources = async (req: Request, res: Response) => {
    try {
        const resources = await prisma.resource.findMany({
            orderBy: { createdAt: 'desc' }
        })
        res.json(resources)
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export const getActivityTimeline = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id

        const [reports, submissions] = await Promise.all([
            prisma.report.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 5
            }),
            prisma.submission.findMany({
                where: { userId },
                include: { problem: true },
                orderBy: { createdAt: 'desc' },
                take: 5
            })
        ])

        const timeline: any[] = []

        reports.forEach((int: any) => {
            const scores = int.scores as any || {}
            timeline.push({
                id: int.id,
                type: 'interview',
                title: `Interview: ${int.sector}`,
                subtitle: `Scored ${Math.round(((scores.technical || 0) + (scores.communication || 0) + (scores.confidence || 0)) / 3)}%`,
                timestamp: int.createdAt,
                status: 'success'
            })
        })

        submissions.forEach((sub: any) => {
            timeline.push({
                id: sub.id,
                type: 'coding',
                title: sub.problem?.title || 'Coding Challenge',
                subtitle: `Result: ${sub.status}`,
                timestamp: sub.createdAt,
                status: sub.status === 'Accepted' ? 'success' : 'failed'
            })
        })

        timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

        res.json(timeline.slice(0, 10))
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}
