'use client';

import React from 'react';
import { useProfile } from '@/lib/profile-context';
import { LearningMode } from '@/lib/types';
import { Book, Zap, Layout } from 'lucide-react';

export function ModeSwitcher() {
  const { profile, updateProfile } = useProfile();
  
  if (!profile) return null;

  const currentMode = profile.preferredMode || 'standard';

  const modes: { id: LearningMode; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'standard', label: 'Standard', icon: <Layout className="w-4 h-4" />, color: '#00d4ff' },
    { id: 'dyslexia', label: 'Dyslexia', icon: <Book className="w-4 h-4" />, color: '#f59e0b' },
    { id: 'adhd', label: 'ADHD', icon: <Zap className="w-4 h-4" />, color: '#7c5bf9' },
  ];

  const handleModeChange = (mode: LearningMode) => {
    updateProfile({ preferredMode: mode });
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-xl">
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => handleModeChange(m.id)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-300
            ${currentMode === m.id 
              ? 'bg-white/10 text-white shadow-inner' 
              : 'text-[#8888b0] hover:text-white hover:bg-white/5'
            }
          `}
          style={currentMode === m.id ? { borderLeft: `3px solid ${m.color}` } : {}}
        >
          <span style={{ color: currentMode === m.id ? m.color : 'inherit' }}>
            {m.icon}
          </span>
          {m.label}
        </button>
      ))}
    </div>
  );
}
