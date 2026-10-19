import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// ⚠️ STUB D'ARCHITECTURE — NE PAS DÉPLOYER TEL QUEL
//
// Cette route illustre où l'intégration Orange Money / MTN MoMo doit se
// brancher, mais n'appelle aucune API réelle d'opérateur. Elle crédite
// aujourd'hui le porte-monnaie SANS vérifier qu'un paiement a réellement eu
// lieu — c'est un bug de sécurité si mis en production tel quel.
//
// Ce qui reste à faire avant tout déploiement :
//   1. Appeler l'API Orange Money / MTN MoMo avec `phoneNumber` + `amount`
//      pour initier réellement la demande de paiement (nécessite un compte
//      marchand + clés API, non fournis à ce stade du projet) ;
//   2. Ne jamais appeler credit_wallet() depuis cette route directement —
//      seulement depuis un gestionnaire de webhook séparé qui reçoit et
//      vérifie la confirmation signée du fournisseur ;
//   3. Gérer les cas d'échec/timeout du paiement (ne rien créditer).
// ============================================================================
export async function POST(req: NextRequest) {
  const { userId, amount, provider, phoneNumber } = await req.json();

  // TODO : initier le paiement auprès du fournisseur (phoneNumber, amount)
  // et attendre la confirmation via un webhook dédié — pas ici.

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // clé secrète, jamais exposée au navigateur
  );

  // Placeholder uniquement — à retirer une fois le webhook de confirmation
  // en place (voir avertissement ci-dessus).
  const { error } = await supabaseAdmin.rpc('credit_wallet', {
    p_user_id: userId,
    p_amount: amount,
    p_provider: provider,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
