'use client';
import { useEffect, useState } from 'react';
import { Home } from 'lucide-react';

// Délai avant d'afficher quoi que ce soit : si le chargement dure moins que
// `delay` ms, l'utilisateur ne voit RIEN (pas de clignotement). Au-delà,
// l'indicateur apparaît en fondu.
//   phase 0 = rien · phase 1 = monté, transparent · phase 2 = visible (fondu)
function useDelayedFade(delay: number) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    let raf = 0;
    const timer = setTimeout(() => {
      setPhase(1);
      raf = requestAnimationFrame(() => setPhase(2));
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [delay]);

  return phase;
}

// Écran de chargement aux couleurs de l'app, remplace les anciens textes
// "Chargement...". Par défaut il couvre tout l'écran (comme un splash) ; avec
// `inline`, il remplit uniquement son conteneur parent (qui doit être
// `relative`) — utilisé sur le feed pour laisser visibles Filtre/Recherche.
// Le texte n'est lu que par les lecteurs d'écran (sr-only).
export function LoadingScreen({
  inline = false,
  label = 'Chargement',
  delay = 300,
}: {
  inline?: boolean;
  label?: string;
  delay?: number;
}) {
  const phase = useDelayedFade(delay);
  if (phase === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${inline ? 'absolute inset-0' : 'fixed inset-0 z-50'} flex flex-col items-center justify-center gap-6 bg-paper transition-opacity duration-300 ${
        phase === 2 ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="relative flex h-24 w-24 items-center justify-center">
        {/* Anneau qui tourne */}
        <span className="absolute inset-0 rounded-full border-4 border-brand-100 border-t-brand-600 motion-safe:animate-spin" />
        {/* Logo central */}
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg motion-safe:animate-pulse">
          <Home size={28} />
        </span>
      </div>
      <p className="text-lg font-semibold tracking-tight text-brand-700" aria-hidden="true">
        Immo App
      </p>
      <span className="sr-only">{label}</span>
    </div>
  );
}

// Petit indicateur pour les chargements locaux (ex. résultats de recherche),
// avec le même délai anti-clignotement.
export function Spinner({ delay = 300 }: { delay?: number }) {
  const phase = useDelayedFade(delay);
  if (phase === 0) return null;

  return (
    <div
      role="status"
      className={`flex justify-center p-6 transition-opacity duration-300 ${phase === 2 ? 'opacity-100' : 'opacity-0'}`}
    >
      <span className="h-8 w-8 rounded-full border-4 border-brand-100 border-t-brand-600 motion-safe:animate-spin" />
      <span className="sr-only">Chargement</span>
    </div>
  );
}
