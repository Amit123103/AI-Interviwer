import React from 'react';
import { Check, Target, Code2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import IntervyxaCoin from '../reward-system/IntervyxaCoin';

interface Mission {
    id: string;
    type: string;
    target: number;
    progress: number;
    completed: boolean;
}

interface DailyMissionsProps {
    missions: Mission[];
}

const DailyMissions: React.FC<DailyMissionsProps> = ({ missions }) => {

    const getIcon = (type: string) => {
        switch (type) {
            case 'practice': return <Target className="w-4 h-4 text-amber-400" />;
            case 'code': return <Code2 className="w-4 h-4 text-yellow-400" />;
            default: return <Sparkles className="w-4 h-4 text-zinc-400" />;
        }
    };

    const getLabel = (type: string, target: number) => {
        switch (type) {
            case 'practice': return `Complete ${target} Practice Session${target > 1 ? 's' : ''}`;
            case 'questions': return `Answer ${target} Question${target > 1 ? 's' : ''}`;
            case 'code': return `Submit ${target} Lines of Code`;
            default: return `Complete Daily Challenge`;
        }
    };

    return (
        <Card className="bg-zinc-900/50 border-white/5 h-full overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl" />

            <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-zinc-400">
                    <Target className="w-3.5 h-3.5 text-yellow-500/80" />
                    Daily Operations
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
                {missions && missions.length > 0 ? (
                    missions.map((mission) => (
                        <div key={mission.id} className="group">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${mission.completed ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5 border border-white/5'}`}>
                                        {mission.completed ? <Check className="w-4 h-4 text-emerald-500" /> : getIcon(mission.type)}
                                    </div>
                                    <div className='flex flex-col'>
                                        <span className={`text-[11px] font-bold tracking-tight ${mission.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                                            {getLabel(mission.type, mission.target)}
                                        </span>
                                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-0.5">
                                            {mission.progress} / {mission.target} • {Math.round((mission.progress / mission.target) * 100)}%
                                        </span>
                                    </div>
                                </div>
                                {mission.completed && (
                                    <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/10">
                                        <span className="text-[10px] font-black text-emerald-400">+50</span>
                                        <IntervyxaCoin size={10} animate={false} glow={false} />
                                    </div>
                                )}
                            </div>
                            <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${mission.completed ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-gradient-to-r from-yellow-600 to-amber-400'}`}
                                    style={{ width: `${Math.min(100, (mission.progress / mission.target) * 100)}%` }}
                                />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-zinc-500 text-[10px] font-bold text-center py-6 bg-white/[0.02] rounded-2xl border border-white/5 border-dashed">
                        MISSION CONTROL: ALL CLEAR
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default DailyMissions;
