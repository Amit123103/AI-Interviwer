import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { logStudentActivity } from '../services/activityService';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/emailService';

const generateToken = (id: string, role: string) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

export const registerUser = async (req: Request, res: Response) => {
    let { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        console.log("[AUTH] Registration attempt:", { username, email });

        const normalizedEmail = email.toLowerCase().trim();
        const normalizedUsername = username.trim();

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: normalizedEmail },
                    { username: normalizedUsername }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user in PostgreSQL
        const newUser = await prisma.user.create({
            data: {
                username: normalizedUsername,
                email: normalizedEmail,
                passwordHash,
                profile: {
                    create: {} // Create empty profile
                },
                preferences: {
                    create: {} // Create default preferences
                }
            },
            include: {
                preferences: true
            }
        });

        if (newUser) {
            console.log("User created successfully:", newUser.id);

            sendWelcomeEmail(newUser.email, newUser.username).catch(err => {
                console.error("Welcome email failed (non-fatal):", err.message);
            });

            // Broadcast signup event
            if ((global as any).broadcastAdminEvent) {
                (global as any).broadcastAdminEvent('user:signup', {
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role
                });
            }

            res.status(201).json({
                _id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role.toLowerCase(),
                token: generateToken(newUser.id, newUser.role),
                preferences: newUser.preferences || { theme: 'dark', language: 'English' },
                twoFactorEnabled: newUser.twoFactorEnabled || false
            });
        }
    } catch (error: any) {
        console.error("Signup error details:", error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    try {
        let { identifier, password } = req.body;

        if (!identifier || !password) {
            console.warn('[AUTH] ⚠️  Login attempt with missing identifier/password');
            return res.status(400).json({ message: 'Email/Username and password are required' });
        }

        const sanitizedIdentifier = identifier.trim();
        const lowerEmail = sanitizedIdentifier.toLowerCase();

        console.log(`[AUTH] Login attempt for: ${sanitizedIdentifier}`);

        // Find user by email or username (case-insensitive username via mode: 'insensitive' in PostgreSQL)
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: lowerEmail },
                    { username: { equals: sanitizedIdentifier, mode: 'insensitive' } }
                ]
            },
            include: {
                preferences: true
            }
        });

        if (!user) {
            console.warn(`[AUTH] ❌ Login failed: User not found for identifier "${sanitizedIdentifier}"`);
            return res.status(401).json({ message: 'Invalid email/username or password' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
        
        if (isPasswordCorrect) {
            // Check account status
            if (user.accountStatus === 'SUSPENDED') {
                console.warn(`[AUTH] ⚠️  Login blocked: Account suspended for ${user.email}`);
                return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
            }

            // Log login activity
            prisma.loginLog.create({
                data: {
                    userId: user.id,
                    email: user.email,
                    ipAddress: req.ip || 'unknown',
                    userAgent: req.headers['user-agent'] || 'unknown',
                }
            }).catch((err: any) => console.error('[AUTH] Login log failed:', err));

            // Centralized Activity Log
            logStudentActivity(user.id, 'LOGIN', 'User Logged In', `IP: ${req.ip || 'unknown'}`);

            // Broadcast login event
            if ((global as any).broadcastAdminEvent) {
                (global as any).broadcastAdminEvent('user:login', {
                    userId: user.id,
                    username: user.username,
                    role: user.role
                });
            }

            // Trigger real-time performance push
            if ((global as any).broadcastStudentPerformance) {
                (global as any).broadcastStudentPerformance(user.id).catch(() => {});
            }

            res.json({
                _id: user.id,
                username: user.username,
                email: user.email,
                role: user.role.toLowerCase(),
                token: generateToken(user.id, user.role),
                preferences: user.preferences || { theme: 'dark', language: 'English' },
                twoFactorEnabled: user.twoFactorEnabled || false
            });
        } else {
            console.warn(`[AUTH] ❌ Login failed: Password mismatch for user "${user.username}" (${user.email})`);
            res.status(401).json({ message: 'Invalid email/username or password' });
        }
    } catch (error: any) {
        console.error("[AUTH] 🚨 Severe login error:", error);
        res.status(500).json({ 
            message: 'Server error during login', 
            error: error.message || 'Unknown server error',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        console.log(`[AUTH] Forgot password request for: ${email}`);

        const successMsg = 'If an account exists with this email, a reset link has been sent.';

        const user = await prisma.user.findUnique({ 
            where: { email: email.toLowerCase().trim() } 
        });
        
        if (!user) {
            console.log(`[AUTH] No user found for email: ${email} (returning generic success)`);
            return res.json({ message: successMsg });
        }

        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: new Date(Date.now() + 30 * 60 * 1000)
            }
        });

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const resetUrl = `${clientUrl}/auth/reset-password?token=${rawToken}`;

        try {
            await sendPasswordResetEmail(user.email, resetUrl, user.username);
            console.log(`[AUTH] Reset email dispatched successfully to: ${user.email}`);
        } catch (emailError: any) {
            console.error(`[AUTH] ❌ Failed to send reset email: ${emailError.message}`);
        }

        res.json({ message: successMsg });
    } catch (error: any) {
        console.error("[AUTH] 🚨 Forgot password error:", error);
        res.status(500).json({ 
            message: 'Server error during forgot-password request',
            error: error.message || 'Unknown error',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    const { token, password, confirmPassword } = req.body;

    try {
        if (!token || !password) {
            return res.status(400).json({ message: 'Token and password are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { gt: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token. Please request a new reset link.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetPasswordToken: null,
                resetPasswordExpires: null
            }
        });

        console.log(`Password reset successful for user: ${user.email}`);
        res.json({ message: 'Password has been reset successfully. You can now log in with your new password.' });
    } catch (error: any) {
        console.error("[AUTH] 🚨 Reset password error:", error);
        res.status(500).json({ 
            message: 'Server error during password reset',
            error: error.message || 'Unknown error',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};


