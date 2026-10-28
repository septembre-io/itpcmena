import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const withNextIntl = createNextIntlPlugin();

// Redirections 301 des anciennes URLs WordPress vers les routes du front v3.
// Table générée par scripts/gen-redirects.mjs depuis l'inventaire WP.
// (Les sources unicode/arabe sont percent-encodées par le générateur.)
const redirectData: Array<{ source: string; destination: string }> = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("./src/redirects.data.json", import.meta.url)),
    "utf8",
  ),
);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "itpcmena.org" },
      { protocol: "https", hostname: "wphead.itpcmena.org" },
      { protocol: "https", hostname: "i0.wp.com" },
      { protocol: "https", hostname: "secure.gravatar.com" },
    ],
  },
  // Anciennes adresses de documents (WordPress, SPIP, recette) : réécrites vers la
  // route src/app/wp-content/uploads/[...path], qui redirige vers le fichier réel
  // sur wphead (voir src/lib/anciensDocuments.ts).
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/:locale(fr|en|ar)/wp-content/uploads/:path*", destination: "/wp-content/uploads/:path*" },
        { source: "/dev/itpc-mena/wp-content/uploads/:path*", destination: "/wp-content/uploads/:path*" },
        { source: "/IMG/:path*", destination: "/wp-content/uploads/IMG/:path*" },
        { source: "/dev/itpc-mena/IMG/:path*", destination: "/wp-content/uploads/IMG/:path*" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async redirects() {
    return [
      // Domaine canonique : itpcmena.org (sans www) -> https://www.itpcmena.org, en 301.
      // Règle provisoire, en attendant la redirection par nginx (vps-deploy) : une fois
      // celle-ci en place, les requêtes sans www n'atteignent plus l'app et ce bloc
      // peut être retiré. Exclus : ressources Next (_next), API, et anciennes adresses
      // de documents (redirigées directement vers wphead, en un seul saut).
      {
        source:
          "/:path((?!_next/|api/|wp-content/|IMG/|dev/itpc-mena/|fr/wp-content/|en/wp-content/|ar/wp-content/).*)",
        has: [{ type: "host" as const, value: "itpcmena.org" }],
        destination: "https://www.itpcmena.org/:path",
        statusCode: 301 as const,
      },
      ...redirectData.map(({ source, destination }) => ({
        source,
        destination,
        permanent: true,
      })),
    ];
  },
};

export default withNextIntl(nextConfig);
