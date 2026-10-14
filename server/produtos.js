/*
 * Produtos do site (páginas produto.html?slug=...) guardados no banco e
 * editados no CRM. Este módulo concentra:
 *   - a validação/normalização do que chega do CRM (clean);
 *   - a conversão linha do banco → objeto usado pelo site (fromRow);
 *   - a carga inicial a partir de assets/js/produtos.js (seedIfEmpty), para que
 *     um banco novo já nasça com o catálogo atual do site.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const GRUPOS = ['seguros', 'saude', 'outros'];
const GRUPO_LABEL = { seguros: 'Seguros', saude: 'Saúde', outros: 'Outros produtos' };
// Ordem dos grupos igual à do menu do site (Seguros, Saúde, Outros).
const ORDER_BY = "CASE grupo WHEN 'seguros' THEN 0 WHEN 'saude' THEN 1 ELSE 2 END, ordem, nome";

// Itens que o menu do site mostra em "Outros produtos" mesmo tendo outra categoria.
const OUTROS_SLUGS = new Set(['consorcios', 'previdencia', 'certificado-digital']);

function slugify(value) {
  return String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

const str = (v, max) => String(v ?? '').trim().slice(0, max);

// Lista de objetos com campos de texto: descarta itens vazios e limita tamanhos.
function list(value, fields, maxItems) {
  const arr = Array.isArray(value) ? value : [];
  return arr
    .map((item) => {
      const out = {};
      for (const [key, max] of Object.entries(fields)) out[key] = str(item && item[key], max);
      return out;
    })
    .filter((item) => Object.values(item).some(Boolean))
    .slice(0, maxItems);
}

function parseJson(text, fallback) {
  try { const v = JSON.parse(text); return v ?? fallback; } catch { return fallback; }
}

/** Valida o corpo vindo do CRM. existing = linha atual (edição parcial). */
function clean(body, existing) {
  const cur = existing ? fromRow(existing) : {};
  const pick = (key) => (body[key] !== undefined ? body[key] : cur[key]);
  const nome = str(pick('nome'), 120);
  const slug = slugify(body.slug || cur.slug || nome);
  if (!nome || !slug) return { error: 'Nome é obrigatório' };
  const grupo = GRUPOS.includes(pick('grupo')) ? pick('grupo') : 'seguros';
  const ordem = Number.isFinite(Number(pick('ordem'))) ? Math.max(0, Math.min(9999, Math.round(Number(pick('ordem'))))) : 0;
  const ativoRaw = pick('ativo');
  const ativo = ativoRaw === undefined ? 1 : (ativoRaw === true || ativoRaw === 1 || ativoRaw === '1' || ativoRaw === 'true' || ativoRaw === 'on') ? 1 : 0;
  const imagem = str(pick('imagem_url'), 500);
  if (imagem && !/^(https:\/\/|\/?assets\/)/.test(imagem)) return { error: 'Imagem inválida' };
  return {
    slug, nome, grupo, ordem, ativo,
    // Sem categoria, o caminho "Início › categoria › produto" usa o nome do menu.
    categoria: str(pick('categoria'), 80) || GRUPO_LABEL[grupo],
    tag: str(pick('tag'), 80),
    tagline: str(pick('tagline'), 200),
    descricao: str(pick('descricao'), 4000),
    publico: str(pick('publico'), 1000),
    imagem_url: imagem || null,
    precos: list(pick('precos'), { rotulo: 80, valor: 40 }, 6),
    coberturas: list(pick('coberturas'), { t: 120, d: 400 }, 20),
    seguradoras: (Array.isArray(pick('seguradoras')) ? pick('seguradoras') : [])
      .map((s) => str(s, 80)).filter(Boolean).slice(0, 40),
    faq: list(pick('faq'), { q: 200, a: 1200 }, 30),
  };
}

/** Linha do banco → objeto no formato que o site e o CRM usam. */
function fromRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    nome: row.nome,
    grupo: row.grupo,
    categoria: row.categoria || '',
    tag: row.tag || '',
    tagline: row.tagline || '',
    descricao: row.descricao || '',
    publico: row.publico || '',
    imagem_url: row.imagem_url || '',
    precos: parseJson(row.precos, []),
    coberturas: parseJson(row.coberturas, []),
    seguradoras: parseJson(row.seguradoras, []),
    faq: parseJson(row.faq, []),
    ordem: Number(row.ordem) || 0,
    ativo: Number(row.ativo) ? 1 : 0,
    atualizado_em: row.atualizado_em,
  };
}

/** Valores na ordem das colunas usadas em INSERT/UPDATE. */
function toParams(p) {
  return [p.slug, p.nome, p.grupo, p.categoria, p.tag, p.tagline, p.descricao, p.publico, p.imagem_url,
    JSON.stringify(p.precos), JSON.stringify(p.coberturas), JSON.stringify(p.seguradoras), JSON.stringify(p.faq),
    p.ordem, p.ativo];
}
const COLUMNS = 'slug,nome,grupo,categoria,tag,tagline,descricao,publico,imagem_url,precos,coberturas,seguradoras,faq,ordem,ativo';

// Lê assets/js/produtos.js (que define window.PRODUTOS) sem executar nada além dele.
function loadStaticCatalog() {
  const file = path.join(__dirname, '..', 'assets', 'js', 'produtos.js');
  if (!fs.existsSync(file)) return {};
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, { timeout: 1000 });
  return sandbox.window.PRODUTOS || {};
}

function grupoPara(slug, categoria) {
  if (OUTROS_SLUGS.has(slug) || categoria === 'Outros') return 'outros';
  if (/sa[uú]de/i.test(categoria || '')) return 'saude';
  return 'seguros';
}

/** Primeira execução: copia o catálogo estático para o banco. */
async function seedIfEmpty(db) {
  const row = await db.get('SELECT COUNT(*) AS n FROM produtos');
  if (row && Number(row.n) > 0) return;
  const catalog = loadStaticCatalog();
  const imgDir = path.join(__dirname, '..', 'assets', 'img', 'produtos');
  let ordem = 0;
  for (const [slug, data] of Object.entries(catalog)) {
    const img = fs.existsSync(path.join(imgDir, `${slug}.jpg`)) ? `assets/img/produtos/${slug}.jpg` : '';
    const p = clean({ ...data, slug, grupo: grupoPara(slug, data.categoria), ordem: (ordem += 10), ativo: 1, imagem_url: img });
    if (p.error) continue;
    await db.run(`INSERT INTO produtos (${COLUMNS}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT (slug) DO NOTHING`, ...toParams(p));
  }
}

module.exports = { GRUPOS, GRUPO_LABEL, ORDER_BY, COLUMNS, clean, fromRow, toParams, seedIfEmpty, slugify };
