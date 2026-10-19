-- ============================================================================
-- SCHÉMA SUPABASE — App immobilière façon TikTok (Cameroun)
-- Migration initiale — cf. rapport_base_donnees.md pour les explications
-- détaillées de chaque choix.
-- ============================================================================

-- 0. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;
create extension if not exists unaccent;

-- 0bis. CORRECTIF : unaccent() est déclarée STABLE par PostgreSQL, pas
-- IMMUTABLE, ce qui empêche de l'utiliser directement dans une expression
-- d'index (erreur 42P17 : "functions in index expression must be marked
-- IMMUTABLE"). Solution standard : un wrapper explicitement marqué
-- IMMUTABLE, sûr ici car le dictionnaire "unaccent" ne change pas en usage
-- normal.
create or replace function immutable_unaccent(text)
returns text
language sql
immutable
set search_path = public, extensions
as $$
  select unaccent($1);
$$;

-- 1. TYPES ÉNUMÉRÉS
create type property_type as enum ('apartment', 'studio', 'room');
create type transaction_type as enum ('rental', 'sale');
create type price_period as enum ('day', 'month');
create type listing_status as enum ('active', 'rented', 'expired');
create type availability_status as enum ('now', 'upcoming', 'scheduled');
create type subscription_tier as enum ('free', 'standard', 'premium');
create type payment_type as enum ('recharge', 'subscription', 'boost', 'special_offer');
create type payment_provider as enum ('orange_money', 'mtn_momo');
create type notification_category as enum ('like', 'save', 'visitor', 'favorite', 'tier', 'system');

-- 2. PROFILS PUBLICS
create table profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  handle            text not null unique,
  display_name      text not null,
  avatar_url        text,
  bio               text,
  is_pro            boolean not null default false,
  agency_name       text,
  listings_count    integer not null default 0,
  total_views       integer not null default 0,
  total_likes       integer not null default 0,
  created_at        timestamptz not null default now()
);

-- 3. PROFILS PRIVÉS
create table profile_private (
  id                      uuid primary key references profiles(id) on delete cascade,
  whatsapp_number         text,
  wallet_balance          numeric(12,2) not null default 0,
  subscription_tier       subscription_tier not null default 'free',
  subscription_expires_at timestamptz,
  publications_used       integer not null default 0
);

-- 4. ANNONCES (title/description inclus dès le départ — corrige l'oubli
-- signalé dans rapport_activite_feed_filtre_recherche.md §3)
create table listings (
  id                  uuid primary key default uuid_generate_v4(),
  owner_id            uuid not null references profiles(id) on delete cascade,
  status              listing_status not null default 'active',
  transaction_type    transaction_type not null default 'rental',
  title               text not null,
  description         text not null,
  property_type       property_type not null,
  room_count          integer,
  furnished           boolean not null,
  price_amount        numeric(12,2) not null,
  price_period        price_period not null,
  advance_months      integer,
  deposit_amount       numeric(12,2) not null,
  location_label      text not null,
  geocoded_name        text,
  latitude             numeric(9,6) not null,
  longitude            numeric(9,6) not null,
  availability_status  availability_status,
  availability_date    date,
  surface_area         numeric(8,2),
  bedrooms             integer,
  bathrooms            integer,
  utilities_included   boolean,
  is_boosted           boolean not null default false,
  boost_expires_at     timestamptz,
  views_count          integer not null default 0,
  likes_count          integer not null default 0,
  saves_count          integer not null default 0,
  shares_count         integer not null default 0,
  contacts_count       integer not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint chk_advance_only_monthly check (price_period = 'month' or advance_months is null),
  constraint chk_availability_date_only_scheduled check (availability_status = 'scheduled' or availability_date is null),
  constraint chk_room_count_only_studio check (property_type = 'studio' or room_count is null)
);

create index idx_listings_owner on listings(owner_id);
create index idx_listings_status on listings(status);
create index idx_listings_created_at on listings(created_at desc);

-- Index de recherche texte : titre + description + localité + nom géocodé,
-- via le wrapper immutable_unaccent() (voir correctif §0bis).
create index idx_listings_search_trgm on listings using gin (
  (immutable_unaccent(
    coalesce(title,'') || ' ' ||
    coalesce(description,'') || ' ' ||
    coalesce(location_label,'') || ' ' ||
    coalesce(geocoded_name,'')
  )) gin_trgm_ops
);

-- 5. PHOTOS
create table listing_photos (
  id          uuid primary key default uuid_generate_v4(),
  listing_id  uuid not null references listings(id) on delete cascade,
  url         text not null,
  position    integer not null default 0
);

create index idx_listing_photos_listing on listing_photos(listing_id, position);

-- 6. LIKES / FAVORIS
create table listing_likes (
  user_id     uuid not null references profiles(id) on delete cascade,
  listing_id  uuid not null references listings(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create table listing_favorites (
  user_id     uuid not null references profiles(id) on delete cascade,
  listing_id  uuid not null references listings(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, listing_id)
);

-- 7. JOURNALISATION
create table listing_views (
  id          uuid primary key default uuid_generate_v4(),
  listing_id  uuid not null references listings(id) on delete cascade,
  viewer_id   uuid references profiles(id) on delete set null,
  viewed_at   timestamptz not null default now()
);

create table contact_clicks (
  id          uuid primary key default uuid_generate_v4(),
  listing_id  uuid not null references listings(id) on delete cascade,
  viewer_id   uuid references profiles(id) on delete set null,
  clicked_at  timestamptz not null default now()
);

create table profile_visits (
  id          uuid primary key default uuid_generate_v4(),
  visited_id  uuid not null references profiles(id) on delete cascade,
  visitor_id  uuid references profiles(id) on delete set null,
  visited_at  timestamptz not null default now()
);

create index idx_listing_views_listing on listing_views(listing_id);
create index idx_contact_clicks_listing on contact_clicks(listing_id);
create index idx_profile_visits_visited on profile_visits(visited_id);

-- 8. PAIEMENTS
create table wallet_transactions (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references profiles(id) on delete cascade,
  type                payment_type not null,
  amount              numeric(12,2) not null,
  provider            payment_provider,
  subscription_tier   subscription_tier,
  related_listing_id  uuid references listings(id) on delete set null,
  created_at          timestamptz not null default now()
);

create index idx_wallet_tx_user on wallet_transactions(user_id, created_at desc);

-- 9. NOTIFICATIONS
create table notifications (
  id            uuid primary key default uuid_generate_v4(),
  recipient_id  uuid not null references profiles(id) on delete cascade,
  category      notification_category not null,
  actor_id      uuid references profiles(id) on delete set null,
  listing_id    uuid references listings(id) on delete set null,
  message       text not null,
  is_read       boolean not null default false,
  grouped_visit_count integer,
  created_at    timestamptz not null default now()
);

create index idx_notifications_recipient on notifications(recipient_id, created_at desc);

-- 10. TRIGGERS
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_listings_updated_at
before update on listings
for each row execute function set_updated_at();

create or replace function enforce_deposit_rule()
returns trigger language plpgsql as $$
begin
  if new.price_period = 'month' then
    new.deposit_amount := new.price_amount;
  end if;
  return new;
end;
$$;

create trigger trg_listings_deposit
before insert or update on listings
for each row execute function enforce_deposit_rule();

create or replace function increment_listing_likes()
returns trigger language plpgsql as $$
begin
  update listings set likes_count = likes_count + 1 where id = new.listing_id;
  update profiles p set total_likes = total_likes + 1
    from listings l where l.id = new.listing_id and l.owner_id = p.id;
  return new;
end;
$$;

create or replace function decrement_listing_likes()
returns trigger language plpgsql as $$
begin
  update listings set likes_count = likes_count - 1 where id = old.listing_id;
  update profiles p set total_likes = total_likes - 1
    from listings l where l.id = old.listing_id and l.owner_id = p.id;
  return old;
end;
$$;

create trigger trg_likes_insert after insert on listing_likes
for each row execute function increment_listing_likes();

create trigger trg_likes_delete after delete on listing_likes
for each row execute function decrement_listing_likes();

create or replace function increment_listing_saves()
returns trigger language plpgsql as $$
begin
  update listings set saves_count = saves_count + 1 where id = new.listing_id;
  return new;
end;
$$;

create or replace function decrement_listing_saves()
returns trigger language plpgsql as $$
begin
  update listings set saves_count = saves_count - 1 where id = old.listing_id;
  return old;
end;
$$;

create trigger trg_favorites_insert after insert on listing_favorites
for each row execute function increment_listing_saves();

create trigger trg_favorites_delete after delete on listing_favorites
for each row execute function decrement_listing_saves();

create or replace function increment_listing_views()
returns trigger language plpgsql as $$
begin
  update listings set views_count = views_count + 1 where id = new.listing_id;
  update profiles p set total_views = total_views + 1
    from listings l where l.id = new.listing_id and l.owner_id = p.id;
  return new;
end;
$$;

create trigger trg_views_insert after insert on listing_views
for each row execute function increment_listing_views();

create or replace function increment_contact_clicks()
returns trigger language plpgsql as $$
begin
  update listings set contacts_count = contacts_count + 1 where id = new.listing_id;
  return new;
end;
$$;

create trigger trg_contact_clicks_insert after insert on contact_clicks
for each row execute function increment_contact_clicks();

create or replace function increment_profile_listings()
returns trigger language plpgsql as $$
begin
  update profiles set listings_count = listings_count + 1 where id = new.owner_id;
  return new;
end;
$$;

create trigger trg_listings_insert after insert on listings
for each row execute function increment_profile_listings();

-- 11. FONCTION DE CONTACT WHATSAPP
create or replace function get_contact_link(p_listing_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_number text;
  v_link   text;
begin
  select pp.whatsapp_number into v_number
  from listings l
  join profile_private pp on pp.id = l.owner_id
  where l.id = p_listing_id;

  if v_number is null then
    raise exception 'Numéro introuvable pour cette annonce';
  end if;

  insert into contact_clicks (listing_id, viewer_id) values (p_listing_id, auth.uid());

  v_link := 'https://wa.me/' || regexp_replace(v_number, '[^0-9]', '', 'g');
  return v_link;
end;
$$;

-- 12. ROW LEVEL SECURITY
alter table profiles enable row level security;
alter table profile_private enable row level security;
alter table listings enable row level security;
alter table listing_photos enable row level security;
alter table listing_likes enable row level security;
alter table listing_favorites enable row level security;
alter table listing_views enable row level security;
alter table contact_clicks enable row level security;
alter table profile_visits enable row level security;
alter table wallet_transactions enable row level security;
alter table notifications enable row level security;

create policy "profiles_public_read" on profiles for select using (true);
create policy "profiles_owner_write" on profiles for update using (auth.uid() = id);

create policy "profile_private_owner_only" on profile_private
  for all using (auth.uid() = id);

create policy "listings_public_read" on listings for select using (status = 'active');
create policy "listings_owner_read_all" on listings for select using (auth.uid() = owner_id);
create policy "listings_owner_write" on listings for insert with check (auth.uid() = owner_id);
create policy "listings_owner_update" on listings for update using (auth.uid() = owner_id);
create policy "listings_owner_delete" on listings for delete using (auth.uid() = owner_id);

create policy "listing_photos_public_read" on listing_photos for select using (true);
create policy "listing_photos_owner_write" on listing_photos for all using (
  exists (select 1 from listings l where l.id = listing_id and l.owner_id = auth.uid())
);

create policy "likes_owner_all" on listing_likes for all using (auth.uid() = user_id);
create policy "favorites_owner_all" on listing_favorites for all using (auth.uid() = user_id);

create policy "views_insert_any" on listing_views for insert with check (true);
create policy "views_owner_read" on listing_views for select using (
  exists (select 1 from listings l where l.id = listing_id and l.owner_id = auth.uid())
);

create policy "contact_clicks_owner_read" on contact_clicks for select using (
  exists (select 1 from listings l where l.id = listing_id and l.owner_id = auth.uid())
);

create policy "profile_visits_insert_any" on profile_visits for insert with check (true);
create policy "profile_visits_owner_read" on profile_visits for select using (auth.uid() = visited_id);

create policy "wallet_tx_owner_only" on wallet_transactions for all using (auth.uid() = user_id);

create policy "notifications_recipient_only" on notifications for all using (auth.uid() = recipient_id);
