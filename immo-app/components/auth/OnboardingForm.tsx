'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { completeOnboarding } from '@/lib/supabase/queries/auth';

// Écran obligatoire après la toute première connexion, quelle que soit la
// méthode (email/mot de passe ou Google) : choix d'un handle unique + numéro
// WhatsApp, ni l'un ni l'autre fournis automatiquement par les deux
// méthodes de connexion (rapport_proprietes_utilisateur.md §2-3).
export function OnboardingForm() {
  const router = useRouter();
  const [handle, setHandle] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      await completeOnboarding({ handle, whatsappNumber: whatsapp });
      router.push('/');
    } catch (e: any) {
      setError(e.code === '23505' ? 'Cet identifiant est déjà pris.' : e.message ?? 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Finalisez votre profil</h1>
      <p className="text-sm text-ink-muted">Ces informations sont nécessaires avant de continuer.</p>

      <div>
        <label className="mb-1 block text-sm font-medium">Identifiant (@handle)</label>
        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value.replace(/\s/g, '').toLowerCase())}
          placeholder="ex: bernardo_immo"
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Numéro WhatsApp</label>
        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="ex: +237 6XX XXX XXX"
          className="w-full rounded border px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-ink-muted">
          Jamais affiché publiquement — utilisé uniquement pour générer le bouton "Contacter" sur vos annonces.
        </p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={saving || !handle || !whatsapp}
        className="w-full rounded-lg bg-brand-600 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {saving ? 'Enregistrement...' : 'Continuer'}
      </button>
    </div>
  );
}
