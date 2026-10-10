/*
 * Entrada de leads vindos do site: duplicados, distribuição automática e aviso
 * por e-mail. Usado por POST /api/leads quando a requisição é pública.
 */
const db = require('./db');
const { getSettings, setSetting, parseEmails } = require('./settings');
const { sendMail } = require('./mailer');

const CLOSED = ['fechado', 'desistiu', 'sem_interesse'];

// Só dígitos, sem DDI 55: "(12) 99999-0000" e "+55 12 99999 0000" ficam iguais.
function normalizePhone(tel) {
  let d = String(tel || '').replace(/\D/g, '');
  if (d.length > 11 && d.startsWith('55')) d = d.slice(2);
  return d;
}

// Lead em aberto com o mesmo telefone (a pessoa enviou o formulário de novo).
async function findOpenDuplicate(telefone) {
  const tel = normalizePhone(telefone);
  if (tel.length < 10) return null;
  const open = await db.all(
    `SELECT id, nome, telefone, produto, corretor_id, status FROM leads WHERE status NOT IN (${CLOSED.map(() => '?').join(', ')}) ORDER BY id DESC`,
    ...CLOSED);
  return open.find((l) => normalizePhone(l.telefone) === tel) || null;
}

// Rodízio: próximo corretor ativo depois do último que recebeu um lead.
async function nextCorretor(settings) {
  if (settings['distribuicao.modo'] !== 'rodizio') return null;
  const corretores = await db.all("SELECT id FROM usuarios WHERE role = 'corretor' AND ativo = 1 ORDER BY id");
  if (!corretores.length) return null;
  const last = Number(settings['distribuicao.ultimo_corretor']) || 0;
  const next = corretores.find((c) => c.id > last) || corretores[0];
  await setSetting('distribuicao.ultimo_corretor', next.id);
  return next.id;
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function waLink(tel) {
  const d = normalizePhone(tel);
  return d ? `https://wa.me/55${d}` : '';
}

// Envia o aviso. Espera no máximo ~9s (na Vercel a função congela após responder).
async function notifyLead({ lead, duplicate = false, baseUrl, settings }) {
  const recipients = parseEmails(settings['notificacao.emails']);
  if (settings['notificacao.avisar_corretor'] === '1' && lead.corretor_id) {
    const c = await db.get('SELECT email FROM usuarios WHERE id = ? AND ativo = 1', lead.corretor_id);
    if (c?.email) recipients.push(c.email);
  }
  if (!recipients.length) return { sent: false, error: 'Nenhum destinatário configurado' };

  const link = `${baseUrl}/crm/leads.html?lead=${lead.id}`;
  const subject = duplicate
    ? `Lead voltou a fazer contato: ${lead.nome}`
    : `Novo lead${lead.produto ? ` — ${lead.produto}` : ''}: ${lead.nome}`;
  const rows = [
    ['Nome', lead.nome], ['Telefone', lead.telefone], ['E-mail', lead.email], ['Cidade', lead.cidade],
    ['Produto', lead.produto], ['Mensagem', lead.mensagem], ['Página', lead.origem_pagina],
    ['Campanha', [lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(' / ')],
    ['Corretor', lead.corretor_nome || (lead.corretor_id ? '' : 'Sem corretor (fila)')],
  ].filter(([, v]) => v);
  const intro = duplicate
    ? 'Um lead que já está em atendimento enviou o formulário do site novamente. O novo envio foi registrado no histórico do lead.'
    : 'Um novo lead chegou pelo site. Quanto antes o primeiro contato, maior a chance de fechar.';
  const wa = waLink(lead.telefone);
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;color:#1f2937">
      <h2 style="margin:0 0 8px;color:#0e1f3d">${esc(subject)}</h2>
      <p style="margin:0 0 16px;color:#4b5563">${esc(intro)}</p>
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        ${rows.map(([k, v]) => `<tr><td style="padding:6px 10px;background:#f3f4f6;font-weight:bold;width:110px">${esc(k)}</td><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${esc(v)}</td></tr>`).join('')}
      </table>
      <p style="margin:20px 0 0">
        <a href="${esc(link)}" style="display:inline-block;padding:10px 18px;background:#1e3a6e;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold">Abrir no CRM</a>
        ${wa ? `<a href="${esc(wa)}" style="display:inline-block;margin-left:8px;padding:10px 18px;background:#25d366;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold">WhatsApp</a>` : ''}
      </p>
    </div>`;
  const text = `${subject}\n\n${intro}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nAbrir no CRM: ${link}${wa ? `\nWhatsApp: ${wa}` : ''}`;

  const timeout = new Promise((resolve) => setTimeout(() => resolve({ sent: false, error: 'Tempo esgotado ao enviar e-mail' }), 9000).unref());
  return Promise.race([sendMail({ to: recipients, subject, text, html }), timeout]);
}

module.exports = { normalizePhone, findOpenDuplicate, nextCorretor, notifyLead, CLOSED };
