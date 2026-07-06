import { NextResponse } from "next/server";
import { subscribeToBrevo } from "@/lib/brevo";
import { rateLimit } from "@/lib/rateLimit";
import type { PostLang } from "@/lib/wordpress";

const LOCALES: PostLang[] = ["fr", "en", "ar"];
// Validation volontairement simple : le vrai contrôle d'existence est fait par Brevo.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RL_LIMIT = 5; // inscriptions max…
const RL_WINDOW_MS = 60_000; // …par IP et par minute

/** IP client derrière le proxy Vercel. */
function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const [first] = xff.split(",");
    return (first ?? xff).trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  // 1. rate-limit par IP (garde-fou anti-abus)
  const ip = clientIp(request);
  if (!rateLimit(`newsletter:${ip}`, RL_LIMIT, RL_WINDOW_MS)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const { email, locale, website } = (body ?? {}) as {
    email?: string;
    locale?: string;
    website?: string;
  };

  // 2. honeypot : ce champ caché n'est rempli que par les bots. On renvoie un
  //    faux succès (sans appeler Brevo) pour ne pas leur signaler le piège.
  if (typeof website === "string" && website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const cleanEmail = (email ?? "").trim().toLowerCase();
  const lang: PostLang = LOCALES.includes(locale as PostLang)
    ? (locale as PostLang)
    : "fr";

  if (!EMAIL_RE.test(cleanEmail)) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 422 });
  }

  const result = await subscribeToBrevo(cleanEmail, lang);
  if (result.ok) return NextResponse.json({ ok: true });

  // config manquante → 500 (côté nous) ; erreur renvoyée par Brevo → 502
  const status = result.reason === "config" ? 500 : 502;
  return NextResponse.json({ ok: false, error: result.reason }, { status });
}
