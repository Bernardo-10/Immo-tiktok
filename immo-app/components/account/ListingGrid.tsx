'use client';
import { useRouter } from 'next/navigation';
import type { MyListingSummary } from '@/types/profile';

const STATUS_LABEL: Record<string, string> = { active: 'Active', rented: 'Louée', expired: 'Expirée' };

// Grille réutilisée pour "Mes annonces" ET "Mes favoris" — même présentation,
// seule la source des données change (cf. app/account/page.tsx).
export function ListingGrid({ listings, emptyLabel }: { listings: MyListingSummary[]; emptyLabel: string }) {
  const router = useRouter();

  if (listings.length === 0) {
    return <p className="p-4 text-center text-sm text-ink-muted">{emptyLabel}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3">
      {listings.map((l) => (
        <button
          key={l.id}
          onClick={() => router.push(`/listing/${l.id}`)}
          className="relative aspect-square overflow-hidden rounded-lg text-left"
        >
          <img src={l.coverPhoto} alt="" className="h-full w-full object-cover" />
          {l.status !== 'active' && (
            <span className="absolute top-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
              {STATUS_LABEL[l.status]}
            </span>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-1.5 text-white">
            <p className="truncate text-xs font-medium">{l.title}</p>
            <p className="text-[11px]">
              {l.priceAmount.toLocaleString('fr-FR')} FCFA / {l.pricePeriod === 'day' ? 'jour' : 'mois'}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
