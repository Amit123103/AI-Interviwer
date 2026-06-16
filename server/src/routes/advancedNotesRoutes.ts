import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// GET all notes for a user (list view)
router.get('/user/:userId', protect, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId as string;
        const authReq = req as any;

        if (authReq.user?.id !== userId) {
            res.status(403).json({ success: false, error: 'Not authorized' });
            return;
        }

        const notes = await prisma.advancedNote.findMany({
            where: { userId },
            select: {
                id: true,
                title: true,
                previewText: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { updatedAt: 'desc' }
        });

        res.status(200).json({ success: true, count: notes.length, data: notes });
    } catch (error: any) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// GET single note by ID
router.get('/:id', protect, async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const note = await prisma.advancedNote.findUnique({
            where: { id }
        });

        if (!note) {
            res.status(404).json({ success: false, error: 'Note not found' });
            return;
        }

        const authReq = req as any;
        if (note.userId !== authReq.user?.id) {
            res.status(403).json({ success: false, error: 'Not authorized' });
            return;
        }

        res.status(200).json({ success: true, data: note });
    } catch (error: any) {
        console.error('Error fetching note details:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// POST create a new note
router.post('/', protect, async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as any;
        const userId = authReq.user?.id as string;
        const { title, pages } = req.body;

        const note = await prisma.advancedNote.create({
            data: {
                userId,
                title: title || 'Untitled Note',
                pages: pages || []
            }
        });

        res.status(201).json({ success: true, data: note });
    } catch (error: any) {
        console.error('Error creating note:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// PUT update note (autosave)
router.put('/:id', protect, async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        let note = await prisma.advancedNote.findUnique({
            where: { id }
        });

        if (!note) {
            res.status(404).json({ success: false, error: 'Note not found' });
            return;
        }

        const authReq = req as any;
        if (note.userId !== authReq.user?.id) {
            res.status(403).json({ success: false, error: 'Not authorized' });
            return;
        }

        note = await prisma.advancedNote.update({
            where: { id },
            data: req.body
        });

        res.status(200).json({ success: true, data: note });
    } catch (error: any) {
        console.error('Error updating note:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// DELETE a note
router.delete('/:id', protect, async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const note = await prisma.advancedNote.findUnique({
            where: { id }
        });

        if (!note) {
            res.status(404).json({ success: false, error: 'Note not found' });
            return;
        }

        const authReq = req as any;
        if (note.userId !== authReq.user?.id) {
            res.status(403).json({ success: false, error: 'Not authorized' });
            return;
        }

        await prisma.advancedNote.delete({
            where: { id }
        });

        res.status(200).json({ success: true, data: {} });
    } catch (error: any) {
        console.error('Error deleting note:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

export default router;
