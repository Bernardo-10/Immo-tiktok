'use client';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getListingById } from '@/lib/supabase/queries/listings';
import { createClient } from '@/lib/supabase/client';
import { ListingDetail } from '@/components/listing/ListingDetail';
import type { ListingDetail as ListingDetailData } from '@/types/listing';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<ListingDetailData | null>(null);
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    getListingById(id).then(setListing);
    createClient()
      .auth.getUser()
      .then(({ data }) => setUserId(data.user?.id));
  }, [id]);

  if (!listing) return <LoadingScreen />;

  return <ListingDetail listing={listing} currentUserId={userId} />;
}
