/* ===================================
   THUMBS.JS — Thumbnails nos cards da home
   Vida de Ouro Jacareí
   =================================== */

(function () {
  const THUMBS = {
    'Seguro Auto': 'seguro-auto',
    'Seguro Moto': 'seguro-moto',
    'Seguro Caminhão': 'seguro-caminhao',
    'Seguro Residencial': 'seguro-residencial',
    'Seguro de Vida': 'seguro-vida',
    'Seguro Viagem': 'seguro-viagem',
    'Seguro Empresarial': 'seguro-empresarial',
    'Seguro Equipamentos': 'seguro-equipamentos',
    'Seguro Condomínio': 'seguro-condominio',
    'Seguro Transporte': 'seguro-transporte',
    'Seguro Garantia': 'seguro-garantia',
    'Seguro de Vida Empresarial': 'seguro-vida-empresarial',
    'Porto Saúde Empresarial': 'porto-saude',
    'SulAmérica Saúde': 'sulamerica-saude',
    'Previdência Privada': 'previdencia',
    'Consórcios': 'consorcios',
    'Certificado Digital': 'certificado-digital'
  };

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.card').forEach(function (card) {
      if (card.querySelector('.card__img-wrap')) return;
      const title = card.querySelector('.card__title');
      if (!title) return;
      const slug = THUMBS[title.textContent.trim()];
      if (!slug) return;

      const img = document.createElement('img');
      img.alt = title.textContent.trim();
      img.className = 'card__thumb';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = 'assets/img/produtos/' + slug + '.jpg';
      img.onerror = function () { img.remove(); };
      card.prepend(img);
    });
  });
})();