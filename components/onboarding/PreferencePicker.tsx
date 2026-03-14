'use client';

import React, { useState } from 'react';
import { LearningMode, WeightedProfile, StudentProfile } from '@/lib/types';
import { AgeGroup, AGE_CONFIGS } from '@/lib/age-config';
import { CognitiveGame } from './CognitiveGame';

type Screen = 'welcome' | 'diagnosis' | 'age' | 'game' | 'result';

interface PreferencePickerProps {
  onComplete: (profile: StudentProfile) => void;
}

type DiagnosisType = 'dyslexia' | 'adhd' | 'both' | 'unsure';

const DIAGNOSIS_OPTIONS: { id: DiagnosisType; emoji: string; title: string; desc: string; gradient: string; border: string }[] = [
  {
    id: 'dyslexia',
    emoji: '📖',
    title: 'Dyslexia',
    desc: 'Reading feels hard. Letters sometimes mix up. I re-read sentences a lot.',
    gradient: 'linear-gradient(135deg, #f59e0b, #e040fb)',
    border: 'rgba(245,158,11,0.4)',
  },
  {
    id: 'adhd',
    emoji: '⚡',
    title: 'ADHD',
    desc: 'I get distracted easily. It\'s hard to sit and focus for a long time.',
    gradient: 'linear-gradient(135deg, #7c5bf9, #e040fb)',
    border: 'rgba(124,91,249,0.4)',
  },
  {
    id: 'both',
    emoji: '🌀',
    title: 'Both',
    desc: 'I have challenges with both reading AND staying focused.',
    gradient: 'linear-gradient(135deg, #e040fb, #00d4ff)',
    border: 'rgba(224,64,251,0.4)',
  },
  {
    id: 'unsure',
    emoji: '🤔',
    title: 'Not Sure',
    desc: 'I just find learning difficult. Let the app figure it out!',
    gradient: 'linear-gradient(135deg, #00d4ff, #7c5bf9)',
    border: 'rgba(0,212,255,0.3)',
  },
];

const AGE_OPTIONS: { id: AgeGroup; emoji: string; label: string; range: string; desc: string }[] = [
  { id: 'child',   emoji: '🐣', label: 'Young Learner', range: 'Ages 6–10',  desc: 'Very big text, one idea at a time, lots of emojis!' },
  { id: 'preteen', emoji: '🧒', label: 'Middle School',  range: 'Ages 11–14', desc: 'Clear chunks, simple words, fun examples.' },
  { id: 'teen',    emoji: '🎒', label: 'High School',    range: 'Ages 15–18', desc: 'Focused mode, timed sessions, academic content.' },
  { id: 'adult',   emoji: '🎓', label: 'University / Adult', range: '18+ years', desc: 'Full features, analytical tools, detailed study aids.' },
];

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? 24 : 8,
            height: 8,
            background: i < current
              ? 'linear-gradient(90deg, #7c5bf9, #00d4ff)'
              : i === current
              ? 'linear-gradient(90deg, #7c5bf9, #00d4ff)'
              : 'rgba(255,255,255,0.12)',
          }}
        />
      ))}
    </div>
  );
}

export function PreferencePicker({ onComplete }: PreferencePickerProps) {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [name, setName] = useState('');
  const [diagnosis, setDiagnosis] = useState<DiagnosisType | null>(null);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [gameStats, setGameStats] = useState({ timeTaken: 0, errors: 0, hesitation: 0 });

  const screenIndex = { welcome: 0, diagnosis: 1, age: 2, game: 3, result: 4 };

  // Compute final profile from diagnosis + game
  const buildProfile = (): StudentProfile => {
    let dyslexiaWeight = 20;
    let adhdWeight = 20;

    if (diagnosis === 'dyslexia') { dyslexiaWeight += 60; }
    else if (diagnosis === 'adhd') { adhdWeight += 60; }
    else if (diagnosis === 'both') { dyslexiaWeight += 40; adhdWeight += 40; }
    else { // unsure — infer from game
      if (gameStats.errors > 1 || gameStats.hesitation > 2) dyslexiaWeight += 25;
      if (gameStats.timeTaken < 15) adhdWeight += 25;
    }

    const standardWeight = Math.max(0, 100 - dyslexiaWeight - adhdWeight);
    const weights: WeightedProfile = {
      dyslexia: dyslexiaWeight,
      adhd: adhdWeight,
      standard: standardWeight,
    };

    let preferredMode: LearningMode = 'standard';
    if (dyslexiaWeight > 50 && adhdWeight > 50) preferredMode = 'mixed';
    else if (dyslexiaWeight > adhdWeight && dyslexiaWeight > 30) preferredMode = 'dyslexia';
    else if (adhdWeight > dyslexiaWeight && adhdWeight > 30) preferredMode = 'adhd';

    return {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      userId: '',
      name: name.trim() || 'Learner',
      ageGroup: ageGroup ?? 'teen',
      gradeLevel: ageGroup === 'child' ? 3 : ageGroup === 'preteen' ? 7 : ageGroup === 'teen' ? 10 : 12,
      diagnosisType: diagnosis === 'both' ? ['dyslexia', 'adhd'] : diagnosis ? [diagnosis] : [],
      medicationStatus: false,
      comfortLevel: 7,
      weightedProfile: weights,
      preferredMode,
      readingSpeed: ageGroup === 'child' ? 'slow' : 'normal',
      focusSpan: adhdWeight > 50 ? 'short' : 'medium',
      colorPreference: diagnosis === 'dyslexia' ? 'warm' : 'dark',
      fontScale: ageGroup === 'child' ? 1.3 : 1.0,
      wordSpacing: diagnosis === 'dyslexia' ? 1.5 : 1.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };

  const [resultProfile, setResultProfile] = useState<StudentProfile | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {screen !== 'welcome' && screen !== 'game' && (
          <ProgressDots total={5} current={screenIndex[screen]} />
        )}

        {/* ══ WELCOME ══ */}
        {screen === 'welcome' && (
          <div className="text-center space-y-8 animate-fade-in-up">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto animate-float"
              style={{ background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)', boxShadow: '0 0 40px rgba(124,91,249,0.4)' }}
            >
              🧠
            </div>
            <div>
              <div className="section-pill mb-4 inline-flex">✨ Personalised Setup — takes 2 minutes</div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#f0f0ff] mb-3">
                Welcome to <span className="gradient-text">NeuroLearn</span>
              </h1>
              <p className="text-lg text-[#8888b0] max-w-md mx-auto leading-relaxed">
                We'll ask you a few easy questions to set up your personalised learning space.
                No tests, no pressure — just your brain, your way. 🌟
              </p>
            </div>

            <div className="glass-card p-6 text-left space-y-3">
              <label className="block text-sm font-semibold text-[#f0f0ff] mb-2">
                What should we call you? 👋
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name or nickname..."
                className="w-full px-4 py-3 rounded-xl text-[#f0f0ff] placeholder-[#555580] outline-none focus:ring-2 transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontFamily: 'Lexend, sans-serif',
                }}
                onKeyDown={(e) => e.key === 'Enter' && setScreen('diagnosis')}
              />
            </div>

            <button
              onClick={() => setScreen('diagnosis')}
              className="glow-btn text-lg w-full justify-center"
            >
              Let's Begin! →
            </button>
          </div>
        )}

        {/* ══ DIAGNOSIS ══ */}
        {screen === 'diagnosis' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#f0f0ff] mb-2">
                Hi {name || 'there'}! 👋 <br />
                <span className="gradient-text">What describes you best?</span>
              </h2>
              <p className="text-[#8888b0]">This helps us set the right learning mode for you.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DIAGNOSIS_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setDiagnosis(opt.id)}
                  className="p-6 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02] group"
                  style={{
                    background: diagnosis === opt.id ? `${opt.border.replace('0.4', '0.12')}` : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${diagnosis === opt.id ? opt.border : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: diagnosis === opt.id ? `0 8px 30px ${opt.border}` : 'none',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform"
                    style={{ background: opt.gradient }}
                  >
                    {opt.emoji}
                  </div>
                  <h3 className="font-bold text-[#f0f0ff] text-lg mb-1">{opt.title}</h3>
                  <p className="text-sm text-[#8888b0] leading-relaxed">{opt.desc}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => diagnosis && setScreen('age')}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all"
              style={diagnosis
                ? { background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)', color: 'white', cursor: 'pointer' }
                : { background: 'rgba(255,255,255,0.04)', color: '#555580', cursor: 'not-allowed' }
              }
            >
              {diagnosis ? 'Continue →' : 'Choose one to continue'}
            </button>
          </div>
        )}

        {/* ══ AGE ══ */}
        {screen === 'age' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#f0f0ff] mb-2">
                Which age group <span className="gradient-text">are you in?</span>
              </h2>
              <p className="text-[#8888b0]">We'll adapt the text complexity and font size for you.</p>
            </div>

            <div className="space-y-3">
              {AGE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setAgeGroup(opt.id)}
                  className="w-full p-4 rounded-xl text-left flex items-center gap-4 transition-all duration-200 hover:scale-[1.01]"
                  style={{
                    background: ageGroup === opt.id ? 'rgba(124,91,249,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${ageGroup === opt.id ? 'rgba(124,91,249,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: ageGroup === opt.id ? '0 4px 20px rgba(124,91,249,0.2)' : 'none',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: ageGroup === opt.id ? 'linear-gradient(135deg, #7c5bf9, #00d4ff)' : 'rgba(255,255,255,0.08)' }}
                  >
                    {opt.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#f0f0ff]">{opt.label}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(124,91,249,0.15)', color: '#a78bfa' }}
                      >
                        {opt.range}
                      </span>
                    </div>
                    <p className="text-sm text-[#8888b0] mt-0.5">{opt.desc}</p>
                  </div>
                  {ageGroup === opt.id && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)' }}>
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => ageGroup && setScreen('game')}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all"
              style={ageGroup
                ? { background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)', color: 'white', cursor: 'pointer' }
                : { background: 'rgba(255,255,255,0.04)', color: '#555580', cursor: 'not-allowed' }
              }
            >
              {ageGroup ? 'Start Quick Activity →' : 'Choose your age group first'}
            </button>
          </div>
        )}

        {/* ══ GAME ══ */}
        {screen === 'game' && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-6">
              <div className="section-pill mb-3 inline-flex">🎯 One quick activity — just 30 seconds!</div>
              <p className="text-[#8888b0] text-sm">This helps us fine-tune your profile. No pressure, just have fun!</p>
            </div>
            <CognitiveGame onComplete={(stats) => {
              setGameStats(stats);
              
              // We must build the profile here on the client side to avoid hydration mismatches
              // caused by crypto.randomUUID() running on the server.
              
              // Use a timeout to ensure gameStats state updates first if buildProfile relies on it
              // Actually, buildProfile directly reads the current state, so we pass stats manually
              
              let dyslexiaWeight = 20;
              let adhdWeight = 20;

              if (diagnosis === 'dyslexia') { dyslexiaWeight += 60; }
              else if (diagnosis === 'adhd') { adhdWeight += 60; }
              else if (diagnosis === 'both') { dyslexiaWeight += 40; adhdWeight += 40; }
              else { 
                if (stats.errors > 1 || stats.hesitation > 2) dyslexiaWeight += 25;
                if (stats.timeTaken < 15) adhdWeight += 25;
              }

              const standardWeight = Math.max(0, 100 - dyslexiaWeight - adhdWeight);
              const weights: WeightedProfile = {
                dyslexia: dyslexiaWeight,
                adhd: adhdWeight,
                standard: standardWeight,
              };

              let preferredMode: LearningMode = 'standard';
              if (dyslexiaWeight > 50 && adhdWeight > 50) preferredMode = 'mixed';
              else if (dyslexiaWeight > adhdWeight && dyslexiaWeight > 30) preferredMode = 'dyslexia';
              else if (adhdWeight > dyslexiaWeight && adhdWeight > 30) preferredMode = 'adhd';

              const newProfile: StudentProfile = {
                id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
                userId: '',
                name: name.trim() || 'Learner',
                ageGroup: ageGroup ?? 'teen',
                gradeLevel: ageGroup === 'child' ? 3 : ageGroup === 'preteen' ? 7 : ageGroup === 'teen' ? 10 : 12,
                diagnosisType: diagnosis === 'both' ? ['dyslexia', 'adhd'] : diagnosis ? [diagnosis] : [],
                medicationStatus: false,
                comfortLevel: 7,
                weightedProfile: weights,
                preferredMode,
                readingSpeed: ageGroup === 'child' ? 'slow' : 'normal',
                focusSpan: adhdWeight > 50 ? 'short' : 'medium',
                colorPreference: diagnosis === 'dyslexia' ? 'warm' : 'dark',
                fontScale: ageGroup === 'child' ? 1.3 : 1.0,
                wordSpacing: diagnosis === 'dyslexia' ? 1.5 : 1.0,
                createdAt: new Date(),
                updatedAt: new Date(),
              };

              setResultProfile(newProfile);
              setScreen('result');
            }} />
          </div>
        )}

        {/* ══ RESULT ══ */}
        {screen === 'result' && resultProfile && (
          <div className="text-center space-y-6 animate-scale-in">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto"
              style={{ background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)', boxShadow: '0 0 40px rgba(124,91,249,0.5)' }}
            >
              {diagnosis === 'dyslexia' ? '📖' : diagnosis === 'adhd' ? '⚡' : '🌟'}
            </div>

            <div>
              <h2 className="text-3xl font-extrabold text-[#f0f0ff] mb-2">
                You're all set, {resultProfile.name}! 🎉
              </h2>
              <p className="text-[#8888b0]">Here's your personalised learning profile:</p>
            </div>

            {/* Profile card */}
            <div className="glass-card p-6 text-left space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl" style={{ background: 'rgba(124,91,249,0.1)' }}>
                  <p className="text-xs text-[#8888b0] mb-1">LEARNING MODE</p>
                  <p className="font-bold text-[#f0f0ff]">
                    {resultProfile.preferredMode === 'dyslexia' ? '📖 Dyslexia Mode'
                     : resultProfile.preferredMode === 'adhd' ? '⚡ ADHD Mode'
                     : resultProfile.preferredMode === 'mixed' ? '🌀 Mixed Mode'
                     : '🧠 Standard Mode'}
                  </p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(0,212,255,0.08)' }}>
                  <p className="text-xs text-[#8888b0] mb-1">AGE GROUP</p>
                  <p className="font-bold text-[#f0f0ff]">
                    {AGE_CONFIGS[resultProfile.ageGroup].emoji} {AGE_CONFIGS[resultProfile.ageGroup].label}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#8888b0]">CONFIDENCE SCORES</p>
                {[
                  { label: 'Dyslexia Support', value: resultProfile.weightedProfile.dyslexia, color: '#f59e0b' },
                  { label: 'ADHD Support',      value: resultProfile.weightedProfile.adhd,    color: '#7c5bf9' },
                  { label: 'Standard',           value: resultProfile.weightedProfile.standard, color: '#00d4ff' },
                ].map((bar) => (
                  <div key={bar.label} className="flex items-center gap-3">
                    <span className="text-xs text-[#8888b0] w-32 flex-shrink-0">{bar.label}</span>
                    <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${bar.value}%`, background: bar.color }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#f0f0ff] w-8">{bar.value}%</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(124,91,249,0.08)', border: '1px solid rgba(124,91,249,0.2)' }}>
                <span className="text-[#a78bfa] font-semibold">✨ What's adapted for you: </span>
                <span className="text-[#8888b0]">
                  {AGE_CONFIGS[resultProfile.ageGroup].label} vocabulary,{' '}
                  {AGE_CONFIGS[resultProfile.ageGroup].chunkSentences} sentence{AGE_CONFIGS[resultProfile.ageGroup].chunkSentences > 1 ? 's' : ''} per chunk,{' '}
                  {AGE_CONFIGS[resultProfile.ageGroup].fontSize}px font,{' '}
                  {resultProfile.preferredMode === 'dyslexia' ? 'OpenDyslexic font + bionic reading' : 'focus timer + distraction-free mode'}.
                </span>
              </div>
            </div>

            <button
              onClick={() => onComplete(resultProfile)}
              className="glow-btn text-lg w-full justify-center animate-pulse-glow"
            >
              🚀 Start Learning!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
