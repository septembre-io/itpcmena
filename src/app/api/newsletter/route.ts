import { NextResponse } from "next/server";
import { subscribeToBrevo } from "@/lib/brevo";
import type { PostLang } from "@/lib/wordpress";

const LOCALES: PostLang[] = ["fr", "en", "ar"];
// Validation volontairement simple : le vrai contrôle d'existence est fait par Brevo.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const { email, locale } = (body ?? {}) as { email?: string; locale?: string };
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
