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
  async redirects() {
    return redirectData.map(({ source, destination }) => ({
      source,
      destination,
      permanent: true,
    }));
  },
};

export default withNextIntl(nextConfig);
