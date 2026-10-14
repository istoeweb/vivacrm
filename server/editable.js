/*
 * Páginas editáveis pelo CRM.
 *
 * O HTML das páginas marca o que pode ser editado com comentários (invisíveis
 * para o visitante). O texto que está no arquivo é o valor padrão; o CRM grava
 * só o que foi alterado (tabela site_conteudo, chaves "pg.<chave>").
 *
 *   Campo:  <!--e:home.hero.titulo|Título do topo|text-->Texto atual<!--/e-->
 *   Lista:  <!--list:home.faq|Perguntas frequentes-->
 *             <!--item--> ... <!--f:q|Pergunta-->...<!--/f--> ... <!--/item-->
 *             (o primeiro item serve de molde para os demais)
 *           <!--/list-->
 *   Link de item de lista: <!--a:link|Link|href--><a href="...">  (marca o atributo da tag seguinte)
 *
 * Tipos: text  — uma linha; **trecho** vira destaque (<strong>)
 *        area  — várias linhas; quebras de linha viram <br>
 *        lines — um item por linha; cada linha vira um <li>
 *        spans — um item por linha; cada linha vira uma etiqueta (<span>)
 *        md    — texto longo: parágrafos, "## Título", "### Subtítulo",
 *                "- item de lista", **negrito** e [texto](link)
 *
 * Título e descrição da página (SEO) também são editáveis: <page>.seo.titulo/descricao.
 */
const fs = require('fs');
const path = require('path');

const SITE_DIR = path.join(__dirname, '..');
const PREFIX = 'pg.';

// Páginas que o CRM mostra, na ordem das abas. "global" reúne o que se repete
// em todas as páginas (ex.: rodapé) — a mesma chave em vários arquivos.
const PAGINAS = [
  { id: 'home', label: 'Página inicial', arquivo: 'index.html', seo: true },
  { id: 'sobre', label: 'Sobre', arquivo: 'sobre.html', seo: true },
  { id: 'contato', label: 'Contato', arquivo: 'contato.html', seo: true },
  { id: 'politica', label: 'Política de Privacidade', arquivo: 'politica-de-privacidade.html', seo: true },
  { id: 'blog', label: 'Blog (página inicial)', arquivo: 'blog.html', seo: true },
  { id: 'produto', label: 'Páginas de produto (textos comuns)', arquivo: 'produto.html', seo: false },
];
const GLOBAL = { id: 'global', label: 'Rodapé e partes comuns' };

const LIMITES = { text: 500, area: 3000, lines: 6000, spans: 3000, md: 60000, url: 500 };
const MAX_ITENS = 60;

const RE_LIST = /<!--list:([\w.-]+)\|([^>]*?)-->([\s\S]*?)<!--\/list-->/g;
const RE_ITEM = /<!--item-->([\s\S]*?)<!--\/item-->/g;
const RE_FIELD = /<!--f:(\w+)\|([^|>]*?)(?:\|(\w+))?-->([\s\S]*?)<!--\/f-->/g;
const RE_ATTR = /<!--a:(\w+)\|([^|>]*?)\|([\w-]+)-->(\s*)(<[a-zA-Z][^>]*>)/g;
const RE_EDIT =/<!--e:([\w.-]+)\|([^|>]*?)(?:\|(\w+))?-->([\s\S]*?)<!--\/e-->/g;

/* ---------- HTML → texto do editor (valores padrão) ---------- */

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", apos: "'", nbsp: ' ', rsaquo: '›', middot: '·', ndash: '–', mdash: '—', copy: '©' };
const decode = (s) => s
  .replace(/&#(\d+);/g, (_m, n) => String.fromCharCode(Number(n)))
  .replace(/&([a-z0-9#]+);/gi, (m, n) => (n in ENT ? ENT[n] : m));

function inlineToText(html) {
  return decode(String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<a [^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
    .replace(/<[^>]+>/g, ''))
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function htmlToMd(html) {
  const blocks = [];
  const re = /<(h2|h3|p|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(html))) {
    const [, tag, inner] = m;
    const t = tag.toLowerCase();
    if (t === 'h2') blocks.push('## ' + inlineToText(inner).replace(/\n/g, ' '));
    else if (t === 'h3') blocks.push('### ' + inlineToText(inner).replace(/\n/g, ' '));
    else if (t === 'p') blocks.push(inlineToText(inner));
    else blocks.push([...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((li) => '- ' + inlineToText(li[1]).replace(/\n/g, ' ')).join('\n'));
  }
  return blocks.filter(Boolean).join('\n\n');
}

function toEditor(html, type) {
  if (type === 'md') return htmlToMd(html);
  if (type === 'spans') return [...String(html).matchAll(/<span[^>]*>([\s\S]*?)<\/span>/gi)].map((m) => inlineToText(m[1]).replace(/\n/g, ' ')).join('\n');
  if (type === 'lines') return [...String(html).matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((li) => inlineToText(li[1]).replace(/\n/g, ' ')).join('\n');
  const text = inlineToText(html);
  return type === 'area' ? text : text.replace(/\n/g, ' ');
}

/* ---------- texto do editor → HTML (renderização) ---------- */

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeUrl = (u) => (/^(https?:\/\/|mailto:|tel:|#|\/|[a-z0-9-]+\.html)/i.test(u) ? u : '#');

function inline(text) {
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, t, u) => `<a href="${esc(safeUrl(decode(u)))}">${t}</a>`);
}

function mdToHtml(md) {
  return String(md).replace(/\r/g, '').split(/\n\s*\n/).map((block) => {
    const b = block.trim();
    if (!b) return '';
    if (b.startsWith('### ')) return `<h3>${inline(b.slice(4))}</h3>`;
    if (b.startsWith('## ')) return `<h2>${inline(b.slice(3))}</h2>`;
    const lines = b.split('\n');
    if (lines.every((l) => /^\s*[-•]\s+/.test(l))) {
      return `<ul>\n${lines.map((l) => `  <li>${inline(l.replace(/^\s*[-•]\s+/, ''))}</li>`).join('\n')}\n</ul>`;
    }
    return `<p>${lines.map(inline).join('<br>')}</p>`;
  }).filter(Boolean).join('\n');
}

function toHtml(value, type) {
  const v = String(value ?? '').replace(/\r/g, '');
  if (type === 'md') return mdToHtml(v);
  if (type === 'spans') return v.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => `<span>${inline(l)}</span>`).join('');
  if (type === 'lines') return v.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => `<li>${inline(l)}</li>`).join('');
  if (type === 'area') return v.split('\n').map(inline).join('<br>');
  return inline(v.replace(/\n/g, ' '));
}

const typeOf = (t) => (LIMITES[t] && t !== 'url' ? t : 'text');

// Lê/troca o valor de um atributo na tag de abertura.
function getAttr(tag, attr) {
  const m = tag.match(new RegExp(`\\s${attr}="([^"]*)"`));
  return m ? decode(m[1]) : '';
}
function setAttr(tag, attr, value) {
  const v = esc(attr === 'href' || attr === 'src' ? safeUrl(value) : value);
  const re = new RegExp(`(\\s${attr}=")[^"]*(")`);
  return re.test(tag) ? tag.replace(re, (_m, a, b) => a + v + b) : tag.replace(/^<([a-zA-Z0-9]+)/, `<$1 ${attr}="${v}"`);
}

/* ---------- leitura das marcações ---------- */

function parseList(key, label, body) {
  const items = [...body.matchAll(RE_ITEM)].map((m) => m[1]);
  const fields = [];
  const padrao = items.map((itemHtml) => {
    const obj = {};
    for (const a of itemHtml.matchAll(RE_ATTR)) {
      const [, name, alabel, attr, , tag] = a;
      if (!fields.some((x) => x.name === name)) fields.push({ name, label: alabel || name, type: 'url', attr });
      obj[name] = getAttr(tag, attr);
    }
    for (const f of itemHtml.matchAll(RE_FIELD)) {
      const [, name, flabel, ftype, content] = f;
      const type = typeOf(ftype);
      if (!fields.some((x) => x.name === name)) fields.push({ name, label: flabel || name, type });
      obj[name] = toEditor(content, type);
    }
    return obj;
  });
  return { key, label, type: 'list', fields, padrao, molde: items[0] || '' };
}

/** Campos editáveis de um HTML, na ordem em que aparecem. */
function parseFields(html) {
  const out = [];
  const seen = new Set();
  // Listas primeiro; os campos e: dentro delas não existem (só f:).
  const semListas = html.replace(RE_LIST, (_m, key, label, body) => {
    if (!seen.has(key)) { seen.add(key); out.push({ ...parseList(key, label, body), pos: out.length }); }
    return `\u0000${key}\u0000`;
  });
  // Recoloca a posição das listas em relação aos campos simples.
  const ordered = [];
  const tokens = semListas.split(/\u0000([\w.-]+)\u0000/);
  for (let i = 0; i < tokens.length; i++) {
    if (i % 2 === 1) { ordered.push(out.find((f) => f.key === tokens[i])); continue; }
    for (const m of tokens[i].matchAll(RE_EDIT)) {
      const [, key, label, t, content] = m;
      if (seen.has(key)) continue;
      seen.add(key);
      const type = typeOf(t);
      ordered.push({ key, label: label || key, type, padrao: toEditor(content, type) });
    }
  }
  return ordered.map(({ pos, molde, ...f }) => f);
}

function seoFields(pageId, html) {
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/) || [])[1] || '';
  const desc = (html.match(/<meta name="description"[^>]*content="([^"]*)"/) || [])[1] || '';
  return [
    { key: `${pageId}.seo.titulo`, label: 'Busca no Google · Título da aba e do Google', type: 'text', padrao: decode(title.trim()), seo: true },
    { key: `${pageId}.seo.descricao`, label: 'Busca no Google · Descrição no Google', type: 'area', padrao: decode(desc.trim()), seo: true },
  ];
}

// Cache do HTML lido do disco (os arquivos só mudam em um novo deploy).
const fileCache = new Map();
function readPage(arquivo) {
  const file = path.join(SITE_DIR, arquivo);
  const mtime = fs.statSync(file).mtimeMs;
  const hit = fileCache.get(file);
  if (hit && hit.mtime === mtime) return hit.html;
  const html = fs.readFileSync(file, 'utf8');
  fileCache.set(file, { html, mtime });
  return html;
}

/** Todas as páginas com seus campos (para o CRM e para validar gravações). */
function catalogo() {
  const paginas = [];
  const globais = new Map();
  for (const p of PAGINAS) {
    const html = readPage(p.arquivo);
    const campos = [];
    for (const f of parseFields(html)) {
      if (f.key.startsWith('global.')) { if (!globais.has(f.key)) globais.set(f.key, f); continue; }
      campos.push(f);
    }
    paginas.push({ id: p.id, label: p.label, arquivo: p.arquivo, campos: p.seo ? [...seoFields(p.id, html), ...campos] : campos });
  }
  if (globais.size) paginas.push({ id: GLOBAL.id, label: GLOBAL.label, arquivo: null, campos: [...globais.values()] });
  return paginas;
}

function campoPorChave() {
  const map = new Map();
  for (const p of catalogo()) for (const c of p.campos) map.set(c.key, c);
  return map;
}

/* ---------- validação do que vem do CRM ---------- */

/** Normaliza um valor para gravar. Retorna { value } (string) ou { error }. */
function normalizar(campo, valor) {
  if (campo.type === 'list') {
    if (!Array.isArray(valor)) return { error: `"${campo.label}" precisa ser uma lista` };
    const nomes = new Map(campo.fields.map((f) => [f.name, f]));
    const itens = valor.slice(0, MAX_ITENS).map((item) => {
      const o = {};
      for (const [name, f] of nomes) o[name] = String((item && item[name]) ?? '').replace(/\r/g, '').trim().slice(0, LIMITES[f.type]);
      return o;
    }).filter((o) => Object.values(o).some(Boolean));
    return { value: JSON.stringify(itens) };
  }
  return { value: String(valor ?? '').replace(/\r/g, '').trim().slice(0, LIMITES[campo.type] || 500) };
}

const igualAoPadrao = (campo, value) => (campo.type === 'list' ? value === JSON.stringify(campo.padrao) : value === campo.padrao);

/* ---------- renderização ---------- */

function renderList(molde, itens) {
  return itens.map((item) => '<!--item-->' + molde.replace(RE_ATTR, (_m, name, label, attr, ws, tag) =>
    `<!--a:${name}|${label}|${attr}-->${ws}${setAttr(tag, attr, item[name] ?? '')}`).replace(RE_FIELD,(_m, name, label, t, _c) => {
    const type = typeOf(t);
    return `<!--f:${name}|${label}${t ? '|' + t : ''}-->${toHtml(item[name] ?? '', type)}<!--/f-->`;
  }) + '<!--/item-->').join('\n');
}

/**
 * Aplica os valores salvos no HTML da página.
 * valores: { 'home.hero.titulo': 'texto', 'home.faq': '[...]' } (sem o prefixo pg.)
 */
function renderPage(html, valores, pageId) {
  if (!valores || !Object.keys(valores).length) return html;
  let out = html.replace(RE_LIST, (full, key, label, body) => {
    if (!(key in valores)) return full;
    let itens;
    try { itens = JSON.parse(valores[key]); } catch { return full; }
    if (!Array.isArray(itens)) return full;
    const molde = (body.match(/<!--item-->([\s\S]*?)<!--\/item-->/) || [])[1];
    if (molde === undefined) return full;
    // Mantém o espaçamento antes do primeiro item e depois do último.
    const antes = body.slice(0, body.indexOf('<!--item-->'));
    const depois = body.slice(body.lastIndexOf('<!--/item-->') + '<!--/item-->'.length);
    return `<!--list:${key}|${label}-->${antes}${renderList(molde, itens)}${depois}<!--/list-->`;
  });
  out = out.replace(RE_EDIT, (full, key, label, t) => {
    if (!(key in valores)) return full;
    return `<!--e:${key}|${label}${t ? '|' + t : ''}-->${toHtml(valores[key], typeOf(t))}<!--/e-->`;
  });
  if (pageId) {
    const titulo = valores[`${pageId}.seo.titulo`];
    const desc = valores[`${pageId}.seo.descricao`];
    if (titulo) {
      out = out.replace(/(<title[^>]*>)[\s\S]*?(<\/title>)/, (_m, a, b) => a + esc(titulo) + b)
        .replace(/(<meta property="og:title"[^>]*content=")[^"]*/, (_m, a) => a + esc(titulo));
    }
    if (desc) {
      const d = desc.replace(/\s+/g, ' ');
      out = out.replace(/(<meta name="description"[^>]*content=")[^"]*/, (_m, a) => a + esc(d))
        .replace(/(<meta property="og:description"[^>]*content=")[^"]*/, (_m, a) => a + esc(d));
    }
  }
  return out;
}

/** Valores salvos no banco (sem o prefixo). */
async function carregarValores(db) {
  const rows = await db.all(`SELECT chave, valor FROM site_conteudo WHERE chave LIKE '${PREFIX}%'`);
  const map = {};
  for (const r of rows) map[r.chave.slice(PREFIX.length)] = r.valor;
  return map;
}

module.exports = {
  PREFIX, PAGINAS, catalogo, campoPorChave, normalizar, igualAoPadrao,
  renderPage, carregarValores, readPage,
  // exportados para testes
  _internals: { parseFields, toEditor, toHtml, mdToHtml, htmlToMd },
};
