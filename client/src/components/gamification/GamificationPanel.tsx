import React from 'react';
import XPLevelCard from './XPLevelCard';
import IntervyxaCoin from '../reward-system/IntervyxaCoin';
import DailyMissions from './DailyMissions';
import BadgeGrid from './BadgeGrid';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';

interface GamificationPanelProps {
    user: any;
}

const GamificationPanel: React.FC<GamificationPanelProps> = ({ user }) => {
    if (!user) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
            {/* Intervyxa Coin Balance & Level */}
            <div className="md:col-span-12 lg:col-span-4 xl:col-span-3">
                <XPLevelCard user={user} />
            </div>

            {/* Quick Coin Wallet Summary */}
            <div className="md:col-span-6 lg:col-span-4 xl:col-span-3">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Coin Wallet</p>
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-black text-white tabular-nums">{(user.intervyxaCoins || 0).toLocaleString()}</span>
                                <IntervyxaCoin size={24} animate={true} />
                            </div>
                        </div>
                        <div className="bg-yellow-500/10 p-2.5 rounded-xl border border-yellow-500/20">
                            <Wallet className="w-5 h-5 text-yellow-500" />
                        </div>
                    </div>

                    <div className="mt-6 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-500 font-bold">Today's Earnings</span>
                            <span className="text-emerald-400 font-black">+120 coins</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-yellow-500" />
                        </div>
                    </div>

                    <button className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all">
                        View Full Wallet
                    </button>
                </motion.div>
            </div>

            {/* Daily Missions */}
            <div className="md:col-span-6 lg:col-span-4 xl:col-span-3">
                <DailyMissions missions={user.dailyMissions || []} />
            </div>

            {/* Badges */}
            <div className="hidden xl:block xl:col-span-3">
                <BadgeGrid achievements={user.achievements || []} />
            </div>
        </div>
    );
};

export default GamificationPanel;
