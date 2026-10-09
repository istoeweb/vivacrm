<?php
/**
 * Plugin Name: Vida de Ouro — Importer
 * Description: Importa imagens, páginas e produtos para o WordPress. Conteúdo pronto para o Elementor — sem copiar arquivos manualmente.
 * Version:     1.3.0
 * Requires at least: 6.0
 * Requires PHP: 8.0
 * Author: Vida de Ouro Jacareí
 * Text Domain: vdo-importer
 */
defined('ABSPATH') || exit;

define('VDOI_DIR',     plugin_dir_path(__FILE__));
define('VDOI_IMG_DIR', VDOI_DIR . 'img/');

/* -------------------------------------------------------
   ADMIN MENU
------------------------------------------------------- */
add_action('admin_menu', function () {
    add_menu_page(
        'Vida de Ouro — Importer',
        'VDO Importer',
        'manage_options',
        'vdo-importer',
        'vdoi_admin_page',
        'dashicons-shield',
        30
    );
});

/* -------------------------------------------------------
   ADMIN PAGE
------------------------------------------------------- */
function vdoi_admin_page(): void {
    $log    = [];
    $action = sanitize_key($_POST['vdo_action'] ?? '');

    if ($action && check_admin_referer('vdoi_nonce')) {
        switch ($action) {
            case 'images':        vdoi_do_images($log);              break;
            case 'products':      vdoi_do_products($log);            break;
            case 'pages':         vdoi_do_pages($log);               break;
            case 'product_pages': vdoi_do_product_pages($log);       break;
            case 'img_urls':      vdoi_do_replace_image_urls($log);  break;
            case 'settings':      vdoi_do_settings($log);            break;
            case 'all':
                vdoi_do_images($log);
                vdoi_do_products($log);
                vdoi_do_pages($log);
                vdoi_do_product_pages($log);
                vdoi_do_replace_image_urls($log);
                vdoi_do_settings($log);
                break;
        }
    }

    $ok  = count(array_filter($log, fn($e) => $e['type'] === 'ok'));
    $err = count(array_filter($log, fn($e) => $e['type'] === 'error'));
    ?>
    <div class="wrap">
      <h1 style="display:flex;align-items:center;gap:10px;">
        <span class="dashicons dashicons-shield" style="font-size:28px;color:#1E3A5F;margin-top:2px;"></span>
        Vida de Ouro — Importer
      </h1>
      <p style="color:#555;max-width:760px;">
        Configure o WordPress completamente a partir deste plugin — as imagens já estão incluídas,
        não é necessário copiar nenhum arquivo manualmente.
        Execute os passos em ordem ou clique em <strong>Importar Tudo</strong>.
      </p>

      <?php if ($log): ?>
      <div class="notice <?= $err ? 'notice-error' : 'notice-success' ?>" style="padding:12px 16px 4px;max-height:360px;overflow-y:auto;">
        <p><strong><?= $ok ?> itens processados<?= $err ? ", $err erros" : '' ?></strong></p>
        <?php foreach ($log as $e):
            $ico = match($e['type']) { 'ok' => '✅', 'skip' => '⏩', default => '❌' };
        ?>
          <p style="margin:3px 0;font-size:13px;"><?= $ico ?> <?= esc_html($e['msg']) ?></p>
        <?php endforeach; ?>
      </div>
      <?php endif; ?>

      <form method="post" style="margin-top:24px;max-width:900px;">
        <?php wp_nonce_field('vdoi_nonce'); ?>

        <table class="widefat fixed striped" style="border-collapse:collapse;">
          <thead>
            <tr>
              <th style="width:240px;">Passo</th>
              <th>O que faz</th>
              <th style="width:180px;text-align:right;"></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>1 · Importar Imagens</strong></td>
              <td>
                Usa as <strong><?= count(vdoi_list_bundled_images()) ?> imagens incluídas no plugin</strong>.
                Copia cada uma para o tema (<code>assets/img/</code>) e para a Biblioteca de Mídia.
                Pula arquivos já importados.
              </td>
              <td style="text-align:right;"><button class="button" name="vdo_action" value="images">Importar imagens</button></td>
            </tr>
            <tr>
              <td><strong>2 · Criar Produtos</strong></td>
              <td>Cria os 21 posts do tipo <em>Produto</em> com slugs corretos. Pula os que já existem.</td>
              <td style="text-align:right;"><button class="button" name="vdo_action" value="products">Criar produtos</button></td>
            </tr>
            <tr>
              <td><strong>3 · Importar Páginas</strong></td>
              <td>Cria <em>Início, Sobre, Contato, Política</em> e <em>Blog</em> com conteúdo Elementor gerado pelos templates. <strong>Não sobrescreve páginas já editadas no Elementor.</strong></td>
              <td style="text-align:right;"><button class="button" name="vdo_action" value="pages">Importar páginas</button></td>
            </tr>
            <tr>
              <td><strong>4 · Importar Produtos (Elementor)</strong></td>
              <td>Renderiza <code>single-produto.php</code> para cada um dos 21 produtos com dados reais (coberturas, seguradoras, FAQ) e grava o conteúdo no Elementor. <strong>Não sobrescreve produtos já editados.</strong></td>
              <td style="text-align:right;"><button class="button" name="vdo_action" value="product_pages">Importar produtos</button></td>
            </tr>
            <tr>
              <td><strong>5 · Atualizar URLs</strong></td>
              <td>Substitui URLs do tema (<code>/themes/vida-de-ouro/assets/img/…</code>) pelas URLs da Biblioteca de Mídia no conteúdo Elementor de todas as páginas e produtos.</td>
              <td style="text-align:right;"><button class="button" name="vdo_action" value="img_urls">Atualizar URLs</button></td>
            </tr>
            <tr>
              <td><strong>6 · Configurar WP</strong></td>
              <td>Define página inicial (<em>Início</em>) e página de posts (<em>Blog</em>) em <em>Configurações → Leitura</em>. Atualiza permalinks.</td>
              <td style="text-align:right;"><button class="button" name="vdo_action" value="settings">Configurar</button></td>
            </tr>
          </tbody>
        </table>

        <p style="margin-top:20px;">
          <button class="button button-primary button-large" name="vdo_action" value="all"
            onclick="return confirm('Executar todos os 6 passos agora?')">
            ▶&nbsp; Importar Tudo (passos 1 – 6)
          </button>
        </p>
      </form>

      <hr style="margin:36px 0 24px;">
      <h3>Próximos passos (após Importar Tudo)</h3>
      <ol style="max-width:700px;line-height:1.9;">
        <li>Certifique-se de que o tema <strong>Vida de Ouro Jacareí</strong> está ativo em <em>Aparência → Temas</em>.</li>
        <li>Vá em <em>Configurações → Links Permanentes</em> e clique em <strong>Salvar</strong>.</li>
        <li>Abra qualquer página ou produto e clique em <strong>"Editar com Elementor"</strong>.</li>
        <li><em>(Blog)</em> Para editar o layout do blog visualmente use <strong>Elementor Pro → Theme Builder → Arquivo</strong>.</li>
      </ol>

      <?php vdoi_status_table(); ?>
    </div>
    <?php
}

/* -------------------------------------------------------
   STATUS TABLE
------------------------------------------------------- */
function vdoi_status_table(): void {
    $front   = get_page_by_path('inicio');
    $blog_pg = get_page_by_path('blog');
    $sobre   = get_page_by_path('sobre');
    $contato = get_page_by_path('contato');
    $privacy = get_page_by_path('politica-de-privacidade');

    $all_produtos = get_posts(['post_type' => 'produto', 'posts_per_page' => -1, 'fields' => 'ids']);
    $el_produtos  = get_posts([
        'post_type'      => 'produto',
        'meta_key'       => '_elementor_edit_mode',
        'meta_value'     => 'builder',
        'posts_per_page' => -1,
        'fields'         => 'ids',
    ]);

    $imported_media = (int) get_option('vdoi_images_imported', 0);
    $bundled        = count(vdoi_list_bundled_images());
    $theme_img_ok   = is_dir(get_template_directory() . '/assets/img/') &&
                      file_exists(get_template_directory() . '/assets/img/logo.svg');

    $has_el = fn(?WP_Post $p): bool =>
        $p && get_post_meta($p->ID, '_elementor_edit_mode', true) === 'builder';

    $rows = [
        ['Imagens no plugin',        "$bundled arquivos incluídos",                                     $bundled > 0],
        ['Imagens → Biblioteca',     "$imported_media importadas para a Mídia",                         $imported_media > 0],
        ['Imagens → Tema',           $theme_img_ok ? 'Copiadas para assets/img/' : 'Pendente',          $theme_img_ok],
        ['Página Início',            $front   ? "ID {$front->ID}"   : '—',                              (bool) $front],
        ['  └ Elementor',            $has_el($front)   ? 'Configurado' : 'Pendente',                    $has_el($front)],
        ['Página Sobre',             $sobre   ? "ID {$sobre->ID}"   : '—',                              (bool) $sobre],
        ['  └ Elementor',            $has_el($sobre)   ? 'Configurado' : 'Pendente',                    $has_el($sobre)],
        ['Página Contato',           $contato ? "ID {$contato->ID}" : '—',                              (bool) $contato],
        ['  └ Elementor',            $has_el($contato) ? 'Configurado' : 'Pendente',                    $has_el($contato)],
        ['Política de Privacidade',  $privacy ? "ID {$privacy->ID}" : '—',                              (bool) $privacy],
        ['  └ Elementor',            $has_el($privacy) ? 'Configurado' : 'Pendente',                    $has_el($privacy)],
        ['Página Blog',              $blog_pg ? "ID {$blog_pg->ID}" : '—',                              (bool) $blog_pg],
        ['Produtos (posts)',          count($all_produtos) . ' / 21',                                    count($all_produtos) >= 21],
        ['Produtos com Elementor',   count($el_produtos) . ' / 21',                                      count($el_produtos) >= 21],
        ['Página inicial (leitura)', get_option('show_on_front') === 'page' ? 'Página estática ✓' : 'Posts recentes', get_option('show_on_front') === 'page'],
    ];
    ?>
    <h3 style="margin-top:32px;">Status atual</h3>
    <table class="widefat fixed striped" style="max-width:620px;">
      <tbody>
        <?php foreach ($rows as [$label, $value, $ok]): ?>
        <tr>
          <td style="width:260px;"><?= esc_html($label) ?></td>
          <td><?= esc_html($value) ?></td>
          <td style="width:30px;text-align:center;"><?= $ok ? '✅' : '⬜' ?></td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
    <?php
}

/* -------------------------------------------------------
   LIST BUNDLED IMAGES
------------------------------------------------------- */
function vdoi_list_bundled_images(): array {
    if (!is_dir(VDOI_IMG_DIR)) return [];
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
    $files   = [];
    $iter    = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator(VDOI_IMG_DIR, FilesystemIterator::SKIP_DOTS)
    );
    foreach ($iter as $file) {
        if (!$file->isFile()) continue;
        $ext = strtolower(pathinfo($file->getFilename(), PATHINFO_EXTENSION));
        if (in_array($ext, $allowed, true)) {
            $files[] = $file->getPathname();
        }
    }
    return $files;
}

/* -------------------------------------------------------
   LOG HELPER
------------------------------------------------------- */
function vdoi_log(array &$log, string $type, string $msg): void {
    $log[] = ['type' => $type, 'msg' => $msg];
}

/* -------------------------------------------------------
   STEP 1 — IMPORT IMAGES
   Fonte: pasta img/ incluída no próprio plugin.
   Destino 1: assets/img/ do tema (para vdo_img() nos templates PHP).
   Destino 2: Biblioteca de Mídia do WordPress (para Elementor).
   _vdoi_src guarda o caminho relativo à pasta img/ do plugin
   (ex: "produtos/seguro-auto.jpg") para portabilidade.
------------------------------------------------------- */
function vdoi_do_images(array &$log): void {
    require_once ABSPATH . 'wp-admin/includes/image.php';
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';

    if (!is_dir(VDOI_IMG_DIR)) {
        vdoi_log($log, 'error', 'Pasta img/ não encontrada no plugin. Reinstale o plugin.');
        return;
    }

    $theme_img_dir = get_template_directory() . '/assets/img/';
    $allowed       = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
    $iter          = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator(VDOI_IMG_DIR, FilesystemIterator::SKIP_DOTS)
    );

    $media_count = 0;
    $theme_count = 0;

    foreach ($iter as $file) {
        if (!$file->isFile()) continue;
        $ext = strtolower(pathinfo($file->getFilename(), PATHINFO_EXTENSION));
        if (!in_array($ext, $allowed, true)) continue;

        $abs_src  = $file->getPathname();
        $name     = $file->getFilename();
        $norm_src = wp_normalize_path($abs_src);
        $norm_dir = wp_normalize_path(VDOI_IMG_DIR);

        // Caminho relativo: ex "produtos/seguro-auto.jpg"
        $rel = ltrim(str_replace($norm_dir, '', $norm_src), '/');

        // --- Destino 1: tema (para fallback PHP) ---
        $theme_dest     = $theme_img_dir . $rel;
        $theme_dest_dir = dirname($theme_dest);

        if (!file_exists($theme_dest)) {
            if (!is_dir($theme_dest_dir)) wp_mkdir_p($theme_dest_dir);
            if (@copy($abs_src, $theme_dest)) {
                $theme_count++;
            } else {
                vdoi_log($log, 'error', "Erro ao copiar para tema: $rel");
            }
        }

        // --- Destino 2: Biblioteca de Mídia (para Elementor) ---
        $q = new WP_Query([
            'post_type'      => 'attachment',
            'meta_key'       => '_vdoi_src',
            'meta_value'     => $rel,
            'posts_per_page' => 1,
            'fields'         => 'ids',
        ]);
        if ($q->have_posts()) {
            vdoi_log($log, 'skip', "Mídia já existe: $name");
            continue;
        }

        $content = @file_get_contents($abs_src);
        if ($content === false) {
            vdoi_log($log, 'error', "Não foi possível ler: $name");
            continue;
        }

        $up = wp_upload_bits($name, null, $content);
        if (!empty($up['error'])) {
            vdoi_log($log, 'error', "Erro upload $name: {$up['error']}");
            continue;
        }

        $ft  = wp_check_filetype($name);
        $aid = wp_insert_attachment([
            'guid'           => $up['url'],
            'post_mime_type' => $ft['type'],
            'post_title'     => sanitize_file_name(pathinfo($name, PATHINFO_FILENAME)),
            'post_status'    => 'inherit',
        ], $up['file']);

        if (is_wp_error($aid)) {
            vdoi_log($log, 'error', "Erro ao registrar na mídia: $name");
            continue;
        }

        if ($ext !== 'svg') {
            wp_update_attachment_metadata($aid, wp_generate_attachment_metadata($aid, $up['file']));
        }

        // Guarda caminho relativo — portável entre dev e produção
        update_post_meta($aid, '_vdoi_src', $rel);
        vdoi_log($log, 'ok', "Importado: $rel");
        $media_count++;
    }

    update_option('vdoi_images_imported', (int) get_option('vdoi_images_imported', 0) + $media_count);
    vdoi_log($log, 'ok', "Biblioteca de Mídia: $media_count novas  |  Tema (fallback PHP): $theme_count copiadas");
}

/* -------------------------------------------------------
   STEP 2 — CREATE PRODUCT CPT POSTS
------------------------------------------------------- */
function vdoi_do_products(array &$log): void {
    if (!function_exists('vdo_all_produtos')) {
        vdoi_log($log, 'error', 'O tema Vida de Ouro não está ativo. Ative-o em Aparência → Temas.');
        return;
    }

    $count = 0;
    foreach (vdo_all_produtos() as $slug => $p) {
        $q = new WP_Query([
            'name'           => $slug,
            'post_type'      => 'produto',
            'post_status'    => 'publish',
            'posts_per_page' => 1,
            'fields'         => 'ids',
        ]);
        if ($q->have_posts()) {
            vdoi_log($log, 'skip', "Produto já existe: {$p['nome']}");
            continue;
        }

        $id = wp_insert_post([
            'post_title'   => $p['nome'],
            'post_name'    => $slug,
            'post_type'    => 'produto',
            'post_status'  => 'publish',
            'post_content' => $p['descricao'] ?? '',
            'post_excerpt' => $p['tagline']   ?? '',
        ]);

        is_wp_error($id)
            ? vdoi_log($log, 'error', "Erro ao criar: {$p['nome']}")
            : vdoi_log($log, 'ok',    "Produto criado: {$p['nome']}") && $count++;
    }

    vdoi_log($log, 'ok', "Produtos criados nesta execução: $count");
}

/* -------------------------------------------------------
   STEP 3 — IMPORT STATIC PAGES WITH ELEMENTOR CONTENT
------------------------------------------------------- */
function vdoi_do_pages(array &$log): void {
    $pages = [
        ['title' => 'Início',                  'slug' => 'inicio',                  'template' => 'front-page.php'],
        ['title' => 'Sobre',                   'slug' => 'sobre',                   'template' => 'page-sobre.php'],
        ['title' => 'Contato',                 'slug' => 'contato',                 'template' => 'page-contato.php'],
        ['title' => 'Política de Privacidade', 'slug' => 'politica-de-privacidade', 'template' => 'page-politica-de-privacidade.php'],
        ['title' => 'Blog',                    'slug' => 'blog',                    'template' => null],
    ];

    foreach ($pages as $page) {
        $q = new WP_Query([
            'name'           => $page['slug'],
            'post_type'      => 'page',
            'post_status'    => 'publish',
            'posts_per_page' => 1,
            'fields'         => 'ids',
        ]);
        $existed = $q->have_posts();
        $pid     = $existed ? $q->posts[0] : wp_insert_post([
            'post_title'  => $page['title'],
            'post_name'   => $page['slug'],
            'post_type'   => 'page',
            'post_status' => 'publish',
        ]);

        if (is_wp_error($pid)) {
            vdoi_log($log, 'error', "Erro ao criar página: {$page['title']}");
            continue;
        }

        $existed
            ? vdoi_log($log, 'skip', "Página já existe: {$page['title']} (ID $pid)")
            : vdoi_log($log, 'ok',   "Página criada: {$page['title']} (ID $pid)");

        if (!$page['template']) continue;

        if ($existed && get_post_meta($pid, '_elementor_edit_mode', true) === 'builder') {
            vdoi_log($log, 'skip', "Elementor já configurado (editado): {$page['title']} — pulando.");
            continue;
        }

        $html = vdoi_render_template_body($page['template'], $pid, 'page');
        if ($html) {
            vdoi_set_elementor($pid, $html);
            vdoi_log($log, 'ok', "Elementor importado: {$page['title']}");
        } else {
            vdoi_log($log, 'error', "HTML vazio: {$page['template']}");
        }
    }
}

/* -------------------------------------------------------
   STEP 4 — IMPORT PRODUCT PAGES WITH ELEMENTOR CONTENT
------------------------------------------------------- */
function vdoi_do_product_pages(array &$log): void {
    if (!function_exists('vdo_all_produtos')) {
        vdoi_log($log, 'error', 'O tema Vida de Ouro não está ativo.');
        return;
    }

    $count = 0;
    foreach (vdo_all_produtos() as $slug => $p) {
        $q = new WP_Query([
            'name'           => $slug,
            'post_type'      => 'produto',
            'post_status'    => 'publish',
            'posts_per_page' => 1,
            'fields'         => 'ids',
        ]);

        if (!$q->have_posts()) {
            vdoi_log($log, 'skip', "Produto não encontrado: {$p['nome']} — execute Passo 2 primeiro.");
            continue;
        }

        $pid = $q->posts[0];

        if (get_post_meta($pid, '_elementor_edit_mode', true) === 'builder') {
            vdoi_log($log, 'skip', "Elementor já configurado (editado): {$p['nome']} — pulando.");
            continue;
        }

        $html = vdoi_render_template_body('single-produto.php', $pid, 'produto');
        if ($html) {
            vdoi_set_elementor($pid, $html);
            vdoi_log($log, 'ok', "Elementor importado: {$p['nome']}");
            $count++;
        } else {
            vdoi_log($log, 'error', "HTML vazio: {$p['nome']}");
        }
    }

    vdoi_log($log, 'ok', "Produtos com Elementor configurado: $count / 21");
}

/* -------------------------------------------------------
   STEP 5 — REPLACE THEME IMAGE URLs WITH MEDIA LIBRARY URLs
   _vdoi_src armazena caminho relativo (ex: "produtos/seguro-auto.jpg").
   URL do tema = theme_uri + "/assets/img/" + rel
   URL da mídia = wp_get_attachment_url()
------------------------------------------------------- */
function vdoi_do_replace_image_urls(array &$log): void {
    $theme_uri = get_template_directory_uri();

    $attachments = get_posts([
        'post_type'      => 'attachment',
        'meta_key'       => '_vdoi_src',
        'posts_per_page' => -1,
        'fields'         => 'ids',
    ]);

    if (!$attachments) {
        vdoi_log($log, 'error', 'Nenhuma imagem importada. Execute o Passo 1 primeiro.');
        return;
    }

    $map = [];
    foreach ($attachments as $aid) {
        $rel       = get_post_meta($aid, '_vdoi_src', true); // ex: "produtos/seguro-auto.jpg"
        $theme_url = $theme_uri . '/assets/img/' . $rel;
        $media_url = wp_get_attachment_url($aid);

        if ($rel && $media_url && $theme_url !== $media_url) {
            $map[$theme_url] = $media_url;
        }
    }

    if (!$map) {
        vdoi_log($log, 'skip', 'Nenhum mapeamento de URL disponível.');
        return;
    }

    $posts = get_posts([
        'post_type'      => ['page', 'post', 'produto'],
        'meta_key'       => '_elementor_edit_mode',
        'meta_value'     => 'builder',
        'posts_per_page' => -1,
        'fields'         => 'ids',
    ]);

    $updated = 0;
    foreach ($posts as $pid) {
        $json = get_post_meta($pid, '_elementor_data', true);
        if (!$json) continue;

        // Trata "/" e "\/" (ambas as formas de escape em JSON)
        $from = array_merge(
            array_keys($map),
            array_map(fn($u) => str_replace('/', '\/', $u), array_keys($map))
        );
        $to = array_merge(
            array_values($map),
            array_map(fn($u) => str_replace('/', '\/', $u), array_values($map))
        );

        $new_json = str_replace($from, $to, $json);
        if ($new_json !== $json) {
            update_post_meta($pid, '_elementor_data', $new_json);
            delete_post_meta($pid, '_elementor_css');
            $updated++;
            vdoi_log($log, 'ok', "URLs atualizadas: post ID $pid");
        }
    }

    if (class_exists('\Elementor\Plugin') && isset(\Elementor\Plugin::$instance->files_manager)) {
        \Elementor\Plugin::$instance->files_manager->clear_cache();
    }

    vdoi_log($log, 'ok', "URLs atualizadas em $updated post(s). Mapeamento: " . count($map) . ' imagens.');
}

/* -------------------------------------------------------
   STEP 6 — CONFIGURE WP SETTINGS
------------------------------------------------------- */
function vdoi_do_settings(array &$log): void {
    $front = get_page_by_path('inicio');
    $blog  = get_page_by_path('blog');

    if ($front) {
        update_option('show_on_front', 'page');
        update_option('page_on_front', $front->ID);
        vdoi_log($log, 'ok', "Página inicial: Início (ID {$front->ID})");
    } else {
        vdoi_log($log, 'error', 'Página "inicio" não encontrada. Execute o Passo 3 primeiro.');
    }

    if ($blog) {
        update_option('page_for_posts', $blog->ID);
        vdoi_log($log, 'ok', "Página de posts: Blog (ID {$blog->ID})");
    }

    flush_rewrite_rules();
    vdoi_log($log, 'ok', 'Permalinks atualizados.');
}

/* -------------------------------------------------------
   TEMPLATE RENDERER
   Renderiza um template do tema com header/footer
   suprimidos via $GLOBALS['vdo_render_mode'].
   $post_type controla o tipo de WP_Query:
     'page'   → ['page_id' => $id]
     outros   → ['p' => $id, 'post_type' => $post_type]
   Isso garante que get_queried_object_id() retorne o ID
   correto para páginas e CPTs como 'produto'.
------------------------------------------------------- */
function vdoi_render_template_body(string $template_file, int $post_id, string $post_type = 'page'): string {
    $theme_file = get_template_directory() . '/' . $template_file;
    if (!file_exists($theme_file)) return '';

    global $post, $wp_query;
    $orig_post  = $post;
    $orig_query = $wp_query;

    $post = get_post($post_id);
    if (!$post) return '';

    $wp_query = $post_type === 'page'
        ? new WP_Query(['page_id' => $post_id])
        : new WP_Query(['p' => $post_id, 'post_type' => $post_type]);

    setup_postdata($post);

    $GLOBALS['vdo_render_mode'] = true;
    ob_start();
    load_template($theme_file, false);
    $html = ob_get_clean();
    $GLOBALS['vdo_render_mode'] = false;

    $post     = $orig_post;
    $wp_query = $orig_query;
    wp_reset_postdata();

    return trim($html);
}

/* -------------------------------------------------------
   ELEMENTOR JSON BUILDER
   Divide o HTML nos separadores de seção do tema
   (<!-- ========== NOME ========== -->) para que cada
   seção vire um HTML widget Elementor independente.
------------------------------------------------------- */
function vdoi_set_elementor(int $post_id, string $full_html): void {
    $parts = preg_split(
        '/<!--\s*={5,}[^=]*={5,}\s*-->/u',
        $full_html,
        -1,
        PREG_SPLIT_NO_EMPTY
    );
    $parts = array_values(array_filter(array_map('trim', $parts)));
    if (!$parts) $parts = [trim($full_html)];

    $elements = [];
    foreach ($parts as $i => $html) {
        if (!$html) continue;
        $sid = 'vdo' . substr(md5($post_id . 's' . $i), 0, 7);
        $cid = 'vdo' . substr(md5($sid . 'c'), 0, 7);
        $wid = 'vdo' . substr(md5($sid . 'w'), 0, 7);

        $elements[] = [
            'id'       => $sid,
            'elType'   => 'section',
            'settings' => [
                'stretch_section' => 'section-stretched',
                'layout'          => 'full_width',
                'gap'             => 'no',
                'padding'         => ['unit' => 'px', 'top' => '0', 'right' => '0', 'bottom' => '0', 'left' => '0', 'isLinked' => true],
            ],
            'elements' => [[
                'id'       => $cid,
                'elType'   => 'column',
                'settings' => [
                    '_column_size' => 100,
                    'padding'      => ['unit' => 'px', 'top' => '0', 'right' => '0', 'bottom' => '0', 'left' => '0', 'isLinked' => true],
                ],
                'elements' => [[
                    'id'         => $wid,
                    'elType'     => 'widget',
                    'widgetType' => 'html',
                    'settings'   => ['html' => $html],
                    'elements'   => [],
                ]],
            ]],
        ];
    }

    $json       = wp_json_encode($elements);
    $el_version = defined('ELEMENTOR_VERSION') ? ELEMENTOR_VERSION : '3.21.0';

    update_post_meta($post_id, '_elementor_data',          $json);
    update_post_meta($post_id, '_elementor_edit_mode',     'builder');
    update_post_meta($post_id, '_elementor_template_type', 'wp-page');
    update_post_meta($post_id, '_elementor_version',       $el_version);
    delete_post_meta($post_id, '_elementor_css');

    if (class_exists('\Elementor\Plugin') && isset(\Elementor\Plugin::$instance->files_manager)) {
        \Elementor\Plugin::$instance->files_manager->clear_cache();
    }
}
