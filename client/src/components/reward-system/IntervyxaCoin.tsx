import React from 'react';
import { motion } from 'framer-motion';
import '../../styles/Coin.css';

interface IntervyxaCoinProps {
    size?: number;
    className?: string;
    glow?: boolean;
    animate?: boolean;
    speed?: number; // rotation speed in seconds (default 3)
}

/**
 * Enhanced 3D Intervyxa Coin
 * Features high-res textures, physical rim thickness, and orbiting energy particles.
 */
const IntervyxaCoin: React.FC<IntervyxaCoinProps> = ({
    size = 40,
    className = "",
    glow = true,
    animate = true,
    speed = 3
}) => {
    return (
        <div
            className={`relative flex items-center justify-center ${className}`}
            style={{ 
                perspective: '1000px',
                width: size,
                height: size
            }}
        >
            {/* Outer Energy Glow */}
            {glow && (
                <motion.div
                    animate={animate ? {
                        scale: [1, 1.15, 1],
                        opacity: [0.3, 0.6, 0.3],
                    } : {}}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute rounded-full"
                    style={{
                        width: size * 1.5,
                        height: size * 1.5,
                        background: 'radial-gradient(circle, rgba(234,179,8,0.4) 0%, rgba(245,158,11,0.1) 60%, transparent 80%)',
                        filter: 'blur(10px)',
                        zIndex: 0
                    }}
                />
            )}

            {/* Orbiting Tech Particles */}
            {animate && (
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: speed * 3,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute inset-0 z-0"
                >
                    {[0, 90, 180, 270].map((deg, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full"
                            style={{
                                width: size * 0.1,
                                height: size * 0.1,
                                background: '#fbbf24',
                                boxShadow: '0 0 8px #f59e0b',
                                top: '50%',
                                left: '50%',
                                transform: `rotate(${deg}deg) translateX(${size * 0.75}px) translateY(-50%)`,
                            }}
                        />
                    ))}
                </motion.div>
            )}

            {/* The 3D Coin Body */}
            <motion.div
                className="relative preserve-3d"
                animate={animate ? { rotateY: 360 } : {}}
                transition={{ 
                    repeat: Infinity, 
                    duration: speed, 
                    ease: "linear" 
                }}
                style={{
                    width: size,
                    height: size,
                    transformStyle: 'preserve-3d'
                }}
            >
                {/* Front Face with Texture */}
                <div 
                    className="absolute inset-0 rounded-full bg-cover bg-center backface-hidden"
                    style={{ 
                        backgroundImage: "url('/assets/coin_texture.png')",
                        transform: 'translateZ(3px)',
                        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-full" />
                </div>
                
                {/* Back Face with Texture */}
                <div 
                    className="absolute inset-0 rounded-full bg-cover bg-center backface-hidden"
                    style={{ 
                        backgroundImage: "url('/assets/coin_texture.png')",
                        transform: 'rotateY(180deg) translateZ(3px)',
                        filter: 'hue-rotate(15deg) contrast(1.1)',
                        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
                    }}
                >
                     <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-full" />
                </div>

                {/* 3D Rim (Thickness) */}
                {[...Array(16)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-[6px] h-full left-1/2 -ml-[3px] bg-gradient-to-b from-amber-600 via-yellow-400 to-amber-700"
                        style={{
                            transform: `rotateY(${i * 22.5}deg) translateZ(${size/2 - 1}px)`,
                            opacity: 0.9
                        }}
                    />
                ))}
                
                {/* Inner Shimmer Layer */}
                <div className="coin-glint" />
            </motion.div>
        </div>
    );
};

export default IntervyxaCoin;
