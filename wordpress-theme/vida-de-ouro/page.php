<?php get_header(); ?>

<?php if (vdo_has_elementor()): ?>
<main class="vdo-elementor-page">
  <?php while (have_posts()) : the_post(); the_content(); endwhile; ?>
</main>
<?php get_footer(); return; endif; ?>

<style>
  .page-hero { padding: 140px 0 72px; background: linear-gradient(135deg, var(--blue-900), var(--blue-800)); text-align: center; }
  .page-hero h1 { font-size: clamp(2rem,4vw,2.8rem); font-weight: 900; color: var(--white); }
  .page-content { padding: 72px 0 88px; }
  .page-article { max-width: 860px; margin: 0 auto; background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius-lg); padding: clamp(28px,5vw,56px); box-shadow: var(--shadow); }
  .page-article .entry-content { color: var(--gray-700); font-size: 16px; line-height: 1.8; }
  .page-article .entry-content h2, .page-article .entry-content h3 { color: var(--gray-900); margin: 28px 0 12px; }
  .page-article .entry-content p { margin-bottom: 16px; }
  .page-article .entry-content a { color: var(--blue-600); }
  .page-article .entry-content ul, .page-article .entry-content ol { margin: 12px 0 16px 24px; }
</style>

<div class="page-hero">
  <div class="container">
    <?php if (have_posts()) : while (have_posts()) : the_post(); ?>
      <h1><?php the_title(); ?></h1>
    <?php endwhile; endif; ?>
  </div>
</div>

<section class="page-content">
  <div class="container">
    <article class="page-article">
      <?php
      rewind_posts();
      if (have_posts()) : while (have_posts()) : the_post();
      ?>
      <div class="entry-content">
        <?php the_content(); ?>
      </div>
      <?php endwhile; endif; ?>
    </article>
  </div>
</section>

<?php get_footer(); ?>
