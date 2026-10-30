const db = require('../db');
const { asyncRouter } = require('../utils');
const { auth, requireRole } = require('../middleware/auth');
const { COLUMNS, PLACEHOLDERS, ORDER_BY, clean, fromRow, toParams } = require('../produtos');

const router = asyncRouter();
const adminOnly = [auth, requireRole('admin')];

// SQLite: 'UNIQUE constraint failed'; Postgres: código 23505.
const isUniqueViolation = (e) => e.code === '23505' || String(e.message).includes('UNIQUE');
const SLUG_EM_USO = 'Já existe um produto com esse endereço';

// Campos enxutos para menus e listagens do site.
const resumo = (p) => ({ slug: p.slug, nome: p.nome, grupo: p.grupo, categoria: p.categoria, tag: p.tag, tagline: p.tagline, precos: p.precos, imagem_url: p.imagem_url });

router.get('/admin', ...adminOnly, async (_req, res) => {
  const rows = await db.all('SELECT * FROM produtos ORDER BY ' + ORDER_BY);
  res.json(rows.map(fromRow));
});

router.get('/admin/:id', ...adminOnly, async (req, res) => {
  const row = await db.get('SELECT * FROM produtos WHERE id=?', req.params.id);
  if (!row) return res.status(404).json({ error: 'Produto não encontrado' });
  res.json(fromRow(row));
});

router.post('/admin', ...adminOnly, async (req, res) => {
  const p = clean(req.body || {});
  if (p.error) return res.status(400).json({ error: p.error });
  try {
    const info = await db.insert(`INSERT INTO produtos (${COLUMNS}) VALUES (${PLACEHOLDERS})`, ...toParams(p));
    res.status(201).json({ id: info.lastInsertRowid, slug: p.slug, ok: true });
  } catch (e) {
    if (isUniqueViolation(e)) return res.status(409).json({ error: SLUG_EM_USO });
    throw e;
  }
});

router.put('/admin/:id', ...adminOnly, async (req, res) => {
  const old = await db.get('SELECT * FROM produtos WHERE id=?', req.params.id);
  if (!old) return res.status(404).json({ error: 'Produto não encontrado' });
  const p = clean(req.body || {}, old);
  if (p.error) return res.status(400).json({ error: p.error });
  const sets = COLUMNS.split(',').map((c) => `${c}=?`).join(',');
  try {
    await db.run(`UPDATE produtos SET ${sets},atualizado_em=? WHERE id=?`, ...toParams(p), db.now(), req.params.id);
    res.json({ ok: true, slug: p.slug });
  } catch (e) {
    if (isUniqueViolation(e)) return res.status(409).json({ error: SLUG_EM_USO });
    throw e;
  }
});

router.delete('/admin/:id', ...adminOnly, async (req, res) => {
  const info = await db.run('DELETE FROM produtos WHERE id=?', req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Produto não encontrado' });
  res.json({ ok: true });
});

// Público: produtos ativos (menus do site) e um produto pelo endereço.
router.get('/', async (_req, res) => {
  const rows = await db.all('SELECT * FROM produtos WHERE ativo=1 ORDER BY ' + ORDER_BY);
  res.json(rows.map((r) => resumo(fromRow(r))));
});

router.get('/:slug', async (req, res) => {
  const row = await db.get('SELECT * FROM produtos WHERE slug=? AND ativo=1', req.params.slug);
  if (!row) return res.status(404).json({ error: 'Produto não encontrado' });
  const { id, ativo, ordem, ...publico } = fromRow(row);
  res.json(publico);
});

module.exports = router;
