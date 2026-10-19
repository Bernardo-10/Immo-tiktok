import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/navigation/AppShell';

export const metadata: Metadata = {
  title: 'Immo App',
  description: 'Trouvez un logement à louer, façon TikTok.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-paper text-ink">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
