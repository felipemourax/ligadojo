# LigaDojo

SaaS multi-tenant para academias de luta com 3 superficies principais:

- plataforma SaaS;
- dashboard administrativo da academia;
- app da academia para `teacher` e `student`.

## Arquitetura

Organizacao principal:

```text
app/
  api/                 # transporte HTTP / BFF
  dashboard/           # rotas do dashboard da academia
  app/teacher/         # rotas do app do professor
  app/student/         # rotas do app do aluno

apps/api/src/modules/  # dominio e regra de negocio

modules/               # frontend modular por dominio/experiencia
```

Regras estruturais:

- regra de negocio fica em `apps/api/src/modules/*`;
- `app/api/*` e camada fina de transporte;
- frontend e organizado por modulo e por experiencia;
- `site` e o site publico da academia;
- `platform-site` e a landing publica do SaaS.

## Tenancy

### Desenvolvimento local

- plataforma: `localhost:3000`
- tenant: `slug.localhost:3000`

### Producao

- plataforma: `ligadojo.com.br`
- tenant gerenciado: `slug.ligadojo.com.br`

Variaveis relevantes:

```env
PLATFORM_ROOT_DOMAIN="ligadojo.com.br"
PLATFORM_HOSTS="ligadojo.com.br,www.ligadojo.com.br"
```

### Comportamento atual por host

- `ligadojo.com.br/`
  - visitante: landing publica do SaaS
  - autenticado `platform_admin`: `/platform`
  - autenticado de academia: `/access`

- `slug.ligadojo.com.br/`
  - visitante: site publico da academia, se publicado
  - autenticado `academy_admin`: `/dashboard`
  - autenticado `teacher`: `/app/teacher`
  - autenticado `student`: `/app/student`

- `slug.ligadojo.com.br/app`
  - entrada direta do app/login do tenant

- `slug.ligadojo.com.br/site`
  - rota explicita do site publico da academia

## Ambiente local

Requisitos:

- Node 22+
- npm
- Docker

Instalacao:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
node prisma/seed.mjs
npm run dev
```

Aplicacao:

- plataforma: `http://localhost:3000`
- tenant seedado: `http://dojo-centro.localhost:3000`

## Producao atual

Stack operacional atual no servidor:

- Next.js
- PM2
- Nginx
- Postgres em Docker

Observacao importante:

- o runtime oficial em producao hoje esta em `PM2 + Nginx`;
- o painel `Node Project` do aaPanel nao e a fonte de verdade do processo em execucao.

## DNS e SSL recomendados

Para o modelo escalavel de tenants:

- `A @ -> IP do servidor`
- `A www -> IP do servidor`
- `A * -> IP do servidor`

SSL:

- `ligadojo.com.br`
- `*.ligadojo.com.br`

Wildcard SSL exige validacao por DNS challenge.

## Fluxo de deploy atual

Resumo do deploy hoje:

1. atualizar codigo no servidor em `/www/wwwroot/ligadojo.com.br`
2. garantir `.env` de producao
3. rodar:

```bash
npm install
npm run build
```

4. reiniciar:

```bash
pm2 restart ligadojo
nginx -t
systemctl reload nginx
```

## Git

Remote atual:

```text
git@github.com:felipemourax/ligadojo.git
```

A autenticacao do GitHub foi configurada por SSH com chave dedicada da maquina.
