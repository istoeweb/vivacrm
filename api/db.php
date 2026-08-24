<?php
/*
 * Conexão com o banco SQLite (PDO) + criação de schema + migração.
 * Espelha o comportamento do server/db.js da versão Node.
 */

require_once __DIR__ . '/config.php';

function db(): PDO {
  static $pdo = null;
  if ($pdo instanceof PDO) return $pdo;

  $dir = dirname(DB_PATH);
  if (!is_dir($dir)) mkdir($dir, 0775, true);

  $pdo = new PDO('sqlite:' . DB_PATH, null, null, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
  ]);
  $pdo->exec('PRAGMA foreign_keys = ON;');

  criar_schema($pdo);
  migrar_leads($pdo);
  criar_indices($pdo);

  return $pdo;
}

function criar_schema(PDO $pdo): void {
  $pdo->exec("
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','corretor')),
  ativo INTEGER NOT NULL DEFAULT 1,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  cidade TEXT,
  produto TEXT,
  mensagem TEXT,
  origem TEXT DEFAULT 'site',
  status TEXT NOT NULL DEFAULT 'novo' CHECK(status IN ('novo','contato_realizado','proposta_enviada','aguardando_retorno','fechado','desistiu','sem_interesse')),
  corretor_id INTEGER,
  ultimo_contato TEXT,
  proximo_retorno TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (corretor_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cpf_cnpj TEXT,
  telefone TEXT,
  email TEXT,
  cidade TEXT,
  endereco TEXT,
  corretor_id INTEGER,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (corretor_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS apolices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL,
  produto TEXT NOT NULL,
  seguradora TEXT,
  numero TEXT,
  vigencia_inicio TEXT,
  vigencia_fim TEXT,
  premio TEXT,
  status TEXT NOT NULL DEFAULT 'ativa' CHECK(status IN ('ativa','cancelada','renovada','vencida')),
  corretor_id INTEGER,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (corretor_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sinistros (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  apolice_id INTEGER,
  cliente_id INTEGER NOT NULL,
  descricao TEXT,
  data_evento TEXT,
  status TEXT NOT NULL DEFAULT 'aberto' CHECK(status IN ('aberto','em_analise','aprovado','negado','finalizado')),
  corretor_id INTEGER,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (apolice_id) REFERENCES apolices(id) ON DELETE SET NULL,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (corretor_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS agendamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER,
  lead_id INTEGER,
  corretor_id INTEGER,
  data_hora TEXT NOT NULL,
  titulo TEXT NOT NULL,
  observacao TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK(status IN ('pendente','concluido','cancelado')),
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (corretor_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  resumo TEXT,
  conteudo TEXT NOT NULL,
  categoria TEXT,
  imagem_url TEXT,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK(status IN ('rascunho','publicado')),
  autor_id INTEGER,
  publicado_em TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (autor_id) REFERENCES usuarios(id) ON DELETE SET NULL
);
  ");
}

/*
 * Migração: bancos criados antes da revisão do funil de leads têm a coluna
 * `status` com valores antigos e não possuem `ultimo_contato`/`proximo_retorno`.
 * Roda ANTES da criação dos índices (que dependem das colunas novas).
 */
function migrar_leads(PDO $pdo): void {
  $cols = array_column($pdo->query('PRAGMA table_info(leads)')->fetchAll(), 'name');
  if (in_array('ultimo_contato', $cols, true)) return;

  $pdo->exec('PRAGMA foreign_keys = OFF;');
  $pdo->beginTransaction();
  $pdo->exec("
    CREATE TABLE leads_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      telefone TEXT,
      email TEXT,
      cidade TEXT,
      produto TEXT,
      mensagem TEXT,
      origem TEXT DEFAULT 'site',
      status TEXT NOT NULL DEFAULT 'novo' CHECK(status IN ('novo','contato_realizado','proposta_enviada','aguardando_retorno','fechado','desistiu','sem_interesse')),
      corretor_id INTEGER,
      ultimo_contato TEXT,
      proximo_retorno TEXT,
      criado_em TEXT NOT NULL DEFAULT (datetime('now')),
      atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (corretor_id) REFERENCES usuarios(id) ON DELETE SET NULL
    );
  ");
  $pdo->exec("
    INSERT INTO leads_new (id, nome, telefone, email, cidade, produto, mensagem, origem, status, corretor_id, criado_em, atualizado_em)
    SELECT id, nome, telefone, email, cidade, produto, mensagem, origem,
      CASE status
        WHEN 'contatado' THEN 'contato_realizado'
        WHEN 'cotacao_enviada' THEN 'proposta_enviada'
        WHEN 'perdido' THEN 'desistiu'
        ELSE status
      END,
      corretor_id, criado_em, atualizado_em
    FROM leads;
  ");
  $pdo->exec('DROP TABLE leads;');
  $pdo->exec('ALTER TABLE leads_new RENAME TO leads;');
  $pdo->commit();
  $pdo->exec('PRAGMA foreign_keys = ON;');
}

function criar_indices(PDO $pdo): void {
  $pdo->exec("
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_corretor ON leads(corretor_id);
CREATE INDEX IF NOT EXISTS idx_leads_proximo ON leads(proximo_retorno);
CREATE INDEX IF NOT EXISTS idx_apolices_vigencia ON apolices(vigencia_fim);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_hora);
CREATE INDEX IF NOT EXISTS idx_blog_status_data ON blog_posts(status, publicado_em);
CREATE INDEX IF NOT EXISTS idx_blog_categoria ON blog_posts(categoria);
  ");
}
