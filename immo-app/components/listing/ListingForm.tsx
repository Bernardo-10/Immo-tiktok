'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateListing } from '@/lib/supabase/queries/listings';
import { ListingFieldsForm } from './ListingFieldsForm';
import type { ListingFieldValues, ListingStatus } from '@/types/listing';

type ListingFormProps = {
  listingId: string;
  initialValues: ListingFieldValues & { status: ListingStatus };
};

// Formulaire de modification — s'appuie sur ListingFieldsForm (partagé avec
// la création) pour ne jamais diverger du formulaire de publication.
export function ListingForm({ listingId, initialValues }: ListingFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);

  const update = (patch: Partial<typeof values>) => setValues((v) => ({ ...v, ...patch }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // updated_at change, created_at reste figé -> aucun impact sur le tri
      // du feed (modification silencieuse). Notifications aux favoris
      // (prix, statut) gérées par trigger SQL, pas depuis ce code.
      await updateListing(listingId, values);
      router.push(`/listing/${listingId}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <ListingFieldsForm values={values} onChange={update} />

      <div>
        <label className="mb-1 block text-sm font-medium">Statut de l'annonce</label>
        <div className="flex gap-2">
          {(['active', 'rented', 'expired'] as const).map((s) => (
            <button
              key={s}
              onClick={() => update({ status: s })}
              className={`rounded-full px-3 py-1 text-xs ${values.status === s ? 'bg-brand-600 text-white' : 'border border-line bg-chip'}`}
            >
              {s === 'active' ? 'Active' : s === 'rented' ? 'Louée' : 'Expirée'}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-ink-muted">
          Passer de "Active" à "Louée"/"Expirée" (ou inversement) notifie automatiquement les favoris.
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full rounded-lg bg-brand-600 py-3 font-medium text-white disabled:opacity-50"
      >
        {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
      </button>
    </div>
  );
}
