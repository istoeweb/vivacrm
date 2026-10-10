const jwt = require('jsonwebtoken');
const db = require('../db');
const { auth, requireRole, SECRET } = require('../middleware/auth');
const { asyncRouter, idOr, parsePremio, isValidEmail, isValidPhone, isValidLeadStatus, getPagination, wantsPagination } = require('../utils');
const { getSettings } = require('../settings');
const { findOpenDuplicate, nextCorretor, notifyLead } = require('../lead-intake');

const router = asyncRouter();

// Corretor enxerga os próprios leads + a fila de captação (leads sem dono),
// que é justamente o que ele pode assumir via POST /:id/assumir.
function visibleWhere(req) {
  if (req.user.role === 'admin') return '';
  return ' WHERE (l.corretor_id = ' + Number(req.user.id) + ' OR l.corretor_id IS NULL)';
}

const clean = (v, max) => String(v ?? '').trim().slice(0, max) || null;
const LOST = ['desistiu', 'sem_interesse'];

// Usuário do CRM se a requisição trouxer um token válido; null = formulário público do site.
function optionalUser(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  try { return jwt.verify(header.slice(7), SECRET); } catch { return null; }
}

const baseUrl = (req) => (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');

const getLead = (id) => db.get(`
  SELECT l.*, u.nome AS corretor_nome FROM leads l LEFT JOIN usuarios u ON u.id = l.corretor_id WHERE l.id = ?
`, id);

/*
 * POST /api/leads
 * - Público (formulário do site): se o telefone já tem lead em aberto, o envio vira
 *   uma anotação no histórico desse lead; senão cria o lead, distribui pelo rodízio
 *   (se ligado) e avisa por e-mail os destinatários configurados no painel.
 * - Logado (CRM): cadastro manual, respeitando corretor, etapa e datas do formulário.
 */
router.post('/', async (req, res) => {
  const b = req.body || {};
  if (!b.nome || !b.telefone) return res.status(400).json({ error: 'Nome e telefone obrigatórios' });
  if (!isValidPhone(b.telefone)) return res.status(400).json({ error: 'Telefone inválido (informe DDD + número)' });
  if (b.email && !isValidEmail(b.email)) return res.status(400).json({ error: 'E-mail inválido' });
  const user = optionalUser(req);
  if (user && b.status && !isValidLeadStatus(b.status)) return res.status(400).json({ error: 'Status inválido' });

  const lead = {
    nome: clean(b.nome, 120), telefone: clean(b.telefone, 40), email: clean(b.email, 120),
    cidade: clean(b.cidade, 80), produto: clean(b.produto, 80), mensagem: clean(b.mensagem, 1000),
    origem: clean(b.origem, 40) || (user ? 'manual' : 'site'),
    origem_pagina: clean(b.origem_pagina, 200),
    utm_source: clean(b.utm_source, 80), utm_medium: clean(b.utm_medium, 80), utm_campaign: clean(b.utm_campaign, 120),
  };
  const settings = await getSettings();

  if (!user) {
    const dup = await findOpenDuplicate(lead.telefone);
    if (dup) {
      const detalhes = [lead.produto && `Produto: ${lead.produto}`, lead.mensagem && `Mensagem: ${lead.mensagem}`,
        lead.origem_pagina && `Página: ${lead.origem_pagina}`].filter(Boolean).join(' · ');
      await db.run('INSERT INTO lead_interacoes (lead_id, usuario_id, tipo, descricao) VALUES (?, NULL, ?, ?)',
        dup.id, 'nota', `Enviou o formulário do site novamente.${detalhes ? ` ${detalhes}` : ''}`);
      await db.run('UPDATE leads SET produto = COALESCE(produto, ?), atualizado_em = ? WHERE id = ?', lead.produto, db.now(), dup.id);
      const full = await getLead(dup.id);
      // O e-mail mostra o que a pessoa acabou de enviar, sobre os dados já cadastrados.
      const sent = { produto: lead.produto, mensagem: lead.mensagem, origem_pagina: lead.origem_pagina };
      for (const k of Object.keys(sent)) if (!sent[k]) delete sent[k];
      await notifyLead({ lead: { ...full, ...sent }, duplicate: true, baseUrl: baseUrl(req), settings });
      return res.status(201).json({ id: dup.id, ok: true });
    }
  }

  const status = user && b.status ? b.status : 'novo';
  const corretorId = user
    ? (user.role === 'admin' ? idOr(b.corretor_id, null) : user.id)
    : await nextCorretor(settings);
  const date = (v) => (user ? clean(String(v ?? '').replace('T', ' '), 16) : null);

  const info = await db.insert(`
    INSERT INTO leads (nome, telefone, email, cidade, produto, mensagem, origem, origem_pagina,
      utm_source, utm_medium, utm_campaign, status, corretor_id, valor_estimado, ultimo_contato, proximo_retorno)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, lead.nome, lead.telefone, lead.email, lead.cidade, lead.produto, lead.mensagem, lead.origem, lead.origem_pagina,
    lead.utm_source, lead.utm_medium, lead.utm_campaign, status, corretorId,
    user ? parsePremio(b.valor_estimado) : null, date(b.ultimo_contato), date(b.proximo_retorno));

  if (!user) await notifyLead({ lead: await getLead(info.lastInsertRowid), baseUrl: baseUrl(req), settings });
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
    status, corretor_id, ultimo_contato, proximo_retorno, valor_estimado, motivo_perda
  } = req.body || {};

  if (status !== undefined && status !== null && !isValidLeadStatus(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }
  const nextStatus = status ?? existing.status;
  const motivo = lossReason(existing, nextStatus, motivo_perda);
  if (motivo.error) return res.status(400).json({ error: motivo.error });

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
    status: nextStatus,
    corretor_id: idOr(corretor_id, existing.corretor_id),
    ultimo_contato: cleanDate(ultimo_contato, existing.ultimo_contato),
    proximo_retorno: cleanDate(proximo_retorno, existing.proximo_retorno),
    valor_estimado: valor_estimado === undefined ? existing.valor_estimado : parsePremio(valor_estimado),
    motivo_perda: motivo.value,
  };

  if (req.user.role !== 'admin' && next.corretor_id !== req.user.id && next.corretor_id !== existing.corretor_id) {
    return res.status(403).json({ error: 'Não é possível reatribuir lead' });
  }

  await db.run(`
    UPDATE leads SET
      nome=?, telefone=?, email=?, cidade=?, produto=?, mensagem=?,
      status=?, corretor_id=?, ultimo_contato=?, proximo_retorno=?, valor_estimado=?, motivo_perda=?, atualizado_em=?
    WHERE id=?
  `, next.nome, next.telefone, next.email, next.cidade, next.produto, next.mensagem,
         next.status, next.corretor_id, next.ultimo_contato, next.proximo_retorno,
         next.valor_estimado, next.motivo_perda, db.now(), req.params.id);
  if (next.status !== existing.status) await logStatus(existing.id, req.user.id, existing.status, next.status, next.motivo_perda);

  res.json({ ok: true });
});

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  const info = await db.run('DELETE FROM leads WHERE id = ?', req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Lead não encontrado' });
  res.json({ ok: true });
});

/*
 * Histórico de atendimento do lead. Contatos (ligação, WhatsApp...) atualizam o
 * "último contato"; mudanças de status entram automaticamente como tipo 'status'.
 */
const CONTACT_TYPES = ['ligacao', 'whatsapp', 'email', 'reuniao', 'proposta'];
const STATUS_LABELS = {
  novo: 'Novo', contato_realizado: 'Contato realizado', proposta_enviada: 'Proposta enviada',
  aguardando_retorno: 'Aguardando retorno', fechado: 'Fechado', desistiu: 'Desistiu', sem_interesse: 'Não tem interesse',
};

// Hora local de Brasília, no mesmo formato dos campos datetime-local do CRM.
const localNow = () => new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 16);

const canAccess = (req, lead) =>
  req.user.role === 'admin' || lead.corretor_id === null || lead.corretor_id === req.user.id;

function logStatus(leadId, userId, from, to, motivo) {
  return db.run('INSERT INTO lead_interacoes (lead_id, usuario_id, tipo, descricao) VALUES (?, ?, ?, ?)',
    leadId, userId, 'status', `${STATUS_LABELS[from] || from} → ${STATUS_LABELS[to] || to}${LOST.includes(to) && motivo ? ` (motivo: ${motivo})` : ''}`);
}

/*
 * Motivo da perda: obrigatório ao entrar em Desistiu/Não tem interesse; mantido
 * enquanto o lead segue perdido; limpo quando ele volta ao funil.
 */
function lossReason(lead, nextStatus, input) {
  if (!LOST.includes(nextStatus)) return { value: null };
  const informed = clean(input, 120);
  const previous = LOST.includes(lead.status) ? lead.motivo_perda : null;
  if (nextStatus !== lead.status && !informed && !previous) return { error: 'Informe o motivo da perda' };
  return { value: informed || previous };
}

router.get('/:id/interacoes', auth, async (req, res) => {
  const lead = await db.get('SELECT id, corretor_id FROM leads WHERE id = ?', req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead não encontrado' });
  if (!canAccess(req, lead)) return res.status(403).json({ error: 'Acesso negado' });
  res.json(await db.all(`
    SELECT i.id, i.tipo, i.descricao, i.criado_em, u.nome AS usuario_nome
    FROM lead_interacoes i LEFT JOIN usuarios u ON u.id = i.usuario_id
    WHERE i.lead_id = ?
    ORDER BY i.criado_em DESC, i.id DESC
  `, lead.id));
});

// Registra um contato/anotação. Body: { tipo, descricao, status?, proximo_retorno? }
router.post('/:id/interacoes', auth, async (req, res) => {
  const lead = await db.get('SELECT * FROM leads WHERE id = ?', req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead não encontrado' });
  if (!canAccess(req, lead)) return res.status(403).json({ error: 'Acesso negado' });

  const { tipo, descricao, status, proximo_retorno, motivo_perda } = req.body || {};
  if (tipo !== 'nota' && !CONTACT_TYPES.includes(tipo)) return res.status(400).json({ error: 'Tipo de interação inválido' });
  const texto = String(descricao || '').trim().slice(0, 2000);
  if (!texto) return res.status(400).json({ error: 'Descreva o contato ou a anotação' });
  if (status && !isValidLeadStatus(status)) return res.status(400).json({ error: 'Status inválido' });

  const isContact = CONTACT_TYPES.includes(tipo);
  // Primeiro contato tira o lead de "Novo" automaticamente.
  const nextStatus = status || (isContact && lead.status === 'novo' ? 'contato_realizado' : lead.status);
  // Corretor que atende um lead da fila passa a ser o dono (evita dois corretores no mesmo lead).
  const motivo = lossReason(lead, nextStatus, motivo_perda);
  if (motivo.error) return res.status(400).json({ error: motivo.error });
  const owner = lead.corretor_id ?? (req.user.role === 'admin' ? null : req.user.id);
  const retorno = proximo_retorno === undefined
    ? lead.proximo_retorno
    : (String(proximo_retorno || '').trim().replace('T', ' ').slice(0, 16) || null);

  await db.run('INSERT INTO lead_interacoes (lead_id, usuario_id, tipo, descricao) VALUES (?, ?, ?, ?)',
    lead.id, req.user.id, tipo, texto);
  await db.run(`
    UPDATE leads SET status = ?, corretor_id = ?, ultimo_contato = ?, proximo_retorno = ?, motivo_perda = ?, atualizado_em = ?
    WHERE id = ?
  `, nextStatus, owner, isContact ? localNow() : lead.ultimo_contato, retorno, motivo.value, db.now(), lead.id);
  if (nextStatus !== lead.status) await logStatus(lead.id, req.user.id, lead.status, nextStatus, motivo.value);

  res.status(201).json({ ok: true, status: nextStatus, corretor_id: owner });
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