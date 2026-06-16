import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

interface DecodedToken {
    id: string;
    role: string;
}

export const protect = async (req: any, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            if (!token || token === 'null' || token === 'undefined') {
                return res.status(401).json({ message: 'Not authorized, token is missing or invalid' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as DecodedToken;

            // Query PostgreSQL for user
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    accountStatus: true,
                    intervyxaCoins: true,
                    level: true,
                    preferences: {
                        select: {
                            theme: true,
                            language: true
                        }
                    }
                }
            });

            if (!user) {
                console.error("Protect Middleware: User not found for ID", decoded.id);
                return res.status(401).json({ message: 'User not found' });
            }

            // Construct authority object (compatible with existing code)
            req.user = {
                id: user.id,
                _id: user.id, // For compatibility
                username: user.username,
                email: user.email,
                role: user.role.toLowerCase(),
                accountStatus: user.accountStatus.toLowerCase(),
                intervyxaCoins: user.intervyxaCoins,
                level: user.level,
                // All features are now free — no pro subscription check needed
                preferences: user.preferences || {}
            };

            next();
        } catch (error: any) {
            console.warn(`[WARN] Protect Middleware Error: ${error.message || 'Token verification failed'}`);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        console.error("Protect Middleware: No valid Authorization header");
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const adminOnly = (req: any, res: Response, next: NextFunction) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'sub-admin')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

export const requirePro = async (req: any, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Admin/Sub-Admin bypasses Pro check
        if (req.user.role === 'admin' || req.user.role === 'sub-admin') return next();

        // Implement Pro logic here if needed
        next();
    } catch (error) {
        console.error('RequirePro middleware error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

