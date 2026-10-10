const express = require('express');
const db = require('../db');
const { auth, requireRole } = require('../middleware/auth');
const { asyncRouter, isValidEmail, isValidPhone, isValidLeadStatus, getPagination, wantsPagination } = require('../utils');

const router = asyncRouter();

// Corretor enxerga os próprios leads + a fila de captação (leads sem dono),
// que é justamente o que ele pode assumir via POST /:id/assumir.
function visibleWhere(req) {
  if (req.user.role === 'admin') return '';
  return ' WHERE (l.corretor_id = ' + Number(req.user.id) + ' OR l.corretor_id IS NULL)';
}

// POST público — usado pelo formulário do site (sem auth)
router.post('/', async (req, res) => {
  const { nome, telefone, email, cidade, produto, mensagem, origem } = req.body || {};
  if (!nome || !telefone) return res.status(400).json({ error: 'Nome e telefone obrigatórios' });
  if (!isValidPhone(telefone)) return res.status(400).json({ error: 'Telefone inválido (informe DDD + número)' });
  if (email && !isValidEmail(email)) return res.status(400).json({ error: 'E-mail inválido' });

  const info = await db.insert(`
    INSERT INTO leads (nome, telefone, email, cidade, produto, mensagem, origem, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'novo')
  `,
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
router.get('/', auth, async (req, res) => {
  const where = visibleWhere(req);
  if (wantsPagination(req)) {
    const { limit, page, offset } = getPagination(req);
    const total = (await db.get(`SELECT COUNT(*) AS n FROM leads l ${where}`)).n;
    const rows = await db.all(`
      SELECT l.*, u.nome AS corretor_nome
      FROM leads l LEFT JOIN usuarios u ON u.id = l.corretor_id
      ${where}
      ORDER BY l.criado_em DESC
      LIMIT ? OFFSET ?
    `, limit, offset);
    return res.json({ data: rows, total, page, limit });
  }
  const rows = await db.all(`
    SELECT l.*, u.nome AS corretor_nome
    FROM leads l LEFT JOIN usuarios u ON u.id = l.corretor_id
    ${where}
    ORDER BY l.criado_em DESC
  `);
  res.json(rows);
});

router.get('/:id', auth, async (req, res) => {
  const row = await db.get(`
    SELECT l.*, u.nome AS corretor_nome
    FROM leads l LEFT JOIN usuarios u ON u.id = l.corretor_id
    WHERE l.id = ?
  `, req.params.id);
  if (!row) return res.status(404).json({ error: 'Lead não encontrado' });
  // Leads sem dono ficam visíveis a qualquer corretor (fila de captação).
  if (req.user.role !== 'admin' && row.corretor_id !== null && row.corretor_id !== req.user.id) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  res.json(row);
});

router.put('/:id', auth, async (req, res) => {
  const existing = await db.get('SELECT * FROM leads WHERE id = ?', req.params.id);
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

  await db.run(`
    UPDATE leads SET
      nome=?, telefone=?, email=?, cidade=?, produto=?, mensagem=?,
      status=?, corretor_id=?, ultimo_contato=?, proximo_retorno=?, atualizado_em=?
    WHERE id=?
  `, next.nome, next.telefone, next.email, next.cidade, next.produto, next.mensagem,
         next.status, next.corretor_id, next.ultimo_contato, next.proximo_retorno, db.now(), req.params.id);

  res.json({ ok: true });
});

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  const info = await db.run('DELETE FROM leads WHERE id = ?', req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Lead não encontrado' });
  res.json({ ok: true });
});

// Corretor assume um lead sem dono (ou admin atribui a si). Idempotente para o próprio dono.
router.post('/:id/assumir', auth, async (req, res) => {
  const lead = await db.get('SELECT * FROM leads WHERE id = ?', req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead não encontrado' });
  if (lead.corretor_id && lead.corretor_id !== req.user.id) {
    return res.status(409).json({ error: 'Lead já atribuído a outro corretor' });
  }
  await db.run("UPDATE leads SET corretor_id = ?, atualizado_em = ? WHERE id = ?", req.user.id, db.now(), req.params.id);
  res.json({ ok: true, corretor_id: req.user.id });
});

module.exports = router;