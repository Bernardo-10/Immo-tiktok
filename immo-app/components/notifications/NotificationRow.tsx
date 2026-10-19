'use client';
import { useRouter } from 'next/navigation';
import { markAsRead } from '@/lib/supabase/queries/notifications';
import type { NotificationItem } from '@/types/notification';

// Deux zones cliquables distinctes quand un acteur ET une annonce sont
// concernés (like, enregistrement) : avatar -> profil de l'acteur, miniature
// -> fiche de l'annonce (rapport_notifications.md §2). Les autres catégories
// n'ont qu'une seule destination, sur toute la ligne.
//
// ⚠️ /profile/[handle] n'existe pas encore dans ce projet — seul /account
// (son propre compte, avec des onglets privés) a été construit jusqu'ici.
// Voir le rapport d'activité : consulter le profil PUBLIC d'un AUTRE
// utilisateur est un écran distinct, encore à faire.
export function NotificationRow({ item }: { item: NotificationItem }) {
  const router = useRouter();

  const goToActor = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.actor) router.push(`/profile/${item.actor.handle}`);
  };

  const goToListing = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (item.listing) router.push(`/listing/${item.listing.id}`);
  };

  const handleRowClick = async () => {
    await markAsRead(item.id);

    if (item.category === 'visitor') {
      router.push(`/notifications/visitors?count=${item.groupedVisitCount ?? 0}`);
      return;
    }
    if (item.category === 'system') {
      router.push('/account/payments');
      return;
    }
    if ((item.category === 'favorite' || item.category === 'tier') && item.listing) {
      goToListing();
      return;
    }
    // Like / save sans clic sur une zone précise : mène à l'annonce par défaut.
    if (!item.actor && item.listing) goToListing();
  };

  return (
    <div
      onClick={handleRowClick}
      className={`flex cursor-pointer items-center gap-3 border-b p-3 ${item.isRead ? '' : 'bg-brand-50/50'}`}
    >
      {item.actor && (
        <button onClick={goToActor} className="shrink-0">
          <img src={item.actor.avatarUrl ?? '/default-avatar.png'} className="h-10 w-10 rounded-full object-cover" alt="" />
        </button>
      )}

      <p className="flex-1 text-sm">{item.message}</p>

      {item.listing && (
        <button onClick={goToListing} className="shrink-0">
          <img src={item.listing.coverPhoto} className="h-10 w-10 rounded object-cover" alt="" />
        </button>
      )}
    </div>
  );
}
