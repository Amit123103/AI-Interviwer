import 'dotenv/config';
import express from 'express';

import cors from 'cors';
import http from 'http';
import path from 'path';
import prisma from './prisma';
import { startHealthMonitor, waitForAI, ServiceStatus } from './services/healthMonitor';
import {
    helmetMiddleware,
    generalLimiter,
    authLimiter,
    uploadLimiter,
    injectionGuard,
    requestLogger,
} from './middleware/securityMiddleware';

// ── Global Error Handlers (MUST be registered before anything else) ─
// These prevent nodemon from crashing on unhandled async errors.
process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception — server staying alive:', err.message);
    console.error(err.stack);
    // Do NOT call process.exit() — let nodemon keep the server alive
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[ERROR] Unhandled Promise Rejection at:', promise);
    console.error('[ERROR] Reason:', reason);
    // Do NOT exit — the server continues; the specific request fails gracefully
});

// ── Graceful Shutdown ───────────────────────────────────────────────
function gracefulShutdown(signal: string) {
    console.log(`\n[SERVER] ${signal} received — shutting down gracefully…`);
    server.close(() => {
        console.log('[SERVER] HTTP server closed.');
        process.exit(0);
    });
    // Force exit after 10s if connections are hanging
    setTimeout(() => { process.exit(1); }, 10_000);
}

// ── Connect to PostgreSQL via Prisma ─────────────────────────────────
prisma.$connect()
    .then(() => console.log('[DB] PostgreSQL Connected via Prisma'))
    .catch((err: Error) => {
        console.error('[DB] PostgreSQL connection failed at startup:', err.message);
        console.warn('[DB] Server will continue — check DATABASE_URL');
    });

// ── Express App ─────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

app.use(cors({
    origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',')
        : [
            'http://localhost:3000',
            'https://intervyxa-ai.vercel.app',
            'https://intervyxa-ai-git-main.vercel.app',
        ],
    credentials: true,
}));
app.use(helmetMiddleware);      // Security headers
app.use(generalLimiter);       // Global rate limit
app.use(requestLogger);        // Structured request logging
app.use(injectionGuard);       // NoSQL injection blocker



app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (_req, res) => {
    res.send('Intervyxa AI API is running…');
});

// ── System status endpoint ──────────────────────────────────────────
app.get('/api/system/health', (_req, res) => {
    res.json({
        server: 'online',
        ...ServiceStatus,
        timestamp: new Date().toISOString(),
    });
});

// ── Route imports (lazy — after middleware is applied) ──────────────
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import reportRoutes from './routes/reportRoutes';
import executionRoutes from './routes/executionRoutes';
import forumRoutes from './routes/forumRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import reviewRoutes from './routes/reviewRoutes';
import negotiationRoutes from './routes/negotiationRoutes';
import onsiteRoutes from './routes/onsiteRoutes';
import systemRoutes from './routes/systemRoutes';
import settingsRoutes from './routes/settingsRoutes';
import codingRoutes from './routes/codingRoutes';
import codingRoundRoutes from './routes/codingRoundRoutes';
import gamificationRoutes from './routes/gamificationRoutes';
import interviewRoutes from './routes/interviewRoutes';
import contestRoutes from './routes/contestRoutes';
import resumeRoutes from './routes/resumeRoutes';
import practiceRoutes from './routes/practiceRoutes';
import questionRoutes from './routes/questionRoutes';
import companyRoutes from './routes/companyRoutes';
import contentRoutes from './routes/contentRoutes'
import adminRoutes from './routes/adminRoutes'
import performanceRoutes from './routes/performanceRoutes'

import sqlRoutes from './routes/sqlRoutes'
import portfolioRoutes from './routes/portfolioRoutes'
import advancedNotesRoutes from './routes/advancedNotesRoutes'
import notesOcrRoutes from './routes/notesOcrRoutes'
import mentorRoutes from './routes/mentorRoutes'
import quizRoutes from './routes/quizRoutes'
import feedbackRoutes from './routes/feedbackRoutes'
import trackingRoutes from './routes/trackingRoutes'
import projectsRoutes from './routes/projectsRoutes'

app.use('/api/auth', authLimiter, authRoutes);   // Stricter limit on auth
app.use('/api/profile', profileRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/execution', executionRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/onsite', onsiteRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/negotiation', negotiationRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/database', sqlRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/user', contentRoutes); // Alias for user activity
app.use('/api/user/settings', settingsRoutes);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api/coding', codingRoutes);
app.use('/api/coding-round', codingRoundRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/resume', uploadLimiter, resumeRoutes);  // Upload-rate-limited
app.use('/api/practice', practiceRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api/portfolio', portfolioRoutes);
app.use('/api/notes', advancedNotesRoutes);
app.use('/api/notes', notesOcrRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/projects', projectsRoutes);

// ── Socket.IO ───────────────────────────────────────────────────────
import { initializeSocket } from './socket/index';
const io = initializeSocket(server);
export { io };

// ── Start Server ─────────────────────────────────────────────────────
// ── Cron Jobs (Automation) ──────────────────────────────────────────
import { initCronJobs } from './services/cronJobs';
initCronJobs();

const PORT = Number(process.env.PORT) || 5001;

server.listen(PORT, '0.0.0.0', async () => {
    console.log(`\n🚀 SERVER [V3_STABLE] running on port ${PORT}`);
    console.log('─────────────────────────────────────────');
    console.log('  Running startup diagnostics…');
    console.log('─────────────────────────────────────────');

    // Check PostgreSQL (Prisma)
    try {
        await prisma.user.findFirst();
        console.log('  ✅ PostgreSQL: Connected (Prisma)');
    } catch (err) {
        console.warn('  ⚠️  PostgreSQL: Disconnected (check DATABASE_URL)');
    }

    // Check NVIDIA (configuration only, non-critical)
    const isNvidiaSet = process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_KEY !== 'your_nvidia_api_key_here';
    if (isNvidiaSet) {
        console.log('  ✅ NVIDIA AI: Configured');
    } else {
        console.warn('  ⚠️  NVIDIA AI: Key Missing (falling back to AI Service or Hardcoded)');
    }

    // Wait for AI service with exponential backoff (3 retries: 3s → 6s → 12s)
    console.log('  🔄 AI Service: Checking…');
    await waitForAI(10, 3000);

    if (ServiceStatus.ai) {
        console.log('  ✅ AI Service: Online');
    } else {
        console.warn('  ❌ AI Service: Offline — server in DEGRADED mode');
        console.warn('     → Start FastAPI with: cd ai-service && start_service.bat');
    }

    console.log('─────────────────────────────────────────');
    console.log('  System ready. Background health checks active.\n');

    // Verify email transporter (non-blocking)
    const { verifyEmailTransporter } = require('./services/emailService');
    verifyEmailTransporter().then((ok: boolean) => {
        if (!ok) {
            console.log('  ℹ️  Email: disabled (optional — set SMTP_HOST, SMTP_USER, SMTP_PASS to enable)');
        }
    }).catch(() => { });


    // Start background health monitor (polls every 30s)
    startHealthMonitor();
});

// Handle server-level errors (e.g. EADDRINUSE)
server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n[SERVER] ❌ Port ${PORT} is already in use!`);
        console.error(`[SERVER]    Run: npx kill-port ${PORT}  OR  npm run dev (predev script handles this)`);
        process.exit(1);
    } else {
        console.error('[SERVER] Unexpected server error:', err);
    }
});

// Register graceful shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
