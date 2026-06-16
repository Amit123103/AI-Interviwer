"use client"
import React, { useState, useRef, useEffect, useCallback } from "react"

/* ─── Types ─── */
interface EventImage { url: string; name: string }
interface EventData {
    id: string; name: string; college: string; organization: string; hostName: string; hostPhone: string;
    startDate: string; endDate: string; location: string; images: EventImage[]; type: "free" | "paid";
    amount: number; about: string; primaryUpi: string; secondaryUpi: string; qrImage: string;
    paymentPhone: string; paymentInstructions: string; createdBy: string; createdAt: string;
    category: string; maxCapacity: number; registrationDeadline: string;
}
interface Registration {
    id: string; eventId: string; studentName: string; regId: string; college: string; mobile: string;
    email: string; date: string; paymentStatus: "pending" | "verified"; paymentScreenshot: string; amount: number;
}
interface HackathonData {
    id: string; name: string; organization: string; college: string; hostName: string; hostPhone: string;
    location: string; startDate: string; endDate: string; images: EventImage[]; about: string;
    problemStatements: string; prizes: string; teamSizeMin: number; teamSizeMax: number; eligibility: string;
    type: "free" | "paid"; amount: number; primaryUpi: string; secondaryUpi: string; qrImage: string;
    paymentPhone: string; paymentInstructions: string; createdBy: string; createdAt: string;
    category: string; maxCapacity: number; registrationDeadline: string;
}
interface HackRegistration {
    id: string; hackathonId: string; studentName: string; email: string; regNumber: string; mobile: string;
    college: string; teamName: string; role: string; date: string; paymentStatus: "pending" | "verified";
    paymentScreenshot: string; amount: number;
}

/* ─── CSS Styles ─── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap');
.he-root{font-family:'Plus Jakarta Sans',sans-serif;background:#07070e;color:#fff;min-height:100vh}
.he-heading{font-family:'Inter','Plus Jakarta Sans',sans-serif;font-weight:800;letter-spacing:-0.02em}
.he-card{background:#0f0e1a;border:1px solid #1c1b2e;border-radius:16px;padding:24px;transition:all .3s;animation:cardIn .4s ease-out both}
.he-card:hover{border-color:#8b5cf640;box-shadow:0 0 30px #8b5cf610;transform:translateY(-2px)}
.he-btn{padding:12px 24px;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer;border:none;transition:all .2s;display:inline-flex;align-items:center;gap:8px}
.he-btn:active{transform:scale(.96)}
.he-btn-primary{background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff}
.he-btn-primary:hover{box-shadow:0 0 20px #8b5cf640;transform:translateY(-1px)}
.he-btn-amber{background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff}
.he-btn-amber:hover{box-shadow:0 0 20px #f59e0b40;transform:translateY(-1px)}
.he-btn-cyan{background:linear-gradient(135deg,#06b6d4,#0891b2);color:#fff}
.he-btn-cyan:hover{box-shadow:0 0 20px #06b6d440;transform:translateY(-1px)}
.he-btn-success{background:linear-gradient(135deg,#10b981,#059669);color:#fff}
.he-btn-success:hover{box-shadow:0 0 20px #10b98140}
.he-btn-danger{background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff}
.he-btn-danger:hover{box-shadow:0 0 20px #ef444440}
.he-btn-outline{background:transparent;border:1px solid #1c1b2e;color:#a78bfa}
.he-btn-outline:hover{border-color:#8b5cf6;background:#8b5cf610}
.he-btn-sm{padding:8px 16px;font-size:12px;border-radius:8px}
.he-btn-disabled{opacity:.5;pointer-events:none}
.he-btn-icon{padding:8px;border-radius:8px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;border:1px solid #1c1b2e;background:transparent;color:#a78bfa;transition:all .2s}
.he-btn-icon:hover{background:#8b5cf610;border-color:#8b5cf6}
.he-input{background:#13121f;border:1px solid #1c1b2e;border-radius:10px;padding:12px 16px;color:#fff;font-size:14px;width:100%;transition:all .3s;outline:none;font-family:inherit}
.he-input:focus{border-color:#8b5cf6;box-shadow:0 0 0 3px #8b5cf620}
.he-input-error{border-color:#ef4444!important;animation:shake .3s}
.he-input-valid{border-color:#10b981!important}
.he-label{font-size:13px;font-weight:600;color:#a1a1aa;margin-bottom:6px;display:block;transition:color .2s}
.he-label .req{color:#ef4444;margin-left:2px}
.he-error{color:#ef4444;font-size:11px;margin-top:4px;font-weight:500;animation:fadeIn .2s}
.he-badge{padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;display:inline-flex;align-items:center;gap:4px}
.he-badge-free{background:linear-gradient(135deg,#10b98130,#059669);color:#34d399}
.he-badge-paid{background:linear-gradient(135deg,#f59e0b30,#d97706);color:#fbbf24}
.he-badge-new{background:#8b5cf630;color:#c4b5fd;animation:pulse-glow 2s infinite}
.he-badge-pending{background:#f59e0b20;color:#fbbf24}
.he-badge-verified{background:#10b98120;color:#34d399}
.he-badge-live{background:#ef444420;color:#f87171;border:1px solid #ef444440;animation:pulse-glow-red 1.5s infinite}
.he-badge-upcoming{background:#8b5cf620;color:#c4b5fd;border:1px solid #8b5cf640}
.he-badge-ended{background:#52525b20;color:#71717a;border:1px solid #52525b40}
.he-stat{background:#13121f;border:1px solid #1c1b2e;border-radius:12px;padding:16px 20px;text-align:center;transition:all .3s}
.he-stat:hover{border-color:#8b5cf640;transform:translateY(-2px)}
.he-stat h4{font-size:28px;font-weight:800;margin:0}
.he-stat p{font-size:11px;color:#71717a;margin:4px 0 0}
.he-tab{padding:8px 20px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;border:none;background:transparent;color:#71717a;transition:all .2s}
.he-tab:hover{color:#a78bfa;background:#8b5cf610}
.he-tab-active{background:#8b5cf620;color:#a78bfa;border:1px solid #8b5cf640}
.he-stepper{display:flex;align-items:center;gap:8px;margin-bottom:32px}
.he-step{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:#52525b;transition:all .3s}
.he-step-active{color:#a78bfa}
.he-step-done{color:#10b981}
.he-step-num{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;background:#1c1b2e;color:#71717a;transition:all .3s}
.he-step-active .he-step-num{background:#8b5cf6;color:#fff;box-shadow:0 0 15px #8b5cf640}
.he-step-done .he-step-num{background:#10b981;color:#fff;box-shadow:0 0 10px #10b98140}
.he-step-line{width:40px;height:2px;background:#1c1b2e;border-radius:2px;transition:background .3s}
.he-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px}
.he-grid .he-card:nth-child(1){animation-delay:0s}.he-grid .he-card:nth-child(2){animation-delay:.05s}.he-grid .he-card:nth-child(3){animation-delay:.1s}.he-grid .he-card:nth-child(4){animation-delay:.15s}.he-grid .he-card:nth-child(5){animation-delay:.2s}.he-grid .he-card:nth-child(6){animation-delay:.25s}
.he-search{position:relative}
.he-search input{padding-left:40px}
.he-search svg{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#52525b}
.he-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(12px);z-index:100;display:flex;align-items:center;justify-content:center;animation:fadeIn .2s}
.he-modal{background:rgba(15,14,26,.92);backdrop-filter:blur(20px);border:1px solid #8b5cf620;border-radius:20px;max-width:600px;width:90%;max-height:90vh;overflow-y:auto;padding:24px;z-index:101;box-shadow:0 25px 50px rgba(0,0,0,.5)}
.he-table{width:100%;border-collapse:collapse;font-size:13px}
.he-table th{text-align:left;padding:12px 16px;color:#71717a;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #1c1b2e}
.he-table td{padding:12px 16px;border-bottom:1px solid #1c1b2e10;color:#d4d4d8;transition:background .2s}
.he-table tr:hover td{background:#ffffff05}
.he-upload-zone{border:2px dashed #1c1b2e;border-radius:12px;padding:40px;text-align:center;cursor:pointer;transition:all .3s;background:#0d0c16}
.he-upload-zone:hover{border-color:#8b5cf6;background:#8b5cf608}
.he-upload-zone.active{border-color:#8b5cf6;background:#8b5cf610;animation:pulse-zone 1s infinite}
.he-toast{position:fixed;top:20px;right:20px;z-index:200;padding:16px 24px;border-radius:12px;font-weight:600;font-size:14px;animation:slideIn .3s;max-width:400px;backdrop-filter:blur(12px)}
.he-toast-success{background:rgba(16,185,129,.15);border:1px solid #10b98140;color:#34d399}
.he-toast-error{background:rgba(239,68,68,.15);border:1px solid #ef444440;color:#f87171}
.he-toast-warning{background:rgba(245,158,11,.15);border:1px solid #f59e0b40;color:#fbbf24}
.he-toast-info{background:rgba(59,130,246,.15);border:1px solid #3b82f640;color:#60a5fa}
.he-img-preview{width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid #1c1b2e;transition:transform .2s}
.he-img-preview:hover{transform:scale(1.1)}
.he-copy-btn{background:#1c1b2e;border:none;color:#a78bfa;padding:4px 12px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;transition:all .2s}
.he-copy-btn:hover{background:#8b5cf620}
.he-hero-img{width:100%;height:300px;object-fit:cover;border-radius:16px;border:1px solid #1c1b2e}
.he-carousel{position:relative;overflow:hidden;border-radius:16px}
.he-carousel img{width:100%;height:300px;object-fit:cover;transition:opacity .3s}
.he-carousel-btn{position:absolute;top:50%;transform:translateY(-50%);background:rgba(15,14,26,.7);backdrop-filter:blur(8px);border:1px solid #1c1b2e;color:#fff;width:36px;height:36px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;transition:all .2s}
.he-carousel-btn:hover{background:#8b5cf630;border-color:#8b5cf6}
.he-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;background:#1c1b2e;color:#a1a1aa;transition:all .2s}
.he-chip:hover{background:#8b5cf620;color:#c4b5fd}
.he-confetti{position:fixed;inset:0;z-index:300;pointer-events:none}
.he-confetti span{position:absolute;width:8px;height:8px;border-radius:2px;animation:confetti-fall 3s ease-in forwards}
.he-toggle{display:flex;gap:0;background:#13121f;border-radius:10px;border:1px solid #1c1b2e;overflow:hidden}
.he-toggle button{padding:10px 24px;border:none;background:transparent;color:#71717a;font-weight:600;font-size:13px;cursor:pointer;transition:all .2s}
.he-toggle button.active{background:#8b5cf6;color:#fff;box-shadow:0 0 10px #8b5cf630}
.he-back-btn{background:none;border:none;color:#a78bfa;cursor:pointer;font-size:14px;font-weight:600;display:inline-flex;align-items:center;gap:6px;padding:8px 0;margin-bottom:16px;transition:all .2s}
.he-back-btn:hover{color:#c4b5fd;transform:translateX(-4px)}
.he-success-screen{text-align:center;padding:60px 20px;animation:fadeIn .5s}
.he-checkmark{width:80px;height:80px;border-radius:50%;background:#10b98120;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;animation:scaleIn .5s}
.he-count-up{animation:fadeIn .5s}
.he-progress{height:6px;background:#1c1b2e;border-radius:3px;overflow:hidden;margin-top:8px}
.he-progress-bar{height:100%;border-radius:3px;transition:width .6s ease-out}
.he-progress-violet{background:linear-gradient(90deg,#8b5cf6,#a78bfa)}
.he-progress-amber{background:linear-gradient(90deg,#f59e0b,#fbbf24)}
.he-progress-cyan{background:linear-gradient(90deg,#06b6d4,#22d3ee)}
.he-progress-green{background:linear-gradient(90deg,#10b981,#34d399)}
.he-progress-red{background:linear-gradient(90deg,#ef4444,#f87171)}
.he-donut{position:relative;width:120px;height:120px;border-radius:50%;display:flex;align-items:center;justify-content:center}
.he-donut-inner{position:absolute;width:80px;height:80px;border-radius:50%;background:#0f0e1a;display:flex;align-items:center;justify-content:center;flex-direction:column}
.he-countdown{font-family:'Inter',monospace;font-weight:700;font-size:11px;color:#f59e0b;display:flex;gap:4px;align-items:center}
.he-countdown-unit{background:#13121f;border:1px solid #1c1b2e;border-radius:4px;padding:2px 5px;text-align:center}
.he-skeleton{background:linear-gradient(90deg,#1c1b2e 25%,#2a2940 50%,#1c1b2e 75%);background-size:200% 100%;border-radius:8px;animation:skeleton-pulse 1.5s infinite}
.he-sort-select{background:#13121f;border:1px solid #1c1b2e;border-radius:8px;padding:8px 12px;color:#a78bfa;font-size:12px;font-weight:600;cursor:pointer;outline:none;font-family:inherit}
.he-sort-select:focus{border-color:#8b5cf6}
.he-activity{display:flex;align-items:center;gap:12px;padding:12px;border-radius:10px;background:#13121f;border:1px solid #1c1b2e;transition:all .2s}
.he-activity:hover{border-color:#8b5cf630}
.he-hero-mesh{background:radial-gradient(ellipse at 20% 50%,#8b5cf610 0%,transparent 55%),radial-gradient(ellipse at 80% 50%,#f59e0b08 0%,transparent 55%),radial-gradient(ellipse at 50% 0%,#06b6d408 0%,transparent 55%);position:relative;overflow:hidden}
.he-hero-mesh::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 30% 40%,#8b5cf608 0%,transparent 50%),radial-gradient(circle at 70% 60%,#f59e0b06 0%,transparent 50%);animation:mesh-shift 8s ease-in-out infinite alternate}
.he-checkbox{width:16px;height:16px;border:2px solid #1c1b2e;border-radius:4px;cursor:pointer;appearance:none;-webkit-appearance:none;background:transparent;transition:all .2s;position:relative}
.he-checkbox:checked{background:#8b5cf6;border-color:#8b5cf6}
.he-checkbox:checked::after{content:'✓';position:absolute;top:-2px;left:2px;font-size:11px;color:#fff;font-weight:700}
.he-confirm-modal{text-align:center;padding:32px}
.he-confirm-modal h3{font-size:20px;font-weight:800;margin-bottom:8px}
.he-confirm-modal p{color:#71717a;font-size:13px;margin-bottom:24px}
.he-shine{position:relative;overflow:hidden}
.he-shine::after{content:'';position:absolute;top:0;left:-100%;width:50%;height:100%;background:linear-gradient(90deg,transparent,#ffffff06,transparent);animation:shine 4s infinite}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
@keyframes pulse-glow{0%,100%{box-shadow:0 0 5px #8b5cf640}50%{box-shadow:0 0 20px #8b5cf660}}
@keyframes pulse-glow-red{0%,100%{box-shadow:0 0 5px #ef444430}50%{box-shadow:0 0 15px #ef444450}}
@keyframes fadeIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateX(100px)}to{opacity:1;transform:translateX(0)}}
@keyframes scaleIn{from{transform:scale(0)}to{transform:scale(1)}}
@keyframes cardIn{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes confetti-fall{0%{transform:translateY(-100vh) rotate(0);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
@keyframes pulse-zone{0%,100%{opacity:1}50%{opacity:.7}}
@keyframes shine{0%{left:-100%}100%{left:200%}}
@keyframes skeleton-pulse{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes mesh-shift{0%{opacity:.5;transform:scale(1)}100%{opacity:1;transform:scale(1.05)}}
@keyframes float{0%,100%{transform:translateY(0px)}50%{transform:translateY(-8px)}}
@keyframes countdown-tick{from{transform:scale(1.1)}to{transform:scale(1)}}
`;

/* ─── Helpers ─── */
const genId = (prefix: string) => prefix + Math.random().toString(36).substr(2, 6).toUpperCase();
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
const fmtDateTime = (d: string) => d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
const fmtPhone = (p: string) => {
    const d = p.replace(/\D/g, '');
    if (d.length <= 5) return d;
    return d.slice(0, 5) + ' ' + d.slice(5, 10);
};
const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const validateUpi = (u: string) => /^[\w.-]+@[\w]+$/.test(u);
const validatePhone = (p: string) => /^\d{10}$/.test(p.replace(/\D/g, ''));

const downloadCSV = (headers: string[], rows: string[][], filename: string) => {
    const csv = headers.join(',') + '\n' + rows.map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
};

const Confetti = ({ show }: { show: boolean }) => {
    if (!show) return null;
    const colors = ['#8b5cf6', '#f59e0b', '#06b6d4', '#10b981', '#ef4444', '#ec4899'];
    return (
        <div className="he-confetti">
            {Array.from({ length: 60 }).map((_, i) => (
                <span key={i} style={{
                    left: Math.random() * 100 + '%', top: -10,
                    background: colors[i % colors.length],
                    animationDelay: Math.random() * 2 + 's',
                    width: Math.random() * 8 + 4, height: Math.random() * 8 + 4,
                    borderRadius: Math.random() > .5 ? '50%' : '2px',
                }} />
            ))}
        </div>
    );
};

const Toast = ({ msg, show, type }: { msg: string; show: boolean; type?: string }) => {
    if (!show) return null;
    const icons: Record<string, string> = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const t = type || 'success';
    return <div className={`he-toast he-toast-${t}`}>{icons[t]} {msg}</div>;
};

const timeAgo = (d: string) => {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
};

const getCountdown = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff <= 0) return null;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return { d, h, m };
};

const getStatus = (start: string, end: string) => {
    const now = Date.now();
    if (now < new Date(start).getTime()) return 'upcoming';
    if (now <= new Date(end).getTime()) return 'live';
    return 'ended';
};

const shareItem = async (name: string, url: string) => {
    const data = { title: name, text: `Check out: ${name}`, url };
    if (navigator.share) { try { await navigator.share(data); } catch { } }
    else { navigator.clipboard?.writeText(`${name} — ${url}`); }
};

const CATEGORIES = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Social', 'Other'];

const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>;
const BackArrow = () => <span>←</span>;
const CopyIcon = () => <span>📋</span>;

/* ═══ MAIN COMPONENT ═══ */
export default function HackathonsEventsPage() {
    /* ─── View state ─── */
    const [view, setView] = useState("menu");
    const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
    const [confetti, setConfetti] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{ show: boolean; title: string; msg: string; onConfirm: () => void }>({ show: false, title: '', msg: '', onConfirm: () => { } });
    const [eventSort, setEventSort] = useState("newest");
    const [hackSort, setHackSort] = useState("newest");
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState("");
    const [bulkSelected, setBulkSelected] = useState<string[]>([]);
    const [, setTick] = useState(0);
    const [currentUser] = useState(() => {
        if (typeof window !== 'undefined') {
            const u = localStorage.getItem('user');
            return u ? JSON.parse(u)._id || 'user1' : 'user1';
        }
        return 'user1';
    });

    /* ─── Events state ─── */
    const [events, setEvents] = useState<EventData[]>([]);
    const [eventRegs, setEventRegs] = useState<Registration[]>([]);
    const [eventSearch, setEventSearch] = useState("");
    const [eventFilter, setEventFilter] = useState("all");
    const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

    /* ─── Event creation state ─── */
    const [eventStep, setEventStep] = useState(1);
    const [eventForm, setEventForm] = useState<Partial<EventData>>({ type: "free", amount: 0, images: [], category: 'Technical', maxCapacity: 0, registrationDeadline: '' });
    const [eventErrors, setEventErrors] = useState<Record<string, string>>({});
    const eventImageRef = useRef<HTMLInputElement>(null);
    const eventQrRef = useRef<HTMLInputElement>(null);

    /* ─── Event registration state ─── */
    const [regForm, setRegForm] = useState<Partial<Registration>>({});
    const [regErrors, setRegErrors] = useState<Record<string, string>>({});
    const [paymentScreenshot, setPaymentScreenshot] = useState("");
    const paymentScreenshotRef = useRef<HTMLInputElement>(null);

    /* ─── Hackathons state ─── */
    const [hackathons, setHackathons] = useState<HackathonData[]>([]);
    const [hackRegs, setHackRegs] = useState<HackRegistration[]>([]);
    const [hackSearch, setHackSearch] = useState("");
    const [hackFilter, setHackFilter] = useState("all");
    const [selectedHack, setSelectedHack] = useState<HackathonData | null>(null);

    /* ─── Hackathon creation state ─── */
    const [hackStep, setHackStep] = useState(1);
    const [hackForm, setHackForm] = useState<Partial<HackathonData>>({ type: "free", amount: 0, images: [], teamSizeMin: 1, teamSizeMax: 4, category: 'Technical', maxCapacity: 0, registrationDeadline: '' });
    const [hackErrors, setHackErrors] = useState<Record<string, string>>({});
    const hackImageRef = useRef<HTMLInputElement>(null);
    const hackQrRef = useRef<HTMLInputElement>(null);

    /* ─── Hack registration state ─── */
    const [hackRegForm, setHackRegForm] = useState<Partial<HackRegistration>>({ role: "Solo" });
    const [hackRegErrors, setHackRegErrors] = useState<Record<string, string>>({});
    const [hackPaymentScreenshot, setHackPaymentScreenshot] = useState("");
    const hackPayScreenshotRef = useRef<HTMLInputElement>(null);

    /* ─── Host dashboard state ─── */
    const [hostTab, setHostTab] = useState("all");
    const [hostSearch, setHostSearch] = useState("");
    const [screenshotModal, setScreenshotModal] = useState<string | null>(null);
    const [carouselIdx, setCarouselIdx] = useState(0);
    const [regSuccess, setRegSuccess] = useState<{ id: string; name: string; type: string } | null>(null);

    /* ─── Load from localStorage ─── */
    useEffect(() => {
        try {
            const e = localStorage.getItem('he_events');
            const er = localStorage.getItem('he_event_regs');
            const h = localStorage.getItem('he_hackathons');
            const hr = localStorage.getItem('he_hack_regs');
            if (e) setEvents(JSON.parse(e));
            if (er) setEventRegs(JSON.parse(er));
            if (h) setHackathons(JSON.parse(h));
            if (hr) setHackRegs(JSON.parse(hr));
        } catch { }
    }, []);

    /* ─── Persist to localStorage ─── */
    useEffect(() => { try { localStorage.setItem('he_events', JSON.stringify(events)); } catch { } }, [events]);
    useEffect(() => { try { localStorage.setItem('he_event_regs', JSON.stringify(eventRegs.map(r => ({ ...r, paymentScreenshot: '' })))); } catch { } }, [eventRegs]);
    useEffect(() => { try { localStorage.setItem('he_hackathons', JSON.stringify(hackathons)); } catch { } }, [hackathons]);
    useEffect(() => { try { localStorage.setItem('he_hack_regs', JSON.stringify(hackRegs.map(r => ({ ...r, paymentScreenshot: '' })))); } catch { } }, [hackRegs]);

    const showToast = useCallback((msg: string, type: string = 'success') => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ show: false, msg: "", type: "success" }), 3000);
    }, []);

    /* ─── Countdown ticker ─── */
    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 60000);
        return () => clearInterval(timer);
    }, []);

    const showConfetti = useCallback(() => {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 3000);
    }, []);

    /* ─── Image handling ─── */
    const handleImages = (files: FileList | null, setter: (fn: (p: any) => any) => void, field: string, max = 5) => {
        if (!files) return;
        Array.from(files).slice(0, max).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setter((prev: any) => ({
                    ...prev,
                    [field]: [...(prev[field] || []), { url: e.target?.result as string, name: file.name }]
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    const handleSingleImage = (file: File | null, callback: (url: string) => void) => {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { showToast("File too large! Max 5MB"); return; }
        const reader = new FileReader();
        reader.onload = (e) => callback(e.target?.result as string);
        reader.readAsDataURL(file);
    };

    /* ═══ RENDER PLACEHOLDER — screens will follow ═══ */

    /* ─── SCREEN: Main Menu ─── */
    const renderMenu = () => {
        const allRegs = [...eventRegs, ...hackRegs];
        const recentActivity = allRegs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
        const totalRevenue = [...eventRegs.filter(r => r.paymentStatus === 'verified'), ...hackRegs.filter(r => r.paymentStatus === 'verified')].reduce((s, r) => s + r.amount, 0);
        return (
            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
                {/* Hero */}
                <div className="he-hero-mesh" style={{ borderRadius: 24, padding: '48px 32px', textAlign: 'center', marginBottom: 32, border: '1px solid #1c1b2e' }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: 56, marginBottom: 12, animation: 'float 3s ease-in-out infinite' }}>🏆</div>
                        <h1 className="he-heading" style={{ fontSize: 40, background: 'linear-gradient(135deg,#8b5cf6,#f59e0b,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>
                            Hackathons & Events
                        </h1>
                        <p style={{ color: '#71717a', fontSize: 15, maxWidth: 500, margin: '0 auto 24px' }}>Organize, manage & register for college events and hackathons</p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button className="he-btn he-btn-amber" onClick={() => { setEventForm({ type: 'free', amount: 0, images: [], category: 'Technical', maxCapacity: 0, registrationDeadline: '' }); setEventStep(1); setEventErrors({}); setEditMode(false); setEditId(''); setView('createEvent'); }}>📅 Create Event</button>
                            <button className="he-btn he-btn-cyan" onClick={() => { setHackForm({ type: 'free', amount: 0, images: [], teamSizeMin: 1, teamSizeMax: 4, category: 'Technical', maxCapacity: 0, registrationDeadline: '' }); setHackStep(1); setHackErrors({}); setEditMode(false); setEditId(''); setView('createHackathon'); }}>💻 Create Hackathon</button>
                        </div>
                    </div>
                </div>

                {/* Live Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 32 }}>
                    <div className="he-stat"><h4 style={{ color: '#f59e0b' }}>{events.length}</h4><p>📅 Events</p></div>
                    <div className="he-stat"><h4 style={{ color: '#06b6d4' }}>{hackathons.length}</h4><p>💻 Hackathons</p></div>
                    <div className="he-stat"><h4 style={{ color: '#8b5cf6' }}>{allRegs.length}</h4><p>📝 Registrations</p></div>
                    <div className="he-stat"><h4 style={{ color: '#10b981' }}>₹{totalRevenue}</h4><p>💰 Revenue</p></div>
                </div>

                {/* Main Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 32 }}>
                    <div className="he-card he-shine" style={{ cursor: 'pointer', textAlign: 'center', padding: 40 }} onClick={() => setView("eventsHub")}>
                        <div style={{ fontSize: 48, marginBottom: 16, animation: 'float 3s ease-in-out infinite' }}>📅</div>
                        <h2 className="he-heading" style={{ fontSize: 22, marginBottom: 8 }}>Organize & View Events</h2>
                        <p style={{ color: '#71717a', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>Create events, manage registrations, track payments and download reports</p>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
                            <span className="he-chip">📊 {eventRegs.length} registrations</span>
                        </div>
                        <button className="he-btn he-btn-amber" style={{ width: '100%', justifyContent: 'center' }}>Go to Events →</button>
                    </div>
                    <div className="he-card he-shine" style={{ cursor: 'pointer', textAlign: 'center', padding: 40 }} onClick={() => setView("hackathonsHub")}>
                        <div style={{ fontSize: 48, marginBottom: 16, animation: 'float 3s ease-in-out infinite 0.5s' }}>💻</div>
                        <h2 className="he-heading" style={{ fontSize: 22, marginBottom: 8 }}>Organize & View Hackathons</h2>
                        <p style={{ color: '#71717a', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>Host hackathons, manage teams, track participants and download reports</p>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
                            <span className="he-chip">👥 {hackRegs.length} participants</span>
                        </div>
                        <button className="he-btn he-btn-cyan" style={{ width: '100%', justifyContent: 'center' }}>Go to Hackathons →</button>
                    </div>
                </div>

                {/* Recent Activity */}
                {recentActivity.length > 0 && (
                    <div>
                        <h3 className="he-heading" style={{ fontSize: 18, marginBottom: 16 }}>⚡ Recent Activity</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {recentActivity.map((r, i) => {
                                const isEvent = 'regId' in r;
                                const name = isEvent ? events.find(e => e.id === (r as Registration).eventId)?.name : hackathons.find(h => h.id === (r as HackRegistration).hackathonId)?.name;
                                return (
                                    <div key={i} className="he-activity">
                                        <span style={{ fontSize: 20 }}>{isEvent ? '📅' : '💻'}</span>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: 13, fontWeight: 600 }}>{r.studentName} registered</p>
                                            <p style={{ fontSize: 11, color: '#71717a' }}>{name}</p>
                                        </div>
                                        <span style={{ fontSize: 11, color: '#52525b' }}>{timeAgo(r.date)}</span>
                                        <span className={`he-badge ${r.paymentStatus === 'verified' ? 'he-badge-verified' : 'he-badge-pending'}`}>
                                            {r.paymentStatus === 'verified' ? '✅' : '⏳'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    /* continued in next section - PLACEHOLDER */
    const renderEventsHub = () => {
        const filtered = events.filter(e => {
            const q = eventSearch.toLowerCase();
            const mQ = !q || e.name.toLowerCase().includes(q) || e.college.toLowerCase().includes(q);
            if (!mQ) return false;
            if (eventFilter === "my") return e.createdBy === currentUser;
            if (eventFilter === "registered") return eventRegs.some(r => r.eventId === e.id);
            if (eventFilter === "free") return e.type === "free";
            if (eventFilter === "paid") return e.type === "paid";
            return true;
        });
        const sorted = [...filtered].sort((a, b) => {
            if (eventSort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (eventSort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (eventSort === 'name') return a.name.localeCompare(b.name);
            if (eventSort === 'popular') return eventRegs.filter(r => r.eventId === b.id).length - eventRegs.filter(r => r.eventId === a.id).length;
            return 0;
        });
        const duplicateEvent = (ev: EventData) => {
            setEventForm({ ...ev, images: ev.images || [] });
            setEventStep(1); setEventErrors({}); setEditMode(false); setEditId(''); setView("createEvent");
            showToast("Event duplicated — edit and publish!", "info");
        };
        return (
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
                <button className="he-back-btn" onClick={() => setView("menu")}>← Back to Menu</button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
                    <h1 className="he-heading" style={{ fontSize: 32 }}>📅 Events</h1>
                    <button className="he-btn he-btn-amber" onClick={() => { setEventForm({ type: 'free', amount: 0, images: [], category: 'Technical', maxCapacity: 0, registrationDeadline: '' }); setEventStep(1); setEventErrors({}); setEditMode(false); setEditId(''); setView("createEvent"); }}>+ Organize an Event</button>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                    <div className="he-search" style={{ flex: 1, minWidth: 200 }}><SearchIcon /><input className="he-input" placeholder="Search events..." value={eventSearch} onChange={e => setEventSearch(e.target.value)} /></div>
                    <select className="he-sort-select" value={eventSort} onChange={e => setEventSort(e.target.value)}>
                        <option value="newest">🕐 Newest First</option><option value="oldest">🕐 Oldest First</option>
                        <option value="name">🔤 Name A-Z</option><option value="popular">🔥 Most Popular</option>
                    </select>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                    {([["all", "All Events"], ["my", "My Events"], ["registered", "Registered"], ["free", "Free"], ["paid", "Paid"]] as const).map(([k, l]) => (
                        <button key={k} className={`he-tab ${eventFilter === k ? 'he-tab-active' : ''}`} onClick={() => setEventFilter(k)}>{l}</button>
                    ))}
                </div>
                {sorted.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, color: '#52525b' }}><div style={{ fontSize: 48, marginBottom: 16 }}>📅</div><p style={{ fontWeight: 600 }}>No events found</p><p style={{ fontSize: 13, marginTop: 4 }}>Create your first event to get started!</p></div>
                ) : (
                    <div className="he-grid">{sorted.map(ev => {
                        const status = getStatus(ev.startDate, ev.endDate);
                        const regCount = eventRegs.filter(r => r.eventId === ev.id).length;
                        const cdl = ev.registrationDeadline ? getCountdown(ev.registrationDeadline) : null;
                        const deadlinePassed = ev.registrationDeadline && new Date(ev.registrationDeadline) < new Date();
                        const capacityFull = ev.maxCapacity > 0 && regCount >= ev.maxCapacity;
                        return (
                            <div key={ev.id} className="he-card he-shine" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ height: 160, background: ev.images?.[0]?.url ? `url(${ev.images[0].url}) center/cover` : 'linear-gradient(135deg,#1c1b2e,#0f0e1a)', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 4 }}>
                                        <span className={`he-badge he-badge-${status}`}>{status === 'live' ? '🔴 LIVE' : status === 'upcoming' ? '🟣 Upcoming' : '⚫ Ended'}</span>
                                    </div>
                                    <span className={`he-badge ${ev.type === 'free' ? 'he-badge-free' : 'he-badge-paid'}`} style={{ position: 'absolute', top: 12, right: 12 }}>{ev.type === 'free' ? '🎟 FREE' : `💰 ₹${ev.amount}`}</span>
                                    {ev.category && <span className="he-badge" style={{ position: 'absolute', bottom: 12, left: 12, background: '#0f0e1a90', backdropFilter: 'blur(4px)', color: '#a78bfa' }}>{ev.category}</span>}
                                </div>
                                <div style={{ padding: 20 }}>
                                    <h3 className="he-heading" style={{ fontSize: 18, marginBottom: 8 }}>{ev.name}</h3>
                                    <p style={{ color: '#71717a', fontSize: 12, marginBottom: 4 }}>🏫 {ev.college} • {ev.organization}</p>
                                    <p style={{ color: '#71717a', fontSize: 12, marginBottom: 4 }}>📍 {ev.location?.slice(0, 50)}</p>
                                    <div className="he-badge" style={{ background: '#1c1b2e', color: '#a78bfa', margin: '8px 0' }}>📆 {fmtDate(ev.startDate)} — {fmtDate(ev.endDate)}</div>
                                    {/* Capacity Bar */}
                                    {ev.maxCapacity > 0 && (
                                        <div style={{ marginBottom: 8 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#71717a' }}>
                                                <span>👥 {regCount}/{ev.maxCapacity}</span>
                                                <span>{Math.round((regCount / ev.maxCapacity) * 100)}%</span>
                                            </div>
                                            <div className="he-progress"><div className={`he-progress-bar ${regCount / ev.maxCapacity > 0.8 ? 'he-progress-red' : 'he-progress-violet'}`} style={{ width: `${Math.min(100, (regCount / ev.maxCapacity) * 100)}%` }} /></div>
                                        </div>
                                    )}
                                    {/* Countdown */}
                                    {cdl && !deadlinePassed && (
                                        <div className="he-countdown" style={{ marginBottom: 8 }}>
                                            <span>⏰</span>
                                            <span className="he-countdown-unit">{cdl.d}d</span>
                                            <span className="he-countdown-unit">{cdl.h}h</span>
                                            <span className="he-countdown-unit">{cdl.m}m</span>
                                            <span style={{ fontSize: 10, color: '#71717a' }}>left</span>
                                        </div>
                                    )}
                                    {deadlinePassed && <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600, marginBottom: 8 }}>🚫 Registration Closed</div>}
                                    {capacityFull && <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600, marginBottom: 8 }}>🚫 Capacity Full</div>}
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        <button className={`he-btn he-btn-primary he-btn-sm ${deadlinePassed || capacityFull ? 'he-btn-disabled' : ''}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setSelectedEvent(ev); setRegForm({}); setRegErrors({}); setCarouselIdx(0); setView("eventDetail"); }}>View & Register</button>
                                        {ev.createdBy === currentUser && <>
                                            <button className="he-btn-icon" title="Manage" onClick={() => { setSelectedEvent(ev); setHostTab("all"); setHostSearch(""); setBulkSelected([]); setView("eventHostDash"); }}>📊</button>
                                            <button className="he-btn-icon" title="Duplicate" onClick={() => duplicateEvent(ev)}>📋</button>
                                            <button className="he-btn-icon" title="Share" onClick={() => shareItem(ev.name, window.location.href)}>🔗</button>
                                        </>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}</div>
                )}
            </div>
        );
    };
    const validateEventStep1 = () => {
        const errs: Record<string, string> = {};
        if (!eventForm.name?.trim()) errs.name = "Required";
        if (!eventForm.college?.trim()) errs.college = "Required";
        if (!eventForm.organization?.trim()) errs.organization = "Required";
        if (!eventForm.hostName?.trim()) errs.hostName = "Required";
        if (!eventForm.hostPhone || !validatePhone(eventForm.hostPhone)) errs.hostPhone = "Valid 10-digit number required";
        if (!eventForm.startDate) errs.startDate = "Required";
        if (!eventForm.endDate) errs.endDate = "Required";
        if (eventForm.startDate && eventForm.endDate && new Date(eventForm.endDate) <= new Date(eventForm.startDate)) errs.endDate = "Must be after start";
        if (!eventForm.location?.trim()) errs.location = "Required";
        if (!eventForm.about || eventForm.about.length < 50) errs.about = "Min 50 characters";
        if (eventForm.type === "paid" && (!eventForm.amount || eventForm.amount <= 0)) errs.amount = "Enter valid amount";
        setEventErrors(errs);
        return Object.keys(errs).length === 0;
    };
    const validateEventStep2 = () => {
        if (eventForm.type === "free") return true;
        const errs: Record<string, string> = {};
        if (!eventForm.primaryUpi || !validateUpi(eventForm.primaryUpi)) errs.primaryUpi = "Valid UPI (name@bank)";
        if (!eventForm.paymentPhone || !validatePhone(eventForm.paymentPhone)) errs.paymentPhone = "Valid 10-digit number";
        setEventErrors(errs);
        return Object.keys(errs).length === 0;
    };
    const publishEvent = () => {
        const ev: EventData = {
            id: genId('EVT-'), name: eventForm.name || '', college: eventForm.college || '', organization: eventForm.organization || '',
            hostName: eventForm.hostName || '', hostPhone: eventForm.hostPhone || '', startDate: eventForm.startDate || '', endDate: eventForm.endDate || '',
            location: eventForm.location || '', images: eventForm.images || [], type: eventForm.type || 'free', amount: eventForm.amount || 0,
            about: eventForm.about || '', primaryUpi: eventForm.primaryUpi || '', secondaryUpi: eventForm.secondaryUpi || '',
            qrImage: eventForm.qrImage || '', paymentPhone: eventForm.paymentPhone || '', paymentInstructions: eventForm.paymentInstructions || '',
            createdBy: currentUser, createdAt: new Date().toISOString(),
            category: eventForm.category || 'Technical', maxCapacity: eventForm.maxCapacity || 0, registrationDeadline: eventForm.registrationDeadline || '',
        };
        if (editMode && editId) {
            setEvents(prev => prev.map(e => e.id === editId ? ev : e));
            showToast('Event Updated Successfully!');
        } else {
            setEvents(prev => [...prev, ev]);
            showConfetti(); showToast('Event Published Successfully!');
        }
        setEditMode(false); setEditId('');
        setTimeout(() => setView('eventsHub'), 1500);
    };
    const eF = (field: string, val: any) => setEventForm(p => ({ ...p, [field]: val }));
    const renderStepper = (step: number, labels: string[]) => (
        <div className="he-stepper">{labels.map((l, i) => (
            <React.Fragment key={i}>
                <div className={`he-step ${step === i + 1 ? 'he-step-active' : step > i + 1 ? 'he-step-done' : ''}`}>
                    <div className="he-step-num">{step > i + 1 ? '✓' : i + 1}</div><span>{l}</span>
                </div>
                {i < labels.length - 1 && <div className="he-step-line" />}
            </React.Fragment>
        ))}</div>
    );
    const renderField = (label: string, field: string, errors: Record<string, string>, val: string, onChange: (v: string) => void, opts?: { type?: string; textarea?: boolean; placeholder?: string }) => (
        <div style={{ marginBottom: 16 }}>
            <label className="he-label">{label}<span className="req">*</span></label>
            {opts?.textarea ? (
                <textarea className={`he-input ${errors[field] ? 'he-input-error' : val ? 'he-input-valid' : ''}`} rows={3} value={val || ''} onChange={e => onChange(e.target.value)} placeholder={opts?.placeholder} style={{ resize: 'vertical' }} />
            ) : (
                <input className={`he-input ${errors[field] ? 'he-input-error' : val ? 'he-input-valid' : ''}`} type={opts?.type || 'text'} value={val || ''} onChange={e => onChange(e.target.value)} placeholder={opts?.placeholder} />
            )}
            {errors[field] && <div className="he-error">{errors[field]}</div>}
            {field === 'about' && <div style={{ fontSize: 11, color: '#52525b', marginTop: 4 }}>{(val || '').length}/50 min</div>}
        </div>
    );
    const renderCreateEvent = () => (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px' }}>
            <button className="he-back-btn" onClick={() => { if (eventStep > 1) setEventStep(eventStep - 1); else setView("eventsHub"); }}>← Back</button>
            <h1 className="he-heading" style={{ fontSize: 28, marginBottom: 24 }}>📅 Create Event</h1>
            {renderStepper(eventStep, ["Details", "Payment Setup", "Review & Publish"])}
            {eventStep === 1 && (
                <div className="he-card">
                    {renderField("Event Name", "name", eventErrors, eventForm.name || '', v => eF('name', v))}
                    {renderField("College Name", "college", eventErrors, eventForm.college || '', v => eF('college', v))}
                    {renderField("Organization Name", "organization", eventErrors, eventForm.organization || '', v => eF('organization', v))}
                    {renderField("Host Name", "hostName", eventErrors, eventForm.hostName || '', v => eF('hostName', v))}
                    {renderField("Host Contact Number", "hostPhone", eventErrors, eventForm.hostPhone || '', v => eF('hostPhone', v.replace(/\D/g, '').slice(0, 10)), { placeholder: "10-digit number" })}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {renderField("Start Date & Time", "startDate", eventErrors, eventForm.startDate || '', v => eF('startDate', v), { type: 'datetime-local' })}
                        {renderField("End Date & Time", "endDate", eventErrors, eventForm.endDate || '', v => eF('endDate', v), { type: 'datetime-local' })}
                    </div>
                    {renderField("Event Location", "location", eventErrors, eventForm.location || '', v => eF('location', v), { textarea: true, placeholder: "Street, City, State, PIN" })}
                    <div style={{ marginBottom: 16 }}>
                        <label className="he-label">Event Images (up to 5)</label>
                        <input ref={eventImageRef} type="file" accept="image/*" multiple hidden onChange={e => handleImages(e.target.files, setEventForm, 'images', 5)} />
                        <div className="he-upload-zone" onClick={() => eventImageRef.current?.click()}>📷 Click to upload images</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                            {(eventForm.images || []).map((img, i) => (
                                <div key={i} style={{ position: 'relative' }}>
                                    <img src={img.url} className="he-img-preview" alt="" />
                                    <button style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', border: 'none', color: '#fff', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 10 }}
                                        onClick={() => setEventForm(p => ({ ...p, images: p.images?.filter((_, j) => j !== i) }))}>✕</button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label className="he-label">Event Type<span className="req">*</span></label>
                        <div className="he-toggle">
                            <button className={eventForm.type === 'free' ? 'active' : ''} onClick={() => eF('type', 'free')}>🎟 Free</button>
                            <button className={eventForm.type === 'paid' ? 'active' : ''} onClick={() => eF('type', 'paid')}>💰 Paid</button>
                        </div>
                    </div>
                    {eventForm.type === 'paid' && renderField("Registration Amount (₹)", "amount", eventErrors, String(eventForm.amount || ''), v => eF('amount', Number(v)), { type: 'number' })}
                    {renderField("About the Event", "about", eventErrors, eventForm.about || '', v => eF('about', v), { textarea: true, placeholder: "Describe your event (min 50 chars)" })}
                    <button className="he-btn he-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                        onClick={() => { if (validateEventStep1()) { setEventStep(eventForm.type === 'free' ? 3 : 2); setEventErrors({}); } }}>Continue to Payment Setup →</button>
                </div>
            )}
            {eventStep === 2 && (
                <div className="he-card">
                    <h2 className="he-heading" style={{ fontSize: 20, marginBottom: 20 }}>💳 Payment Setup</h2>
                    {renderField("Primary UPI ID", "primaryUpi", eventErrors, eventForm.primaryUpi || '', v => eF('primaryUpi', v), { placeholder: "name@bank" })}
                    <div style={{ marginBottom: 16 }}>
                        <label className="he-label">Secondary UPI ID (optional)</label>
                        <input className="he-input" value={eventForm.secondaryUpi || ''} onChange={e => eF('secondaryUpi', e.target.value)} placeholder="backup@bank" />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label className="he-label">Upload QR Code Image</label>
                        <input ref={eventQrRef} type="file" accept="image/*" hidden onChange={e => handleSingleImage(e.target.files?.[0] || null, url => eF('qrImage', url))} />
                        <div className="he-upload-zone" onClick={() => eventQrRef.current?.click()}>📱 Upload UPI QR code</div>
                        {eventForm.qrImage && <img src={eventForm.qrImage} className="he-img-preview" style={{ marginTop: 8, width: 120, height: 120 }} alt="QR" />}
                    </div>
                    {renderField("Payment Mobile Number", "paymentPhone", eventErrors, eventForm.paymentPhone || '', v => eF('paymentPhone', v.replace(/\D/g, '').slice(0, 10)))}
                    <div style={{ marginBottom: 16 }}>
                        <label className="he-label">Payment Instructions (optional)</label>
                        <textarea className="he-input" rows={2} value={eventForm.paymentInstructions || ''} onChange={e => eF('paymentInstructions', e.target.value)} placeholder="Any instructions for registrants" />
                    </div>
                    <button className="he-btn he-btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => { if (validateEventStep2()) { setEventStep(3); setEventErrors({}); } }}>Continue to Review →</button>
                </div>
            )}
            {eventStep === 3 && (
                <div className="he-card">
                    <h2 className="he-heading" style={{ fontSize: 20, marginBottom: 20 }}>📋 Review & Publish</h2>
                    <div style={{ background: '#13121f', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{eventForm.name}</h3>
                        <p style={{ color: '#71717a', fontSize: 13, marginBottom: 4 }}>🏫 {eventForm.college} • {eventForm.organization}</p>
                        <p style={{ color: '#71717a', fontSize: 13, marginBottom: 4 }}>👤 {eventForm.hostName} • 📞 {fmtPhone(eventForm.hostPhone || '')}</p>
                        <p style={{ color: '#71717a', fontSize: 13, marginBottom: 4 }}>📆 {fmtDateTime(eventForm.startDate || '')} → {fmtDateTime(eventForm.endDate || '')}</p>
                        <p style={{ color: '#71717a', fontSize: 13, marginBottom: 8 }}>📍 {eventForm.location}</p>
                        <span className={`he-badge ${eventForm.type === 'free' ? 'he-badge-free' : 'he-badge-paid'}`}>{eventForm.type === 'free' ? '🎟 FREE' : `💰 ₹${eventForm.amount}`}</span>
                        <p style={{ color: '#a1a1aa', fontSize: 13, marginTop: 12, lineHeight: 1.6 }}>{eventForm.about}</p>
                    </div>
                    {eventForm.type === 'paid' && (
                        <div style={{ background: '#13121f', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>💳 Payment Details</h4>
                            <p style={{ color: '#71717a', fontSize: 12 }}>UPI: {eventForm.primaryUpi} {eventForm.secondaryUpi && `| ${eventForm.secondaryUpi}`}</p>
                            <p style={{ color: '#71717a', fontSize: 12 }}>Contact: {eventForm.paymentPhone}</p>
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className="he-btn he-btn-outline" onClick={() => setEventStep(1)}>Edit Details</button>
                        {eventForm.type === 'paid' && <button className="he-btn he-btn-outline" onClick={() => setEventStep(2)}>Edit Payment</button>}
                        <button className="he-btn he-btn-success" style={{ flex: 1, justifyContent: 'center' }} onClick={publishEvent}>🚀 Publish Event</button>
                    </div>
                </div>
            )}
        </div>
    );
    const renderEventDetail = () => {
        const ev = selectedEvent; if (!ev) return <div />;
        const imgs = ev.images || [];
        const regCount = eventRegs.filter(r => r.eventId === ev.id).length;
        const capacityFull = ev.maxCapacity > 0 && regCount >= ev.maxCapacity;

        const validateReg = () => {
            const errs: Record<string, string> = {};
            if (!regForm.studentName?.trim()) errs.studentName = "Required";
            if (!regForm.regId?.trim()) errs.regId = "Required";
            if (!regForm.college?.trim()) errs.college = "Required";
            if (!regForm.mobile || !validatePhone(regForm.mobile)) errs.mobile = "Valid 10-digit number";
            if (!regForm.email || !validateEmail(regForm.email)) errs.email = "Valid email required";
            setRegErrors(errs); return Object.keys(errs).length === 0;
        };
        const submitFreeReg = () => {
            if (!validateReg()) return;
            const reg: Registration = { id: genId('EVT-'), eventId: ev.id, studentName: regForm.studentName || '', regId: regForm.regId || '', college: regForm.college || '', mobile: regForm.mobile || '', email: regForm.email || '', date: new Date().toISOString(), paymentStatus: 'verified', paymentScreenshot: '', amount: 0 };
            setEventRegs(prev => [...prev, reg]);
            setRegSuccess({ id: reg.id, name: ev.name, type: 'free' }); showConfetti(); setView("regSuccess");
        };
        return (
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
                <button className="he-back-btn" onClick={() => setView("eventsHub")}>← Back to Events</button>
                {imgs.length > 0 && (
                    <div className="he-carousel" style={{ marginBottom: 24 }}>
                        <img src={imgs[carouselIdx]?.url} alt={ev.name} />
                        {imgs.length > 1 && (<><button className="he-carousel-btn" style={{ left: 12 }} onClick={() => setCarouselIdx(i => (i - 1 + imgs.length) % imgs.length)}>‹</button><button className="he-carousel-btn" style={{ right: 12 }} onClick={() => setCarouselIdx(i => (i + 1) % imgs.length)}>›</button></>)}
                        <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                            {imgs.map((_, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i === carouselIdx ? '#8b5cf6' : '#ffffff40', transition: '0.3s' }} />)}
                        </div>
                    </div>
                )}
                <h1 className="he-heading" style={{ fontSize: 32, marginBottom: 12 }}>{ev.name}</h1>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                    <span className="he-chip">🏫 {ev.college}</span><span className="he-chip">🏢 {ev.organization}</span>
                    {ev.category && <span className="he-chip">📂 {ev.category}</span>}
                    <span className={`he-badge ${ev.type === 'free' ? 'he-badge-free' : 'he-badge-paid'}`}>{ev.type === 'free' ? '🎟 FREE' : `💰 ₹${ev.amount}`}</span>
                </div>
                <div className="he-card he-shine" style={{ marginBottom: 24, padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div><p style={{ color: '#a1a1aa', fontSize: 13, marginBottom: 4 }}>👤 <strong>{ev.hostName}</strong></p><p style={{ color: '#71717a', fontSize: 13 }}>📞 {fmtPhone(ev.hostPhone)}</p></div>
                        <div style={{ textAlign: 'right' }}>
                            <div className="he-badge" style={{ background: '#1c1b2e', color: '#22d3ee', marginBottom: 8 }}>📆 {fmtDateTime(ev.startDate)} → {fmtDateTime(ev.endDate)}</div>
                            <p style={{ color: '#a1a1aa', fontSize: 13 }}>📍 {ev.location}</p>
                        </div>
                    </div>
                    {ev.maxCapacity > 0 && (
                        <div style={{ padding: 16, background: '#13121f', borderRadius: 12, marginTop: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#a1a1aa', marginBottom: 8 }}>
                                <span>👥 Registration Fill Status</span>
                                <span style={{ color: capacityFull ? '#ef4444' : '#22d3ee', fontWeight: 600 }}>{regCount}/{ev.maxCapacity} {capacityFull && "(Full)"}</span>
                            </div>
                            <div className="he-progress"><div className={`he-progress-bar ${capacityFull ? 'he-progress-red' : 'he-progress-cyan'}`} style={{ width: `${Math.min(100, (regCount / ev.maxCapacity) * 100)}%` }} /></div>
                        </div>
                    )}
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: '24px 0 8px' }}>About Event</h3>
                    <p style={{ color: '#a1a1aa', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{ev.about}</p>
                </div>
                {!capacityFull ? (
                    <div className="he-card">
                        <h2 className="he-heading" style={{ fontSize: 20, marginBottom: 20 }}>📝 Register for This Event</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {renderField("Student Name", "studentName", regErrors, regForm.studentName || '', v => setRegForm(p => ({ ...p, studentName: v })))}
                            {renderField("College Registration ID", "regId", regErrors, regForm.regId || '', v => setRegForm(p => ({ ...p, regId: v })))}
                        </div>
                        {renderField("College Name", "college", regErrors, regForm.college || '', v => setRegForm(p => ({ ...p, college: v })))}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {renderField("Mobile Number", "mobile", regErrors, regForm.mobile || '', v => setRegForm(p => ({ ...p, mobile: v.replace(/\D/g, '').slice(0, 10) })), { placeholder: "10-digit number" })}
                            {renderField("Email Address", "email", regErrors, regForm.email || '', v => setRegForm(p => ({ ...p, email: v })), { placeholder: "student@email.com" })}
                        </div>
                        {ev.type === 'free' ? (
                            <button className="he-btn he-btn-success" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={submitFreeReg}>✅ Complete Registration</button>
                        ) : (
                            <button className="he-btn he-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={() => { if (validateReg()) { setPaymentScreenshot(''); setView("eventPayment"); } }}>Continue to Payment →</button>
                        )}
                    </div>
                ) : (
                    <div className="he-card" style={{ textAlign: 'center', padding: 40, background: '#1c1b2e', borderStyle: 'dashed' }}>
                        <div style={{ fontSize: 40, marginBottom: 16 }}>🚫</div>
                        <h3 className="he-heading" style={{ fontSize: 20, color: '#ef4444' }}>Registration Closed</h3>
                        <p style={{ color: '#a1a1aa', marginTop: 8 }}>This event has reached its maximum capacity of {ev.maxCapacity} participants.</p>
                    </div>
                )}
            </div>
        );
    };
    const renderEventPayment = () => {
        const ev = selectedEvent; if (!ev) return <div />;
        const copyText = (t: string) => { navigator.clipboard?.writeText(t); showToast("Copied to clipboard!"); };
        const submitPaidReg = () => {
            if (!paymentScreenshot) { showToast("Please upload payment screenshot"); return; }
            const reg: Registration = { id: genId('EVT-'), eventId: ev.id, studentName: regForm.studentName || '', regId: regForm.regId || '', college: regForm.college || '', mobile: regForm.mobile || '', email: regForm.email || '', date: new Date().toISOString(), paymentStatus: 'pending', paymentScreenshot, amount: ev.amount };
            setEventRegs(prev => [...prev, reg]);
            setRegSuccess({ id: reg.id, name: ev.name, type: 'paid' }); showConfetti(); setView("regSuccess");
        };
        return (
            <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px' }}>
                <button className="he-back-btn" onClick={() => setView("eventDetail")}>← Back to Details</button>
                <h1 className="he-heading" style={{ fontSize: 24, marginBottom: 24 }}>💳 Complete Registration Payment</h1>

                <div className="he-card he-shine" style={{ marginBottom: 24, textAlign: 'center', padding: '32px 20px' }}>
                    <p style={{ color: '#a1a1aa', fontSize: 13, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Amount to Pay</p>
                    <h2 className="he-heading" style={{ fontSize: 48, color: '#f59e0b', margin: 0 }}>₹{ev.amount}</h2>
                    <p style={{ color: '#71717a', fontSize: 13, marginTop: 8 }}>For {ev.name}</p>
                </div>

                <div className="he-card" style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Payment Options</h3>
                    {ev.primaryUpi && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#13121f', border: '1px solid #1c1b2e', padding: '12px 16px', borderRadius: 12, marginBottom: 12 }}>
                            <div>
                                <span style={{ color: '#a1a1aa', fontSize: 11, display: 'block', marginBottom: 4 }}>Primary UPI ID</span>
                                <strong style={{ color: '#f8fafc', fontSize: 15, letterSpacing: 0.5 }}>{ev.primaryUpi}</strong>
                            </div>
                            <button className="he-btn he-btn-sm he-btn-outline" style={{ padding: '6px 12px' }} onClick={() => copyText(ev.primaryUpi)}>📋 Copy</button>
                        </div>
                    )}
                    {ev.secondaryUpi && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#13121f', border: '1px solid #1c1b2e', padding: '12px 16px', borderRadius: 12, marginBottom: 12 }}>
                            <div>
                                <span style={{ color: '#a1a1aa', fontSize: 11, display: 'block', marginBottom: 4 }}>Secondary UPI ID</span>
                                <strong style={{ color: '#f8fafc', fontSize: 15, letterSpacing: 0.5 }}>{ev.secondaryUpi}</strong>
                            </div>
                            <button className="he-btn he-btn-sm he-btn-outline" style={{ padding: '6px 12px' }} onClick={() => copyText(ev.secondaryUpi)}>📋 Copy</button>
                        </div>
                    )}
                    {ev.qrImage && (
                        <div style={{ textAlign: 'center', margin: '24px 0', padding: '20px 0', borderTop: '1px dashed #1c1b2e', borderBottom: '1px dashed #1c1b2e' }}>
                            <p style={{ color: '#a1a1aa', fontSize: 13, marginBottom: 12 }}>Or scan QR Code</p>
                            <img src={ev.qrImage} alt="Payment QR" style={{ maxWidth: 200, borderRadius: 16, border: '4px solid #13121f', boxShadow: '0 8px 32px #00000040' }} />
                        </div>
                    )}
                    {ev.paymentPhone && <p style={{ color: '#a1a1aa', fontSize: 13, marginTop: 16 }}>📞 Contact for Payment Issues: <strong>{fmtPhone(ev.paymentPhone)}</strong></p>}
                    {ev.paymentInstructions && (
                        <div style={{ marginTop: 16, padding: 12, background: '#8b5cf615', borderRadius: 8, borderLeft: '4px solid #8b5cf6' }}>
                            <p style={{ color: '#c4b5fd', fontSize: 13, margin: 0 }}><strong>Instructions:</strong> {ev.paymentInstructions}</p>
                        </div>
                    )}
                </div>

                <div className="he-card">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📸 Upload Payment Proof</h3>
                    <p style={{ color: '#a1a1aa', fontSize: 13, marginBottom: 16 }}>Upload a clear screenshot of your successful transaction. Max size 5MB (JPG/PNG/WebP).</p>
                    <input ref={paymentScreenshotRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e => handleSingleImage(e.target.files?.[0] || null, url => setPaymentScreenshot(url))} />

                    {!paymentScreenshot ? (
                        <div className="he-upload-zone" onClick={() => paymentScreenshotRef.current?.click()} style={{ padding: 40 }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>📤</div>
                            <div style={{ fontWeight: 600 }}>Click to upload screenshot</div>
                        </div>
                    ) : (
                        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '2px solid #10b981' }}>
                            <img src={paymentScreenshot} alt="Screenshot" style={{ width: '100%', display: 'block' }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#000000a0', backdropFilter: 'blur(4px)', padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#10b981', fontSize: 13, fontWeight: 600 }}>✅ Uploaded</span>
                                <button className="he-btn he-btn-sm he-btn-outline" style={{ background: '#00000080', border: 'none' }} onClick={() => paymentScreenshotRef.current?.click()}>Change</button>
                            </div>
                        </div>
                    )}

                    <button className={`he-btn he-btn-success ${!paymentScreenshot ? 'he-btn-disabled' : ''}`} style={{ width: '100%', justifyContent: 'center', marginTop: 24, padding: 16, fontSize: 16 }} onClick={submitPaidReg}>✅ Complete Registration</button>
                </div>
            </div>
        );
    };
    const renderEventHostDashboard = () => {
        const ev = selectedEvent; if (!ev) return <div />;
        const regs = eventRegs.filter(r => r.eventId === ev.id);
        const q = hostSearch.toLowerCase();
        const filtered = regs.filter(r => !q || r.studentName.toLowerCase().includes(q) || r.college.toLowerCase().includes(q) || r.email.toLowerCase().includes(q));
        const verified = regs.filter(r => r.paymentStatus === 'verified').length;
        const pending = regs.filter(r => r.paymentStatus === 'pending').length;
        const total = regs.reduce((s, r) => s + (r.paymentStatus === 'verified' ? r.amount : 0), 0);
        const vPct = regs.length > 0 ? (verified / regs.length) * 100 : 0;

        const verifyPayment = (id: string) => {
            setEventRegs(prev => prev.map(r => r.id === id ? { ...r, paymentStatus: 'verified' } : r));
            showToast("Payment verified!");
        };
        const deleteReg = (id: string) => {
            setConfirmModal({
                show: true, title: 'Delete Registration', msg: 'Are you sure? This action cannot be undone.', onConfirm: () => {
                    setEventRegs(prev => prev.filter(r => r.id !== id));
                    setConfirmModal(p => ({ ...p, show: false }));
                    showToast("Registration deleted", "info");
                }
            });
        };
        const bulkVerify = () => {
            if (bulkSelected.length === 0) return;
            setEventRegs(prev => prev.map(r => bulkSelected.includes(r.id) ? { ...r, paymentStatus: 'verified' } : r));
            setBulkSelected([]);
            showToast(`${bulkSelected.length} payments verified!`, "success");
        };
        const editEvent = () => {
            setEventForm({ ...ev }); setEventStep(1); setEventErrors({});
            setEditMode(true); setEditId(ev.id); setView("createEvent");
        };
        const deleteEvent = () => {
            setConfirmModal({
                show: true, title: 'Delete Event', msg: `Are you sure you want to delete "${ev.name}"? This will also delete all its registrations.`, onConfirm: () => {
                    setEvents(prev => prev.filter(e => e.id !== ev.id));
                    setEventRegs(prev => prev.filter(r => r.eventId !== ev.id));
                    setConfirmModal(p => ({ ...p, show: false }));
                    showToast("Event deleted", "warning");
                    setView("eventsHub");
                }
            });
        };
        const exportRegs = () => {
            const headers = ['#', 'Student Name', 'College', 'Reg ID', 'Mobile', 'Email', 'Date', 'Payment Status', 'Amount', 'Screenshot'];
            const rows = regs.map((r, i) => [String(i + 1), r.studentName, r.college, r.regId, r.mobile, r.email, fmtDate(r.date), r.paymentStatus, String(r.amount), r.paymentScreenshot ? 'Yes' : 'No']);
            downloadCSV(headers, rows, `${ev.name}_registrants.csv`);
        };
        return (
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
                <button className="he-back-btn" onClick={() => setView("eventsHub")}>← Back to Events</button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 8 }}>
                    <div>
                        <h1 className="he-heading" style={{ fontSize: 28, marginBottom: 4 }}>📊 {ev.name}</h1>
                        <p style={{ color: '#71717a', fontSize: 13, marginBottom: 24 }}>Published {fmtDate(ev.createdAt)} • {ev.maxCapacity > 0 ? `${regs.length}/${ev.maxCapacity} capacity` : `${regs.length} registered`}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="he-btn he-btn-sm he-btn-outline" onClick={editEvent}>✏️ Edit Event</button>
                        <button className="he-btn he-btn-sm he-btn-outline" style={{ color: '#ef4444', borderColor: '#451a1a' }} onClick={deleteEvent}>🗑 Delete</button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 32 }}>
                    <div className="he-card">
                        <h3 className="he-heading" style={{ fontSize: 16, marginBottom: 16 }}>Registration Analytics</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                            {regs.length > 0 ? (
                                <div className="he-donut" style={{ '--pct': `${vPct}%`, '--c': '#10b981' } as any} />
                            ) : (
                                <div style={{ width: 80, height: 80, borderRadius: '50%', border: '8px solid #1c1b2e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#52525b', fontSize: 11 }}>No data</div>
                            )}
                            <div>
                                <div style={{ marginBottom: 8 }}><span style={{ color: '#10b981', fontWeight: 600 }}>{verified}</span> Verified</div>
                                <div><span style={{ color: '#f59e0b', fontWeight: 600 }}>{pending}</span> Pending</div>
                                <div style={{ marginTop: 8, fontSize: 11, color: '#71717a' }}>Total: {regs.length}</div>
                            </div>
                        </div>
                    </div>
                    <div className="he-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h3 className="he-heading" style={{ fontSize: 16, marginBottom: 8 }}>Total Revenue</h3>
                        <h2 className="he-heading" style={{ fontSize: 48, color: '#f59e0b', margin: '0' }}>₹{total}</h2>
                        <p style={{ color: '#10b981', fontSize: 13, marginTop: 8 }}>↑ From {verified} verified payments</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {([["all", "All Registrants"], ["payments", "Payment Records"]] as const).map(([k, l]) => (
                            <button key={k} className={`he-tab ${hostTab === k ? 'he-tab-active' : ''}`} onClick={() => setHostTab(k)}>{l}</button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {bulkSelected.length > 0 && <button className="he-btn he-btn-sm he-btn-success" onClick={bulkVerify}>✅ Verify Selected ({bulkSelected.length})</button>}
                        <button className="he-btn he-btn-sm he-btn-outline" onClick={exportRegs}>⬇️ Download CSV</button>
                    </div>
                </div>
                <div className="he-search" style={{ marginBottom: 16 }}><SearchIcon /><input className="he-input" placeholder="Search registrants..." value={hostSearch} onChange={e => setHostSearch(e.target.value)} /></div>

                <div className="he-card" style={{ padding: 0, overflow: 'auto' }}>
                    <table className="he-table">
                        <thead><tr>
                            <td style={{ width: 40 }}><input type="checkbox" className="he-checkbox" checked={filtered.length > 0 && bulkSelected.length === filtered.length} onChange={e => setBulkSelected(e.target.checked ? filtered.map(r => r.id) : [])} /></td>
                            <th>#</th><th>Name</th><th>College</th><th>Reg ID</th><th>Mobile</th><th>Email</th><th>Date</th><th>Status</th><th>Actions</th>
                        </tr></thead>
                        <tbody>{filtered.length === 0 ? <tr><td colSpan={10} style={{ textAlign: 'center', color: '#52525b', padding: 40 }}>No registrations found</td></tr> : filtered.map((r, i) => (
                            <tr key={r.id} className="he-tr-anim" style={{ animationDelay: `${i * 0.05}s` }}>
                                <td><input type="checkbox" className="he-checkbox" checked={bulkSelected.includes(r.id)} onChange={e => setBulkSelected(p => e.target.checked ? [...p, r.id] : p.filter(x => x !== r.id))} /></td>
                                <td>{i + 1}</td>
                                <td><strong style={{ color: '#f8fafc' }}>{r.studentName}</strong></td>
                                <td>{r.college}</td><td><span className="he-chip" style={{ fontSize: 10 }}>{r.regId}</span></td>
                                <td>{r.mobile}</td><td>{r.email}</td><td><span style={{ color: '#a1a1aa' }}>{fmtDate(r.date)}</span><br /><span style={{ fontSize: 10, color: '#52525b' }}>{timeAgo(r.date)}</span></td>
                                <td><span className={`he-badge ${r.paymentStatus === 'verified' ? 'he-badge-verified' : 'he-badge-pending'}`}>{r.paymentStatus === 'verified' ? '✅ Verified' : '⏳ Pending'}</span></td>
                                <td style={{ display: 'flex', gap: 4 }}>
                                    {r.paymentStatus === 'pending' && <button className="he-btn he-btn-sm he-btn-success" style={{ padding: '4px 12px' }} onClick={() => verifyPayment(r.id)}>Verify</button>}
                                    {r.paymentScreenshot && <button className="he-btn he-btn-sm he-btn-outline" style={{ padding: '4px 12px' }} onClick={() => setScreenshotModal(r.paymentScreenshot)}>📷 View</button>}
                                    <button className="he-btn-icon" style={{ padding: 4, width: 28, height: 28, color: '#ef4444' }} title="Delete" onClick={() => deleteReg(r.id)}>🗑</button>
                                </td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            </div>
        );
    };
    const renderHackathonsHub = () => {
        const now = new Date();
        const filtered = hackathons.filter(h => {
            const q = hackSearch.toLowerCase();
            const mQ = !q || h.name.toLowerCase().includes(q) || h.college.toLowerCase().includes(q);
            if (!mQ) return false;
            if (hackFilter === "my") return h.createdBy === currentUser;
            if (hackFilter === "registered") return hackRegs.some(r => r.hackathonId === h.id);
            if (hackFilter === "free") return h.type === "free";
            if (hackFilter === "paid") return h.type === "paid";
            if (hackFilter === "upcoming") return new Date(h.startDate) > now;
            if (hackFilter === "ongoing") return new Date(h.startDate) <= now && new Date(h.endDate) >= now;
            if (hackFilter === "ended") return new Date(h.endDate) < now;
            return true;
        });
        const sorted = [...filtered].sort((a, b) => {
            if (hackSort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (hackSort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (hackSort === 'name') return a.name.localeCompare(b.name);
            if (hackSort === 'popular') return hackRegs.filter(r => r.hackathonId === b.id).length - hackRegs.filter(r => r.hackathonId === a.id).length;
            return 0;
        });
        const duplicateHack = (h: HackathonData) => {
            setHackForm({ ...h, images: h.images || [] });
            setHackStep(1); setHackErrors({}); setEditMode(false); setEditId(''); setView("createHackathon");
            showToast("Hackathon duplicated — edit and publish!", "info");
        };
        return (
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
                <button className="he-back-btn" onClick={() => setView("menu")}>← Back to Menu</button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
                    <h1 className="he-heading" style={{ fontSize: 32 }}>💻 Hackathons</h1>
                    <button className="he-btn he-btn-cyan" onClick={() => { setHackForm({ type: 'free', amount: 0, images: [], teamSizeMin: 1, teamSizeMax: 4, category: 'Technical', maxCapacity: 0, registrationDeadline: '' }); setHackStep(1); setHackErrors({}); setEditMode(false); setEditId(''); setView("createHackathon"); }}>+ Organize a Hackathon</button>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                    <div className="he-search" style={{ flex: 1, minWidth: 200 }}><SearchIcon /><input className="he-input" placeholder="Search hackathons..." value={hackSearch} onChange={e => setHackSearch(e.target.value)} /></div>
                    <select className="he-sort-select" value={hackSort} onChange={e => setHackSort(e.target.value)}>
                        <option value="newest">🕐 Newest First</option><option value="oldest">🕐 Oldest First</option>
                        <option value="name">🔤 Name A-Z</option><option value="popular">🔥 Most Popular</option>
                    </select>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                    {([["all", "All"], ["my", "My Hackathons"], ["registered", "Registered"], ["upcoming", "Upcoming"], ["ongoing", "Ongoing"], ["ended", "Ended"]] as const).map(([k, l]) => (
                        <button key={k} className={`he-tab ${hackFilter === k ? 'he-tab-active' : ''}`} onClick={() => setHackFilter(k)}>{l}</button>
                    ))}
                </div>
                {sorted.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, color: '#52525b' }}><div style={{ fontSize: 48, marginBottom: 16 }}>💻</div><p style={{ fontWeight: 600 }}>No hackathons found</p><p style={{ fontSize: 13, marginTop: 4 }}>Organize your first hackathon to get started!</p></div>
                ) : (
                    <div className="he-grid">{sorted.map(h => {
                        const status = getStatus(h.startDate, h.endDate);
                        const regCount = hackRegs.filter(r => r.hackathonId === h.id).length;
                        const cdl = h.registrationDeadline ? getCountdown(h.registrationDeadline) : null;
                        const deadlinePassed = h.registrationDeadline && new Date(h.registrationDeadline) < new Date();
                        const capacityFull = h.maxCapacity > 0 && regCount >= h.maxCapacity;
                        return (
                            <div key={h.id} className="he-card he-shine" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ height: 160, background: h.images?.[0]?.url ? `url(${h.images[0].url}) center/cover` : 'linear-gradient(135deg,#06b6d420,#0f0e1a)', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 4 }}>
                                        <span className={`he-badge he-badge-${status}`}>{status === 'live' ? '🔴 LIVE' : status === 'upcoming' ? '🟣 Upcoming' : '⚫ Ended'}</span>
                                    </div>
                                    <span className={`he-badge ${h.type === 'free' ? 'he-badge-free' : 'he-badge-paid'}`} style={{ position: 'absolute', top: 12, right: 12 }}>{h.type === 'free' ? '🎟 FREE' : `💰 ₹${h.amount}`}</span>
                                    {h.category && <span className="he-badge" style={{ position: 'absolute', bottom: 12, left: 12, background: '#0f0e1a90', backdropFilter: 'blur(4px)', color: '#22d3ee' }}>{h.category}</span>}
                                </div>
                                <div style={{ padding: 20 }}>
                                    <h3 className="he-heading" style={{ fontSize: 18, marginBottom: 8 }}>{h.name}</h3>
                                    <p style={{ color: '#71717a', fontSize: 12, marginBottom: 4 }}>🏫 {h.college} • {h.organization}</p>
                                    <p style={{ color: '#71717a', fontSize: 12, marginBottom: 4 }}>📍 {h.location?.slice(0, 50)}</p>
                                    <div className="he-badge" style={{ background: '#1c1b2e', color: '#22d3ee', margin: '8px 0' }}>📆 {fmtDate(h.startDate)} — {fmtDate(h.endDate)}</div>
                                    {/* Capacity Bar */}
                                    {h.maxCapacity > 0 && (
                                        <div style={{ marginBottom: 8 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#71717a' }}>
                                                <span>👥 {regCount}/{h.maxCapacity}</span>
                                                <span>{Math.round((regCount / h.maxCapacity) * 100)}%</span>
                                            </div>
                                            <div className="he-progress"><div className={`he-progress-bar ${regCount / h.maxCapacity > 0.8 ? 'he-progress-red' : 'he-progress-cyan'}`} style={{ width: `${Math.min(100, (regCount / h.maxCapacity) * 100)}%` }} /></div>
                                        </div>
                                    )}
                                    {/* Countdown */}
                                    {cdl && !deadlinePassed && (
                                        <div className="he-countdown" style={{ marginBottom: 8 }}>
                                            <span>⏰</span>
                                            <span className="he-countdown-unit">{cdl.d}d</span>
                                            <span className="he-countdown-unit">{cdl.h}h</span>
                                            <span className="he-countdown-unit">{cdl.m}m</span>
                                            <span style={{ fontSize: 10, color: '#71717a' }}>left</span>
                                        </div>
                                    )}
                                    {deadlinePassed && <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600, marginBottom: 8 }}>🚫 Registration Closed</div>}
                                    {capacityFull && <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600, marginBottom: 8 }}>🚫 Capacity Full</div>}
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        <button className={`he-btn he-btn-cyan he-btn-sm ${deadlinePassed || capacityFull ? 'he-btn-disabled' : ''}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setSelectedHack(h); setHackRegForm({ role: 'Solo' }); setHackRegErrors({}); setCarouselIdx(0); setView("hackathonDetail"); }}>View & Register</button>
                                        {h.createdBy === currentUser && <>
                                            <button className="he-btn-icon" title="Manage" onClick={() => { setSelectedHack(h); setHostTab("all"); setHostSearch(""); setBulkSelected([]); setView("hackHostDash"); }}>📊</button>
                                            <button className="he-btn-icon" title="Duplicate" onClick={() => duplicateHack(h)}>📋</button>
                                            <button className="he-btn-icon" title="Share" onClick={() => shareItem(h.name, window.location.href)}>🔗</button>
                                        </>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}</div>
                )}
            </div>
        );
    };
    const hF = (field: string, val: any) => setHackForm(p => ({ ...p, [field]: val }));
    const validateHackStep1 = () => {
        const errs: Record<string, string> = {};
        if (!hackForm.name?.trim()) errs.name = "Required";
        if (!hackForm.organization?.trim()) errs.organization = "Required";
        if (!hackForm.college?.trim()) errs.college = "Required";
        if (!hackForm.hostName?.trim()) errs.hostName = "Required";
        if (!hackForm.hostPhone || !validatePhone(hackForm.hostPhone)) errs.hostPhone = "Valid 10-digit number";
        if (!hackForm.location?.trim()) errs.location = "Required";
        if (!hackForm.startDate) errs.startDate = "Required";
        if (!hackForm.endDate) errs.endDate = "Required";
        if (hackForm.startDate && hackForm.endDate && new Date(hackForm.endDate) <= new Date(hackForm.startDate)) errs.endDate = "Must be after start";
        if (!hackForm.about || hackForm.about.length < 50) errs.about = "Min 50 characters";
        setHackErrors(errs); return Object.keys(errs).length === 0;
    };
    const validateHackStep2 = () => {
        if (hackForm.type === "free") return true;
        const errs: Record<string, string> = {};
        if (!hackForm.amount || hackForm.amount <= 0) errs.amount = "Enter valid amount";
        if (!hackForm.primaryUpi || !validateUpi(hackForm.primaryUpi)) errs.primaryUpi = "Valid UPI";
        if (!hackForm.paymentPhone || !validatePhone(hackForm.paymentPhone)) errs.paymentPhone = "Valid number";
        setHackErrors(errs); return Object.keys(errs).length === 0;
    };
    const publishHackathon = () => {
        const h: HackathonData = {
            id: genId('HACK-'), name: hackForm.name || '', organization: hackForm.organization || '', college: hackForm.college || '',
            hostName: hackForm.hostName || '', hostPhone: hackForm.hostPhone || '', location: hackForm.location || '',
            startDate: hackForm.startDate || '', endDate: hackForm.endDate || '', images: hackForm.images || [], about: hackForm.about || '',
            problemStatements: hackForm.problemStatements || '', prizes: hackForm.prizes || '', teamSizeMin: hackForm.teamSizeMin || 1,
            teamSizeMax: hackForm.teamSizeMax || 4, eligibility: hackForm.eligibility || '', type: hackForm.type || 'free',
            amount: hackForm.amount || 0, primaryUpi: hackForm.primaryUpi || '', secondaryUpi: hackForm.secondaryUpi || '',
            qrImage: hackForm.qrImage || '', paymentPhone: hackForm.paymentPhone || '', paymentInstructions: hackForm.paymentInstructions || '',
            createdBy: currentUser, createdAt: new Date().toISOString(),
            category: hackForm.category || 'Technical', maxCapacity: hackForm.maxCapacity || 0, registrationDeadline: hackForm.registrationDeadline || '',
        };
        if (editMode && editId) {
            setHackathons(prev => prev.map(x => x.id === editId ? h : x));
            showToast('Hackathon Updated Successfully!');
        } else {
            setHackathons(prev => [...prev, h]);
            showConfetti(); showToast('Hackathon Published Successfully!');
        }
        setEditMode(false); setEditId('');
        setTimeout(() => setView('hackathonsHub'), 1500);
    };
    const renderCreateHackathon = () => (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px' }}>
            <button className="he-back-btn" onClick={() => { if (hackStep > 1) setHackStep(hackStep - 1); else setView("hackathonsHub"); }}>← Back</button>
            <h1 className="he-heading" style={{ fontSize: 28, marginBottom: 24 }}>💻 Create Hackathon</h1>
            {renderStepper(hackStep, ["Details", "Payment Setup", "Review & Publish"])}
            {hackStep === 1 && (
                <div className="he-card">
                    {renderField("Hackathon Name", "name", hackErrors, hackForm.name || '', v => hF('name', v))}
                    {renderField("Organization Name", "organization", hackErrors, hackForm.organization || '', v => hF('organization', v))}
                    {renderField("College Name", "college", hackErrors, hackForm.college || '', v => hF('college', v))}
                    {renderField("Host Name", "hostName", hackErrors, hackForm.hostName || '', v => hF('hostName', v))}
                    {renderField("Host Phone", "hostPhone", hackErrors, hackForm.hostPhone || '', v => hF('hostPhone', v.replace(/\D/g, '').slice(0, 10)), { placeholder: "10-digit number" })}
                    {renderField("Location", "location", hackErrors, hackForm.location || '', v => hF('location', v), { textarea: true, placeholder: "Full address" })}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {renderField("Start Date", "startDate", hackErrors, hackForm.startDate || '', v => hF('startDate', v), { type: 'datetime-local' })}
                        {renderField("End Date", "endDate", hackErrors, hackForm.endDate || '', v => hF('endDate', v), { type: 'datetime-local' })}
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label className="he-label">Upload Images (up to 5)</label>
                        <input ref={hackImageRef} type="file" accept="image/*" multiple hidden onChange={e => handleImages(e.target.files, setHackForm, 'images', 5)} />
                        <div className="he-upload-zone" onClick={() => hackImageRef.current?.click()}>📷 Upload images</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                            {(hackForm.images || []).map((img, i) => (
                                <div key={i} style={{ position: 'relative' }}><img src={img.url} className="he-img-preview" alt="" />
                                    <button style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', border: 'none', color: '#fff', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 10 }}
                                        onClick={() => setHackForm(p => ({ ...p, images: p.images?.filter((_, j) => j !== i) }))} >✕</button>
                                </div>
                            ))}
                        </div>
                    </div>
                    {renderField("About the Hackathon", "about", hackErrors, hackForm.about || '', v => hF('about', v), { textarea: true, placeholder: "Min 50 chars" })}
                    <div style={{ marginBottom: 16 }}>
                        <label className="he-label">Problem Statements (optional)</label>
                        <textarea className="he-input" rows={2} value={hackForm.problemStatements || ''} onChange={e => hF('problemStatements', e.target.value)} placeholder="Describe problem statements" />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label className="he-label">Prizes (optional)</label>
                        <textarea className="he-input" rows={2} value={hackForm.prizes || ''} onChange={e => hF('prizes', e.target.value)} placeholder="e.g. 1st: ₹10,000 | 2nd: ₹5,000" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div><label className="he-label">Min Team Size</label><input className="he-input" type="number" min={1} max={10} value={hackForm.teamSizeMin || 1} onChange={e => hF('teamSizeMin', Number(e.target.value))} /></div>
                        <div><label className="he-label">Max Team Size</label><input className="he-input" type="number" min={1} max={10} value={hackForm.teamSizeMax || 4} onChange={e => hF('teamSizeMax', Number(e.target.value))} /></div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label className="he-label">Eligibility (optional)</label>
                        <textarea className="he-input" rows={2} value={hackForm.eligibility || ''} onChange={e => hF('eligibility', e.target.value)} placeholder="Who can participate?" />
                    </div>
                    <button className="he-btn he-btn-cyan" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={() => { if (validateHackStep1()) { setHackStep(2); setHackErrors({}); } }}>Continue to Payment Setup →</button>
                </div>
            )}
            {hackStep === 2 && (
                <div className="he-card">
                    <h2 className="he-heading" style={{ fontSize: 20, marginBottom: 20 }}>💳 Payment Setup</h2>
                    <div style={{ marginBottom: 16 }}>
                        <label className="he-label">Registration Fee<span className="req">*</span></label>
                        <div className="he-toggle">
                            <button className={hackForm.type === 'free' ? 'active' : ''} onClick={() => hF('type', 'free')}>🎟 Free</button>
                            <button className={hackForm.type === 'paid' ? 'active' : ''} onClick={() => hF('type', 'paid')}>💰 Paid</button>
                        </div>
                    </div>
                    {hackForm.type === 'free' ? (
                        <div style={{ textAlign: 'center', padding: 32, color: '#10b981' }}>
                            <p style={{ fontSize: 16, fontWeight: 700 }}>🎟 No registration fee</p>
                            <button className="he-btn he-btn-success" style={{ marginTop: 16 }} onClick={() => { setHackStep(3); setHackErrors({}); }}>Continue to Review →</button>
                        </div>
                    ) : (<>
                        {renderField("Registration Amount (₹)", "amount", hackErrors, String(hackForm.amount || ''), v => hF('amount', Number(v)), { type: 'number' })}
                        {renderField("Primary UPI ID", "primaryUpi", hackErrors, hackForm.primaryUpi || '', v => hF('primaryUpi', v), { placeholder: "name@bank" })}
                        <div style={{ marginBottom: 16 }}><label className="he-label">Secondary UPI (optional)</label><input className="he-input" value={hackForm.secondaryUpi || ''} onChange={e => hF('secondaryUpi', e.target.value)} /></div>
                        <div style={{ marginBottom: 16 }}>
                            <label className="he-label">Upload QR Code</label>
                            <input ref={hackQrRef} type="file" accept="image/*" hidden onChange={e => handleSingleImage(e.target.files?.[0] || null, url => hF('qrImage', url))} />
                            <div className="he-upload-zone" onClick={() => hackQrRef.current?.click()}>📱 Upload QR</div>
                            {hackForm.qrImage && <img src={hackForm.qrImage} className="he-img-preview" style={{ marginTop: 8, width: 120, height: 120 }} alt="QR" />}
                        </div>
                        {renderField("Payment Mobile", "paymentPhone", hackErrors, hackForm.paymentPhone || '', v => hF('paymentPhone', v.replace(/\D/g, '').slice(0, 10)))}
                        <div style={{ marginBottom: 16 }}><label className="he-label">Instructions (optional)</label><textarea className="he-input" rows={2} value={hackForm.paymentInstructions || ''} onChange={e => hF('paymentInstructions', e.target.value)} /></div>
                        <button className="he-btn he-btn-cyan" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { if (validateHackStep2()) { setHackStep(3); setHackErrors({}); } }}>Continue to Review →</button>
                    </>)}
                </div>
            )}
            {hackStep === 3 && (
                <div className="he-card">
                    <h2 className="he-heading" style={{ fontSize: 20, marginBottom: 20 }}>📋 Review & Publish</h2>
                    <div style={{ background: '#13121f', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{hackForm.name}</h3>
                        <p style={{ color: '#71717a', fontSize: 13 }}>🏫 {hackForm.college} • {hackForm.organization}</p>
                        <p style={{ color: '#71717a', fontSize: 13 }}>👤 {hackForm.hostName} • 📞 {fmtPhone(hackForm.hostPhone || '')}</p>
                        <p style={{ color: '#71717a', fontSize: 13 }}>📆 {fmtDateTime(hackForm.startDate || '')} → {fmtDateTime(hackForm.endDate || '')}</p>
                        <p style={{ color: '#71717a', fontSize: 13, marginBottom: 8 }}>📍 {hackForm.location}</p>
                        <p style={{ color: '#71717a', fontSize: 13 }}>👥 Team: {hackForm.teamSizeMin}–{hackForm.teamSizeMax} members</p>
                        <span className={`he-badge ${hackForm.type === 'free' ? 'he-badge-free' : 'he-badge-paid'}`} style={{ marginTop: 8 }}>{hackForm.type === 'free' ? '🎟 FREE' : `💰 ₹${hackForm.amount}`}</span>
                        {hackForm.prizes && <p style={{ color: '#a1a1aa', fontSize: 12, marginTop: 8 }}>🏆 {hackForm.prizes}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className="he-btn he-btn-outline" onClick={() => setHackStep(1)}>Edit Details</button>
                        <button className="he-btn he-btn-outline" onClick={() => setHackStep(2)}>Edit Payment</button>
                        <button className="he-btn he-btn-success" style={{ flex: 1, justifyContent: 'center' }} onClick={publishHackathon}>🚀 Publish Hackathon</button>
                    </div>
                </div>
            )}
        </div>
    );
    const renderHackathonDetail = () => {
        const h = selectedHack; if (!h) return <div />;
        const imgs = h.images || [];
        const regCount = hackRegs.filter(r => r.hackathonId === h.id).length;
        const capacityFull = h.maxCapacity > 0 && regCount >= h.maxCapacity;

        const validateHackReg = () => {
            const errs: Record<string, string> = {};
            if (!hackRegForm.studentName?.trim()) errs.studentName = "Required";
            if (!hackRegForm.email || !validateEmail(hackRegForm.email)) errs.email = "Valid email";
            if (!hackRegForm.regNumber?.trim()) errs.regNumber = "Required";
            if (!hackRegForm.mobile || !validatePhone(hackRegForm.mobile)) errs.mobile = "Valid number";
            if (!hackRegForm.college?.trim()) errs.college = "Required";
            setHackRegErrors(errs); return Object.keys(errs).length === 0;
        };
        const submitFreeHackReg = () => {
            if (!validateHackReg()) return;
            const reg: HackRegistration = { id: genId('HACK-'), hackathonId: h.id, studentName: hackRegForm.studentName || '', email: hackRegForm.email || '', regNumber: hackRegForm.regNumber || '', mobile: hackRegForm.mobile || '', college: hackRegForm.college || '', teamName: hackRegForm.teamName || '', role: hackRegForm.role || 'Solo', date: new Date().toISOString(), paymentStatus: 'verified', paymentScreenshot: '', amount: 0 };
            setHackRegs(prev => [...prev, reg]);
            setRegSuccess({ id: reg.id, name: h.name, type: 'free' }); showConfetti(); setView("regSuccess");
        };
        return (
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
                <button className="he-back-btn" onClick={() => setView("hackathonsHub")}>← Back to Hackathons</button>
                {imgs.length > 0 && (
                    <div className="he-carousel" style={{ marginBottom: 24 }}>
                        <img src={imgs[carouselIdx]?.url} alt={h.name} />
                        {imgs.length > 1 && (<><button className="he-carousel-btn" style={{ left: 12 }} onClick={() => setCarouselIdx(i => (i - 1 + imgs.length) % imgs.length)}>‹</button><button className="he-carousel-btn" style={{ right: 12 }} onClick={() => setCarouselIdx(i => (i + 1) % imgs.length)}>›</button></>)}
                        <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                            {imgs.map((_, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i === carouselIdx ? '#06b6d4' : '#ffffff40', transition: '0.3s' }} />)}
                        </div>
                    </div>
                )}
                <h1 className="he-heading" style={{ fontSize: 32, marginBottom: 12 }}>{h.name}</h1>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                    <span className="he-chip">🏫 {h.college}</span><span className="he-chip">🏢 {h.organization}</span>
                    <span className="he-chip">👥 Team: {h.teamSizeMin}–{h.teamSizeMax}</span>
                    {h.category && <span className="he-chip">📂 {h.category}</span>}
                    <span className={`he-badge ${h.type === 'free' ? 'he-badge-free' : 'he-badge-paid'}`}>{h.type === 'free' ? '🎟 FREE' : `💰 ₹${h.amount}`}</span>
                </div>
                <div className="he-card he-shine" style={{ marginBottom: 24, padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div><p style={{ color: '#a1a1aa', fontSize: 13, marginBottom: 4 }}>👤 <strong>{h.hostName}</strong></p><p style={{ color: '#71717a', fontSize: 13 }}>📞 {fmtPhone(h.hostPhone)}</p></div>
                        <div style={{ textAlign: 'right' }}>
                            <div className="he-badge" style={{ background: '#1c1b2e', color: '#22d3ee', marginBottom: 8 }}>📆 {fmtDateTime(h.startDate)} → {fmtDateTime(h.endDate)}</div>
                            <p style={{ color: '#a1a1aa', fontSize: 13 }}>📍 {h.location}</p>
                        </div>
                    </div>
                    {h.maxCapacity > 0 && (
                        <div style={{ padding: 16, background: '#13121f', borderRadius: 12, marginTop: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#a1a1aa', marginBottom: 8 }}>
                                <span>👥 Registration Fill Status</span>
                                <span style={{ color: capacityFull ? '#ef4444' : '#22d3ee', fontWeight: 600 }}>{regCount}/{h.maxCapacity} {capacityFull && "(Full)"}</span>
                            </div>
                            <div className="he-progress"><div className={`he-progress-bar ${capacityFull ? 'he-progress-red' : 'he-progress-cyan'}`} style={{ width: `${Math.min(100, (regCount / h.maxCapacity) * 100)}%` }} /></div>
                        </div>
                    )}
                    {h.prizes && <><h3 style={{ fontSize: 16, fontWeight: 700, margin: '24px 0 8px' }}>🏆 Prizes</h3><p style={{ color: '#a1a1aa', fontSize: 14, whiteSpace: 'pre-wrap' }}>{h.prizes}</p></>}
                    {h.problemStatements && <><h3 style={{ fontSize: 16, fontWeight: 700, margin: '24px 0 8px' }}>📋 Problem Statements</h3><p style={{ color: '#a1a1aa', fontSize: 14, whiteSpace: 'pre-wrap' }}>{h.problemStatements}</p></>}
                    {h.eligibility && <><h3 style={{ fontSize: 16, fontWeight: 700, margin: '24px 0 8px' }}>✅ Eligibility</h3><p style={{ color: '#a1a1aa', fontSize: 14, whiteSpace: 'pre-wrap' }}>{h.eligibility}</p></>}
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: '24px 0 8px' }}>About Hackathon</h3>
                    <p style={{ color: '#a1a1aa', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{h.about}</p>
                </div>
                {!capacityFull ? (
                    <div className="he-card">
                        <h2 className="he-heading" style={{ fontSize: 20, marginBottom: 20 }}>📝 Register for Hackathon</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {renderField("Student Name", "studentName", hackRegErrors, hackRegForm.studentName || '', v => setHackRegForm(p => ({ ...p, studentName: v })))}
                            {renderField("Registration Number", "regNumber", hackRegErrors, hackRegForm.regNumber || '', v => setHackRegForm(p => ({ ...p, regNumber: v })))}
                        </div>
                        {renderField("College", "college", hackRegErrors, hackRegForm.college || '', v => setHackRegForm(p => ({ ...p, college: v })))}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {renderField("Email Address", "email", hackRegErrors, hackRegForm.email || '', v => setHackRegForm(p => ({ ...p, email: v })), { placeholder: "student@email.com" })}
                            {renderField("Mobile Number", "mobile", hackRegErrors, hackRegForm.mobile || '', v => setHackRegForm(p => ({ ...p, mobile: v.replace(/\D/g, '').slice(0, 10) })))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div><label className="he-label">Team Name (optional)</label><input className="he-input" value={hackRegForm.teamName || ''} onChange={e => setHackRegForm(p => ({ ...p, teamName: e.target.value }))} placeholder="Leave blank if Solo" /></div>
                            <div>
                                <label className="he-label">Role in Team</label>
                                <select className="he-input" value={hackRegForm.role || 'Solo'} onChange={e => setHackRegForm(p => ({ ...p, role: e.target.value }))}>
                                    <option value="Solo">Solo</option><option value="Team Leader">Team Leader</option><option value="Team Member">Team Member</option>
                                </select>
                            </div>
                        </div>
                        {h.type === 'free' ? (
                            <button className="he-btn he-btn-success" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={submitFreeHackReg}>✅ Complete Registration</button>
                        ) : (
                            <button className="he-btn he-btn-cyan" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={() => { if (validateHackReg()) { setHackPaymentScreenshot(''); setView("hackathonPayment"); } }}>Continue to Payment →</button>
                        )}
                    </div>
                ) : (
                    <div className="he-card" style={{ textAlign: 'center', padding: 40, background: '#1c1b2e', borderStyle: 'dashed' }}>
                        <div style={{ fontSize: 40, marginBottom: 16 }}>🚫</div>
                        <h3 className="he-heading" style={{ fontSize: 20, color: '#ef4444' }}>Registration Closed</h3>
                        <p style={{ color: '#a1a1aa', marginTop: 8 }}>This hackathon has reached its maximum capacity of {h.maxCapacity} participants.</p>
                    </div>
                )}
            </div>
        );
    };
    const renderHackathonPayment = () => {
        const h = selectedHack; if (!h) return <div />;
        const copyText = (t: string) => { navigator.clipboard?.writeText(t); showToast("Copied to clipboard!"); };
        const submitPaidHackReg = () => {
            if (!hackPaymentScreenshot) { showToast("Please upload payment screenshot"); return; }
            const reg: HackRegistration = { id: genId('HACK-'), hackathonId: h.id, studentName: hackRegForm.studentName || '', email: hackRegForm.email || '', regNumber: hackRegForm.regNumber || '', mobile: hackRegForm.mobile || '', college: hackRegForm.college || '', teamName: hackRegForm.teamName || '', role: hackRegForm.role || 'Solo', date: new Date().toISOString(), paymentStatus: 'pending', paymentScreenshot: hackPaymentScreenshot, amount: h.amount };
            setHackRegs(prev => [...prev, reg]);
            setRegSuccess({ id: reg.id, name: h.name, type: 'paid' }); showConfetti(); setView("regSuccess");
        };
        return (
            <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px' }}>
                <button className="he-back-btn" onClick={() => setView("hackathonDetail")}>← Back to Details</button>
                <h1 className="he-heading" style={{ fontSize: 24, marginBottom: 24 }}>💳 Complete Registration Payment</h1>

                <div className="he-card he-shine" style={{ marginBottom: 24, textAlign: 'center', padding: '32px 20px' }}>
                    <p style={{ color: '#a1a1aa', fontSize: 13, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Amount to Pay</p>
                    <h2 className="he-heading" style={{ fontSize: 48, color: '#06b6d4', margin: 0 }}>₹{h.amount}</h2>
                    <p style={{ color: '#71717a', fontSize: 13, marginTop: 8 }}>For {h.name}</p>
                </div>

                <div className="he-card" style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Payment Options</h3>
                    {h.primaryUpi && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#13121f', border: '1px solid #1c1b2e', padding: '12px 16px', borderRadius: 12, marginBottom: 12 }}>
                            <div>
                                <span style={{ color: '#a1a1aa', fontSize: 11, display: 'block', marginBottom: 4 }}>Primary UPI ID</span>
                                <strong style={{ color: '#f8fafc', fontSize: 15, letterSpacing: 0.5 }}>{h.primaryUpi}</strong>
                            </div>
                            <button className="he-btn he-btn-sm he-btn-outline" style={{ padding: '6px 12px' }} onClick={() => copyText(h.primaryUpi)}>📋 Copy</button>
                        </div>
                    )}
                    {h.secondaryUpi && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#13121f', border: '1px solid #1c1b2e', padding: '12px 16px', borderRadius: 12, marginBottom: 12 }}>
                            <div>
                                <span style={{ color: '#a1a1aa', fontSize: 11, display: 'block', marginBottom: 4 }}>Secondary UPI ID</span>
                                <strong style={{ color: '#f8fafc', fontSize: 15, letterSpacing: 0.5 }}>{h.secondaryUpi}</strong>
                            </div>
                            <button className="he-btn he-btn-sm he-btn-outline" style={{ padding: '6px 12px' }} onClick={() => copyText(h.secondaryUpi)}>📋 Copy</button>
                        </div>
                    )}
                    {h.qrImage && (
                        <div style={{ textAlign: 'center', margin: '24px 0', padding: '20px 0', borderTop: '1px dashed #1c1b2e', borderBottom: '1px dashed #1c1b2e' }}>
                            <p style={{ color: '#a1a1aa', fontSize: 13, marginBottom: 12 }}>Or scan QR Code</p>
                            <img src={h.qrImage} alt="Payment QR" style={{ maxWidth: 200, borderRadius: 16, border: '4px solid #13121f', boxShadow: '0 8px 32px #00000040' }} />
                        </div>
                    )}
                    {h.paymentPhone && <p style={{ color: '#a1a1aa', fontSize: 13, marginTop: 16 }}>📞 Contact for Payment Issues: <strong>{fmtPhone(h.paymentPhone)}</strong></p>}
                    {h.paymentInstructions && (
                        <div style={{ marginTop: 16, padding: 12, background: '#06b6d415', borderRadius: 8, borderLeft: '4px solid #06b6d4' }}>
                            <p style={{ color: '#67e8f9', fontSize: 13, margin: 0 }}><strong>Instructions:</strong> {h.paymentInstructions}</p>
                        </div>
                    )}
                </div>

                <div className="he-card">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📸 Upload Payment Proof</h3>
                    <p style={{ color: '#a1a1aa', fontSize: 13, marginBottom: 16 }}>Upload a clear screenshot of your successful transaction. Max size 5MB (JPG/PNG/WebP).</p>
                    <input ref={hackPayScreenshotRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e => handleSingleImage(e.target.files?.[0] || null, url => setHackPaymentScreenshot(url))} />

                    {!hackPaymentScreenshot ? (
                        <div className="he-upload-zone" onClick={() => hackPayScreenshotRef.current?.click()} style={{ padding: 40 }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>📤</div>
                            <div style={{ fontWeight: 600 }}>Click to upload screenshot</div>
                        </div>
                    ) : (
                        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '2px solid #10b981' }}>
                            <img src={hackPaymentScreenshot} alt="Screenshot" style={{ width: '100%', display: 'block' }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#000000a0', backdropFilter: 'blur(4px)', padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#10b981', fontSize: 13, fontWeight: 600 }}>✅ Uploaded</span>
                                <button className="he-btn he-btn-sm he-btn-outline" style={{ background: '#00000080', border: 'none' }} onClick={() => hackPayScreenshotRef.current?.click()}>Change</button>
                            </div>
                        </div>
                    )}

                    <button className={`he-btn he-btn-success ${!hackPaymentScreenshot ? 'he-btn-disabled' : ''}`} style={{ width: '100%', justifyContent: 'center', marginTop: 24, padding: 16, fontSize: 16 }} onClick={submitPaidHackReg}>✅ Complete Registration</button>
                </div>
            </div>
        );
    };
    const renderHackHostDashboard = () => {
        const h = selectedHack; if (!h) return <div />;
        const regs = hackRegs.filter(r => r.hackathonId === h.id);
        const q = hostSearch.toLowerCase();
        const filtered = regs.filter(r => !q || r.studentName.toLowerCase().includes(q) || r.college.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || (r.teamName && r.teamName.toLowerCase().includes(q)));
        const teams = new Set(regs.filter(r => r.teamName).map(r => r.teamName));
        const verified = regs.filter(r => r.paymentStatus === 'verified').length;
        const pending = regs.filter(r => r.paymentStatus === 'pending').length;
        const total = regs.reduce((s, r) => s + (r.paymentStatus === 'verified' ? r.amount : 0), 0);
        const vPct = regs.length > 0 ? (verified / regs.length) * 100 : 0;

        const verifyPayment = (id: string) => {
            setHackRegs(prev => prev.map(r => r.id === id ? { ...r, paymentStatus: 'verified' } : r));
            showToast("Payment verified!");
        };
        const deleteReg = (id: string) => {
            setConfirmModal({
                show: true, title: 'Delete Participant', msg: 'Are you sure? This action cannot be undone.', onConfirm: () => {
                    setHackRegs(prev => prev.filter(r => r.id !== id));
                    setConfirmModal(p => ({ ...p, show: false }));
                    showToast("Participant removed", "info");
                }
            });
        };
        const bulkVerify = () => {
            if (bulkSelected.length === 0) return;
            setHackRegs(prev => prev.map(r => bulkSelected.includes(r.id) ? { ...r, paymentStatus: 'verified' } : r));
            setBulkSelected([]);
            showToast(`${bulkSelected.length} payments verified!`, "success");
        };
        const editHackathon = () => {
            setHackForm({ ...h }); setHackStep(1); setHackErrors({});
            setEditMode(true); setEditId(h.id); setView("createHackathon");
        };
        const deleteHackathon = () => {
            setConfirmModal({
                show: true, title: 'Delete Hackathon', msg: `Are you sure you want to delete "${h.name}"? This will also delete all its participants.`, onConfirm: () => {
                    setHackathons(prev => prev.filter(e => e.id !== h.id));
                    setHackRegs(prev => prev.filter(r => r.hackathonId !== h.id));
                    setConfirmModal(p => ({ ...p, show: false }));
                    showToast("Hackathon deleted", "warning");
                    setView("hackathonsHub");
                }
            });
        };
        const exportRegs = () => {
            const headers = ['#', 'Name', 'Email', 'Reg Number', 'Mobile', 'College', 'Team', 'Role', 'Date', 'Status', 'Amount', 'Screenshot'];
            const rows = regs.map((r, i) => [String(i + 1), r.studentName, r.email, r.regNumber, r.mobile, r.college, r.teamName, r.role, fmtDate(r.date), r.paymentStatus, String(r.amount), r.paymentScreenshot ? 'Yes' : 'No']);
            downloadCSV(headers, rows, `${h.name}_participants.csv`);
        };
        return (
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
                <button className="he-back-btn" onClick={() => setView("hackathonsHub")}>← Back</button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 8 }}>
                    <div>
                        <h1 className="he-heading" style={{ fontSize: 28, marginBottom: 4 }}>📊 {h.name}</h1>
                        <p style={{ color: '#71717a', fontSize: 13, marginBottom: 24 }}>Published {fmtDate(h.createdAt)} • {h.maxCapacity > 0 ? `${regs.length}/${h.maxCapacity} capacity` : `${regs.length} participants`}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="he-btn he-btn-sm he-btn-outline" onClick={editHackathon}>✏️ Edit</button>
                        <button className="he-btn he-btn-sm he-btn-outline" style={{ color: '#ef4444', borderColor: '#451a1a' }} onClick={deleteHackathon}>🗑 Delete</button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 32 }}>
                    <div className="he-card">
                        <h3 className="he-heading" style={{ fontSize: 16, marginBottom: 16 }}>Registration Analytics</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                            {regs.length > 0 ? (
                                <div className="he-donut" style={{ '--pct': `${vPct}%`, '--c': '#06b6d4' } as any} />
                            ) : (
                                <div style={{ width: 80, height: 80, borderRadius: '50%', border: '8px solid #1c1b2e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#52525b', fontSize: 11 }}>No data</div>
                            )}
                            <div>
                                <div style={{ marginBottom: 8 }}><span style={{ color: '#06b6d4', fontWeight: 600 }}>{verified}</span> Verified</div>
                                <div><span style={{ color: '#f59e0b', fontWeight: 600 }}>{pending}</span> Pending</div>
                                <div style={{ marginTop: 8, fontSize: 11, color: '#71717a' }}>Total: {regs.length}</div>
                            </div>
                        </div>
                    </div>
                    <div className="he-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h3 className="he-heading" style={{ fontSize: 16, marginBottom: 8 }}>Total Revenue</h3>
                        <h2 className="he-heading" style={{ fontSize: 48, color: '#06b6d4', margin: '0' }}>₹{total}</h2>
                        <p style={{ color: '#10b981', fontSize: 13, marginTop: 8 }}>↑ From {verified} verified payments</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 32 }}>
                    <div className="he-stat"><h4 style={{ color: '#06b6d4' }}>{regs.length}</h4><p>👥 Participants</p></div>
                    <div className="he-stat"><h4 style={{ color: '#8b5cf6' }}>{teams.size}</h4><p>👥 Teams</p></div>
                    <div className="he-stat"><h4 style={{ color: '#10b981' }}>{verified}</h4><p>✅ Verified</p></div>
                    <div className="he-stat"><h4 style={{ color: '#f59e0b' }}>{pending}</h4><p>⏳ Pending</p></div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {([["all", "All Participants"]] as const).map(([k, l]) => (
                            <button key={k} className={`he-tab ${hostTab === k ? 'he-tab-active' : ''}`} onClick={() => setHostTab(k)}>{l}</button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {bulkSelected.length > 0 && <button className="he-btn he-btn-sm he-btn-success" onClick={bulkVerify}>✅ Verify Selected ({bulkSelected.length})</button>}
                        <button className="he-btn he-btn-sm he-btn-outline" onClick={exportRegs}>⬇️ Download CSV</button>
                    </div>
                </div>
                <div className="he-search" style={{ marginBottom: 16 }}><SearchIcon /><input className="he-input" placeholder="Search participants or teams..." value={hostSearch} onChange={e => setHostSearch(e.target.value)} /></div>

                <div className="he-card" style={{ padding: 0, overflow: 'auto' }}>
                    <table className="he-table">
                        <thead><tr>
                            <td style={{ width: 40 }}><input type="checkbox" className="he-checkbox" checked={filtered.length > 0 && bulkSelected.length === filtered.length} onChange={e => setBulkSelected(e.target.checked ? filtered.map(r => r.id) : [])} /></td>
                            <th>#</th><th>Participant Info</th><th>Team & Role</th><th>Date</th><th>Status</th><th>Actions</th>
                        </tr></thead>
                        <tbody>{filtered.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', color: '#52525b', padding: 40 }}>No participants found</td></tr> : filtered.map((r, i) => (
                            <tr key={r.id} className="he-tr-anim" style={{ animationDelay: `${i * 0.05}s` }}>
                                <td><input type="checkbox" className="he-checkbox" checked={bulkSelected.includes(r.id)} onChange={e => setBulkSelected(p => e.target.checked ? [...p, r.id] : p.filter(x => x !== r.id))} /></td>
                                <td>{i + 1}</td>
                                <td>
                                    <strong style={{ color: '#f8fafc' }}>{r.studentName}</strong><br />
                                    <span className="he-chip" style={{ fontSize: 10, marginTop: 4 }}>{r.regNumber}</span><br />
                                    <span style={{ fontSize: 11, color: '#a1a1aa' }}>{r.email} • {r.mobile}</span><br />
                                    <span style={{ fontSize: 11, color: '#71717a' }}>{r.college}</span>
                                </td>
                                <td>
                                    {r.teamName ? <span className="he-badge" style={{ background: '#1c1b2e', color: '#22d3ee' }}>🛡️ {r.teamName}</span> : <span style={{ color: '#71717a', fontSize: 12 }}>Solo</span>}<br />
                                    <span style={{ fontSize: 11, color: '#a1a1aa' }}>{r.role}</span>
                                </td>
                                <td><span style={{ color: '#a1a1aa' }}>{fmtDate(r.date)}</span><br /><span style={{ fontSize: 10, color: '#52525b' }}>{timeAgo(r.date)}</span></td>
                                <td><span className={`he-badge ${r.paymentStatus === 'verified' ? 'he-badge-verified' : 'he-badge-pending'}`}>{r.paymentStatus === 'verified' ? '✅ Verified' : '⏳ Pending'}</span></td>
                                <td style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                    {r.paymentStatus === 'pending' && <button className="he-btn he-btn-sm he-btn-success" style={{ padding: '4px 12px' }} onClick={() => verifyPayment(r.id)}>Verify</button>}
                                    {r.paymentScreenshot && <button className="he-btn he-btn-sm he-btn-outline" style={{ padding: '4px 12px' }} onClick={() => setScreenshotModal(r.paymentScreenshot)}>📷 View</button>}
                                    <button className="he-btn-icon" style={{ padding: 4, width: 28, height: 28, color: '#ef4444' }} title="Delete" onClick={() => deleteReg(r.id)}>🗑</button>
                                </td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            </div>
        );
    };

    /* ─── View Router ─── */
    const renderView = () => {
        switch (view) {
            case "menu": return renderMenu();
            case "eventsHub": return renderEventsHub();
            case "createEvent": return renderCreateEvent();
            case "eventDetail": return renderEventDetail();
            case "eventPayment": return renderEventPayment();
            case "eventHostDash": return renderEventHostDashboard();
            case "hackathonsHub": return renderHackathonsHub();
            case "createHackathon": return renderCreateHackathon();
            case "hackathonDetail": return renderHackathonDetail();
            case "hackathonPayment": return renderHackathonPayment();
            case "hackHostDash": return renderHackHostDashboard();
            case "regSuccess": return (
                <div className="he-success-screen">
                    <div className="he-checkmark"><span style={{ fontSize: 36 }}>✅</span></div>
                    <h2 className="he-heading" style={{ fontSize: 28, marginBottom: 8 }}>Registration Successful!</h2>
                    <p style={{ color: '#71717a', marginBottom: 8 }}>Confirmation: <strong style={{ color: '#a78bfa' }}>{regSuccess?.id}</strong></p>
                    <p style={{ color: '#71717a', marginBottom: 4 }}>{regSuccess?.name}</p>
                    {regSuccess?.type === 'paid' && (
                        <div className="he-badge he-badge-pending" style={{ margin: '16px auto' }}>⏳ Payment: Pending Verification</div>
                    )}
                    <p style={{ color: '#52525b', fontSize: 13, marginTop: 16 }}>Your registration is submitted! The organizer will verify your payment.</p>
                    <button className="he-btn he-btn-primary" style={{ marginTop: 24 }} onClick={() => setView("menu")}>
                        Back to Menu
                    </button>
                </div>
            );
            default: return renderMenu();
        }
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: STYLES }} />
            <div className="he-root">
                {renderView()}
                <Toast msg={toast.msg} show={toast.show} />
                <Confetti show={confetti} />
                {screenshotModal && (
                    <div className="he-modal-overlay" onClick={() => setScreenshotModal(null)}>
                        <div className="he-modal" onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                <h3 className="he-heading" style={{ fontSize: 18 }}>Payment Screenshot</h3>
                                <button className="he-btn he-btn-sm he-btn-outline" onClick={() => setScreenshotModal(null)}>✕</button>
                            </div>
                            <img src={screenshotModal} alt="Payment" style={{ width: '100%', borderRadius: 12 }} />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
