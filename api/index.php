<?php
/*
 * Front controller da API do CRM (versão PHP).
 * Todas as requisições /api/* passam por aqui (ver .htaccess / router.php).
 */

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/ratelimit.php';

/* ---- CORS (antes de qualquer saída) ---- */

$allowed = array_values(array_filter(array_map('trim', explode(',', ALLOWED_ORIGINS))));
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (count($allowed) === 0) {
  header('Access-Control-Allow-Origin: ' . ($origin !== '' ? $origin : '*'));
} elseif ($origin !== '' && in_array($origin, $allowed, true)) {
  header('Access-Control-Allow-Origin: ' . $origin);
} elseif ($origin !== '') {
  json_error(403, 'Origem não permitida pelo CORS');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Vary: Origin');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') {
  http_response_code(204);
  exit;
}

/* ---- Headers de segurança ---- */

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');

/* ---- Descobre o caminho relativo a /api ---- */

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$pos = strpos($uri, '/api');
$path = $pos === false ? '/' : substr($uri, $pos + 4);
$path = '/' . trim($path, '/');
$segments = $path === '/' ? [] : explode('/', trim($path, '/'));

/* ---- Rate limiting ---- */

$isPublic = ($method === 'POST' && $segments === ['leads'])
  || ($segments === ['auth', 'login']);
rate_limit($isPublic ? 'public' : 'api', $isPublic ? RATE_LIMIT_PUBLIC : RATE_LIMIT_API);

/* ---- Roteamento ---- */

$resource = $segments[0] ?? '';
$id = isset($segments[1]) && ctype_digit($segments[1]) ? (int)$segments[1] : null;

try {
  switch ($resource) {
    case 'health':
      json_response(['ok' => true, 'ts' => (int)(microtime(true) * 1000)]);
      break;

    case 'auth':
      require __DIR__ . '/routes/auth.php';
      if ($segments === ['auth', 'login'] && $method === 'POST') auth_login();
      if ($segments === ['auth', 'me'] && $method === 'GET') auth_me(current_user());
      json_error(404, 'Recurso não encontrado');
      break;

    case 'leads':
    case 'clientes':
    case 'apolices':
    case 'sinistros':
    case 'agendamentos':
    case 'usuarios':
      require __DIR__ . "/routes/$resource.php";
      $fn = $resource . '_dispatch';
      $fn($method, $id);
      break;

    case 'dashboard':
      require __DIR__ . '/routes/dashboard.php';
      if ($method === 'GET') dashboard_index(current_user());
      json_error(404, 'Recurso não encontrado');
      break;

    case 'blog':
      require __DIR__ . '/routes/blog.php';
      blog_dispatch($method, array_slice($segments, 1));
      break;

    default:
      json_error(404, 'Recurso não encontrado');
  }
} catch (PDOException $e) {
  error_log($e->getMessage());
  json_error(500, 'Erro interno do servidor');
} catch (Throwable $e) {
  error_log($e->getMessage());
  json_error(500, 'Erro interno do servidor');
}
