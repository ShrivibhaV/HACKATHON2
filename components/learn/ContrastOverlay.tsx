'use client';

import React from 'react';
import { useProfile } from '@/lib/profile-context';

export function ContrastOverlay() {
  const { profile } = useProfile();
  
  // Only show high-contrast overlay in dyslexia mode
  if (profile?.preferredMode !== 'dyslexia') return null;

  return <div className="high-contrast-overlay" aria-hidden="true" />;
}
