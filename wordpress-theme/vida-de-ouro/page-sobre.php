<?php get_header(); ?>

<?php if (vdo_has_elementor()): ?>
<main class="vdo-elementor-page">
  <?php while (have_posts()) : the_post(); the_content(); endwhile; ?>
</main>
<?php get_footer(); return; endif; ?>

<style>
  .page-hero { background: linear-gradient(135deg, var(--blue-900) 0%, var(--blue-800) 100%); padding: 140px 0 80px; text-align: center; }
  .page-hero h1 { font-size: clamp(2rem,4vw,2.8rem); font-weight: 900; color: var(--white); margin: 16px 0; }
  .page-hero h1 strong { color: var(--gold); }
  .page-hero p { color: rgba(255,255,255,.7); max-width: 600px; margin: 0 auto; font-size: 1.05rem; }
  .sobre-section { padding: 88px 0; background: var(--white); }
  .sobre-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: start; }
  .sobre-text p { color: var(--gray-500); font-size: 15px; line-height: 1.8; margin-bottom: 16px; }
  .sobre-text .section-title { text-align: left; }
  .values-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .value-card { background: var(--gray-50); border-radius: var(--radius); padding: 24px; border-left: 4px solid var(--blue-600); }
  .value-card h4 { font-size: 15px; font-weight: 700; color: var(--gray-900); margin-bottom: 8px; }
  .value-card p { font-size: 13.5px; color: var(--gray-500); line-height: 1.6; }
  .mission-section { background: linear-gradient(135deg, var(--blue-900) 0%, var(--blue-800) 100%); padding: 88px 0; text-align: center; }
  .mission-section .section-title { color: var(--white); }
  .mission-section .section-title strong { color: var(--gold); }
  .mission-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; margin-top: 48px; }
  .mission-card { background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12); border-radius: var(--radius-lg); padding: 32px 24px; transition: all var(--transition); }
  .mission-card:hover { background: rgba(255,255,255,.13); transform: translateY(-4px); }
  .mission-card .icon { font-size: 2.5rem; margin-bottom: 16px; }
  .mission-card h3 { color: var(--white); font-size: 1.1rem; font-weight: 700; margin-bottom: 10px; }
  .mission-card p { color: rgba(255,255,255,.65); font-size: 14px; line-height: 1.7; }
  .numeros-section { padding: 88px 0; background: var(--gray-50); }
  .numeros-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 24px; margin-top: 48px; }
  @media (max-width: 768px) {
    .sobre-grid, .values-grid, .mission-grid { grid-template-columns: 1fr; }
    .numeros-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 480px) { .numeros-grid { grid-template-columns: 1fr; } }
</style>

<div class="page-hero">
  <div class="container">
    <span class="section-tag">Quem Somos</span>
    <h1>Sobre a <strong>Vida de Ouro Jacareí</strong></h1>
    <p>Corretora de seguros referência no Vale do Paraíba e Litoral Norte. Atendimento consultivo, pós-venda ativo e avaliações 5 estrelas no Google.</p>
  </div>
</div>

<section class="sobre-section">
  <div class="container sobre-grid">
    <div class="sobre-text">
      <h2 class="section-title">Nossa <strong>história</strong></h2>
      <p>A Vida de Ouro Jacareí é uma corretora de seguros especializada em proteção patrimonial, de vida, saúde e benefícios para pessoas físicas e jurídicas no Vale do Paraíba e Litoral Norte.</p>
      <p>Trabalhamos de forma independente — somos seus representantes, não da seguradora. Nossa missão é encontrar a cobertura certa pelo melhor preço, com total transparência e sem burocracia.</p>
      <p>Atuamos em Jacareí, São José dos Campos, Taubaté, Caçapava, Pindamonhangaba, Guaratinguetá, Caraguatatuba, São Sebastião, Ilhabela, Ubatuba e todo o Brasil via atendimento online.</p>
      <a href="https://wa.me/5512976002718" target="_blank" rel="noopener noreferrer" class="btn btn--whatsapp btn--lg" style="margin-top:16px;display:inline-flex;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Falar com nossa equipe
      </a>
    </div>

    <div class="values-grid">
      <div class="value-card">
        <h4>Missão</h4>
        <p>Oferecer as melhores soluções em seguros e proteção financeira com atendimento humanizado e transparente.</p>
      </div>
      <div class="value-card" style="border-color:var(--gold)">
        <h4>Visão</h4>
        <p>Ser a corretora de referência no Vale do Paraíba, reconhecida pela excelência no atendimento e resultados.</p>
      </div>
      <div class="value-card" style="border-color:#16A34A">
        <h4>Valores</h4>
        <p>Honestidade, transparência, comprometimento com o cliente e pós-venda ativo durante toda a apólice.</p>
      </div>
      <div class="value-card" style="border-color:#7C3AED">
        <h4>Diferencial</h4>
        <p>Atendimento consultivo com mais de 20 seguradoras parceiras e suporte completo em sinistros.</p>
      </div>
    </div>
  </div>
</section>

<section class="mission-section">
  <div class="container">
    <span class="section-tag" style="background:rgba(255,255,255,.15);color:var(--white);">Nossa Referência</span>
    <h2 class="section-title">Por que somos <strong>referência regional</strong></h2>
    <div class="mission-grid">
      <div class="mission-card">
        <div class="icon">&#11088;</div>
        <h3>5 Estrelas no Google</h3>
        <p>Avaliações reais de clientes satisfeitos de todo o Vale do Paraíba e Litoral Norte. Confiança comprovada por quem já foi atendido.</p>
      </div>
      <div class="mission-card">
        <div class="icon">&#127919;</div>
        <h3>Atendimento Consultivo</h3>
        <p>Analisamos seu perfil e necessidades para indicar o seguro mais adequado, sem empurrar produtos desnecessários ou que não fazem sentido para você.</p>
      </div>
      <div class="mission-card">
        <div class="icon">&#128222;</div>
        <h3>Pós-venda Ativo</h3>
        <p>Não sumimos após a venda. Estamos presentes durante toda a vigência da apólice, especialmente nos momentos de sinistro quando você mais precisa.</p>
      </div>
    </div>
  </div>
</section>

<section class="numeros-section">
  <div class="container">
    <div class="section-header">
      <span class="section-tag">Nossos números</span>
      <h2 class="section-title">A confiança dos <strong>clientes em dados</strong></h2>
    </div>
    <div class="numeros-grid">
      <div class="stat-card stat-card--blue"><strong class="stat-card__value" data-count="50000">0</strong><span>Clientes Protegidos</span></div>
      <div class="stat-card stat-card--gold"><strong class="stat-card__value" data-count="5">0</strong><span>Estrelas no Google</span></div>
      <div class="stat-card stat-card--dark"><strong class="stat-card__value" data-count="20">0</strong><span>Seguradoras Parceiras</span></div>
      <div class="stat-card stat-card--teal"><strong class="stat-card__value" data-count="10">0</strong><span>Cidades Atendidas</span></div>
    </div>

    <div style="text-align:center;margin-top:48px;padding:48px;background:linear-gradient(135deg,var(--blue-900),var(--blue-800));border-radius:var(--radius-lg);">
      <h3 style="color:var(--white);font-size:1.6rem;font-weight:800;margin-bottom:12px;">Pronto para se <strong style="color:var(--gold)">proteger?</strong></h3>
      <p style="color:rgba(255,255,255,.7);margin-bottom:28px;">Cotação gratuita, sem compromisso e com resposta em até 1 hora.</p>
      <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;">
        <a href="https://wa.me/5512976002718" target="_blank" rel="noopener noreferrer" class="btn btn--whatsapp btn--lg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Solicitar Cotação
        </a>
        <a href="<?php echo esc_url(home_url('/#produtos')); ?>" class="btn btn--ghost btn--lg">Ver produtos</a>
      </div>
    </div>
  </div>
</section>

<?php get_footer(); ?>
