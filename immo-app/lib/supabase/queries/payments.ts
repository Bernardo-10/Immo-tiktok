import { createClient } from '@/lib/supabase/client';
import type { PaymentProvider, SubscriptionTier, WalletTransaction, PaymentSummary } from '@/types/payment';

export async function getPaymentSummary(): Promise<PaymentSummary | null> {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from('profile_private')
    .select('wallet_balance, subscription_tier, subscription_expires_at, publications_used')
    .eq('id', userId)
    .single();
  if (error || !data) return null;

  return {
    walletBalance: data.wallet_balance,
    subscriptionTier: data.subscription_tier,
    subscriptionExpiresAt: data.subscription_expires_at,
    publicationsUsed: data.publications_used,
  };
}

export async function getTransactionHistory(): Promise<WalletTransaction[]> {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return [];

  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('id, type, amount, provider, subscription_tier, related_listing_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    type: row.type,
    amount: row.amount,
    provider: row.provider,
    subscriptionTier: row.subscription_tier,
    relatedListingId: row.related_listing_id,
    createdAt: row.created_at,
  }));
}

// Paiement d'abonnement : débit interne du porte-monnaie, jamais un nouvel
// appel aux API Orange Money/MTN MoMo — un seul point de contact externe,
// la recharge (rapport_paiement.md §1). Sûr à exposer côté client : le prix
// est déterminé côté serveur (pay_subscription), jamais fourni par l'appelant.
export async function paySubscription(tier: Exclude<SubscriptionTier, 'free'>) {
  const supabase = createClient();
  const { error } = await supabase.rpc('pay_subscription', { p_tier: tier });
  if (error) throw error;
}

// Initie une recharge via une route serveur — l'intégration réelle Orange
// Money/MTN MoMo n'est PAS implémentée (voir rapport d'activité) : seule
// l'architecture est en place. Le crédit réel du solde ne doit avoir lieu
// qu'après confirmation du fournisseur, jamais directement depuis ce client.
export async function initiateRecharge(amount: number, provider: PaymentProvider, phoneNumber: string) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error('Utilisateur non authentifié');

  const res = await fetch('/api/payments/recharge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, amount, provider, phoneNumber }),
  });
  if (!res.ok) throw new Error('La recharge a échoué.');
}
