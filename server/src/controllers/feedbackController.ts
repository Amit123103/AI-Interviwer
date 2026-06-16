import { Request, Response } from 'express';
import prisma from '../prisma';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Create a new feedback submission
// @route   POST /api/feedback/submit
// @access  Private
export const createSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { question, answer, type } = req.body;
    const userId = req.user.id;

    if (!question || !answer) {
      res.status(400).json({ message: 'Please provide both question and answer' });
      return;
    }

    const submission = await prisma.feedbackSubmission.create({
      data: {
        userId,
        question,
        answer,
        type: type || 'behavioral',
        status: 'open',
      }
    });

    res.status(201).json(submission);
  } catch (error: any) {
    console.error('Error creating submission:', error);
    res.status(500).json({ message: 'Server error while creating submission' });
  }
};

// @desc    Get all active submissions from other users that need review
// @route   GET /api/feedback/feed
// @access  Private
export const getPendingReviewsFeed = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;

    // Filter out submissions the user has already reviewed
    const myReviews = await prisma.peerReview.findMany({
      where: { reviewerId: userId },
      select: { submissionId: true }
    });
    const reviewedSubmissionIds = myReviews.map(r => r.submissionId);

    // Find all 'open' submissions that do NOT belong to the current user and not reviewed by current user
    const submissions = await prisma.feedbackSubmission.findMany({
      where: {
        status: 'open',
        userId: { not: userId },
        id: { notIn: reviewedSubmissionIds }
      },
      include: {
        user: { select: { username: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 30
    });

    res.json(submissions);
  } catch (error: any) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ message: 'Server error while fetching feed' });
  }
};

// @desc    Get my own submissions
// @route   GET /api/feedback/my-submissions
// @access  Private
export const getMySubmissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;

    const submissions = await prisma.feedbackSubmission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(submissions);
  } catch (error: any) {
    console.error('Error fetching my submissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit a review on someone's submission
// @route   POST /api/feedback/review/:id
// @access  Private
export const submitReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { clarityScore, accuracyScore, comments } = req.body;
    const submissionId = req.params.id as string;
    const reviewerId = req.user.id;

    if (!clarityScore || !accuracyScore || !comments) {
      res.status(400).json({ message: 'Please provide all review fields' });
      return;
    }

    const submission = await prisma.feedbackSubmission.findUnique({
      where: { id: submissionId }
    });

    if (!submission) {
      res.status(404).json({ message: 'Submission not found' });
      return;
    }

    if (submission.userId === reviewerId) {
      res.status(400).json({ message: 'You cannot review your own submission' });
      return;
    }

    // Check if already reviewed
    const existingReview = await prisma.peerReview.findFirst({
      where: {
        submissionId,
        reviewerId,
      }
    });

    if (existingReview) {
      res.status(400).json({ message: 'You have already reviewed this submission' });
      return;
    }

    const review = await prisma.peerReview.create({
      data: {
        submissionId,
        reviewerId,
        clarityScore: Number(clarityScore),
        accuracyScore: Number(accuracyScore),
        comments,
      }
    });

    // Optionally: Reward user for giving feedback
    try {
      await prisma.user.update({
        where: { id: reviewerId },
        data: { intervyxaCoins: { increment: 50 } }
      });
    } catch(err) {
       console.log("Failed to reward coins to user (optional step): ", err);
    }

    res.status(201).json(review);
  } catch (error: any) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Server error while submitting review' });
  }
};

// @desc    Get all reviews for a specific submission I own
// @route   GET /api/feedback/reviews/:submissionId
// @access  Private
export const getReviewsForSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const submissionId = req.params.submissionId as string;
    
    // Ensure the submission exists and belongs to the user
    const submission = await prisma.feedbackSubmission.findUnique({
      where: { id: submissionId }
    });
    
    if (!submission) {
       res.status(404).json({ message: 'Submission not found' });
       return;
    }
    
    if (submission.userId !== req.user.id) {
       res.status(403).json({ message: 'Not authorized to view these reviews' });
       return;
    }

    const reviews = await prisma.peerReview.findMany({
      where: { submissionId },
      include: {
        reviewer: { select: { username: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reviews);
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
