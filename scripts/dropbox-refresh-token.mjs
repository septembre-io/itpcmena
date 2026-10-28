#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Obtenir le jeton de rafraîchissement Dropbox de la bibliothèque (une fois).
//
// 1. node scripts/dropbox-refresh-token.mjs <APP_KEY>
//    → affiche un lien. La personne qui autorise (compte membre de l'équipe
//      ITPC MENA ayant accès en lecture au dossier d'équipe « Bibliotheque_itpc_mena »)
//      l'ouvre, accepte, et copie le code affiché par Dropbox.
// 2. node scripts/dropbox-refresh-token.mjs <APP_KEY> <CODE>
//    → affiche DROPBOX_REFRESH_TOKEN à reporter dans les variables
//      d'environnement de l'application sur aout.app.
//
// Flux PKCE sans secret : aucun secret d'application n'est nécessaire. Le
// vérificateur est conservé entre les deux appels dans .dropbox-pkce (ignoré
// par git, supprimé automatiquement au second appel).
// ---------------------------------------------------------------------------

import crypto from "node:crypto";
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";

const [appKey, code] = process.argv.slice(2);
const STORE = ".dropbox-pkce";

if (!appKey) {
  console.error("Usage : node scripts/dropbox-refresh-token.mjs <APP_KEY> [CODE]");
  process.exit(1);
}

if (!code) {
  const verifier = crypto.randomBytes(48).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  writeFileSync(STORE, verifier, { mode: 0o600 });
  const url = new URL("https://www.dropbox.com/oauth2/authorize");
  url.search = new URLSearchParams({
    client_id: appKey,
    response_type: "code",
    token_access_type: "offline",
    code_challenge: challenge,
    code_challenge_method: "S256",
  }).toString();
  console.log("Ouvrir ce lien, accepter, puis relancer avec le code obtenu :\n");
  console.log(url.toString());
  process.exit(0);
}

if (!existsSync(STORE)) {
  console.error("Vérificateur introuvable : relancer d'abord sans code.");
  process.exit(1);
}
const verifier = readFileSync(STORE, "utf8");
const res = await fetch("https://api.dropboxapi.com/oauth2/token", {
  method: "POST",
  body: new URLSearchParams({
    code,
    grant_type: "authorization_code",
    code_verifier: verifier,
    client_id: appKey,
  }),
});
const json = await res.json();
unlinkSync(STORE);
if (!res.ok || !json.refresh_token) {
  console.error("Échec :", json);
  process.exit(1);
}
console.log("DROPBOX_REFRESH_TOKEN=" + json.refresh_token);
console.log("\nCompte autorisé :", json.account_id);
