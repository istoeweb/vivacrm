<?php
/* /api/usuarios — CRUD restrito a admin. */

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../auth.php';

const USUARIO_INTS = ['id', 'ativo'];

function usuarios_dispatch(string $method, ?int $id): void {
  $user = current_user();
  require_role($user, 'admin');
  switch (true) {
    case $method === 'GET' && $id === null:  usuarios_list(); return;
    case $method === 'POST' && $id === null: usuarios_create(); return;
    case $method === 'PUT' && $id !== null:  usuarios_update($id); return;
    case $method === 'DELETE' && $id !== null: usuarios_delete($user, $id); return;
  }
  json_error(404, 'Recurso não encontrado');
}

function usuarios_list(): void {
  json_response(q_all(
    'SELECT id, nome, email, role, ativo, criado_em FROM usuarios ORDER BY nome ASC',
    [], USUARIO_INTS
  ));
}

function usuarios_create(): void {
  $b = body();
  $nome = $b['nome'] ?? null;
  $email = $b['email'] ?? null;
  $senha = $b['senha'] ?? null;
  $role = $b['role'] ?? null;
  if (!$nome || !$email || !$senha || !$role) json_error(400, 'nome, email, senha e role obrigatórios');
  if (!is_valid_email($email)) json_error(400, 'E-mail inválido');
  if (strlen((string)$senha) < 6) json_error(400, 'Senha deve ter ao menos 6 caracteres');
  if (!in_array($role, ['admin', 'corretor'], true)) json_error(400, 'role inválido');
  $email = mb_strtolower((string)$email);
  if (q_one('SELECT id FROM usuarios WHERE email = ?', [$email])) json_error(409, 'Email já cadastrado');

  q_run(
    'INSERT INTO usuarios (nome, email, senha_hash, role, ativo) VALUES (?,?,?,?,1)',
    [mb_substr((string)$nome, 0, 120), $email, senha_hash((string)$senha), $role]
  );
  json_response(['id' => (int)db()->lastInsertId()], 201);
}

function usuarios_update(int $id): void {
  $existing = q_one('SELECT * FROM usuarios WHERE id = ?', [$id], USUARIO_INTS);
  if (!$existing) json_error(404, 'Usuário não encontrado');

  $b = body();
  $email = array_key_exists('email', $b) && $b['email'] ? mb_strtolower((string)$b['email']) : $existing['email'];
  if ($email !== $existing['email']) {
    $dup = q_one('SELECT id FROM usuarios WHERE email = ? AND id <> ?', [$email, $id]);
    if ($dup) json_error(409, 'Email já cadastrado');
  }
  $hash = !empty($b['senha']) ? senha_hash((string)$b['senha']) : $existing['senha_hash'];

  q_run(
    'UPDATE usuarios SET nome=?, email=?, senha_hash=?, role=?, ativo=? WHERE id=?',
    [
      $b['nome'] ?? $existing['nome'],
      $email,
      $hash,
      $b['role'] ?? $existing['role'],
      array_key_exists('ativo', $b) ? (int)$b['ativo'] : $existing['ativo'],
      $id,
    ]
  );
  json_response(['ok' => true]);
}

function usuarios_delete(array $user, int $id): void {
  if ($id === $user['id']) json_error(400, 'Não é possível excluir o próprio usuário');
  if (q_run('DELETE FROM usuarios WHERE id = ?', [$id]) === 0) {
    json_error(404, 'Usuário não encontrado');
  }
  json_response(['ok' => true]);
}
