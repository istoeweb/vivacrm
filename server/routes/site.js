const express = require('express');
const db = require('../db');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();
const adminOnly = [auth, requireRole('admin')];

// Campos editáveis do site: define quais chaves existem, seus rótulos, grupos e
// validação. Só chaves listadas aqui podem ser lidas/gravadas (whitelist).
const FIELDS = [
  { chave: 'contato.whatsapp', label: 'WhatsApp (somente números, com DDI 55)', grupo: 'Contato', tipo: 'tel', help: 'Ex.: 5512976002718 — atualiza todos os botões de WhatsApp e telefone do site.' },
  { chave: 'contato.telefone', label: 'Telefone (exibição)', grupo: 'Contato', tipo: 'text', help: 'Ex.: (12) 97600-2718' },
  { chave: 'contato.telefone_fixo', label: 'Telefone fixo', grupo: 'Contato', tipo: 'text', help: 'Ex.: (12) 3351-3875 — deixe em branco para ocultar.' },
  { chave: 'contato.email', label: 'E-mail', grupo: 'Contato', tipo: 'email', help: 'Deixe em branco para ocultar.' },
  { chave: 'contato.endereco', label: 'Endereço / região', grupo: 'Contato', tipo: 'text', help: 'Ex.: Jacareí – SP · Vale do Paraíba' },
  { chave: 'social.instagram', label: 'Instagram (URL)', grupo: 'Redes sociais', tipo: 'url', help: 'Deixe em branco para ocultar.' },
  { chave: 'social.facebook', label: 'Facebook (URL)', grupo: 'Redes sociais', tipo: 'url', help: 'Deixe em branco para ocultar.' },
];
const ALLOWED = new Set(FIELDS.map((f) => f.chave));

function readAll() {
  const rows = db.prepare('SELECT chave, valor FROM site_conteudo').all();
  const map = {};
  for (const r of rows) if (ALLOWED.has(r.chave)) map[r.chave] = r.valor;
  // Garante que todas as chaves conhecidas existam na resposta
  for (const f of FIELDS) if (!(f.chave in map)) map[f.chave] = '';
  return map;
}

// Público: conteúdo consumido pelas páginas do site
router.get('/content', (_req, res) => {
  res.json(readAll());
});

// Admin: conteúdo + metadados dos campos para montar o formulário
router.get('/admin', ...adminOnly, (_req, res) => {
  res.json({ fields: FIELDS, values: readAll() });
});

// Admin: atualização em lote. Body = { chave: valor, ... }
router.put('/admin', ...adminOnly, (req, res) => {
  const body = req.body || {};
  const upsert = db.prepare(`
    INSERT INTO site_conteudo (chave, valor, atualizado_em) VALUES (?, ?, datetime('now'))
    ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor, atualizado_em = datetime('now')
  `);
  let updated = 0;
  for (const [chave, valor] of Object.entries(body)) {
    if (!ALLOWED.has(chave)) continue;
    const clean = String(valor ?? '').trim().slice(0, 500);
    upsert.run(chave, clean);
    updated++;
  }
  res.json({ ok: true, updated, values: readAll() });
});

module.exports = router;
