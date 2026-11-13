"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";

declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, string | number>) => void;
    };
  }
}

const SECONDES = 30;
const PART_LUE = 0.75;

/**
 * Événement Umami « lecture », envoyé une fois par article : après 30 s de page
 * visible (declencheur « duree ») ou quand le lecteur a fait défiler les trois
 * quarts du corps de l'article (declencheur « defilement »), au premier des deux.
 * Distingue les visites d'une page qui ont lu l'article de celles reparties tout
 * de suite. Le taux de rebond d'Umami, calculé sur les pages vues, ne change pas.
 */
export function ReadingTracker({
  targetId,
  locale,
}: {
  targetId: string;
  locale: string;
}) {
  const pathname = usePathname();

  useEffect(() => {
    const cible = document.getElementById(targetId);
    if (!cible) return;
    const page = `/${locale}${pathname === "/" ? "" : pathname}`;

    let envoye = false;
    let secondes = 0;
    let image = 0;
    let minuteur = 0;

    const arreter = () => {
      window.clearInterval(minuteur);
      window.removeEventListener("scroll", surDefilement);
      if (image) cancelAnimationFrame(image);
    };

    const envoyer = (declencheur: "duree" | "defilement") => {
      if (envoye) return;
      envoye = true;
      window.umami?.track("lecture", { declencheur, page, langue: locale });
      arreter();
    };

    const surDefilement = () => {
      if (image) return;
      image = requestAnimationFrame(() => {
        image = 0;
        const r = cible.getBoundingClientRect();
        if (r.height > 0 && (window.innerHeight - r.top) / r.height >= PART_LUE) {
          envoyer("defilement");
        }
      });
    };

    minuteur = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      secondes += 1;
      if (secondes >= SECONDES) envoyer("duree");
    }, 1000);
    window.addEventListener("scroll", surDefilement, { passive: true });

    return arreter;
  }, [targetId, locale, pathname]);

  return null;
}
