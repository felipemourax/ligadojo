# Validation And Refactor Journal

## Objetivo

Registrar cada etapa de validacao real do produto com:

- escopo testado;
- atores envolvidos;
- resultados observados;
- inconsistencias encontradas;
- alteracoes aplicadas;
- revalidacao final.

## Regras Da Rodada

- validar primeiro por API/contrato quando fizer sentido;
- validar depois pela UI real;
- cruzar usuarios apenas quando a etapa exigir;
- nao usar fallback fake para concluir que algo funciona;
- qualquer mudanca estrutural deve preservar a arquitetura atual:
  - dominio em `apps/api/src/modules/*`;
  - `app/api/*` como transporte/BFF fino;
  - frontend sem regra de negocio;
  - organizacao modular coerente com `doc-v2`.

## Etapa 1. Onboarding

### Escopo

- criacao real de nova academia;
- acesso do owner ao dashboard;
- leitura do estado inicial do academy setup;
- validacao por API das 6 etapas oficiais:
  - `academy_info`
  - `location`
  - `class_structure`
  - `plans`
  - `branding`
  - `payments`
- conclusao do onboarding;
- smoke da UI do gate inicial e do dashboard apos conclusao.

### Atores

- platform/public;
- academy_admin.

### Resultado

- concluido.

### Cenarios Testados

- criacao de academia real via `POST /api/onboarding/academy`;
- login do owner no dashboard;
- `GET /api/onboarding/academy-setup` no estado inicial;
- `PATCH /api/onboarding/academy-setup` para todos os passos oficiais;
- `POST /api/onboarding/academy-setup` para concluir;
- nova academia separada apenas para validar o gate inicial na UI;
- smoke de UI do dashboard apos onboarding concluido.

### Inconsistencias

- a academia nova nao nasce com onboarding totalmente vazio:
  - o estado inicial ja vem com `academy_info`, `class_structure`, `branding` e `payments` preenchidos/validos;
  - o gate inicial apareceu como `4 de 6 etapas`;
  - os passos pendentes reais na largada foram `location` e `plans`.
- classificacao:
  - isso parece comportamento intencional do seed inicial do onboarding;
  - nao encontrei quebra de contrato nem erro tecnico nesse ponto;
  - a UI refletiu esse estado sem erro de console.

### Resultados Observados

- criacao de academia: `201`;
- login do owner: `200`;
- leitura inicial do setup: `200`;
- salvamento de `academy_info`: `200`;
- salvamento de `location`: `200`;
- salvamento de `class_structure`: `200`;
- salvamento de `plans`: `200`;
- salvamento de `branding`: `200`;
- salvamento de `payments`: `200`;
- conclusao do onboarding: `200`;
- leitura final do setup:
  - `status = completed`;
  - `blockingSteps = []`;
  - `completedSteps = 6/6`.

### Artefatos

- `/tmp/dojo-onboarding-stage1.json`
- `/tmp/dojo-onboarding-stage1-results.json`
- `/tmp/dojo-onboarding-ui-smoke.json`
- `/tmp/dojo-onboarding-gate-scenario.json`
- `/tmp/dojo-onboarding-gate-ui.json`

### Alteracoes

- nenhuma no codigo.

### Revalidacao Final

- API: onboarding completo do zero funcionando;
- UI:
  - owner novo entrou no dashboard e viu o gate inicial;
  - owner com onboarding concluido entrou direto no dashboard sem gate residual;
  - sem erros de console observados nesses smokes.

## Etapa 2. Professores

### Escopo

- cadastro de professor pelo admin da academia;
- convite de professor;
- aceite do convite pelo professor com criacao da primeira senha;
- autocadastro de professor no host da academia;
- estado pendente antes da aprovacao;
- aprovacao do professor pelo admin;
- login do professor no tenant;
- acesso ao app do professor;
- coerencia entre `User`, `AcademyMembership`, `EnrollmentRequest` e `TeacherProfile`.

### Atores

- academy_admin;
- teacher.

### Resultado

- concluido.

### Cenarios Testados

- admin criando professor por convite em `POST /api/teachers`;
- leitura do dashboard de professores apos convite em `GET /api/teachers/records`;
- professor aceitando convite em `POST /api/invitations/accept`;
- professor convidado fazendo login no tenant e lendo `/api/app/teacher/home`;
- professor se autocadastrando no host da academia em `POST /api/tenants/[tenantSlug]/enrollment-requests`;
- leitura de `/api/me/tenant-access` antes da aprovacao;
- admin aprovando o pedido em `PATCH /api/enrollment-requests/[requestId]`;
- professor aprovado fazendo login no tenant e acessando o app;
- smoke de UI do dashboard `Professores`;
- smoke de UI do app do professor apos aceite do convite.

### Inconsistencias

- bug real encontrado no fluxo de convite:
  - o admin criava o professor por convite;
  - o backend ja criava o `User` pelo e-mail;
  - ao aceitar o convite, a rota tratava esse `User` como se ele ja tivesse conta utilizavel;
  - por isso exigia autenticar uma senha que ainda nao existia;
  - o resultado era `401 "Senha inválida para a conta convidada."`.
- classificacao:
  - bug tecnico real de backend;
  - nao era regra de negocio;
  - a regra correta e: se o usuario existir sem credencial, o convite deve permitir definir a primeira senha.

### Resultados Observados

- convite criado pelo admin: `201`;
- dashboard do admin refletiu professor convidado com `accessStatus = invited`;
- aceite do convite antes do patch: `401`;
- autocadastro de professor: `201`;
- acesso antes da aprovacao:
  - membership `pending`;
  - `accessState = pending`;
- aprovacao pelo admin: `200`;
- login do professor aprovado no tenant: `200`;
- leitura de `/api/app/teacher/home` para professor aprovado: `200`;
- revalidacao do convite depois do patch:
  - aceite do convite: `200`;
  - login no tenant: `200`;
  - app do professor: `200`.

### Artefatos

- `/tmp/dojo-teachers-stage-results.json`
- `/tmp/dojo-teacher-invite-revalidation.json`
- `/tmp/dojo-teachers-ui-smoke.json`
- `/tmp/dojo-teacher-login-ui-debug.json`

### Alteracoes

- correcao aplicada em [route.ts](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/invitations/accept/route.ts):
  - agora a rota so exige autenticacao se o usuario existente ja tiver credencial;
  - se o usuario existir sem senha, o aceite do convite pode criar a primeira senha e concluir o acesso.

### Revalidacao Final

- API:
  - `admin -> convite -> aceite -> login -> app teacher`: funcionando;
  - `teacher -> autocadastro -> admin aprova -> login -> app teacher`: funcionando.
- UI:
  - dashboard `Professores` refletiu corretamente os estados `Convite enviado` e `Ativo`;
  - professor convidado entrou no tenant e caiu em `/app/teacher`;
  - sem erros de console na revalidacao final do app do professor.

## Etapa 3. Turmas

### Escopo

- criacao de turma pelo admin;
- validacao de professor elegivel para assumir turma;
- bloqueio de professor pendente;
- leitura da turma no dashboard admin;
- edicao de turma;
- reflexo da turma no app do professor;
- coerencia entre `classes`, `teachers` e `app/teacher/classes`.

### Atores

- academy_admin;
- teacher.

### Resultado

- concluido.

### Cenarios Testados

- leitura de modalidades ativas em `GET /api/modalities`;
- leitura de professores em `GET /api/teachers/records`;
- autocadastro de novo professor pendente no host da academia em `POST /api/tenants/[tenantSlug]/enrollment-requests`;
- tentativa de criar turma com professor pendente em `POST /api/classes`;
- criacao de turma com professor ativo em `POST /api/classes`;
- leitura das turmas no dashboard em `GET /api/classes`;
- edicao da turma em `PATCH /api/classes/[classId]`;
- login do professor no tenant;
- leitura do app do professor em `GET /api/app/teacher/classes`;
- smoke de UI do dashboard `Turmas`;
- smoke de UI da tela `/app/teacher/classes`.

### Inconsistencias

- inconsistencia real de contrato encontrada no bloqueio de professor pendente:
  - a regra de negocio estava certa, porque o sistema bloqueava o professor pendente;
  - mas a mensagem devolvida era generica: `Selecione um professor ativo para a turma.`;
  - em linguagem simples, o admin via um bloqueio correto com o motivo errado.
- classificacao:
  - bug tecnico pequeno de contrato/backend;
  - nao alterava a regra de negocio;
  - a correcao segura era apenas preservar a distincao entre:
    - professor inexistente/invalido;
    - professor existente, mas ainda nao liberado para assumir turma.
- observacao de UX para proxima rodada:
  - a tela do professor ainda usa o texto `Gerencie suas turmas e alunos`;
  - isso sugere um grau de controle maior do que o contrato desta etapa realmente entrega;
  - nao corrigi agora porque nao era quebra funcional e quero cruzar isso melhor com a etapa de alunos/presenca.

### Resultados Observados

- autocadastro de professor pendente para teste negativo: `201`;
- tentativa de criar turma com professor pendente: `400`;
- mensagem antes do patch:
  - `Selecione um professor ativo para a turma.`
- mensagem depois do patch:
  - `Esse professor ainda nao esta liberado para assumir turmas.`
- criacao de turma com professor ativo: `200`;
- leitura do dashboard `Turmas`: `200`;
- edicao da turma: `200`;
- login do professor no tenant: `200`;
- leitura de `/api/app/teacher/classes`: `200`;
- o app do professor refletiu:
  - nome atualizado da turma;
  - modalidade correta;
  - dias corretos apos a edicao.
- arquivamento da turma: `200`;
- depois do arquivamento, a turma deixou de aparecer em `/api/app/teacher/classes`;
- smoke de UI final:
  - dashboard `Turmas` exibiu a turma ativa, professor e horario corretos;
  - a turma arquivada nao apareceu na lista ativa do admin;
  - `/app/teacher/classes` exibiu a turma ativa e nao exibiu a turma arquivada;
  - sem erros de console nas telas revalidadas.

### Artefatos

- `/tmp/dojo-classes-stage-results.json`
- `/tmp/dojo-classes-stage-results-v2.json`
- `/tmp/dojo-classes-ui-smoke-final.json`

### Alteracoes

- ajuste pequeno em [class-group.repository.ts](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/classes/repositories/class-group.repository.ts):
  - a busca de professor para criacao/edicao de turma deixou de filtrar apenas `TeacherProfile` ativo antes da validacao de negocio.
- ajuste pequeno em [class-group.service.ts](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/classes/services/class-group.service.ts):
  - agora o service distingue corretamente:
    - professor inexistente/invalido;
    - professor convidado ou pendente;
    - professor realmente ativo.

### Revalidacao Final

- API:
  - `admin -> cria turma com professor ativo -> edita -> teacher le`: funcionando;
  - `admin -> tenta criar turma com professor pendente`: bloqueado corretamente com mensagem coerente;
  - `admin -> arquiva turma -> teacher deixa de ve-la`: funcionando.
- UI:
  - dashboard `Turmas` exibiu a turma ativa e o professor corretos;
  - `/app/teacher/classes` exibiu a turma atualizada e a modalidade correta;
  - a turma arquivada nao apareceu no app do professor;
  - sem erros de console na revalidacao final das telas.

## Etapa 4. Alunos

### Escopo

- cadastro de aluno pelo admin da academia;
- conclusao de acesso de aluno pre-cadastrado pelo admin;
- autocadastro puro de aluno no host da academia;
- coerencia entre `User`, `AcademyMembership`, `StudentProfile`, `StudentModality` e `Subscription`;
- leitura do dashboard `Alunos`;
- leitura do app do aluno em `home` e `classes`;
- entrada e saida de turma pelo proprio aluno no app.

### Atores

- academy_admin;
- student.

### Resultado

- concluido.

### Cenarios Testados

- leitura de modalidades, planos e turmas ativas por API para montar o cenario;
- cadastro do aluno pelo admin em `POST /api/students`;
- leitura do dashboard em `GET /api/students` apos o cadastro;
- conclusao de acesso do aluno pre-cadastrado em `POST /api/tenants/[tenantSlug]/enrollment-requests`;
- leitura do app do aluno pre-cadastrado em `GET /api/app/student/home`;
- leitura de turmas disponiveis em `GET /api/app/student/classes`;
- entrada do aluno em turma via `POST /api/app/student/classes/[classId]`;
- reflexo da turma no `home` do aluno;
- saida do aluno da turma via `DELETE /api/app/student/classes/[classId]`;
- autocadastro puro de aluno no host da academia;
- leitura do app do aluno apos autocadastro puro;
- revalidacao do dashboard `Alunos` apos os dois fluxos;
- smoke de UI do dashboard `Alunos`;
- smoke de UI do app do aluno em `home` e `classes`.

### Inconsistencias

- nao encontrei bug funcional novo nos fluxos validados desta etapa.
- observei uma inconsistencia pequena de contrato/dados:
  - o dashboard do admin trabalha com um campo unico `address`;
  - o autocadastro do aluno trabalha com endereco estruturado (`street`, `city`, `state`, `zipCode`);
  - depois que o aluno completa o acesso, a apresentacao do endereco no dashboard passa a refletir a forma estruturada.
- classificacao:
  - nao e quebra funcional;
  - nao corrigi nesta etapa porque isso pede uma decisao mais ampla de contrato do modulo `students`, nao um remendo local.

### Resultados Observados

- cadastro do aluno pelo admin: `201`;
- dashboard `Alunos` refletiu o aluno criado com:
  - `status = active`;
  - `planName = Plano Mensal`;
  - modalidade ativa correta.
- aluno pre-cadastrado pelo admin completou o acesso em `201` com:
  - `accessStatus = active`;
  - `setupAction = activated_existing_access`.
- app do aluno pre-cadastrado:
  - `home` retornou `200`;
  - exibiu `Plano Mensal`, `1` modalidade e `0%` de frequencia;
  - antes de entrar em turma, `classes = []` no `home`.
- tela `classes` do aluno pre-cadastrado:
  - retornou `200`;
  - listou as turmas disponiveis da modalidade com `joined = false`.
- entrada do aluno em turma: `200`;
- depois da entrada:
  - a turma passou a aparecer no `home`;
  - `currentStudents` subiu corretamente na resposta;
  - `joined = true` na turma escolhida.
- saida do aluno da turma: `200`;
- depois da saida:
  - `joined = false`;
  - `currentStudents` voltou ao valor anterior;
  - o `home` voltou a ficar sem turmas vinculadas.
- autocadastro puro de aluno: `201`;
- aluno de autocadastro puro entrou ativo e leu o `home` com `200`;
- dashboard `Alunos` passou a refletir tambem o aluno de autocadastro puro;
- smoke de UI final:
  - dashboard `Alunos` exibiu os alunos criados e seus estados corretos;
  - `home` do aluno pre-cadastrado exibiu plano e estado vazio coerente para turmas;
  - `classes` do aluno exibiu turmas disponiveis com CTA `Participar`;
  - sem erros de console nas telas revalidadas.

### Artefatos

- `/tmp/dojo-students-stage-results.json`
- `/tmp/dojo-students-ui-smoke-final.json`

### Alteracoes

- nenhuma no codigo.

### Revalidacao Final

- API:
  - `admin -> cria aluno -> aluno completa acesso -> app student`: funcionando;
  - `student -> autocadastro puro -> app student`: funcionando;
  - `student -> entra/sai de turma -> reflexo no home/classes`: funcionando.
- UI:
  - dashboard `Alunos` refletiu plano, status e modalidade coerentes;
  - app do aluno refletiu corretamente a diferenca entre:
    - `home` com turmas efetivamente vinculadas;
    - `classes` com turmas disponiveis para entrar;
  - sem erros de console na revalidacao final das telas.

## Etapa 5. Presenca

### Escopo

- validacao do fluxo `admin -> teacher -> student` em presenca;
- criacao de turma dedicada para o cenario;
- criacao e vinculo de alunos reais na turma;
- chamada com estados `present`, `absent` e `justified`;
- reabertura e refinalizacao de chamada;
- bloqueio de professor fora da propria turma;
- coerencia de frequencia e historico no app do aluno;
- coerencia operacional entre dashboard admin e app do professor;
- validacao de aluno inativo no meio do fluxo.

### Atores

- academy_admin;
- teacher;
- student.

### Resultado

- concluido.

### Cenarios Testados

- criacao de turma de presenca por `POST /api/classes`;
- cadastro de tres alunos reais por `POST /api/students`;
- ativacao dos tres acessos no host da academia em `POST /api/tenants/[tenantSlug]/enrollment-requests`;
- vinculo dos tres alunos na turma em `PUT /api/classes/[classId]/students`;
- leitura da chamada do professor em `GET /api/app/teacher/attendance`;
- salvamento da chamada com `present`, `absent` e `justified` em `PUT /api/app/teacher/attendance`;
- reabertura da chamada e refinalizacao pelo professor;
- tentativa de outro professor registrar presenca na turma;
- leitura do dashboard admin em `GET /api/classes`;
- leitura do `home` e do historico de presenca dos tres alunos;
- revalidacao do contrato admin de presenca com payload correto, incluindo `status`;
- inativacao de um aluno durante a etapa em `PATCH /api/students/[studentId]/status`;
- revalidacao de admin e teacher apos a inativacao;
- smoke de UI do dashboard `Presenca`;
- smoke de UI do app do professor em `/app/teacher/attendance`;
- smoke de UI do app do aluno em `/app/student/attendance`.

### Inconsistencias

- diferenca de contrato encontrada entre admin e professor:
  - o `admin` salva em `/api/classes/sessions` e precisa enviar `status`;
  - o fluxo do `professor` usa outro transporte e eu inicialmente testei o admin com o payload errado;
  - o `400 "Status da aula invalido."` inicial veio dessa diferenca de contrato, nao de bug do produto.
- bug real de coerencia encontrado no backend:
  - ao inativar um aluno, o perfil dele ficava inativo;
  - mas a matricula ativa da turma continuava sendo tratada como elegivel para a chamada;
  - o professor ainda via esse aluno na presenca, com nome degradado para `Aluno`;
  - `currentStudents` e `studentCount` continuavam contando esse aluno como ativo.
- bug real de coerencia encontrado no frontend admin:
  - a tela `Presenca` montava a lista operacional do dia usando o snapshot `confirmedStudentIds` da sessao;
  - depois da inativacao, o backend ja nao aceitava mais esse aluno na operacao;
  - mas a UI admin ainda reaproveitava o snapshot antigo e podia tentar reabrir/salvar a chamada com aluno inelegivel.
- classificacao:
  - os dois ultimos pontos eram bugs tecnicos reais;
  - nao exigiam mudanca de regra de negocio;
  - a regra preservada foi:
    - aluno inativo nao participa da operacao atual da turma;
    - historico ja registrado continua existindo;
    - `justified` continua neutro na frequencia.

### Resultados Observados

- professor principal salvou a chamada com `present`, `absent` e `justified`: `200`;
- reabertura da chamada pelo professor: `200`;
- refinalizacao da chamada pelo professor: `200`;
- outro professor tentando registrar na turma: `400` com
  - `Voce so pode registrar presenca nas suas proprias turmas.`
- reflexo no app do aluno antes da correcao:
  - aluno `present`: `100%`, `totalClasses = 1`;
  - aluno `absent`: `0%`, `totalClasses = 1`;
  - aluno `justified`: `0%`, `totalClasses = 0`.
- revalidacao do admin com o payload correto, incluindo `status`: `200`;
- depois de inativar o aluno `absent`, antes do patch:
  - o professor ainda via o aluno na chamada;
  - o nome aparecia degradado para `Aluno`;
  - a turma ainda aparecia com `studentCount = 3`.
- depois do patch de backend:
  - dashboard admin passou a refletir `currentStudents = 2`;
  - app do professor passou a refletir `studentCount = 2`;
  - o aluno inativo deixou de aparecer na chamada;
  - tentativa de salvar presenca incluindo o aluno inativo passou a falhar com `400` e a mensagem correta:
    - `So e possivel registrar presenca de alunos vinculados a turma.`
- depois do patch da tela admin:
  - o admin passou a operar a chamada com os dois alunos realmente ativos da turma;
  - a atualizacao administrativa da sessao com os dois alunos ativos voltou a responder `200`.
- smoke final de UI:
  - admin exibiu a turma de presenca e a contagem ajustada;
  - professor exibiu `Aluno Justified` e ocultou o aluno inativo;
  - aluno justificiado exibiu `Falta justificada`;
  - sem erros de console, page errors ou respostas `4xx/5xx` inesperadas nas telas validadas.

### Artefatos

- `/tmp/dojo-attendance-stage-results.json`
- `/tmp/dojo-attendance-open-points.json`
- `/tmp/dojo-attendance-postfix-results.json`
- `/tmp/dojo-attendance-ui-smoke-final.json`

### Alteracoes

- correcao aplicada em `apps/api/src/modules/classes/repositories/class-group.repository.ts`:
  - matriculas so contam como ativas para operacao da turma quando o `StudentProfile` tambem esta `ACTIVE`;
  - a validacao de elegibilidade da presenca passou a ignorar perfis inativos.
- correcao aplicada em `apps/api/src/modules/classes/domain/class-group-mappers.ts`:
  - `enrolledStudentIds` e `currentStudents` passaram a refletir apenas alunos com matricula ativa e perfil ativo.
- correcao aplicada em `modules/attendance/components/attendance-dashboard-screen.tsx`:
  - a tela admin deixou de montar a lista operacional da chamada a partir do snapshot antigo da sessao;
  - agora ela usa os alunos ativos atuais da turma para operar a presenca do dia.

### Revalidacao Final

- API:
  - `admin -> teacher -> student` em presenca funcionando;
  - `present`, `absent` e `justified` coerentes entre dashboard, app do professor e app do aluno;
  - reabrir/refinalizar funcionando;
  - professor fora da propria turma bloqueado;
  - aluno inativo nao participa mais da operacao atual da turma.
- UI:
  - dashboard `Presenca`, app do professor e app do aluno coerentes entre si;
  - sem erros de console na revalidacao final;
  - nenhum request inesperado com falha nas telas inspecionadas.

## Fase Finance 1. Fundacao Do Dominio

### Escopo

- refatoracao estrutural inicial do modulo `finance`;
- extracao de contratos de entrada para:
  - criar cobranca;
  - registrar pagamento;
- extracao da persistencia Prisma para repositório do modulo;
- extracao de helpers de dominio financeiro para arquivo proprio;
- limpeza de tipo legado/orfao no frontend do modulo;
- revalidacao do contrato externo das rotas sem alterar regra de negocio.

### Resultado

- concluido.

### Alteracoes

- criados contratos em:
  - `apps/api/src/modules/finance/contracts/create-finance-charge.input.ts`
  - `apps/api/src/modules/finance/contracts/create-finance-charge.parser.ts`
  - `apps/api/src/modules/finance/contracts/register-finance-payment.input.ts`
  - `apps/api/src/modules/finance/contracts/register-finance-payment.parser.ts`
- criadas extracoes de dominio em:
  - `apps/api/src/modules/finance/domain/finance-charge.ts`
- criado repositório Prisma em:
  - `apps/api/src/modules/finance/repositories/finance.repository.ts`
- `finance-dashboard.service.ts` ficou reduzido para orquestracao e regra de modulo;
- handlers administrativos ficaram mais finos em:
  - `app/api/finance/route.ts`
  - `app/api/finance/[chargeId]/payment/route.ts`
- removido tipo legado sem uso real em:
  - `modules/finance/types.ts`
- barrel do modulo `finance` atualizado para deixar de exportar o tipo legado.

### Inconsistencias Encontradas

- o modulo `finance` estava concentrado demais em um unico service:
  - persistencia Prisma;
  - parse de payload;
  - regra de dominio;
  - composicao de dashboard.
- `modules/finance/types.ts` descrevia um modelo mais amplo (`invoice`, `expense`, `refunded`) que nao era usado pelo produto real nesta base.
- classificacao:
  - problemas de arquitetura/limpeza;
  - nao eram bugs funcionais diretos do produto;
  - a correcao segura era estrutural, preservando o contrato existente.

### Revalidacao Final

- `./node_modules/.bin/tsc --noEmit`: passou;
- smoke real por API:
  - `GET /api/finance`: `200`;
  - `POST /api/finance` com payload invalido: `400` com mensagem correta;
  - `PATCH /api/finance/[chargeId]/payment` com metodo invalido: `400` com mensagem correta;
  - `GET /api/app/student/payments`: `200`.

### Artefatos

- `/tmp/dojo-finance-phase1-smoke.json`

## Fase Finance 2. Estado Financeiro Canonico

### Escopo

- fazer o estado financeiro do aluno nascer do modulo `finance`;
- parar de depender do `SubscriptionStatus` como fonte principal para `paymentStatus`;
- refletir a mesma leitura financeira no dashboard `Alunos`, no `app/student/payments` e no `app/student/home`;
- reduzir acoplamento do `app/student/payments` com o dashboard completo de alunos.

### Resultado

- concluido.

### Alteracoes

- criado o contrato de leitura canonica do aluno em:
  - `apps/api/src/modules/finance/domain/finance-student-state.ts`
- criado o service de leitura financeira por usuario em:
  - `apps/api/src/modules/finance/services/finance-student-state.service.ts`
- expandido o repositório do modulo `finance` para leitura de assinaturas e cobrancas por usuario em:
  - `apps/api/src/modules/finance/repositories/finance.repository.ts`
- `students` passou a consumir o estado financeiro do modulo `finance` em:
  - `apps/api/src/modules/students/services/student-dashboard.service.ts`
- `app/student/payments` deixou de depender do dashboard inteiro de alunos para descobrir o `studentId` em:
  - `apps/api/src/modules/app/services/student-app-payments.service.ts`

### Inconsistencias Encontradas

- bug real de coerencia encontrado:
  - alguns alunos com mensalidade vencida apareciam como `paid` no cadastro;
  - isso acontecia porque o status financeiro vinha mais do vinculo do plano/assinatura do que das cobrancas reais.
- em termos simples:
  - a academia via uma cobranca vencida no financeiro;
  - mas o modulo `Alunos` ainda podia parecer que aquele aluno estava em dia.
- classificacao:
  - bug tecnico real de fonte de verdade;
  - nao era so problema visual;
  - o risco era admin e aluno enxergarem estados financeiros diferentes.

### Revalidacao Final

- `./node_modules/.bin/tsc --noEmit`: passou;
- `GET /api/students` no admin:
  - alunos com cobranca vencida passaram a retornar `paymentStatus = overdue`;
  - aluno sem plano permaneceu `pending`;
- `GET /api/finance` no admin:
  - continuou listando as mesmas cobrancas vencidas usadas como fonte de verdade;
- `GET /api/app/student/payments` no tenant:
  - refletiu `planName = Plano Mensal`;
  - `paymentStatus = overdue`;
  - `nextPayment = 2026-03-05`;
  - `amountLabel = R$ 189,90`;
- `GET /api/app/student/home` no tenant:
  - refletiu o mesmo `paymentStatus = overdue`;
  - o card `Plano` passou a orientar `Verifique seus pagamentos`.

### Artefatos

- `/tmp/dojo_finance_phase2_admin_login.json`
- `/tmp/dojo_finance_phase2_students.json`
- `/tmp/dojo_finance_phase2_finance.json`
- `/tmp/dojo_finance_phase2_student_login.json`
- `/tmp/dojo_finance_phase2_student_payments.json`
- `/tmp/dojo_finance_phase2_student_home.json`

## Fase Finance 3. Admin Financeiro Operacional

### Escopo

- endurecer o fluxo administrativo de criacao de cobranca manual;
- endurecer o fluxo administrativo de registro de pagamento;
- validar cobranca manual, cobranca invalida, pagamento e pagamento duplicado;
- limpar a tela do financeiro para remover relatorios/exportacoes que nao existem no produto real;
- ajustar a experiencia do admin para que cobrancas futuras aparecam imediatamente apos criacao.

### Resultado

- concluido.

### Alteracoes

- endurecimento do parser de criacao de cobranca em:
  - `apps/api/src/modules/finance/contracts/create-finance-charge.parser.ts`
  - validacao de valor maior que zero;
  - validacao de formato de vencimento.
- repositório `finance` expandido em:
  - `apps/api/src/modules/finance/repositories/finance.repository.ts`
  - leitura de aluno ativo por `userId`;
  - validacao de plano por tenant;
  - leitura do status atual da cobranca.
- service administrativo endurecido em:
  - `apps/api/src/modules/finance/services/finance-dashboard.service.ts`
  - a cobranca manual passou a nascer de um aluno ativo real do tenant;
  - `studentProfileId` divergente passou a ser bloqueado;
  - plano externo ao tenant passou a ser bloqueado;
  - pagamento duplicado ou sobre cobranca cancelada passou a ser bloqueado.
- tela admin limpa em:
  - `modules/finance/components/finance-dashboard-screen.tsx`
  - remocao da aba `Relatorios`;
  - remocao do botao `Exportar` sem funcionalidade;
  - filtro padrao de periodo ajustado para `Todo periodo`, evitando sumir com cobranca futura recem-criada.
- contrato do dashboard limpo em:
  - `apps/api/src/modules/finance/domain/finance-dashboard.ts`
  - remocao do campo `growth`, que nao era sustentado pelo produto real.

### Inconsistencias Encontradas

- bug tecnico real de integridade:
  - a API de criacao de cobranca confiava demais em `userId` e `studentProfileId` vindos do frontend;
  - isso abria espaco para vinculo incoerente entre usuario e perfil do aluno.
- bug tecnico real de operacao:
  - a API aceitava nova marcacao de pagamento em cobranca ja paga.
- incoerencia de produto na UI:
  - a tela mostrava `Relatorios` e indicadores inventados, como taxa de renovacao fixa;
  - isso parecia feature pronta sem existir backend real.
- incoerencia de usabilidade:
  - a cobranca futura criada pelo admin podia nao aparecer logo depois, porque o filtro inicial da tela so mostrava vencimentos passados.

### Revalidacao Final

- `./node_modules/.bin/tsc --noEmit`: passou;
- API admin:
  - cobranca com `userId` e `studentProfileId` desencontrados: `400`;
  - cobranca para aluno suspenso: `400`;
  - cobranca com valor `0`: `400`;
  - cobranca manual valida: `200`;
  - registro de pagamento da cobranca criada: `200`;
  - segunda tentativa de pagar a mesma cobranca: `400`.
- comportamento observado:
  - a cobranca valida `Ajuste manual fase 3` foi criada para o aluno correto;
  - depois do pagamento, passou a `paid` com metodo `PIX` e data do dia;
  - o dashboard continuou mostrando as mensalidades vencidas sem regressao.
- UI admin:
  - `dashboard/finance` abriu sem erro de console;
  - a cobranca `Ajuste manual fase 3` apareceu na lista;
  - o status `Pago` apareceu corretamente;
  - `Relatorios` e `Exportar` deixaram de aparecer.

### Artefatos

- `/tmp/dojo_finance_phase3_invalid_mismatch.json`
- `/tmp/dojo_finance_phase3_suspended_student.json`
- `/tmp/dojo_finance_phase3_zero_amount.json`
- `/tmp/dojo_finance_phase3_create_charge.json`
- `/tmp/dojo_finance_phase3_payment_ok.json`
- `/tmp/dojo_finance_phase3_payment_duplicate.json`
- `/tmp/dojo-finance-phase3-results.json`
- `/tmp/dojo-finance-phase3-ui-smoke.json`

## Fase Finance 4. Descontos E Cupons

### Escopo

- introduzir base real de desconto no dominio `finance`;
- permitir desconto manual do admin em cobranca aberta;
- permitir criacao de cupom pelo admin;
- permitir aplicacao de cupom pelo aluno em cobranca elegivel;
- preparar a base de politica financeira da academia para as proximas fases:
  - regra de recorrencia durante inadimplencia;
  - acumulacao de divida;
  - dias de tolerancia;
  - bloqueio de novas turmas;
  - retirada das turmas atuais;
  - politica de troca de plano.

### Regra Consolidada

- desconto em divida aberta:
  - manual, aplicado pelo admin;
  - sem cupom;
  - com valor e motivo registrados.
- cupom:
  - criado pelo admin;
  - aplicado pelo aluno na propria area financeira;
  - usado para mensalidade ou outra cobranca elegivel.
- desconto nao acumula.
- a forma como a recorrencia se comporta durante inadimplencia ficara configuravel pela academia nas proximas fases.

### Resultado

- concluido.

### Alteracoes

- base de modelo expandida em:
  - `prisma/schema.prisma`
  - `prisma/migrations/20260319050025_finance_discounts_coupons_and_policy/migration.sql`
  - novos campos de politica em `TenantPaymentSettings`;
  - novos campos de desconto em `FinanceCharge`;
  - criacao de `FinanceCoupon`;
  - novos enums de desconto, recorrencia e transicao de plano.
- dominio e contratos do modulo `finance` expandidos em:
  - `apps/api/src/modules/finance/domain/finance-coupon.ts`
  - `apps/api/src/modules/finance/domain/finance-student-payments.ts`
  - `apps/api/src/modules/finance/contracts/create-finance-coupon.input.ts`
  - `apps/api/src/modules/finance/contracts/create-finance-coupon.parser.ts`
  - `apps/api/src/modules/finance/contracts/apply-finance-coupon.input.ts`
  - `apps/api/src/modules/finance/contracts/apply-finance-coupon.parser.ts`
  - `apps/api/src/modules/finance/contracts/apply-finance-discount.input.ts`
  - `apps/api/src/modules/finance/contracts/apply-finance-discount.parser.ts`
- repositorio e service do modulo `finance` ampliados em:
  - `apps/api/src/modules/finance/repositories/finance.repository.ts`
  - `apps/api/src/modules/finance/services/finance-dashboard.service.ts`
  - `apps/api/src/modules/finance/services/finance-student-payments.service.ts`
- novos endpoints finos em:
  - `app/api/finance/coupons/route.ts`
  - `app/api/finance/[chargeId]/discount/route.ts`
  - `app/api/app/student/payments/route.ts`
- app do aluno alinhado ao contrato financeiro em:
  - `apps/api/src/modules/app/domain/student-app.ts`
  - `apps/api/src/modules/app/services/student-app-payments.service.ts`
  - `modules/app/services/student-app.ts`
  - `app/app/student/payments/page.tsx`
- dashboard admin alinhado ao novo fluxo em:
  - `modules/finance/components/finance-dashboard-screen.tsx`
  - criacao de cupom;
  - aplicacao de desconto manual;
  - exibicao de valor original, desconto, origem e motivo.

### Inconsistencias Encontradas

- bug tecnico real:
  - ao aplicar desconto manual numa mensalidade recorrente, o dashboard podia voltar a mostrar o valor cheio do plano;
  - em termos simples:
    - o admin negociava a divida;
    - a cobranca ficava com desconto;
    - ao recarregar o financeiro, a recomposicao recorrente reaplicava o valor do plano e apagava o efeito visivel do desconto.
- classificacao:
  - bug tecnico real de regra canônica no backend;
  - nao era so problema visual;
  - se nao fosse corrigido, admin e aluno poderiam voltar a ver valores divergentes na mesma cobranca.

### Correcao Do Bug

- a recomposicao de cobrancas recorrentes em:
  - `apps/api/src/modules/finance/services/finance-dashboard.service.ts`
- passou a preservar o valor ja descontado quando a cobranca recorrente ja tem desconto aplicado, em vez de sobrescrever com o valor cheio do plano.

### Revalidacao Final

- `./node_modules/.bin/tsc --noEmit`: passou.
- fluxo real do admin:
  - desconto manual aplicado na cobranca `cmmwyrjwh00diwlu8buou6g1z`;
  - valor final confirmado em `R$ 169,90`;
  - valor original confirmado em `R$ 189,90`;
  - desconto confirmado em `R$ 20,00`;
  - origem do desconto `manual`;
  - motivo `Acordo financeiro fase 4`;
  - recarga do dashboard nao perdeu o desconto.
- fluxo real do aluno:
  - cupom `FASE4OFF` criado pelo admin;
  - aplicacao no app do aluno em cobranca elegivel;
  - valor passou de `R$ 120,00` para `R$ 90,00`;
  - desconto refletido como `R$ 30,00`;
  - cupom e titulo apareceram na area de cobrancas do aluno;
  - resposta do backend: `Cupom aplicado com sucesso.`
- teste extra de regra `desconto nao acumula`:
  - aluno tentando aplicar o mesmo cupom novamente: `400` com `Essa cobranca ja possui desconto aplicado.`
  - admin tentando aplicar segundo desconto manual na mesma cobranca: `400` com `Essa cobrança já possui desconto aplicado.`
- smoke real de UI:
  - admin em `dashboard/finance`:
    - viu o cupom na aba `Planos`;
    - viu a cobranca com desconto na lista;
    - abriu o modal da cobranca negociada e viu `Origem do desconto = Manual` e `Motivo do desconto = Acordo financeiro fase 4`;
    - sem `console error` e sem `pageerror`.
  - aluno em `app/student/payments`:
    - viu a cobranca avulsa com valor atual, valor original, desconto e cupom aplicado;
    - sem `console error` e sem `pageerror`.

### Artefatos

- `/tmp/dojo_finance_phase4_create_coupon.json`
- `/tmp/dojo_finance_phase4_manual_discount_fixed.json`
- `/tmp/dojo_finance_phase4_student_direct_after.json`
- `/tmp/dojo_finance_phase4_coupon_duplicate.json`
- `/tmp/dojo_finance_phase4_manual_discount_duplicate.json`
- `/tmp/dojo-finance-phase4-ui-smoke.json`
- `/tmp/dojo-finance-phase4-admin-charge-modal.json`
- `/tmp/dojo-finance-phase4-results.json`

## Etapa Extra - Refatoracao Estrutural Do App Do Aluno

### Objetivo

- alinhar o app atual do aluno ao layout de referencia do `v0`, usando a referencia apenas como guia visual e comportamental;
- corrigir a organizacao do frontend do aluno para o padrao esperado no `doc-v2`;
- preparar a base correta para retomar a Fase 5 sem empilhar regra nova no layout antigo.

### Referencia Utilizada

- referencia visual localizada em:
  - `reference-ui/templates-site-ui /LAYOUT-UI`
- regra mantida:
  - copiar apenas layout e comportamento visual;
  - nao copiar arquitetura, mocks, organizacao de pasta nem dados fake.

### O Que Foi Refatorado

- criacao de shell propria do aluno em:
  - `modules/app/ui/student-app-shell.tsx`
- migracao da composicao de telas do aluno para a fronteira correta em:
  - `modules/app/student/student-home-screen.tsx`
  - `modules/app/student/student-attendance-screen.tsx`
  - `modules/app/student/student-classes-screen.tsx`
  - `modules/app/student/student-progress-screen.tsx`
  - `modules/app/student/student-payments-screen.tsx`
  - `modules/app/student/student-plans-screen.tsx`
  - `modules/app/student/student-profile-screen.tsx`
- atualizacao das paginas do app do aluno para usar o novo shell e as novas screens em:
  - `app/app/student/layout.tsx`
  - `app/app/student/page.tsx`
  - `app/app/student/attendance/page.tsx`
  - `app/app/student/classes/page.tsx`
  - `app/app/student/progress/page.tsx`
  - `app/app/student/payments/page.tsx`
  - `app/app/student/plans/page.tsx`
  - `app/app/student/profile/page.tsx`
- ampliacao do perfil para suportar a aba `Plano` com dados reais do app em:
  - `app/app/student/profile/page.tsx`

### Padrao Arquitetural Mantido

- a refatoracao ficou dentro do padrao que estamos consolidando:
  - shell e primitives em `modules/app/ui`
  - composicao especifica do aluno em `modules/app/student`
  - paginas do `app/` apenas como entrada de rota
  - sem mover regra de negocio para o frontend
- isso corrige a direcao anterior, em que o aluno ainda dependia demais de estrutura legado e shell compartilhada.

### Inconsistencias Encontradas

- inconsistencia tecnica real:
  - a base inicial da Fase 5 ja tinha avancado o schema com `Subscription.billingDay`, mas o Prisma Client gerado ainda estava antigo;
  - em termos simples:
    - o codigo do app/plano ja falava em `billingDay`;
    - as tipagens geradas do banco ainda nao conheciam esse campo;
    - isso quebrava o typecheck e mascarava a validacao do layout novo.
- inconsistencia secundaria:
  - um service novo de planos do aluno estava com tipagem ruim no filtro de `SubscriptionStatus` e perdia a inferencia correta da assinatura com `plan`.

### Correcao Aplicada

- regeneracao do Prisma Client com:
  - `npm run prisma:generate`
- ajuste localizado em:
  - `apps/api/src/modules/app/services/student-app-plans.service.ts`
  - troca do array `readonly` de status por tipagem compativel com Prisma;
  - separacao explicita das promises para manter a inferencia correta do `include: { plan: true }`
- limpeza estrutural pequena em:
  - `app/app/student/layout.tsx`
  - remocao de constante antiga que nao fazia mais parte do shell novo.

### Revalidacao

- `./node_modules/.bin/tsc --noEmit`: passou.
- `npm run build`: passou.
- observacao:
  - dentro do sandbox o build falhou apenas ao tentar baixar `Geist` e `Geist Mono` do Google Fonts;
  - rerodado fora do sandbox, o build do projeto concluiu normalmente;
  - classificacao:
    - limitacao de rede do ambiente;
    - nao era erro real do app refatorado.

### Resultado

- concluido.
- o app atual do aluno agora esta com shell propria e com as telas reorganizadas do jeito certo para continuar a integracao da Fase 5.

## Etapa Extra - Limpeza Das Rotas Genericas Legadas Do App

### Objetivo

- remover lixo estrutural restante do app;
- consolidar de vez a superficie do produto apenas em rotas por role:
  - `/app/teacher/*`
  - `/app/student/*`

### O Que Foi Removido

- rotas genericas legadas:
  - `app/app/agenda/page.tsx`
  - `app/app/attendance/page.tsx`
  - `app/app/classes/page.tsx`
  - `app/app/payments/page.tsx`
  - `app/app/profile/page.tsx`
  - `app/app/progress/page.tsx`
- aliases de rota antigos em:
  - `lib/routes.ts`

### Analise De Risco

- nao havia uso interno dessas rotas no codigo atual;
- as paginas nao eram superficies reais:
  - apenas redirecionavam para `/app`;
- o roteamento real ja estava todo concentrado em:
  - `app/app/teacher/*`
  - `app/app/student/*`
- risco residual identificado:
  - apenas bookmark ou link externo antigo.

### Documentacao Atualizada

- `doc-v2/project-structure.md`
- `doc-v2/frontend-architecture.md`
- `doc-v2/implementation-guidelines.md`
- `docs/architecture/app-teacher-student-execution-plan.md`
- `docs/architecture/app-surface-teacher-student-mvp-blueprint.md`
- `docs/architecture/module-maturity-matrix.md`

### Revalidacao

- `./node_modules/.bin/tsc --noEmit`: passou.
- `npm run build`: passou.
- a lista final de rotas do build manteve apenas:
  - `/app`
  - `/app/teacher/*`
  - `/app/student/*`

### Resultado

- concluido.
- o app deixou de carregar rotas genericas mortas e a documentacao principal passou a refletir esse estado.

## Fase 5A e 5C - Assinatura, Cobranca Inicial e Contratacao Pelo Aluno

### Objetivo

- iniciar a Fase 5 pela parte segura e canônica do dominio:
  - assinatura com `billingDay`;
  - cobranca inicial imediata no ato da contratacao;
  - proximo vencimento refletindo a data de contratacao;
  - contratacao real do plano no app do aluno.

### Inconsistencias Encontradas

- bug tecnico real no dominio financeiro:
  - a ativacao de plano pelo aluno criava a `Subscription`, mas a primeira cobranca nao era materializada de forma explicita no momento da contratacao;
  - o contrato da UI ja dizia `a primeira mensalidade e cobrada agora`, mas o backend ainda dependia da recomposicao posterior do financeiro.
- bug tecnico real na recorrencia:
  - o calculo de ciclo e vencimento ainda estava ancorado em mes/trimestre/semestre calendario, nao na data de inicio da assinatura;
  - em termos simples:
    - o produto passou a exigir recorrencia pela data de contratacao;
    - o backend ainda raciocinava por janela de calendario.
- bug tecnico real de ambiente/runtime:
  - o codigo e o schema ja usavam `Subscription.billingDay`, mas o banco local ainda nao tinha a migration aplicada;
  - depois disso, o `dev server` em `3000` ainda estava com Prisma client antigo em memoria e continuava rejeitando `billingDay` ate ser reiniciado.

### Correcao Aplicada

- dominio financeiro ajustado em:
  - `apps/api/src/modules/finance/domain/finance-charge.ts`
  - novas funcoes para:
    - avancar ciclo por assinatura;
    - resolver inicio do ciclo atual pela data de contratacao;
    - gerar `externalKey` recorrente pela data real do ciclo.
- recomposicao recorrente ajustada em:
  - `apps/api/src/modules/finance/services/finance-dashboard.service.ts`
  - passou a:
    - usar ciclo baseado em `startDate + billingDay`;
    - reconhecer chave nova e chave legada;
    - migrar a `externalKey` quando encontra cobranca antiga.
- leitura do estado financeiro do aluno ajustada em:
  - `apps/api/src/modules/finance/services/finance-student-state.service.ts`
  - passou a:
    - identificar a cobranca do ciclo atual com base na assinatura real;
    - calcular proximo vencimento pelo proximo ciclo, e nao pelo ciclo atual.
- contratacao do aluno ajustada em:
  - `apps/api/src/modules/app/services/student-app-plans.service.ts`
  - passou a:
    - usar `billingDay` real da assinatura;
    - retornar `nextBillingDate` do proximo ciclo;
    - criar a primeira cobranca imediatamente quando o plano pago e ativado.
- repositorio financeiro ampliado em:
  - `apps/api/src/modules/finance/repositories/finance.repository.ts`
  - suporte a busca por chave recorrente nova + legada.
- migration aplicada localmente:
  - `prisma/migrations/20260319054000_subscription_billing_day_and_student_plan_app/migration.sql`

### Revalidacao Tecnica

- `./node_modules/.bin/tsc --noEmit`: passou.
- `npm run build`: passou.
- `npm run prisma:migrate:deploy`: aplicou a migration de `billingDay`.
- servidor `localhost:3000` reiniciado para carregar o Prisma client novo.

### Revalidacao Real

- fluxo real do aluno no tenant `academia-validacao-1773885421600`:
  - login com `student.self.1773886854630@example.com`;
  - `GET /api/app/student/plans` antes:
    - sem plano ativo;
    - `activationBillingDay = 19`;
    - `nextBillingDate = null`.
  - `POST /api/app/student/plans`:
    - `200`;
    - `currentPlanName = Plano Mensal`;
    - `nextBillingDate = 2026-04-19`;
    - mensagem:
      - `Plano ativado com sucesso. O vencimento passa a ser todo mês no dia 19.`
  - `GET /api/app/student/payments` logo depois:
    - `planName = Plano Mensal`;
    - `paymentStatus = pending`;
    - `nextPayment = 2026-03-19`;
    - cobranca atual criada imediatamente com:
      - descricao `Plano Mensal`;
      - vencimento `2026-03-19`;
      - valor `R$ 189,90`.
- prova de integracao com o admin:
  - login do admin em `dashboard`;
  - `GET /api/finance` apos a contratacao;
  - apenas uma cobranca recorrente encontrada para o aluno;
  - o dashboard nao duplicou a mensalidade ao recompor o financeiro.
- prova de bloqueio basico:
  - segunda tentativa de contratar o mesmo plano pelo aluno:
    - `400`;
    - mensagem:
      - `Esse plano já está ativo para você.`

### Resultado

- primeira parte da Fase 5 concluida.
- o produto agora fecha corretamente esta regra:
  - o aluno contrata;
  - a primeira cobranca nasce no ato;
  - o proximo vencimento respeita a data da contratacao;
  - o admin nao duplica essa cobranca ao abrir o financeiro.

### Proximo Recorte

- continuar a Fase 5 pelo admin:
  - `Mensalidade pontual` vs `Mensalidade recorrente`;
  - recorrente por valor manual vs vinculo com plano;
  - alerta de duplicidade quando o aluno ja possuir plano ativo.

## Fase 5B - Mensalidade Pontual vs Recorrente No Admin

### Objetivo

- fechar o recorte administrativo da Fase 5 sem misturar responsabilidades:
  - `mensalidade pontual` continua como cobranca avulsa;
  - `mensalidade recorrente` passa a ter dois caminhos reais:
    - valor manual;
    - plano existente.
- preservar a coerencia entre:
  - `Subscription` como plano ativo do aluno;
  - recorrencia administrativa como configuracao financeira separada;
  - tela admin refletindo o aviso de duplicidade quando o aluno ja possui plano ativo.

### Inconsistencias Encontradas

- incoerencia estrutural real no dominio:
  - o schema ja tinha recebido parte da modelagem para recorrencia administrativa, mas o modulo `finance` ainda tratava toda `Nova cobrança` como avulsa;
  - em termos simples:
    - o banco comecava a falar em recorrencia administrativa;
    - o service e a UI ainda pensavam em cobranca manual unica.
- bug tecnico real de runtime:
  - depois de adicionar `FinanceRecurringSetup`, o `next dev` em `3000` ainda estava com Prisma client antigo em memoria;
  - isso fazia `/api/finance` quebrar com `prisma.financeRecurringSetup` indefinido ate o servidor ser reiniciado.
- desalinhamento do proprio cenario de teste:
  - o modulo `students` expoe `linkedUserId`, nao `userId`;
  - a primeira tentativa de validacao do script usou o campo errado e gerou `400` por payload invalido;
  - isso nao era bug do produto, era bug do teste.
- ruido de cenario de validacao:
  - ao usar o mesmo aluno sem plano para mais de uma prova, a leitura de `nextPayment` passou a refletir a cobranca manual anterior;
  - a revalidacao final foi refeita com alunos distintos por cenario para nao poluir o resultado.

### Correcao Aplicada

- schema consolidado em:
  - `prisma/schema.prisma`
  - modelo novo:
    - `FinanceRecurringSetup`
  - enum novo:
    - `FinanceRecurringSetupSource`
  - relacao nova:
    - `FinanceCharge.recurringSetupId`
- migration criada e aplicada localmente:
  - `prisma/migrations/20260319123337_finance_recurring_setups_admin_recurring/migration.sql`
- dominio financeiro ampliado em:
  - `apps/api/src/modules/finance/domain/finance-charge.ts`
  - nova chave recorrente para setup administrativo:
    - `recurring-setup:<id>:<cycle-start>`
- repositorio refatorado em:
  - `apps/api/src/modules/finance/repositories/finance.repository.ts`
  - passou a suportar:
    - listagem de `FinanceRecurringSetup`;
    - criacao de recorrencia administrativa;
    - criacao de `Subscription` para vinculacao inicial por plano;
    - `FinanceCharge` recorrente com `subscriptionId` ou `recurringSetupId`.
- service refatorado em:
  - `apps/api/src/modules/finance/services/finance-dashboard.service.ts`
  - passou a separar os caminhos:
    - cobranca pontual;
    - recorrencia manual;
    - recorrencia vinculada a plano sem plano ativo;
    - recorrencia vinculada a plano com duplicidade confirmada.
  - `ensureCurrentCharges()` agora recompõe:
    - assinaturas do aluno;
    - recorrencias administrativas.
- contrato da API ampliado em:
  - `apps/api/src/modules/finance/contracts/create-finance-charge.input.ts`
  - `apps/api/src/modules/finance/contracts/create-finance-charge.parser.ts`
  - novos campos:
    - `recurrenceMode`;
    - `recurringSource`;
    - `confirmDuplicatePlan`.
- tela do admin refatorada em:
  - `modules/finance/components/finance-dashboard-screen.tsx`
  - a modal `Nova cobrança` agora expõe:
    - `Natureza: Pontual | Recorrente`
    - `Origem: Valor manual | Plano existente`
    - `Plano vinculado`
    - modal de confirmacao para duplicidade quando ja existe plano ativo.

### Revalidacao Tecnica

- `./node_modules/.bin/tsc --noEmit`: passou.
- `npm run build`: passou.
- `npm run prisma:migrate:dev -- --name finance_recurring_setups_admin_recurring`: passou.
- `npm run prisma:generate`: passou.
- `localhost:3000` reiniciado apos a migration para carregar o Prisma client novo.

### Revalidacao Real

- validacao de contrato real por API no tenant `academia-validacao-1773885421600`:
  - `admin -> mensalidade recorrente por valor manual`
    - `200`
    - cobranca criada com:
      - descricao `Mensalidade recorrente manual fase 5 ...`
      - valor `R$ 210,00`
      - vencimento `2026-03-27`
  - `admin -> mensalidade recorrente por plano para aluno sem plano`
    - `200`
    - aluno passou a ter:
      - `planName = Plano Mensal`
      - `nextPayment = 2026-03-28`
    - cobranca inicial criada com:
      - descricao `Plano Mensal`
      - valor `R$ 189,90`
      - vencimento `2026-03-28`
  - `admin -> aluno com plano ativo, sem confirmar duplicidade`
    - `400`
    - mensagem:
      - `Este aluno já possui um plano ativo. Confirme que deseja gerar uma cobrança recorrente adicional.`
  - `admin -> aluno com plano ativo, confirmando duplicidade`
    - `200`
    - cobranca adicional criada com:
      - descricao `Plano Mensal adicional fase 5 ...`
      - valor `R$ 189,90`
      - vencimento `2026-03-29`
- smoke real de UI no `dashboard/finance`:
  - modal `Nova cobrança` abriu sem erro;
  - labels visiveis:
    - `Aluno`
    - `Tipo de cobrança`
    - `Natureza`
    - `Origem`
    - `Plano vinculado`
    - `Valor`
    - `Vencimento`
    - `Descrição`
  - opcoes visiveis:
    - `Pontual`
    - `Recorrente`
    - `Valor manual`
    - `Plano existente`
  - `console error` / `pageerror`:
    - nenhum.

### Resultado

- recorte administrativo da Fase 5 concluido.
- o produto agora separa corretamente:
  - plano ativo do aluno;
  - recorrencia financeira criada pelo admin.
- a tela do admin passou a refletir a regra de duplicidade em vez de esconder esse risco.

### Proximo Recorte

- continuar a Fase 5 pela politica de troca de plano:
  - imediata;
  - proximo ciclo;
  - pro-rata por dias corridos.
- depois avancar para a Fase 6:
  - inadimplencia configuravel por academia;
  - impacto operacional em turmas.

## Regra Operacional - Cenarios Limpos Para Validacao

### Decisao

- a partir desta rodada, todo teste real deve comecar com dados limpos e terminar com cleanup dos residuos gerados pela propria validacao.
- objetivo:
  - evitar que um teste influencie o outro;
  - manter o tenant de validacao seguro para a proxima rodada;
  - impedir falso positivo ou falso negativo por cobrancas, assinaturas, cupons ou vinculos deixados por etapas anteriores.

### Cleanup Aplicado Agora

- limpeza financeira executada no tenant `academia-validacao-1773885421600` apos a Fase 5B.
- residuos removidos:
  - `9` cobrancas de teste das fases 3, 4 e 5;
  - `4` `FinanceRecurringSetup`;
  - `2` `Subscription` criadas apenas para validacao;
  - `1` cupom de teste (`FASE4OFF`).
- rechecagem apos cleanup:
  - `remaining.recurringSetups = 0`
  - `remaining.charges = 0`
  - `remaining.subscriptions = 0`
  - `remaining.coupons = 0`

### Regra Para A Proxima Etapa

- antes de validar:
  - criar ou reservar cenario limpo;
  - isolar os atores e IDs usados;
  - registrar os artefatos temporarios da rodada.
- depois de validar:
  - apagar ou reverter os dados temporarios;
  - registrar no journal o cleanup executado.

## Fase 5 - Continuacao: Politicas Da Academia Em Meu Perfil > Planos

### Objetivo

- encaixar a continuacao da Fase 5 no lugar correto do produto:
  - a academia define a politica de troca de plano em `Meu perfil > Planos`;
  - o app do aluno consome essa politica e a exibe no fluxo de contratacao;
  - a base de inadimplencia fica preparada para a proxima fase, sem antecipar a regra operacional.

### Inconsistencias Encontradas

- inconsistencia estrutural real no produto:
  - o schema ja tinha campos de politica financeira em `TenantPaymentSettings`;
  - mas o dashboard ainda nao expunha isso em `Meu perfil`;
  - e o app do aluno ainda nao lia essa politica no fluxo de planos.
- falso negativo de validacao encontrado durante a prova inicial:
  - o teste chamou `/api/app/student/plans` usando um host improprio para a superficie do app;
  - o backend respondeu `403 Tenant inválido para a superfície do app.`;
  - em linguagem simples:
    - a regra nao estava quebrada;
    - o request de teste foi montado do jeito errado.
- classificacao:
  - a primeira parte era lacuna real de integracao front/back/api;
  - o `403` era bug do teste, nao do produto.

### Correcao Aplicada

- dominio financeiro canônico criado em:
  - `apps/api/src/modules/finance/domain/finance-settings.ts`
- contrato e parser de update criados em:
  - `apps/api/src/modules/finance/contracts/update-finance-settings.input.ts`
  - `apps/api/src/modules/finance/contracts/update-finance-settings.parser.ts`
- service de configuracoes financeiras criado em:
  - `apps/api/src/modules/finance/services/finance-settings.service.ts`
- endpoint do dashboard criado em:
  - `app/api/finance/settings/route.ts`
- `Meu perfil` refatorado para virar superficie real de politica financeira em:
  - `app/dashboard/profile/page.tsx`
- contrato do app do aluno ampliado em:
  - `apps/api/src/modules/app/domain/student-app.ts`
- leitura da politica da academia integrada em:
  - `apps/api/src/modules/app/services/student-app-plans.service.ts`
- tela de planos do aluno alinhada para refletir a politica em:
  - `modules/app/student/student-plans-screen.tsx`

### Revalidacao Tecnica

- `./node_modules/.bin/tsc --noEmit`: passou.
- `npm run build`: passou.
- rota nova gerada no build:
  - `/api/finance/settings`

### Revalidacao Real

- validacao correta refeita no tenant `academia-validacao-1773885421600` usando o host real do tenant:
  - `GET /api/finance/settings`:
    - `200`
  - `PATCH /api/finance/settings` com politica temporaria:
    - `planTransitionPolicy = prorata`
    - `delinquencyGraceDays = 7`
    - `delinquencyBlocksNewClasses = true`
    - `delinquencyRemovesCurrentClasses = true`
    - `delinquencyRecurringMode = pause`
    - `delinquencyAccumulatesDebt = false`
    - resposta:
      - `200`
  - `GET /api/app/student/plans` depois do patch correto:
    - `200`
    - `planTransitionPolicy = prorata`
    - `planTransitionPolicyLabel = Pró-rata por dias corridos`
    - `activationBillingDay = 19`
    - `nextBillingDate = 2026-04-19`
- cleanup/config baseline restaurado depois da prova:
  - `planTransitionPolicy = next_cycle`
  - `delinquencyGraceDays = 0`
  - `delinquencyBlocksNewClasses = false`
  - `delinquencyRemovesCurrentClasses = false`
  - `delinquencyRecurringMode = continue`
  - `delinquencyAccumulatesDebt = true`
- revalidacao final apos restauracao:
  - `GET /api/app/student/plans`:
    - `200`
    - `planTransitionPolicy = next_cycle`
    - `planTransitionPolicyLabel = No próximo ciclo`

### Resultado

- subetapa concluida.
- a academia ja decide a politica de troca de plano no lugar correto do produto:
  - `Dashboard > Meu perfil > Planos`
- o app do aluno ja reflete essa politica de forma coerente.
- o proximo passo da Fase 5 nao e mais de configuracao;
  - agora falta implementar o motor real de troca de plano de acordo com a politica escolhida pela academia.

## Fase 5 - Continuacao: Tratamento Da Cobranca Atual Na Troca De Plano

### Objetivo

- permitir que a academia configure nao apenas `quando` a troca de plano acontece, mas tambem `como` a cobranca atual deve ser tratada quando a politica for `imediata` ou `pró-rata`.
- manter essa decisao no mesmo lugar do produto:
  - `Dashboard > Meu perfil > Planos`
- refletir essa regra no app do aluno sem duplicar logica financeira na UI.

### Inconsistencias Encontradas

- lacuna real de produto/modelo:
  - o sistema ja sabia a politica macro de troca (`immediate`, `next_cycle`, `prorata`);
  - mas ainda nao sabia o que fazer com a cobranca atual quando a troca exigisse ajuste financeiro.
- bug tecnico de runtime encontrado durante a integracao:
  - depois da nova enum no Prisma, o `next dev` em `3000` permaneceu com o client antigo em memoria;
  - isso gerou `500` em `/api/finance/settings` por `PlanTransitionChargeHandling` indefinido;
  - em linguagem simples:
    - o codigo novo estava certo;
    - o servidor estava rodando com runtime velho.
- falso negativo de UI no smoke inicial:
  - o seletor do teste tentou clicar no texto do `Label` do campo;
  - o botao real exibia o nome da opcao atual;
  - isso era erro do teste, nao do produto.

### Correcao Aplicada

- dominio financeiro ampliado em:
  - `apps/api/src/modules/finance/domain/finance-settings.ts`
  - nova decisao:
    - `planTransitionChargeHandling`
  - opcoes suportadas:
    - `replace_open_charge`
    - `charge_difference`
    - `convert_to_credit`
- schema ampliado em:
  - `prisma/schema.prisma`
  - novo enum:
    - `PlanTransitionChargeHandling`
  - novo campo em `TenantPaymentSettings`:
    - `planTransitionChargeHandling`
- migration criada e aplicada:
  - `prisma/migrations/20260319135435_finance_plan_transition_charge_handling/migration.sql`
- parser e contrato atualizados em:
  - `apps/api/src/modules/finance/contracts/update-finance-settings.input.ts`
  - `apps/api/src/modules/finance/contracts/update-finance-settings.parser.ts`
- service de configuracoes ampliado em:
  - `apps/api/src/modules/finance/services/finance-settings.service.ts`
- contrato do app do aluno ampliado em:
  - `apps/api/src/modules/app/domain/student-app.ts`
- leitura da politica no app do aluno ajustada em:
  - `apps/api/src/modules/app/services/student-app-plans.service.ts`
- tela `Meu perfil` refatorada com modal explicativo e selecao dinamica em:
  - `app/dashboard/profile/page.tsx`
- tela de planos do aluno ajustada para refletir o tratamento escolhido em:
  - `modules/app/student/student-plans-screen.tsx`

### Revalidacao Tecnica

- `./node_modules/.bin/prisma generate`: passou.
- `./node_modules/.bin/tsc --noEmit`: passou.
- `npm run build`: passou.
- `./node_modules/.bin/prisma migrate dev --name finance_plan_transition_charge_handling`: passou.
- `localhost:3000` reiniciado apos a migration para carregar o Prisma runtime novo.

### Revalidacao Real

- validacao por API no tenant `academia-validacao-1773885421600`:
  - baseline original lido com:
    - `planTransitionPolicy = next_cycle`
    - `planTransitionChargeHandling = charge_difference`
  - patch temporario aplicado:
    - `planTransitionPolicy = immediate`
    - `planTransitionChargeHandling = convert_to_credit`
  - `GET /api/app/student/plans` depois do patch:
    - `200`
    - `planTransitionPolicy = immediate`
    - `planTransitionPolicyLabel = Imediata`
    - `planTransitionChargeHandling = convert_to_credit`
    - `planTransitionChargeHandlingLabel = converter o saldo anterior em crédito`
  - restore executado ao final:
    - `planTransitionPolicy = next_cycle`
    - `planTransitionChargeHandling = charge_difference`
- smoke real de UI em `/dashboard/profile`:
  - login admin realizado no tenant;
  - politica trocada localmente para `Imediata` sem salvar;
  - modal de tratamento da cobranca aberto com sucesso;
  - opcoes visiveis:
    - `Substituir cobrança aberta`
    - `Cobrar apenas a diferença`
    - `Converter em crédito`
  - `consoleErrors = []`
  - `pageErrors = []`

### Resultado

- subetapa concluida.
- a academia agora controla duas decisoes separadas e coerentes:
  - quando a troca de plano acontece;
  - como a cobranca atual deve ser tratada quando houver ajuste financeiro.
- o tenant de validacao foi restaurado ao baseline ao final da prova.

## Fase 5 - Motor Real De Troca De Plano

### Objetivo

- implementar a troca de plano de verdade no backend, usando as politicas ja definidas pela academia:
  - `next_cycle`
  - `immediate`
  - `prorata`
- manter a regra no modulo `finance`, sem empurrar decisao para o app do aluno.
- validar a fase inteira com dados limpos, criando alunos temporarios e apagando tudo ao final.

### Inconsistencias Encontradas

- bug real 1:
  - na troca `immediate + replace_open_charge`, a cobranca do ciclo atual continuava presa na assinatura antiga;
  - quando o dashboard financeiro reprocessava a assinatura nova, ele criava outra mensalidade por cima;
  - em linguagem simples:
    - o aluno trocava de plano;
    - o sistema ficava com duas cobrancas do mesmo ciclo.
- bug real 2:
  - na troca `immediate + charge_difference`, o dashboard promovia a mensalidade base para o valor cheio do plano novo e ainda somava o ajuste;
  - em linguagem simples:
    - ele cobrava `plano novo + diferenca`;
    - quando o correto era `base antiga + diferenca`.
- ponto de hardening identificado na arquitetura:
  - a leitura do financeiro ainda dispara sincronizacao temporal em alguns pontos;
  - isso continua funcionalmente correto para esta fase, mas ficou registrado como atencao futura para reduzir efeito colateral em leitura.

### Correcao Aplicada

- motor de transicao formalizado em:
  - `apps/api/src/modules/finance/services/finance-plan-transition.service.ts`
- novos conceitos de dominio persistidos em:
  - `prisma/schema.prisma`
  - `SubscriptionPlanChange`
  - `FinanceCreditBalance`
- migration criada e aplicada:
  - `prisma/migrations/20260320005929_finance_plan_transition_engine/migration.sql`
- integracao do motor com app do aluno e leituras financeiras em:
  - `apps/api/src/modules/app/services/student-app-plans.service.ts`
  - `apps/api/src/modules/finance/services/finance-dashboard.service.ts`
  - `apps/api/src/modules/finance/services/finance-student-state.service.ts`
  - `app/api/app/student/plans/route.ts`
- correcoes especificas do bug de duplicidade:
  - a cobranca tratada no ciclo atual agora e reatribuida para a nova assinatura quando a troca e `immediate` ou `prorata`;
  - o `externalKey` recorrente do ciclo atual passa a apontar para a assinatura nova.
- correcoes especificas do bug de `charge_difference`:
  - a mensalidade base do ciclo atual passou a preservar o valor base anterior;
  - `originalAmountCents` guarda o valor cheio do plano novo;
  - `discountAmountCents` guarda a diferenca;
  - a cobranca de ajuste continua separada.

### Revalidacao Tecnica

- `./node_modules/.bin/prisma validate`: passou.
- `./node_modules/.bin/prisma generate`: passou.
- `./node_modules/.bin/tsc --noEmit`: passou.
- `npm run build`: passou.

### Revalidacao Real

- tenant usado:
  - `academia-validacao-1773885421600`
- baseline lido e restaurado ao final:
  - `planTransitionPolicy = next_cycle`
  - `planTransitionChargeHandling = charge_difference`
- regra operacional adotada nesta fase:
  - testes sempre com alunos temporarios isolados;
  - cleanup ao final de cada bateria.
- bateria limpa executada com 4 cenarios reais:
  - `next_cycle + charge_difference`
  - `immediate + replace_open_charge`
  - `immediate + charge_difference`
  - `prorata + convert_to_credit`
- resultados confirmados:
  - `next_cycle`
    - a troca fica agendada;
    - o plano atual permanece ate a data efetiva;
    - ao vencer, a troca e aplicada e o pendente some.
  - `immediate + replace_open_charge`
    - permaneceu apenas 1 cobranca de mensalidade no ciclo;
    - sem duplicidade depois da releitura do financeiro.
  - `immediate + charge_difference`
    - permaneceu a base antiga:
      - `R$ 149,90`
    - `originalAmount = R$ 189,90`
    - `discountAmount = R$ 40,00`
    - ajuste separado:
      - `R$ 40,00`
  - `prorata + convert_to_credit`
    - a cobranca do ciclo foi convertida corretamente para o valor proporcional;
    - o saldo remanescente virou credito real;
    - o credito foi aplicado na cobranca seguinte;
    - o saldo residual continuou armazenado.
- artefato da bateria:
  - `/tmp/dojo_phase5_validate_results.json`
- cleanup final confirmado:
  - `4` usuarios temporarios removidos.

### Apoio Paralelo

- revisao de produto:
  - confirmou que o risco principal desta fase estava na coerencia entre assinatura ativa, cobranca atual e efeito visivel no app do aluno.
- revisao de UX:
  - confirmou que o aluno deve ver efeito financeiro e temporal da troca, nao jargao tecnico do motor.
- revisao de arquitetura:
  - confirmou que a fase esta no bounded context certo (`finance`), mas deixou registrado como atencao futura o excesso de responsabilidade concentrado no service de transicao e o efeito colateral de sincronizacao em leitura.

### Resultado

- subetapa concluida.
- a Fase 5 ficou funcionalmente fechada para:
  - contratacao inicial;
  - troca agendada;
  - troca imediata;
  - troca por pró-rata;
  - tratamento da cobranca atual;
  - credito reaproveitavel no dominio.
- o proximo passo coerente agora e a Fase 6:
  - inadimplencia configuravel por academia;
  - bloqueio de novas turmas;
  - retirada das turmas atuais;
  - politica de recorrencia/acumulo de divida durante suspensao.

## Fase 6 - Inadimplencia Configuravel E Integracao Com Turmas

### Escopo Da Etapa

- transformar as configuracoes de inadimplencia da academia em comportamento real do sistema.
- validar o fluxo ponta a ponta com dados limpos:
  - `admin`
  - `student`
  - `finance`
  - `classes`
- manter a regra no backend, sem logica financeira espalhada no frontend.

### Inconsistencias Encontradas

- bug real 1:
  - a academia ja conseguia configurar inadimplencia em `Meu perfil`, mas isso ainda nao governava a operacao real;
  - em linguagem simples:
    - a configuracao existia;
    - o produto ainda deixava o aluno agir como se nada tivesse sido configurado.
- bug real 2:
  - o aluno inadimplente ainda conseguia entrar em novas turmas;
  - o admin tambem ainda podia matricular esse aluno por fora no gerenciamento da turma.
- bug real 3:
  - a politica `retirar das turmas atuais` ainda nao removia operacionalmente o aluno da turma;
  - isso criava risco de:
    - o admin continuar vendo o aluno ativo;
    - o professor continuar operando a turma com aluno bloqueado;
    - o aluno seguir vendo a turma como `joined`.
- bug real 4:
  - a recorrencia financeira ainda nao consultava a politica da academia durante a inadimplencia;
  - em linguagem simples:
    - `pause`
    - `continue`
    - `continue sem acumular`
    ainda nao mudavam a geracao de cobrancas do jeito que a academia definia.

### Correcao Aplicada

- novo service canônico de inadimplencia em:
  - `apps/api/src/modules/finance/services/finance-delinquency.service.ts`
- integracao do estado de inadimplencia no estado financeiro do aluno em:
  - `apps/api/src/modules/finance/services/finance-student-state.service.ts`
- integracao da politica de recorrencia com o motor financeiro em:
  - `apps/api/src/modules/finance/services/finance-dashboard.service.ts`
- integracao do bloqueio de novas turmas no dominio de `classes` em:
  - `apps/api/src/modules/classes/services/class-group.service.ts`

### Revalidacao Tecnica

- `./node_modules/.bin/tsc --noEmit`: passou.
- `npm run build`:
  - sem erro estrutural do modulo;
  - continuou bloqueado no sandbox apenas por fetch de `Geist` e `Geist Mono` no Google Fonts.

### Revalidacao Real

- tenant usado:
  - `academia-validacao-1773885421600`
- baseline restaurado ao final:
  - `delinquencyGraceDays = 0`
  - `delinquencyBlocksNewClasses = false`
  - `delinquencyRemovesCurrentClasses = false`
  - `delinquencyRecurringMode = continue`
  - `delinquencyAccumulatesDebt = true`
- regra operacional mantida:
  - bateria sempre com alunos temporarios isolados;
  - cleanup ao final da rodada.
- bateria limpa executada com 5 cenarios reais:
  - `block_new_classes`
  - `remove_current_classes`
  - `pause_recurring`
  - `continue_without_accumulating_debt`
  - `continue_with_accumulating_debt`
- resultados confirmados:
  - `block_new_classes`
    - aluno inadimplente foi bloqueado no app ao tentar entrar em nova turma;
    - admin tambem foi bloqueado ao tentar matricular o mesmo aluno pela gestao da turma;
    - mensagem retornada:
      - `O acesso a novas turmas está bloqueado até regularizar os pagamentos.`
  - `remove_current_classes`
    - aluno entrou normalmente na turma quando ainda estava adimplente;
    - ao ficar inadimplente com a politica ativa, o vinculo operacional foi removido;
    - `currentStudents` voltou ao total anterior;
    - o app do aluno passou a refletir `joined = false`.
  - `pause_recurring`
    - apenas a cobranca vencida do ciclo anterior permaneceu;
    - o sistema nao criou a nova cobranca do ciclo corrente.
  - `continue_without_accumulating_debt`
    - a cobranca vencida permaneceu aberta;
    - nenhuma nova divida foi empilhada por cima.
  - `continue_with_accumulating_debt`
    - a cobranca vencida foi mantida;
    - a nova cobranca do ciclo corrente foi gerada corretamente.
- artefato consolidado:
  - `/tmp/dojo_phase6_validate_results.json`
- cleanup final confirmado:
  - `5` usuarios temporarios removidos;
  - `1` turma recontada para manter `currentStudents` coerente.

### Resultado

- Fase 6 concluida.
- a inadimplencia configurada pela academia agora governa de fato:
  - entrada em novas turmas;
  - permanencia nas turmas atuais;
  - geracao de cobrancas recorrentes.
- o proximo passo coerente agora e seguir para as proximas frentes funcionais do produto, mantendo o mesmo criterio:
  - API real;
  - UI real;
  - cleanup de dados;
  - refatoracao apenas dentro do bounded context correto.

## Etapa Extra - Consolidacao Das Politicas Financeiras Em Settings > Payments

### Objetivo

- eliminar a duplicidade entre a rota antiga `/dashboard/profile` e a aba `Pagamentos` de `Dashboard > Settings`.
- deixar um unico lugar no painel da academia para:
  - meios de pagamento;
  - gateway;
  - politica de troca de plano;
  - tratamento da cobranca atual;
  - regras de inadimplencia.

### Inconsistencia Encontrada

- o produto estava com duas superficies para configuracao financeira:
  - `Dashboard > Settings > Pagamentos`
  - `/dashboard/profile`
- em linguagem simples:
  - a academia precisava adivinhar onde ficava cada regra;
  - e ainda existia risco de a UI parecer ter duas fontes de verdade.

### Correcao Aplicada

- a configuracao financeira foi consolidada em:
  - `app/dashboard/settings/page.tsx`
- o atalho `Meu perfil` passou a apontar para:
  - `routes.dashboardSettingsPayments`
- a rota antiga foi removida:
  - `app/dashboard/profile/page.tsx`
- a navegacao e fallback do dashboard foram ajustados em:
  - `lib/routes.ts`
  - `lib/system-navigation.ts`
  - `lib/navigation.ts`
  - `components/layout/mobile-nav.tsx`
  - `components/guards/surface-guard.tsx`

### Revalidacao Tecnica

- `./node_modules/.bin/tsc --noEmit`: passou.
- `npm run build`:
  - sem erro estrutural da mudanca;
  - segue bloqueado no sandbox apenas pelo fetch das Google Fonts.

### Resultado

- `/dashboard/profile` deixou de existir.
- a fonte de verdade do painel da academia para essas politicas agora e:
  - `Dashboard > Settings > Pagamentos`

### Smoke Real De UI

- rota validada:
  - `http://localhost:3000/dashboard/settings?tab=payments`
- validado em navegador real:
  - login do admin
  - carregamento da aba `Pagamentos`
  - exibicao de:
    - `Politica de troca de plano`
    - `Inadimplencia`
    - botao `Salvar politicas financeiras`
  - abertura do modal `Tratamento da cobranca na troca de plano`
  - exibicao das 3 opcoes:
    - `Substituir cobranca aberta`
    - `Cobrar apenas a diferenca`
    - `Converter em credito`
- resultado:
  - `consoleMessages = []`
  - `pageErrors = []`
  - `badResponses = []`
- artefatos:
  - screenshot:
    - `output/playwright/dashboard-settings-payments-smoke.png`
  - json:
    - `/tmp/dojo_dashboard_settings_payments_smoke.json`

## Etapa Extra - Consolidacao Da Documentacao Tecnica Apos Finance E Limpeza Do App

### Objetivo

- alinhar `doc-v2` ao estado real do codigo depois das fases fechadas de `finance`, da refatoracao do app do aluno e da consolidacao das politicas em `Settings > Pagamentos`.

### Documentos Atualizados

- `doc-v2/README.md`
- `doc-v2/project-structure.md`
- `doc-v2/frontend-architecture.md`
- `doc-v2/backend-architecture.md`
- `doc-v2/api-specification.md`
- `doc-v2/implementation-guidelines.md`
- `doc-v2/refactor-plan.md`
- `doc-v2/refactor-backlog.md`
- `docs/architecture/module-maturity-matrix.md`

### Regras E Estado Que Passam A Ser Baseline

- onboarding, modalidades, professores, turmas, alunos, presenca e `finance` ate a Fase 6 ja estao consolidados nesta rodada.
- o app do aluno usa shell propria e composicao em `modules/app/student/*`.
- as rotas genericas do app foram removidas e nao devem voltar.
- a politica financeira da academia vive em:
  - `Dashboard > Settings > Pagamentos`
  - `/api/finance/settings`
- o aluno pode contratar plano em `/app/student/plans`.
- a primeira cobranca e gerada no ato da contratacao.
- `billingDay` nasce da data da contratacao e governa o proximo vencimento.
- troca de plano e inadimplencia continuam sendo regras do modulo `finance`, nao da UI.

### Resultado

- a documentacao oficial agora reflete melhor o codigo real.
- o proximo agente nao deve reabrir discussoes ja fechadas sobre:
  - shell do aluno;
  - rotas genericas do app;
  - local de configuracao financeira;
  - escopo atual do modulo `finance`.

## Fase 7 - Modulo `events` (inicio)

### Objetivo

- iniciar a validacao e formalizacao do modulo `events` no mesmo formato das fases anteriores:
  - cenario limpo
  - API real
  - smoke de UI depois da correcao
  - registro e cleanup

### Inconsistencia Real Encontrada

- o admin conseguia criar um evento apontando um `teacherProfileId` responsavel, mas o app do professor ainda inferia `isCoordinator` principalmente pelo `organizerName`.
- em linguagem simples:
  - a academia marcava um professor responsavel pelo cadastro;
  - mas o app do professor podia deixar de reconhece-lo corretamente como coordenador se o nome do organizador fosse outro.

### Correcao Aplicada

- o contrato do dashboard de eventos passou a expor `teacherProfileId` em:
  - `apps/api/src/modules/events/domain/event-dashboard.ts`
- o service do dashboard passou a mapear o responsavel real em:
  - `apps/api/src/modules/events/services/event-dashboard.service.ts`
- o BFF do professor passou a calcular `isCoordinator` pela chave real do dominio, com fallback legado por nome apenas para compatibilidade em:
  - `apps/api/src/modules/app/services/teacher-app-events.service.ts`

### Validacao Real

- sonda por API real do admin:
  - `GET /api/events`: `200`
  - `POST /api/events`: `201`
  - `POST /api/events/[eventId]/participants`: `201`
- validacao cruzada `admin -> teacher`:
  - evento criado com `teacherProfileId = Professor Autocadastro`
  - `organizerName = Coordenacao Externa QA`
  - login real do professor existente `teacher.signup.1773885818191@example.com`
  - `GET /api/app/teacher/events`: `200`
  - o evento apareceu com:
    - `isCoordinator = true`
    - mesmo com `organizerName` diferente do nome do professor

### Smoke Real De UI

- dashboard admin:
  - `http://localhost:3000/dashboard/events`
- app do professor:
  - `http://academia-validacao-1773885421600.localhost:3000/app/teacher/events`
- evento temporario usado no smoke:
  - `Evento QA Smoke 1774015980552`
- resultado:
  - `consoleMessages = []`
  - `pageErrors = []`
  - `badResponses = []`
- artefatos:
  - `output/playwright/events-dashboard-smoke.png`
  - `output/playwright/teacher-events-smoke.png`
  - `/tmp/dojo_events_smoke_ui.json`

### Cleanup

- o evento temporario `Evento QA Coord 1774015735945` foi removido via SQL local apos a validacao.
- o evento temporario `Evento QA Smoke 1774015980552` tambem foi removido via SQL local apos o smoke.
- a verificacao posterior de `GET /api/events` confirmou:
  - `qaEvents = 0`
  - `qaPastEvents = 0`
  - `qaSmokeEvents = 0`
  - `qaCoordEvents = 0`

### Resultado Parcial

- a primeira incoerencia real do modulo `events` foi corrigida.
- o modulo segue `partial`:
  - possui backend real;
  - possui BFF do professor;
  - ainda precisa de contracts formais nos handlers administrativos e de uma rodada completa de smoke da UI do dashboard.

### Contracts Administrativos Formalizados

- o parsing administrativo de `events` saiu dos handlers e foi movido para o modulo em:
  - `apps/api/src/modules/events/contracts/create-event.input.ts`
  - `apps/api/src/modules/events/contracts/create-event.parser.ts`
  - `apps/api/src/modules/events/contracts/add-event-participant.input.ts`
  - `apps/api/src/modules/events/contracts/add-event-participant.parser.ts`
  - `apps/api/src/modules/events/contracts/update-event-participant.input.ts`
  - `apps/api/src/modules/events/contracts/update-event-participant.parser.ts`
- os handlers ficaram mais finos em:
  - `app/api/events/route.ts`
  - `app/api/events/[eventId]/participants/route.ts`

### Revalidacao Real Dos Contracts

- tenant validado:
  - `academia-validacao-1773885421600`
- contrato invalido:
  - `POST /api/events` com payload incompleto: `400`
  - mensagem:
    - `Informe nome, data, horário, local e capacidade válida.`
- fluxo valido:
  - `POST /api/events`: `201`
  - `POST /api/events/[eventId]/participants`: `201`
  - `PATCH /api/events/[eventId]/participants` com `status = going`: `200`
  - `PATCH /api/events/[eventId]/participants` com `registrationsOpen = false`: `200`
  - `DELETE /api/events/[eventId]/participants`: `200`
- smoke real de UI:
  - dashboard admin:
    - `output/playwright/events-contracts-dashboard-smoke.png`
  - app do professor:
    - `output/playwright/events-contracts-teacher-smoke.png`
  - artefato consolidado:
    - `/tmp/dojo_events_contracts_validation.json`
- observacao:
  - o `400` capturado no smoke foi esperado e proposital, do teste de contrato invalido; nao foi regressao do produto.

### Cleanup

- o evento temporario `Evento QA Contracts 1774016422124` foi removido apos a validacao.
- verificacao posterior:
  - `qaContractsEvents = 0`

### Resultado

- o modulo `events` agora ja possui contracts administrativos explicitos.
- os handlers deixaram de concentrar parsing semantico de create, add participant e patch de participant/registrations.
- a proxima rodada de `events` pode focar mais em regra funcional e UX do modulo, e menos em higiene estrutural do transporte HTTP.

## Etapa 11 - Student Events

### Objetivo

Levar `events` para o app do aluno usando a referencia visual de `reference-ui/templates-site-ui /LAYOUT-UI`, sem copiar a arquitetura daquela base e mantendo a separacao oficial `app/api -> apps/api/src/modules -> modules/app/student`.

### O Que Foi Feito

- o menu inferior do app do aluno trocou `Planos` por `Eventos`, e `Planos` permaneceu acessivel pelo menu lateral em [`modules/app/ui/student-app-shell.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/ui/student-app-shell.tsx).
- a tela real do aluno entrou em [`modules/app/student/student-events-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/student/student-events-screen.tsx) e a rota em [`app/app/student/events/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/app/student/events/page.tsx).
- o app passou a consumir eventos por BFF proprio:
  - [`app/api/app/student/events/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/app/student/events/route.ts)
  - [`app/api/app/student/events/[eventId]/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/app/student/events/%5BeventId%5D/route.ts)
  - [`apps/api/src/modules/app/services/student-app-events.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/services/student-app-events.service.ts)
- o contrato do aluno ganhou `StudentAppEventsData` e `StudentAppEventItem` em [`student-app.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/domain/student-app.ts).
- a autoinscricao do aluno passou a usar contract proprio em:
  - [`enroll-student-event.input.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/events/contracts/enroll-student-event.input.ts)
  - [`enroll-student-event.parser.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/events/contracts/enroll-student-event.parser.ts)

### Inconsistencias Encontradas

- a primeira versao do BFF do aluno simplificava demais o estado do evento e podia tratar `cancelled` como passado automaticamente.
- a primeira versao tambem descartava `notes`, o que deixava a tela de detalhes empobrecida e mais distante da referencia visual.
- durante o smoke inicial, o teste falhou porque o proprio cenario temporario ja tinha sido inscrito por uma execucao interrompida; o problema era dado sujo de validacao, nao bug do produto.

### Correcoes Aplicadas

- `StudentAppEventItem` passou a carregar `sourceStatus` e `description`, preservando o estado real do dominio.
- o backend do aluno passou a classificar evento passado por `date + status completed`, sem empurrar `cancelled` futuro para historico por engano.
- a tela deixou de oferecer `Cancelar inscricao` para evento ja cancelado; nesse caso, mostra apenas `Ver detalhes`.
- o fluxo de validacao foi refeito com cleanup explicito antes do smoke final.

### Revalidacao Real

- API real com cenario limpo:
  - admin criou `Evento QA Student App 1774018061`;
  - aluno leu o evento em `GET /api/app/student/events`;
  - aluno se inscreveu em `POST /api/app/student/events`;
  - a taxa apareceu em `GET /api/app/student/payments`;
  - aluno cancelou em `DELETE /api/app/student/events/[eventId]`;
  - a cobranca pendente sumiu da area financeira depois do cancelamento.
- smoke real de UI com cenario limpo:
  - evento temporario `Evento QA Student App UI 1774018640`;
  - detalhe aberto com observacao `Trazer kimono, chinelo e documento.`;
  - inscricao concluida;
  - reflexo em `Pagamentos`;
  - cancelamento concluido;
  - sem `console error`, sem `pageerror`, sem `4xx/5xx` inesperado.

### Artefatos

- [`student-events-smoke.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/student-events-smoke.png)
- [`student-events-probe.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/student-events-probe.png)
- `/tmp/dojo_student_events_validation.json`
- `/tmp/dojo_student_events_smoke_setup.json`

### Cleanup

- todos os eventos temporarios `Evento QA Student App %` foram removidos por SQL local apos a validacao.
- as respectivas `FinanceCharge` e `EventParticipant` temporarias tambem foram removidas.
- verificacao posterior via API administrativa:
  - `qaStudentEvents = 0`

### Resultado

- `student/events` deixou de ser `planned` e passou a existir como experiencia real do app do aluno.
- o aluno agora consegue:
  - ver eventos elegiveis da propria modalidade;
  - abrir detalhes;
  - se inscrever;
  - cancelar inscricao;
  - e ver a taxa refletida na propria area financeira quando houver cobranca.

## Etapa 12 - Teacher Events Manage Participants

### Objetivo

Permitir que o professor responsavel pelo evento adicione participante pelo proprio app, sem recriar regra de negocio de `events` no frontend e mantendo a cobranca automatica para evento pago.

### O Que Foi Feito

- a permissao `Gerenciar eventos` entrou no modelo atual de permissoes do professor em:
  - [`teacher-permissions.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/teachers/domain/teacher-permissions.ts)
  - [`teacher-dashboard.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/teachers/domain/teacher-dashboard.ts)
  - [`teacher-dashboard.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/teachers/services/teacher-dashboard.service.ts)
  - [`teachers-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/teachers/components/teachers-dashboard-screen.tsx)
- o BFF do app do professor passou a expor:
  - [`route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/app/teacher/events/route.ts)
  - [`route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/app/teacher/events/%5BeventId%5D/participants/route.ts)
- o backend do app do professor passou a:
  - retornar `manageEvents`
  - retornar `availableParticipants`
  - permitir `addParticipant` somente quando o professor for responsavel pelo evento
  - arquivos:
    - [`teacher-app.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/domain/teacher-app.ts)
    - [`teacher-app-events.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/services/teacher-app-events.service.ts)
- a tela do app do professor ganhou modal de `Adicionar participante`, inspirado no fluxo do admin, em [`teacher-events-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/components/teacher/teacher-events-screen.tsx)

### Inconsistencias Encontradas

- o primeiro patch do endpoint do professor quebrou porque `sortOrder` e `roleTitle` foram lidos como `include` no Prisma, quando sao campos escalares.
- o primeiro smoke de UI do professor revelou uma incoerencia real de usabilidade:
  - como havia alunos homonimos (`Aluno Autocadastro`), o modal podia levar o professor a adicionar a pessoa errada.

### Correcoes Aplicadas

- o acesso ao `TeacherProfile` foi corrigido para `select`, fechando o bug do endpoint.
- o contrato de `availableParticipants` passou a expor `email`, e as telas do admin e do professor passaram a mostrar e buscar tambem por e-mail, removendo a ambiguidade pratica na escolha do participante.

### Revalidacao Real

- API real com cenario limpo:
  - admin criou `Evento QA Teacher App 1774020647` vinculado ao professor;
  - professor leu o proprio evento em `GET /api/app/teacher/events`;
  - professor adicionou participante em `POST /api/app/teacher/events/[eventId]/participants`;
  - o aluno correto recebeu cobranca em `GET /api/app/student/payments` com descricao do evento.
- smoke real de UI com cenario limpo e busca por e-mail:
  - evento temporario `Evento QA Teacher App UI 1774020986`;
  - professor abriu o modal `Adicionar participante`;
  - buscou `student.self.1773891187@example.com`;
  - adicionou com sucesso;
  - sem `console error`, sem `pageerror`, sem `4xx/5xx` inesperado.

### Artefatos

- [`teacher-events-manage-smoke.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/teacher-events-manage-smoke.png)
- `/tmp/dojo_teacher_app_events_validation.json`
- `/tmp/dojo_teacher_app_events_ui_setup.json`
- `/tmp/dojo_teacher_events_manage_smoke.json`

### Cleanup

- todos os eventos temporarios `Evento QA Teacher App %` foram removidos por SQL local apos a validacao.
- as respectivas `FinanceCharge` e `EventParticipant` temporarias tambem foram removidas.
- verificacao posterior via API administrativa:
  - `qaTeacherEvents = 0`

### Resultado

- o professor agora consegue adicionar participante no proprio evento pelo app, quando for responsavel e `manageEvents` estiver ativo.
- se o evento for pago e o participante for aluno, a cobranca continua sendo gerada no backend de `events` e refletida na area financeira do aluno.

## Etapa 13 - Correcao De Superficie E Selecao De Contexto No Host Da Plataforma

### Objetivo

Impedir que `teacher` e `student` entrem no dashboard da academia pelo host da plataforma e criar uma escolha de contexto segura para contas com multiplos vinculos.

### Inconsistencia Encontrada

- o guard de superficie ainda permitia `teacher` e `student` em `dashboard`;
- no host da plataforma, `dashboard` e `app` podiam ser acessados sem um contexto real de tenant;
- isso abria a brecha observada na pratica: professor conseguia ver menus do painel da academia em `localhost:3000`.

### Correcoes Aplicadas

- `dashboard` passou a aceitar apenas `academy_admin` em [`surface-access.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/lib/surface-access.ts).
- o `SurfaceGuard` passou a exigir:
  - contexto administrativo real para `/dashboard/*`;
  - host de tenant + membership ativa para `/app/*`;
  - arquivos:
    - [`surface-guard.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/components/guards/surface-guard.tsx)
- o host da plataforma ganhou a tela de escolha de contexto em:
  - [`page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/access/page.tsx)
  - [`platform-access-selector.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/components/auth/platform-access-selector.tsx)
- o login da plataforma deixou de promover automaticamente `teacher`/`student` para o painel ou app direto e passou a enviar para `/access` em:
  - [`login-page-client.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/components/auth/login-page-client.tsx)
- a home do host da plataforma tambem passou a respeitar a mesma regra em:
  - [`page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/page.tsx)

### Regra De Funcionamento Consolidada

- `platform_admin` entra em `/platform`;
- `academy_admin` pode abrir o dashboard da academia pelo host da plataforma, mas primeiro escolhe o contexto em `/access` quando nao ha um tenant administrativo ja implicito;
- `teacher` e `student` nunca devem ver menus administrativos da academia no host da plataforma;
- `teacher` e `student` escolhem a academia em `/access` e sao redirecionados para o host correto do tenant;
- a tela `/access` tambem oferece `Criar academia`, porque a mesma conta pode futuramente virar dona/admin de academia.

### Revalidacao Tecnica

- `tsc --noEmit` executado apos a mudanca;
- smoke real no host da plataforma:
  - `teacher` faz login em `localhost:3000` e cai em `/access`;
  - `student` faz login em `localhost:3000` e cai em `/access`;
  - ambos, ao tentarem abrir `/dashboard`, voltam para `/access` sem `console error` residual;
  - `academy_admin` faz login em `localhost:3000`, escolhe `Abrir painel` e entra em `/dashboard`;
  - o texto `Financeiro` continua presente no menu do admin apos hidratacao do dashboard.
- a doc-v2 passou a registrar explicitamente:
  - que `/dashboard/*` e apenas `academy_admin`;
  - que `/app/*` depende de host de tenant;
  - que `/access` e a porta de entrada contextual no host da plataforma.

### Artefatos

- [`platform-access-teacher-smoke.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/platform-access-teacher-smoke.png)
- [`platform-access-admin-smoke.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/platform-access-admin-smoke.png)
- [`platform-access-admin-final.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/platform-access-admin-final.png)
- `/tmp/dojo_platform_access_smoke.json`
- `/tmp/dojo_platform_surface_redirects.json`
- `/tmp/dojo_platform_access_final_validation.json`

### Resultado

- a brecha de superficie foi fechada conceitualmente e no codigo;
- o produto agora separa melhor:
  - host da plataforma;
  - dashboard da academia;
  - app do professor/aluno;
- a proxima IA nao deve reabrir o comportamento antigo de promover `teacher`/`student` ao painel admin.

## Etapa 14 - Graduations Contracts E Correcao De Status/Horario

### Objetivo

Fechar uma rodada tecnica segura em `graduations`, validando o fluxo real de exames e removendo duas incoerencias claras de contrato:

- `in_progress` sendo exposto como `draft`;
- horario de exame retornando deslocado no dashboard e no app do professor.

### Inconsistencias Encontradas

- o handler administrativo de `PATCH /api/graduations/exams/[examId]` aceitava `status = in_progress`, mas o backend expunha `draft` no payload de saida.
- a UI de `modules/graduations` ainda estava acoplada ao status legado `draft`.
- ao criar exame com `time = 09:00`, o dashboard retornava `12:00` por serializacao baseada em `toISOString()`, causando drift de horario no contrato.
- os handlers administrativos de `graduations` ainda concentravam parse semantico em vez de delegar para contracts do modulo.

### Correcoes Aplicadas

- o parsing administrativo de `graduations` saiu dos handlers e foi movido para contracts do modulo em:
  - [`create-graduation-exam.input.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/graduations/contracts/create-graduation-exam.input.ts)
  - [`create-graduation-exam.parser.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/graduations/contracts/create-graduation-exam.parser.ts)
  - [`replace-graduation-tracks.input.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/graduations/contracts/replace-graduation-tracks.input.ts)
  - [`replace-graduation-tracks.parser.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/graduations/contracts/replace-graduation-tracks.parser.ts)
  - [`update-graduation-exam-status.input.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/graduations/contracts/update-graduation-exam-status.input.ts)
  - [`update-graduation-exam-status.parser.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/graduations/contracts/update-graduation-exam-status.parser.ts)
  - [`add-graduation-exam-candidate.input.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/graduations/contracts/add-graduation-exam-candidate.input.ts)
  - [`add-graduation-exam-candidate.parser.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/graduations/contracts/add-graduation-exam-candidate.parser.ts)
  - [`update-graduation-eligibility-override.input.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/graduations/contracts/update-graduation-eligibility-override.input.ts)
  - [`update-graduation-eligibility-override.parser.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/graduations/contracts/update-graduation-eligibility-override.parser.ts)
- os handlers ficaram mais finos em:
  - [`app/api/graduations/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/graduations/route.ts)
  - [`app/api/graduations/exams/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/graduations/exams/route.ts)
  - [`app/api/graduations/exams/[examId]/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/graduations/exams/%5BexamId%5D/route.ts)
  - [`app/api/graduations/exams/[examId]/candidates/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/graduations/exams/%5BexamId%5D/candidates/route.ts)
  - [`app/api/graduations/eligible/[studentModalityId]/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/graduations/eligible/%5BstudentModalityId%5D/route.ts)
- o contrato exposto do modulo deixou de vazar `draft` e passou a expor `in_progress` em:
  - [`graduation-dashboard.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/graduations/domain/graduation-dashboard.ts)
  - [`teacher-app.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/domain/teacher-app.ts)
- o service passou a:
  - mapear `GraduationExamStatus.DRAFT` para `in_progress` na fronteira de saida;
  - serializar `date` e `time` por partes locais, em vez de cortar `toISOString()`;
  - arquivos:
    - [`graduation-dashboard.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/graduations/services/graduation-dashboard.service.ts)
- a tela admin de graduacoes deixou de depender do status legado `draft` em:
  - [`graduations-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/graduations/components/graduations-dashboard-screen.tsx)

### Revalidacao Real

- tenant validado:
  - `academia-validacao-1773885421600`
- autenticacao real confirmada para:
  - `admin.onboarding.1773885421600@example.com`
  - `teacher.signup.1773885818191@example.com`
  - `attendance.present.1773891827@example.com`
- sonda de regressao do bug:
  - exame QA criado com `title = Exame QA Grad 1774025164`
  - `POST /api/graduations/exams`: `201`
  - `PATCH /api/graduations/exams/[examId]` com `status = in_progress`: `200`
  - depois do patch, o dashboard passou a retornar:
    - `status = in_progress`
    - `time = 09:00`
  - o app do professor em `GET /api/app/teacher/evolution` passou a retornar o mesmo:
    - `status = in_progress`
    - `time = 09:00`
- fluxo funcional completo com cenario limpo:
  - `POST /api/graduations/exams/[examId]/candidates`: `201`
  - candidato `Aluno Present` entrou com:
    - `attendanceRate = 100`
    - `toBelt = Azul`
  - `PATCH /api/graduations/exams/[examId]` com `status = completed`: `200`
  - `GET /api/app/student/progress` do proprio aluno passou a refletir:
    - `belt = Azul`
    - `graduationHistory` com avaliador `Professor Autocadastro`
  - `GET /api/app/teacher/evolution` passou a refletir:
    - `promotions = 1`
    - exame `completed`
    - historico com a promocao do aluno
- validacao tecnica:
  - `tsc --noEmit`: passou

### Smoke Real De UI

- dashboard admin:
  - `http://localhost:3000/dashboard/graduations`
- app do professor:
  - `http://academia-validacao-1773885421600.localhost:3000/app/teacher/evolution`
- app do aluno:
  - `http://academia-validacao-1773885421600.localhost:3000/app/student/progress`
- resultado:
  - `consoleMessages = []` com erro ou warning em todas as tres superficies
  - `network` apenas com `200` nas rotas relevantes:
    - `/api/graduations`
    - `/api/app/teacher/evolution`
    - `/api/app/student/progress`
  - o dashboard admin abriu com `Graduação`, metricas e CTA `Agendar exame`
  - o app do professor abriu `Evolução` com lista de elegiveis e `Aluno Present` ainda marcado como elegivel apos o cleanup
  - o app do aluno abriu `Evolução` com `Jiu-Jitsu Adulto`, `Branca • 0 grau(s)` e `Frequência atual: 100%` apos o cleanup

### Artefatos

- [`graduations-dashboard-smoke.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/graduations-dashboard-smoke.png)
- [`graduations-teacher-evolution-smoke.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/graduations-teacher-evolution-smoke.png)
- [`graduations-student-progress-smoke.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/graduations-student-progress-smoke.png)

### Cleanup

- o exame temporario `Exame QA Grad 1774025164` foi removido por SQL local.
- o `StudentGraduation` temporario `cmmz569vf000j21u85l40no66` foi removido por SQL local.
- o `StudentModality` do aluno de validacao voltou para:
  - `belt = Branca`
  - `stripes = 0`
  - `graduationEligibleOverride = null`
- verificacao posterior:
  - `examCount = 0`
  - `graduationCount = 0`
  - `GET /api/app/student/progress` voltou a mostrar historico vazio
  - `GET /api/graduations` voltou a mostrar `examCount = 0`

### Resultado

- `graduations` ficou mais alinhado ao padrao do projeto:
  - contracts administrativos explicitos;
  - handlers mais finos;
  - contrato coerente entre dashboard e app do professor;
  - horario de exame sem drift no payload de saida.
- a rodada nao mudou regra de negocio de graduacao; corrigiu transporte/serializacao e validou o fluxo real ponta a ponta.

## Etapa 15 - Graduations Enum Interno Coerente Com `in_progress`

### Objetivo

Eliminar a incoerencia remanescente do modulo `graduations`, onde o contrato externo ja usava `in_progress`, mas a persistencia ainda mantinha `DRAFT`.

### Inconsistencia Encontrada

- depois da Etapa 14, o comportamento ja estava correto para usuario e API;
- mas internamente o enum `GraduationExamStatus` do banco e do Prisma ainda persistia `DRAFT`;
- isso deixava o modulo tecnicamente incoerente, mesmo com o payload ja corrigido.

### Correcoes Aplicadas

- o enum do schema foi alinhado de `DRAFT` para `IN_PROGRESS` em:
  - [`schema.prisma`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/prisma/schema.prisma)
- a migration de rename do valor do enum foi criada em:
  - [`migration.sql`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/prisma/migrations/20260320172000_graduations_exam_status_in_progress/migration.sql)
- o service deixou de depender do mapeamento legado `DRAFT -> in_progress` e passou a usar diretamente:
  - `GraduationExamStatus.IN_PROGRESS`
  - arquivo:
    - [`graduation-dashboard.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/graduations/services/graduation-dashboard.service.ts)
- o Prisma client foi regenerado apos a alteracao.

### Revalidacao Real

- migration aplicada com:
  - `npx prisma migrate deploy`
- validacao real no tenant:
  - `academia-validacao-1773885421600`
- exame temporario criado:
  - `Exame QA Enum 1774027738`
- fluxo validado:
  - `POST /api/graduations/exams`: `201`
  - `PATCH /api/graduations/exams/[examId]` com `status = in_progress`: `200`
  - `GET /api/graduations` retornou:
    - `status = in_progress`
  - `GET /api/app/teacher/evolution` retornou para o mesmo exame:
    - `status = in_progress`
  - verificacao direta no banco para o mesmo `examId` retornou:
    - `status = IN_PROGRESS`
- validacao tecnica:
  - `npm run prisma:generate`: passou
  - `tsc --noEmit`: passou

### Cleanup

- o exame temporario `Exame QA Enum 1774027738` foi removido por SQL local apos a validacao.
- verificacao posterior:
  - `count = 0` no banco para o `examId` temporario
  - `GET /api/graduations` nao retornou mais o exame QA

### Resultado

- `graduations` ficou coerente ponta a ponta:
  - contrato externo: `in_progress`
  - service: `IN_PROGRESS`
  - banco: `IN_PROGRESS`
- nao ha mais motivo tecnico para o modulo falar `draft` no fluxo de exame em andamento.

## Etapa 16 - Teacher App Graduations Com `Apto Para Graduar` E Selecao De Exame

### Objetivo

Eliminar o drift funcional entre o app do professor e o dashboard da academia em `graduations`:

- o professor via botoes de acao, mas eles nao executavam nada;
- a nomenclatura `Promover` nao convergia com `Alunos Aptos` do painel da academia;
- o professor precisava conseguir:
  - marcar um aluno como apto para graduar;
  - escolher um dos exames agendados da academia para incluir o aluno.

### Inconsistencias Encontradas

- bug tecnico/UX real no app do professor:
  - `Agendar exame` e `Promover` eram placeholders sem `onClick`;
  - nao havia mutacao BFF em `/api/app/teacher/evolution` para operar graduacoes;
  - o professor so conseguia ler a evolucao, nao agir sobre ela.
- drift de nomenclatura:
  - o app dizia `Promover`;
  - o dashboard admin usa a linguagem de aptidao, especialmente em `Alunos Aptos`.
- detalhe de contrato visual:
  - o app do professor ainda mapeava `in_progress` como fallback incorreto de status no label do exame.

### Correcoes Aplicadas

- o contrato do app do professor foi expandido em:
  - [`teacher-app.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/domain/teacher-app.ts)
  - agora `TeacherAppEvolutionData` expõe:
    - `permissions.manageGraduations`
    - `manualEligibleOverride` por aluno
- o BFF do professor ganhou duas mutacoes novas:
  - [`app/api/app/teacher/evolution/eligible/[studentModalityId]/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/app/teacher/evolution/eligible/%5BstudentModalityId%5D/route.ts)
  - [`app/api/app/teacher/evolution/exams/[examId]/candidates/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/app/teacher/evolution/exams/%5BexamId%5D/candidates/route.ts)
- o input de inclusao em exame no app do professor foi formalizado em:
  - [`add-teacher-app-graduation-candidate.input.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/contracts/add-teacher-app-graduation-candidate.input.ts)
  - [`add-teacher-app-graduation-candidate.parser.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/contracts/add-teacher-app-graduation-candidate.parser.ts)
- o service do app do professor passou a:
  - resolver permissao real de `manageGraduations`;
  - marcar aptidao via `graduationEligibleOverride = true` no modulo canonico de `graduations`;
  - permitir inclusao apenas em exames `scheduled` visiveis ao professor;
  - arquivo:
    - [`teacher-app-evolution.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/services/teacher-app-evolution.service.ts)
- o client do frontend do app do professor foi expandido em:
  - [`teacher-app.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/services/teacher-app.ts)
- a tela do professor foi alinhada em:
  - [`teacher-evolution-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/components/teacher/teacher-evolution-screen.tsx)
  - [`page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/app/teacher/evolution/page.tsx)
  - mudancas principais:
    - `Promover` virou `Apto para graduar`;
    - `Apto confirmado` aparece quando existe override manual;
    - `Agendar exame` abre modal com os exames agendados;
    - quando existem varios exames, o professor escolhe explicitamente qual usar;
    - `in_progress` passou a aparecer como `Em andamento`.

### Revalidacao Real

- tenant validado:
  - `academia-validacao-1773885421600`
- atores reais usados:
  - `academy_admin`: `admin.onboarding.1773885421600@example.com`
  - `teacher`: `teacher.signup.1773885818191@example.com`
- como o tenant nao possuia nenhum professor com `manageGraduations = true`, a validacao elevou temporariamente o professor de teste para `head_instructor` por API admin e restaurou o papel original no cleanup.
- cenario limpo criado para a rodada:
  - exame `Exame Professor Modal 1774039824 A`
  - exame `Exame Professor Modal 1774039824 B`
- API validada:
  - `POST /api/graduations/exams`: `201` para os dois exames temporarios
  - `GET /api/app/teacher/evolution` apos elevacao temporaria do papel:
    - `permissions.manageGraduations = true`
    - `scheduledExams = 2`
  - `POST /api/app/teacher/evolution/eligible/cmmwufl9u0092wlu8pzsz3nwi`: `200`
    - resposta do professor passou a refletir:
      - `message = "Aluno marcado como apto para graduar."`
      - `manualEligibleOverride = true`
      - `eligibleStudents = 2`
  - `GET /api/graduations` apos a mutacao:
    - `Aluno Admin 1773886854630`
    - `manualEligibleOverride = true`
    - `eligible = true`
  - `POST /api/app/teacher/evolution/exams/cmmz7shz0000aecu81lajbtgw/candidates`: `200`
    - resposta do professor passou a refletir:
      - exame `B` com `candidateCount = 1`
  - `GET /api/graduations` apos a inclusao no exame:
    - exame `B` com `candidateCount = 1`
    - candidato `Aluno Admin 1773886854630`
    - `toBelt = Azul`
- validacao tecnica:
  - `tsc --noEmit`: passou

### Smoke Real De UI

- app do professor validado em:
  - `http://academia-validacao-1773885421600.localhost:3000/app/teacher/evolution`
- dashboard da academia validado em:
  - `http://localhost:3000/dashboard/graduations`
- validacoes observadas na UI:
  - o app do professor exibiu o CTA `Apto para graduar`
  - o modal `Incluir em exame agendado` abriu com os dois exames temporarios visiveis
  - o dashboard admin exibiu os exames temporarios na aba `Exames`
  - o dashboard admin exibiu `Aluno Admin 1773886854630` em `Alunos Aptos`
  - `consoleMessages = []` com erro ou warning nas duas superficies

### Artefatos

- [`teacher-evolution-apto-smoke.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/teacher-evolution-apto-smoke.png)
- [`teacher-evolution-exam-modal-smoke.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/teacher-evolution-exam-modal-smoke.png)
- [`graduations-admin-exams-smoke.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/graduations-admin-exams-smoke.png)
- [`graduations-admin-eligible-smoke.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/graduations-admin-eligible-smoke.png)
- `/tmp/graduations-teacher-admin-ui-validation.json`

### Cleanup

- os exames temporarios:
  - `Exame Professor Modal 1774039824 A`
  - `Exame Professor Modal 1774039824 B`
  - foram removidos por cleanup local no banco
- o `graduationEligibleOverride` do aluno `cmmwufl9u0092wlu8pzsz3nwi` voltou para `null`
- o professor `cmmwttdsh0079wlu80qwt2rno` voltou para `role = instructor`
- verificacao posterior:
  - `GET /api/graduations` voltou a mostrar:
    - `scheduledExams = 0`
    - `manualEligibleOverride = null` para o aluno validado
  - `GET /api/app/teacher/evolution` voltou a mostrar:
    - `permissions.manageGraduations = false`
    - `scheduledExams = 0`

### Resultado

- o app do professor deixou de ser apenas leitura em `graduations`;
- a linguagem do produto ficou coerente entre professor e academia:
  - app do professor: `Apto para graduar`
  - dashboard da academia: `Alunos Aptos`
- a regra continua canonica no modulo `graduations`:
  - o frontend do professor nao calcula aptidao;
  - ele apenas aciona o dominio via BFF proprio;
  - o reflexo na academia acontece pelo mesmo estado canonico de `graduationEligibleOverride` e `GraduationExamCandidate`.

## Etapa 17 - Graduations Com Autoria De Quem Tornou O Aluno Apto

### Objetivo

Eliminar a perda de rastreabilidade no fluxo de aptidao de `graduations`:

- o modulo refletia que o aluno estava apto;
- mas a academia nao conseguia ver quem marcou essa aptidao;
- a tab `Alunos Aptos` precisava exibir os atores reais que tornaram o aluno apto.

### Inconsistencias Encontradas

- gap tecnico real de auditoria no dominio:
  - `graduationEligibleOverride` existia como estado canonico;
  - mas nao havia persistencia de autoria por ator;
  - por isso a academia nao conseguia distinguir se a aptidao veio de professor, admin ou ambos.
- classificacao:
  - nao era regra de negocio nova;
  - era falta de rastreabilidade de um fluxo ja existente.

### Correcoes Aplicadas

- a persistencia ganhou uma trilha de auditoria propria em:
  - [`schema.prisma`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/prisma/schema.prisma)
  - [`migration.sql`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/prisma/migrations/20260320193000_graduations_eligibility_override_audit/migration.sql)
  - novo modelo:
    - `GraduationEligibilityOverrideAudit`
- o dominio administrativo passou a expor a autoria em:
  - [`graduation-dashboard.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/graduations/domain/graduation-dashboard.ts)
  - novo campo por aluno:
    - `manualEligibleOverrideActors`
- o service canonico de `graduations` passou a:
  - persistir o ator ao marcar `eligibleOverride = true`;
  - consolidar a lista deduplicada de atores para o dashboard admin;
  - arquivo:
    - [`graduation-dashboard.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/graduations/services/graduation-dashboard.service.ts)
- as mutacoes que marcam aptidao agora repassam o ator real:
  - admin:
    - [`app/api/graduations/eligible/[studentModalityId]/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/graduations/eligible/%5BstudentModalityId%5D/route.ts)
  - professor:
    - [`teacher-app-evolution.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/services/teacher-app-evolution.service.ts)
- a UI administrativa ganhou a coluna:
  - `Quem tornou apto`
  - arquivo:
    - [`graduations-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/graduations/components/graduations-dashboard-screen.tsx)

### Revalidacao Real

- tenant validado:
  - `academia-validacao-1773885421600`
- atores reais usados:
  - `academy_admin`: `admin.onboarding.1773885421600@example.com`
  - `teacher`: `teacher.signup.1773885818191@example.com`
- cenario limpo inicial:
  - exclusao de auditorias de aptidao para `studentModalityId = cmmwufl9u0092wlu8pzsz3nwi`
  - `graduationEligibleOverride = null` para o mesmo aluno/modalidade
- API validada:
  - `POST /api/app/teacher/evolution/eligible/cmmwufl9u0092wlu8pzsz3nwi`: `200`
    - passou a registrar o ator professor
  - `PATCH /api/graduations/eligible/cmmwufl9u0092wlu8pzsz3nwi` com `eligibleOverride = true`: `200`
    - passou a registrar o ator admin
  - `GET /api/graduations` apos as mutacoes:
    - `manualEligibleOverride = true`
    - `manualEligibleOverrideActors = [Professor Autocadastro, Admin Onboarding Real (Admin Academia)]`
- validacao tecnica:
  - `npm run prisma:generate`: passou
  - `tsc --noEmit`: passou
  - `prisma migrate deploy`: migration aplicada com sucesso

### Smoke Real De UI

- dashboard da academia validado em:
  - `http://academia-validacao-1773885421600.localhost:3000/dashboard/graduations`
- validacoes observadas na UI:
  - a aba `Alunos Aptos` exibiu a coluna `Quem tornou apto`
  - o aluno `Aluno Admin 1773886854630` apareceu com:
    - `Professor Autocadastro, Admin Onboarding Real (Admin Academia)`
  - `consoleErrors = []`

### Artefatos

- [`graduations-admin-eligible-actors-smoke.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/graduations-admin-eligible-actors-smoke.png)

### Cleanup

- auditorias de aptidao removidas para `studentModalityId = cmmwufl9u0092wlu8pzsz3nwi`
- `graduationEligibleOverride` do aluno validado voltou para `null`
- o professor `cmmwttdsh0079wlu80qwt2rno` voltou para `roleTitle = Instrutor`
- verificacao posterior:
  - `GET /api/graduations` voltou a mostrar:
    - `manualEligibleOverride = null`
    - `manualEligibleOverrideActors = []`
  - `GET /api/app/teacher/evolution` voltou a mostrar:
    - `permissions.manageGraduations = false`
    - `manualEligibleOverride = null` para o aluno validado

### Resultado

- a academia passou a enxergar quem marcou o aluno como apto;
- o dominio ficou rastreavel sem empurrar estado para o frontend;
- a tab `Alunos Aptos` agora converge com o fluxo real operado por professor e admin.

## Etapa 18 - Events Sem `draft` E Com Fluxo Canonico De Confirmacao

### Objetivo

Eliminar a semantica incoerente restante do modulo `events` e fechar o fluxo real entre academia, professor e aluno:

- remover `draft/rascunho` do banco, contratos e UI;
- convergir status do evento para `scheduled`, `cancelled` e `completed`;
- convergir status do participante para `invited`, `confirmed`, `maybe`, `declined` e `payment_pending`;
- permitir edicao/exclusao/cancelamento/realizacao no admin;
- refletir o status alterado no app do professor;
- expor o fluxo pago como `Pagar para confirmar` para academia e aluno.

### Inconsistencias Encontradas

- gap tecnico e semantico real no dominio:
  - o banco ainda aceitava `DRAFT` para evento;
  - participantes ainda trabalhavam com `GOING`, `PENDING` e `NOT_GOING`;
  - o evento pago gerava cobranca, mas nao possuia estado canonico de confirmacao por pagamento.
- gaps reais de UX e operacao:
  - admin nao possuia rota e acao reais para editar/excluir/cancelar evento;
  - app do professor listava eventos, mas nao refletia o ciclo novo completo de status/participacao;
  - o app do aluno ainda simplificava demais os estados de inscricao.
- classificacao:
  - houve uma mistura de refactor tecnico e regra de negocio;
  - a regra de negocio foi confirmada explicitamente antes da implementacao.

### Correcoes Aplicadas

- o schema e a persistencia foram alinhados em:
  - [`schema.prisma`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/prisma/schema.prisma)
  - [`migration.sql`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/prisma/migrations/20260320213000_events_status_confirmation_refactor/migration.sql)
- os enums canonicos passaram a ser:
  - evento:
    - `SCHEDULED`
    - `COMPLETED`
    - `CANCELLED`
  - participante:
    - `INVITED`
    - `CONFIRMED`
    - `MAYBE`
    - `DECLINED`
    - `PAYMENT_PENDING`
- o dominio do modulo foi consolidado em:
  - [`event-dashboard.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/events/domain/event-dashboard.ts)
  - [`event-dashboard.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/events/services/event-dashboard.service.ts)
- o admin ganhou mutacao canonica de evento em:
  - [`app/api/events/[eventId]/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/events/%5BeventId%5D/route.ts)
  - agora o dashboard consegue:
    - editar;
    - excluir apenas sem participantes;
    - cancelar com participantes;
    - marcar realizado.
- o contrato administrativo de participante foi expandido em:
  - [`update-event-participant.input.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/events/contracts/update-event-participant.input.ts)
  - [`update-event-participant.parser.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/events/contracts/update-event-participant.parser.ts)
  - passando a aceitar:
    - troca de resposta do participante;
    - confirmacao manual de pagamento;
    - abertura/fechamento de inscricoes.
- a UI admin foi reescrita em:
  - [`events-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/events/components/events-dashboard-screen.tsx)
  - e passou a refletir:
    - `Agendado`, `Realizado`, `Cancelado`;
    - `Convidado`, `Confirmado`, `Talvez`, `Nao vai`, `Pagamento pendente`;
    - dialogo de criar/editar;
    - CTA real de excluir/cancelar/realizar;
    - confirmacao manual de pagamento.
- o app do professor foi alinhado em:
  - [`teacher-app.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/domain/teacher-app.ts)
  - [`teacher-app-events.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/services/teacher-app-events.service.ts)
  - [`teacher-events-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/components/teacher/teacher-events-screen.tsx)
  - o professor agora reflete o mesmo contrato de evento/participante do modulo.
- o app do aluno foi alinhado em:
  - [`student-app.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/domain/student-app.ts)
  - [`student-app-events.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/services/student-app-events.service.ts)
  - [`app/api/app/student/events/[eventId]/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/app/student/events/%5BeventId%5D/route.ts)
  - [`student-events-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/student/student-events-screen.tsx)
  - o aluno agora:
    - ve `Pagar para confirmar`;
    - responde convite;
    - alterna entre `confirmed`, `maybe` e `declined` sem logica local de dominio.
- arquivo legado de tipos tambem foi alinhado para nao reintroduzir semantica antiga em:
  - [`modules/events/types.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/events/types.ts)

### Revalidacao Real

- tenant validado:
  - `academia-validacao-1773885421600`
- atores reais usados:
  - `academy_admin`: `admin.onboarding.1773885421600@example.com`
  - `teacher`: `teacher.signup.1773885818191@example.com`
  - `student`: `student.self.1773886854630@example.com`
- cenario limpo temporario criado:
  - `Evento QA Events Teacher Unpaid 1774047677568`
  - `Evento QA Events Teacher Paid 1774047677568`
  - `Evento QA Events Student Unpaid 1774047677568`
  - `Evento QA Events Student Paid 1774047677568`
- validacao tecnica:
  - `npm run prisma:generate`: passou
  - `tsc --noEmit`: passou
  - `prisma migrate deploy`: migration aplicada com sucesso
  - houve falha inicial da migration por uso de subquery em `ALTER ... USING`;
  - a migration foi reescrita em etapas seguras com coluna temporaria e reaplicada.
- API real validada:
  - `PATCH /api/events/[eventId]`: `200`
    - evento temporario de edicao refletiu nome/horario/local atualizados
  - `DELETE /api/events/[eventId]`: `200`
    - exclusao permitida apenas para evento sem participantes
  - `POST /api/app/teacher/events/[eventId]/participants`: `200`
    - professor adicionou o aluno ao proprio evento
    - participante ficou `invited`
  - `POST /api/events/[eventId]/participants`: `201`
    - academia adicionou o mesmo aluno em evento pago
    - participante ficou `payment_pending`
    - `paymentStatus = pending`
  - `PATCH /api/events/[eventId]/participants` com `paymentMethod = PIX`: `200`
    - participante passou para `confirmed`
    - `paymentStatus = paid`
  - `PATCH /api/events/[eventId]` com `status = cancelled`: `200`
    - evento cancelado seguiu visivel para o professor com `status = cancelled`
  - `PATCH /api/events/[eventId]` com `status = completed`: `200`
    - evento realizado saiu do ativo admin e passou para `pastEvents`
    - o professor tambem passou a ve-lo no historico
  - `GET /api/app/student/events`: `200`
    - convite do evento cancelado apareceu para o aluno como `invited`
  - `POST /api/app/student/events`: `200`
    - autoinscricao em evento sem taxa ficou `confirmed`
  - `PATCH /api/app/student/events/[eventId]` com `status = maybe`: `200`
    - a resposta do aluno passou para `maybe`
  - `POST /api/app/student/events`: `200`
    - autoinscricao em evento pago ficou `payment_pending`
  - validacao cruzada do financeiro por dado real no banco:
    - cobranca do evento pago operado pela academia ficou `PAID`
    - cobranca do evento pago autoinscrito pelo aluno ficou `PENDING`

### Smoke Real De UI

- dashboard da academia validado em:
  - `http://localhost:3000/dashboard/events`
- app do professor validado em:
  - `http://academia-validacao-1773885421600.localhost:3000/app/teacher/events`
- app do aluno validado em:
  - `http://academia-validacao-1773885421600.localhost:3000/app/student/events`
- validacoes observadas na UI:
  - admin exibiu os eventos temporarios com os estados `Cancelado` e `Pagar para confirmar` coerentes com o backend;
  - professor exibiu o evento cancelado e os CTAs reais de detalhe do modulo;
  - aluno exibiu o evento pago em `Inscricoes` com CTA `Pagar para confirmar`;
  - `consoleMessages = []`, `pageErrors = []` e `badResponses = []` nas tres superficies.

### Artefatos

- [`events-admin-refactor-smoke.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/events-admin-refactor-smoke.png)
- [`events-teacher-refactor-smoke.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/events-teacher-refactor-smoke.png)
- [`events-student-refactor-smoke.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/events-student-refactor-smoke.png)

### Cleanup

- os eventos temporarios da rodada foram removidos por cleanup local:
  - `Evento QA Events Teacher Unpaid 1774047677568`
  - `Evento QA Events Teacher Paid 1774047677568`
  - `Evento QA Events Student Unpaid 1774047677568`
  - `Evento QA Events Student Paid 1774047677568`
- as cobrancas temporarias ligadas a esses eventos tambem foram removidas
- verificacao posterior:
  - `remainingEvents = 0`
  - `remainingCharges = 0`

### Resultado

- `events` deixou de falar a linguagem antiga de `draft/rascunho`;
- academia, professor e aluno passaram a compartilhar o mesmo ciclo canonico de status;
- o fluxo pago agora tem estado explicito de confirmacao;
- o admin ganhou operacao real de editar/excluir/cancelar/realizar sem empurrar regra para o frontend.

## Etapa 19 - Consolidacao De Acesso Em Rotas Dashboard E Site

### Objetivo

Iniciar a Fase 10 pela fundacao transversal de acesso:

- revisar `tenant`, `role`, `capability` e `resource scope` nas rotas `dashboard` e `site`;
- corrigir vazamentos claros de autorizacao;
- registrar os contratos reais que ainda estavam implicitos.

### Inconsistencias Encontradas

- bug tecnico real em [`uploads/branding/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/uploads/branding/route.ts):
  - a rota aceitava qualquer usuario com membership ativa de `academy_admin` em qualquer tenant;
  - nao respeitava o `tenant` ativo do dashboard;
  - nao exigia a capability do modulo dono (`SITE_MANAGE`).
- bug tecnico real em [`classes/[classId]/students/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/classes/%5BclassId%5D/students/route.ts):
  - a rota fazia fallback de `CLASSES_MANAGE` para `ATTENDANCE_MANAGE`;
  - mas, quando o fallback falhava, ainda devolvia `adminAccess.response` em vez de `access.response`;
  - isso podia mascarar a origem real da negacao e tornar a resposta incoerente.

### Correcoes Aplicadas

- a rota de upload de branding foi alinhada para o gate oficial do modulo `site`:
  - agora usa [`requireDashboardTenantCapability`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/_lib/dashboard-tenant-access.ts)
  - capability exigida:
    - `SITE_MANAGE`
  - arquivo:
    - [`uploads/branding/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/uploads/branding/route.ts)
- a rota de alunos da turma foi corrigida para devolver a resposta do gate realmente avaliado:
  - arquivo:
    - [`classes/[classId]/students/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/classes/%5BclassId%5D/students/route.ts)
- a documentacao oficial passou a registrar explicitamente:
  - `PUT /api/classes/[classId]/students`
  - `POST /api/uploads/branding`
  - arquivo:
    - [`api-specification.md`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/doc-v2/api-specification.md)

### Revalidacao Real

- atores reais usados:
  - `academy_admin`: `admin.onboarding.1773885421600@example.com`
  - `teacher`: `teacher.signup.1773885818191@example.com`
- API real validada:
  - `POST /api/uploads/branding` com cookie do admin e `FormData` vazio:
    - `400`
    - mensagem:
      - `Envie um arquivo válido e informe se ele é logo ou banner.`
    - validou que o admin do tenant ativo passa pelo gate de autorizacao e cai na validacao funcional do payload.
  - `POST /api/uploads/branding` com cookie do professor:
    - `403`
    - mensagem:
      - `Capability insuficiente para esta operação.`
    - validou que a rota deixou de aceitar apenas "ser admin em algum lugar" e agora exige `SITE_MANAGE`.
  - `GET /api/classes` com cookie do professor:
    - `200`
    - `classCount = 3`
  - `PUT /api/classes/cmmwu4cyx007twlu8elfche4y/students` com cookie do professor e a mesma lista atual de alunos:
    - `200`
    - mensagem:
      - `Alunos da turma atualizados com sucesso.`
    - validou que o fallback tecnico continua funcional para o professor no proprio escopo, sem resposta inconsistente.
- validacao tecnica:
  - `tsc --noEmit`: passou

### Cleanup

- nao houve criacao de novos dados persistidos fora da propria atualizacao idempotente da turma;
- nao houve artefatos temporarios permanentes no workspace.

### Resultado

- `site` voltou a respeitar o tenant/capability gate oficial no upload de branding;
- a rota de alunos da turma deixou de responder com negacao mascarada no fallback;
- a Fase 10 foi iniciada com uma auditoria transversal objetiva e com evidencia real.

## Etapa 20 - Fechamento De Resource Scope Em Students

### Objetivo

Continuar a Fase 10 revisando `resource scope` real no dashboard de `students`, onde `teacher` possui `STUDENTS_READ`, mas nao deve herdar leitura irrestrita do tenant nem acessar informacoes financeiras fora da propria fronteira operacional.

### Inconsistencia Encontrada

- bug tecnico real em [`students/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/students/route.ts) e [`students/[studentId]/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/students/%5BstudentId%5D/route.ts):
  - as rotas de leitura usavam apenas `requireDashboardTenantCapability(STUDENTS_READ)`;
  - depois entregavam `listForTenant` e `findForTenant` sem recorte por ator;
  - na pratica, qualquer professor com `STUDENTS_READ` podia enxergar todos os alunos do tenant;
  - junto com isso, o payload do dashboard carregava campos financeiros como `planName`, `planValueCents`, `lastPayment` e `nextPayment`, o que ampliava o vazamento.

### Correcao Aplicada

- o modulo `students` passou a expor leitura por ator em [`student-dashboard.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/students/services/student-dashboard.service.ts):
  - `listForActor`
  - `findForActor`
- a regra aplicada foi:
  - `academy_admin` continua vendo o tenant completo;
  - `teacher` so enxerga `StudentProfile` que tenham modalidade vinculada a `teacherLinks` do proprio professor;
  - para `teacher`, o payload de leitura agora higieniza os campos financeiros:
    - `planId = null`
    - `planName = null`
    - `planValueCents = null`
    - `lastPayment = null`
    - `nextPayment = null`
    - `planOptions = []`
- as rotas do dashboard foram alinhadas para o novo contrato:
  - [`students/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/students/route.ts)
  - [`students/[studentId]/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/students/%5BstudentId%5D/route.ts)
- a documentacao oficial foi atualizada em:
  - [`api-specification.md`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/doc-v2/api-specification.md)

### Revalidacao Real

- atores reais usados:
  - `academy_admin`: `admin.onboarding.1773885421600@example.com`
  - `teacher`: `teacher.signup.1773885818191@example.com`
- tenant real validado:
  - `academia-validacao-1773885421600`
- validacao por API real cruzada com base real:
  - `POST /api/auth/session` com os dois atores:
    - `200`
  - `GET /api/students` com `academy_admin`:
    - `200`
    - `students = 14`
  - `GET /api/students` com `teacher`:
    - `200`
    - `students = 12`
  - consulta direta no banco para o professor do tenant:
    - `expectedTeacher = 12`
    - a lista retornada pela API bateu exatamente com os `StudentProfile` vinculados as modalidades do professor
    - `missingForTeacher = []`
    - `unexpectedForTeacher = []`
  - amostra real do payload do professor:
    - `planId = null`
    - `planName = null`
    - `planValueCents = null`
    - `lastPayment = null`
    - `nextPayment = null`
    - `planOptions.length = 0`
  - `GET /api/students/[studentId]` com professor para um aluno fora do proprio escopo:
    - `404`
    - mensagem:
      - `Aluno não encontrado.`
- validacao tecnica:
  - `tsc --noEmit`: passou

### Cleanup

- nao houve escrita nova de dados de negocio;
- a validacao foi somente leitura em API e banco;
- nao houve necessidade de cleanup persistente.

### Resultado

- `students` deixou de vazar colecao inteira do tenant para `teacher`;
- o dashboard passou a respeitar a fronteira operacional real do professor;
- os campos financeiros deixaram de ser expostos ao professor nas leituras do modulo.

## Etapa 21 - Fechamento De Dashboard Sensivel Em Teachers

### Objetivo

Continuar a Fase 10 removendo um drift entre a superficie real do modulo `teachers` e o gate da API detalhada de dashboard.

### Inconsistencia Encontrada

- bug tecnico real em [`teachers/records/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/teachers/records/route.ts):
  - a rota entregava `TeacherDashboardRecord[]` completos, incluindo compensacao, telefone, endereco, volume de aulas e metadados de aprovacao;
  - apesar disso, o gate exigia apenas `TEACHERS_READ`;
  - como `teacher` possui essa capability, ele podia chamar a rota diretamente mesmo sem acesso funcional a `dashboard/teachers`.
- drift de contrato em [`modules/teachers/manifest.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/teachers/manifest.ts):
  - o manifesto do modulo administrativo ainda estava marcado com `TEACHERS_READ`, embora a superficie seja de gestao e nao de leitura operacional simples.

### Correcao Aplicada

- a rota detalhada do dashboard foi alinhada para a capability correta:
  - [`teachers/records/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/teachers/records/route.ts)
  - gate agora exige:
    - `TEACHERS_MANAGE`
- o manifesto do modulo foi convergido para a mesma semantica:
  - [`modules/teachers/manifest.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/teachers/manifest.ts)
  - `requiredCapabilities` agora:
    - `TEACHERS_MANAGE`
- a especificacao oficial foi atualizada em:
  - [`api-specification.md`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/doc-v2/api-specification.md)

### Revalidacao Real

- atores reais usados:
  - `academy_admin`: `admin.onboarding.1773885421600@example.com`
  - `teacher`: `teacher.signup.1773885818191@example.com`
- tenant real validado:
  - `academia-validacao-1773885421600`
- API real validada:
  - `POST /api/auth/session` com os dois atores:
    - `200`
  - `GET /api/teachers/records` com `academy_admin`:
    - `200`
    - `teachers = 5`
  - `GET /api/teachers/records` com `teacher`:
    - `403`
    - mensagem:
      - `Capability insuficiente para esta operação.`
- validacao tecnica:
  - `tsc --noEmit`: passou

### Cleanup

- nao houve escrita nova de dados de negocio;
- a validacao foi somente leitura e autenticacao real;
- nao houve necessidade de cleanup persistente.

### Resultado

- a API detalhada de `teachers` deixou de aceitar leitura sensivel por capability ampla demais;
- `dashboard/teachers` ficou coerente com a propria natureza administrativa;
- a Fase 10 segue reduzindo drift entre surface, capability e contrato real.

## Etapa 22 - Fechamento De Leitura Administrativa Em Site

### Objetivo

Continuar a Fase 10 removendo mais um bypass de API em superficie administrativa: o modulo `site` e exclusivo do dashboard da academia, mas a leitura ainda aceitava uma capability ampla demais para o contrato real.

### Inconsistencia Encontrada

- bug tecnico real em [`site/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/site/route.ts):
  - `GET /api/site` exigia apenas `SITE_READ`;
  - `teacher` possui `SITE_READ` na matriz global de capabilities;
  - a rota devolve o draft/configuracao interna do builder do tenant, nao uma visao publica nem operacional do professor.
- drift de contrato em [`modules/site/manifest.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/site/manifest.ts):
  - o modulo ja era `academy_admin` only na navegacao;
  - mesmo assim, o `requiredCapabilities` ainda estava em `SITE_READ`.

### Correcao Aplicada

- a leitura do builder foi alinhada para a capability correta:
  - [`site/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/site/route.ts)
  - `GET /api/site` agora exige:
    - `SITE_MANAGE`
- o manifesto do modulo foi convergido para a mesma semantica:
  - [`modules/site/manifest.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/site/manifest.ts)
  - `requiredCapabilities` agora:
    - `SITE_MANAGE`
- a especificacao oficial foi atualizada em:
  - [`api-specification.md`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/doc-v2/api-specification.md)

### Revalidacao Real

- atores reais usados:
  - `academy_admin`: `admin.onboarding.1773885421600@example.com`
  - `teacher`: `teacher.signup.1773885818191@example.com`
- tenant real validado:
  - `academia-validacao-1773885421600`
- API real validada:
  - `POST /api/auth/session` com os dois atores:
    - `200`
  - `GET /api/site` com `academy_admin`:
    - `200`
    - `hasConfig = true`
  - `GET /api/site` com `teacher`:
    - `403`
    - mensagem:
      - `Capability insuficiente para esta operação.`
- validacao tecnica:
  - `tsc --noEmit`: passou

### Cleanup

- nao houve escrita nova de dados de negocio;
- a validacao foi somente leitura/autenticacao real;
- nao houve necessidade de cleanup persistente.

### Resultado

- o builder de `site` deixou de vazar draft/configuracao interna para `teacher`;
- a API ficou coerente com a natureza administrativa do modulo;
- a Fase 10 segue fechando bypasses em que a capability ampla nao refletia a superficie real.

## Etapa 23 - Fechamento Da Lista Administrativa Simples Em Teachers

### Objetivo

Continuar a Fase 10 removendo o ultimo bypass evidente no modulo `teachers`: a lista simples ainda aceitava `TEACHERS_READ`, embora servisse apenas como referencia administrativa do dashboard.

### Inconsistencia Encontrada

- bug tecnico real em [`teachers/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/teachers/route.ts):
  - `GET /api/teachers` exigia apenas `TEACHERS_READ`;
  - isso permitia que `teacher` chamasse a rota diretamente e recebesse o roster completo do corpo docente do tenant;
  - o payload incluia `email`, `specialty` e `status`, inclusive registros `invited`.
- validacao real antes da correcao mostrou:
  - `academy_admin`: `200`, `count = 5`
  - `teacher`: `200`, `count = 5`
  - amostra retornada ao professor:
    - `Professor Convite Real`
    - `teacher.invite.1773885818191@example.com`
    - `status = invited`

### Correcao Aplicada

- a lista simples do dashboard foi alinhada para a mesma fronteira administrativa do modulo:
  - [`teachers/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/teachers/route.ts)
  - `GET /api/teachers` agora exige:
    - `TEACHERS_MANAGE`
- a especificacao oficial foi atualizada em:
  - [`api-specification.md`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/doc-v2/api-specification.md)

### Revalidacao Real

- atores reais usados:
  - `academy_admin`: `admin.onboarding.1773885421600@example.com`
  - `teacher`: `teacher.signup.1773885818191@example.com`
- tenant real validado:
  - `academia-validacao-1773885421600`
- API real validada:
  - `POST /api/auth/session` com os dois atores:
    - `200`
  - `GET /api/teachers` com `academy_admin`:
    - `200`
    - `count = 5`
  - `GET /api/teachers` com `teacher`:
    - `403`
    - mensagem:
      - `Capability insuficiente para esta operação.`
- validacao tecnica:
  - `tsc --noEmit`: passou

### Cleanup

- nao houve escrita nova de dados de negocio;
- a validacao foi somente leitura/autenticacao real;
- nao houve necessidade de cleanup persistente.

### Resultado

- o roster administrativo simples de `teachers` deixou de vazar para `teacher`;
- o modulo passou a falar uma unica semantica de acesso nas duas rotas de leitura do dashboard;
- a Fase 10 continua reduzindo acesso lateral a dados administrativos fora da superficie real.

## Etapa 24 - Fechamento Central Da Superficie Administrativa

### Objetivo

Parar de corrigir bypasses um a um e alinhar o gate central do dashboard com a regra real do produto:

- dashboard administrativo e da academia;
- professor e aluno operam pelas rotas do app;
- API de dashboard nao deve continuar aceitando `teacher` apenas porque alguma capability legada ainda existe.

### Inconsistencia Encontrada

- bug tecnico estrutural em [`dashboard-tenant-access.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/_lib/dashboard-tenant-access.ts):
  - o helper central validava tenant ativo e capability;
  - mas nao validava a superficie real do ator;
  - com isso, `teacher` conseguia chamar varias rotas administrativas do dashboard por acesso lateral de API, mesmo sendo redirecionado para fora do dashboard na interface.
- em linguagem simples:
  - a porta da frente do dashboard barrava o professor;
  - mas a porta lateral das APIs ainda deixava entrar em varios endpoints administrativos.

### Correcao Aplicada

- o gate central do dashboard agora exige ator administrativo:
  - [`dashboard-tenant-access.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/_lib/dashboard-tenant-access.ts)
  - regra nova:
    - `academy_admin` pode seguir;
    - `platform_admin` pode seguir quando aplicavel;
    - `teacher` e `student` recebem `403` antes mesmo da checagem de capability do modulo.
- a especificacao oficial foi atualizada em:
  - [`api-specification.md`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/doc-v2/api-specification.md)

### Revalidacao Real

- atores reais usados:
  - `academy_admin`: `admin.onboarding.1773885421600@example.com`
  - `teacher`: `teacher.signup.1773885818191@example.com`
- tenant real validado:
  - `academia-validacao-1773885421600`
- API real validada:
  - `POST /api/auth/session` com os dois atores:
    - `200`
  - `GET /api/classes` com `academy_admin`:
    - `200`
    - `count = 4`
  - `GET /api/classes` com `teacher`:
    - `403`
    - mensagem:
      - `Sem acesso à superfície administrativa do dashboard.`
  - `GET /api/students` com `academy_admin`:
    - `200`
    - `count = 14`
  - `GET /api/students` com `teacher`:
    - `403`
    - mensagem:
      - `Sem acesso à superfície administrativa do dashboard.`
  - `GET /api/site` com `teacher`:
    - `403`
    - mensagem:
      - `Sem acesso à superfície administrativa do dashboard.`
- validacao tecnica:
  - `tsc --noEmit`: passou

### Cleanup

- nao houve escrita nova de dados de negocio;
- a validacao foi somente leitura/autenticacao real;
- nao houve necessidade de cleanup persistente.

### Resultado

- o dashboard administrativo passou a ter um gate coerente no ponto central;
- a autorizacao deixou de depender de dezenas de correcoes pontuais espalhadas;
- `teacher` e `student` ficaram corretamente limitados as rotas do app (`/api/app/*`), como o produto ja previa.

## Etapa 25 - Limpeza De Permissions E Navegacao Legadas Do Dashboard

### Objetivo

Concluir a rodada de coerencia removendo o que ainda fazia o codigo "falar errado":

- capabilities antigas de dashboard no role `teacher`;
- manifests de modulos de dashboard ainda marcados com `teacher` ou `student`, apesar de a superficie real ser administrativa.

### Inconsistencia Encontrada

- drift tecnico em [`lib/capabilities.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/lib/capabilities.ts):
  - mesmo depois do gate central do dashboard, o role `teacher` ainda recebia capabilities como:
    - `dashboard.view`
    - `students.read`
    - `classes.read`
    - `attendance.read`
    - `graduations.read`
    - `events.read`
    - `site.read`
  - isso mantinha o payload de sessao dizendo que o professor tinha acesso administrativo que o produto nao reconhece mais.
- drift tecnico em manifests de dashboard:
  - varios modulos ainda estavam com `roles` incluindo `teacher` e, em alguns casos, `student`;
  - exemplos:
    - [`modules/dashboard/manifest.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/dashboard/manifest.ts)
    - [`modules/classes/manifest.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/classes/manifest.ts)
    - [`modules/students/manifest.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/students/manifest.ts)
    - [`modules/techniques/manifest.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/techniques/manifest.ts)
- em linguagem simples:
  - a trava ja estava certa;
  - mas a etiqueta ainda dizia que professor podia entrar.

### Correcao Aplicada

- o role `teacher` foi reduzido ao que realmente usa no tenant:
  - [`lib/capabilities.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/lib/capabilities.ts)
  - capabilities restantes no tenant:
    - `app.access`
    - `tenant.switch`
- os manifests dos modulos de dashboard foram alinhados para superficie administrativa:
  - [`modules/dashboard/manifest.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/dashboard/manifest.ts)
  - [`modules/classes/manifest.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/classes/manifest.ts)
  - [`modules/events/manifest.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/events/manifest.ts)
  - [`modules/graduations/manifest.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/graduations/manifest.ts)
  - [`modules/attendance/manifest.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/attendance/manifest.ts)
  - [`modules/plans/manifest.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/plans/manifest.ts)
  - [`modules/modalities/manifest.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/modalities/manifest.ts)
  - [`modules/students/manifest.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/students/manifest.ts)
  - [`modules/techniques/manifest.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/techniques/manifest.ts)
- a especificacao oficial foi atualizada em:
  - [`api-specification.md`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/doc-v2/api-specification.md)

### Revalidacao Real

- ator real usado:
  - `teacher`: `teacher.signup.1773885818191@example.com`
- tenant real validado:
  - `academia-validacao-1773885421600`
- API real validada:
  - `POST /api/auth/session` com professor:
    - `200`
  - `GET /api/me/memberships` com a sessao real do professor:
    - `200`
    - `currentRole = teacher`
    - `currentTenantCapabilities = ["app.access", "tenant.switch"]`
- validacao tecnica:
  - `tsc --noEmit`: passou

### Cleanup

- nao houve escrita nova de dados de negocio;
- a validacao foi somente leitura/autenticacao real;
- nao houve necessidade de cleanup persistente.

### Resultado

- a sessao do professor parou de anunciar permissao administrativa que ele nao usa;
- os manifests de dashboard ficaram coerentes com a regra central do produto;
- backend, navegacao e documentacao passaram a falar a mesma lingua.

## Etapa 26 - Formalizacao Da Fronteira Administrativa De Attendance

### Objetivo

Concluir a reorganizacao de `attendance` sem mexer na macroarquitetura:

- expor a leitura administrativa por uma rota propria de `attendance`;
- expor a mutacao administrativa por uma rota propria de `attendance`;
- manter `/api/classes/sessions` apenas como compatibilidade legada;
- validar com API real, UI real e cleanup.

### Inconsistencia Encontrada

- drift arquitetural:
  - a tela administrativa de presenca ja era um modulo proprio no frontend, mas a mutacao ainda pendurava em [`app/api/classes/sessions/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/classes/sessions/route.ts);
  - isso deixava ownership e contrato administrativos de `attendance` acoplados ao modulo `classes`.
- bug tecnico no cenario limpo local:
  - o seed criava sessoes com alunos confirmados/presentes/ausentes, mas sem criar as matriculas dessas pessoas nas turmas;
  - na pratica, a API nova recusava salvar a sessao por coerencia de dominio, com a mensagem `So e possivel registrar presenca de alunos vinculados a turma.`
- bug tecnico de data:
  - ao salvar `sessionDate = YYYY-MM-DD`, o repositorio fazia `new Date(input.sessionDate)`;
  - isso interpretava a data como meia-noite UTC e podia abrir uma sessao duplicada no mesmo dia em vez de atualizar a existente.

### Correcao Aplicada

- foi criada a superficie administrativa canonica de `attendance`:
  - [`app/api/attendance/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/attendance/route.ts)
  - [`app/api/attendance/sessions/[sessionId]/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/attendance/sessions/%5BsessionId%5D/route.ts)
- foram criados contracts e service proprios do modulo:
  - [`apps/api/src/modules/attendance/contracts/update-attendance-session.input.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/attendance/contracts/update-attendance-session.input.ts)
  - [`apps/api/src/modules/attendance/contracts/update-attendance-session.parser.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/attendance/contracts/update-attendance-session.parser.ts)
  - [`apps/api/src/modules/attendance/domain/attendance-dashboard.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/attendance/domain/attendance-dashboard.ts)
  - [`apps/api/src/modules/attendance/services/attendance-dashboard.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/attendance/services/attendance-dashboard.service.ts)
- a rota legada [`app/api/classes/sessions/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/classes/sessions/route.ts) foi mantida apenas como alias de compatibilidade;
- a tela administrativa passou a consumir a rota canonica:
  - [`modules/attendance/components/attendance-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/attendance/components/attendance-dashboard-screen.tsx)
- o seed foi corrigido para o cenario limpo local nascer coerente:
  - [`prisma/seed.mjs`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/prisma/seed.mjs)
  - agora as turmas seedadas criam `ClassGroupEnrollment` real e `currentStudents` alinhado com as matriculas;
- a persistencia de sessao foi corrigida para interpretar `YYYY-MM-DD` como data local do dia, evitando duplicacao por drift UTC:
  - [`apps/api/src/modules/classes/repositories/class-group.repository.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/classes/repositories/class-group.repository.ts)

### Revalidacao Real

- ator real usado:
  - `academy_admin`: `joao@academia.com`
- tenant real validado:
  - `dojo-centro.localhost`
- API real validada:
  - `POST /api/auth/session`:
    - `200`
  - `GET /api/attendance`:
    - `200`
    - retornou turmas e sessoes do dashboard administrativo de presenca
  - `PUT /api/attendance/sessions/[sessionId]`:
    - `200`
    - alterou uma sessao real de `absent` para `justified`
    - manteve `TOTAL = 1` sessao para a mesma turma/data, sem duplicacao
  - `PUT /api/classes/sessions`:
    - `200`
    - continuou funcionando como compatibilidade legada
    - manteve `TOTAL = 1` sessao para a mesma turma/data
- UI real validada:
  - login real como admin em `http://dojo-centro.localhost:3000/login`
  - abertura real de `http://dojo-centro.localhost:3000/dashboard/attendance`
  - confirmacoes observadas na pagina:
    - heading `Presenca`
    - card `Aulas Hoje`
    - aba `Historico`
  - artefato salvo em:
    - [`attendance-admin-dashboard-smoke.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/attendance-admin-dashboard-smoke.png)
- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou
- smoke real de UI:
  - login administrativo real em `dojo-centro.localhost:3000/dashboard/students`
  - abertura do modal `Novo aluno`
  - selecao do plano `Mensal Básico`
  - confirmacao visual da opcao `Marcar plano como pago`
  - artefato salvo em [`students-admin-plan-paid-option-smoke.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/students-admin-plan-paid-option-smoke.png)

### Cleanup

- o seed foi reaplicado antes da validacao final para recomecar de um cenario limpo;
- a alteracao de presenca usada na validacao foi revertida ao estado original na mesma sessao;
- a alteracao de compatibilidade na rota legada tambem foi revertida;
- nao restou sessao duplicada nem dado temporario da validacao.

### Resultado

- `attendance` passou a ter fronteira administrativa propria e documentada;
- a tela administrativa consome a rota certa do modulo;
- o alias legado continua operacional sem voltar a ser a rota canonica;
- o cenario limpo local ficou coerente com a regra real de presenca;
- a duplicacao de sessoes por drift de data foi eliminada.

## Etapa 27 - Graduacao Individual Sai De Students E Volta Para Graduations

### Objetivo

Corrigir uma mutacao administrativa que ainda estava no modulo errado:

- registrar graduacao individual do aluno na fronteira canonica de `graduations`;
- manter a rota antiga de `students` apenas como compatibilidade legada;
- migrar o frontend administrativo para a rota nova;
- validar com API real e cleanup.

### Inconsistencia Encontrada

- drift arquitetural:
  - [`app/api/students/[studentId]/graduations/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/students/%5BstudentId%5D/graduations/route.ts) registrava graduacao individual;
  - essa operacao pertence semanticamente ao modulo `graduations`, nao ao modulo `students`.
- acoplamento de ownership:
  - a logica estava implementada dentro de [`student-dashboard.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/students/services/student-dashboard.service.ts), mesmo sendo uma mutacao de progressao/graduacao.
- em linguagem simples:
  - a regra funcionava;
  - mas estava guardada na gaveta errada.

### Correcao Aplicada

- foi criada a rota canonica no modulo dono:
  - [`app/api/graduations/students/[studentId]/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/graduations/students/%5BstudentId%5D/route.ts)
- foram criados contract e parser proprios em `graduations`:
  - [`register-student-graduation.input.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/graduations/contracts/register-student-graduation.input.ts)
  - [`register-student-graduation.parser.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/graduations/contracts/register-student-graduation.parser.ts)
- a logica de registrar graduacao individual foi movida para o service do modulo dono:
  - [`graduation-dashboard.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/graduations/services/graduation-dashboard.service.ts)
- a rota antiga foi mantida apenas como alias legado chamando a regra canonica:
  - [`app/api/students/[studentId]/graduations/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/students/%5BstudentId%5D/graduations/route.ts)
- o frontend administrativo de alunos passou a usar a rota nova:
  - [`modules/students/services/index.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/students/services/index.ts)
- a implementacao antiga foi removida de `students`:
  - [`student-dashboard.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/students/services/student-dashboard.service.ts)
  - [`student-dashboard.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/students/domain/student-dashboard.ts)

### Revalidacao Real

- ator real usado:
  - `academy_admin`: `joao@academia.com`
- tenant real validado:
  - `dojo-centro.localhost`
- API real validada:
  - `POST /api/auth/session`:
    - `200`
  - rota canonica:
    - `POST /api/graduations/students/[studentId]`
    - `200`
    - validada em `Carlos Silva`
    - resposta refletiu `Azul 2 graus -> Azul 3 graus`
  - rota legada de compatibilidade:
    - `POST /api/students/[studentId]/graduations`
    - `200`
    - validada em `Maria Santos`
    - resposta refletiu `Roxa 3 graus -> Roxa 4 graus`
- persistencia real confirmada no banco:
  - foram encontrados os registros de validacao com avaliadores `QA Canonico` e `QA Legado`
- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou

### Cleanup

- as duas graduacoes temporarias de validacao foram removidas do banco:
  - `cmmzmeen7000ieeu8tkmszykx`
  - `cmmzmefb0000jeeu8eilexf63`
- os `StudentModality` usados na validacao voltaram ao estado original:
  - Carlos Jiu-Jitsu: `Azul`, `2`
  - Maria Jiu-Jitsu: `Roxa`, `3`
- nao restou alteracao de faixa temporaria apos a rodada.

### Resultado

- a graduacao individual passou a morar no modulo certo;
- `students` deixou de ser dono de uma mutacao que era de `graduations`;
- o frontend administrativo ja consome a rota canonica;
- o alias legado continua funcional sem voltar a ser ownership oficial.

## Etapa 28 - Revisao De Enrollment Requests Sai De Onboarding E Volta Para O Modulo Dono

### Objetivo

Corrigir o ownership interno da revisao administrativa de pedidos de vinculo:

- manter a mesma rota publica/administrativa;
- mover a aprovacao e rejeicao do pedido para o modulo `enrollment-requests`;
- deixar `onboarding` focado em criacao de academia, setup e aceite de convite.

### Inconsistencia Encontrada

- drift arquitetural:
  - a rota [`app/api/enrollment-requests/[requestId]/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/enrollment-requests/%5BrequestId%5D/route.ts) pertence ao modulo `enrollment-requests`;
  - mas a aprovacao/rejeicao do pedido estava sendo executada por [`tenant-access-onboarding.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/onboarding/services/tenant-access-onboarding.service.ts).
- em linguagem simples:
  - o pedido de vinculo estava sendo revisado fora da gaveta dele;
  - o comportamento estava certo, mas o dono da regra estava errado.

### Correcao Aplicada

- a orquestracao de aprovacao/rejeicao foi movida para:
  - [`enrollment-request.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/enrollment-requests/services/enrollment-request.service.ts)
- a rota administrativa passou a chamar o modulo dono:
  - [`app/api/enrollment-requests/[requestId]/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/enrollment-requests/%5BrequestId%5D/route.ts)
- o service de onboarding deixou de concentrar essa responsabilidade:
  - [`tenant-access-onboarding.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/onboarding/services/tenant-access-onboarding.service.ts)

### Revalidacao Real

- cenario limpo criado com professor temporario:
  - `teacher.phase10.19205.16466@example.com`
- tenant real validado:
  - `dojo-centro`
- API real validada:
  - `POST /api/tenants/dojo-centro/enrollment-requests`
    - `201`
    - criou pedido `pending` para professor
  - `POST /api/auth/session` como admin:
    - `200`
  - `PATCH /api/enrollment-requests/[requestId]` com `action = approve`
    - `200`
    - retornou `request.status = approved`
    - retornou `membership.status = active`
- persistencia real confirmada no banco:
  - `EnrollmentRequest = APPROVED`
  - `AcademyMembership = ACTIVE`
  - `TeacherProfile = ACTIVE`
- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou

### Cleanup

- o usuario temporario de validacao foi removido integralmente:
  - `TeacherProfile`
  - `EnrollmentRequest`
  - `AcademyMembership`
  - `PasswordCredential`
  - `UserSession`
  - `User`
- nao restou dado temporario do cenario criado para a validacao.

### Resultado

- `enrollment-requests` voltou a ser dono da revisao de pedido de vinculo;
- `onboarding` deixou de carregar uma responsabilidade administrativa que nao era dele;
- a URL da API continuou a mesma, sem regressao de contrato externo;
- ownership interno do backend ficou mais coerente com o nome e a fronteira do modulo.

## Etapa 29 - Aceite De Convite Sai De Onboarding E Volta Para Invitations

### Objetivo

Corrigir o ownership interno do fluxo de aceite de convite:

- manter a mesma URL publica de aceite;
- mover a ativacao de membership e a marcacao do convite aceito para o modulo `invitations`;
- remover o resido vazio deixado em `onboarding`.

### Inconsistencia Encontrada

- drift arquitetural:
  - a rota [`app/api/invitations/accept/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/invitations/accept/route.ts) pertence ao modulo `invitations`;
  - mas o aceite ainda chamava [`tenant-access-onboarding.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/onboarding/services/tenant-access-onboarding.service.ts).
- em linguagem simples:
  - aceitar convite estava funcionando;
  - mas a regra estava saindo da gaveta de `invitations` e indo parar em `onboarding`.

### Correcao Aplicada

- a orquestracao de aceite + ativacao foi movida para:
  - [`invitation.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/invitations/services/invitation.service.ts)
- a rota publica de aceite passou a chamar o modulo dono:
  - [`app/api/invitations/accept/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/invitations/accept/route.ts)
- o resido vazio de onboarding foi removido:
  - [`app.module.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/app.module.ts)
  - `apps/api/src/modules/onboarding/services/tenant-access-onboarding.service.ts`

### Revalidacao Real

- cenario limpo criado com convite temporario:
  - email: `invite.phase10.31058.10@example.com`
- tenant real validado:
  - `dojo-centro`
- API real validada:
  - `POST /api/auth/session` como admin:
    - `200`
  - `POST /api/tenants/dojo-centro/invitations`:
    - `201`
    - criou convite `pending` com token temporario
  - `POST /api/invitations/accept`:
    - `200`
    - retornou `invitation.status = accepted`
    - retornou `membership.status = active`
- persistencia real confirmada no banco:
  - `Invitation = ACCEPTED`
  - `AcademyMembership = ACTIVE`
  - `TeacherProfile = ACTIVE`
- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou

### Cleanup

- o convite temporario foi removido;
- o usuario temporario foi removido;
- tambem foram removidos:
  - `TeacherProfile`
  - `AcademyMembership`
  - `PasswordCredential`
  - `UserSession`
- nao restou resido do cenario de validacao.

### Resultado

- `invitations` voltou a ser dono do aceite de convite;
- `onboarding` deixou de carregar uma responsabilidade que nao era dele;
- a URL publica permaneceu a mesma, sem regressao de contrato;
- a fronteira interna do backend ficou mais coerente.

## Etapa 30 - Solicitacao Publica De Vinculo Sai Do Handler E Volta Para Enrollment Requests

### Objetivo

Corrigir o ownership interno do fluxo publico de entrada na academia:

- manter a mesma URL publica `POST /api/tenants/[tenantSlug]/enrollment-requests`;
- mover a orquestracao principal para o modulo `enrollment-requests`;
- deixar o `route.ts` como transporte fino, sem regra espalhada.

### Inconsistencia Encontrada

- drift arquitetural:
  - a rota [`app/api/tenants/[tenantSlug]/enrollment-requests/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/tenants/%5BtenantSlug%5D/enrollment-requests/route.ts) ja estava na superficie certa;
  - mas a logica principal do fluxo publico ainda estava quase toda dentro do handler.
- em linguagem simples:
  - o endpoint estava na gaveta certa;
  - mas quem fazia o trabalho pesado ainda era a porta de entrada, e nao o modulo dono.

### Correcao Aplicada

- foram criados contract e parser proprios do modulo:
  - [`submit-public-enrollment-request.input.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/enrollment-requests/contracts/submit-public-enrollment-request.input.ts)
  - [`submit-public-enrollment-request.parser.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/enrollment-requests/contracts/submit-public-enrollment-request.parser.ts)
- a orquestracao do fluxo publico foi movida para:
  - [`enrollment-request.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/enrollment-requests/services/enrollment-request.service.ts)
- a rota publica ficou fina e passou a apenas:
  - validar entrada;
  - chamar o service do modulo dono;
  - anexar o cookie de sessao no retorno de sucesso.
- o tratamento de erro tambem foi alinhado:
  - erro de validacao continua `400`;
  - erro inesperado continua `500`.

### Revalidacao Real

- tenant real validado:
  - `dojo-centro`
- modalidade real usada no cenario:
  - `cmmzlsk0m000vgau840d2odic` (`Jiu-Jitsu`)
- API real validada, caminho professor:
  - `POST /api/tenants/dojo-centro/enrollment-requests`
    - `201`
    - criou usuario `phase10.enrollment.teacher.1774056242@example.com`
    - retornou `requestedRole = teacher`
    - retornou `accessStatus = pending_approval`
    - retornou `enrollmentRequest.status = pending`
  - `POST /api/auth/session` como admin:
    - `200`
  - `GET /api/tenants/dojo-centro/enrollment-requests`:
    - `200`
    - listou o pedido temporario criado para professor
- persistencia real confirmada no banco, caminho professor:
  - `AcademyMembership = PENDING`
  - `TeacherProfile = DRAFT`
  - `EnrollmentRequest = PENDING`
- API real validada, caminho aluno:
  - `POST /api/tenants/dojo-centro/enrollment-requests`
    - `201`
    - criou usuario `phase10.enrollment.student.1774056297@example.com`
    - retornou `requestedRole = student`
    - retornou `accessStatus = active`
    - retornou `enrollmentRequest = null`
- persistencia real confirmada no banco, caminho aluno:
  - `AcademyMembership = ACTIVE`
  - `StudentProfile = ACTIVE`
  - `StudentModality = Branca / 0`
- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou

### Cleanup

- os dois usuarios temporarios foram removidos integralmente:
  - `phase10.enrollment.teacher.1774056242@example.com`
  - `phase10.enrollment.student.1774056297@example.com`
- tambem foram removidos os artefatos derivados:
  - `TeacherModality`
  - `TeacherProfile`
  - `StudentModality`
  - `StudentProfile`
  - `EnrollmentRequest`
  - `AcademyMembership`
  - `PasswordCredential`
  - `UserSession`
  - `User`
- confirmacao final de cleanup:
  - `remaining_users = 0`
  - `remaining_requests = 0`

### Resultado

- `enrollment-requests` voltou a ser dono tambem da submissao publica de vinculo;
- a rota publica permaneceu a mesma, sem quebra de contrato externo;
- o handler ficou fino e o modulo passou a concentrar a orquestracao do fluxo;
- a fronteira interna do backend ficou mais coerente para a Fase 10.1.

## Etapa 31 - Single Admin Vai Direto Para O Dashboard

### Objetivo

Melhorar o fluxo de entrada no host de plataforma quando a conta possui apenas um acesso ativo:

- evitar mandar `academy_admin` com uma unica academia para `/access`;
- redirecionar direto para `/dashboard`;
- manter a tela de escolha para quem nao e admin unico ou realmente tem mais de uma opcao de acesso.

### Inconsistencia Encontrada

- problema de UX real:
  - contas com apenas um vinculo administrativo ativo ainda caiam em `/access`;
  - isso obrigava uma escolha desnecessaria antes de abrir o dashboard.
- em linguagem simples:
  - quando so existe uma academia para administrar, a etapa de "escolher acesso" nao agrega nada.

### Correcao Aplicada

- foi criado um helper unico para decidir redirecionamento automatico de acesso:
  - [`platform-access-routing.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/lib/auth/platform-access-routing.ts)
- o login no host de plataforma passou a usar essa regra:
  - [`login-page-client.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/components/auth/login-page-client.tsx)
- a propria pagina `/access` tambem passou a respeitar a mesma regra:
  - [`app/access/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/access/page.tsx)
- a regra foi fechada apenas para `academy_admin` com um unico vinculo ativo;
- `teacher` e `student` continuam usando a tela `/access` no host de plataforma, porque precisam trocar para o tenant correto antes de abrir o app.

### Revalidacao Real

- usuario real validado no banco:
  - `ju@gmail.com`
- membership real confirmado:
  - `ACADEMY_ADMIN`
  - `ACTIVE`
  - tenant `academia-jiu-jitea`
- API real validada:
  - `POST /api/auth/session` no host de plataforma:
    - `200`
    - retornou apenas um `tenantMembership` ativo
  - `GET /access` no host de plataforma com a sessao autenticada:
    - `307`
    - `location: /dashboard`
- contra-validacao real:
  - `maria@email.com` possui um unico vinculo `STUDENT` ativo em `dojo-centro`
  - `GET /access` no host de plataforma com a sessao autenticada:
    - `200`
    - permaneceu na tela de escolha, sem redirecionar para `/app/student` no host errado
- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou

### Cleanup

- nao houve criacao de dado temporario;
- apenas cookies locais temporarios de validacao foram usados.

### Resultado

- `academy_admin` com uma unica academia ativa nao precisa mais passar por `/access`;
- o fluxo ficou mais direto para o caso administrativo que nao exige escolha;
- `student` e `teacher` nao sao mais redirecionados de forma incorreta para o app no host de plataforma;
- contas com multiplos acessos continuam com a tela de escolha.

## Etapa 32 - Valores De Planos Passam A Ser Editados Em Reais

### Objetivo

Corrigir a entrada de valor dos planos para nao expor `centavos` na interface:

- usuario deve ver e editar `10,00`;
- sistema continua persistindo `1000` internamente em `amountCents`;
- o mesmo comportamento deve valer na tela de `Planos` e no bloco de `Planos` em `Settings`.

### Inconsistencia Encontrada

- bug de UX real:
  - os campos estavam ligados diretamente a `amountCents`;
  - por isso o usuario via `1000` onde esperava `10,00`.
- em linguagem simples:
  - a interface estava mostrando o formato tecnico interno do banco, e nao o formato natural para o usuario.

### Correcao Aplicada

- foi criado um helper compartilhado de conversao:
  - [`currency-input.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/lib/currency-input.ts)
- a tela principal de planos passou a editar em reais:
  - [`plans-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/plans/components/plans-dashboard-screen.tsx)
- o bloco de planos em settings foi alinhado para o mesmo comportamento:
  - [`settings/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/dashboard/settings/page.tsx)
- o label tambem foi corrigido de `Valor (centavos)` para `Valor (R$)`.

### Revalidacao

- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou
- validacao do helper:
  - `10,00 -> 1000`
  - `10.50 -> 1050`
  - `1000 -> 10,00`

### Cleanup

- nao houve criacao de dado temporario;
- nenhuma limpeza adicional foi necessaria.

### Resultado

- o usuario deixa de ver `centavos` crus nos campos de planos;
- a interface passa a trabalhar em reais, sem alterar o contrato interno do backend;
- o comportamento ficou coerente entre `Planos` e `Settings`.

## Etapa 33 - Professor Pendente Para De Entrar Em Loop No App

### Objetivo

Corrigir o fluxo do professor com autocadastro pendente no host da academia:

- parar o loop entre `/app` e `/app/teacher`;
- carregar a shell do app do professor;
- bloquear a experiencia com um modal fixo informando que o cadastro aguarda aprovacao.

### Inconsistencia Encontrada

- bug tecnico e de UX real:
  - `/app` detectava `role = teacher` e redirecionava para `/app/teacher`;
  - o layout de `/app/teacher` exigia membership `active`;
  - como o autocadastro cria membership `pending`, o layout empurrava de volta para `/app`;
  - isso gerava loop entre as duas rotas.

### Correcao Aplicada

- o layout do app do professor passou a reconhecer o estado pendente:
  - [`app/app/teacher/layout.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/app/teacher/layout.tsx)
- quando o professor ainda esta `pending` ou `invited`, a shell do app carrega e o layout rende o bloqueio em vez de redirecionar:
  - [`teacher-pending-approval-modal.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/components/teacher/teacher-pending-approval-modal.tsx)
- o modal foi configurado sem botao de fechar e sem permitir fechar por clique fora ou `Esc`.

### Revalidacao Real

- tenant real validado:
  - `academia-jiu-jitea`
- modalidade real usada no cenario:
  - `cmmzmxrc6001leeu87an2l1d6` (`Jiu-Jitsu Adulto`)
- cenario limpo criado:
  - `pending.teacher.loop.1774058676@example.com`
- API real validada:
  - `POST /api/tenants/academia-jiu-jitea/enrollment-requests`
    - `201`
    - retornou `accessStatus = pending_approval`
    - retornou `enrollmentRequest.status = pending`
- persistencia real confirmada no banco:
  - `AcademyMembership = PENDING`
  - `EnrollmentRequest = PENDING`
- comportamento real validado no app:
  - `GET /app` com a sessao do professor pendente:
    - `200`
    - deixou de entrar em loop HTTP
  - `GET /app/teacher` com a mesma sessao:
    - estabilizou na rota do professor
    - o HTML retornado passou a carregar o estado de bloqueio do app com a mensagem `Aguardando aprovação do administrador da academia.`
- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou

### Cleanup

- o usuario temporario de validacao foi removido integralmente:
  - `TeacherModality`
  - `TeacherProfile`
  - `EnrollmentRequest`
  - `AcademyMembership`
  - `PasswordCredential`
  - `UserSession`
  - `User`
- confirmacao final:
  - `remaining_users = 0`

### Resultado

- professor com autocadastro pendente nao fica mais preso no loop entre `/app` e `/app/teacher`;
- o app do professor abre na shell correta;
- a conta fica bloqueada por modal fixo ate a aprovacao do administrador.

## Etapa 34 - Modelo Antigo Do Autocadastro Do Aluno Por Atividade E Turma

### Objetivo Da Rodada Na Epoca

Registrar a rodada transitória em que o autocadastro do aluno deixou de listar `modalidades` diretamente e passou, temporariamente, a exigir escolha de turma a partir da atividade principal.

Observacao importante:

- este modelo nao e mais o modelo canonico atual do produto;
- ele foi supersedido pela [Etapa 36](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/doc-v2/validation-refactor-journal.md), que formaliza o fluxo `activity-first` com entrada imediata no app, sem turma obrigatoria.

### Inconsistencia Encontrada Na Epoca

- problema real de UX e modelagem no fluxo publico daquele momento:
  - o aluno via `Atividades que pratica`;
  - mas a tela carregava `modalidades` da academia;
  - ainda nao existia a formalizacao do eixo por `StudentActivity`;
  - por isso foi adotado, temporariamente, um desenho em que a turma definia a modalidade inicial do aluno.

### Correcao Aplicada Na Epoca

- a pagina publica de cadastro passou a carregar:
  - modalidades para `teacher`;
  - turmas ativas agrupadas por atividade principal para `student`;
- o fluxo do aluno agora envia `requestedClassGroupIds` no host da academia;
- o fluxo do professor continua usando `requestedModalityIds`;
- o backend do modulo `enrollment-requests` passou a criar o aluno pelo contrato de `practiceAssignments`, deixando o modulo `students` derivar a modalidade pela turma.

Esse desenho foi util como transicao, mas depois se mostrou inadequado para a regra real do produto, porque:

- obrigava a existencia de turma para liberar o primeiro acesso;
- confundia o cadastro publico com a operacao posterior da academia;
- ainda mantinha a entrada do aluno dependente de turma/modalidade cedo demais.

Arquivos centrais:

- [`app/(auth)/cadastro/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/%28auth%29/cadastro/page.tsx)
- [`components/auth/cadastro-page-client.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/components/auth/cadastro-page-client.tsx)
- [`submit-public-enrollment-request.input.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/enrollment-requests/contracts/submit-public-enrollment-request.input.ts)
- [`submit-public-enrollment-request.parser.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/enrollment-requests/contracts/submit-public-enrollment-request.parser.ts)
- [`enrollment-request.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/enrollment-requests/services/enrollment-request.service.ts)

### Revalidacao Real

- tenant real validado:
  - `dojo-centro`
- cenario limpo criado:
  - `aluno.turma.1774060825@example.com`
- API real validada:
  - `POST /api/tenants/dojo-centro/enrollment-requests`
    - payload com `requestedRole = student`
    - `requestedClassGroupIds = ["cmmzlsk49001agau8i7dhj08w"]`
    - `requestedModalityIds = []`
    - resultado: `201`
    - retornou `accessStatus = active`
- reflexo real validado no app do aluno:
  - `GET /api/app/student/home`
    - retornou a turma `Jiu-Jitsu Iniciante`
    - `joined = true`
    - `Modalidades = 1`
  - `GET /api/app/student/attendance`
    - respondeu `200`
    - sem erro estrutural no fluxo do aluno novo
  - `GET /api/app/student/progress`
    - respondeu `200`
    - exibiu a modalidade derivada `Jiu-Jitsu` com `Branca / 0`
- reflexo real validado no dashboard:
  - `GET /api/students`
    - o aluno novo apareceu com:
      - `practiceAssignments.classGroupName = "Jiu-Jitsu Iniciante"`
      - `modalities[0].modalityName = "Jiu-Jitsu"`
      - `enrolledClasses = ["Jiu-Jitsu Iniciante"]`
- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou

### Cleanup

- o usuario temporario de validacao foi removido integralmente do banco;
- confirmacao final:
  - `remaining_users = 0`

### Como Funciona Hoje

O modelo atual deixou essa etapa para tras e passou a funcionar assim:

- no host da academia, `teacher` continua se cadastrando por modalidade;
- no host da academia, `student` escolhe apenas as atividades principais oferecidas pela academia;
- turma nao e obrigatoria para concluir o autocadastro do aluno;
- o aluno entra imediatamente no app com acesso `active`, mesmo sem turma;
- o vinculo inicial canonico do aluno e `StudentActivity`;
- `StudentModality` so e criada ou reativada quando o aluno entra em uma turma real;
- presenca e graduacao do aluno passaram a usar atividade como eixo inicial, sem depender de uma modalidade criada no primeiro acesso.

Referencias do modelo atual:

- [Etapa 36](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/doc-v2/validation-refactor-journal.md)
- [api-specification.md](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/doc-v2/api-specification.md)

## Etapa 35 - Atividades Principais No App Do Aluno

### Objetivo

Corrigir a leitura do app do aluno para listar as atividades principais realmente oferecidas pela academia, sem confundir:

- atividade principal, como `Jiu Jitsu` e `Muay Thai`;
- com modalidade, como `Jiu-Jitsu Kids` ou `Jiu-Jitsu Adulto`.

### Inconsistencia Encontrada

- problema real de contrato no BFF do aluno:
  - `home` e `classes` do app do aluno so carregavam turmas e modalidades do proprio aluno;
  - no tenant `academia-jiu-jitea`, a academia oferece `jiu-jitsu` e `muay-thai`, mas ainda nao possui turmas;
  - por isso o aluno nao via as atividades principais da academia no app, mesmo elas existindo de forma canonica no tenant.

### Correcao Aplicada

- o contrato do app do aluno passou a expor `academyActivities` em:
  - `GET /api/app/student/home`;
  - `GET /api/app/student/classes`;
- a fonte canonica ficou separada de modalidade:
  - primeiro pelas categorias das modalidades ativas do tenant;
  - com fallback para as categorias configuradas no onboarding quando ainda nao houver modalidades ativas;
- a UI do aluno passou a renderizar uma secao propria `Atividades da academia`, sem reutilizar `modalidade` como se fosse `atividade`.

Arquivos centrais:

- [`student-app.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/domain/student-app.ts)
- [`student-app-academy-activities.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/services/student-app-academy-activities.service.ts)
- [`student-app-home.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/services/student-app-home.service.ts)
- [`student-app-classes.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/services/student-app-classes.service.ts)
- [`student-home-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/student/student-home-screen.tsx)
- [`student-classes-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/student/student-classes-screen.tsx)
- [`student-academy-activities-section.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/student/student-academy-activities-section.tsx)

### Revalidacao Real

- tenant real validado:
  - `academia-jiu-jitea`
- usuario real validado:
  - `aluno@gmail.com`
- verificacao do tenant por banco:
  - modalidades ativas com `activityCategory`:
    - `jiu-jitsu`
    - `muay-thai`
  - turmas ativas:
    - `0`
- API real validada via host do tenant:
  - `POST /api/auth/session`
    - resultado: `200`
  - `GET /api/app/student/home`
    - resultado: `200`
    - retornou `academyActivities = [{ value: "jiu-jitsu", label: "Jiu Jitsu" }, { value: "muay-thai", label: "Muay Thai" }]`
  - `GET /api/app/student/classes`
    - resultado: `200`
    - retornou o mesmo `academyActivities`
- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou

### Cleanup

- nenhum dado precisou ser alterado no banco;
- nenhum registro temporario foi criado nesta rodada.

### Resultado

- o app do aluno agora lista as atividades principais da academia de forma canonica;
- `atividade principal` deixou de depender de turma existente;
- `modalidade` continua separada e segue sendo usada apenas onde modalidade e o conceito correto.

## Etapa 36 - Autocadastro Do Aluno Por Atividade Com Entrada Imediata

### Objetivo

Substituir o modelo anterior do autocadastro publico do aluno para refletir a regra correta do produto:

- o aluno escolhe apenas as atividades principais oferecidas pela academia;
- turma nao e obrigatoria no autocadastro;
- a falta de turma nao pode impedir o acesso imediato ao app;
- modalidade do aluno so nasce quando ele entra em uma turma real;
- presenca e graduacao passam a se apoiar em `StudentActivity`, nao em modalidade como requisito inicial.

### Inconsistencia Encontrada

- a etapa anterior havia formalizado um modelo transitório em que o aluno precisava escolher turma no host da academia;
- isso contrariava a regra de negocio real definida para o produto;
- alem disso, mantinha lixo tecnico no contrato publico com `requestedClassGroupIds`, mesmo depois da mudanca para `activity-first`.

### Correcao Aplicada

- o schema passou a introduzir `StudentActivity` como agregado canonico inicial do aluno:
  - [`prisma/schema.prisma`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/prisma/schema.prisma)
  - [`20260321033000_student_activity_domain_shift/migration.sql`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/prisma/migrations/20260321033000_student_activity_domain_shift/migration.sql)
- o autocadastro publico do aluno deixou de exigir turma:
  - [`app/(auth)/cadastro/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/%28auth%29/cadastro/page.tsx)
  - [`components/auth/cadastro-page-client.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/components/auth/cadastro-page-client.tsx)
  - [`submit-public-enrollment-request.input.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/enrollment-requests/contracts/submit-public-enrollment-request.input.ts)
  - [`submit-public-enrollment-request.parser.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/enrollment-requests/contracts/submit-public-enrollment-request.parser.ts)
- `enrollment-requests` passou a criar aluno ativo com `StudentActivity`, sem criar `StudentModality` no primeiro acesso:
  - [`enrollment-request.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/enrollment-requests/services/enrollment-request.service.ts)
- o dashboard/admin do aluno passou a operar por `practiceAssignments` com `activityCategory` e `classGroupId` opcional:
  - [`student-dashboard.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/students/services/student-dashboard.service.ts)
  - [`student-dashboard.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/students/domain/student-dashboard.ts)
- a criacao do vinculo de modalidade foi deslocada para a entrada em turma no modulo `classes`:
  - [`class-group.repository.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/classes/repositories/class-group.repository.ts)
- app do aluno e graduacoes foram alinhados ao eixo de atividade:
  - [`student-app-home.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/services/student-app-home.service.ts)
  - [`student-app-attendance.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/services/student-app-attendance.service.ts)
  - [`student-app-progress.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/services/student-app-progress.service.ts)
  - [`graduation-dashboard.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/graduations/services/graduation-dashboard.service.ts)

### Revalidacao Real

- tenant real validado:
  - `academia-jiu-jitea`
- verificacao de contexto real:
  - a academia possui atividades principais `jiu-jitsu` e `muay-thai`;
  - a academia possui `0` turmas ativas;
- cenario limpo criado:
  - `aluno-atividade-final-1774095200@teste.com`
- API real validada no host do tenant:
  - `POST /api/tenants/academia-jiu-jitea/enrollment-requests`
    - payload com `requestedRole = student`
    - payload com `requestedActivityCategories = ["jiu-jitsu"]`
    - sem `requestedClassGroupIds`
    - resultado: `201`
    - retornou `accessStatus = active`
    - retornou `enrollmentRequest.status = approved`
- persistencia real confirmada no banco:
  - `AcademyMembership = ACTIVE`
  - `EnrollmentRequest = APPROVED`
  - `StudentActivity = 1`
  - `StudentModality = 0`
- reflexo real validado no app:
  - `GET /api/app/student/home`
    - `200`
    - `academyActivities = [Jiu Jitsu, Muay Thai]`
    - `classes = []`
  - `GET /api/app/student/classes`
    - `200`
    - `classes = []`
  - `GET /api/app/student/progress`
    - `200`
    - retornou a atividade `jiu-jitsu` com `Branca / 0`
    - `practicedModalities = []`
    - `enrolledClasses = []`
  - `GET /api/app/student/attendance`
    - `200`
    - `attendance = []`
- validacao tecnica:
  - `npm run prisma:generate`: passou
  - `npm run prisma:migrate:deploy`: passou
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou

### Cleanup

- o usuario temporario criado para a validacao foi removido integralmente:
  - `StudentActivity`
  - `EnrollmentRequest`
  - `AcademyMembership`
  - `StudentProfile`
  - `PasswordCredential`
  - `UserSession`
  - `User`
- confirmacao final:
  - `remaining_users = 0`

### Resultado

- o aluno agora entra imediatamente no app, mesmo sem turma;
- a academia pode oferecer atividades sem precisar ter turma para liberar o primeiro acesso;
- modalidade deixou de ser chute no autocadastro do aluno;
- o contrato publico deixou de carregar `requestedClassGroupIds`;
- a etapa 34 fica supersedida por este modelo `activity-first` com entrada imediata.

## Etapa 37 - Ativacao De Plano So Apos Confirmacao De Pagamento

### Objetivo

Corrigir o fluxo de contratacao de plano para que:

- a cobranca inicial nao vire `atrasado` no mesmo dia da contratacao;
- a assinatura nao fique ativa antes do pagamento ser confirmado;
- o plano so seja efetivado quando a academia registrar o pagamento da cobranca inicial.

### Inconsistencia Encontrada

- bug tecnico real:
  - a cobranca inicial nascia com `dueDate = now`;
  - a checagem de inadimplencia comparava horario/minuto do vencimento com `now`;
  - por isso uma cobranca criada em `21/03/2026` podia cair como `overdue` no proprio dia `21/03/2026`.
- problema de regra implementada:
  - a assinatura inicial nascia como `ACTIVE` no ato da contratacao;
  - isso deixava o plano aparente como ativo antes da academia confirmar o pagamento.

### Correcao Aplicada

- a comparacao de vencimento passou a respeitar a data operacional do dia, e nao o timestamp exato:
  - [`finance-charge.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/finance/domain/finance-charge.ts)
  - [`finance-delinquency.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/finance/services/finance-delinquency.service.ts)
  - [`finance-student-state.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/finance/services/finance-student-state.service.ts)
- a contratacao inicial do plano passou a criar `Subscription = PENDING`, e nao `ACTIVE`:
  - [`finance-plan-transition.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/finance/services/finance-plan-transition.service.ts)
- a confirmacao do pagamento inicial passou a ativar a assinatura:
  - [`finance-dashboard.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/finance/services/finance-dashboard.service.ts)
  - [`finance-student-payments.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/finance/services/finance-student-payments.service.ts)
- a tela do aluno passou a mostrar o plano como solicitacao pendente enquanto o pagamento nao for confirmado:
  - [`student-app-plans.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/services/student-app-plans.service.ts)
  - [`student-plans-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/student/student-plans-screen.tsx)

### Revalidacao Real

- tenant real validado:
  - `dojo-centro`
- atores reais usados:
  - aluno temporario `finance.pending.1774096000@example.com`
  - admin seed `joao@academia.com`
- credenciais reais usadas:
  - aluno: autocadastro no host do tenant
  - admin: `joao@academia.com / 12345678`
- cenario 1: contratacao antes da confirmacao do pagamento
  - `POST /api/tenants/dojo-centro/enrollment-requests`
    - `201`
  - `GET /api/app/student/plans`
    - sem plano atual
  - `POST /api/app/student/plans`
    - `200`
    - retornou:
      - `currentPlanName = null`
      - `pendingPlanName = "Mensal Básico"`
      - `canActivateNewPlan = false`
  - `GET /api/app/student/payments`
    - `200`
    - retornou:
      - `planName = null`
      - `paymentStatus = pending`
      - `currentCharge.status = pending`
      - `currentCharge.dueDate = 2026-03-21`
  - banco confirmado:
    - `Subscription.status = PENDING`
    - `FinanceCharge.status = PENDING`
    - nenhum `overdue` no mesmo dia da contratacao
- cenario 2: confirmacao real do pagamento pela academia
  - `PATCH /api/finance/[chargeId]/payment`
    - `200`
    - dashboard refletiu a cobranca como `paid`
  - `GET /api/app/student/plans`
    - `200`
    - retornou:
      - `currentPlanName = "Mensal Básico"`
      - `nextBillingDate = 2026-04-21`
  - `GET /api/app/student/payments`
    - `200`
    - retornou:
      - `planName = "Mensal Básico"`
      - `paymentStatus = paid`
      - `currentCharge = null`
  - banco confirmado apos o pagamento:
    - `Subscription.status = ACTIVE`
    - `FinanceCharge.status = PAID`
    - `billingDay = 21`
- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou

### Cleanup

- o usuario temporario de validacao foi removido integralmente:
  - `User`
  - registros em cascata de membership, student profile, subscription, finance charge e sessoes
- confirmacao final:
  - `remaining_users = 0`

### Resultado

- contratar plano nao ativa mais a assinatura antes do pagamento;
- a cobranca inicial permanece `pending` no dia da contratacao;
- a academia passou a ser a etapa canonica de confirmacao que efetiva o plano;
- o app do aluno mostra claramente quando o plano ainda esta aguardando pagamento.

## Etapa 38 - Vinculo Administrativo De Plano Com Opcao De Pago

### Objetivo

Alinhar o cadastro administrativo de aluno com a regra nova do modulo `finance`, sem manter dois comportamentos diferentes para o mesmo produto:

- ao vincular plano direto no cadastro/edicao do aluno, o admin deve poder escolher se aquela cobranca inicial ja foi paga;
- se nao marcar como pago, o plano deve nascer pendente;
- se marcar como pago, o plano deve nascer efetivado.

### Inconsistencia Encontrada

- drift de regra real:
  - o app do aluno ja tinha passado a criar assinatura inicial como `PENDING` ate a confirmacao do pagamento;
  - mas o cadastro administrativo de aluno ainda vinculava plano por outro caminho, sem a mesma semantica e sem opcao explicita de pagamento;
- problema de UX administrativa:
  - faltava uma decisao clara no formulario do aluno para o admin dizer se o pagamento daquela vinculacao direta ja tinha sido recebido ou nao.

### Correcao Aplicada

- o contrato administrativo de aluno passou a aceitar `markPlanAsPaid`:
  - [`student-dashboard.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/students/domain/student-dashboard.ts)
  - [`student-upsert.parser.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/students/contracts/student-upsert.parser.ts)
  - [`modules/students/services/index.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/students/services/index.ts)
- o modulo `students` deixou de gravar assinatura diretamente e passou a delegar o vinculo de plano ao fluxo canonico do modulo `finance`:
  - [`student-dashboard.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/students/services/student-dashboard.service.ts)
  - [`finance-plan-transition.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/finance/services/finance-plan-transition.service.ts)
- a tela administrativa do aluno ganhou a opcao explicita `Marcar plano como pago` quando o plano esta sendo vinculado diretamente:
  - [`students-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/students/components/students-dashboard-screen.tsx)

### Revalidacao Real

- tenant real validado:
  - `dojo-centro`
- ator real usado:
  - admin seed `joao@academia.com / 12345678`
- plano real usado:
  - `Mensal Básico`

- cenario 1: admin cria aluno com plano e `markPlanAsPaid = false`
  - `POST /api/students`
    - `201`
    - aluno retornou com:
      - `planId = null`
      - `planName = null`
      - `paymentStatus = pending`
      - `nextPayment = 2026-03-21`
  - banco confirmado:
    - `Subscription.status = PENDING`
    - `FinanceCharge.status = PENDING`
    - `FinanceCharge.dueDate = 2026-03-21`
    - sem `paymentMethod`
  - regra academica preservada:
    - `StudentActivity = 1`
    - `StudentModality = 0`

- cenario 2: admin cria aluno com plano e `markPlanAsPaid = true`
  - `POST /api/students`
    - `201`
    - aluno retornou com:
      - `planId = Mensal Básico`
      - `paymentStatus = paid`
      - `lastPayment = 2026-03-21`
      - `nextPayment = 2026-04-21`
  - banco confirmado:
    - `Subscription.status = ACTIVE`
    - `FinanceCharge.status = PAID`
    - `FinanceCharge.paymentMethod = CASH`
    - `FinanceCharge.paidAt = 2026-03-21`
    - `billingDay = 21`
  - regra academica preservada:
    - `StudentActivity = 1`
    - `StudentModality = 0`

- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou

### Cleanup

- removidos todos os usuarios temporarios criados para esta rodada:
  - `admin.plan.pending.*@example.com`
  - `admin.plan.paid.*@example.com`
- confirmacao final:
  - `remaining_admin_plan_validation_users = 0`

### Resultado

- o cadastro administrativo de aluno agora segue a mesma regra canonica do modulo `finance`;
- o admin passou a decidir explicitamente se a vinculacao direta do plano ja entra como paga ou nao;
- sem marcar pagamento, o plano nasce pendente;
- marcando pagamento, o plano ja nasce efetivado;
- o cadastro do aluno continua independente de turma/modalidade, preservando o modelo `activity-first`.

## Etapa 39 - Refactor De UI Da Aba Site

### Objetivo

Refatorar a UI/UX do dashboard em `Site` para seguir fielmente o layout e o comportamento da referencia visual em `reference-ui/templates-site-ui /LAYOUT-UI`, sem copiar a arquitetura dela e sem manter o layout antigo residual no codigo.

### Inconsistencia Encontrada

- problema claro de UX e consistencia visual:
  - a tela atual usava accordion, cards fragmentados e modal simples;
  - a referencia usa barra de status, bloco de identidade/SEO, lista de secoes arrastavel, card lateral de template e edicao por sheet lateral;
  - a experiencia atual parecia um builder diferente do padrao visual que queremos consolidar no dashboard.
- classificacao:
  - nao era bug de regra de negocio;
  - era drift de layout e comportamento da interface.

### Correcao Aplicada

- a tela [`site-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/site/components/site-dashboard-screen.tsx) foi reescrita para o layout da referencia:
  - header com CTA principal;
  - barra de status do site;
  - card `Identidade e SEO`;
  - card `Seções do site`;
  - card lateral `Modelo do site`;
  - edicao da secao em sheet lateral;
  - rodape de estado com autosave.
- a lista de secoes passou a usar drag-and-drop proprio do modulo em:
  - [`site-sections-list.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/site/components/site-sections-list.tsx)
- o projeto recebeu as dependencias necessarias para o comportamento arrastavel:
  - `@dnd-kit/core`
  - `@dnd-kit/sortable`
  - `@dnd-kit/utilities`
- a tipagem de `theme` do modulo `site` foi expandida para refletir os campos de identidade persistidos pelo editor:
  - [`site.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/site/domain/site.ts)

### Revalidacao Real

- tenant real validado:
  - `dojo-centro`
- ator real usado:
  - admin seed `joao@academia.com / 12345678`
- smoke real de UI:
  - login no dashboard real;
  - abertura de `/dashboard/site`;
  - confirmacao visual do layout novo com:
    - CTA `Salvar e publicar`;
    - barra de status com `Rascunho`;
    - card `Identidade e SEO`;
    - card `Seções do site`;
    - card `Modelo do site`;
  - abertura da edicao de `Cabeçalho` em sheet lateral;
  - confirmacao dos campos:
    - `Título do menu`
    - `Cor de fundo`
    - `Cor do texto`
- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou
- artefato salvo em:
  - [`site-dashboard-ui-refactor-smoke.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/site-dashboard-ui-refactor-smoke.png)

### Cleanup

- browser temporario da validacao foi encerrado;
- sem dados temporarios de dominio para remover nesta rodada.

### Resultado

- a aba `Site` agora segue o layout e o fluxo visual da referencia escolhida;
- o accordion antigo saiu do codigo e foi substituido por uma tela coerente com o builder novo;
- a ordenacao das secoes passou a ser arrastavel;
- a edicao das secoes saiu do modal antigo e foi para sheet lateral;
- a camada de backend do modulo `site` permaneceu intacta, com a mudanca concentrada na UX do dashboard.

## Etapa 40 - Refactor De UI/UX Da Aba Marketing

### Objetivo

Refatorar a UI/UX do dashboard em `Marketing` para seguir o layout e o fluxo de uso da referencia visual em `reference-ui/templates-site-ui /LAYOUT-UI`, sem copiar a arquitetura dela e sem manter o monolito antigo residual no codigo.

### Inconsistencia Encontrada

- problema claro de UX e organizacao da interface:
  - a tela atual concentrava identidade visual, criacao e templates em um unico arquivo muito grande;
  - o layout antigo nao seguia a navegacao por abas compactas nem o fluxo guiado da referencia;
  - `Templates` nao tinha preview dialog consistente;
  - o comportamento de `usar template` nao estava alinhado a um fluxo guiado de criacao.
- classificacao:
  - nao era bug de regra de negocio;
  - era drift de UX, composicao de tela e organizacao do frontend.

### Correcao Aplicada

- a tela [`marketing-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/marketing/components/marketing-dashboard-screen.tsx) foi reescrita como container fino com:
  - header contextual por aba;
  - CTA de salvar apenas em `Identidade Visual`;
  - abas `Identidade Visual`, `Criar Conteúdo` e `Templates`;
  - sincronizacao da aba ativa com query param `?tab=`.
- o modulo `marketing` foi decomposto em componentes proprios:
  - [`brand-identity-tab.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/marketing/components/brand-identity-tab.tsx)
  - [`create-content-tab.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/marketing/components/create-content-tab.tsx)
  - [`templates-tab.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/marketing/components/templates-tab.tsx)
- o comportamento compartilhado e os presenters de UX foram extraidos para:
  - [`marketing-dashboard.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/marketing/lib/marketing-dashboard.ts)
- o fluxo de `Criar Conteúdo` passou a seguir 4 etapas guiadas:
  - objetivo;
  - formato;
  - composicao;
  - resultado.
- a etapa `Resultado` foi alinhada ao comportamento da referencia:
  - painel esquerdo focado em geracao da imagem final;
  - painel direito focado em revisar texto, hashtags e reescrever;
  - CTA `Criar outro` no topo;
  - download bloqueado ate existir imagem final;
  - historico lateral antigo removido dessa etapa.
- o pente-fino visual posterior tambem alinhou microcomportamentos da referencia:
  - CTA de salvar sempre visivel em `Identidade Visual`;
  - acoes de `Trocar logo` e remocao direta do logo;
  - bloco de materiais visuais mais proximo do card da referencia;
  - filtros de `Templates` usando selects do design system;
  - feedback visual de `Template aplicado`.
- o fluxo de geracao em `Criar Conteúdo` tambem foi ajustado:
  - o clique em `Gerar conteúdo` na etapa 3 agora gera texto e imagem automaticamente antes de entrar em `Resultado`;
  - a etapa `Resultado` nao exibe mais previa intermediaria como se fosse etapa separada;
  - o CTA da imagem virou `Gerar outra nova imagem`, refletindo apenas regeneracao.
- a aba `Templates` passou a ter:
  - busca;
  - filtros;
  - grid visual;
  - preview dialog;
  - acao `Usar template` levando ao fluxo de criacao.
- a camada de backend do modulo `marketing` foi preservada:
  - `brand-kit`, `templates`, `history`, `generate` e `generate-image` continuaram sendo consumidos pelas mesmas APIs.

### Revalidacao Real

- tenant real validado:
  - `dojo-centro`
- ator real usado:
  - admin seed `joao@academia.com / 12345678`
- smoke real de UI:
  - login no dashboard real;
  - abertura de `/dashboard/marketing`;
  - confirmacao visual do header novo e das abas;
  - confirmacao visual da aba `Identidade Visual`;
  - abertura da aba `Templates`.
- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou
- artefatos salvos em:
  - [`marketing-dashboard-ui-refactor-smoke.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/marketing-dashboard-ui-refactor-smoke.png)
  - [`marketing-dashboard-tabs-smoke.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/marketing-dashboard-tabs-smoke.png)

### Cleanup

- browser temporario da validacao foi encerrado;
- sem dados temporarios de dominio para remover nesta rodada.

### Resultado

- a aba `Marketing` agora segue o layout e o fluxo da referencia escolhida sem copiar a estrutura dela;
- a tela deixou de ser um monolito de interface e passou a ter composicoes proprias por responsabilidade;
- `Templates` ganhou preview dialog e entrada coerente no fluxo de criacao;
- `Criar Conteúdo` ficou guiado por etapas, sem mover regra de negocio para o frontend;
- o backend do modulo `marketing` permaneceu canonicamente no mesmo ownership, com a mudanca concentrada na camada de UX do dashboard.

## Etapa 41 - Marketing Com Atividade Principal E Imagem De IA Habilitada

### O Que Foi Validado

- configuracao real de IA do marketing no dashboard;
- fonte canonica das atividades principais da academia para o marketing;
- geracao real de conteudo com `activityCategory`;
- geracao real da imagem da peca;
- presenca visual do dropdown de atividade na etapa 3 de `Criar Conteúdo`.

### Inconsistencia Encontrada

- a geracao de imagem ainda nascia desabilitada no modulo, mesmo com o fluxo de `Resultado` ja dependendo dela;
- a etapa 3 nao deixava o admin escolher a atividade principal da academia para contextualizar a campanha;
- o marketing ainda nao tinha uma API propria para listar essas atividades no dashboard.

### Correcao Aplicada

- o default de `allowImageGeneration` foi convergido para `true` em:
  - [`marketing-ai.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/marketing/domain/marketing-ai.ts)
  - [`schema.prisma`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/prisma/schema.prisma)
  - [`migration.sql`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/prisma/migrations/20260321121500_marketing_ai_enable_image_generation_default/migration.sql)
- o modulo `marketing` passou a expor a rota canonica:
  - [`/api/marketing/academy-activities`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/marketing/academy-activities/route.ts)
- a fonte de verdade das atividades do marketing ficou em:
  - [`marketing-academy-activities.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/marketing/services/marketing-academy-activities.service.ts)
- o contrato de geracao foi expandido com `activityCategory` em:
  - [`marketing.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/marketing/domain/marketing.ts)
  - [`marketing-generation-mappers.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/marketing/domain/marketing-generation-mappers.ts)
- o service de geracao passou a usar a atividade no texto e na imagem em:
  - [`marketing-generation.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/marketing/services/marketing-generation.service.ts)
- a UI da etapa 3 ganhou dropdown real de atividade em:
  - [`create-content-tab.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/marketing/components/create-content-tab.tsx)
  - [`marketing-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/marketing/components/marketing-dashboard-screen.tsx)
  - [`modules/marketing/services/index.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/marketing/services/index.ts)

### Revalidacao Real

- tenant real validado:
  - `academia-jiu-jitea`
- ator real usado:
  - `ju@gmail.com / 12345678`
- API real:
  - `GET /api/marketing/ai-settings`: retornou `allowImageGeneration = true`
  - `GET /api/marketing/academy-activities`: retornou `Jiu Jitsu` e `Muay Thai`
  - `POST /api/marketing/generate` com `activityCategory = jiu-jitsu`: retornou `headline = "Matriculas abertas para Jiu Jitsu"` e persistiu `input.activityCategory = "jiu-jitsu"`
  - `POST /api/marketing/generate-image`: retornou sucesso e anexou `result.imageUrl` na mesma geracao
- UI real:
  - abertura de `/dashboard/marketing?tab=create`
  - navegacao ate a etapa 3
  - confirmacao visual do dropdown de atividade principal
- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou
- artefato salvo em:
  - [`marketing-activity-dropdown-smoke.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/marketing-activity-dropdown-smoke.png)

### Cleanup

- a geracao temporaria usada na validacao real foi removida do banco:
  - `marketingGeneration.id = cmn0cplla004980u8unls4rjj`
- as configuracoes de IA permanecem habilitadas porque isso faz parte da mudanca canonica do modulo.

### Resultado

- a IA de imagem ficou efetivamente habilitada no modulo e no banco;
- o marketing passou a receber o contexto de atividade principal da academia, sem confundir com modalidade;
- a etapa 3 agora obriga o contexto correto quando houver atividades disponiveis;
- texto e imagem usam a mesma fonte de verdade para a atividade da campanha.

### Refinamento Posterior

- o campo `Atividade principal da campanha` foi movido para o mesmo grid de ajustes da etapa 3, ficando ao lado esquerdo de `Tom do conteúdo`, em:
  - [`create-content-tab.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/marketing/components/create-content-tab.tsx)
- a geracao de marketing foi reforcada para sempre levar a identidade visual quando existir:
  - cores da marca;
  - logotipo oficial selecionado;
  - observacoes da marca.
- esse reforco passou a acontecer no backend, em:
  - [`marketing-generation.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/marketing/services/marketing-generation.service.ts)
- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou

### Refinamento Posterior 2

### O Que Foi Validado

- geracao real de imagem com `story` no tenant `academia-jiu-jitea`;
- obediencia do formato selecionado na imagem final;
- obediencia das instrucoes adicionais do usuario para evitar montagem ruim;
- preview de `Resultado` respeitando o formato real da peca.

### Inconsistencia Encontrada

- a API de imagem ainda deixava provider gerar composicao quadrada mesmo quando o formato selecionado era vertical;
- o prompt de imagem ainda aceitava montagem, colagem e logo dominante;
- a tela de `Resultado` forcava preview quadrado, mascarando o formato real.

### Correcao Aplicada

- o request canonico de imagem passou a carregar `aspectRatio` em:
  - [`marketing-ai.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/marketing/domain/marketing-ai.ts)
  - [`marketing-format.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/marketing/domain/marketing-format.ts)
- os providers passaram a respeitar o formato selecionado:
  - OpenAI usa tamanho coerente com a proporcao em [`openai-marketing-provider.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/marketing/services/providers/openai-marketing-provider.ts)
  - Gemini usa `imageConfig.aspectRatio` em [`gemini-marketing-provider.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/marketing/services/providers/gemini-marketing-provider.ts)
- o prompt de imagem foi endurecido em [`marketing-generation.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/marketing/services/marketing-generation.service.ts):
  - cena unica e integrada;
  - proibicao explicita de colagem, mosaico, flyer, mockup e foto colada;
  - `promptNotes` como regra obrigatoria;
  - logo apenas como apoio discreto, nunca como sujeito principal;
- o fallback interno de imagem passou a respeitar `post`, `carousel`, `story` e `reels` no mesmo service;
- o preview do `Resultado` deixou de forcar quadrado em:
  - [`create-content-tab.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/marketing/components/create-content-tab.tsx)
  - [`marketing-dashboard.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/marketing/lib/marketing-dashboard.ts)

### Revalidacao Real

- ator real usado:
  - `ju@gmail.com / 12345678`
- tenant real validado:
  - `academia-jiu-jitea`
- cenário real executado:
  - `POST /api/marketing/generate` com:
    - `objective = kids`
    - `contentType = story`
    - `activityCategory = jiu-jitsu`
    - `promptNotes = "Use foto realista de criancas treinando jiu jitsu com quimono, em aula infantil, sem montagem, sem colagem, sem mosaico. Cena unica, ambiente real de academia. Deve parecer uma fotografia unica."`
  - `POST /api/marketing/generate-image` na mesma geracao
- resultado real confirmado:
  - `suggestedFormat = story`
  - `mimeType = image/png`
  - dimensoes reais extraidas do arquivo: `768 x 1344`
  - imagem final validada visualmente como cena unica de criancas treinando, sem montagem ruim
- artefato salvo em:
  - [`marketing-story-ai-validation.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/marketing-story-ai-validation.png)

### Cleanup

- a geracao temporaria usada na validacao real foi removida do banco:
  - `marketingGeneration.id = cmn0dvhtp004n80u85272jy82`
- os lancamentos de uso tecnico ligados a essa rodada tambem foram removidos:
  - `eventType = CAPTION_GENERATION`
  - `eventType = IMAGE_GENERATION`

### Resultado

- a imagem agora respeita o formato selecionado no marketing;
- a instrucao do usuario influencia a cena final de forma obrigatoria;
- o resultado deixou de parecer montagem quadrada improvisada;
- a tela de `Resultado` passou a mostrar a proporcao correta da peca.

### Refinamento Posterior 3

### O Que Foi Validado

- convergencia do tratamento de logotipo para o multiprovider canonico do `marketing`;
- uso do mesmo `primaryImageProvider` e `fallbackImageProvider` do tenant para tratar o logo;
- persistencia da versao tratada como logo oficial do `brand-kit`;
- preservacao do asset original em metadata;
- cleanup completo do tenant de validacao.

### Inconsistencia Encontrada

- o multiprovider de `marketing` existia para texto e imagem de campanha, mas o tratamento do logo tinha nascido fora dele;
- isso criava uma trilha paralela de provider, fora da fronteira canonica do modulo;
- alem disso, o metadata do original precisava preservar o arquivo bruto corretamente.

### Correcao Aplicada

- o contrato do modulo ganhou operacao explicita de tratamento de logo em:
  - [`marketing-ai.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/marketing/domain/marketing-ai.ts)
- o client de provider passou a expor `enhanceLogo` em:
  - [`marketing-ai-provider.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/marketing/services/providers/marketing-ai-provider.ts)
- o orquestrador canonico passou a tratar logo com a mesma ordem `primary -> fallback` do tenant em:
  - [`marketing-ai-orchestrator.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/marketing/services/marketing-ai-orchestrator.service.ts)
- os adapters concretos foram alinhados:
  - OpenAI em [`openai-marketing-provider.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/marketing/services/providers/openai-marketing-provider.ts)
  - Gemini em [`gemini-marketing-provider.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/marketing/services/providers/gemini-marketing-provider.ts)
- o service de identidade visual passou a usar o orquestrador, sem fluxo paralelo de provider, em:
  - [`marketing-logo-enhancement.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/marketing/services/marketing-logo-enhancement.service.ts)
  - [`marketing-brand-kit.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/marketing/services/marketing-brand-kit.service.ts)
- a UI administrativa passou a refletir o estado do logo tratado em:
  - [`brand-identity-tab.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/marketing/components/brand-identity-tab.tsx)
  - [`marketing-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/marketing/components/marketing-dashboard-screen.tsx)

### Revalidacao Real

- ator real usado:
  - `ju@gmail.com / 12345678`
- tenant real validado:
  - `academia-jiu-jitea`
- cenário real:
  - leitura do `brand-kit` atual;
  - upload temporario de logo raster com fundo;
  - `PUT /api/marketing/brand-kit` no tenant real;
  - nova gravacao do mesmo payload para confirmar metadata do original.
- resultado real confirmado:
  - `logoEnhancement.status = succeeded`
  - `provider = gemini`
  - `metadata.originalAsset` preservado e diferente do arquivo tratado atual
  - arquivo tratado persistido em `1024 x 1024`
- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou
- artefato salvo em:
  - [`marketing-logo-enhanced-validation.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/marketing-logo-enhanced-validation.png)

### Cleanup

- o `brand-kit` do tenant `academia-jiu-jitea` foi restaurado ao estado original apos a validacao;
- `selectedLogoAssetId` voltou para `b1f74faf-ed5a-4ee1-b7cb-979b3e623fed`.

### Resultado

- o tratamento de logo passou a fazer parte do multiprovider canonico do modulo `marketing`;
- o logo melhorado pode virar o asset oficial reutilizado nos criativos;
- a trilha tecnica deixou de depender de uma implementacao paralela fora do orquestrador principal.

### Refinamento Posterior 4

### Inconsistencia Encontrada

- o prompt de tratamento do logotipo ainda falava em preservar identidade, mas nao fechava explicitamente a proibicao de alterar cores da marca.

### Correcao Aplicada

- o prompt canonico do tratamento de logo foi endurecido em:
  - [`marketing-logo-enhancement.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/marketing/services/marketing-logo-enhancement.service.ts)
- a regra agora deixa explicito que o orquestrador:
  - nao pode recolorir;
  - nao pode reinterpretar;
  - nao pode clarear, escurecer ou remapear qualquer cor;
  - deve manter exatamente as cores originais do arquivo enviado.

### Resultado

- a regra de marca ficou fechada no backend do `marketing`;
- qualquer provider chamado pelo multiprovider recebe a mesma proibicao explicita de alterar cor do logotipo.

### Refinamento Posterior 6

### O Que Foi Validado

- publicacao real do modulo `site`;
- relacao entre `TenantSite.status` e a home do host do tenant;
- consistencia entre builder administrativo e superficie publica.

### Inconsistencia Encontrada

- o modulo `site` publicava corretamente por `POST /api/site/publish`, mas a home principal do host do tenant (`/`) ignorava totalmente esse estado;
- na pratica, mesmo com o site publicado, a home do tenant continuava redirecionando para `/app`;
- isso fazia o toggle `Publicado` parecer ineficaz como experiencia de "colocar o site no ar".

### Correcao Aplicada

- a home raiz do tenant agora consulta o estado publico do modulo `site` em:
  - [`app/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/page.tsx)
- quando existir `TenantSite.status = published`, visitantes sem membership ativa no tenant passam a receber o site publico canonico;
- membros autenticados do proprio tenant continuam sendo redirecionados para sua superficie correta:
  - `academy_admin` -> `/dashboard`
  - `teacher` -> `/app/teacher`
  - `student` -> `/app/student`
- a renderizacao publica continua usando o mesmo componente e service canonicos:
  - [`app/site/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/site/page.tsx)
  - [`site-public.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/site/services/site-public.service.ts)

### Validacao

- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou
- validacao de estado real no banco:
  - tenant `academia-jiu-jitea` estava em `TenantSite.status = DRAFT` no momento da analise;
  - isso confirmou que, naquele instante, o site realmente nao estava publicado.

### Resultado

- a publicacao do modulo `site` passou a ter efeito real na home publica do tenant;
- o builder administrativo e a superficie publica voltaram a falar a mesma lingua;
- o fluxo de "publicar o site" deixou de depender de lembrar manualmente da rota `/site` para existir como home publica.

### Refinamento Posterior 7

### Inconsistencia Encontrada

- o botao `Ver site` do builder estava abrindo `http://localhost:3000/site` quando o dashboard era usado no host da plataforma;
- isso ignorava o tenant selecionado e levava para `404`, porque a rota publica de `site` precisa estar no host da academia.

### Correcao Aplicada

- o preview do builder passou a montar a URL publica do tenant com base no `tenantSlug` atual em:
  - [`site-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/site/components/site-dashboard-screen.tsx)
- o link agora abre `tenantSlug.localhost:3000/site` em ambiente local, em vez de `/site` relativo no host atual.

### Validacao

- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou

### Resultado

- o CTA `Ver site` voltou a apontar para a superficie publica correta da academia;
- o preview deixou de quebrar quando o dashboard esta no host da plataforma.

### Refinamento Posterior 8

### O Que Foi Ajustado

- o dashboard ganhou calendario semanal reutilizavel para navegacao por data em:
  - `Presenca`
  - `Eventos`
- os cards existentes nao foram redesenhados;
- o calendario apenas passou a controlar quais cards do dia aparecem abaixo.

### Arquivos Ajustados

- [`date-week-calendar.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/components/ui/date-week-calendar.tsx)
- [`attendance-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/attendance/components/attendance-dashboard-screen.tsx)
- [`events-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/events/components/events-dashboard-screen.tsx)

### Regras Aplicadas

- em `Presenca`, a lista operacional deixou de ser fixa em `hoje` e passou a responder ao dia selecionado no calendario;
- em `Eventos`, o calendario filtra os cards do dia escolhido sem alterar o layout dos cards;
- o estado visual dos cards permaneceu como estava; apenas a origem do filtro passou a ser a data selecionada.

### Validacao

- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou

### Resultado

- `Presenca` e `Eventos` agora seguem o mesmo padrao mental da agenda do professor;
- o dashboard ganhou navegacao por data sem espalhar outra variacao de card ou duplicar layout.

### Refinamento Posterior 9

### O Que Foi Ajustado

- a hierarquia visual de `Presenca` foi alinhada com `Eventos`;
- os filtros sairam do topo da tela e passaram para um bloco proprio acima do calendario;
- os botoes superiores de `Relatorio` e `QR Code` foram removidos do header da tela;
- o restante da operacao e os cards da chamada permaneceram como estavam.

### Arquivo Ajustado

- [`attendance-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/attendance/components/attendance-dashboard-screen.tsx)

### Validacao

- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou

### Resultado

- `Presenca` ficou com a mesma ordem mental de navegacao usada em `Eventos`;
- a tela ganhou leitura mais limpa no topo sem perder a operacao detalhada da aula.

### Refinamento Posterior 5

### O Que Foi Ajustado

- a aba `Identidade Visual` do marketing deixou de depender do botao `Salvar alteracoes`;
- toda mudanca do `brand-kit` agora salva automaticamente com debounce e toast de sucesso;
- o picker de cores foi alinhado ao layout de referencia com seletor visual + campo hexadecimal lado a lado;
- no mobile, a barra com `Voltar` e `Continuar` da aba `Criar Conteudo` passou a ficar fixa acima do menu inferior do dashboard;
- o prompt canonico de imagem foi endurecido para:
  - nao usar nenhum logotipo quando nao for possivel aplicar o da propria academia de forma natural;
  - nunca inventar ou referenciar logotipos de marcas concorrentes.

### Arquivos Ajustados

- [`marketing-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/marketing/components/marketing-dashboard-screen.tsx)
- [`brand-identity-tab.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/marketing/components/brand-identity-tab.tsx)
- [`create-content-tab.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/marketing/components/create-content-tab.tsx)
- [`marketing-generation.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/marketing/services/marketing-generation.service.ts)

### Validacao

- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou

### Resultado

- o fluxo de identidade visual ficou coerente com autosave, sem resquicio do CTA manual antigo;
- o mobile da criacao de conteudo deixou de depender de rolagem para navegar entre etapas;
- a regra de imagem ficou mais segura para marca, evitando aparicao de logos indevidos.

### Refinamento Posterior 10

### O Que Foi Ajustado

- a tela `Presenca` do app do professor ganhou o mesmo calendario semanal usado no dashboard;
- a listagem de turmas do dia deixou de usar o card antigo e passou a seguir o layout visual do card operacional da academia;
- o backend do app do professor deixou de entregar apenas o dia atual e passou a montar sessoes da semana corrente, com `sessionDate` e `dateLabel` por card;
- o salvamento da chamada deixou de gravar sempre `hoje` e passou a usar a data real da sessao selecionada.

### Arquivos Ajustados

- [`teacher-attendance-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/components/teacher/teacher-attendance-screen.tsx)
- [`teacher-app-attendance.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/services/teacher-app-attendance.service.ts)
- [`teacher-app.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/domain/teacher-app.ts)

### Validacao

- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou

### Resultado

- o professor agora navega a chamada por data real, sem ficar preso ao dia atual;
- a leitura visual das turmas do dia ficou coerente com o dashboard da academia sem duplicar arquitetura;
- o fluxo deixou de ter risco de salvar presenca na data errada.

### Refinamento Posterior 11

### O Que Foi Ajustado

- no mobile do app do professor, a barra de acao da chamada passou a ficar fixa acima do menu inferior;
- enquanto nao houver marcacoes, a barra mostra `Marcar todos presentes` e `Resetar`;
- quando houver qualquer marcacao na turma selecionada, a barra troca para `Finalizar chamada` e `Resetar`;
- ao resetar, a barra volta para o estado inicial com `Marcar todos presentes`.

### Arquivo Ajustado

- [`teacher-attendance-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/components/teacher/teacher-attendance-screen.tsx)

### Validacao

- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou

### Resultado

- a chamada ficou operavel no mobile sem depender de rolagem para os botoes principais;
- a troca de estado da barra fixa deixou o fluxo mais direto entre marcar, resetar e finalizar.

## Etapa 42 - Graduações No Perfil Do Aluno E Do Professor

### Objetivo

Adicionar no app do aluno e no app do professor uma aba `Graduacoes` dentro do perfil, permitindo autorregistro do historico por atividade principal, sem empurrar regra para a UI e mantendo o filtro de faixas/graus alinhado ao `Sistema de faixas` da academia.

### O Que Estava Inconsistente

- o app do aluno e o app do professor nao tinham uma superficie propria para o usuario registrar seu historico de graduacoes;
- o admin ainda conseguia cair em campos de faixa livres, sem filtrar pelo sistema de faixas da academia;
- o backend do aluno atualizava a faixa atual mesmo quando uma graduacao retroativa era adicionada depois, o que poderia distorcer o estado atual;
- no ambiente local, o endpoint novo do professor quebrava em runtime porque a migration de `TeacherGraduation` ainda nao tinha sido aplicada e o processo `next dev` estava com Prisma Client antigo em memoria.

### O Que Foi Ajustado

- foi criado o catalogo canonico de niveis por atividade em:
  - [`graduation-level-catalog.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/graduations/domain/graduation-level-catalog.ts)
- o fluxo administrativo de graduacao do aluno passou a filtrar faixa e graus pelo sistema de faixas da academia em:
  - [`students-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/students/components/students-dashboard-screen.tsx)
- o dashboard de professores passou a usar catalogo filtrado da academia para o campo de faixa do cadastro em:
  - [`teacher-dashboard.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/teachers/services/teacher-dashboard.service.ts)
  - [`teachers-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/teachers/components/teachers-dashboard-screen.tsx)
- foram adicionados BFFs proprios de perfil para graduacoes:
  - [`app/api/app/student/profile/graduations/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/app/student/profile/graduations/route.ts)
  - [`app/api/app/teacher/profile/graduations/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/app/teacher/profile/graduations/route.ts)
- foram criados services proprios de app para carregar e registrar graduacoes:
  - [`student-app-profile-graduations.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/services/student-app-profile-graduations.service.ts)
  - [`teacher-app-profile-graduations.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/services/teacher-app-profile-graduations.service.ts)
  - [`teacher-graduation.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/teachers/services/teacher-graduation.service.ts)
- o app do aluno e o app do professor ganharam a aba `Graduacoes` no perfil usando componente compartilhado:
  - [`profile-graduations-tab.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/features/profile/base/profile-graduations-tab.tsx)
  - [`student-profile-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/student/student-profile-screen.tsx)
  - [`app/app/student/profile/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/app/student/profile/page.tsx)
  - [`app/app/teacher/profile/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/app/teacher/profile/page.tsx)
- a persistencia do professor passou a ter historico proprio em:
  - [`schema.prisma`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/prisma/schema.prisma)
  - [`migration.sql`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/prisma/migrations/20260321133000_teacher_profile_graduations/migration.sql)
- o registro de graduacao retroativa do aluno deixou de sobrescrever a faixa atual quando a data nao for a mais recente da atividade em:
  - [`graduation-dashboard.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/graduations/services/graduation-dashboard.service.ts)

### Validacao

- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou
  - `./node_modules/.bin/prisma migrate deploy`: aplicou `20260321133000_teacher_profile_graduations`
  - `./node_modules/.bin/prisma generate`: regenerou o client antes de reiniciar o `next dev`
- API real no tenant `academia-jiu-jitea`:
  - `GET /api/app/student/profile/graduations`: `200`
    - retornou abas `Jiu Jitsu` e `Muay Thai`
    - `student` exposto com `currentBelt = Branca` no inicio e niveis filtrados do sistema da academia
  - `GET /api/app/teacher/profile/graduations`: `200`
    - retornou `Jiu Jitsu`
    - `teacher` exposto com `currentBelt = Preta` vindo do cadastro administrativo
  - `POST /api/app/student/profile/graduations` com `2026-06`: `200`
  - `POST /api/app/student/profile/graduations` com `2026-04` depois do lancamento mais novo: `200`
    - o historico voltou ordenado por mes/ano:
      - `Jiu Jitsu - Azul - 06/2026`
      - `Jiu Jitsu - Branca 2 graus - 04/2026`
    - a faixa atual do aluno permaneceu na mais recente (`Azul`)
  - `POST /api/app/teacher/profile/graduations` com `2025-06`: `200`
    - o historico do professor foi criado
    - a faixa atual do professor permaneceu `Preta`, preservando o cadastro administrativo como fonte de verdade
  - `GET /api/students`: `200`
    - o payload administrativo passou a expor `graduationLevels` filtrados por atividade
  - `GET /api/teachers/records`: `200`
    - retornou `graduationCatalog` filtrado por atividade para o form administrativo de professores
- UI real:
  - perfil do aluno em `/app/student/profile` exibiu a aba `Graduacoes`, as duas tabs de atividade e o historico compacto reordenado
  - perfil do professor em `/app/teacher/profile` exibiu a aba `Graduacoes`, o formulario de registro e a faixa atual preservada como `Preta`

### Artefatos

- [`student-profile-graduations-smoke.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/student-profile-graduations-smoke.png)
- [`teacher-profile-graduations-smoke.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/teacher-profile-graduations-smoke.png)

### Refinamento Posterior 13 - editar graduacoes no perfil do aluno e professor

### O que estava inconsistente

- a aba `Graduacoes` do perfil ja permitia adicionar historico, mas nao tinha acao de editar cada faixa ja lancada;
- isso deixava o fluxo incompleto no app do aluno e no app do professor, porque qualquer erro de data, faixa ou observacao exigia novo lancamento em vez de correcao do existente.

### O que foi alterado

- foi adicionado `PATCH` canonicamente nos BFFs de perfil:
  - [`app/api/app/student/profile/graduations/[graduationId]/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/app/student/profile/graduations/%5BgraduationId%5D/route.ts)
  - [`app/api/app/teacher/profile/graduations/[graduationId]/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/app/teacher/profile/graduations/%5BgraduationId%5D/route.ts)
- os services de app passaram a expor atualizacao de historico:
  - [`student-app-profile-graduations.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/services/student-app-profile-graduations.service.ts)
  - [`teacher-app-profile-graduations.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/services/teacher-app-profile-graduations.service.ts)
- o dominio de graduacoes do aluno ganhou atualizacao de lancamento com sincronizacao da faixa atual da atividade quando houver historico mais recente em:
  - [`graduation-dashboard.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/graduations/services/graduation-dashboard.service.ts)
- o historico proprio do professor ganhou `update` canonicamente em:
  - [`teacher-graduation.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/teachers/services/teacher-graduation.service.ts)
- o componente compartilhado do perfil passou a exibir botao `Editar` em cada registro e reusar o mesmo modal em modo pre-preenchido:
  - [`profile-graduations-tab.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/features/profile/base/profile-graduations-tab.tsx)
- as paginas do app do aluno e do professor passaram a consumir a nova mutacao:
  - [`app/app/student/profile/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/app/student/profile/page.tsx)
  - [`app/app/teacher/profile/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/app/teacher/profile/page.tsx)
  - [`student-profile-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/student/student-profile-screen.tsx)

### Validacao

- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou
- UI real no tenant `academia-jiu-jitea` com `aluno@gmail.com`:
  - a aba `Graduacoes` exibiu `3` botoes `Editar` no historico do aluno;
  - o clique em `Editar` abriu o modal com titulo `Editar graduacao`;
  - o campo de data veio preenchido com mascara `MM/AAAA` (`06/2026`);
  - o `PATCH /api/app/student/profile/graduations/[graduationId]` respondeu `200` com `message = Graduação atualizada com sucesso.`

### Cleanup

- a validacao do `PATCH` foi feita reenviando o mesmo registro, sem criar nova graduacao nem alterar o historico de forma residual.

### Bugs Encontrados

- o endpoint do professor falhava com `500` no ambiente local porque:
  - a migration `TeacherGraduation` ainda nao tinha sido aplicada no banco local;
  - o `next dev` que estava no ar ainda mantinha o Prisma Client antigo em memoria, sem a relacao `graduations` em `TeacherProfile`.
- o service do aluno ainda tentava usar `studentProfile.name`, campo inexistente naquele aggregate, no fallback de `evaluatorName`.
- o filtro de catalogo de faixas do admin de professores tinha drift de tipagem no `activityCategory`.

### Cleanup

- as graduacoes temporarias de QA foram removidas de:
  - `TeacherGraduation`
  - `StudentGraduation`
- o aluno `aluno@gmail.com` foi realinhado ao ultimo registro remanescente ja existente no banco (`Roxa`, `2026-05`) para nao deixar incoerencia entre historico e faixa atual;
- o `next dev` foi reiniciado para carregar o Prisma Client regenerado e permaneceu no ar ao final da rodada.

### Resultado

- aluno e professor agora conseguem registrar o proprio historico de graduacoes no app, por atividade principal;
- aluno, professor e admin passaram a consumir o mesmo sistema de faixas da academia para limitar faixa, cor e graus;
- graduacoes retroativas deixaram de corromper a faixa atual do aluno;
- a implementacao ficou dentro das fronteiras do modulo, sem deixar regra de faixa solta na UI.

### Refinamento Posterior 12

### O Que Foi Ajustado

- a UX da aba `Graduacoes` no perfil do aluno e do professor deixou de usar o bloco de formulario aberto abaixo das tabs de atividade;
- o layout passou a seguir o mesmo modelo visual da aba `Titulos` da referencia:
  - card `Minhas graduacoes`;
  - botao `Adicionar` no header;
  - formulario em modal;
  - lista de historico no proprio card;
- o campo de data deixou de usar `type="month"` e passou a usar mascara `MM/AAAA`, convertendo para o formato canonico apenas no submit.

### Arquivo Ajustado

- [`profile-graduations-tab.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/features/profile/base/profile-graduations-tab.tsx)

### Validacao

- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou
- smoke real:
  - perfil do aluno em `/app/student/profile`
  - aba `Graduacoes`
  - botao `Adicionar` abriu o modal corretamente
  - o campo de data mascarou `062025` como `06/2025`

### Resultado

- a experiencia de cadastro de graduacao ficou mais coerente com o perfil mobile;
- o fluxo visual ficou mais simples para aluno e professor, sem resquicio do formulario expandido antigo.

### Refinamento Posterior 14

### O Que Foi Ajustado

- a tela `Presenca` do app do aluno deixou o layout antigo de metricas e cards administrativos;
- a area principal passou a seguir a referencia do app do aluno em `Historico`, reaproveitando apenas:
  - titulo `Ultimas aulas`;
  - filtros em dropdown;
  - cards compactos de aula;
- nao foram levados para a tela nova:
  - barras de progresso;
  - tabs;
  - bloco de graduacoes da referencia.

### Arquivo Ajustado

- [`student-attendance-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/student/student-attendance-screen.tsx)

### Validacao

- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou

### Resultado

- a tela de presenca do aluno ficou mais coerente com o padrao visual mobile da referencia;
- o aluno agora filtra as ultimas aulas por atividade e por status sem alterar o contrato do backend.

### Refinamento Posterior 15

### O Que Foi Ajustado

- o fluxo inicial de `Eventos` no app do aluno deixou de confirmar uma inscricao generica logo no primeiro clique;
- ao tocar em `Inscrever-se`, o aluno agora escolhe primeiro:
  - `Confirmar`
  - `Talvez`
  - `Nao vou`
- so depois dessa escolha o evento passa para a aba `Inscricoes`.

### Regras Aplicadas

- evento sem taxa:
  - `Confirmar` cria o vinculo como `confirmed`;
  - `Talvez` cria o vinculo como `maybe`;
  - `Nao vou` cria o vinculo como `declined`.
- evento com taxa:
  - `Confirmar` cria o vinculo como `payment_pending` e gera cobranca pendente;
  - `Talvez` cria o vinculo como `maybe`;
  - `Nao vou` cria o vinculo como `declined`.

### Arquivos Ajustados

- [`student-events-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/student/student-events-screen.tsx)
- [`app/app/student/events/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/app/student/events/page.tsx)
- [`student-app.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/services/student-app.ts)
- [`app/api/app/student/events/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/app/student/events/route.ts)
- [`enroll-student-event.input.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/events/contracts/enroll-student-event.input.ts)
- [`enroll-student-event.parser.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/events/contracts/enroll-student-event.parser.ts)
- [`student-app-events.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/services/student-app-events.service.ts)
- [`event-dashboard.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/events/services/event-dashboard.service.ts)

### Validacao

- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou

### Resultado

- o aluno responde ao evento do jeito certo ja na primeira inscricao;
- o item so entra em `Inscricoes` depois da decisao inicial;
- o codigo antigo de confirmacao direta no primeiro clique deixou de ser a regra viva da tela.

### Refinamento Posterior 16

### O Que Foi Ajustado

- a tela `Planos` do app do aluno foi refatorada para seguir a referencia de `perfil > plano` do `layout-ui`;
- o layout antigo em cards horizontais foi substituido por:
  - card principal do plano atual ou da solicitacao pendente;
  - bloco de acoes;
  - lista vertical de outros planos disponiveis.

### Arquivo Ajustado

- [`student-plans-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/student/student-plans-screen.tsx)

### Regras Preservadas

- a ativacao/solicitacao do plano continua usando o mesmo fluxo canônico do app;
- plano pendente continua aguardando confirmacao de pagamento pela academia;
- a troca de plano continua respeitando o estado real devolvido pelo backend.

### Validacao

- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou

### Resultado

- a experiencia de `Planos` no app do aluno ficou coerente com a referencia visual do perfil;
- o codigo anterior de carrossel horizontal deixou de ser a interface viva da tela.

### Refinamento Posterior 17

### O Que Foi Ajustado

- na aba `Alunos aptos` do dashboard de graduacoes, a listagem deixou de misturar em uma unica tabela alunos de varias modalidades/atividades;
- agora a tela divide a visualizacao em tabs por modalidade/atividade, evitando a sensacao de linha duplicada quando o mesmo usuario participa de mais de uma frente de graduacao.

### Arquivo Ajustado

- [`graduations-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/graduations/components/graduations-dashboard-screen.tsx)

### Regras Preservadas

- a elegibilidade continua vindo do mesmo payload canônico do modulo;
- a tabela, os botoes de `Marcar apto` e `Adicionar ao exame` e a busca continuam usando os mesmos dados;
- a mudanca foi apenas de agrupamento visual por tab.

### Validacao

- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou

### Resultado

- a aba `Alunos aptos` ficou mais clara para a academia;
- o usuario navega por modalidade/atividade sem perder o comportamento operacional que ja existia.

### Refinamento Posterior 18

### O Que Foi Ajustado

- o app do aluno ganhou badges numericos de pendencia no menu lateral e no menu inferior para:
  - `Pagamentos`
  - `Eventos`
- em `Pagamentos`, o badge agora mostra a quantidade real de cobrancas abertas (`pending` + `overdue`);
- em `Eventos`, o badge agora soma:
  - convites pendentes;
  - eventos novos disponiveis na aba `Proximos`.
- a propria tela de `Eventos` tambem passou a mostrar badges nas tabs:
  - `Proximos`
  - `Inscricoes`

### Arquivos Ajustados

- [`student-app.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/services/student-app.ts)
- [`student-app-navigation-indicators.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/app/services/student-app-navigation-indicators.service.ts)
- [`route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/app/student/navigation/route.ts)
- [`student-app-shell.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/ui/student-app-shell.tsx)
- [`student-events-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/student/student-events-screen.tsx)
- [`app/app/student/events/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/app/student/events/page.tsx)

### Regras Aplicadas

- o shell do app atualiza os badges ao:
  - trocar de rota;
  - voltar foco para a janela;
  - receber refresh explicito depois de uma acao de eventos;
  - polling periodico.
- quando uma pendencia e quitada e o backend deixa de expor a cobranca aberta, o badge de `Pagamentos` volta para zero;
- quando o aluno responde ao evento ou deixa de ter convites/eventos novos, o badge de `Eventos` e os contadores das tabs acompanham o estado novo.

### Validacao

- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou

### Resultado

- o aluno agora recebe sinalizacao visual direta de pendencia financeira e de novidade/convite em eventos;
- a atualizacao ficou centralizada em um endpoint proprio de indicadores do app, sem espalhar regra de contagem nas telas.

### Refinamento Posterior 19

### O Que Foi Implementado

- foi criado o modulo `athletes`, com persistencia propria em `AthleteTitle`, para unificar titulos competitivos de alunos e professores sem empurrar a regra para `students` ou `teachers`;
- o dashboard ganhou a tela `Atletas e Títulos` em `/dashboard/athletes`, com:
  - stats;
  - filtros;
  - top atletas;
  - cards expansivos;
  - adicionar/remover titulo;
- a plataforma ganhou a pagina publica `/ranking`, com:
  - chips de modalidade;
  - busca por academia ou atleta;
  - filtro por UF;
  - cards de academias;
  - perfil publico da academia com atletas titulados;
- o app do professor ganhou a aba `Títulos` no perfil;
- o app do aluno ganhou a aba `Títulos` no perfil.

### Arquivos Principais

- [`schema.prisma`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/prisma/schema.prisma)
- [`migration.sql`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/prisma/migrations/20260321150000_athletes_titles_foundation/migration.sql)
- [`athlete-directory.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/athletes/services/athlete-directory.service.ts)
- [`athletes-dashboard.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/athletes/services/athletes-dashboard.service.ts)
- [`athlete-ranking.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/athletes/services/athlete-ranking.service.ts)
- [`athletes-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/athletes/components/athletes-dashboard-screen.tsx)
- [`ranking-page-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/athletes/components/ranking-page-screen.tsx)
- [`profile-titles-tab.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/features/profile/base/profile-titles-tab.tsx)

### Regras Aplicadas

- o titulo competitivo pertence a um tenant e a exatamente um atleta operacional:
  - `StudentProfile`
  - `TeacherProfile`
- o dashboard administra titulos de atletas do tenant ativo;
- aluno e professor so podem operar os proprios titulos via BFF do app;
- o ranking publico agrega academias do SaaS inteiro;
- o perfil publico da academia exibe apenas atletas com titulos cadastrados;
- as rotas publicas de ranking foram marcadas como dinamicas para nao congelarem o estado apos criar/remover titulos.

### Validacao

- validacao tecnica:
  - `npx prisma generate`: passou
  - `npx prisma migrate deploy`: passou
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou
- validacao real por API:
  - login admin real em `dojo-centro` com `joao@academia.com`
  - `GET /api/athletes`: `200`
  - `POST /api/athletes/[athleteId]/titles`: `200`
  - `GET /api/ranking/academies/dojo-centro`: refletiu `totalTitles = 1`
  - login real do aluno `maria@email.com`
  - `GET /api/app/student/profile/titles`: `200`
  - `DELETE /api/app/student/profile/titles/[titleId]`: `200`
  - login real do professor `prof.ricardo@email.com`
  - `POST /api/app/teacher/profile/titles`: `200`
  - `DELETE /api/app/teacher/profile/titles/[titleId]`: `200`
  - `GET /api/ranking/academies/dojo-centro` apos cleanup: `totalTitles = 0`

### Bugs Encontrados

- as rotas publicas de ranking estavam servindo snapshot antigo apos mutacao de titulos;
- causa:
  - GET publico sem `force-dynamic`, permitindo cache indevido do ranking;
- correcao:
  - `app/api/ranking/route.ts`
  - `app/api/ranking/academies/[academySlug]/route.ts`

### Cleanup

- o titulo temporario da aluna `Maria Santos` foi removido pelo proprio app do aluno;
- o titulo temporario do professor `Mestre Ricardo` foi removido pelo proprio app do professor;
- o ranking publico voltou a `totalTitles = 0` para `dojo-centro`.

## Refinamento Posterior 20 - Ranking publico alinhado ao layout de referencia

### O que foi refinado

- a tela publica [`/ranking`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/ranking/page.tsx) foi reestruturada para seguir de forma bem mais fiel o layout de referencia em `layout-ui /dashboard/explorer`;
- a busca inicial passou a usar o mesmo padrao visual:
  - header centralizado;
  - chips de modalidades centralizados;
  - bloco de busca com select de UF;
  - cards de destaque no estado inicial;
  - lista vertical de resultados quando houver busca/filtro;
- a view de perfil da academia passou a seguir o mesmo comportamento visual da referencia:
  - capa superior;
  - botao voltar sobreposto;
  - logo/nome/localidade sobre a capa;
  - stats;
  - descricao;
  - badges de modalidades;
  - carrossel manual de atletas titulados.

### Ajustes de contrato/dominio

- o ranking publico passou a expor `primaryColor` no resumo e no perfil da academia;
- quando a academia nao tiver `bannerUrl`, a capa da view publica usa a `primaryColor` da identidade visual como base visual, sem depender de imagem obrigatoria.

### Arquivos principais

- [`ranking-page-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/athletes/components/ranking-page-screen.tsx)
- [`athletes.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/athletes/domain/athletes.ts)
- [`athlete-ranking.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/athletes/services/athlete-ranking.service.ts)
- [`api-specification.md`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/doc-v2/api-specification.md)

### Regras aplicadas

- a referencia foi usada apenas para layout e comportamento, sem copiar arquitetura;
- redes sociais nao foram exibidas na view publica da academia;
- a capa continua coerente com a academia real:
  - usa `bannerUrl` se existir;
  - senao usa a cor principal da identidade visual da academia.

### Validacao

- validacao tecnica:
  - `./node_modules/.bin/tsc --noEmit --incremental false`: passou
- validacao real:
  - `GET /ranking`: `200` em `localhost:3000`

### Cleanup

- nao houve dado temporario para limpeza nesta rodada de UI/UX do ranking.

### Refinamento visual adicional

- a secao `Nossos Atletas` da view publica do ranking deixou de usar cards largos em grid paginado;
- agora os cards ficaram mais estreitos e a secao passou a usar carrossel horizontal real com scroll lateral;
- as setas continuam presentes, mas agora apenas deslocam o scroll horizontal do container, sem reordenar artificialmente os cards.

## Refinamento Posterior 21 - Colocacao canonica em titulos de atletas

### O que foi refinado

- os fluxos de titulos da academia, do app do aluno e do app do professor deixaram de usar campo livre de `titulo` na criacao;
- o modal agora usa o dropdown `Colocacao`, igual ao layout de referencia do dashboard `athletes`;
- as opcoes canonicas passaram a ser:
  - `Ouro`
  - `Prata`
  - `Bronze`
  - `Campeão`
  - `Vice-Campeão`
- as listas/cards passaram a colorir o icone do titulo com base na colocacao, de forma consistente nas tres superficies.

### Ajustes de dominio e persistencia

- `AthleteTitle` ganhou o campo `placement`;
- o backend passou a persistir `placement` e derivar o `title` exibido a partir dele;
- titulos legados sem `placement` continuam funcionando por inferencia a partir do texto salvo em `title`.

### Arquivos principais

- [`schema.prisma`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/prisma/schema.prisma)
- [`20260321190000_athlete_title_placement/migration.sql`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/prisma/migrations/20260321190000_athlete_title_placement/migration.sql)
- [`athletes.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/athletes/domain/athletes.ts)
- [`athlete-directory.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/athletes/services/athlete-directory.service.ts)
- [`athletes-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/athletes/components/athletes-dashboard-screen.tsx)
- [`profile-titles-tab.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/app/features/profile/base/profile-titles-tab.tsx)
- [`title-placements.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/lib/ui/title-placements.ts)

### Validacao

- `npx prisma generate`: passou
- `npx prisma migrate deploy`: passou
- `./node_modules/.bin/tsc --noEmit --incremental false`: em execucao na rodada

### Cleanup

- nao houve dado temporario para cleanup nesta rodada.

## Refinamento Posterior 27 - Dominio do SaaS tratado como superficie de plataforma

### Escopo

- a rodada ficou restrita a resolucao de host da landing publica do SaaS em `ligadojo.com.br`;
- o objetivo foi corrigir o erro em que o dominio institucional estava sendo interpretado como academia inexistente, em vez de carregar a landing da plataforma.

### O que foi ajustado

- a lista de `platform hosts` deixou de ser limitada a `localhost` e `127.0.0.1`;
- `ligadojo.com.br` e `www.ligadojo.com.br` passaram a ser tratados como hosts canônicos da plataforma;
- a configuracao tambem passou a aceitar hosts extras via `PLATFORM_HOSTS`, permitindo evolucao sem hardcode adicional espalhado pelo projeto;
- o ajuste ficou centralizado no resolvedor estrutural de tenancy, sem gambiarra na pagina inicial nem condicao especial na landing.

### Arquivo principal

- [`config.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/lib/tenancy/config.ts)

### Validacao

- `./node_modules/.bin/tsc --noEmit --incremental false`: passou
- validacao de regra: `ligadojo.com.br` e `www.ligadojo.com.br` entram no conjunto de `platform hosts`

### Cleanup

- nao houve dado temporario para cleanup nesta rodada.

## Refinamento Posterior 28 - Base estrutural para tenants em `*.ligadojo.com.br`

### Escopo

- a rodada ficou restrita ao modelo de tenancy em producao;
- o objetivo foi preparar a plataforma para operar com `ligadojo.com.br` como host raiz do SaaS e `slug.ligadojo.com.br` como dominio padrao das academias.

### O que foi ajustado

- foi introduzido `PLATFORM_ROOT_DOMAIN` como dominio raiz canônico da plataforma;
- o helper de tenancy passou a expor `buildManagedTenantDomain`, mantendo `slug.localhost` em desenvolvimento e gerando `slug.ligadojo.com.br` em producao;
- o onboarding da academia deixou de gravar `tenantDomain` padrao como `slug.localhost` em producao;
- a documentacao de estrutura passou a refletir explicitamente o modelo:
  - `ligadojo.com.br` = plataforma;
  - `slug.ligadojo.com.br` = tenant;
- o `.env.example` passou a expor as variaveis de configuracao do dominio raiz da plataforma.

### Arquivos principais

- [`config.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/lib/tenancy/config.ts)
- [`academy-provisioning.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/onboarding/services/academy-provisioning.service.ts)
- [`.env.example`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/.env.example)
- [`project-structure.md`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/doc-v2/project-structure.md)

### Validacao

- `./node_modules/.bin/tsc --noEmit --incremental false`: passou
- consulta em producao confirmou que o tenant atual ainda estava em `jiu-jitea-salvador.localhost`, evidenciando a necessidade de migracao dos dados existentes para o novo padrao gerenciado.

### Cleanup

- nao houve dado temporario para cleanup nesta rodada.

## Refinamento Posterior 29 - Consolidacao operacional do modelo `ligadojo.com.br` + `*.ligadojo.com.br`

### Escopo

- a rodada ficou restrita a infraestrutura e tenancy de producao;
- o objetivo foi consolidar a plataforma em `ligadojo.com.br` e os tenants gerenciados em `slug.ligadojo.com.br`.

### O que foi ajustado

- o dominio institucional `ligadojo.com.br` foi tratado como host da plataforma;
- o tenant existente foi migrado de `jiu-jitea-salvador.localhost` para `jiu-jitea-salvador.ligadojo.com.br`;
- o vhost `Ligadojo` do Nginx passou a aceitar:
  - `ligadojo.com.br`
  - `www.ligadojo.com.br`
  - `*.ligadojo.com.br`
- a configuracao de producao recebeu:
  - `PLATFORM_ROOT_DOMAIN=ligadojo.com.br`
  - `PLATFORM_HOSTS=ligadojo.com.br,www.ligadojo.com.br`
- o runtime real em producao foi confirmado como `PM2 + Nginx`, e nao o status exibido em `Node Project` do aaPanel.

### Validacao

- `Host: ligadojo.com.br` em `http://127.0.0.1`: `200`
- `Host: jiu-jitea-salvador.ligadojo.com.br` em `http://127.0.0.1/app`: `200`
- `PM2`:
  - processo `ligadojo` online na porta `3003`
- banco de producao:
  - `TenantDomain = jiu-jitea-salvador.ligadojo.com.br`

### Cleanup

- nao houve cleanup de dados temporarios; a mudanca foi estrutural e mantida como estado oficial de producao.

## Refinamento Posterior 30 - Wildcard SSL ativo em producao para `ligadojo.com.br` e tenants gerenciados

### Escopo

- a rodada ficou restrita a infraestrutura de producao e seguranca de transporte;
- o objetivo foi sair do estado pendente de wildcard SSL e validar HTTPS real para tenants em `*.ligadojo.com.br`.

### O que foi ajustado

- o wildcard SSL foi emitido por DNS challenge via Cloudflare;
- o certificado instalado no vhost `Ligadojo` passou a cobrir:
  - `ligadojo.com.br`
  - `*.ligadojo.com.br`
- o Nginx foi recarregado com o certificado novo;
- o tenant gerenciado passou a responder com HTTPS valido, sem erro de `subject alternative name`.

### Validacao

- certificado instalado:
  - `DNS: ligadojo.com.br`
  - `DNS: *.ligadojo.com.br`
- validacao final em producao:
  - `https://ligadojo.com.br`: respondeu com certificado valido
  - `https://jiu-jitea-salvador.ligadojo.com.br/app`: `HTTP/2 200` sem erro de certificado

### Cleanup

- os registros temporarios de `_acme-challenge` foram gerenciados automaticamente pelo fluxo de emissao e nao ficaram pendencias manuais apos a instalacao do certificado.

## Refinamento Posterior 24 - Landing do SaaS alinhada ao layout de referencia

### O que foi implementado

- a landing institucional da plataforma foi refeita seguindo a hierarquia visual de `reference-ui/layout-ui/app/dashboard/landing/page.tsx`;
- a arquitetura do projeto foi preservada:
  - a tela continua em `modules/platform-site`;
  - nao houve copia da organizacao de pastas da referencia;
- a nova landing passou a usar:
  - navbar fixa com menu mobile;
  - hero escuro com preview animado do produto;
  - secoes de problema, solucao, funcionalidades, marketing IA e perfis de uso;
  - CTA final mais proximo da referencia visual.

### Refinamento adicional

- a landing foi ajustada de forma ainda mais literal para seguir o layout de referencia 1:1, inclusive com:
  - mockup do browser do site;
  - mockup do app mobile;
  - cards de financeiro, funcionalidades, marketing IA, numeros e footer;
  - CTA e header no mesmo padrao visual da referencia.
- o comportamento de entrada das secoes foi estabilizado para nao deixar blocos invisiveis e nao causar leitura de fundo "branco/quebrado" fora do viewport ideal;
- com isso, os backgrounds e o empilhamento visual passaram a aparecer de forma continua no desktop e no mobile.
- o componente da landing foi limpo para ficar alinhado diretamente ao layout de referencia, removendo residuos da tentativa anterior de composicao propria.
- as secoes abaixo do hero que ainda estavam claras foram alinhadas aos fundos escuros do layout de referencia:
  - `Seu site que realmente traz alunos`
  - `Seu app personalizado com sua marca`
  - `Cobranca automatica e controle financeiro total`
  - `Um sistema completo para sua academia`
  - `O que acontece quando voce usa tudo isso junto?`
  - `Feito para a realidade das academias de luta`

### Arquivo principal

- [`platform-landing-page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/platform-site/components/platform-landing-page.tsx)

### Validacao

- `./node_modules/.bin/tsc --noEmit --incremental false`: passou
- `GET /`: `200`
- artefatos visuais:
  - [`platform-landing-reference-desktop.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/platform-landing-reference-desktop.png)
  - [`platform-landing-reference-mobile.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/platform-landing-reference-mobile.png)
  - [`platform-landing-1to1-desktop.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/platform-landing-1to1-desktop.png)
  - [`platform-landing-1to1-mobile.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/platform-landing-1to1-mobile.png)
  - [`platform-landing-refined-desktop.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/platform-landing-refined-desktop.png)
  - [`platform-landing-refined-mobile.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/platform-landing-refined-mobile.png)
  - [`platform-landing-colored-desktop.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/platform-landing-colored-desktop.png)
  - [`platform-landing-colored-mobile.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/platform-landing-colored-mobile.png)

### Cleanup

- nao houve dado temporario para cleanup nesta rodada.

## Refinamento Posterior 23 - Landing publica do SaaS com logo real e responsividade

### O que foi ajustado

- a landing publica da plataforma passou a usar o logo real em `public/logo-ligadojo.svg`;
- o header foi simplificado para evitar quebra ruim no desktop medio e no mobile;
- o hero foi reequilibrado para empilhar texto e mockup no momento certo, sem scroll lateral e sem abrir o mobile com o mockup antes da proposta principal;
- o painel visual do produto foi reduzido para nao dominar a primeira dobra.

### Arquivo principal

- [`platform-landing-page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/platform-site/components/platform-landing-page.tsx)

### Validacao

- `./node_modules/.bin/tsc --noEmit --incremental false`: passou
- `GET /`: `200`
- artefatos visuais atualizados:
  - [`platform-landing-home-desktop.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/platform-landing-home-desktop.png)
  - [`platform-landing-home-mobile.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/platform-landing-home-mobile.png)

### Cleanup

- nao houve dado temporario para cleanup nesta rodada.

### Refinamento visual adicional

- a landing publica do SaaS foi redesenhada com direcao visual mais forte e comercial;
- o hero ganhou composicao principal mais persuasiva, com painel de produto, secoes de valor, modulos, operacao e CTA final;
- a arquitetura permaneceu isolada em `modules/platform-site`, sem misturar com o modulo `site` da academia;
- artefato visual salvo em:
  - [`platform-landing-home.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/platform-landing-home.png)

## Refinamento Posterior 22 - Landing publica do SaaS no host da plataforma

### O que foi implementado

- o host da plataforma deixou de redirecionar o visitante anonimo de `/` para `/login`;
- a home publica do host de plataforma agora renderiza uma landing institucional propria do SaaS;
- o login continua em `/login`;
- usuarios autenticados continuam seguindo o fluxo existente:
  - `platform_admin` -> `/platform`
  - usuarios de academia -> `/access`

### Arquivos principais

- [`app/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/page.tsx)
- [`platform-landing-page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/platform-site/components/platform-landing-page.tsx)
- [`index.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/platform-site/index.ts)
- [`project-structure.md`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/doc-v2/project-structure.md)
- [`frontend-architecture.md`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/doc-v2/frontend-architecture.md)

### Regras aplicadas

- `site` continua sendo ownership exclusivo do site publico da academia;
- a landing institucional do produto ficou em superficie propria de plataforma;
- o comportamento do host do tenant nao foi alterado.

### Validacao

- `./node_modules/.bin/tsc --noEmit --incremental false`: passou
- `GET /`: `200` no host da plataforma, servindo a landing publica
- `GET /login`: `200`, mantendo a autenticacao em rota separada

### Cleanup

- nao houve dado temporario para cleanup nesta rodada.

## Refinamento Posterior 24 - Reequilibrio estrutural da landing publica da plataforma

### Escopo

- esta rodada foi restrita somente a `localhost:3000/`, ou seja, a landing publica da plataforma;
- nao houve nova alteracao funcional em dashboard, app do aluno ou app do professor nesta etapa.

### O que foi ajustado

- a landing passou a usar um container central proprio e consistente em toda a pagina, em vez de depender de distribuicao mais solta por `container` do Tailwind em cada secao;
- o hero, as secoes de `site`, `app`, `financeiro`, `funcionalidades`, `marketing`, `impacto` e `para quem` foram realinhadas no mesmo eixo visual;
- recuos laterais artificiais que empurravam mockups e textos para fora do centro percebido foram removidos;
- os grids principais ficaram com proporcoes mais proximas da referencia visual, mantendo o mesmo comportamento dos componentes.

### Arquivo principal

- [`platform-landing-page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/platform-site/components/platform-landing-page.tsx)

### Validacao

- `GET /`: `200`
- artefatos visuais atualizados:
  - [`platform-landing-centered-desktop.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/platform-landing-centered-desktop.png)
  - [`platform-landing-centered-mobile.png`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/output/playwright/platform-landing-centered-mobile.png)

### Cleanup

- nao houve dado temporario para cleanup nesta rodada.

## Refinamento Posterior 25 - Normalizacao da copy PT-BR na landing publica da plataforma

### Escopo

- a rodada ficou restrita a copy textual da landing publica da plataforma em `localhost:3000/`;
- nao houve alteracao funcional de fluxo, layout de outras superficies ou regras de negocio.

### O que foi ajustado

- os textos literais da landing foram normalizados para PT-BR com acentuacao correta;
- chamadas, titulos e descricoes das secoes de marketing, impacto, CTA final e `para quem` deixaram de usar copy ASCII sem acentos;
- a validacao confirmou que o problema nao estava em i18n global: o layout raiz ja usa `lang="pt-BR"`.

### Arquivos principais

- [`platform-landing-page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/platform-site/components/platform-landing-page.tsx)
- [`layout.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/layout.tsx)

### Validacao

- `./node_modules/.bin/tsc --noEmit --incremental false`: passou
- `app/layout.tsx`: confirmado `lang="pt-BR"`

### Cleanup

- nao houve dado temporario para cleanup nesta rodada.

## Refinamento Posterior 26 - Legibilidade mobile e mockups reais no bloco de marketing da landing

### Escopo

- a rodada ficou restrita a `localhost:3000/`, somente na landing publica da plataforma;
- o objetivo foi melhorar leitura no mobile em cards especificos e substituir placeholders do bloco `Assistente de Marketing` por imagens reais da pasta `reference-ui`.

### O que foi ajustado

- os cards das secoes `Enquanto voce ensina no tatame, o resto do negocio fica travado`, `Um sistema completo para sua academia` e `Feito para a realidade das academias de luta` receberam texto de descricao maior no mobile e menor espaco vertical entre titulo e descricao;
- o bloco `Assistente de Marketing` deixou de usar placeholders genericos e passou a renderizar as duas imagens reais:
  - `Gemini_Generated_Image_ftqb0kftqb0kftqb.png`
  - `Gemini_Generated_Image_2cyl2e2cyl2e2cyl.png`
- a estrutura e o comportamento da landing foram mantidos, com ajuste apenas visual de leitura e composicao.

### Arquivo principal

- [`platform-landing-page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/platform-site/components/platform-landing-page.tsx)

### Validacao

- `./node_modules/.bin/tsc --noEmit --incremental false`: passou

### Cleanup

- nao houve dado temporario para cleanup nesta rodada.
