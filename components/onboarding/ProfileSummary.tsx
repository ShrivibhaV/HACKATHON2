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
    colorPref: 'light' | 'dark' | 'sepia' | 'warm'
  ) => void;
  onBack: () => void;
}

export function ProfileSummary({
  weights,
  onFinalize,
  onBack,
}: ProfileSummaryProps) {
  const [colorPref, setColorPref] = React.useState<'light' | 'dark' | 'sepia' | 'warm'>('warm');
  const data = [
    { name: 'Standard', value: weights.standard },
    { name: 'Dyslexia', value: weights.dyslexia },
    { name: 'ADHD', value: weights.adhd },
  ];

  const getDominantMode = () => {
    if (weights.dyslexia > 40 && weights.adhd > 40) return 'Mixed';
    if (weights.dyslexia > weights.adhd && weights.dyslexia > weights.standard) return 'Dyslexia';
    else if (weights.adhd > weights.standard) return 'ADHD';
    return 'Standard';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-1000">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold gradient-text">Your Learning Blueprint</h2>
        <p className="text-slate-400">
          We've calibrated the environment to your unique profile.
        </p>
      </div>

      <Card className="glass-card p-8 space-y-8 border-white/10">
        <div className="text-center space-y-3">
          <div className="inline-block px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest"> Dominant Mode </p>
            <p className="text-2xl font-bold text-[#7c5bf9]"> {getDominantMode()} Mode </p>
          </div>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <Bar dataKey="value" fill="url(#colorGradient)" radius={[10, 10, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c5bf9" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/5">
          <h3 className="font-semibold text-lg text-[#f0f0ff]">Adaptive Features Enabled:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(getDominantMode() === 'Dyslexia' || getDominantMode() === 'Mixed') && (
              <>
                <div className="flex gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-2xl">🧩</span>
                  <div>
                    <p className="font-bold text-sm text-[#f0f0ff]">Phonetic Breakdown</p>
                    <p className="text-xs text-slate-400">Syllable segmenting for sound retrieval</p>
                  </div>
                </div>
                <div className="flex gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-2xl">📏</span>
                  <div>
                    <p className="font-bold text-sm text-[#f0f0ff]">Reading Ruler</p>
                    <p className="text-xs text-slate-400">High-contrast tracking guide</p>
                  </div>
                </div>
              </>
            )}

            {(getDominantMode() === 'ADHD' || getDominantMode() === 'Mixed') && (
              <>
                <div className="flex gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="font-bold text-sm text-[#f0f0ff]">Micro-Chunking</p>
                    <p className="text-xs text-slate-400">Content split into digestible bits</p>
                  </div>
                </div>
                <div className="flex gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-2xl">⏱️</span>
                  <div>
                    <p className="font-bold text-sm text-[#f0f0ff]">Focus Pacing</p>
                    <p className="text-xs text-slate-400">Guided reading with focus timers</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/5">
          <h3 className="font-semibold text-lg text-[#f0f0ff]">Choose Background:</h3>
          <div className="grid grid-cols-4 gap-3">
            {['warm', 'sepia', 'dark', 'light'].map((p) => (
              <button
                key={p}
                onClick={() => setColorPref(p as any)}
                className={`p-3 rounded-lg border text-xs capitalize transition-all ${colorPref === p ? 'border-[#7c5bf9] bg-[#7c5bf9]/20' : 'border-white/5 bg-white/5'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex gap-4 justify-center">
        <Button variant="ghost" onClick={onBack} className="text-slate-400 hover:text-white">
          Back
        </Button>
        <Button
          className="bg-[#7c5bf9] hover:bg-[#6b4ae0] text-white px-12 py-6 rounded-xl font-bold text-lg shadow-xl shadow-purple-500/20"
          onClick={() => onFinalize('normal', 'medium', colorPref)}
        >
          Start Learning →
        </Button>
      </div>
    </div>
  );
}
