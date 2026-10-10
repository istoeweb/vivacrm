const db = require('../db');
const { auth, requireRole } = require('../middleware/auth');
const { asyncRouter } = require('../utils');
const { getSettings, setSetting, validate, parseEmails, EDITABLE } = require('../settings');
const { sendMail, smtpConfigured, fromAddress } = require('../mailer');

const router = asyncRouter();
const adminOnly = [auth, requireRole('admin')];

async function payload() {
  const all = await getSettings();
  const values = Object.fromEntries(EDITABLE.map((k) => [k, all[k]]));
  const corretores = (await db.get("SELECT COUNT(*) AS n FROM usuarios WHERE role = 'corretor' AND ativo = 1")).n;
  return { values, smtp: { configurado: smtpConfigured(), remetente: smtpConfigured() ? fromAddress() : null }, corretoresAtivos: corretores };
}

router.get('/', ...adminOnly, async (_req, res) => {
  res.json(await payload());
});

router.put('/', ...adminOnly, async (req, res) => {
  const values = validate(req.body || {});
  for (const [chave, valor] of Object.entries(values)) await setSetting(chave, valor);
  res.json({ ok: true, ...(await payload()) });
});

// Envia um e-mail de teste para os destinatários salvos (ou os informados no corpo).
router.post('/teste-email', ...adminOnly, async (req, res) => {
  const informed = req.body?.emails !== undefined ? validate({ 'notificacao.emails': req.body.emails })['notificacao.emails'] : null;
  const to = parseEmails(informed ?? (await getSettings())['notificacao.emails']);
  if (!to.length) return res.status(400).json({ error: 'Cadastre ao menos um e-mail para receber os avisos' });
  const result = await sendMail({
    to,
    subject: 'Teste de aviso de leads — CRM Vida de Ouro',
    text: 'Este é um e-mail de teste. Se você recebeu, os avisos de lead novo do CRM estão funcionando.',
    html: '<p style="font-family:Arial,sans-serif">Este é um e-mail de teste. Se você recebeu, os <strong>avisos de lead novo</strong> do CRM Vida de Ouro estão funcionando.</p>',
  });
  if (!result.sent) return res.status(502).json({ error: `Não foi possível enviar: ${result.error}` });
  res.json({ ok: true, enviados: to });
});

module.exports = router;
