'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WeightedProfile } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProfileSummaryProps {
  weights: WeightedProfile;
  onFinalize: (
    readingSpeed: 'slow' | 'normal' | 'fast',
    focusSpan: 'short' | 'medium' | 'long',
    colorPref: 'light' | 'dark' | 'sepia'
  ) => void;
  onBack: () => void;
}

export function ProfileSummary({
  weights,
  onFinalize,
  onBack,
}: ProfileSummaryProps) {
  const data = [
    { name: 'Standard', value: weights.standard },
    { name: 'Dyslexia', value: weights.dyslexia },
    { name: 'ADHD', value: weights.adhd },
  ];

  const getDominantMode = () => {
    if (weights.dyslexia > weights.adhd && weights.dyslexia > weights.standard) {
      return 'Dyslexia';
    } else if (weights.adhd > weights.standard) {
      return 'ADHD';
    }
    return 'Standard';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Your personalized profile</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Your learning preferences are ready to adapt your experience
        </p>
      </div>

      <Card className="p-8 space-y-8">
        {/* Profile Badge */}
        <div className="text-center space-y-3">
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Primary Learning Mode
            </p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {getDominantMode()} Mode
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15,23,42,0.9)',
                  border: '1px solid rgba(148,163,184,0.2)',
                  borderRadius: '8px',
                }}
                cursor={{ fill: 'rgba(168,85,247,0.1)' }}
              />
              <Bar dataKey="value" fill="#a855f7" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Features Summary */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold text-lg">Your experience includes:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getDominantMode() === 'Dyslexia' && (
              <>
                <div className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-xl">📖</span>
                  <div>
                    <p className="font-medium text-sm">Bionic Reading</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Bold word starts for rhythm
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-xl">🎯</span>
                  <div>
                    <p className="font-medium text-sm">Reading Ruler</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Track your position
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-xl">🎤</span>
                  <div>
                    <p className="font-medium text-sm">Text-to-Speech</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Listen while you read
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-xl">🌡️</span>
                  <div>
                    <p className="font-medium text-sm">Warm Colors</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Easier on the eyes
                    </p>
                  </div>
                </div>
              </>
            )}

            {getDominantMode() === 'ADHD' && (
              <>
                <div className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-xl">⚡</span>
                  <div>
                    <p className="font-medium text-sm">Micro-Chunking</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Bite-sized sections
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-xl">⏱️</span>
                  <div>
                    <p className="font-medium text-sm">Focus Timer</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Pomodoro & breaks
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-xl">🎉</span>
                  <div>
                    <p className="font-medium text-sm">Reward System</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Earn streaks & badges
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-xl">🎯</span>
                  <div>
                    <p className="font-medium text-sm">Focus Mode</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Minimal distraction view
                    </p>
                  </div>
                </div>
              </>
            )}

            {getDominantMode() === 'Standard' && (
              <>
                <div className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-xl">📚</span>
                  <div>
                    <p className="font-medium text-sm">Balanced Layout</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Clean, focused interface
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-xl">📊</span>
                  <div>
                    <p className="font-medium text-sm">Progress Tracking</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      See your achievements
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-xl">🤖</span>
                  <div>
                    <p className="font-medium text-sm">AI Educator</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Ask questions anytime
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-xl">🎨</span>
                  <div>
                    <p className="font-medium text-sm">Customizable Theme</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Adjust to your preference
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      <div className="flex gap-4 justify-center">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
          size="lg"
          onClick={() => onFinalize('normal', 'medium', 'light')}
        >
          Start Learning →
        </Button>
      </div>
    </div>
  );
}
