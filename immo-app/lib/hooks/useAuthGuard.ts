'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserProfile } from '@/lib/supabase/queries/auth';

// À utiliser sur les écrans nécessitant une session : Publication,
// Modification, Compte... Le feed, la recherche et la fiche détaillée
// restent volontairement accessibles sans connexion (décision actée : ne
// jamais bloquer la découverte du contenu).
export function useAuthGuard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const profile = await getCurrentUserProfile();
      if (!profile) {
        router.push('/auth/login');
        return;
      }
      if (!profile.onboarding_completed) {
        router.push('/onboarding');
        return;
      }
      setReady(true);
    })();
  }, [router]);

  return ready;
}
