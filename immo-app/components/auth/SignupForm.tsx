'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUpWithEmail } from '@/lib/supabase/queries/auth';
import { GoogleButton } from './GoogleButton';

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // Le trigger SQL handle_new_user() crée profiles/profile_private
      // automatiquement dès l'insertion dans auth.users.
      const data = await signUpWithEmail(email, password);
      // Si la confirmation d'email est activée côté Supabase, aucune session
      // n'est créée à ce stade — rediriger vers /onboarding échouerait
      // ("Utilisateur non authentifié") tant que l'email n'est pas confirmé.
      if (data.session) {
        router.push('/onboarding');
      } else {
        setNeedsConfirmation(true);
      }
    } catch (e: any) {
      setError(e.message ?? 'Inscription impossible.');
    } finally {
      setLoading(false);
    }
  };

  if (needsConfirmation) {
    return (
      <div className="space-y-3 p-4 text-center">
        <h1 className="text-xl font-semibold">Vérifiez votre boîte mail</h1>
        <p className="text-sm text-ink-muted">
          Un lien de confirmation a été envoyé à <span className="font-medium">{email}</span>. Cliquez dessus pour
          activer votre compte, puis connectez-vous.
        </p>
        <a href="/auth/login" className="inline-block text-sm text-brand-600">
          Retour à la connexion
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Créer un compte</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded border px-3 py-2 text-sm"
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded border px-3 py-2 text-sm"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full rounded-lg bg-brand-600 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? 'Création...' : "S'inscrire"}
      </button>

      <div className="flex items-center gap-2 text-xs text-ink-muted">
        <div className="h-px flex-1 bg-gray-200" /> ou <div className="h-px flex-1 bg-gray-200" />
      </div>

      <GoogleButton />

      <p className="text-center text-sm text-ink-muted">
        Déjà un compte ?{' '}
        <a href="/auth/login" className="text-brand-600">
          Se connecter
        </a>
      </p>
    </div>
  );
}
