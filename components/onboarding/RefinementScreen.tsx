'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LearningMode, WeightedProfile } from '@/lib/types';
import { Slider } from '@/components/ui/slider';

interface RefinementScreenProps {
  selectedMode: LearningMode;
  initialWeights: WeightedProfile;
  onComplete: (
    readingSpeed: 'slow' | 'normal' | 'fast',
    focusSpan: 'short' | 'medium' | 'long',
    colorPref: 'light' | 'dark' | 'sepia',
    weights: WeightedProfile
  ) => void;
}

export function RefinementScreen({
  selectedMode,
  initialWeights,
  onComplete,
}: RefinementScreenProps) {
  const [readingSpeed, setReadingSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [focusSpan, setFocusSpan] = useState<'short' | 'medium' | 'long'>('medium');
  const [colorPref, setColorPref] = useState<'light' | 'dark' | 'sepia'>('light');
  const [weights, setWeights] = useState<WeightedProfile>(initialWeights);

  const modeLabels = {
    standard: 'Standard Learning',
    dyslexia: 'Dyslexia Support',
    adhd: 'ADHD Focus',
  };

  const getDominantLabel = () => {
    const sorted = Object.entries(weights)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2);
    return sorted.map(([key, val]) => `${val}% ${key}`).join(' / ');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Fine-tune your profile</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Optional: Customize your learning preferences
        </p>
      </div>

      <Card className="p-8 space-y-8">
        {/* Reading Speed */}
        <div className="space-y-3">
          <label className="font-semibold text-lg">Reading Speed</label>
          <div className="flex gap-3">
            {(['slow', 'normal', 'fast'] as const).map((speed) => (
              <Button
                key={speed}
                variant={readingSpeed === speed ? 'default' : 'outline'}
                className={readingSpeed === speed ? 'bg-purple-600' : ''}
                onClick={() => setReadingSpeed(speed)}
              >
                {speed === 'slow' ? '🐢 Slow' : speed === 'normal' ? '→ Normal' : '⚡ Fast'}
              </Button>
            ))}
          </div>
        </div>

        {/* Focus Span */}
        <div className="space-y-3">
          <label className="font-semibold text-lg">Focus Span Preference</label>
          <div className="flex gap-3">
            {(['short', 'medium', 'long'] as const).map((span) => (
              <Button
                key={span}
                variant={focusSpan === span ? 'default' : 'outline'}
                className={focusSpan === span ? 'bg-purple-600' : ''}
                onClick={() => setFocusSpan(span)}
              >
                {span === 'short'
                  ? '📝 Short (5-10 min)'
                  : span === 'medium'
                    ? '📖 Medium (10-20 min)'
                    : '📚 Long (20+ min)'}
              </Button>
            ))}
          </div>
        </div>

        {/* Color Preference */}
        <div className="space-y-3">
          <label className="font-semibold text-lg">Color Preference</label>
          <div className="flex gap-3">
            {(['light', 'dark', 'sepia'] as const).map((pref) => (
              <Button
                key={pref}
                variant={colorPref === pref ? 'default' : 'outline'}
                className={colorPref === pref ? 'bg-purple-600' : ''}
                onClick={() => setColorPref(pref)}
              >
                {pref === 'light'
                  ? '☀️ Light'
                  : pref === 'dark'
                    ? '🌙 Dark'
                    : '📄 Sepia'}
              </Button>
            ))}
          </div>
        </div>

        {/* Weighted Profile Slider */}
        <div className="space-y-4 pt-6 border-t">
          <div>
            <label className="font-semibold text-lg">How much {selectedMode === 'dyslexia' ? 'Dyslexia' : 'ADHD'} support?</label>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Current mix: {getDominantLabel()}
            </p>
          </div>

          <div className="space-y-3">
            {selectedMode === 'dyslexia' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Standard</span>
                  <span className="font-semibold">{weights.standard}%</span>
                  <span>Dyslexia Support</span>
                </div>
                <Slider
                  value={[weights.dyslexia]}
                  onValueChange={(val) => {
                    const dyslexia = val[0];
                    const remaining = 100 - dyslexia;
                    setWeights({
                      standard: Math.round(remaining * 0.7),
                      dyslexia,
                      adhd: Math.round(remaining * 0.3),
                    });
                  }}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            )}

            {selectedMode === 'adhd' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Standard</span>
                  <span className="font-semibold">{weights.adhd}%</span>
                  <span>ADHD Focus</span>
                </div>
                <Slider
                  value={[weights.adhd]}
                  onValueChange={(val) => {
                    const adhd = val[0];
                    const remaining = 100 - adhd;
                    setWeights({
                      standard: Math.round(remaining * 0.7),
                      dyslexia: Math.round(remaining * 0.3),
                      adhd,
                    });
                  }}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="flex gap-4 justify-center">
        <Button
          variant="outline"
          onClick={() =>
            onComplete(readingSpeed, focusSpan, colorPref, initialWeights)
          }
        >
          Keep Defaults
        </Button>
        <Button
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
          size="lg"
          onClick={() => onComplete(readingSpeed, focusSpan, colorPref, weights)}
        >
          Continue →
        </Button>
      </div>
    </div>
  );
}
