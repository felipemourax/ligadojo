# Refactor Plan

## Objetivo

Registrar de forma objetiva o que precisa ser mantido, o que precisa mudar e qual a prioridade para alinhar o projeto inteiro ao padrao arquitetural definido.

## O Que Pode Ser Mantido

- dominio centralizado em `apps/api/src/modules/*`;
- BFF do app segregado por `teacher` e `student`;
- validacao de tenant, membership, role e capability no backend;
- contratos especificos do app em `apps/api/src/modules/app/domain/*`;
- rotas explicitas por role em `app/app/teacher/*` e `app/app/student/*`.

## Snapshot De Execucao Em 2026-03-20

Ja consolidados:

- onboarding
- modalidades
- professores
- turmas
- alunos
- presenca
- financeiro ate a Fase 6
- shell do aluno e rotas por role do app

Proxima frente funcional recomendada:

- `events`

Atencoes ainda abertas:

- reduzir legado em `modules/app/components/teacher/*`
- formalizar melhor `events`
- formalizar melhor `graduations`

## Frontend

| Problema encontrado | Impacto | Prioridade | Acao recomendada |
| --- | --- | --- | --- |
| `modules/app` ainda esta centrado em `components/services` | modularizacao inconsistente, dificulta crescimento por feature | Alta | migrar gradualmente para `modules/app/ui`, `modules/app/features`, `modules/app/teacher`, `modules/app/student` |
| professor possui shell propria, aluno nao | UX e manutencao assimetricas | Alta | criar shell padronizada do aluno em `modules/app/ui/*` |
| rotas genericas `/app/*` ainda coexistem com rotas por role | ambiguidade semantica e risco de novas implementacoes no padrao errado | Alta | manter apenas como legado/redirecionamento e impedir novas features nelas |
| features compartilhadas ainda nao possuem camada `base|teacher|student` | risco alto de duplicacao futura | Media | introduzir `modules/app/features/*` para `attendance`, `classes`, `agenda`, `progress`, `payments`, `events`, `profile` |
| mappers e estados de interface nao estao padronizados por feature | espalhamento de logica de apresentacao | Media | padronizar `screen`, `component`, `hook`, `mapper`, `state` por feature/role |

## Backend

| Problema encontrado | Impacto | Prioridade | Acao recomendada |
| --- | --- | --- | --- |
| alguns route handlers fazem parse/normalizacao extensa | excesso de responsabilidade na camada HTTP | Alta | mover contratos de entrada para o modulo correspondente e reduzir logica de handler |
| uso pontual de Prisma direto em handlers/modulos administrativos | acoplamento de transporte com persistencia | Alta | encapsular em repositories ou services com fronteira mais clara |
| `attendance` administrativo esta sob `classes/sessions` | fronteira de dominio imprecisa | Alta | introduzir superficie de `attendance` dedicada ou consolidar naming/contratos explicitamente |
| varios modulos ainda sao `service-centric` sem contracts/DTOs claros | baixa previsibilidade e reuso limitado | Media | padronizar `contracts` por modulo e explicitar inputs/outputs |
| maturidade estrutural desigual entre modulos | manutencao inconsistente | Media | usar `classes`, `tenancy` e `onboarding` como referencia de modularizacao mais clara |

## Seguranca

| Problema encontrado | Impacto | Prioridade | Acao recomendada |
| --- | --- | --- | --- |
| parte do resource scope ainda depende de implementacao por caso | risco de acesso indevido em evolucoes futuras | Alta | formalizar verificacoes de escopo por recurso em services/repositorios |
| risco de confiar demais na separacao visual entre professor e aluno | regressao de seguranca se algum endpoint crescer sem validacao | Alta | manter backend como unica autoridade de role/tenant/escopo |
| filtros de actor ainda nao estao padronizados para todos os modulos | inconsistencias entre listagens e mutacoes | Media | criar convencao comum de filtro por tenant + actor + resource scope |

## Contratos / API

| Problema encontrado | Impacto | Prioridade | Acao recomendada |
| --- | --- | --- | --- |
| contratos administrativos ainda estao implícitos em handlers | documentacao e manutencao mais dificeis | Alta | criar `contracts` ou `dto` por modulo |
| endpoints existentes nem sempre refletem a fronteira ideal do dominio | dificulta entendimento e onboarding tecnico | Alta | marcar como `needs-refactor` e corrigir gradualmente sem quebra ampla |
| ausencia de endpoint de eventos para aluno no app | lacuna de experiencia futura | Baixa | adicionar apenas se a experiencia do aluno demandar eventos no app |
| ausencia de superficie administrativa explicita para attendance | baixa clareza arquitetural | Alta | planejar API dedicada de attendance |

## Organizacao De Codigo

| Problema encontrado | Impacto | Prioridade | Acao recomendada |
| --- | --- | --- | --- |
| falta de padrao unico para nomear `contracts`, `mappers`, `state`, `screens` | codigo tende a se fragmentar | Media | definir convencoes obrigatorias em `implementation-guidelines.md` |
| modulos de teacher/student ainda vivem parcialmente em `components/*` | role logic espalhada | Media | migrar composicoes para `modules/app/teacher/*` e `modules/app/student/*` |
| docs antigas coexistem com novo padrao | risco de referencia divergente | Baixa | adotar `doc-v2` como referencia oficial da fase atual |

## Sequencia Recomendada De Refatoracao

1. consolidar o frontend do app em `ui/features/teacher/student`;
2. padronizar shells e layout variants;
3. mover contratos HTTP de `teachers`, `students`, `events`, `finance`, `graduations` para os modulos;
4. isolar melhor a fronteira de `attendance`;
5. reforcar resource scope no backend de forma transversal;
6. revisar modulo por modulo seguindo o mesmo checklist.

## Criterios De Aceitacao Para Cada Rodada

- nenhuma regra de negocio migrou para frontend ou BFF;
- nenhum modulo duplicou logica entre `teacher` e `student`;
- todo endpoint novo valida tenant, role/capability e resource scope;
- todo codigo novo segue naming interno em ingles;
- toda nova feature do app entra na estrutura modular alvo, nao no legado.

## Mandatory Rules

- este plano MUST ser interpretado como regra de alinhamento, nao como lista opcional de melhorias.
- problemas classificados como prioridade `Alta` MUST ser tratados antes de expandir o mesmo problema em codigo novo.
- nenhuma refatoracao MUST criar excecao estrutural fora do padrao para “ganhar velocidade”.
- uma rodada MUST NOT ser considerada concluida se violar qualquer criterio de aceitacao acima.

## Examples (Correct vs Incorrect)

Correto:

- adiar refinamento interno de organizacao para resolver primeiro uma fronteira de dominio errada.
- bloquear criacao de nova feature em rota generica porque o plano ja a classifica como legado.

Incorreto:

- adicionar nova tela em `modules/app/components/*` enquanto a migracao para `ui/features/teacher/student` esta em andamento.
- deixar `attendance` continuar crescendo sob `classes` por conveniencia.

## Checklist

- a acao proposta ataca um problema ja mapeado neste plano;
- a prioridade atribuida esta sendo respeitada;
- a mudanca reduz desalinhamento real, e nao apenas reorganiza arquivos;
- os criterios de aceite da rodada continuam validos;
- a execucao continua coerente com `refactor-backlog.md` e `refactor-roadmap.md`.
