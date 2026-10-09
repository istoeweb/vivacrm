<?php get_header(); ?>

<?php if (vdo_has_elementor()): ?>
<main class="vdo-elementor-page">
  <?php while (have_posts()) : the_post(); the_content(); endwhile; ?>
</main>
<?php get_footer(); return; endif; ?>

  <!-- ========== HERO ========== -->
  <section class="hero hero--has-photo">
    <div class="hero__bg-shapes">
      <div class="hero__shape hero__shape--1"></div>
      <div class="hero__shape hero__shape--2"></div>
      <div class="hero__shape hero__shape--3"></div>
    </div>
    <div class="container hero__inner">
      <div class="hero__content">
        <span class="hero__badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          Avaliação 5 estrelas no Google · Vale do Paraíba e Litoral Norte
        </span>
        <h1 class="hero__title">
          Proteção completa para você, sua família e seu negócio no <strong>Vale do Paraíba</strong>
        </h1>
        <p class="hero__subtitle">
          Seguros, planos de saúde, consórcios, previdência e certificado digital com atendimento consultivo, pós-venda ativo e as melhores condições do mercado.
        </p>
        <div class="hero__actions">
          <a href="https://wa.me/5512976002718" target="_blank" class="btn btn--primary btn--lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Solicitar Cotação Gratuita
          </a>
          <a href="#produtos" class="btn btn--ghost btn--lg">Conhecer produtos</a>
        </div>
        <div class="hero__cities">
          <span class="hero__cities-label">Atendemos:</span>
          <span>Jacareí · SJC · Taubaté · Caçapava · Pindamonhangaba · Guaratinguetá · Caraguatatuba · São Sebastião · Ilhabela · Ubatuba</span>
        </div>
      </div>
      <div class="hero__visual">
        <div class="hero__shield-wrap">
          <svg class="hero__shield-svg" viewBox="0 0 280 320" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M140 15 L265 65 L265 175 C265 235 210 285 140 310 C70 285 15 235 15 175 L15 65 Z" fill="url(#heroShield1)" opacity="0.12"/>
            <path d="M140 30 L250 76 L250 177 C250 231 200 278 140 300 C80 278 30 231 30 177 L30 76 Z" fill="url(#heroShield2)" opacity="0.2"/>
            <path d="M140 50 L232 91 L232 178 C232 226 196 268 140 288 C84 268 48 226 48 178 L48 91 Z" fill="url(#heroShield3)"/>
            <circle cx="140" cy="165" r="55" fill="white" opacity="0.08"/>
            <path d="M112 162 L128 180 L170 138" stroke="white" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
            <defs>
              <linearGradient id="heroShield1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1E3A5F"/><stop offset="100%" stop-color="#3B82F6"/></linearGradient>
              <linearGradient id="heroShield2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1D4ED8"/><stop offset="100%" stop-color="#60A5FA"/></linearGradient>
              <linearGradient id="heroShield3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1E3A5F"/><stop offset="100%" stop-color="#2563EB"/></linearGradient>
            </defs>
          </svg>
          <div class="hero__float hero__float--tl">
            <span class="hero__float-icon">&#11088;</span>
            <div><strong>5 estrelas</strong><span>no Google</span></div>
          </div>
          <div class="hero__float hero__float--br">
            <span class="hero__float-icon">&#128274;</span>
            <div><strong>Cotação grátis</strong><span>sem compromisso</span></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ========== PARCEIROS ========== -->
  <section class="partners">
    <div class="container">
      <p class="partners__label">Trabalhamos com as maiores seguradoras e operadoras do Brasil</p>
      <div class="partners__track-wrap">
        <div class="partners__track">
          <?php
          $seguradoras = ['porto-seguro'=>'Porto Seguro','hdi'=>'HDI Seguros','tokio-marine'=>'Tokio Marine','allianz'=>'Allianz','zurich'=>'Zurich','mapfre'=>'MAPFRE','liberty'=>'Liberty Seguros','sompo'=>'Sompo Seguros','sura'=>'Sura Seguros','suhai'=>'Suhai','azul'=>'Azul Seguros','alfa'=>'Alfa Seguros','chubb'=>'Chubb Seguros','darwin'=>'Darwin Seguros','bradesco'=>'Bradesco Saúde','sulamerica'=>'SulAmérica Saúde','amil'=>'Amil','unimed'=>'Unimed SJC','porto-saude'=>'Porto Saúde','omint'=>'Omint Saúde','santa-casa'=>'Santa Casa Saúde','sao-francisco'=>'São Francisco Vida','valid'=>'Valid Certificadora'];
          $list = array_merge($seguradoras, $seguradoras);
          foreach ($list as $file => $name): ?>
          <div class="partners__item"><img src="<?php echo vdo_img('seguradoras/' . $file . '.svg'); ?>" alt="<?php echo esc_attr($name); ?>" /></div>
          <?php endforeach; ?>
        </div>
      </div>
    </div>
  </section>

  <!-- ========== PRODUTOS ========== -->
  <section class="produtos" id="produtos">
    <div class="container">
      <div class="section-header">
        <span class="section-tag">Nossos Produtos</span>
        <h2 class="section-title">Soluções completas em <strong>seguros e proteção</strong></h2>
        <p class="section-subtitle">Atendimento consultivo, análise personalizada e pós-venda ativo durante toda a vigência da apólice.</p>
      </div>

      <div class="tabs" id="produtosTabs">
        <button class="tab tab--active" data-tab="veiculos">Veículos</button>
        <button class="tab" data-tab="pessoal">Pessoal e Família</button>
        <button class="tab" data-tab="empresa">Empresarial</button>
        <button class="tab" data-tab="saude">Saúde e Vida</button>
        <button class="tab" data-tab="outros">Outros</button>
      </div>

      <!-- VEÍCULOS -->
      <div class="tab-content tab-content--active" id="tab-veiculos">
        <div class="cards-grid">
          <div class="card card--highlight">
            <div class="card__tag">Mais Vendido</div>
            <div class="card__icon-wrap card__icon-wrap--blue"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v5"/><circle cx="16" cy="17" r="2"/><circle cx="6" cy="17" r="2"/><path d="M14 17H8m-5-5h18"/></svg></div>
            <h3 class="card__title">Seguro Auto</h3>
            <p class="card__desc">Proteção completa contra roubo, furto, colisão, incêndio, vidros e danos a terceiros. Seguros novos e renovações com análise personalizada do condutor e do veículo.</p>
            <ul class="card__benefits"><li>Roubo e furto total e parcial</li><li>Colisão e perda total</li><li>Carro reserva e guincho 24h</li><li>Vidros, retrovisores e faróis</li></ul>
            <div class="card__seguradoras">Porto · HDI · Tokio Marine · Allianz · Zurich · Mapfre · Liberty · Sompo · Sura · Suhai · Azul · Alfa · Chubb</div>
            <a href="https://wa.me/5512976002718?text=Ol%C3%A1%2C+quero+cotar+Seguro+Auto" target="_blank" class="btn btn--primary">Cotar no WhatsApp</a>
          </div>
          <div class="card">
            <div class="card__icon-wrap card__icon-wrap--orange"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12h2l2-5h10l2 5h2M5 12v5h1m12-5v5h-1m-11 0h9"/><circle cx="8.5" cy="17.5" r="1.5"/><circle cx="15.5" cy="17.5" r="1.5"/></svg></div>
            <h3 class="card__title">Seguro Moto</h3>
            <p class="card__desc">Proteção completa para motociclistas com coberturas contra roubo, furto, colisão, perda total e danos a terceiros. Motos novas, usadas e renovações.</p>
            <ul class="card__benefits"><li>Roubo, furto e colisão</li><li>Perda total</li><li>Danos a terceiros</li><li>Contratação rápida e transparente</li></ul>
            <div class="card__seguradoras">Suhai · Porto · Allianz · Tokio Marine · Zurich · Mapfre · Liberty · Azul Seguros</div>
            <a href="https://wa.me/5512976002718?text=Ol%C3%A1%2C+quero+cotar+Seguro+Moto" target="_blank" class="btn btn--outline">Cotar no WhatsApp</a>
          </div>
          <div class="card">
            <div class="card__icon-wrap card__icon-wrap--dark"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="8" width="22" height="10" rx="2"/><path d="M5 8V6a2 2 0 012-2h10a2 2 0 012 2v2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg></div>
            <h3 class="card__title">Seguro Caminhão</h3>
            <p class="card__desc">Para caminhoneiros autônomos, frotistas e empresas de transporte. Análise técnica personalizada, foco em custo-benefício e pós-venda ativo.</p>
            <ul class="card__benefits"><li>Colisão, roubo e furto</li><li>Incêndio e danos a terceiros</li><li>Análise personalizada</li><li>Suporte em sinistros</li></ul>
            <div class="card__seguradoras">Porto · Allianz · Tokio Marine · Zurich · Mapfre · Sompo · Sura · Liberty · Chubb · Sancor</div>
            <a href="https://wa.me/5512976002718?text=Ol%C3%A1%2C+quero+cotar+Seguro+Caminh%C3%A3o" target="_blank" class="btn btn--outline">Cotar no WhatsApp</a>
          </div>
        </div>
      </div>

      <!-- PESSOAL E FAMÍLIA -->
      <div class="tab-content" id="tab-pessoal">
        <div class="cards-grid">
          <div class="card card--highlight">
            <div class="card__tag">Proteção Familiar</div>
            <div class="card__icon-wrap card__icon-wrap--blue"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg></div>
            <h3 class="card__title">Seguro Residencial</h3>
            <p class="card__desc">Proteja casas e apartamentos contra incêndio, roubo, danos elétricos, vendaval e responsabilidade civil. Análise personalizada do imóvel.</p>
            <ul class="card__benefits"><li>Incêndio, explosão e queda de raio</li><li>Roubo e furto de bens</li><li>Danos elétricos e vendaval</li><li>Responsabilidade civil familiar</li></ul>
            <div class="card__seguradoras">Porto · Allianz · Zurich · Mapfre · Liberty · HDI · Tokio Marine · Alfa · Chubb</div>
            <a href="https://wa.me/5512976002718?text=Ol%C3%A1%2C+quero+cotar+Seguro+Residencial" target="_blank" class="btn btn--primary">Cotar no WhatsApp</a>
          </div>
          <div class="card">
            <div class="card__icon-wrap card__icon-wrap--red"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></div>
            <h3 class="card__title">Seguro de Vida</h3>
            <p class="card__desc">Proteção financeira individual para garantir tranquilidade em momentos inesperados. Planos flexíveis e acessíveis para diferentes perfis.</p>
            <ul class="card__benefits"><li>Morte por qualquer causa</li><li>Invalidez permanente</li><li>Doenças graves</li><li>Assistência funeral</li></ul>
            <div class="card__seguradoras">MetLife · Prudential · Icatu · Mongeral · Previsul · Zurich · Porto · Bradesco · SulAmérica</div>
            <a href="https://wa.me/5512976002718?text=Ol%C3%A1%2C+quero+cotar+Seguro+de+Vida" target="_blank" class="btn btn--outline">Cotar no WhatsApp</a>
          </div>
          <div class="card">
            <div class="card__icon-wrap card__icon-wrap--teal"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg></div>
            <h3 class="card__title">Seguro Viagem</h3>
            <p class="card__desc">Proteção para viagens nacionais e internacionais. Despesas médicas, extravio de bagagem, cancelamentos e imprevistos. Contratação rápida.</p>
            <ul class="card__benefits"><li>Despesas médicas e hospitalares</li><li>Extravio de bagagem</li><li>Cancelamento de viagem</li><li>Repatriação</li></ul>
            <div class="card__seguradoras">Porto · Allianz · Zurich · Mapfre · Affinity · Chubb</div>
            <a href="https://wa.me/5512976002718?text=Ol%C3%A1%2C+quero+cotar+Seguro+Viagem" target="_blank" class="btn btn--outline">Cotar no WhatsApp</a>
          </div>
        </div>
      </div>

      <!-- EMPRESARIAL -->
      <div class="tab-content" id="tab-empresa">
        <div class="cards-grid">
          <div class="card card--highlight">
            <div class="card__tag">Para Empresas</div>
            <div class="card__icon-wrap card__icon-wrap--blue"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg></div>
            <h3 class="card__title">Seguro Empresarial</h3>
            <p class="card__desc">Proteção completa para comércios, indústrias e prestadores de serviços. Patrimônio, estoque, equipamentos, responsabilidade civil e lucros cessantes.</p>
            <ul class="card__benefits"><li>Incêndio, roubo e danos elétricos</li><li>Responsabilidade civil</li><li>Lucros cessantes</li><li>Equipamentos eletrônicos</li></ul>
            <div class="card__seguradoras">Porto · Allianz · Zurich · Mapfre · Liberty · Sompo · Sura · HDI · Tokio Marine · AIG · Chubb</div>
            <a href="https://wa.me/5512976002718?text=Ol%C3%A1%2C+quero+cotar+Seguro+Empresarial" target="_blank" class="btn btn--primary">Cotar no WhatsApp</a>
          </div>
          <div class="card">
            <div class="card__icon-wrap card__icon-wrap--orange"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg></div>
            <h3 class="card__title">Seguro Equipamentos</h3>
            <p class="card__desc">Proteção para máquinas, equipamentos eletrônicos, ferramentas profissionais e bens de alto valor. Coberturas contra roubo, danos elétricos e acidentes.</p>
            <ul class="card__benefits"><li>Roubo e furto</li><li>Danos elétricos e acidentais</li><li>Cobertura em transporte</li><li>Análise personalizada</li></ul>
            <div class="card__seguradoras">Porto · Allianz · Zurich · Mapfre · Liberty · Tokio Marine · Sompo · Chubb · AIG</div>
            <a href="https://wa.me/5512976002718?text=Ol%C3%A1%2C+quero+cotar+Seguro+Equipamentos" target="_blank" class="btn btn--outline">Cotar no WhatsApp</a>
          </div>
          <div class="card">
            <div class="card__icon-wrap card__icon-wrap--dark"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/><rect x="9" y="3" width="6" height="5"/></svg></div>
            <h3 class="card__title">Seguro Condomínio</h3>
            <p class="card__desc">Proteção para áreas comuns, estrutura predial, equipamentos e responsabilidade civil de condomínios residenciais e comerciais.</p>
            <ul class="card__benefits"><li>Áreas comuns e estrutura</li><li>Equipamentos (elevadores, bombas)</li><li>Responsabilidade civil</li><li>Orientação ao síndico</li></ul>
            <div class="card__seguradoras">Porto · Allianz · Zurich · Mapfre · Liberty · HDI · Tokio Marine · Chubb · Sompo</div>
            <a href="https://wa.me/5512976002718?text=Ol%C3%A1%2C+quero+cotar+Seguro+Condom%C3%ADnio" target="_blank" class="btn btn--outline">Cotar no WhatsApp</a>
          </div>
          <div class="card">
            <div class="card__icon-wrap card__icon-wrap--teal"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="3" width="22" height="18" rx="2"/><path d="M1 9h22M8 3v18"/></svg></div>
            <h3 class="card__title">Seguro Transporte</h3>
            <p class="card__desc">Proteção para mercadorias em trânsito. Segurança para embarcadores, transportadores e empresas de logística contra roubo, acidentes, avarias e extravios.</p>
            <ul class="card__benefits"><li>Roubo e furto de carga</li><li>Acidentes e avarias</li><li>Extravios</li><li>Análise técnica personalizada</li></ul>
            <div class="card__seguradoras">Mapfre · Zurich · Sompo · Sura · Chubb · AIG · Berkley · Junto Seguros</div>
            <a href="https://wa.me/5512976002718?text=Ol%C3%A1%2C+quero+cotar+Seguro+Transporte" target="_blank" class="btn btn--outline">Cotar no WhatsApp</a>
          </div>
          <div class="card">
            <div class="card__icon-wrap card__icon-wrap--purple"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg></div>
            <h3 class="card__title">Seguro Garantia</h3>
            <p class="card__desc">Ideal para empresas que participam de licitações e contratos públicos ou privados. Rapidez na emissão e acompanhamento até o encerramento do contrato.</p>
            <ul class="card__benefits"><li>Licitações públicas e privadas</li><li>Contratos de execução</li><li>Atendimento especializado</li><li>Pós-venda próximo</li></ul>
            <div class="card__seguradoras">Junto Seguros · Berkley · Fator Seguros · Zurich · Chubb · AIG</div>
            <a href="https://wa.me/5512976002718?text=Ol%C3%A1%2C+quero+cotar+Seguro+Garantia" target="_blank" class="btn btn--outline">Cotar no WhatsApp</a>
          </div>
          <div class="card">
            <div class="card__icon-wrap card__icon-wrap--red"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></div>
            <h3 class="card__title">Seguro de Vida Empresarial</h3>
            <p class="card__desc">Proteção financeira para colaboradores, empresários e suas famílias. Planos personalizados que garantem segurança e continuidade em momentos inesperados.</p>
            <ul class="card__benefits"><li>Morte e invalidez</li><li>Para colaboradores e diretores</li><li>Planos coletivos com benefícios</li><li>Atendimento humanizado</li></ul>
            <div class="card__seguradoras">MetLife · Prudential · Icatu · Mongeral · Previsul · Zurich · Porto · Bradesco · SulAmérica</div>
            <a href="https://wa.me/5512976002718?text=Ol%C3%A1%2C+quero+cotar+Seguro+Vida+Empresarial" target="_blank" class="btn btn--outline">Cotar no WhatsApp</a>
          </div>
        </div>
      </div>

      <!-- SAÚDE E VIDA -->
      <div class="tab-content" id="tab-saude">
        <div class="card card--empresarial">
          <div class="card__img-wrap">
            <img src="<?php echo vdo_img('produtos/planos-saude.jpg'); ?>" alt="Plano de Saúde Empresarial – Vida de Ouro Jacareí" loading="lazy" />
            <div class="card__img-overlay">
              <span class="card__img-tag">Plano de Saúde</span>
              <h2 class="card__img-title">EMPRESARIAL</h2>
              <p class="card__img-sub">Adquira um plano de saúde e cuide dos seus funcionários</p>
            </div>
          </div>
          <div class="card__empresarial-body">
            <div class="card__empresarial-info">
              <div class="card__tag card__tag--inline">Mais Buscado</div>
              <h3 class="card__title">Planos de Saúde Empresarial</h3>
              <p class="card__desc">Especialistas em planos empresariais para empresas que desejam oferecer assistência médica de qualidade para funcionários, estagiários, diretores, sócios e dependentes. Ampla rede credenciada, cobertura nacional e suporte completo no pós-venda.</p>
              <ul class="card__benefits"><li>Individual, familiar e empresarial</li><li>A partir de 1 vida (algumas operadoras)</li><li>Migração e renovação assistida</li><li>Suporte em uso do plano e sinistros</li><li>Comparativo entre operadoras</li></ul>
              <div class="card__seguradoras">Amil · Porto Saúde · Bradesco Saúde · SulAmérica · Unimed SJC · Omint · Assim Saúde · Santa Casa SJC · São Francisco Vida</div>
            </div>
            <div class="card__empresarial-cta">
              <a href="https://wa.me/5512976002718?text=Ol%C3%A1%2C+quero+cotar+Plano+de+Sa%C3%BAde+Empresarial" target="_blank" class="btn btn--primary btn--lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Solicitar Cotação Gratuita
              </a>
              <a href="https://wa.me/5512976002718?text=Ol%C3%A1%2C+quero+cotar+Plano+de+Sa%C3%BAde+Individual" target="_blank" class="btn btn--outline">Plano Individual / Familiar</a>
            </div>
          </div>
        </div>
        <div class="cards-grid" style="margin-top:24px;">
          <div class="card card--highlight">
            <div class="card__tag">Para Empresas</div>
            <div class="card__icon-wrap card__icon-wrap--blue"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
            <h3 class="card__title">Porto Saúde Empresarial</h3>
            <p class="card__desc">Disponível para empresas de qualquer porte. Linhas Tradicional e Pró Vale, cobertura nacional e hospitais de referência em São Paulo.</p>
            <ul class="card__benefits"><li>A partir de 1 funcionário</li><li>Cobertura nacional</li><li>Rede D'Or e hospitais premium</li><li>Inclusão de dependentes e agregados</li></ul>
            <a href="https://wa.me/5512976002718?text=Ol%C3%A1%2C+quero+cotar+Porto+Sa%C3%BAde+Empresarial" target="_blank" class="btn btn--primary">Cotar no WhatsApp</a>
          </div>
          <div class="card">
            <div class="card__icon-wrap card__icon-wrap--teal"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
            <h3 class="card__title">SulAmérica Saúde</h3>
            <p class="card__desc">Referência nacional pela qualidade da rede credenciada e acesso a hospitais premium. Planos empresariais e familiares com cobertura nacional.</p>
            <ul class="card__benefits"><li>Rede D'Or inclusa</li><li>Empresarial e familiar</li><li>Cobertura nacional</li><li>Migração e upgrade assistido</li></ul>
            <a href="https://wa.me/5512976002718?text=Ol%C3%A1%2C+quero+cotar+SulAm%C3%A9rica+Sa%C3%BAde" target="_blank" class="btn btn--outline">Cotar no WhatsApp</a>
          </div>
          <div class="card">
            <div class="card__icon-wrap card__icon-wrap--orange"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg></div>
            <h3 class="card__title">Previdência Privada</h3>
            <p class="card__desc">Planejamento financeiro e aposentadoria segura com planos PGBL e VGBL. Atendimento consultivo para diferentes perfis de investidores.</p>
            <ul class="card__benefits"><li>PGBL e VGBL</li><li>Planejamento de aposentadoria</li><li>Benefício fiscal no IR</li><li>Acompanhamento contínuo</li></ul>
            <div class="card__seguradoras">Brasilprev · Icatu · Porto · Caixa · BTG Pactual · Bradesco · SulAmérica</div>
            <a href="https://wa.me/5512976002718?text=Ol%C3%A1%2C+quero+simular+Previd%C3%AAncia+Privada" target="_blank" class="btn btn--outline">Simular no WhatsApp</a>
          </div>
        </div>
      </div>

      <!-- OUTROS -->
      <div class="tab-content" id="tab-outros">
        <div class="cards-grid">
          <div class="card card--highlight">
            <div class="card__tag">Sem Juros</div>
            <div class="card__icon-wrap card__icon-wrap--blue"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div>
            <h3 class="card__title">Consórcios</h3>
            <p class="card__desc">Auto, moto, caminhão e imóvel sem juros. Ideal para quem deseja planejar a aquisição de bens com economia e segurança. Acompanhamento da adesão até a contemplação.</p>
            <ul class="card__benefits"><li>Auto, Moto e Caminhão</li><li>Imóvel residencial e comercial</li><li>Sem juros, com economia</li><li>Acompanhamento até contemplação</li></ul>
            <div class="card__seguradoras">Rodobens · Porto · Caixa Seguradora · Brasilprev · BTG Pactual</div>
            <a href="https://wa.me/5512976002718?text=Ol%C3%A1%2C+quero+simular+Cons%C3%B3rcio" target="_blank" class="btn btn--primary">Simular no WhatsApp</a>
          </div>
          <div class="card">
            <div class="card__icon-wrap card__icon-wrap--dark"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></div>
            <h3 class="card__title">Certificado Digital</h3>
            <p class="card__desc">Emissão presencial em Jacareí e 100% online para todo o Brasil. e-CPF, e-CNPJ, MEI, NF-e, CT-e e muito mais. Suporte na instalação e renovação.</p>
            <ul class="card__benefits"><li>e-CPF A1 e A3, e-CNPJ A1 e A3</li><li>MEI, NF-e, CT-e, MDF-e</li><li>E-social, Conectividade Social</li><li>Suporte na instalação e backup</li></ul>
            <div class="card__seguradoras">Atendimento presencial Jacareí e online para todo o Brasil</div>
            <a href="https://wa.me/5512976002718?text=Ol%C3%A1%2C+quero+emitir+Certificado+Digital" target="_blank" class="btn btn--outline">Solicitar no WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ========== COMO FUNCIONA ========== -->
  <section class="como-funciona" id="como-funciona">
    <div class="container">
      <div class="section-header">
        <span class="section-tag">Simples e Rápido</span>
        <h2 class="section-title">Como <strong>contratar seu seguro</strong></h2>
        <p class="section-subtitle">Processo 100% descomplicado. Atendimento humano do início ao fim.</p>
      </div>
      <div class="steps">
        <div class="step">
          <div class="step__num">01</div>
          <div class="step__icon"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div>
          <h3>Solicite sua cotação</h3>
          <p>Envie uma mensagem pelo WhatsApp ou preencha o formulário. Nossa equipe retorna em até 1 hora.</p>
        </div>
        <div class="step__connector"></div>
        <div class="step">
          <div class="step__num">02</div>
          <div class="step__icon"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
          <h3>Receba a proposta</h3>
          <p>Comparamos as melhores seguradoras e apresentamos opções adequadas ao seu perfil e orçamento.</p>
        </div>
        <div class="step__connector"></div>
        <div class="step">
          <div class="step__num">03</div>
          <div class="step__icon"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg></div>
          <h3>Fique protegido</h3>
          <p>Apólice emitida e pós-venda ativo. Estamos com você durante toda a vigência, inclusive em sinistros.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ========== DIFERENCIAIS ========== -->
  <section class="diferenciais">
    <div class="container diferenciais__inner">
      <div class="diferenciais__left">
        <span class="section-tag">Por que nos escolher</span>
        <h2 class="section-title">A <strong>Vida de Ouro Jacareí</strong> é diferente</h2>
        <p>Somos uma corretora independente. Isso significa que trabalhamos para você — não para as seguradoras. Nossa missão é encontrar a melhor proteção pelo melhor preço.</p>
        <div class="diferencial">
          <div class="diferencial__icon diferencial__icon--1"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg></div>
          <div><h4>Atendimento consultivo e humanizado</h4><p>Analisamos seu perfil e indicamos o seguro mais adequado às suas necessidades reais.</p></div>
        </div>
        <div class="diferencial">
          <div class="diferencial__icon diferencial__icon--2"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg></div>
          <div><h4>Comparamos todas as seguradoras</h4><p>Acesso às melhores condições de mais de 20 seguradoras parceiras em um único contato.</p></div>
        </div>
        <div class="diferencial">
          <div class="diferencial__icon diferencial__icon--3"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v2.92z"/></svg></div>
          <div><h4>Suporte total em sinistros</h4><p>Acompanhamos todo o processo do sinistro até a resolução final. Você não fica sozinho.</p></div>
        </div>
        <div class="diferencial">
          <div class="diferencial__icon diferencial__icon--4"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          <div><h4>Referência regional com 5 estrelas</h4><p>Reconhecidos pelas avaliações 5 estrelas no Google. Confiança comprovada pelos clientes do Vale do Paraíba.</p></div>
        </div>
      </div>
      <div class="diferenciais__right">
        <div class="stats-grid">
          <div class="stat-card stat-card--blue"><strong class="stat-card__value" data-count="50000">0</strong><span>Clientes Protegidos</span></div>
          <div class="stat-card stat-card--gold"><strong class="stat-card__value" data-count="5">0</strong><span>Estrelas no Google</span></div>
          <div class="stat-card stat-card--dark"><strong class="stat-card__value" data-count="20">0</strong><span>Seguradoras Parceiras</span></div>
          <div class="stat-card stat-card--teal"><strong class="stat-card__value" data-count="10">0</strong><span>Cidades Atendidas</span></div>
        </div>
        <div class="cidades-badge">
          <h4>Cidades atendidas</h4>
          <div class="cidades-tags">
            <span>Jacareí</span><span>São José dos Campos</span><span>Taubaté</span><span>Caçapava</span>
            <span>Pindamonhangaba</span><span>Guaratinguetá</span><span>Caraguatatuba</span>
            <span>São Sebastião</span><span>Ilhabela</span><span>Ubatuba</span>
            <span>+Todo o Brasil (online)</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ========== DEPOIMENTOS ========== -->
  <section class="depoimentos" id="depoimentos">
    <div class="container">
      <div class="section-header">
        <span class="section-tag">Depoimentos</span>
        <h2 class="section-title">O que nossos <strong>clientes dizem</strong></h2>
        <div class="google-stars">
          <span class="google-stars__stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
          <span>5.0 no Google · Avaliações de clientes reais do Vale do Paraíba</span>
        </div>
      </div>
      <div class="reviews-wrap">
        <div class="reviews-slider" id="reviewsSlider">
          <div class="review"><div class="review__stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p>"Atendimento nota 10! Encontraram o melhor seguro auto para meu perfil com condições muito melhores do que eu renovava antes. Suporte rápido e eficiente."</p><div class="review__author"><div class="review__avatar">MS</div><div><strong>Marcos S.</strong><span>Seguro Auto · Jacareí</span></div></div></div>
          <div class="review"><div class="review__stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p>"Contratei o plano de saúde empresarial para minha empresa. A consultoria foi excelente, compararam várias operadoras e encontraram a melhor opção para minha equipe."</p><div class="review__author"><div class="review__avatar">RP</div><div><strong>Rodrigo P.</strong><span>Plano de Saúde · SJC</span></div></div></div>
          <div class="review"><div class="review__stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p>"Tive um sinistro com minha moto e a Vida de Ouro me acompanhou em todo o processo. Resolução rápida e sem estresse. Recomendo a todos os motociclistas!"</p><div class="review__author"><div class="review__avatar">AF</div><div><strong>Ana F.</strong><span>Seguro Moto · Taubaté</span></div></div></div>
          <div class="review"><div class="review__stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p>"Emiti meu certificado digital de forma muito rápida e prática. Atendimento presencial em Jacareí com muita qualidade. Toda a instalação foi feita com suporte."</p><div class="review__author"><div class="review__avatar">LC</div><div><strong>Luciana C.</strong><span>Certificado Digital · Jacareí</span></div></div></div>
          <div class="review"><div class="review__stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p>"Seguro empresarial contratado com ótimo custo-benefício. A análise de riscos foi muito detalhada e o atendimento pós-venda é realmente presente. Parabéns!"</p><div class="review__author"><div class="review__avatar">JB</div><div><strong>João B.</strong><span>Seguro Empresarial · Pindamonhangaba</span></div></div></div>
          <div class="review"><div class="review__stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p>"Consórcio de imóvel contratado sem burocracia. Acompanhamento desde a adesão até a contemplação. Equipe muito atenciosa e transparente em todo o processo."</p><div class="review__author"><div class="review__avatar">CT</div><div><strong>Cláudia T.</strong><span>Consórcio Imóvel · Caçapava</span></div></div></div>
        </div>
        <div class="reviews-nav">
          <button class="reviews-nav__btn" id="prevReview" aria-label="Anterior">&#8592;</button>
          <div class="reviews-nav__dots" id="reviewDots"></div>
          <button class="reviews-nav__btn" id="nextReview" aria-label="Próximo">&#8594;</button>
        </div>
      </div>
    </div>
  </section>

  <!-- ========== COTAÇÃO FORMULÁRIO ========== -->
  <section class="cotacao" id="cotacao">
    <div class="container cotacao__inner">
      <div class="cotacao__info">
        <span class="section-tag section-tag--light">Cotação 100% Gratuita</span>
        <h2>Solicite agora sua <strong>cotação sem compromisso</strong></h2>
        <p>Nossa equipe entra em contato em até 1 hora com as melhores opções do mercado para o seu perfil.</p>
        <ul class="cotacao__list">
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg> Cotação gratuita e sem compromisso</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg> Comparamos mais de 20 seguradoras</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg> Resposta em até 1 hora</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg> Atendimento personalizado</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg> Suporte completo em sinistros</li>
        </ul>
        <a href="https://wa.me/5512976002718" target="_blank" class="btn btn--whatsapp btn--lg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Chamar no WhatsApp agora
        </a>
      </div>

      <form class="form" id="cotacaoForm" novalidate>
        <h3 class="form__title">Solicitar cotação</h3>
        <div class="form__group">
          <label for="nome">Nome completo *</label>
          <input type="text" id="nome" name="nome" placeholder="Seu nome completo" required />
        </div>
        <div class="form__row">
          <div class="form__group">
            <label for="telefone">WhatsApp *</label>
            <input type="tel" id="telefone" name="telefone" placeholder="(12) 9 0000-0000" required />
          </div>
          <div class="form__group">
            <label for="cidade">Cidade *</label>
            <select id="cidade" name="cidade" required>
              <option value="">Selecione</option>
              <option>Jacareí</option><option>São José dos Campos</option><option>Taubaté</option>
              <option>Caçapava</option><option>Pindamonhangaba</option><option>Guaratinguetá</option>
              <option>Caraguatatuba</option><option>São Sebastião</option><option>Ilhabela</option>
              <option>Ubatuba</option><option>Outra cidade</option>
            </select>
          </div>
        </div>
        <div class="form__group">
          <label for="produto">Produto desejado *</label>
          <select id="produto" name="produto" required>
            <option value="">Selecione o produto</option>
            <optgroup label="Seguros de Veículos"><option>Seguro Auto</option><option>Seguro Moto</option><option>Seguro Caminhão</option></optgroup>
            <optgroup label="Seguros Pessoais"><option>Seguro Residencial / Imóvel</option><option>Seguro de Vida</option><option>Seguro Viagem</option></optgroup>
            <optgroup label="Seguros Empresariais"><option>Seguro Empresarial</option><option>Seguro Equipamentos</option><option>Seguro Condomínio</option><option>Seguro Transporte</option><option>Seguro Garantia</option><option>Seguro de Vida Empresarial</option></optgroup>
            <optgroup label="Saúde e Benefícios"><option>Plano de Saúde Individual / Familiar</option><option>Plano de Saúde Empresarial</option><option>Previdência Privada</option></optgroup>
            <optgroup label="Outros"><option>Consórcio</option><option>Certificado Digital</option></optgroup>
          </select>
        </div>
        <div class="form__group">
          <label for="mensagem">Observações</label>
          <textarea id="mensagem" name="mensagem" placeholder="Conte mais sobre o que você precisa..."></textarea>
        </div>
        <button type="submit" class="btn btn--primary btn--full">Enviar solicitação &#8594;</button>
        <p class="form__note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          Seus dados estão protegidos. Consulte nossa <a href="<?php echo vdo_url('politica-de-privacidade'); ?>">Política de Privacidade</a>.
        </p>
      </form>
    </div>
  </section>

  <!-- ========== FAQ ========== -->
  <section class="faq">
    <div class="container">
      <div class="section-header">
        <span class="section-tag">Dúvidas Frequentes</span>
        <h2 class="section-title">Perguntas <strong>mais comuns</strong></h2>
      </div>
      <div class="faq__list" id="faqList">
        <div class="faq__item"><button class="faq__q" aria-expanded="false">Vocês atendem apenas em Jacareí?<span class="faq__ic">+</span></button><div class="faq__a"><p>Não! Realizamos atendimento presencial em Jacareí e atendimento 100% online para todo o Vale do Paraíba, Litoral Norte, São Paulo e Brasil. Atendemos Jacareí, São José dos Campos, Taubaté, Caçapava, Pindamonhangaba, Guaratinguetá, Caraguatatuba, São Sebastião, Ilhabela, Ubatuba e toda a região.</p></div></div>
        <div class="faq__item"><button class="faq__q" aria-expanded="false">A cotação é realmente gratuita?<span class="faq__ic">+</span></button><div class="faq__a"><p>Sim, totalmente gratuita e sem compromisso. Você solicita a cotação, nossa equipe apresenta as melhores opções e você decide se quer contratar ou não. Não há nenhuma cobrança pelo serviço de cotação.</p></div></div>
        <div class="faq__item"><button class="faq__q" aria-expanded="false">Qual a diferença de contratar por um corretor de seguros?<span class="faq__ic">+</span></button><div class="faq__a"><p>Um corretor independente como a Vida de Ouro trabalha para você — não para a seguradora. Temos acesso a mais de 20 seguradoras e podemos comparar todas para encontrar a melhor cobertura pelo melhor preço. Além disso, prestamos suporte completo em sinistros, algo que você não teria contratando diretamente.</p></div></div>
        <div class="faq__item"><button class="faq__q" aria-expanded="false">Como funciona o suporte em caso de sinistro?<span class="faq__ic">+</span></button><div class="faq__a"><p>Em caso de sinistro, basta nos contatar pelo WhatsApp (12) 97600-2718. Nossa equipe irá orientá-lo em todos os passos, desde a abertura do chamado até a resolução final junto à seguradora. Você não fica sozinho em nenhum momento.</p></div></div>
        <div class="faq__item"><button class="faq__q" aria-expanded="false">Posso parcelar meu seguro?<span class="faq__ic">+</span></button><div class="faq__a"><p>Sim! A maioria dos seguros pode ser parcelada em até 12 vezes no cartão de crédito, além de opções no boleto bancário. As condições variam por seguradora e produto. Consulte nossa equipe para verificar as opções disponíveis para o seu caso.</p></div></div>
        <div class="faq__item"><button class="faq__q" aria-expanded="false">Vocês emitem certificado digital para quem está fora de Jacareí?<span class="faq__ic">+</span></button><div class="faq__a"><p>Sim! Realizamos emissão de certificado digital 100% online para todo o Vale do Paraíba, São Paulo e Brasil. O processo é seguro, rápido e com suporte completo na instalação e configuração.</p></div></div>
      </div>
    </div>
  </section>

<?php get_footer(); ?>
