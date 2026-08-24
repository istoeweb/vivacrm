const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

function corretorClause(req, alias) {
  if (req.user.role === 'admin') return '';
  return ` WHERE ${alias}.corretor_id = ` + Number(req.user.id);
}

router.get('/', auth, (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const cond = (alias) => (isAdmin ? '' : ` WHERE ${alias}.corretor_id = ` + Number(req.user.id));

  const leadsTotal = db.prepare(`SELECT COUNT(*) AS n FROM leads ${cond('l')}`).get().n;
  const leadsPorStatus = db.prepare(`
    SELECT status, COUNT(*) AS n FROM leads
    ${cond('l')}
    GROUP BY status
  `).all();

  const clientesTotal = db.prepare(`SELECT COUNT(*) AS n FROM clientes ${cond('c')}`).get().n;

  const apolicesTotal = db.prepare(`SELECT COUNT(*) AS n FROM apolices ${cond('a')}`).get().n;
  const apolicesStatus = db.prepare(`
    SELECT status, COUNT(*) AS n FROM apolices
    ${cond('a')}
    GROUP BY status
  `).all();

  // Apólices vencendo nos próximos 30 dias
  const vencendo = db.prepare(`
    SELECT a.id, a.numero, a.vigencia_fim, c.nome AS cliente_nome
    FROM apolices a LEFT JOIN clientes c ON c.id = a.cliente_id
    WHERE a.status = 'ativa'
      ${isAdmin ? 'AND' : 'AND a.corretor_id = ' + Number(req.user.id) + ' AND'}
      a.vigencia_fim <> ''
      AND date(a.vigencia_fim) <= date('now','+30 days')
      AND date(a.vigencia_fim) >= date('now')
    ORDER BY a.vigencia_fim ASC
  `).all();

  const sinistrosTotal = db.prepare(`
    SELECT COUNT(*) AS n FROM sinistros ${cond('s')}
  `).get().n;
  const sinistrosStatus = db.prepare(`
    SELECT status, COUNT(*) AS n FROM sinistros
    ${cond('s')}
    GROUP BY status
  `).all();

  // Próximos 7 dias de agendamentos pendentes
  const proximosAgendamentos = db.prepare(`
    SELECT g.id, g.data_hora, g.titulo, g.status,
      c.nome AS cliente_nome, l.nome AS lead_nome
    FROM agendamentos g
    LEFT JOIN clientes c ON c.id = g.cliente_id
    LEFT JOIN leads l ON l.id = g.lead_id
    WHERE g.status = 'pendente'
      ${isAdmin ? 'AND' : 'AND g.corretor_id = ' + Number(req.user.id) + ' AND'}
      g.data_hora <> ''
      AND datetime(g.data_hora) <= datetime('now','+7 days')
      AND datetime(g.data_hora) >= datetime('now','-1 day')
    ORDER BY g.data_hora ASC
  `).all();

  const usuariosTotal = isAdmin
    ? db.prepare(`SELECT COUNT(*) AS n FROM usuarios WHERE ativo = 1`).get().n
    : null;

  // Receita estimada: soma dos prêmios das apólices vigentes (ativa/renovada)
  const receitaWhere = isAdmin
    ? "WHERE status IN ('ativa','renovada')"
    : `WHERE a.corretor_id = ${Number(req.user.id)} AND status IN ('ativa','renovada')`;
  const receitaEstimada = db.prepare(
    `SELECT COALESCE(SUM(premio), 0) AS total FROM apolices a ${receitaWhere}`
  ).get().total;

  // Taxa de conversão de leads (fechados / total)
  const fechados = (leadsPorStatus.find((s) => s.status === 'fechado') || {}).n || 0;
  const taxaConversao = leadsTotal ? fechados / leadsTotal : 0;

  // Agendamentos pendentes já vencidos (atrasados)
  const agAtrasadosWhere = isAdmin ? '' : `AND g.corretor_id = ${Number(req.user.id)}`;
  const agendamentosAtrasados = db.prepare(`
    SELECT COUNT(*) AS n FROM agendamentos g
    WHERE g.status = 'pendente' AND g.data_hora <> ''
      AND datetime(g.data_hora) < datetime('now') ${agAtrasadosWhere}
  `).get().n;

  // Leads sem corretor atribuído (fila de captação)
  const naoAtribWhere = isAdmin ? '' : `AND l.corretor_id = ${Number(req.user.id)}`;
  const leadsNaoAtribuidos = isAdmin
    ? db.prepare(`SELECT COUNT(*) AS n FROM leads l WHERE l.corretor_id IS NULL ${naoAtribWhere}`).get().n
    : 0;

  // Follow-ups de leads previstos para hoje ou atrasados (funil ainda aberto)
  const followWhere = isAdmin ? '' : `AND l.corretor_id = ${Number(req.user.id)}`;
  const followupsLeads = db.prepare(`
    SELECT l.id, l.nome, l.telefone, l.status, l.proximo_retorno,
      u.nome AS corretor_nome
    FROM leads l LEFT JOIN usuarios u ON u.id = l.corretor_id
    WHERE l.proximo_retorno IS NOT NULL AND l.proximo_retorno <> ''
      AND date(l.proximo_retorno) <= date('now')
      AND l.status NOT IN ('fechado','desistiu','sem_interesse')
      ${followWhere}
    ORDER BY l.proximo_retorno ASC
    LIMIT 20
  `).all();

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