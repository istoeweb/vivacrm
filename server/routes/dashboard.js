const db = require('../db');
const { asyncRouter } = require('../utils');
const { auth } = require('../middleware/auth');

const router = asyncRouter();

router.get('/', auth, async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const cond = (alias) => (isAdmin ? '' : ` WHERE ${alias}.corretor_id = ` + Number(req.user.id));

  // Limites de data calculados aqui (UTC, como o datetime('now') do SQLite) para o SQL
  // funcionar igual no SQLite e no Postgres. Datas são texto: 'YYYY-MM-DD' ou
  // 'YYYY-MM-DD HH:MM' (o CRM às vezes grava com 'T', normalizado com replace()).
  const isoAt = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 19).replace('T', ' ');
  const today = isoAt(0).slice(0, 10);

  const leadsTotal = (await db.get(`SELECT COUNT(*) AS n FROM leads l ${cond('l')}`)).n;
  const leadsPorStatus = await db.all(`
    SELECT status, COUNT(*) AS n FROM leads l
    ${cond('l')}
    GROUP BY status
  `);

  const clientesTotal = (await db.get(`SELECT COUNT(*) AS n FROM clientes c ${cond('c')}`)).n;

  const apolicesTotal = (await db.get(`SELECT COUNT(*) AS n FROM apolices a ${cond('a')}`)).n;
  const apolicesStatus = await db.all(`
    SELECT status, COUNT(*) AS n FROM apolices a
    ${cond('a')}
    GROUP BY status
  `);

  // Apólices vencendo nos próximos 30 dias
  const vencendo = await db.all(`
    SELECT a.id, a.numero, a.vigencia_fim, c.nome AS cliente_nome
    FROM apolices a LEFT JOIN clientes c ON c.id = a.cliente_id
    WHERE a.status = 'ativa'
      ${isAdmin ? 'AND' : 'AND a.corretor_id = ' + Number(req.user.id) + ' AND'}
      a.vigencia_fim <> ''
      AND substr(a.vigencia_fim, 1, 10) <= ?
      AND substr(a.vigencia_fim, 1, 10) >= ?
    ORDER BY a.vigencia_fim ASC
  `, isoAt(30).slice(0, 10), today);

  const sinistrosTotal = (await db.get(`
    SELECT COUNT(*) AS n FROM sinistros s ${cond('s')}
  `)).n;
  const sinistrosStatus = await db.all(`
    SELECT status, COUNT(*) AS n FROM sinistros s
    ${cond('s')}
    GROUP BY status
  `);

  // Próximos 7 dias de agendamentos pendentes
  const proximosAgendamentos = await db.all(`
    SELECT g.id, g.data_hora, g.titulo, g.status,
      c.nome AS cliente_nome, l.nome AS lead_nome
    FROM agendamentos g
    LEFT JOIN clientes c ON c.id = g.cliente_id
    LEFT JOIN leads l ON l.id = g.lead_id
    WHERE g.status = 'pendente'
      ${isAdmin ? 'AND' : 'AND g.corretor_id = ' + Number(req.user.id) + ' AND'}
      g.data_hora <> ''
      AND replace(g.data_hora, 'T', ' ') <= ?
      AND replace(g.data_hora, 'T', ' ') >= ?
    ORDER BY g.data_hora ASC
  `, isoAt(7), isoAt(-1));

  const usuariosTotal = isAdmin
    ? (await db.get(`SELECT COUNT(*) AS n FROM usuarios WHERE ativo = 1`)).n
    : null;

  // Receita estimada: soma dos prêmios das apólices vigentes (ativa/renovada)
  const receitaWhere = isAdmin
    ? "WHERE status IN ('ativa','renovada')"
    : `WHERE a.corretor_id = ${Number(req.user.id)} AND status IN ('ativa','renovada')`;
  const receitaEstimada = (await db.get(`SELECT COALESCE(SUM(premio), 0) AS total FROM apolices a ${receitaWhere}`)).total;

  // Taxa de conversão de leads (fechados / total)
  const fechados = (leadsPorStatus.find((s) => s.status === 'fechado') || {}).n || 0;
  const taxaConversao = leadsTotal ? fechados / leadsTotal : 0;

  // Agendamentos pendentes já vencidos (atrasados)
  const agAtrasadosWhere = isAdmin ? '' : `AND g.corretor_id = ${Number(req.user.id)}`;
  const agendamentosAtrasados = (await db.get(`
    SELECT COUNT(*) AS n FROM agendamentos g
    WHERE g.status = 'pendente' AND g.data_hora <> ''
      AND replace(g.data_hora, 'T', ' ') < ? ${agAtrasadosWhere}
  `, isoAt(0))).n;

  // Leads sem corretor atribuído (fila de captação). A fila é compartilhada:
  // qualquer corretor pode assumir, então o contador vale para todos os papéis.
  const leadsNaoAtribuidos = (await db.get('SELECT COUNT(*) AS n FROM leads l WHERE l.corretor_id IS NULL')).n;

  // Follow-ups de leads previstos para hoje ou atrasados (funil ainda aberto)
  const followWhere = isAdmin ? '' : `AND l.corretor_id = ${Number(req.user.id)}`;
  const followupsLeads = await db.all(`
    SELECT l.id, l.nome, l.telefone, l.status, l.proximo_retorno,
      u.nome AS corretor_nome
    FROM leads l LEFT JOIN usuarios u ON u.id = l.corretor_id
    WHERE l.proximo_retorno IS NOT NULL AND l.proximo_retorno <> ''
      AND substr(l.proximo_retorno, 1, 10) <= ?
      AND l.status NOT IN ('fechado','desistiu','sem_interesse')
      ${followWhere}
    ORDER BY l.proximo_retorno ASC
    LIMIT 20
  `, today);

  res.json({
    leadsTotal,
    leadsPorStatus,
    clientesTotal,
    apolicesTotal,
    apolicesStatus,
    vencendo,
    sinistrosTotal,
    sinistrosStatus,
    proximosAgendamentos,
    usuariosTotal,
    receitaEstimada,
    taxaConversao,
    agendamentosAtrasados,
    leadsNaoAtribuidos,
    followupsLeads
  });
});

module.exports = router;