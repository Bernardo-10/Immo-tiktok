-- Porte-monnaie électronique, paiement d'abonnement, renouvellement
-- automatique (pg_cron) et rappel avant expiration — cf. rapport_paiement.md.
--
-- Tarifs (2000 FCFA/mois Standard, 5000 FCFA/mois Premium) et quotas
-- (2 / 10 / illimité) sont PROVISOIRES, jamais validés avec Bernardo —
-- point ouvert signalé dans le rapport d'activité correspondant.

-- 1. Paiement d'abonnement : callable directement par le client authentifié
--    (RPC), sûr car le prix est déterminé côté serveur, jamais fourni par le
--    client, et le débit ne porte que sur le solde de l'appelant (auth.uid()).
create or replace function pay_subscription(p_tier subscription_tier)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_price numeric;
  v_balance numeric;
begin
  if p_tier = 'free' then
    raise exception 'Le palier gratuit ne nécessite aucun paiement';
  end if;

  v_price := case p_tier
    when 'standard' then 2000
    when 'premium' then 5000
  end;

  select wallet_balance into v_balance from profile_private where id = v_user;

  if v_balance is null or v_balance < v_price then
    raise exception 'Solde insuffisant';
  end if;

  -- Renouvellement anticipé : prolonge à partir de l'expiration existante si
  -- elle est encore future, sinon repart de maintenant (rattrapage après
  -- expiration déjà passée) — comportement hybride façon Netflix déjà validé.
  update profile_private
  set wallet_balance = wallet_balance - v_price,
      subscription_tier = p_tier,
      subscription_expires_at = greatest(coalesce(subscription_expires_at, now()), now()) + interval '1 month'
  where id = v_user;

  insert into wallet_transactions (user_id, type, amount, subscription_tier)
  values (v_user, 'subscription', -v_price, p_tier);

  insert into notifications (recipient_id, category, message)
  values (v_user, 'system', 'Paiement confirmé — palier ' || initcap(p_tier::text) || ' activé');
end;
$$;

-- 2. Crédit du porte-monnaie après recharge — NE DOIT JAMAIS être appelable
--    par un utilisateur authentifié avec un montant de son choix (sinon
--    n'importe qui pourrait se créditer gratuitement). Réservé au rôle
--    service_role, utilisé uniquement côté serveur (route API), après
--    confirmation réelle du paiement par Orange Money/MTN MoMo.
create or replace function credit_wallet(p_user_id uuid, p_amount numeric, p_provider payment_provider)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_amount <= 0 then
    raise exception 'Montant de recharge invalide';
  end if;

  update profile_private set wallet_balance = wallet_balance + p_amount where id = p_user_id;
  insert into wallet_transactions (user_id, type, amount, provider) values (p_user_id, 'recharge', p_amount, p_provider);
end;
$$;

revoke execute on function credit_wallet(uuid, numeric, payment_provider) from public;
revoke execute on function credit_wallet(uuid, numeric, payment_provider) from anon;
revoke execute on function credit_wallet(uuid, numeric, payment_provider) from authenticated;
-- Seul service_role (clé secrète, jamais exposée au navigateur) peut exécuter
-- cette fonction.

-- 3. Renouvellement automatique à l'échéance exacte (tâche planifiée
--    quotidienne) — débit automatique si solde suffisant, sinon notification
--    "tier" plutôt qu'une rétrogradation silencieuse au palier gratuit.
create or replace function renew_expiring_subscriptions()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  v_price numeric;
begin
  for r in
    select id, subscription_tier, wallet_balance
    from profile_private
    where subscription_tier <> 'free'
      and subscription_expires_at is not null
      and subscription_expires_at <= now()
  loop
    v_price := case r.subscription_tier when 'standard' then 2000 when 'premium' then 5000 else 0 end;

    if r.wallet_balance >= v_price then
      update profile_private
      set wallet_balance = wallet_balance - v_price,
          subscription_expires_at = now() + interval '1 month'
      where id = r.id;

      insert into wallet_transactions (user_id, type, amount, subscription_tier)
      values (r.id, 'subscription', -v_price, r.subscription_tier);

      insert into notifications (recipient_id, category, message)
      values (r.id, 'system', 'Paiement confirmé — palier ' || initcap(r.subscription_tier::text) || ' activé');
    else
      insert into notifications (recipient_id, category, message)
      values (r.id, 'tier', 'Solde insuffisant pour renouveler votre abonnement — rechargez votre porte-monnaie pour réessayer');
      -- Le palier affiché n'est PAS rétrogradé ici : le blocage réel de la
      -- publication au-delà du quota/abonnement expiré reste un point
      -- ouvert, pas encore implémenté (cf. rapport d'activité).
    end if;
  end loop;
end;
$$;

-- 4. Rappel avant échéance ("votre abonnement expire dans 3 jours"),
--    cf. rapport_notifications.md catégorie E.
create or replace function send_subscription_expiry_reminders()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into notifications (recipient_id, category, message)
  select id, 'tier', 'Votre abonnement expire dans 3 jours'
  from profile_private
  where subscription_tier <> 'free'
    and subscription_expires_at is not null
    and subscription_expires_at::date = (now() + interval '3 days')::date;
end;
$$;

-- 5. Planification (à exécuter une fois l'extension pg_cron activée dans
--    Supabase : Database > Extensions) :
--
-- select cron.schedule('renew-subscriptions-daily', '0 2 * * *',
--   $$select renew_expiring_subscriptions();$$);
-- select cron.schedule('subscription-reminders-daily', '0 8 * * *',
--   $$select send_subscription_expiry_reminders();$$);
