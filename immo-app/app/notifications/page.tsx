'use client';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import { getNotifications } from '@/lib/supabase/queries/notifications';
import { NotificationTabs } from '@/components/notifications/NotificationTabs';
import { NotificationRow } from '@/components/notifications/NotificationRow';
import type { NotificationCategory, NotificationItem } from '@/types/notification';

// Onglet strictement privé (RLS notifications_recipient_only) — protégé par
// useAuthGuard comme Publication/Compte/Paiements.
export default function NotificationsPage() {
  const ready = useAuthGuard();
  const [tab, setTab] = useState<NotificationCategory | 'all'>('all');
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!ready) return;
    getNotifications(tab === 'all' ? undefined : tab).then(setItems);
  }, [ready, tab]);

  if (!ready) return <LoadingScreen />;

  return (
    <div>
      <h1 className="p-4 text-xl font-semibold">Notifications</h1>
      <NotificationTabs active={tab} onChange={setTab} />

      {items.length === 0 ? (
        <p className="p-4 text-center text-sm text-ink-muted">Rien à afficher pour l'instant.</p>
      ) : (
        items.map((item) => <NotificationRow key={item.id} item={item} />)
      )}
    </div>
  );
}
