const jwt = require('jsonwebtoken');

const isProd = process.env.NODE_ENV === 'production';
const DEV_SECRET = 'vida-de-ouro-crm-dev-secret-change-me';

if (isProd && !process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET não definido. Defina a variável de ambiente antes de iniciar em produção.');
  process.exit(1);
}
if (!isProd && !process.env.JWT_SECRET) {
  console.warn('AVISO: JWT_SECRET não definido — usando segredo de desenvolvimento. NÃO use em produção.');
}

const SECRET = process.env.JWT_SECRET || DEV_SECRET;

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token não informado' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
  };
}

function sign(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '12h' });
}

module.exports = { auth, requireRole, sign, SECRET };