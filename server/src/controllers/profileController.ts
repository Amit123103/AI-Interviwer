import { Request, Response } from 'express';
import prisma from '../prisma';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const parseResumeWithAI = async (resumePath: string) => {
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(resumePath));
        const aiRes = await axios.post(`${AI_SERVICE_URL}/resume/parse`, formData, {
            headers: formData.getHeaders(),
            timeout: 15000 
        });

        if (aiRes.data && aiRes.data.parsed) {
            return {
                parsed: aiRes.data.parsed,
                text: aiRes.data.raw_text || ""
            };
        }
    } catch (err: any) {
        console.error("AI Resume Parsing Error:", err.message);
    }
    return null;
};

export const createOrUpdateProfile = async (req: any, res: Response) => {
    const { fullName, course, department, dreamCompany, bio } = req.body;
    const resumePath = req.file ? req.file.path : undefined;

    if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
        const userId = req.user.id || req.user._id;

        // Prepare data to update/create
        const profileFields: any = {};
        if (fullName) profileFields.fullName = fullName;
        if (course) profileFields.course = course;
        if (department) profileFields.department = department;
        if (dreamCompany) profileFields.dreamCompany = dreamCompany;
        if (bio) profileFields.bio = bio;
        if (resumePath) profileFields.resumePath = resumePath;

        // If a new resume is uploaded, parse it
        if (resumePath) {
            const aiData = await parseResumeWithAI(resumePath);
            if (aiData) {
                profileFields.resumeText = aiData.text;
                const { skills, projects, internships, tools, certifications, achievements } = aiData.parsed;
                if (skills) profileFields.skills = skills;
                if (projects) profileFields.projects = projects;
                if (internships) profileFields.internships = internships;
                if (tools) profileFields.tools = tools;
                if (certifications) profileFields.certifications = certifications;
                if (achievements) profileFields.achievements = achievements;
            }
        }

        const profile = await prisma.profile.upsert({
            where: { userId },
            update: profileFields,
            create: {
                ...profileFields,
                userId
            }
        });

        return res.json(profile);

    } catch (error: any) {
        console.error("Profile Controller Error:", error.message);
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};

export const getProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user.id || req.user._id;
        const profile = await prisma.profile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        email: true,
                        username: true
                    }
                }
            }
        });

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json(profile);
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

