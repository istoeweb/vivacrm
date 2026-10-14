const express = require('express');
const db = require('../db');
const { asyncRouter } = require('../utils');
const { auth, requireRole } = require('../middleware/auth');
const editable = require('../editable');

const router = asyncRouter();
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

async function readAll() {
  const rows = await db.all('SELECT chave, valor FROM site_conteudo');
  const map = {};
  for (const r of rows) if (ALLOWED.has(r.chave)) map[r.chave] = r.valor;
  // Garante que todas as chaves conhecidas existam na resposta
  for (const f of FIELDS) if (!(f.chave in map)) map[f.chave] = '';
  return map;
}

// Público: conteúdo consumido pelas páginas do site
router.get('/content', async (_req, res) => {
  res.json(await readAll());
});

// Admin: conteúdo + metadados dos campos para montar o formulário
router.get('/admin', ...adminOnly, async (_req, res) => {
  res.json({ fields: FIELDS, values: await readAll() });
});

// Admin: atualização em lote. Body = { chave: valor, ... }
router.put('/admin', ...adminOnly, async (req, res) => {
  const body = req.body || {};
  const upsert = `
    INSERT INTO site_conteudo (chave, valor, atualizado_em) VALUES (?, ?, ?)
    ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor, atualizado_em = excluded.atualizado_em
  `;
  let updated = 0;
  for (const [chave, valor] of Object.entries(body)) {
    if (!ALLOWED.has(chave)) continue;
    const clean = String(valor ?? '').trim().slice(0, 500);
    await db.run(upsert, chave, clean, db.now());
    updated++;
  }
  res.json({ ok: true, updated, values: await readAll() });
});

/*
 * Textos das páginas (início, sobre, contato, política, blog, produto, rodapé).
 * Os campos vêm das marcações no HTML (ver editable.js); só o que difere do
 * texto original é gravado, com prefixo "pg." na tabela site_conteudo.
 */
router.get('/admin/paginas', ...adminOnly, async (_req, res) => {
  const valores = await editable.carregarValores(db);
  const paginas = editable.catalogo().map((p) => ({
    ...p,
    campos: p.campos.map((c) => {
      const salvo = valores[c.key];
      let valor = c.padrao;
      if (salvo !== undefined) {
        if (c.type !== 'list') valor = salvo;
        else { try { valor = JSON.parse(salvo); } catch { /* mantém o padrão */ } }
      }
      return { ...c, valor, personalizado: salvo !== undefined };
    }),
  }));
  res.json({ paginas });
});

// Body: { valores: { "home.topo.titulo": "texto", "home.faq.lista": [...], "x": null } }
// null (ou valor igual ao original) restaura o texto original.
router.put('/admin/paginas', ...adminOnly, async (req, res) => {
  const entrada = (req.body && req.body.valores) || {};
  if (typeof entrada !== 'object' || Array.isArray(entrada)) return res.status(400).json({ error: 'Envie { valores: { chave: valor } }' });
  const campos = editable.campoPorChave();
  const desconhecidas = Object.keys(entrada).filter((k) => !campos.has(k));
  if (desconhecidas.length) return res.status(400).json({ error: `Campo(s) inexistente(s): ${desconhecidas.slice(0, 5).join(', ')}` });

  const upsert = `
    INSERT INTO site_conteudo (chave, valor, atualizado_em) VALUES (?, ?, ?)
    ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor, atualizado_em = excluded.atualizado_em
  `;
  let gravados = 0;
  let restaurados = 0;
  for (const [key, valor] of Object.entries(entrada)) {
    const campo = campos.get(key);
    if (valor === null) {
      await db.run('DELETE FROM site_conteudo WHERE chave = ?', editable.PREFIX + key);
      restaurados++;
      continue;
    }
    const n = editable.normalizar(campo, valor);
    if (n.error) return res.status(400).json({ error: n.error });
    if (editable.igualAoPadrao(campo, n.value)) {
      await db.run('DELETE FROM site_conteudo WHERE chave = ?', editable.PREFIX + key);
      restaurados++;
    } else {
      await db.run(upsert, editable.PREFIX + key, n.value, db.now());
      gravados++;
    }
  }
  res.json({ ok: true, gravados, restaurados });
});

module.exports = router;
