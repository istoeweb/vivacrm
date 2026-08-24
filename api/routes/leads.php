<?php
/* /api/leads — POST público (formulário do site) + CRUD autenticado. */

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../auth.php';

const LEAD_INTS = ['id', 'corretor_id'];

function leads_dispatch(string $method, ?int $id): void {
  // POST público — usado pelo formulário do site (sem auth)
  if ($method === 'POST' && $id === null) { leads_create_public(); return; }

  $user = current_user();
  switch (true) {
    case $method === 'GET' && $id === null: leads_list($user); return;
    case $method === 'GET':                leads_get($user, $id); return;
    case $method === 'PUT' && $id !== null: leads_update($user, $id); return;
    case $method === 'DELETE' && $id !== null:
      require_role($user, 'admin');
      leads_delete($id); return;
  }
  json_error(404, 'Recurso não encontrado');
}

function leads_create_public(): void {
  $b = body();
  $nome = trim((string)($b['nome'] ?? ''));
  $telefone = trim((string)($b['telefone'] ?? ''));
  if ($nome === '' || $telefone === '') json_error(400, 'Nome e telefone obrigatórios');
  if (!is_valid_phone($telefone)) json_error(400, 'Telefone inválido (informe DDD + número)');
  $email = $b['email'] ?? null;
  if ($email && !is_valid_email($email)) json_error(400, 'E-mail inválido');

  $origem = trim((string)($b['origem'] ?? 'site'));
  q_run(
    "INSERT INTO leads (nome, telefone, email, cidade, produto, mensagem, origem, status)
     VALUES (?,?,?,?,?,?,?,'novo')",
    [
      mb_substr($nome, 0, 120),
      mb_substr($telefone, 0, 40),
      str_or_null($email, 120),
      str_or_null($b['cidade'] ?? null, 80),
      str_or_null($b['produto'] ?? null, 80),
      str_or_null($b['mensagem'] ?? null, 1000),
      mb_substr($origem !== '' ? $origem : 'site', 0, 40),
    ]
  );
  json_response(['id' => (int)db()->lastInsertId(), 'ok' => true], 201);
}

function leads_list(array $user): void {
  $where = visible_where($user, 'l');
  $base = "FROM leads l LEFT JOIN usuarios u ON u.id = l.corretor_id $where";
  if (wants_pagination()) {
    $pg = get_pagination();
    $total = (int)q_val("SELECT COUNT(*) $base");
    $rows = q_all(
      "SELECT l.*, u.nome AS corretor_nome $base ORDER BY l.criado_em DESC LIMIT ? OFFSET ?",
      [$pg['limit'], $pg['offset']], LEAD_INTS
    );
    json_response(['data' => $rows, 'total' => $total, 'page' => $pg['page'], 'limit' => $pg['limit']]);
  }
  json_response(q_all("SELECT l.*, u.nome AS corretor_nome $base ORDER BY l.criado_em DESC", [], LEAD_INTS));
}

function leads_get(array $user, int $id): void {
  $row = q_one(
    "SELECT l.*, u.nome AS corretor_nome
     FROM leads l LEFT JOIN usuarios u ON u.id = l.corretor_id
     WHERE l.id = ?",
    [$id], LEAD_INTS
  );
  if (!$row) json_error(404, 'Lead não encontrado');
  if ($user['role'] !== 'admin' && $row['corretor_id'] !== $user['id']) {
    json_error(403, 'Acesso negado');
  }
  json_response($row);
}

// Presente mas vazio vira null; ausente mantém o valor atual. Corta em 16 chars.
function clean_date(array $b, string $key, $fallback): ?string {
  if (!array_key_exists($key, $b)) return $fallback;
  $s = trim((string)($b[$key] ?? ''));
  return $s === '' ? null : mb_substr($s, 0, 16);
}

function leads_update(array $user, int $id): void {
  $existing = q_one('SELECT * FROM leads WHERE id = ?', [$id], LEAD_INTS);
  if (!$existing) json_error(404, 'Lead não encontrado');
  if ($user['role'] !== 'admin' && $existing['corretor_id'] !== $user['id'] && $existing['corretor_id'] !== null) {
    json_error(403, 'Acesso negado');
  }

  $b = body();
  if (array_key_exists('status', $b) && $b['status'] !== null && !is_valid_lead_status($b['status'])) {
    json_error(400, 'Status inválido');
  }

  if (array_key_exists('corretor_id', $b)) {
    $corretor = ($b['corretor_id'] === '' || $b['corretor_id'] === null) ? null : (int)$b['corretor_id'];
  } else {
    $corretor = $existing['corretor_id'];
  }

  if ($user['role'] !== 'admin' && $corretor !== $user['id'] && $corretor !== $existing['corretor_id']) {
    json_error(403, 'Não é possível reatribuir lead');
  }

  q_run(
    "UPDATE leads SET
      nome=?, telefone=?, email=?, cidade=?, produto=?, mensagem=?,
      status=?, corretor_id=?, ultimo_contato=?, proximo_retorno=?, atualizado_em=datetime('now')
     WHERE id=?",
    [
      $b['nome'] ?? $existing['nome'],
      $b['telefone'] ?? $existing['telefone'],
      $b['email'] ?? $existing['email'],
      $b['cidade'] ?? $existing['cidade'],
      $b['produto'] ?? $existing['produto'],
      $b['mensagem'] ?? $existing['mensagem'],
      $b['status'] ?? $existing['status'],
      $corretor,
      clean_date($b, 'ultimo_contato', $existing['ultimo_contato']),
      clean_date($b, 'proximo_retorno', $existing['proximo_retorno']),
      $id,
    ]
  );
  json_response(['ok' => true]);
}

function leads_delete(int $id): void {
  if (q_run('DELETE FROM leads WHERE id = ?', [$id]) === 0) {
    json_error(404, 'Lead não encontrado');
  }
  json_response(['ok' => true]);
}
