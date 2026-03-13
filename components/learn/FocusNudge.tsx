'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface FocusNudgeProps {
  /** Minutes of inactivity before nudge appears */
  timeoutMinutes?: number;
  /** Called when user clicks "Simplify this" */
  onSimplify?: () => void;
  /** Called when user clicks "I'm Ready" or "Start Break" */
  onDismiss?: () => void;
  /** Reset the timer (call this when user advances to next chunk) */
  resetTrigger?: number;
}

type NudgeState = 'idle' | 'visible' | 'dismissed';

const BREAK_ACTIVITIES = [
  { emoji: '🙆', text: 'Stand up and stretch your arms wide!' },
  { emoji: '💆', text: 'Roll your shoulders 5 times — forward and back.' },
  { emoji: '👁️', text: 'Look at something 6 metres away for 20 seconds.' },
  { emoji: '💃', text: 'Do a 10-second wiggle dance! Nobody is judging.' },
  { emoji: '🧘', text: 'Take 3 deep breaths. In through nose, out through mouth.' },
  { emoji: '🚶', text: 'March in place for 20 seconds. Left, right, left!' },
];

export function FocusNudge({
  timeoutMinutes = 3,
  onSimplify,
  onDismiss,
  resetTrigger,
}: FocusNudgeProps) {
  const [nudgeState, setNudgeState] = useState<NudgeState>('idle');
  const [breakActivity] = useState(
    () => BREAK_ACTIVITIES[Math.floor(Math.random() * BREAK_ACTIVITIES.length)]
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(
      () => setNudgeState('visible'),
      timeoutMinutes * 60 * 1000
    );
  }, [timeoutMinutes]);

  // Start timer on mount
  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [startTimer]);

  // Reset timer when user advances (resetTrigger changes)
  useEffect(() => {
    if (resetTrigger !== undefined) {
      setNudgeState('idle');
      startTimer();
    }
  }, [resetTrigger, startTimer]);

  // Also reset on any user interaction (click/keypress on the page)
  useEffect(() => {
    const handleActivity = () => {
      if (nudgeState === 'idle') startTimer();
    };
    window.addEventListener('click', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    window.addEventListener('scroll', handleActivity, { passive: true });
    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [nudgeState, startTimer]);

  const handleSimplify = () => {
    setNudgeState('dismissed');
    startTimer();
    onSimplify?.();
  };

  const handleDismiss = () => {
    setNudgeState('dismissed');
    startTimer();
    onDismiss?.();
  };

  if (nudgeState !== 'visible') return null;

  return (
    <>
      {/* Semi-transparent backdrop (very subtle — not full block) */}
      <div
        className="fixed inset-0 z-40 pointer-events-none"
        style={{ background: 'rgba(8,8,26,0.4)', backdropFilter: 'blur(2px)' }}
      />

      {/* Nudge bubble */}
      <div
        className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-fade-in-up"
        role="dialog"
        aria-label="Focus nudge"
      >
        <div
          className="glass-card p-5 space-y-4"
          style={{
            border: '1px solid rgba(124,91,249,0.4)',
            boxShadow: '0 20px 60px rgba(124,91,249,0.25), 0 0 0 1px rgba(124,91,249,0.15)',
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 animate-pulse-glow"
                style={{ background: 'linear-gradient(135deg, #7c5bf9, #e040fb)' }}
              >
                📌
              </div>
              <div>
                <p className="font-bold text-[#f0f0ff] text-sm">Still on this section?</p>
                <p className="text-xs text-[#8888b0]">You've been here a while — need help?</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-[#555580] hover:text-[#f0f0ff] transition-colors text-lg leading-none"
              aria-label="Close nudge"
            >
              ×
            </button>
          </div>

          {/* Break activity suggestion */}
          <div
            className="p-3 rounded-xl flex items-center gap-3"
            style={{ background: 'rgba(124,91,249,0.1)', border: '1px solid rgba(124,91,249,0.15)' }}
          >
            <span className="text-2xl">{breakActivity.emoji}</span>
            <p className="text-xs text-[#a0a0c0] leading-relaxed">{breakActivity.text}</p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleSimplify}
              className="py-2 px-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90 text-center"
              style={{ background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)', color: 'white' }}
            >
              ✨ Simplify
            </button>
            <button
              onClick={handleDismiss}
              className="py-2 px-2 rounded-lg text-xs font-semibold transition-all text-center"
              style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}
            >
              ⏱ Break
            </button>
            <button
              onClick={handleDismiss}
              className="py-2 px-2 rounded-lg text-xs font-semibold transition-all text-center"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' }}
            >
              🙋 Ready!
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
