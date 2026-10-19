'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { searchPlaceSuggestions, reverseGeocode } from '@/lib/geocoding';
import type { PlaceSuggestion } from '@/lib/geocoding';

// Leaflet accède à `window` au chargement -> import dynamique, sans rendu serveur.
const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false });

export type LocationValue = {
  locationLabel: string;
  latitude: number;
  longitude: number;
  geocodedName?: string;
};

type LocationStepProps = {
  value: Partial<LocationValue>;
  onChange: (value: LocationValue) => void;
};

// Flux en deux temps validé dans rapport_proprietes_annonce.md §7 : recherche
// par repère (pas la position GPS du téléphone, peu fiable pour ce cas
// d'usage), puis ajustement fin via un marqueur déplaçable sur une carte
// centrée sur ce repère.
export function LocationStep({ value, onChange }: LocationStepProps) {
  const [query, setQuery] = useState(value.locationLabel ?? '');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [selected, setSelected] = useState<PlaceSuggestion | null>(
    value.latitude && value.longitude
      ? { label: value.locationLabel ?? '', lat: value.latitude, lng: value.longitude }
      : null
  );

  const handleSearch = async (q: string) => {
    setQuery(q);
    setSuggestions(q.trim().length >= 3 ? await searchPlaceSuggestions(q) : []);
  };

  const handleSelectSuggestion = (s: PlaceSuggestion) => {
    setSelected(s);
    setSuggestions([]);
    onChange({ locationLabel: query, latitude: s.lat, longitude: s.lng, geocodedName: value.geocodedName });
  };

  const handleMarkerMoved = async (lat: number, lng: number) => {
    const geocodedName = await reverseGeocode(lat, lng);
    onChange({ locationLabel: query, latitude: lat, longitude: lng, geocodedName: geocodedName ?? undefined });
  };

  return (
    <div className="space-y-3 p-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Localité (quartier, carrefour, repère connu)</label>
        <input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Ex : Carrefour Nlongkak"
          className="w-full rounded border px-3 py-2 text-sm"
        />
        {suggestions.length > 0 && (
          <ul className="mt-1 divide-y rounded border text-sm">
            {suggestions.map((s, i) => (
              <li key={i} onClick={() => handleSelectSuggestion(s)} className="cursor-pointer p-2 hover:border border-line bg-chip">
                {s.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <div>
          <p className="mb-2 text-xs text-ink-muted">Ajustez le marqueur pour indiquer l'emplacement exact du bien.</p>
          <LeafletMap center={{ lat: selected.lat, lng: selected.lng }} onMarkerMoved={handleMarkerMoved} />
        </div>
      )}
    </div>
  );
}
