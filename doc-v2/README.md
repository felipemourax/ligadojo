# doc-v2

Esta pasta concentra a documentacao tecnica oficial da arquitetura atual do projeto e do plano de alinhamento/refatoracao para o padrao que estamos seguindo.

O objetivo desta versao e servir como referencia de engenharia para:

- entender como o sistema esta organizado hoje;
- deixar claro o estado alvo ja definido para a arquitetura;
- orientar evolucao, refatoracao e novas features sem reintroduzir inconsistencia;
- registrar o que ja existe, o que precisa ser ajustado e o que ainda esta planejado.

## Documentos

- `architecture-overview.md`: visao geral da arquitetura, principios adotados e responsabilidades por camada.
- `project-structure.md`: mapeamento da estrutura atual e da estrutura alvo por diretorio.
- `frontend-architecture.md`: padrao de frontend para app por role/experiencia.
- `backend-architecture.md`: padrao de backend para dominio, aplicacao, repositorios, contratos e seguranca.
- `api-specification.md`: especificacao das APIs atuais e esperadas por modulo.
- `refactor-plan.md`: backlog tecnico objetivo para alinhar o projeto ao padrao definido.
- `refactor-backlog.md`: backlog faseado por modulo, com ordem de execucao, dependencias e criterios de aceite.
- `refactor-roadmap.md`: roadmap executivo com marcos, ondas de entrega e sugestao de sequencia por sprint.
- `implementation-guidelines.md`: checklist operacional e convencoes para o time seguir daqui para frente.

## Ordem Recomendada De Leitura

1. `architecture-overview.md`
2. `project-structure.md`
3. `frontend-architecture.md`
4. `backend-architecture.md`
5. `api-specification.md`
6. `refactor-plan.md`
7. `refactor-backlog.md`
8. `refactor-roadmap.md`
9. `implementation-guidelines.md`

## Como Ler Esta Pasta

- `Estado atual`: descreve o que foi encontrado no codigo.
- `Estado alvo`: descreve como o projeto deve ficar para aderir ao padrao definido.
- `existing`: endpoint ou estrutura ja existente.
- `planned`: endpoint ou estrutura esperada, mas ainda nao implementada.
- `needs-refactor`: algo que existe, mas nao esta bem alinhado ao padrao alvo.

## Fonte De Verdade Considerada

Esta documentacao foi gerada a partir da analise do codigo real, com os seguintes pilares assumidos como regra arquitetural:

- DDD
- Clean Architecture
- BFF por role/experiencia
- SaaS multi-tenant
- dominio unico em `apps/api/src/modules/*`
- app do usuario final segregado por role/experiencia
- seguranca garantida no backend por tenant, role, capability e escopo do recurso

## Snapshot Consolidado Em 2026-03-20

Fluxos ja validados e registrados no journal:

- onboarding da academia
- modalidades
- professores
- turmas
- alunos
- presenca
- financeiro ate a Fase 6

Consolidacoes estruturais relevantes:

- o app do aluno passou a usar shell propria em `modules/app/ui/student-app-shell.tsx`
- as rotas genericas legadas de `/app/*` foram removidas; a superficie do app continua apenas em:
  - `/app/teacher/*`
  - `/app/student/*`
- a configuracao financeira da academia foi consolidada em:
  - `Dashboard > Settings > Pagamentos`
  - `routes.dashboardSettingsPayments`

Regras de produto ja refletidas no codigo e que o proximo agente deve assumir como baseline:

- o aluno pode contratar plano no app em `/app/student/plans`
- a primeira cobranca da contratacao e gerada no ato
- o proximo vencimento usa o `billingDay` derivado da data da contratacao
- a academia define:
  - quando a troca de plano acontece
  - como a cobranca atual e tratada
  - a politica de inadimplencia
- a inadimplencia pode:
  - bloquear novas turmas
  - remover das turmas atuais
  - pausar ou manter recorrencia
  - acumular ou nao novas dividas

Leitura operacional obrigatoria antes de continuar a proxima frente:

1. `validation-refactor-journal.md`
2. `api-specification.md`
3. `implementation-guidelines.md`

## Observacoes Importantes

- O projeto ja possui documentacoes antigas em `docs/architecture/*`, mas esta pasta (`doc-v2`) passa a ser a referencia consolidada para a arquitetura atual.
- Onde o codigo atual diverge do padrao alvo, os dois estados sao documentados explicitamente.
- Nenhum padrao novo foi inventado aqui. O foco e registrar o que esta implementado e alinhar o que ainda precisa evoluir.

## Mandatory Rules

- `doc-v2` MUST ser tratado como contrato tecnico oficial da fase atual do projeto.
- qualquer mudanca estrutural, de rota, de ownership de camada ou de fronteira de modulo MUST ser refletida em `doc-v2`.
- nenhum agente, pessoa ou automacao MUST usar `docs/architecture/*` como fonte primaria se houver divergencia com `doc-v2`.
- `doc-v2` MUST ser lido antes de iniciar refatoracao estrutural, criacao de nova feature transversal ou alteracao de API.
- `doc-v2` MUST NOT ser reinterpretado para justificar atalho arquitetural nao documentado.

## Examples (Correct vs Incorrect)

Correto:

- consultar `architecture-overview.md`, `project-structure.md` e `implementation-guidelines.md` antes de criar uma nova feature no app.
- tratar `refactor-backlog.md` e `refactor-roadmap.md` como sequencia de execucao oficial da rodada de alinhamento.

Incorreto:

- criar nova pasta estrutural fora do que esta em `project-structure.md` e ajustar a documentacao depois.
- implementar rota nova em `/app/*` generica por conveniencia e alegar que o comportamento sera corrigido em outra fase.

## Checklist

- confirmar se o arquivo/rota/modulo a ser alterado ja esta documentado em `doc-v2`;
- confirmar se a alteracao e compativel com `architecture-overview.md`;
- confirmar se a estrutura de pastas e compativel com `project-structure.md`;
- confirmar se naming, rotas e contracts seguem `implementation-guidelines.md`;
- atualizar `api-specification.md`, `refactor-backlog.md` ou `refactor-roadmap.md` quando a alteracao impactar execucao ou contratos.
