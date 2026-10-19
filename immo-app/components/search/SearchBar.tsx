'use client';
import { Search } from 'lucide-react';
import { useState } from 'react';

type SearchBarProps = {
  onSearch: (query: string) => void;
  initialValue?: string;
};

export function SearchBar({ onSearch, initialValue = '' }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  return (
    <div className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-2">
      <Search size={18} className="text-ink-muted" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch(value)}
        placeholder="Rechercher un bien, un quartier..."
        className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
      />
    </div>
  );
}
