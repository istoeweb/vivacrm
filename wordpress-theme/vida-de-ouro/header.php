<?php if (!empty($GLOBALS['vdo_render_mode'])) return; ?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#1E3A5F" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?> data-theme-uri="<?php echo esc_attr(get_template_directory_uri()); ?>" data-privacy-url="<?php echo esc_attr(home_url('/politica-de-privacidade/#cookies')); ?>">
<?php wp_body_open(); ?>

<?php
$slug_produto  = is_singular('produto') ? get_post_field('post_name') : '';
$health_slugs  = ['planos-saude','porto-saude','sulamerica-saude','bradesco-saude','amil','unimed'];
$other_slugs   = ['consorcios','previdencia','certificado-digital'];
$is_health_p   = in_array($slug_produto, $health_slugs, true);
$is_other_p    = in_array($slug_produto, $other_slugs, true);
$is_seguros_p  = is_singular('produto') && !$is_health_p && !$is_other_p;
$is_blog       = (is_home() && !is_front_page()) || is_category() || is_tag() || (is_single() && 'post' === get_post_type());
?>
<header class="header" id="header">
  <div class="container header__inner">
    <a href="<?php echo esc_url(home_url('/')); ?>" class="logo" aria-label="Vida de Ouro Jacareí — página inicial">
      <img src="<?php echo vdo_img('logo.svg'); ?>" alt="Vida de Ouro Jacareí" class="logo__img" />
    </a>

    <nav class="nav" id="nav" aria-label="Navegação principal">
      <ul class="nav__list">

        <li>
          <a href="<?php echo esc_url(home_url('/')); ?>" class="nav__link<?php echo vdo_nav_active(is_front_page()); ?>">Início</a>
        </li>

        <li class="nav__item nav__item--dropdown">
          <a href="<?php echo esc_url(home_url('/#produtos')); ?>" class="nav__link<?php echo vdo_nav_active($is_seguros_p); ?>">Seguros <span class="nav__arrow">&#9660;</span></a>
          <ul class="nav__dropdown">
            <li><a href="<?php echo vdo_p('seguro-auto'); ?>">Seguro Auto</a></li>
            <li><a href="<?php echo vdo_p('seguro-moto'); ?>">Seguro Moto</a></li>
            <li><a href="<?php echo vdo_p('seguro-caminhao'); ?>">Seguro Caminhão</a></li>
            <li><a href="<?php echo vdo_p('seguro-vida'); ?>">Seguro de Vida</a></li>
            <li><a href="<?php echo vdo_p('seguro-residencial'); ?>">Seguro Residencial</a></li>
            <li><a href="<?php echo vdo_p('seguro-empresarial'); ?>">Seguro Empresarial</a></li>
            <li><a href="<?php echo vdo_p('seguro-viagem'); ?>">Seguro Viagem</a></li>
            <li><a href="<?php echo vdo_p('seguro-condominio'); ?>">Seguro Condomínio</a></li>
            <li><a href="<?php echo vdo_p('seguro-transporte'); ?>">Seguro Transporte</a></li>
            <li><a href="<?php echo vdo_p('seguro-equipamentos'); ?>">Seguro Equipamentos</a></li>
          </ul>
        </li>

        <li class="nav__item nav__item--dropdown">
          <a href="<?php echo esc_url(home_url('/#saude')); ?>" class="nav__link<?php echo vdo_nav_active($is_health_p); ?>">Saúde <span class="nav__arrow">&#9660;</span></a>
          <ul class="nav__dropdown">
            <li><a href="<?php echo vdo_p('planos-saude'); ?>">Planos de Saúde</a></li>
            <li><a href="<?php echo vdo_p('porto-saude'); ?>">Porto Saúde</a></li>
            <li><a href="<?php echo vdo_p('sulamerica-saude'); ?>">SulAmérica Saúde</a></li>
            <li><a href="<?php echo vdo_p('bradesco-saude'); ?>">Bradesco Saúde</a></li>
            <li><a href="<?php echo vdo_p('amil'); ?>">Amil</a></li>
            <li><a href="<?php echo vdo_p('unimed'); ?>">Unimed SJC</a></li>
          </ul>
        </li>

        <li class="nav__item nav__item--dropdown">
          <a href="<?php echo esc_url(home_url('/#outros-produtos')); ?>" class="nav__link<?php echo vdo_nav_active($is_other_p); ?>">Outros produtos <span class="nav__arrow">&#9660;</span></a>
          <ul class="nav__dropdown">
            <li><a href="<?php echo vdo_p('consorcios'); ?>">Consórcios</a></li>
            <li><a href="<?php echo vdo_p('previdencia'); ?>">Previdência Privada</a></li>
            <li><a href="<?php echo vdo_p('certificado-digital'); ?>">Certificado Digital</a></li>
          </ul>
        </li>

        <li>
          <a href="<?php echo vdo_url('sobre'); ?>" class="nav__link<?php echo vdo_nav_active(is_page('sobre')); ?>">Sobre</a>
        </li>
        <li>
          <a href="<?php echo vdo_url('contato'); ?>" class="nav__link<?php echo vdo_nav_active(is_page('contato')); ?>">Contato</a>
        </li>
        <li>
          <a href="<?php echo esc_url(home_url('/blog/')); ?>" class="nav__link<?php echo vdo_nav_active($is_blog); ?>">Blog</a>
        </li>

      </ul>

      <a href="https://wa.me/5512976002718" target="_blank" rel="noopener noreferrer" class="btn btn--whatsapp nav__cta">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        (12) 97600-2718
      </a>
    </nav>

    <button class="hamburger" id="hamburger" aria-label="Abrir menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>
