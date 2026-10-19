'use client';
import { useCallback, useEffect, useState } from 'react';
import { getFeedListings } from '@/lib/supabase/queries/listings';
import type { FeedListing, ListingFilters } from '@/types/listing';

export function useFeed(filters: ListingFilters) {
  const [listings, setListings] = useState<FeedListing[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(
    async (reset = false) => {
      setLoading(true);
      try {
        const { listings: page, nextCursor } = await getFeedListings(
          filters,
          reset ? undefined : cursor ?? undefined
        );
        setListings((prev) => (reset ? page : [...prev, ...page]));
        setCursor(nextCursor);
        setHasMore(nextCursor !== null);
      } finally {
        setLoading(false);
      }
    },
    [filters, cursor]
  );

  // Recharge depuis zéro à chaque changement de filtre.
  useEffect(() => {
    setListings([]);
    setCursor(null);
    setHasMore(true);
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) load(false);
  }, [loading, hasMore, load]);

  return { listings, loading, hasMore, loadMore };
}
