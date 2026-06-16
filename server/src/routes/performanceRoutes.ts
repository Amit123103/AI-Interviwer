import express from 'express';
import { getMasteryProfile } from '../controllers/performanceController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/mastery/:userId', protect, getMasteryProfile);

export default router;
