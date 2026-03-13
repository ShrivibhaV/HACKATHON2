import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface WeightedProfile {
  userId: string;
  dyslexiaWeight: number; // 0-100
  adhdWeight: number; // 0-100
  standardWeight: number; // 0-100 (auto-calculated)
  preferredMode: 'standard' | 'dyslexia' | 'adhd' | 'hybrid';
  primaryMode: 'dyslexia' | 'adhd' | null;
  fontFamily: string;
  textColor: string;
  backgroundColor: string;
  wordSpacing: number;
  lineHeight: number;
  contrastMode: 'normal' | 'high' | 'sepia';
  animationsEnabled: boolean;
  completedOnboarding: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProfileContextType {
  profile: WeightedProfile | null;
  loading: boolean;
  updateProfile: (updates: Partial<WeightedProfile>) => Promise<void>;
  setWeights: (dyslexia: number, adhd: number) => Promise<void>;
  resetProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<WeightedProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // Check for existing profile in localStorage first (for faster load)
      const cached = localStorage.getItem('neurolearn_profile');
      if (cached) {
        setProfile(JSON.parse(cached));
      }

      // Then sync with Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) {
          const profileData = {
            userId: data.user_id,
            dyslexiaWeight: data.dyslexia_weight || 0,
            adhdWeight: data.adhd_weight || 0,
            standardWeight: 100 - (data.dyslexia_weight || 0) - (data.adhd_weight || 0),
            preferredMode: data.preferred_mode || 'standard',
            primaryMode: data.primary_mode,
            fontFamily: data.font_family || 'font-sans',
            textColor: data.text_color || 'text-foreground',
            backgroundColor: data.background_color || 'bg-background',
            wordSpacing: data.word_spacing || 0.15,
            lineHeight: data.line_height || 1.6,
            contrastMode: data.contrast_mode || 'normal',
            animationsEnabled: data.animations_enabled !== false,
            completedOnboarding: data.completed_onboarding || false,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
          setProfile(profileData);
          localStorage.setItem('neurolearn_profile', JSON.stringify(profileData));
        }
      }
    } catch (error) {
      console.error('[v0] Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<WeightedProfile>) => {
    if (!profile) return;

    const updatedProfile = { ...profile, ...updates };
    setProfile(updatedProfile);
    localStorage.setItem('neurolearn_profile', JSON.stringify(updatedProfile));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('student_profiles')
          .update({
            dyslexia_weight: updatedProfile.dyslexiaWeight,
            adhd_weight: updatedProfile.adhdWeight,
            preferred_mode: updatedProfile.preferredMode,
            primary_mode: updatedProfile.primaryMode,
            font_family: updatedProfile.fontFamily,
            text_color: updatedProfile.textColor,
            background_color: updatedProfile.backgroundColor,
            word_spacing: updatedProfile.wordSpacing,
            line_height: updatedProfile.lineHeight,
            contrast_mode: updatedProfile.contrastMode,
            animations_enabled: updatedProfile.animationsEnabled,
            completed_onboarding: updatedProfile.completedOnboarding,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('[v0] Error updating profile:', error);
    }
  };

  const setWeights = async (dyslexia: number, adhd: number) => {
    const standard = Math.max(0, 100 - dyslexia - adhd);
    const primaryMode = dyslexia > adhd ? 'dyslexia' : adhd > dyslexia ? 'adhd' : null;
    const preferredMode = dyslexia === 0 && adhd === 0 ? 'standard' : 'hybrid';

    await updateProfile({
      dyslexiaWeight: dyslexia,
      adhdWeight: adhd,
      standardWeight: standard,
      primaryMode,
      preferredMode,
    });
  };

  const resetProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const newProfile: WeightedProfile = {
        userId: user.id,
        dyslexiaWeight: 0,
        adhdWeight: 0,
        standardWeight: 100,
        preferredMode: 'standard',
        primaryMode: null,
        fontFamily: 'font-sans',
        textColor: 'text-foreground',
        backgroundColor: 'bg-background',
        wordSpacing: 0.15,
        lineHeight: 1.6,
        contrastMode: 'normal',
        animationsEnabled: true,
        completedOnboarding: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProfile(newProfile);
      localStorage.setItem('neurolearn_profile', JSON.stringify(newProfile));

      await supabase
        .from('student_profiles')
        .delete()
        .eq('user_id', user.id);
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, updateProfile, setWeights, resetProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
};
