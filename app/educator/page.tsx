'use client';

import React, { useState } from 'react';
import { useProfile } from '@/lib/profile-context';
import { EducatorChat } from '@/components/educator/EducatorChat';
import Link from 'next/link';
import { Lightbulb } from 'lucide-react';

export default function EducatorPage() {
  const { profile } = useProfile();
  const [pendingQuestion, setPendingQuestion] = useState<string | undefined>(undefined);

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #e040fb)' }}>💡</div>
          <h2 className="text-2xl font-bold text-[#f0f0ff] mb-3">Set Up Your Profile First</h2>
          <p className="text-[#8888b0] mb-6">Complete onboarding to access your personalised AI educator.</p>
          <Link href="/onboarding" className="glow-btn w-full justify-center">Start Onboarding →</Link>
        </div>
      </main>
    );
  }

  const sampleContent = `Photosynthesis is the process by which plants convert light energy into chemical energy stored in glucose. 
  This occurs in the chloroplasts of plant cells. The light-dependent reactions use sunlight to create ATP and NADPH. 
  The light-independent reactions (Calvin cycle) use these energy carriers to produce glucose from carbon dioxide.`;

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #e040fb)' }}>💡</div>
          </div>
          <h1 className="text-4xl font-extrabold mb-2"><span className="gradient-text-warm">AI Educator</span></h1>
          <p className="text-[#8888b0] max-w-xl mx-auto">
            Ask anything about your learning material. I'll explain it in a way that fits your brain.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat */}
          <div className="lg:col-span-2">
            <EducatorChat
              studentProfile={profile}
              contentContext={`Photosynthesis: plants convert light to glucose via chloroplasts.`}
              injectedQuestion={pendingQuestion}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="glass-card p-5 space-y-3">
              <h3 className="font-bold text-[#f0f0ff]">Your Profile</h3>
              {[
                { label: 'Mode', value: profile.preferredMode },
                { label: 'Reading Speed', value: profile.readingSpeed },
                { label: 'Focus Span', value: profile.focusSpan },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-xs text-[#8888b0]">{item.label}</p>
                  <p className="font-semibold text-sm text-[#f0f0ff] capitalize">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="glass-card p-5 space-y-3">
              <h3 className="font-bold text-[#f0f0ff]">Try These Questions</h3>
              {[
                profile.preferredMode === 'dyslexia' && 'Can you explain photosynthesis in simple words?',
                profile.preferredMode === 'dyslexia' && 'What does chlorophyll do?',
                profile.preferredMode === 'adhd' && 'What are the 3 main steps?',
                profile.preferredMode === 'adhd' && 'Why is this important?',
                profile.preferredMode === 'standard' && 'How does photosynthesis work?',
                profile.preferredMode === 'standard' && 'Can you give me an analogy?',
              ].filter(Boolean).map((q, i) => (
                <button key={i}
                  onClick={() => setPendingQuestion(q as string)}
                  className="w-full text-left text-sm px-3 py-2 rounded-lg transition-all hover:opacity-90"
                  style={{ background: 'rgba(124,91,249,0.1)', border: '1px solid rgba(124,91,249,0.2)', color: '#a78bfa' }}>
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
