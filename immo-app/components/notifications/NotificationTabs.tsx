'use client';
import type { NotificationCategory } from '@/types/notification';

// 6 catégories fidèles au rapport (façon onglets TikTok), + "Tout" pour ne
// pas forcer un choix de filtre par défaut.
const TABS: { value: NotificationCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Tout' },
  { value: 'like', label: 'Likes' },
  { value: 'save', label: 'Enreg.' },
  { value: 'visitor', label: 'Visiteurs' },
  { value: 'favorite', label: 'Favoris' },
  { value: 'tier', label: 'Paliers' },
  { value: 'system', label: 'Système' },
];

export function NotificationTabs({
  active,
  onChange,
}: {
  active: NotificationCategory | 'all';
  onChange: (c: NotificationCategory | 'all') => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto border-b p-3">
      {TABS.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${
            active === t.value ? 'bg-brand-600 text-white' : 'border border-line bg-chip text-gray-600'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
