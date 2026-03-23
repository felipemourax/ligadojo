# Backend Architecture

## Objetivo

Documentar o padrao de backend adotado hoje, os pontos em que ele ja esta aderente ao modelo definido e o que ainda precisa ser ajustado para ficar consistente em todo o sistema.

## Estado Atual

## Estrutura Base

O backend esta dividido em duas areas principais:

### 1. Transporte HTTP / Web

```text
app/api/*
```

Responsavel por:

- receber requests HTTP;
- validar sessao;
- resolver tenant;
- validar role/capability;
- chamar services dos modulos;
- serializar resposta HTTP.

### 2. Dominio / Aplicacao

```text
apps/api/src/modules/*
```

Responsavel por:

- encapsular regra de negocio;
- organizar services por modulo;
- concentrar entidades e tipos de dominio;
- implementar acesso a dados via repositories quando aplicavel.

## Modulos De Dominio Encontrados

Principais modulos atuais:

- `classes`
- `students`
- `teachers`
- `graduations`
- `finance`
- `events`
- `modalities`
- `plans`
- `enrollment-requests`
- `onboarding`
- `tenancy`
- `academy-memberships`
- `iam`

Modulo especial:

- `app`

Esse modulo `app` nao representa um dominio de negocio independente. Ele funciona como camada de experiencia do app, com services orientados a `teacher` e `student`, por exemplo:

- `teacher-app-home.service.ts`
- `teacher-app-attendance.service.ts`
- `student-app-home.service.ts`
- `student-app-progress.service.ts`

Esse desenho esta coerente com BFF por role, desde que continue fino e orquestrador.

## Services

### Papel Atual

Hoje os services concentram a maior parte do comportamento do backend. Em muitos modulos eles acumulam:

- validacao de negocio;
- orquestracao;
- normalizacao de entrada;
- consulta a repositorios;
- montagem de payload de saida.

Isso funciona, mas gera niveis diferentes de maturidade entre modulos.

### Estado Alvo

Convencao recomendada:

- `domain services`: regras de negocio e invariantes do modulo;
- `application services` ou `use cases`: orquestracao da operacao;
- `BFF services`: composicao de payload para uma experiencia especifica.

Exemplo de distribuicao alvo:

```text
apps/api/src/modules/classes/
  domain/
  repositories/
  services/
    create-class-group.service.ts
    update-class-group.service.ts
    list-class-groups.service.ts
    upsert-class-session.service.ts
```

Nao e obrigatorio explodir tudo em muitos arquivos imediatamente, mas a direcao e diminuir services genericos excessivamente grandes.

## Repositories

### Estado Atual

Alguns modulos ja possuem repositories explicitos:

- `classes`
- `modalities`
- `plans`
- `onboarding`
- `tenancy`
- `academy-memberships`
- `iam`

Outros modulos ainda dependem mais fortemente de services + Prisma direto:

- `teachers`
- `students`
- `events`
- `finance`
- `graduations`

Observacao importante de ownership:

- aceite de convite e ativacao de membership agora pertencem ao modulo `invitations`;
- solicitacao publica de vinculo no host da academia (`POST /api/tenants/[tenantSlug]/enrollment-requests`) agora pertence ao modulo `enrollment-requests`;
- revisao de pedido de vinculo (`approve` / `reject`) agora pertence ao modulo `enrollment-requests`;
- no autocadastro do aluno, `enrollment-requests` cria o acesso imediato e registra `StudentActivity`; turma e `StudentModality` deixam de ser pre-requisito para entrada no app;
- `onboarding` permanece dono de criacao de academia e setup.

Observacao importante de tenancy gerenciada:

- em producao, o dominio raiz da plataforma e `ligadojo.com.br`;
- tenants gerenciados devem usar o padrao `slug.ligadojo.com.br`;
- `buildManagedTenantDomain` passou a centralizar esse comportamento;
- em desenvolvimento local o padrao continua `slug.localhost`.

Observacao importante de superficie da plataforma:

- a administracao global da plataforma usa `app/api/platform/*`;
- essa superficie aceita apenas `platform_admin`;
- o ownership atual dessas operacoes fica em `apps/api/src/modules/platform`.

### Estado Alvo

Todo acesso estrutural a persistencia deve ficar encapsulado em repositorios ou gateways equivalentes quando a complexidade do modulo justificar.

Regra pratica:

- leitura/escrita simples e isolada pode continuar em service durante transicao;
- fluxo que mistura query, filtro por tenant, reuso e regra recorrente deve migrar para repository;
- route handler nao deve acessar Prisma diretamente quando o modulo ja possui service ou repository proprio para isso.

## Use Cases / Application Services

### Estado Atual

Nao ha uma camada formal de `use-cases` nomeada dessa forma na maior parte dos modulos. A orquestracao esta, em geral, embutida em `services`.

Exemplos:

- `StudentDashboardService`
- `TeacherDashboardService`
- `ClassGroupService`
- `FinanceDashboardService`

### Estado Alvo

Mesmo sem introduzir uma pasta `use-cases` imediatamente, o comportamento esperado e:

- um service por operacao importante ou por agregado coeso;
- responsabilidades de entrada, regra e persistencia mais explicitas;
- contratos de entrada/saida mais claros.

## Contracts / DTOs

### Estado Atual

O backend ainda nao segue um padrao unico de `contracts` ou `dto` por modulo.

Foi encontrado:

- tipos de dominio em `domain/*`;
- contratos especificos do app em `apps/api/src/modules/app/domain/*`;
- normalizacao de payload frequentemente feita dentro de route handlers.

Exemplos de desalinhamento:

- `app/api/teachers/route.ts`
- `app/api/teachers/[teacherId]/route.ts`
- `app/api/students/route.ts`
- `app/api/students/[studentId]/route.ts`

### Estado Alvo

Recomendacao:

- contratos de entrada/saida do backend devem viver no modulo correspondente;
- route handler deve fazer parse minimo e delegar validacao semantica ao service;
- mapeamento HTTP -> input de aplicacao deve ser previsivel e reutilizavel.

Padrao sugerido:

```text
apps/api/src/modules/teachers/
  contracts/
    create-teacher.input.ts
    update-teacher.input.ts
    teacher.output.ts
  services/
  domain/
```

## Validacao De Tenant / Role / Capability

## Dashboard / Admin

Padrao atual:

- helper `requireDashboardTenantCapability`
- tenant resolvido por host ou membership selecionada
- capabilities combinadas por system role + membership role

Esse padrao esta correto para a superficie administrativa.

## App Por Role

Padrao atual:

- helper `requireTenantAppAccess`
- tenant resolvido por host
- membership ativa obrigatoria
- restricao explicita para `teacher` ou `student`

Esse padrao esta correto para o app final.

## Escopo De Acesso Por Recurso

### Estado Atual

Ja existe escopo parcial em alguns pontos. Exemplo:

- `students/candidates` limita resultados para professor conforme vinculo com modalidades;
- layouts de `teacher` e `student` redirecionam conforme role;
- BFFs do app operam por role especifica.

### Estado Alvo

Toda operacao mutante ou sensivel deve validar tambem o escopo do recurso:

- o professor so pode operar sobre turmas, aulas e alunos do seu escopo;
- o aluno so pode ler seus proprios dados;
- o admin so opera dentro do tenant ativo;
- nenhuma consulta deve depender apenas de filtro no frontend.

## Onde A Regra De Negocio Deve Viver

A regra de negocio deve viver no dominio/backend, preferencialmente em `apps/api/src/modules/*`.

Exemplos de regra que nao pode sair do backend:

- calculo de presenca;
- elegibilidade para graduacao;
- regra de status de cobranca;
- regra de vinculo professor/aluno/turma;
- validacao de acesso por tenant e resource scope.

O BFF do app pode:

- selecionar campos;
- agregar respostas;
- compor payload para tela.

O BFF do app nao pode:

- redefinir regra de presenca;
- recalcular elegibilidade;
- decidir sozinho se um recurso pertence ao ator.

## Anti-patterns A Evitar

- Prisma direto em route handler quando o modulo ja deveria encapsular persistencia;
- normalizacao pesada de payload HTTP espalhada em varios handlers;
- services grandes demais sem fronteiras claras;
- regra de negocio duplicada entre dashboard API e app BFF;
- autorizacao apenas visual no frontend;
- modulos do app assumindo papel de dominio central;
- endpoints de um modulo alojados em outro por conveniencia duradoura.

## Inconsistencias Relevantes Encontradas

- `attendance` administrativo ainda esta representado principalmente por `PUT /api/classes/sessions`, o que mistura fronteira de classes com presenca;
- `teachers` e `students` ainda possuem muito parse/normalizacao dentro da camada HTTP;
- `events` e `graduations` ainda estao mais proximos de services de dashboard do que de um conjunto completo de contratos/repositorios;
- `finance` ja avancou para contracts, repository e services especializados, mas ainda concentra sincronizacao temporal relevante em services grandes demais;
- `app` como BFF esta melhor alinhado que parte da API administrativa, o que indica que a proxima rodada de refatoracao deve focar principalmente em contratos e transporte do backend.

## Mandatory Rules

- route handler MUST cuidar de HTTP, auth/authz, parse minimo e serializacao.
- route handler MUST NOT se tornar dono de regra de negocio do modulo.
- acesso estrutural a persistencia MUST convergir para services/repositorios do modulo correspondente.
- BFF services do modulo `app` MUST permanecer focados em composicao de experiencia.
- validacao de tenant, role, capability e resource scope MUST existir em toda operacao sensivel.
- nenhuma regra de negocio canonica MUST ser implementada apenas na camada BFF.

## Examples (Correct vs Incorrect)

Correto:

- um handler chama `requireDashboardTenantCapability`, delega o payload normalizado a um service do modulo e retorna resposta HTTP.
- um service do modulo `app` compoe dados de professor a partir de services de dominio ja existentes.

Incorreto:

- handler usando Prisma direto para montar regra de negocio porque o service ainda nao foi ajustado.
- BFF de `teacher` recalculando elegibilidade de graduacao sem passar pelo modulo de `graduations`.
- confiar no layout de `teacher` ou `student` como unica barreira de acesso.

## Checklist

- a operacao tem auth e authz adequados;
- a regra de negocio continua no backend de dominio/aplicacao;
- o handler nao acumula parse e validacao semantica em excesso;
- o acesso ao dado nao foi espalhado fora do modulo correto;
- o escopo do recurso foi validado no backend;
- a mudanca nao aumenta o acoplamento entre dashboard API e app BFF.
