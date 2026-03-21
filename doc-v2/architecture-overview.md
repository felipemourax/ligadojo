# Architecture Overview

## Objetivo

Documentar o padrao arquitetural que o projeto segue hoje, as partes que ja estao aderentes e os ajustes necessarios para convergir todo o sistema ao mesmo modelo.

## Principios Adotados

### DDD

O dominio do produto deve permanecer centralizado no backend, em `apps/api/src/modules/*`. Cada modulo representa um subdominio ou contexto funcional do sistema, por exemplo:

- `classes`
- `students`
- `teachers`
- `graduations`
- `finance`
- `events`
- `onboarding`
- `tenancy`

O frontend e os BFFs nao devem duplicar regra de negocio do dominio. Eles podem:

- orquestrar chamadas;
- compor payloads de experiencia;
- adaptar dados para a tela.

Eles nao podem:

- recalcular regra de elegibilidade;
- redefinir regra de presenca;
- decidir escopo de acesso;
- manter verdade paralela do dominio.

### Clean Architecture

O sistema esta organizado, na pratica, em quatro niveis principais:

1. `Frontend experience layer`
   - `app/app/*`
   - `modules/app/*`

2. `Transport / API / BFF layer`
   - `app/api/*`
   - `app/api/app/teacher/*`
   - `app/api/app/student/*`

3. `Domain / application services`
   - `apps/api/src/modules/*`

4. `Infrastructure / persistence`
   - Prisma, repositorios e adaptadores de persistencia

Fluxo esperado:

```text
Tela -> BFF/Route Handler -> Service/Use Case -> Repository/Infra -> Banco
```

### SOLID

O projeto ja segue parte do principio de responsabilidade unica em alguns pontos, mas ainda ha violacoes pontuais.

Ja aderente:

- BFFs de app por role tendem a ser finos e orquestradores.
- Muitos modulos possuem separacao entre `domain`, `services` e `repositories`.
- Helpers de acesso por tenant/capability estao centralizados.

Pontos ainda inconsistentes:

- alguns route handlers acumulam normalizacao de payload, validacao e acesso direto a infraestrutura;
- varios modulos ainda sao fortemente `service-centric`, sem contratos/DTOs explicitos;
- nem todos os modulos possuem separacao igualmente madura entre aplicacao, dominio e persistencia.

### BFF Por Role / Experiencia

O app do usuario final nao e um dashboard administrativo reduzido. Ele e uma experiencia separada por intencao/papel.

Estrutura atual encontrada:

- `app/api/app/teacher/*`
- `app/api/app/student/*`
- `app/app/teacher/*`
- `app/app/student/*`

Isso esta alinhado ao principio de BFF por experiencia:

- `teacher` recebe payloads orientados ao trabalho do professor;
- `student` recebe payloads orientados ao acompanhamento do aluno;
- o backend continua dono da regra de negocio.

### Multi-tenant SaaS

O sistema opera por tenant e a separacao entre academias e requisito estrutural, nao apenas de interface.

Mecanismos encontrados:

- resolucao de tenant por host;
- validacao de membership ativa;
- validacao por capability para dashboard/admin;
- validacao por role para app `teacher` e `student`.

Helpers atuais:

- `app/api/_lib/dashboard-tenant-access.ts`
- `app/api/_lib/app-tenant-access.ts`

## Separacao Entre Camadas

### 1. Dominio

Local principal:

```text
apps/api/src/modules/*
```

Responsavel por:

- entidades e tipos de dominio;
- invariantes de negocio;
- orquestracao de casos de uso do dominio;
- regras multi-tenant ligadas ao contexto funcional;
- repositorios e mapeadores de persistencia quando aplicavel.

Nao deve conter:

- detalhes de layout;
- adaptacao para tela especifica;
- controle de navegacao;
- decisao de UX por role.

### 2. Application / BFF

Locais principais:

```text
app/api/*
app/api/app/teacher/*
app/api/app/student/*
apps/api/src/modules/app/services/*
```

Responsavel por:

- autenticar e autorizar;
- resolver tenant e membership;
- chamar services do dominio;
- agregar dados por experiencia;
- devolver contratos prontos para tela.

Nao deve conter:

- regra de negocio duplicada do dominio;
- calculos paralelos de presenca, graduacao, elegibilidade ou cobranca;
- logica de exibicao acoplada ao JSX.

### 3. Frontend Experience Layer

Locais principais:

```text
app/app/*
modules/app/*
```

Responsavel por:

- composicao de screen;
- organizacao de shell/layout;
- interacao do usuario;
- estados de interface;
- adaptacao de contratos para view model.

Nao deve conter:

- autorizacao efetiva;
- filtragem de tenant como garantia de seguranca;
- regra de negocio canonicamente decisoria.

### 4. UI Shared

Locais principais hoje:

```text
modules/app/ui/*
modules/app/components/*
components/*
```

Responsavel por:

- shells compartilhados;
- componentes visuais;
- padroes de layout;
- primitivas de composicao de tela.

Nao deve conter:

- fetch de dominio profundo;
- branchs de regra de negocio por role;
- decisao de escopo de recurso.

## Estado Atual

### Aderencias ja encontradas

- dominio centralizado em `apps/api/src/modules/*`;
- BFF de app separado por role em `teacher` e `student`;
- validacao de tenant/role/capability no backend;
- rotas do app por role em `app/app/teacher/*` e `app/app/student/*`;
- contracts especificos de app em `apps/api/src/modules/app/domain/*`.

### Divergencias relevantes

- `modules/app` ainda esta organizado principalmente como `components` e `services`, nao como `ui`, `features`, `teacher`, `student`;
- professor ja possui shell propria em `modules/app/ui/teacher-app-shell.tsx`, mas aluno ainda usa `SurfaceShell` compartilhada fora desse padrao;
- ainda existem rotas genericas de `/app/*` funcionando como legado/redirecionamento;
- alguns handlers HTTP concentram normalizacao e acesso direto a Prisma;
- fronteira de `attendance` esta espalhada entre `classes/sessions` e BFFs do app.

## Estado Alvo

### Regras estruturais

- dominio continua unico em `apps/api/src/modules/*`;
- BFF do app continua separado por role/experiencia;
- frontend do app passa a seguir modularizacao clara em `ui`, `features`, `teacher`, `student`;
- regras de negocio continuam exclusivamente no backend;
- seguranca continua obrigatoriamente no backend, com verificacao de tenant, role, capability e escopo do recurso.

### Decisao operacional de naming

- codigo e estrutura interna: ingles;
- UI para usuario final: portugues;
- roles internas: `teacher` e `student`;
- texto exibido ao usuario: `Professor` e `Aluno`.

## O Que Pode E O Que Nao Pode Em Cada Camada

### Pode

- frontend compor tela por role;
- BFF agregar dados para reduzir roundtrips;
- service de dominio validar payload de negocio;
- repositorio encapsular persistencia;
- route handler cuidar de auth, parse basico e resposta HTTP.

### Nao Pode

- frontend decidir seguranca real;
- BFF recalcular regra de negocio canonica;
- duplicar logica em `teacher` e `student` quando a regra pertence ao dominio;
- jogar regra de tenant apenas em filtro visual;
- tratar `app` como um dashboard generico com pequenas variacoes.

## Mandatory Rules

- dominio MUST permanecer centralizado em `apps/api/src/modules/*`.
- frontend MUST NOT conter regra de negocio canonica.
- BFF MUST NOT redefinir regras de dominio ja pertencentes ao backend.
- validacao de tenant, role, capability e resource scope MUST ocorrer no backend.
- `teacher` e `student` MUST ser tratados como experiencias distintas, e nao como variacoes superficiais da mesma tela.
- qualquer excecao a essas regras MUST ser tratada como desalinhamento arquitetural, nao como alternativa valida.

## Examples (Correct vs Incorrect)

Correto:

- `teacher` consome um payload agregado por `app/api/app/teacher/*`, enquanto a regra de presenca continua no backend.
- `student` consome apenas seu progresso via BFF especifico, sem recalcular elegibilidade no frontend.

Incorreto:

- criar calculo de presenca dentro de hook React porque a tela precisa exibir totalizadores.
- criar filtragem por tenant apenas no frontend e considerar isso suficiente como seguranca.
- replicar em `modules/app/teacher/*` uma regra que ja existe em `apps/api/src/modules/*`.

## Checklist

- a mudanca respeita a separacao entre dominio, BFF, frontend experience e UI shared;
- nenhuma regra de negocio canonica foi deslocada para BFF ou frontend;
- a seguranca continua no backend;
- a experiencia de `teacher` e `student` continua segregada por intencao;
- a alteracao nao contradiz o estado alvo documentado.
