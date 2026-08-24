<?php
/* POST /api/auth/login e GET /api/auth/me */

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../auth.php';

function auth_login(): void {
  $b = body();
  $email = $b['email'] ?? null;
  $senha = $b['senha'] ?? null;
  if (!is_string($email) || !is_string($senha) || $email === '' || $senha === '') {
    json_error(400, 'Email e senha obrigatórios');
  }

  $row = q_one('SELECT * FROM usuarios WHERE email = ? AND ativo = 1', [mb_strtolower(trim($email))]);
  if (!$row) json_error(401, 'Credenciais inválidas');
  if (!senha_confere($senha, $row['senha_hash'])) json_error(401, 'Credenciais inválidas');

  $user = [
    'id' => (int)$row['id'],
    'nome' => $row['nome'],
    'email' => $row['email'],
    'role' => $row['role'],
  ];
  json_response([
    'token' => jwt_sign($user),
    'user' => $user,
  ]);
}

function auth_me(array $user): void {
  $row = q_one('SELECT id, nome, email, role FROM usuarios WHERE id = ?', [$user['id']], ['id']);
  if (!$row) json_error(404, 'Usuário não encontrado');
  json_response($row);
}
