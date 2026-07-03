"use client";

import { useState } from "react";

type Variant = "unified" | "chapter";

/**
 * Bascule de démonstration entre deux dispositions de la zone Actualités / Op-ed :
 *  - "unified"  → P1-C  : zone « Publications » claire, actualités + tribune vedette.
 *  - "chapter"  → P5-B  : actualités en grille + chapitre op-ed sombre pleine largeur.
 *
 * Les deux variantes sont rendues côté serveur (données déjà chargées) et passées
 * en props ; on ne fait que masquer/afficher — bascule instantanée pour la démo.
 */
export function OpEdDemoSwitcher({
  unified,
  chapter,
}: {
  unified: React.ReactNode;
  chapter: React.ReactNode;
}) {
  const [variant, setVariant] = useState<Variant>("unified");

  return (
    <>
      {variant === "unified" ? unified : chapter}

      {/* Contrôle de démo flottant */}
      <div className="fixed bottom-5 left-1/2 z-[999] flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-ink/95 p-1 pl-3 text-white shadow-2xl backdrop-blur">
        <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-white/50">
          Démo op-ed
        </span>
        <button
          onClick={() => setVariant("unified")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
            variant === "unified"
              ? "bg-white text-ink"
              : "text-white/60 hover:text-white"
          }`}
        >
          Unifiée · claire
        </button>
        <button
          onClick={() => setVariant("chapter")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
            variant === "chapter"
              ? "bg-white text-ink"
              : "text-white/60 hover:text-white"
          }`}
        >
          Chapitre · sombre
        </button>
      </div>
    </>
  );
}
