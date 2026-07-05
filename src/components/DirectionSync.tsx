"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

// Le root layout (app/layout.tsx) pose <html dir/lang> une seule fois côté
// serveur et ne re-render pas lors d'un switch de langue : router.replace avec
// une nouvelle locale est une navigation soft qui ne remonte jamais le root
// layout. Sans ça, passer AR → EN/FR laisse <html dir="rtl"> figé et les zones
// sans `dir` explicite continuent d'hériter du RTL. On resynchronise les
// attributs sur la locale active à chaque changement.
export function DirectionSync() {
  const locale = useLocale();
  useEffect(() => {
    const dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", locale);
  }, [locale]);
  return null;
}
