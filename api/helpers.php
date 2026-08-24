<?php
/* Helpers compartilhados: respostas JSON, validação, paginação e queries. */

require_once __DIR__ . '/db.php';

/* ---- Respostas ---- */

function json_response($data, int $status = 200): void {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

function json_error(int $status, string $msg): void {
  json_response(['error' => $msg], $status);
}

/* ---- Entrada ---- */

function body(): array {
  $raw = file_get_contents('php://input');
  if (!$raw) return [];
  $d = json_decode($raw, true);
  return is_array($d) ? $d : [];
}

/* ---- Validação (mesmas regras da versão Node) ---- */

function is_valid_email($email): bool {
  return (bool)preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]+$/', trim((string)$email));
}

// Telefone válido: 10 ou 11 dígitos (com DDD), ignorando formatação.
function is_valid_phone($tel): bool {
  $digits = preg_replace('/\D/', '', (string)$tel);
  $len = strlen($digits);
  return $len === 10 || $len === 11;
}

const LEAD_STATUSES = [
  'novo', 'contato_realizado', 'proposta_enviada', 'aguardando_retorno',
  'fechado', 'desistiu', 'sem_interesse',
];

function is_valid_lead_status($status): bool {
  return in_array($status, LEAD_STATUSES, true);
}

/* ---- Paginação ---- */

function get_pagination(int $defaultLimit = 50, int $maxLimit = 200): array {
  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : $defaultLimit;
  $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
  if ($limit <= 0) $limit = $defaultLimit;
  if ($limit > $maxLimit) $limit = $maxLimit;
  if ($page <= 0) $page = 1;
  return ['limit' => $limit, 'page' => $page, 'offset' => ($page - 1) * $limit];
}

function wants_pagination(): bool {
  return isset($_GET['page']) || isset($_GET['limit']);
}

/* ---- Strings ---- */

// trim + corte de tamanho; string vazia vira null (mesmo padrão da versão Node).
function str_or_null($v, int $max): ?string {
  $s = mb_substr(trim((string)($v ?? '')), 0, $max);
  return $s === '' ? null : $s;
}

/* ---- Queries com cast de inteiros ----
 * PDO/SQLite pode retornar inteiros como string dependendo do driver;
 * o frontend compara ids com ===, então normalizamos os campos-chave. */

function int_fields(array $row, array $fields): array {
  foreach ($fields as $f) {
    if (isset($row[$f]) && $row[$f] !== '' && $row[$f] !== null) {
      $row[$f] = (int)$row[$f];
    } elseif (array_key_exists($f, $row) && ($row[$f] === '' || $row[$f] === null)) {
      $row[$f] = null;
    }
  }
  return $row;
}

function q_all(string $sql, array $params = [], array $ints = []): array {
  $stmt = db()->prepare($sql);
  $stmt->execute($params);
  return array_map(fn($r) => int_fields($r, $ints), $stmt->fetchAll());
}

function q_one(string $sql, array $params = [], array $ints = []): ?array {
  $stmt = db()->prepare($sql);
  $stmt->execute($params);
  $r = $stmt->fetch();
  return $r === false ? null : int_fields($r, $ints);
}

function q_val(string $sql, array $params = []) {
  $stmt = db()->prepare($sql);
  $stmt->execute($params);
  return $stmt->fetchColumn();
}

function q_run(string $sql, array $params = []): int {
  $stmt = db()->prepare($sql);
  $stmt->execute($params);
  return $stmt->rowCount();
}

/* ---- Escopo por papel ---- */

// admin vê todos; corretor vê apenas os próprios registros.
function visible_where(array $user, string $alias): string {
  if (($user['role'] ?? '') === 'admin') return '';
  return " WHERE $alias.corretor_id = " . (int)$user['id'];
}
