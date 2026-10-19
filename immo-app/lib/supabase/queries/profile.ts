import { createClient } from '@/lib/supabase/client';
import type { ProfileSummary, MyListingSummary } from '@/types/profile';

export async function getMyProfile(): Promise<ProfileSummary | null> {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, handle, display_name, avatar_url, bio, is_pro, agency_name, listings_count, total_views, total_likes, created_at')
    .eq('id', userId)
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

const MY_LISTING_SELECT = `
  id, title, price_amount, price_period, status, views_count, likes_count,
  listing_photos ( url, position )
`;

export function mapToMyListingSummary(row: any): MyListingSummary {
  const cover = (row.listing_photos ?? []).sort((a: any, b: any) => a.position - b.position)[0];
  return {
    id: row.id,
    title: row.title,
    coverPhoto: cover?.url,
    priceAmount: row.price_amount,
    pricePeriod: row.price_period,
    status: row.status,
    viewsCount: row.views_count,
    likesCount: row.likes_count,
  };
}

// Mes annonces : toutes, quel que soit le statut (RLS listings_owner_read_all) —
// contrairement au feed/à la recherche qui ne montrent que les actives.
export async function getMyListings(): Promise<MyListingSummary[]> {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return [];

  const { data, error } = await supabase
    .from('listings')
    .select(MY_LISTING_SELECT)
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data ?? []).map(mapToMyListingSummary);
}

// Mes favoris : privé par défaut, garanti par le RLS déjà en place sur
// listing_favorites (chacun ne lit que ses propres lignes) — rien à ajouter
// côté sécurité pour cet écran.
export async function getMyFavorites(): Promise<MyListingSummary[]> {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return [];

  const { data, error } = await supabase
    .from('listing_favorites')
    .select(`listing:listings ( ${MY_LISTING_SELECT} )`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data ?? [])
    .map((row: any) => row.listing)
    .filter(Boolean)
    .map(mapToMyListingSummary);
}

export async function updateMyProfile(patch: { displayName?: string; bio?: string; avatarUrl?: string }) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error('Utilisateur non authentifié');

  const dbPatch: Record<string, any> = {};
  if (patch.displayName !== undefined) dbPatch.display_name = patch.displayName;
  if (patch.bio !== undefined) dbPatch.bio = patch.bio;
  if (patch.avatarUrl !== undefined) dbPatch.avatar_url = patch.avatarUrl;

  const { error } = await supabase.from('profiles').update(dbPatch).eq('id', userId);
  if (error) throw error;
}

// Bucket Storage séparé de celui des photos d'annonce (listing-photos) — à
// créer côté back-office Supabase (lecture publique, écriture par le
// propriétaire uniquement, cohérent avec le reste du projet).
export async function uploadAvatar(file: File): Promise<string> {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error('Utilisateur non authentifié');

  const path = `${userId}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
  if (error) throw error;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}
