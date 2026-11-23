<?php
/**
 * Plugin Name: ITPC — Pages projet
 * Description: Modèle « Page projet (site) », champs ACF déclarés en code et
 *              endpoints REST lus par le front Next.js (/{langue}/programmes/{slug}).
 * Version: 1.0.0
 *
 * Routes :
 *   GET /wp-json/itpc/v1/projet?slug=lancer&lang=fr|en|ar  → contenu d'une page projet
 *   GET /wp-json/itpc/v1/projets                           → slugs des pages projet publiées (sitemap)
 * Consommé par : src/lib/projet.ts (getProjet, getProjetSlugs).
 *
 * Fonctionnement :
 * - Une page WordPress par langue (Polylang), modèle « Page projet (site) ».
 *   Le slug de la page FR donne l'adresse : /fr|en|ar/programmes/{slug}.
 * - Les champs apparaissent sur toute page qui porte ce modèle.
 * - Listes = champs FIXES numérotés (ACF gratuit, pas de répéteur), comme
 *   itpc-home-v3.php ; une ligne dont le champ principal est vide est ignorée.
 * - Champ vide = le front garde son texte de repli (src/data/lancer.ts pour
 *   L.A.N.C.E.R.) : la page ne casse jamais.
 * - Préremplissage : scripts/seed-projet.php (WP-CLI).
 *
 * Déploiement : wp-content/mu-plugins/, puis recharger PHP-FPM (OPcache).
 */

if (!defined('ABSPATH')) {
    exit;
}

const ITPC_PROJET_TEMPLATE = 'itpc-projet';

/** Nombre d'emplacements par liste. */
function itpc_projet_slots() {
    return [
        'repere'       => 4,
        'objectif'     => 3,
        'etape'        => 6,
        'pilier'       => 4,
        'jalon'        => 10,
        'production'   => 8,
        'enseignement' => 5,
        'partenaire'   => 8,
    ];
}

function itpc_projet_accents() {
    return ['red' => 'Rouge', 'amber' => 'Ambre', 'teal' => 'Vert'];
}

function itpc_projet_statuts() {
    return [
        'available'  => 'Disponible',
        'finalising' => 'En finalisation',
        'ongoing'    => 'En cours',
        'testing'    => 'En test',
        'upcoming'   => 'À venir',
    ];
}

// ── 1. Modèle de page (pas de fichier : le rendu est fait par le front) ──────
add_filter('theme_page_templates', function ($templates) {
    $templates[ITPC_PROJET_TEMPLATE] = 'Page projet (site)';
    return $templates;
});

// ── 2. Groupe de champs ACF ──────────────────────────────────────────────────
function itpc_projet_fields() {
    $f = [];
    $tab = function ($label) use (&$f) {
        $f[] = [
            'key'       => 'field_itpc_pj_tab_' . sanitize_title($label),
            'label'     => $label,
            'name'      => '',
            'type'      => 'tab',
            'placement' => 'top',
        ];
    };
    $add = function ($name, $label, $type = 'text', $extra = []) use (&$f) {
        $f[] = array_merge([
            'key'   => 'field_itpc_pj_' . $name,
            'label' => $label,
            'name'  => $name,
            'type'  => $type,
        ], $extra);
    };
    $area = function ($rows, $help = '') {
        return ['rows' => $rows, 'new_lines' => '', 'instructions' => $help];
    };
    $paras = 'Un paragraphe par bloc : laisser une ligne vide entre deux paragraphes.';
    $half  = ['wrapper' => ['width' => '50']];
    $slots = itpc_projet_slots();

    $tab('Bandeau');
    $f[] = [
        'key'     => 'field_itpc_pj_aide',
        'label'   => 'Mode d’emploi',
        'name'    => '',
        'type'    => 'message',
        'message' => 'Chaque onglet correspond à un bloc de la page. Un champ laissé vide reprend le texte prévu par défaut sur le site. Les modifications apparaissent en ligne en 5 minutes au plus. Les traductions EN et AR se saisissent dans les pages traduites (Polylang).',
    ];
    $add('nom_court', 'Nom court du projet', 'text', ['instructions' => 'Affiché dans le fil d’Ariane. Ex. « L.A.N.C.E.R. ».']);
    $add('bandeau_surtitre', 'Surtitre', 'text', ['instructions' => 'Petite ligne au-dessus du titre. Ex. « Projet L.A.N.C.E.R. ».']);
    $add('bandeau_titre', 'Titre de la page', 'textarea', $area(2));
    $add('bandeau_chapo', 'Chapô', 'textarea', $area(3));
    for ($i = 1; $i <= $slots['repere']; $i++) {
        $add("repere{$i}_libelle", "Repère {$i} : libellé", 'text', $half + ['instructions' => $i === 1 ? 'Quatre repères en bas du bandeau. Ex. « Période » / « Pilote 2026 · Extension 2027 ».' : '']);
        $add("repere{$i}_valeur", "Repère {$i} : valeur", 'text', $half);
    }
    $add('seo_titre', 'Titre pour les moteurs de recherche', 'text', ['instructions' => 'Facultatif. Titre de l’onglet et des partages. Vide = titre de la page.']);
    $add('seo_description', 'Description pour les moteurs de recherche', 'textarea', $area(2, 'Facultatif. 160 caractères au plus. Vide = chapô.') + ['maxlength' => 170]);

    $tab('Contexte');
    $add('contexte_surtitre', 'Surtitre', 'text');
    $add('contexte_titre', 'Titre', 'textarea', $area(2));
    $add('contexte_texte', 'Texte', 'textarea', $area(10, $paras));

    $tab('Objectifs');
    $add('objectifs_surtitre', 'Surtitre', 'text');
    for ($i = 1; $i <= $slots['objectif']; $i++) {
        $add("objectif{$i}_annee", "Objectif {$i} : année", 'text', ['wrapper' => ['width' => '20']]);
        $add("objectif{$i}_valeur", "Objectif {$i} : chiffre", 'text', ['wrapper' => ['width' => '20']]);
        $add("objectif{$i}_texte", "Objectif {$i} : texte", 'text', ['wrapper' => ['width' => '40']]);
        $add("objectif{$i}_couleur", "Objectif {$i} : couleur", 'select', ['wrapper' => ['width' => '20'], 'choices' => itpc_projet_accents(), 'default_value' => 'teal']);
    }

    $tab('Démarche');
    $add('demarche_surtitre', 'Surtitre', 'text');
    $add('demarche_titre', 'Titre', 'textarea', $area(2));
    $add('demarche_intro', 'Introduction', 'textarea', $area(2));
    for ($i = 1; $i <= $slots['etape']; $i++) {
        $add("etape{$i}_titre", "Étape {$i} : titre", 'text', $half + ['instructions' => $i === 1 ? 'Les étapes sont numérotées automatiquement ; la dernière est mise en vert.' : '']);
        $add("etape{$i}_texte", "Étape {$i} : texte", 'textarea', $half + $area(2));
    }
    for ($i = 1; $i <= $slots['pilier']; $i++) {
        $add("pilier{$i}_titre", "Encadré {$i} : titre", 'text', $half + ['instructions' => $i === 1 ? 'Encadrés blancs sous les étapes.' : '']);
        $add("pilier{$i}_texte", "Encadré {$i} : texte", 'textarea', $half + $area(2));
    }

    $tab('Gouvernance');
    $add('gouvernance_surtitre', 'Surtitre', 'text');
    $add('gouvernance_titre', 'Titre', 'textarea', $area(2));
    $add('gouvernance_texte', 'Texte', 'textarea', $area(8, $paras));

    $tab('Étapes clés');
    $add('jalons_surtitre', 'Surtitre', 'text');
    $add('jalons_titre', 'Titre', 'text');
    for ($i = 1; $i <= $slots['jalon']; $i++) {
        $add("jalon{$i}_date", "Étape clé {$i} : date", 'text', ['wrapper' => ['width' => '25'], 'instructions' => $i === 1 ? 'Ex. « Octobre 2026 ».' : '']);
        $add("jalon{$i}_texte", "Étape clé {$i} : texte", 'text', ['wrapper' => ['width' => '55']]);
        $add("jalon{$i}_realise", "Réalisée", 'true_false', ['wrapper' => ['width' => '20'], 'ui' => 1]);
    }

    $tab('Productions');
    $add('productions_surtitre', 'Surtitre', 'text');
    $add('productions_titre', 'Titre', 'textarea', $area(2));
    $add('productions_intro', 'Introduction', 'textarea', $area(2));
    for ($i = 1; $i <= $slots['production']; $i++) {
        $add("production{$i}_titre", "Production {$i} : titre", 'text', ['wrapper' => ['width' => '60']]);
        $add("production{$i}_statut", "Statut", 'select', ['wrapper' => ['width' => '40'], 'choices' => itpc_projet_statuts(), 'default_value' => 'upcoming']);
        $add("production{$i}_texte", "Production {$i} : description", 'textarea', $area(2));
        $add("production{$i}_fichier", "Fichier (PDF)", 'file', ['wrapper' => ['width' => '34'], 'return_format' => 'url', 'mime_types' => 'pdf']);
        $add("production{$i}_lien", "ou lien", 'url', ['wrapper' => ['width' => '33'], 'instructions' => 'Si un fichier est joint, il est prioritaire.']);
        $add("production{$i}_bouton", "Texte du bouton", 'text', ['wrapper' => ['width' => '33'], 'instructions' => 'Ex. « Télécharger (PDF) ». Sans fichier ni lien, pas de bouton.']);
        $add("production{$i}_mention", "Mention sans lien", 'text', ['instructions' => 'Ex. « Disponible en décembre 2026 ». Affichée seulement s’il n’y a pas de bouton.']);
    }

    $tab('Enseignements');
    $add('enseignements_surtitre', 'Surtitre', 'text');
    $add('enseignements_titre', 'Titre', 'textarea', $area(2));
    $add('enseignements_source', 'Source', 'text', ['instructions' => 'Ex. « Focus groups, novembre 2026 ».']);
    for ($i = 1; $i <= $slots['enseignement']; $i++) {
        $add("enseignement{$i}_titre", "Enseignement {$i} : titre", 'text', $half);
        $add("enseignement{$i}_texte", "Enseignement {$i} : texte", 'textarea', $half + $area(2));
    }

    $tab('Partenaires');
    $add('partenaires_surtitre', 'Surtitre', 'text');
    for ($i = 1; $i <= $slots['partenaire']; $i++) {
        $add("partenaire{$i}_nom", "Partenaire {$i}", 'text', $half + ['instructions' => $i === 1 ? 'Nom affiché tel quel (pas de logo).' : '']);
    }

    $tab('Contact');
    $add('contact_titre', 'Titre', 'text');
    $add('contact_texte', 'Texte', 'textarea', $area(2));
    $add('contact_bouton', 'Texte du bouton', 'text', $half);
    $add('contact_lien', 'Lien du bouton', 'text', $half + ['instructions' => 'Adresse web ou « mailto:contact@itpcmena.org ».']);
    $add('orientation_question', 'Ligne d’orientation : question', 'text', ['instructions' => 'Ex. « Vous cherchez où recevoir l’injection ? »']);
    $add('orientation_lien_texte', 'Ligne d’orientation : texte du lien', 'text', $half);
    $add('orientation_lien', 'Ligne d’orientation : lien', 'url', $half);

    return $f;
}

add_action('acf/init', function () {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }
    acf_add_local_field_group([
        'key'      => 'group_itpc_projet',
        'title'    => 'Page projet',
        'fields'   => itpc_projet_fields(),
        'location' => [[[
            'param'    => 'page_template',
            'operator' => '==',
            'value'    => ITPC_PROJET_TEMPLATE,
        ]]],
        'position'       => 'acf_after_title',
        'style'          => 'default',
        'hide_on_screen' => ['the_content', 'excerpt', 'discussion', 'comments', 'author', 'format', 'featured_image', 'send-trackbacks'],
        'active'         => true,
        'description'    => 'Contenu des pages projet du site (/programmes/{slug}).',
    ]);
});

// ── 3. Lecture : champs → contenu attendu par le front ───────────────────────
function itpc_pj_get($name, $post_id) {
    $v = function_exists('get_field') ? get_field($name, $post_id) : null;
    if ($v === null || $v === false) {
        return '';
    }
    if (is_array($v)) {
        return isset($v['url']) ? (string) $v['url'] : '';
    }
    return is_bool($v) ? $v : trim((string) $v);
}

function itpc_pj_paragraphs($text) {
    $parts = preg_split('/\\R\\s*\\R/u', (string) $text);
    return array_values(array_filter(array_map('trim', $parts ?: []), 'strlen'));
}

function itpc_projet_payload($id) {
    $g = function ($n) use ($id) { return (string) itpc_pj_get($n, $id); };
    $s = itpc_projet_slots();
    $accents = array_keys(itpc_projet_accents());
    $statuts = array_keys(itpc_projet_statuts());

    $facts = [];
    for ($i = 1; $i <= $s['repere']; $i++) {
        if ($g("repere{$i}_valeur") === '') { continue; }
        $facts[] = ['label' => $g("repere{$i}_libelle"), 'value' => $g("repere{$i}_valeur")];
    }
    $targets = [];
    for ($i = 1; $i <= $s['objectif']; $i++) {
        if ($g("objectif{$i}_valeur") === '') { continue; }
        $a = $g("objectif{$i}_couleur");
        $targets[] = [
            'accent' => in_array($a, $accents, true) ? $a : 'teal',
            'year'   => $g("objectif{$i}_annee"),
            'value'  => $g("objectif{$i}_valeur"),
            'text'   => $g("objectif{$i}_texte"),
        ];
    }
    $blocks = function ($prefix, $n) use ($g) {
        $out = [];
        for ($i = 1; $i <= $n; $i++) {
            if ($g("{$prefix}{$i}_titre") === '') { continue; }
            $out[] = ['title' => $g("{$prefix}{$i}_titre"), 'body' => $g("{$prefix}{$i}_texte")];
        }
        return $out;
    };
    $milestones = [];
    for ($i = 1; $i <= $s['jalon']; $i++) {
        if ($g("jalon{$i}_texte") === '') { continue; }
        $milestones[] = [
            'done' => (bool) itpc_pj_get("jalon{$i}_realise", $id),
            'date' => $g("jalon{$i}_date"),
            'text' => $g("jalon{$i}_texte"),
        ];
    }
    $productions = [];
    for ($i = 1; $i <= $s['production']; $i++) {
        if ($g("production{$i}_titre") === '') { continue; }
        $st   = $g("production{$i}_statut");
        $href = $g("production{$i}_fichier") ?: $g("production{$i}_lien");
        $productions[] = [
            'status' => in_array($st, $statuts, true) ? $st : 'upcoming',
            'title'  => $g("production{$i}_titre"),
            'body'   => $g("production{$i}_texte"),
            'href'   => $href !== '' ? $href : null,
            'cta'    => $g("production{$i}_bouton"),
            'note'   => $g("production{$i}_mention"),
        ];
    }
    $partners = [];
    for ($i = 1; $i <= $s['partenaire']; $i++) {
        if ($g("partenaire{$i}_nom") !== '') { $partners[] = $g("partenaire{$i}_nom"); }
    }

    return [
        'meta'      => ['title' => $g('seo_titre'), 'description' => $g('seo_description')],
        'shortName' => $g('nom_court'),
        'hero'      => [
            'eyebrow' => $g('bandeau_surtitre'),
            'title'   => $g('bandeau_titre'),
            'lede'    => $g('bandeau_chapo'),
            'facts'   => $facts,
        ],
        'context'   => [
            'tag'        => $g('contexte_surtitre'),
            'title'      => $g('contexte_titre'),
            'paragraphs' => itpc_pj_paragraphs($g('contexte_texte')),
        ],
        'targets'   => ['tag' => $g('objectifs_surtitre'), 'items' => $targets],
        'approach'  => [
            'tag'     => $g('demarche_surtitre'),
            'title'   => $g('demarche_titre'),
            'intro'   => $g('demarche_intro'),
            'steps'   => $blocks('etape', $s['etape']),
            'pillars' => $blocks('pilier', $s['pilier']),
        ],
        'governance' => [
            'tag'        => $g('gouvernance_surtitre'),
            'title'      => $g('gouvernance_titre'),
            'paragraphs' => itpc_pj_paragraphs($g('gouvernance_texte')),
        ],
        'milestones' => ['tag' => $g('jalons_surtitre'), 'title' => $g('jalons_titre'), 'items' => $milestones],
        'productions' => [
            'tag'   => $g('productions_surtitre'),
            'title' => $g('productions_titre'),
            'intro' => $g('productions_intro'),
            'items' => $productions,
        ],
        'learnings' => [
            'tag'    => $g('enseignements_surtitre'),
            'title'  => $g('enseignements_titre'),
            'source' => $g('enseignements_source'),
            'items'  => $blocks('enseignement', $s['enseignement']),
        ],
        'partners'  => ['tag' => $g('partenaires_surtitre'), 'items' => $partners],
        'contact'   => [
            'title'           => $g('contact_titre'),
            'body'            => $g('contact_texte'),
            'cta'             => $g('contact_bouton'),
            'href'            => $g('contact_lien'),
            'injectionPrompt' => $g('orientation_question'),
            'injectionLink'   => $g('orientation_lien_texte'),
            'injectionHref'   => $g('orientation_lien'),
        ],
    ];
}

// ── 4. Résolution de la page (slug de base + traduction Polylang) ────────────
function itpc_projet_is_projet($post) {
    return $post
        && $post->post_type === 'page'
        && get_post_meta($post->ID, '_wp_page_template', true) === ITPC_PROJET_TEMPLATE;
}

function itpc_projet_resolve($slug, $lang) {
    $base = get_page_by_path($slug, OBJECT, 'page');
    if (!itpc_projet_is_projet($base)) {
        return 0;
    }
    $id = (int) $base->ID;
    if (function_exists('pll_get_post')) {
        $tr = (int) pll_get_post($id, $lang);
        if ($tr) {
            $id = $tr;
        } elseif (function_exists('pll_get_post_language') && pll_get_post_language($id) !== $lang) {
            return 0; // pas de traduction : le front garde son repli
        }
    }
    return get_post_status($id) === 'publish' ? $id : 0;
}

add_action('rest_api_init', function () {
    register_rest_route('itpc/v1', '/projet', [
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'args'                => [
            'slug' => ['required' => true, 'sanitize_callback' => 'sanitize_title'],
            'lang' => ['default' => 'fr', 'sanitize_callback' => 'sanitize_key'],
        ],
        'callback'            => function (WP_REST_Request $req) {
            if (!function_exists('get_field')) {
                return new WP_Error('acf_missing', 'ACF non actif', ['status' => 404]);
            }
            $id = itpc_projet_resolve($req->get_param('slug'), $req->get_param('lang') ?: 'fr');
            if (!$id) {
                return new WP_Error('projet_missing', 'Page projet introuvable', ['status' => 404]);
            }
            return rest_ensure_response(itpc_projet_payload($id));
        },
    ]);

    register_rest_route('itpc/v1', '/projets', [
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => function () {
            $ids = get_posts([
                'post_type'      => 'page',
                'post_status'    => 'publish',
                'posts_per_page' => 100,
                'fields'         => 'ids',
                'lang'           => '', // Polylang : toutes les langues
                'meta_key'       => '_wp_page_template',
                'meta_value'     => ITPC_PROJET_TEMPLATE,
            ]);
            $slugs = [];
            foreach ($ids as $id) {
                $lang = function_exists('pll_get_post_language') ? pll_get_post_language($id) : 'fr';
                if ($lang && $lang !== 'fr') { continue; }
                $slugs[] = get_post_field('post_name', $id);
            }
            return rest_ensure_response(array_values(array_unique(array_filter($slugs))));
        },
    ]);
});

// ── 5. Écriture inverse (préremplissage) : contenu du front → champs ─────────
// Utilisée par scripts/seed-projet.php. Miroir exact de itpc_projet_payload().
function itpc_projet_values_from_payload(array $p) {
    $s   = itpc_projet_slots();
    $v   = [];
    $str = function ($x) { return is_string($x) ? $x : ''; };
    $sec = function ($k) use ($p) { return isset($p[$k]) && is_array($p[$k]) ? $p[$k] : []; };
    $rows = function ($list, $max, $fn) use (&$v) {
        foreach (array_values(is_array($list) ? $list : []) as $k => $item) {
            if ($k >= $max) { break; }
            $fn($k + 1, is_array($item) ? $item : []);
        }
    };
    $paras = function ($list) {
        return implode(PHP_EOL . PHP_EOL, array_filter(is_array($list) ? $list : [], 'is_string'));
    };

    $meta = $sec('meta');
    $v['seo_titre']       = $str($meta['title'] ?? '');
    $v['seo_description'] = $str($meta['description'] ?? '');
    $v['nom_court']       = $str($p['shortName'] ?? '');

    $h = $sec('hero');
    $v['bandeau_surtitre'] = $str($h['eyebrow'] ?? '');
    $v['bandeau_titre']    = $str($h['title'] ?? '');
    $v['bandeau_chapo']    = $str($h['lede'] ?? '');
    $rows($h['facts'] ?? [], $s['repere'], function ($i, $it) use (&$v, $str) {
        $v["repere{$i}_libelle"] = $str($it['label'] ?? '');
        $v["repere{$i}_valeur"]  = $str($it['value'] ?? '');
    });

    $c = $sec('context');
    $v['contexte_surtitre'] = $str($c['tag'] ?? '');
    $v['contexte_titre']    = $str($c['title'] ?? '');
    $v['contexte_texte']    = $paras($c['paragraphs'] ?? []);

    $t = $sec('targets');
    $v['objectifs_surtitre'] = $str($t['tag'] ?? '');
    $rows($t['items'] ?? [], $s['objectif'], function ($i, $it) use (&$v, $str) {
        $v["objectif{$i}_annee"]   = $str($it['year'] ?? '');
        $v["objectif{$i}_valeur"]  = $str($it['value'] ?? '');
        $v["objectif{$i}_texte"]   = $str($it['text'] ?? '');
        $v["objectif{$i}_couleur"] = $str($it['accent'] ?? 'teal');
    });

    $a = $sec('approach');
    $v['demarche_surtitre'] = $str($a['tag'] ?? '');
    $v['demarche_titre']    = $str($a['title'] ?? '');
    $v['demarche_intro']    = $str($a['intro'] ?? '');
    $rows($a['steps'] ?? [], $s['etape'], function ($i, $it) use (&$v, $str) {
        $v["etape{$i}_titre"] = $str($it['title'] ?? '');
        $v["etape{$i}_texte"] = $str($it['body'] ?? '');
    });
    $rows($a['pillars'] ?? [], $s['pilier'], function ($i, $it) use (&$v, $str) {
        $v["pilier{$i}_titre"] = $str($it['title'] ?? '');
        $v["pilier{$i}_texte"] = $str($it['body'] ?? '');
    });

    $g = $sec('governance');
    $v['gouvernance_surtitre'] = $str($g['tag'] ?? '');
    $v['gouvernance_titre']    = $str($g['title'] ?? '');
    $v['gouvernance_texte']    = $paras($g['paragraphs'] ?? []);

    $m = $sec('milestones');
    $v['jalons_surtitre'] = $str($m['tag'] ?? '');
    $v['jalons_titre']    = $str($m['title'] ?? '');
    $rows($m['items'] ?? [], $s['jalon'], function ($i, $it) use (&$v, $str) {
        $v["jalon{$i}_date"]    = $str($it['date'] ?? '');
        $v["jalon{$i}_texte"]   = $str($it['text'] ?? '');
        $v["jalon{$i}_realise"] = !empty($it['done']) ? 1 : 0;
    });

    $pr = $sec('productions');
    $v['productions_surtitre'] = $str($pr['tag'] ?? '');
    $v['productions_titre']    = $str($pr['title'] ?? '');
    $v['productions_intro']    = $str($pr['intro'] ?? '');
    $rows($pr['items'] ?? [], $s['production'], function ($i, $it) use (&$v, $str) {
        $v["production{$i}_titre"]   = $str($it['title'] ?? '');
        $v["production{$i}_statut"]  = $str($it['status'] ?? 'upcoming');
        $v["production{$i}_texte"]   = $str($it['body'] ?? '');
        $v["production{$i}_lien"]    = $str($it['href'] ?? '');
        $v["production{$i}_bouton"]  = $str($it['cta'] ?? '');
        $v["production{$i}_mention"] = $str($it['note'] ?? '');
    });

    $l = $sec('learnings');
    $v['enseignements_surtitre'] = $str($l['tag'] ?? '');
    $v['enseignements_titre']    = $str($l['title'] ?? '');
    $v['enseignements_source']   = $str($l['source'] ?? '');
    $rows($l['items'] ?? [], $s['enseignement'], function ($i, $it) use (&$v, $str) {
        $v["enseignement{$i}_titre"] = $str($it['title'] ?? '');
        $v["enseignement{$i}_texte"] = $str($it['body'] ?? '');
    });

    $pa = $sec('partners');
    $v['partenaires_surtitre'] = $str($pa['tag'] ?? '');
    foreach (array_values(array_filter($pa['items'] ?? [], 'is_string')) as $k => $name) {
        if ($k >= $s['partenaire']) { break; }
        $v['partenaire' . ($k + 1) . '_nom'] = $name;
    }

    $ct = $sec('contact');
    $v['contact_titre']          = $str($ct['title'] ?? '');
    $v['contact_texte']          = $str($ct['body'] ?? '');
    $v['contact_bouton']         = $str($ct['cta'] ?? '');
    $v['contact_lien']           = $str($ct['href'] ?? '');
    $v['orientation_question']   = $str($ct['injectionPrompt'] ?? '');
    $v['orientation_lien_texte'] = $str($ct['injectionLink'] ?? '');
    $v['orientation_lien']       = $str($ct['injectionHref'] ?? '');

    return $v;
}
