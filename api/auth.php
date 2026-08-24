<?php
/* Autenticação via Bearer token + controle de papel. */

require_once __DIR__ . '/jwt.php';
require_once __DIR__ . '/helpers.php';

function get_authorization_header(): ?string {
  if (!empty($_SERVER['HTTP_AUTHORIZATION'])) return $_SERVER['HTTP_AUTHORIZATION'];
  if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
  if (function_exists('apache_request_headers')) {
    foreach (apache_request_headers() as $k => $v) {
      if (strcasecmp($k, 'Authorization') === 0) return $v;
    }
  }
  return null;
}

// Exige token válido; devolve o payload do usuário (id, role, nome, email).
function current_user(): array {
  $header = get_authorization_header();
  if (!$header || stripos($header, 'Bearer ') !== 0) {
    json_error(401, 'Token não informado');
  }
  $payload = jwt_verify(substr($header, 7));
  if (!$payload) json_error(401, 'Token inválido ou expirado');
  $payload['id'] = (int)$payload['id'];
  return $payload;
}

function require_role(array $user, string ...$roles): void {
  if (!in_array($user['role'] ?? '', $roles, true)) {
    json_error(403, 'Acesso negado');
  }
}

// Verifica senha aceitando hashes bcrypt do PHP ($2y$) e do Node ($2b$).
function senha_confere(string $senha, string $hash): bool {
  $hash = preg_replace('/^\$2b\$/', '$2y$', $hash);
  return password_verify($senha, $hash);
}

function senha_hash(string $senha): string {
  return password_hash($senha, PASSWORD_BCRYPT, ['cost' => 10]);
}
