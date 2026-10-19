-- Notifie les favoris (listing_favorites) uniquement sur deux événements
-- validés avec Bernardo : changement de prix, et changement de statut
-- (actif <-> loué/expiré). Un changement de disponibilité future
-- (availability_status/availability_date : "à venir", date précise...) ne
-- déclenche PAS de notification pour l'instant — cf. point ouvert dans le
-- rapport d'activité correspondant.

create or replace function notify_favorites_on_listing_change()
returns trigger
language plpgsql
as $$
declare
  v_price_changed boolean;
  v_became_unavailable boolean;
  v_became_available boolean;
begin
  v_price_changed := (new.price_amount is distinct from old.price_amount);
  v_became_unavailable := (old.status = 'active' and new.status in ('rented', 'expired'));
  v_became_available := (old.status in ('rented', 'expired') and new.status = 'active');

  if v_price_changed then
    insert into notifications (recipient_id, category, listing_id, message)
    select user_id, 'favorite', new.id, 'Le prix de "' || new.title || '", dans vos favoris, a changé'
    from listing_favorites
    where listing_id = new.id;
  end if;

  if v_became_unavailable then
    insert into notifications (recipient_id, category, listing_id, message)
    select user_id, 'favorite', new.id, '"' || new.title || '", dans vos favoris, n''est plus disponible'
    from listing_favorites
    where listing_id = new.id;
  end if;

  if v_became_available then
    insert into notifications (recipient_id, category, listing_id, message)
    select user_id, 'favorite', new.id, '"' || new.title || '", dans vos favoris, est de nouveau disponible'
    from listing_favorites
    where listing_id = new.id;
  end if;

  return new;
end;
$$;

create trigger trg_listings_notify_favorites
after update on listings
for each row execute function notify_favorites_on_listing_change();

-- Suppression d'annonce : notifie les favoris ("n'est plus disponible")
-- AVANT de supprimer la ligne, puis supprime réellement l'annonce. La
-- contrainte on delete set null sur notifications.listing_id garantit que la
-- notification survit même une fois l'annonce supprimée.
create or replace function delete_listing_and_notify(p_listing_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title text;
  v_owner uuid;
begin
  select title, owner_id into v_title, v_owner from listings where id = p_listing_id;

  if v_title is null then
    raise exception 'Annonce introuvable';
  end if;

  if v_owner <> auth.uid() then
    raise exception 'Seul le propriétaire peut supprimer cette annonce';
  end if;

  insert into notifications (recipient_id, category, listing_id, message)
  select user_id, 'favorite', p_listing_id, '"' || v_title || '", dans vos favoris, n''est plus disponible'
  from listing_favorites
  where listing_id = p_listing_id;

  delete from listings where id = p_listing_id;
end;
$$;
