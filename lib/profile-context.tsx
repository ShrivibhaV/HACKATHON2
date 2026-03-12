'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudentProfile, WeightedProfile, LearningMode } from './types';
import { supabase } from './supabase';

interface ProfileContextType {
  profile: StudentProfile | null;
  loading: boolean;
  setProfile: (profile: StudentProfile) => void;
  updateWeighting: (weights: WeightedProfile) => void;
  getDominantMode: () => LearningMode;
  syncToCloud: (profile: StudentProfile) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      // 1. Check localStorage first (fast)
      const stored = localStorage.getItem('neurolearn_profile');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setProfile(parsed);
          
          // 2. Try to sync from cloud if we have an ID
          if (parsed.id) {
            const { data, error } = await supabase
              .from('student_profiles')
              .select('*')
              .eq('id', parsed.id)
              .single();
            
            if (data && !error) {
              setProfile(data);
              localStorage.setItem('neurolearn_profile', JSON.stringify(data));
            }
          }
        } catch (error) {
          console.error('Failed to parse profile:', error);
        }
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const syncToCloud = async (p: StudentProfile) => {
    try {
      const { error } = await supabase
        .from('student_profiles')
        .upsert({
          id: p.id,
          user_id: p.userId || null, // Handle null if no auth yet
          age_group: p.ageGroup,
          grade_level: p.gradeLevel,
          diagnosis_type: p.diagnosisType,
          medication_status: p.medicationStatus,
          comfort_level: p.comfortLevel,
          preferred_background: p.colorPreference,
          font_scale: p.fontScale,
          word_spacing: p.wordSpacing,
          updated_at: new Date().toISOString()
        });
      if (error) console.warn('Supabase sync warning:', error.message);
    } catch (err) {
      console.error('Cloud sync failed:', err);
    }
  };

  const handleSetProfile = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    localStorage.setItem('neurolearn_profile', JSON.stringify(newProfile));
    syncToCloud(newProfile);
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
    
    // If weights for dyslexia and adhd are both high, return mixed
    if (weights.dyslexia > 40 && weights.adhd > 40) {
      return 'mixed';
    }

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
        syncToCloud,
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
