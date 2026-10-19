import { createClient } from '@/lib/supabase/client';
import { uploadListingPhotos } from '@/lib/supabase/storage';
import type {
  FeedListing,
  ListingDetail,
  ListingFilters,
  NewListingInput,
  PropertyType,
  PricePeriod,
  AvailabilityStatus,
  ListingStatus,
} from '@/types/listing';

const PAGE_SIZE = 10;

// Construit la requête à partir des filtres validés dans
// rapport_filtres_feed.md. La période de prix agit comme un filtre à part
// entière, jamais comme une conversion entre jour et mois.
function applyFilters(query: any, filters: ListingFilters) {
  if (filters.propertyType) query = query.eq('property_type', filters.propertyType);
  if (filters.furnished !== undefined) query = query.eq('furnished', filters.furnished);
  if (filters.bedrooms !== undefined) query = query.eq('bedrooms', filters.bedrooms);
  if (filters.bathrooms !== undefined) query = query.eq('bathrooms', filters.bathrooms);
  if (filters.surfaceMin !== undefined) query = query.gte('surface_area', filters.surfaceMin);
  if (filters.surfaceMax !== undefined) query = query.lte('surface_area', filters.surfaceMax);
  if (filters.availability) query = query.eq('availability_status', filters.availability);
  if (filters.availabilityDate) query = query.eq('availability_date', filters.availabilityDate);
  if (filters.advanceRequested !== undefined) {
    query = filters.advanceRequested
      ? query.not('advance_months', 'is', null)
      : query.is('advance_months', null);
  }

  if (filters.pricePeriod) {
    query = query.eq('price_period', filters.pricePeriod);
    if (filters.priceMin !== undefined) query = query.gte('price_amount', filters.priceMin);
    if (filters.priceMax !== undefined) query = query.lte('price_amount', filters.priceMax);
  }

  if (filters.locationQuery) {
    query = query.or(
      `location_label.ilike.%${filters.locationQuery}%,geocoded_name.ilike.%${filters.locationQuery}%`
    );
  }

  return query;
}

const LISTING_SELECT = `
  id, title, description, property_type, room_count, furnished,
  price_amount, price_period, location_label, availability_status,
  availability_date, surface_area, bedrooms, bathrooms, is_boosted,
  likes_count, saves_count, shares_count, views_count, created_at,
  owner:profiles!listings_owner_id_fkey (id, handle, display_name, avatar_url, is_pro, agency_name),
  listing_photos ( url, position )
`;

// Champs supplémentaires uniquement nécessaires sur la fiche détaillée —
// on évite d'alourdir les requêtes de feed/recherche avec ces colonnes.
const LISTING_DETAIL_SELECT = `
  ${LISTING_SELECT},
  advance_months, deposit_amount, latitude, longitude, geocoded_name, contacts_count, status
`;

export async function getFeedListings(
  filters: ListingFilters,
  cursor?: string
): Promise<{ listings: FeedListing[]; nextCursor: string | null }> {
  const supabase = createClient();

  let query = supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE);

  query = applyFilters(query, filters);
  if (cursor) query = query.lt('created_at', cursor);

  const { data, error } = await query;
  if (error) throw error;

  const rows = data ?? [];
  const { likedIds, savedIds } = await getViewerInteractions(rows.map((r: any) => r.id));
  const listings = rows.map((row: any) => mapRowToFeedListing(row, likedIds, savedIds));

  return {
    listings,
    nextCursor: listings.length === PAGE_SIZE ? listings[listings.length - 1].createdAt : null,
  };
}

export async function searchListings(searchQuery: string, filters: ListingFilters): Promise<FeedListing[]> {
  const supabase = createClient();

  let query = supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  query = applyFilters(query, filters);

  if (searchQuery.trim()) {
    query = query.or(
      `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location_label.ilike.%${searchQuery}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = data ?? [];
  const { likedIds, savedIds } = await getViewerInteractions(rows.map((r: any) => r.id));
  return rows.map((row: any) => mapRowToFeedListing(row, likedIds, savedIds));
}

// Fiche annonce détaillée — lecture publique si l'annonce est active
// (RLS listings_public_read), ou par le propriétaire quel que soit le statut
// (RLS listings_owner_read_all), cf. rapport_base_donnees.md §7.
export async function getListingById(id: string): Promise<ListingDetail | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from('listings').select(LISTING_DETAIL_SELECT).eq('id', id).single();
  if (error || !data) return null;

  const { likedIds, savedIds } = await getViewerInteractions([data.id]);
  return mapRowToListingDetail(data, likedIds, savedIds);
}

// Création d'une annonce. Le formulaire (PublishWizard) garde les photos en
// mémoire (File[]) tout au long du parcours ; l'insertion en base et l'envoi
// des photos vers Supabase Storage n'ont lieu qu'à la publication finale —
// évite les photos orphelines si l'utilisateur abandonne en cours de route,
// et contourne l'ordre imposé par la policy RLS de listing_photos (qui exige
// que la ligne `listings` existe déjà).
export async function insertListing(input: NewListingInput, photos: File[]): Promise<string> {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const ownerId = userData?.user?.id;
  if (!ownerId) throw new Error('Utilisateur non authentifié');

  const { data: inserted, error } = await supabase
    .from('listings')
    .insert({
      owner_id: ownerId,
      property_type: input.propertyType,
      room_count: input.roomCount ?? null,
      furnished: input.furnished,
      price_amount: input.priceAmount,
      price_period: input.pricePeriod,
      advance_months: input.pricePeriod === 'month' ? input.advanceMonths ?? null : null,
      deposit_amount: input.depositAmount, // écrasé par trigger si mensuel
      title: input.title,
      description: input.description,
      location_label: input.locationLabel,
      geocoded_name: input.geocodedName ?? null,
      latitude: input.latitude,
      longitude: input.longitude,
      availability_status: input.availabilityStatus ?? null,
      availability_date: input.availabilityDate ?? null,
      surface_area: input.surfaceArea ?? null,
      bedrooms: input.bedrooms ?? null,
      bathrooms: input.bathrooms ?? null,
    })
    .select('id')
    .single();

  if (error) throw error;
  const listingId = inserted.id as string;

  if (photos.length > 0) {
    const urls = await uploadListingPhotos(listingId, photos);
    const rows = urls.map((url, i) => ({ listing_id: listingId, url, position: i }));
    const { error: photoError } = await supabase.from('listing_photos').insert(rows);
    if (photoError) throw photoError;
  }

  return listingId;
}

type ListingFormPatch = Partial<{
  title: string;
  description: string;
  priceAmount: number;
  pricePeriod: PricePeriod;
  advanceMonths: number | null;
  depositAmount: number;
  furnished: boolean;
  propertyType: PropertyType;
  roomCount: number | null;
  surfaceArea: number;
  bedrooms: number;
  bathrooms: number;
  availabilityStatus: AvailabilityStatus | null;
  availabilityDate: string | null;
  status: ListingStatus;
  utilitiesIncluded: boolean | null;
}>;

// Modification d'une annonce existante. `updated_at` est mis à jour par
// trigger (set_updated_at), `created_at` reste figé -> aucun impact sur le
// tri du feed. Les notifications aux favoris (changement de prix ou de
// statut) sont gérées par trigger SQL (notify_favorites_on_listing_change),
// pas ici : ce fichier ne fait qu'écrire les colonnes modifiées.
export async function updateListing(id: string, patch: ListingFormPatch) {
  const supabase = createClient();
  const dbPatch: Record<string, any> = {};

  if (patch.title !== undefined) dbPatch.title = patch.title;
  if (patch.description !== undefined) dbPatch.description = patch.description;
  if (patch.priceAmount !== undefined) dbPatch.price_amount = patch.priceAmount;
  if (patch.pricePeriod !== undefined) dbPatch.price_period = patch.pricePeriod;
  if (patch.advanceMonths !== undefined) dbPatch.advance_months = patch.advanceMonths;
  if (patch.depositAmount !== undefined) dbPatch.deposit_amount = patch.depositAmount; // écrasé par trigger si mensuel
  if (patch.furnished !== undefined) dbPatch.furnished = patch.furnished;
  if (patch.propertyType !== undefined) dbPatch.property_type = patch.propertyType;
  if (patch.roomCount !== undefined) dbPatch.room_count = patch.roomCount;
  if (patch.surfaceArea !== undefined) dbPatch.surface_area = patch.surfaceArea;
  if (patch.bedrooms !== undefined) dbPatch.bedrooms = patch.bedrooms;
  if (patch.bathrooms !== undefined) dbPatch.bathrooms = patch.bathrooms;
  if (patch.availabilityStatus !== undefined) dbPatch.availability_status = patch.availabilityStatus;
  if (patch.availabilityDate !== undefined) dbPatch.availability_date = patch.availabilityDate;
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.utilitiesIncluded !== undefined) dbPatch.utilities_included = patch.utilitiesIncluded;

  const { error } = await supabase.from('listings').update(dbPatch).eq('id', id);
  if (error) throw error;
}

// Suppression : passe par la fonction SQL delete_listing_and_notify(), qui
// notifie les favoris ("n'est plus disponible") AVANT de supprimer la ligne
// (rapport_base_donnees.md — notifications.listing_id passe à null via
// on delete set null, la notification survit à la suppression de l'annonce).
export async function deleteListing(id: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc('delete_listing_and_notify', { p_listing_id: id });
  if (error) throw error;
}

async function getViewerInteractions(listingIds: string[]) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  if (!userId || listingIds.length === 0) {
    return { likedIds: new Set<string>(), savedIds: new Set<string>() };
  }

  const [{ data: likes }, { data: saves }] = await Promise.all([
    supabase.from('listing_likes').select('listing_id').eq('user_id', userId).in('listing_id', listingIds),
    supabase.from('listing_favorites').select('listing_id').eq('user_id', userId).in('listing_id', listingIds),
  ]);

  return {
    likedIds: new Set((likes ?? []).map((r: any) => r.listing_id)),
    savedIds: new Set((saves ?? []).map((r: any) => r.listing_id)),
  };
}

function mapRowToFeedListing(row: any, likedIds: Set<string>, savedIds: Set<string>): FeedListing {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    photos: (row.listing_photos ?? []).sort((a: any, b: any) => a.position - b.position).map((p: any) => p.url),
    propertyType: row.property_type,
    roomCount: row.room_count,
    furnished: row.furnished,
    priceAmount: row.price_amount,
    pricePeriod: row.price_period,
    locationLabel: row.location_label,
    availabilityStatus: row.availability_status,
    availabilityDate: row.availability_date,
    surfaceArea: row.surface_area,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    isBoosted: row.is_boosted,
    owner: {
      id: row.owner.id,
      handle: row.owner.handle,
      displayName: row.owner.display_name,
      avatarUrl: row.owner.avatar_url,
      isPro: row.owner.is_pro,
      agencyName: row.owner.agency_name,
    },
    likesCount: row.likes_count,
    savesCount: row.saves_count,
    sharesCount: row.shares_count,
    viewsCount: row.views_count,
    isLikedByViewer: likedIds.has(row.id),
    isSavedByViewer: savedIds.has(row.id),
    createdAt: row.created_at,
  };
}

function mapRowToListingDetail(row: any, likedIds: Set<string>, savedIds: Set<string>): ListingDetail {
  return {
    ...mapRowToFeedListing(row, likedIds, savedIds),
    advanceMonths: row.advance_months,
    depositAmount: row.deposit_amount,
    latitude: row.latitude,
    longitude: row.longitude,
    geocodedName: row.geocoded_name,
    contactsCount: row.contacts_count,
    status: row.status,
  };
}

// Génère le lien WhatsApp côté serveur — le numéro n'est jamais exposé au
// client — et journalise le clic dans la même opération (rapport_base_donnees.md §4).
export async function getContactLink(listingId: string): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_contact_link', { p_listing_id: listingId });
  if (error) throw error;
  return data as string;
}

export async function toggleLike(listingId: string, isCurrentlyLiked: boolean) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error('Utilisateur non authentifié');

  if (isCurrentlyLiked) {
    await supabase.from('listing_likes').delete().eq('user_id', userId).eq('listing_id', listingId);
  } else {
    await supabase.from('listing_likes').insert({ user_id: userId, listing_id: listingId });
  }
}

export async function toggleFavorite(listingId: string, isCurrentlySaved: boolean) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error('Utilisateur non authentifié');

  if (isCurrentlySaved) {
    await supabase.from('listing_favorites').delete().eq('user_id', userId).eq('listing_id', listingId);
  } else {
    await supabase.from('listing_favorites').insert({ user_id: userId, listing_id: listingId });
  }
}

// Règle de comptage : appelé uniquement après 50% de visibilité pendant
// au moins 1 seconde (cf. useListingView.ts).
export async function recordView(listingId: string) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  await supabase.from('listing_views').insert({
    listing_id: listingId,
    viewer_id: userData?.user?.id ?? null,
  });
}
