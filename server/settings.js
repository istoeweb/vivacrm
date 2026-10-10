// Configurações do CRM editáveis no painel (tabela configuracoes).
const db = require('./db');
const { isValidEmail } = require('./utils');

const DEFAULTS = {
  'notificacao.emails': '',            // destinatários do aviso de lead novo, separados por vírgula
  'notificacao.avisar_corretor': '1',  // '1' = também avisa o corretor responsável
  'distribuicao.modo': 'manual',       // 'manual' (fila) ou 'rodizio' entre corretores ativos
  'distribuicao.ultimo_corretor': '',  // ponteiro interno do rodízio
};
const EDITABLE = ['notificacao.emails', 'notificacao.avisar_corretor', 'distribuicao.modo'];

async function getSettings() {
  const rows = await db.all('SELECT chave, valor FROM configuracoes');
  const values = { ...DEFAULTS };
  for (const r of rows) if (r.chave in DEFAULTS) values[r.chave] = r.valor;
  return values;
}

async function setSetting(chave, valor) {
  await db.run(`
    INSERT INTO configuracoes (chave, valor, atualizado_em) VALUES (?, ?, ?)
    ON CONFLICT (chave) DO UPDATE SET valor = excluded.valor, atualizado_em = excluded.atualizado_em
  `, chave, String(valor ?? ''), db.now());
}

const parseEmails = (value) => String(value || '').split(/[,;\s]+/).map((e) => e.trim().toLowerCase()).filter(Boolean);

// Valida e normaliza o que vem do painel. Lança { status: 400 } em erro.
function validate(body) {
  const out = {};
  if (body['notificacao.emails'] !== undefined) {
    const emails = [...new Set(parseEmails(body['notificacao.emails']))];
    const invalid = emails.filter((e) => !isValidEmail(e));
    if (invalid.length) throw Object.assign(new Error(`E-mail inválido: ${invalid.join(', ')}`), { status: 400 });
    if (emails.length > 10) throw Object.assign(new Error('Informe no máximo 10 e-mails'), { status: 400 });
    out['notificacao.emails'] = emails.join(', ');
  }
  if (body['notificacao.avisar_corretor'] !== undefined) {
    out['notificacao.avisar_corretor'] = ['1', 'true', 'on', true, 1].includes(body['notificacao.avisar_corretor']) ? '1' : '0';
  }
  if (body['distribuicao.modo'] !== undefined) {
    if (!['manual', 'rodizio'].includes(body['distribuicao.modo'])) {
      throw Object.assign(new Error('Modo de distribuição inválido'), { status: 400 });
    }
    out['distribuicao.modo'] = body['distribuicao.modo'];
  }
  return out;
}

module.exports = { getSettings, setSetting, validate, parseEmails, EDITABLE };
