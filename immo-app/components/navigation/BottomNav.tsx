'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, Bell, User } from 'lucide-react';

const ITEMS = [
  { href: '/', label: 'Accueil', icon: Home, center: false },
  { href: '/search', label: 'Recherche', icon: Search, center: false },
  { href: '/publish', label: 'Publier', icon: PlusSquare, center: true },
  { href: '/notifications', label: 'Notifs', icon: Bell, center: false },
  { href: '/account', label: 'Profil', icon: User, center: false },
] as const;

// Barre de navigation globale façon TikTok : Accueil / Recherche / Publier
// (bouton central mis en avant) / Notifications / Profil. Fixe en bas de
// l'écran, masquée sur les parcours dédiés (cf. AppShell.tsx).
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t bg-white">
      {ITEMS.map(({ href, label, icon: Icon, center }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href);

        if (center) {
          return (
            <Link key={href} href={href} className="flex flex-col items-center" aria-label={label}>
              <span className="flex h-10 w-14 items-center justify-center rounded-xl bg-brand-600 text-white">
                <Icon size={22} />
              </span>
            </Link>
          );
        }

        return (
          <Link key={href} href={href} className="flex flex-col items-center gap-0.5">
            <Icon size={22} className={active ? 'text-brand-600' : 'text-ink-muted'} />
            <span className={`text-[10px] ${active ? 'font-medium text-brand-600' : 'text-ink-muted'}`}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
