import { createClient } from '@/lib/supabase/client';
import type { NotificationCategory, NotificationItem } from '@/types/notification';

export async function getNotifications(category?: NotificationCategory): Promise<NotificationItem[]> {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return [];

  let query = supabase
    .from('notifications')
    .select(
      `
      id, category, message, is_read, grouped_visit_count, created_at,
      actor:profiles!notifications_actor_id_fkey ( id, handle, display_name, avatar_url ),
      listing:listings ( id, title, listing_photos ( url, position ) )
    `
    )
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false });

  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    category: row.category,
    message: row.message,
    isRead: row.is_read,
    groupedVisitCount: row.grouped_visit_count,
    createdAt: row.created_at,
    actor: row.actor
      ? { id: row.actor.id, handle: row.actor.handle, displayName: row.actor.display_name, avatarUrl: row.actor.avatar_url }
      : null,
    listing: row.listing
      ? {
          id: row.listing.id,
          title: row.listing.title,
          coverPhoto: (row.listing.listing_photos ?? []).sort((a: any, b: any) => a.position - b.position)[0]?.url,
        }
      : null,
  }));
}

export async function markAsRead(id: string) {
  const supabase = createClient();
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
}

// Approximation : la notification groupée ("100 personnes ont visité votre
// profil") ne référence pas individuellement chaque visite en base. On
// affiche les N visites les plus récentes du profil (N = grouped_visit_count)
// comme liste — à revoir si une association plus précise (table de jonction
// notification <-> visites) devient nécessaire.
export async function getRecentProfileVisitors(limit: number) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return [];

  const { data, error } = await supabase
    .from('profile_visits')
    .select('visited_at, visitor:profiles!profile_visits_visitor_id_fkey ( id, handle, display_name, avatar_url )')
    .eq('visited_id', userId)
    .order('visited_at', { ascending: false })
    .limit(limit);
  if (error) throw error;

  return (data ?? [])
    .map((row: any) => row.visitor)
    .filter(Boolean)
    .map((v: any) => ({ id: v.id, handle: v.handle, displayName: v.display_name, avatarUrl: v.avatar_url }));
}
