<?php
/**
 * Plugin Name: ITPC – REST Clean
 * Description: Retire la sortie Yoast SEO de l'API REST (allège les réponses /wp-json/) sans toucher au SEO public. À déposer dans wp-content/mu-plugins/.
 * Author: ITPC MENA
 * Version: 1.0
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * 1) Désactive l'ajout du bloc Yoast (yoast_head / yoast_head_json)
 *    dans toutes les réponses REST. Le SEO du site public n'est pas affecté.
 */
add_filter('wpseo_should_add_yoast_head_to_rest', '__return_false');

/**
 * 2) Filet de sécurité : supprime explicitement les champs yoast_head /
 *    yoast_head_json des réponses REST pour les posts, pages, catégories et tags,
 *    au cas où le filtre ci-dessus ne suffirait pas selon la version de Yoast.
 */
add_action('rest_api_init', function () {
    $types = array('post', 'page', 'category', 'post_tag');
    foreach ($types as $type) {
        // Objets (posts/pages)
        add_filter("rest_prepare_{$type}", 'itpc_strip_yoast_from_rest', 99, 3);
    }
}, 99);

function itpc_strip_yoast_from_rest($response, $object, $request) {
    if (isset($response->data['yoast_head'])) {
        unset($response->data['yoast_head']);
    }
    if (isset($response->data['yoast_head_json'])) {
        unset($response->data['yoast_head_json']);
    }
    return $response;
}
