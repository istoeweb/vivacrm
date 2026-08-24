const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');
const { getPagination, wantsPagination } = require('../utils');

const router = express.Router();

function visibleWhere(req, alias = 'c') {
  if (req.user.role === 'admin') return '';
  return ` WHERE ${alias}.corretor_id = ` + Number(req.user.id);
}

router.get('/', auth, (req, res) => {
  const where = visibleWhere(req);
  if (wantsPagination(req)) {
    const { limit, page, offset } = getPagination(req);
    const total = db.prepare(`SELECT COUNT(*) AS n FROM clientes c ${where}`).get().n;
    const rows = db.prepare(`
      SELECT c.*, u.nome AS corretor_nome
      FROM clientes c LEFT JOIN usuarios u ON u.id = c.corretor_id
      ${where}
      ORDER BY c.criado_em DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);
    return res.json({ data: rows, total, page, limit });
  }
  const rows = db.prepare(`
    SELECT c.*, u.nome AS corretor_nome
    FROM clientes c LEFT JOIN usuarios u ON u.id = c.corretor_id
    ${where}
    ORDER BY c.criado_em DESC
  `).all();
  res.json(rows);
});

router.get('/:id', auth, (req, res) => {
  const row = db.prepare(`
    SELECT c.*, u.nome AS corretor_nome
    FROM clientes c LEFT JOIN usuarios u ON u.id = c.corretor_id
    WHERE c.id = ?
  `).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Cliente não encontrado' });
  if (req.user.role !== 'admin' && row.corretor_id !== req.user.id) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  res.json(row);
});

router.post('/', auth, (req, res) => {
  const { nome, cpf_cnpj, telefone, email, cidade, endereco, corretor_id } = req.body || {};
  if (!nome) return res.status(400).json({ error: 'Nome obrigatório' });
  const cid = (req.user.role !== 'admin') ? req.user.id : (corretor_id || req.user.id);
  const info = db.prepare(`
    INSERT INTO clientes (nome, cpf_cnpj, telefone, email, cidade, endereco, corretor_id)
    VALUES (?,?,?,?,?,?,?)
  `).run(String(nome).slice(0,120), (cpf_cnpj||'').slice(0,20) || null,
         (telefone||'').slice(0,40) || null, (email||'').slice(0,120) || null,
         (cidade||'').slice(0,80) || null, (endereco||'').slice(0,200) || null,
         cid);
  res.status(201).json({ id: info.lastInsertRowid });
});

router.put('/:id', auth, (req, res) => {
  const existing = db.prepare('SELECT * FROM clientes WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Cliente não encontrado' });
  if (req.user.role !== 'admin' && existing.corretor_id !== req.user.id) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  const { nome, cpf_cnpj, telefone, email, cidade, endereco, corretor_id } = req.body || {};
  db.prepare(`
    UPDATE clientes SET
      nome=?, cpf_cnpj=?, telefone=?, email=?, cidade=?, endereco=?,
      corretor_id=?, atualizado_em=datetime('now')
    WHERE id=?
  `).run(
    nome ?? existing.nome,
    cpf_cnpj ?? existing.cpf_cnpj,
    telefone ?? existing.telefone,
    email ?? existing.email,
    cidade ?? existing.cidade,
    endereco ?? existing.endereco,
    (req.user.role !== 'admin') ? existing.corretor_id : (corretor_id ?? existing.corretor_id),
    req.params.id
  );
  res.json({ ok: true });
});

router.delete('/:id', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    const c = db.prepare('SELECT corretor_id FROM clientes WHERE id = ?').get(req.params.id);
    if (!c) return res.status(404).json({ error: 'Cliente não encontrado' });
    if (c.corretor_id !== req.user.id) return res.status(403).json({ error: 'Acesso negado' });
  }
  const info = db.prepare('DELETE FROM clientes WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
  res.json({ ok: true });
});

module.exports = router;