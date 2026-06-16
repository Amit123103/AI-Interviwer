import axios from 'axios';
import { logStudentActivity } from '../services/activityService';

export const generateCurriculum = async (req: any, res: any): Promise<void> => {
    try {
        const { category, language, projectIdea, stack, skillLevel } = req.body;

        if (!category || !language || !projectIdea) {
             res.status(400).json({ success: false, message: 'Category, language, and projectIdea are required.' });
             return;
        }

        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
        const response = await axios.post(
            `${aiServiceUrl}/project-builder/generate`,
            { category, language, projectIdea, stack, skillLevel },
            { 
               headers: { 'Content-Type': 'application/json' },
               timeout: 90000 // Complex generation takes time
            }
        );

        // Log Activity
        await logStudentActivity(
            req.user.id,
            'PROJECT_BUILD',
            'Generated Project Curriculum',
            `Project Idea: ${projectIdea}`,
            { category, language, stack, skillLevel }
        ).catch(() => {});

        res.status(200).json({
            success: true,
            curriculum: response.data
        });
    } catch (error: any) {
        console.error('Error generating project curriculum:', error?.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to generate project curriculum',
            error: error?.response?.data || error.message
        });
    }
};

export const validateModuleCode = async (req: any, res: any): Promise<void> => {
    try {
        const { studentCode, solutionCode, language, moduleContext } = req.body;

        if (!studentCode || !solutionCode || !language) {
             res.status(400).json({ success: false, message: 'Missing required code parameters.' });
             return;
        }

        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
        const response = await axios.post(
            `${aiServiceUrl}/project-builder/validate-module`,
            { studentCode, solutionCode, language, moduleContext },
            { 
               headers: { 'Content-Type': 'application/json' },
               timeout: 30000
            }
        );

        // Log Activity if validation passed
        if (response.data.isValid) {
            await logStudentActivity(
                req.user.id,
                'PROJECT_BUILD',
                'Validated Project Module',
                `Language: ${language}`,
                { language, passed: true }
            ).catch(() => {});
        }

        res.status(200).json({
            success: true,
            validation: response.data
        });
    } catch (error: any) {
        console.error('Error validating module code:', error?.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to validate module code',
            error: error?.response?.data || error.message
        });
    }
};

export const generateModuleHint = async (req: any, res: any): Promise<void> => {
    try {
        const { studentCode, language, moduleContext, progressionLevel } = req.body;

        if (!language || !moduleContext || !progressionLevel) {
             res.status(400).json({ success: false, message: 'Missing required hint parameters.' });
             return;
        }

        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
        const response = await axios.post(
            `${aiServiceUrl}/project-builder/hint`,
            { studentCode, language, moduleContext, progressionLevel },
            { 
               headers: { 'Content-Type': 'application/json' },
               timeout: 20000
            }
        );

        res.status(200).json({
            success: true,
            hintData: response.data
        });
    } catch (error: any) {
        console.error('Error generating module hint:', error?.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to generate hint',
            error: error?.response?.data || error.message
        });
    }
};
