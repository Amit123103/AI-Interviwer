import { Request, Response } from 'express';
import prisma from '../prisma';
import bcrypt from 'bcryptjs';
import archiver from 'archiver';

// --- Preferences ---
export const updatePreferences = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        
        const preferences = await prisma.preferences.upsert({
            where: { userId },
            update: req.body,
            create: {
                userId,
                ...req.body
            }
        });

        res.json({ preferences });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- Security ---
export const changePassword = async (req: any, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid current password' });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);
        
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash }
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateTwoFactor = async (req: any, res: Response) => {
    const { enabled } = req.body;
    try {
        const userId = req.user.id;
        
        const user = await prisma.user.update({
            where: { id: userId },
            data: { twoFactorEnabled: enabled }
        });

        res.json({ twoFactorEnabled: user.twoFactorEnabled });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- Notifications ---
export const updateNotifications = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        
        // Map old notifications object structure to flat fields in Preferences model if needed, 
        // or just update directly if body fields match model fields (emailNotifications, etc.)
        const preferences = await prisma.preferences.upsert({
            where: { userId },
            update: req.body,
            create: {
                userId,
                ...req.body
            }
        });

        res.json({ notifications: preferences });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- Privacy ---
export const downloadData = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        
        const user = await prisma.user.findUnique({ 
            where: { id: userId },
            include: {
                profile: true,
                reports: true,
                preferences: true
            }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        const { passwordHash, ...userData } = user;

        const archive = archiver('zip', { zlib: { level: 9 } });

        res.attachment(`user_data_${user.id}.zip`);
        archive.pipe(res);

        archive.append(JSON.stringify(userData, null, 2), { name: 'user_account.json' });
        if (user.profile) archive.append(JSON.stringify(user.profile, null, 2), { name: 'user_profile.json' });

        const reportsJson = JSON.stringify(user.reports, null, 2);
        archive.append(reportsJson, { name: 'interview_history.json' });

        await archive.finalize();

    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteAccount = async (req: any, res: Response) => {
    const { password } = req.body;
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

        // Prisma models with Cascade delete will handle related records if defined in schema.
        // If not, we delete manually. Our schema has relations.
        
        await prisma.user.delete({ where: { id: userId } });

        res.json({ message: 'Account deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
