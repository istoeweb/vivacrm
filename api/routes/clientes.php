<?php
/* /api/clientes — CRUD autenticado. */

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../auth.php';

const CLIENTE_INTS = ['id', 'corretor_id'];

function clientes_dispatch(string $method, ?int $id): void {
  $user = current_user();
  switch (true) {
    case $method === 'GET' && $id === null:  clientes_list($user); return;
    case $method === 'GET':                  clientes_get($user, $id); return;
    case $method === 'POST' && $id === null: clientes_create($user); return;
    case $method === 'PUT' && $id !== null:  clientes_update($user, $id); return;
    case $method === 'DELETE' && $id !== null: clientes_delete($user, $id); return;
  }
  json_error(404, 'Recurso não encontrado');
}

function clientes_list(array $user): void {
  $where = visible_where($user, 'c');
  $base = "FROM clientes c LEFT JOIN usuarios u ON u.id = c.corretor_id $where";
  if (wants_pagination()) {
    $pg = get_pagination();
    $total = (int)q_val("SELECT COUNT(*) $base");
    $rows = q_all(
      "SELECT c.*, u.nome AS corretor_nome $base ORDER BY c.criado_em DESC LIMIT ? OFFSET ?",
      [$pg['limit'], $pg['offset']], CLIENTE_INTS
    );
    json_response(['data' => $rows, 'total' => $total, 'page' => $pg['page'], 'limit' => $pg['limit']]);
  }
  json_response(q_all("SELECT c.*, u.nome AS corretor_nome $base ORDER BY c.criado_em DESC", [], CLIENTE_INTS));
}

function clientes_get(array $user, int $id): void {
  $row = q_one(
    "SELECT c.*, u.nome AS corretor_nome
     FROM clientes c LEFT JOIN usuarios u ON u.id = c.corretor_id
     WHERE c.id = ?",
    [$id], CLIENTE_INTS
  );
  if (!$row) json_error(404, 'Cliente não encontrado');
  if ($user['role'] !== 'admin' && $row['corretor_id'] !== $user['id']) {
    json_error(403, 'Acesso negado');
  }
  json_response($row);
}

function clientes_create(array $user): void {
  $b = body();
  $nome = trim((string)($b['nome'] ?? ''));
  if ($nome === '') json_error(400, 'Nome obrigatório');
  $cid = $user['role'] !== 'admin' ? $user['id'] : (($b['corretor_id'] ?? null) ?: $user['id']);
  q_run(
    "INSERT INTO clientes (nome, cpf_cnpj, telefone, email, cidade, endereco, corretor_id)
     VALUES (?,?,?,?,?,?,?)",
    [
      mb_substr($nome, 0, 120),
      str_or_null($b['cpf_cnpj'] ?? null, 20),
      str_or_null($b['telefone'] ?? null, 40),
      str_or_null($b['email'] ?? null, 120),
      str_or_null($b['cidade'] ?? null, 80),
      str_or_null($b['endereco'] ?? null, 200),
      $cid,
    ]
  );
  json_response(['id' => (int)db()->lastInsertId()], 201);
}

function clientes_update(array $user, int $id): void {
  $existing = q_one('SELECT * FROM clientes WHERE id = ?', [$id], CLIENTE_INTS);
  if (!$existing) json_error(404, 'Cliente não encontrado');
  if ($user['role'] !== 'admin' && $existing['corretor_id'] !== $user['id']) {
    json_error(403, 'Acesso negado');
  }
  $b = body();
  $cid = $user['role'] !== 'admin'
    ? $existing['corretor_id']
    : (array_key_exists('corretor_id', $b) ? (($b['corretor_id'] === '' || $b['corretor_id'] === null) ? null : (int)$b['corretor_id']) : $existing['corretor_id']);
  q_run(
    "UPDATE clientes SET
      nome=?, cpf_cnpj=?, telefone=?, email=?, cidade=?, endereco=?,
      corretor_id=?, atualizado_em=datetime('now')
     WHERE id=?",
    [
      $b['nome'] ?? $existing['nome'],
      $b['cpf_cnpj'] ?? $existing['cpf_cnpj'],
      $b['telefone'] ?? $existing['telefone'],
      $b['email'] ?? $existing['email'],
      $b['cidade'] ?? $existing['cidade'],
      $b['endereco'] ?? $existing['endereco'],
      $cid,
      $id,
    ]
  );
  json_response(['ok' => true]);
}

function clientes_delete(array $user, int $id): void {
  if ($user['role'] !== 'admin') {
    $c = q_one('SELECT corretor_id FROM clientes WHERE id = ?', [$id], ['corretor_id']);
    if (!$c) json_error(404, 'Cliente não encontrado');
    if ($c['corretor_id'] !== $user['id']) json_error(403, 'Acesso negado');
  }
  if (q_run('DELETE FROM clientes WHERE id = ?', [$id]) === 0) {
    json_error(404, 'Cliente não encontrado');
  }
  json_response(['ok' => true]);
}
