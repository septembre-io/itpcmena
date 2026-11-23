<?php
/**
 * Préremplissage d'une page projet (FR, EN, AR) à partir du contenu du front.
 *
 * Crée au besoin les trois pages (modèle « Page projet (site) »), les relie dans
 * Polylang, puis remplit les champs ACF avec le JSON produit par
 * scripts/projet-seed-json.mjs (même contenu que le repli du site).
 *
 * Usage (racine WordPress, mu-plugin itpc-projets.php déjà déployé) :
 *   wp eval-file seed-projet.php projet-lancer.json            # remplit les champs vides
 *   wp eval-file seed-projet.php projet-lancer.json ecraser    # réécrit tout (perd les saisies)
 * (« ecraser » sans tirets : WP-CLI refuse les options inconnues sur eval-file.)
 *
 * Idempotent : sans « ecraser », un champ déjà saisi n'est jamais modifié ; une ligne
 * de liste (étape, production…) n'est écrite que si son champ principal est vide.
 * Les pages sont créées publiées : leur contenu est celui que le site affiche déjà.
 */

if (!function_exists('update_field') || !function_exists('itpc_projet_values_from_payload')) {
    WP_CLI::error('ACF ou le mu-plugin itpc-projets.php est absent.');
}
if (!function_exists('pll_set_post_language') || !function_exists('pll_save_post_translations') || !function_exists('pll_get_post')) {
    WP_CLI::error('Polylang absent (fonctions pll_* indisponibles).');
}

$file  = $args[0] ?? '';
$force = in_array('ecraser', $args, true);
if ($file === '' || !is_readable($file)) {
    WP_CLI::error('Indiquer le fichier JSON : wp eval-file seed-projet.php projet-lancer.json');
}
$data = json_decode((string) file_get_contents($file), true);
if (!is_array($data) || empty($data['slug']) || empty($data['content']['fr'])) {
    WP_CLI::error('JSON illisible ou incomplet (slug, content.fr attendus).');
}
$slug   = sanitize_title($data['slug']);
$titles = $data['titles'] ?? [];

// ── Pages et traductions ─────────────────────────────────────────────────────
$base = get_page_by_path($slug, OBJECT, 'page');
if ($base && !itpc_projet_is_projet($base)) {
    WP_CLI::error(sprintf('Une page « %s » existe déjà sans le modèle « Page projet (site) » (#%d) : vérifier avant de continuer.', $slug, $base->ID));
}

$ensure_page = function ($lang, $post_slug, $existing_id) use ($titles) {
    if ($existing_id) {
        $id = (int) $existing_id;
        WP_CLI::log(sprintf('Page %s présente (#%d), réutilisée.', strtoupper($lang), $id));
    } else {
        $id = wp_insert_post([
            'post_type'   => 'page',
            'post_status' => 'publish',
            'post_title'  => (string) ($titles[$lang] ?? $titles['fr'] ?? $post_slug),
            'post_name'   => $post_slug,
        ], true);
        if (is_wp_error($id)) {
            WP_CLI::error(sprintf('Création de la page %s impossible : %s', strtoupper($lang), $id->get_error_message()));
        }
        WP_CLI::success(sprintf('Page %s créée (#%d).', strtoupper($lang), $id));
    }
    update_post_meta($id, '_wp_page_template', ITPC_PROJET_TEMPLATE);
    pll_set_post_language($id, $lang);
    return (int) $id;
};

$map = ['fr' => $ensure_page('fr', $slug, $base ? $base->ID : 0)];
foreach (['en', 'ar'] as $lang) {
    if (empty($data['content'][$lang])) { continue; }
    $map[$lang] = $ensure_page($lang, $slug . '-' . $lang, pll_get_post($map['fr'], $lang));
}
pll_save_post_translations($map);
WP_CLI::log('Traductions liées : ' . wp_json_encode($map));

// ── Champs ───────────────────────────────────────────────────────────────────
$is_empty = function ($id, $name) {
    if (!metadata_exists('post', $id, $name)) { return true; }
    return get_post_meta($id, $name, true) === '';
};

$row_main = [
    'repere' => 'valeur', 'objectif' => 'valeur', 'etape' => 'titre', 'pilier' => 'titre',
    'jalon' => 'texte', 'production' => 'titre', 'enseignement' => 'titre', 'partenaire' => 'nom',
];
foreach ($map as $lang => $id) {
    $values = itpc_projet_values_from_payload($data['content'][$lang]);
    // Décision prise AVANT toute écriture : une ligne de liste suit son champ
    // principal (sinon, une fois ce champ écrit, la suite de la ligne serait sautée).
    $todo = [];
    foreach ($values as $name => $value) {
        if (preg_match('/^(repere|objectif|etape|pilier|jalon|production|enseignement|partenaire)(\\d+)_/', $name, $m)) {
            $empty = $is_empty($id, $m[1] . $m[2] . '_' . $row_main[$m[1]]);
        } else {
            $empty = $is_empty($id, $name);
        }
        if ($force || ($empty && $value !== '')) {
            $todo[$name] = $value;
        }
    }
    foreach ($todo as $name => $value) {
        update_field('field_itpc_pj_' . $name, $value, $id);
    }
    WP_CLI::success(sprintf('%s (#%d) : %d champs écrits, %d conservés ou vides.', strtoupper($lang), $id, count($todo), count($values) - count($todo)));
}
WP_CLI::log('Contrôle : curl -s "' . home_url('/wp-json/itpc/v1/projet?slug=' . $slug . '&lang=fr') . '" | head -c 400');
