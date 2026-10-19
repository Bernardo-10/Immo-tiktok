import { createClient } from '@/lib/supabase/client';

export async function signUpWithEmail(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// Redirige vers Google, puis vers /auth/callback (route imposée par le flux
// OAuth) qui décide ensuite où renvoyer l'utilisateur.
export async function signInWithGoogle() {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      // Force Google à proposer le choix du compte, au lieu de réutiliser
      // silencieusement le compte déjà ouvert dans le navigateur (utile sur un
      // ordinateur partagé ou emprunté).
      queryParams: { prompt: 'select_account' },
    },
  });
  if (error) throw error;
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function getCurrentUserProfile() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, handle, display_name, avatar_url, is_pro, onboarding_completed')
    .eq('id', userData.user.id)
    .single();

  if (error) return null;
  return data;
}

// Étape obligatoire après la toute première connexion (email/mot de passe OU
// Google) : ni l'une ni l'autre ne fournissent de handle unique, et aucune
// des deux ne fournit le numéro WhatsApp (rapport_proprietes_utilisateur.md §2-3).
export async function completeOnboarding(input: { handle: string; whatsappNumber: string; displayName?: string }) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error('Utilisateur non authentifié');

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      handle: input.handle,
      ...(input.displayName ? { display_name: input.displayName } : {}),
      onboarding_completed: true,
    })
    .eq('id', userId);
  if (profileError) throw profileError;

  const { error: privateError } = await supabase
    .from('profile_private')
    .update({ whatsapp_number: input.whatsappNumber })
    .eq('id', userId);
  if (privateError) throw privateError;
}
