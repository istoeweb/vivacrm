<?php
/* Rate limiting simples baseado em arquivo (funciona em hospedagem compartilhada). */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

function client_ip(): string {
  if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
    return trim($parts[0]);
  }
  return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

function rate_limit(string $bucket, int $max): void {
  $dir = dirname(DB_PATH) . '/ratelimit';
  if (!is_dir($dir)) @mkdir($dir, 0775, true);

  $file = $dir . '/' . $bucket . '_' . md5(client_ip()) . '.json';
  $now = time();

  $fp = @fopen($file, 'c+');
  if (!$fp) return; // falha de escrita não deve derrubar a API

  flock($fp, LOCK_EX);
  $raw = stream_get_contents($fp);
  $data = $raw ? json_decode($raw, true) : null;
  if (!is_array($data) || ($data['reset'] ?? 0) < $now) {
    $data = ['count' => 0, 'reset' => $now + RATE_LIMIT_WINDOW];
  }
  $data['count']++;
  $exceeded = $data['count'] > $max;

  ftruncate($fp, 0);
  rewind($fp);
  fwrite($fp, json_encode($data));
  fflush($fp);
  flock($fp, LOCK_UN);
  fclose($fp);

  if ($exceeded) json_error(429, 'Muitas requisições. Tente novamente mais tarde.');
}
