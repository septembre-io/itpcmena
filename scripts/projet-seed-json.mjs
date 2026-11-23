// Produit le JSON de préremplissage d'une page projet à partir du repli du front.
//   node --experimental-strip-types scripts/projet-seed-json.mjs > scripts/seed/projet-lancer.json
// (Node 22.6 ou plus ; le drapeau n'est plus nécessaire à partir de Node 23.6.)
import { lancerContent } from "../src/data/lancer.ts";

const out = {
  slug: "lancer",
  titles: { fr: "L.A.N.C.E.R.", en: "L.A.N.C.E.R. (EN)", ar: "L.A.N.C.E.R. (AR)" },
  content: Object.fromEntries(["fr", "en", "ar"].map((l) => [l, lancerContent(l)])),
};
process.stdout.write(JSON.stringify(out, null, 2) + "\n");
