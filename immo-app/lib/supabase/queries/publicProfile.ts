import { createClient } from '@/lib/supabase/client';
import { mapToMyListingSummary } from './profile';
import type { ProfileSummary, MyListingSummary } from '@/types/profile';

// Profil PUBLIC d'un autre utilisateur — distinct de getMyProfile() : aucune
// vérification auth.uid() ici, la lecture est publique (RLS profiles_public_read).
export async function getProfileByHandle(handle: string): Promise<ProfileSummary | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, handle, display_name, avatar_url, bio, is_pro, agency_name, listings_count, total_views, total_likes, created_at')
    .eq('handle', handle)
    .single();
  if (error || !data) return null;

  return {
    id: data.id,
    handle: data.handle,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    isPro: data.is_pro,
    agencyName: data.agency_name,
    listingsCount: data.listings_count,
    totalViews: data.total_views,
    totalLikes: data.total_likes,
    createdAt: data.created_at,
  };
}

// Contrairement à getMyListings() (toutes, quel que soit le statut), la vue
// publique ne montre que les annonces actives — même règle que le feed.
export async function getPublicListingsByOwner(ownerId: string): Promise<MyListingSummary[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('listings')
    .select('id, title, price_amount, price_period, status, views_count, likes_count, listing_photos ( url, position )')
    .eq('owner_id', ownerId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data ?? []).map(mapToMyListingSummary);
}

// Journalisation de la visite (rapport_base_donnees.md — profile_visits,
// alimente la notification groupée "X personnes ont visité votre profil").
// viewer_id nul si visiteur non authentifié (RLS profile_visits_insert_any
// autorise l'insertion libre).
export async function recordProfileVisit(visitedId: string) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  await supabase.from('profile_visits').insert({
    visited_id: visitedId,
    visitor_id: userData.user?.id ?? null,
  });
}
