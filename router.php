<?php
/*
 * Servidor de desenvolvimento local (versão PHP):
 *
 *   C:\xampp\php\php.exe -S localhost:8000 router.php
 *
 * Serve o site estático (raiz), o CRM (/crm) e a API (/api).
 */

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';

// API → front controller PHP
if (preg_match('#^/api(/|$)#', $path)) {
  require __DIR__ . '/api/index.php';
  exit;
}

// Arquivo estático existente → deixa o servidor embutido servir
if ($path !== '/' && is_file(__DIR__ . $path)) {
  return false;
}

// Raiz → página inicial do site
if ($path === '/') {
  header('Content-Type: text/html; charset=utf-8');
  readfile(__DIR__ . '/index.html');
  exit;
}

http_response_code(404);
echo 'Not found';
