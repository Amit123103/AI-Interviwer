import { Request, Response } from 'express';
import prisma from '../prisma';

export const submitPeerReview = async (req: Request, res: Response) => {
    try {
        const { reportId, score, comments } = req.body;
        const reviewerId = (req as any).user.id;

        const report = await prisma.report.findUnique({ where: { id: reportId } });
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        const updatedReport = await prisma.report.update({
            where: { id: reportId },
            data: {
                peerFeedback: {
                    score,
                    comments,
                    reviewerId
                } as any
            }
        });

        res.status(200).json({ message: 'Peer review submitted successfully', report: updatedReport });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const addMentorComment = async (req: Request, res: Response) => {
    try {
        const { reportId, text } = req.body;
        const mentorId = (req as any).user.id;

        const report = await prisma.report.findUnique({ where: { id: reportId } });
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        const mentorComments = (report.mentorComments as any[]) || [];
        mentorComments.push({
            text,
            mentorId,
            timestamp: new Date()
        });

        const updatedReport = await prisma.report.update({
            where: { id: reportId },
            data: {
                mentorComments: mentorComments as any
            }
        });

        res.status(200).json({ message: 'Mentor comment added successfully', report: updatedReport });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
