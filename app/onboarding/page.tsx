'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PreferencePicker } from '@/components/onboarding/PreferencePicker';
import { useProfile } from '@/lib/profile-context';
import { StudentProfile } from '@/lib/types';

export default function OnboardingPage() {
  const router = useRouter();
  const { setProfile, saving, error } = useProfile();
  const [done, setDone] = useState(false);

  const handleComplete = async (profile: StudentProfile) => {
    setDone(true);
    await setProfile(profile);
    router.push('/learn');
  };

  return (
    <main className="min-h-screen">
      {/* Saving overlay */}
      {(saving || done) && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
          style={{ background: 'rgba(10,10,30,0.85)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl animate-bounce"
            style={{ background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)' }}
          >
            🧠
          </div>
          <p className="text-[#f0f0ff] font-bold text-xl">Saving your profile…</p>
          <p className="text-[#8888b0] text-sm">Storing in PostgreSQL database</p>

          {/* Non-fatal DB error — saved locally */}
          {error && (
            <div
              className="mt-2 px-4 py-2 rounded-xl text-xs text-center max-w-xs"
              style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}
            >
              ⚠️ {error}
            </div>
          )}
        </div>
      )}

      <PreferencePicker onComplete={handleComplete} />
    </main>
  );
}
