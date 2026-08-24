/* Helpers compartilhados: erros, validação e paginação */

// Erro de API com status HTTP associado.
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Envolve handlers async/sync para encaminhar exceções ao middleware de erro.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Middleware final de tratamento de erros.
function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  if (status >= 500) {
    console.error(err);
  }
  const message = status >= 500 ? 'Erro interno do servidor' : err.message;
  res.status(status).json({ error: message });
}

// Middleware para rotas não encontradas na API.
function notFound(req, res) {
  res.status(404).json({ error: 'Recurso não encontrado' });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Status válidos do funil de leads (ordem = etapas do atendimento).
const LEAD_STATUSES = [
  'novo',
  'contato_realizado',
  'proposta_enviada',
  'aguardando_retorno',
  'fechado',
  'desistiu',
  'sem_interesse',
];

function isValidLeadStatus(status) {
  return LEAD_STATUSES.includes(status);
}

function isValidEmail(email) {
  return EMAIL_RE.test(String(email).trim());
}

// Telefone válido: 10 ou 11 dígitos (com DDD), ignorando formatação.
function isValidPhone(tel) {
  const digits = String(tel).replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11;
}

// Extrai parâmetros de paginação da query string com limites seguros.
function getPagination(req, { defaultLimit = 50, maxLimit = 200 } = {}) {
  let limit = parseInt(req.query.limit, 10);
  let page = parseInt(req.query.page, 10);
  if (!Number.isFinite(limit) || limit <= 0) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;
  if (!Number.isFinite(page) || page <= 0) page = 1;
  const offset = (page - 1) * limit;
  return { limit, page, offset };
}

// Indica se o cliente pediu paginação explicitamente (?page= ou ?limit=)
function wantsPagination(req) {
  return req.query.page !== undefined || req.query.limit !== undefined;
}

// Converte um prêmio informado (número ou texto tipo "R$ 4.500/ano") em número (reais).
// Regras BR: ponto = milhar, vírgula = decimal. Retorna null se não houver dígitos.
function parsePremio(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  let s = String(v).replace(/[^\d.,]/g, ''); // remove "R$", letras, espaços, "/ano"
  if (!s) return null;
  if (s.includes(',')) {
    // vírgula é decimal; pontos são separadores de milhar
    s = s.replace(/\./g, '').replace(',', '.');
  } else {
    const parts = s.split('.');
    // vários pontos, ou um ponto seguido de exatamente 3 dígitos => milhar
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      s = parts.join('');
    }
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

module.exports = {
  ApiError,
  asyncHandler,
  errorHandler,
  notFound,
  isValidEmail,
  isValidPhone,
  getPagination,
  wantsPagination,
  parsePremio,
  LEAD_STATUSES,
  isValidLeadStatus,
};
