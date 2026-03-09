'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useProfile } from '@/lib/profile-context';
import { DyslexiaTools } from '@/components/learn/DyslexiaTools';
import { ReadingRuler } from '@/components/learn/ReadingRuler';
import { AdaptiveContentViewer } from '@/components/learn/AdaptiveContentViewer';
import { BookOpen, Settings, Zap, ChevronLeft } from 'lucide-react';

const SAMPLE_CONTENT = {
  title: 'Photosynthesis: How Plants Make Food',
  content: `<p><b>Photo</b>synthesis is the process by which plants convert light energy into chemical energy stored in glucose. This process occurs primarily in the leaves of plants, specifically in structures called <b>chloro</b>plasts that contain the green pigment <b>chloro</b>phyll.</p>
  
  <p>During the light-dependent reactions, chlorophyll absorbs photons from sunlight and transfers their energy to electrons. These high-energy electrons are used to generate adenosine triphosphate (ATP) and nicotinamide adenine dinucleotide phosphate (NADPH), which are energy carriers.</p>
  
  <p>Subsequently, during the light-independent reactions, also known as the Calvin cycle, these energy carriers are utilized to convert carbon dioxide into glucose through a series of enzymatic reactions.</p>
  
  <p>This process is essential for life on Earth because it converts light energy into chemical energy that plants use for growth, and it also produces the oxygen that most organisms need to breathe.</p>`,
};

const MODE_CONFIG: Record<string, { label: string; emoji: string; color: string; gradient: string }> = {
  dyslexia: { label: 'Dyslexia Mode', emoji: '📖', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #e040fb)' },
  adhd: { label: 'ADHD Mode', emoji: '⚡', color: '#7c5bf9', gradient: 'linear-gradient(135deg, #7c5bf9, #e040fb)' },
  standard: { label: 'Standard Mode', emoji: '🧠', color: '#00d4ff', gradient: 'linear-gradient(135deg, #00d4ff, #7c5bf9)' },
};

export default function LearnPage() {
  const { profile } = useProfile();
  const [showTools, setShowTools] = useState(true);
  const [showRuler, setShowRuler] = useState(false);
  const [wordSpacing, setWordSpacing] = useState(0.18);
  const [lineHeight, setLineHeight] = useState(2.0);
  const [fontSize, setFontSize] = useState(16);
  const [backgroundColor, setBackgroundColor] = useState('#fffaf0');

  const dominantMode: 'dyslexia' | 'adhd' | 'standard' = profile
    ? profile.weightedProfile.dyslexia > profile.weightedProfile.adhd
      ? 'dyslexia'
      : 'adhd'
    : 'standard';

  const modeInfo = MODE_CONFIG[dominantMode];

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-10 text-center max-w-md w-full animate-scale-in">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)' }}
          >
            📚
          </div>
          <h2 className="text-2xl font-bold text-[#f0f0ff] mb-3">Set Up Your Profile First</h2>
          <p className="text-[#8888b0] mb-6 leading-relaxed">
            Complete a quick onboarding to get your personalised learning experience tailored to your brain.
          </p>
          <Link href="/onboarding" className="glow-btn w-full justify-center">
            Start Onboarding →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <ReadingRuler visible={showRuler && dominantMode === 'dyslexia'} />

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Breadcrumb / header ── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[#8888b0] hover:text-[#a78bfa] flex items-center gap-1 text-sm transition-colors">
              <ChevronLeft className="w-4 h-4" /> Home
            </Link>
            <span className="text-[#555580]">/</span>
            <span className="text-sm text-[#f0f0ff] font-medium">Learn</span>
          </div>

          <button
            onClick={() => setShowTools(!showTools)}
            className="md:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[#8888b0] hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Settings className="w-4 h-4" />
            {showTools ? 'Hide Tools' : 'Show Tools'}
          </button>
        </div>

        {/* ── Lesson header ── */}
        <div className="glass-card p-6 mb-6 animate-fade-in-up">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: modeInfo.gradient }}
              >
                {modeInfo.emoji}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-[#f0f0ff]">
                  {SAMPLE_CONTENT.title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="mode-chip text-white text-xs"
                    style={{ background: modeInfo.gradient }}
                  >
                    {modeInfo.emoji} {modeInfo.label}
                  </span>
                  <span className="text-xs text-[#8888b0]">~5 min read · 🌿 Science · Beginner</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <BookOpen className="w-5 h-5 text-[#8888b0]" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ── Main content ── */}
          <div className="lg:col-span-3 space-y-4 animate-fade-in-up delay-100">
            <div
              className="glass-card p-8 min-h-96"
              style={dominantMode === 'dyslexia' ? { backgroundColor } : {}}
            >
              <AdaptiveContentViewer
                content={SAMPLE_CONTENT.content}
                mode={dominantMode}
                wordSpacing={wordSpacing}
                lineHeight={lineHeight}
                fontSize={fontSize}
                backgroundColor={backgroundColor}
              />
            </div>

            {/* Dyslexia action bar */}
            {dominantMode === 'dyslexia' && (
              <div className="flex gap-3 flex-wrap">
                {[
                  { label: showRuler ? '✓ Reading Ruler' : '📏 Reading Ruler', active: showRuler, onClick: () => setShowRuler(!showRuler) },
                  { label: '📑 Bookmark', active: false, onClick: () => { } },
                  { label: '✏️ Highlight', active: false, onClick: () => { } },
                ].map((btn, i) => (
                  <button
                    key={i}
                    onClick={btn.onClick}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    style={btn.active
                      ? { background: 'linear-gradient(135deg, #f59e0b, #e040fb)', color: 'white' }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#a0a0c0' }
                    }
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            )}

            {/* ADHD action bar */}
            {dominantMode === 'adhd' && (
              <div className="flex gap-3 flex-wrap">
                {[
                  '⏱️ Start Focus Timer',
                  '📝 Take Notes',
                  '🎯 Next Section',
                  '🌬️ Breathe',
                ].map((label, i) => (
                  <button
                    key={i}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{ background: 'rgba(124,91,249,0.1)', border: '1px solid rgba(124,91,249,0.2)', color: '#a78bfa' }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Sidebar tools ── */}
          {showTools && (
            <div className="lg:col-span-1 space-y-4 animate-fade-in-up delay-200">

              {dominantMode === 'dyslexia' && (
                <DyslexiaTools
                  text={SAMPLE_CONTENT.content}
                  wordSpacing={wordSpacing}
                  lineHeight={lineHeight}
                  fontSize={fontSize}
                  backgroundColor={backgroundColor}
                  onWordSpacingChange={setWordSpacing}
                  onLineHeightChange={setLineHeight}
                  onFontSizeChange={setFontSize}
                  onBackgroundChange={setBackgroundColor}
                />
              )}

              {dominantMode === 'adhd' && (
                <div className="glass-card p-5 space-y-5 sticky top-20">
                  <h3 className="font-bold text-[#f0f0ff] flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#7c5bf9]" /> Focus Boost
                  </h3>

                  <div>
                    <p className="text-xs text-[#8888b0] font-semibold mb-1">TODAY'S STREAK</p>
                    <div className="text-3xl font-extrabold" style={{ color: '#f59e0b' }}>🔥 5 days</div>
                    <p className="text-xs text-[#8888b0] mt-1">One more day to unlock a badge!</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#8888b0] font-semibold mb-2">TODAY'S PROGRESS</p>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: '45%', background: 'linear-gradient(90deg, #7c5bf9, #00d4ff)' }}
                      />
                    </div>
                    <p className="text-xs text-[#8888b0] mt-1">45% — 15 mins to go</p>
                  </div>

                  <button className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #7c5bf9, #e040fb)' }}>
                    🎯 Start 25-Min Session
                  </button>

                  <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <p className="text-xs font-semibold text-[#8888b0]">TODAY'S ACHIEVEMENTS</p>
                    {[{ badge: '📖', label: 'Read first section' }, { badge: '⚡', label: '25-min focus session' }].map((a, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <span
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                          style={{ background: 'rgba(124,91,249,0.15)', border: '1px solid rgba(124,91,249,0.2)' }}
                        >
                          {a.badge}
                        </span>
                        <span className="text-xs text-[#8888b0]">{a.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dominantMode === 'standard' && (
                <div className="glass-card p-5 space-y-3 sticky top-20">
                  <h3 className="font-bold text-[#f0f0ff]">Learning Tools</h3>
                  {[
                    { label: '📚 Take Notes', gradient: false },
                    { label: '🎤 Listen Aloud', gradient: false },
                    { label: '📈 View Progress', gradient: false },
                    { label: '❓ Ask AI Educator', gradient: true },
                  ].map((btn, i) => (
                    <button
                      key={i}
                      className="w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all hover:opacity-90 text-left"
                      style={btn.gradient
                        ? { background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)', color: 'white' }
                        : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#a0a0c0' }
                      }
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
