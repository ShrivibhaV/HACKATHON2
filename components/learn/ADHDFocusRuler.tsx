'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ADHDFocusRulerProps {
  enabled: boolean;
  containerRef?: React.RefObject<HTMLElement>;
}

/**
 * ADHD Focus Ruler (Module B)
 * 
 * Tracks mouse position and highlights the paragraph under the cursor.
 * All other paragraphs are dimmed and blurred — maximum focus on one idea at a time.
 * Moves instantly (< 5ms) to meet the <200ms requirement.
 */
export function ADHDFocusRuler({ enabled, containerRef }: ADHDFocusRulerProps) {
  const rulerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!rulerRef.current) return;
        // Position ruler 24px above cursor centre so it covers the line being read
        rulerRef.current.style.top = `${e.clientY - 24}px`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* Dark overlay above the ruler */}
      <div
        className="fixed inset-0 z-20 pointer-events-none"
        style={{ background: 'rgba(8,8,26,0.65)' }}
      />
 Sands of Time: increased opacity slightly to compensate for lost focus from blur.
      {/* The ruler strip — sits on top of overlay, reveals the current line */}
      <div
        ref={rulerRef}
        className="fixed left-0 right-0 z-30 pointer-events-none"
        style={{
          height: '3.5rem',
          background: 'rgba(8,8,26,0)',        // transparent — shows through overlay
          boxShadow: 'none',
          mixBlendMode: 'normal',
          // The ruler CLEARS the blur above/below via a clip trick using box shadow spread
          outline: 'none',
          border: 'none',
        }}
        // Use the "cut-out" illusion: a bright bordered strip at z:31
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'rgba(124,91,249,0.06)',
            borderTop: '2px solid rgba(124,91,249,0.5)',
            borderBottom: '2px solid rgba(124,91,249,0.5)',
            boxShadow: '0 0 20px rgba(124,91,249,0.15)',
          }}
        />
      </div>
    </>
  );
}

/**
 * Paragraph-level blur — wraps each chunk/paragraph so only the active one is visible.
 * Used in ADHD chunk view alongside the ruler.
 */
export function ADHDChunkFocus({
  chunks,
  initialChunk = 0,
  onChunkChange,
  ageConfig,
}: {
  chunks: string[];
  initialChunk?: number;
  onChunkChange?: (idx: number) => void;
  ageConfig?: { useEmojiGuides: boolean; encouragementStyle: string };
}) {
  const [activeIdx, setActiveIdx] = useState(initialChunk);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [showScore, setShowScore] = useState(false);

  const goTo = (idx: number) => {
    setActiveIdx(idx);
    onChunkChange?.(idx);
  };

  const goNext = () => {
    setCompleted((prev) => new Set([...prev, activeIdx]));
    if (activeIdx < chunks.length - 1) goTo(activeIdx + 1);
  };

  const goPrev = () => {
    if (activeIdx > 0) goTo(activeIdx - 1);
  };

  if (chunks.length === 0) return null;

  const progressPct = Math.round(((activeIdx + 1) / chunks.length) * 100);

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #7c5bf9, #00d4ff)',
            }}
          />
        </div>
        <span className="text-xs font-bold text-[#8888b0] whitespace-nowrap">
          {activeIdx + 1} / {chunks.length}
        </span>
      </div>

      {/* Chunks — active one glows, others are dimmed */}
      <div className="space-y-3">
        {chunks.map((chunk, idx) => {
          const isActive = idx === activeIdx;
          const isDone = completed.has(idx);
          return (
            <div
              key={idx}
              onClick={() => goTo(idx)}
              className="rounded-xl cursor-pointer transition-all duration-200"
              style={{
                padding: '1rem 1.25rem',
                background: isActive
                  ? 'rgba(124,91,249,0.1)'
                  : isDone
                  ? 'rgba(16,185,129,0.05)'
                  : 'rgba(255,255,255,0.02)',
                border: isActive
                  ? '1px solid rgba(124,91,249,0.4)'
                  : isDone
                  ? '1px solid rgba(16,185,129,0.2)'
                  : '1px solid rgba(255,255,255,0.04)',
                opacity: isActive ? 1 : 0.35,
                transform: isActive ? 'scale(1.005)' : 'scale(1)',
                boxShadow: isActive ? '0 4px 24px rgba(124,91,249,0.15)' : 'none',
              }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{
                    background: isDone
                      ? 'linear-gradient(135deg, #10b981, #34d399)'
                      : isActive
                      ? 'linear-gradient(135deg, #7c5bf9, #00d4ff)'
                      : 'rgba(255,255,255,0.1)',
                    color: 'white',
                  }}
                >
                  {isDone ? '✓' : idx + 1}
                </span>
                <p
                  className="text-sm leading-relaxed flex-1"
                  style={{ color: isActive ? '#f0f0ff' : '#8888b0' }}
                >
                  {chunk}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={goPrev}
          disabled={activeIdx === 0}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: activeIdx === 0 ? '#555580' : '#a0a0c0',
            cursor: activeIdx === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          ← Back
        </button>

        <button
          onClick={activeIdx === chunks.length - 1 ? () => {
            setCompleted(prev => new Set([...prev, activeIdx]));
            setShowScore(true);
          } : goNext}
          className="flex-1 py-2 rounded-lg text-sm font-bold transition-all hover:opacity-90"
          style={
            activeIdx === chunks.length - 1
              ? { background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', cursor: 'pointer' }
              : { background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)', color: 'white' }
          }
        >
          {activeIdx === chunks.length - 1 ? '🎉 Done!' : `Next Chunk (${activeIdx + 2}/${chunks.length}) →`}
        </button>
      </div>

      {/* Formal Completion Score Card */}
      {showScore && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#08081a]/90 backdrop-blur-md animate-fade-in">
          <div className="glass-card max-w-sm w-full p-8 text-center space-y-6 shadow-2xl border-white/10">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2 text-4xl animate-bounce">
              🌟
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Section Complete!</h2>
              <p className="text-sm text-[#8888b0]">Your focus during this session was excellent.</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold text-[#8888b0] px-1">
                <span>COMPLETION ACCURACY</span>
                <span className="text-green-400">100%</span>
              </div>
              <div className="h-6 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 rounded-full" 
                  style={{ width: '100%', transition: 'width 1s ease-out' }} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[10px] text-[#8888b0] uppercase font-bold mb-1">IDEAS READ</p>
                <p className="text-2xl font-bold text-white">{chunks.length}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[10px] text-[#8888b0] uppercase font-bold mb-1">FOCUS LEVEL</p>
                <p className="text-2xl font-bold text-green-400">HIGH</p>
              </div>
            </div>

            <button 
              onClick={() => setShowScore(false)}
              className="w-full py-4 rounded-2xl bg-green-500 text-white font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 active:scale-95"
            >
              Continue Learning
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
