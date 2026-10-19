'use client';
import { useEffect, useRef } from 'react';
import { recordView } from '@/lib/supabase/queries/listings';

// Règle validée avec Bernardo : une vue n'est comptée que si la carte est
// visible à au moins 50% pendant au moins 1 seconde consécutive. Le minuteur
// se réinitialise si la carte redescend sous le seuil avant la seconde —
// évite de compter une vue sur une carte simplement traversée en scroll rapide.
export function useListingView(listingId: string) {
  const ref = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || countedRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          if (!timerRef.current) {
            timerRef.current = setTimeout(() => {
              if (!countedRef.current) {
                countedRef.current = true;
                recordView(listingId);
              }
            }, 1000);
          }
        } else if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      },
      { threshold: [0, 0.5, 1] }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [listingId]);

  return ref;
}
