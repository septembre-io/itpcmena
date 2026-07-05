"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

// Messages de retour, pour les 3 locales réelles du site (fr par défaut).
const MESSAGES: Record<string, { success: string; error: string }> = {
  fr: {
    success: "Merci ! Votre inscription est bien prise en compte.",
    error: "Une erreur est survenue. Réessayez dans un instant.",
  },
  en: {
    success: "Thanks! Your subscription is confirmed.",
    error: "Something went wrong. Please try again in a moment.",
  },
  ar: {
    success: "شكراً! تم تسجيل اشتراكك.",
    error: "حدث خطأ ما. يُرجى المحاولة مرة أخرى بعد قليل.",
  },
};

/**
 * Formulaire newsletter — poste vers /api/newsletter (route serveur qui parle à
 * Brevo). La `locale` est transmise pour être enregistrée comme contexte de
 * langue du contact côté Brevo.
 */
export function NewsletterForm({
  locale,
  placeholder,
  cta,
}: {
  locale: string;
  placeholder: string;
  cta: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const m = MESSAGES[locale] ?? MESSAGES.fr;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p
        className="mx-auto mt-8 max-w-md text-sm font-semibold text-teal"
        dir={locale === "ar" ? "rtl" : undefined}
      >
        {m.success}
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-2"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 rounded-full border border-ink/15 bg-white/90 px-5 py-3 text-sm outline-none backdrop-blur placeholder:text-ink/40 focus:border-ink/40"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {cta}
      </button>
      {status === "error" && (
        <p className="w-full text-sm font-medium text-red">{m.error}</p>
      )}
    </form>
  );
}
