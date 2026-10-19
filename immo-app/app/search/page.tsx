'use client';
import { Spinner } from '@/components/ui/LoadingScreen';
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFilters } from '@/lib/hooks/useFilters';
import { useSearch } from '@/lib/hooks/useSearch';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResultCard } from '@/components/search/SearchResultCard';

// La barre de recherche vit ici (pas sur le feed, qui ne montre qu'une icône
// loupe menant à cet écran). Absente jusqu'ici — corrigé au passage.
export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filters } = useFilters();
  const { results, search, loading } = useSearch(filters);
  const initialQuery = searchParams.get('q') ?? '';

  useEffect(() => {
    if (initialQuery) search(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-line bg-paper p-3">
        <SearchBar initialValue={initialQuery} onSearch={search} />
      </div>

      {loading && <Spinner />}
      {results.map((listing) => (
        <SearchResultCard key={listing.id} listing={listing} onClick={() => router.push(`/listing/${listing.id}`)} />
      ))}
    </div>
  );
}
