const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');
const { asyncRouter, getPagination, wantsPagination } = require('../utils');

const router = asyncRouter();

function visibleWhere(req, alias = 's') {
  if (req.user.role === 'admin') return '';
  return ` WHERE ${alias}.corretor_id = ` + Number(req.user.id);
}

router.get('/', auth, async (req, res) => {
  const where = visibleWhere(req);
  if (wantsPagination(req)) {
    const { limit, page, offset } = getPagination(req);
    const total = (await db.get(`SELECT COUNT(*) AS n FROM sinistros s ${where}`)).n;
    const rows = await db.all(`
      SELECT s.*, c.nome AS cliente_nome, a.numero AS apolice_numero, u.nome AS corretor_nome
      FROM sinistros s
      LEFT JOIN clientes c ON c.id = s.cliente_id
      LEFT JOIN apolices a ON a.id = s.apolice_id
      LEFT JOIN usuarios u ON u.id = s.corretor_id
      ${where}
      ORDER BY s.criado_em DESC
      LIMIT ? OFFSET ?
    `, limit, offset);
    return res.json({ data: rows, total, page, limit });
  }
  const rows = await db.all(`
    SELECT s.*, c.nome AS cliente_nome, a.numero AS apolice_numero, u.nome AS corretor_nome
    FROM sinistros s
    LEFT JOIN clientes c ON c.id = s.cliente_id
    LEFT JOIN apolices a ON a.id = s.apolice_id
    LEFT JOIN usuarios u ON u.id = s.corretor_id
    ${where}
    ORDER BY s.criado_em DESC
  `);
  res.json(rows);
});

router.post('/', auth, async (req, res) => {
  const { cliente_id, apolice_id, descricao, data_evento, status, corretor_id } = req.body || {};
  if (!cliente_id) return res.status(400).json({ error: 'cliente_id obrigatório' });
  const cid = (req.user.role !== 'admin') ? req.user.id : (corretor_id || req.user.id);
  const info = await db.insert(`
    INSERT INTO sinistros (cliente_id, apolice_id, descricao, data_evento, status, corretor_id)
    VALUES (?,?,?,?,?,?)
  `, 
    Number(cliente_id),
    apolice_id ? Number(apolice_id) : null,
    (descricao || '').slice(0, 1000) || null,
    (data_evento || '').slice(0, 20) || null,
    (status || 'aberto').slice(0, 20),
    cid
  );
  res.status(201).json({ id: info.lastInsertRowid });
});

router.put('/:id', auth, async (req, res) => {
  const existing = await db.get('SELECT * FROM sinistros WHERE id = ?', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Sinistro não encontrado' });
  if (req.user.role !== 'admin' && existing.corretor_id !== req.user.id) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  const b = req.body || {};
  const cid = (req.user.role !== 'admin') ? existing.corretor_id : (b.corretor_id ?? existing.corretor_id);
  await db.run(`
    UPDATE sinistros SET
      cliente_id=?, apolice_id=?, descricao=?, data_evento=?, status=?, corretor_id=?
    WHERE id=?
  `, 
    b.cliente_id ?? existing.cliente_id,
    b.apolice_id ?? existing.apolice_id,
    b.descricao ?? existing.descricao,
    b.data_evento ?? existing.data_evento,
    b.status ?? existing.status,
    cid,
    req.params.id
  );
  res.json({ ok: true });
});

router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    const s = await db.get('SELECT corretor_id FROM sinistros WHERE id = ?', req.params.id);
    if (!s) return res.status(404).json({ error: 'Sinistro não encontrado' });
    if (s.corretor_id !== req.user.id) return res.status(403).json({ error: 'Acesso negado' });
  }
  const info = await db.run('DELETE FROM sinistros WHERE id = ?', req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Sinistro não encontrado' });
  res.json({ ok: true });
});

module.exports = router;