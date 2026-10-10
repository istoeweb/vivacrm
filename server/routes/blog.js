const db = require('../db');
const { asyncRouter } = require('../utils');
const { saveBlogImage } = require('../storage');
const crypto = require('crypto');

// SQLite: 'UNIQUE constraint failed'; Postgres: código 23505.
const isUniqueViolation = (e) => e.code === '23505' || String(e.message).includes('UNIQUE');
const { auth, requireRole } = require('../middleware/auth');

const router = asyncRouter();
const adminOnly = [auth, requireRole('admin')];

function slugify(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 140);
}

function clean(body, existing = {}) {
  const titulo = String(body.titulo ?? existing.titulo ?? '').trim().slice(0, 180);
  const conteudo = String(body.conteudo ?? existing.conteudo ?? '').trim().slice(0, 100000);
  const slug = slugify(body.slug || existing.slug || titulo);
  const status = body.status === 'publicado' ? 'publicado' : 'rascunho';
  if (!titulo || !conteudo || !slug) return { error: 'Título e conteúdo são obrigatórios' };
  const rawKeywords = body.palavras_chave ?? existing.palavras_chave ?? '';
  const palavras_chave = String(rawKeywords)
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)
    .filter((k, i, arr) => arr.findIndex((o) => o.toLowerCase() === k.toLowerCase()) === i)
    .slice(0, 15)
    .join(', ')
    .slice(0, 300) || null;
  return {
    titulo, conteudo, slug, status, palavras_chave,
    resumo: String(body.resumo ?? existing.resumo ?? '').trim().slice(0, 500) || null,
    categoria: String(body.categoria ?? existing.categoria ?? '').trim().slice(0, 80) || null,
    imagem_url: String(body.imagem_url ?? existing.imagem_url ?? '').trim().slice(0, 500) || null,
  };
}

router.get('/admin', ...adminOnly, async (_req, res) => {
  res.json(await db.all(`SELECT p.*, u.nome autor_nome FROM blog_posts p LEFT JOIN usuarios u ON u.id=p.autor_id ORDER BY p.criado_em DESC`));
});

router.get('/admin/:id', ...adminOnly, async (req, res) => {
  const row = await db.get('SELECT * FROM blog_posts WHERE id=?', req.params.id);
  if (!row) return res.status(404).json({ error: 'Artigo não encontrado' });
  res.json(row);
});

router.post('/admin/upload', ...adminOnly, async (req, res) => {
  const { data, type } = req.body || {};
  const allowed = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
  const ext = allowed[type];
  if (!ext || typeof data !== 'string') return res.status(400).json({ error: 'Envie uma imagem JPG, PNG ou WebP' });
  let buffer;
  try { buffer = Buffer.from(data.replace(/^data:[^;]+;base64,/, ''), 'base64'); } catch { return res.status(400).json({ error: 'Imagem inválida' }); }
  if (!buffer.length || buffer.length > 5 * 1024 * 1024) return res.status(400).json({ error: 'A imagem deve ter no máximo 5 MB' });
  const signatures = {
    jpg: buffer[0] === 0xff && buffer[1] === 0xd8,
    png: buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])),
    webp: buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP',
  };
  if (!signatures[ext]) return res.status(400).json({ error: 'O conteúdo do arquivo não corresponde ao formato informado' });
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
  const url = await saveBlogImage(filename, buffer, type);
  res.status(201).json({ ok: true, url });
});

router.post('/admin', ...adminOnly, async (req, res) => {
  const p = clean(req.body || {});
  if (p.error) return res.status(400).json({ error: p.error });
  try {
    const published = p.status === 'publicado' ? new Date().toISOString() : null;
    const info = await db.insert(`INSERT INTO blog_posts (titulo,slug,resumo,conteudo,categoria,imagem_url,palavras_chave,status,autor_id,publicado_em) VALUES (?,?,?,?,?,?,?,?,?,?)`, p.titulo,p.slug,p.resumo,p.conteudo,p.categoria,p.imagem_url,p.palavras_chave,p.status,req.user.id,published);
    res.status(201).json({ id: info.lastInsertRowid, ok: true });
  } catch (e) {
    if (isUniqueViolation(e)) return res.status(409).json({ error: 'Já existe um artigo com esse endereço' });
    throw e;
  }
});

router.put('/admin/:id', ...adminOnly, async (req, res) => {
  const old = await db.get('SELECT * FROM blog_posts WHERE id=?', req.params.id);
  if (!old) return res.status(404).json({ error: 'Artigo não encontrado' });
  const p = clean(req.body || {}, old);
  if (p.error) return res.status(400).json({ error: p.error });
  const published = p.status === 'publicado' ? (old.publicado_em || new Date().toISOString()) : null;
  try {
    await db.run(`UPDATE blog_posts SET titulo=?,slug=?,resumo=?,conteudo=?,categoria=?,imagem_url=?,palavras_chave=?,status=?,publicado_em=?,atualizado_em=? WHERE id=?`, p.titulo,p.slug,p.resumo,p.conteudo,p.categoria,p.imagem_url,p.palavras_chave,p.status,published,db.now(),req.params.id);
    res.json({ ok: true });
  } catch (e) {
    if (isUniqueViolation(e)) return res.status(409).json({ error: 'Já existe um artigo com esse endereço' });
    throw e;
  }
});

router.delete('/admin/:id', ...adminOnly, async (req, res) => {
  const info = await db.run('DELETE FROM blog_posts WHERE id=?', req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Artigo não encontrado' });
  res.json({ ok: true });
});

router.get('/', async (req, res) => {
  const category = String(req.query.categoria || '').trim();
  const rows = category
    ? await db.all(`SELECT p.id,p.titulo,p.slug,p.resumo,p.categoria,p.imagem_url,p.publicado_em,u.nome autor_nome FROM blog_posts p LEFT JOIN usuarios u ON u.id=p.autor_id WHERE p.status='publicado' AND p.categoria=? ORDER BY p.publicado_em DESC`, category)
    : await db.all(`SELECT p.id,p.titulo,p.slug,p.resumo,p.categoria,p.imagem_url,p.publicado_em,u.nome autor_nome FROM blog_posts p LEFT JOIN usuarios u ON u.id=p.autor_id WHERE p.status='publicado' ORDER BY p.publicado_em DESC`);
  res.json(rows);
});

router.get('/:slug', async (req, res) => {
  const row = await db.get(`SELECT p.*,u.nome autor_nome FROM blog_posts p LEFT JOIN usuarios u ON u.id=p.autor_id WHERE p.slug=? AND p.status='publicado'`, req.params.slug);
  if (!row) return res.status(404).json({ error: 'Artigo não encontrado' });
  res.json(row);
});

module.exports = router;
