// Projet L.A.N.C.E.R. (PrEP injectable au Maroc) : contenu de REPLI de la page
// /{locale}/programmes/lancer. Le contenu en ligne se modifie dans WordPress
// (page « L.A.N.C.E.R. », modèle « Page projet (site) », mu-plugin
// scripts/itpc-projets.php) ; src/lib/projet.ts fusionne champ par champ : tout
// champ laissé vide dans WP affiche le texte ci-dessous.
//
// Source : maquette « Maquette_page_LANCER.html » (novembre 2026), texte FR repris
// tel quel. EN et AR : propositions de traduction, à faire valider par ITPC MENA.
// Ce fichier sert aussi au préremplissage des pages WP (scripts/seed-projet.php,
// JSON produit par scripts/projet-seed-json.mjs).

import type {
  Accent,
  Locale,
  ProductionStatus,
  ProjetContent,
} from "@/lib/projet";

type T = Record<Locale, string>;

const CONTACT_HREF = "mailto:contact@itpcmena.org";
const ALCS_URL = "https://www.alcs.ma";

interface Block {
  title: T;
  body: T;
}

export interface LancerPage {
  meta: { title: T; description: T };
  /** Nom court affiché dans le fil d'Ariane. */
  shortName: T;
  hero: { eyebrow: T; title: T; lede: T; facts: Array<{ label: T; value: T }> };
  context: { tag: T; title: T; paragraphs: T[] };
  targets: {
    tag: T;
    items: Array<{ accent: Accent; year: string; value: T; text: T }>;
  };
  approach: { tag: T; title: T; intro: T; steps: Block[]; pillars: Block[] };
  governance: { tag: T; title: T; paragraphs: T[] };
  milestones: {
    tag: T;
    title: T;
    items: Array<{ done: boolean; date: T; text: T }>;
  };
  productions: {
    tag: T;
    title: T;
    intro: T;
    items: Array<
      Block & { status: ProductionStatus; href: string | null; cta?: T; note?: T }
    >;
  };
  learnings: { tag: T; title: T; source: T; items: Block[] };
  partners: { tag: T; items: T[] };
  contact: {
    title: T;
    body: T;
    cta: T;
    injectionPrompt: T;
    injectionLink: T;
  };
}

const DOWNLOAD: T = {
  fr: "Télécharger (PDF)",
  en: "Download (PDF)",
  ar: "تحميل (PDF)",
};

export const LANCER: LancerPage = {
  meta: {
    title: {
      fr: "Projet L.A.N.C.E.R. : PrEP injectable au Maroc — ITPC MENA",
      en: "L.A.N.C.E.R. project: injectable PrEP in Morocco — ITPC MENA",
      ar: "مشروع LANCER: الوقاية قبل التعرض بالحقن في المغرب — ITPC MENA",
    },
    description: {
      fr: "Accompagner l'introduction communautaire du lénacapavir, PrEP injectable, au Maroc : démarche, gouvernance, étapes et outils du projet L.A.N.C.E.R.",
      en: "Supporting the community-led introduction of lenacapavir, injectable PrEP, in Morocco: approach, governance, milestones and tools of the L.A.N.C.E.R. project.",
      ar: "مواكبة الإدخال المجتمعي لليناكابافير، الوقاية قبل التعرض بالحقن، في المغرب: المنهجية والحكامة والمراحل وأدوات مشروع LANCER.",
    },
  },

  shortName: { fr: "L.A.N.C.E.R.", en: "L.A.N.C.E.R.", ar: "LANCER" },

  hero: {
    eyebrow: {
      fr: "Projet L.A.N.C.E.R.",
      en: "The L.A.N.C.E.R. project",
      ar: "مشروع LANCER",
    },
    title: {
      fr: "Accompagner l'introduction communautaire de la PrEP injectable au Maroc",
      en: "Supporting the community-led introduction of injectable PrEP in Morocco",
      ar: "مواكبة الإدخال المجتمعي للوقاية قبل التعرض بالحقن في المغرب",
    },
    lede: {
      fr: "Lénacapavir\u00a0: Accès National, Communautaire et Équitablement Réussi. Un projet pour que l'arrivée du lénacapavir réponde aux besoins des personnes les plus exposées au VIH, avec elles.",
      en: "L.A.N.C.E.R. stands for “Lénacapavir\u00a0: Accès National, Communautaire et Équitablement Réussi” (lenacapavir: national, community-based, equitable and successful access). A project to ensure that the arrival of lenacapavir meets the needs of the people most exposed to HIV, together with them.",
      ar: "ليناكابافير: وصول وطني ومجتمعي ومنصف وناجح. مشروع يهدف إلى أن يستجيب وصول ليناكابافير لاحتياجات الأشخاص الأكثر عرضة لفيروس نقص المناعة البشرية، وبمشاركتهم.",
    },
    facts: [
      {
        label: { fr: "Période", en: "Period", ar: "الفترة" },
        value: {
          fr: "Pilote 2026 · Extension 2027",
          en: "2026 pilot · 2027 scale-up",
          ar: "مرحلة تجريبية 2026 · توسيع 2027",
        },
      },
      {
        label: { fr: "Populations", en: "Populations", ar: "الفئات" },
        value: {
          fr: "HSH et travailleuses du sexe",
          en: "Men who have sex with men and female sex workers",
          ar: "الرجال الذين يمارسون الجنس مع الرجال والعاملات في مجال الجنس",
        },
      },
      {
        label: { fr: "Premiers sites", en: "First sites", ar: "المواقع الأولى" },
        value: {
          fr: "Marrakech et Agadir",
          en: "Marrakech and Agadir",
          ar: "مراكش وأكادير",
        },
      },
      {
        label: { fr: "Financement", en: "Funding", ar: "التمويل" },
        value: {
          fr: "Fonds mondial, Unitaid",
          en: "Global Fund, Unitaid",
          ar: "الصندوق العالمي، يونيتيد",
        },
      },
    ],
  },

  context: {
    tag: { fr: "Contexte", en: "Context", ar: "السياق" },
    title: {
      fr: "Une nouvelle option de prévention, une introduction à réussir",
      en: "A new prevention option, an introduction to get right",
      ar: "خيار وقائي جديد، وإدخال ينبغي إنجاحه",
    },
    paragraphs: [
      {
        fr: "Le Maroc a été en 2017 le premier pays de la région MENA à introduire la PrEP orale. Les populations clés concentrent aujourd'hui l'essentiel des nouvelles infections, et la prise quotidienne d'un comprimé reste un obstacle pour beaucoup.",
        en: "In 2017, Morocco became the first country in the MENA region to introduce oral PrEP. Key populations now account for most new infections, and taking a pill every day remains a barrier for many.",
        ar: "كان المغرب سنة 2017 أول بلد في منطقة الشرق الأوسط وشمال إفريقيا يُدخل الوقاية قبل التعرض عن طريق الفم. وتتركز اليوم معظم الإصابات الجديدة لدى الفئات الرئيسية، ولا يزال تناول قرص كل يوم عائقًا أمام كثيرين.",
      },
      {
        fr: "Le lénacapavir se prend en une injection tous les six mois. L'OMS recommande depuis juillet 2025 de l'offrir comme option supplémentaire de PrEP. Le Maroc l'introduit dans le cadre de son plan stratégique national, avec des premières doses arrivées en novembre 2026.",
        en: "Lenacapavir is given as one injection every six months. Since July 2025, WHO has recommended offering it as an additional PrEP option. Morocco is introducing it under its national strategic plan, with the first doses delivered in November 2026.",
        ar: "يُؤخذ ليناكابافير بحقنة واحدة كل ستة أشهر. وتوصي منظمة الصحة العالمية منذ يوليوز 2025 بتقديمه خيارًا إضافيًا للوقاية قبل التعرض. ويُدخله المغرب في إطار مخططه الاستراتيجي الوطني، وقد وصلت الجرعات الأولى في نونبر 2026.",
      },
      {
        fr: "L'expérience des innovations en prévention le montre\u00a0: un produit efficace ne suffit pas. Son adoption dépend de la confiance des communautés, d'une information juste et de services adaptés à leur vie. C'est le rôle de L.A.N.C.E.R.",
        en: "Experience with prevention innovations shows that an effective product is not enough. Its uptake depends on community trust, accurate information and services that fit people's lives. That is the role of L.A.N.C.E.R.",
        ar: "تُظهر التجارب السابقة مع الابتكارات الوقائية أن فعالية المنتج وحدها لا تكفي. فاعتماده يتوقف على ثقة المجتمعات، وعلى معلومات صحيحة، وعلى خدمات تلائم حياة الناس. وهذا هو دور مشروع LANCER.",
      },
    ],
  },

  targets: {
    tag: { fr: "Objectifs", en: "Targets", ar: "الأهداف" },
    items: [
      {
        accent: "red",
        year: "2026",
        value: { fr: "50", en: "50", ar: "50" },
        text: {
          fr: "premières personnes informées, accompagnées et suivies",
          en: "first people informed, supported and followed up",
          ar: "شخصًا من الأوائل يتلقون المعلومة والمواكبة والتتبع",
        },
      },
      {
        accent: "amber",
        year: "2027",
        value: { fr: "2\u00a0000", en: "2,000", ar: "2000" },
        text: {
          fr: "doses prévues\u00a0: une méthode et des outils prêts pour l'extension",
          en: "planned doses: a method and tools ready for scale-up",
          ar: "جرعة مبرمجة: منهجية وأدوات جاهزة للتوسيع",
        },
      },
      {
        accent: "teal",
        year: "2030",
        value: { fr: "80\u00a0%", en: "80%", ar: "80%" },
        text: {
          fr: "de maintien sous PrEP, objectif national",
          en: "PrEP retention, national target",
          ar: "نسبة الاستمرار في الوقاية قبل التعرض، هدف وطني",
        },
      },
    ],
  },

  approach: {
    tag: { fr: "Notre démarche", en: "Our approach", ar: "منهجيتنا" },
    title: {
      fr: "Les communautés concernées, expertes de leur santé",
      en: "Affected communities, experts in their own health",
      ar: "المجتمعات المعنية، خبيرة في صحتها",
    },
    intro: {
      fr: "Chaque outil du projet est construit en cinq temps, avec les personnes à qui il s'adresse.",
      en: "Each project tool is built in five stages, with the people it is meant for.",
      ar: "تُبنى كل أداة من أدوات المشروع على خمس مراحل، بمشاركة الأشخاص الموجهة إليهم.",
    },
    steps: [
      {
        title: { fr: "Écouter", en: "Listen", ar: "الإصغاء" },
        body: {
          fr: "Partir des priorités, des craintes et des usages des communautés.",
          en: "Start from communities' priorities, concerns and practices.",
          ar: "الانطلاق من أولويات المجتمعات ومخاوفها وممارساتها.",
        },
      },
      {
        title: { fr: "Adapter", en: "Adapt", ar: "التكييف" },
        body: {
          fr: "S'appuyer sur ce qui a fait ses preuves ailleurs, en darija et dans le contexte marocain.",
          en: "Build on what has worked elsewhere, in Darija and for the Moroccan context.",
          ar: "الاستناد إلى ما أثبت نجاعته في أماكن أخرى، بالدارجة وفي السياق المغربي.",
        },
      },
      {
        title: { fr: "Tester", en: "Test", ar: "الاختبار" },
        body: {
          fr: "Soumettre messages et supports aux personnes concernées avant toute diffusion.",
          en: "Put messages and materials to the people concerned before any dissemination.",
          ar: "عرض الرسائل والوسائط على الأشخاص المعنيين قبل أي نشر.",
        },
      },
      {
        title: { fr: "Diffuser", en: "Disseminate", ar: "النشر" },
        body: {
          fr: "Par les pairs et les associations, au rythme de l'offre disponible.",
          en: "Through peers and associations, at the pace of available services.",
          ar: "عبر الأقران والجمعيات، وبوتيرة العرض المتاح.",
        },
      },
      {
        title: { fr: "Suivre et ajuster", en: "Monitor and adjust", ar: "التتبع والتعديل" },
        body: {
          fr: "Faire remonter les obstacles par la veille communautaire et corriger vite.",
          en: "Report barriers through community-led monitoring and correct quickly.",
          ar: "رصد العوائق عبر اليقظة المجتمعية وتصحيحها بسرعة.",
        },
      },
    ],
    pillars: [
      {
        title: { fr: "Éducation thérapeutique", en: "Treatment education", ar: "التثقيف العلاجي" },
        body: {
          fr: "Supports d'information en darija et en français, avec version audio, pour chaque étape du parcours.",
          en: "Information materials in Darija and French, with an audio version, for each step of the care pathway.",
          ar: "وسائط إعلامية بالدارجة والفرنسية، مع نسخة صوتية، لكل مرحلة من مراحل المسار.",
        },
      },
      {
        title: {
          fr: "Mobilisation communautaire",
          en: "Community mobilisation",
          ar: "التعبئة المجتمعية",
        },
        body: {
          fr: "Pairs éducateurs formés, sessions d'information, campagne digitale ciblée.",
          en: "Trained peer educators, information sessions, targeted digital campaign.",
          ar: "مثقفون أقران مكوَّنون، وجلسات إعلامية، وحملة رقمية موجهة.",
        },
      },
      {
        title: {
          fr: "Veille communautaire",
          en: "Community-led monitoring",
          ar: "اليقظة المجتمعية",
        },
        body: {
          fr: "Enquête sur les préférences, canal d'écoute, remontée des barrières d'accès vers le programme national.",
          en: "Preference survey, listening channel, reporting of access barriers to the national programme.",
          ar: "استطلاع حول التفضيلات، وقناة للإصغاء، ورفع عوائق الولوج إلى البرنامج الوطني.",
        },
      },
    ],
  },

  governance: {
    tag: { fr: "Gouvernance", en: "Governance", ar: "الحكامة" },
    title: {
      fr: "Un pilotage national et collectif",
      en: "National, collective steering",
      ar: "قيادة وطنية وجماعية",
    },
    paragraphs: [
      {
        fr: "Le projet est piloté par un comité présidé par le Ministère de la Santé et de la Protection sociale. Il réunit le Programme national de lutte contre le sida, l'agence du médicament, le centre de pharmacovigilance, des experts universitaires et les associations de la riposte.",
        en: "The project is steered by a committee chaired by the Ministry of Health and Social Protection. It brings together the National AIDS Programme, the medicines agency, the pharmacovigilance centre, academic experts and the associations of the HIV response.",
        ar: "تقود المشروعَ لجنةٌ تترأسها وزارة الصحة والحماية الاجتماعية، وتضم البرنامج الوطني لمحاربة السيدا، ووكالة الأدوية، ومركز اليقظة الدوائية، وخبراء جامعيين، وجمعيات الاستجابة لداء السيدا.",
      },
      {
        fr: "Les services restent assurés par les structures existantes. ITPC-MENA apporte l'ingénierie communautaire\u00a0: adaptation des outils, formation, veille et capitalisation.",
        en: "Services continue to be delivered by existing structures. ITPC-MENA provides community engineering: adapting tools, training, monitoring and documenting lessons learned.",
        ar: "تظل الخدمات مقدَّمة من طرف البنيات القائمة. وتُسهم آي تي بي سي مينا بالهندسة المجتمعية: تكييف الأدوات، والتكوين، واليقظة، وتثمين التجارب.",
      },
    ],
  },

  milestones: {
    tag: { fr: "Où en sommes-nous", en: "Where we stand", ar: "أين وصلنا" },
    title: { fr: "Les étapes clés", en: "Key milestones", ar: "المراحل الرئيسية" },
    items: [
      {
        done: true,
        date: { fr: "10 septembre 2026", en: "10 September 2026", ar: "10 شتنبر 2026" },
        text: {
          fr: "Lancement du comité de pilotage",
          en: "Steering committee launched",
          ar: "إطلاق لجنة القيادة",
        },
      },
      {
        done: true,
        date: { fr: "Octobre 2026", en: "October 2026", ar: "أكتوبر 2026" },
        text: {
          fr: "Messages clés en darija et en français\u00a0; sélection de l'agence de communication sur appel ouvert",
          en: "Key messages in Darija and French; communication agency selected through an open call",
          ar: "الرسائل الرئيسية بالدارجة والفرنسية؛ اختيار وكالة التواصل عبر طلب مفتوح",
        },
      },
      {
        done: true,
        date: { fr: "Novembre 2026", en: "November 2026", ar: "نونبر 2026" },
        text: {
          fr: "Focus groups avec des HSH et des travailleuses du sexe\u00a0; arrivée des premières doses\u00a0; lancement de l'enquête communautaire",
          en: "Focus groups with men who have sex with men and female sex workers; first doses delivered; community survey launched",
          ar: "مجموعات نقاش مركزة مع رجال يمارسون الجنس مع الرجال ومع عاملات في مجال الجنس؛ وصول الجرعات الأولى؛ إطلاق الاستطلاع المجتمعي",
        },
      },
      {
        done: false,
        date: { fr: "Décembre 2026", en: "December 2026", ar: "دجنبر 2026" },
        text: {
          fr: "Formation de formateurs\u00a0; premières injections\u00a0; réunion de capitalisation",
          en: "Training of trainers; first injections; lessons-learned meeting",
          ar: "تكوين المكوِّنين؛ أولى الحقن؛ اجتماع تثمين التجارب",
        },
      },
      {
        done: false,
        date: { fr: "2027", en: "2027", ar: "2027" },
        text: {
          fr: "Extension à de nouveaux sites, avec l'appui d'Unitaid",
          en: "Scale-up to new sites, with Unitaid support",
          ar: "التوسيع إلى مواقع جديدة بدعم من يونيتيد",
        },
      },
    ],
  },

  productions: {
    tag: { fr: "Productions", en: "Outputs", ar: "الإنتاجات" },
    title: {
      fr: "Des outils ouverts, réutilisables par d'autres",
      en: "Open tools, reusable by others",
      ar: "أدوات مفتوحة، قابلة لإعادة الاستعمال",
    },
    intro: {
      fr: "Les productions du projet sont mises à disposition des associations, du programme national et des pays de la région.",
      en: "The project's outputs are made available to associations, the national programme and countries in the region.",
      ar: "توضع إنتاجات المشروع رهن إشارة الجمعيات والبرنامج الوطني وبلدان المنطقة.",
    },
    items: [
      {
        status: "available",
        href: null, // PDF à renseigner (fiche de la bibliothèque ou /bibliotheque/pdf/RES-xxx.pdf)
        cta: DOWNLOAD,
        title: {
          fr: "Brief de politique sur le lénacapavir",
          en: "Policy brief on lenacapavir",
          ar: "موجز سياسات حول ليناكابافير",
        },
        body: {
          fr: "Les enjeux de l'introduction du LEN au Maroc et nos recommandations.",
          en: "What is at stake in introducing LEN in Morocco, and our recommendations.",
          ar: "رهانات إدخال ليناكابافير في المغرب، وتوصياتنا.",
        },
      },
      {
        status: "available",
        href: null, // PDF à renseigner
        cta: DOWNLOAD,
        title: {
          fr: "Guides d'animation des focus groups",
          en: "Focus group facilitation guides",
          ar: "دليلا تنشيط مجموعات النقاش المركزة",
        },
        body: {
          fr: "Deux guides, HSH et travailleuses du sexe, en français et en darija, pensés pour une approche respectueuse et non extractive.",
          en: "Two guides, for men who have sex with men and for female sex workers, in French and Darija, designed for a respectful, non-extractive approach.",
          ar: "دليلان، للرجال الذين يمارسون الجنس مع الرجال وللعاملات في مجال الجنس، بالفرنسية والدارجة، صُمّما لمقاربة محترِمة وغير استخراجية.",
        },
      },
      {
        status: "finalising",
        href: null,
        note: {
          fr: "Disponible en décembre 2026",
          en: "Available in December 2026",
          ar: "متاحة في دجنبر 2026",
        },
        title: {
          fr: "Cartes d'information",
          en: "Information cards",
          ar: "بطاقات إعلامية",
        },
        body: {
          fr: "Cinq cartes, une par moment du parcours, en darija et en français, avec QR code audio.",
          en: "Five cards, one for each moment of the care pathway, in Darija and French, with an audio QR code.",
          ar: "خمس بطاقات، واحدة لكل مرحلة من مراحل المسار، بالدارجة والفرنسية، مع رمز QR للاستماع.",
        },
      },
      {
        status: "ongoing",
        href: null, // lien du questionnaire à renseigner
        cta: {
          fr: "Répondre à l'enquête",
          en: "Take the survey",
          ar: "المشاركة في الاستطلاع",
        },
        title: {
          fr: "Enquête sur les préférences PrEP",
          en: "PrEP preference survey",
          ar: "استطلاع حول تفضيلات الوقاية قبل التعرض",
        },
        body: {
          fr: "Ce qui guide le choix entre comprimé et injection, sa stabilité dans le temps et son lien avec la vie quotidienne.",
          en: "What drives the choice between pill and injection, how stable it is over time and how it relates to daily life.",
          ar: "ما الذي يوجّه الاختيار بين القرص والحقنة، ومدى ثباته مع الوقت، وعلاقته بالحياة اليومية.",
        },
      },
      {
        status: "testing",
        href: null, // date de lancement à confirmer : ajouter `note` quand elle est connue
        title: {
          fr: "Canal WhatsApp PrEP en darija",
          en: "WhatsApp PrEP channel in Darija",
          ar: "قناة واتساب للوقاية قبل التعرض بالدارجة",
        },
        body: {
          fr: "Un assistant qui répond aux questions de base sur la PrEP, développé avec l'ALCS.",
          en: "An assistant that answers basic questions about PrEP, developed with ALCS.",
          ar: "مساعد يجيب عن الأسئلة الأساسية حول الوقاية قبل التعرض، طُوّر مع جمعية محاربة السيدا (ALCS).",
        },
      },
      {
        status: "upcoming",
        href: null,
        note: { fr: "Décembre 2026", en: "December 2026", ar: "دجنبر 2026" },
        title: {
          fr: "Note de capitalisation",
          en: "Lessons-learned note",
          ar: "مذكرة تثمين التجارب",
        },
        body: {
          fr: "Les apprentissages de la phase pilote et les recommandations pour l'extension.",
          en: "What the pilot phase taught us, and recommendations for scale-up.",
          ar: "دروس المرحلة التجريبية، والتوصيات من أجل التوسيع.",
        },
      },
    ],
  },

  learnings: {
    tag: { fr: "Premiers enseignements", en: "Early lessons", ar: "الدروس الأولى" },
    title: {
      fr: "Ce que les communautés nous ont dit",
      en: "What communities told us",
      ar: "ما قالته لنا المجتمعات",
    },
    source: {
      fr: "Focus groups, novembre 2026",
      en: "Focus groups, November 2026",
      ar: "مجموعات النقاش المركزة، نونبر 2026",
    },
    items: [
      {
        title: {
          fr: "Une forte adhésion à l'injection",
          en: "Strong support for the injection",
          ar: "إقبال قوي على الحقن",
        },
        body: {
          fr: "Plus de comprimé à prendre ni à cacher. «\u00a0On serait plus tranquilles moralement\u00a0», résume une participante.",
          en: "No more pills to take or to hide. “We would have more peace of mind,” as one participant put it.",
          ar: "لا مزيد من الأقراص التي يجب تناولها أو إخفاؤها. «سنكون أكثر راحة نفسيًا»، كما لخّصت إحدى المشاركات.",
        },
      },
      {
        title: {
          fr: "L'association comme lieu de confiance",
          en: "The association as a place of trust",
          ar: "الجمعية فضاءً للثقة",
        },
        body: {
          fr: "Les participants souhaitent recevoir l'injection en association, avec des équipes formées et un accueil sans jugement.",
          en: "Participants want to receive the injection at an association, with trained teams and a non-judgemental welcome.",
          ar: "يرغب المشاركون في تلقي الحقنة داخل الجمعية، مع فرق مكوَّنة واستقبال خالٍ من الأحكام.",
        },
      },
      {
        title: {
          fr: "La continuité avant tout",
          en: "Continuity above all",
          ar: "الاستمرارية قبل كل شيء",
        },
        body: {
          fr: "La première question\u00a0: la deuxième dose sera-t-elle disponible dans six mois\u00a0?",
          en: "The first question: will the second dose be available in six months?",
          ar: "السؤال الأول: هل ستكون الجرعة الثانية متاحة بعد ستة أشهر؟",
        },
      },
    ],
  },

  partners: {
    tag: {
      fr: "Partenaires et financement",
      en: "Partners and funding",
      ar: "الشركاء والتمويل",
    },
    items: [
      {
        fr: "Ministère de la Santé et de la Protection sociale (PNLS)",
        en: "Ministry of Health and Social Protection (National AIDS Programme)",
        ar: "وزارة الصحة والحماية الاجتماعية (البرنامج الوطني لمحاربة السيدا)",
      },
      { fr: "Fonds mondial", en: "Global Fund", ar: "الصندوق العالمي" },
      { fr: "Unitaid", en: "Unitaid", ar: "يونيتيد" },
      { fr: "ALCS", en: "ALCS", ar: "جمعية محاربة السيدا" },
    ],
  },

  contact: {
    title: { fr: "Travailler avec nous", en: "Work with us", ar: "اعملوا معنا" },
    body: {
      fr: "Associations, institutions, partenaires de la région\u00a0: nos outils sont faits pour circuler.",
      en: "Associations, institutions, partners across the region: our tools are made to be shared.",
      ar: "جمعيات ومؤسسات وشركاء في المنطقة: أدواتنا وُجدت لتنتشر.",
    },
    cta: { fr: "Nous contacter", en: "Contact us", ar: "اتصل بنا" },
    injectionPrompt: {
      fr: "Vous cherchez où recevoir l'injection\u00a0?",
      en: "Looking for where to get the injection?",
      ar: "تبحثون عن مكان لتلقي الحقنة؟",
    },
    injectionLink: {
      fr: "Consultez l'ALCS",
      en: "Contact ALCS",
      ar: "تواصلوا مع جمعية محاربة السيدا",
    },
  },
};

/** Contenu de repli pour une langue, au format attendu par la page projet. */
export function lancerContent(loc: Locale): ProjetContent {
  const d = LANCER;
  const t = (v: T) => v[loc];
  const block = (b: Block) => ({ title: t(b.title), body: t(b.body) });
  return {
    meta: { title: t(d.meta.title), description: t(d.meta.description) },
    shortName: t(d.shortName),
    hero: {
      eyebrow: t(d.hero.eyebrow),
      title: t(d.hero.title),
      lede: t(d.hero.lede),
      facts: d.hero.facts.map((f) => ({ label: t(f.label), value: t(f.value) })),
    },
    context: {
      tag: t(d.context.tag),
      title: t(d.context.title),
      paragraphs: d.context.paragraphs.map(t),
    },
    targets: {
      tag: t(d.targets.tag),
      items: d.targets.items.map((it) => ({
        accent: it.accent,
        year: it.year,
        value: t(it.value),
        text: t(it.text),
      })),
    },
    approach: {
      tag: t(d.approach.tag),
      title: t(d.approach.title),
      intro: t(d.approach.intro),
      steps: d.approach.steps.map(block),
      pillars: d.approach.pillars.map(block),
    },
    governance: {
      tag: t(d.governance.tag),
      title: t(d.governance.title),
      paragraphs: d.governance.paragraphs.map(t),
    },
    milestones: {
      tag: t(d.milestones.tag),
      title: t(d.milestones.title),
      items: d.milestones.items.map((m) => ({
        done: m.done,
        date: t(m.date),
        text: t(m.text),
      })),
    },
    productions: {
      tag: t(d.productions.tag),
      title: t(d.productions.title),
      intro: t(d.productions.intro),
      items: d.productions.items.map((p) => ({
        status: p.status,
        title: t(p.title),
        body: t(p.body),
        href: p.href,
        cta: p.cta ? t(p.cta) : "",
        note: p.note ? t(p.note) : "",
      })),
    },
    learnings: {
      tag: t(d.learnings.tag),
      title: t(d.learnings.title),
      source: t(d.learnings.source),
      items: d.learnings.items.map(block),
    },
    partners: { tag: t(d.partners.tag), items: d.partners.items.map(t) },
    contact: {
      title: t(d.contact.title),
      body: t(d.contact.body),
      cta: t(d.contact.cta),
      href: CONTACT_HREF,
      injectionPrompt: t(d.contact.injectionPrompt),
      injectionLink: t(d.contact.injectionLink),
      injectionHref: ALCS_URL,
    },
  };
}
