'use client';
import type { AvailabilityStatus, ListingFilters } from '@/types/listing';

const OPTIONS: { value: AvailabilityStatus; label: string }[] = [
  { value: 'now', label: 'Maintenant' },
  { value: 'upcoming', label: 'À venir' },
  { value: 'scheduled', label: 'Date précise' },
];

export function AvailabilityFilter({
  value,
  onChange,
}: {
  value: ListingFilters;
  onChange: (next: Partial<ListingFilters>) => void;
}) {
  return (
    <div className="mb-5">
      <span className="mb-2 block text-sm font-medium">Disponibilité</span>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange({ availability: value.availability === opt.value ? undefined : opt.value })}
            className={`rounded-full px-3 py-1 text-xs ${value.availability === opt.value ? 'bg-brand-600 text-white' : 'border border-line bg-chip'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {value.availability === 'scheduled' && (
        <input
          type="date"
          value={value.availabilityDate ?? ''}
          onChange={(e) => onChange({ availabilityDate: e.target.value })}
          className="mt-2 rounded border px-2 py-1 text-sm"
        />
      )}

      <label className="mt-3 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value.advanceRequested === true}
          onChange={(e) => onChange({ advanceRequested: e.target.checked ? true : undefined })}
        />
        Avance demandée
      </label>
    </div>
  );
}
