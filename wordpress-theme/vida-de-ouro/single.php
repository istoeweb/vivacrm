<?php get_header(); ?>

<style>
  .single-hero { padding: 140px 0 64px; background: linear-gradient(135deg, var(--blue-900), var(--blue-800)); }
  .single-hero__cat { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--gold); margin-bottom: 12px; display: block; }
  .single-hero__title { font-size: clamp(1.6rem,4vw,2.4rem); font-weight: 900; color: var(--white); line-height: 1.25; max-width: 820px; margin-bottom: 16px; }
  .single-hero__meta { display: flex; gap: 20px; flex-wrap: wrap; color: rgba(255,255,255,.6); font-size: 13px; }
  .single-section { padding: 64px 0 88px; background: var(--gray-50); }
  .single-layout { display: grid; grid-template-columns: 1fr 320px; gap: 40px; align-items: start; }
  .single-content { background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius-lg); padding: clamp(28px,5vw,56px); }
  .single-content .entry-content { color: var(--gray-700); font-size: 16px; line-height: 1.8; }
  .single-content .entry-content h2,
  .single-content .entry-content h3 { color: var(--gray-900); margin: 32px 0 14px; }
  .single-content .entry-content h2 { font-size: 1.5rem; }
  .single-content .entry-content h3 { font-size: 1.2rem; }
  .single-content .entry-content p { margin-bottom: 18px; }
  .single-content .entry-content ul, .single-content .entry-content ol { margin: 12px 0 18px 24px; }
  .single-content .entry-content li { margin-bottom: 8px; }
  .single-content .entry-content a { color: var(--blue-600); text-decoration: underline; }
  .single-content .entry-content img { max-width: 100%; border-radius: var(--radius); margin: 24px 0; }
  .single-content .entry-content blockquote { border-left: 4px solid var(--blue-500); padding: 16px 20px; background: var(--blue-50); margin: 24px 0; border-radius: 0 var(--radius) var(--radius) 0; color: var(--blue-800); font-style: italic; }
  .single-sidebar { position: sticky; top: 96px; display: flex; flex-direction: column; gap: 24px; }
  .sidebar-widget { background: var(--white); border: 1.5px solid var(--gray-200); border-radius: var(--radius-lg); padding: 28px; }
  .sidebar-widget h3 { font-size: 1rem; font-weight: 700; color: var(--gray-900); margin-bottom: 16px; }
  .sidebar-cta { background: linear-gradient(135deg, var(--blue-900), var(--blue-700)); }
  .sidebar-cta h3, .sidebar-cta p { color: var(--white); }
  .sidebar-cta p { font-size: 14px; color: rgba(255,255,255,.75); margin-bottom: 16px; }
  .back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: var(--blue-600); text-decoration: none; margin-bottom: 24px; }
  .back-link:hover { text-decoration: underline; }
  @media (max-width: 900px) { .single-layout { grid-template-columns: 1fr; } .single-sidebar { position: static; } }
  @media (max-width: 768px) { .single-hero { padding: 120px 0 48px; } }
</style>

<?php if (have_posts()) : while (have_posts()) : the_post(); ?>

<div class="single-hero">
  <div class="container">
    <?php
    $cats = get_the_category();
    if ($cats) : ?>
      <span class="single-hero__cat"><?php echo esc_html($cats[0]->name); ?></span>
    <?php endif; ?>
    <h1 class="single-hero__title"><?php the_title(); ?></h1>
    <div class="single-hero__meta">
      <span><?php echo get_the_date('d \d\e F \d\e Y'); ?></span>
      <span>Por <?php the_author(); ?></span>
    </div>
  </div>
</div>

<section class="single-section">
  <div class="container single-layout">

    <article class="single-content">
      <a href="<?php echo esc_url(home_url('/blog/')); ?>" class="back-link">&#8592; Voltar ao Blog</a>
      <?php if (has_post_thumbnail()) : ?>
        <div style="margin-bottom:32px;border-radius:var(--radius);overflow:hidden;">
          <?php the_post_thumbnail('large', ['style' => 'width:100%;height:auto;display:block;']); ?>
        </div>
      <?php endif; ?>
      <div class="entry-content">
        <?php the_content(); ?>
      </div>
    </article>

    <aside class="single-sidebar">

      <div class="sidebar-widget sidebar-cta">
        <h3>Pronto para se proteger?</h3>
        <p>Cotação gratuita com as melhores seguradoras do mercado.</p>
        <a href="https://wa.me/5512976002718" target="_blank" rel="noopener noreferrer" class="btn btn--whatsapp btn--full">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Cotar no WhatsApp
        </a>
      </div>

      <div class="sidebar-widget">
        <h3>Principais Produtos</h3>
        <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:8px;">
          <?php
          $produtos_menu = [
            'seguro-auto'       => 'Seguro Auto',
            'seguro-moto'       => 'Seguro Moto',
            'seguro-vida'       => 'Seguro de Vida',
            'seguro-residencial'=> 'Seguro Residencial',
            'planos-saude'      => 'Planos de Saúde',
            'consorcios'        => 'Consórcios',
            'certificado-digital'=> 'Certificado Digital',
          ];
          foreach ($produtos_menu as $slug => $nome) : ?>
            <li><a href="<?php echo vdo_p($slug); ?>" style="font-size:14px;color:var(--blue-600);text-decoration:none;display:flex;align-items:center;gap:6px;">&#8594; <?php echo esc_html($nome); ?></a></li>
          <?php endforeach; ?>
        </ul>
      </div>

    </aside>

  </div>
</section>

<?php endwhile; endif; ?>

<?php get_footer(); ?>
