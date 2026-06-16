/**
 * healthMonitor.ts
 * ─────────────────────────────────────────────────────────────────
 * Centralised service-health tracking for the AI Interviewer backend.
 *
 * Exports:
 *   ServiceStatus       – live status flags (ai, ollama, mongo)
 *   startHealthMonitor  – kick off background 30-s polling loop
 *   waitForAI           – promise retry with exponential back-off
 *   requireAIService    – Express middleware that returns 503 when AI is down
 *   isAIOnline          – simple boolean helper
 *   CircuitBreaker      – wraps AI calls with open/half-open/closed states
 */

import axios from 'axios';

import { Request, Response, NextFunction } from 'express';
import { exec } from 'child_process';

// ── Config ─────────────────────────────────────────────────────────
const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const POLL_MS = 30_000; // background poll interval
const REQ_TIMEOUT = 5_000; // per-request timeout for health pings

// ── Live Status Object ──────────────────────────────────────────────
export const ServiceStatus = {
    ai: false as boolean,
};

// ── Internal helpers ────────────────────────────────────────────────
async function checkAI(): Promise<boolean> {
    try {
        const res = await axios.get(`${AI_URL}/health`, { timeout: REQ_TIMEOUT });
        return res.status === 200;
    } catch {
        return false;
    }
}


// ── Auto-Restart Logic ──────────────────────────────────────────────
let consecutiveAIFailures = 0;
const MAX_FAILURES_BEFORE_RESTART = 5;
let lastRestartAttempt = 0;
const RESTART_COOLDOWN_MS = 120_000; // 2 minutes between restart attempts

function attemptAIRestart(): void {
    const now = Date.now();
    if (now - lastRestartAttempt < RESTART_COOLDOWN_MS) {
        console.log('[Health] Auto-restart on cooldown, skipping...');
        return;
    }
    lastRestartAttempt = now;
    console.warn('[Health] ⚠️ Attempting AI service auto-restart...');

    const path = require('path');
    const fs = require('fs');
    const aiDir = process.env.AI_SERVICE_DIR || path.resolve(process.cwd(), '..', 'ai-service');

    // Find python executable — check venv then .venv
    let pythonExe = '';
    const isWin = process.platform === 'win32';
    const venvPaths = isWin
        ? [path.join(aiDir, 'venv', 'Scripts', 'python.exe'), path.join(aiDir, '.venv', 'Scripts', 'python.exe')]
        : [path.join(aiDir, 'venv', 'bin', 'python'), path.join(aiDir, '.venv', 'bin', 'python')];

    for (const p of venvPaths) {
        if (fs.existsSync(p)) { pythonExe = p; break; }
    }
    if (!pythonExe) {
        console.error('[Health] Auto-restart failed: No venv found at', venvPaths);
        return;
    }

    // Platform-appropriate restart command
    const cmd = isWin
        ? `"${pythonExe}" -m uvicorn app.main:app --host 0.0.0.0 --port 8000`
        : `"${pythonExe}" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &`;

    exec(cmd, { timeout: 30_000, cwd: aiDir }, (err) => {
        if (err) {
            console.error('[Health] Auto-restart failed:', err.message);
        } else {
            console.log('[Health] Auto-restart command issued. Waiting for service to come online...');
        }
    });
}

async function refreshAll(): Promise<void> {
    const ai = await checkAI();


    const prev = { ...ServiceStatus };
    ServiceStatus.ai = ai;


    // Only log when status changes to avoid log spam
    if (prev.ai !== ai) {
        console.log(`[Health] AI Service: ${ai ? '✅ Online' : '❌ Offline'}`);
        if (!prev.ai && ai) {
            console.log('[Health] 🎉 AI Service recovered — exiting DEGRADED mode.');
        }
    }


    // Auto-restart logic
    if (!ai) {
        consecutiveAIFailures++;
        if (consecutiveAIFailures >= MAX_FAILURES_BEFORE_RESTART) {
            attemptAIRestart();
            consecutiveAIFailures = 0;
        }
    } else {
        consecutiveAIFailures = 0;
    }
}

// ═══════════════════════════════════════════════════════════════════
// ── Circuit Breaker ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerOptions {
    failureThreshold?: number;   // failures before opening (default 5)
    resetTimeoutMs?: number;     // ms before trying half-open (default 30s)
    successThreshold?: number;   // successes in half-open to close (default 2)
}

export class CircuitBreaker {
    private state: CircuitState = 'CLOSED';
    private failures = 0;
    private successes = 0;
    private lastFailureTime = 0;

    private readonly failureThreshold: number;
    private readonly resetTimeoutMs: number;
    private readonly successThreshold: number;

    constructor(opts: CircuitBreakerOptions = {}) {
        this.failureThreshold = opts.failureThreshold ?? 5;
        this.resetTimeoutMs = opts.resetTimeoutMs ?? 30_000;
        this.successThreshold = opts.successThreshold ?? 2;
    }

    /** Execute a function through the circuit breaker. */
    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
                this.state = 'HALF_OPEN';
                this.successes = 0;
                console.log('[CircuitBreaker] Transitioning to HALF_OPEN');
            } else {
                throw new Error('Circuit breaker is OPEN — service unavailable');
            }
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (err) {
            this.onFailure();
            throw err;
        }
    }

    private onSuccess(): void {
        if (this.state === 'HALF_OPEN') {
            this.successes++;
            if (this.successes >= this.successThreshold) {
                this.state = 'CLOSED';
                this.failures = 0;
                console.log('[CircuitBreaker] ✅ Circuit CLOSED — service recovered');
            }
        } else {
            this.failures = 0; // Reset on success in CLOSED state
        }
    }

    private onFailure(): void {
        this.failures++;
        this.lastFailureTime = Date.now();
        if (this.state === 'HALF_OPEN' || this.failures >= this.failureThreshold) {
            this.state = 'OPEN';
            console.warn(`[CircuitBreaker] ⚡ Circuit OPEN after ${this.failures} failures`);
        }
    }

    getState(): CircuitState {
        return this.state;
    }
}

/** Shared circuit breaker instance for AI service calls */
export const aiCircuitBreaker = new CircuitBreaker({
    failureThreshold: 5,
    resetTimeoutMs: 30_000,
    successThreshold: 2,
});

// ── Public API ──────────────────────────────────────────────────────

/**
 * Start background health polling (every POLL_MS milliseconds).
 * Call once during server startup.
 */
export function startHealthMonitor(): void {
    // Run immediately, then on interval
    refreshAll();
    setInterval(refreshAll, POLL_MS);
    console.log(`[Health] Monitor started — polling every ${POLL_MS / 1000}s`);
}

/**
 * Wait for the AI service to become available.
 * Uses exponential back-off: delay doubles each attempt.
 *
 * @param maxRetries   Number of attempts (default 5)
 * @param baseDelayMs  Initial delay in ms (default 3000)
 * @returns true if AI came online, false if all retries exhausted
 */
export async function waitForAI(
    maxRetries = 5,
    baseDelayMs = 3000,
): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`[Health] Checking AI service… (attempt ${attempt}/${maxRetries})`);
        const online = await checkAI();
        if (online) {
            ServiceStatus.ai = true;
            console.log(`[Health] ✅ AI Service is ready after ${attempt} attempt(s).`);
            return true;
        }
        if (attempt < maxRetries) {
            const delay = Math.min(baseDelayMs * Math.pow(2, attempt - 1), 10_000); // cap at 10s
            console.log(`[Health] AI offline — retrying in ${delay / 1000}s…`);
            await new Promise(r => setTimeout(r, delay));
        }
    }
    console.warn(`[Health] ⚠️ AI Service did not come online after ${maxRetries} retries. Continuing in degraded mode.`);
    ServiceStatus.ai = false;
    return false;
}

/**
 * Express middleware that blocks requests to AI-dependent routes when
 * the AI service is offline. Returns HTTP 503 with a clear JSON message.
 */
export function requireAIService(req: Request, res: Response, next: NextFunction): void {
    if (!ServiceStatus.ai) {
        res.status(503).json({
            error: 'AI Service Unavailable',
            message: 'The AI service is temporarily offline. Please try again in a moment.',
            retryAfter: 30,
        });
        return;
    }
    next();
}

/**
 * Simple synchronous boolean helper for use inside socket handlers.
 */
export function isAIOnline(): boolean {
    return ServiceStatus.ai;
}
