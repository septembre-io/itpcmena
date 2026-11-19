import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { resolveLegacyArticle } from "./lib/legacyRedirect";

const intlProxy = createMiddleware(routing);

const LOCALES = new Set<string>(routing.locales);

/**
 * Chemin sans préfixe de langue (anciennes adresses françaises : /actualites/…,
 * /bibliotheque/…, /opinions…) : cible /fr/… à servir en 308.
 *
 * Le préfixage de next-intl répond 307, redirection temporaire qui incitait
 * Google à garder l'ancienne adresse (souvent sur l'apex itpcmena.org) comme
 * canonique (Search Console, motif « Google n'a pas choisi la même URL
 * canonique », 19/11/2026). La racine garde la détection de langue (307), et un
 * visiteur qui a choisi une autre langue (cookie NEXT_LOCALE) garde le
 * comportement de next-intl. Un article d'une autre langue atteint par /fr/ est
 * ensuite renvoyé en 308 vers sa langue (src/app/[locale]/actualites/[slug]).
 */
function prefixlessTarget(request: NextRequest): URL | null {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/") return null;
  if (LOCALES.has(pathname.split("/")[1] ?? "")) return null;
  const chosen = request.cookies.get("NEXT_LOCALE")?.value;
  if (chosen && chosen !== routing.defaultLocale && LOCALES.has(chosen)) return null;
  return new URL(`/${routing.defaultLocale}${pathname}${search}`, request.url);
}

export default async function proxy(request: NextRequest) {
  // Ancienne adresse d'article WordPress absente de redirects.data.json :
  // 301 direct vers l'article, avant le préfixage de langue (qui ferait un 307
  // puis une 404). Next ramène la Location à un chemin relatif (même hôte).
  const target = await resolveLegacyArticle(request.nextUrl.pathname);
  if (target) {
    return NextResponse.redirect(new URL(target, request.url), 301);
  }
  const prefixed = prefixlessTarget(request);
  if (prefixed) {
    return NextResponse.redirect(prefixed, 308);
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
