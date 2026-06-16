import { Request, Response } from 'express';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import { logStudentActivity } from '../services/activityService';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const analyzeResume = async (req: any, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path));

        console.log(`Forwarding resume to AI Service: ${AI_SERVICE_URL}/resume/parse`);

        // Send file to AI Service for parsing and analysis
        const aiResponse = await axios.post(`${AI_SERVICE_URL}/resume/parse`, formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        const analysis = aiResponse.data;

        // Log Activity
        await logStudentActivity(
            req.user.id,
            'RESUME_ANALYSIS',
            'Analyzed Professional Resume',
            `Extracted level: ${analysis.experience_level || 'General'}`,
            { 
                experienceLevel: analysis.experience_level, 
                skillsFound: (analysis.skills || []).length 
            }
        ).catch(e => console.error("Activity Log error:", e));

        res.json({
            analysis
        });

    } catch (error: any) {
        console.error('Resume Analysis Error:', error.message);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Error analyzing resume', error: error.message });
    }
};
