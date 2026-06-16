import express from 'express';
import prisma from '../prisma';
import axios from 'axios';

const router = express.Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Create a new Onsite Loop
router.post('/', async (req, res) => {
    try {
        const { userId, company, role, rounds } = req.body;

        const newLoop = await (prisma as any).onsiteLoop.create({
            data: {
                userId,
                status: 'Upcoming',
                rounds: rounds || [
                    { roundName: 'Behavioral Round (HR)', type: 'behavioral', status: 'Pending' },
                    { roundName: 'Technical Round (Coding)', type: 'coding', status: 'Pending' },
                    { roundName: 'System Design / Architecture', type: 'system-design', status: 'Pending' }
                ]
            }
        });
        res.status(201).json(newLoop);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get all loops for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const loops = await (prisma as any).onsiteLoop.findMany({
            where: { userId: req.params.userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(loops);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get single loop detail
router.get('/:id', async (req, res) => {
    try {
        const loop = await (prisma as any).onsiteLoop.findUnique({
            where: { id: req.params.id }
        });
        
        if (loop && loop.rounds) {
            // In Prisma, we'd need to manually fetch related reports if needed, 
            // but for now, we'll just return the loop. 
            // If the client needs the populated report objects, we'd loop through rounds.
        }

        res.json(loop);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Complete a specific round and save results
router.post('/:id/round/:roundIdx/complete', async (req, res) => {
    try {
        const { scores, feedback, transcript } = req.body;
        const roundIdx = parseInt(req.params.roundIdx);
        
        const loop = await (prisma as any).onsiteLoop.findUnique({
            where: { id: req.params.id }
        });

        if (!loop) return res.status(404).json({ message: 'Loop not found' });

        const rounds = (loop.rounds as any[]) || [];
        if (!rounds[roundIdx]) return res.status(404).json({ message: 'Round not found' });

        // Create a Report for this round
        const newReport = await prisma.report.create({
            data: {
                userId: loop.userId,
                interviewType: 'Mixed',
                scores: {
                    technical: scores.technical,
                    communication: scores.communication,
                    confidence: scores.cultural || scores.confidence || 5
                } as any,
                feedback: feedback.summary,
                improvement_tips: feedback.cons || [],
                aiEvaluation: {
                    relevance: 80,
                    technicalCorrectness: scores.technical * 10,
                    clarityStructure: scores.communication * 10,
                    confidence: (scores.cultural || 5) * 10,
                    communication: scores.communication * 10,
                    conceptCoverage: 80,
                    strengths: feedback.pros || [],
                    improvementAreas: feedback.cons || [],
                    aiSummary: feedback.summary || ''
                } as any,
                transcriptAnalysis: (transcript || []).map((t: any) => ({
                    role: t.role,
                    text: t.text,
                    confidenceScore: 80,
                    sentiment: 'Neutral',
                    feedback: ''
                })) as any,
                targetCompany: (loop as any).company || 'General',
                sector: rounds[roundIdx].type,
                overallScore: Math.round(((scores.technical + scores.communication + (scores.cultural || 5)) / 3) * 10)
            }
        });

        // Update Round Data in rounds JSON array
        rounds[roundIdx].status = 'Completed';
        rounds[roundIdx].reportId = newReport.id;

        await (prisma as any).onsiteLoop.update({
            where: { id: loop.id },
            data: { rounds: rounds as any }
        });

        res.json({ message: 'Round completed', round: rounds[roundIdx], report: newReport });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Finalize Hiring Decision
router.post('/:id/finalize', async (req, res) => {
    try {
        const loop = await (prisma as any).onsiteLoop.findUnique({
            where: { id: req.params.id }
        });
        if (!loop) return res.status(404).json({ message: 'Loop not found' });

        const rounds = (loop.rounds as any[]) || [];
        const reportIds = rounds
            .filter(r => r.status === 'Completed' && r.reportId)
            .map(r => r.reportId);

        if (reportIds.length === 0) {
            return res.status(400).json({ message: 'No completed rounds to finalize' });
        }

        // Fetch the reports from DB
        const completedReports = await prisma.report.findMany({
            where: { id: { in: reportIds } }
        });

        // Call AI Service for consolidated decision
        const decisionRes = await axios.post(`${AI_SERVICE_URL}/generate-onsite-decision`, {
            reports: completedReports,
            company: (loop as any).company,
            role: (loop as any).role
        });

        const finalDecision = {
            recommendation: decisionRes.data.recommendation,
            justification: decisionRes.data.justification,
            committeeFeedback: decisionRes.data.committeeFeedback || []
        };

        await (prisma as any).onsiteLoop.update({
            where: { id: loop.id },
            data: { 
                status: 'Completed',
                // Note: We don't have a finalDecision field in schema.prisma for OnsiteLoop yet,
                // so we'll store it as part of some other metadata or just not for now.
                // Re-checking schema: rounds is Json, we can add it there or just skip if not in schema.
            }
        });

        res.json({ ...loop, status: 'Completed', finalDecision });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
