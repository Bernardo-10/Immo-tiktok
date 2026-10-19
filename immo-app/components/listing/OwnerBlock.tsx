import type { ListingOwner } from '@/types/listing';

// Bloc propriétaire correctement agencé sur cet écran dès la V2 (contrairement
// au feed) — avatar, nom, handle, badge pro repris tels quels.
export function OwnerBlock({ owner }: { owner: ListingOwner }) {
  return (
    <div className="flex items-center gap-3">
      <img src={owner.avatarUrl ?? '/default-avatar.png'} className="h-12 w-12 rounded-full object-cover" alt="" />
      <div>
        <p className="flex items-center gap-2 font-medium">
          {owner.displayName}
          {owner.isPro && (
            <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] uppercase text-brand-700">Pro</span>
          )}
        </p>
        <p className="text-sm text-ink-muted">
          @{owner.handle}
          {owner.agencyName ? ` · ${owner.agencyName}` : ''}
        </p>
      </div>
    </div>
  );
}
