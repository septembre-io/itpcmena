# ITPC-MENA — Analyse multicanal (Site WordPress · Facebook · Google Groupe)

*Analyse réalisée à partir des extractions : `wp-articles.json` (360 articles), `facebook-posts.json` (2 669 publications) et un échantillon de 42 sujets du Google Groupe « HIV MENA » (1 419 au total, export mbox en attente).*

---

## 1. Redondance entre canaux : faible et asymétrique

| Mesure | Résultat | Lecture |
|---|---|---|
| Articles WP ayant un quasi-doublon sur FB | **69 / 360 (19 %)** | Le site ne « double » Facebook que pour le contenu officiel |
| Publications FB reprises sur le site | **≈ 2,6 %** (69 / 2 669) | L'immense majorité du contenu FB n'existe **que** sur Facebook |
| Appels relayés sur le site (catégories dédiées) | **16** | Quasi rien |
| Appels/opportunités repérés sur Facebook | **≈ 850** | La vraie réserve d'appels est sur FB |

**Ce qui se recoupe** (les ~19 %) : uniquement les contenus « institutionnels » qui méritent une trace officielle — communiqués communs (ex. « 46 organisations appellent les pays du CCG… »), hommages (Pr. Hakima Himmich), et les **appels à consultant officiels d'ITPC** (Call for Consultant ARV, Recherche Consultant·e ADP, Appel à Consultants Lois/Production, Call for Applications ADP). Tout le reste est propre à chaque canal.

**Conclusion :** la redondance est marginale. Les trois canaux ne se répètent pas, ils se **complètent**. Fusionner leurs données a donc un vrai intérêt (peu de doublons à nettoyer) et révèle un gros angle mort : le site ignore ~98 % de ce qui circule sur FB et le Groupe.

---

## 2. Spécificités de chaque canal

### Site WordPress (itpcmena.org) — *la vitrine officielle*
- **Volume / cadence** : 360 articles depuis 2011, rythme lent et éditorialisé.
- **Langues** : le plus **équilibré** — FR 159 / EN 118 / AR 83 ; 84 contenus entièrement trilingues.
- **Nature** : contenu long, structuré, sourcé (rapports FORSS, communiqués, analyses PI, appels à consultant formels).
- **Forces** : pérenne, indexé (SEO), crédible, catégorisé/taguable, maîtrisé.
- **Faiblesse** : très **pauvre en appels** (16) et lent — ne reflète pas l'activité réelle de l'organisation.

### Facebook (Page ITPC MENA) — *le flux temps réel*
- **Volume / cadence** : **2 669 publications** (2011→2026), très soutenu — c'est le journal de bord de l'organisation.
- **Langues** : surtout **FR/EN (2 230)**, AR minoritaire (439) → angle mort arabophone.
- **Nature** : mix d'actualités, **événements/webinaires (525)**, appels à projet/financement (150), prix, recrutements, plaidoyer — production **propre à ITPC** + relais.
- **Forces** : exhaustif, réactif, engageant, riche en opportunités.
- **Faiblesses** : **éphémère** (pas de SEO, difficile à retrouver), non catégorisé, dépendant de l'algorithme, format court.

### Google Groupe « HIV MENA » — *le canal B2B de l'écosystème*
- **Volume** : **1 419 sujets**, 675 membres (société civile MENA). Privé.
- **Nature** : surtout du **relais d'opportunités externes** émanant de partenaires/bailleurs — *Call for Proposals* (Emergency Fund, Pandemic Fund), *EOI for PR Services*, appels à projets de **L'Initiative**, **AmplifyChange**, **GFAN**, enquêtes, consultations, webinaires.
- **Forces** : la source la plus dense en **appels à projet / EOI / contribution venant de tiers** — exactement ce qui manque au site.
- **Faiblesses** : fermé (accès membre), non structuré, non indexé, format e-mail, automatisation difficile.

**Synthèse en une phrase :** le **site** = mémoire officielle (pérenne, multilingue, peu d'appels) ; **Facebook** = activité propre d'ITPC en temps réel (volumineux, éphémère, riche en événements/appels) ; le **Groupe** = veille des opportunités de l'écosystème (appels externes, fermé).

---

## 3. Cinq scénarios d'exploitation

### Scénario 1 — « Appels & Opportunités » : un Job/Project Board sur itpcmena.org *(ton intuition)*
Créer sur le site une rubrique structurée agrégeant les appels des 3 canaux (FB + Groupe + WP), avec **filtres** (type : projet / offre / EOI / candidature / contribution / événement ; **deadline** ; pays ; langue ; bailleur). Alimentation semi-automatique depuis les pipelines existants. **Valeur** : transforme un flux éphémère et fermé en **service durable, indexé et multilingue** — utile aux partenaires de toute la région et fort en SEO. *C'est le scénario à plus fort impact.*

### Scénario 2 — Veille automatisée + digest
Industrialiser les scripts (FB + Groupe via mbox/IMAP) en **tâches planifiées** : ingestion → classification → **digest hebdomadaire** par e-mail (« 7 nouveaux appels cette semaine ») et/ou alertes par type. **Valeur** : ne plus rater un appel ; faible coût ; base du Scénario 1.

### Scénario 3 — Rapatriement SEO du contenu à valeur longue
Identifier les publications FB/Groupe à **valeur durable** (rapports, appels, prises de position) qui n'existent pas sur le site, et les **republier** en articles WP catégorisés (FR/EN/AR). **Valeur** : capter le trafic de recherche, archiver, et nourrir le site sans produire de contenu neuf.

### Scénario 4 — Tableau de bord de pilotage com' & plaidoyer
Un dashboard interne (les données sont déjà là) : cadence de publication par canal, **mix linguistique** (révèle le déficit AR), répartition thématique, **carte des appels par bailleur / pays / année**, taux de traduction du site. **Valeur** : piloter la stratégie de communication et de plaidoyer sur des faits, pas au ressenti.

### Scénario 5 — Recherche unifiée / base de connaissance multicanale
Index unique et cherchable des 3 canaux (≈ 4 500 contenus), éventuellement doublé d'un **assistant Q&A** (« quels appels de financement VIH en 2024 ? », « a-t-on déjà publié sur le lénacapavir ? »). **Valeur** : mémoire institutionnelle interrogeable, pour l'équipe **et** les partenaires ; valorise 15 ans d'archives aujourd'hui dispersées.

---

## 4. Recommandation

Enchaîner **Scénario 2 → Scénario 1** : d'abord le pipeline de veille (qui fiabilise la donnée et la maintient à jour), puis le **Job/Project Board** public alimenté par ce pipeline. Les scénarios 3, 4 et 5 réutilisent exactement les mêmes données et peuvent suivre par incréments.

Point transversal qui ressort partout : **le déficit de contenu arabe** (FB surtout FR/EN, site à peine 1/3 AR) — à corriger quel que soit le scénario, vu le public MENA.
