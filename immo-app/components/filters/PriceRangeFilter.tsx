'use client';
import { HelpCircle } from 'lucide-react';
import type { ListingFilters } from '@/types/listing';

type PriceRangeFilterProps = {
  value: ListingFilters;
  onChange: (next: Partial<ListingFilters>) => void;
  showError: boolean;
};

// Échelle visuelle par défaut — valeur provisoire, à ajuster une fois les
// prix pratiqués localement connus (point ouvert dans rapport_filtres_feed.md).
const SCALE_MAX = 500000;

export function PriceRangeFilter({ value, onChange, showError }: PriceRangeFilterProps) {
  const min = value.priceMin ?? 0;
  const max = value.priceMax ?? SCALE_MAX;

  // La valeur qui vient d'être modifiée l'emporte, l'autre se réaligne dessus.
  const handleMinChange = (v: number) => onChange({ priceMin: v, priceMax: v > max ? v : max });
  const handleMaxChange = (v: number) => onChange({ priceMax: v, priceMin: v < min ? v : min });

  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">Prix</span>
        <div className="flex items-center gap-2">
          {(['day', 'month'] as const).map((period) => (
            <button
              key={period}
              onClick={() => onChange({ pricePeriod: period })}
              className={`rounded-full px-3 py-1 text-xs ${
                value.pricePeriod === period ? 'bg-brand-600 text-white' : 'border border-line bg-chip'
              }`}
            >
              {period === 'day' ? 'Jour' : 'Mois'}
            </button>
          ))}
          <HelpCircle size={16} className={showError ? 'text-red-500' : 'text-ink-muted'} />
        </div>
      </div>

      {showError && <p className="mb-2 text-xs text-red-500">Sélectionnez d'abord jour ou mois</p>}

      <div className="flex items-center gap-2">
        <input type="number" value={min} onChange={(e) => handleMinChange(Number(e.target.value))} className="w-24 rounded border px-2 py-1 text-sm" />
        <span className="text-xs text-ink-muted">FCFA</span>
        <span className="text-gray-300">—</span>
        <input type="number" value={max} onChange={(e) => handleMaxChange(Number(e.target.value))} className="w-24 rounded border px-2 py-1 text-sm" />
        <span className="text-xs text-ink-muted">FCFA</span>
      </div>

      {/* Le curseur visuel reste borné à SCALE_MAX même si l'utilisateur tape
          une valeur supérieure dans le cadran — la valeur réellement utilisée
          pour filtrer est toujours celle du champ, jamais celle de la barre. */}
      <input type="range" min={0} max={SCALE_MAX} value={Math.min(min, SCALE_MAX)} onChange={(e) => handleMinChange(Number(e.target.value))} className="mt-2 w-full" />
      <input type="range" min={0} max={SCALE_MAX} value={Math.min(max, SCALE_MAX)} onChange={(e) => handleMaxChange(Number(e.target.value))} className="w-full" />
    </div>
  );
}
