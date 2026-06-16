import express, { Request, Response } from 'express'
import axios from 'axios'
const router = express.Router()
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

router.post('/chat', async (req: Request, res: Response) => {
    try {
        const { messages, userId, apiKey } = req.body

        // Optional: fetch user CV/profile if needed to pass to AI
        let cvText = ""

        const aiRes = await axios.post(`${AI_SERVICE_URL}/mentor/chat`, {
            convo: messages,
            resume_text: cvText,
            api_key: apiKey
        }, { timeout: 35000 })

        res.json({ reply: aiRes.data.reply })
    } catch (error: any) {
        console.error('[/mentor/chat]', error)
        res.status(500).json({ error: 'Chat failed' })
    }
})

export default router
