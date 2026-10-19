'use client';
import { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { useFilters } from '@/lib/hooks/useFilters';
import { PriceRangeFilter } from './PriceRangeFilter';
import { PropertyTypeFilter } from './PropertyTypeFilter';
import { LocationFilter } from './LocationFilter';
import { AvailabilityFilter } from './AvailabilityFilter';

type FilterPanelProps = {
  open: boolean;
  onClose: () => void;
};

// Bottom sheet plein écran sur mobile, sidebar fixe sur desktop — bascule
// gérée en CSS, un seul composant plutôt que deux implémentations séparées.
export function FilterPanel({ open, onClose }: FilterPanelProps) {
  const { filters, setFilters, resetFilters } = useFilters();
  const [draft, setDraft] = useState(filters);
  const [showPriceError, setShowPriceError] = useState(false);

  if (!open) return null;

  const handleApply = () => {
    const priceTouched = draft.priceMin !== undefined || draft.priceMax !== undefined;
    if (priceTouched && !draft.pricePeriod) {
      setShowPriceError(true);
      return;
    }
    setFilters(draft);
    onClose();
  };

  // Réintègre le bouton "Réinitialiser", absent en V2 (rapport de fusion §4.2).
  const handleReset = () => {
    resetFilters();
    setDraft({});
    setShowPriceError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:static md:block md:h-full md:w-80 md:border-l">
      <div className="w-full rounded-t-2xl bg-white p-4 md:h-full md:rounded-none">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filtrer</h2>
          <div className="flex items-center gap-3">
            <button onClick={handleReset} title="Réinitialiser">
              <RotateCcw size={18} />
            </button>
            <button onClick={onClose} className="md:hidden">
              <X size={20} />
            </button>
          </div>
        </div>

        <PriceRangeFilter
          value={draft}
          onChange={(next) => { setDraft({ ...draft, ...next }); setShowPriceError(false); }}
          showError={showPriceError}
        />
        <PropertyTypeFilter value={draft} onChange={(next) => setDraft({ ...draft, ...next })} />
        <LocationFilter value={draft} onChange={(next) => setDraft({ ...draft, ...next })} />
        <AvailabilityFilter value={draft} onChange={(next) => setDraft({ ...draft, ...next })} />

        <button onClick={handleApply} className="mt-6 w-full rounded-lg bg-brand-600 py-3 font-medium text-white">
          Appliquer
        </button>
      </div>
    </div>
  );
}
