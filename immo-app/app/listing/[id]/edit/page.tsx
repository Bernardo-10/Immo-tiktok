'use client';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getListingById, deleteListing } from '@/lib/supabase/queries/listings';
import { ListingForm } from '@/components/listing/ListingForm';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import type { ListingDetail } from '@/types/listing';

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const ready = useAuthGuard();
  const [listing, setListing] = useState<ListingDetail | null>(null);

  useEffect(() => {
    if (ready) getListingById(id).then(setListing);
  }, [id, ready]);

  if (!ready || !listing) return <LoadingScreen />;

  // Suppression : passe par delete_listing_and_notify() côté base, qui
  // notifie les favoris avant de supprimer réellement la ligne.
  const handleDelete = async () => {
    if (!confirm('Supprimer définitivement cette annonce ?')) return;
    await deleteListing(listing.id);
    router.push('/');
  };

  return (
    <div>
      <ListingForm
        listingId={listing.id}
        initialValues={{
          title: listing.title,
          description: listing.description,
          propertyType: listing.propertyType,
          roomCount: listing.roomCount ?? undefined,
          furnished: listing.furnished,
          priceAmount: listing.priceAmount,
          pricePeriod: listing.pricePeriod,
          advanceMonths: listing.advanceMonths ?? undefined,
          depositAmount: listing.depositAmount,
          surfaceArea: listing.surfaceArea ?? undefined,
          bedrooms: listing.bedrooms ?? undefined,
          bathrooms: listing.bathrooms ?? undefined,
          availabilityStatus: listing.availabilityStatus ?? undefined,
          availabilityDate: listing.availabilityDate ?? undefined,
          status: listing.status,
        }}
      />
      <div className="p-4">
        <button
          onClick={handleDelete}
          className="w-full rounded-lg border border-red-500 py-3 text-sm font-medium text-red-500"
        >
          Supprimer l'annonce
        </button>
      </div>
    </div>
  );
}
