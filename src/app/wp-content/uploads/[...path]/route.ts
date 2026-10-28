import { NextResponse } from "next/server";
import { resolveAncienDocument } from "@/lib/anciensDocuments";

// Anciennes adresses de documents : /wp-content/uploads/…, et par réécriture
// (next.config.ts) /fr|en|ar/wp-content/uploads/…, /dev/itpc-mena/…, /IMG/….
// Redirection 301 vers le fichier réel sur wphead, sinon 404 trilingue qui
// renvoie vers la bibliothèque. Le proxy i18n ne traite pas ces chemins.

function decodeSegment(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const rel = (await params).path.map(decodeSegment).join("/");
  const target = await resolveAncienDocument(rel).catch((err) => {
    console.error("[anciens-documents]", rel, err);
    return null;
  });
  if (target) {
    return NextResponse.redirect(target, {
      status: 301,
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  }
  return new NextResponse(NOT_FOUND_HTML, {
    status: 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

const NOT_FOUND_HTML = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="robots" content="noindex">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Document introuvable · ITPC MENA</title></head>
<body style="font-family:system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1rem;line-height:1.5;color:#0b0f0e;background:#f7f6f2">
<h1>Document introuvable</h1>
<p>Ce document a été déplacé ou n’est plus disponible. Retrouvez les publications d’ITPC MENA dans la <a href="/fr/bibliotheque">bibliothèque</a>.</p>
<p lang="en">This document has moved or is no longer available. Browse ITPC MENA publications in the <a href="/en/bibliotheque">library</a>.</p>
<p dir="rtl" lang="ar">لم يتم العثور على هذا المستند. يمكنكم الاطلاع على منشورات ITPC MENA في <a href="/ar/bibliotheque">المكتبة</a>.</p>
</body></html>`;
