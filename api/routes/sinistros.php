<?php
/* /api/sinistros — CRUD autenticado. */

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../auth.php';

const SINISTRO_INTS = ['id', 'apolice_id', 'cliente_id', 'corretor_id'];

function sinistros_dispatch(string $method, ?int $id): void {
  $user = current_user();
  switch (true) {
    case $method === 'GET' && $id === null:  sinistros_list($user); return;
    case $method === 'POST' && $id === null: sinistros_create($user); return;
    case $method === 'PUT' && $id !== null:  sinistros_update($user, $id); return;
    case $method === 'DELETE' && $id !== null: sinistros_delete($user, $id); return;
  }
  json_error(404, 'Recurso não encontrado');
}

const SINISTRO_SELECT = "SELECT s.*, c.nome AS cliente_nome, a.numero AS apolice_numero, u.nome AS corretor_nome
  FROM sinistros s
  LEFT JOIN clientes c ON c.id = s.cliente_id
  LEFT JOIN apolices a ON a.id = s.apolice_id
  LEFT JOIN usuarios u ON u.id = s.corretor_id";

function sinistros_list(array $user): void {
  $where = visible_where($user, 's');
  if (wants_pagination()) {
    $pg = get_pagination();
    $total = (int)q_val("SELECT COUNT(*) FROM sinistros s $where");
    $rows = q_all(
      SINISTRO_SELECT . " $where ORDER BY s.criado_em DESC LIMIT ? OFFSET ?",
      [$pg['limit'], $pg['offset']], SINISTRO_INTS
    );
    json_response(['data' => $rows, 'total' => $total, 'page' => $pg['page'], 'limit' => $pg['limit']]);
  }
  json_response(q_all(SINISTRO_SELECT . " $where ORDER BY s.criado_em DESC", [], SINISTRO_INTS));
}

function sinistros_create(array $user): void {
  $b = body();
  if (empty($b['cliente_id'])) json_error(400, 'cliente_id obrigatório');
  $cid = $user['role'] !== 'admin' ? $user['id'] : (($b['corretor_id'] ?? null) ?: $user['id']);
  q_run(
    "INSERT INTO sinistros (cliente_id, apolice_id, descricao, data_evento, status, corretor_id)
     VALUES (?,?,?,?,?,?)",
    [
      (int)$b['cliente_id'],
      !empty($b['apolice_id']) ? (int)$b['apolice_id'] : null,
      str_or_null($b['descricao'] ?? null, 1000),
      str_or_null($b['data_evento'] ?? null, 20),
      mb_substr((string)($b['status'] ?? 'aberto'), 0, 20) ?: 'aberto',
      $cid,
    ]
  );
  json_response(['id' => (int)db()->lastInsertId()], 201);
}

function sinistros_update(array $user, int $id): void {
  $existing = q_one('SELECT * FROM sinistros WHERE id = ?', [$id], SINISTRO_INTS);
  if (!$existing) json_error(404, 'Sinistro não encontrado');
  if ($user['role'] !== 'admin' && $existing['corretor_id'] !== $user['id']) {
    json_error(403, 'Acesso negado');
  }
  $b = body();
  $cid = $user['role'] !== 'admin'
    ? $existing['corretor_id']
    : (array_key_exists('corretor_id', $b) ? (($b['corretor_id'] === '' || $b['corretor_id'] === null) ? null : (int)$b['corretor_id']) : $existing['corretor_id']);
  q_run(
    "UPDATE sinistros SET
      cliente_id=?, apolice_id=?, descricao=?, data_evento=?, status=?, corretor_id=?
     WHERE id=?",
    [
      isset($b['cliente_id']) ? (int)$b['cliente_id'] : $existing['cliente_id'],
      array_key_exists('apolice_id', $b) ? (($b['apolice_id'] === '' || $b['apolice_id'] === null) ? null : (int)$b['apolice_id']) : $existing['apolice_id'],
      $b['descricao'] ?? $existing['descricao'],
      $b['data_evento'] ?? $existing['data_evento'],
      $b['status'] ?? $existing['status'],
      $cid,
      $id,
    ]
  );
  json_response(['ok' => true]);
}

function sinistros_delete(array $user, int $id): void {
  if ($user['role'] !== 'admin') {
    $s = q_one('SELECT corretor_id FROM sinistros WHERE id = ?', [$id], ['corretor_id']);
    if (!$s) json_error(404, 'Sinistro não encontrado');
    if ($s['corretor_id'] !== $user['id']) json_error(403, 'Acesso negado');
  }
  if (q_run('DELETE FROM sinistros WHERE id = ?', [$id]) === 0) {
    json_error(404, 'Sinistro não encontrado');
  }
  json_response(['ok' => true]);
}
