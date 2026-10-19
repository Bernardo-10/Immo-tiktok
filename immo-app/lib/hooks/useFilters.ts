'use client';
import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { ListingFilters } from '@/types/listing';

// L'état des filtres vit dans l'URL, pas dans un state React isolé : un
// filtre appliqué est partageable et survit à un rafraîchissement — cohérent
// avec le rôle central du filtre (rapport_filtres_feed.md).
export function useFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: ListingFilters = useMemo(() => {
    const get = (key: string) => searchParams.get(key) ?? undefined;
    return {
      pricePeriod: get('period') as ListingFilters['pricePeriod'],
      priceMin: get('priceMin') ? Number(get('priceMin')) : undefined,
      priceMax: get('priceMax') ? Number(get('priceMax')) : undefined,
      propertyType: get('type') as ListingFilters['propertyType'],
      furnished: get('furnished') !== undefined ? get('furnished') === 'true' : undefined,
      bedrooms: get('bedrooms') ? Number(get('bedrooms')) : undefined,
      bathrooms: get('bathrooms') ? Number(get('bathrooms')) : undefined,
      surfaceMin: get('surfaceMin') ? Number(get('surfaceMin')) : undefined,
      surfaceMax: get('surfaceMax') ? Number(get('surfaceMax')) : undefined,
      availability: get('availability') as ListingFilters['availability'],
      availabilityDate: get('availabilityDate'),
      advanceRequested: get('advance') !== undefined ? get('advance') === 'true' : undefined,
      locationQuery: get('location'),
    };
  }, [searchParams]);

  const setFilters = useCallback(
    (next: ListingFilters) => {
      const params = new URLSearchParams();
      if (next.pricePeriod) params.set('period', next.pricePeriod);
      if (next.priceMin !== undefined) params.set('priceMin', String(next.priceMin));
      if (next.priceMax !== undefined) params.set('priceMax', String(next.priceMax));
      if (next.propertyType) params.set('type', next.propertyType);
      if (next.furnished !== undefined) params.set('furnished', String(next.furnished));
      if (next.bedrooms !== undefined) params.set('bedrooms', String(next.bedrooms));
      if (next.bathrooms !== undefined) params.set('bathrooms', String(next.bathrooms));
      if (next.surfaceMin !== undefined) params.set('surfaceMin', String(next.surfaceMin));
      if (next.surfaceMax !== undefined) params.set('surfaceMax', String(next.surfaceMax));
      if (next.availability) params.set('availability', next.availability);
      if (next.availabilityDate) params.set('availabilityDate', next.availabilityDate);
      if (next.advanceRequested !== undefined) params.set('advance', String(next.advanceRequested));
      if (next.locationQuery) params.set('location', next.locationQuery);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname]
  );

  // Corrige l'absence de bouton "Réinitialiser" identifiée comme régression
  // dans la V2 (rapport_fusion_maquettes_figma.md §4.2).
  const resetFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  const hasPriceWithoutPeriod = useMemo(
    () => (filters.priceMin !== undefined || filters.priceMax !== undefined) && !filters.pricePeriod,
    [filters]
  );

  return { filters, setFilters, resetFilters, hasPriceWithoutPeriod };
}
