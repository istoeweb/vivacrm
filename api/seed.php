<?php
/*
 * Seed: cria usuário admin + dados de demonstração.
 * Uso (linha de comando):  php api/seed.php
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

$adminEmail = 'admin@vidadeouro.com.br';
$adminSenha = 'admin123';

$db = db();

$existing = q_one_seed($db, 'SELECT id FROM usuarios WHERE email = ?', [$adminEmail]);
if ($existing) {
  echo "Admin já existe. ID: {$existing['id']}\n";
  echo "Email: $adminEmail\n";
  echo "Senha: $adminSenha\n";
  exit(0);
}

$stmt = $db->prepare("INSERT INTO usuarios (nome, email, senha_hash, role, ativo) VALUES (?,?,?,'admin',1)");
$stmt->execute(['Administrador', $adminEmail, senha_hash($adminSenha)]);

// Corretor demo
$stmt = $db->prepare("INSERT INTO usuarios (nome, email, senha_hash, role, ativo) VALUES (?,?,?,'corretor',1)");
$stmt->execute(['João Corretor', 'joao@vidadeouro.com.br', senha_hash('corretor123')]);
$corretorId = (int)$db->lastInsertId();

// Leads demo
$db->prepare("INSERT INTO leads (nome, telefone, email, cidade, produto, mensagem, origem, status, corretor_id) VALUES (?,?,?,?,?,?,?,?,?)")
   ->execute(['Maria Silva', '(12) 99999-1234', 'maria@email.com', 'Jacareí', 'Seguro Auto', 'Quero cotar seguro para Honda Fit 2020', 'site', 'novo', $corretorId]);

$db->prepare("INSERT INTO leads (nome, telefone, email, cidade, produto, origem, status) VALUES (?,?,?,?,?,?,?)")
   ->execute(['Pedro Souza', '(12) 98888-5678', 'pedro@email.com', 'São José dos Campos', 'Plano de Saúde Empresarial', 'site', 'novo']);

// Cliente demo
$db->prepare("INSERT INTO clientes (nome, cpf_cnpj, telefone, email, cidade, corretor_id) VALUES (?,?,?,?,?,?)")
   ->execute(['Empresa XYZ Ltda', '12.345.678/0001-99', '(12) 3456-7890', 'xyz@email.com', 'Taubaté', $corretorId]);
$clienteId = (int)$db->lastInsertId();

// Apólices demo
$insAp = $db->prepare("INSERT INTO apolices (cliente_id, produto, seguradora, numero, vigencia_inicio, vigencia_fim, premio, status, corretor_id) VALUES (?,?,?,?,?,?,?,?,?)");
$insAp->execute([$clienteId, 'Seguro Empresarial', 'Porto Seguro', 'POL-12345', '2025-01-01', date('Y-m-d', strtotime('+20 days')), 'R$ 4.500/ano', 'ativa', $corretorId]);
$insAp->execute([$clienteId, 'Seguro de Vida', 'MetLife', 'POL-67890', '2025-06-01', date('Y-m-d', strtotime('+60 days')), 'R$ 1.200/ano', 'ativa', $corretorId]);

// Sinistro demo
$db->prepare("INSERT INTO sinistros (cliente_id, descricao, data_evento, status, corretor_id) VALUES (?,?,?,?,?)")
   ->execute([$clienteId, 'Colisão frontal em rodovia', '2026-07-15', 'em_analise', $corretorId]);

// Agendamento demo
$db->prepare("INSERT INTO agendamentos (cliente_id, corretor_id, data_hora, titulo, observacao, status) VALUES (?,?,?,?,?,?)")
   ->execute([$clienteId, $corretorId, date('Y-m-d H:i', strtotime('+2 days')), 'Retorno renovação apólice', 'Confirmar renovação com vigência próxima', 'pendente']);

echo "Seed OK!\n\n";
echo "=== ACESSO ADMIN ===\n";
echo "Email: $adminEmail\n";
echo "Senha: $adminSenha\n\n";
echo "=== ACESSO CORRETOR ===\n";
echo "Email: joao@vidadeouro.com.br\n";
echo "Senha: corretor123\n";

function q_one_seed(PDO $db, string $sql, array $params): ?array {
  $stmt = $db->prepare($sql);
  $stmt->execute($params);
  $r = $stmt->fetch(PDO::FETCH_ASSOC);
  return $r === false ? null : $r;
}
