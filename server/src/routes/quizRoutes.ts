import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { 
    createQuiz, 
    getQuizByCode, 
    getQuizzes,
    submitQuiz, 
    getLeaderboard,
    getMyAttempt,
    suggestQuestions
} from '../controllers/quizController';

const router = express.Router();

// Base route: /api/quiz

// Create a new quiz
router.post('/create', protect, createQuiz);

// AI-powered question suggestion
router.post('/ai-suggest', protect, suggestQuestions);

// Get all public/owned quizzes
router.get('/', protect, getQuizzes);

// Get a quiz by its unique 6-digit code
router.get('/code/:code', protect, getQuizByCode);

// Submit answers for a quiz
router.post('/code/:code/submit', protect, submitQuiz);

// Get leaderboard for a specific quiz code
router.get('/code/:code/leaderboard', protect, getLeaderboard);

// Get specific attempt details
router.get('/attempt/:attemptId', protect, getMyAttempt);

export default router;
