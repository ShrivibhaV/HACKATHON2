'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Play, MousePointer2, Sparkles } from 'lucide-react';

interface SoundBallSimulatorProps {
  word: string;
  syllables: string[];
}

// ─── Audio Engine ───────────────────────────────────────────
// Synthesizes a clean, playful "boop" sound at different pitches
const playSyllableSound = (index: number, total: number) => {
  if (typeof window === 'undefined') return;
  
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Pitch goes up for later syllables to keep it interesting
  // Root frequency around 220Hz (A3), steps up 4th/5ths
  const baseFreq = 220;
  const freq = baseFreq * Math.pow(1.5, index);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, ctx.currentTime);

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.5);
};

export function SoundBallSimulator({ word, syllables }: SoundBallSimulatorProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleBallClick = (idx: number) => {
    setActiveIdx(idx);
    playSyllableSound(idx, syllables.length);
    setTimeout(() => setActiveIdx(null), 300);
  };

  const playSequence = async () => {
    if (isAutoPlaying) return;
    setIsAutoPlaying(true);
    
    for (let i = 0; i < syllables.length; i++) {
      handleBallClick(i);
      await new Promise(r => setTimeout(r, 600));
    }
    
    setIsAutoPlaying(false);
  };

  return (
    <div className="glass-card p-6 space-y-6 relative overflow-hidden bg-white group/sb">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#7c5bf9]/10 text-[#7c5bf9]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#1e1b4b] text-lg uppercase tracking-wider">{word}</h3>
            <p className="text-xs text-slate-500 italic">Phonetic Sound-Balls: Tap to hear syllables</p>
          </div>
        </div>
        
        <button 
          onClick={playSequence}
          disabled={isAutoPlaying}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#7c5bf9] text-white text-sm font-bold shadow-lg shadow-[#7c5bf9]/25 hover:scale-105 transition-transform disabled:opacity-50"
        >
          {isAutoPlaying ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
          Read Full Word
        </button>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-6 min-h-[160px] py-4 bg-slate-50/50 rounded-3xl border border-slate-100">
        <AnimatePresence>
          {syllables.map((syllable, i) => (
            <motion.div
              key={i}
              className="relative"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1, type: 'spring', damping: 12 }}
            >
              <button
                onClick={() => handleBallClick(i)}
                className={`
                  w-24 h-24 rounded-full flex items-center justify-center text-xl font-black transition-all
                  shadow-xl select-none outline-none
                  ${activeIdx === i 
                    ? 'scale-110 shadow-[#7c5bf9]/40 border-4 border-[#7c5bf9]' 
                    : 'hover:scale-105 border-4 border-transparent hover:border-slate-200'
                  }
                `}
                style={{
                  background: activeIdx === i 
                    ? 'linear-gradient(135deg, #7c5bf9, #9d7cff)' 
                    : `hsla(${240 + i * (60 / syllables.length)}, 70%, 95%, 1)`,
                  color: activeIdx === i ? 'white' : '#4338ca',
                  boxShadow: activeIdx === i 
                    ? '0 20px 40px -10px rgba(124, 91, 249, 0.4)' 
                    : 'inset 0 -8px 16px rgba(0,0,0,0.05), 0 10px 20px rgba(0,0,0,0.03)'
                }}
              >
                {syllable}
              </button>
              
              {/* Particle effect on click */}
              {activeIdx === i && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {[0, 72, 144, 216, 288].map(deg => (
                    <motion.div
                      key={deg}
                      className="absolute w-2 h-2 rounded-full bg-[#7c5bf9]"
                      initial={{ x: 0, y: 0 }}
                      animate={{ 
                        x: Math.cos(deg * Math.PI / 180) * 60, 
                        y: Math.sin(deg * Math.PI / 180) * 60 
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
        <MousePointer2 className="w-3 h-3" />
        PRO-TIP: Click balls in sequence to blend the sounds!
      </div>
    </div>
  );
}
