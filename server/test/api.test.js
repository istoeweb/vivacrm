'use strict';

// Banco temporário e segredo fixo ANTES de carregar db/app.
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');

const TMP_DB = path.join(os.tmpdir(), `crm-test-${process.pid}-${Date.now()}.db`);
process.env.DB_PATH = TMP_DB;
process.env.JWT_SECRET = 'test-secret-crm';
process.env.NODE_ENV = 'test';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const bcrypt = require('bcrypt');

const db = require('../db');
const app = require('../server');

let server;
let base;
let adminToken;
let corretorToken;
let corretorId;

async function api(method, pathname, { token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(base + pathname, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = null;
  const txt = await res.text();
  try { data = txt ? JSON.parse(txt) : null; } catch { data = txt; }
  return { status: res.status, data };
}

before(async () => {
  // Seed mínimo: admin, corretor e um usuário inativo.
  db.prepare(
    "INSERT INTO usuarios (nome,email,senha_hash,role,ativo) VALUES (?,?,?,'admin',1)"
  ).run('Admin Teste', 'admin@test.com', bcrypt.hashSync('admin123', 10));
  const corretor = db.prepare(
    "INSERT INTO usuarios (nome,email,senha_hash,role,ativo) VALUES (?,?,?,'corretor',1)"
  ).run('Corretor Teste', 'corretor@test.com', bcrypt.hashSync('corretor123', 10));
  corretorId = Number(corretor.lastInsertRowid);
  db.prepare(
    "INSERT INTO usuarios (nome,email,senha_hash,role,ativo) VALUES (?,?,?,'corretor',0)"
  ).run('Inativo', 'inativo@test.com', bcrypt.hashSync('senha123', 10));

  server = app.listen(0);
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}`;

  adminToken = (await api('POST', '/api/auth/login', { body: { email: 'admin@test.com', senha: 'admin123' } })).data.token;
  corretorToken = (await api('POST', '/api/auth/login', { body: { email: 'corretor@test.com', senha: 'corretor123' } })).data.token;
});

after(() => {
  if (server) server.close();
  try { fs.rmSync(TMP_DB, { force: true }); } catch { /* ignore */ }
});

test('health responde ok', async () => {
  const r = await api('GET', '/api/health');
  assert.equal(r.status, 200);
  assert.equal(r.data.ok, true);
});

test('login válido retorna token e usuário', async () => {
  const r = await api('POST', '/api/auth/login', { body: { email: 'admin@test.com', senha: 'admin123' } });
  assert.equal(r.status, 200);
  assert.ok(r.data.token);
  assert.equal(r.data.user.role, 'admin');
});

test('login com senha errada retorna 401', async () => {
  const r = await api('POST', '/api/auth/login', { body: { email: 'admin@test.com', senha: 'errada' } });
  assert.equal(r.status, 401);
});

test('login de usuário inativo retorna 401', async () => {
  const r = await api('POST', '/api/auth/login', { body: { email: 'inativo@test.com', senha: 'senha123' } });
  assert.equal(r.status, 401);
});

test('rota protegida sem token retorna 401', async () => {
  const r = await api('GET', '/api/leads');
  assert.equal(r.status, 401);
});

test('RBAC: corretor não acessa /usuarios (403), admin acessa (200)', async () => {
  const c = await api('GET', '/api/usuarios', { token: corretorToken });
  assert.equal(c.status, 403);
  const a = await api('GET', '/api/usuarios', { token: adminToken });
  assert.equal(a.status, 200);
  assert.ok(Array.isArray(a.data));
});

test('leads CRUD completo + validações', async () => {
  const created = await api('POST', '/api/leads', { body: { nome: 'Lead Teste', telefone: '12988887777', email: 'lead@test.com' } });
  assert.equal(created.status, 201);
  const id = created.data.id;
  assert.ok(id);

  const read = await api('GET', `/api/leads/${id}`, { token: adminToken });
  assert.equal(read.status, 200);
  assert.equal(read.data.status, 'novo');

  const upd = await api('PUT', `/api/leads/${id}`, { token: adminToken, body: { status: 'contato_realizado' } });
  assert.equal(upd.status, 200);
  const read2 = await api('GET', `/api/leads/${id}`, { token: adminToken });
  assert.equal(read2.data.status, 'contato_realizado');

  const bad = await api('PUT', `/api/leads/${id}`, { token: adminToken, body: { status: 'em_contato' } });
  assert.equal(bad.status, 400);

  const del = await api('DELETE', `/api/leads/${id}`, { token: adminToken });
  assert.equal(del.status, 200);
  const gone = await api('GET', `/api/leads/${id}`, { token: adminToken });
  assert.equal(gone.status, 404);
});

test('lead com telefone inválido retorna 400', async () => {
  const r = await api('POST', '/api/leads', { body: { nome: 'X', telefone: 'abc' } });
  assert.equal(r.status, 400);
});

test('paginação retorna envelope {data,total,page,limit}', async () => {
  const r = await api('GET', '/api/leads?page=1&limit=1', { token: adminToken });
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.data.data));
  assert.equal(r.data.page, 1);
  assert.equal(r.data.limit, 1);
  assert.equal(typeof r.data.total, 'number');
});

test('apólices: prêmio textual é normalizado para número', async () => {
  const cli = await api('POST', '/api/clientes', { token: adminToken, body: { nome: 'Cliente Apolice', telefone: '12955554444' } });
  const clienteId = cli.data.id;

  const ap = await api('POST', '/api/apolices', { token: adminToken, body: { cliente_id: clienteId, produto: 'Auto', premio: 'R$ 4.500/ano', status: 'ativa' } });
  assert.equal(ap.status, 201);
  const apId = ap.data.id;

  const list = await api('GET', '/api/apolices', { token: adminToken });
  const found = list.data.find((a) => a.id === apId);
  assert.equal(found.premio, 4500);

  await api('PUT', `/api/apolices/${apId}`, { token: adminToken, body: { premio: '1.234,56' } });
  const list2 = await api('GET', '/api/apolices', { token: adminToken });
  assert.equal(list2.data.find((a) => a.id === apId).premio, 1234.56);
});

test('dashboard expõe métricas novas (receita, conversão, follow-ups)', async () => {
  const r = await api('GET', '/api/dashboard', { token: adminToken });
  assert.equal(r.status, 200);
  assert.equal(typeof r.data.receitaEstimada, 'number');
  assert.ok(r.data.receitaEstimada > 0);
  assert.ok(r.data.taxaConversao >= 0 && r.data.taxaConversao <= 1);
  assert.equal(typeof r.data.agendamentosAtrasados, 'number');
  assert.ok(Array.isArray(r.data.followupsLeads));
});

test('corretor assume lead sem dono; não assume lead de outro', async () => {
  const l1 = await api('POST', '/api/leads', { body: { nome: 'Lead Livre', telefone: '12977001122' } });
  const id1 = l1.data.id;
  const assume = await api('POST', `/api/leads/${id1}/assumir`, { token: corretorToken });
  assert.equal(assume.status, 200);
  assert.equal(assume.data.corretor_id, corretorId);

  const l2 = await api('POST', '/api/leads', { body: { nome: 'Lead do Admin', telefone: '12977003344' } });
  const id2 = l2.data.id;
  await api('PUT', `/api/leads/${id2}`, { token: adminToken, body: { corretor_id: 1 } });
  const conflict = await api('POST', `/api/leads/${id2}/assumir`, { token: corretorToken });
  assert.equal(conflict.status, 409);
});

test('servidor entrega site e CRM sem expor arquivos internos', async () => {
  const site = await fetch(base + '/');
  assert.equal(site.status, 200);
  assert.match(await site.text(), /Vida de Ouro Jacareí/);
  const crm = await fetch(base + '/crm/');
  assert.equal(crm.status, 200);
  const hidden = await fetch(base + '/server/.env');
  assert.equal(hidden.status, 404);
  const database = await fetch(base + '/api/data/crm.db');
  assert.equal(database.status, 404);
  const archive = await fetch(base + '/api.zip');
  assert.equal(archive.status, 404);
});

test('blog: admin gerencia artigos e público vê somente publicados', async () => {
  const denied = await api('GET', '/api/blog/admin', { token: corretorToken });
  assert.equal(denied.status, 403);

  const draft = await api('POST', '/api/blog/admin', { token: adminToken, body: {
    titulo: 'Como escolher um seguro', conteudo: 'Conteúdo de teste.', resumo: 'Resumo', status: 'rascunho'
  }});
  assert.equal(draft.status, 201);
  const id = draft.data.id;

  let publicList = await api('GET', '/api/blog');
  assert.equal(publicList.data.length, 0);

  const published = await api('PUT', `/api/blog/admin/${id}`, { token: adminToken, body: { status: 'publicado' } });
  assert.equal(published.status, 200);
  publicList = await api('GET', '/api/blog');
  assert.equal(publicList.data.length, 1);
  assert.equal(publicList.data[0].slug, 'como-escolher-um-seguro');

  const article = await api('GET', '/api/blog/como-escolher-um-seguro');
  assert.equal(article.status, 200);
  assert.equal(article.data.titulo, 'Como escolher um seguro');

  const removed = await api('DELETE', `/api/blog/admin/${id}`, { token: adminToken });
  assert.equal(removed.status, 200);
});

test('blog: upload de imagem exige admin e valida o arquivo', async () => {
  const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
  const denied = await api('POST', '/api/blog/admin/upload', { token: corretorToken, body: { type: 'image/png', data: png } });
  assert.equal(denied.status, 403);
  const upload = await api('POST', '/api/blog/admin/upload', { token: adminToken, body: { type: 'image/png', data: png } });
  assert.equal(upload.status, 201);
  assert.match(upload.data.url, /^assets\/img\/blog\/.+\.png$/);
  const uploadedPath = path.join(__dirname, '..', '..', upload.data.url);
  assert.equal(fs.existsSync(uploadedPath), true);
  fs.rmSync(uploadedPath, { force: true });
});
