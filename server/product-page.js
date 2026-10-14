// Entrega produto.html já preenchida com o produto do banco (editado no CRM):
// título, descrição, textos principais e tags de prévia (Open Graph) vão no HTML,
// para que Google, WhatsApp e redes sociais leiam o conteúdo sem executar JS.
// Os dados completos seguem em window.PRODUTOS para o produto.js montar o resto.
const db = require('./db');
const { fromRow } = require('./produtos');
const { readPage, renderPage, carregarValores } = require('./editable');

const SITE_NAME = 'Vida de Ouro Jacareí';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// JSON seguro dentro de <script>: impede que "</script>" no texto feche a tag.
const LINE_SEP = String.fromCharCode(0x2028);
const PARA_SEP = String.fromCharCode(0x2029);
const jsonForScript = (v) => JSON.stringify(v).replace(/</g, '\\u003c').split(LINE_SEP).join('\\u2028').split(PARA_SEP).join('\\u2029');

// Troca o texto interno do elemento com o id informado (elementos sem tags filhas).
function setText(html, id, value) {
  const re = new RegExp(`(<[a-z0-9]+[^>]*\\bid="${id}"[^>]*>)[^<]*(<)`, 'i');
  return html.replace(re, (_m, open, close) => open + esc(value) + close);
}

// siteDir mantido na assinatura por simetria com as outras páginas; o arquivo é
// lido (com cache) pelo módulo editable.
module.exports = function productPage(_siteDir) {
  return async (req, res) => {
    const template = readPage('produto.html');
    const slug = String(req.query.slug || '').slice(0, 80);
    let row;
    let valores = {};
    try {
      row = slug ? await db.get('SELECT * FROM produtos WHERE slug=? AND ativo=1', slug) : undefined;
      // Textos comuns da página de produto e rodapé editados no CRM.
      valores = await carregarValores(db);
    } catch (err) {
      // Banco indisponível: mantém o site no ar com o catálogo estático.
      console.error('Página de produto sem banco:', err.message);
      return res.type('html').send(template);
    }

    const base = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    let html = renderPage(template, valores);

    if (!row) {
      html = html
        .replace(/<script src="assets\/js\/produtos\.js"><\/script>/, '<script>window.PRODUTOS = {};</script>')
        .replace('</head>', '  <meta name="robots" content="noindex">\n</head>');
      return res.status(404).type('html').send(html);
    }

    const p = fromRow(row);
    const { id, ativo, ordem, atualizado_em, ...dados } = p;
    const url = `${base}/produto.html?slug=${encodeURIComponent(p.slug)}`;
    const title = `${p.nome} | ${SITE_NAME}`;
    const desc = `${p.tagline || p.nome} — ${SITE_NAME}, corretora de seguros no Vale do Paraíba e Litoral Norte.`;
    const image = /^https:\/\//.test(p.imagem_url) ? p.imagem_url
      : p.imagem_url ? `${base}/${p.imagem_url.replace(/^\//, '')}` : `${base}/assets/img/logo.svg`;
    const jsonLd = jsonForScript({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: p.nome,
      description: p.descricao || p.tagline,
      serviceType: p.categoria || undefined,
      areaServed: 'Vale do Paraíba e Litoral Norte – SP',
      url,
      provider: { '@type': 'InsuranceAgency', name: SITE_NAME, url: `${base}/` },
    });

    html = html
      .replace(/<title[^>]*>[\s\S]*?<\/title>/, () => `<title id="pageTitle">${esc(title)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*/, (_m, a) => a + esc(desc))
      .replace(/(<link rel="canonical" id="pageCanonical" href=")[^"]*/, (_m, a) => a + esc(url))
      .replace(/(<meta property="og:title" id="ogTitle" content=")[^"]*/, (_m, a) => a + esc(title))
      .replace(/(<meta property="og:description" id="ogDescription" content=")[^"]*/, (_m, a) => a + esc(desc))
      .replace(/(<meta property="og:url" id="ogUrl" content=")[^"]*/, (_m, a) => a + esc(url))
      .replace(/(<meta property="og:image" content=")[^"]*/, (_m, a) => a + esc(image))
      .replace('</head>', () => `  <script type="application/ld+json">${jsonLd}</script>\n</head>`)
      .replace(/<script src="assets\/js\/produtos\.js"><\/script>/,
        () => `<script>window.PRODUTOS = ${jsonForScript({ [p.slug]: dados })};</script>`);

    const textos = {
      pageH1: p.nome, pageTagline: p.tagline, pageTag: p.tag, bcNome: p.nome, bcCategoria: p.categoria,
      introCategoria: p.categoria, introNome: p.nome, pageDescricao: p.descricao, pagePublico: p.publico,
    };
    for (const [elId, value] of Object.entries(textos)) html = setText(html, elId, value);

    res.type('html').send(html);
  };
};
