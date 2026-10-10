const bcrypt = require('bcrypt');
const db = require('./db');

const ADMIN_EMAIL = 'admin@vidadeouro.com.br';

/*
 * Cria o admin se ele ainda não existir. Com demo=true cria também um corretor e
 * dados de exemplo (leads, cliente, apólices, sinistro, agendamento).
 * CLI: `npm run seed` — senha do admin via ADMIN_PASSWORD (padrão admin123) e
 * SEED_DEMO=false para não criar dados de exemplo (ex.: banco de produção novo).
 */
async function seed({
  adminPassword = process.env.ADMIN_PASSWORD || 'admin123',
  demo = process.env.SEED_DEMO !== 'false',
} = {}) {
  await db.ready;
  const existing = await db.get('SELECT id FROM usuarios WHERE email = ?', ADMIN_EMAIL);
  if (existing) return { created: false, adminId: existing.id };

  const admin = await db.insert(`
    INSERT INTO usuarios (nome, email, senha_hash, role, ativo)
    VALUES (?, ?, ?, 'admin', 1)
  `, 'Administrador', ADMIN_EMAIL, bcrypt.hashSync(adminPassword, 10));
  if (!demo) return { created: true, adminId: admin.lastInsertRowid };

  // Corretor demo
  const corretorId = (await db.insert(`
    INSERT INTO usuarios (nome, email, senha_hash, role, ativo)
    VALUES (?, ?, ?, 'corretor', 1)
  `, 'João Corretor', 'joao@vidadeouro.com.br', bcrypt.hashSync('corretor123', 10))).lastInsertRowid;

  // Leads demo
  await db.run(`
    INSERT INTO leads (nome, telefone, email, cidade, produto, mensagem, origem, status, corretor_id)
    VALUES (?,?,?,?,?,?,?,?,?)
  `, 'Maria Silva', '(12) 99999-1234', 'maria@email.com', 'Jacareí', 'Seguro Auto',
    'Quero cotar seguro para Honda Fit 2020', 'site', 'novo', corretorId);
  await db.run(`
    INSERT INTO leads (nome, telefone, email, cidade, produto, origem, status)
    VALUES (?,?,?,?,?,?,?)
  `, 'Pedro Souza', '(12) 98888-5678', 'pedro@email.com', 'São José dos Campos',
    'Plano de Saúde Empresarial', 'site', 'novo');

  // Cliente demo
  const clienteId = (await db.insert(`
    INSERT INTO clientes (nome, cpf_cnpj, telefone, email, cidade, corretor_id)
    VALUES (?,?,?,?,?,?)
  `, 'Empresa XYZ Ltda', '12.345.678/0001-99', '(12) 3456-7890', 'xyz@email.com',
    'Taubaté', corretorId)).lastInsertRowid;

  // Apólices demo
  const apolice = `
    INSERT INTO apolices (cliente_id, produto, seguradora, numero, vigencia_inicio, vigencia_fim, premio, status, corretor_id)
    VALUES (?,?,?,?,?,?,?,?,?)
  `;
  await db.run(apolice, clienteId, 'Seguro Empresarial', 'Porto Seguro', 'POL-12345',
    '2025-01-01', dateNextDays(20), 4500, 'ativa', corretorId);
  await db.run(apolice, clienteId, 'Seguro de Vida', 'MetLife', 'POL-67890',
    '2025-06-01', dateNextDays(60), 1200, 'ativa', corretorId);

  // Sinistro demo
  await db.run(`
    INSERT INTO sinistros (cliente_id, descricao, data_evento, status, corretor_id)
    VALUES (?,?,?,?,?)
  `, clienteId, 'Colisão frontal em rodovia', '2026-07-15', 'em_analise', corretorId);

  // Agendamento demo
  await db.run(`
    INSERT INTO agendamentos (cliente_id, corretor_id, data_hora, titulo, observacao, status)
    VALUES (?,?,?,?,?,?)
  `, clienteId, corretorId, dateNextDays(2, true), 'Retorno renovação apólice',
    'Confirmar renovação com vigência próxima', 'pendente');

  return { created: true, adminId: admin.lastInsertRowid };
}

function dateNextDays(days, withTime = false) {
  const iso = new Date(Date.now() + days * 86400000).toISOString();
  return withTime ? iso.slice(0, 16).replace('T', ' ') : iso.slice(0, 10);
}

module.exports = { seed, ADMIN_EMAIL };

if (require.main === module) {
  seed()
    .then(({ created, adminId }) => {
      if (!created) {
        console.log('Admin já existe. ID:', adminId);
      } else {
        console.log('Seed OK!\n');
        console.log('=== ACESSO ADMIN ===');
        console.log('Email:', ADMIN_EMAIL);
        console.log('Senha:', process.env.ADMIN_PASSWORD ? '(definida em ADMIN_PASSWORD)' : 'admin123');
        if (process.env.SEED_DEMO !== 'false') {
          console.log('\n=== ACESSO CORRETOR ===');
          console.log('Email: joao@vidadeouro.com.br');
          console.log('Senha: corretor123');
        }
      }
      return db.close();
    })
    .catch((err) => { console.error(err); process.exit(1); });
}
