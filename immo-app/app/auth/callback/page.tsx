'use client';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserProfile } from '@/lib/supabase/queries/auth';

// Route de redirection imposée par le flux OAuth Google. Le client Supabase
// échange automatiquement le code reçu dans l'URL contre une session (PKCE) ;
// on redirige ensuite selon que l'onboarding (handle + WhatsApp) a déjà été
// complété. Si Google ou Supabase renvoie une erreur (accès refusé, URL de
// redirection non autorisée...), elle est affichée au lieu d'une page blanche.
export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const oauthError = params.get('error_description') ?? params.get('error');
      if (oauthError) {
        setError(oauthError);
        return;
      }

      const profile = await getCurrentUserProfile();
      if (!profile) {
        setError('Impossible de récupérer votre session. Veuillez réessayer.');
        return;
      }
      router.push(profile.onboarding_completed ? '/' : '/onboarding');
    })();
  }, [router]);

  if (error) {
    return (
      <div className="space-y-3 p-4 text-center">
        <h1 className="text-xl font-semibold">Connexion échouée</h1>
        <p className="text-sm text-red-500">{error}</p>
        <a href="/auth/login" className="inline-block text-sm text-brand-600">
          Retour à la connexion
        </a>
      </div>
    );
  }

  return <LoadingScreen label="Connexion en cours" />;
}
