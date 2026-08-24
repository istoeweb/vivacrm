/* ===================================
   PRODUTO.JS — Render da página de produto
   Vida de Ouro Jacareí
   =================================== */

(function () {
  function getSlug() {
    const params = new URLSearchParams(window.location.search);
    return params.get('slug');
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function renderNotFound() {
    document.getElementById('pageH1').textContent = 'Produto não encontrado';
    document.getElementById('pageTagline').textContent = 'A página solicitada não existe. Use o menu para navegar.';
    document.getElementById('pageTag').textContent = 'Erro 404';
    document.querySelector('.intro').style.display = 'none';
    document.querySelector('.coberturas').style.display = 'none';
    document.querySelector('.seg-parceiras').style.display = 'none';
    document.querySelector('.faq').style.display = 'none';
    document.getElementById('pageTitle').textContent = 'Produto não encontrado | Vida de Ouro Jacareí';
  }

  function bindFaqAccordion() {
    document.querySelectorAll('.faq__q').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq__item');
        const answer = item.querySelector('.faq__a');
        const isOpen = item.classList.contains('open');

        document.querySelectorAll('.faq__item').forEach(i => {
          i.classList.remove('open');
          i.querySelector('.faq__a').style.display = 'none';
          i.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
          item.classList.add('open');
          answer.style.display = 'block';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  function render(slug) {
    const data = (window.PRODUTOS || {})[slug];
    if (!data) { renderNotFound(); return; }

    const wppMsg = encodeURIComponent('Olá! Vim pelo site e gostaria de uma cotação de ' + data.nome + '.');
    const wppUrl = 'https://wa.me/5512976002718?text=' + wppMsg;

    document.title = data.nome + ' | Vida de Ouro Jacareí';
    document.getElementById('pageTitle').textContent = data.nome + ' | Vida de Ouro Jacareí';

    document.getElementById('bcCategoria').textContent = data.categoria;
    document.getElementById('bcNome').textContent = data.nome;
    document.getElementById('pageTag').textContent = data.tag;
    document.getElementById('pageH1').textContent = data.nome;
    document.getElementById('pageTagline').textContent = data.tagline;

    document.getElementById('introCategoria').textContent = data.categoria;
    document.getElementById('introNome').textContent = data.nome;
    document.getElementById('pageDescricao').textContent = data.descricao;
    document.getElementById('pagePublico').textContent = data.publico;

    document.getElementById('heroCtaWpp').href = wppUrl;
    document.getElementById('ctaWpp').href = wppUrl;
    document.getElementById('faqNome').textContent = data.nome.toLowerCase();

    const heroImg = document.getElementById('produtoHeroImg');
    const heroWrap = document.getElementById('produtoHeroImgWrap');
    if (heroImg && heroWrap) {
      heroImg.alt = data.nome;
      heroImg.src = 'assets/img/produtos/' + slug + '.jpg';
      heroImg.onerror = function () { heroWrap.remove(); };
    }

    const cobGrid = document.getElementById('coberturasGrid');
    cobGrid.innerHTML = data.coberturas.map(c =>
      '<div class="cob-card"><h4>' + esc(c.t) + '</h4><p>' + esc(c.d) + '</p></div>'
    ).join('');

    const segList = document.getElementById('segList');
    segList.innerHTML = data.seguradoras.map(s =>
      '<span class="seg-chip">' + esc(s) + '</span>'
    ).join('');

    const faqList = document.getElementById('faqList');
    faqList.innerHTML = data.faq.map(f =>
      '<div class="faq__item">' +
        '<button class="faq__q" aria-expanded="false">' + esc(f.q) + ' <span class="faq__ic">+</span></button>' +
        '<div class="faq__a"><p>' + esc(f.a) + '</p></div>' +
      '</div>'
    ).join('');

    bindFaqAccordion();

    document.querySelector('meta[name="description"]')
      .setAttribute('content', data.tagline + ' — Vida de Ouro Jacareí, corretora de seguros no Vale do Paraíba e Litoral Norte.');

    // Canonical e Open Graph dinâmicos por produto
    const canonicalUrl = 'https://vidadeouro.com.br/produto.html?slug=' + slug;
    const setAttr = (sel, attr, val) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val); };
    setAttr('#pageCanonical', 'href', canonicalUrl);
    setAttr('#ogUrl', 'content', canonicalUrl);
    setAttr('#ogTitle', 'content', data.nome + ' | Vida de Ouro Jacareí');
    setAttr('#ogDescription', 'content', data.tagline + ' — corretora de seguros no Vale do Paraíba e Litoral Norte.');
  }

  document.addEventListener('DOMContentLoaded', function () {
    render(getSlug());
  });
})();