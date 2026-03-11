'use client';

import { useRouter } from 'next/navigation';
import { PreferencePicker } from '@/components/onboarding/PreferencePicker';
import { useProfile } from '@/lib/profile-context';
import { StudentProfile } from '@/lib/types';

export default function OnboardingPage() {
  const router = useRouter();
  const { setProfile } = useProfile();

  const handleComplete = (profile: StudentProfile) => {
    setProfile(profile);
    router.push('/learn');
  };

  return (
    <main className="min-h-screen">
      <PreferencePicker onComplete={handleComplete} />
    </main>
  );
}
