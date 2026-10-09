const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const { sign, auth } = require('../middleware/auth');

const router = express.Router();

// Hash "dummy" (bcrypt de uma senha aleatória) usado quando o e-mail não existe,
// para que o tempo de resposta seja igual ao de um usuário real — evitando
// enumeração de contas via timing attack.
const DUMMY_HASH = bcrypt.hashSync('vida-de-ouro-dummy-password', 10);

router.post('/login', (req, res) => {
  const { email, senha } = req.body || {};
  if (typeof email !== 'string' || typeof senha !== 'string' || !email || !senha) {
    return res.status(400).json({ error: 'Email e senha obrigatórios' });
  }

  const row = db.prepare('SELECT * FROM usuarios WHERE email = ? AND ativo = 1').get(email.trim().toLowerCase());
  // Sempre executa a comparação bcrypt (mesmo sem usuário) para tempo constante.
  const ok = bcrypt.compareSync(senha, row ? row.senha_hash : DUMMY_HASH);
  if (!row || !ok) return res.status(401).json({ error: 'Credenciais inválidas' });

  const token = sign({ id: row.id, role: row.role, nome: row.nome, email: row.email });
  res.json({
    token,
    user: { id: row.id, nome: row.nome, email: row.email, role: row.role }
  });
});

router.get('/me', auth, (req, res) => {
  const row = db.prepare('SELECT id, nome, email, role FROM usuarios WHERE id = ?').get(req.user.id);
  if (!row) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json(row);
});

module.exports = router;