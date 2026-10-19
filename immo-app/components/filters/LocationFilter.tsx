'use client';
import { MapPin } from 'lucide-react';
import type { ListingFilters } from '@/types/listing';

export function LocationFilter({
  value,
  onChange,
}: {
  value: ListingFilters;
  onChange: (next: Partial<ListingFilters>) => void;
}) {
  // Contrairement à la V2 (bouton non branché à navigator.geolocation), on
  // appelle ici la vraie géolocalisation du visiteur — fiable pour la
  // recherche, contrairement à la position saisie à la publication
  // (cf. rapport_proprietes_annonce.md §7).
  const handleNearMe = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => onChange({ nearMe: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
      (err) => console.error('Géolocalisation refusée ou indisponible', err)
    );
  };

  return (
    <div className="mb-5">
      <span className="mb-2 block text-sm font-medium">Localisation</span>
      <input
        type="text"
        placeholder="Ex : Bastos, Carrefour Nlongkak"
        value={value.locationQuery ?? ''}
        onChange={(e) => onChange({ locationQuery: e.target.value })}
        className="mb-2 w-full rounded border px-2 py-1 text-sm"
      />
      <button onClick={handleNearMe} className="flex items-center gap-1 rounded-full border border-line bg-chip px-3 py-1 text-xs">
        <MapPin size={14} /> Près de moi
      </button>
    </div>
  );
}
