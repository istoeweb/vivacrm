<?php if (!empty($GLOBALS['vdo_render_mode'])) return; ?>
  <footer class="footer">
    <div class="container">
      <div class="footer__grid">

        <div class="footer__brand">
          <a href="<?php echo esc_url(home_url('/')); ?>" class="logo">
            <img src="<?php echo vdo_img('logo.svg'); ?>" alt="Vida de Ouro Jacareí" class="logo__img logo__img--footer" />
          </a>
          <p>Corretora de seguros especializada no Vale do Paraíba e Litoral Norte. Atendimento consultivo, pós-venda ativo e as melhores condições do mercado.</p>
          <p class="footer__susep">Corretor de Seguros habilitado SUSEP</p>
          <div class="footer__social">
            <a href="#" aria-label="Instagram" class="footer__social-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="#" aria-label="Facebook" class="footer__social-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
            </a>
            <a href="https://wa.me/5512976002718" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" class="footer__social-link footer__social-link--wpp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
          </div>
        </div>

        <div class="footer__col">
          <h4>Seguros</h4>
          <ul>
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
            <li><a href="<?php echo vdo_p('seguro-garantia'); ?>">Seguro Garantia</a></li>
          </ul>
        </div>

        <div class="footer__col">
          <h4>Saúde e Outros</h4>
          <ul>
            <li><a href="<?php echo vdo_p('planos-saude'); ?>">Planos de Saúde</a></li>
            <li><a href="<?php echo vdo_p('porto-saude'); ?>">Porto Saúde Empresarial</a></li>
            <li><a href="<?php echo vdo_p('sulamerica-saude'); ?>">SulAmérica Saúde</a></li>
            <li><a href="<?php echo vdo_p('bradesco-saude'); ?>">Bradesco Saúde</a></li>
            <li><a href="<?php echo vdo_p('amil'); ?>">Amil</a></li>
            <li><a href="<?php echo vdo_p('unimed'); ?>">Unimed SJC</a></li>
            <li><a href="<?php echo vdo_p('consorcios'); ?>">Consórcios</a></li>
            <li><a href="<?php echo vdo_p('previdencia'); ?>">Previdência Privada</a></li>
            <li><a href="<?php echo vdo_p('certificado-digital'); ?>">Certificado Digital</a></li>
          </ul>
        </div>

        <div class="footer__col">
          <h4>Contato</h4>
          <ul class="footer__contact-list">
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v2.92z"/></svg>
              <a href="tel:+5512976002718">(12) 97600-2718</a>
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <a href="https://wa.me/5512976002718" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Jacareí – SP · Vale do Paraíba
            </li>
          </ul>
          <div class="footer__blog">
            <h4>Blog</h4>
            <p>Dicas, novidades e conteúdos exclusivos sobre seguros no Vale do Paraíba.</p>
            <a href="<?php echo esc_url(home_url('/blog/')); ?>" class="btn btn--outline-light btn--sm">Acessar Blog</a>
          </div>
        </div>

      </div>

      <div class="footer__bottom">
        <p>&copy; <?php echo date('Y'); ?> Vida de Ouro Jacareí · Corretora de Seguros · Vale do Paraíba e Litoral Norte</p>
        <div class="footer__bottom-links">
          <a href="<?php echo vdo_url('politica-de-privacidade'); ?>">Política de Privacidade</a>
          <a href="#">Termos de Uso</a>
        </div>
      </div>
    </div>
  </footer>

<?php wp_footer(); ?>
</body>
</html>
