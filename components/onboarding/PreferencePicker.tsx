'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LearningMode, WeightedProfile, StudentProfile } from '@/lib/types';
import { CognitiveGame } from './CognitiveGame';
import { ReadingTracker } from './ReadingTracker';
import { ProfileSummary } from './ProfileSummary';

type Screen = 'basics' | 'game' | 'reading' | 'preference' | 'summary';

interface PreferencePickerProps {
  onComplete: (profile: StudentProfile) => void;
}

export function PreferencePicker({ onComplete }: PreferencePickerProps) {
  const [screen, setScreen] = useState<Screen>('basics');
  const [basicInfo, setBasicInfo] = useState({
    ageGroup: 'junior' as 'junior' | 'senior',
    gradeLevel: 1,
    diagnosisType: [] as string[],
    medicationStatus: false,
    comfortLevel: 5,
  });
  const [selectedMode, setSelectedMode] = useState<LearningMode>('standard');
  const [weights, setWeights] = useState<WeightedProfile>({
    standard: 33,
    dyslexia: 33,
    adhd: 33,
  });
  const [gameStats, setGameStats] = useState({ timeTaken: 0, errors: 0, hesitation: 0 });

  const handleBasicsComplete = (info: typeof basicInfo) => {
    setBasicInfo(info);
    setScreen('game');
  };

  const handleGameComplete = (stats: { timeTaken: number; errors: number; hesitation: number }) => {
    setGameStats(stats);
    setScreen('reading');
  };

  const handleReadingComplete = (stats: { scrollCount: number; timeSpent: number; reReads: number }) => {
    // SILENT INFERENCE LOGIC
    let dyslexiaWeight = 33;
    let adhdWeight = 33;
    let standardWeight = 34;

    // Use explicit diagnosis to boost weights
    if (basicInfo.diagnosisType.includes('dyslexia')) dyslexiaWeight += 40;
    if (basicInfo.diagnosisType.includes('adhd')) adhdWeight += 40;

    if (gameStats.errors > 1 || gameStats.hesitation > 2 || stats.reReads > 1) {
      dyslexiaWeight += 20;
    }

    if (stats.scrollCount > 5 || stats.timeSpent < 15 || gameStats.hesitation > 1) {
      adhdWeight += 20;
    }

    const total = dyslexiaWeight + adhdWeight + standardWeight;
    const finalWeights = {
      dyslexia: Math.round((dyslexiaWeight / total) * 100),
      adhd: Math.round((adhdWeight / total) * 100),
      standard: 100 - (Math.round((dyslexiaWeight / total) * 100) + Math.round((adhdWeight / total) * 100))
    };

    setWeights(finalWeights);
    
    if (finalWeights.dyslexia > 45 && finalWeights.adhd > 45) setSelectedMode('mixed');
    else if (finalWeights.dyslexia > finalWeights.adhd && finalWeights.dyslexia > finalWeights.standard) setSelectedMode('dyslexia');
    else if (finalWeights.adhd > finalWeights.dyslexia && finalWeights.adhd > finalWeights.standard) setSelectedMode('adhd');
    else setSelectedMode('standard');

    setScreen('preference');
  };

  const handlePreferenceSelect = (mode: LearningMode) => {
    setSelectedMode(mode);
    setScreen('summary');
  };

  const handleFinalize = (
    readingSpeed: 'slow' | 'normal' | 'fast',
    focusSpan: 'short' | 'medium' | 'long',
    colorPref: 'light' | 'dark' | 'sepia' | 'warm'
  ) => {
    const profile: StudentProfile = {
      id: crypto.randomUUID(),
      userId: '',
      ...basicInfo,
      weightedProfile: weights,
      preferredMode: selectedMode,
      readingSpeed,
      focusSpan,
      colorPreference: colorPref,
      fontScale: 1.0,
      wordSpacing: 1.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    onComplete(profile);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {screen === 'basics' && (
          <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold mb-3"><span className="gradient-text">Welcome to NeuroLearn</span></h2>
              <p className="text-[#8888b0]">Let's customize your learning environment.</p>
            </div>
            
            <Card className="glass-card p-8 space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-[#f0f0ff]">How old are you? (Grade)</label>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setBasicInfo({...basicInfo, ageGroup: 'junior', gradeLevel: 1})}
                    className={`flex-1 p-4 rounded-xl border transition-all ${basicInfo.ageGroup === 'junior' ? 'bg-[#7c5bf9]/20 border-[#7c5bf9]' : 'bg-white/5 border-white/10'}`}
                  >
                    👶 Junior (Grades 1-5)
                  </button>
                  <button 
                    onClick={() => setBasicInfo({...basicInfo, ageGroup: 'senior', gradeLevel: 6})}
                    className={`flex-1 p-4 rounded-xl border transition-all ${basicInfo.ageGroup === 'senior' ? 'bg-[#7c5bf9]/20 border-[#7c5bf9]' : 'bg-white/5 border-white/10'}`}
                  >
                    🚀 Senior (Grades 6-10+)
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-[#f0f0ff]">Are you diagnosed with any of these?</label>
                <div className="flex flex-wrap gap-3">
                  {['dyslexia', 'adhd', 'none'].map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        const current = basicInfo.diagnosisType;
                        const next = current.includes(type) ? current.filter(t => t !== type) : [...current, type];
                        setBasicInfo({...basicInfo, diagnosisType: next});
                      }}
                      className={`px-4 py-2 rounded-full border transition-all capitalize ${basicInfo.diagnosisType.includes(type) ? 'bg-[#00d4ff]/20 border-[#00d4ff]' : 'bg-white/5 border-white/10'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={basicInfo.medicationStatus}
                    onChange={(e) => setBasicInfo({...basicInfo, medicationStatus: e.target.checked})}
                    className="w-5 h-5 rounded border-white/10 bg-white/5"
                  />
                  <span className="text-sm text-[#f0f0ff]">I am currently taking medication for focus</span>
                </label>
              </div>

              <Button 
                onClick={() => setScreen('game')}
                className="w-full bg-[#7c5bf9] hover:bg-[#6b4ae0] text-white py-6 rounded-xl font-bold text-lg"
              >
                Continue to Assessment
              </Button>
            </Card>
          </div>
        )}
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
