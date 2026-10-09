<?php get_header(); ?>

<style>
  .blog-hero { padding: 140px 0 80px; background: linear-gradient(135deg, var(--blue-900), var(--blue-800)); text-align: center; }
  .blog-hero h1 { font-size: clamp(2rem,4vw,2.8rem); font-weight: 900; color: var(--white); margin: 16px 0; }
  .blog-hero h1 strong { color: var(--gold); }
  .blog-hero p { color: rgba(255,255,255,.7); max-width: 600px; margin: 0 auto; }
  .blog-section { padding: 72px 0 88px; background: var(--gray-50); }
  .blog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 28px; margin-top: 48px; }
  .blog-card { background: var(--white); border: 1.5px solid var(--gray-200); border-radius: var(--radius-lg); overflow: hidden; transition: all var(--transition); text-decoration: none; display: flex; flex-direction: column; }
  .blog-card:hover { border-color: var(--blue-400); box-shadow: var(--shadow-lg); transform: translateY(-4px); }
  .blog-card__thumb { aspect-ratio: 16/9; overflow: hidden; background: var(--gray-200); }
  .blog-card__thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s ease; }
  .blog-card:hover .blog-card__thumb img { transform: scale(1.04); }
  .blog-card__body { padding: 24px; display: flex; flex-direction: column; flex: 1; }
  .blog-card__cat { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--blue-600); margin-bottom: 8px; }
  .blog-card__title { font-size: 1.05rem; font-weight: 700; color: var(--gray-900); line-height: 1.45; margin-bottom: 10px; }
  .blog-card:hover .blog-card__title { color: var(--blue-600); }
  .blog-card__excerpt { font-size: 14px; color: var(--gray-500); line-height: 1.65; flex: 1; margin-bottom: 18px; }
  .blog-card__meta { font-size: 12px; color: var(--gray-400); display: flex; gap: 12px; }
  .blog-pagination { display: flex; justify-content: center; gap: 10px; margin-top: 48px; flex-wrap: wrap; }
  .blog-pagination a, .blog-pagination span { display: inline-flex; align-items: center; justify-content: center; min-width: 40px; height: 40px; padding: 0 14px; border: 1.5px solid var(--gray-300); border-radius: 8px; font-size: 14px; font-weight: 600; color: var(--gray-600); text-decoration: none; transition: all var(--transition); }
  .blog-pagination a:hover, .blog-pagination .current { border-color: var(--blue-500); background: var(--blue-50); color: var(--blue-700); }
  .blog-empty { text-align: center; padding: 64px 24px; }
  .blog-empty h3 { font-size: 1.3rem; color: var(--gray-700); margin-bottom: 12px; }
  .blog-empty p { color: var(--gray-500); margin-bottom: 24px; }
</style>

<div class="blog-hero">
  <div class="container">
    <span class="section-tag">Blog</span>
    <h1>Dicas e conteúdos sobre <strong>seguros</strong></h1>
    <p>Informações, novidades e orientações para você se proteger melhor no Vale do Paraíba e Litoral Norte.</p>
  </div>
</div>

<section class="blog-section">
  <div class="container">

    <?php if (have_posts()) : ?>

      <div class="blog-grid">
        <?php while (have_posts()) : the_post(); ?>
          <a href="<?php the_permalink(); ?>" class="blog-card">
            <?php if (has_post_thumbnail()) : ?>
              <div class="blog-card__thumb">
                <?php the_post_thumbnail('medium_large', ['loading' => 'lazy']); ?>
              </div>
            <?php endif; ?>
            <div class="blog-card__body">
              <?php
              $cats = get_the_category();
              if ($cats) : ?>
                <span class="blog-card__cat"><?php echo esc_html($cats[0]->name); ?></span>
              <?php endif; ?>
              <h2 class="blog-card__title"><?php the_title(); ?></h2>
              <p class="blog-card__excerpt"><?php echo wp_trim_words(get_the_excerpt(), 22, '…'); ?></p>
              <div class="blog-card__meta">
                <span><?php echo get_the_date('d/m/Y'); ?></span>
                <span><?php echo get_the_author(); ?></span>
              </div>
            </div>
          </a>
        <?php endwhile; ?>
      </div>

      <div class="blog-pagination">
        <?php
        echo paginate_links([
          'prev_text' => '&#8592; Anterior',
          'next_text' => 'Próximo &#8594;',
          'before_page_number' => '',
        ]);
        ?>
      </div>

    <?php else : ?>

      <div class="blog-empty">
        <h3>Nenhum artigo publicado ainda</h3>
        <p>Em breve teremos conteúdos sobre seguros, saúde e proteção financeira para o Vale do Paraíba.</p>
        <a href="<?php echo esc_url(home_url('/')); ?>" class="btn btn--primary">Voltar ao início</a>
      </div>

    <?php endif; ?>

  </div>
</section>

<?php get_footer(); ?>
