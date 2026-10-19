'use client';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import { getMyProfile } from '@/lib/supabase/queries/profile';
import { EditProfileForm } from '@/components/account/EditProfileForm';
import type { ProfileSummary } from '@/types/profile';

export default function EditProfilePage() {
  const ready = useAuthGuard();
  const [profile, setProfile] = useState<ProfileSummary | null>(null);

  useEffect(() => {
    if (ready) getMyProfile().then(setProfile);
  }, [ready]);

  if (!ready || !profile) return <LoadingScreen />;

  return <EditProfileForm profile={profile} />;
}
