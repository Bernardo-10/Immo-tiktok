'use client';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import { getPaymentSummary, getTransactionHistory } from '@/lib/supabase/queries/payments';
import { WalletCard } from '@/components/payments/WalletCard';
import { RechargeModal } from '@/components/payments/RechargeModal';
import { SubscriptionTiers } from '@/components/payments/SubscriptionTiers';
import { TransactionHistory } from '@/components/payments/TransactionHistory';
import type { PaymentSummary, WalletTransaction } from '@/types/payment';

export default function PaymentsPage() {
  const ready = useAuthGuard();
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [showRecharge, setShowRecharge] = useState(false);

  const reload = () => {
    getPaymentSummary().then(setSummary);
    getTransactionHistory().then(setTransactions);
  };

  useEffect(() => {
    if (ready) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  if (!ready || !summary) return <LoadingScreen />;

  return (
    <div className="pb-8">
      <WalletCard summary={summary} onRecharge={() => setShowRecharge(true)} />
      <SubscriptionTiers currentTier={summary.subscriptionTier} onPaid={reload} />

      <div className="mt-4">
        <h2 className="px-4 text-sm font-semibold text-ink-muted">Historique</h2>
        <TransactionHistory transactions={transactions} />
      </div>

      {showRecharge && (
        <RechargeModal
          onClose={() => {
            setShowRecharge(false);
            reload();
          }}
        />
      )}
    </div>
  );
}
