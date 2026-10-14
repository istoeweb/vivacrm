// sitemap.xml gerado a partir do banco: páginas fixas do site + produtos ativos
// + artigos publicados. Assim um produto criado ou desativado no CRM entra ou
// sai do mapa do Google sem editar arquivos. Se o banco falhar, usa o arquivo.
const path = require('path');
const db = require('./db');
const { ORDER_BY } = require('./produtos');

const PAGINAS = [
  ['', 'weekly', '1.0'],
  ['sobre.html', 'monthly', '0.7'],
  ['contato.html', 'monthly', '0.8'],
  ['politica-de-privacidade.html', 'yearly', '0.3'],
  ['blog.html', 'weekly', '0.8'],
];

const xmlEsc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const day = (d) => (d ? String(d).slice(0, 10) : '');

module.exports = function sitemap(siteDir) {
  return async (_req, res) => {
    const base = (process.env.SITE_URL || 'https://vidadeouro.com.br').replace(/\/$/, '');
    let produtos;
    let posts;
    try {
      produtos = await db.all('SELECT slug, atualizado_em FROM produtos WHERE ativo=1 ORDER BY ' + ORDER_BY);
      posts = await db.all("SELECT slug, COALESCE(atualizado_em, publicado_em) AS data FROM blog_posts WHERE status='publicado' ORDER BY publicado_em DESC");
    } catch (err) {
      console.error('Sitemap sem banco:', err.message);
      return res.sendFile(path.join(siteDir, 'sitemap.xml'));
    }
    const url = (loc, freq, prio, lastmod) => [
      '  <url>',
      `    <loc>${xmlEsc(loc)}</loc>`,
      lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
      `    <changefreq>${freq}</changefreq>`,
      `    <priority>${prio}</priority>`,
      '  </url>',
    ].filter(Boolean).join('\n');
    const entries = [
      ...PAGINAS.map(([p, f, pr]) => url(`${base}/${p}`, f, pr)),
      ...produtos.map((p) => url(`${base}/produto.html?slug=${encodeURIComponent(p.slug)}`, 'monthly', '0.9', day(p.atualizado_em))),
      ...posts.map((p) => url(`${base}/artigo.html?slug=${encodeURIComponent(p.slug)}`, 'monthly', '0.6', day(p.data))),
    ];
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`);
  };
};
