const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');
const { getPagination, wantsPagination } = require('../utils');

const router = express.Router();

function visibleWhere(req, alias = 'g') {
  if (req.user.role === 'admin') return '';
  return ` WHERE ${alias}.corretor_id = ` + Number(req.user.id);
}

router.get('/', auth, (req, res) => {
  const where = visibleWhere(req);
  if (wantsPagination(req)) {
    const { limit, page, offset } = getPagination(req);
    const total = db.prepare(`SELECT COUNT(*) AS n FROM agendamentos g ${where}`).get().n;
    const rows = db.prepare(`
      SELECT g.*,
        c.nome AS cliente_nome,
        l.nome AS lead_nome,
        u.nome AS corretor_nome
      FROM agendamentos g
      LEFT JOIN clientes c ON c.id = g.cliente_id
      LEFT JOIN leads l    ON l.id = g.lead_id
      LEFT JOIN usuarios u ON u.id = g.corretor_id
      ${where}
      ORDER BY g.data_hora ASC
      LIMIT ? OFFSET ?
    `).all(limit, offset);
    return res.json({ data: rows, total, page, limit });
  }
  const rows = db.prepare(`
    SELECT g.*,
      c.nome AS cliente_nome,
      l.nome AS lead_nome,
      u.nome AS corretor_nome
    FROM agendamentos g
    LEFT JOIN clientes c ON c.id = g.cliente_id
    LEFT JOIN leads l    ON l.id = g.lead_id
    LEFT JOIN usuarios u ON u.id = g.corretor_id
    ${where}
    ORDER BY g.data_hora ASC
  `).all();
  res.json(rows);
});

router.post('/', auth, (req, res) => {
  const { cliente_id, lead_id, data_hora, titulo, observacao, status, corretor_id } = req.body || {};
  if (!data_hora || !titulo) return res.status(400).json({ error: 'data_hora e titulo obrigatórios' });
  const cid = (req.user.role !== 'admin') ? req.user.id : (corretor_id || req.user.id);
  const info = db.prepare(`
    INSERT INTO agendamentos (cliente_id, lead_id, corretor_id, data_hora, titulo, observacao, status)
    VALUES (?,?,?,?,?,?,?)
  `).run(
    cliente_id ? Number(cliente_id) : null,
    lead_id ? Number(lead_id) : null,
    cid,
    String(data_hora).slice(0, 20),
    String(titulo).slice(0, 120),
    (observacao || '').slice(0, 1000) || null,
    (status || 'pendente').slice(0, 20)
  );
  res.status(201).json({ id: info.lastInsertRowid });
});

router.put('/:id', auth, (req, res) => {
  const existing = db.prepare('SELECT * FROM agendamentos WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Agendamento não encontrado' });
  if (req.user.role !== 'admin' && existing.corretor_id !== req.user.id) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  const b = req.body || {};
  db.prepare(`
    UPDATE agendamentos SET
      cliente_id=?, lead_id=?, data_hora=?, titulo=?, observacao=?, status=?
    WHERE id=?
  `).run(
    b.cliente_id ?? existing.cliente_id,
    b.lead_id ?? existing.lead_id,
    b.data_hora ?? existing.data_hora,
    b.titulo ?? existing.titulo,
    b.observacao ?? existing.observacao,
    b.status ?? existing.status,
    req.params.id
  );
  res.json({ ok: true });
});

router.delete('/:id', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    const g = db.prepare('SELECT corretor_id FROM agendamentos WHERE id = ?').get(req.params.id);
    if (!g) return res.status(404).json({ error: 'Agendamento não encontrado' });
    if (g.corretor_id !== req.user.id) return res.status(403).json({ error: 'Acesso negado' });
  }
  const info = db.prepare('DELETE FROM agendamentos WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Agendamento não encontrado' });
  res.json({ ok: true });
});

module.exports = router;