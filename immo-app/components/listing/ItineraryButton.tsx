'use client';
import { Navigation } from 'lucide-react';
import { buildItineraryUrl } from '@/lib/maps';

// Coordonnées et nom géocodé jamais affichés en clair — seulement transmis
// dans l'URL du lien (rapport_proprietes_annonce.md §7).
export function ItineraryButton({
  latitude,
  longitude,
  geocodedName,
}: {
  latitude: number;
  longitude: number;
  geocodedName?: string | null;
}) {
  return (
    <a
      href={buildItineraryUrl(latitude, longitude, geocodedName)}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="flex w-fit items-center gap-2 rounded-lg border border-line bg-chip px-4 py-2 text-sm font-medium"
    >
      <Navigation size={16} /> Itinéraire
    </a>
  );
}
