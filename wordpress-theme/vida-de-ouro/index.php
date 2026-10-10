<?php get_header(); ?>

<style>
  .index-section { padding: 72px 0 88px; background: var(--gray-50); }
  .index-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 28px; margin-top: 48px; }
  .index-card { background: var(--white); border: 1.5px solid var(--gray-200); border-radius: var(--radius-lg); overflow: hidden; transition: all var(--transition); text-decoration: none; display: flex; flex-direction: column; }
  .index-card:hover { border-color: var(--blue-400); box-shadow: var(--shadow-lg); transform: translateY(-4px); }
  .index-card__body { padding: 28px; flex: 1; display: flex; flex-direction: column; }
  .index-card__title { font-size: 1.1rem; font-weight: 700; color: var(--gray-900); margin-bottom: 10px; }
  .index-card:hover .index-card__title { color: var(--blue-600); }
  .index-card__excerpt { font-size: 14px; color: var(--gray-500); line-height: 1.65; flex: 1; }
</style>

<div style="padding:140px 0 72px;background:linear-gradient(135deg,var(--blue-900),var(--blue-800));text-align:center;">
  <div class="container">
    <h1 style="font-size:clamp(2rem,4vw,2.8rem);font-weight:900;color:var(--white);">
      <?php bloginfo('name'); ?>
    </h1>
  </div>
</div>

<section class="index-section">
  <div class="container">
    <?php if (have_posts()) : ?>
      <div class="index-grid">
        <?php while (have_posts()) : the_post(); ?>
          <a href="<?php the_permalink(); ?>" class="index-card">
            <div class="index-card__body">
              <h2 class="index-card__title"><?php the_title(); ?></h2>
              <p class="index-card__excerpt"><?php echo wp_trim_words(get_the_excerpt(), 20, '…'); ?></p>
            </div>
          </a>
        <?php endwhile; ?>
      </div>
      <div style="display:flex;justify-content:center;gap:10px;margin-top:48px;">
        <?php echo paginate_links(['prev_text' => '&#8592;', 'next_text' => '&#8594;']); ?>
      </div>
    <?php else : ?>
      <div style="text-align:center;padding:64px 0;">
        <p style="color:var(--gray-500);font-size:16px;">Nenhum conteúdo encontrado.</p>
        <a href="<?php echo esc_url(home_url('/')); ?>" class="btn btn--primary" style="margin-top:20px;">Ir para o início</a>
      </div>
    <?php endif; ?>
  </div>
</section>

<?php get_footer(); ?>
