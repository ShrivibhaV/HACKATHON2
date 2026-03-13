'use client';

import React from 'react';
import { useProfile } from '@/lib/profile-context';

interface AgeAppropriateWrapperProps {
  children: React.ReactNode;
}

export function AgeAppropriateWrapper({ children }: AgeAppropriateWrapperProps) {
  const { profile } = useProfile();
  
  if (!profile) return <>{children}</>;

  const isJunior = profile.ageGroup === 'child';
  const mode = profile.preferredMode || 'standard';
  
  // Apply global scaling based on age
  // Junior: 20% larger fonts, larger tap targets
  // Senior: Standard proportions
  const scalingStyles = isJunior ? {
    '--base-font-scale': '1.2',
    '--base-spacing-scale': '1.1',
    '--radius-scale': '1.5',
    fontSize: '1.1rem',
  } : {
    '--base-font-scale': '1.0',
    '--base-spacing-scale': '1.0',
    '--radius-scale': '1.0',
  };

  const modeClasses = [
    mode === 'dyslexia' ? 'dyslexia-mode' : '',
    mode === 'adhd' ? 'adhd-focus-mode' : '',
    isJunior ? 'junior-mode' : 'senior-mode'
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={`min-h-screen transition-all duration-700 ${modeClasses}`}
      style={scalingStyles as React.CSSProperties}
    >
      {isJunior && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] animate-bounce">
          <span className="bg-yellow-400 text-black px-4 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-white">
            🐣 JUNIOR MODE ACTIVE
          </span>
        </div>
      )}
      {children}
    </div>
  );
}
