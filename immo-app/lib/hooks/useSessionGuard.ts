'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserProfile } from '@/lib/supabase/queries/auth';

// Garde dédiée à /onboarding. On ne peut PAS y utiliser useAuthGuard : celui-ci
// renvoie vers /onboarding quand l'onboarding n'est pas terminé, ce qui
// provoquerait une boucle de redirection infinie.
//   - pas de session            -> /auth/login
//   - onboarding déjà complété  -> / (inutile de le refaire)
//   - sinon                     -> on affiche le formulaire
export function useSessionGuard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const profile = await getCurrentUserProfile();
      if (!profile) {
        router.push('/auth/login');
        return;
      }
      if (profile.onboarding_completed) {
        router.push('/');
        return;
      }
      setReady(true);
    })();
  }, [router]);

  return ready;
}
