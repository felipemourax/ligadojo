# Refactor Roadmap

## Objetivo

Traduzir o backlog tecnico em uma visao executiva de entrega, com marcos claros, ondas de trabalho e sequencia recomendada para acompanhamento do projeto.

## Principios Do Roadmap

- corrigir primeiro o que evita crescimento desorganizado;
- priorizar fronteiras erradas antes de refinamentos internos;
- preservar operacao do produto enquanto a refatoracao avanca;
- atacar frontend e backend em ondas coerentes, nao em blocos aleatorios;
- fechar cada onda com criterio de aceite objetivo.

## Visao Geral

### Onda 1. Fundacao Estrutural

Foco:

- preparar a base do app para novas features no padrao certo;
- impedir crescimento no legado;
- igualar a infraestrutura de `teacher` e `student`.

Inclui:

- `modules/app/ui`
- `modules/app/features`
- `modules/app/teacher`
- `modules/app/student`
- layout variants
- shell do aluno

Resultado esperado:

- qualquer nova tela do app nasce na arquitetura alvo.

### Onda 2. Consolidacao Das Experiencias Do App

Foco:

- reorganizar `teacher` e `student` dentro da nova estrutura;
- reduzir acoplamento entre `page.tsx` e componentes brutos;
- padronizar composicao por feature.

Inclui:

- app do professor
- app do aluno

Resultado esperado:

- as duas experiencias ficam consistentes, modulares e prontas para evolucao.

### Onda 3. Correcao De Fronteiras De Dominio

Foco:

- resolver os pontos em que a fronteira do backend ainda esta imprecisa;
- comecar por `attendance` e `classes`.

Inclui:

- `attendance`
- `classes`

Resultado esperado:

- presenca e turmas deixam de compartilhar responsabilidade de forma ambigua.

### Onda 4. Formalizacao Dos Modulos Core

Foco:

- extrair contracts;
- reduzir handlers pesados;
- alinhar persistencia e services.

Inclui:

- `teachers`
- `students`
- `graduations`
- `events`
- `finance`

Resultado esperado:

- modulos administrativos passam a ter fronteiras mais previsiveis e contracts mais claros.

### Onda 5. Consolidacao Final

Foco:

- revisar seguranca;
- revisar escopo de recurso;
- revisar naming, rotas e aderencia ao padrao.

Inclui:

- auditoria final de contracts
- auditoria final de authz
- matriz de maturidade por modulo

Resultado esperado:

- arquitetura estabilizada e documentacao aderente ao codigo final.

## Sugestao De Sequencia Por Sprint

## Sprint 1

Meta:

- entregar a fundacao transversal do app.

Escopo:

- criar estrutura `ui/features/teacher/student`;
- criar shell do aluno;
- formalizar layout variants;
- congelar novas implementacoes no legado de `modules/app/components`.

Marco:

- base estrutural pronta.

## Sprint 2

Meta:

- migrar o app do professor para a estrutura alvo.

Escopo:

- reorganizar `teacher/home`, `agenda`, `attendance`, `classes`, `evolution`, `events`, `profile`;
- introduzir mappers e hooks por feature.

Marco:

- app do professor consolidado.

## Sprint 3

Meta:

- migrar o app do aluno para a estrutura alvo.

Escopo:

- reorganizar `student/home`, `attendance`, `classes`, `progress`, `payments`, `profile`;
- padronizar shell e composicao.

Marco:

- app do aluno consolidado.

## Sprint 4

Meta:

- corrigir a fronteira `attendance` e alinhar `classes`.

Escopo:

- redefinir API administrativa de presenca;
- reduzir ambiguidade de `classes/sessions`;
- formalizar contratos de sessao/presenca.

Marco:

- fronteira `attendance/classes` estabilizada.

## Sprint 5

Meta:

- formalizar `teachers` e `students`.

Escopo:

- extrair contracts;
- reduzir parsing de handlers;
- reforcar escopo de recurso.

Marco:

- modulos de cadastro core alinhados.

## Sprint 6

Meta:

- formalizar `graduations`, `events` e `finance`.

Escopo:

- contratos;
- ajustes de fronteira;
- alinhamento com app BFF.

Marco:

- modulos administrativos secundarios alinhados.

## Sprint 7

Meta:

- consolidacao final de seguranca e consistencia.

Escopo:

- auditoria transversal de tenant/role/capability/resource scope;
- auditoria de naming;
- auditoria de rotas;
- fechamento da matriz residual de `planned` e `needs-refactor`.

Marco:

- rodada de refatoracao encerrada com aderencia arquitetural.

## Dependencias Entre Ondas

| Onda | Depende de | Motivo |
| --- | --- | --- |
| Onda 2 | Onda 1 | sem estrutura-base, `teacher` e `student` so migrariam de forma parcial |
| Onda 3 | Onda 1 | a nova fundacao evita que a correcao de fronteira gere novo acoplamento no app |
| Onda 4 | Onda 3 parcial | `attendance/classes` precisa estar claro antes de consolidar modulos dependentes |
| Onda 5 | Ondas 1 a 4 | a consolidacao final depende da execucao real das fases anteriores |

## Marcos Executivos

| Marco | Resultado de negocio/engenharia |
| --- | --- |
| M1 | base do app pronta para crescer sem legado estrutural |
| M2 | experiencia do professor consolidada |
| M3 | experiencia do aluno consolidada |
| M4 | fronteira de presenca e turmas corrigida |
| M5 | modulos core administrativos formalizados |
| M6 | modulos complementares formalizados |
| M7 | consolidacao final de seguranca e arquitetura |

## Riscos Principais

| Risco | Impacto | Mitigacao |
| --- | --- | --- |
| migrar frontend sem fundacao pronta | retrabalho estrutural | executar Onda 1 antes das migracoes de feature |
| corrigir `attendance` tarde demais | continuar espalhando regra em `classes` | antecipar Onda 3 |
| refatorar handlers sem contracts definidos | apenas mover acoplamento de lugar | extrair contracts junto da refatoracao |
| confiar em guard visual | regressao de seguranca | manter revisao de resource scope no backend |

## Definicao De Pronto Por Onda

Uma onda so deve ser considerada concluida quando:

- o codigo novo ja esta no padrao alvo;
- nao foi criada nova excecao estrutural;
- a documentacao em `doc-v2` continua valida;
- os criterios de aceite do backlog correspondente foram atendidos.

## Mandatory Rules

- o roadmap MUST ser usado como ordem executiva de entrega, nao como lista solta de ideias.
- nenhuma onda MUST ser iniciada ignorando dependencias ja registradas.
- uma sprint MUST NOT ser dada como concluida se o marco correspondente nao estiver objetivamente atendido.
- o roadmap MUST permanecer coerente com `refactor-backlog.md`.

## Examples (Correct vs Incorrect)

Correto:

- usar Sprint 1 para consolidar base estrutural antes de migrar features do professor e do aluno.
- usar Sprint 4 para resolver `attendance/classes` antes de consolidar modulos dependentes.

Incorreto:

- executar Sprint 6 sem ter estabilizado a fronteira `attendance/classes`.
- fechar a Onda 2 mantendo `student` fora da estrutura modular alvo.

## Checklist

- a onda atual respeita dependencias anteriores;
- o marco definido para a sprint foi atingido;
- nenhum problema prioritario foi postergado em favor de crescimento no legado;
- backlog e roadmap continuam sincronizados;
- a documentacao oficial continua aderente ao estado real apos a entrega.
