import type { WalletTransaction } from '@/types/payment';

const TYPE_LABEL: Record<string, string> = {
  recharge: 'Recharge',
  subscription: 'Abonnement',
  boost: 'Boost',
  special_offer: 'Offre spéciale',
};

// Distingue clairement la nature de chaque mouvement (rapport_paiement.md §6).
export function TransactionHistory({ transactions }: { transactions: WalletTransaction[] }) {
  if (transactions.length === 0) {
    return <p className="p-4 text-center text-sm text-ink-muted">Aucun mouvement pour l'instant.</p>;
  }

  return (
    <div className="divide-y">
      {transactions.map((t) => (
        <div key={t.id} className="flex items-center justify-between p-3 text-sm">
          <div>
            <p className="font-medium">{TYPE_LABEL[t.type]}</p>
            <p className="text-xs text-ink-muted">{new Date(t.createdAt).toLocaleDateString('fr-FR')}</p>
          </div>
          <p className={t.amount >= 0 ? 'text-brand-600' : 'text-gray-700'}>
            {t.amount >= 0 ? '+' : ''}
            {t.amount.toLocaleString('fr-FR')} FCFA
          </p>
        </div>
      ))}
    </div>
  );
}
