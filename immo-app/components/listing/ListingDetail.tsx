'use client';
import { useRouter } from 'next/navigation';
import { PhotoCarousel } from '@/components/feed/PhotoCarousel';
import { ActionBar } from '@/components/feed/ActionBar';
import { OwnerBlock } from './OwnerBlock';
import { ItineraryButton } from './ItineraryButton';
import { toggleLike, toggleFavorite } from '@/lib/supabase/queries/listings';
import type { ListingDetail as ListingDetailData } from '@/types/listing';

const PROPERTY_TYPE_LABEL: Record<string, string> = {
  apartment: 'Appartement',
  studio: 'Studio',
  room: 'Chambre',
};

type Props = {
  listing: ListingDetailData;
  currentUserId?: string;
};

// Même principe que FeedCard : toute la fiche est cliquable (ici pour
// revenir au feed), sauf les zones d'action explicites qui stoppent la
// propagation (ActionBar, itinéraire, bouton Modifier).
export function ListingDetail({ listing, currentUserId }: Props) {
  const router = useRouter();
  const isOwner = currentUserId === listing.owner.id;

  return (
    <div className="pb-24" onClick={() => router.push('/')}>
      <div className="relative h-[60vh] w-full">
        <PhotoCarousel photos={listing.photos} />
        {listing.isBoosted && (
          <span className="absolute top-4 left-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
            Mis en avant
          </span>
        )}
      </div>

      <div className="space-y-4 p-4" onClick={(e) => e.stopPropagation()}>
        <OwnerBlock owner={listing.owner} />

        <div>
          <h1 className="text-xl font-semibold">{listing.title}</h1>
          <p className="text-lg text-brand-700">
            {listing.priceAmount.toLocaleString('fr-FR')} FCFA / {listing.pricePeriod === 'day' ? 'jour' : 'mois'}
          </p>
          <p className="text-sm text-ink-muted">{listing.locationLabel}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded border border-line bg-chip px-2 py-1">
            {PROPERTY_TYPE_LABEL[listing.propertyType]}
            {listing.propertyType === 'studio' && listing.roomCount ? ` · ${listing.roomCount} pièces` : ''}
          </span>
          <span className="rounded border border-line bg-chip px-2 py-1">{listing.furnished ? 'Meublé' : 'Non meublé'}</span>
          {listing.surfaceArea != null && <span className="rounded border border-line bg-chip px-2 py-1">{listing.surfaceArea} m²</span>}
          {listing.bedrooms != null && <span className="rounded border border-line bg-chip px-2 py-1">{listing.bedrooms} chambre(s)</span>}
          {listing.bathrooms != null && <span className="rounded border border-line bg-chip px-2 py-1">{listing.bathrooms} salle(s) de bain</span>}
        </div>

        {listing.pricePeriod === 'month' && listing.advanceMonths != null && (
          <p className="text-sm text-gray-600">Avance demandée : {listing.advanceMonths} mois</p>
        )}
        <p className="text-sm text-gray-600">
          Caution : {listing.depositAmount.toLocaleString('fr-FR')} FCFA
          {listing.pricePeriod === 'month' ? ' (1 mois de loyer)' : ''}
        </p>

        {listing.availabilityStatus && (
          <p className="text-sm text-gray-600">
            Disponibilité :{' '}
            {listing.availabilityStatus === 'now' && 'Maintenant'}
            {listing.availabilityStatus === 'upcoming' && 'À venir'}
            {listing.availabilityStatus === 'scheduled' && `À partir du ${listing.availabilityDate}`}
          </p>
        )}

        <p className="whitespace-pre-line text-sm text-gray-700">{listing.description}</p>

        <ItineraryButton latitude={listing.latitude} longitude={listing.longitude} geocodedName={listing.geocodedName} />

        {/* Analytics privées, visibles uniquement par le propriétaire —
            rapport_proprietes_utilisateur.md, "ce que l'utilisateur voit sur
            son propre compte, mais que les autres ne voient pas". Le clic
            "Contacter" reçu n'est jamais exposé publiquement. */}
        {isOwner && (
          <div className="rounded-lg border border-line bg-chip p-3 text-sm text-gray-600">
            <p>{listing.viewsCount} vues · {listing.likesCount} likes · {listing.savesCount} favoris</p>
            <p>{listing.contactsCount} clics "Contacter" reçus</p>
            <button
              onClick={() => router.push(`/listing/${listing.id}/edit`)}
              className="mt-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
            >
              Modifier l'annonce
            </button>
          </div>
        )}
      </div>

      <div onClick={(e) => e.stopPropagation()} className="fixed bottom-4 right-4 rounded-2xl bg-gray-900/90 p-3">
        <ActionBar
          listingId={listing.id}
          likesCount={listing.likesCount}
          savesCount={listing.savesCount}
          sharesCount={listing.sharesCount}
          isLiked={listing.isLikedByViewer}
          isSaved={listing.isSavedByViewer}
          onLike={() => toggleLike(listing.id, listing.isLikedByViewer)}
          onSave={() => toggleFavorite(listing.id, listing.isSavedByViewer)}
          onShare={() => navigator.share?.({ url: window.location.href })}
        />
      </div>
    </div>
  );
}
