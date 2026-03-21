# Implementation Guidelines

## Objetivo

Fornecer um checklist pratico para o time evoluir o sistema sem reabrir inconsistencias de arquitetura, naming, rotas e duplicacao de logica.

## Checklist Geral

- manter codigo interno em ingles;
- manter texto de interface em portugues;
- colocar regra de negocio apenas no backend;
- usar BFF por role para o app;
- validar tenant, role/capability e resource scope no backend;
- evitar criar nova feature em rota generica legada;
- nao duplicar dominio em `teacher` e `student`.

## Convencoes De Naming

### Codigo interno

- usar ingles para pastas, arquivos, tipos, funcoes e contratos;
- roles internas: `teacher`, `student`, `academy_admin`, `platform_admin`;
- modulos de dominio: `classes`, `students`, `teachers`, `graduations`, `finance`, `events`.

### UI

- labels, textos e copys em portugues;
- nomes de menu e CTA em portugues;
- nao traduzir estrutura interna do codigo para portugues.

## Convencoes De Rotas

### App do usuario final

Usar:

```text
/app/teacher/*
/app/student/*
```

Regras:

- rotas novas devem nascer segmentadas por role;
- nao reintroduzir `/app/attendance`, `/app/classes`, `/app/profile` nem outras rotas genericas do app;
- compatibilidade, quando necessaria, deve ser resolvida fora da superficie primaria por role e sem duplicar implementacao.

### API administrativa

Usar:

```text
/api/classes/*
/api/students/*
/api/teachers/*
/api/graduations/*
/api/finance/*
/api/events/*
```

Regra:

- endpoint deve refletir o modulo dono da operacao;
- se a operacao pertence a `attendance`, o alvo deve convergir para fronteira propria, nao permanecer indefinidamente sob `classes`.
- configuracoes operacionais de `finance` da academia devem convergir para:
  - `/api/finance/settings`
  - `Dashboard > Settings > Pagamentos`

### API do app

Usar:

```text
/api/app/teacher/*
/api/app/student/*
```

Regra:

- BFF do app sempre por role;
- payload orientado a experiencia;
- sem duplicar regra do dominio.

## Convencoes De DTO / Contracts

- criar contratos no modulo dono da operacao;
- separar input e output quando a operacao for mutante ou relevante;
- route handler deve fazer parse minimo e delegar validacao semantica;
- nao espalhar `normalizePayload` iguais em varios handlers.

Padrao sugerido:

```text
apps/api/src/modules/<module>/
  contracts/
    create-<entity>.input.ts
    update-<entity>.input.ts
    <entity>.output.ts
```

## Convencoes De Pastas

### Backend

```text
apps/api/src/modules/<module>/
  domain/
  repositories/
  services/
  contracts/   # quando necessario
```

### Frontend do app

```text
modules/app/
  ui/
  features/
  teacher/
  student/
```

### Features compartilhadas

```text
modules/app/features/<feature>/
  base/
  teacher/
  student/
```

## Regras Para Criacao De Novas Features

1. identificar o modulo de dominio dono da regra;
2. expor ou ajustar o service/backend no modulo correto;
3. criar ou ajustar o endpoint administrativo ou BFF correspondente;
4. criar a composicao de frontend no modulo correto;
5. validar tenant, role/capability e resource scope;
6. documentar endpoint e estrutura se a feature alterar a referencia oficial.

## Regras Para Evitar Duplicacao De Logica

- calculo de presenca fica no backend;
- elegibilidade de graduacao fica no backend;
- regra de cobranca e status financeiro ficam no backend;
- politica financeira da academia nao deve ser duplicada em outra tela fora de `Settings > Pagamentos`;
- professor e aluno podem ter UI diferente, mas nao regra de negocio duplicada;
- shared feature pode compartilhar UI e mapeamento, nunca a verdade de dominio local.

## Regras Operacionais Ja Consolidadas

- a contratacao de plano pelo aluno vive em `/app/student/plans`;
- a primeira cobranca da contratacao e gerada no ato;
- o `billingDay` passa a ser a data-base do vencimento futuro;
- troca de plano e inadimplencia devem sempre consultar a politica do tenant em `finance/settings`;
- bloqueio de novas turmas e retirada das turmas atuais por inadimplencia continuam sendo decididos no backend;
- qualquer nova validacao funcional deve:
  - iniciar com cenario limpo;
  - usar API real;
  - fazer smoke de UI;
  - registrar resultado e cleanup no journal.

## Regras Para `screen`, `component`, `hook`, `mapper`, `state`

### `screen`

- compoe a tela;
- escolhe shell e layout variant;
- nao concentra regra de negocio.

### `component`

- foca em apresentacao e interacao local;
- nao conhece detalhes profundos de varias APIs.

### `hook`

- coordena estado de interface e chamadas do frontend;
- nao redefine regra canonica do sistema.

### `mapper`

- transforma contrato de API em view model;
- reduz acoplamento do JSX ao payload bruto.

### `state`

- guarda apenas estado de interface ou experiencia local;
- nao substitui persistencia nem regra do backend.

## Regras De Seguranca Obrigatorias

- toda rota deve validar sessao;
- toda rota administrativa deve validar capability;
- toda rota do app deve validar role;
- toda leitura/mutacao sensivel deve validar escopo do recurso;
- frontend nunca e mecanismo de seguranca.

## Anti-patterns Proibidos

- criar logica de presenca dentro de componente React;
- usar a mesma rota para experiencias claramente diferentes;
- duplicar feature inteira em `teacher` e `student` sem camada compartilhada;
- acessar Prisma diretamente do handler por conveniencia recorrente;
- criar naming interno em portugues;
- introduzir nova documentacao oficial fora de `doc-v2` sem alinhamento.

## Regra De Ouro

Se houver duvida sobre onde algo deve ficar:

- se decide negocio, pertence ao dominio/backend;
- se adapta para a tela, pertence ao BFF ou ao frontend;
- se e visual/estrutura de pagina, pertence a `modules/app/ui` ou a feature de frontend;
- se e compartilhado entre papeis, comecar por `base`, nao duplicar em dois lugares.

## Mandatory Rules

- codigo novo MUST seguir naming interno em ingles.
- UI nova MUST permanecer em portugues.
- nenhuma feature nova MUST nascer fora da estrutura alvo documentada.
- nenhum endpoint novo MUST ignorar tenant, role/capability e resource scope.
- nenhuma duplicacao de logica entre `teacher` e `student` MUST ser aceita se a regra pertencer ao dominio.

## Examples (Correct vs Incorrect)

Correto:

- criar `create-teacher.input.ts` em `apps/api/src/modules/teachers/contracts/*` quando o modulo exigir formalizacao de contrato.
- criar uma feature compartilhada em `modules/app/features/classes/base/*` e compor telas especificas em `teacher/*` e `student/*`.

Incorreto:

- criar arquivo `cadastro-professor.ts` como naming interno.
- criar nova tela em rota generica do app para evitar segmentacao por role.
- colocar regra de cobranca ou elegibilidade em hook de frontend.

## Checklist

- naming interno esta em ingles;
- UI permanece em portugues;
- rota segue o padrao correto;
- contract/DTO foi criado no modulo dono;
- BFF por role foi respeitado;
- regra de negocio nao vazou para frontend;
- resource scope foi garantido no backend.
