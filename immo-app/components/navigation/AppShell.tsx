'use client';
import { usePathname } from 'next/navigation';
import { BottomNav } from './BottomNav';

// Écrans où la barre ne doit PAS apparaître : connexion/inscription/onboarding
// (parcours dédiés, sans chrome), et les flux plein écran (publication,
// fiche détaillée — déjà dotée de sa propre colonne d'actions en bas à
// droite qui entrerait en conflit visuel, édition d'annonce/de profil).
function shouldHideNav(pathname: string) {
  return (
    pathname.startsWith('/auth') ||
    pathname === '/onboarding' ||
    pathname === '/publish' ||
    pathname.startsWith('/listing/') ||
    pathname === '/account/edit'
  );
}

// Le Feed reste plein écran (bord à bord, comme sur TikTok) : la nav flotte
// PAR-DESSUS la dernière portion visible de la carte, sans pousser le
// contenu — cf. les décalages ajustés dans FeedCard.tsx. Les autres écrans
// reçoivent un padding en bas pour ne pas être masqués par la barre.
const OVERLAY_PATHS = ['/'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = shouldHideNav(pathname);
  const isOverlay = OVERLAY_PATHS.includes(pathname);

  return (
    <>
      <div className={hideNav || isOverlay ? '' : 'pb-16'}>{children}</div>
      {!hideNav && <BottomNav />}
    </>
  );
}
