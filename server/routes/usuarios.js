const express = require('express');
const db = require('../db');
const bcrypt = require('bcrypt');
const { auth, requireRole } = require('../middleware/auth');
const { isValidEmail } = require('../utils');

const router = express.Router();

router.get('/', auth, requireRole('admin'), (req, res) => {
  const rows = db.prepare(`
    SELECT id, nome, email, role, ativo, criado_em
    FROM usuarios
    ORDER BY nome ASC
  `).all();
  res.json(rows);
});

router.post('/', auth, requireRole('admin'), (req, res) => {
  const { nome, email, senha, role } = req.body || {};
  if (!nome || !email || !senha || !role) return res.status(400).json({ error: 'nome, email, senha e role obrigatórios' });
  if (!isValidEmail(email)) return res.status(400).json({ error: 'E-mail inválido' });
  if (String(senha).length < 6) return res.status(400).json({ error: 'Senha deve ter ao menos 6 caracteres' });
  if (!['admin', 'corretor'].includes(role)) return res.status(400).json({ error: 'role inválido' });
  const exists = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(String(email).toLowerCase());
  if (exists) return res.status(409).json({ error: 'Email já cadastrado' });
  const hash = bcrypt.hashSync(String(senha), 10);
  const info = db.prepare('INSERT INTO usuarios (nome, email, senha_hash, role, ativo) VALUES (?,?,?,?,1)')
    .run(String(nome).slice(0,120), String(email).toLowerCase(), hash, role);
  res.status(201).json({ id: info.lastInsertRowid });
});

router.put('/:id', auth, requireRole('admin'), (req, res) => {
  const existing = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Usuário não encontrado' });
  const { nome, email, senha, role, ativo } = req.body || {};
  if (email && email.toLowerCase() !== existing.email) {
    const dup = db.prepare('SELECT id FROM usuarios WHERE email = ? AND id <> ?').get(String(email).toLowerCase(), req.params.id);
    if (dup) return res.status(409).json({ error: 'Email já cadastrado' });
  }
  const hash = senha ? bcrypt.hashSync(String(senha), 10) : existing.senha_hash;
  db.prepare(`
    UPDATE usuarios SET nome=?, email=?, senha_hash=?, role=?, ativo=?
    WHERE id=?
  `).run(
    nome ?? existing.nome,
    (email ?? existing.email).toLowerCase(),
    hash,
    role ?? existing.role,
    ativo ?? existing.ativo,
    req.params.id
  );
  res.json({ ok: true });
});

router.delete('/:id', auth, requireRole('admin'), (req, res) => {
  if (Number(req.params.id) === Number(req.user.id)) {
    return res.status(400).json({ error: 'Não é possível excluir o próprio usuário' });
  }
  const info = db.prepare('DELETE FROM usuarios WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json({ ok: true });
});

module.exports = router;