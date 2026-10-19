'use client';
import { useRouter } from 'next/navigation';
import { useListingView } from '@/lib/hooks/useListingView';
import { PhotoCarousel } from './PhotoCarousel';
import { ActionBar } from './ActionBar';
import type { FeedListing } from '@/types/listing';

type FeedCardProps = {
  listing: FeedListing;
  onOpenDetail: (id: string) => void;
  onToggleLike: (id: string, isLiked: boolean) => void;
  onToggleSave: (id: string, isSaved: boolean) => void;
  onShare: (id: string) => void;
};

const PROPERTY_TYPE_LABEL: Record<string, string> = {
  apartment: 'Appartement',
  studio: 'Studio',
  room: 'Chambre',
};

// Toute la carte est cliquable (corrige la régression V2 où seul le titre
// ouvrait la fiche détaillée) — les boutons d'action stoppent la propagation.
export function FeedCard({ listing, onOpenDetail, onToggleLike, onToggleSave, onShare }: FeedCardProps) {
  const viewRef = useListingView(listing.id);
  const router = useRouter();

  // Pas de vrai système d'abonnement dans ce produit (Like/Enregistrer en
  // tient lieu, décision déjà actée) — le bouton "+" façon TikTok mène donc
  // au profil public du propriétaire plutôt qu'à un abonnement réel.
  const goToOwner = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/profile/${listing.owner.handle}`);
  };

  return (
    <div
      ref={viewRef}
      onClick={() => onOpenDetail(listing.id)}
      className="relative h-screen w-full snap-start cursor-pointer overflow-hidden md:mx-auto md:h-[85vh] md:max-w-[480px] md:rounded-2xl"
    >
      <PhotoCarousel photos={listing.photos} />

      {/* Voile dégradé permanent — garantit que le texte reste lisible quelle
          que soit la photo en fond, comme sur TikTok (le titre s'y voit
          toujours, peu importe la vidéo). */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

      {listing.isBoosted && (
        <span className="absolute top-4 left-4 rounded-full bg-clay-500 px-3 py-1 text-xs font-semibold text-white">
          Mis en avant
        </span>
      )}

      {/* Colonne latérale droite façon TikTok : avatar + bouton rond "+",
          puis les actions juste en dessous — l'avatar quitte le bloc texte
          du bas pour ne plus jamais s'y chevaucher avec les infos du bien. */}
      <div onClick={(e) => e.stopPropagation()} className="absolute bottom-20 right-3 flex flex-col items-center gap-5">
        <button onClick={goToOwner} className="relative">
          <img
            src={listing.owner.avatarUrl ?? '/default-avatar.png'}
            className="h-12 w-12 rounded-full border-2 border-white object-cover"
            alt=""
          />
          <span className="absolute -bottom-2 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-brand-600 text-xs font-bold leading-none text-white">
            +
          </span>
        </button>

        <ActionBar
          listingId={listing.id}
          likesCount={listing.likesCount}
          savesCount={listing.savesCount}
          sharesCount={listing.sharesCount}
          isLiked={listing.isLikedByViewer}
          isSaved={listing.isSavedByViewer}
          onLike={() => onToggleLike(listing.id, listing.isLikedByViewer)}
          onSave={() => onToggleSave(listing.id, listing.isSavedByViewer)}
          onShare={() => onShare(listing.id)}
        />
      </div>

      {/* Bloc bas gauche : uniquement le titre du bien et ses infos — plus
          aucun élément propriétaire ici, donc plus de chevauchement possible. */}
      <div className="absolute bottom-20 left-4 right-20 text-white">
        <div className="mb-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-ink shadow-sm">
            {PROPERTY_TYPE_LABEL[listing.propertyType]}
            {listing.propertyType === 'studio' && listing.roomCount ? ` · ${listing.roomCount} pièces` : ''}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
              listing.furnished ? 'bg-brand-600 text-white' : 'bg-ink text-surface'
            }`}
          >
            {listing.furnished ? 'Meublé' : 'Non meublé'}
          </span>
        </div>

        <p className="truncate text-base font-semibold">{listing.title}</p>
        <p className="text-sm font-medium">
          {listing.priceAmount.toLocaleString('fr-FR')} FCFA / {listing.pricePeriod === 'day' ? 'jour' : 'mois'}
        </p>
        <p className="text-xs text-white/85">{listing.locationLabel}</p>
      </div>
    </div>
  );
}
