import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

// Environment Configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || 'qwen/qwen3-coder-480b-a35b-instruct'
const NVIDIA_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'

// ─── Company Interview Patterns ──────────────────────────────────────────────
const COMPANY_PATTERNS: Record<string, { style: string; focusAreas: string[]; behavioralRatio: number }> = {
    Google: { style: 'structured problem-solving, emphasis on algorithms and scalability', focusAreas: ['algorithms', 'system design', 'distributed systems', 'leadership'], behavioralRatio: 0.25 },
    Amazon: { style: 'Leadership Principles-driven, STAR method expected', focusAreas: ['leadership principles', 'customer obsession', 'system design', 'data structures'], behavioralRatio: 0.5 },
    Microsoft: { style: 'culture fit emphasis, growth mindset, collaborative problem solving', focusAreas: ['coding', 'design patterns', 'teamwork', 'learning agility'], behavioralRatio: 0.35 },
    Meta: { style: 'fast-paced, product-oriented, cross-functional collaboration', focusAreas: ['coding', 'product sense', 'execution', 'systems'], behavioralRatio: 0.3 },
    Apple: { style: 'detail-oriented, quality focus, consumer empathy', focusAreas: ['design thinking', 'technical depth', 'craftsmanship', 'customer empathy'], behavioralRatio: 0.3 },
    General: { style: 'balanced technical and behavioral', focusAreas: ['core skills', 'communication', 'problem solving', 'teamwork'], behavioralRatio: 0.4 },
}

// ─── Skill Extraction Keywords ───────────────────────────────────────────────
const TECH_KEYWORDS: Record<string, string> = {
    python: 'Python', javascript: 'JavaScript', typescript: 'TypeScript',
    java: 'Java', react: 'React', node: 'Node.js', docker: 'Docker',
    kubernetes: 'Kubernetes', aws: 'AWS', gcp: 'GCP', azure: 'Azure'
}

export interface CVInsights {
    skills: string[]
    experienceLevel: string
    hasProjects: boolean
    hasCertifications: boolean
    keyTopics: string[]
}

export interface RAGContext {
    studentName: string
    course: string
    department: string
    dreamCompany: string
    jobRole: string
    interviewType: 'Technical' | 'HR & Behavioral' | 'Mixed'
    difficulty: string
    persona: string
    cvInsights: CVInsights
    companyStyle: string
    companyFocusAreas: string[]
    jdKeywords: string[]
    contextSummary: string
    apiKey?: string
}

/**
 * Helper to call NVIDIA NIM API directly from Node.js with dynamic key support
 */
async function callNVIDIA(messages: any[], isJson: boolean = false, overrideKey?: string): Promise<string> {
    const activeKey = overrideKey || NVIDIA_API_KEY
    if (!activeKey) {
        throw new Error('NVIDIA_API_KEY is missing')
    }

    // Auto-detect provider if key is overridden
    let activeUrl = NVIDIA_URL
    let activeModel = NVIDIA_MODEL

    if (overrideKey) {
        if (overrideKey.startsWith('sk-')) {
            activeUrl = 'https://api.openai.com/v1/chat/completions'
            activeModel = 'gpt-4o'
        } else if (overrideKey.startsWith('mistral-')) {
            activeUrl = 'https://api.mistral.ai/v1/chat/completions'
            activeModel = 'pixtral-large-latest'
        }
    }

    const payload = {
        model: activeModel,
        messages: messages,
        temperature: 0.2,
        max_tokens: 2048,
        top_p: 0.95,
        ...(activeModel.includes('qwen') ? { chat_template_kwargs: { enable_thinking: true } } : {})
    }

    const response = await axios.post(activeUrl, payload, {
        headers: {
            'Authorization': `Bearer ${activeKey}`,
            'Content-Type': 'application/json'
        },
        timeout: 90000 
    })

    return response.data.choices[0].message.content
}

// ─── CV Insights (Synchronous) ───────────────────────────────────────────────
export function extractCVInsights(cvText: string): CVInsights {
    const lower = cvText.toLowerCase()
    const skills = Object.entries(TECH_KEYWORDS)
        .filter(([key]) => lower.includes(key))
        .map(([, label]) => label)
        .slice(0, 15)

    return {
        skills,
        experienceLevel: lower.includes('senior') ? 'Senior' : 'Mid-level',
        hasProjects: lower.includes('project'),
        hasCertifications: lower.includes('certif'),
        keyTopics: skills.slice(0, 6)
    }
}

// ─── RAG Context Builder ─────────────────────────────────────────────────────
export async function buildRAGContext(params: any): Promise<RAGContext> {
    const cvInsights = extractCVInsights(params.cvText || '')

    // Attempt deep analysis from NVIDIA AI Service
    let deepAnalysis: any = null
    try {
        const aiRes = await axios.post(`${AI_SERVICE_URL}/resume/analyze`, {
            resume_text: params.cvText,
            job_role: params.jobRole,
            target_company: params.dreamCompany,
            api_key: params.apiKey
        }, { timeout: 30000 });
        deepAnalysis = aiRes.data
    } catch (err) {
        console.warn('[aiService] NVIDIA AI Service analysis failed, relying on Node extraction')
    }

    const companyKey = Object.keys(COMPANY_PATTERNS).find(k =>
        params.dreamCompany?.toLowerCase().includes(k.toLowerCase())
    ) || 'General'
    const company = COMPANY_PATTERNS[companyKey]

    const contextSummary = `
Candidate: ${params.studentName}
Role: ${params.jobRole}
Company: ${params.dreamCompany}
Skills: ${deepAnalysis?.key_skills?.join(', ') || cvInsights.skills.join(', ')}
`.trim()

    return {
        ...params,
        cvInsights,
        companyStyle: company.style,
        companyFocusAreas: company.focusAreas,
        contextSummary
    }
}

// ─── Question Generation ─────────────────────────────────────────────────────
export async function generateInterviewQuestions(context: RAGContext, count: number = 10): Promise<any[]> {
    try {
        // AI Service using NVIDIA
        const aiRes = await axios.post(`${AI_SERVICE_URL}/resume/generate-questions`, {
            resume_text: context.contextSummary,
            count,
            difficulty: context.difficulty,
            persona: context.persona,
            api_key: context.apiKey
        }, { timeout: 120000 });

        if (aiRes.data?.questions) return aiRes.data.questions;
    } catch (err: any) {
        console.warn(`[aiService] NVIDIA AI Service question gen failed. Falling back to direct call.`);
    }

    // Direct NVIDIA Fallback
    try {
        const prompt = `Generate exactly ${count} interview questions for a ${context.difficulty} ${context.jobRole} role at ${context.dreamCompany}. Candidate context: ${context.contextSummary}. Return JSON array of strings only.`
        const result = await callNVIDIA([
            { role: 'system', content: 'You are an Expert Technical Interviewer. Respond with JSON array only.' },
            { role: 'user', content: prompt }
        ], true, context.apiKey)
        
        const questions = JSON.parse(result.match(/\[.*\]/s)?.[0] || '[]')
        return Array.isArray(questions) ? questions : [result]
    } catch (err: any) {
        console.error('[aiService] Direct NVIDIA Question gen failed:', err.message)
        return ['Tell me about your technical background and projects.']
    }
}

// ─── CV-Based Question Generation (Personalized from Resume) ─────────────────
export async function generateCVBasedQuestions(
    profile: any,
    resumeText: string,
    settings: {
        difficulty: string,
        count: number,
        sector: string,
        targetCompany: string,
        interviewType: string,
        persona: string,
        apiKey?: string
    }
): Promise<string[]> {
    const name = profile?.fullName || profile?.studentName || 'Candidate'
    const skills = profile?.skills || profile?.extractedSkills || []
    const projects = profile?.projects || []
    const experience = profile?.experience || profile?.experienceLevel || ''
    const cvSnippet = (resumeText || '').substring(0, 3000) // Truncate for token limit

    const systemPrompt = `You are a professional technical interviewer conducting a ${settings.interviewType} interview.
You must generate questions ONLY based on the candidate's actual profile, skills, and resume content.
Be specific — reference their projects, technologies, and experience directly.
Mix question types: technical deep-dives (about their skills), project-based questions, and behavioral/situational questions.
Ask one question at a time. Make questions progressively harder.
Return a JSON array of exactly ${settings.count} question strings. No explanation, just the JSON array.`

    const userPrompt = `Candidate Details:
- Name: ${name}
- Skills: ${Array.isArray(skills) ? skills.join(', ') : skills}
- Experience Level: ${experience}
- Projects: ${Array.isArray(projects) ? projects.map((p: any) => typeof p === 'string' ? p : p.name || p.title || '').join(', ') : projects}
- Target Company: ${settings.targetCompany || 'General'}
- Difficulty: ${settings.difficulty}
- Interview Type: ${settings.interviewType}

Resume/CV Content:
${cvSnippet || 'No resume provided. Generate questions based on the skills and projects listed above.'}

Generate ${settings.count} personalized ${settings.difficulty}-level interview questions based STRICTLY on this candidate's background.`

    try {
        console.log(`[aiService] Generating ${settings.count} CV-based questions for "${name}"...`)
        const result = await callNVIDIA([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ], true, settings.apiKey)

        // Extract JSON array from response
        const match = result.match(/\[[\s\S]*\]/)
        if (match) {
            const questions = JSON.parse(match[0])
            if (Array.isArray(questions) && questions.length > 0) {
                console.log(`[aiService] Successfully generated ${questions.length} CV-based questions`)
                return questions.map((q: any) => typeof q === 'string' ? q : q.text || q.question || String(q))
            }
        }
        // If parsing failed but we got text, split by numbered lines
        const lines = result.split(/\d+[\.\)]\s+/).filter(l => l.trim().length > 20)
        if (lines.length > 0) return lines.slice(0, settings.count)
    } catch (err: any) {
        console.error(`[aiService] CV-based question generation failed:`, err.message)
    }

    return [] // Empty means caller should use fallback
}

// ─── Transcript Evaluation ───────────────────────────────────────────────────
export async function evaluateInterview(transcript: any[], context: RAGContext): Promise<any> {
    try {
        // AI Service using NVIDIA
        const aiRes = await axios.post(`${AI_SERVICE_URL}/interview/evaluate-full`, {
            transcript,
            student_profile: context,
            sector: context.department,
            api_key: context.apiKey
        }, { timeout: 120000 });
        return aiRes.data;
    } catch (err: any) {
        console.warn(`[aiService] NVIDIA AI Service evaluation failed. Falling back to direct call.`);
    }

    // Direct NVIDIA Fallback
    try {
        const result = await callNVIDIA([
            { role: 'system', content: 'You are a Senior Interview Evaluator. provide overallScore (1-10), strengths, and improvementAreas in JSON.' },
            { role: 'user', content: `Evaluate this interview transcript: ${JSON.stringify(transcript)}` }
        ], true, context.apiKey)
        return JSON.parse(result.match(/\{.*\}/s)?.[0] || '{}')
    } catch (err) {
        console.error('[aiService] Direct NVIDIA Evaluation failed')
        return { overallScore: 5, strengths: [], improvementAreas: ['Evaluation unavailable.'] }
    }
}

// ─── Instant Chat (Sarah) ────────────────────────────────────────────────────
export async function generateInstantChatResponse(convo: any[], cvText: string = '', apiKey?: string): Promise<string> {
    try {
        const aiRes = await axios.post(`${AI_SERVICE_URL}/interview/sarah-chat`, {
            convo,
            resume_text: cvText,
            api_key: apiKey
        }, { timeout: 120000 });
        return aiRes.data.reply;
    } catch (err: any) {
        // If FastAPI fails, use Direct NIM fallback
        const result = await callNVIDIA([
            { role: 'system', content: 'You are Sarah, a warm technical interviewer. 1-2 sentences only. Base question on CV context.' },
            ...convo.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }))
        ], false, apiKey)
        return result
    }
}

// ─── Basic NLP Generation ──────────────────────────────────────────
export async function generateResponse(prompt: string, apiKey?: string): Promise<{ response: string }> {
    try {
        const result = await callNVIDIA([{ role: 'user', content: prompt }], false, apiKey)
        return { response: result }
    } catch (err: any) {
        console.error('[aiService] generateResponse failed:', err.message)
        return { response: 'Could not process request.' }
    }
}
