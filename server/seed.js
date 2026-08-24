const bcrypt = require('bcrypt');
const db = require('./db');

const adminEmail = 'admin@vidadeouro.com.br';
const adminSenha = 'admin123';

const existing = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(adminEmail);
if (existing) {
  console.log('Admin já existe. ID:', existing.id);
  console.log('Email:', adminEmail);
  console.log('Senha:', adminSenha);
  process.exit(0);
}

const hash = bcrypt.hashSync(adminSenha, 10);
const info = db.prepare(`
  INSERT INTO usuarios (nome, email, senha_hash, role, ativo)
  VALUES (?, ?, ?, 'admin', 1)
`).run('Administrador', adminEmail, hash);

const adminId = Number(info.lastInsertRowid);

// Corretor demo
const corretorHash = bcrypt.hashSync('corretor123', 10);
const corretorInfo = db.prepare(`
  INSERT INTO usuarios (nome, email, senha_hash, role, ativo)
  VALUES (?, ?, ?, 'corretor', 1)
`).run('João Corretor', 'joao@vidadeouro.com.br', corretorHash);
const corretorId = Number(corretorInfo.lastInsertRowid);

// Lead demo
db.prepare(`
  INSERT INTO leads (nome, telefone, email, cidade, produto, mensagem, origem, status, corretor_id)
  VALUES (?,?,?,?,?,?,?,?,?)
`).run('Maria Silva', '(12) 99999-1234', 'maria@email.com', 'Jacareí', 'Seguro Auto',
      'Quero cotar seguro para Honda Fit 2020', 'site', 'novo', corretorId);

db.prepare(`
  INSERT INTO leads (nome, telefone, email, cidade, produto, origem, status)
  VALUES (?,?,?,?,?,?,?)
`).run('Pedro Souza', '(12) 98888-5678', 'pedro@email.com', 'São José dos Campos',
      'Plano de Saúde Empresarial', 'site', 'novo');

// Cliente demo
const clienteInfo = db.prepare(`
  INSERT INTO clientes (nome, cpf_cnpj, telefone, email, cidade, corretor_id)
  VALUES (?,?,?,?,?,?)
`).run('Empresa XYZ Ltda', '12.345.678/0001-99', '(12) 3456-7890', 'xyz@email.com',
      'Taubaté', corretorId);
const clienteId = Number(clienteInfo.lastInsertRowid);

// Apólice demo
db.prepare(`
  INSERT INTO apolices (cliente_id, produto, seguradora, numero, vigencia_inicio, vigencia_fim, premio, status, corretor_id)
  VALUES (?,?,?,?,?,?,?,?,?)
`).run(clienteId, 'Seguro Empresarial', 'Porto Seguro', 'POL-12345',
      '2025-01-01', dateNextDays(20), 4500, 'ativa', corretorId);

db.prepare(`
  INSERT INTO apolices (cliente_id, produto, seguradora, numero, vigencia_inicio, vigencia_fim, premio, status, corretor_id)
  VALUES (?,?,?,?,?,?,?,?,?)
`).run(clienteId, 'Seguro de Vida', 'MetLife', 'POL-67890',
      '2025-06-01', dateNextDays(60), 1200, 'ativa', corretorId);

// Sinistro demo
db.prepare(`
  INSERT INTO sinistros (cliente_id, descricao, data_evento, status, corretor_id)
  VALUES (?,?,?,?,?)
`).run(clienteId, 'Colisão frontal em rodovia', '2026-07-15', 'em_analise', corretorId);

// Agendamentos
db.prepare(`
  INSERT INTO agendamentos (cliente_id, corretor_id, data_hora, titulo, observacao, status)
  VALUES (?,?,?,?,?,?)
`).run(clienteId, corretorId, dateNextDays(2, true), 'Retorno renovação apólice',
      'Confirmar renovação com vigência próxima', 'pendente');

console.log('Seed OK!\n');
console.log('=== ACESSO ADMIN ===');
console.log('Email:', adminEmail);
console.log('Senha:', adminSenha);
console.log('\n=== ACESSO CORRETOR ===');
console.log('Email: joao@vidadeouro.com.br');
console.log('Senha: corretor123');

function dateNextDays(days, withTime = false) {
  const d = new Date(Date.now() + days * 86400000);
  const iso = d.toISOString();
  return withTime ? iso.slice(0, 16).replace('T', ' ') : iso.slice(0, 10);
}