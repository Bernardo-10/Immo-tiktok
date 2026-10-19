'use client';
import type { ListingFilters, PropertyType } from '@/types/listing';

const OPTIONS: { value: PropertyType; label: string }[] = [
  { value: 'apartment', label: 'Appartement' },
  { value: 'studio', label: 'Studio' },
  { value: 'room', label: 'Chambre' },
];

export function PropertyTypeFilter({
  value,
  onChange,
}: {
  value: ListingFilters;
  onChange: (next: Partial<ListingFilters>) => void;
}) {
  return (
    <div className="mb-5">
      <span className="mb-2 block text-sm font-medium">Type de bien</span>
      <div className="flex gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange({ propertyType: value.propertyType === opt.value ? undefined : opt.value })}
            className={`rounded-full px-3 py-1 text-xs ${value.propertyType === opt.value ? 'bg-brand-600 text-white' : 'border border-line bg-chip'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <span className="mb-2 mt-4 block text-sm font-medium">Meublé</span>
      <div className="flex gap-2">
        <button
          onClick={() => onChange({ furnished: value.furnished === true ? undefined : true })}
          className={`rounded-full px-3 py-1 text-xs ${value.furnished === true ? 'bg-brand-600 text-white' : 'border border-line bg-chip'}`}
        >
          Meublé
        </button>
        <button
          onClick={() => onChange({ furnished: value.furnished === false ? undefined : false })}
          className={`rounded-full px-3 py-1 text-xs ${value.furnished === false ? 'bg-brand-600 text-white' : 'border border-line bg-chip'}`}
        >
          Non meublé
        </button>
      </div>
    </div>
  );
}
