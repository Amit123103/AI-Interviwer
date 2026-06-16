import React from 'react';
import { motion } from 'framer-motion';
import {
    Coins,
    History,
    TrendingUp,
    Calendar,
    Award,
    Briefcase,
    Code,
    Users,
    Zap
} from 'lucide-react';
import IntervyxaCoin from './IntervyxaCoin';

interface CoinWalletProps {
    totalCoins: number;
    history?: any[];
}

const CoinWallet: React.FC<CoinWalletProps> = ({ totalCoins, history = [] }) => {
    // Mock history if empty for demonstration
    const earningHistory = history.length > 0 ? history : [
        { id: 1, activity: 'Completed Daily Task', coins: 50, date: 'Today', icon: Calendar, color: 'text-emerald-400' },
        { id: 2, activity: 'Mock Interview: Frontend Dev', coins: 150, date: 'Yesterday', icon: Briefcase, color: 'text-blue-400' },
        { id: 3, activity: 'Solved Coding Challenge', coins: 80, date: '2 days ago', icon: Code, color: 'text-violet-400' },
        { id: 4, activity: 'Peer Review Session', coins: 30, date: 'Feb 25', icon: Users, color: 'text-amber-400' },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Wallet Balance Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
            >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Coins size={120} />
                </div>

                <div className="relative z-10">
                    <h3 className="text-zinc-400 font-bold uppercase tracking-widest text-xs mb-1">Intervyxa Coin Balance</h3>
                    <div className="flex items-center gap-4">
                        <span className="text-6xl font-black text-white tabular-nums tracking-tighter">
                            {totalCoins.toLocaleString()}
                        </span>
                        <IntervyxaCoin size={64} animate={true} />
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Weekly Earnings</p>
                            <p className="text-xl font-bold text-emerald-400">+450 <span className="text-xs text-zinc-500 font-medium ml-1">coins</span></p>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Rank</p>
                            <p className="text-xl font-bold text-yellow-400">#12 <span className="text-xs text-zinc-500 font-medium ml-1">in Top Weekly</span></p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Motivation Box */}
            <div className="bg-gradient-to-r from-indigo-500/10 to-fuchsia-500/10 rounded-3xl p-6 border border-indigo-500/20">
                <div className="flex items-start gap-4">
                    <div className="bg-indigo-500/20 p-3 rounded-2xl">
                        <TrendingUp className="text-indigo-400 w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-lg">Next Milestone</h4>
                        <p className="text-zinc-400 text-sm mb-4">Earn 50 coins to unlock Pro Interview Set</p>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '80%' }}
                                className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Earning History */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h4 className="text-white font-bold flex items-center gap-2">
                        <History className="w-4 h-4 text-zinc-500" />
                        Earning History
                    </h4>
                    <button className="text-xs font-bold text-zinc-500 hover:text-white transition-colors">See All</button>
                </div>

                <div className="space-y-2">
                    {earningHistory.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-4 border border-white/5"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-xl bg-zinc-900/50 ${item.color}`}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors">{item.activity}</p>
                                    <p className="text-[10px] text-zinc-500 font-medium">{item.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-white">+{item.coins}</span>
                                <IntervyxaCoin size={16} glow={false} animate={false} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="bg-zinc-900/40 rounded-3xl p-6 border border-white/5 text-center mt-4">
                <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                <h4 className="text-white font-bold mb-1">Coin Multiplier Active</h4>
                <p className="text-xs text-zinc-500">Achieve Skill Champion level for 2x coin boosts</p>
                <p className="mt-4 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">10 more coins to reach level</p>
            </div>
        </div>
    );
};

export default CoinWallet;
