'use client';

import React, { useState } from 'react';
import { LearningMode, TextTransformationResult } from '@/lib/types';
import { AgeGroup, getAgeConfig } from '@/lib/age-config';
import { useTTS, TTSWordHighlight } from '@/hooks/useTTS';
import { Play, Pause, Square, Volume2 } from 'lucide-react';

interface SplitScreenViewProps {
  original: string;
  result: TextTransformationResult;
  mode: LearningMode;
  ageGroup?: AgeGroup;
}

type ViewMode = 'split' | 'original' | 'adapted';

const MODE_LABELS: Record<string, { label: string; badge: string; color: string }> = {
  dyslexia: { label: 'Bionic Reading', badge: '📖 Dyslexia Mode', color: '#f59e0b' },
  adhd:     { label: 'Chunked Focus',  badge: '⚡ ADHD Mode',     color: '#7c5bf9' },
  standard: { label: 'Simplified',     badge: '🧠 Standard Mode', color: '#00d4ff' },
  mixed:    { label: 'Mixed Assist',   badge: '🌀 Mixed Mode',    color: '#e040fb' },
};

export function SplitScreenView({ original, result, mode, ageGroup = 'teen' }: SplitScreenViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const tts = useTTS();
  const cfg = getAgeConfig(ageGroup);
  const modeInfo = MODE_LABELS[mode] ?? MODE_LABELS.standard;

  const statsRow = (
    <div className="flex flex-wrap gap-3 items-center text-xs">
      <span className="reading-time-badge">⏱ {result.readingTimeMinutes} min read</span>
      <span
        className="px-2.5 py-1 rounded-full font-semibold"
        style={{ background: `${modeInfo.color}22`, color: modeInfo.color, border: `1px solid ${modeInfo.color}44` }}
      >
        {modeInfo.badge}
      </span>
      <span className="px-2.5 py-1 rounded-full font-semibold"
        style={{ background: 'rgba(255,255,255,0.05)', color: '#8888b0', border: '1px solid rgba(255,255,255,0.08)' }}>
        📝 {result.wordCount} words
      </span>
      <span className="px-2.5 py-1 rounded-full font-semibold"
        style={{ background: 'rgba(255,255,255,0.05)', color: '#8888b0', border: '1px solid rgba(255,255,255,0.08)' }}>
        {cfg.emoji} {cfg.label}
      </span>
    </div>
  );

  // TTS controls bar
  const ttsBar = (
    <div className="flex items-center gap-2">
      {!tts.isPlaying ? (
        <button
          onClick={() => tts.play(result.transformed)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80"
          style={{ background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)', color: 'white' }}
        >
          <Play className="w-3 h-3" /> Listen
        </button>
      ) : (
        <button
          onClick={tts.pause}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{ background: 'rgba(124,91,249,0.15)', color: '#a78bfa', border: '1px solid rgba(124,91,249,0.3)' }}
        >
          <Pause className="w-3 h-3" /> Pause
        </button>
      )}
      {(tts.isPlaying || tts.activeWordIndex >= 0) && (
        <button
          onClick={tts.stop}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <Square className="w-3 h-3" />
        </button>
      )}
      <div className="flex items-center gap-1 ml-2">
        <Volume2 className="w-3 h-3 text-[#555580]" />
        <select
          onChange={(e) => tts.setRate(parseFloat(e.target.value))}
          defaultValue="0.9"
          className="text-xs rounded px-1 py-0.5 outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#8888b0', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <option value="0.6">0.6×</option>
          <option value="0.8">0.8×</option>
          <option value="0.9">0.9×</option>
          <option value="1.0">1.0×</option>
          <option value="1.2">1.2×</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {statsRow}

        {/* View selector */}
        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          {(['split', 'original', 'adapted'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className="px-3 py-1.5 text-xs font-semibold transition-all"
              style={viewMode === v
                ? { background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)', color: 'white' }
                : { background: 'rgba(255,255,255,0.03)', color: '#8888b0' }
              }
            >
              {v === 'split' ? '⬛⬛ Split' : v === 'original' ? '📄 Original' : '✨ Adapted'}
            </button>
          ))}
        </div>
      </div>

      {/* TTS bar */}
      <div className="flex items-center gap-2">
        {ttsBar}
        {tts.isPlaying && (
          <div className="flex gap-0.5 items-center">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-0.5 rounded-full"
                style={{
                  height: `${8 + Math.random() * 12}px`,
                  background: 'linear-gradient(180deg, #7c5bf9, #00d4ff)',
                  animation: `float ${0.4 + i * 0.1}s ease-in-out infinite alternate`,
                }}
              />
            ))}
            <span className="text-xs text-[#8888b0] ml-2">Playing word-by-word...</span>
          </div>
        )}
      </div>

      {/* ── SPLIT VIEW ── */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Original — left */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs font-semibold text-[#8888b0] uppercase tracking-wider">Dense Original</span>
            </div>
            <div
              className="p-5 rounded-xl overflow-y-auto min-h-80 max-h-[480px] leading-relaxed text-sm"
              style={{
                background: 'rgba(239,68,68,0.04)',
                border: '1px solid rgba(239,68,68,0.15)',
                color: '#8888b0',
                fontFamily: 'serif',
                lineHeight: 1.6,
              }}
            >
              {original}
            </div>
          </div>

          {/* Adapted — right */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <div className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)' }} />
              <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: modeInfo.color }}>
                ✨ {modeInfo.label} — Neuro-Friendly
              </span>
            </div>
            <div
              className="p-5 rounded-xl overflow-y-auto min-h-80 max-h-[480px] text-sm content-area"
              style={{
                background: mode === 'dyslexia' ? '#fffbf0' : 'rgba(124,91,249,0.06)',
                border: `1px solid ${modeInfo.color}33`,
                color: mode === 'dyslexia' ? '#2d2d2d' : '#c0c0e0',
                fontFamily: mode === 'dyslexia' ? 'OpenDyslexic, Lexend, sans-serif' : 'Lexend, sans-serif',
                letterSpacing: mode === 'dyslexia' ? '0.05em' : '0',
                lineHeight: cfg.lineHeight,
                fontSize: cfg.fontSize,
              }}
            >
              {tts.isPlaying || tts.activeWordIndex >= 0 ? (
                <TTSWordHighlight
                  text={result.transformed.replace(/<[^>]+>/g, ' ')}
                  activeWordIndex={tts.activeWordIndex}
                />
              ) : (
                <div
                  dangerouslySetInnerHTML={{ __html: result.transformed }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ORIGINAL ONLY ── */}
      {viewMode === 'original' && (
        <div
          className="p-6 rounded-xl text-sm leading-relaxed"
          style={{
            background: 'rgba(239,68,68,0.04)',
            border: '1px solid rgba(239,68,68,0.15)',
            color: '#8888b0',
            fontFamily: 'serif',
          }}
        >
          {original}
        </div>
      )}

      {/* ── ADAPTED ONLY ── */}
      {viewMode === 'adapted' && (
        <div
          className="p-6 rounded-xl text-sm content-area"
          style={{
            background: mode === 'dyslexia' ? '#fffbf0' : 'rgba(124,91,249,0.06)',
            border: `1px solid ${modeInfo.color}33`,
            color: mode === 'dyslexia' ? '#2d2d2d' : '#c0c0e0',
            fontFamily: mode === 'dyslexia' ? 'OpenDyslexic, Lexend, sans-serif' : 'Lexend, sans-serif',
            letterSpacing: mode === 'dyslexia' ? '0.05em' : '0',
            lineHeight: cfg.lineHeight,
            fontSize: cfg.fontSize,
          }}
        >
          {tts.isPlaying || tts.activeWordIndex >= 0 ? (
            <TTSWordHighlight
              text={result.transformed.replace(/<[^>]+>/g, ' ')}
              activeWordIndex={tts.activeWordIndex}
            />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: result.transformed }} />
          )}
        </div>
      )}

      {/* Adaptation info strip */}
      <div
        className="p-4 rounded-xl flex items-start gap-3"
        style={{ background: 'rgba(124,91,249,0.06)', border: '1px solid rgba(124,91,249,0.15)' }}
      >
        <span className="text-xl">💡</span>
        <div>
          <p className="font-semibold text-[#f0f0ff] text-sm mb-0.5">
            {mode === 'dyslexia' ? 'Bionic Reading + OpenDyslexic Font' :
             mode === 'adhd' ? 'Content Chunked + Action Items Flagged' :
             'Vocabulary Simplified + Keywords Highlighted'}
          </p>
          <p className="text-xs text-[#8888b0] leading-relaxed">
            {mode === 'dyslexia'
              ? 'Bold word starts (first 40%) guide eyes naturally. Warm background reduces visual stress. OpenDyslexic letterforms reduce letter-reversal.'
              : mode === 'adhd'
              ? `Text split into ${result.chunks.length} chunks of ${getAgeConfig(ageGroup).chunkSentences} sentence${getAgeConfig(ageGroup).chunkSentences > 1 ? 's' : ''} each. Keywords highlighted. Action items flagged.`
              : 'Complex academic words replaced with age-appropriate alternatives. Key terms underlined for quick reference.'}
          </p>
        </div>
      </div>
    </div>
  );
}
