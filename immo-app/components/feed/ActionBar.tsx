'use client';
import { Heart, Bookmark, Share2, MessageCircle } from 'lucide-react';
import { getContactLink } from '@/lib/supabase/queries/listings';

type ActionBarProps = {
  listingId: string;
  likesCount: number;
  savesCount: number;
  sharesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
};

// Composant unique, réutilisé à l'identique sur le Feed et la Fiche annonce
// détaillée — évite les implémentations divergentes d'un même bouton
// identifiées comme faiblesse dans la V2 (rapport_fusion_maquettes_figma.md).
export function ActionBar({
  listingId,
  likesCount,
  savesCount,
  sharesCount,
  isLiked,
  isSaved,
  onLike,
  onSave,
  onShare,
}: ActionBarProps) {
  const handleContact = async () => {
    const link = await getContactLink(listingId);
    window.open(link, '_blank');
  };

  return (
    <div className="flex flex-col items-center gap-4 text-white">
      <button onClick={onLike} className="flex flex-col items-center gap-0.5">
        <Heart fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'text-red-500' : ''} />
        <span className="text-xs">{likesCount}</span>
      </button>
      <button onClick={onSave} className="flex flex-col items-center gap-0.5">
        <Bookmark fill={isSaved ? 'currentColor' : 'none'} className={isSaved ? 'text-amber-400' : ''} />
        <span className="text-xs">{savesCount}</span>
      </button>
      <button onClick={onShare} className="flex flex-col items-center gap-0.5">
        <Share2 />
        <span className="text-xs">{sharesCount}</span>
      </button>
      <button onClick={handleContact} className="flex flex-col items-center gap-0.5 text-green-400">
        <MessageCircle fill="currentColor" />
        <span className="text-xs">Contacter</span>
      </button>
    </div>
  );
}
