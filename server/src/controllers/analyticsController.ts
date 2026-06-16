import { Request, Response } from 'express';
import prisma from '../prisma';
import bcrypt from 'bcryptjs';
import { Parser } from 'json2csv';

// Helper for Admin Logging
const logAdminAction = async (req: Request, action: string, targetId: any, targetName: string, details: any) => {
    try {
        const admin = (req as any).user;
        await prisma.adminLog.create({
            data: {
                adminId: admin.id,
                adminName: admin.username,
                action,
                targetId: String(targetId),
                targetName,
                details: details as any,
                ipAddress: (req as any).ip || 'unknown'
            }
        });

        // Also broadcast as a live event
        if ((global as any).broadcastAdminEvent) {
            (global as any).broadcastAdminEvent('admin:intervention', {
                adminName: admin.username,
                action,
                targetName,
                timestamp: Date.now()
            });
        }
    } catch (err) {
        console.error('[AdminLog] Failed to log action:', err);
    }
};

export const getAdminStats = async (req: Request, res: Response) => {
    try {
        const [totalUsers, totalInterviews, totalPosts] = await Promise.all([
            prisma.user.count(),
            prisma.report.count(),
            prisma.post.count()
        ]);

        // Get daily active users (proxied by updated users in last 24h)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const activeUsers = await prisma.user.count({ where: { updatedAt: { gte: oneDayAgo } } });

        res.json({
            totalUsers,
            proUsers: 0,
            totalInterviews,
            totalPosts,
            totalRevenue: 0,
            activeUsers
        });
    } catch (error: any) {
        console.error("Admin Stats Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const { search, status, role, page = 1, limit = 20 } = req.query;
        const where: any = {};

        if (search) {
            where.OR = [
                { email: { contains: search as string, mode: 'insensitive' } },
                { username: { contains: search as string, mode: 'insensitive' } }
            ];
            // If search looks like an Id (UUID)
            if (/^[0-9a-fA-F-]{36}$/.test(search as string)) {
                where.OR.push({ id: search });
            }
        }

        if (status) {
            if (status === 'suspended') where.accountStatus = 'SUSPENDED';
        }

        if (role) {
            where.role = (role as string).toUpperCase().replace('-', '_');
        }

        const skip = (Number(page) - 1) * Number(limit);
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    accountStatus: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit)
            }),
            prisma.user.count({ where })
        ]);

        res.json({
            users,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit))
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateUserStatus = async (req: Request, res: Response) => {
    try {
        const { userId, status } = req.body;
        if (!['active', 'suspended'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const user = await prisma.user.findUnique({ where: { id: userId as string } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId as string },
            data: { accountStatus: status.toUpperCase() as any }
        });

        await logAdminAction(req, 'UPDATE_STATUS', user.id, user.username, { newStatus: status });

        const { passwordHash, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// manualProToggle removed — premium features have been removed
export const manualProToggle = async (req: Request, res: Response) => {
    res.status(410).json({ message: 'Premium features have been removed. All features are now free.' });
};

export const exportData = async (req: Request, res: Response) => {
    try {
        const { type } = req.params;

        if (type === 'users') {
            const users = await prisma.user.findMany({
                select: {
                    username: true,
                    email: true,
                    role: true,
                    accountStatus: true,
                    createdAt: true
                }
            });
            const fields = ['username', 'email', 'role', 'accountStatus', 'createdAt'];
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(users);
            res.header('Content-Type', 'text/csv');
            res.attachment('users_export.csv');
            return res.send(csv);
        }

        res.status(400).json({ message: 'Invalid export type. Supported: users' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { userId, role } = req.body;
        if (!['student', 'admin', 'sub-admin'].includes(role.toLowerCase())) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        const user = await prisma.user.findUnique({ where: { id: userId as string } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId as string },
            data: { role: role.toUpperCase().replace('-', '_') as any }
        });

        await logAdminAction(req, 'UPDATE_USER_ROLE', user.id, user.username, { newRole: role });

        const { passwordHash, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateUserDetailed = async (req: Request, res: Response) => {
    try {
        const { userId, xp, level, streak, stats, ...rest } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId as string } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const data: any = { ...rest };
        if (xp !== undefined) data.xp = xp;
        if (level !== undefined) data.level = level;
        if (streak !== undefined) data.streak = streak;
        
        // Handling nested stats might require separate Profile update or JSON field update
        // Assuming 'stats' in req.body was for User model in Mongoose, but User Prisma model doesn't have it.
        // It might be better to update the Profile model if these are profile stats.
        
        const updatedUser = await prisma.user.update({
            where: { id: userId as string },
            data
        });

        await logAdminAction(req, 'UPDATE_USER_DETAILED', user.id, user.username, { ...data });

        const { passwordHash, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserTrends = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const reports = await prisma.report.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
            select: { createdAt: true, scores: true, sector: true }
        });

        const trends = reports.map(report => {
            const scores = report.scores as any || {};
            return {
                date: report.createdAt,
                technical: scores.technical || 0,
                communication: scores.communication || 0,
                confidence: scores.confidence || 0,
                sector: report.sector
            };
        });

        res.json({ trends });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getSkillProficiency = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const reports = await prisma.report.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: { scores: true, sector: true }
        });

        const skillMap: any = {};
        reports.forEach(report => {
            const sector = report.sector || 'General';
            if (!skillMap[sector]) {
                skillMap[sector] = { total: 0, count: 0 };
            }
            const scores = report.scores as any || {};
            const avgScore = ((scores.technical || 0) +
                (scores.communication || 0) +
                (scores.confidence || 0)) / 3;
            skillMap[sector].total += avgScore;
            skillMap[sector].count += 1;
        });

        const skills = Object.entries(skillMap).map(([sector, data]: [string, any]) => ({
            sector,
            proficiency: Math.round(data.total / data.count)
        }));

        res.json({ skills });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getIndustryBenchmarks = async (req: Request, res: Response) => {
    try {
        const { sector } = req.query;

        // Group by sector and calculate averages
        // Note: Prisma groupBy doesn't directly support nested JSON field averages easily.
        // We'll fetch and aggregate in memory or use a raw query if performance is issue.
        // For now, let's fetch essential data.
        
        const reports = await prisma.report.findMany({
            where: sector ? { sector: sector as string } : {},
            select: { sector: true, scores: true }
        });

        const benchmarksMap: any = {};
        reports.forEach(r => {
            const s = r.sector || 'Global';
            if (!benchmarksMap[s]) {
                benchmarksMap[s] = { tech: 0, comm: 0, conf: 0, count: 0 };
            }
            const scores = r.scores as any || {};
            benchmarksMap[s].tech += scores.technical || 0;
            benchmarksMap[s].comm += scores.communication || 0;
            benchmarksMap[s].conf += scores.confidence || 0;
            benchmarksMap[s].count++;
        });

        const benchmarks = Object.entries(benchmarksMap).map(([s, data]: [string, any]) => ({
            _id: s,
            avgTechnical: data.tech / data.count,
            avgCommunication: data.comm / data.count,
            avgConfidence: data.conf / data.count,
            count: data.count
        }));

        if (benchmarks.length === 0) {
            return res.json({
                benchmarks: [{
                    _id: 'Global',
                    avgTechnical: 70,
                    avgCommunication: 75,
                    avgConfidence: 72
                }]
            });
        }

        res.json({ benchmarks });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getComparison = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { reportIds } = req.query;

        if (!reportIds || typeof reportIds !== 'string') {
            return res.status(400).json({ message: 'Report IDs required' });
        }

        const ids = reportIds.split(',');
        const reports = await prisma.report.findMany({
            where: {
                id: { in: ids },
                userId
            },
            select: { id: true, sector: true, scores: true, createdAt: true }
        });

        const comparison = reports.map(report => ({
            id: report.id,
            sector: report.sector,
            date: report.createdAt,
            scores: report.scores
        }));

        res.json({ comparison });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserDetails = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const [user, logins] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId as string } }),
            prisma.loginLog.findMany({ where: { userId: userId as string }, orderBy: { timestamp: 'desc' }, take: 10 })
        ]);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { passwordHash, ...userWithoutPassword } = user;

        res.json({
            user: userWithoutPassword,
            logins,
            payments: []
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const { username, email, password, role, accountStatus } = req.body;

        const existing = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] }
        });
        if (existing) return res.status(400).json({ message: 'User or Email already exists' });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash: hash,
                role: (role || 'student').toUpperCase().replace('-', '_') as any,
                accountStatus: (accountStatus || 'active').toUpperCase() as any
            }
        });

        await logAdminAction(req, 'CREATE_USER', newUser.id, newUser.username, { role: newUser.role });

        res.status(201).json({ message: 'User created successfully', user: { id: newUser.id, email: newUser.email } });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const user = await prisma.user.findUnique({ where: { id: userId as string } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const username = user.username;
        await prisma.user.delete({ where: { id: userId as string } });

        await logAdminAction(req, 'DELETE_USER', userId, username, { permanent: true });

        res.json({ message: 'User permanently removed from platform' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createAnnouncement = async (req: Request, res: Response) => {
    try {
        const { title, content, priority, audience, expiresAt } = req.body;
        const announcement = await prisma.announcement.create({
            data: {
                title,
                content,
                priority,
                audience,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                createdBy: (req as any).user.id
            }
        });

        await logAdminAction(req, 'CREATE_ANNOUNCEMENT', announcement.id, title, { priority, audience });

        if ((global as any).broadcastAdminEvent) {
            (global as any).broadcastAdminEvent('platform:announcement', announcement);
        }

        res.status(201).json(announcement);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAnnouncements = async (req: Request, res: Response) => {
    try {
        const announcements = await prisma.announcement.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json(announcements);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.announcement.delete({ where: { id: id as string } });
        res.json({ message: 'Announcement removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createResource = async (req: Request, res: Response) => {
    try {
        const { title, description, url, type, category } = req.body;
        const resource = await prisma.resource.create({
            data: {
                title,
                description,
                url,
                type,
                category,
                createdBy: (req as any).user.id
            }
        });

        await logAdminAction(req, 'CREATE_RESOURCE', resource.id, title, { type });

        if ((global as any).broadcastAdminEvent) {
            (global as any).broadcastAdminEvent('platform:resource_new', resource);
        }

        res.status(201).json(resource);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getResources = async (req: Request, res: Response) => {
    try {
        const resources = await prisma.resource.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(resources);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Upgrade requests removed — all features are now free
export const getUpgradeRequests = async (req: Request, res: Response) => {
    res.json([]);
};

export const respondToUpgradeRequest = async (req: Request, res: Response) => {
    res.status(410).json({ message: 'Premium features have been removed. All features are now free.' });
};

export const getSystemConfig = async (req: Request, res: Response) => {
    try {
        const config = await prisma.config.findMany();
        res.json(config);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSystemConfig = async (req: Request, res: Response) => {
    try {
        const { key, value } = req.body;
        const config = await prisma.config.upsert({
            where: { key },
            update: { value, updatedBy: (req as any).user?.id },
            create: { key, value, updatedBy: (req as any).user?.id }
        });

        await logAdminAction(req, 'UPDATE_SYSTEM_CONFIG', key, key, { value });

        if ((global as any).broadcastAdminEvent) {
            (global as any).broadcastAdminEvent('system:config_update', { key, value });
        }

        res.json(config);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getPredictiveStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await prisma.user.count();

        res.json({
            totalUsers,
            conversionRate: '100.00',
            monthlyForecast: 0,
            activeProGrowth: 'N/A',
            forecastConfidence: 100
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getSystemHealth = async (req: Request, res: Response) => {
    try {
        const { ServiceStatus } = require('../services/healthMonitor');
        // Check PostgreSQL connection instead of Mongoose
        let dbStatus = 'disconnected';
        try {
            await prisma.user.findFirst();
            dbStatus = 'healthy';
        } catch { }

        res.json({
            database: dbStatus,
            aiService: ServiceStatus?.ai ? 'healthy' : 'offline',
            nvidia: (process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_KEY !== 'your_nvidia_api_key_here') ? 'healthy' : 'missing_key',
            latency: Math.floor(Math.random() * 200) + 50,
            uptime: Math.floor(process.uptime())
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAdminLogs = async (req: Request, res: Response) => {
    try {
        const logs = await prisma.adminLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        res.json(logs);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
