'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useProfile } from '@/lib/profile-context';
import { transformTextForLearner } from '@/lib/text-transformers';
import { ADHDFocusRuler, ADHDChunkFocus } from '@/components/learn/ADHDFocusRuler';
import { FocusNudge } from '@/components/learn/FocusNudge';
import { useTTS, TTSWordHighlight } from '@/hooks/useTTS';
import { getAgeConfig, AgeGroup } from '@/lib/age-config';
import { LearningMode } from '@/lib/types';
import { ChevronLeft, BookOpen, Volume2, Zap, Settings, Play, Pause, Square } from 'lucide-react';

const LESSON = {
  title: 'Photosynthesis: How Plants Make Food',
  rawText: `Photosynthesis is the process by which plants convert light energy into chemical energy stored in glucose. This process occurs primarily in the leaves of plants, specifically in structures called chloroplasts that contain the green pigment chlorophyll. During the light-dependent reactions, chlorophyll absorbs photons from sunlight and transfers their energy to electrons. These high-energy electrons are used to generate adenosine triphosphate (ATP) and nicotinamide adenine dinucleotide phosphate (NADPH), which are energy carriers. Subsequently, during the light-independent reactions, also known as the Calvin cycle, these energy carriers are utilized to convert carbon dioxide into glucose through a series of enzymatic reactions. This process is essential for life on Earth because it converts light energy into chemical energy that plants use for growth, and it also produces the oxygen that most organisms need to breathe.`,
};

const MODE_CONFIG = {
  dyslexia: { label: 'Dyslexia Mode',  emoji: '📖', gradient: 'linear-gradient(135deg, #f59e0b, #e040fb)', color: '#f59e0b' },
  adhd:     { label: 'ADHD Mode',      emoji: '⚡', gradient: 'linear-gradient(135deg, #7c5bf9, #e040fb)', color: '#7c5bf9' },
  standard: { label: 'Standard Mode',  emoji: '🧠', gradient: 'linear-gradient(135deg, #00d4ff, #7c5bf9)', color: '#00d4ff' },
  mixed:    { label: 'Mixed Mode',     emoji: '🌀', gradient: 'linear-gradient(135deg, #e040fb, #00d4ff)', color: '#e040fb' },
};

export default function LearnPage() {
  const { profile } = useProfile();
  const [showSidebar, setShowSidebar] = useState(true);
  const [focusRulerOn, setFocusRulerOn] = useState(false);
  const [distractionFree, setDistractionFree] = useState(false);
  const [activeChunk, setActiveChunk] = useState(0);
  const [nudgeReset, setNudgeReset] = useState(0);
  const tts = useTTS();

  const ageGroup: AgeGroup = profile?.ageGroup ?? 'teen';
  const cfg = getAgeConfig(ageGroup);
  const dominantMode: LearningMode =
    !profile ? 'standard'
    : profile.weightedProfile.dyslexia > profile.weightedProfile.adhd ? 'dyslexia'
    : profile.weightedProfile.adhd > 30 ? 'adhd'
    : 'standard';

  const modeInfo = MODE_CONFIG[dominantMode] ?? MODE_CONFIG.standard;

  // Pre-transform lesson content
  const transformation = React.useMemo(
    () => transformTextForLearner(LESSON.rawText, dominantMode, ageGroup),
    [dominantMode, ageGroup]
  );

  const handleChunkChange = useCallback((idx: number) => {
    setActiveChunk(idx);
    setNudgeReset((n) => n + 1);
    tts.stop();
  }, [tts]);

  const handleSimplify = useCallback(() => {
    // FocusNudge "Simplify" — transform at one level lower
    setNudgeReset((n) => n + 1);
  }, []);

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-10 text-center max-w-md w-full animate-scale-in">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)' }}>📚</div>
          <h2 className="text-2xl font-bold text-[#f0f0ff] mb-3">Set Up Your Profile First</h2>
          <p className="text-[#8888b0] mb-6 leading-relaxed">
            Complete a quick onboarding so we can adapt this lesson to YOUR brain.
          </p>
          <Link href="/onboarding" className="glow-btn w-full justify-center">
            Start Onboarding →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen transition-all duration-200 ${distractionFree ? 'adhd-focus-mode' : ''}`}>

      {/* ── Module B: ADHD Focus Ruler ── */}
      <ADHDFocusRuler enabled={focusRulerOn} />

      {/* ── Module C: Focus Nudge (45 seconds) ── */}
      <FocusNudge
        timeoutMinutes={0.75}
        resetTrigger={nudgeReset}
        onSimplify={handleSimplify}
        onDismiss={() => setNudgeReset((n) => n + 1)}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-[#8888b0] hover:text-[#a78bfa] flex items-center gap-1 text-sm transition-colors">
              <ChevronLeft className="w-4 h-4" /> Home
            </Link>
            <span className="text-[#555580]">/</span>
            <span className="text-sm text-[#f0f0ff] font-medium">Learn</span>
          </div>
          <button onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#8888b0] transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Settings className="w-3.5 h-3.5" /> Tools
          </button>
        </div>

        {/* Lesson header */}
        <div className="glass-card p-5 mb-5 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: modeInfo.gradient }}>
                {modeInfo.emoji}
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-[#f0f0ff]">{LESSON.title}</h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="mode-chip text-white text-xs" style={{ background: modeInfo.gradient }}>
                    {modeInfo.emoji} {modeInfo.label}
                  </span>
                  <span className="reading-time-badge">⏱ {transformation.readingTimeMinutes} min</span>
                  <span className="text-xs text-[#8888b0]">{cfg.emoji} {cfg.label}</span>
                </div>
              </div>
            </div>

            {/* TTS Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {!tts.isPlaying ? (
                <button onClick={() => tts.play(transformation.transformed)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)', color: 'white' }}>
                  <Play className="w-3 h-3" /> Listen
                </button>
              ) : (
                <>
                  <button onClick={tts.pause}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold"
                    style={{ background: 'rgba(124,91,249,0.12)', color: '#a78bfa', border: '1px solid rgba(124,91,249,0.25)' }}>
                    <Pause className="w-3 h-3" /> Pause
                  </button>
                  <button onClick={tts.stop}
                    className="p-2 rounded-lg text-xs"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <Square className="w-3 h-3" />
                  </button>
                </>
              )}
              <Volume2 className="w-4 h-4 text-[#555580]" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* ── Main content ── */}
          <div className="lg:col-span-3 animate-fade-in-up delay-100">

            {/* ADHD Mode — chunk-focused navigation */}
            {dominantMode === 'adhd' ? (
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-5">
                  <span className="font-bold text-[#f0f0ff]">⚡ Focus Mode</span>
                  <span className="text-xs text-[#8888b0]">— one chunk at a time, others dimmed</span>
                  <button
                    onClick={() => setFocusRulerOn(!focusRulerOn)}
                    className="ml-auto px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                    style={focusRulerOn
                      ? { background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)', color: 'white' }
                      : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#8888b0' }
                    }
                  >
                    {focusRulerOn ? '✓ Ruler ON' : '📏 Focus Ruler'}
                  </button>
                  <button
                    onClick={() => setDistractionFree(!distractionFree)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                    style={distractionFree
                      ? { background: 'linear-gradient(135deg, #e040fb, #7c5bf9)', color: 'white' }
                      : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#8888b0' }
                    }
                  >
                    {distractionFree ? '✓ Focus' : '🔕 Distraction-Free'}
                  </button>
                </div>
                <ADHDChunkFocus
                  chunks={transformation.chunks}
                  onChunkChange={handleChunkChange}
                  ageConfig={cfg}
                />
              </div>
            ) : (
              /* Dyslexia / Standard — full text with TTS word highlight */
              <div
                className={`glass-card p-8 content-area min-h-80 ${dominantMode === 'dyslexia' ? 'dyslexia-mode' : ''}`}
                style={dominantMode === 'dyslexia' ? {
                  fontFamily: 'OpenDyslexic, Lexend, sans-serif',
                  letterSpacing: '0.06em',
                  wordSpacing: '0.2em',
                  lineHeight: 2.1,
                  backgroundColor: '#fffbf0',
                  color: '#2d2d2d',
                } : {
                  lineHeight: cfg.lineHeight,
                  fontSize: cfg.fontSize,
                  color: '#c0c0e0',
                }}
              >
                {tts.isPlaying || tts.activeWordIndex >= 0 ? (
                  <p style={{ lineHeight: 'inherit', fontSize: 'inherit' }}>
                    <TTSWordHighlight
                      text={LESSON.rawText}
                      activeWordIndex={tts.activeWordIndex}
                    />
                  </p>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: transformation.transformed }} />
                )}
              </div>
            )}

            {/* Quick action bar */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {dominantMode === 'dyslexia' && (
                <>
                  <button onClick={() => setFocusRulerOn(!focusRulerOn)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={focusRulerOn
                      ? { background: 'linear-gradient(135deg, #f59e0b, #e040fb)', color: 'white' }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#8888b0' }
                    }
                  >
                    📏 {focusRulerOn ? 'Ruler ON' : 'Reading Ruler'}
                  </button>
                </>
              )}
              <Link href="/transform" className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ background: 'rgba(124,91,249,0.1)', border: '1px solid rgba(124,91,249,0.2)', color: '#a78bfa' }}>
                ✨ Transform Your Own Text →
              </Link>
            </div>
          </div>

          {/* ── Sidebar ── */}
          {showSidebar && (
            <div className="lg:col-span-1 space-y-4 animate-fade-in-up delay-200">

              {/* Key terms */}
              {transformation.keyTerms.length > 0 && (
                <div className="glass-card p-4 space-y-3 sticky top-20">
                  <h3 className="font-bold text-sm text-[#f0f0ff] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#a78bfa]" /> Key Terms
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {transformation.keyTerms.map((term, i) => (
                      <div key={i} className="p-3 rounded-lg"
                        style={{ background: 'rgba(124,91,249,0.07)', border: '1px solid rgba(124,91,249,0.12)' }}>
                        <p className="text-xs font-bold text-[#a78bfa] mb-1">{term.term}</p>
                        <p className="text-xs text-[#8888b0] leading-relaxed">{term.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ADHD sidebar extras */}
              {dominantMode === 'adhd' && (
                <div className="glass-card p-4 space-y-4">
                  <h3 className="font-bold text-sm text-[#f0f0ff] flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#7c5bf9]" /> Focus Boost
                  </h3>
                  <div>
                    <p className="text-xs text-[#8888b0] mb-1">🔥 TODAY'S STREAK</p>
                    <p className="text-2xl font-extrabold" style={{ color: '#f59e0b' }}>5 days</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8888b0] mb-2">LESSON PROGRESS</p>
                    <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.round(((activeChunk + 1) / Math.max(transformation.chunks.length, 1)) * 100)}%`,
                                 background: 'linear-gradient(90deg, #7c5bf9, #00d4ff)' }} />
                    </div>
                    <p className="text-xs text-[#8888b0] mt-1">
                      Chunk {activeChunk + 1} of {transformation.chunks.length}
                    </p>
                  </div>
                </div>
              )}

              {/* Profile summary */}
              <div className="glass-card p-4 space-y-2">
                <p className="text-xs font-bold text-[#8888b0]">YOUR PROFILE</p>
                <p className="text-sm font-semibold text-[#f0f0ff]">{profile.name}</p>
                <p className="text-xs text-[#8888b0]">{cfg.emoji} {cfg.label}</p>
                <Link href="/onboarding"
                  className="text-xs text-[#7c5bf9] hover:text-[#a78bfa] transition-colors">
                  Change profile →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
