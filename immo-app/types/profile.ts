// Types du compte utilisateur (profil public + résumé d'annonce pour les
// grilles "Mes annonces" / "Mes favoris").

export interface ProfileSummary {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  isPro: boolean;
  agencyName?: string | null;
  listingsCount: number;
  totalViews: number;
  totalLikes: number;
  createdAt: string;
}

export interface MyListingSummary {
  id: string;
  title: string;
  coverPhoto?: string;
  priceAmount: number;
  pricePeriod: 'day' | 'month';
  status: 'active' | 'rented' | 'expired';
  viewsCount: number;
  likesCount: number;
}
