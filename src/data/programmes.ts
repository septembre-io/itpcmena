export interface Programme {
  id: string;
  icon: string;
  iconBg: string;
  ctaColor: string;
  href: string;
  title: string;
  description: string;
}

export const programmes: Programme[] = [
  {
    id: "plateforme-mena",
    icon: "🌍",
    iconBg: "bg-teal/15",
    ctaColor: "text-teal",
    href: "/programmes/plateforme-mena",
    title: "Plateforme Régionale MENA — Fonds Mondial",
    description:
      "Coordination régionale dans la lutte contre le Sida, la Tuberculose et le Paludisme. Renforcement des capacités de la société civile dans 14 pays.",
  },
  {
    id: "propriete-intellectuelle",
    icon: "💊",
    iconBg: "bg-red/20",
    ctaColor: "text-[#FF6B71]",
    href: "/programmes/propriete-intellectuelle",
    title: "Propriété Intellectuelle & Accès aux Médicaments",
    description:
      "Plaidoyer sur les enjeux de propriété intellectuelle pour que les médicaments vitaux restent accessibles à tous dans la région.",
  },
  {
    id: "education-traitements",
    icon: "📚",
    iconBg: "bg-amber-400/15",
    ctaColor: "text-amber-300",
    href: "/programmes/education-traitements",
    title: "Éducation aux Traitements et Recherche",
    description:
      "Renforcement des capacités des PVVIH et des activistes pour des actions éclairées, de la science aux politiques d'accès.",
  },
];
