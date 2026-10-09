const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'crm.db');
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
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
  premio REAL,
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
  palavras_chave TEXT,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK(status IN ('rascunho','publicado')),
  autor_id INTEGER,
  publicado_em TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (autor_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS site_conteudo (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL DEFAULT '',
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

/*
 * Conteúdo editável do site (CMS-lite). Semeia os valores padrão atuais do site
 * apenas se ainda não existirem, para não sobrescrever edições feitas no painel.
 */
const SITE_CONTENT_DEFAULTS = {
  'contato.whatsapp': '5512976002718',
  'contato.telefone': '(12) 97600-2718',
  'contato.telefone_fixo': '(12) 3351-3875',
  'contato.email': 'jacarei@vidadeouro.com.br',
  'contato.endereco': 'Rua Dr. Pompílio Mercadante, 398, Sala 2010 – Boulevard Office Mall, Jacareí – SP',
  'social.instagram': '',
  'social.facebook': '',
};
{
  const insertContent = db.prepare('INSERT OR IGNORE INTO site_conteudo (chave, valor) VALUES (?, ?)');
  for (const [chave, valor] of Object.entries(SITE_CONTENT_DEFAULTS)) insertContent.run(chave, valor);

  // Migração única: bancos semeados antes de termos e-mail e endereço completo
  // recebem os dados atuais, sem sobrescrever o que já foi editado no painel.
  // A marca '_migr.contato_v1' impede que rode de novo (chaves com '_' não são públicas).
  const done = db.prepare("SELECT 1 FROM site_conteudo WHERE chave = '_migr.contato_v1'").get();
  if (!done) {
    const upd = db.prepare('UPDATE site_conteudo SET valor = ? WHERE chave = ? AND valor = ?');
    upd.run(SITE_CONTENT_DEFAULTS['contato.email'], 'contato.email', '');
    upd.run(SITE_CONTENT_DEFAULTS['contato.endereco'], 'contato.endereco', 'Jacareí – SP · Vale do Paraíba');
    db.prepare("INSERT INTO site_conteudo (chave, valor) VALUES ('_migr.contato_v1', '1')").run();
  }
}

/*
 * Migração: bancos criados antes da revisão do funil de leads têm a coluna
 * `status` com os valores antigos e não possuem `ultimo_contato`/`proximo_retorno`.
 * Reconstruímos a tabela preservando os dados e mapeando os status antigos.
 * Essa migração roda ANTES da criação dos índices, pois estes dependem das
 * colunas novas (`proximo_retorno`). Em bancos novos a migração é no-op.
 */
const leadCols = db.prepare('PRAGMA table_info(leads)').all().map((c) => c.name);
if (!leadCols.includes('ultimo_contato')) {
  db.exec('PRAGMA foreign_keys = OFF;');
  db.exec('BEGIN;');
  db.exec(`
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
  `);
  db.exec(`
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
  `);
  db.exec('DROP TABLE leads;');
  db.exec('ALTER TABLE leads_new RENAME TO leads;');
  db.exec('COMMIT;');
  db.exec('PRAGMA foreign_keys = ON;');
  console.log('Migração de leads aplicada (novos status + campos de contato).');
}

db.exec(`
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_corretor ON leads(corretor_id);
CREATE INDEX IF NOT EXISTS idx_leads_proximo ON leads(proximo_retorno);
CREATE INDEX IF NOT EXISTS idx_leads_criado ON leads(criado_em);
CREATE INDEX IF NOT EXISTS idx_clientes_corretor ON clientes(corretor_id);
CREATE INDEX IF NOT EXISTS idx_clientes_criado ON clientes(criado_em);
CREATE INDEX IF NOT EXISTS idx_apolices_vigencia ON apolices(vigencia_fim);
CREATE INDEX IF NOT EXISTS idx_apolices_corretor ON apolices(corretor_id);
CREATE INDEX IF NOT EXISTS idx_apolices_cliente ON apolices(cliente_id);
CREATE INDEX IF NOT EXISTS idx_apolices_status ON apolices(status);
CREATE INDEX IF NOT EXISTS idx_apolices_criado ON apolices(criado_em);
CREATE INDEX IF NOT EXISTS idx_sinistros_corretor ON sinistros(corretor_id);
CREATE INDEX IF NOT EXISTS idx_sinistros_cliente ON sinistros(cliente_id);
CREATE INDEX IF NOT EXISTS idx_sinistros_apolice ON sinistros(apolice_id);
CREATE INDEX IF NOT EXISTS idx_sinistros_criado ON sinistros(criado_em);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_hora);
CREATE INDEX IF NOT EXISTS idx_agendamentos_corretor ON agendamentos(corretor_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente ON agendamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_lead ON agendamentos(lead_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_blog_status_data ON blog_posts(status, publicado_em);
CREATE INDEX IF NOT EXISTS idx_blog_categoria ON blog_posts(categoria);
`);

/*
 * Migração: bancos antigos guardavam `premio` como TEXT (ex.: "R$ 4.500/ano").
 * Convertemos a coluna para REAL, normalizando os valores existentes para número
 * (reais). Em bancos novos (premio já REAL) a migração é no-op.
 */
const { parsePremio } = require('./utils');
const premioCol = db.prepare('PRAGMA table_info(apolices)').all().find((c) => c.name === 'premio');
if (premioCol && premioCol.type.toUpperCase() !== 'REAL') {
  const oldRows = db.prepare('SELECT id, premio FROM apolices').all();
  db.exec('PRAGMA foreign_keys = OFF;');
  db.exec('BEGIN;');
  db.exec(`
    CREATE TABLE apolices_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      produto TEXT NOT NULL,
      seguradora TEXT,
      numero TEXT,
      vigencia_inicio TEXT,
      vigencia_fim TEXT,
      premio REAL,
      status TEXT NOT NULL DEFAULT 'ativa' CHECK(status IN ('ativa','cancelada','renovada','vencida')),
      corretor_id INTEGER,
      criado_em TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
      FOREIGN KEY (corretor_id) REFERENCES usuarios(id) ON DELETE SET NULL
    );
  `);
  db.exec(`
    INSERT INTO apolices_new (id, cliente_id, produto, seguradora, numero, vigencia_inicio, vigencia_fim, premio, status, corretor_id, criado_em)
    SELECT id, cliente_id, produto, seguradora, numero, vigencia_inicio, vigencia_fim, NULL, status, corretor_id, criado_em
    FROM apolices;
  `);
  const upd = db.prepare('UPDATE apolices_new SET premio = ? WHERE id = ?');
  for (const r of oldRows) upd.run(parsePremio(r.premio), r.id);
  db.exec('DROP TABLE apolices;');
  db.exec('ALTER TABLE apolices_new RENAME TO apolices;');
  db.exec('COMMIT;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('CREATE INDEX IF NOT EXISTS idx_apolices_vigencia ON apolices(vigencia_fim);');
  console.log('Migração de apólices aplicada (premio TEXT -> REAL).');
}

/*
 * Migração: bancos criados antes do recurso de SEO não têm a coluna
 * `palavras_chave` em blog_posts. Adiciona-a de forma idempotente.
 */
const blogCols = db.prepare('PRAGMA table_info(blog_posts)').all().map((c) => c.name);
if (!blogCols.includes('palavras_chave')) {
  db.exec('ALTER TABLE blog_posts ADD COLUMN palavras_chave TEXT;');
  console.log('Migração de blog aplicada (coluna palavras_chave).');
}

module.exports = db;
