'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateMyProfile, uploadAvatar } from '@/lib/supabase/queries/profile';
import type { ProfileSummary } from '@/types/profile';

// Le handle n'est volontairement pas modifiable depuis cet écran pour
// l'instant (point ouvert signalé dans le rapport d'activité authentification) —
// changer un identifiant après coup casserait les liens déjà partagés
// (@handle utilisé dans les mentions de propriétaire, notifications...).
export function EditProfileForm({ profile }: { profile: ProfileSummary }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      let avatarUrl: string | undefined;
      if (avatarFile) avatarUrl = await uploadAvatar(avatarFile);
      await updateMyProfile({ displayName, bio, ...(avatarUrl ? { avatarUrl } : {}) });
      router.push('/account');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Modifier le profil</h1>

      <div className="flex flex-col items-center gap-2">
        <img
          src={avatarFile ? URL.createObjectURL(avatarFile) : profile.avatarUrl ?? '/default-avatar.png'}
          className="h-20 w-20 rounded-full object-cover"
          alt=""
        />
        <label className="cursor-pointer text-sm text-brand-600">
          Changer la photo
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} />
        </label>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Nom affiché</label>
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full rounded border px-3 py-2 text-sm" />
      </div>

      <p className="text-xs text-ink-muted">
        L'identifiant (@{profile.handle}) n'est pas modifiable depuis cet écran pour l'instant.
      </p>

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full rounded-lg bg-brand-600 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {saving ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </div>
  );
}
