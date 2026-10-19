'use client';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getProfileByHandle, getPublicListingsByOwner, recordProfileVisit } from '@/lib/supabase/queries/publicProfile';
import { ProfileHeader } from '@/components/account/ProfileHeader';
import { ListingGrid } from '@/components/account/ListingGrid';
import type { ProfileSummary, MyListingSummary } from '@/types/profile';

// Profil PUBLIC en lecture seule d'un autre utilisateur — distinct de
// /account (son propre compte, avec Mes favoris et Mes paiements, privés).
// Pas de bouton "Suivre" : le modèle Like/Enregistrer remplace le follow,
// décision déjà actée (rapport_notifications.md) — ancré sur le bien, pas
// sur le compte du bailleur.
export default function PublicProfilePage() {
  const { handle } = useParams<{ handle: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [listings, setListings] = useState<MyListingSummary[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await getProfileByHandle(handle);
      if (!p) {
        setNotFound(true);
        return;
      }

      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user?.id === p.id) {
        // Comme sur TikTok : ouvrir son propre lien de profil redirige vers
        // l'écran de compte (avec ses onglets privés), pas vers une vue
        // "visiteur" de soi-même.
        router.replace('/account');
        return;
      }

      setProfile(p);
      getPublicListingsByOwner(p.id).then(setListings);
      recordProfileVisit(p.id);
    })();
  }, [handle, router]);

  if (notFound) return <p className="p-4 text-center text-sm text-ink-muted">Ce profil n'existe pas.</p>;
  if (!profile) return <LoadingScreen />;

  return (
    <div className="pb-8">
      <ProfileHeader profile={profile} />

      <div className="border-t">
        <p className="p-3 text-sm font-semibold text-ink-muted">Annonces publiées</p>
        <ListingGrid listings={listings} emptyLabel="Aucune annonce publiée pour l'instant." />
      </div>
    </div>
  );
}
