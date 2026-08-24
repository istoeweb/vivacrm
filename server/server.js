require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

require('./db'); // garante criação das tabelas

const { errorHandler, notFound } = require('./utils');

const authRoutes = require('./routes/auth');
const leadsRoutes = require('./routes/leads');
const clientesRoutes = require('./routes/clientes');
const apolicesRoutes = require('./routes/apolices');
const sinistrosRoutes = require('./routes/sinistros');
const agendamentosRoutes = require('./routes/agendamentos');
const usuariosRoutes = require('./routes/usuarios');
const dashboardRoutes = require('./routes/dashboard');
const blogRoutes = require('./routes/blog');

const app = express();
const PORT = process.env.PORT || 3001;

app.disable('x-powered-by');
app.set('trust proxy', 1);

// Headers de segurança (CSP desligada por padrão para não quebrar o CRM estático)
app.use(helmet({ contentSecurityPolicy: false }));

// CORS restrito por origem quando ALLOWED_ORIGINS estiver definido
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (allowedOrigins.length === 0) return cb(null, true); // dev: libera geral
    if (!origin) return cb(null, true); // ferramentas/servidor sem origem
    if (process.env.RENDER_EXTERNAL_URL && origin === process.env.RENDER_EXTERNAL_URL) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Origem não permitida pelo CORS'));
  },
}));

app.use((req, res, next) => {
  const limit = req.path === '/api/blog/admin/upload' ? '7mb' : '100kb';
  express.json({ limit })(req, res, next);
});

// Rate limit geral da API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente mais tarde.' },
});

// Rate limit mais estrito para endpoints públicos (captação de leads / login)
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente mais tarde.' },
});

app.use('/api', apiLimiter);

// Servir frontend admin CRM
const crmDir = path.join(__dirname, '..', 'crm');
if (fs.existsSync(crmDir)) {
  app.use('/crm', express.static(crmDir));
}

// Servir assets do site institucional (logo, imagens) usados também pelo CRM
const assetsDir = path.join(__dirname, '..', 'assets');
const blogUploadDir = process.env.BLOG_UPLOAD_DIR
  ? path.resolve(process.env.BLOG_UPLOAD_DIR)
  : path.join(assetsDir, 'img', 'blog');
fs.mkdirSync(blogUploadDir, { recursive: true });
app.use('/assets/img/blog', express.static(blogUploadDir));
if (fs.existsSync(assetsDir)) {
  app.use('/assets', express.static(assetsDir));
}

// Site institucional: somente arquivos públicos permitidos. Não expõe a raiz
// inteira do projeto (que também contém .env, banco SQLite, PHP e arquivos ZIP).
const siteDir = path.join(__dirname, '..');
const publicPages = new Set([
  'index.html',
  'produto.html',
  'sobre.html',
  'contato.html',
  'politica-de-privacidade.html',
  'blog.html',
  'artigo.html',
]);
app.get('/', (_req, res) => res.sendFile(path.join(siteDir, 'index.html')));
app.get('/:page', (req, res, next) => {
  if (!publicPages.has(req.params.page)) return next();
  res.sendFile(path.join(siteDir, req.params.page));
});
app.get('/robots.txt', (_req, res) => res.sendFile(path.join(siteDir, 'robots.txt')));
app.get('/sitemap.xml', (_req, res) => res.sendFile(path.join(siteDir, 'sitemap.xml')));

// Rate limit estrito nas rotas públicas antes das rotas gerais
app.use('/api/auth/login', publicLimiter);
app.use('/api/leads', (req, res, next) => (req.method === 'POST' ? publicLimiter(req, res, next) : next()));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/apolices', apolicesRoutes);
app.use('/api/sinistros', sinistrosRoutes);
app.use('/api/agendamentos', agendamentosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/blog', blogRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

// 404 e tratamento de erros da API
app.use('/api', notFound);
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CRM Vida de Ouro rodando em http://localhost:${PORT}`);
    console.log(`Admin: http://localhost:${PORT}/crm/`);
  });
}

module.exports = app;
