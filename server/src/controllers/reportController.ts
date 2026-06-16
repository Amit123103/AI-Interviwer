import { Request, Response } from 'express';
import prisma from '../prisma';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

import { updateUserProgress } from '../services/gamificationService';
import { sendReportEmail } from '../services/emailService';

export const createReport = async (req: Request, res: Response) => {
    try {
        const { userId, sector, persona, finalCode, targetCompany, jobDescription } = req.body;

        const transcript = JSON.parse(req.body.transcript || '[]');
        const focusLogs = JSON.parse(req.body.focusLogs || '[]');
        const eventLogs = JSON.parse(req.body.eventLogs || '[]');

        const videoFile = req.file;
        const videoUrl = videoFile ? `/uploads/interviews/${videoFile.filename}` : "";

        const studentProfile = await prisma.profile.findUnique({ where: { userId } });

        const aiResponse = await axios.post(`${AI_SERVICE_URL}/interview/generate-report`, {
            transcript,
            focus_logs: focusLogs,
            student_profile: studentProfile,
            sector: sector || 'General',
            persona: persona || 'Friendly Mentor',
            final_code: finalCode,
            target_company: targetCompany || '',
            job_description: jobDescription || ''
        });

        const reportData = aiResponse.data;

        let deepAnalysis = null;
        try {
            const deepRes = await axios.post(`${AI_SERVICE_URL}/interview/deep-scan`, {
                transcript,
                event_logs: eventLogs,
                student_profile: studentProfile,
                sector: sector || 'General',
                target_company: targetCompany || '',
                job_description: jobDescription || ''
            });
            deepAnalysis = deepRes.data;
        } catch (deepErr) {
            console.error("Deep Scan failed:", deepErr);
        }

        const report = await prisma.report.create({
            data: {
                userId,
                overallScore: reportData.overall_score || 0,
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
                confidenceScore: reportData.confidence_score || 0,
                wpm: reportData.wpm || 0,
                fillerWords: reportData.filler_words || {} as any,
                sector: sector || 'General',
                sectorMatchScore: reportData.sector_match_score || 0,
                persona: persona || 'Friendly Mentor',
                targetCompany: targetCompany || '',
                jobDescription: jobDescription || '',
                skillMatrix: reportData.skill_matrix || {} as any,
                transcriptAnalysis: reportData.transcript_analysis || [] as any,
                feedback: reportData.executive_summary || "Good effort!",
                improvement_tips: reportData.improvement_areas || [],
                finalCode: finalCode,
                codeAnalysis: reportData.code_analysis || "",
                videoUrl,
                eventLogs: eventLogs.map((e: any) => ({
                    eventType: e.type,
                    timestamp: e.timestamp,
                    metadata: e.metadata
                })) as any,
                deepAnalysis: deepAnalysis as any,
                integrityScore: reportData.integrity_score || 100,
                professionalismScore: reportData.professionalism_score || 10
            }
        });

        const technicalScore = reportData.metrics?.technical_correctness || 0;
        const communicationScore = reportData.metrics?.communication || 0;
        const focusScore = reportData.metrics?.focus || 0;

        const averageScore = Math.round((technicalScore + communicationScore + focusScore) / 3 * 10);
        const xpGained = 100 + averageScore;

        await updateUserProgress(userId, xpGained, {
            type: 'INTERVIEW_COMPLETE',
            interviews: 1,
            newScore: averageScore,
            integrityScore: reportData.integrity_score || 100
        });

        try {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user && user.email) {
                await sendReportEmail(user.email, reportData, (report as any).scores);
            }
        } catch (emailErr) {
            console.error("Failed to send email report:", emailErr);
        }

        const responseReport = { ...report, _id: report.id };
        res.status(201).json(responseReport);
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getReportsByUser = async (req: Request, res: Response) => {
    try {
        const reports = await prisma.report.findMany({
            where: { userId: req.params.userId as string },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reports.map(r => ({ ...r, _id: r.id })));
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getReportById = async (req: Request, res: Response) => {
    try {
        const report = await prisma.report.findUnique({
            where: { id: req.params.id as string }
        });
        if (report) {
            res.json({ ...report, _id: report.id });
        } else {
            res.status(404).json({ message: 'Report not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getStats = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const reports = await prisma.report.findMany({
            where: { userId: userId as string },
            orderBy: { createdAt: 'asc' }
        });

        if (!reports.length) {
            return res.json({
                totalInterviews: 0,
                averageScore: 0,
                progressData: [],
                recentFeedback: []
            });
        }

        const totalInterviews = reports.length;

        const totalTechnical = reports.reduce((acc, r) => acc + ( (r.scores as any)?.technical || 0), 0);
        const totalCommunication = reports.reduce((acc, r) => acc + ((r.scores as any)?.communication || 0), 0);
        const totalConfidence = reports.reduce((acc, r) => acc + (r.confidenceScore || 0), 0);

        const averageScore = Math.round((totalTechnical + totalCommunication + totalConfidence) / (totalInterviews * 3));

        const progressData = reports.map(r => ({
            date: new Date(r.createdAt).toLocaleDateString(),
            technical: (r.scores as any)?.technical || 0,
            communication: (r.scores as any)?.communication || 0,
            confidence: r.confidenceScore || 0
        }));

        const recentFeedback = [...new Set(
            reports.slice(-3).flatMap(r => r.improvement_tips || [])
        )].slice(0, 5);

        res.json({
            totalInterviews,
            averageScore,
            progressData,
            recentFeedback
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAllReports = async (req: Request, res: Response) => {
    try {
        const reports = await prisma.report.findMany({
            include: {
                user: {
                    select: {
                        username: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reports);
    } catch (error) {
        console.error("Error fetching all reports:", error);
        res.status(500).json({ message: 'Server error fetching reports' });
    }
};

export const analyzeResume = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('file', fs.createReadStream(path.join(process.cwd(), req.file.path)));

        const aiResponse = await axios.post(`${AI_SERVICE_URL}/resume/analyze`, formData, {
            headers: {
                ...formData.getHeaders()
            },
            timeout: 90000 
        });

        fs.unlinkSync(req.file.path);

        res.json(aiResponse.data);
    } catch (error) {
        console.error("Error analyzing resume:", error);
        res.status(500).json({ message: 'Server error analyzing resume' });
    }
};

export const analyzeFrame = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No frame uploaded' });
        }

        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('file', fs.createReadStream(path.join(process.cwd(), req.file.path)));

        const aiResponse = await axios.post(`${AI_SERVICE_URL}/reports/analyze-frame`, formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        fs.unlinkSync(req.file.path);

        res.json(aiResponse.data);
    } catch (error) {
        console.error("Error analyzing frame:", error);
        res.status(500).json({ message: 'Server error analyzing frame' });
    }
};

