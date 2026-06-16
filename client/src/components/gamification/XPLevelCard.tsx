import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import IntervyxaCoin from '../reward-system/IntervyxaCoin';

interface XPLevelCardProps {
    user: any;
}

const XPLevelCard: React.FC<XPLevelCardProps> = ({ user }) => {
    const level = user.level || 1;
    const currentCoins = user.intervyxaCoins || 0;
    const nextLevelCoins = level * 1000 * 2;
    const progress = Math.min(100, (currentCoins / nextLevelCoins) * 100);

    return (
        <Card className="bg-gradient-to-br from-yellow-900/40 to-amber-600/10 border-yellow-500/20 rounded-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-colors" />

            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Rank & level</h3>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-white">{level}</span>
                            <span className="text-yellow-500 font-bold mb-1 tracking-tight italic">INTERVYXA CHAMPION</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                    <div className="flex justify-between items-center text-xs font-semibold mb-2">
                        <div className="flex items-center gap-1.5">
                            <span className="text-yellow-400 font-black">{currentCoins.toLocaleString()}</span>
                            <IntervyxaCoin size={14} animate={false} glow={false} />
                        </div>
                        <span className="text-zinc-500 font-bold">{Math.round(nextLevelCoins).toLocaleString()} Target</span>
                    </div>
                    <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-[2px]">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className="h-full bg-gradient-to-r from-yellow-600 via-amber-400 to-yellow-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                        />
                    </div>
                </div>

                <p className="text-[10px] font-bold text-yellow-500/60 mt-2 flex items-center gap-1 uppercase tracking-widest">
                    <TrendingUp className="w-3 h-3" />
                    {Math.round(nextLevelCoins - currentCoins).toLocaleString()} more coins to level up
                </p>
            </CardContent>
        </Card>
    );
};

export default XPLevelCard;
