'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Lock, User, Eye, EyeOff, AlertTriangle, CheckCircle2, Fingerprint, Cpu, ArrowRight } from 'lucide-react'
import axios from 'axios'

export default function AdminLoginPage() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [focusedField, setFocusedField] = useState<string | null>(null)

    // Check if already logged in
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const session = localStorage.getItem('admin_session')
            if (session) {
                try {
                    const parsed = JSON.parse(session)
                    if (parsed.token && parsed.expiresAt > Date.now()) {
                        router.push('/admin')
                        return
                    }
                } catch { /* invalid session */ }
                localStorage.removeItem('admin_session')
            }
        }
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const { data } = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/admin-login`,
                { username: username.trim(), password }
            )

            const session = {
                token: data.token,
                username: data.username,
                role: data.role,
                loginAt: Date.now(),
                expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24h
            }
            localStorage.setItem('admin_session', JSON.stringify(session))

            setSuccess(true)
            setTimeout(() => router.push('/admin'), 1200)

        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap');
                @keyframes gridPulse {
                    0%, 100% { opacity: 0.02; }
                    50% { opacity: 0.05; }
                }
                @keyframes scanline {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100vh); }
                }
                @keyframes borderGlow {
                    0%, 100% { border-color: rgba(139,92,246,0.15); }
                    50% { border-color: rgba(139,92,246,0.4); }
                }
                @keyframes shieldPulse {
                    0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.2); }
                    50% { box-shadow: 0 0 50px rgba(139,92,246,0.5); }
                }
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes orbitRing {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes typewriter {
                    from { width: 0; }
                    to { width: 100%; }
                }
                .admin-card {
                    animation: fadeSlideUp 0.8s ease-out forwards;
                }
                .admin-input:focus {
                    box-shadow: 0 0 0 1px rgba(139,92,246,0.3), 0 0 30px rgba(139,92,246,0.08);
                }
            `}</style>

            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #09090b 0%, #18181b 40%, #09090b 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                padding: 24,
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Background grid */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    animation: 'gridPulse 4s ease-in-out infinite'
                }} />

                {/* Scanline effect */}
                <div style={{
                    position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
                }}>
                    <div style={{
                        width: '100%', height: 2,
                        background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.1), transparent)',
                        animation: 'scanline 4s linear infinite',
                    }} />
                </div>

                {/* Glow orbs */}
                <div style={{
                    position: 'absolute', top: '20%', left: '15%',
                    width: 300, height: 300, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.06), transparent 70%)',
                    filter: 'blur(60px)', pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', bottom: '15%', right: '10%',
                    width: 400, height: 400, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(236,72,153,0.04), transparent 70%)',
                    filter: 'blur(80px)', pointerEvents: 'none',
                }} />

                {/* Main Card */}
                <div className="admin-card" style={{
                    width: '100%', maxWidth: 440,
                    background: 'rgba(24,24,27,0.8)',
                    backdropFilter: 'blur(40px)',
                    border: '1px solid rgba(139,92,246,0.12)',
                    borderRadius: 28, padding: 0,
                    position: 'relative', overflow: 'hidden',
                    boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 60px rgba(139,92,246,0.05)',
                }}>
                    {/* Top gradient line */}
                    <div style={{
                        height: 2,
                        background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), rgba(236,72,153,0.3), transparent)',
                    }} />

                    {/* Inner glow */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: 200,
                        background: 'radial-gradient(ellipse at center top, rgba(139,92,246,0.06), transparent 70%)',
                        pointerEvents: 'none',
                    }} />

                    <div style={{ padding: '40px 36px 36px' }}>
                        {/* Shield Icon */}
                        <div style={{ textAlign: 'center', marginBottom: 28 }}>
                            <div style={{
                                width: 72, height: 72, borderRadius: 20, margin: '0 auto 20px',
                                background: success
                                    ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                                    : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                position: 'relative',
                                animation: 'shieldPulse 3s ease-in-out infinite',
                                transition: 'all 0.5s ease',
                            }}>
                                {success ? (
                                    <CheckCircle2 size={32} color="white" />
                                ) : (
                                    <Shield size={32} color="white" />
                                )}
                                {/* Orbiting ring */}
                                <div style={{
                                    position: 'absolute', inset: -8, borderRadius: 24,
                                    border: '1px dashed rgba(139,92,246,0.2)',
                                    animation: 'orbitRing 6s linear infinite',
                                }} />
                                {/* Status dot */}
                                <div style={{
                                    position: 'absolute', top: -3, right: -3,
                                    width: 14, height: 14, borderRadius: '50%',
                                    background: success ? '#10b981' : '#7c3aed',
                                    border: '3px solid #18181b',
                                    boxShadow: success ? '0 0 12px rgba(16,185,129,0.6)' : '0 0 12px rgba(139,92,246,0.6)',
                                    transition: 'all 0.5s ease',
                                }} />
                            </div>

                            <h1 style={{
                                fontSize: 22, fontWeight: 900, letterSpacing: 3,
                                textTransform: 'uppercase',
                                fontFamily: "'Outfit', sans-serif",
                                background: success
                                    ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                                    : 'linear-gradient(135deg, #c4b5fd, #a78bfa)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                margin: '0 0 6px',
                                transition: 'all 0.5s ease',
                            }}>
                                {success ? 'Access Granted' : 'Administrator'}
                            </h1>
                            <p style={{
                                fontSize: 11, color: '#52525b', fontWeight: 600,
                                letterSpacing: 2, textTransform: 'uppercase',
                            }}>
                                {success ? 'Initializing command center...' : 'System Authentication Required'}
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={{
                                background: 'rgba(239,68,68,0.06)',
                                border: '1px solid rgba(239,68,68,0.15)',
                                borderRadius: 14, padding: '10px 16px',
                                marginBottom: 20,
                                display: 'flex', alignItems: 'center', gap: 10,
                            }}>
                                <AlertTriangle size={14} color="#ef4444" />
                                <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                                    {error}
                                </span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Username */}
                            <div style={{ marginBottom: 16 }}>
                                <label style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    fontSize: 9, fontWeight: 800, color: '#52525b',
                                    letterSpacing: 2.5, textTransform: 'uppercase',
                                    marginBottom: 8, marginLeft: 4,
                                }}>
                                    <Fingerprint size={11} color="#7c3aed" style={{ opacity: 0.6 }} />
                                    Identity Key
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{
                                        position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                                        color: focusedField === 'username' ? '#a78bfa' : '#3f3f46',
                                        transition: 'color 0.3s',
                                    }}>
                                        <User size={16} />
                                    </div>
                                    <input
                                        className="admin-input"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        onFocus={() => setFocusedField('username')}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="Administrator"
                                        required
                                        style={{
                                            width: '100%', height: 52, paddingLeft: 44, paddingRight: 16,
                                            background: 'rgba(255,255,255,0.02)',
                                            border: `1px solid ${focusedField === 'username' ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.05)'}`,
                                            borderRadius: 14, color: '#e4e4e7', fontSize: 14, fontWeight: 500,
                                            outline: 'none', transition: 'all 0.3s',
                                            fontFamily: "'Inter', sans-serif",
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div style={{ marginBottom: 24 }}>
                                <label style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    fontSize: 9, fontWeight: 800, color: '#52525b',
                                    letterSpacing: 2.5, textTransform: 'uppercase',
                                    marginBottom: 8, marginLeft: 4,
                                }}>
                                    <Lock size={11} color="#7c3aed" style={{ opacity: 0.6 }} />
                                    Access Token
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{
                                        position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                                        color: focusedField === 'password' ? '#a78bfa' : '#3f3f46',
                                        transition: 'color 0.3s',
                                    }}>
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        className="admin-input"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="••••••••••••"
                                        required
                                        style={{
                                            width: '100%', height: 52, paddingLeft: 44, paddingRight: 48,
                                            background: 'rgba(255,255,255,0.02)',
                                            border: `1px solid ${focusedField === 'password' ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.05)'}`,
                                            borderRadius: 14, color: '#e4e4e7', fontSize: 14, fontWeight: 500,
                                            outline: 'none', transition: 'all 0.3s',
                                            fontFamily: "'Inter', sans-serif",
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: '#52525b', padding: 4, transition: 'color 0.2s',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.color = '#a78bfa')}
                                        onMouseLeave={(e) => (e.currentTarget.style.color = '#52525b')}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || success}
                                style={{
                                    width: '100%', height: 52, borderRadius: 14,
                                    background: success
                                        ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                                        : 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)',
                                    border: 'none', color: 'white',
                                    fontSize: 10, fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase',
                                    cursor: loading || success ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    position: 'relative', overflow: 'hidden',
                                    transition: 'all 0.4s ease',
                                    boxShadow: success
                                        ? '0 10px 40px rgba(16,185,129,0.25)'
                                        : '0 10px 40px rgba(139,92,246,0.25)',
                                    opacity: loading ? 0.7 : 1,
                                }}
                            >
                                {/* Shimmer */}
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                                    animation: loading ? 'none' : 'scanline 3s linear infinite',
                                }} />
                                <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {success ? (
                                        <><CheckCircle2 size={14} /> Access Granted</>
                                    ) : loading ? (
                                        <><Cpu size={14} style={{ animation: 'orbitRing 1s linear infinite' }} /> Authenticating...</>
                                    ) : (
                                        <>Authorize Access <ArrowRight size={14} /></>
                                    )}
                                </span>
                            </button>
                        </form>

                        {/* Security badges */}
                        <div style={{
                            display: 'flex', justifyContent: 'center', gap: 20,
                            marginTop: 28, paddingTop: 20,
                            borderTop: '1px solid rgba(255,255,255,0.03)',
                        }}>
                            {[
                                { label: 'AES-256', icon: Lock },
                                { label: 'Admin Only', icon: Shield },
                                { label: 'Encrypted', icon: Fingerprint },
                            ].map(({ label, icon: Icon }) => (
                                <div key={label} style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    color: '#3f3f46', fontSize: 8, fontWeight: 800,
                                    letterSpacing: 2, textTransform: 'uppercase',
                                }}>
                                    <Icon size={10} style={{ opacity: 0.5 }} />
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
