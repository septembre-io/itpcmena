import { NextResponse } from "next/server";
import { getBiblioFile } from "@/lib/bibliotheque";

// PDF de la bibliothèque, à une adresse stable du site : /bibliotheque/pdf/RES-011.pdf
// (hors préfixe de langue : le middleware i18n ignore les chemins avec extension).
// Le fichier est lu dans Dropbox et mis en cache par le CDN ; seuls les PDF
// trop lourds pour une réponse de fonction serveur sont redirigés vers un lien
// temporaire Dropbox (voir PROXY_MAX_BYTES).
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const id = (await params).file.replace(/\.pdf$/i, "");
  const file = await getBiblioFile(id).catch((err) => {
    console.error("[bibliotheque] fichier", id, err);
    return null;
  });
  if (!file) return new NextResponse("Document introuvable", { status: 404 });
  if ("link" in file) {
    return NextResponse.redirect(file.link, {
      status: 302,
      headers: { "Cache-Control": "no-store" },
    });
  }
  return new NextResponse(new Uint8Array(file.body), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "Cache-Control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
