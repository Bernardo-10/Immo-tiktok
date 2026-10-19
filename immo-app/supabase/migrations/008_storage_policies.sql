-- Policies RLS pour les buckets Supabase Storage — pièce manquante à
-- l'origine de l'erreur "new row violates row-level security policy" à la
-- publication (l'upload de photos échoue, PAS l'insertion dans la table
-- `listings` : ce sont deux systèmes de RLS totalement séparés,
-- storage.objects vs les tables publiques).
--
-- Prérequis : les buckets `listing-photos` et `avatars` doivent déjà exister
-- (Storage > New bucket dans le dashboard Supabase), même vides.

-- 1. listing-photos : lecture publique, écriture réservée au propriétaire
--    réel de l'annonce (vérifié via le chemin {listingId}/... déjà utilisé
--    par uploadListingPhotos() dans lib/supabase/storage.ts).
create policy "listing_photos_storage_public_read"
on storage.objects for select
using (bucket_id = 'listing-photos');

create policy "listing_photos_storage_owner_write"
on storage.objects for insert
with check (
  bucket_id = 'listing-photos'
  and exists (
    select 1 from public.listings l
    where l.id::text = (storage.foldername(name))[1]
      and l.owner_id = auth.uid()
  )
);

create policy "listing_photos_storage_owner_delete"
on storage.objects for delete
using (
  bucket_id = 'listing-photos'
  and exists (
    select 1 from public.listings l
    where l.id::text = (storage.foldername(name))[1]
      and l.owner_id = auth.uid()
  )
);

-- 2. avatars : lecture publique, écriture réservée à l'utilisateur pour son
--    propre dossier ({userId}/... — cf. uploadAvatar() dans
--    lib/supabase/queries/profile.ts).
create policy "avatars_storage_public_read"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "avatars_storage_owner_write"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "avatars_storage_owner_update"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
