/*
 * Camada de banco com a mesma API assíncrona para dois motores:
 *   - Postgres (Supabase) quando DATABASE_URL está definido;
 *   - SQLite (node:sqlite) caso contrário — desenvolvimento local e testes.
 *   - DB_DRIVER=pglite usa um Postgres embutido em memória (testes do dialeto Postgres).
 *
 * API: await db.get(sql, ...params) → linha | undefined
 *      await db.all(sql, ...params) → linhas
 *      await db.run(sql, ...params) → { changes }
 *      await db.insert(sql, ...params) → { changes, lastInsertRowid }
 *      await db.exec(sql)            → executa SQL sem parâmetros (vários comandos)
 *      db.ready                      → Promise do schema/migrações; aguarde antes de usar
 * O SQL usa placeholders "?" e precisa ser portável entre SQLite e Postgres
 * (sem datetime('now'), INSERT OR IGNORE etc.). Para "agora", use db.now().
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env'), quiet: true });
const path = require('path');
const { parsePremio } = require('./utils');

// Data/hora atual em UTC no formato usado nas colunas de texto ("YYYY-MM-DD HH:MM:SS"),
// o mesmo que o datetime('now') do SQLite gravava.
function now() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

const SQLITE_NOW = "(datetime('now'))";
const PG_NOW = "(to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS'))";

function schema({ id, real, nowDefault }) {
  return `
CREATE TABLE IF NOT EXISTS usuarios (
  id ${id},
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','corretor')),
  ativo INTEGER NOT NULL DEFAULT 1,
  criado_em TEXT NOT NULL DEFAULT ${nowDefault}
);

CREATE TABLE IF NOT EXISTS leads (
  id ${id},
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  cidade TEXT,
  produto TEXT,
  mensagem TEXT,
  origem TEXT DEFAULT 'site',
  status TEXT NOT NULL DEFAULT 'novo' CHECK(status IN ('novo','contato_realizado','proposta_enviada','aguardando_retorno','fechado','desistiu','sem_interesse')),
  corretor_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  ultimo_contato TEXT,
  proximo_retorno TEXT,
  motivo_perda TEXT,
  valor_estimado ${real},
  origem_pagina TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  criado_em TEXT NOT NULL DEFAULT ${nowDefault},
  atualizado_em TEXT NOT NULL DEFAULT ${nowDefault}
);

CREATE TABLE IF NOT EXISTS clientes (
  id ${id},
  nome TEXT NOT NULL,
  cpf_cnpj TEXT,
  telefone TEXT,
  email TEXT,
  cidade TEXT,
  endereco TEXT,
  corretor_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em TEXT NOT NULL DEFAULT ${nowDefault},
  atualizado_em TEXT NOT NULL DEFAULT ${nowDefault}
);

CREATE TABLE IF NOT EXISTS apolices (
  id ${id},
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  produto TEXT NOT NULL,
  seguradora TEXT,
  numero TEXT,
  vigencia_inicio TEXT,
  vigencia_fim TEXT,
  premio ${real},
  status TEXT NOT NULL DEFAULT 'ativa' CHECK(status IN ('ativa','cancelada','renovada','vencida')),
  corretor_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em TEXT NOT NULL DEFAULT ${nowDefault}
);

CREATE TABLE IF NOT EXISTS sinistros (
  id ${id},
  apolice_id INTEGER REFERENCES apolices(id) ON DELETE SET NULL,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  descricao TEXT,
  data_evento TEXT,
  status TEXT NOT NULL DEFAULT 'aberto' CHECK(status IN ('aberto','em_analise','aprovado','negado','finalizado')),
  corretor_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em TEXT NOT NULL DEFAULT ${nowDefault}
);

CREATE TABLE IF NOT EXISTS agendamentos (
  id ${id},
  cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  corretor_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  data_hora TEXT NOT NULL,
  titulo TEXT NOT NULL,
  observacao TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK(status IN ('pendente','concluido','cancelado')),
  criado_em TEXT NOT NULL DEFAULT ${nowDefault}
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id ${id},
  titulo TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  resumo TEXT,
  conteudo TEXT NOT NULL,
  categoria TEXT,
  imagem_url TEXT,
  palavras_chave TEXT,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK(status IN ('rascunho','publicado')),
  autor_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  publicado_em TEXT,
  criado_em TEXT NOT NULL DEFAULT ${nowDefault},
  atualizado_em TEXT NOT NULL DEFAULT ${nowDefault}
);

CREATE TABLE IF NOT EXISTS lead_interacoes (
  id ${id},
  lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK(tipo IN ('nota','ligacao','whatsapp','email','reuniao','proposta','status')),
  descricao TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT ${nowDefault}
);

CREATE TABLE IF NOT EXISTS configuracoes (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL DEFAULT '',
  atualizado_em TEXT NOT NULL DEFAULT ${nowDefault}
);

CREATE TABLE IF NOT EXISTS site_conteudo (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL DEFAULT '',
  atualizado_em TEXT NOT NULL DEFAULT ${nowDefault}
);

CREATE TABLE IF NOT EXISTS produtos (
  id ${id},
  slug TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  grupo TEXT NOT NULL DEFAULT 'seguros' CHECK(grupo IN ('seguros','saude','outros')),
  categoria TEXT,
  tag TEXT,
  tagline TEXT,
  descricao TEXT,
  publico TEXT,
  imagem_url TEXT,
  precos TEXT NOT NULL DEFAULT '[]',
  coberturas TEXT NOT NULL DEFAULT '[]',
  seguradoras TEXT NOT NULL DEFAULT '[]',
  faq TEXT NOT NULL DEFAULT '[]',
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo INTEGER NOT NULL DEFAULT 1,
  criado_em TEXT NOT NULL DEFAULT ${nowDefault},
  atualizado_em TEXT NOT NULL DEFAULT ${nowDefault}
);
`;
}

const INDEXES = `
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
CREATE INDEX IF NOT EXISTS idx_interacoes_lead ON lead_interacoes(lead_id, criado_em);
CREATE INDEX IF NOT EXISTS idx_produtos_grupo ON produtos(grupo, ordem);
`;

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

// Booleanos viram 0/1 (colunas INTEGER) e undefined vira null nos dois motores.
const normParams = (params) => params.map((v) => (typeof v === 'boolean' ? Number(v) : v === undefined ? null : v));

// Converte placeholders "?" em "$1, $2..." (ignora "?" dentro de strings SQL).
function toPg(sql) {
  let n = 0;
  let inString = false;
  let out = '';
  for (const ch of sql) {
    if (ch === "'") inString = !inString;
    out += ch === '?' && !inString ? `$${++n}` : ch;
  }
  return out;
}

function sqliteDriver() {
  const { DatabaseSync } = require('node:sqlite');
  const raw = new DatabaseSync(process.env.DB_PATH || path.join(__dirname, 'crm.db'));
  raw.exec('PRAGMA foreign_keys = ON;');
  return {
    driver: 'sqlite',
    raw,
    async get(sql, ...p) { return raw.prepare(sql).get(...normParams(p)); },
    async all(sql, ...p) { return raw.prepare(sql).all(...normParams(p)); },
    async run(sql, ...p) { return { changes: Number(raw.prepare(sql).run(...normParams(p)).changes) }; },
    async exec(sql) { raw.exec(sql); },
    async close() { raw.close(); },
  };
}

// client: pg.Pool (Supabase) ou PGlite — ambos expõem query(sql, params).
function postgresDriver(client) {
  const query = (sql, p) => client.query(toPg(sql), normParams(p));
  return {
    driver: 'postgres',
    client,
    async get(sql, ...p) { return (await query(sql, p)).rows[0]; },
    async all(sql, ...p) { return (await query(sql, p)).rows; },
    async run(sql, ...p) { const r = await query(sql, p); return { changes: r.rowCount ?? r.affectedRows ?? 0 }; },
    async exec(sql) { await (client.exec ? client.exec(sql) : client.query(sql)); },
    async close() { await (client.end ? client.end() : client.close()); },
  };
}

function createDriver() {
  if (process.env.DATABASE_URL) {
    const { Pool, types } = require('pg');
    types.setTypeParser(20, (v) => parseInt(v, 10)); // COUNT(*) vem como bigint
    // sslmode na URL faz o pg exigir verificação completa do certificado do pooler;
    // a conexão continua criptografada com o ssl abaixo.
    const url = process.env.DATABASE_URL.replace(/([?&])sslmode=[^&]*&?/, '$1').replace(/[?&]$/, '');
    const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
    return postgresDriver(new Pool({
      connectionString: url,
      ssl: local ? false : { rejectUnauthorized: false },
      max: Number(process.env.PG_POOL_MAX) || 5,
    }));
  }
  if (process.env.DB_DRIVER === 'pglite') {
    const { PGlite } = require('@electric-sql/pglite');
    return postgresDriver(new PGlite({ parsers: { 20: (v) => parseInt(v, 10) } }));
  }
  return sqliteDriver();
}

/*
 * Migrações de bancos SQLite antigos (anteriores ao Postgres). No Postgres o
 * schema já nasce no formato final.
 */
function migrateLegacySqlite(raw) {
  // Leads: status antigos e sem ultimo_contato/proximo_retorno → reconstrói a tabela.
  const leadCols = raw.prepare('PRAGMA table_info(leads)').all().map((c) => c.name);
  if (!leadCols.includes('ultimo_contato')) {
    raw.exec('PRAGMA foreign_keys = OFF; BEGIN;');
    raw.exec(schema({ id: 'INTEGER PRIMARY KEY AUTOINCREMENT', real: 'REAL', nowDefault: SQLITE_NOW })
      .match(/CREATE TABLE IF NOT EXISTS leads \([\s\S]*?\n\);/)[0].replace('IF NOT EXISTS leads', 'leads_new'));
    raw.exec(`
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
      DROP TABLE leads;
      ALTER TABLE leads_new RENAME TO leads;
      COMMIT; PRAGMA foreign_keys = ON;`);
    console.log('Migração de leads aplicada (novos status + campos de contato).');
  }

  // Apólices: premio TEXT (ex.: "R$ 4.500/ano") → REAL normalizado.
  const premioCol = raw.prepare('PRAGMA table_info(apolices)').all().find((c) => c.name === 'premio');
  if (premioCol && premioCol.type.toUpperCase() !== 'REAL') {
    const oldRows = raw.prepare('SELECT id, premio FROM apolices').all();
    raw.exec('PRAGMA foreign_keys = OFF; BEGIN;');
    raw.exec(schema({ id: 'INTEGER PRIMARY KEY AUTOINCREMENT', real: 'REAL', nowDefault: SQLITE_NOW })
      .match(/CREATE TABLE IF NOT EXISTS apolices \([\s\S]*?\n\);/)[0].replace('IF NOT EXISTS apolices', 'apolices_new'));
    raw.exec(`
      INSERT INTO apolices_new (id, cliente_id, produto, seguradora, numero, vigencia_inicio, vigencia_fim, premio, status, corretor_id, criado_em)
      SELECT id, cliente_id, produto, seguradora, numero, vigencia_inicio, vigencia_fim, NULL, status, corretor_id, criado_em
      FROM apolices;`);
    const upd = raw.prepare('UPDATE apolices_new SET premio = ? WHERE id = ?');
    for (const r of oldRows) upd.run(parsePremio(r.premio), r.id);
    raw.exec('DROP TABLE apolices; ALTER TABLE apolices_new RENAME TO apolices; COMMIT; PRAGMA foreign_keys = ON;');
    console.log('Migração de apólices aplicada (premio TEXT -> REAL).');
  }

  // Blog: coluna palavras_chave (recurso de SEO).
  const blogCols = raw.prepare('PRAGMA table_info(blog_posts)').all().map((c) => c.name);
  if (!blogCols.includes('palavras_chave')) {
    raw.exec('ALTER TABLE blog_posts ADD COLUMN palavras_chave TEXT;');
    console.log('Migração de blog aplicada (coluna palavras_chave).');
  }
}

/*
 * Colunas adicionadas depois da criação das tabelas. Bancos novos já as recebem
 * no CREATE TABLE; bancos existentes (inclusive o Supabase) ganham via ALTER.
 */
const ADDED_COLUMNS = {
  leads: {
    motivo_perda: 'TEXT', valor_estimado: 'REAL', origem_pagina: 'TEXT',
    utm_source: 'TEXT', utm_medium: 'TEXT', utm_campaign: 'TEXT',
  },
};

async function addMissingColumns(db) {
  for (const [table, cols] of Object.entries(ADDED_COLUMNS)) {
    if (db.driver === 'sqlite') {
      const existing = db.raw.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
      for (const [col, type] of Object.entries(cols)) {
        if (!existing.includes(col)) db.raw.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);
      }
    } else {
      // IF NOT EXISTS: várias instâncias serverless podem iniciar ao mesmo tempo.
      for (const [col, type] of Object.entries(cols)) {
        await db.exec(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${col} ${type === 'REAL' ? 'DOUBLE PRECISION' : type}`);
      }
    }
  }
}

async function init(db) {
  if (db.driver === 'sqlite') {
    db.raw.exec(schema({ id: 'INTEGER PRIMARY KEY AUTOINCREMENT', real: 'REAL', nowDefault: SQLITE_NOW }));
    migrateLegacySqlite(db.raw);
  } else {
    await db.exec(schema({ id: 'INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY', real: 'DOUBLE PRECISION', nowDefault: PG_NOW }));
  }
  await addMissingColumns(db);
  await db.exec(INDEXES);

  for (const [chave, valor] of Object.entries(SITE_CONTENT_DEFAULTS)) {
    await db.run('INSERT INTO site_conteudo (chave, valor) VALUES (?, ?) ON CONFLICT (chave) DO NOTHING', chave, valor);
  }
  // Migração única: bancos semeados antes de termos e-mail e endereço completo
  // recebem os dados atuais, sem sobrescrever o que já foi editado no painel.
  // A marca '_migr.contato_v1' impede que rode de novo (chaves com '_' não são públicas).
  const done = await db.get("SELECT 1 AS ok FROM site_conteudo WHERE chave = '_migr.contato_v1'");
  if (!done) {
    const upd = 'UPDATE site_conteudo SET valor = ? WHERE chave = ? AND valor = ?';
    await db.run(upd, SITE_CONTENT_DEFAULTS['contato.email'], 'contato.email', '');
    await db.run(upd, SITE_CONTENT_DEFAULTS['contato.endereco'], 'contato.endereco', 'Jacareí – SP · Vale do Paraíba');
    await db.run("INSERT INTO site_conteudo (chave, valor) VALUES ('_migr.contato_v1', '1') ON CONFLICT (chave) DO NOTHING");
  }

  // Catálogo de produtos: um banco novo recebe os produtos atuais do site.
  await require('./produtos').seedIfEmpty(db);
}

const db = createDriver();
db.now = now;
db.insert = async (sql, ...params) => {
  const row = await db.get(`${sql} RETURNING id`, ...params);
  return { changes: 1, lastInsertRowid: row.id };
};
db.ready = init(db);
db.ready.catch((err) => console.error('Falha ao preparar o banco de dados:', err));

module.exports = db;
