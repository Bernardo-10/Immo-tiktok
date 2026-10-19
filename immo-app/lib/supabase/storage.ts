import { createClient } from '@/lib/supabase/client';

const BUCKET = 'listing-photos';

// Upload séquentiel, dans l'ordre choisi par l'annonceur — aucun outil de
// montage/recadrage intégré (cahier des charges §3). Appelé uniquement à la
// publication finale : les photos restent en mémoire (File[]) pendant tout
// le parcours du formulaire, ce qui évite d'avoir à gérer des photos
// orphelines si l'utilisateur abandonne avant la fin.
export async function uploadListingPhotos(listingId: string, files: File[]): Promise<string[]> {
  const supabase = createClient();
  const urls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const path = `${listingId}/${Date.now()}-${i}-${file.name}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return urls;
}
