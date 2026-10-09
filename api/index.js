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
}

module.exports = require('../server/server');
