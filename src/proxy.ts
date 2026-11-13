import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { resolveLegacyArticle } from "./lib/legacyRedirect";

const intlProxy = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // Ancienne adresse d'article WordPress absente de redirects.data.json :
  // 301 direct vers l'article, avant le préfixage de langue (qui ferait un 307
  // puis une 404). Next ramène la Location à un chemin relatif (même hôte).
  const target = await resolveLegacyArticle(request.nextUrl.pathname);
  if (target) {
    return NextResponse.redirect(new URL(target, request.url), 301);
  }
  return intlProxy(request);
}

export const config = {
  matcher: [
    // Skip API routes, Next.js internals and static files, and old document
    // addresses (handled by src/app/wp-content/uploads/[...path])
    "/((?!api|_next|_vercel|wp-content|IMG|dev/itpc-mena|fr/wp-content|en/wp-content|ar/wp-content|.*\\..*).*)",
  ],
};
