const express = require('express');
const db = require('../db');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();
const adminOnly = [auth, requireRole('admin')];

function slugify(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 140);
}

function clean(body, existing = {}) {
  const titulo = String(body.titulo ?? existing.titulo ?? '').trim().slice(0, 180);
  const conteudo = String(body.conteudo ?? existing.conteudo ?? '').trim().slice(0, 100000);
  const slug = slugify(body.slug || titulo || existing.slug);
  const status = body.status === 'publicado' ? 'publicado' : 'rascunho';
  if (!titulo || !conteudo || !slug) return { error: 'Título e conteúdo são obrigatórios' };
  return {
    titulo, conteudo, slug, status,
    resumo: String(body.resumo ?? existing.resumo ?? '').trim().slice(0, 500) || null,
    categoria: String(body.categoria ?? existing.categoria ?? '').trim().slice(0, 80) || null,
    imagem_url: String(body.imagem_url ?? existing.imagem_url ?? '').trim().slice(0, 500) || null,
  };
}

router.get('/admin', ...adminOnly, (_req, res) => {
  res.json(db.prepare(`SELECT p.*, u.nome autor_nome FROM blog_posts p LEFT JOIN usuarios u ON u.id=p.autor_id ORDER BY p.criado_em DESC`).all());
});

router.get('/admin/:id', ...adminOnly, (req, res) => {
  const row = db.prepare('SELECT * FROM blog_posts WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Artigo não encontrado' });
  res.json(row);
});

router.post('/admin/upload', ...adminOnly, (req, res) => {
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
  const dir = path.join(__dirname, '..', '..', 'assets', 'img', 'blog');
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(dir, filename), buffer, { flag: 'wx' });
  res.status(201).json({ ok: true, url: `assets/img/blog/${filename}` });
});

router.post('/admin', ...adminOnly, (req, res) => {
  const p = clean(req.body || {});
  if (p.error) return res.status(400).json({ error: p.error });
  try {
    const published = p.status === 'publicado' ? new Date().toISOString() : null;
    const info = db.prepare(`INSERT INTO blog_posts (titulo,slug,resumo,conteudo,categoria,imagem_url,status,autor_id,publicado_em) VALUES (?,?,?,?,?,?,?,?,?)`)
      .run(p.titulo,p.slug,p.resumo,p.conteudo,p.categoria,p.imagem_url,p.status,req.user.id,published);
    res.status(201).json({ id: info.lastInsertRowid, ok: true });
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) return res.status(409).json({ error: 'Já existe um artigo com esse endereço' });
    throw e;
  }
});

router.put('/admin/:id', ...adminOnly, (req, res) => {
  const old = db.prepare('SELECT * FROM blog_posts WHERE id=?').get(req.params.id);
  if (!old) return res.status(404).json({ error: 'Artigo não encontrado' });
  const p = clean(req.body || {}, old);
  if (p.error) return res.status(400).json({ error: p.error });
  const published = p.status === 'publicado' ? (old.publicado_em || new Date().toISOString()) : null;
  try {
    db.prepare(`UPDATE blog_posts SET titulo=?,slug=?,resumo=?,conteudo=?,categoria=?,imagem_url=?,status=?,publicado_em=?,atualizado_em=datetime('now') WHERE id=?`)
      .run(p.titulo,p.slug,p.resumo,p.conteudo,p.categoria,p.imagem_url,p.status,published,req.params.id);
    res.json({ ok: true });
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) return res.status(409).json({ error: 'Já existe um artigo com esse endereço' });
    throw e;
  }
});

router.delete('/admin/:id', ...adminOnly, (req, res) => {
  const info = db.prepare('DELETE FROM blog_posts WHERE id=?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Artigo não encontrado' });
  res.json({ ok: true });
});

router.get('/', (req, res) => {
  const category = String(req.query.categoria || '').trim();
  const rows = category
    ? db.prepare(`SELECT p.id,p.titulo,p.slug,p.resumo,p.categoria,p.imagem_url,p.publicado_em,u.nome autor_nome FROM blog_posts p LEFT JOIN usuarios u ON u.id=p.autor_id WHERE p.status='publicado' AND p.categoria=? ORDER BY p.publicado_em DESC`).all(category)
    : db.prepare(`SELECT p.id,p.titulo,p.slug,p.resumo,p.categoria,p.imagem_url,p.publicado_em,u.nome autor_nome FROM blog_posts p LEFT JOIN usuarios u ON u.id=p.autor_id WHERE p.status='publicado' ORDER BY p.publicado_em DESC`).all();
  res.json(rows);
});

router.get('/:slug', (req, res) => {
  const row = db.prepare(`SELECT p.*,u.nome autor_nome FROM blog_posts p LEFT JOIN usuarios u ON u.id=p.autor_id WHERE p.slug=? AND p.status='publicado'`).get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Artigo não encontrado' });
  res.json(row);
});

module.exports = router;
