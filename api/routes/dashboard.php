<?php
/* GET /api/dashboard — métricas do painel. */

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../auth.php';

function dashboard_index(array $user): void {
  $isAdmin = $user['role'] === 'admin';
  $cond = fn(string $alias): string => $isAdmin ? '' : " WHERE $alias.corretor_id = " . (int)$user['id'];
  $and = fn(string $alias): string => $isAdmin ? '' : ' AND ' . $alias . '.corretor_id = ' . (int)$user['id'];

  $leadsTotal = (int)q_val('SELECT COUNT(*) FROM leads l' . $cond('l'));
  $leadsPorStatus = q_all('SELECT status, COUNT(*) AS n FROM leads l' . $cond('l') . ' GROUP BY status', [], ['n']);

  $clientesTotal = (int)q_val('SELECT COUNT(*) FROM clientes c' . $cond('c'));

  $apolicesTotal = (int)q_val('SELECT COUNT(*) FROM apolices a' . $cond('a'));
  $apolicesStatus = q_all('SELECT status, COUNT(*) AS n FROM apolices a' . $cond('a') . ' GROUP BY status', [], ['n']);

  // Apólices vencendo nos próximos 30 dias
  $vencendo = q_all(
    "SELECT a.id, a.numero, a.vigencia_fim, c.nome AS cliente_nome
     FROM apolices a LEFT JOIN clientes c ON c.id = a.cliente_id
     WHERE a.status = 'ativa'" . $and('a') . "
       AND a.vigencia_fim <> ''
       AND date(a.vigencia_fim) <= date('now','+30 days')
       AND date(a.vigencia_fim) >= date('now')
     ORDER BY a.vigencia_fim ASC",
    [], ['id']
  );

  $sinistrosTotal = (int)q_val('SELECT COUNT(*) FROM sinistros s' . $cond('s'));
  $sinistrosStatus = q_all('SELECT status, COUNT(*) AS n FROM sinistros s' . $cond('s') . ' GROUP BY status', [], ['n']);

  // Próximos 7 dias de agendamentos pendentes
  $proximosAgendamentos = q_all(
    "SELECT g.id, g.data_hora, g.titulo, g.status,
       c.nome AS cliente_nome, l.nome AS lead_nome
     FROM agendamentos g
     LEFT JOIN clientes c ON c.id = g.cliente_id
     LEFT JOIN leads l ON l.id = g.lead_id
     WHERE g.status = 'pendente'" . $and('g') . "
       AND g.data_hora <> ''
       AND datetime(g.data_hora) <= datetime('now','+7 days')
       AND datetime(g.data_hora) >= datetime('now','-1 day')
     ORDER BY g.data_hora ASC",
    [], ['id']
  );

  $usuariosTotal = $isAdmin ? (int)q_val('SELECT COUNT(*) FROM usuarios WHERE ativo = 1') : null;

  json_response([
    'leadsTotal' => $leadsTotal,
    'leadsPorStatus' => $leadsPorStatus,
    'clientesTotal' => $clientesTotal,
    'apolicesTotal' => $apolicesTotal,
    'apolicesStatus' => $apolicesStatus,
    'vencendo' => $vencendo,
    'sinistrosTotal' => $sinistrosTotal,
    'sinistrosStatus' => $sinistrosStatus,
    'proximosAgendamentos' => $proximosAgendamentos,
    'usuariosTotal' => $usuariosTotal,
  ]);
}
