"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const PALETTE = ["#DBCAC0", "#3E4F32", "#6F8055", "#DBCAC0"];

export function ParticleBackground() {
  const [particles, setParticles] = useState<{ id: number, x: number, y: number, size: number, duration: number, color: string }[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)]
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full shadow-lg"
          style={{ 
            width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%`,
            backgroundColor: p.color,
            boxShadow: `0 0 12px ${p.color}80` // 80 is hex for 50% opacity
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, 50, 0],
            opacity: [0.1, 0.7, 0.1]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
}
