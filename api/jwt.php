<?php
/* JWT HS256 implementado à mão (sem Composer/dependências). */

require_once __DIR__ . '/config.php';

function base64url_encode(string $d): string {
  return rtrim(strtr(base64_encode($d), '+/', '-_'), '=');
}

function base64url_decode(string $d): string {
  return base64_decode(strtr($d, '-_', '+/'));
}

function jwt_sign(array $payload): string {
  $header = ['alg' => 'HS256', 'typ' => 'JWT'];
  $payload['iat'] = time();
  $payload['exp'] = time() + TOKEN_TTL;
  $h = base64url_encode(json_encode($header, JSON_UNESCAPED_UNICODE));
  $p = base64url_encode(json_encode($payload, JSON_UNESCAPED_UNICODE));
  $s = base64url_encode(hash_hmac('sha256', "$h.$p", JWT_SECRET, true));
  return "$h.$p.$s";
}

// Retorna o payload ou null se inválido/expirado.
function jwt_verify(string $token): ?array {
  $parts = explode('.', $token);
  if (count($parts) !== 3) return null;
  [$h, $p, $s] = $parts;
  $expected = base64url_encode(hash_hmac('sha256', "$h.$p", JWT_SECRET, true));
  if (!hash_equals($expected, $s)) return null;
  $payload = json_decode(base64url_decode($p), true);
  if (!is_array($payload)) return null;
  if (isset($payload['exp']) && time() >= (int)$payload['exp']) return null;
  return $payload;
}
