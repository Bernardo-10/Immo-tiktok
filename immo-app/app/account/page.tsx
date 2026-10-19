'use client';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import { getMyProfile, getMyListings, getMyFavorites } from '@/lib/supabase/queries/profile';
import { signOut } from '@/lib/supabase/queries/auth';
import { ProfileHeader } from '@/components/account/ProfileHeader';
import { ListingGrid } from '@/components/account/ListingGrid';
import type { ProfileSummary, MyListingSummary } from '@/types/profile';

export default function AccountPage() {
  const ready = useAuthGuard();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [listings, setListings] = useState<MyListingSummary[]>([]);
  const [favorites, setFavorites] = useState<MyListingSummary[]>([]);
  const [tab, setTab] = useState<'listings' | 'favorites'>('listings');

  useEffect(() => {
    if (!ready) return;
    getMyProfile().then(setProfile);
    getMyListings().then(setListings);
    getMyFavorites().then(setFavorites);
  }, [ready]);

  if (!ready || !profile) return <LoadingScreen />;

  return (
    <div className="pb-8">
      <ProfileHeader profile={profile} onEdit={() => router.push('/account/edit')} />

      {/* Deux onglets, façon TikTok : Mes annonces (grille) et Mes favoris,
          ce dernier strictement privé (rapport_proprietes_utilisateur.md). */}
      <div className="flex border-y">
        <button
          onClick={() => setTab('listings')}
          className={`flex-1 py-2 text-sm font-medium ${tab === 'listings' ? 'border-b-2 border-brand-600 text-brand-600' : 'text-ink-muted'}`}
        >
          Mes annonces
        </button>
        <button
          onClick={() => setTab('favorites')}
          className={`flex-1 py-2 text-sm font-medium ${tab === 'favorites' ? 'border-b-2 border-brand-600 text-brand-600' : 'text-ink-muted'}`}
        >
          Mes favoris
        </button>
      </div>

      {tab === 'listings' ? (
        <ListingGrid listings={listings} emptyLabel="Vous n'avez pas encore publié d'annonce." />
      ) : (
        <ListingGrid listings={favorites} emptyLabel="Vous n'avez pas encore enregistré d'annonce." />
      )}

      <div className="p-4">
        <button
          onClick={async () => {
            await signOut();
            router.push('/');
          }}
          className="w-full rounded-lg border border-line py-3 text-sm font-medium text-gray-600"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
