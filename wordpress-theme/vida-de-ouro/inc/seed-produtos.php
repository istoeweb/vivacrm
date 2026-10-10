<?php
/**
 * Cria os 21 posts do CPT "produto" com os slugs corretos.
 * Execute uma vez: wp eval-file wp-content/themes/vida-de-ouro/inc/seed-produtos.php
 * Ou ative o hook abaixo para criar na ativação do tema (remove-se depois).
 */
defined('ABSPATH') || exit;

function vdo_seed_produtos() {
    if (get_option('vdo_produtos_seeded')) return;

    require_once get_template_directory() . '/inc/produtos-data.php';
    $todos = vdo_all_produtos();

    foreach ($todos as $slug => $p) {
        $exists = get_posts([
            'name'           => $slug,
            'post_type'      => 'produto',
            'post_status'    => 'publish',
            'posts_per_page' => 1,
        ]);
        if ($exists) continue;

        wp_insert_post([
            'post_title'   => $p['nome'],
            'post_name'    => $slug,
            'post_type'    => 'produto',
            'post_status'  => 'publish',
            'post_content' => $p['descricao'] ?? '',
            'post_excerpt' => $p['tagline'] ?? '',
        ]);
    }

    update_option('vdo_produtos_seeded', true);
}
add_action('after_switch_theme', 'vdo_seed_produtos');
