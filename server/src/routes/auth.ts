import express from 'express';
import jwt from 'jsonwebtoken';
import { registerUser, loginUser, forgotPassword, resetPassword } from '../controllers/authController';
import { sendTestEmail } from '../services/emailService';

const router = express.Router();

// ── Permanent Administrator Credentials ──────────────────────────────
const ADMIN_USERNAME = 'Administrator';
const ADMIN_PASSWORD = 'Admin@2026Secure!';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin_nexus_secret_2026';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ── Administrator Login (Permanent Hardcoded Credentials) ────────────
router.post('/admin-login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
        console.warn(`[ADMIN AUTH] Failed login attempt: ${username}`);
        return res.status(401).json({ message: 'Invalid administrator credentials' });
    }

    // Generate admin-specific JWT (24h expiry)
    const token = jwt.sign(
        { role: 'administrator', username: ADMIN_USERNAME, isSystemAdmin: true },
        ADMIN_JWT_SECRET,
        { expiresIn: '24h' }
    );

    console.log(`[ADMIN AUTH] ✅ Administrator logged in successfully`);

    res.json({
        token,
        username: ADMIN_USERNAME,
        role: 'administrator',
        message: 'Administrator access granted'
    });
});

// ── Debug: test email delivery (remove in production) ──
router.post('/test-email', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    try {
        const success = await sendTestEmail(email);
        res.json({ success, message: success ? 'Test email sent!' : 'Failed — check server logs' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
