'use strict';

// Banco temporário e segredo fixo ANTES de carregar db/app.
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');

const TMP_DB = path.join(os.tmpdir(), `crm-test-${process.pid}-${Date.now()}.db`);
process.env.DB_PATH = TMP_DB;
// Nunca usar o Supabase do server/.env nos testes: string vazia impede o dotenv
// de preencher. DB_DRIVER=pglite roda a suíte no dialeto Postgres (em memória).
process.env.DATABASE_URL = '';
process.env.SUPABASE_URL = '';
process.env.SUPABASE_SERVICE_ROLE_KEY = '';
// E-mails ficam em memória (mailer.outbox), nunca são enviados.
process.env.MAIL_TRANSPORT = 'memory';
process.env.SMTP_HOST = '';
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
  await db.ready;
  // Seed mínimo: admin, corretor e um usuário inativo.
  await db.insert(
    "INSERT INTO usuarios (nome,email,senha_hash,role,ativo) VALUES (?,?,?,'admin',1)",
    'Admin Teste', 'admin@test.com', bcrypt.hashSync('admin123', 10));
  const corretor = await db.insert(
    "INSERT INTO usuarios (nome,email,senha_hash,role,ativo) VALUES (?,?,?,'corretor',1)",
    'Corretor Teste', 'corretor@test.com', bcrypt.hashSync('corretor123', 10));
  corretorId = Number(corretor.lastInsertRowid);
  await db.insert(
    "INSERT INTO usuarios (nome,email,senha_hash,role,ativo) VALUES (?,?,?,'corretor',0)",
    'Inativo', 'inativo@test.com', bcrypt.hashSync('senha123', 10));

  server = app.listen(0);
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}`;

  adminToken = (await api('POST', '/api/auth/login', { body: { email: 'admin@test.com', senha: 'admin123' } })).data.token;
  corretorToken = (await api('POST', '/api/auth/login', { body: { email: 'corretor@test.com', senha: 'corretor123' } })).data.token;
});

after(async () => {
  if (server) server.close();
  await db.close();
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

test('corretor enxerga a fila de leads sem dono, mas não os de outro corretor', async () => {
  const livre = await api('POST', '/api/leads', { body: { nome: 'Lead Na Fila', telefone: '12977005566' } });
  const alheio = await api('POST', '/api/leads', { body: { nome: 'Lead de Outro', telefone: '12977007788' } });
  await api('PUT', `/api/leads/${alheio.data.id}`, { token: adminToken, body: { corretor_id: 1 } });

  const lista = await api('GET', '/api/leads', { token: corretorToken });
  assert.equal(lista.status, 200);
  const ids = lista.data.map((l) => l.id);
  assert.ok(ids.includes(livre.data.id), 'lead sem dono deve aparecer na fila do corretor');
  assert.ok(!ids.includes(alheio.data.id), 'lead de outro corretor não pode vazar');

  // O detalhe segue a mesma regra da listagem.
  const detalhe = await api('GET', `/api/leads/${livre.data.id}`, { token: corretorToken });
  assert.equal(detalhe.status, 200);
  const negado = await api('GET', `/api/leads/${alheio.data.id}`, { token: corretorToken });
  assert.equal(negado.status, 403);
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
    titulo: 'Como escolher um seguro', conteudo: 'Conteúdo de teste.', resumo: 'Resumo', status: 'rascunho',
    palavras_chave: 'Seguro Auto, seguro auto ,  proteção veicular'
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
  // palavras_chave são sanitizadas: trim + dedupe case-insensitive preservando ordem
  assert.equal(article.data.palavras_chave, 'Seguro Auto, proteção veicular');

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

test('site: conteúdo público, RBAC de edição e atualização em lote', async () => {
  // Público lê os valores padrão semeados
  const pub = await api('GET', '/api/site/content');
  assert.equal(pub.status, 200);
  assert.equal(pub.data['contato.whatsapp'], '5512976002718');
  assert.equal(pub.data['contato.telefone'], '(12) 97600-2718');

  // Corretor não pode ver o admin nem editar
  assert.equal((await api('GET', '/api/site/admin', { token: corretorToken })).status, 403);
  assert.equal((await api('PUT', '/api/site/admin', { token: corretorToken, body: { 'contato.email': 'x@y.com' } })).status, 403);

  // Admin vê campos + valores
  const adminView = await api('GET', '/api/site/admin', { token: adminToken });
  assert.equal(adminView.status, 200);
  assert.ok(Array.isArray(adminView.data.fields) && adminView.data.fields.length > 0);

  // Admin atualiza em lote; chaves desconhecidas são ignoradas
  const upd = await api('PUT', '/api/site/admin', { token: adminToken, body: {
    'contato.whatsapp': ' 5512999998888 ', 'contato.email': 'contato@vidadeouro.com.br', 'chave.invalida': 'nao_deve_entrar'
  }});
  assert.equal(upd.status, 200);
  assert.equal(upd.data.values['contato.whatsapp'], '5512999998888');
  assert.equal(upd.data.values['contato.email'], 'contato@vidadeouro.com.br');
  assert.equal('chave.invalida' in upd.data.values, false);

  // Reflete no endpoint público
  const pub2 = await api('GET', '/api/site/content');
  assert.equal(pub2.data['contato.whatsapp'], '5512999998888');
});

test('artigo.html já vem com título e tags de prévia (Open Graph) do artigo', async () => {
  const created = await api('POST', '/api/blog/admin', { token: adminToken, body: {
    titulo: 'Seguro "auto" <barato>', conteudo: 'Texto.', resumo: 'Resumo & dicas', status: 'publicado',
    imagem_url: 'assets/img/blog/foto.jpg',
  }});
  assert.equal(created.status, 201);

  const page = await fetch(`${base}/artigo.html?slug=seguro-auto-barato`);
  const html = await page.text();
  assert.equal(page.status, 200);
  assert.match(html, /<title>Seguro &quot;auto&quot; &lt;barato&gt; \| Vida de Ouro Jacareí<\/title>/);
  assert.match(html, /<meta property="og:title" content="Seguro &quot;auto&quot; &lt;barato&gt;">/);
  assert.match(html, /<meta property="og:description" content="Resumo &amp; dicas">/);
  assert.match(html, new RegExp(`<meta property="og:image" content="${base}/assets/img/blog/foto.jpg">`));
  assert.match(html, /"@type":"BlogPosting"/);
  assert.doesNotMatch(html, /<barato>/);

  // Slug inexistente ou rascunho: página padrão, sem tags do artigo
  const fallback = await (await fetch(`${base}/artigo.html?slug=nao-existe`)).text();
  assert.match(fallback, /<title>Artigo \| Vida de Ouro Jacareí<\/title>/);
  assert.doesNotMatch(fallback, /og:title/);

  await api('DELETE', `/api/blog/admin/${created.data.id}`, { token: adminToken });
});

test('produtos: banco novo recebe o catálogo do site e o público só vê os ativos', async () => {
  const lista = await api('GET', '/api/produtos');
  assert.equal(lista.status, 200);
  assert.ok(lista.data.length >= 20, 'catálogo estático deve ser semeado');
  const auto = lista.data.find((p) => p.slug === 'seguro-auto');
  assert.equal(auto.grupo, 'seguros');
  assert.equal(lista.data.find((p) => p.slug === 'consorcios').grupo, 'outros');
  assert.equal(lista.data.find((p) => p.slug === 'unimed').grupo, 'saude');

  const um = await api('GET', '/api/produtos/unimed');
  assert.equal(um.status, 200);
  assert.ok(um.data.precos.length > 0);
  assert.ok(um.data.faq.length > 0);
  assert.equal(um.data.id, undefined, 'API pública não expõe campos internos');
  assert.equal((await api('GET', '/api/produtos/nao-existe')).status, 404);
});

test('produtos: só admin gerencia; criar, validar, ocultar, editar e excluir', async () => {
  assert.equal((await api('GET', '/api/produtos/admin')).status, 401);
  assert.equal((await api('GET', '/api/produtos/admin', { token: corretorToken })).status, 403);
  assert.equal((await api('POST', '/api/produtos/admin', { token: corretorToken, body: { nome: 'X' } })).status, 403);

  assert.equal((await api('POST', '/api/produtos/admin', { token: adminToken, body: { nome: '' } })).status, 400);
  assert.equal((await api('POST', '/api/produtos/admin', { token: adminToken, body: { nome: 'Img', imagem_url: 'javascript:alert(1)' } })).status, 400);

  const criado = await api('POST', '/api/produtos/admin', { token: adminToken, body: {
    nome: 'Seguro Pet', grupo: 'invalido', ordem: 5, ativo: true,
    precos: [{ rotulo: 'Cães', valor: 'R$ 39,90' }, { rotulo: '', valor: '' }],
    coberturas: [{ t: 'Consultas', d: 'Rede veterinária' }],
    seguradoras: ['Porto', '', 'Tokio'],
    faq: [{ q: 'Cobre vacina?', a: 'Sim.' }],
    palavras_chave: 'Seguro Pet, seguro pet ,  plano veterinário, ,',
  }});
  assert.equal(criado.status, 201);
  assert.equal(criado.data.slug, 'seguro-pet');
  const id = criado.data.id;

  const lido = (await api('GET', `/api/produtos/admin/${id}`, { token: adminToken })).data;
  assert.equal(lido.grupo, 'seguros', 'grupo inválido cai no padrão');
  assert.equal(lido.precos.length, 1, 'linhas vazias são descartadas');
  assert.deepEqual(lido.seguradoras, ['Porto', 'Tokio']);
  assert.equal(lido.palavras_chave, 'Seguro Pet, plano veterinário', 'palavras-chave sem vazias nem repetidas');

  // Endereço repetido
  assert.equal((await api('POST', '/api/produtos/admin', { token: adminToken, body: { nome: 'Outro', slug: 'seguro-pet' } })).status, 409);

  // Ocultar: some da API pública e a página responde 404
  assert.equal((await api('PUT', `/api/produtos/admin/${id}`, { token: adminToken, body: { ativo: false } })).status, 200);
  assert.equal((await api('GET', '/api/produtos/seguro-pet')).status, 404);
  assert.ok(!(await api('GET', '/api/produtos')).data.some((p) => p.slug === 'seguro-pet'));
  const oculto = (await api('GET', `/api/produtos/admin/${id}`, { token: adminToken })).data;
  assert.equal(oculto.precos.length, 1, 'edição parcial preserva o restante');
  assert.equal(oculto.palavras_chave, 'Seguro Pet, plano veterinário', 'edição parcial preserva as palavras-chave');

  // Editar e reativar
  const edit = await api('PUT', `/api/produtos/admin/${id}`, { token: adminToken, body: { ativo: true, tagline: 'Proteção para o seu pet' } });
  assert.equal(edit.status, 200);
  assert.equal((await api('GET', '/api/produtos/seguro-pet')).data.tagline, 'Proteção para o seu pet');

  assert.equal((await api('DELETE', `/api/produtos/admin/${id}`, { token: adminToken })).status, 200);
  assert.equal((await api('DELETE', `/api/produtos/admin/${id}`, { token: adminToken })).status, 404);
});

test('produto.html vem montada no servidor com o conteúdo do banco', async () => {
  const criado = await api('POST', '/api/produtos/admin', { token: adminToken, body: {
    nome: 'Seguro "Bike" <top>', slug: 'seguro-bike', tagline: 'Pedale & relaxe', descricao: 'Texto </script><script>alert(1)</script>',
    precos: [{ rotulo: 'PF', valor: 'R$ 19,90' }], imagem_url: 'assets/img/produtos/bike.jpg',
    palavras_chave: 'seguro bike, "bicicleta" <elétrica>',
  }});
  assert.equal(criado.status, 201);

  const page = await fetch(`${base}/produto.html?slug=seguro-bike`);
  const html = await page.text();
  assert.equal(page.status, 200);
  assert.match(html, /<title id="pageTitle">Seguro &quot;Bike&quot; &lt;top&gt; \| Vida de Ouro Jacareí<\/title>/);
  assert.match(html, /<h1 id="pageH1">Seguro &quot;Bike&quot; &lt;top&gt;<\/h1>/);
  assert.match(html, /<p id="pageTagline">Pedale &amp; relaxe<\/p>/);
  assert.match(html, /<meta property="og:title" id="ogTitle" content="Seguro &quot;Bike&quot; &lt;top&gt; \| Vida de Ouro Jacareí"/);
  assert.match(html, new RegExp(`<meta property="og:image" content="${base}/assets/img/produtos/bike.jpg" ?/?>`));
  assert.match(html, /<meta name="keywords" content="seguro bike, &quot;bicicleta&quot; &lt;elétrica&gt;" \/>/);
  assert.match(html, /"@type":"Service"/);
  assert.match(html, /window\.PRODUTOS = \{"seguro-bike":/);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/, 'conteúdo não pode fechar a tag script');
  assert.doesNotMatch(html, /assets\/js\/produtos\.js/);

  const missing = await fetch(`${base}/produto.html?slug=nao-existe`);
  assert.equal(missing.status, 404);
  assert.match(await missing.text(), /<meta name="robots" content="noindex">/);

  // sitemap lista o produto ativo e deixa de listar quando oculto
  let xml = await (await fetch(`${base}/sitemap.xml`)).text();
  assert.match(xml, /produto\.html\?slug=seguro-bike/);
  await api('PUT', `/api/produtos/admin/${criado.data.id}`, { token: adminToken, body: { ativo: false } });
  xml = await (await fetch(`${base}/sitemap.xml`)).text();
  assert.doesNotMatch(xml, /produto\.html\?slug=seguro-bike/);
  assert.match(xml, /produto\.html\?slug=seguro-auto/);

  // Produto sem palavras-chave não ganha meta keywords vazia
  const semKw = await (await fetch(`${base}/produto.html?slug=seguro-auto`)).text();
  assert.doesNotMatch(semKw, /<meta name="keywords"/);

  await api('DELETE', `/api/produtos/admin/${criado.data.id}`, { token: adminToken });
});

test('páginas editáveis: catálogo, permissões e validação', async () => {
  assert.equal((await api('GET', '/api/site/admin/paginas')).status, 401);
  assert.equal((await api('GET', '/api/site/admin/paginas', { token: corretorToken })).status, 403);

  const r = await api('GET', '/api/site/admin/paginas', { token: adminToken });
  assert.equal(r.status, 200);
  const ids = r.data.paginas.map((p) => p.id);
  for (const id of ['home', 'sobre', 'contato', 'politica', 'blog', 'produto', 'global']) assert.ok(ids.includes(id), `página ${id}`);
  const home = r.data.paginas.find((p) => p.id === 'home');
  const titulo = home.campos.find((c) => c.key === 'home.topo.titulo');
  assert.match(titulo.padrao, /\*\*Vale do Paraíba\*\*/, 'destaque vira **texto** no editor');
  assert.equal(titulo.personalizado, false);
  const faq = home.campos.find((c) => c.key === 'home.faq.lista');
  assert.equal(faq.type, 'list');
  assert.ok(faq.padrao.length >= 5);
  assert.ok(home.campos.some((c) => c.key === 'home.seo.titulo'));

  assert.equal((await api('PUT', '/api/site/admin/paginas', { token: adminToken, body: { valores: { 'nao.existe': 'x' } } })).status, 400);
  assert.equal((await api('PUT', '/api/site/admin/paginas', { token: adminToken, body: { valores: { 'home.faq.lista': 'texto' } } })).status, 400);
  assert.equal((await api('PUT', '/api/site/admin/paginas', { token: corretorToken, body: { valores: {} } })).status, 403);
});

test('páginas editáveis: salvar, aplicar no HTML do servidor e restaurar', async () => {
  const valores = {
    'home.topo.titulo': 'Seguro **barato** <script>alert(1)</script>',
    'home.seo.titulo': 'Corretora & Cia',
    'home.faq.lista': [{ pergunta: 'Pergunta nova?', resposta: 'Linha 1\nLinha 2' }],
    'politica.texto1': '## Seção nova\n\nTexto com [link](javascript:alert(1)) e [contato](contato.html).\n\n- item a\n- item b',
    'global.rodape.susep': 'SUSEP 123',
  };
  const salvo = await api('PUT', '/api/site/admin/paginas', { token: adminToken, body: { valores } });
  assert.equal(salvo.status, 200);
  assert.equal(salvo.data.gravados, 5);

  const home = await (await fetch(`${base}/`)).text();
  assert.match(home, /Seguro <strong>barato<\/strong> &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(home, /<script>alert\(1\)<\/script>/);
  assert.match(home, /<title>Corretora &amp; Cia<\/title>/);
  assert.match(home, /Pergunta nova\?/);
  assert.match(home, /Linha 1<br>Linha 2/);
  assert.equal((home.match(/class="faq__item"/g) || []).length, 1, 'lista com um item');
  assert.match(home, /SUSEP 123/);

  const pol = await (await fetch(`${base}/politica-de-privacidade.html`)).text();
  assert.match(pol, /<h2>Seção nova<\/h2>/);
  assert.match(pol, /<li>item a<\/li>/);
  assert.match(pol, /<a href="#">link<\/a>/, 'link javascript: é neutralizado');
  assert.match(pol, /<a href="contato\.html">contato<\/a>/);
  const sobre = await (await fetch(`${base}/sobre.html`)).text();
  assert.match(sobre, /SUSEP 123/, 'rodapé global vale em todas as páginas');

  const prod = await (await fetch(`${base}/produto.html?slug=seguro-auto`)).text();
  assert.match(prod, /SUSEP 123/, 'página de produto também recebe o rodapé');

  const lido = await api('GET', '/api/site/admin/paginas', { token: adminToken });
  const t = lido.data.paginas.find((p) => p.id === 'home').campos.find((c) => c.key === 'home.topo.titulo');
  assert.equal(t.personalizado, true);
  assert.equal(t.valor, valores['home.topo.titulo']);

  // Restaurar: null ou valor igual ao original apagam a personalização.
  const restaurar = Object.fromEntries(Object.keys(valores).map((k) => [k, null]));
  restaurar['home.topo.titulo'] = t.padrao;
  const rest = await api('PUT', '/api/site/admin/paginas', { token: adminToken, body: { valores: restaurar } });
  assert.equal(rest.data.restaurados, 5);
  const homeOriginal = await (await fetch(`${base}/`)).text();
  assert.match(homeOriginal, /<strong>Vale do Paraíba<\/strong>/);
  assert.doesNotMatch(homeOriginal, /SUSEP 123/);
  const row = await db.get("SELECT COUNT(*) AS n FROM site_conteudo WHERE chave LIKE 'pg.%'");
  assert.equal(Number(row.n), 0);
});

test('páginas editáveis: palavras-chave (SEO)', async () => {
  const lista = await api('GET', '/api/site/admin/paginas', { token: adminToken });
  const kwHome = lista.data.paginas.find((p) => p.id === 'home').campos.find((c) => c.key === 'home.seo.palavras_chave');
  assert.ok(kwHome && kwHome.keywords, 'campo de palavras-chave na página inicial');
  assert.match(kwHome.padrao, /seguro auto Jacareí/, 'padrão vem da meta keywords do HTML');
  assert.ok(lista.data.paginas.find((p) => p.id === 'sobre').campos.some((c) => c.key === 'sobre.seo.palavras_chave'));

  const salvo = await api('PUT', '/api/site/admin/paginas', { token: adminToken, body: { valores: {
    'home.seo.palavras_chave': 'Seguro Pet, seguro pet ,  "bike" <elétrica>, ,',
    'sobre.seo.palavras_chave': 'corretora Jacareí',
  } } });
  assert.equal(salvo.status, 200);
  const home = await (await fetch(`${base}/`)).text();
  assert.match(home, /<meta name="keywords" content="Seguro Pet, &quot;bike&quot; &lt;elétrica&gt;" \/>/, 'limpa, sem repetidas e escapada');
  const sobre = await (await fetch(`${base}/sobre.html`)).text();
  assert.match(sobre, /<meta name="keywords" content="corretora Jacareí" \/>/, 'cria a meta keywords quando a página não tem');

  await api('PUT', '/api/site/admin/paginas', { token: adminToken, body: { valores: { 'home.seo.palavras_chave': '' } } });
  assert.doesNotMatch(await (await fetch(`${base}/`)).text(), /<meta name="keywords"/, 'vazio remove a meta keywords');

  await api('PUT', '/api/site/admin/paginas', { token: adminToken, body: { valores: { 'home.seo.palavras_chave': null, 'sobre.seo.palavras_chave': null } } });
  assert.match(await (await fetch(`${base}/`)).text(), /<meta name="keywords" content="seguro auto Jacareí/);
});

test('dashboard do corretor: filtros por dono e janelas de data', async () => {
  const cli = await api('POST', '/api/clientes', { token: corretorToken, body: { nome: 'Cliente Dash' } });
  const iso = (days) => new Date(Date.now() + days * 86400000).toISOString();
  await api('POST', '/api/apolices', { token: corretorToken, body: {
    cliente_id: cli.data.id, produto: 'Auto', vigencia_fim: iso(10).slice(0, 10), premio: 1000 } });
  await api('POST', '/api/apolices', { token: corretorToken, body: {
    cliente_id: cli.data.id, produto: 'Vida', vigencia_fim: iso(90).slice(0, 10), premio: 500 } });
  // data_hora com 'T' (formato do <input type="datetime-local">) e com espaço
  await api('POST', '/api/agendamentos', { token: corretorToken, body: { titulo: 'Amanhã', data_hora: iso(1).slice(0, 16) } });
  await api('POST', '/api/agendamentos', { token: corretorToken, body: { titulo: 'Atrasado', data_hora: iso(-3).slice(0, 16).replace('T', ' ') } });

  const r = await api('GET', '/api/dashboard', { token: corretorToken });
  assert.equal(r.status, 200);
  assert.deepEqual(r.data.vencendo.map((v) => v.cliente_nome), ['Cliente Dash']);
  assert.deepEqual(r.data.proximosAgendamentos.map((g) => g.titulo), ['Amanhã']);
  assert.ok(r.data.agendamentosAtrasados >= 1);
  assert.equal(r.data.receitaEstimada, 1500);
  assert.equal(r.data.usuariosTotal, null);
});

test('selects vazios do CRM ("— Sem corretor —") viram null, não quebram o Postgres', async () => {
  const lead = await api('POST', '/api/leads', { body: { nome: 'Lead Select', telefone: '12999990003' } });
  const upd = await api('PUT', `/api/leads/${lead.data.id}`, { token: adminToken, body: { corretor_id: '', status: 'novo' } });
  assert.equal(upd.status, 200);
  assert.equal((await api('GET', `/api/leads/${lead.data.id}`, { token: adminToken })).data.corretor_id, null);

  const cli = await api('POST', '/api/clientes', { token: adminToken, body: { nome: 'Cliente Select' } });
  assert.equal((await api('PUT', `/api/clientes/${cli.data.id}`, { token: adminToken, body: { corretor_id: '' } })).status, 200);
  const apo = await api('POST', '/api/apolices', { token: adminToken, body: { cliente_id: cli.data.id, produto: 'Auto' } });
  assert.equal((await api('PUT', `/api/apolices/${apo.data.id}`, { token: adminToken, body: { cliente_id: '', corretor_id: '' } })).status, 200);
  const sin = await api('POST', '/api/sinistros', { token: adminToken, body: { cliente_id: cli.data.id } });
  assert.equal((await api('PUT', `/api/sinistros/${sin.data.id}`, { token: adminToken, body: { apolice_id: '', cliente_id: '' } })).status, 200);
  const ag = await api('POST', '/api/agendamentos', { token: adminToken, body: { titulo: 'Ag Select', data_hora: '2030-01-01 10:00' } });
  assert.equal((await api('PUT', `/api/agendamentos/${ag.data.id}`, { token: adminToken, body: { cliente_id: '', lead_id: '' } })).status, 200);
});

test('histórico do lead: registrar contato, status automático, dono e permissões', async () => {
  const lead = await api('POST', '/api/leads', { body: { nome: 'Lead Histórico', telefone: '12999990004' } });
  const id = lead.data.id;

  const bad = await api('POST', `/api/leads/${id}/interacoes`, { token: corretorToken, body: { tipo: 'status', descricao: 'x' } });
  assert.equal(bad.status, 400);
  const empty = await api('POST', `/api/leads/${id}/interacoes`, { token: corretorToken, body: { tipo: 'nota', descricao: '  ' } });
  assert.equal(empty.status, 400);

  // Anotação não conta como contato
  await api('POST', `/api/leads/${id}/interacoes`, { token: corretorToken, body: { tipo: 'nota', descricao: 'Cliente prefere à tarde' } });
  let l = (await api('GET', `/api/leads/${id}`, { token: adminToken })).data;
  assert.equal(l.ultimo_contato, null);
  assert.equal(l.status, 'novo');

  // Primeiro contato: vira "contato realizado", corretor vira dono, agenda retorno
  const wa = await api('POST', `/api/leads/${id}/interacoes`, { token: corretorToken, body: {
    tipo: 'whatsapp', descricao: 'Enviei a cotação inicial', proximo_retorno: '2030-05-10T14:30' } });
  assert.equal(wa.status, 201);
  l = (await api('GET', `/api/leads/${id}`, { token: adminToken })).data;
  assert.equal(l.status, 'contato_realizado');
  assert.equal(l.corretor_id, corretorId);
  assert.match(l.ultimo_contato, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  assert.equal(l.proximo_retorno, '2030-05-10 14:30');

  // Mudança de status pelo PUT (Kanban) também entra no histórico
  await api('PUT', `/api/leads/${id}`, { token: corretorToken, body: { status: 'proposta_enviada' } });
  const hist = (await api('GET', `/api/leads/${id}/interacoes`, { token: corretorToken })).data;
  assert.deepEqual(hist.map((h) => h.tipo), ['status', 'status', 'whatsapp', 'nota']);
  assert.equal(hist[0].descricao, 'Contato realizado → Proposta enviada');
  assert.equal(hist[2].usuario_nome, 'Corretor Teste');

  // Outro corretor não vê nem registra no lead que já tem dono
  await api('POST', '/api/usuarios', { token: adminToken, body: { nome: 'Outro', email: 'outro@test.com', senha: 'outro123', role: 'corretor' } });
  const outroToken = (await api('POST', '/api/auth/login', { body: { email: 'outro@test.com', senha: 'outro123' } })).data.token;
  assert.equal((await api('GET', `/api/leads/${id}/interacoes`, { token: outroToken })).status, 403);
  assert.equal((await api('POST', `/api/leads/${id}/interacoes`, { token: outroToken, body: { tipo: 'nota', descricao: 'x' } })).status, 403);

  // Excluir o lead apaga o histórico (ON DELETE CASCADE)
  await api('DELETE', `/api/leads/${id}`, { token: adminToken });
  assert.equal((await db.get('SELECT COUNT(*) AS n FROM lead_interacoes WHERE lead_id = ?', id)).n, 0);
});

test('configurações: só admin, valida e-mails e modo de distribuição', async () => {
  assert.equal((await api('GET', '/api/config', { token: corretorToken })).status, 403);
  const bad = await api('PUT', '/api/config', { token: adminToken, body: { 'notificacao.emails': 'ok@x.com, nao-e-email' } });
  assert.equal(bad.status, 400);
  assert.match(bad.data.error, /nao-e-email/);
  assert.equal((await api('PUT', '/api/config', { token: adminToken, body: { 'distribuicao.modo': 'aleatorio' } })).status, 400);
  const ok = await api('PUT', '/api/config', { token: adminToken, body: {
    'notificacao.emails': 'Vendas@Vidadeouro.com.br; gerente@vidadeouro.com.br', 'notificacao.avisar_corretor': '1' } });
  assert.equal(ok.status, 200);
  assert.equal(ok.data.values['notificacao.emails'], 'vendas@vidadeouro.com.br, gerente@vidadeouro.com.br');
  assert.equal(ok.data.smtp.configurado, true);

  const { outbox } = require('../mailer');
  const before = outbox.length;
  const teste = await api('POST', '/api/config/teste-email', { token: adminToken, body: {} });
  assert.equal(teste.status, 200);
  assert.deepEqual(outbox[before].to, ['vendas@vidadeouro.com.br', 'gerente@vidadeouro.com.br']);
});

test('lead do site: aviso por e-mail, rodízio, duplicado vira histórico e UTM', async () => {
  const { outbox } = require('../mailer');
  await api('PUT', '/api/config', { token: adminToken, body: {
    'notificacao.emails': 'vendas@vidadeouro.com.br', 'notificacao.avisar_corretor': '1', 'distribuicao.modo': 'rodizio' } });

  const n0 = outbox.length;
  const a = await api('POST', '/api/leads', { body: {
    nome: 'Lead Email <b>', telefone: '(12) 98877-6655', produto: 'Seguro Auto', mensagem: 'Quero cotar',
    origem_pagina: '/produto.html?id=seguro-auto', utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'auto-out' } });
  assert.equal(a.status, 201);
  assert.equal(outbox.length, n0 + 1);
  const mail = outbox[outbox.length - 1];
  assert.equal(mail.subject, 'Novo lead — Seguro Auto: Lead Email <b>');
  assert.ok(mail.to.includes('vendas@vidadeouro.com.br'));
  assert.ok(mail.html.includes('Lead Email &lt;b&gt;'), 'HTML do e-mail escapa os dados do lead');
  assert.ok(mail.html.includes(`/crm/leads.html?lead=${a.data.id}`));

  const leadA = (await api('GET', `/api/leads/${a.data.id}`, { token: adminToken })).data;
  assert.equal(leadA.utm_source, 'google');
  assert.equal(leadA.origem_pagina, '/produto.html?id=seguro-auto');
  assert.ok(leadA.corretor_id, 'rodízio atribuiu um corretor');
  const corretorEmail = (await db.get('SELECT email FROM usuarios WHERE id = ?', leadA.corretor_id)).email;
  assert.ok(mail.to.includes(corretorEmail), 'corretor responsável também é avisado');

  // Rodízio alterna entre corretores ativos
  const b = await api('POST', '/api/leads', { body: { nome: 'Lead Rodizio', telefone: '12977776666' } });
  const leadB = (await api('GET', `/api/leads/${b.data.id}`, { token: adminToken })).data;
  assert.notEqual(leadB.corretor_id, leadA.corretor_id);

  // Mesmo telefone (outro formato) com lead em aberto: não cria lead novo
  const total = (await db.get('SELECT COUNT(*) AS n FROM leads')).n;
  const dup = await api('POST', '/api/leads', { body: { nome: 'Lead Email', telefone: '+55 12 98877 6655', produto: 'Seguro Vida', mensagem: 'Agora quero vida também' } });
  assert.equal(dup.status, 201);
  assert.equal(dup.data.id, a.data.id);
  assert.equal((await db.get('SELECT COUNT(*) AS n FROM leads')).n, total);
  assert.match(outbox[outbox.length - 1].subject, /^Lead voltou a fazer contato/);
  const hist = (await api('GET', `/api/leads/${a.data.id}/interacoes`, { token: adminToken })).data;
  assert.match(hist[0].descricao, /Enviou o formulário do site novamente\. Produto: Seguro Vida/);

  await api('PUT', '/api/config', { token: adminToken, body: { 'distribuicao.modo': 'manual', 'notificacao.emails': '' } });
  const c = await api('POST', '/api/leads', { body: { nome: 'Lead Manual Fila', telefone: '12966665555' } });
  assert.equal((await api('GET', `/api/leads/${c.data.id}`, { token: adminToken })).data.corretor_id, null);
});

test('cadastro manual no CRM: dono, etapa e valor do formulário', async () => {
  const r = await api('POST', '/api/leads', { token: corretorToken, body: {
    nome: 'Lead Manual', telefone: '12955554444', status: 'contato_realizado', valor_estimado: 'R$ 2.400,00',
    proximo_retorno: '2030-02-01T09:00' } });
  const l = (await api('GET', `/api/leads/${r.data.id}`, { token: corretorToken })).data;
  assert.equal(l.corretor_id, corretorId);
  assert.equal(l.origem, 'manual');
  assert.equal(l.status, 'contato_realizado');
  assert.equal(l.valor_estimado, 2400);
  assert.equal(l.proximo_retorno, '2030-02-01 09:00');
});

test('motivo da perda: obrigatório ao perder, entra no histórico e some ao reabrir', async () => {
  const r = await api('POST', '/api/leads', { token: adminToken, body: { nome: 'Lead Perda', telefone: '12944443333', valor_estimado: 1000 } });
  const id = r.data.id;
  const sem = await api('PUT', `/api/leads/${id}`, { token: adminToken, body: { status: 'desistiu' } });
  assert.equal(sem.status, 400);
  assert.match(sem.data.error, /motivo/i);
  assert.equal((await api('PUT', `/api/leads/${id}`, { token: adminToken, body: { status: 'desistiu', motivo_perda: 'Preço' } })).status, 200);
  let l = (await api('GET', `/api/leads/${id}`, { token: adminToken })).data;
  assert.equal(l.motivo_perda, 'Preço');
  const hist = (await api('GET', `/api/leads/${id}/interacoes`, { token: adminToken })).data;
  assert.equal(hist[0].descricao, 'Novo → Desistiu (motivo: Preço)');

  const viaContato = await api('POST', `/api/leads/${id}/interacoes`, { token: adminToken, body: { tipo: 'nota', descricao: 'x', status: 'sem_interesse' } });
  assert.equal(viaContato.status, 201, 'troca entre etapas de perda mantém o motivo anterior');

  const dash = (await api('GET', '/api/dashboard', { token: adminToken })).data;
  assert.ok(dash.motivosPerda.some((m) => m.motivo === 'Preço' && m.n >= 1));
  assert.ok(dash.leadsPorOrigem.some((o) => o.origem === 'google'));
  assert.equal(typeof dash.funilValorAberto, 'number');
  assert.equal(typeof dash.semContato30d, 'number');

  await api('PUT', `/api/leads/${id}`, { token: adminToken, body: { status: 'contato_realizado' } });
  l = (await api('GET', `/api/leads/${id}`, { token: adminToken })).data;
  assert.equal(l.motivo_perda, null);
});
