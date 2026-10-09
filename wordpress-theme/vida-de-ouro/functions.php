<?php
defined('ABSPATH') || exit;

require_once get_template_directory() . '/inc/produtos-data.php';
require_once get_template_directory() . '/inc/seed-produtos.php';

/* -------------------------------------------------------
   THEME SETUP
------------------------------------------------------- */
add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script']);
    add_theme_support('automatic-feed-links');
});

/* -------------------------------------------------------
   ENQUEUE
------------------------------------------------------- */
add_action('wp_enqueue_scripts', function () {
    $v = '1.0.0';
    $uri = get_template_directory_uri();

    wp_enqueue_style('vdo-fonts', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap', [], null);
    wp_enqueue_style('vdo-style', $uri . '/assets/css/style.css', ['vdo-fonts'], $v);
    wp_enqueue_script('vdo-main', $uri . '/assets/js/main.js', [], $v, true);

    if (is_front_page()) {
        wp_enqueue_script('vdo-thumbs', $uri . '/assets/js/thumbs.js', ['vdo-main'], $v, true);
    }
    if (is_single()) {
        wp_enqueue_script('vdo-artigo', $uri . '/assets/js/artigo.js', ['vdo-main'], $v, true);
    }
});

/* -------------------------------------------------------
   CUSTOM POST TYPE: produto
------------------------------------------------------- */
add_action('init', function () {
    register_post_type('produto', [
        'labels' => [
            'name'               => 'Produtos',
            'singular_name'      => 'Produto',
            'add_new'            => 'Adicionar produto',
            'add_new_item'       => 'Adicionar novo produto',
            'edit_item'          => 'Editar produto',
            'new_item'           => 'Novo produto',
            'view_item'          => 'Ver produto',
            'search_items'       => 'Buscar produtos',
            'not_found'          => 'Nenhum produto encontrado',
            'not_found_in_trash' => 'Nenhum produto na lixeira',
        ],
        'public'             => true,
        'show_in_rest'       => true,
        'supports'           => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
        'has_archive'        => false,
        'rewrite'            => ['slug' => 'produto', 'with_front' => false],
        'menu_icon'          => 'dashicons-shield',
        'show_in_menu'       => true,
    ]);
});

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */
function vdo_img(string $path): string {
    return esc_url(get_template_directory_uri() . '/assets/img/' . ltrim($path, '/'));
}

function vdo_p(string $slug): string {
    return esc_url(home_url('/produto/' . $slug . '/'));
}

function vdo_url(string $page_slug): string {
    return esc_url(home_url('/' . $page_slug . '/'));
}

function vdo_nav_active(bool $condition): string {
    return $condition ? ' nav__link--active" aria-current="page' : '';
}

/* -------------------------------------------------------
   BODY CLASSES: add page slug for CSS hooks
------------------------------------------------------- */
add_filter('body_class', function ($classes) {
    if (is_singular('produto')) {
        $classes[] = 'is-produto';
        $classes[] = 'is-produto-' . get_post_field('post_name');
    }
    if (is_front_page()) $classes[] = 'is-home';
    if (is_page('sobre'))   $classes[] = 'is-sobre';
    if (is_page('contato')) $classes[] = 'is-contato';
    return $classes;
});

/* -------------------------------------------------------
   DISABLE EMOJI (keeps output clean)
------------------------------------------------------- */
remove_action('wp_head', 'print_emoji_detection_script', 7);
remove_action('wp_print_styles', 'print_emoji_styles');

/* -------------------------------------------------------
   ELEMENTOR COMPATIBILITY
------------------------------------------------------- */

/**
 * Retorna true se a página/post atual foi construído com Elementor.
 * Funciona com Elementor Free e Pro.
 */
function vdo_has_elementor(): bool {
    if (!did_action('elementor/loaded')) return false;
    $id = get_queried_object_id();
    if (!$id) return false;
    // Elementor Pro: verifica location do Theme Builder
    if (function_exists('elementor_theme_has_location') && elementor_theme_has_location('single')) {
        return true;
    }
    // Elementor Free/Pro: verifica se a página usa o editor
    return get_post_meta($id, '_elementor_edit_mode', true) === 'builder';
}

// Padding-top para compensar o header fixo nas páginas Elementor
add_action('wp_head', function () {
    if (!vdo_has_elementor()) return;
    echo '<style>
      .vdo-elementor-page { padding-top: var(--header-h, 80px); min-height: 60vh; }
      .elementor-section-wrap > .elementor-section:first-child { margin-top: 0; }
    </style>';
});

// Garante que o Elementor Pro Theme Builder substitua header/footer quando disponível
add_action('elementor/theme/register_locations', function ($manager) {
    $manager->register_all_core_location();
});

/* -------------------------------------------------------
   REST API: POST /wp-json/vdo/v1/leads
   Recebe cotações do formulário; envia e-mail ao admin
   e grava log simples nos options (últimas 200 entradas).
------------------------------------------------------- */
add_action('rest_api_init', function () {
    register_rest_route('vdo/v1', '/leads', [
        'methods'             => 'POST',
        'callback'            => 'vdo_leads_endpoint',
        'permission_callback' => '__return_true',
    ]);
});

function vdo_leads_endpoint(WP_REST_Request $req): WP_REST_Response {
    $data = $req->get_json_params() ?: [];

    $nome     = sanitize_text_field($data['nome']         ?? '');
    $telefone = sanitize_text_field($data['telefone']     ?? '');
    $email    = sanitize_email($data['email']             ?? '');
    $cidade   = sanitize_text_field($data['cidade']       ?? '');
    $produto  = sanitize_text_field($data['produto']      ?? '');
    $mensagem = sanitize_textarea_field($data['mensagem'] ?? '');

    if (!$nome && !$telefone) {
        return new WP_REST_Response(['error' => 'Nome ou telefone obrigatórios.'], 400);
    }

    $assunto = 'Nova cotação — ' . ($produto ?: 'Geral') . ($nome ? " — $nome" : '');
    $corpo   = "Nova solicitação de cotação:\n\n"
             . "Nome:     $nome\n"
             . "Telefone: $telefone\n"
             . "E-mail:   $email\n"
             . "Cidade:   $cidade\n"
             . "Produto:  $produto\n"
             . "Mensagem: $mensagem\n\n"
             . 'Site: ' . home_url('/');

    wp_mail(get_option('admin_email'), $assunto, $corpo);

    $log   = get_option('vdo_leads_log', []);
    $log[] = [
        'time'     => current_time('mysql'),
        'nome'     => $nome,
        'telefone' => $telefone,
        'email'    => $email,
        'cidade'   => $cidade,
        'produto'  => $produto,
    ];
    if (count($log) > 200) $log = array_slice($log, -200);
    update_option('vdo_leads_log', $log, false);

    return new WP_REST_Response([
        'ok'       => true,
        'mensagem' => 'Cotação recebida! Nossa equipe entrará em contato em breve.',
    ]);
}

/* -------------------------------------------------------
   SEO: meta description + Open Graph básico
   Ativado apenas quando nenhum plugin de SEO está presente.
------------------------------------------------------- */
add_action('wp_head', function () {
    // Cede o controle para Yoast, RankMath ou AIOSEO se instalados
    if (
        defined('WPSEO_VERSION') ||
        defined('RANK_MATH_VERSION') ||
        class_exists('AIOSEO\Plugin\AIOSEO')
    ) return;

    $desc = '';

    if (is_front_page()) {
        $desc = 'Corretora de seguros no Vale do Paraíba e Litoral Norte. Auto, vida, saúde, residencial e muito mais. Cotação gratuita em até 1 hora.';
    } elseif (is_singular('produto')) {
        $slug = get_post_field('post_name');
        $p    = function_exists('vdo_get_produto') ? vdo_get_produto($slug) : null;
        $desc = $p['tagline'] ?? $p['descricao'] ?? wp_strip_all_tags(get_the_excerpt());
    } elseif (is_page('sobre')) {
        $desc = 'Conheça a Vida de Ouro Jacareí — corretora com atendimento consultivo, pós-venda ativo e avaliações 5 estrelas no Google.';
    } elseif (is_page('contato')) {
        $desc = 'Fale com a Vida de Ouro Jacareí para cotações de seguro, planos de saúde, consórcios e previdência no Vale do Paraíba.';
    } elseif (is_singular()) {
        $desc = wp_strip_all_tags(get_the_excerpt());
    } elseif (is_home() || is_archive()) {
        $desc = 'Blog da Vida de Ouro Jacareí — dicas sobre seguros, planos de saúde e proteção financeira.';
    }

    if (!$desc) return;

    $desc  = esc_attr(wp_trim_words($desc, 30, '…'));
    $title = esc_attr(wp_get_document_title());
    $url   = esc_url(is_singular() ? get_permalink() : home_url('/'));

    echo '<meta name="description" content="' . $desc . '">' . "\n";
    echo '<meta property="og:title" content="' . $title . '">' . "\n";
    echo '<meta property="og:description" content="' . $desc . '">' . "\n";
    echo '<meta property="og:type" content="website">' . "\n";
    echo '<meta property="og:url" content="' . $url . '">' . "\n";
    echo '<meta property="og:site_name" content="' . esc_attr(get_bloginfo('name')) . '">' . "\n";
}, 5);

/* -------------------------------------------------------
   WHATSAPP FLOAT — via wp_footer garante presença mesmo
   quando Elementor Pro substitui o template footer.php.
------------------------------------------------------- */
add_action('wp_footer', function () {
    ?>
    <a href="https://wa.me/5512976002718" target="_blank" rel="noopener noreferrer"
       class="wpp-float" aria-label="Chamar no WhatsApp">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      <span class="wpp-float__label">Fale conosco</span>
    </a>
    <?php
}, 20);
