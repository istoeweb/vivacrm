// Entrega artigo.html com título, descrição e tags Open Graph do artigo já no HTML.
// WhatsApp, Facebook e LinkedIn não executam JavaScript: sem isso, todo link
// compartilhado mostraria a prévia genérica "Artigo | Vida de Ouro Jacareí".
const fs = require('fs');
const path = require('path');
const db = require('./db');

const SITE_NAME = 'Vida de Ouro Jacareí';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function absoluteImage(base, url) {
  const u = String(url || '');
  if (/^https:\/\//.test(u)) return u;
  if (/^assets\//.test(u)) return `${base}/${u}`;
  return '';
}

module.exports = function articlePage(siteDir) {
  const file = path.join(siteDir, 'artigo.html');
  return (req, res) => {
    let html = fs.readFileSync(file, 'utf8');
    const slug = String(req.query.slug || '');
    const post = slug && db.prepare(`SELECT titulo,slug,resumo,imagem_url,palavras_chave,publicado_em,atualizado_em FROM blog_posts WHERE slug=? AND status='publicado'`).get(slug);
    if (post) {
      const base = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
      const url = `${base}/artigo.html?slug=${encodeURIComponent(post.slug)}`;
      const title = `${post.titulo} | ${SITE_NAME}`;
      const desc = post.resumo || `Artigo do Blog ${SITE_NAME}`;
      const image = absoluteImage(base, post.imagem_url);
      const jsonLd = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.titulo,
        description: desc,
        image: image || undefined,
        datePublished: post.publicado_em || undefined,
        dateModified: post.atualizado_em || post.publicado_em || undefined,
        mainEntityOfPage: url,
        publisher: { '@type': 'Organization', name: SITE_NAME },
      }).replace(/</g, '\\u003c');
      const tags = [
        `<link rel="canonical" href="${esc(url)}">`,
        '<meta property="og:type" content="article">',
        `<meta property="og:site_name" content="${esc(SITE_NAME)}">`,
        '<meta property="og:locale" content="pt_BR">',
        `<meta property="og:title" content="${esc(post.titulo)}">`,
        `<meta property="og:description" content="${esc(desc)}">`,
        `<meta property="og:url" content="${esc(url)}">`,
        image && `<meta property="og:image" content="${esc(image)}">`,
        `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">`,
        `<script type="application/ld+json">${jsonLd}</script>`,
      ].filter(Boolean).join('\n  ');
      html = html
        .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(title)}</title>`)
        .replace(/(<meta name="description" id="metaDescription" content=")[^"]*/, (_m, p1) => p1 + esc(desc))
        .replace(/(<meta name="keywords" id="metaKeywords" content=")[^"]*/, (_m, p1) => p1 + esc(post.palavras_chave || ''))
        .replace('</head>', () => `  ${tags}\n</head>`);
    }
    res.type('html').send(html);
  };
};
