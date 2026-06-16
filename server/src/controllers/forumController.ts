import { Request, Response } from 'express';
import prisma from '../prisma';
import { logStudentActivity } from '../services/activityService';

// Get all posts (with pagination and filtering)
export const getPosts = async (req: Request, res: Response) => {
    try {
        const { category, sort, page = 1, limit = 10 } = req.query;
        const where: any = {};

        if (category && category !== 'All') {
            where.category = category;
        }

        const orderBy: any = {};
        if (sort === 'top') {
            orderBy.views = 'desc';
        } else {
            orderBy.createdAt = 'desc';
        }

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                orderBy,
                take: Number(limit),
                skip: (Number(page) - 1) * Number(limit)
            }),
            prisma.post.count({ where })
        ]);

        res.json({ posts, total, totalPages: Math.ceil(total / Number(limit)) });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new post
export const createPost = async (req: any, res: Response) => {
    try {
        const { title, content, category, tags } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

        const newPost = await prisma.post.create({
            data: {
                userId: req.user.id,
                username: user?.username || 'Anonymous',
                title,
                content,
                category,
                tags: tags || [],
                comments: []
            }
        });

        // Log Activity
        await logStudentActivity(
            req.user.id,
            'FORUM_POST',
            'Created Community Post',
            `Title: ${title}`,
            { category, postId: newPost.id }
        ).catch(() => {});

        res.status(201).json(newPost);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get single post
export const getPostById = async (req: Request, res: Response) => {
    try {
        const post = await prisma.post.findUnique({ where: { id: req.params.id as string } });
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Increment view count
        const updatedPost = await prisma.post.update({
            where: { id: req.params.id as string },
            data: { views: { increment: 1 } }
        });

        res.json(updatedPost);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Add a comment
export const addComment = async (req: any, res: Response) => {
    try {
        const { content } = req.body;
        const post = await prisma.post.findUnique({ where: { id: req.params.id as string } });
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

        const comments = (post.comments as any[]) || [];
        comments.push({
            userId: req.user.id,
            username: user?.username || 'Anonymous',
            content,
            createdAt: new Date()
        });

        const updatedPost = await prisma.post.update({
            where: { id: req.params.id as string },
            data: { comments: comments as any }
        });

        // Log Activity
        await logStudentActivity(
            req.user.id,
            'FORUM_COMMENT',
            'Commented on Community Post',
            `Content snippet: ${content.substring(0, 50)}...`,
            { postId: updatedPost.id }
        ).catch(() => {});

        res.json(updatedPost);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Toggle Vote
export const toggleVote = async (req: any, res: Response) => {
    try {
        const { type } = req.body; // 'upvote' or 'downvote'
        const post = await prisma.post.findUnique({ where: { id: req.params.id as string } });
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const userId = req.user.id;

        // Remove from both lists first to clean state
        let upvotes = post.upvotes.filter(id => id !== userId);
        let downvotes = post.downvotes.filter(id => id !== userId);

        if (type === 'upvote') {
            upvotes.push(userId);
        } else if (type === 'downvote') {
            downvotes.push(userId);
        }

        const updatedPost = await prisma.post.update({
            where: { id: req.params.id as string },
            data: { upvotes, downvotes }
        });

        res.json(updatedPost);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
