'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhotoStep } from './PhotoStep';
import { LocationStep } from './LocationStep';
import type { LocationValue } from './LocationStep';
import { ListingFieldsForm } from '@/components/listing/ListingFieldsForm';
import { insertListing } from '@/lib/supabase/queries/listings';
import type { ListingFieldValues } from '@/types/listing';

const STEPS = ['Photos', 'Informations', 'Localisation'] as const;

const DEFAULT_VALUES: ListingFieldValues = {
  title: '',
  description: '',
  propertyType: 'apartment',
  furnished: false,
  priceAmount: 0,
  pricePeriod: 'month',
  depositAmount: 0,
};

// Assistant en 3 étapes (fidèle à l'esprit du PublishForm en 5 étapes de la
// V2, condensé ici car Informations/Tarification/Caractéristiques
// partagent déjà un seul composant : ListingFieldsForm). L'état est
// conservé en mémoire d'une étape à l'autre — revenir en arrière ne fait
// jamais perdre les données déjà saisies.
export function PublishWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [fields, setFields] = useState<ListingFieldValues>(DEFAULT_VALUES);
  const [location, setLocation] = useState<Partial<LocationValue>>({});
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGoNext =
    (step === 0 && photos.length > 0) ||
    (step === 1 && fields.title.trim() !== '' && fields.priceAmount > 0) ||
    step === 2;

  const handlePublish = async () => {
    if (!location.latitude || !location.longitude || !location.locationLabel) {
      setError('La localisation du bien est incomplète.');
      return;
    }
    setPublishing(true);
    setError(null);
    try {
      const listingId = await insertListing(
        {
          ...fields,
          locationLabel: location.locationLabel,
          latitude: location.latitude,
          longitude: location.longitude,
          geocodedName: location.geocodedName,
        },
        photos
      );
      router.push(`/listing/${listingId}`);
    } catch (e: any) {
      setError(e.message ?? 'Une erreur est survenue à la publication.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="pb-24">
      {/* Indicateur de progression, fidèle à la V2 */}
      <div className="flex items-center gap-2 p-4">
        {STEPS.map((label, i) => (
          <div key={label} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-brand-600' : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className="px-4 text-sm font-medium text-ink-muted">{STEPS[step]}</p>

      {step === 0 && <PhotoStep photos={photos} onChange={setPhotos} />}
      {step === 1 && (
        <div className="p-4">
          <ListingFieldsForm values={fields} onChange={(patch) => setFields((f) => ({ ...f, ...patch }))} />
        </div>
      )}
      {step === 2 && <LocationStep value={location} onChange={setLocation} />}

      {error && <p className="px-4 text-sm text-red-500">{error}</p>}

      <div className="fixed bottom-0 left-0 right-0 flex gap-2 border-t bg-white p-4">
        {step > 0 && (
          <button onClick={() => setStep((s) => s - 1)} className="flex-1 rounded-lg border border-line bg-chip py-3 text-sm font-medium">
            Retour
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canGoNext}
            className="flex-1 rounded-lg bg-brand-600 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            Suivant
          </button>
        ) : (
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex-1 rounded-lg bg-brand-600 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {publishing ? 'Publication...' : 'Publier'}
          </button>
        )}
      </div>
    </div>
  );
}
