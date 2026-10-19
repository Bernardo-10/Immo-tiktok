import type { ProfileSummary } from '@/types/profile';

// Statistiques publiques uniquement (annonces, vues, likes) — le solde du
// porte-monnaie, l'abonnement et le quota restent dans l'espace "Mes
// paiements", strictement privé (rapport_proprietes_utilisateur.md §5).
export function ProfileHeader({ profile, onEdit }: { profile: ProfileSummary; onEdit?: () => void }) {
  return (
    <div className="p-4 text-center">
      <img src={profile.avatarUrl ?? '/default-avatar.png'} className="mx-auto h-20 w-20 rounded-full object-cover" alt="" />

      <p className="mt-2 flex items-center justify-center gap-2 text-lg font-semibold">
        {profile.displayName}
        {profile.isPro && (
          <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] uppercase text-brand-700">Pro</span>
        )}
      </p>
      <p className="text-sm text-ink-muted">
        @{profile.handle}
        {profile.agencyName ? ` · ${profile.agencyName}` : ''}
      </p>

      {profile.bio && <p className="mt-2 text-sm text-gray-700">{profile.bio}</p>}

      <div className="mt-4 flex justify-center gap-6 text-sm">
        <div>
          <p className="font-semibold">{profile.listingsCount}</p>
          <p className="text-ink-muted">Annonces</p>
        </div>
        <div>
          <p className="font-semibold">{profile.totalViews}</p>
          <p className="text-ink-muted">Vues</p>
        </div>
        <div>
          <p className="font-semibold">{profile.totalLikes}</p>
          <p className="text-ink-muted">Likes</p>
        </div>
      </div>

      {onEdit && (
        <button onClick={onEdit} className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium">
          Modifier le profil
        </button>
      )}
    </div>
  );
}
