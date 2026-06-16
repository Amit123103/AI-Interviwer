import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');
import { analyzeResume } from '../controllers/resumeController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const Tesseract = require('tesseract.js');

// Multer setup
const storage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
        cb(null, 'uploads/');
    },
    filename: (req: any, file: any, cb: any) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
    fileFilter: (req: any, file: any, cb: any) => {
        const allowedMimes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, and DOCX files are allowed') as any, false);
        }
    }
});

/**
 * Validates file magic bytes after upload.
 * PDF starts with %PDF, DOCX/DOC starts with PK (ZIP) or 0xD0CF (OLE2).
 */
function validateMagicBytes(filePath: string, mimetype: string): boolean {
    try {
        const fd = fs.openSync(filePath, 'r');
        const buf = Buffer.alloc(4);
        fs.readSync(fd, buf, 0, 4, 0);
        fs.closeSync(fd);

        if (mimetype === 'application/pdf') {
            return buf.toString('ascii', 0, 4) === '%PDF';
        }
        // DOCX is a ZIP file (PK\x03\x04), DOC is OLE2 (0xD0CF11E0)
        const isPK = buf[0] === 0x50 && buf[1] === 0x4B;
        const isOLE = buf[0] === 0xD0 && buf[1] === 0xCF;
        return isPK || isOLE;
    } catch {
        return false;
    }
}

// Create uploads dir if not exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// /analyze — requires auth, returns full AI analysis (existing route)
router.post('/analyze', protect, upload.single('resume'), analyzeResume);

// /parse — no auth required (used during interview setup), extracts text + basic insights from resume
router.post('/parse', upload.single('resume'), async (req: any, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Magic-bytes validation
        if (!validateMagicBytes(req.file.path, req.file.mimetype)) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'File content does not match its declared type. Upload rejected.' });
        }

        // Retry logic for AI service
        let aiResponse;
        let attempts = 0;
        const maxAttempts = 2;
        const AI_TIMEOUT = 120000; // 120 seconds (enough for deep 397B model analysis, reduces premature fallbacks)

        while (attempts < maxAttempts) {
            try {
                attempts++;
                console.log(`Forwarding resume to AI service (Attempt ${attempts}): ${AI_SERVICE_URL}/resume/parse`);

                // Fresh stream for retry
                const fdRetry = new FormData();
                fdRetry.append('file', fs.createReadStream(req.file.path), {
                    filename: req.file.originalname,
                    contentType: req.file.mimetype,
                });

                aiResponse = await axios.post(
                    `${AI_SERVICE_URL}/resume/parse`,
                    fdRetry,
                    { headers: fdRetry.getHeaders(), timeout: AI_TIMEOUT, validateStatus: () => true }
                );

                if (aiResponse.status === 200 && !aiResponse.data.error) {
                    break;
                }

                console.warn(`Attempt ${attempts} failed with status ${aiResponse.status}`);
            } catch (err: any) {
                console.error(`AI service attempt ${attempts} error:`, err.message);
                if (attempts === maxAttempts) break;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // If AI service failed, use local fallback
        if (!aiResponse || aiResponse.status !== 200 || aiResponse.data.error) {
            console.log('AI service failed or timed out, using local fallback...');

            const filePath = req.file.path;
            let extractedText = '';

            try {
                if (req.file.mimetype === 'application/pdf') {
                    console.log('Using local fallback with pdf-parse...');
                    const fileBuffer = fs.readFileSync(filePath);
                    let pdfData;

                    if (typeof pdfParse === 'function') {
                        pdfData = await pdfParse(fileBuffer);
                    } else {
                        const PDFParseClass = pdfParse.PDFParse || pdfParse.default || pdfParse;
                        if (typeof PDFParseClass === 'function') {
                            const parser = new PDFParseClass({ data: fileBuffer });
                            pdfData = await parser.getText();
                        }
                    }
                    extractedText = pdfData?.text || '';
                } else if (req.file.mimetype.includes('word')) {
                    // For docx/doc we'd ideally use mammoth, but sticking to basic for now
                    extractedText = fs.readFileSync(filePath, 'utf-8');
                }

                // OCR FALLBACK: If text is too short, try Tesseract
                if (extractedText.length < 150 && (req.file.mimetype === 'application/pdf' || req.file.mimetype.includes('image'))) {
                    console.log('Text extraction poor, attempting OCR with Tesseract...');
                    try {
                        const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
                        if (text && text.length > extractedText.length) {
                            extractedText = text;
                            console.log('OCR extracted text length:', extractedText.length);
                        }
                    } catch (ocrErr: any) {
                        console.error('OCR Error:', ocrErr.message);
                    }
                }
            } catch (localErr: any) {
                console.error('Local fallback extraction error:', localErr.message);
            }

            if (!extractedText || extractedText.length < 50) {
                throw new Error('Could not extract sufficient text from resume');
            }


            // Final basic regex fallback if Ollama fails too
            const skillPatterns = /\b(python|javascript|typescript|java|react|node\.?js|angular|vue|go|rust|c\+\+|c#|aws|docker|kubernetes|sql|mongodb|git|linux|html|css)\b/gi;
            const foundSkills = [...new Set((extractedText.match(skillPatterns) || []).map((s: string) => s.toLowerCase()))];

            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

            return res.json({
                text: extractedText.substring(0, 3000),
                rawText: extractedText.substring(0, 3000),
                skills: foundSkills,
                summary: 'Parsed using local fallback (Regex approach).',
                experienceLevel: extractedText.toLowerCase().includes('senior') ? 'Senior' : 'Mid-level'
            });
        }

        // AI Service Success Path
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        const data = aiResponse.data;
        return res.json({
            ...data,
            rawText: data.summary || data.text || '',
            text: data.summary || data.text || '',
        });

    } catch (error: any) {
        console.error('Resume Parse Error:', error.message);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ message: 'Error parsing resume', error: error.message });
    }
});

// /analyze-deep — bridge to Python AI service's deep analysis (with graceful fallback)
router.post('/analyze-deep', upload.single('file'), async (req: any, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Magic-bytes validation
        if (!validateMagicBytes(req.file.path, req.file.mimetype)) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'File content does not match its declared type. Upload rejected.' });
        }

        // --- Attempt AI service first ---
        try {
            const fd = new FormData();
            fd.append('file', fs.createReadStream(req.file.path), {
                filename: req.file.originalname,
                contentType: req.file.mimetype,
            });

            // Forward extra fields if present
            if (req.body.job_role) fd.append('job_role', req.body.job_role);
            if (req.body.target_company) fd.append('target_company', req.body.target_company);

            const aiResponse = await axios.post(
                `${AI_SERVICE_URL}/analyze-resume-deep`,
                fd,
                { headers: fd.getHeaders(), timeout: 90000, validateStatus: () => true }
            );

            // Clean up the temp file
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

            if (aiResponse.status === 200 && aiResponse.data && !aiResponse.data.error) {
                return res.json(aiResponse.data);
            }

            // AI returned an error body — fall through to local fallback
            console.warn('AI service analyze-deep returned error:', aiResponse.status, aiResponse.data?.error);
            throw new Error(aiResponse.data?.error || `AI service status ${aiResponse.status}`);

        } catch (aiError: any) {
            console.warn('AI service analyze-deep failed, using local fallback:', aiError.message);

            // --- LOCAL FALLBACK: Extract basic info from the PDF ---
            let extractedText = '';
            try {
                if (req.file.mimetype === 'application/pdf') {
                    const fileBuffer = fs.readFileSync(req.file.path);
                    let parseFunc = typeof pdfParse === 'function' ? pdfParse : (pdfParse.pdfParse || pdfParse.default || (typeof pdfParse.PDFParse === 'function' ? pdfParse.PDFParse : null) || pdfParse);
                    if (typeof parseFunc === 'function') {
                        let pdfData;
                        try {
                            pdfData = await parseFunc(fileBuffer);
                        } catch (err: any) {
                            if (err.message.includes("Class constructors cannot be invoked without 'new'")) {
                                pdfData = await (new (parseFunc as any)(fileBuffer));
                            } else {
                                throw err;
                            }
                        }
                        extractedText = pdfData?.text || '';
                    }
                }
            } catch (parseErr: any) {
                console.error('Local PDF parse error in analyze-deep fallback:', parseErr.message);
            }

            // Clean up the temp file
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

            // Extract skills with regex
            const skillPatterns = /\b(python|javascript|typescript|java|react|node\.?js|angular|vue|go|rust|c\+\+|c#|aws|docker|kubernetes|sql|mongodb|git|linux|html|css|express|django|flask|spring|graphql|redis|postgresql|mysql|machine\s*learning|deep\s*learning|tensorflow|pytorch|nlp|computer\s*vision)\b/gi;
            const foundSkills = [...new Set((extractedText.match(skillPatterns) || []).map((s: string) => s.toLowerCase()))];

            const experienceLevel = extractedText.toLowerCase().includes('senior') ? 'Senior'
                : extractedText.toLowerCase().includes('intern') ? 'Intern'
                    : extractedText.toLowerCase().includes('lead') ? 'Senior'
                        : 'Mid-level';

            return res.json({
                filename: req.file.originalname,
                analysis: {
                    technical_pillars: foundSkills.slice(0, 3).length > 0 ? foundSkills.slice(0, 3) : ['General Software Engineering'],
                    key_skills: foundSkills.length > 0 ? foundSkills.slice(0, 8) : ['programming'],
                    projects: [],
                    experience_summary: `Resume analyzed locally (AI service unavailable). ${foundSkills.length} skills detected.`,
                    education: '',
                    strengths: foundSkills.slice(0, 3),
                    gaps: [],
                    level: experienceLevel,
                    question_focus_areas: foundSkills.slice(0, 5).length > 0 ? foundSkills.slice(0, 5) : ['Technical fundamentals'],
                    quick_skills: foundSkills,
                },
                raw_text_preview: extractedText.substring(0, 200) + (extractedText.length > 200 ? '...' : ''),
                _fallback: true, // Flag so client knows this is a fallback response
            });
        }

    } catch (error: any) {
        console.error('Resume Analyze-Deep Critical Error:', error.message);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        // Even on critical error, return 200 with minimal data so the setup flow continues
        return res.json({
            filename: req.file?.originalname || 'unknown',
            analysis: {
                technical_pillars: ['General Software Engineering'],
                key_skills: ['programming'],
                projects: [],
                experience_summary: '',
                education: '',
                strengths: [],
                gaps: [],
                level: 'Mid-level',
                question_focus_areas: ['Technical fundamentals'],
                quick_skills: [],
            },
            _fallback: true,
        });
    }
});


export default router;

