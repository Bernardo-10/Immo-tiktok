'use client';
import type { ListingFieldValues } from '@/types/listing';

type ListingFieldsFormProps = {
  values: ListingFieldValues;
  onChange: (patch: Partial<ListingFieldValues>) => void;
};

// Champs communs à la création et à la modification d'une annonce, extraits
// dans un composant à part — décision actée : jamais deux formulaires qui
// finiraient par diverger (ListingForm pour l'édition, PublishWizard pour la
// création, s'appuient tous deux sur ce composant).
export function ListingFieldsForm({ values, onChange }: ListingFieldsFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Titre</label>
        <input
          value={values.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea
          value={values.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={4}
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Type de bien</label>
        <div className="flex gap-2">
          {(['apartment', 'studio', 'room'] as const).map((t) => (
            <button
              key={t}
              onClick={() => onChange({ propertyType: t })}
              className={`rounded-full px-3 py-1 text-xs ${values.propertyType === t ? 'bg-brand-600 text-white' : 'border border-line bg-chip'}`}
            >
              {t === 'apartment' ? 'Appartement' : t === 'studio' ? 'Studio' : 'Chambre'}
            </button>
          ))}
        </div>
      </div>

      {values.propertyType === 'studio' && (
        <div>
          <label className="mb-1 block text-sm font-medium">Nombre de pièces</label>
          <input
            type="number"
            value={values.roomCount ?? ''}
            onChange={(e) => onChange({ roomCount: Number(e.target.value) })}
            className="w-24 rounded border px-3 py-2 text-sm"
          />
        </div>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={values.furnished} onChange={(e) => onChange({ furnished: e.target.checked })} />
        Meublé
      </label>

      <div className="flex items-end gap-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Prix</label>
          <input
            type="number"
            value={values.priceAmount}
            onChange={(e) => onChange({ priceAmount: Number(e.target.value) })}
            className="w-32 rounded border px-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-1 pb-2">
          {(['day', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => onChange({ pricePeriod: p })}
              className={`rounded-full px-3 py-1 text-xs ${values.pricePeriod === p ? 'bg-brand-600 text-white' : 'border border-line bg-chip'}`}
            >
              {p === 'day' ? 'Jour' : 'Mois'}
            </button>
          ))}
        </div>
      </div>

      {values.pricePeriod === 'month' ? (
        <div>
          <label className="mb-1 block text-sm font-medium">Avance demandée (mois)</label>
          <input
            type="number"
            value={values.advanceMonths ?? ''}
            onChange={(e) => onChange({ advanceMonths: Number(e.target.value) })}
            className="w-24 rounded border px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-ink-muted">Caution = 1 mois de loyer, calculée automatiquement (non modifiable).</p>
        </div>
      ) : (
        <div>
          <label className="mb-1 block text-sm font-medium">Caution (montant fixe)</label>
          <input
            type="number"
            value={values.depositAmount}
            onChange={(e) => onChange({ depositAmount: Number(e.target.value) })}
            className="w-32 rounded border px-3 py-2 text-sm"
          />
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Superficie (m²)</label>
          <input
            type="number"
            value={values.surfaceArea ?? ''}
            onChange={(e) => onChange({ surfaceArea: Number(e.target.value) })}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Chambres</label>
          <input
            type="number"
            value={values.bedrooms ?? ''}
            onChange={(e) => onChange({ bedrooms: Number(e.target.value) })}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Salles de bain</label>
          <input
            type="number"
            value={values.bathrooms ?? ''}
            onChange={(e) => onChange({ bathrooms: Number(e.target.value) })}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Disponibilité</label>
        <div className="flex gap-2">
          {(['now', 'upcoming', 'scheduled'] as const).map((a) => (
            <button
              key={a}
              onClick={() => onChange({ availabilityStatus: a })}
              className={`rounded-full px-3 py-1 text-xs ${values.availabilityStatus === a ? 'bg-brand-600 text-white' : 'border border-line bg-chip'}`}
            >
              {a === 'now' ? 'Maintenant' : a === 'upcoming' ? 'À venir' : 'Date précise'}
            </button>
          ))}
        </div>
        {values.availabilityStatus === 'scheduled' && (
          <input
            type="date"
            value={values.availabilityDate ?? ''}
            onChange={(e) => onChange({ availabilityDate: e.target.value })}
            className="mt-2 rounded border px-3 py-2 text-sm"
          />
        )}
      </div>
    </div>
  );
}
