# CRM Vida de Ouro Jacareí

Site institucional da corretora **Vida de Ouro Jacareí** com captação de leads via
WhatsApp e um **CRM** completo (Node.js + Express + SQLite) para gestão de leads,
clientes, apólices, sinistros, agendamentos e usuários.

## Estrutura

```
site-seguros/
├── index.html, produto.html, sobre.html, contato.html   # Site institucional
├── assets/                                               # CSS, JS e imagens do site
├── crm/                                                  # Frontend do painel administrativo (CRM)
└── server/                                               # API + backend do CRM
    ├── server.js        # App Express
    ├── db.js            # Conexão SQLite + schema
    ├── seed.js          # Popula dados de demonstração
    ├── utils.js         # Helpers (validação, erros, paginação)
    ├── middleware/      # Autenticação JWT
    └── routes/          # Rotas da API
```

## Pré-requisitos

- **Node.js 22+** (usa o módulo nativo `node:sqlite`)

## Configuração do backend

```bash
cd server
npm install
cp .env.example .env   # no Windows: copy .env.example .env
```

Edite o `.env` e defina um `JWT_SECRET` forte. Para gerar um:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Variáveis de ambiente disponíveis (ver [.env.example](server/.env.example)):

| Variável          | Descrição                                                        |
|-------------------|------------------------------------------------------------------|
| `JWT_SECRET`      | Segredo para assinar tokens JWT. **Obrigatório em produção.**     |
| `PORT`            | Porta do servidor (padrão `3001`).                               |
| `NODE_ENV`        | `development` ou `production`.                                   |
| `ALLOWED_ORIGINS` | Origens permitidas no CORS, separadas por vírgula (vazio = livre).|

## Rodando

```bash
cd server
npm run seed    # cria usuário admin + dados de demonstração (só na 1ª vez)
npm start       # inicia o servidor
```

- API: http://localhost:3001/api
- Painel CRM: http://localhost:3001/crm/

### Credenciais de demonstração (via `npm run seed`)

| Perfil    | E-mail                        | Senha        |
|-----------|-------------------------------|--------------|
| Admin     | admin@vidadeouro.com.br       | `admin123`   |
| Corretor  | joao@vidadeouro.com.br        | `corretor123`|

> **Troque essas senhas antes de ir para produção.**

## Segurança

- Autenticação via **JWT** (expira em 12h) e senhas com **bcrypt**.
- **Helmet** para headers de segurança HTTP.
- **CORS** restringível por origem via `ALLOWED_ORIGINS`.
- **Rate limiting**: 300 req/15min na API em geral; 20 req/15min nos endpoints
  públicos (`POST /api/leads` e login).
- Controle de acesso por papel: `admin` vê tudo; `corretor` vê apenas seus registros.

## API

| Método | Rota                | Auth   | Descrição                            |
|--------|---------------------|--------|--------------------------------------|
| POST   | `/api/auth/login`   | —      | Login, retorna token JWT             |
| GET    | `/api/auth/me`      | Sim    | Dados do usuário autenticado         |
| POST   | `/api/leads`        | —      | Cria lead (formulário público)       |
| GET    | `/api/leads`        | Sim    | Lista leads                          |
| GET    | `/api/clientes`     | Sim    | Lista clientes                       |
| GET    | `/api/apolices`     | Sim    | Lista apólices                       |
| GET    | `/api/sinistros`    | Sim    | Lista sinistros                      |
| GET    | `/api/agendamentos` | Sim    | Lista agendamentos                   |
| GET    | `/api/usuarios`     | Admin  | Lista usuários                       |
| GET    | `/api/dashboard`    | Sim    | Métricas do dashboard                |

As rotas de listagem também aceitam `CRUD` completo (POST/PUT/DELETE).

### Paginação (opcional)

As listagens retornam um array por padrão. Ao passar `?page=` e/ou `?limit=` a
resposta vem no formato `{ data, total, page, limit }`:

```
GET /api/leads?page=1&limit=50
```
