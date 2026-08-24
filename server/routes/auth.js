const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const { sign, auth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, senha } = req.body || {};
  if (typeof email !== 'string' || typeof senha !== 'string' || !email || !senha) {
    return res.status(400).json({ error: 'Email e senha obrigatórios' });
  }

  const row = db.prepare('SELECT * FROM usuarios WHERE email = ? AND ativo = 1').get(email.trim().toLowerCase());
  if (!row) return res.status(401).json({ error: 'Credenciais inválidas' });

  const ok = bcrypt.compareSync(senha, row.senha_hash);
  if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });

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