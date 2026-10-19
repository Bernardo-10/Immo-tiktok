export type PlaceSuggestion = {
  label: string;
  lat: number;
  lng: number;
};

// Recherche par nom via Nominatim (OpenStreetMap), restreinte au Cameroun.
// Gratuit, sans clé API — cohérent avec la philosophie "outils gratuits pour
// démarrer" du cahier des charges. Limite d'usage raisonnable d'environ
// 1 requête/seconde : largement suffisant pour un lancement sur une zone
// restreinte (rapport0_cahier_des_charges.md §6), à revoir (self-hosting ou
// fournisseur payant) si le volume explose un jour.
export async function searchPlaceSuggestions(query: string): Promise<PlaceSuggestion[]> {
  if (!query.trim()) return [];
  const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=cm&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'fr' } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data as any[]).map((r) => ({ label: r.display_name, lat: Number(r.lat), lng: Number(r.lon) }));
}

// Géocodage inverse, déclenché une seule fois à la fin du glissement du
// marqueur — jamais à chaque déplacement intermédiaire (rapport_filtres_feed.md §3).
// Le résultat n'est jamais affiché publiquement : il sert uniquement à
// enrichir la recherche et le lien d'itinéraire.
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'fr' } });
  if (!res.ok) return null;
  const data = await res.json();
  return data.display_name ?? null;
}
