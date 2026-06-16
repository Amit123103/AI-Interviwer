import { Router, Request, Response } from 'express';
import { protect } from '../middleware/authMiddleware';
import Tesseract from 'tesseract.js';
import { generateResponse } from '../services/aiService';

const router = Router();

// POST /api/notes/recognize
// Expects { image: 'data:image/png;base64,...', useGrammarCorrection: boolean }
router.post('/recognize', protect, async (req: Request, res: Response): Promise<void> => {
    try {
        const { image, useGrammarCorrection = false, language = 'eng' } = req.body;

        if (!image) {
            res.status(400).json({ success: false, error: 'Image data is required' });
            return;
        }

        // Remove the data URI schema prefix to just get the base64 string
        const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Step 1: Raw OCR via Tesseract.js
        const tesseractResult = await Tesseract.recognize(
            imageBuffer,
            language,
            { logger: m => console.log(m) } // Optional logger
        );

        let rawText = tesseractResult.data.text.trim();
        let confidence = tesseractResult.data.confidence;

        // Step 2: Intelligent refinement via Ollama (if requested or if confidence is low)
        let finalOutput = rawText;
        let alternatives: string[] = [];

        if (rawText && (useGrammarCorrection || confidence < 80)) {
            try {
                const prompt = `
                You are an advanced handwriting interpretation AI.
                The following text was extracted via OCR from messy hand gestures written in the air:
                "${rawText}"

                Your task is to:
                1. Infer what the word(s) were supposed to be. Fix any glaring typos or weird characters caused by the OCR.
                2. Output ONLY the properly corrected, clean text. Do NOT add any conversational filler, quotes, or explanations.
                3. If the input is completely unreadable gibberish, return it as is or return your best single guess.
                
                ${useGrammarCorrection ? "Apply proper grammar and capitalization to the phrase if needed." : "Only correct the spelling of isolated words."}
                `;

                // Use the configured Ollama model for the AI service
                const aiResponse = await generateResponse(prompt);

                if (aiResponse && aiResponse.response) {
                    finalOutput = aiResponse.response.trim();
                    // Just as an example, if OCR and AI differ, provide the OCR as an alternative
                    if (finalOutput.toLowerCase() !== rawText.toLowerCase()) {
                        alternatives.push(rawText);
                    }
                }
            } catch (aiError) {
                console.warn('AI Refinement failed, falling back to raw OCR', aiError);
            }
        }

        res.status(200).json({
            success: true,
            data: {
                text: finalOutput,
                rawText: rawText,
                confidence: confidence,
                alternatives: alternatives
            }
        });

    } catch (error: any) {
        console.error('OCR Recognition Error:', error);
        res.status(500).json({ success: false, error: 'Failed to recognize handwritten text.' });
    }
});

export default router;
