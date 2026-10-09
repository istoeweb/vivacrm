<?php get_header();

if (vdo_has_elementor()): ?>
<main class="vdo-elementor-page">
  <?php while (have_posts()) : the_post(); the_content(); endwhile; ?>
</main>
<?php get_footer(); return; endif;

$slug   = get_post_field('post_name', get_queried_object_id());
$p      = vdo_get_produto($slug);

if (!$p) {
    ?>
    <div style="padding:140px 0 80px;text-align:center;">
      <div class="container">
        <h1>Produto não encontrado</h1>
        <p><a href="<?php echo esc_url(home_url('/')); ?>" class="btn btn--primary">Voltar ao início</a></p>
      </div>
    </div>
    <?php
    get_footer();
    return;
}

$wa_text = urlencode('Olá, quero cotar ' . $p['nome']);
$wa_url  = 'https://wa.me/5512976002718?text=' . $wa_text;
?>

<style>
  .produto-hero { padding: 140px 0 72px; background: linear-gradient(135deg, var(--blue-900), var(--blue-800)); }
  .produto-hero__inner { display: grid; grid-template-columns: 1fr auto; gap: 48px; align-items: center; }
  .produto-hero__tag { display: inline-block; padding: 4px 12px; background: rgba(255,255,255,.12); color: var(--gold); border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 16px; }
  .produto-hero__title { font-size: clamp(1.8rem,4vw,2.8rem); font-weight: 900; color: var(--white); margin-bottom: 14px; line-height: 1.2; }
  .produto-hero__tagline { font-size: 1.05rem; color: rgba(255,255,255,.75); margin-bottom: 28px; max-width: 580px; }
  .produto-hero__publico { font-size: 14px; color: rgba(255,255,255,.6); margin-bottom: 24px; }
  .produto-hero__publico strong { color: rgba(255,255,255,.85); }
  .produto-hero__ctas { display: flex; gap: 14px; flex-wrap: wrap; }
  .produto-hero__shield { opacity: .18; }
  .produto-section { padding: 72px 0; }
  .produto-section--gray { background: var(--gray-50); }
  .produto-section--dark { background: linear-gradient(135deg, var(--blue-900), var(--blue-800)); }
  .coberturas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; margin-top: 40px; }
  .cobertura-card { background: var(--white); border: 1.5px solid var(--gray-200); border-radius: var(--radius); padding: 22px 20px; display: flex; align-items: flex-start; gap: 14px; transition: all var(--transition); }
  .cobertura-card:hover { border-color: var(--blue-400); box-shadow: var(--shadow); }
  .cobertura-card__icon { width: 38px; height: 38px; background: var(--blue-50); color: var(--blue-600); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 18px; }
  .cobertura-card h4 { font-size: 14.5px; font-weight: 700; color: var(--gray-900); }
  .seguradoras-logos { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; margin-top: 40px; }
  .seguradora-badge { background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15); border-radius: 10px; padding: 10px 18px; font-size: 14px; color: rgba(255,255,255,.85); font-weight: 600; }
  .produto-faq { max-width: 800px; margin: 40px auto 0; }
  .produto-cta-section { padding: 72px 0; text-align: center; background: var(--gray-50); }
  .produto-cta-section h2 { font-size: clamp(1.5rem,3.5vw,2rem); font-weight: 900; margin-bottom: 12px; }
  .produto-cta-section p { color: var(--gray-500); margin-bottom: 32px; max-width: 500px; margin-left: auto; margin-right: auto; }
  .back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: rgba(255,255,255,.6); text-decoration: none; margin-bottom: 20px; }
  .back-link:hover { color: var(--white); }
  @media (max-width: 768px) {
    .produto-hero__inner { grid-template-columns: 1fr; }
    .produto-hero__shield { display: none; }
    .produto-hero { padding: 120px 0 56px; }
  }
</style>

<div class="produto-hero">
  <div class="container">
    <a href="<?php echo esc_url(home_url('/#produtos')); ?>" class="back-link">&#8592; Todos os produtos</a>
    <div class="produto-hero__inner">
      <div>
        <span class="produto-hero__tag"><?php echo esc_html($p['tag'] ?? $p['categoria']); ?></span>
        <h1 class="produto-hero__title"><?php echo esc_html($p['nome']); ?></h1>
        <p class="produto-hero__tagline"><?php echo esc_html($p['tagline']); ?></p>
        <?php if (!empty($p['publico'])) : ?>
          <p class="produto-hero__publico"><strong>Para quem é:</strong> <?php echo esc_html($p['publico']); ?></p>
        <?php endif; ?>
        <div class="produto-hero__ctas">
          <a href="<?php echo esc_url($wa_url); ?>" target="_blank" rel="noopener noreferrer" class="btn btn--whatsapp btn--lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Cotar no WhatsApp
          </a>
          <a href="<?php echo esc_url(home_url('/#cotacao')); ?>" class="btn btn--ghost btn--lg">Formulário de cotação</a>
        </div>
      </div>
      <svg class="produto-hero__shield" width="180" height="210" viewBox="0 0 280 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M140 15 L265 65 L265 175 C265 235 210 285 140 310 C70 285 15 235 15 175 L15 65 Z" fill="white"/>
        <path d="M112 162 L128 180 L170 138" stroke="currentColor" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" style="color:var(--blue-600)"/>
      </svg>
    </div>
  </div>
</div>

<?php if (!empty($p['descricao'])) : ?>
<section class="produto-section">
  <div class="container" style="max-width:820px;">
    <div class="section-header">
      <span class="section-tag">Sobre o produto</span>
      <h2 class="section-title">O que é o <strong><?php echo esc_html($p['nome']); ?></strong></h2>
    </div>
    <p style="font-size:16px;color:var(--gray-600);line-height:1.8;margin-top:24px;"><?php echo esc_html($p['descricao']); ?></p>
  </div>
</section>
<?php endif; ?>

<?php if (!empty($p['coberturas'])) : ?>
<section class="produto-section produto-section--gray">
  <div class="container">
    <div class="section-header">
      <span class="section-tag">Coberturas</span>
      <h2 class="section-title">O que está <strong>incluído</strong></h2>
    </div>
    <div class="coberturas-grid">
      <?php foreach ($p['coberturas'] as $cob) : ?>
        <div class="cobertura-card">
          <div class="cobertura-card__icon">&#10003;</div>
          <div>
            <h4><?php echo esc_html($cob); ?></h4>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<?php if (!empty($p['seguradoras'])) : ?>
<section class="produto-section produto-section--dark">
  <div class="container" style="text-align:center;">
    <span class="section-tag" style="background:rgba(255,255,255,.15);color:var(--white);">Parceiros</span>
    <h2 class="section-title" style="color:var(--white);">Seguradoras <strong style="color:var(--gold)">parceiras</strong></h2>
    <p style="color:rgba(255,255,255,.65);margin-bottom:0;">Comparamos as melhores condições para você.</p>
    <div class="seguradoras-logos">
      <?php foreach ($p['seguradoras'] as $seg) : ?>
        <span class="seguradora-badge"><?php echo esc_html($seg); ?></span>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<?php if (!empty($p['faq'])) : ?>
<section class="produto-section">
  <div class="container">
    <div class="section-header">
      <span class="section-tag">Dúvidas</span>
      <h2 class="section-title">Perguntas sobre <strong><?php echo esc_html($p['nome']); ?></strong></h2>
    </div>
    <div class="faq__list produto-faq" id="faqList">
      <?php foreach ($p['faq'] as $faq_item) : ?>
        <div class="faq__item">
          <button class="faq__q" aria-expanded="false">
            <?php echo esc_html($faq_item['q']); ?>
            <span class="faq__ic">+</span>
          </button>
          <div class="faq__a">
            <p><?php echo esc_html($faq_item['a']); ?></p>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<section class="produto-cta-section">
  <div class="container">
    <span class="section-tag">Solicitar cotação</span>
    <h2>Pronto para <strong>contratar?</strong></h2>
    <p>Cotação gratuita, sem compromisso, em até 1 hora. Nossa equipe vai encontrar a melhor opção para você.</p>
    <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
      <a href="<?php echo esc_url($wa_url); ?>" target="_blank" rel="noopener noreferrer" class="btn btn--whatsapp btn--lg">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Cotar via WhatsApp
      </a>
      <a href="<?php echo esc_url(home_url('/#cotacao')); ?>" class="btn btn--primary btn--lg">Formulário de cotação</a>
    </div>
  </div>
</section>

<?php get_footer(); ?>
