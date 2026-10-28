import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Skip API routes, Next.js internals and static files, and old document
    // addresses (handled by src/app/wp-content/uploads/[...path])
    "/((?!api|_next|_vercel|wp-content|IMG|dev/itpc-mena|fr/wp-content|en/wp-content|ar/wp-content|.*\\..*).*)",
  ],
};
