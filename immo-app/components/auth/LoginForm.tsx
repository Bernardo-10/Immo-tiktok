'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmail } from '@/lib/supabase/queries/auth';
import { GoogleButton } from './GoogleButton';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
      router.push('/');
    } catch (e: any) {
      setError(e.message ?? 'Connexion impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Connexion</h1>

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
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>

      <div className="flex items-center gap-2 text-xs text-ink-muted">
        <div className="h-px flex-1 bg-gray-200" /> ou <div className="h-px flex-1 bg-gray-200" />
      </div>

      <GoogleButton />

      <p className="text-center text-sm text-ink-muted">
        Pas encore de compte ?{' '}
        <a href="/auth/signup" className="text-brand-600">
          S'inscrire
        </a>
      </p>
    </div>
  );
}
