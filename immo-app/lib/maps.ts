// Construit un lien d'itinéraire Google Maps sans jamais afficher les
// coordonnées brutes ni le nom résolu par géocodage à l'écran
// (rapport_proprietes_annonce.md §7) — le nom, s'il existe, n'est transmis
// qu'à l'intérieur de l'URL, jamais rendu comme texte visible sur la fiche.
export function buildItineraryUrl(latitude: number, longitude: number, geocodedName?: string | null) {
  const destination = geocodedName ? encodeURIComponent(geocodedName) : `${latitude},${longitude}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}
