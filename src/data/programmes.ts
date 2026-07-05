// Programmes ITPC-MENA — données statiques (pas de CPT côté WordPress).
// Champs UI (icon, couleurs, href) conservés du scaffold ; i18n FR/EN/AR + lien
// WordPress ajoutés depuis les pages "Notre Travail" de https://itpcmena.org (REST).
//
// ⚠️ Les slugs WP EN/AR sont incohérents côté WordPress (ex. "global-fund" pour la
//    page "Treatment Education and Research") — utiliser wpId, pas le slug, pour l'API.
//    Les accroches AR (excerpt.ar) restent à compléter (non exposées proprement par WP).

export type Locale = "fr" | "en" | "ar";

export interface Programme {
  id: string;
  icon: string;
  iconBg: string;
  ctaColor: string;
  href: string;
  /** Image de mise en avant WP (null si absente) */
  image: string | null;
  /** ID de la page WordPress par langue — clé fiable pour l'API REST */
  wpId: Record<Locale, number>;
  /** Slug WP réel par langue (informatif) */
  wpSlug: Record<Locale, string>;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
}

export const programmes: Programme[] = [
  {
    id: "plateforme-mena",
    icon: "🌍",
    iconBg: "bg-teal/15",
    ctaColor: "text-teal",
    href: "/programmes/plateforme-mena",
    image: "https://wphead.itpcmena.org/wp-content/uploads/2015/10/12222.png",
    wpId: { fr: 1395, en: 1590, ar: 1702 },
    wpSlug: {
      fr: "financement-de-sante",
      en: "health-financing-and-human-rights-platform",
      ar: "mena-regional-platform",
    },
    title: {
      fr: "Plateforme Régionale MENA — Fonds Mondial",
      en: "Regional Platform MENA",
      ar: "المنصة الإقليمية بمنطقة الشرق الأوسط و شمال إفريقيا",
    },
    description: {
      fr: "Coordination régionale dans la lutte contre le Sida, la Tuberculose et le Paludisme. Renforcement des capacités de la société civile dans 14 pays.",
      en: "Regional coordination in the fight against AIDS, Tuberculosis and Malaria, strengthening civil society capacity across 14 countries with the Global Fund.",
      ar: "",
    },
  },
  {
    id: "propriete-intellectuelle",
    icon: "💊",
    iconBg: "bg-red/20",
    ctaColor: "text-[#FF6B71]",
    href: "/programmes/propriete-intellectuelle",
    image: null,
    wpId: { fr: 1593, en: 1338, ar: 1707 },
    wpSlug: {
      fr: "intellectual-property-and-access-to-medicines-2",
      en: "global-fund-2",
      ar: "intellectual-property-and-access-to-medicines-ar",
    },
    title: {
      fr: "Propriété Intellectuelle & Accès aux Médicaments",
      en: "Intellectual Property and Access to Medicines",
      ar: "الملكية الفكرية والوصول إلى الأدوية",
    },
    description: {
      fr: "Plaidoyer sur les enjeux de propriété intellectuelle pour que les médicaments vitaux restent accessibles à tous dans la région.",
      en: "Advocacy on intellectual property barriers so that vital medicines and health products remain affordable and accessible to all in the region.",
      ar: "",
    },
  },
  {
    id: "education-traitements",
    icon: "📚",
    iconBg: "bg-amber-400/15",
    ctaColor: "text-amber-300",
    href: "/programmes/education-traitements",
    image: "https://wphead.itpcmena.org/wp-content/uploads/2015/10/1222.png",
    wpId: { fr: 1388, en: 1333, ar: 1709 },
    wpSlug: {
      fr: "unitaid",
      en: "global-fund",
      ar: "treatment-education-and-research-ar",
    },
    title: {
      fr: "Éducation aux Traitements et Recherche",
      en: "Treatment Education and Research",
      ar: "التربية العلاجية والأبحاث",
    },
    description: {
      fr: "Renforcement des capacités des PVVIH et des activistes pour des actions éclairées, de la science aux politiques d'accès.",
      en: "Empowering people living with HIV and activists to understand treatment — from the scientific basics to access policy — for better-informed action.",
      ar: "",
    },
  },
];

/** Récupère un programme par son id de routing. */
export const getProgramme = (id: string): Programme | undefined =>
  programmes.find((p) => p.id === id);
