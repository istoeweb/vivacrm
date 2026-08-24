<?php
/* /api/apolices — CRUD autenticado. */

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../auth.php';

const APOLICE_INTS = ['id', 'cliente_id', 'corretor_id'];

function apolices_dispatch(string $method, ?int $id): void {
  $user = current_user();
  switch (true) {
    case $method === 'GET' && $id === null:  apolices_list($user); return;
    case $method === 'POST' && $id === null: apolices_create($user); return;
    case $method === 'PUT' && $id !== null:  apolices_update($user, $id); return;
    case $method === 'DELETE' && $id !== null: apolices_delete($user, $id); return;
  }
  json_error(404, 'Recurso não encontrado');
}

const APOLICE_SELECT = "SELECT a.*, c.nome AS cliente_nome, u.nome AS corretor_nome
  FROM apolices a
  LEFT JOIN clientes c ON c.id = a.cliente_id
  LEFT JOIN usuarios u ON u.id = a.corretor_id";

function apolices_list(array $user): void {
  $where = visible_where($user, 'a');
  if (wants_pagination()) {
    $pg = get_pagination();
    $total = (int)q_val("SELECT COUNT(*) FROM apolices a $where");
    $rows = q_all(
      APOLICE_SELECT . " $where ORDER BY a.criado_em DESC LIMIT ? OFFSET ?",
      [$pg['limit'], $pg['offset']], APOLICE_INTS
    );
    json_response(['data' => $rows, 'total' => $total, 'page' => $pg['page'], 'limit' => $pg['limit']]);
  }
  json_response(q_all(APOLICE_SELECT . " $where ORDER BY a.criado_em DESC", [], APOLICE_INTS));
}

function apolices_create(array $user): void {
  $b = body();
  if (empty($b['cliente_id']) || empty($b['produto'])) json_error(400, 'cliente_id e produto obrigatórios');
  $cid = $user['role'] !== 'admin' ? $user['id'] : (($b['corretor_id'] ?? null) ?: $user['id']);
  q_run(
    "INSERT INTO apolices
      (cliente_id, produto, seguradora, numero, vigencia_inicio, vigencia_fim, premio, status, corretor_id)
     VALUES (?,?,?,?,?,?,?,?,?)",
    [
      (int)$b['cliente_id'],
      mb_substr((string)$b['produto'], 0, 80),
      str_or_null($b['seguradora'] ?? null, 80),
      str_or_null($b['numero'] ?? null, 60),
      str_or_null($b['vigencia_inicio'] ?? null, 20),
      str_or_null($b['vigencia_fim'] ?? null, 20),
      str_or_null($b['premio'] ?? null, 40),
      mb_substr((string)($b['status'] ?? 'ativa'), 0, 20) ?: 'ativa',
      $cid,
    ]
  );
  json_response(['id' => (int)db()->lastInsertId()], 201);
}

function apolices_update(array $user, int $id): void {
  $existing = q_one('SELECT * FROM apolices WHERE id = ?', [$id], APOLICE_INTS);
  if (!$existing) json_error(404, 'Apólice não encontrada');
  if ($user['role'] !== 'admin' && $existing['corretor_id'] !== $user['id']) {
    json_error(403, 'Acesso negado');
  }
  $b = body();
  $cid = $user['role'] !== 'admin'
    ? $existing['corretor_id']
    : (array_key_exists('corretor_id', $b) ? (($b['corretor_id'] === '' || $b['corretor_id'] === null) ? null : (int)$b['corretor_id']) : $existing['corretor_id']);
  q_run(
    "UPDATE apolices SET
      cliente_id=?, produto=?, seguradora=?, numero=?,
      vigencia_inicio=?, vigencia_fim=?, premio=?, status=?, corretor_id=?
     WHERE id=?",
    [
      isset($b['cliente_id']) ? (int)$b['cliente_id'] : $existing['cliente_id'],
      $b['produto'] ?? $existing['produto'],
      $b['seguradora'] ?? $existing['seguradora'],
      $b['numero'] ?? $existing['numero'],
      $b['vigencia_inicio'] ?? $existing['vigencia_inicio'],
      $b['vigencia_fim'] ?? $existing['vigencia_fim'],
      $b['premio'] ?? $existing['premio'],
      $b['status'] ?? $existing['status'],
      $cid,
      $id,
    ]
  );
  json_response(['ok' => true]);
}

function apolices_delete(array $user, int $id): void {
  if ($user['role'] !== 'admin') {
    $a = q_one('SELECT corretor_id FROM apolices WHERE id = ?', [$id], ['corretor_id']);
    if (!$a) json_error(404, 'Apólice não encontrada');
    if ($a['corretor_id'] !== $user['id']) json_error(403, 'Acesso negado');
  }
  if (q_run('DELETE FROM apolices WHERE id = ?', [$id]) === 0) {
    json_error(404, 'Apólice não encontrada');
  }
  json_response(['ok' => true]);
}
