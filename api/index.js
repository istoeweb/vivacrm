// Entrada serverless da Vercel: reaproveita o app Express de server/.
// O filesystem da Vercel é efêmero; só /tmp aceita escrita. O banco SQLite e os
// uploads do blog vivem lá e são perdidos a cada cold start (uso apenas como preview).
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

process.env.DB_PATH = process.env.DB_PATH || '/tmp/crm.db';
process.env.BLOG_UPLOAD_DIR = process.env.BLOG_UPLOAD_DIR || '/tmp/blog';

if (!fs.existsSync(process.env.DB_PATH)) {
  // seed.js chama process.exit, então roda em processo separado
  execFileSync(process.execPath, [path.join(__dirname, '..', 'server', 'seed.js')], {
    env: process.env,
    stdio: 'inherit',
  });

  // O seed usa senhas demo conhecidas; num deploy público trocamos a do admin
  // e desativamos o corretor demo.
  if (process.env.ADMIN_PASSWORD) {
    const bcrypt = require('bcrypt');
    const db = require('../server/db');
    db.prepare('UPDATE usuarios SET senha_hash = ? WHERE email = ?')
      .run(bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10), 'admin@vidadeouro.com.br');
    db.prepare('UPDATE usuarios SET ativo = 0 WHERE email = ?').run('joao@vidadeouro.com.br');
  }
}

module.exports = require('../server/server');
