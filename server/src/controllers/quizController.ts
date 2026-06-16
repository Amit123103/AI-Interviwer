import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../prisma';
import { updateUserProgress } from '../services/gamificationService';

// Helper to generate a unique 6-character alphanumeric code
const generateCode = async (): Promise<string> => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string = '';
    let isUnique = false;

    while (!isUnique) {
        code = Array.from(crypto.randomFillSync(new Uint8Array(6)))
            .map((byte) => chars[byte % chars.length])
            .join('');
        
        const existing = await prisma.quiz.findUnique({ where: { code } });
        if (!existing) isUnique = true;
    }
    return code;
};

export const createQuiz = async (req: Request, res: Response) => {
    try {
        const { title, description, isPublic, questions } = req.body;
        const userId = (req as any).user?.id;

        if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
             res.status(400).json({ success: false, message: 'Invalid quiz data provided' });
             return;
        }

        const code = await generateCode();

        const quiz = await prisma.quiz.create({
            data: {
                title,
                description,
                creatorId: userId,
                code,
                isPublic: isPublic || false,
                questions: questions as any
            }
        });

        res.status(201).json({ success: true, quiz });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

export const getQuizzes = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const quizzes = await prisma.quiz.findMany({
            where: {
                OR: [{ isPublic: true }, { creatorId: userId }]
            },
            include: {
                creator: {
                    select: { username: true, id: true }
                }
            }
        });
        
        res.status(200).json({ success: true, quizzes });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

export const getQuizByCode = async (req: Request, res: Response) => {
    try {
        const { code } = req.params;
        const quiz = await prisma.quiz.findUnique({
            where: { code: String(code).toUpperCase() },
            include: {
                creator: {
                    select: { username: true, id: true }
                }
            }
        });

        if (!quiz) {
            res.status(404).json({ success: false, message: 'Quiz not found' });
            return;
        }

        const questions = (quiz.questions as any[]) || [];
        const safeQuiz = {
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            creator: quiz.creator,
            code: quiz.code,
            questions: questions.map((q: any) => ({
                id: q.id || q._id,
                text: q.text,
                type: q.type,
                options: q.options
            }))
        };

        res.status(200).json({ success: true, quiz: safeQuiz });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

export const submitQuiz = async (req: Request, res: Response) => {
    try {
        const { code } = req.params;
        const { answers } = req.body;
        const userId = (req as any).user?.id;

        const quiz = await prisma.quiz.findUnique({
            where: { code: String(code).toUpperCase() }
        });

        if (!quiz) {
            res.status(404).json({ success: false, message: 'Quiz not found' });
            return;
        }

        if (!answers || !Array.isArray(answers)) {
            res.status(400).json({ success: false, message: 'Invalid answers format' });
            return;
        }

        let score = 0;
        let correctCount = 0;
        const evaluatedAnswers: any[] = [];
        const quizQuestions = (quiz.questions as any[]) || [];

        for (const answer of answers) {
            const question = quizQuestions.find(q => (q.id || q._id) === answer.questionId);
            if (!question) continue;

            let isCorrect = false;

            if (question.type === 'multiple_choice') {
                if (question.correctAnswer !== undefined) {
                     if (String(answer.selectedOption) === String(question.correctAnswer)) {
                         isCorrect = true;
                     } else if (question.options) {
                         const correctIndex = parseInt(String(question.correctAnswer));
                         if (!isNaN(correctIndex) && question.options[correctIndex] === answer.selectedOption) {
                             isCorrect = true;
                         }
                     }
                }
            } else if (question.type === 'theoretical') {
                if (question.correctAnswer && typeof answer.selectedOption === 'string') {
                     const ans = answer.selectedOption.toLowerCase();
                     const expected = String(question.correctAnswer).toLowerCase();
                     if (ans.includes(expected) || expected.includes(ans)) {
                         isCorrect = true;
                     }
                }
            }

            if (isCorrect) {
                score += 1;
                correctCount += 1;
            }

            evaluatedAnswers.push({
                questionId: question.id || question._id,
                selectedOption: answer.selectedOption,
                isCorrect
            });
        }

        const coinsEarned = correctCount * 500;

        // Save Attempt
        const attempt = await prisma.quizAttempt.create({
            data: {
                userId,
                quizId: quiz.id,
                score,
                coinsEarned,
                answers: evaluatedAnswers as any
            }
        });

        // Award Coins & Progress to User
        if (coinsEarned > 0) {
            await updateUserProgress(userId!, coinsEarned, {
                type: 'QUIZ_COMPLETE',
                quizTitle: quiz.title,
                score
            });
        }

        res.status(200).json({
            success: true,
            score,
            totalQuestions: quizQuestions.length,
            coinsEarned,
            attemptId: attempt.id,
            results: evaluatedAnswers
        });

    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const { code } = req.params;
        const quiz = await prisma.quiz.findUnique({
            where: { code: String(code).toUpperCase() }
        });

        if (!quiz) {
             res.status(404).json({ success: false, message: 'Quiz not found' });
             return;
        }

        const attempts = await prisma.quizAttempt.findMany({
            where: { quizId: quiz.id },
            include: {
                user: {
                    select: { username: true, id: true }
                }
            },
            orderBy: [
                { score: 'desc' },
                { createdAt: 'asc' }
            ]
        });

        const bestAttemptsMap = new Map();
        for (const attempt of attempts) {
            const uId = attempt.userId;
            if (!bestAttemptsMap.has(uId)) {
                 bestAttemptsMap.set(uId, attempt);
            } else {
                 if (attempt.score > bestAttemptsMap.get(uId).score) {
                     bestAttemptsMap.set(uId, attempt);
                 }
            }
        }
        
        const leaderboard = Array.from(bestAttemptsMap.values())
             .sort((a: any, b: any) => b.score - a.score);

        const quizQuestions = (quiz.questions as any[]) || [];
        res.status(200).json({ success: true, leaderboard, totalQuestions: quizQuestions.length });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

export const getMyAttempt = async (req: Request, res: Response) => {
    try {
        const { attemptId } = req.params;
        const userId = (req as any).user?.id;

        const attempt = await prisma.quizAttempt.findUnique({
             where: { id: attemptId as string },
             include: {
                 quiz: {
                     select: { title: true, questions: true }
                 }
             }
        });
             
        if (!attempt || attempt.userId !== userId) {
            res.status(404).json({ success: false, message: 'Attempt not found' });
            return;
        }

        res.status(200).json({ success: true, attempt });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}

export const suggestQuestions = async (req: Request, res: Response) => {
    try {
        const { topic, difficulty, count, questionType } = req.body;
        const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

        const response = await fetch(`${AI_SERVICE_URL}/quiz/suggest-questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, difficulty, count: count || 5, questionType: questionType || 'multiple_choice' })
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error: any) {
        console.error('Error proxying to AI service:', error.message);
        res.status(500).json({ success: false, message: 'AI Service unavailable', error: error.message });
    }
};

