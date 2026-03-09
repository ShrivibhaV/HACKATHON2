'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudentProfile, WeightedProfile, LearningMode } from './types';

interface ProfileContextType {
  profile: StudentProfile | null;
  loading: boolean;
  setProfile: (profile: StudentProfile) => void;
  updateWeighting: (weights: WeightedProfile) => void;
  getDominantMode: () => LearningMode;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load profile from localStorage on mount
    const stored = localStorage.getItem('neurolearn_profile');
    if (stored) {
      try {
        setProfile(JSON.parse(stored));
      } catch (error) {
        console.error('[v0] Failed to parse stored profile:', error);
      }
    }
    setLoading(false);
  }, []);

  const handleSetProfile = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    localStorage.setItem('neurolearn_profile', JSON.stringify(newProfile));
  };

  const handleUpdateWeighting = (weights: WeightedProfile) => {
    if (profile) {
      const updated = {
        ...profile,
        weightedProfile: weights,
        updatedAt: new Date(),
      };
      handleSetProfile(updated);
    }
  };

  const getDominantMode = (): LearningMode => {
    if (!profile) return 'standard';
    const weights = profile.weightedProfile;
    if (weights.dyslexia > weights.adhd && weights.dyslexia > weights.standard) {
      return 'dyslexia';
    } else if (weights.adhd > weights.standard) {
      return 'adhd';
    }
    return 'standard';
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        setProfile: handleSetProfile,
        updateWeighting: handleUpdateWeighting,
        getDominantMode,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
}
