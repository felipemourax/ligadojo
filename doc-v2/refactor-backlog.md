# Refactor Backlog

## Objetivo

Transformar o plano tecnico de alinhamento em uma sequencia operacional por fase e por modulo, com foco em execucao limpa, baixo risco e preservacao da arquitetura definida.

## Premissas

- o dominio continua unico em `apps/api/src/modules/*`;
- o app continua separado por role/experiencia;
- codigo interno continua em ingles;
- UI continua em portugues;
- nenhuma fase pode mover regra de negocio para frontend ou BFF;
- nenhuma fase pode introduzir nova rota generica em `/app/*`.

## Snapshot De Execucao Em 2026-03-20

Fases/modulos ja fechados na rodada atual:

- onboarding da academia
- modalidades
- professores
- turmas
- alunos
- presenca
- financeiro ate a Fase 6
- shell do aluno e limpeza das rotas genericas do app

Proxima frente funcional:

- modulo `events`

Regra operacional da rodada:

- toda nova validacao deve comecar com dados limpos, usar API real, fechar com smoke de UI e registrar cleanup no journal.

## Ordem De Execucao Recomendada

1. fundacao transversal do app
2. `teacher` app
3. `student` app
4. `attendance`
5. `classes`
6. `teachers`
7. `students`
8. `graduations`
9. `events`
10. `finance`
11. consolidacao de seguranca e contratos

## Fase 0. Fundacao Transversal Do App

### Objetivo

Criar a base estrutural para que os proximos modulos nao continuem crescendo no padrao legado.

### Escopo

- introduzir `modules/app/features/*`;
- introduzir `modules/app/teacher/*`;
- introduzir `modules/app/student/*`;
- consolidar `modules/app/ui/*` como casa oficial de shells e layout variants;
- formalizar variantes `standard`, `focus`, `split`, `immersive`;
- congelar crescimento em `modules/app/components/*` para novas features.

### Entregaveis

- estrutura de pastas criada;
- shell do aluno criada em `modules/app/ui/*`;
- guideline de composicao por `screen/component/hook/mapper/state` aplicado ao menos em uma feature piloto;
- rotas genericas `/app/*` mantidas apenas como legado/redirecionamento.

### Dependencias

- nenhuma.

### Criterios De Aceite

- qualquer nova tela do app consegue nascer na estrutura alvo;
- `teacher` e `student` passam a ter estrategia de shell equivalente;
- nenhuma feature nova precisa voltar para `components/services` como padrao.

## Fase 1. Modulo `teacher` App

### Objetivo

Consolidar o app do professor na arquitetura alvo antes de expandir mais features.

### Escopo

- migrar composicoes atuais do professor para `modules/app/teacher/*` e `modules/app/features/*`;
- manter BFF atual em `app/api/app/teacher/*`;
- organizar home, agenda, attendance, classes, evolution, events e profile por feature;
- introduzir mappers/view models explicitos por tela.

### Entregaveis

- estrutura do professor aderente ao novo padrao;
- shell do professor preservada em `modules/app/ui/*`;
- removido acoplamento desnecessario entre pages e componentes brutos;
- composicao por feature documentada.

### Dependencias

- Fase 0.

### Criterios De Aceite

- todas as telas do professor usam a estrutura modular nova;
- `page.tsx` atua como entrada de rota, nao como concentrador de logica;
- nenhuma logica de negocio foi migrada para frontend.

## Fase 2. Modulo `student` App

### Objetivo

Alinhar a experiencia do aluno ao mesmo nivel estrutural do professor.

### Escopo

- criar shell do aluno em `modules/app/ui/*`;
- mover composicoes de `student` para `modules/app/student/*` e `modules/app/features/*`;
- organizar home, attendance, classes, progress, payments e profile;
- preparar extensibilidade para eventos do aluno, sem implementar endpoint se ainda nao for necessario.

### Entregaveis

- aluno usando shell e composicao equivalentes ao professor;
- features do aluno organizadas por modulo;
- mappers de contrato e hooks de tela separados.

### Dependencias

- Fase 0.

### Criterios De Aceite

- camada do aluno nao depende mais de shell compartilhada fora do padrao do app;
- telas do aluno seguem a mesma disciplina estrutural das telas do professor;
- nenhuma duplicacao de regra entre `teacher` e `student`.

## Fase 3. Modulo `attendance`

### Objetivo

Corrigir a fronteira mais desalinhada hoje entre classes e presenca.

### Escopo

- revisar o que hoje esta em `PUT /api/classes/sessions`;
- definir superficie administrativa propria de `attendance`;
- manter BFFs de `teacher` e `student` finos;
- centralizar contratos de input/output da presenca no backend.

### Entregaveis

- definicao oficial da fronteira `attendance`;
- API administrativa de presenca criada ou `classes/sessions` claramente reestruturado para nao misturar responsabilidades;
- contratos de sessao/presenca padronizados.

### Dependencias

- Fase 0.
- alinhamento com `classes`.

### Criterios De Aceite

- presenca deixa de ser uma fronteira implícita escondida sob `classes`;
- professor continua operando a chamada pelo BFF proprio;
- aluno continua consumindo apenas o historico proprio;
- regra de presenca continua exclusivamente no backend.

## Fase 4. Modulo `classes`

### Objetivo

Deixar o modulo de turmas como referencia de fronteira limpa entre turma, agenda e sessao.

### Escopo

- revisar `ClassGroupService`;
- extrair contratos de entrada/saida;
- explicitar melhor operacoes de create, update, remove e list;
- alinhar integracao com `attendance`.

### Entregaveis

- contratos de classes padronizados;
- handlers mais finos;
- limite claro entre `ClassGroup` e `ClassSession`.

### Dependencias

- Fase 3 parcial ou definicao conjunta de fronteira.

### Criterios De Aceite

- `classes` nao carrega responsabilidade ambigua de presenca;
- operacoes de turma ficam previsiveis;
- route handlers deixam de normalizar payload complexo em excesso.

## Fase 5. Modulo `teachers`

### Objetivo

Reduzir acoplamento HTTP + Prisma e formalizar contratos do modulo de professores.

### Escopo

- extrair contratos de create/update;
- reduzir normalizacao duplicada em handlers;
- encapsular mais claramente busca e persistencia;
- revisar relacao entre cadastro, membership e convite.

### Entregaveis

- `teachers/contracts/*` ou equivalente;
- handlers mais finos;
- fronteira clara entre cadastro de professor e vinculo de acesso.

### Dependencias

- Fase 0.

### Criterios De Aceite

- `app/api/teachers/*.ts` deixa de concentrar parsing extenso;
- regras de cadastro e vinculo permanecem no backend;
- nenhum fluxo cria inconsistencias entre `TeacherProfile`, `User` e `AcademyMembership`.

## Fase 6. Modulo `students`

### Objetivo

Aplicar o mesmo nivel de formalizacao de contratos e fronteiras no modulo de alunos.

### Escopo

- extrair contratos de create/update/status/graduation;
- revisar `StudentDashboardService`;
- separar melhor operacoes de perfil, status e historico academico;
- reforcar filtros por escopo do professor.

### Entregaveis

- contratos por operacao;
- services menos monoliticos;
- resource scope mais explicito.

### Dependencias

- Fase 0.
- alinhamento com `graduations`.

### Criterios De Aceite

- `students` deixa de depender de payload normalization espalhado em handlers;
- professor so acessa alunos do escopo permitido;
- aluno so acessa o proprio historico no app.

## Fase 7. Modulo `graduations`

### Objetivo

Consolidar fronteira de graduacoes, trilhas, elegibilidade e exames.

### Escopo

- revisar o `GraduationDashboardService`;
- explicitar contratos para trilhas, exames, candidatos e overrides;
- separar claramente configuracao de trilhas de operacao de exames;
- validar resource scope associado a aluno/modalidade.

### Entregaveis

- contratos do modulo;
- handlers administrativos mais previsiveis;
- integracao clara com `student` e `teacher/evolution`.

### Dependencias

- Fase 6.

### Criterios De Aceite

- elegibilidade continua 100% no backend;
- professor consome apenas payload pronto em `teacher/evolution`;
- aluno consome apenas o proprio progresso em `student/progress`.

## Fase 8. Modulo `events`

### Objetivo

Padronizar o modulo de eventos para o mesmo nivel de contratos e fronteiras.

### Escopo

- extrair contratos de create/update participant/update registrations state;
- revisar fronteira de participantes;
- consolidar `student/events` como experiencia real do app do aluno, sem vazar regra de negocio para a tela.

### Entregaveis

- contratos explicitos do modulo;
- handlers administrativos finos;
- `student/events` operando por BFF proprio, integrado ao financeiro quando houver taxa.

### Dependencias

- Fase 0.

### Criterios De Aceite

- participacao e inscricao ficam claramente modeladas;
- professor consome `teacher/events` sem logica de negocio local;
- aluno consome `student/events` com payload pronto, sem logica local de dominio.

## Fase 9. Modulo `finance`

### Objetivo

Formalizar contratos de cobranca e pagamento e reforcar o escopo do aluno no app.

### Escopo

- extrair contratos de create charge e register payment;
- revisar fronteira entre dashboard financeiro e visao do aluno;
- consolidar regras de leitura do aluno sobre suas cobrancas.

### Entregaveis

- contratos do modulo;
- handlers administrativos mais finos;
- integracao `student/payments` alinhada ao contrato oficial.

### Dependencias

- Fase 0.

### Criterios De Aceite

- status financeiro continua vindo do backend;
- aluno nao recebe dados fora do seu escopo;
- finance deixa de depender de contratos implícitos em handler.

## Fase 10. Consolidacao De Seguranca E Contratos

### Objetivo

Fechar a rodada de alinhamento garantindo que todos os modulos relevantes convergiram para o mesmo padrao.

### Escopo

- revisar resource scope modulo por modulo;
- revisar contracts/DTOs existentes;
- revisar handlers com parse excessivo;
- revisar consistencia de naming, rotas e estrutura de pastas;
- revisar se novas features ja estao nas estruturas alvo.

### Entregaveis

- checklist final de aderencia arquitetural;
- matriz modulo x maturidade;
- lista residual de `planned` e `needs-refactor`.

### Dependencias

- fases anteriores.

### Criterios De Aceite

- nenhum modulo relevante permanece sem regra clara de tenant/role/resource scope;
- nenhum modulo novo nasce fora do padrao definido;
- `doc-v2` permanece aderente ao codigo real apos a rodada.

## Backlog Resumido Por Modulo

| Modulo | Estado atual | Proxima acao |
| --- | --- | --- |
| `app/teacher` | parcialmente alinhado | migrar para estrutura `ui/features/teacher` |
| `app/student` | menos alinhado que `teacher` | criar shell propria e modularizar |
| `attendance` | fronteira difusa | separar de `classes` |
| `classes` | relativamente maduro | formalizar contratos e fronteira com sessoes |
| `teachers` | funcional, mas handler-heavy | extrair contracts e encapsular melhor persistencia |
| `students` | funcional, mas service-heavy | quebrar operacoes e extrair contracts |
| `graduations` | funcional, centrado em dashboard service | separar contratos de trilhas, exames e aptidao |
| `events` | funcional, contrato implicito | formalizar entradas e subrecursos |
| `finance` | funcional, contrato implicito | formalizar cobranca/pagamento |

## Regra De Priorizacao

Se houver disputa entre backlog tecnico e feature nova, usar esta ordem:

1. seguranca e escopo de acesso
2. fronteira de dominio incorreta
3. padronizacao estrutural do app
4. contratos e handlers
5. refinamentos internos de organizacao

## Mandatory Rules

- cada fase MUST ser executada sem contradizer as premissas deste documento.
- uma fase MUST NOT ser marcada como concluida se os criterios de aceite da propria fase nao estiverem atendidos.
- uma fase MUST NOT introduzir novo legado estrutural para “facilitar” a fase seguinte.
- a execucao MUST respeitar dependencias entre fases, salvo replanejamento documentado.

## Examples (Correct vs Incorrect)

Correto:

- concluir a Fase 0 antes de continuar expandindo `teacher` e `student` em estruturas legadas.
- promover `student/events` para `existing` apenas quando houver BFF proprio, integracao real e validacao com cleanup.

Incorreto:

- pular a Fase 3 e continuar expandindo presenca dentro de `classes`.
- considerar a Fase 5 concluida sem reduzir o parsing pesado em `app/api/teachers/*.ts`.

## Master Phase Checklist

### Fase 0. Fundacao Transversal Do App

- [ ] `modules/app/features/*` introduzido como direcao oficial
- [ ] `modules/app/teacher/*` introduzido
- [ ] `modules/app/student/*` introduzido
- [ ] `modules/app/ui/*` consolidado como casa de shell/layout
- [ ] shell do aluno criada na estrutura oficial
- [ ] layout variants formalizados
- [ ] novas features bloqueadas no legado `modules/app/components/*`

### Fase 1. Modulo `teacher`

- [ ] telas do professor reorganizadas na estrutura alvo
- [ ] home do professor alinhada
- [ ] agenda do professor alinhada
- [ ] attendance do professor alinhada
- [ ] classes do professor alinhadas
- [ ] evolution do professor alinhada
- [ ] events do professor alinhados
- [ ] profile do professor alinhado
- [ ] `page.tsx` reduzido a composicao de rota

### Fase 2. Modulo `student`

- [ ] shell do aluno adotada na estrutura oficial
- [ ] home do aluno alinhada
- [ ] attendance do aluno alinhada
- [ ] classes do aluno alinhadas
- [ ] progress do aluno alinhado
- [ ] payments do aluno alinhados
- [ ] profile do aluno alinhado
- [ ] composicao do aluno padronizada por feature

### Fase 3. Modulo `attendance`

- [ ] ownership de `attendance` formalizado
- [ ] dependencia ambigua com `classes/sessions` resolvida
- [ ] contratos de sessao/presenca padronizados
- [ ] BFF do professor preservado como camada fina
- [ ] BFF do aluno preservado como camada fina
- [ ] regra de presenca continua exclusivamente no backend

### Fase 4. Modulo `classes`

- [ ] `ClassGroupService` revisado
- [ ] contratos de classes extraidos
- [ ] create/update/remove/list explicitados
- [ ] fronteira entre turma e sessao estabilizada
- [ ] integracao com `attendance` alinhada
- [ ] handlers com menos normalizacao pesada

### Fase 5. Modulo `teachers`

- [ ] contracts de create/update formalizados
- [ ] parsing pesado reduzido em handlers
- [ ] persistencia melhor encapsulada
- [ ] fluxo `TeacherProfile` + `User` + `AcademyMembership` revisado
- [ ] cadastro e vinculo sem inconsistencias

### Fase 6. Modulo `students`

- [ ] contracts de create/update/status/graduation formalizados
- [ ] `StudentDashboardService` revisado
- [ ] operacoes de perfil/status/historico mais explicitas
- [ ] resource scope do professor reforcado
- [ ] consumo do proprio historico pelo aluno preservado

### Fase 7. Modulo `graduations`

- [ ] contracts de trilhas, exames, candidatos e overrides formalizados
- [ ] configuracao de trilhas separada de operacao de exames
- [ ] resource scope por aluno/modalidade validado
- [ ] `teacher/evolution` continua consumindo payload pronto
- [ ] `student/progress` continua consumindo apenas dados proprios

### Fase 8. Modulo `events`

- [ ] contracts do modulo formalizados
- [ ] fronteira de participantes revisada
- [ ] handlers administrativos reduzidos
- [ ] `student/events` mantido coerente com o contrato e com a UX real do app
- [ ] professor continua consumindo `teacher/events` sem logica local

### Fase 9. Modulo `finance`

- [ ] contracts de cobranca e pagamento formalizados
- [ ] fronteira dashboard x aluno revisada
- [ ] `student/payments` alinhado ao contrato oficial
- [ ] escopo do aluno reforcado
- [ ] status financeiro continua vindo do backend

### Fase 10. Consolidacao De Seguranca E Contratos

- [ ] auditoria de tenant, role, capability e resource scope concluida
- [ ] auditoria de contracts concluida
- [ ] auditoria de naming concluida
- [ ] auditoria de rotas concluida
- [ ] lista residual de `planned` e `needs-refactor` atualizada
- [ ] `doc-v2` continua aderente ao codigo real

## Checklist

- a fase em execucao tem premissas preservadas;
- as dependencias da fase foram atendidas;
- os entregaveis da fase foram produzidos;
- os criterios de aceite da fase foram verificados;
- o checklist mestre da fase foi marcado apenas com base em evidencia real.
