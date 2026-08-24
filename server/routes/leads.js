const express = require('express');
const db = require('../db');
const { auth, requireRole } = require('../middleware/auth');
const { isValidEmail, isValidPhone, isValidLeadStatus, getPagination, wantsPagination } = require('../utils');

const router = express.Router();

function visibleWhere(req) {
  if (req.user.role === 'admin') return '';
  return ' WHERE corretor_id = ' + Number(req.user.id);
}

// POST público — usado pelo formulário do site (sem auth)
router.post('/', (req, res) => {
  const { nome, telefone, email, cidade, produto, mensagem, origem } = req.body || {};
  if (!nome || !telefone) return res.status(400).json({ error: 'Nome e telefone obrigatórios' });
  if (!isValidPhone(telefone)) return res.status(400).json({ error: 'Telefone inválido (informe DDD + número)' });
  if (email && !isValidEmail(email)) return res.status(400).json({ error: 'E-mail inválido' });

  const stmt = db.prepare(`
    INSERT INTO leads (nome, telefone, email, cidade, produto, mensagem, origem, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'novo')
  `);
  const info = stmt.run(
    String(nome).trim().slice(0, 120),
    String(telefone).trim().slice(0, 40),
    (email || '').trim().slice(0, 120) || null,
    (cidade || '').trim().slice(0, 80) || null,
    (produto || '').trim().slice(0, 80) || null,
    (mensagem || '').trim().slice(0, 1000) || null,
    (origem || 'site').trim().slice(0, 40)
  );
  res.status(201).json({ id: info.lastInsertRowid, ok: true });
});

// Listar leads (auth) — admin vê todos, corretor vê só os seus
router.get('/', auth, (req, res) => {
  const where = visibleWhere(req);
  if (wantsPagination(req)) {
    const { limit, page, offset } = getPagination(req);
    const total = db.prepare(`SELECT COUNT(*) AS n FROM leads l ${where}`).get().n;
    const rows = db.prepare(`
      SELECT l.*, u.nome AS corretor_nome
      FROM leads l LEFT JOIN usuarios u ON u.id = l.corretor_id
      ${where}
      ORDER BY l.criado_em DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);
    return res.json({ data: rows, total, page, limit });
  }
  const rows = db.prepare(`
    SELECT l.*, u.nome AS corretor_nome
    FROM leads l LEFT JOIN usuarios u ON u.id = l.corretor_id
    ${where}
    ORDER BY l.criado_em DESC
  `).all();
  res.json(rows);
});

router.get('/:id', auth, (req, res) => {
  const row = db.prepare(`
    SELECT l.*, u.nome AS corretor_nome
    FROM leads l LEFT JOIN usuarios u ON u.id = l.corretor_id
    WHERE l.id = ?
  `).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Lead não encontrado' });
  if (req.user.role !== 'admin' && row.corretor_id !== req.user.id) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  res.json(row);
});

router.put('/:id', auth, (req, res) => {
  const existing = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Lead não encontrado' });
  if (req.user.role !== 'admin' && existing.corretor_id !== req.user.id && existing.corretor_id !== null) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  const {
    nome, telefone, email, cidade, produto, mensagem,
    status, corretor_id, ultimo_contato, proximo_retorno
  } = req.body || {};

  if (status !== undefined && status !== null && !isValidLeadStatus(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }

  const cleanDate = (v, fallback) => {
    if (v === undefined) return fallback;
    const s = (v || '').toString().trim();
    return s ? s.slice(0, 16) : null;
  };

  const next = {
    nome: nome ?? existing.nome,
    telefone: telefone ?? existing.telefone,
    email: email ?? existing.email,
    cidade: cidade ?? existing.cidade,
    produto: produto ?? existing.produto,
    mensagem: mensagem ?? existing.mensagem,
    status: status ?? existing.status,
    corretor_id: corretor_id === undefined ? existing.corretor_id : corretor_id,
    ultimo_contato: cleanDate(ultimo_contato, existing.ultimo_contato),
    proximo_retorno: cleanDate(proximo_retorno, existing.proximo_retorno)
  };

  if (req.user.role !== 'admin' && next.corretor_id !== req.user.id && next.corretor_id !== existing.corretor_id) {
    return res.status(403).json({ error: 'Não é possível reatribuir lead' });
  }

  db.prepare(`
    UPDATE leads SET
      nome=?, telefone=?, email=?, cidade=?, produto=?, mensagem=?,
      status=?, corretor_id=?, ultimo_contato=?, proximo_retorno=?, atualizado_em=datetime('now')
    WHERE id=?
  `).run(next.nome, next.telefone, next.email, next.cidade, next.produto, next.mensagem,
         next.status, next.corretor_id, next.ultimo_contato, next.proximo_retorno, req.params.id);

  res.json({ ok: true });
});

router.delete('/:id', auth, requireRole('admin'), (req, res) => {
  const info = db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Lead não encontrado' });
  res.json({ ok: true });
});

// Corretor assume um lead sem dono (ou admin atribui a si). Idempotente para o próprio dono.
router.post('/:id/assumir', auth, (req, res) => {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead não encontrado' });
  if (lead.corretor_id && lead.corretor_id !== req.user.id) {
    return res.status(409).json({ error: 'Lead já atribuído a outro corretor' });
  }
  db.prepare("UPDATE leads SET corretor_id = ?, atualizado_em = datetime('now') WHERE id = ?")
    .run(req.user.id, req.params.id);
  res.json({ ok: true, corretor_id: req.user.id });
});

module.exports = router;