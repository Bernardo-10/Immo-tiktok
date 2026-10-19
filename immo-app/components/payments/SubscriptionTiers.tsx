'use client';
import { useState } from 'react';
import { TIER_PRICES, TIER_QUOTAS } from '@/types/payment';
import { paySubscription } from '@/lib/supabase/queries/payments';
import type { SubscriptionTier } from '@/types/payment';

const TIER_LABEL: Record<SubscriptionTier, string> = { free: 'Gratuit', standard: 'Standard', premium: 'Premium' };

// Tarifs et quotas affichés ici sont ceux, provisoires, définis côté base
// dans pay_subscription() — à synchroniser si les valeurs changent (cf.
// point ouvert : jamais validés avec Bernardo).
export function SubscriptionTiers({ currentTier, onPaid }: { currentTier: SubscriptionTier; onPaid: () => void }) {
  const [paying, setPaying] = useState<SubscriptionTier | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async (tier: Exclude<SubscriptionTier, 'free'>) => {
    setPaying(tier);
    setError(null);
    try {
      await paySubscription(tier);
      onPaid();
    } catch (e: any) {
      setError(
        e.message?.includes('insuffisant') ? 'Solde insuffisant — rechargez votre porte-monnaie.' : 'Le paiement a échoué.'
      );
    } finally {
      setPaying(null);
    }
  };

  return (
    <div className="space-y-3 p-4">
      <h2 className="text-sm font-semibold text-ink-muted">Paliers</h2>
      {(['free', 'standard', 'premium'] as const).map((tier) => (
        <div key={tier} className={`rounded-lg border p-3 ${currentTier === tier ? 'border-brand-600 bg-brand-50' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{TIER_LABEL[tier]}</p>
              <p className="text-xs text-ink-muted">
                {TIER_QUOTAS[tier] === null ? 'Publications illimitées' : `${TIER_QUOTAS[tier]} publication(s) active(s)`}
              </p>
            </div>
            {tier !== 'free' && currentTier !== tier && (
              <button
                onClick={() => handlePay(tier as Exclude<SubscriptionTier, 'free'>)}
                disabled={paying !== null}
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
              >
                {paying === tier ? '...' : `${TIER_PRICES[tier as Exclude<SubscriptionTier, 'free'>].toLocaleString('fr-FR')} FCFA/mois`}
              </button>
            )}
            {currentTier === tier && <span className="text-xs font-medium text-brand-700">Actif</span>}
          </div>
        </div>
      ))}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-xs text-ink-muted">Tarifs provisoires, non encore validés — cf. rapport d'activité.</p>
    </div>
  );
}
