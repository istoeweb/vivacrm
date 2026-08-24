const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');
const { getPagination, wantsPagination, parsePremio } = require('../utils');

const router = express.Router();

function visibleWhere(req, alias = 'a') {
  if (req.user.role === 'admin') return '';
  return ` WHERE ${alias}.corretor_id = ` + Number(req.user.id);
}

router.get('/', auth, (req, res) => {
  const where = visibleWhere(req);
  if (wantsPagination(req)) {
    const { limit, page, offset } = getPagination(req);
    const total = db.prepare(`SELECT COUNT(*) AS n FROM apolices a ${where}`).get().n;
    const rows = db.prepare(`
      SELECT a.*, c.nome AS cliente_nome, u.nome AS corretor_nome
      FROM apolices a
      LEFT JOIN clientes c ON c.id = a.cliente_id
      LEFT JOIN usuarios u ON u.id = a.corretor_id
      ${where}
      ORDER BY a.criado_em DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);
    return res.json({ data: rows, total, page, limit });
  }
  const rows = db.prepare(`
    SELECT a.*, c.nome AS cliente_nome, u.nome AS corretor_nome
    FROM apolices a
    LEFT JOIN clientes c ON c.id = a.cliente_id
    LEFT JOIN usuarios u ON u.id = a.corretor_id
    ${where}
    ORDER BY a.criado_em DESC
  `).all();
  res.json(rows);
});

router.post('/', auth, (req, res) => {
  const {
    cliente_id, produto, seguradora, numero,
    vigencia_inicio, vigencia_fim, premio, status, corretor_id
  } = req.body || {};
  if (!cliente_id || !produto) return res.status(400).json({ error: 'cliente_id e produto obrigatórios' });
  const cid = (req.user.role !== 'admin') ? req.user.id : (corretor_id || req.user.id);
  const info = db.prepare(`
    INSERT INTO apolices
      (cliente_id, produto, seguradora, numero, vigencia_inicio, vigencia_fim, premio, status, corretor_id)
    VALUES (?,?,?,?,?,?,?,?,?)
  `).run(
    Number(cliente_id), String(produto).slice(0, 80),
    (seguradora || '').slice(0, 80) || null,
    (numero || '').slice(0, 60) || null,
    (vigencia_inicio || '').slice(0, 20) || null,
    (vigencia_fim || '').slice(0, 20) || null,
    parsePremio(premio),
    (status || 'ativa').slice(0, 20),
    cid
  );
  res.status(201).json({ id: info.lastInsertRowid });
});

router.put('/:id', auth, (req, res) => {
  const existing = db.prepare('SELECT * FROM apolices WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Apólice não encontrada' });
  if (req.user.role !== 'admin' && existing.corretor_id !== req.user.id) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  const b = req.body || {};
  const cid = (req.user.role !== 'admin') ? existing.corretor_id : (b.corretor_id ?? existing.corretor_id);
  db.prepare(`
    UPDATE apolices SET
      cliente_id=?, produto=?, seguradora=?, numero=?,
      vigencia_inicio=?, vigencia_fim=?, premio=?, status=?, corretor_id=?
    WHERE id=?
  `).run(
    b.cliente_id ?? existing.cliente_id,
    b.produto ?? existing.produto,
    b.seguradora ?? existing.seguradora,
    b.numero ?? existing.numero,
    b.vigencia_inicio ?? existing.vigencia_inicio,
    b.vigencia_fim ?? existing.vigencia_fim,
    b.premio === undefined ? existing.premio : parsePremio(b.premio),
    b.status ?? existing.status,
    cid,
    req.params.id
  );
  res.json({ ok: true });
});

router.delete('/:id', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    const a = db.prepare('SELECT corretor_id FROM apolices WHERE id = ?').get(req.params.id);
    if (!a) return res.status(404).json({ error: 'Apólice não encontrada' });
    if (a.corretor_id !== req.user.id) return res.status(403).json({ error: 'Acesso negado' });
  }
  const info = db.prepare('DELETE FROM apolices WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Apólice não encontrada' });
  res.json({ ok: true });
});

module.exports = router;