'use client';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import { getRecentProfileVisitors } from '@/lib/supabase/queries/notifications';

type Visitor = { id: string; handle: string; displayName: string; avatarUrl?: string | null };

// Liste intermédiaire de la notification groupée de visiteurs — chaque nom
// est lui-même cliquable vers le profil correspondant
// (rapport_notifications.md §1.C). Pointe vers /profile/[handle], pas encore
// construit (cf. rapport d'activité).
export default function VisitorsListPage() {
  const ready = useAuthGuard();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [visitors, setVisitors] = useState<Visitor[]>([]);

  useEffect(() => {
    if (!ready) return;
    const count = Number(searchParams.get('count') ?? 20);
    getRecentProfileVisitors(count).then(setVisitors);
  }, [ready, searchParams]);

  if (!ready) return <LoadingScreen />;

  return (
    <div>
      <h1 className="p-4 text-lg font-semibold">Visiteurs de votre profil</h1>
      {visitors.length === 0 && <p className="p-4 text-center text-sm text-ink-muted">Aucun visiteur pour l'instant.</p>}
      {visitors.map((v) => (
        <button
          key={v.id}
          onClick={() => router.push(`/profile/${v.handle}`)}
          className="flex w-full items-center gap-3 border-b p-3 text-left"
        >
          <img src={v.avatarUrl ?? '/default-avatar.png'} className="h-10 w-10 rounded-full object-cover" alt="" />
          <div>
            <p className="text-sm font-medium">{v.displayName}</p>
            <p className="text-xs text-ink-muted">@{v.handle}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
