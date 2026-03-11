'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LearningMode, WeightedProfile, StudentProfile } from '@/lib/types';
import { CognitiveGame } from './CognitiveGame';
import { ReadingTracker } from './ReadingTracker';
import { ProfileSummary } from './ProfileSummary';

type Screen = 'game' | 'reading' | 'preference' | 'summary';

interface PreferencePickerProps {
  onComplete: (profile: StudentProfile) => void;
}

export function PreferencePicker({ onComplete }: PreferencePickerProps) {
  const [screen, setScreen] = useState<Screen>('game');
  const [selectedMode, setSelectedMode] = useState<LearningMode>('standard');
  const [weights, setWeights] = useState<WeightedProfile>({
    standard: 33,
    dyslexia: 33,
    adhd: 33,
  });
  const [gameStats, setGameStats] = useState({ timeTaken: 0, errors: 0, hesitation: 0 });

  const handleGameComplete = (stats: { timeTaken: number; errors: number; hesitation: number }) => {
    setGameStats(stats);
    setScreen('reading');
  };

  const handleReadingComplete = (stats: { scrollCount: number; timeSpent: number; reReads: number }) => {
    // SILENT INFERENCE LOGIC (COGNIX Pillar 1)
    let dyslexiaWeight = 33;
    let adhdWeight = 33;
    let standardWeight = 34;

    // Infer Dyslexia (High game errors, high hesitation, high re-reads)
    if (gameStats.errors > 1 || gameStats.hesitation > 2 || stats.reReads > 1) {
      dyslexiaWeight += 30;
      standardWeight -= 15;
      adhdWeight -= 15;
    }

    // Infer ADHD (High scroll velocity, fast reading time, high game hesitation)
    if (stats.scrollCount > 5 || stats.timeSpent < 15 || gameStats.hesitation > 1) {
      adhdWeight += 30;
      standardWeight -= 15;
      dyslexiaWeight -= 15;
    }

    // Normalize
    const total = dyslexiaWeight + adhdWeight + standardWeight;
    const finalWeights = {
      dyslexia: Math.round((dyslexiaWeight / total) * 100),
      adhd: Math.round((adhdWeight / total) * 100),
      standard: 100 - (Math.round((dyslexiaWeight / total) * 100) + Math.round((adhdWeight / total) * 100))
    };

    setWeights(finalWeights);
    
    // Determine dominant initial mode
    if (finalWeights.dyslexia > finalWeights.adhd && finalWeights.dyslexia > finalWeights.standard) setSelectedMode('dyslexia');
    else if (finalWeights.adhd > finalWeights.dyslexia && finalWeights.adhd > finalWeights.standard) setSelectedMode('adhd');
    else setSelectedMode('standard');

    setScreen('preference');
  };

  const handlePreferenceSelect = (mode: LearningMode) => {
    // One-tap preference (Pillar 1 Step 3)
    setSelectedMode(mode);
    setScreen('summary');
  };

  const handleFinalize = (
    readingSpeed: 'slow' | 'normal' | 'fast',
    focusSpan: 'short' | 'medium' | 'long',
    colorPref: 'light' | 'dark' | 'sepia'
  ) => {
    const profile: StudentProfile = {
      id: crypto.randomUUID(),
      userId: '', // Will be set with auth
      weightedProfile: weights,
      preferredMode: selectedMode,
      readingSpeed,
      focusSpan,
      colorPreference: colorPref,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    onComplete(profile);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {screen === 'game' && (
          <CognitiveGame onComplete={handleGameComplete} />
        )}
        {screen === 'reading' && (
          <ReadingTracker onComplete={handleReadingComplete} />
        )}
        {screen === 'preference' && (
          <div className="space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
              <h2 className="text-3xl font-extrabold mb-3"><span className="gradient-text">Final Choice</span></h2>
              <p className="text-[#8888b0]">Which presentation feels more natural to you?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <button 
                onClick={() => handlePreferenceSelect('dyslexia')}
                className="glass-card p-10 group hover:scale-[1.02] transition-all border-[#7c5bf9]/20 hover:border-[#7c5bf9]/50"
              >
                <div className="text-4xl mb-4 group-hover:animate-bounce">📖</div>
                <h3 className="text-xl font-bold text-[#f0f0ff] mb-2">Visual & Chunked</h3>
                <p className="text-sm text-[#8888b0]">Large fonts, clear headers, and cream-toned background.</p>
              </button>
              <button 
                onClick={() => handlePreferenceSelect('adhd')}
                className="glass-card p-10 group hover:scale-[1.02] transition-all border-[#00d4ff]/20 hover:border-[#00d4ff]/50"
              >
                <div className="text-4xl mb-4 group-hover:animate-bounce">⚡</div>
                <h3 className="text-xl font-bold text-[#f0f0ff] mb-2">Focus-First</h3>
                <p className="text-sm text-[#8888b0]">Interactive tools, Pomodoro timers, and noise blockers.</p>
              </button>
            </div>
          </div>
        )}
        {screen === 'summary' && (
          <ProfileSummary
            weights={weights}
            onFinalize={handleFinalize}
            onBack={() => setScreen('preference')}
          />
        )}
      </div>
    </div>
  );
}
