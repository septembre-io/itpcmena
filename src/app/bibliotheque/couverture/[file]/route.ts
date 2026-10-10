import { NextResponse } from "next/server";
import { getBiblioCover } from "@/lib/bibliotheque";

// Couverture d'un document : /bibliotheque/couverture/RES-011.jpg (l'extension
// de l'URL est indicative, le type réel est envoyé dans Content-Type).
// Cache long côté CDN ; next/image en produit les vignettes.
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const id = (await params).file.replace(/\.(jpe?g|png|webp)$/i, "");
  const cover = await getBiblioCover(id).catch((err) => {
    console.error("[bibliotheque] couverture", id, err);
    return null;
  });
  if (!cover) return new NextResponse("Image introuvable", { status: 404 });
  return new NextResponse(new Uint8Array(cover.body), {
    headers: {
      "Content-Type": cover.type,
      "Cache-Control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
