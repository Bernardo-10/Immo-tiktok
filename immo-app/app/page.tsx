'use client';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, Search } from 'lucide-react';
import { useFeed } from '@/lib/hooks/useFeed';
import { useFilters } from '@/lib/hooks/useFilters';
import { FeedCard } from '@/components/feed/FeedCard';
import { FilterPanel } from '@/components/filters/FilterPanel';
import { toggleLike, toggleFavorite } from '@/lib/supabase/queries/listings';

export default function FeedPage() {
  const router = useRouter();
  const { filters } = useFilters();
  const { listings, loadMore, hasMore, loading } = useFeed(filters);
  const [filterOpen, setFilterOpen] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200 && hasMore && !loading) {
      loadMore();
    }
  };

  return (
    <div className="relative h-screen">
      {/* Filtre à gauche (avec libellé), recherche réduite à une icône à
          droite — la vraie barre de recherche vit sur /search, pas ici. */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-surface/95 px-3 py-2 text-sm font-medium text-ink shadow"
        >
          <Filter size={16} />
          Filtre
        </button>

        <button
          onClick={() => router.push('/search')}
          aria-label="Rechercher"
          className="rounded-full bg-surface/95 p-2 text-ink shadow"
        >
          <Search size={18} />
        </button>
      </div>

      <div onScroll={handleScroll} className="h-full snap-y snap-mandatory overflow-y-scroll">
        {listings.map((listing) => (
          <FeedCard
            key={listing.id}
            listing={listing}
            onOpenDetail={(id) => router.push(`/listing/${id}`)}
            onToggleLike={(id, isLiked) => toggleLike(id, isLiked)}
            onToggleSave={(id, isSaved) => toggleFavorite(id, isSaved)}
            onShare={(id) => navigator.share?.({ url: `${window.location.origin}/listing/${id}` })}
          />
        ))}
      </div>

      {listings.length === 0 && loading && <LoadingScreen inline />}

      <FilterPanel open={filterOpen} onClose={() => setFilterOpen(false)} />
    </div>
  );
}
