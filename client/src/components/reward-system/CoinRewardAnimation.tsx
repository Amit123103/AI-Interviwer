import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IntervyxaCoin from './IntervyxaCoin';
import { useWindowSize } from '@/hooks/use-window-size';

interface CoinRewardAnimationProps {
    isVisible: boolean;
    onComplete: () => void;
    coinsEarned: number;
    targetRef?: React.RefObject<HTMLElement>;
}

const CoinRewardAnimation: React.FC<CoinRewardAnimationProps> = ({
    isVisible,
    onComplete,
    coinsEarned,
    targetRef
}) => {
    const { width, height } = useWindowSize();
    const [phase, setPhase] = useState<'appear' | 'spin' | 'move' | 'hidden'>('appear');

    useEffect(() => {
        if (isVisible) {
            setPhase('appear');
            const timer = setTimeout(() => setPhase('spin'), 1000);
            return () => clearTimeout(timer);
        } else {
            setPhase('hidden');
        }
    }, [isVisible]);

    const handleAnimationComplete = () => {
        if (phase === 'move') {
            onComplete();
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    <div className="relative flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={phase === 'appear' || phase === 'spin' ? {
                                scale: [0, 1.2, 1],
                                rotate: 0
                            } : {
                                scale: 0.2,
                                x: targetRef?.current ? targetRef.current.getBoundingClientRect().left - (width || 0) / 2 : 0,
                                y: targetRef?.current ? targetRef.current.getBoundingClientRect().top - (height || 0) / 2 : -height! / 2,
                                transition: { duration: 0.8, ease: "anticipate" }
                            }}
                            onAnimationComplete={() => {
                                if (phase === 'spin') {
                                    setTimeout(() => setPhase('move'), 1500);
                                } else if (phase === 'move') {
                                    onComplete();
                                }
                            }}
                            className="relative"
                        >
                            <IntervyxaCoin size={200} glow animate={phase === 'spin'} />

                            {/* Particle sparks */}
                            {phase === 'spin' && (
                                <div className="absolute inset-0">
                                    {[...Array(12)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{
                                                opacity: [0, 1, 0],
                                                scale: [0, 1.5, 0.5],
                                                x: (Math.random() - 0.5) * 300,
                                                y: (Math.random() - 0.5) * 300,
                                            }}
                                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                                            className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400 rounded-full blur-[1px]"
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={phase !== 'move' ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                            className="mt-8 text-center"
                        >
                            <h3 className="text-4xl font-black text-white drop-shadow-lg mb-2">
                                You earned Intervyxa Coins!
                            </h3>
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-6xl font-black text-yellow-400">+{coinsEarned}</span>
                                <IntervyxaCoin size={40} glow={false} />
                            </div>
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={phase === 'spin' ? { opacity: 1, scale: 1 } : { opacity: 0 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setPhase('move')}
                            className="mt-12 px-10 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-2xl font-black text-xl shadow-2xl shadow-yellow-500/20 pointer-events-auto active:scale-95 transition-transform"
                        >
                            CLAIM NOW
                        </motion.button>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CoinRewardAnimation;
