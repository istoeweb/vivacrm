/*
 * Envio de e-mail por SMTP (Gmail, Outlook, Hostinger, Zoho...). Credenciais em
 * variáveis de ambiente — segredos não ficam no banco:
 *   SMTP_HOST, SMTP_PORT (587 ou 465), SMTP_USER, SMTP_PASS, SMTP_FROM (opcional)
 * MAIL_TRANSPORT=memory guarda as mensagens em `outbox` sem enviar (testes).
 */
const nodemailer = require('nodemailer');

const outbox = [];
let transporter;

function smtpConfigured() {
  return process.env.MAIL_TRANSPORT === 'memory' || Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function fromAddress() {
  return process.env.SMTP_FROM || (process.env.SMTP_USER ? `CRM Vida de Ouro <${process.env.SMTP_USER}>` : 'CRM Vida de Ouro <crm@localhost>');
}

function getTransporter() {
  if (process.env.MAIL_TRANSPORT === 'memory') return nodemailer.createTransport({ jsonTransport: true });
  const port = Number(process.env.SMTP_PORT) || 587;
  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
  });
  return transporter;
}

// Envia e devolve { sent, error }. Nunca lança: falha de e-mail não pode
// derrubar o cadastro do lead.
async function sendMail({ to, subject, text, html }) {
  const recipients = [...new Set([].concat(to).filter(Boolean))];
  if (!recipients.length) return { sent: false, error: 'Nenhum destinatário configurado' };
  if (!smtpConfigured()) return { sent: false, error: 'SMTP não configurado no servidor' };
  try {
    const info = await getTransporter().sendMail({ from: fromAddress(), to: recipients.join(', '), subject, text, html });
    if (process.env.MAIL_TRANSPORT === 'memory') outbox.push({ to: recipients, subject, text, html });
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error('Falha ao enviar e-mail:', err.message);
    return { sent: false, error: err.message };
  }
}

module.exports = { sendMail, smtpConfigured, fromAddress, outbox };
