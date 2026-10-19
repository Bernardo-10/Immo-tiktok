'use client';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import { PublishWizard } from '@/components/publish/PublishWizard';

export default function PublishPage() {
  const ready = useAuthGuard();
  if (!ready) return <p className="p-4 text-sm text-ink-muted">Vérification de la session...</p>;
  return <PublishWizard />;
}
