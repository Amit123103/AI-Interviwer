"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Trash2, Copy, Plus, X, Share2, Download, Image as ImageIcon, ChevronRight, CheckCircle } from 'lucide-react';

// --- Type Definitions ---
type ProblemStatement = { id: string; title: string; description: string; domain: string; difficulty: string };
type UploadedFile = { name: string; size: number; type: string; base64: string };
type TeamMember = { id: string; name: string; regNo: string };
type Participant = {
    teamName: string;
    teamNumber: string;
    leaderName: string;
    leaderEmail: string;
    leaderRegNo: string;
    members: TeamMember[];
    problemSelected: string;
    solutionTitle?: string;
    solutionDesc?: string;
    techStack?: string;
    githubLink?: string;
    demoLink?: string;
    solutionFiles?: UploadedFile[];
    submittedAt?: string;
    isSubmitted: boolean;
};
type Hackathon = {
    id: string;
    name: string;
    orgName: string;
    description: string;
    startDate: string;
    endDate: string;
    category: string;
    difficulty: string;
    prizes?: string;
    rules?: string;
    eligibility?: string;
    problemStatements: ProblemStatement[];
    uploadedFiles: UploadedFile[];
    joinCode: string;
    createdBy: string;
    createdAt: string;
    status: 'UPCOMING' | 'ACTIVE' | 'ENDED';
    participants: Participant[];
    winners?: { first?: string; second?: string; third?: string };
    maxParticipants?: number;
};

type ViewState = 'hub' | 'createStep1' | 'createStep2' | 'createSuccess' | 'hostDashboard' | 'joinPreview' | 'joinTeamSetup' | 'joinSubmit' | 'participantDashboard' | 'myHackathons';

// --- Main Component ---
export default function HackathonParticipatePage() {
    const [view, setView] = useState<ViewState>('hub');
    const [hackathons, setHackathons] = useState<Hackathon[]>([]);
    const [userContext, setUserContext] = useState<{ id: string, name: string }>({ id: 'user-timestamp', name: 'Student' });
    const [selectedHackId, setSelectedHackId] = useState<string | null>(null);

    // Join flow state
    const [joinCodeParts, setJoinCodeParts] = useState<string[]>(Array(9).fill(''));
    const [joinShake, setJoinShake] = useState(false);
    const [joinError, setJoinError] = useState('');
    const joinInputRefs = useRef<(HTMLInputElement | null)[]>(Array(9).fill(null));

    const [joinTeamData, setJoinTeamData] = useState<Partial<Participant>>({
        teamName: '', leaderEmail: '', leaderRegNo: '', teamNumber: '',
        members: []
    });
    const [joinSolutionData, setJoinSolutionData] = useState<{
        problemSelected: string; title: string; desc: string; tech: string; github: string; demo: string; files: UploadedFile[];
    }>({
        problemSelected: '', title: '', desc: '', tech: '', github: '', demo: '', files: []
    });

    // Create Flow state
    const [createData, setCreateData] = useState<Partial<Hackathon>>({
        name: '', orgName: '', description: '', startDate: '', endDate: '',
        category: 'Software Development', difficulty: 'Open to All',
        prizes: '', rules: '', eligibility: ''
    });
    const [problemTab, setProblemTab] = useState<'manual' | 'upload'>('manual');
    const [manualProblems, setManualProblems] = useState<ProblemStatement[]>([
        { id: '1', title: '', description: '', domain: '', difficulty: 'Medium' }
    ]);
    const [uploadedProblems, setUploadedProblems] = useState<UploadedFile[]>([]);
    const [createdCode, setCreatedCode] = useState('');

    // --- Helpers ---
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const u = JSON.parse(storedUser);
                setUserContext({ id: u._id || 'user-1', name: u.username || 'Student' });
            } catch { }
        }
        const storedHacks = localStorage.getItem("hp_hackathons");
        if (storedHacks) {
            try { setHackathons(JSON.parse(storedHacks)); } catch { }
        }
    }, []);

    // Persist hackathons to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem("hp_hackathons", JSON.stringify(hackathons));
    }, [hackathons]);

    // --- Helpers ---
    const showToast = (msg: string) => {
        // Simple mock toast for demo if not using real toast container
        alert(msg);
    };

    const getRemainingTime = (endDate: string) => {
        const total = Date.parse(endDate) - new Date().getTime();
        if (total <= 0) return { d: 0, h: 0, m: 0, s: 0, ended: true };
        return {
            d: Math.floor(total / (1000 * 60 * 60 * 24)),
            h: Math.floor((total / (1000 * 60 * 60)) % 24),
            m: Math.floor((total / 1000 / 60) % 60),
            s: Math.floor((total / 1000) % 60),
            ended: false
        };
    };

    // --- Join Code Logistics ---
    const handleJoinCodeChange = (index: number, val: string) => {
        const newCode = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (!newCode) return;

        const newParts = [...joinCodeParts];
        newParts[index] = newCode.slice(0, 1);
        setJoinCodeParts(newParts);
        setJoinError('');
        setJoinShake(false);

        // move focus next
        if (index < 8 && newCode.length > 0) {
            joinInputRefs.current[index + 1]?.focus();
        }
    };

    const handleJoinCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            const newParts = [...joinCodeParts];
            if (newParts[index] !== '') {
                newParts[index] = '';
                setJoinCodeParts(newParts);
            } else if (index > 0) {
                newParts[index - 1] = '';
                setJoinCodeParts(newParts);
                joinInputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handleJoinCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (!pasted) return;

        const newParts = [...joinCodeParts];
        for (let i = 0; i < Math.min(pasted.length, 9); i++) {
            newParts[i] = pasted[i];
        }
        setJoinCodeParts(newParts);
        setJoinError('');

        // focus next empty or last
        const nextIdx = Math.min(pasted.length, 8);
        joinInputRefs.current[nextIdx]?.focus();
    };

    const submitJoin = () => {
        const fullCode = joinCodeParts.join('');
        if (fullCode.length !== 9) {
            setJoinError('Please enter a valid 9-character code.');
            setJoinShake(true);
            setTimeout(() => setJoinShake(false), 500);
            return;
        }

        const found = hackathons.find(h => h.joinCode === fullCode);
        if (!found) {
            setJoinError('Invalid code. Please check and try again.');
            setJoinShake(true);
            setTimeout(() => setJoinShake(false), 500);
            return;
        }

        setSelectedHackId(found.id);
        setView('joinPreview');
    };

    // --- Global Styles Injection ---
    // Emulated CSS just for this module per requirements
    const GlobalStyles = () => (
        <style dangerouslySetInnerHTML={{
            __html: `
            .hp-bg { background-color: #060610; color: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; position: relative; }
            .hp-bg::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.05) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(6, 182, 212, 0.05) 0%, transparent 50%); pointer-events: none; z-index: 0; }
            .hp-heading { font-family: 'JetBrains Mono', monospace; font-weight: 800; }
            .hp-card { background: rgba(13, 12, 26, 0.6); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); overflow: hidden; position: relative; }
            .hp-card::after { content: ''; position: absolute; inset: 0; border-radius: 24px; pointer-events: none; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1); }
            
            .hp-btn-primary { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; border: none; font-weight: 800; letter-spacing: 0.05em; border-radius: 16px; cursor: pointer; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; overflow: hidden; }
            .hp-btn-primary::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); transition: left 0.5s ease; }
            .hp-btn-primary:hover::before { left: 100%; }
            .hp-btn-primary:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 10px 30px rgba(124,58,237,0.4); text-shadow: 0 0 10px rgba(255,255,255,0.5); }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                20%, 60% { transform: translateX(-6px); }
                40%, 80% { transform: translateX(6px); }
            }
            .shake-anim { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
            
            @keyframes pulseBorder {
                0% { border-color: rgba(124, 58, 237, 0.3); box-shadow: 0 0 0 rgba(124, 58, 237, 0); }
                50% { border-color: rgba(124, 58, 237, 0.8); box-shadow: 0 0 20px rgba(124, 58, 237, 0.4); }
                100% { border-color: rgba(124, 58, 237, 0.3); box-shadow: 0 0 0 rgba(124, 58, 237, 0); }
            }
            
            .code-box {
                width: 52px; height: 60px; border-radius: 14px; text-align: center; font-size: 26px;
                font-family: 'JetBrains Mono', monospace; font-weight: 800;
                background: rgba(21, 20, 38, 0.8); border: 2px solid rgba(255, 255, 255, 0.1); color: #fff;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); outline: none; backdrop-filter: blur(10px);
            }
            .code-box:focus { border-color: #06b6d4; box-shadow: 0 0 20px rgba(6, 182, 212, 0.4), inset 0 0 10px rgba(6, 182, 212, 0.1); transform: translateY(-2px); background: rgba(26, 24, 53, 0.9); }
            .code-box.filled { background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.5); color: #10b981; text-shadow: 0 0 10px rgba(16, 185, 129, 0.5); }
            .code-box.error { border-color: #ef4444; background: rgba(239, 68, 68, 0.1); color: #ef4444; text-shadow: 0 0 10px rgba(239, 68, 68, 0.5); }

            .hp-input { background: rgba(21, 20, 38, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 14px; padding: 14px 18px; color: #fff; width: 100%; transition: all 0.3s ease; backdrop-filter: blur(10px); }
            .hp-input:focus { border-color: #7c3aed; outline: none; box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2); background: rgba(21, 20, 38, 0.8); }
            .hp-label { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: #94a3b8; margin-bottom: 8px; letter-spacing: 0.05em; text-transform: uppercase; }

            /* Confetti */
            .particle { position: absolute; border-radius: 50%; width: 10px; height: 10px; animation: pop 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; box-shadow: 0 0 10px currentColor; }
            @keyframes pop {
                0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
                50% { opacity: 1; }
                100% { transform: translateY(-150px) scale(0) rotate(360deg); opacity: 0; }
            }

            /* Hide scrollbar */
            .no-scroll::-webkit-scrollbar { display: none; }
            .no-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />
    );

    // --- Create Hackathon Logic ---
    const handleCreateNext = () => {
        if (!createData.name || !createData.orgName || !createData.description || !createData.startDate || !createData.endDate) {
            showToast("Please fill in all required fields (Name, Org, Description, Dates).");
            return;
        }
        if (new Date(createData.endDate) <= new Date(createData.startDate)) {
            showToast("End date must be after start date.");
            return;
        }
        setView('createStep2');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isSolution = false) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

        files.forEach(file => {
            if (!allowedTypes.includes(file.type)) {
                showToast(`Invalid file type for ${file.name}.Only PDF, DOC, DOCX, XLS, XLSX are allowed.`);
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showToast(`File ${file.name} is too large(max 5MB).`);
                return;
            }

            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    const newFile: UploadedFile = {
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        base64: ev.target.result as string
                    };
                    if (isSolution) {
                        // handled differently later
                    } else {
                        setUploadedProblems(prev => {
                            if (prev.length >= 3) {
                                showToast("Maximum 3 files allowed.");
                                return prev;
                            }
                            return [...prev, newFile];
                        });
                    }
                }
            };
            reader.readAsDataURL(file);
        });
        e.target.value = ''; // reset
    };

    const handleCreateSubmit = () => {
        // Validation
        const validProblems = manualProblems.filter(p => p.title.trim() && p.description.trim());
        if (validProblems.length === 0 && uploadedProblems.length === 0) {
            showToast("Please add at least one problem statement (manual or uploaded file).");
            return;
        }

        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const code = Array.from({ length: 9 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

        const newHackathon: Hackathon = {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(createData as any),
            id: 'hack-' + Date.now(),
            problemStatements: validProblems,
            uploadedFiles: uploadedProblems,
            joinCode: code,
            createdBy: userContext.id,
            createdAt: new Date().toISOString(),
            status: 'UPCOMING',
            participants: []
        };

        setHackathons(prev => [...prev, newHackathon]);
        setCreatedCode(code);
        setView('createSuccess');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast("Copied to clipboard!");
    };

    const downloadCodeCard = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw card background
        ctx.fillStyle = '#0d0c1a';
        ctx.fillRect(0, 0, 800, 400);

        // Draw border
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, 800, 400);

        // Draw text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(createData.name || 'Hackathon', 400, 100);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '24px sans-serif';
        ctx.fillText('Organized by ' + (createData.orgName || 'Org'), 400, 150);

        ctx.fillStyle = '#06b6d4';
        ctx.font = '20px sans-serif';
        ctx.fillText('Join Code:', 400, 240);

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 64px monospace';
        ctx.letterSpacing = '10px';
        ctx.fillText(createdCode, 400, 320);

        const a = document.createElement('a');
        a.download = `${createData.name?.replace(/\\s+/g, '_')} _JoinCode.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
    };

    // --- Render Methods ---
    const renderCreateStep1 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto pt-4 pb-20 px-4">
            <button onClick={() => setView('hub')} className="text-zinc-500 hover:text-slate-900 dark:text-white mb-8 flex items-center gap-2 font-bold uppercase tracking-widest text-xs"><ChevronRight className="w-4 h-4 rotate-180" /> Abort Creation</button>

            <div className="hp-card p-8 md:p-12 relative">
                {/* Stepper */}
                <div className="flex items-center mb-12 pb-8 border-b border-slate-100 dark:border-white/5 relative">
                    <div className="absolute top-full left-0 w-1/4 h-[1px] bg-gradient-to-r from-violet-500 to-transparent" />

                    <div className="flex items-center text-violet-400 gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-500/20 border border-violet-500 flex items-center justify-center font-black shadow-[0_0_15px_rgba(139,92,246,0.3)]">1</div>
                        <span className="font-bold tracking-wider uppercase text-sm">Initialization</span>
                    </div>
                    <div className="flex-1 h-[2px] mx-6 bg-white/5 rounded-full overflow-hidden relative">
                        <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                    </div>
                    <div className="flex items-center text-zinc-500 gap-3 opacity-60">
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center font-black">2</div>
                        <span className="font-bold tracking-wider uppercase text-sm">Parameters</span>
                    </div>
                </div>

                <h2 className="hp-heading text-3xl mb-8 text-slate-900 dark:text-white">Event Parameters</h2>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="relative group">
                            <label className="hp-label">Hackathon Designation <span className="text-violet-500">*</span></label>
                            <input type="text" className="hp-input" maxLength={100} value={createData.name} onChange={e => setCreateData({ ...createData, name: e.target.value })} placeholder="e.g. CodeXtreme 2026" />
                            <div className="text-right text-[10px] text-zinc-600 mt-1 font-mono">{createData.name?.length || 0}/100</div>
                        </div>
                        <div className="relative group">
                            <label className="hp-label">Organizing Entity <span className="text-violet-500">*</span></label>
                            <input type="text" className="hp-input" value={createData.orgName} onChange={e => setCreateData({ ...createData, orgName: e.target.value })} placeholder="College/Company" />
                        </div>
                    </div>

                    <div className="relative group">
                        <label className="hp-label">Mission Briefing <span className="text-violet-500">*</span></label>
                        <textarea className="hp-input min-h-[140px] resize-y" placeholder="Describe the theme, goals, and who should apply..." value={createData.description} onChange={e => setCreateData({ ...createData, description: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="relative group">
                            <label className="hp-label">Launch Sequence (Start) <span className="text-violet-500">*</span></label>
                            <input type="datetime-local" className="hp-input font-mono text-sm" value={createData.startDate} onChange={e => setCreateData({ ...createData, startDate: e.target.value })} />
                        </div>
                        <div className="relative group">
                            <label className="hp-label">Termination Sequence (End) <span className="text-violet-500">*</span></label>
                            <input type="datetime-local" className="hp-input font-mono text-sm" value={createData.endDate} onChange={e => setCreateData({ ...createData, endDate: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="relative group">
                            <label className="hp-label">Domain</label>
                            <select className="hp-input appearance-none text-sm" value={createData.category} onChange={e => setCreateData({ ...createData, category: e.target.value })}>
                                <option>Software Development</option>
                                <option>AI/ML</option>
                                <option>Web Dev</option>
                                <option>Mobile App</option>
                                <option>Open Innovation</option>
                                <option>Cybersecurity</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="hp-label">Difficulty Level</label>
                            <select className="hp-input appearance-none" value={createData.difficulty} onChange={e => setCreateData({ ...createData, difficulty: e.target.value })}>
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                                <option>Open to All</option>
                            </select>
                        </div>
                        <div>
                            <label className="hp-label">Max Participants</label>
                            <input type="number" className="hp-input" placeholder="Leave blank for unlimited" value={createData.maxParticipants === undefined ? '' : createData.maxParticipants} onChange={e => setCreateData({ ...createData, maxParticipants: e.target.value ? Number(e.target.value) : undefined })} />
                        </div>
                    </div>

                    <div>
                        <label className="hp-label">Prizes (Optional)</label>
                        <textarea className="hp-input" rows={2} placeholder="1st: ₹10,000 | 2nd: ₹5,000 | 3rd: ₹2,500" value={createData.prizes} onChange={e => setCreateData({ ...createData, prizes: e.target.value })} />
                    </div>

                    <div className="flex justify-end pt-8 mt-8 border-t border-slate-100 dark:border-white/5">
                        <button onClick={handleCreateNext} className="hp-btn-primary px-10 py-4 flex items-center gap-3 text-sm">
                            <span>Proceed to Constraints</span> <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderCreateStep2 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto pt-4 pb-20 px-4">
            <button onClick={() => setView('createStep1')} className="text-zinc-500 hover:text-slate-900 dark:text-white mb-8 flex items-center gap-2 font-bold uppercase tracking-widest text-xs"><ChevronRight className="w-4 h-4 rotate-180" /> Back to Parameters</button>

            <div className="hp-card p-8 md:p-12">
                {/* Stepper */}
                <div className="flex items-center mb-12 pb-8 border-b border-slate-100 dark:border-white/5 relative">
                    <div className="active-glow absolute top-full right-0 w-1/4 h-[1px] bg-gradient-to-l from-violet-500 to-transparent" />

                    <div className="flex items-center text-emerald-400 gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 flex items-center justify-center font-black shadow-[0_0_15px_rgba(16,185,129,0.2)]"><CheckCircle className="w-5 h-5" /></div>
                        <span className="font-bold tracking-wider uppercase text-sm">Initialization</span>
                    </div>
                    <div className="flex-1 h-[2px] mx-6 bg-emerald-500/50 rounded-full overflow-hidden shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <div className="flex items-center text-violet-400 gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-500/20 border border-violet-500 flex items-center justify-center font-black shadow-[0_0_15px_rgba(139,92,246,0.3)]">2</div>
                        <span className="font-bold tracking-wider uppercase text-sm">Constraints</span>
                    </div>
                </div>

                <h2 className="hp-heading text-3xl mb-2">Problem Statements</h2>
                <p className="text-slate-500 dark:text-zinc-400 mb-8">Add manual statements or upload detailed documents (both will be available to participants).</p>

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-6 w-max">
                    <button onClick={() => setProblemTab('manual')} className={`px - 6 py - 2 rounded - lg font - semibold transition - all ${problemTab === 'manual' ? 'bg-violet-600 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white'} `}>Write Manually</button>
                    <button onClick={() => setProblemTab('upload')} className={`px - 6 py - 2 rounded - lg font - semibold transition - all ${problemTab === 'upload' ? 'bg-violet-600 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white'} `}>Upload Files</button>
                </div>

                {problemTab === 'manual' && (
                    <div className="space-y-6">
                        {manualProblems.map((prob, idx) => (
                            <div key={prob.id} className="p-6 bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl relative group">
                                <button onClick={() => setManualProblems(prev => prev.filter(p => p.id !== prob.id))} className="absolute top-4 right-4 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-5 h-5" /></button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                                    <div>
                                        <label className="hp-label">Problem Title</label>
                                        <input type="text" className="hp-input" value={prob.title} onChange={e => {
                                            const newP = [...manualProblems]; newP[idx].title = e.target.value; setManualProblems(newP);
                                        }} placeholder={`Problem ${idx + 1} `} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="hp-label">Domain/Track</label>
                                            <input type="text" className="hp-input" value={prob.domain} onChange={e => {
                                                const newP = [...manualProblems]; newP[idx].domain = e.target.value; setManualProblems(newP);
                                            }} placeholder="e.g. Healthcare" />
                                        </div>
                                        <div>
                                            <label className="hp-label">Difficulty</label>
                                            <select className="hp-input appearance-none" value={prob.difficulty} onChange={e => {
                                                const newP = [...manualProblems]; newP[idx].difficulty = e.target.value; setManualProblems(newP);
                                            }}>
                                                <option>Easy</option><option>Medium</option><option>Hard</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="hp-label">Description</label>
                                    <textarea className="hp-input min-h-[80px]" value={prob.description} onChange={e => {
                                        const newP = [...manualProblems]; newP[idx].description = e.target.value; setManualProblems(newP);
                                    }} placeholder="Outline the problem, expected outcome, and criteria..." />
                                </div>
                            </div>
                        ))}
                        {manualProblems.length < 10 && (
                            <button onClick={() => setManualProblems([...manualProblems, { id: Date.now().toString(), title: '', description: '', domain: '', difficulty: 'Medium' }])} className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-xl text-slate-500 dark:text-zinc-400 hover:text-violet-400 hover:border-violet-400/50 hover:bg-violet-500/5 transition-all flex items-center justify-center gap-2 font-semibold">
                                <Plus className="w-5 h-5" /> Add Problem Statement
                            </button>
                        )}
                    </div>
                )}

                {problemTab === 'upload' && (
                    <div className="space-y-6">
                        <div className="border-2 border-dashed border-cyan-500/30 rounded-2xl p-10 text-center bg-cyan-500/5 relative group hover:bg-cyan-500/10 transition-colors">
                            <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={e => handleFileUpload(e, false)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <UploadCloud className="w-12 h-12 text-cyan-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Drag & Drop or Click to Upload</h3>
                            <p className="text-slate-500 dark:text-zinc-400 text-sm">Accepted: PDF, DOC, DOCX, XLS, XLSX (Max 3 files, 5MB each)</p>
                        </div>

                        {uploadedProblems.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {uploadedProblems.map((f, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-slate-200 dark:border-white/10">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0"><ImageIcon className="w-5 h-5" /></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{f.name}</p>
                                            <p className="text-xs text-zinc-500">{(f.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <button onClick={() => setUploadedProblems(prev => prev.filter((_, idx) => idx !== i))} className="p-2 text-zinc-500 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"><X className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end pt-8 mt-10 border-t border-slate-100 dark:border-white/5">
                    <button onClick={handleCreateSubmit} className="hp-btn-primary px-10 py-5 flex items-center gap-3 shadow-[0_0_20px_rgba(124,58,237,0.4)] text-lg">
                        <span className="animate-pulse">🚀</span>
                        <span>Deploy Hackathon</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );

    const renderCreateSuccess = () => {
        // High density fireworks
        const particles = Array.from({ length: 80 });

        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto pt-10 pb-20 px-4 text-center relative z-20">
                {/* Confetti container */}
                <div className="absolute inset-0 overflow-visible pointer-events-none z-0">
                    {particles.map((_, i) => (
                        <div key={i} className="particle" style={{
                            left: `${40 + Math.random() * 20}%`,
                            top: '50%',
                            backgroundColor: ['#7c3aed', '#6366f1', '#06b6d4', '#10b981', '#f472b6', '#fbbf24'][Math.floor(Math.random() * 6)],
                            animationDuration: `${1 + Math.random() * 2}s`,
                            animationDelay: `${Math.random() * 0.3}s`,
                            transform: `translate(${Math.random() * 600 - 300}px, ${Math.random() * 600 - 300}px)`,
                            boxShadow: '0 0 15px currentColor'
                        }} />
                    ))}
                </div>

                <div className="relative z-10 hp-card p-10 md:p-16 border-emerald-500/30">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />

                    <div className="w-28 h-28 rounded-3xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(16,185,129,0.3),inset_0_0_20px_rgba(16,185,129,0.2)]">
                        <motion.svg initial={{ pathLength: 0, rotate: -90 }} animate={{ pathLength: 1, rotate: 0 }} transition={{ duration: 1, ease: "easeInOut" }} className="w-16 h-16 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </motion.svg>
                    </div>

                    <h2 className="hp-heading text-4xl md:text-5xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 tracking-tight drop-shadow-md">Deployment Successful</h2>
                    <p className="text-slate-500 dark:text-zinc-400 text-lg mb-12 font-medium">Your hackathon framework is online. Distribute the access code to participants.</p>

                    <motion.div whileHover={{ scale: 1.02 }} className="bg-white dark:bg-zinc-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 mb-10 inline-block w-full max-w-lg shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse" />
                            <div className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em]">Secure Join Code</div>
                            <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse" />
                        </div>

                        <div className="flex justify-center gap-2 md:gap-3 mb-8">
                            {createdCode.split('').map((c, i) => (
                                <div key={i} className="flex-1 max-w-[50px] aspect-[4/5] bg-white dark:bg-[#1a1835] border-y-2 border-violet-500/40 border-x border-slate-100 dark:border-white/5 rounded-xl flex items-center justify-center text-2xl md:text-4xl font-mono font-black text-fuchsia-400 shadow-[0_0_20px_rgba(124,58,237,0.3),inset_0_0_15px_rgba(124,58,237,0.2)]">
                                    {c}
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-4 justify-center">
                            <button onClick={() => copyToClipboard(createdCode)} className="flex items-center gap-2 bg-white/[0.05] border border-slate-200 dark:border-white/10 hover:bg-white/[0.1] px-5 py-3 rounded-xl transition-all font-bold text-sm tracking-wide">
                                <Copy className="w-4 h-4" /> Copy Access
                            </button>
                            <button onClick={() => {
                                if (navigator.share) {
                                    navigator.share({ title: 'Hackathon Access', text: `Join ${createData.name} using authorization code: ${createdCode}` });
                                } else {
                                    copyToClipboard(`Join ${createData.name} using code: ${createdCode}`);
                                }
                            }} className="flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30 px-5 py-3 rounded-xl transition-all font-bold text-sm tracking-wide shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                                <Share2 className="w-4 h-4" /> Share Link
                            </button>
                            <button onClick={downloadCodeCard} className="flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 px-5 py-3 rounded-xl transition-all font-bold text-sm tracking-wide shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                                <Download className="w-4 h-4" /> Download Keycard
                            </button>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button onClick={() => { setSelectedHackId('hack-' + Date.now()); setView('hostDashboard'); }} className="p-6 bg-white/[0.03] border border-white/[0.05] hover:border-white/20 hover:bg-white/[0.08] rounded-2xl transition-all font-bold text-sm flex flex-col items-center gap-3">
                            <span className="text-3xl">👁️</span>
                            <span>Command Center</span>
                        </button>
                        <button onClick={() => {
                            setCreateData({ name: '', orgName: '', description: '', startDate: '', endDate: '', category: 'Software Development', difficulty: 'Open to All' });
                            setManualProblems([{ id: '1', title: '', description: '', domain: '', difficulty: 'Medium' }]);
                            setUploadedProblems([]);
                            setView('createStep1');
                        }} className="p-6 bg-white/[0.03] border border-white/[0.05] hover:border-white/20 hover:bg-white/[0.08] rounded-2xl transition-all font-bold text-sm flex flex-col items-center gap-3">
                            <span className="text-3xl">➕</span>
                            <span>New Framework</span>
                        </button>
                        <button onClick={() => setView('hub')} className="p-6 bg-white/[0.03] border border-white/[0.05] hover:border-white/20 hover:bg-white/[0.08] rounded-2xl transition-all font-bold text-sm flex flex-col items-center gap-3">
                            <span className="text-3xl">🏠</span>
                            <span>Return to Hub</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    };

    // --- Join Hackathon Logic ---
    const getSelectedHackathon = () => hackathons.find(h => h.id === selectedHackId);

    const handleJoinTeamNext = () => {
        if (!joinTeamData.teamName || !joinTeamData.leaderEmail || !joinTeamData.leaderRegNo) {
            showToast("Please fill in Team Name and Leader details.");
            return;
        }
        setView('joinSubmit');
    };

    const handleJoinSubmit = () => {
        const hack = getSelectedHackathon();
        if (!hack) return;

        if (!joinSolutionData.problemSelected) {
            showToast("Please select a problem statement to work on.");
            return;
        }

        const newParticipant: Participant = {
            teamName: joinTeamData.teamName || '',
            teamNumber: 'TM-' + Math.floor(1000 + Math.random() * 9000),
            leaderName: userContext.name,
            leaderEmail: joinTeamData.leaderEmail || '',
            leaderRegNo: joinTeamData.leaderRegNo || '',
            members: joinTeamData.members || [],
            problemSelected: joinSolutionData.problemSelected,
            solutionTitle: joinSolutionData.title,
            solutionDesc: joinSolutionData.desc,
            techStack: joinSolutionData.tech,
            githubLink: joinSolutionData.github,
            demoLink: joinSolutionData.demo,
            solutionFiles: joinSolutionData.files,
            isSubmitted: true,
            submittedAt: new Date().toISOString()
        };

        const updatedHacks = hackathons.map(h => {
            if (h.id === hack.id) {
                return { ...h, participants: [...h.participants, newParticipant] };
            }
            return h;
        });
        setHackathons(updatedHacks);

        showToast("Solution submitted successfully!");
        setView('participantDashboard');
    };

    const renderJoinPreview = () => {
        const hack = getSelectedHackathon();
        if (!hack) return null;

        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-4xl mx-auto pt-4 pb-20 px-4">
                <button onClick={() => setView('hub')} className="text-zinc-500 hover:text-slate-900 dark:text-white mb-8 flex items-center gap-2 font-bold uppercase tracking-widest text-xs transition-colors"><ChevronRight className="w-4 h-4 rotate-180" /> Disconnect</button>

                <div className="hp-card p-8 md:p-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] -z-10 group-hover:bg-cyan-500/20 transition-all duration-700 pointer-events-none" />

                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(6,182,212,0.2)]">🎯</div>
                        <div>
                            <div className="text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-1">Target Acquired</div>
                            <h2 className="hp-heading text-4xl text-slate-900 dark:text-white">{hack.name}</h2>
                        </div>
                    </div>

                    <p className="text-slate-500 dark:text-zinc-400 text-lg leading-relaxed mb-10 pb-8 border-b border-slate-100 dark:border-white/5">{hack.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                        <div className="bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl p-5 hover:bg-white/[0.05] transition-colors">
                            <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" /> Organizer</div>
                            <div className="text-slate-900 dark:text-white font-bold">{hack.orgName}</div>
                        </div>
                        <div className="bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl p-5 hover:bg-white/[0.05] transition-colors">
                            <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Domain</div>
                            <div className="text-emerald-400 font-bold">{hack.category}</div>
                        </div>
                        <div className="bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl p-5 hover:bg-white/[0.05] transition-colors">
                            <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Deadline</div>
                            <div className="text-slate-900 dark:text-white font-mono text-sm tracking-tight">{new Date(hack.endDate).toLocaleDateString()}</div>
                        </div>
                        <div className="bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl p-5 hover:bg-white/[0.05] transition-colors">
                            <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500" /> Active Squads</div>
                            <div className="text-slate-900 dark:text-white font-mono font-bold">{hack.participants.length} Teams</div>
                        </div>
                    </div>

                    <button onClick={() => setView('joinTeamSetup')} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-900 dark:text-white font-black tracking-widest uppercase py-5 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-3 text-lg group">
                        <span>Initiate Team Assembly</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>
            </motion.div>
        );
    };

    const renderJoinTeamSetup = () => {
        const hack = getSelectedHackathon();
        if (!hack) return null;

        return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto pt-4 pb-20 px-4">
                <button onClick={() => setView('joinPreview')} className="text-zinc-500 hover:text-slate-900 dark:text-white mb-8 flex items-center gap-2 font-bold uppercase tracking-widest text-xs transition-colors"><ChevronRight className="w-4 h-4 rotate-180" /> Back to Target</button>

                <div className="hp-card p-8 md:p-12">
                    <h2 className="hp-heading text-3xl mb-3 text-slate-900 dark:text-white">Assemble Squad</h2>
                    <p className="text-slate-500 dark:text-zinc-400 mb-10 pb-8 border-b border-slate-100 dark:border-white/5">Register your team designation and operative details.</p>

                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="relative group">
                                <label className="hp-label">Squad Designation <span className="text-cyan-500">*</span></label>
                                <input type="text" className="hp-input font-bold text-slate-900 dark:text-white placeholder:font-normal focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)]" value={joinTeamData.teamName} onChange={e => setJoinTeamData({ ...joinTeamData, teamName: e.target.value })} placeholder="e.g. Cyber Ninjas" />
                            </div>
                            <div className="relative group">
                                <label className="hp-label">Commander Contact <span className="text-cyan-500">*</span></label>
                                <input type="email" className="hp-input focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)]" value={joinTeamData.leaderEmail} onChange={e => setJoinTeamData({ ...joinTeamData, leaderEmail: e.target.value })} placeholder="Comm channel (Email)" />
                            </div>
                            <div className="relative group">
                                <label className="hp-label">Commander ID / Reg No <span className="text-cyan-500">*</span></label>
                                <input type="text" className="hp-input font-mono focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)]" value={joinTeamData.leaderRegNo} onChange={e => setJoinTeamData({ ...joinTeamData, leaderRegNo: e.target.value })} placeholder="ID string" />
                            </div>
                        </div>

                        <div>
                            <label className="hp-label mb-4 flex items-center gap-2">Additional Operatives <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-[10px] tracking-widest">OPTIONAL</span></label>
                            <div className="space-y-4 flex flex-col items-center">
                                {joinTeamData.members?.map((m, i) => (
                                    <div key={m.id} className="flex gap-4 items-start w-full bg-white/[0.02] p-4 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex-1 space-y-4 w-full">
                                            <input type="text" className="hp-input text-sm focus:border-cyan-500" value={m.name} onChange={e => {
                                                const newMembers = [...(joinTeamData.members || [])];
                                                newMembers[i].name = e.target.value;
                                                setJoinTeamData({ ...joinTeamData, members: newMembers });
                                            }} placeholder="Operative Name" />
                                            <input type="text" className="hp-input text-sm font-mono focus:border-cyan-500" value={m.regNo} onChange={e => {
                                                const newMembers = [...(joinTeamData.members || [])];
                                                newMembers[i].regNo = e.target.value;
                                                setJoinTeamData({ ...joinTeamData, members: newMembers });
                                            }} placeholder="Identification / Reg No." />
                                        </div>
                                        <button onClick={() => setJoinTeamData({ ...joinTeamData, members: joinTeamData.members?.filter(x => x.id !== m.id) })} className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 flex items-center justify-center transition-colors border border-red-500/20 flex-shrink-0 mt-2">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                {(joinTeamData.members?.length || 0) < 4 && (
                                    <button onClick={() => setJoinTeamData({ ...joinTeamData, members: [...(joinTeamData.members || []), { id: Date.now().toString(), name: '', regNo: '' }] })} className="w-full py-4 border-2 border-dashed border-cyan-500/30 rounded-2xl text-cyan-500 font-bold uppercase tracking-widest text-sm hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all">
                                        + Recruit Operative
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-8 mt-10 border-t border-slate-100 dark:border-white/5">
                        <button onClick={handleJoinTeamNext} className="bg-gradient-to-r from-cyan-600 to-blue-500 text-slate-900 dark:text-white font-black tracking-widest text-sm uppercase py-4 px-10 rounded-2xl hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center gap-3 group">
                            Confirm Registration <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    };

    const renderJoinSubmit = () => {
        const hack = getSelectedHackathon();
        if (!hack) return null;

        return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto pt-4 pb-20 px-4">
                <button onClick={() => setView('joinTeamSetup')} className="text-zinc-500 hover:text-slate-900 dark:text-white mb-8 flex items-center gap-2 font-bold uppercase tracking-widest text-xs transition-colors"><ChevronRight className="w-4 h-4 rotate-180" /> Back to Squad Registry</button>
                <div className="hp-card p-8 md:p-12 border-emerald-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

                    <h2 className="hp-heading text-3xl mb-3 text-slate-900 dark:text-white flex items-center gap-3">
                        Deploy Final Package
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] tracking-widest uppercase rounded-md border border-emerald-500/30">Target System Offline</span>
                    </h2>
                    <p className="text-slate-500 dark:text-zinc-400 mb-10 pb-8 border-b border-slate-100 dark:border-white/5">Transmit your source code, deployment URLs, and architecture intel.</p>

                    <div className="space-y-8">
                        <div className="relative group">
                            <label className="hp-label">Target Problem Matrix <span className="text-emerald-500">*</span></label>
                            <select className="hp-input appearance-none focus:border-emerald-500 focus:shadow-[0_0_15px_rgba(16,185,129,0.2)] text-slate-900 dark:text-white font-medium" value={joinSolutionData.problemSelected} onChange={e => setJoinSolutionData({ ...joinSolutionData, problemSelected: e.target.value })}>
                                <option value="" className="text-zinc-500 bg-white dark:bg-zinc-900">-- Target System Designation --</option>
                                {hack.problemStatements.map(p => <option key={p.id} value={p.title} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">{p.title} ({p.domain})</option>)}
                                {hack.uploadedFiles.map((f, i) => <option key={i} value={f.name} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">File Node: {f.name}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="md:col-span-2 relative group">
                                <label className="hp-label">Project Codename <span className="text-emerald-500">*</span></label>
                                <input type="text" className="hp-input font-bold text-lg focus:border-emerald-500 focus:shadow-[0_0_15px_rgba(16,185,129,0.2)]" value={joinSolutionData.title} onChange={e => setJoinSolutionData({ ...joinSolutionData, title: e.target.value })} placeholder="Enter project designation" />
                            </div>
                            <div className="md:col-span-2 relative group">
                                <label className="hp-label">Attack Vector (Architecture / Approach) <span className="text-emerald-500">*</span></label>
                                <textarea className="hp-input min-h-[140px] resize-y focus:border-emerald-500 focus:shadow-[0_0_15px_rgba(16,185,129,0.2)]" value={joinSolutionData.desc} onChange={e => setJoinSolutionData({ ...joinSolutionData, desc: e.target.value })} placeholder="Detail the algorithmic strategy and deployment process..." />
                            </div>
                            <div className="relative group">
                                <label className="hp-label">Tech Stack (Arsenal)</label>
                                <input type="text" className="hp-input font-mono text-sm focus:border-emerald-500" value={joinSolutionData.tech} onChange={e => setJoinSolutionData({ ...joinSolutionData, tech: e.target.value })} placeholder="React, Node.js, Python, Rust" />
                            </div>
                            <div className="relative group">
                                <label className="hp-label">Repository Link</label>
                                <input type="url" className="hp-input focus:border-emerald-500" value={joinSolutionData.github} onChange={e => setJoinSolutionData({ ...joinSolutionData, github: e.target.value })} placeholder="https://github.com/..." />
                            </div>
                            <div className="md:col-span-2 relative group">
                                <label className="hp-label flex items-center gap-2">Live Demo URL <span className="px-2 py-0.5 bg-zinc-500/20 text-slate-500 dark:text-zinc-400 rounded text-[10px] tracking-widest uppercase">IF DEPLOYED</span></label>
                                <input type="url" className="hp-input focus:border-emerald-500" value={joinSolutionData.demo} onChange={e => setJoinSolutionData({ ...joinSolutionData, demo: e.target.value })} placeholder="https://..." />
                            </div>
                        </div>

                        <div>
                            <label className="hp-label mb-3">Upload Core Blueprints (.pdf, .zip)</label>
                            <label className="flex flex-col items-center justify-center h-32 bg-white/[0.02] border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors group">
                                <div className="text-3xl mb-2 group-hover:-translate-y-1 transition-transform">📁</div>
                                <span className="text-sm font-bold text-slate-500 dark:text-zinc-400 group-hover:text-emerald-400 uppercase tracking-widest">Select Files for Uplink</span>
                                <input type="file" multiple className="hidden" onChange={e => {
                                    const files = Array.from(e.target.files || []);
                                    const newFiles: UploadedFile[] = files.map(f => ({ name: f.name, size: f.size, type: f.type, base64: '' }));
                                    setJoinSolutionData({ ...joinSolutionData, files: [...joinSolutionData.files, ...newFiles] });
                                }} />
                            </label>

                            {joinSolutionData.files.length > 0 && (
                                <ul className="mt-4 space-y-3">
                                    {joinSolutionData.files.map((f, i) => (
                                        <li key={i} className="text-sm font-mono text-slate-600 dark:text-zinc-300 bg-white/[0.03] border border-slate-100 dark:border-white/5 px-4 py-3 rounded-xl flex justify-between items-center group">
                                            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> {f.name}</span>
                                            <button onClick={() => setJoinSolutionData({ ...joinSolutionData, files: joinSolutionData.files.filter((_, idx) => idx !== i) })} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded-md"><X className="w-4 h-4" /></button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-8 mt-10 border-t border-slate-100 dark:border-white/5">
                        <button onClick={handleJoinSubmit} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-900 dark:text-white font-black uppercase tracking-[0.2em] py-5 px-10 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] hover:scale-[1.02] transition-all flex items-center gap-4 text-lg">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Finalize Telemetry Deployment
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    };

    const renderParticipantDashboard = () => {
        const hack = getSelectedHackathon();
        if (!hack) return null;

        const myTeam = hack.participants.find(p => p.leaderName === userContext.name || p.members.some(m => m.name === userContext.name));

        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-5xl mx-auto pt-4 pb-20 px-4">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100 dark:border-white/5 relative">
                    <button onClick={() => setView('myHackathons')} className="text-zinc-500 hover:text-slate-900 dark:text-white flex items-center gap-2 font-bold uppercase tracking-widest text-xs transition-colors"><ChevronRight className="w-4 h-4 rotate-180" /> My Hackathons</button>
                    <div className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full font-black tracking-widest text-xs border border-emerald-500/30 flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" /> MISSION ACTIVE
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Header */}
                        <div className="hp-card p-8 md:p-10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] -z-10 group-hover:bg-violet-500/20 transition-all duration-700" />
                            <h1 className="hp-heading text-4xl mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-violet-300 drop-shadow-md">{hack.name}</h1>
                            <p className="text-slate-500 dark:text-zinc-400 mb-8 font-medium">Organized by <span className="text-violet-400">{hack.orgName}</span></p>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl p-4 backdrop-blur-sm">
                                    <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Status</div>
                                    <div className="text-emerald-400 font-bold">{hack.status}</div>
                                </div>
                                <div className="bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl p-4 backdrop-blur-sm">
                                    <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Time Left</div>
                                    <div className="text-slate-900 dark:text-white font-mono font-bold tracking-tight">{getRemainingTime(hack.endDate).d}d {getRemainingTime(hack.endDate).h}h</div>
                                </div>
                            </div>
                        </div>

                        {/* Submission Status */}
                        {myTeam?.isSubmitted ? (
                            <div className="hp-card p-8 border-emerald-500/30 bg-emerald-500/[0.02] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -z-10 group-hover:bg-emerald-500/20 transition-all duration-700" />
                                <div className="flex items-center gap-5 mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]"><CheckCircle className="w-7 h-7" /></div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Solution Submitted</h2>
                                        <p className="text-slate-500 dark:text-zinc-400 text-sm">Your project is securely logged in the mainframe.</p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-black/40 border border-slate-100 dark:border-white/5 p-5 rounded-2xl space-y-4 backdrop-blur-md">
                                    <div className="flex justify-between items-center"><span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Project Title</span> <span className="text-slate-900 dark:text-white font-semibold">{myTeam.solutionTitle || 'N/A'}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Target Problem</span> <span className="text-cyan-400 font-medium text-sm text-right max-w-[60%] truncate">{myTeam.problemSelected}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Timestamp</span> <span className="text-slate-900 dark:text-white font-mono text-sm">{myTeam.submittedAt ? new Date(myTeam.submittedAt).toLocaleString() : 'N/A'}</span></div>
                                </div>
                            </div>
                        ) : (
                            <div className="hp-card p-8 border-fuchsia-500/30 bg-fuchsia-500/[0.02] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px] -z-10 group-hover:bg-fuchsia-500/20 transition-all duration-700" />
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 relative z-10 flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse" /> Pending Submission</h2>
                                <p className="text-slate-500 dark:text-zinc-400 mb-8 relative z-10">Deploy your team&apos;s solution before the countdown terminates.</p>
                                <button onClick={() => setView('joinSubmit')} className="hp-btn-primary px-8 py-4 relative z-10 shadow-[0_0_20px_rgba(124,58,237,0.3)]">Deploy Project Sequence</button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <div className="hp-card p-6 relative overflow-hidden">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-lg shadow-[inset_0_0_10px_rgba(99,102,241,0.2)]">👥</div> Squad Roster</h3>
                            <div className="text-sm font-black text-slate-900 dark:text-white bg-white/[0.03] border border-slate-200 dark:border-white/10 p-4 rounded-xl mb-6 text-center uppercase tracking-[0.2em] shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">{myTeam?.teamName || 'Unknown'} <span className="text-zinc-500 tracking-normal ml-2">({myTeam?.teamNumber})</span></div>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-4 p-3 bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl hover:bg-white/[0.05] transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-slate-900 dark:text-white text-sm font-black shadow-[0_0_15px_rgba(139,92,246,0.4)] ring-2 ring-violet-500/20">L</div>
                                    <div><div className="text-slate-900 dark:text-white text-sm font-bold">{myTeam?.leaderName}</div><div className="text-[10px] uppercase tracking-widest text-violet-400 font-bold mt-0.5">Commander</div></div>
                                </li>
                                {myTeam?.members.map(m => (
                                    <li key={m.id} className="flex items-center gap-4 p-3 hover:bg-white/[0.02] rounded-xl transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800/80 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-zinc-400 text-sm font-black ring-2 ring-white/5">{m.name.charAt(0)}</div>
                                        <div><div className="text-slate-600 dark:text-zinc-300 text-sm font-bold">{m.name}</div><div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mt-0.5">Operative</div></div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="hp-card p-6">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Mission Assets</h3>
                            <div className="space-y-3">
                                <button className="w-full text-left px-5 py-4 bg-white/[0.02] border border-slate-100 dark:border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 rounded-xl transition-all text-sm font-bold text-cyan-400 flex items-center gap-3 group">
                                    <div className="p-2 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors"><Download className="w-4 h-4" /></div> Details Pack
                                </button>
                                <button className="w-full text-left px-5 py-4 bg-white/[0.02] border border-slate-100 dark:border-white/5 hover:border-violet-500/30 hover:bg-violet-500/5 rounded-xl transition-all text-sm font-bold text-violet-400 flex items-center gap-3 group">
                                    <div className="p-2 bg-violet-500/10 rounded-lg group-hover:bg-violet-500/20 transition-colors"><Download className="w-4 h-4" /></div> Dataset Archive
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    const renderHostDashboard = () => {
        const hack = getSelectedHackathon();
        if (!hack) return null;

        const csvData = "data:text/csv;charset=utf-8," + encodeURIComponent("Team Name,Leader,Email,Problem,Submitted\n" + hack.participants.map(p => `${p.teamName},${p.leaderName},${p.leaderEmail},${p.problemSelected},${p.isSubmitted}`).join('\n'));

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-6xl mx-auto pt-4 pb-20 px-4 mt-8">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100 dark:border-white/5">
                    <button onClick={() => setView('myHackathons')} className="text-zinc-500 hover:text-slate-900 dark:text-white flex items-center gap-2 font-bold uppercase tracking-widest text-xs transition-colors"><ChevronRight className="w-4 h-4 rotate-180" /> Command Center Exit</button>
                    <div className="flex gap-4">
                        <button onClick={() => copyToClipboard(hack.joinCode)} className="px-5 py-2.5 bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:bg-white/[0.08] hover:border-white/30 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                            <Copy className="w-4 h-4" /> Code: <span className="font-mono text-fuchsia-400 tracking-wider ml-1">{hack.joinCode}</span>
                        </button>
                        <a href={csvData} download={`${hack.name.replace(/\s+/g, '_')}_participants.csv`} className="px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <Download className="w-4 h-4" /> Export Operations Data
                        </a>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="hp-card p-6 border-violet-500/20 bg-violet-500/[0.02] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-[40px] -z-10 group-hover:bg-violet-500/20 transition-all duration-700" />
                        <div className="text-violet-400 text-[10px] font-black uppercase tracking-widest mb-3">Total Operatives</div>
                        <div className="text-5xl font-mono font-black text-slate-900 dark:text-white drop-shadow-[0_0_10px_rgba(139,92,246,0.3)]">{hack.participants.reduce((acc, p) => acc + 1 + p.members.length, 0)}</div>
                    </div>
                    <div className="hp-card p-6 border-cyan-500/20 bg-cyan-500/[0.02] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] -z-10 group-hover:bg-cyan-500/20 transition-all duration-700" />
                        <div className="text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-3">Registered Squads</div>
                        <div className="text-5xl font-mono font-black text-slate-900 dark:text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">{hack.participants.length}</div>
                    </div>
                    <div className="hp-card p-6 border-emerald-500/20 bg-emerald-500/[0.02] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -z-10 group-hover:bg-emerald-500/20 transition-all duration-700" />
                        <div className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-3">Target Submissions</div>
                        <div className="text-5xl font-mono font-black text-slate-900 dark:text-white drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">{hack.participants.filter(p => p.isSubmitted).length}</div>
                    </div>
                    <div className="hp-card p-6 border-fuchsia-500/20 bg-fuchsia-500/[0.02] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-[40px] -z-10 group-hover:bg-fuchsia-500/20 transition-all duration-700" />
                        <div className="text-fuchsia-400 text-[10px] font-black uppercase tracking-widest mb-3">Countdown Sequence</div>
                        <div className="text-3xl font-mono font-black text-slate-900 dark:text-white mt-4 drop-shadow-[0_0_10px_rgba(217,70,239,0.3)] tracking-tighter">{getRemainingTime(hack.endDate).ended ? 'TERMINATED' : `${getRemainingTime(hack.endDate).d}d ${getRemainingTime(hack.endDate).h}h`}</div>
                    </div>
                </div>

                <div className="hp-card overflow-hidden border border-slate-100 dark:border-white/5">
                    <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-white/[0.01]">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" /> Operations Grid</h2>
                        <p className="text-zinc-500 text-sm">Real-time telemetry on active squads and their submission status.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600 dark:text-zinc-300 border-collapse">
                            <thead className="bg-white/[0.02] text-[10px] uppercase font-black tracking-widest text-zinc-500 border-b border-slate-100 dark:border-white/5">
                                <tr>
                                    <th className="px-8 py-5">Squad Designation</th>
                                    <th className="px-8 py-5">Commander</th>
                                    <th className="px-8 py-5">Target Problem</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {hack.participants.length === 0 ? (
                                    <tr><td colSpan={5} className="px-8 py-16 text-center text-zinc-500 font-mono text-xs uppercase tracking-widest">No signals detected on the grid.</td></tr>
                                ) : (
                                    hack.participants.map((p, i) => (
                                        <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="font-bold text-slate-900 dark:text-white group-hover:text-violet-300 transition-colors">{p.teamName}</div>
                                                <div className="text-[10px] uppercase font-mono text-zinc-500 mt-1">{p.teamNumber}</div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="text-slate-600 dark:text-zinc-300 font-semibold">{p.leaderName}</div>
                                                <div className="text-xs text-zinc-500 mt-0.5">{p.leaderEmail}</div>
                                            </td>
                                            <td className="px-8 py-5 max-w-[200px] truncate text-cyan-400/80 font-medium">
                                                {p.problemSelected}
                                            </td>
                                            <td className="px-8 py-5">
                                                {p.isSubmitted ?
                                                    <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md text-[10px] uppercase font-black tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.1)]">Transmitted</span> :
                                                    <span className="px-3 py-1.5 bg-zinc-500/10 border border-zinc-500/30 text-slate-500 dark:text-zinc-400 rounded-md text-[10px] uppercase font-black tracking-widest">In Progress</span>
                                                }
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <button disabled={!p.isSubmitted} className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 rounded-lg text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wider">Inspect Data</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
        );
    };

    const renderMyHackathons = () => {
        const hosted = hackathons.filter(h => h.createdBy === userContext.id);
        const participated = hackathons.filter(h => h.participants.some(p => p.leaderName === userContext.name || p.members.some(m => m.name === userContext.name)));

        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-6xl mx-auto pt-10 pb-20 px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 pb-8 border-b border-slate-100 dark:border-white/5 gap-6">
                    <div>
                        <h1 className="hp-heading text-4xl md:text-5xl text-slate-900 dark:text-white mb-2 tracking-tight">Active Logs</h1>
                        <p className="text-zinc-500 text-sm uppercase tracking-widest font-bold">Review your hosted nodes and active squad deployments.</p>
                    </div>
                    <button onClick={() => setView('hub')} className="bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:bg-white/[0.1] px-6 py-3 rounded-xl font-bold transition-all text-sm tracking-widest uppercase flex items-center gap-3 group">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Hub
                    </button>
                </div>

                <div className="space-y-16">
                    {/* Hosted */}
                    <section>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-4 uppercase tracking-[0.2em]"><div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(139,92,246,0.2)]">👑</div> Systems Commanded</h2>
                        {hosted.length === 0 ? (
                            <div className="text-center p-12 border border-dashed border-slate-200 dark:border-white/10 rounded-3xl text-zinc-600 font-mono text-sm uppercase tracking-widest bg-white/[0.01]">No frameworks deployed.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {hosted.map(h => (
                                    <div key={h.id} className="hp-card p-8 hover:-translate-y-2 transition-transform duration-500 group cursor-pointer border-violet-500/20 hover:border-violet-500/50 hover:shadow-[0_20px_40px_rgba(139,92,246,0.15)] relative overflow-hidden" onClick={() => { setSelectedHackId(h.id); setView('hostDashboard'); }}>
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/5 rounded-full blur-[60px] -z-10 group-hover:bg-violet-500/20 transition-all duration-700" />

                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 text-2xl group-hover:scale-110 transition-transform shadow-[inset_0_0_15px_rgba(139,92,246,0.1)]">🏆</div>
                                            <div className={`text-[10px] font-black tracking-widest px-3 py-1.5 rounded-md border ${getRemainingTime(h.endDate).ended ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 flex items-center gap-2'}`}>
                                                {!getRemainingTime(h.endDate).ended && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                                                {getRemainingTime(h.endDate).ended ? 'OFFLINE' : 'ONLINE'}
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 truncate group-hover:text-violet-300 transition-colors">{h.name}</h3>
                                        <p className="text-sm text-zinc-500 mb-8 font-medium">{h.participants.length} Active Squads</p>
                                        <button className="w-full py-4 bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400 group-hover:bg-violet-600 group-hover:text-slate-900 dark:text-white group-hover:border-violet-500 transition-all shadow-[0_0_0_rgba(139,92,246,0)] group-hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]">Access Console</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Participated */}
                    <section>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-4 uppercase tracking-[0.2em]"><div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(6,182,212,0.2)]">🚀</div> Active Deployments</h2>
                        {participated.length === 0 ? (
                            <div className="text-center p-12 border border-dashed border-slate-200 dark:border-white/10 rounded-3xl text-zinc-600 font-mono text-sm uppercase tracking-widest bg-white/[0.01]">No active missions.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {participated.map(h => (
                                    <div key={h.id} className="hp-card p-8 hover:-translate-y-2 transition-transform duration-500 group cursor-pointer border-cyan-500/20 hover:border-cyan-500/50 hover:shadow-[0_20px_40px_rgba(6,182,212,0.15)] relative overflow-hidden" onClick={() => { setSelectedHackId(h.id); setView('participantDashboard'); }}>
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-[60px] -z-10 group-hover:bg-cyan-500/20 transition-all duration-700" />

                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-2xl group-hover:scale-110 transition-transform shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]">💻</div>
                                            <div className={`text-[10px] font-black tracking-widest px-3 py-1.5 rounded-md border ${getRemainingTime(h.endDate).ended ? 'bg-zinc-500/10 text-slate-500 dark:text-zinc-400 border-zinc-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30 flex items-center gap-2'}`}>
                                                {!getRemainingTime(h.endDate).ended && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
                                                {getRemainingTime(h.endDate).ended ? 'ARCHIVED' : 'IN PROGRESS'}
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 truncate group-hover:text-cyan-300 transition-colors">{h.name}</h3>
                                        <p className="text-xs text-zinc-500 mb-8 font-bold uppercase tracking-wider">Node: {h.orgName}</p>
                                        <button className="w-full py-4 bg-gradient-to-r from-cyan-600/50 to-blue-600/50 border border-cyan-500/30 rounded-xl text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white group-hover:from-cyan-500 group-hover:to-blue-500 transition-all shadow-[0_0_0_rgba(6,182,212,0)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.6)]">Engage Dashboard</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </motion.div>
        );
    };

    // --- Render Hub ---
    const renderHub = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-6xl mx-auto pt-10 pb-20 px-4">
            <div className="flex justify-between items-center mb-12 relative z-10">
                <div>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-white/[0.03] border border-white/[0.1] backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-widest">Network Active</span>
                    </motion.div>
                    <h1 className="hp-heading text-4xl md:text-6xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-300 to-cyan-300 drop-shadow-lg tracking-tight">Hackathon Hub</h1>
                    <p className="text-slate-500 dark:text-zinc-400 text-sm md:text-lg max-w-xl leading-relaxed">Create a breathtaking competition ecosystem or join forces with an existing squad.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setView('myHackathons')}
                    className="flex flex-col md:flex-row items-center gap-3 bg-white/[0.05] hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 px-6 py-4 rounded-2xl transition-all shadow-lg backdrop-blur-xl group"
                >
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-xl group-hover:bg-indigo-500/40 transition-colors">🗂️</div>
                    <span className="font-bold text-sm tracking-wider uppercase text-slate-600 dark:text-zinc-300 group-hover:text-slate-900 dark:text-white transition-colors">My Hackathons</span>
                </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {/* Create Card */}
                <motion.div whileHover={{ scale: 1.02, y: -10 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="hp-card p-8 md:p-12 relative overflow-hidden group border-violet-500/20 hover:border-violet-500/50 cursor-pointer" onClick={() => setView('createStep1')}>
                    <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-[120px] -z-10 group-hover:bg-violet-600/30 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="w-20 h-20 rounded-3xl bg-violet-500/10 flex items-center justify-center mb-10 border border-violet-500/30 shadow-[inset_0_0_20px_rgba(139,92,246,0.2)] group-hover:shadow-[inset_0_0_40px_rgba(139,92,246,0.4)] transition-all">
                        <span className="text-4xl drop-shadow-[0_0_20px_rgba(139,92,246,1)] group-hover:scale-110 transition-transform duration-500">🏆</span>
                        <div className="absolute -bottom-2 -right-2 bg-white dark:bg-zinc-950 rounded-full text-slate-900 dark:text-white text-sm w-8 h-8 flex items-center justify-center border-2 border-violet-500/50 shadow-[0_0_10px_rgba(139,92,246,0.5)]">➕</div>
                    </div>

                    <h2 className="hp-heading text-3xl mb-4 text-slate-900 dark:text-white group-hover:text-violet-300 transition-colors">Create Event</h2>
                    <p className="text-slate-500 dark:text-zinc-400 leading-relaxed mb-12 min-h-[80px] text-lg">
                        Construct a high-stakes hackathon. Define parameters, generate secure join access, and command the host analytics grid.
                    </p>

                    <button
                        className="hp-btn-primary w-full py-5 text-lg font-black tracking-widest uppercase flex items-center justify-center gap-3"
                        onClick={(e) => { e.stopPropagation(); setView('createStep1'); }}
                    >
                        <span>Initialize Event</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </button>
                </motion.div>

                {/* Join Card */}
                <motion.div whileHover={{ scale: 1.02, y: -10 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="hp-card p-8 md:p-12 relative overflow-hidden group border-cyan-500/20 hover:border-cyan-500/50">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-[120px] -z-10 group-hover:bg-cyan-600/30 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 flex items-center justify-center mb-10 border border-cyan-500/30 shadow-[inset_0_0_20px_rgba(6,182,212,0.2)] group-hover:shadow-[inset_0_0_40px_rgba(6,182,212,0.4)] transition-all">
                        <span className="text-4xl drop-shadow-[0_0_20px_rgba(6,182,212,1)] group-hover:scale-110 transition-transform duration-500">🔗</span>
                    </div>

                    <h2 className="hp-heading text-3xl mb-4 text-slate-900 dark:text-white group-hover:text-cyan-300 transition-colors">Join Squad</h2>
                    <p className="text-slate-500 dark:text-zinc-400 leading-relaxed mb-8 text-lg">
                        Input the 9-character authorization sequence to breach an active hackathon node. Form a team to compete.
                    </p>

                    <div className={`mt-2 mb-8 ${joinShake ? 'shake-anim' : ''}`}>
                        <div className="flex gap-2 justify-between mb-3 w-full max-w-sm mx-auto">
                            {joinCodeParts.map((char, idx) => (
                                <input
                                    key={idx}
                                    ref={el => { joinInputRefs.current[idx] = el; }}
                                    type="text"
                                    maxLength={1}
                                    value={char}
                                    onChange={e => handleJoinCodeChange(idx, e.target.value)}
                                    onKeyDown={e => handleJoinCodeKeyDown(idx, e)}
                                    onPaste={idx === 0 ? handleJoinCodePaste : undefined}
                                    className={`code-box ${char ? 'filled' : ''} ${joinError ? 'error' : ''} flex-1 max-w-[48px]`}
                                />
                            ))}
                        </div>
                        {joinError && <p className="text-red-400 text-sm text-center font-bold mt-4 bg-red-500/10 py-2 rounded-lg backdrop-blur-md border border-red-500/20">{joinError}</p>}
                    </div>

                    <button
                        onClick={submitJoin}
                        className="w-full py-5 text-lg flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-900 dark:text-white font-black tracking-widest uppercase rounded-[16px] transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] group-hover:scale-[1.01]"
                    >
                        <span>Authorize Access</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </button>
                </motion.div>
            </div>
        </motion.div>
    );

    return (
        <div className="hp-bg flex flex-col pt-16">
            {/* Need ChevronRight for Create Form, so doing a quick inline import for it */}
            <GlobalStyles />
            <AnimatePresence mode="wait">
                {view === 'hub' && <motion.div key="hub" exit={{ opacity: 0, y: -20 }}>{renderHub()}</motion.div>}
                {view === 'createStep1' && <motion.div key="create1" exit={{ opacity: 0, x: -20 }}>{renderCreateStep1()}</motion.div>}
                {view === 'createStep2' && <motion.div key="create2" exit={{ opacity: 0, x: -20 }}>{renderCreateStep2()}</motion.div>}
                {view === 'createSuccess' && <motion.div key="createSuc" exit={{ opacity: 0, scale: 0.9 }}>{renderCreateSuccess()}</motion.div>}

                {view === 'joinPreview' && <motion.div key="jp" exit={{ opacity: 0, scale: 0.95 }}>{renderJoinPreview()}</motion.div>}
                {view === 'joinTeamSetup' && <motion.div key="jt" exit={{ opacity: 0, x: -20 }}>{renderJoinTeamSetup()}</motion.div>}
                {view === 'joinSubmit' && <motion.div key="js" exit={{ opacity: 0, x: -20 }}>{renderJoinSubmit()}</motion.div>}
                {view === 'participantDashboard' && <motion.div key="pd" exit={{ opacity: 0, scale: 0.95 }}>{renderParticipantDashboard()}</motion.div>}
                {view === 'hostDashboard' && <motion.div key="hd" exit={{ opacity: 0, scale: 0.95 }}>{renderHostDashboard()}</motion.div>}
                {view === 'myHackathons' && <motion.div key="mh" exit={{ opacity: 0, y: -20 }}>{renderMyHackathons()}</motion.div>}

                {view !== 'hub' && view !== 'createStep1' && view !== 'createStep2' && view !== 'createSuccess' && view !== 'joinPreview' && view !== 'joinTeamSetup' && view !== 'joinSubmit' && view !== 'participantDashboard' && view !== 'hostDashboard' && view !== 'myHackathons' && (
                    <motion.div key="ph" className="text-center p-20 text-xl font-mono">Building view: {view}...</motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
