// Types partagés du projet. Reflètent le schéma Supabase
// (rapport_base_donnees.md), complétés par title/description (migration 004).

export type PropertyType = 'apartment' | 'studio' | 'room';
export type PricePeriod = 'day' | 'month';
export type AvailabilityStatus = 'now' | 'upcoming' | 'scheduled';
export type ListingStatus = 'active' | 'rented' | 'expired';

export interface ListingOwner {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl?: string | null;
  isPro: boolean;
  agencyName?: string | null;
}

export interface FeedListing {
  id: string;
  title: string;
  description: string;
  photos: string[];
  propertyType: PropertyType;
  roomCount?: number | null;
  furnished: boolean;
  priceAmount: number;
  pricePeriod: PricePeriod;
  locationLabel: string;
  availabilityStatus?: AvailabilityStatus | null;
  availabilityDate?: string | null;
  surfaceArea?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  isBoosted: boolean;
  owner: ListingOwner;
  likesCount: number;
  savesCount: number;
  sharesCount: number;
  viewsCount: number;
  isLikedByViewer: boolean;
  isSavedByViewer: boolean;
  createdAt: string;
}

// Champs supplémentaires uniquement nécessaires sur la fiche détaillée —
// pas dans les cartes du feed/recherche, pour ne pas alourdir ces requêtes.
export interface ListingDetail extends FeedListing {
  advanceMonths?: number | null;
  depositAmount: number;
  latitude: number;
  longitude: number;
  geocodedName?: string | null; // jamais affiché tel quel, sert uniquement au lien itinéraire
  contactsCount: number;        // privé : à n'afficher que si isOwner (pas de RLS colonne par colonne)
  status: ListingStatus;
}

// Champs communs à la création ET à la modification d'une annonce —
// extraits à part pour que les deux formulaires (ListingFieldsForm) restent
// rigoureusement identiques et ne divergent jamais.
export interface ListingFieldValues {
  title: string;
  description: string;
  propertyType: PropertyType;
  roomCount?: number;
  furnished: boolean;
  priceAmount: number;
  pricePeriod: PricePeriod;
  advanceMonths?: number;
  depositAmount: number;
  surfaceArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  availabilityStatus?: AvailabilityStatus;
  availabilityDate?: string;
}

// Entrée complète nécessaire à la création d'une annonce (champs +
// localisation, résolue via le flux Nominatim/Leaflet).
export interface NewListingInput extends ListingFieldValues {
  locationLabel: string;
  latitude: number;
  longitude: number;
  geocodedName?: string;
}

// Filtres — un champ par critère validé dans rapport_filtres_feed.md.
// Le placement des annonces boostées dans les résultats reste un point
// ouvert (à trancher plus tard), non représenté ici.
export interface ListingFilters {
  pricePeriod?: PricePeriod;
  priceMin?: number;
  priceMax?: number;
  propertyType?: PropertyType;
  furnished?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  surfaceMin?: number;
  surfaceMax?: number;
  availability?: AvailabilityStatus;
  availabilityDate?: string;
  advanceRequested?: boolean;
  locationQuery?: string;
  nearMe?: { lat: number; lng: number };
}
