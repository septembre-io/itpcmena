<?php
/**
 * Plugin Name: ITPC — Tribunes / op-ed (ACF + REST)
 * Description: Signature et chapô des tribunes (catégorie « Opinion », ID 1179 +
 *              traductions EN 1181 / AR 976) : auteur·ice, fonction, chapô,
 *              portrait. Enregistre le groupe ACF (sans import manuel) et
 *              l'expose en REST sous la clé `itpc_tribune` sur /wp/v2/posts.
 * Version: 1.0.0
 *
 * Consommé par : src/lib/wordpress.ts (getByline / getLede) → bloc « La tribune
 * à la une » de l'accueil (src/components/v3/sections/OpEd.tsx).
 *   GET /wp-json/wp/v2/posts?lang=fr&itpc_section=blog&_fields=…,itpc_tribune
 *
 * Modèle : calqué sur itpc-appels.php. La catégorie « Opinion » est reconnue
 * dans ses 3 langues Polylang, donc les champs s'affichent sur une tribune
 * quelle que soit la langue sous laquelle elle est rédigée. Les IDs viennent de
 * itpc-opinions-lock.php (source unique) ; repli local si ce plugin est absent.
 *
 * Ce que le plugin N'AJOUTE PAS : le titre, la date et le temps de lecture. Le
 * premier vient du post, la date de WordPress, le temps de lecture est calculé
 * côté front d'après le contenu. On n'ajoute que ce que l'article ne dit pas.
 *
 * Le front est fail-soft : tant qu'aucun champ n'est rempli, le bloc s'affiche
 * sans signature et le chapô retombe sur l'extrait WordPress. Rien ne casse, et
 * aucun « à renseigner » n'apparaît en public.
 *
 * Déploiement : déposer dans wp-content/mu-plugins/. ACF gratuit suffit
 * (text / textarea / image). Recharger PHP-FPM.
 */

if (!defined('ABSPATH')) {
    exit;
}

/** Catégorie « Opinion » — ID FR de base (cf. itpc-sections.php : blog = 1179). */
if (!defined('ITPC_OPINION_CATEGORY_ID')) {
    define('ITPC_OPINION_CATEGORY_ID', 1179);
}

/**
 * IDs de la catégorie « Opinion » dans ses 3 langues.
 * itpc-opinions-lock.php porte déjà cette résolution : on la réutilise telle
 * quelle si elle est là, et on ne duplique un repli qu'en son absence.
 */
if (!function_exists('itpc_tribunes_category_ids')) {
    function itpc_tribunes_category_ids() {
        if (function_exists('itpc_opinion_category_ids')) {
            return itpc_opinion_category_ids();
        }
        static $ids = null;
        if (is_array($ids)) {
            return $ids;
        }
        $out = [(int) ITPC_OPINION_CATEGORY_ID, 1181, 976];
        $map = [];
        if (function_exists('itpc_term_translations')) {          // helper SQL (itpc-polylang-rest.php)
            $map = itpc_term_translations(ITPC_OPINION_CATEGORY_ID);
        } elseif (function_exists('pll_get_term_translations')) { // repli Polylang
            $map = pll_get_term_translations(ITPC_OPINION_CATEGORY_ID);
        }
        if (is_array($map)) {
            foreach ($map as $tid) {
                $out[] = (int) $tid;
            }
        }
        $ids = array_values(array_filter(array_unique($out)));
        return $ids;
    }
}

/** Le post est-il une tribune (catégorie Opinion dans l'une de ses 3 langues) ? */
function itpc_post_is_tribune($post) {
    return (bool) has_category(itpc_tribunes_category_ids(), $post);
}

// ── 1. Enregistrement du groupe ACF (local, pas d'import manuel) ─────────────
add_action('acf/init', function () {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }
    acf_add_local_field_group([
        'key'    => 'group_itpc_tribune',
        'title'  => 'Tribune — signature',
        'fields' => [
            [
                'key'          => 'field_itpc_tribune_auteur',
                'label'        => 'Auteur·ice',
                'name'         => 'tribune_auteur',
                'type'         => 'text',
                'instructions' => 'Nom affiché sous la tribune. Une organisation est une signature valable : « ITPC-MENA », « Coalition MENA-H ». Laisser vide = aucune signature affichée.',
            ],
            [
                'key'          => 'field_itpc_tribune_fonction',
                'label'        => 'Fonction / organisation',
                'name'         => 'tribune_fonction',
                'type'         => 'text',
                'instructions' => 'Ligne secondaire, sous le nom. Ex. « Co-fondateur d’ITPC-MENA » ou « Secrétariat régional · Rabat ». Facultatif.',
            ],
            [
                'key'          => 'field_itpc_tribune_chapo',
                'label'        => 'Chapô',
                'name'         => 'tribune_chapo',
                'type'         => 'textarea',
                'rows'         => 3,
                'maxlength'    => 220,
                'new_lines'    => '',
                'instructions' => 'Deux lignes qui donnent envie de lire, affichées sous le titre. Laisser vide = le début de l’article est repris automatiquement (souvent coupé au mauvais endroit).',
            ],
            [
                'key'           => 'field_itpc_tribune_portrait',
                'label'         => 'Portrait',
                'name'          => 'tribune_portrait',
                'type'          => 'image',
                'return_format' => 'array',
                'preview_size'  => 'thumbnail',
                'library'       => 'all',
                'mime_types'    => 'jpg,jpeg,png,webp',
                'instructions'  => 'Facultatif. Photo carrée, 400×400 px minimum. Sans photo, les initiales sur pastille de couleur sont utilisées.',
            ],
        ],
        // N'apparaît que sur les tribunes — dans chacune des 3 langues (OR).
        'location' => array_map(function ($cid) {
            return [[
                'param'    => 'post_category',
                'operator' => '==',
                'value'    => 'category:' . $cid,
            ]];
        }, itpc_tribunes_category_ids()),
        'menu_order'  => 0,
        'position'    => 'side',
        'active'      => true,
        'description' => 'Signature et chapô des tribunes (bloc op-ed de l’accueil, page /opinions).',
    ]);
});

// ── 2. Exposition REST : clé `itpc_tribune` sur les posts ────────────────────
add_action('rest_api_init', function () {
    register_rest_field('post', 'itpc_tribune', [
        'get_callback' => 'itpc_tribunes_rest_get',
        'schema'       => [
            'description' => 'Signature / chapô d’une tribune (null hors catégorie Opinion).',
            'type'        => ['object', 'null'],
        ],
    ]);
});

function itpc_tribunes_rest_get($post_arr) {
    $post_id = (int) ($post_arr['id'] ?? 0);
    if (!$post_id) {
        return null;
    }
    // Ne renvoie l'objet que pour les tribunes → charge utile inchangée ailleurs.
    if (!itpc_post_is_tribune($post_id)) {
        return null;
    }
    $get = function ($name) use ($post_id) {
        if (!function_exists('get_field')) {
            return null;
        }
        $v = get_field($name, $post_id);
        return ($v === false) ? null : $v;
    };

    $portrait = $get('tribune_portrait');
    $image = null;
    if (is_array($portrait) && !empty($portrait['url'])) {
        $image = [
            'url'    => (string) $portrait['url'],
            'alt'    => (string) ($portrait['alt'] ?? ''),
            'width'  => (int) ($portrait['width'] ?? 0),
            'height' => (int) ($portrait['height'] ?? 0),
        ];
    }

    return [
        'auteur'   => trim((string) $get('tribune_auteur')),
        'fonction' => trim((string) $get('tribune_fonction')),
        'chapo'    => trim((string) $get('tribune_chapo')),
        'portrait' => $image, // null tant qu'aucune photo n'est choisie
    ];
}
