'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface FocusNudgeProps {
  /** Minutes between each nudge appearance (default: 30) */
  intervalMinutes?: number;
  /**
   * If true, user activity (click/scroll/keydown) does NOT reset the timer.
   * The nudge will appear every `intervalMinutes` regardless of interaction.
   */
  periodic?: boolean;
  /** Called when user clicks "✨ Simplify" */
  onSimplify?: () => void;
  /** Called when user clicks "⏱ Break" */
  onBreak?: () => void;
  /** Called when user clicks "🙋 Ready!" or the × close button */
  onReady?: () => void;
  /** Provide a number that changes to externally reset the interval (e.g. on chunk advance) */
  resetTrigger?: number;
}

const BREAK_ACTIVITIES = [
  { emoji: '🙆', text: 'Stand up and stretch your arms wide!' },
  { emoji: '💆', text: 'Roll your shoulders 5 times — forward and back.' },
  { emoji: '👁️', text: 'Look at something 6 metres away for 20 seconds.' },
  { emoji: '💃', text: 'Do a 10-second wiggle dance! Nobody is judging.' },
  { emoji: '🧘', text: 'Take 3 deep breaths. In through nose, out through mouth.' },
  { emoji: '🚶', text: 'March in place for 20 seconds. Left, right, left!' },
];

export function FocusNudge({
  intervalMinutes = 30,
  periodic = true,
  onSimplify,
  onBreak,
  onReady,
  resetTrigger,
}: FocusNudgeProps) {
  const [visible, setVisible] = useState(false);
  const [activity] = useState(
    () => BREAK_ACTIVITIES[Math.floor(Math.random() * BREAK_ACTIVITIES.length)]
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // track when this component last showed (for the localStorage persistence)
  const STORAGE_KEY = 'neurolearn_nudge_last_shown';

  const scheduleNext = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    // Check if 30 minutes have passed since last shown (persists across refreshes)
    const lastShown = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();
    const intervalMs = intervalMinutes * 60 * 1000;

    let delay = intervalMs;
    if (lastShown) {
      const elapsed = now - parseInt(lastShown, 10);
      delay = Math.max(0, intervalMs - elapsed);
    }

    timerRef.current = setTimeout(() => {
      setVisible(true);
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
      // Schedule the next one after the nudge is shown
      timerRef.current = setTimeout(() => {
        scheduleNext();
      }, intervalMs);
    }, delay);
  }, [intervalMinutes]);

  // Start on mount
  useEffect(() => {
    scheduleNext();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [scheduleNext]);

  // Allow external reset (e.g. chunk change)
  useEffect(() => {
    if (resetTrigger !== undefined) {
      setVisible(false);
      scheduleNext();
    }
  }, [resetTrigger, scheduleNext]);

  // Reset on user activity ONLY in non-periodic mode
  useEffect(() => {
    if (periodic) return; // skip if periodic mode is on
    const handleActivity = () => {
      if (!visible) scheduleNext();
    };
    window.addEventListener('click', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    window.addEventListener('scroll', handleActivity, { passive: true });
    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [periodic, visible, scheduleNext]);

  const handleSimplify = () => {
    setVisible(false);
    onSimplify?.();
  };

  const handleBreak = () => {
    setVisible(false);
    onBreak?.();
  };

  const handleReady = () => {
    setVisible(false);
    onReady?.();
  };

  if (!visible) return null;

  return (
    <>
      {/* Subtle backdrop */}
      <div
        className="fixed inset-0 z-40 pointer-events-none"
        style={{ background: 'rgba(8,8,26,0.35)' }}
      />

      {/* Nudge bubble */}
      <div
        className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-fade-in-up"
        role="dialog"
        aria-modal="true"
        aria-label="Focus nudge"
      >
        <div
          className="glass-card p-5 space-y-4"
          style={{
            border: '1px solid rgba(124,91,249,0.45)',
            boxShadow: '0 20px 60px rgba(124,91,249,0.3), 0 0 0 1px rgba(124,91,249,0.15)',
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
              onClick={handleReady}
              className="text-[#555580] hover:text-[#f0f0ff] transition-colors text-lg leading-none mt-0.5"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Break activity */}
          <div
            className="p-3 rounded-xl flex items-center gap-3"
            style={{ background: 'rgba(124,91,249,0.1)', border: '1px solid rgba(124,91,249,0.18)' }}
          >
            <span className="text-2xl">{activity.emoji}</span>
            <p className="text-xs text-[#a0a0c0] leading-relaxed">{activity.text}</p>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2">
            {/* Simplify — blue gradient */}
            <button
              onClick={handleSimplify}
              className="py-2.5 px-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90 text-center"
              style={{ background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)', color: 'white' }}
            >
              ✨ Simplify
            </button>
            {/* Break — amber/orange */}
            <button
              onClick={handleBreak}
              className="py-2.5 px-2 rounded-lg text-xs font-semibold transition-all text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(180,100,0,0.6), rgba(245,120,11,0.5))',
                border: '1px solid rgba(245,158,11,0.4)',
                color: '#fcd34d',
              }}
            >
              ⏱ Break
            </button>
            {/* Ready — green */}
            <button
              onClick={handleReady}
              className="py-2.5 px-2 rounded-lg text-xs font-semibold transition-all text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(5,100,60,0.6), rgba(16,185,129,0.4))',
                border: '1px solid rgba(16,185,129,0.35)',
                color: '#34d399',
              }}
            >
              🙋 Ready!
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
