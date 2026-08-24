<?php
/*
 * Configuração do CRM (versão PHP).
 * Ajuste antes de ir para produção.
 */

// Segredo usado para assinar os tokens JWT. TROQUE em produção!
// Gere um forte com: php -r "echo bin2hex(random_bytes(48));"
// Também pode ser definido pela variável de ambiente JWT_SECRET.
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'vida-de-ouro-crm-dev-secret-change-me');

// Caminho do banco SQLite (arquivo único — faça backup dele).
// Dica: para aproveitar os dados da versão Node, copie server/crm.db para api/data/crm.db
define('DB_PATH', __DIR__ . '/data/crm.db');

// Origens permitidas no CORS, separadas por vírgula (vazio = libera geral, uso em dev).
// Ex.: https://vidadeouro.com.br,https://www.vidadeouro.com.br
define('ALLOWED_ORIGINS', getenv('ALLOWED_ORIGINS') ?: '');

// Rate limiting (requisições por janela de 15 minutos)
define('RATE_LIMIT_API', 300);     // API em geral
define('RATE_LIMIT_PUBLIC', 20);   // endpoints públicos (POST /api/leads e login)
define('RATE_LIMIT_WINDOW', 900);  // 15 min em segundos

// Token JWT expira em 12h
define('TOKEN_TTL', 12 * 3600);
