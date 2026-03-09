'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LearningMode, WeightedProfile, StudentProfile } from '@/lib/types';
import { ModePreview } from './ModePreview';
import { RefinementScreen } from './RefinementScreen';
import { ProfileSummary } from './ProfileSummary';

type Screen = 'mode-selection' | 'refinement' | 'summary';

interface PreferencePickerProps {
  onComplete: (profile: StudentProfile) => void;
}

export function PreferencePicker({ onComplete }: PreferencePickerProps) {
  const [screen, setScreen] = useState<Screen>('mode-selection');
  const [selectedMode, setSelectedMode] = useState<LearningMode>('standard');
  const [weights, setWeights] = useState<WeightedProfile>({
    standard: 33,
    dyslexia: 33,
    adhd: 33,
  });

  const handleModeSelect = (mode: LearningMode) => {
    setSelectedMode(mode);
    // Initialize weights based on selected mode
    if (mode === 'dyslexia') {
      setWeights({ standard: 20, dyslexia: 70, adhd: 10 });
    } else if (mode === 'adhd') {
      setWeights({ standard: 20, dyslexia: 10, adhd: 70 });
    } else {
      setWeights({ standard: 70, dyslexia: 15, adhd: 15 });
    }
    setScreen('refinement');
  };

  const handleRefinementComplete = (
    readingSpeed: 'slow' | 'normal' | 'fast',
    focusSpan: 'short' | 'medium' | 'long',
    colorPref: 'light' | 'dark' | 'sepia',
    updatedWeights: WeightedProfile
  ) => {
    setWeights(updatedWeights);
    setScreen('summary');
  };

  const handleFinalize = (
    readingSpeed: 'slow' | 'normal' | 'fast',
    focusSpan: 'short' | 'medium' | 'long',
    colorPref: 'light' | 'dark' | 'sepia'
  ) => {
    const profile: StudentProfile = {
      id: crypto.getRandomUUID(),
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50 dark:to-purple-950">
      <div className="container mx-auto px-4 py-12">
        {screen === 'mode-selection' && (
          <ModePreview onSelect={handleModeSelect} />
        )}
        {screen === 'refinement' && (
          <RefinementScreen
            selectedMode={selectedMode}
            initialWeights={weights}
            onComplete={handleRefinementComplete}
          />
        )}
        {screen === 'summary' && (
          <ProfileSummary
            weights={weights}
            onFinalize={handleFinalize}
            onBack={() => setScreen('refinement')}
          />
        )}
      </div>
    </div>
  );
}
