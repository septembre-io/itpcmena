/**
 * Rate-limit en mémoire, par clé (IP), fenêtre glissante.
 *
 * Suffisant comme garde-fou anti-abus sur une route serverless : la mémoire est
 * par instance et éphémère, donc ce n'est pas un quota distribué strict. Pour du
 * distribué garanti (multi-régions, forte charge) → Upstash Redis / Vercel KV.
 */
const hits = new Map<string, number[]>();

/** Retourne true si la requête est autorisée, false si la limite est atteinte. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }

  recent.push(now);
  hits.set(key, recent);

  // Nettoyage opportuniste pour éviter que la Map ne grossisse indéfiniment.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  }
  return true;
}
