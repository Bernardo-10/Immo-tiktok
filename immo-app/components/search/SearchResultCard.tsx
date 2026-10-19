import type { FeedListing } from '@/types/listing';

// Liste verticale de cartes compactes, distincte du plein écran du feed
// (rapport_recherche.md §4) — permet de comparer plusieurs résultats.
export function SearchResultCard({ listing, onClick }: { listing: FeedListing; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full gap-3 border-b p-3 text-left">
      <img src={listing.photos[0]} alt="" className="h-20 w-20 rounded-lg object-cover" />
      <div className="flex flex-col justify-center">
        <p className="text-sm font-medium">{listing.title}</p>
        <p className="text-sm text-brand-700">
          {listing.priceAmount.toLocaleString('fr-FR')} FCFA / {listing.pricePeriod === 'day' ? 'jour' : 'mois'}
        </p>
        <p className="text-xs text-ink-muted">{listing.locationLabel}</p>
      </div>
    </button>
  );
}
