// ---------------------------------------------------------------------------
// Contenu éditorial de la page d'accueil v3 (« plaidoyer »).
//
// Source cible : endpoint custom du mu-plugin Polylang
//   GET /wp-json/itpc/v1/home-v3?lang=fr|en|ar
// qui lit les champs ACF d'une page « Accueil v3 » et renvoie ce contrat.
//
// Tant que WordPress n'expose pas (encore) ce contenu — ou en cas d'erreur —
// on retombe sur `homeV3Fallback` : la page reste identique au design validé.
// Même philosophie de tolérance aux pannes que getPosts() dans wordpress.ts.
// ---------------------------------------------------------------------------

import { wpFetch } from "./wordpress";

export type Accent = "red" | "amber" | "teal" | "ink";
export type PlatformStatus = "online" | "construction" | "request" | "contact";

export interface CTA {
  label: string;
  href: string;
}

export interface HomeV3Content {
  hero: {
    badge: string;
    /** HTML léger autorisé (ex. <span class="text-amber">+94%</span>, <br>) */
    titleHtml: string;
    subtitle: string;
    ctaPrimary: CTA;
    ctaSecondary: CTA;
  };
  stats: {
    label: string;
    items: Array<{ value: string; accent: Accent; text: string }>;
  };
  mission: { tag: string; title: string; body: string };
  vision: { tag: string; title: string; body: string };
  region: {
    tag: string;
    title: string;
    body: string;
    /** HTML léger (ex. <span class="text-red">…</span>) */
    quoteHtml: string;
    image: string;
    badge: { value: string; label: string };
  };
  oneHealth: { tag: string; title: string; body: string };
  work: {
    tag: string;
    title: string;
    cards: Array<{ title: string; body: string }>;
  };
  values: {
    tag: string;
    items: Array<{ title: string; accent: Accent; body: string }>;
  };
  platforms: {
    tag: string;
    title: string;
    items: Array<{
      title: string;
      status: PlatformStatus;
      body: string;
      href?: string;
    }>;
  };
  newsletter: {
    title: string;
    body: string;
    placeholder: string;
    cta: string;
  };
}

// ---------------------------------------------------------------------------
// Repli — contenu FR validé au design. Sert de défaut ET de source unique de
// vérité pour amorcer la saisie WordPress (fr → puis en/ar via Polylang).
// ---------------------------------------------------------------------------

export const homeV3Fallback: HomeV3Content = {
  hero: {
    badge:
      "La seule région où les nouvelles infections VIH augmentent encore",
    titleHtml:
      '<span class="text-amber">+94%</span> depuis 2010.<br>Et personne ne regarde.',
    subtitle:
      "La région MENA n’apparaît dans aucune carte prioritaire de la santé mondiale. Moins d’une personne sur deux y a accès à un traitement. ITPC-MENA est là pour que ce silence cesse.",
    ctaPrimary: { label: "Rejoindre le combat", href: "#travail" },
    ctaSecondary: { label: "Comprendre l’enjeu →", href: "#region" },
  },
  stats: {
    label: "Une urgence ignorée, en chiffres",
    items: [
      {
        value: "29%",
        accent: "red",
        text: "des besoins de financement identifiés pour 2030 sont couverts. Le reste manque.",
      },
      {
        value: "+94%",
        accent: "amber",
        text: "de nouvelles infections VIH depuis 2010, à rebours du reste du monde.",
      },
      {
        value: "< 1/2",
        accent: "teal",
        text: "des personnes concernées sous traitement, contre plus de 3 sur 4 ailleurs.",
      },
    ],
  },
  mission: {
    tag: "Notre mission",
    title: "Faire de l’accès à la santé une réalité dans la région MENA",
    body: "En levant les barrières d’accès aux traitements et en donnant aux populations concernées les moyens de revendiquer leurs droits.",
  },
  vision: {
    tag: "Notre vision",
    title: "Un monde où l’accès à la santé est garanti pour toutes et tous",
    body: "Indépendamment du pays où l’on vit, de ses ressources, ou de qui l’on est.",
  },
  region: {
    tag: "Afrique du Nord & Moyen-Orient",
    title:
      "Une région absente des cartes prioritaires — et c’est ce qui la rend dangereuse à ignorer",
    body: "La région affiche la prévalence du VIH la plus basse au monde, mais c’est l’une des seules où les nouvelles infections augmentent encore. Notre rôle : rendre visibles les données, connecter les acteurs locaux aux instances internationales, et porter la voix des plus exposés.",
    quoteHtml:
      "« Les personnes concernées ne sont pas les bénéficiaires de notre travail. <span class=\"text-red\">Elles en sont les architectes.</span> »",
    image:
      "https://i0.wp.com/itpcmena.org/wp-content/uploads/2023/11/Galerie-Position-1-1-scaled.jpg?fit=2560%2C1707&ssl=1",
    badge: { value: "14 pays", label: "d’intervention" },
  },
  oneHealth: {
    tag: "Notre approche",
    title: "One Health : relier santé humaine, animale et environnement",
    body: "Particulièrement pertinente dans une région parmi les plus exposées au monde au stress hydrique et au changement climatique. Nous travaillons dans 14 pays avec cette approche intégrée, parce que les défis sanitaires de demain ne s’arrêtent pas aux frontières des disciplines.",
  },
  work: {
    tag: "Notre travail",
    title: "Un travail de terrain, traduit en données",
    cards: [
      {
        title: "Veille stratégique",
        body: "Brevets, accords de libre-échange, réglementation → l'Observatoire.",
      },
      {
        title: "Veille communautaire",
        body: "Ruptures de stock, refus de soin → les rapports Missing the Target.",
      },
      {
        title: "Plaidoyer & formation",
        body: "Les connaissances pour comprendre et revendiquer ses droits.",
      },
      {
        title: "Mise en réseau",
        body: "Relier les acteurs → l'Annuaire des OSC.",
      },
    ],
  },
  values: {
    tag: "Nos valeurs",
    items: [
      {
        title: "Approche communautaire",
        accent: "teal",
        body: "Nos priorités se construisent avec les populations-clés, pas pour elles.",
      },
      {
        title: "Équité",
        accent: "red",
        body: "L'accès ne devrait dépendre ni de la richesse d'un pays ni de sa position géographique.",
      },
      {
        title: "Solidarité",
        accent: "ink",
        body: "Des ponts entre pays, entre réseaux internationaux et entre générations d'activistes.",
      },
      {
        title: "Transparence",
        accent: "ink",
        body: "La redevabilité n'est pas une option, c'est une condition de notre légitimité.",
      },
      {
        title: "Impact",
        accent: "amber",
        body: "Nous mesurons notre travail par son utilité réelle, pas par sa visibilité.",
      },
    ],
  },
  platforms: {
    tag: "Nos plateformes",
    title: "Des outils utiles pour tout l’écosystème",
    items: [
      {
        title: "3ilaji",
        status: "online",
        body: "Tout ce que vous devez savoir sur votre traitement.",
        href: "https://itpcmena.org/",
      },
      {
        title: "Annuaire des OSC MENA",
        status: "construction",
        body: "Identifier un partenaire local dans 14 pays — filtrable par pays, thématique et financement.",
      },
      {
        title: "Observatoire d'accès aux médicaments",
        status: "construction",
        body: "Brevets, génériques, prix — pays par pays. Le seul outil de ce type sur la région.",
      },
      {
        title: "Bibliothèque Missing the Target",
        status: "construction",
        body: "Vingt ans de données communautaires + guides de formation FR/AR/EN.",
      },
    ],
  },
  newsletter: {
    title: "Les mises à jour qui comptent, rien d’autre.",
    body: "On vous prévient quand une donnée change, quand un outil sort, ou quand un plaidoyer aboutit.",
    placeholder: "votre@email.com",
    cta: "S’inscrire",
  },
};

const WP_URL = process.env.NEXT_PUBLIC_WP_URL ?? "https://wphead.itpcmena.org";

/**
 * Récupère le contenu éditorial v3 depuis l'endpoint custom du mu-plugin.
 * Renvoie le repli si l'endpoint est absent, en erreur, ou renvoie un JSON
 * incomplet (garantit que la page rend toujours quelque chose de cohérent).
 */
export async function getHomeV3(locale: string): Promise<HomeV3Content> {
  try {
    const url = `${WP_URL}/wp-json/itpc/v1/home-v3?lang=${locale}`;
    const res = await wpFetch(url);
    if (!res) return homeV3Fallback;
    const data = (await res.json()) as Partial<HomeV3Content>;
    // Fusion superficielle bloc par bloc : un bloc absent côté WP garde le repli.
    const merged: HomeV3Content = { ...homeV3Fallback, ...data };
    // Garde-fou : le champ image ACF est souvent laissé vide (remplissage auto
    // des textes) → on garde l'image du repli plutôt qu'un src vide qui casse.
    if (!merged.region?.image) {
      merged.region = { ...merged.region, image: homeV3Fallback.region.image };
    }
    return merged;
  } catch {
    return homeV3Fallback;
  }
}
