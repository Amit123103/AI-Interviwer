import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  createSubmission,
  getPendingReviewsFeed,
  getMySubmissions,
  submitReview,
  getReviewsForSubmission
} from '../controllers/feedbackController';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Submission routes
router.post('/submit', createSubmission);
router.get('/my-submissions', getMySubmissions);

// Feed & Review reading
router.get('/feed', getPendingReviewsFeed);
router.get('/reviews/:submissionId', getReviewsForSubmission);

// Give Review
router.post('/review/:id', submitReview);

export default router;
