<?php
/* /api/agendamentos — CRUD autenticado. */

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../auth.php';

const AGENDA_INTS = ['id', 'cliente_id', 'lead_id', 'corretor_id'];

function agendamentos_dispatch(string $method, ?int $id): void {
  $user = current_user();
  switch (true) {
    case $method === 'GET' && $id === null:  agendamentos_list($user); return;
    case $method === 'POST' && $id === null: agendamentos_create($user); return;
    case $method === 'PUT' && $id !== null:  agendamentos_update($user, $id); return;
    case $method === 'DELETE' && $id !== null: agendamentos_delete($user, $id); return;
  }
  json_error(404, 'Recurso não encontrado');
}

const AGENDA_SELECT = "SELECT g.*,
    c.nome AS cliente_nome,
    l.nome AS lead_nome,
    u.nome AS corretor_nome
  FROM agendamentos g
  LEFT JOIN clientes c ON c.id = g.cliente_id
  LEFT JOIN leads l    ON l.id = g.lead_id
  LEFT JOIN usuarios u ON u.id = g.corretor_id";

function agendamentos_list(array $user): void {
  $where = visible_where($user, 'g');
  if (wants_pagination()) {
    $pg = get_pagination();
    $total = (int)q_val("SELECT COUNT(*) FROM agendamentos g $where");
    $rows = q_all(
      AGENDA_SELECT . " $where ORDER BY g.data_hora ASC LIMIT ? OFFSET ?",
      [$pg['limit'], $pg['offset']], AGENDA_INTS
    );
    json_response(['data' => $rows, 'total' => $total, 'page' => $pg['page'], 'limit' => $pg['limit']]);
  }
  json_response(q_all(AGENDA_SELECT . " $where ORDER BY g.data_hora ASC", [], AGENDA_INTS));
}

function agendamentos_create(array $user): void {
  $b = body();
  if (empty($b['data_hora']) || empty($b['titulo'])) json_error(400, 'data_hora e titulo obrigatórios');
  $cid = $user['role'] !== 'admin' ? $user['id'] : (($b['corretor_id'] ?? null) ?: $user['id']);
  q_run(
    "INSERT INTO agendamentos (cliente_id, lead_id, corretor_id, data_hora, titulo, observacao, status)
     VALUES (?,?,?,?,?,?,?)",
    [
      !empty($b['cliente_id']) ? (int)$b['cliente_id'] : null,
      !empty($b['lead_id']) ? (int)$b['lead_id'] : null,
      $cid,
      mb_substr((string)$b['data_hora'], 0, 20),
      mb_substr((string)$b['titulo'], 0, 120),
      str_or_null($b['observacao'] ?? null, 1000),
      mb_substr((string)($b['status'] ?? 'pendente'), 0, 20) ?: 'pendente',
    ]
  );
  json_response(['id' => (int)db()->lastInsertId()], 201);
}

function agendamentos_update(array $user, int $id): void {
  $existing = q_one('SELECT * FROM agendamentos WHERE id = ?', [$id], AGENDA_INTS);
  if (!$existing) json_error(404, 'Agendamento não encontrado');
  if ($user['role'] !== 'admin' && $existing['corretor_id'] !== $user['id']) {
    json_error(403, 'Acesso negado');
  }
  $b = body();
  q_run(
    "UPDATE agendamentos SET
      cliente_id=?, lead_id=?, data_hora=?, titulo=?, observacao=?, status=?
     WHERE id=?",
    [
      array_key_exists('cliente_id', $b) ? (($b['cliente_id'] === '' || $b['cliente_id'] === null) ? null : (int)$b['cliente_id']) : $existing['cliente_id'],
      array_key_exists('lead_id', $b) ? (($b['lead_id'] === '' || $b['lead_id'] === null) ? null : (int)$b['lead_id']) : $existing['lead_id'],
      $b['data_hora'] ?? $existing['data_hora'],
      $b['titulo'] ?? $existing['titulo'],
      $b['observacao'] ?? $existing['observacao'],
      $b['status'] ?? $existing['status'],
      $id,
    ]
  );
  json_response(['ok' => true]);
}

function agendamentos_delete(array $user, int $id): void {
  if ($user['role'] !== 'admin') {
    $g = q_one('SELECT corretor_id FROM agendamentos WHERE id = ?', [$id], ['corretor_id']);
    if (!$g) json_error(404, 'Agendamento não encontrado');
    if ($g['corretor_id'] !== $user['id']) json_error(403, 'Acesso negado');
  }
  if (q_run('DELETE FROM agendamentos WHERE id = ?', [$id]) === 0) {
    json_error(404, 'Agendamento não encontrado');
  }
  json_response(['ok' => true]);
}
