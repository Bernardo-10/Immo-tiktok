'use client';
import { useCallback, useState } from 'react';
import { searchListings } from '@/lib/supabase/queries/listings';
import type { FeedListing, ListingFilters } from '@/types/listing';

export function useSearch(filters: ListingFilters) {
  const [results, setResults] = useState<FeedListing[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(
    async (query: string) => {
      setLoading(true);
      try {
        const data = await searchListings(query, filters);
        setResults(data);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  return { results, loading, search };
}
