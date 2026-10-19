'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import { initiateRecharge } from '@/lib/supabase/queries/payments';
import type { PaymentProvider } from '@/types/payment';

// Sélection d'opérateur + numéro — le flux manquant identifié dans le
// rapport de fusion (§7.2 : "le bouton Recharger existe, mais aucun flux de
// sélection d'opérateur ni de saisie de numéro"). L'intégration réelle
// derrière initiateRecharge() reste à faire (voir rapport d'activité).
export function RechargeModal({ onClose }: { onClose: () => void }) {
  const [provider, setProvider] = useState<PaymentProvider>('orange_money');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await initiateRecharge(amount, provider, phone);
      onClose();
    } catch (e: any) {
      setError(e.message ?? 'La recharge a échoué.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40 md:items-center md:justify-center">
      <div className="w-full rounded-t-2xl bg-white p-4 md:w-96 md:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recharger le solde</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="mb-3 flex gap-2">
          {(['orange_money', 'mtn_momo'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setProvider(p)}
              className={`flex-1 rounded-lg border py-2 text-sm ${provider === p ? 'border-brand-600 bg-brand-50' : ''}`}
            >
              {p === 'orange_money' ? 'Orange Money' : 'MTN MoMo'}
            </button>
          ))}
        </div>

        <label className="mb-1 block text-sm font-medium">
          Numéro {provider === 'orange_money' ? 'Orange Money' : 'MTN MoMo'}
        </label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="ex: 6XX XXX XXX"
          className="mb-3 w-full rounded border px-3 py-2 text-sm"
        />

        <label className="mb-1 block text-sm font-medium">Montant (FCFA)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mb-3 w-full rounded border px-3 py-2 text-sm"
        />

        {error && <p className="mb-2 text-sm text-red-500">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading || !phone}
          className="w-full rounded-lg bg-brand-600 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? 'Traitement...' : 'Confirmer la recharge'}
        </button>
      </div>
    </div>
  );
}
