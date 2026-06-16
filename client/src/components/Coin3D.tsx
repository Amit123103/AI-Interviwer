"use client"

import React from 'react'
import { motion } from 'framer-motion'
import '../styles/Coin.css'

interface Coin3DProps {
  size?: number
  className?: string
  autoSpin?: boolean
  showGlint?: boolean
}

/**
 * Premium 3D Intervyxa Coin Component
 * Created with CSS 3D transforms and Framer Motion.
 */
const Coin3D: React.FC<Coin3DProps> = ({ 
  size = 120, 
  className = "", 
  autoSpin = true,
  showGlint = true 
}) => {
  return (
    <div 
      className={`coin-container ${className}`}
      style={{ width: size, height: size }}
    >
      <motion.div
        className="coin-object"
        animate={autoSpin ? { rotateY: 360 } : {}}
        transition={{ 
          repeat: Infinity, 
          duration: 3, 
          ease: "linear" 
        }}
        whileHover={{ scale: 1.1, cursor: 'pointer' }}
      >
        {/* Front Face */}
        <div className={`coin-face coin-front ${showGlint ? "glint" : ""}`}></div>
        
        {/* Back Face */}
        <div className={`coin-face coin-back ${showGlint ? "glint" : ""}`}></div>
        
        {/* 3D Edge (Rim) - Create thickness with small slices */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="edge-segment"
            style={{
              transform: `rotateY(${i * 15}deg) translateZ(${size / 2}px)`
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}

export default Coin3D
