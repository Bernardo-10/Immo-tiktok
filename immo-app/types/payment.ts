export type PaymentType = 'recharge' | 'subscription' | 'boost' | 'special_offer';
export type PaymentProvider = 'orange_money' | 'mtn_momo';
export type SubscriptionTier = 'free' | 'standard' | 'premium';

export interface PaymentSummary {
  walletBalance: number;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiresAt?: string | null;
  publicationsUsed: number;
}

export interface WalletTransaction {
  id: string;
  type: PaymentType;
  amount: number;
  provider?: PaymentProvider | null;
  subscriptionTier?: SubscriptionTier | null;
  relatedListingId?: string | null;
  createdAt: string;
}

// Quotas et tarifs PROVISOIRES — jamais validés avec Bernardo, point ouvert
// signalé dans le rapport d'activité correspondant.
export const TIER_QUOTAS: Record<SubscriptionTier, number | null> = {
  free: 2,
  standard: 10,
  premium: null, // illimité
};

export const TIER_PRICES: Record<Exclude<SubscriptionTier, 'free'>, number> = {
  standard: 2000,
  premium: 5000,
};
