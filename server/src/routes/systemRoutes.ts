import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

router.get('/status', async (req: Request, res: Response) => {
    let aiStatus = 'offline';
    let nvidiaStatus = (process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_KEY !== 'your_nvidia_api_key_here') ? 'configured' : 'missing_key';


    // Check AI Service
    try {
        const response = await axios.get(`${AI_SERVICE_URL}/`, { timeout: 3000 });
        if (response.status === 200) aiStatus = 'online';
    } catch (error) { }



    res.json({
        backend: 'online',
        ai_service: aiStatus,
        nvidia: nvidiaStatus,

        model: process.env.NVIDIA_MODEL || 'qwen/qwen3.5-397b-a17b',
        timestamp: new Date().toISOString(),
        config: {
            ai_service_timeout: "180s",
            retry_attempts: 2
        }
    });
});

export default router;
