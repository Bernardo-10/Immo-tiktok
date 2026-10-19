-- Authentification : email/mot de passe ET Google, aucune donnée obligatoire
-- côté profils n'étant fournie par les deux méthodes à la fois (le handle
-- unique et le numéro WhatsApp ne le sont ni par l'un ni par l'autre).
-- Logique poussée en base plutôt que dans le code applicatif, cohérent avec
-- le principe déjà retenu ailleurs dans ce schéma (caution, compteurs).

-- 1. whatsapp_number devient nullable : inconnu tant que l'onboarding n'a
--    pas été complété (obligatoire uniquement à l'usage réel du bouton
--    "Contacter" via get_contact_link(), pas à l'inscription).
alter table profile_private alter column whatsapp_number drop not null;

-- 2. Marqueur explicite de fin d'onboarding (choix du handle + numéro
--    WhatsApp), plutôt que de déduire cet état d'un handle "généré" fragile.
alter table profiles add column onboarding_completed boolean not null default false;

-- 3. Création automatique des lignes profiles/profile_private dès
--    l'inscription dans auth.users (email/mot de passe OU Google) — un
--    handle temporaire unique est généré à partir de l'id, à remplacer
--    obligatoirement lors de l'onboarding.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, handle, display_name, avatar_url, onboarding_completed)
  values (
    new.id,
    'user_' || substr(new.id::text, 1, 8),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    false
  );

  insert into profile_private (id, whatsapp_number, subscription_tier, publications_used)
  values (new.id, null, 'free', 0);

  return new;
end;
$$;

create trigger trg_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();
