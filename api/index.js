// Entrada serverless da Vercel: reaproveita o app Express de server/.
// Com DATABASE_URL (Supabase) os dados persistem e o seed só cria o admin, se faltar.
// Sem ele, o banco é um SQLite em /tmp (único lugar gravável na Vercel), recriado
// com dados demo a cada cold start — uso apenas como preview.
process.env.DB_PATH = process.env.DB_PATH || '/tmp/crm.db';
process.env.BLOG_UPLOAD_DIR = process.env.BLOG_UPLOAD_DIR || '/tmp/blog';

const db = require('../server/db');
const { seed } = require('../server/seed');
const app = require('../server/server');

const persistent = Boolean(process.env.DATABASE_URL);
const ready = seed({ demo: !persistent }).then(async ({ created }) => {
  // O seed demo cria um corretor com senha conhecida; num deploy público ele fica inativo.
  if (created && !persistent && process.env.ADMIN_PASSWORD) {
    await db.run('UPDATE usuarios SET ativo = 0 WHERE email = ?', 'joao@vidadeouro.com.br');
  }
});

module.exports = async (req, res) => {
  await ready;
  return app(req, res);
};
