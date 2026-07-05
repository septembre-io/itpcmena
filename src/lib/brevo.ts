import type { PostLang } from "./wordpress";

const BREVO_CONTACTS_API = "https://api.brevo.com/v3/contacts";

export type BrevoResult =
  | { ok: true; created: boolean }
  | { ok: false; reason: "config" | "brevo"; status?: number };

/**
 * Inscrit (ou met à jour) un contact dans Brevo, avec la langue de l'inscription
 * stockée dans un attribut de contact — c'est le « contexte de langue » demandé.
 *
 * `updateEnabled: true` fait qu'une ré-inscription MET À JOUR le contact (et sa
 * langue) au lieu d'échouer avec « Contact already exist ».
 *
 * Config via variables d'environnement (serveur only, jamais exposées au client) :
 *   BREVO_API_KEY        clé API v3
 *   BREVO_LIST_ID        id numérique de la liste newsletter
 *   BREVO_LANG_ATTRIBUTE nom de l'attribut langue (défaut « LANG ») — doit
 *                        exister côté Brevo (Contacts → Paramètres → Attributs).
 */
export async function subscribeToBrevo(
  email: string,
  locale: PostLang
): Promise<BrevoResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LIST_ID);
  const langAttr = process.env.BREVO_LANG_ATTRIBUTE || "LANG";

  if (!apiKey || !listId) return { ok: false, reason: "config" };

  try {
    const res = await fetch(BREVO_CONTACTS_API, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        email,
        attributes: { [langAttr]: locale },
        listIds: [listId],
        updateEnabled: true,
      }),
      cache: "no-store",
    });

    // 201 = contact créé, 204 = contact existant mis à jour (updateEnabled)
    if (res.status === 201) return { ok: true, created: true };
    if (res.status === 204) return { ok: true, created: false };
    // Remonte le détail de l'erreur Brevo dans les logs serveur (jamais au client).
    const detail = await res.text().catch(() => "");
    console.error(`[brevo] échec ${res.status}: ${detail}`);
    return { ok: false, reason: "brevo", status: res.status };
  } catch (err) {
    console.error("[brevo] requête échouée:", err);
    return { ok: false, reason: "brevo" };
  }
}
