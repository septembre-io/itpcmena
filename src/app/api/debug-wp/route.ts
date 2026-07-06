import { NextResponse } from "next/server";

// Route de diagnostic temporaire : dit quelle URL WP est réellement utilisée en
// prod et si le serveur Vercel arrive à la joindre. À SUPPRIMER une fois réglé.
export const dynamic = "force-dynamic";

export async function GET() {
  const wpUrl = process.env.NEXT_PUBLIC_WP_URL ?? "https://itpcmena.org";
  const target = `${wpUrl}/wp-json/wp/v2/posts?per_page=1&_fields=id,slug`;

  let status = 0;
  let ok = false;
  let sample: unknown = null;
  try {
    const res = await fetch(target, { cache: "no-store" });
    status = res.status;
    ok = res.ok;
    const text = await res.text();
    // On renvoie un extrait brut : si c'est du HTML (redirection vers le front),
    // on le verra ; si c'est du JSON d'articles, la connexion WP est bonne.
    sample = text.slice(0, 300);
  } catch (e) {
    sample = `FETCH ERROR: ${String(e)}`;
  }

  return NextResponse.json({ wpUrl, target, status, ok, sample });
}
