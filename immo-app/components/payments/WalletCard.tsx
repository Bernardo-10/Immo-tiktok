import type { PaymentSummary } from '@/types/payment';

const TIER_LABEL: Record<string, string> = { free: 'Gratuit', standard: 'Standard', premium: 'Premium' };

export function WalletCard({ summary, onRecharge }: { summary: PaymentSummary; onRecharge: () => void }) {
  return (
    <div className="m-4 rounded-xl bg-brand-600 p-5 text-white">
      <p className="text-sm opacity-80">Solde du porte-monnaie</p>
      <p className="text-3xl font-semibold">{summary.walletBalance.toLocaleString('fr-FR')} FCFA</p>

      <button onClick={onRecharge} className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-medium text-brand-700">
        Recharger le solde
      </button>

      <div className="mt-4 border-t border-white/30 pt-3 text-sm">
        <p>
          Palier actuel : <span className="font-medium">{TIER_LABEL[summary.subscriptionTier]}</span>
        </p>
        {summary.subscriptionTier !== 'free' && summary.subscriptionExpiresAt && (
          <p className="opacity-90">
            Expire le {new Date(summary.subscriptionExpiresAt).toLocaleDateString('fr-FR')}
          </p>
        )}
      </div>
    </div>
  );
}
