'use client';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useSessionGuard } from '@/lib/hooks/useSessionGuard';
import { OnboardingForm } from '@/components/auth/OnboardingForm';

export default function OnboardingPage() {
  const ready = useSessionGuard();
  if (!ready) return <LoadingScreen />;
  return <OnboardingForm />;
}
