'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudentProfile, WeightedProfile, LearningMode } from './types';

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * Profile Context
 *
 * Storage strategy (in order of priority):
 *  1. PostgreSQL via /api/students  — primary, persistent across devices
 *  2. localStorage ('neurolearn_profile') — cache + offline fallback
 *
 * On mount:  read localStorage (fast) → hydrate UI → then refetch from DB.
 * On save:   write to DB via API → update localStorage cache.
 * On logout: clear both.
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface ProfileContextType {
  profile: StudentProfile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  setProfile: (profile: StudentProfile) => Promise<void>;
  updateProfile: (updates: Partial<StudentProfile>) => Promise<void>;
  updateWeighting: (weights: WeightedProfile) => Promise<void>;
  getDominantMode: () => LearningMode;
  logout: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// ─── helpers ─────────────────────────────────────────────────────────────────

const LS_KEY = 'neurolearn_profile';

function readCache(): StudentProfile | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(p: StudentProfile) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(p));
  } catch {
    /* storage full – ignore */
  }
}

function clearCache() {
  try {
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem('neurolearn_progress');
  } catch {
    /* ignore */
  }
}

/** Save profile to PostgreSQL via our server-side API route */
async function saveToDb(profile: StudentProfile): Promise<void> {
  const res = await fetch('/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error ?? `HTTP ${res.status}`);
  }
}

/** Fetch profile from PostgreSQL by UUID */
async function fetchFromDb(id: string): Promise<StudentProfile | null> {
  const res = await fetch(`/api/students?id=${encodeURIComponent(id)}`);
  if (!res.ok) return null;
  const json = await res.json();
  return json.data ?? null;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<StudentProfile | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  // ── on mount: hydrate from cache, then sync from DB ──────────────────────
  useEffect(() => {
    const loadProfile = async () => {
      // Step 1 — show cached profile immediately (fast, no flicker)
      const cached = readCache();
      if (cached) {
        setProfileState(cached);
        setLoading(false);

        // Step 2 — silently refresh from DB in the background
        try {
          const remote = await fetchFromDb(cached.id);
          if (remote) {
            setProfileState(remote);
            writeCache(remote);
          }
        } catch (err) {
          console.warn('[ProfileContext] DB fetch failed, using cache:', err);
        }
      } else {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // ── save: DB first, then cache ────────────────────────────────────────────
  const handleSetProfile = async (newProfile: StudentProfile) => {
    setSaving(true);
    setError(null);
    setProfileState(newProfile);   // optimistic UI update
    writeCache(newProfile);        // write cache immediately

    try {
      await saveToDb(newProfile);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('[ProfileContext] Save to DB failed:', msg);
      // Keep the profile in state + cache; show a non-blocking warning
      setError(`Profile saved locally. DB sync failed: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // ── update profile ───────────────────────────────────────────────────────
  const handleUpdateProfile = async (updates: Partial<StudentProfile>) => {
    if (!profile) return;
    const updated: StudentProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date(),
    };
    await handleSetProfile(updated);
  };

  // ── update weighting ─────────────────────────────────────────────────────
  const handleUpdateWeighting = async (weights: WeightedProfile) => {
    if (!profile) return;
    const updated: StudentProfile = {
      ...profile,
      weightedProfile: weights,
      updatedAt: new Date(),
    };
    await handleSetProfile(updated);
  };

  // ── dominant mode helper ─────────────────────────────────────────────────
  const getDominantMode = (): LearningMode => {
    if (!profile) return 'standard';
    const { dyslexia, adhd, standard } = profile.weightedProfile;
    if (dyslexia > 40 && adhd > 40) return 'mixed';
    if (dyslexia > adhd && dyslexia > standard) return 'dyslexia';
    if (adhd > standard) return 'adhd';
    return 'standard';
  };

  // ── logout ───────────────────────────────────────────────────────────────
  const logout = () => {
    clearCache();
    setProfileState(null);
    window.location.href = '/';
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        saving,
        error,
        setProfile: handleSetProfile,
        updateProfile: handleUpdateProfile,
        updateWeighting: handleUpdateWeighting,
        getDominantMode,
        logout,
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
