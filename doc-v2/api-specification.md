# API Specification

## Objetivo

Documentar as APIs atuais e as APIs esperadas por modulo, separando claramente:

- APIs de dominio/admin;
- APIs BFF do app por role (`teacher` e `student`);
- status de maturidade de cada endpoint.

## Convencoes

- `existing`: endpoint implementado.
- `planned`: endpoint esperado no estado alvo, ainda nao implementado.
- `needs-refactor`: endpoint existente, mas fora da fronteira ideal ou com contrato/camada ainda pouco alinhados.

## Regras De Entrada E Superficie

- `/dashboard/*` e superficie administrativa da academia e deve aceitar apenas `academy_admin`.
- `/app/teacher/*` e `/app/student/*` dependem de host de tenant e membership ativa naquele tenant.
- no host da plataforma, usuarios autenticados nao `platform_admin` devem usar `/access` para escolher contexto antes de entrar em academia.
- a escolha de contexto reutiliza endpoints existentes:
  - `POST /api/auth/dashboard-tenant` para abrir dashboard de academia onde o usuario e `academy_admin`;
  - `POST /api/auth/tenant-switch` para entrar no app de uma academia como `teacher` ou `student`.
- para `teacher`, o payload de sessao do tenant nao deve mais carregar capabilities administrativas de dashboard; operacional do professor vive no app e nos BFFs de `/api/app/teacher/*`.

## Regras Gerais De Autorizacao

### APIs de dominio/admin

- autenticacao obrigatoria;
- tenant resolvido no backend;
- membership ativa obrigatoria;
- superficie administrativa do dashboard aceita apenas ator administrativo (`academy_admin`, ou `platform_admin` quando aplicavel);
- `teacher` e `student` nao devem consumir rotas administrativas de dashboard, mesmo que exista capability legada ampla;
- capability obrigatoria conforme modulo.

### APIs do app

- autenticacao obrigatoria;
- tenant resolvido por host;
- membership ativa obrigatoria;
- role obrigatoria conforme superficie (`teacher` ou `student`);
- resource scope deve ser garantido pelo backend.

---

## Attendance

### Objetivo do modulo

Registrar aulas executadas, presenca por aluno e historico de participacao.

### Entidades principais

- `ClassSession`
- `AttendanceRecord`
- `ClassGroup`

### Operacoes principais

- listar sessoes com alunos confirmados/presentes/ausentes;
- registrar presenca;
- consolidar historico do aluno;
- controlar finalizacao da chamada.

### APIs de dominio/admin

| Metodo | Endpoint | Status | Observacao |
| --- | --- | --- | --- |
| `PUT` | `/api/classes/sessions` | `needs-refactor` | Mantido como compatibilidade legada; a fronteira administrativa canonica de presenca agora e `attendance`. |
| `GET` | `/api/attendance` | `existing` | Retorna `AttendanceDashboardData` para a superficie administrativa de presenca. |
| `PUT` | `/api/attendance/sessions/[sessionId]` | `existing` | Atualiza a sessao administrativa de presenca sem acoplar a mutacao ao modulo `classes`. |

### APIs BFF do app

#### Teacher

| Metodo | Endpoint | Status | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/app/teacher/attendance` | `existing` | Retorna `TeacherAppAttendanceData`. |
| `PUT` | `/api/app/teacher/attendance` | `existing` | Registra presenca da sessao na experiencia do professor. |

Payload observado para `PUT /api/app/teacher/attendance`:

```json
{
  "classGroupId": "string",
  "sessionDate": "YYYY-MM-DD",
  "weekday": 1,
  "startTime": "18:00",
  "endTime": "19:00",
  "confirmedStudentIds": ["string"],
  "confirmedStudentNames": ["string"],
  "presentStudentIds": ["string"],
  "absentStudentIds": ["string"],
  "isFinalized": true
}
```

#### Student

| Metodo | Endpoint | Status | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/app/student/attendance` | `existing` | Retorna historico de presenca do aluno. |

### Autorizacao

- admin: `ATTENDANCE_MANAGE` para mutacoes;
- professor: role `teacher` e escopo sobre a turma/sessao;
- aluno: role `student` e acesso apenas ao proprio historico.

### Escopo multi-tenant

- toda sessao pertence a um tenant;
- professor nao pode registrar presenca fora das turmas do seu escopo;
- aluno nao pode consultar presenca de terceiros.

---

## Classes

### Objetivo do modulo

Gerenciar turmas, agenda recorrente e sessoes de aula.

### Entidades principais

- `ClassGroup`
- `ClassSchedule`
- `ClassSession`

### Operacoes principais

- listar turmas;
- criar/editar/remover turmas;
- listar turmas por ator;
- atualizar sessoes de aula.

### APIs de dominio/admin

| Metodo | Endpoint | Status | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/classes` | `existing` | Lista turmas conforme tenant e ator. |
| `POST` | `/api/classes` | `existing` | Cria turma. |
| `PATCH` | `/api/classes/[classId]` | `existing` | Atualiza turma. |
| `DELETE` | `/api/classes/[classId]` | `existing` | Remove ou arquiva turma. |
| `PUT` | `/api/classes/[classId]/students` | `existing` | Atualiza alunos da turma; admin usa `CLASSES_MANAGE` e professor so opera a propria turma via fallback controlado de `ATTENDANCE_MANAGE` + resource scope do modulo. |
| `PUT` | `/api/classes/sessions` | `existing` | Alias legado de compatibilidade para mutacao de sessao; o ownership administrativo canonico de presenca agora esta em `attendance`. |

Payload base observado para criar/editar turma:

```json
{
  "name": "Noite Adulto",
  "modalityId": "string|null",
  "modalityName": "Jiu-Jitsu",
  "teacherProfileId": "string|null",
  "teacherName": "Professor Ricardo",
  "ageGroups": ["adult"],
  "beltRange": "Branca a Azul",
  "maxStudents": 30,
  "currentStudents": 12,
  "schedules": [
    {
      "weekday": 1,
      "startTime": "19:00",
      "endTime": "20:00"
    }
  ],
  "status": "active"
}
```

### APIs BFF do app

#### Teacher

| Metodo | Endpoint | Status | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/app/teacher/classes` | `existing` | Retorna `TeacherAppClassesData`. |

#### Student

| Metodo | Endpoint | Status | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/app/student/classes` | `existing` | Retorna `StudentAppClassesData`, agora com `academyActivities` separado das turmas e das modalidades do aluno. |

### Autorizacao

- admin: `CLASSES_READ` e `CLASSES_MANAGE`;
- professor: leitura apenas de turmas do proprio escopo no app;
- aluno: leitura apenas das proprias turmas no app.

### Escopo multi-tenant

- todas as turmas pertencem a um tenant;
- operacoes de professor e aluno devem ser filtradas pelo vinculo real ao recurso.

---

## Site

### Objetivo do modulo

Gerenciar configuracao, publicacao e ativos de branding do site da academia.

### APIs de dominio/admin

| Metodo | Endpoint | Status | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/site` | `existing` | Retorna o draft/site atual do tenant ativo; exige `SITE_MANAGE` por expor configuracao interna do builder. |
| `PUT` | `/api/site` | `existing` | Salva draft do site do tenant ativo. |
| `POST` | `/api/site/publish` | `existing` | Publica o site do tenant ativo. |
| `POST` | `/api/site/unpublish` | `existing` | Retorna o site para draft. |
| `POST` | `/api/uploads/branding` | `existing` | Faz upload de `logo` ou `banner`; agora exige `SITE_MANAGE` no tenant/dashboard ativo. |

Config observada no editor administrativo de `site`:

- `config.seo` persiste titulo e descricao;
- `config.theme` persiste identidade visual do editor, incluindo `logoUrl`, `fontFamily`, `primaryColor`, `secondaryColor` e `accentColor`;
- `config.sections` continua sendo a fonte canonica de ordem, visibilidade e conteudo das secoes do site.

### Autorizacao

- o dashboard de `site` e administrativo e agora exige `SITE_MANAGE` tanto para leitura do draft quanto para alteracoes, publicacao e upload;
- `teacher` nao deve consumir `GET /api/site`, mesmo possuindo `SITE_READ` na matriz geral de capabilities;
- upload de branding nao deve mais aceitar apenas "ser admin em algum tenant"; ele deve respeitar o tenant/dashboard ativo.

### Escopo multi-tenant

- configuracao e publicacao sempre pertencem ao tenant ativo;
- quando o `TenantSite.status = published`, a home do host do tenant (`/`) deve servir o site publico para visitantes sem membership ativa nesse tenant;
- `academy_admin`, `teacher` e `student` autenticados no mesmo tenant continuam sendo redirecionados para sua superficie propria;
- o CTA `Ver site` do builder administrativo deve abrir a URL publica do tenant, nao um `/site` relativo do host atual;
- upload de branding deve seguir o mesmo tenant/capability gate da superficie de `site`.

---

## Athletes

### Objetivo do modulo

Gerenciar titulos competitivos de atletas da academia e expor o ranking publico de academias/atletas do SaaS.

### Entidades principais

- `AthleteTitle`
- `StudentProfile`
- `TeacherProfile`

### Operacoes principais

- listar atletas e titulos da academia;
- adicionar/remover titulos no dashboard;
- permitir que aluno e professor cadastrem/removam os proprios titulos no app;
- expor ranking publico de academias e perfil publico da academia com atletas titulados.

### APIs de dominio/admin

| Metodo | Endpoint | Status | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/athletes` | `existing` | Retorna `AthletesDashboardData` com stats, filtros, top atletas e lista unificada de alunos/professores atletas. |
| `POST` | `/api/athletes/[athleteId]/titles` | `existing` | Adiciona titulo a um atleta do tenant. |
| `DELETE` | `/api/athletes/[athleteId]/titles/[titleId]` | `existing` | Remove titulo do atleta no tenant. |

Payload observado para criar titulo:

```json
{
  "placement": "gold",
  "competition": "Mundial IBJJF 2024",
  "year": 2024
}
```

Observacao:

- a UI de dashboard/admin e as tabs `Titulos` do app do aluno/professor usam `placement` como campo canônico de criação (`gold`, `silver`, `bronze`, `champion`, `runner_up`);
- o valor exibido em `title` no retorno é derivado dessa colocacao (`Ouro`, `Prata`, `Bronze`, `Campeão`, `Vice-Campeão`);
- os cards e listas devem usar `placement` para colorir o icone do titulo de forma consistente nas tres superfícies.

### APIs publicas

| Metodo | Endpoint | Status | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/ranking` | `existing` | Retorna destaques, resultados e estados do ranking publico de academias. |
| `GET` | `/api/ranking/academies/[academySlug]` | `existing` | Retorna o perfil publico da academia com stats e atletas titulados. |

Observacoes:

- as rotas publicas de ranking sao `force-dynamic` para nao congelarem o estado do ranking apos criar/remover titulos;
- o ranking agrega alunos e professores atletas ativos da academia;
- o resumo publico e o perfil publico da academia agora expoem `primaryColor` para que o `/ranking` use a mesma identidade visual definida pela academia;
- o header da view publica da academia usa `bannerUrl` quando existir; caso contrario, usa a `primaryColor` da identidade visual como capa.

### APIs BFF do app

#### Teacher

| Metodo | Endpoint | Status | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/app/teacher/profile/titles` | `existing` | Retorna `TeacherAppProfileTitlesData`. |
| `POST` | `/api/app/teacher/profile/titles` | `existing` | Adiciona titulo proprio do professor. |
| `DELETE` | `/api/app/teacher/profile/titles/[titleId]` | `existing` | Remove titulo proprio do professor. |

#### Student

| Metodo | Endpoint | Status | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/app/student/profile/titles` | `existing` | Retorna `StudentAppProfileTitlesData`. |
| `POST` | `/api/app/student/profile/titles` | `existing` | Adiciona titulo proprio do aluno. |
| `DELETE` | `/api/app/student/profile/titles/[titleId]` | `existing` | Remove titulo proprio do aluno. |

### Autorizacao

- dashboard admin: `ATHLETES_READ` para leitura e `ATHLETES_MANAGE` para mutacoes;
- professor: role `teacher` e escopo apenas sobre os proprios titulos via BFF do app;
- aluno: role `student` e escopo apenas sobre os proprios titulos via BFF do app;
- ranking publico nao exige autenticacao.

### Escopo multi-tenant

- cada `AthleteTitle` pertence a um tenant e a exatamente um alvo operacional: `StudentProfile` ou `TeacherProfile`;
- o dashboard so enxerga atletas do tenant ativo;
- as tabs `Titulos` do app nao podem escrever/ler titulos de terceiros;
- o ranking agrega academias do SaaS inteiro, mas cada perfil publico so expoe atletas titulados daquela academia.

---

## Students

### Objetivo do modulo

Gerenciar alunos, vinculos por atividade, eventual vinculacao por modalidade/turma, status e historico academico.

### Entidades principais

- `StudentProfile`
- `StudentActivity`
- `StudentModality`
- `StudentGraduationHistory`

### Operacoes principais

- listar e detalhar alunos;
- criar/editar cadastro;
- alterar status;
- listar candidatos;
- registrar graduacao do aluno.

### APIs de dominio/admin

| Metodo | Endpoint | Status | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/students` | `existing` | Lista alunos do tenant. |
| `POST` | `/api/students` | `existing` | Cria aluno e pode vincular plano ja no cadastro administrativo. |
| `GET` | `/api/students/[studentId]` | `existing` | Detalha aluno. |
| `PATCH` | `/api/students/[studentId]` | `existing` | Atualiza aluno e pode vincular plano quando ainda nao houver assinatura efetiva. |
| `GET` | `/api/students/candidates` | `existing` | Lista candidatos; ja possui filtro por escopo do professor. |
| `PATCH` | `/api/students/[studentId]/status` | `existing` | Atualiza status do aluno. |
| `POST` | `/api/students/[studentId]/graduations` | `needs-refactor` | Alias legado de compatibilidade; a mutacao canonica de graduacao individual agora pertence a `graduations`. |

Regras observadas de leitura em dashboard:

- `academy_admin` continua vendo a colecao completa do tenant.
- `teacher` so pode ler alunos vinculados as modalidades em que ele possui `teacherLinks` ativos.
- em `GET /api/students` e `GET /api/students/[studentId]`, quando o ator for `teacher`, os campos financeiros deixam de ser expostos:
  - `planId = null`
  - `planName = null`
  - `planValueCents = null`
  - `lastPayment = null`
  - `nextPayment = null`
  - `planOptions = []`
- tentativa do professor de abrir aluno fora do proprio escopo operacional retorna `404`.

Payload base observado para criar/editar aluno:

```json
{
  "name": "string",
  "email": "string",
  "phone": "string|null",
  "birthDate": "YYYY-MM-DD|null",
  "address": "string|null",
  "emergencyContact": "string|null",
  "notes": "string|null",
  "planId": "string|null",
  "markPlanAsPaid": true,
  "practiceAssignments": [
    {
      "activityCategory": "jiu-jitsu",
      "classGroupId": "string|null",
      "belt": "Branca",
      "stripes": 0,
      "startDate": "YYYY-MM-DD",
      "notes": "string|null"
    }
  ]
}
```

Regras observadas para o plano no cadastro administrativo:

- se `planId` for enviado sem `markPlanAsPaid`, o aluno nasce com a cobranca inicial `pending` e a assinatura `PENDING`;
- se `planId` for enviado com `markPlanAsPaid = true`, a cobranca inicial ja nasce confirmada e a assinatura fica `ACTIVE`;
- em ambos os casos, o aluno continua sendo criado normalmente e a definicao operacional por modalidade segue separada da atividade principal.

### APIs BFF do app

| Metodo | Endpoint | Status | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/app/student/home` | `existing` | Consome dados do aluno para a home do app, agora com `academyActivities` para listar as atividades principais oferecidas pela academia sem confundir com modalidade. |
| `GET` | `/api/app/student/navigation` | `existing` | Retorna contadores de badges do app do aluno para `Pagamentos` e `Eventos`, incluindo pendencias financeiras abertas, convites pendentes e eventos novos da aba `Proximos`. |
| `GET` | `/api/app/student/progress` | `existing` | Consome progresso/graduacoes do aluno. |
| `GET` | `/api/app/student/profile/graduations` | `existing` | Retorna as abas de graduacao do proprio aluno por atividade principal, com `currentBelt`, `levels` filtrados pelo sistema de faixas da academia e `history` ordenavel por mes/ano. |
| `POST` | `/api/app/student/profile/graduations` | `existing` | Permite ao proprio aluno registrar graduacao na sua atividade, usando somente faixas e graus permitidos pelo sistema de faixas da academia. |
| `PATCH` | `/api/app/student/profile/graduations/[graduationId]` | `existing` | Permite ao proprio aluno editar um lancamento do seu historico de graduacoes pelo mesmo modal do perfil. |
| `GET` | `/api/app/teacher/evolution` | `existing` | Consome visao do professor sobre elegibilidade, exames e historico. |

### Autorizacao

- admin: `STUDENTS_READ` e `STUDENTS_MANAGE`;
- professor: somente recursos dos alunos do seu escopo;
- aluno: somente os proprios dados.

### Escopo multi-tenant

- aluno sempre vinculado ao tenant;
- o primeiro acesso do aluno pode existir apenas com `StudentActivity`, sem turma;
- vinculos de modalidade devem respeitar o tenant e surgem quando houver turma/modalidade real;
- consultas de professor devem ser restritas por relacionamento real.

---

## Teachers

### Objetivo do modulo

Gerenciar cadastro, vinculo, perfil e operacao do professor.

### Entidades principais

- `TeacherProfile`
- `TeacherCompensation`
- `AcademyMembership` com role `teacher`

### Operacoes principais

- listar e cadastrar professores;
- editar perfil/cadastro;
- consultar aprovacoes pendentes;
- consultar registros para dashboard;
- expor perfil e home do professor no app.

### APIs de dominio/admin

| Metodo | Endpoint | Status | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/teachers` | `existing` | Lista professores ativos, convidados e rascunhos para referencias administrativas; exige `TEACHERS_MANAGE`. |
| `POST` | `/api/teachers` | `existing` | Cadastra professor e pode criar convite/vinculo. |
| `PATCH` | `/api/teachers/[teacherId]` | `existing` | Atualiza cadastro do professor. |
| `GET` | `/api/teachers/pending-approvals` | `existing` | Conta aprovacoes pendentes. |
| `GET` | `/api/teachers/records` | `existing` | Lista registros completos para dashboard; exige `TEACHERS_MANAGE` por expor dados sensiveis de gestao, incluindo compensacao. |

Regras observadas de acesso:

- o modulo visual de `dashboard/teachers` continua sendo superficie administrativa da academia;
- `GET /api/teachers` e `GET /api/teachers/records` agora seguem a mesma fronteira administrativa;
- nenhuma dessas rotas deve ser tratada como leitura operacional do app do professor;
- `teacher` nao deve acessar nem a lista simples nem a lista detalhada do dashboard de professores.

Payload base observado para criar/editar professor:

```json
{
  "name": "string",
  "email": "string|null",
  "phone": "string|null",
  "cpf": "string|null",
  "rank": "string|null",
  "specialty": "string|null",
  "roleTitle": "string|null",
  "requestedModalityIds": ["string"],
  "compensationType": "fixed|per_class|percentage",
  "compensationValue": 0,
  "bonus": "string|null"
}
```

### APIs BFF do app

| Metodo | Endpoint | Status | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/app/teacher/home` | `existing` | Home do professor. |
| `GET` | `/api/app/teacher/profile` | `existing` | Perfil do professor. |
| `PUT` | `/api/app/teacher/profile` | `existing` | Atualiza perfil do professor no app. |
| `GET` | `/api/app/teacher/profile/graduations` | `existing` | Retorna as abas de graduacao do proprio professor por atividade principal, com faixa atual preservada a partir do cadastro administrativo e historico autorregistrado separado. |
| `POST` | `/api/app/teacher/profile/graduations` | `existing` | Permite ao proprio professor registrar seu historico de graduacoes usando o sistema de faixas da academia. |
| `PATCH` | `/api/app/teacher/profile/graduations/[graduationId]` | `existing` | Permite ao proprio professor editar um lancamento do seu historico de graduacoes sem alterar a faixa canonica do cadastro administrativo. |
| `GET` | `/api/app/teacher/agenda` | `existing` | Agenda do professor. |

### Autorizacao

- admin: `TEACHERS_READ`, `TEACHERS_MANAGE`, `ENROLLMENT_REVIEW`;
- professor: apenas o proprio perfil e recursos do proprio escopo;
- aluno: sem acesso a essas APIs.

### Escopo multi-tenant

- professor precisa estar vinculado ao tenant;
- o perfil do app deve sempre refletir o vinculo ativo do tenant corrente.

---

## Enrollment Requests

### Objetivo do modulo

Receber pedido publico de entrada na academia e permitir revisao administrativa do vinculo.

### Entidades principais

- `EnrollmentRequest`
- `AcademyMembership`

### Operacoes principais

- solicitar entrada no host da academia;
- listar pedidos do tenant para revisao;
- aprovar ou rejeitar pedido de vinculo.

### APIs de dominio/admin

| Metodo | Endpoint | Status | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/tenants/[tenantSlug]/enrollment-requests` | `existing` | Lista pedidos do tenant para revisao administrativa. |
| `POST` | `/api/tenants/[tenantSlug]/enrollment-requests` | `existing` | Fluxo publico de entrada; a orquestracao canonica agora pertence ao modulo `enrollment-requests`. |
| `PATCH` | `/api/enrollment-requests/[requestId]` | `existing` | Aprova ou rejeita pedido de vinculo. |

Payload observado no host da academia:

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "whatsapp": "string",
  "birthDate": "YYYY-MM-DD",
  "zipCode": "string",
  "street": "string",
  "city": "string",
  "state": "string",
  "requestedRole": "student|teacher",
  "requestedActivityCategories": ["jiu-jitsu", "muay-thai"],
  "requestedModalityIds": ["string"],
  "teacherRoleTitle": "Professor|Instrutor chefe|Instrutor|Assistente",
  "teacherRank": "string",
  "emergencyContact": "string|null"
}
```

Regras observadas:

- `teacher` continua selecionando `requestedModalityIds`;
- `student` passa a selecionar apenas `requestedActivityCategories`;
- o autocadastro do aluno nao exige turma para concluir o acesso;
- o aluno entra imediatamente no app com membership `active`, mesmo sem turma;
- `StudentActivity` passa a ser o vinculo inicial canonico do aluno;
- `StudentModality` so nasce ou reativa quando o aluno entra em uma turma real da academia.

### Autorizacao

- leitura administrativa exige `ENROLLMENT_REVIEW` no tenant alvo;
- a solicitacao publica usa o host da academia e cria ou reaproveita acesso no tenant correto;
- `onboarding` nao deve mais concentrar nem a submissao publica nem a revisao do pedido.

### Escopo multi-tenant

- o `tenantSlug` do host/rota define a academia dona do pedido;
- membership, pedido e perfil derivado devem ser criados ou atualizados no mesmo tenant.

---

## Graduations

### Objetivo do modulo

Gerenciar trilhas de graduacao, aptidao, exames e historico de promocoes.

### Entidades principais

- `GraduationTrack`
- `GraduationExam`
- `ExamCandidate`
- `StudentGraduationHistory`
- `TeacherGraduation`

### Operacoes principais

- listar/configurar trilhas;
- agendar exame;
- alterar status de exame;
- adicionar/remover candidatos;
- sobrescrever elegibilidade;
- registrar graduacao do proprio aluno no app;
- registrar graduacao do proprio professor no app;
- expor historico/elegibilidade para app.

### APIs de dominio/admin

| Metodo | Endpoint | Status | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/graduations` | `existing` | Retorna dashboard de graduacoes. |
| `PUT` | `/api/graduations` | `existing` | Substitui trilhas de graduacao. |
| `POST` | `/api/graduations/students/[studentId]` | `existing` | Registra graduacao individual do aluno na fronteira canonica de `graduations`. |
| `POST` | `/api/graduations/exams` | `existing` | Agenda exame. |
| `PATCH` | `/api/graduations/exams/[examId]` | `existing` | Atualiza status do exame. |
| `POST` | `/api/graduations/exams/[examId]/candidates` | `existing` | Adiciona candidato ao exame. |
| `DELETE` | `/api/graduations/exams/[examId]/candidates/[studentModalityId]` | `existing` | Remove candidato do exame. |
| `PATCH` | `/api/graduations/eligible/[studentModalityId]` | `existing` | Override de elegibilidade; quando marcado como apto, persiste autoria para auditoria e exibicao em `Alunos Aptos`. |

### APIs BFF do app

#### Student

| Metodo | Endpoint | Status | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/app/student/profile/graduations` | `existing` | Lista as atividades do proprio aluno com faixa atual, niveis filtrados pelo sistema da academia e historico compacto para o perfil do app. |
| `POST` | `/api/app/student/profile/graduations` | `existing` | Registra graduacao individual do proprio aluno a partir da atividade selecionada. |
| `PATCH` | `/api/app/student/profile/graduations/[graduationId]` | `existing` | Edita um item do historico do proprio aluno e reusa o mesmo formulario modal do perfil. |

#### Teacher

| Metodo | Endpoint | Status | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/app/teacher/profile/graduations` | `existing` | Lista as atividades do proprio professor com faixa atual derivada do cadastro administrativo e historico proprio por atividade. |
| `POST` | `/api/app/teacher/profile/graduations` | `existing` | Registra graduacao individual do proprio professor a partir da atividade principal selecionada. |
| `PATCH` | `/api/app/teacher/profile/graduations/[graduationId]` | `existing` | Edita um item do historico proprio do professor por atividade principal. |

Regras observadas:

- `student` nasce com `Branca` por atividade quando ainda nao houver historico;
- `teacher` continua exibindo a faixa atual definida no cadastro administrativo, mesmo que o historico proprio receba lancamentos retroativos;
- os niveis e cores de faixa expostos para aluno, professor e admin sao filtrados pelo `Sistema de faixas` da academia;
- quando uma graduacao antiga e adicionada depois, o historico do frontend deve reordenar por mes/ano e o estado atual so pode mudar se aquela data for a mais recente da atividade.

Payload base observado para criar exame:

```json
{
  "title": "Exame Faixas Adulto",
  "date": "YYYY-MM-DD",
  "time": "09:00",
  "trackIds": ["string"],
  "allTracks": false,
  "modalityId": "string|null",
  "location": "string|null",
  "evaluatorNames": ["string"],
  "allEvaluators": false,
  "notes": "string|null"
}
```

Payload observado para `PATCH /api/graduations/exams/[examId]`:

```json
{
  "status": "in_progress|completed|cancelled"
}
```

Status exposto no dashboard e no app do professor para exames de graduacao:

- `scheduled`
- `in_progress`
- `completed`
- `cancelled`

Campos observados no dashboard admin para `eligibleStudents`:

- `manualEligibleOverride`
- `manualEligibleOverrideActors`:
  - lista deduplicada de atores que marcaram o aluno como apto;
  - cada item expoe `actorUserId`, `actorName`, `actorRole` e `displayName`;
  - o dashboard da academia usa `displayName` na coluna `Quem tornou apto`.

### APIs BFF do app

| Metodo | Endpoint | Status | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/app/teacher/evolution` | `existing` | Exibe elegibilidade, exames e historico de promocoes para o professor. |
| `POST` | `/api/app/teacher/evolution/eligible/[studentModalityId]` | `existing` | Marca o aluno como apto para graduar no escopo do professor e persiste a autoria para reflexo no dashboard da academia. |
| `POST` | `/api/app/teacher/evolution/exams/[examId]/candidates` | `existing` | Inclui aluno em exame agendado visivel ao professor. |
| `GET` | `/api/app/student/progress` | `existing` | Exibe historico de faixas e progresso do aluno. |

Payload observado para `POST /api/app/teacher/evolution/exams/[examId]/candidates`:

```json
{
  "studentModalityId": "string"
}
```

### Autorizacao

- admin: `GRADUATIONS_READ` e `GRADUATIONS_MANAGE`;
- professor:
  - leitura apenas do escopo que lhe pertence no app;
  - mutacoes no app exigem permissao `manageGraduations` do perfil do professor;
- aluno: leitura apenas do proprio historico.

### Escopo multi-tenant

- trilhas, exames e historicos pertencem ao tenant;
- overrides de elegibilidade nao podem escapar do tenant ou do aluno/modalidade correto.
- o BFF do professor pode apenas:
  - marcar aptidao do aluno dentro do seu escopo;
  - incluir aluno em exame `scheduled` visivel ao proprio professor.

---

## Finance

### Objetivo do modulo

Gerenciar cobrancas, status de pagamento e visao financeira relacionada ao aluno.

### Entidades principais

- `Charge`
- `Payment`
- `StudentPlan`

### Operacoes principais

- listar dashboard financeiro;
- criar cobranca;
- registrar pagamento;
- expor visao de pagamento para o aluno.

### APIs de dominio/admin

| Metodo | Endpoint | Status | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/finance` | `existing` | Retorna dashboard financeiro do tenant. |
| `POST` | `/api/finance` | `existing` | Cria cobranca. |
| `PATCH` | `/api/finance/[chargeId]/payment` | `existing` | Registra pagamento. |
| `PATCH` | `/api/finance/[chargeId]/discount` | `existing` | Aplica desconto manual em cobranca aberta. |
| `POST` | `/api/finance/coupons` | `existing` | Cria cupom financeiro. |
| `GET` | `/api/finance/settings` | `existing` | Retorna politicas financeiras da academia. |
| `PATCH` | `/api/finance/settings` | `existing` | Atualiza politicas financeiras da academia. |

Payload base observado para criar cobranca:

```json
{
  "userId": "string",
  "studentProfileId": "string|null",
  "description": "Mensalidade",
  "category": "membership",
  "amount": 199.9,
  "dueDate": "YYYY-MM-DD",
  "planId": "string|null",
  "recurrenceMode": "one_time|recurring",
  "recurringSource": "manual_amount|linked_plan"
}
```

Payload base observado para registrar pagamento:

```json
{
  "method": "PIX"
}
```

Payload base observado para atualizar politicas financeiras:

```json
{
  "acceptedMethods": ["pix", "card"],
  "gateway": "mercado_pago",
  "planTransitionPolicy": "next_cycle|immediate|prorata",
  "planTransitionChargeHandling": "replace_open_charge|charge_difference|convert_to_credit",
  "delinquencyGraceDays": 5,
  "delinquencyBlocksNewClasses": true,
  "delinquencyRemovesCurrentClasses": true,
  "delinquencyRecurringMode": "continue|pause",
  "delinquencyAccumulatesDebt": true
}
```

### APIs BFF do app

| Metodo | Endpoint | Status | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/app/student/payments` | `existing` | Retorna `StudentAppPaymentsData`. |
| `GET` | `/api/app/student/plans` | `existing` | Retorna planos contrataveis, plano atual, pendencia de troca e politica financeira resumida. |
| `POST` | `/api/app/student/plans` | `existing` | Ativa plano ou solicita troca de plano para o proprio aluno. |

### Autorizacao

- admin: `FINANCE_READ` e `FINANCE_MANAGE`;
- aluno: leitura apenas da propria situacao financeira.

### Escopo multi-tenant

- toda cobranca pertence a um tenant;
- o aluno so pode consumir cobrancas ligadas ao proprio perfil/vinculo.
- a politica financeira pertence ao tenant e a superficie administrativa oficial para edicao e:
  - `/dashboard/settings?tab=payments`

### Regras consolidadas do modulo

- a primeira cobranca do plano ativado pelo aluno e criada no ato da contratacao, mas nasce como `pending`;
- no mesmo dia da contratacao, a cobranca nao deve virar `overdue`; ela permanece `pending` ate ultrapassar a data operacional do vencimento e a carencia configurada;
- ao contratar um plano pelo app, a assinatura nasce como `PENDING`, nao `ACTIVE`;
- o plano so passa a ficar efetivo depois que a academia registra o pagamento da cobranca inicial;
- quando a academia confirma o pagamento inicial, a assinatura vai para `ACTIVE` e o `billingDay` passa a nascer da data da confirmacao;
- quando a academia vincula um plano direto no cadastro/edicao do aluno:
  - sem marcar `markPlanAsPaid`, a regra e a mesma do app: `Subscription = PENDING` e cobranca inicial `pending`;
  - marcando `markPlanAsPaid = true`, a cobranca inicial ja e gravada como `paid` e a assinatura fica `ACTIVE`;
- o admin pode criar mensalidade:
  - `pontual`
  - `recorrente`
- recorrencia pode ser criada por:
  - valor manual
  - plano existente
- se ja existir plano ativo, o admin recebe aviso de duplicidade antes de confirmar nova recorrencia vinculada a plano;
- a academia configura:
  - quando a troca de plano acontece;
  - como a cobranca atual e tratada;
  - como a inadimplencia afeta recorrencia e turmas.

---

## Events

### Objetivo do modulo

Gerenciar eventos da academia, participantes e exposicao de eventos relevantes para o app.

### Entidades principais

- `Event`
- `EventParticipant`

### Operacoes principais

- listar dashboard de eventos;
- criar evento;
- editar, cancelar, realizar e excluir evento;
- adicionar/remover participante;
- alterar status de participante e confirmar pagamento;
- abrir/fechar inscricoes;
- expor eventos relevantes para o professor;
- expor eventos relevantes para o aluno com autoinscricao e resposta ao convite.

### APIs de dominio/admin

| Metodo | Endpoint | Status | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/events` | `existing` | Retorna dashboard de eventos. |
| `POST` | `/api/events` | `existing` | Cria evento. |
| `PATCH` | `/api/events/[eventId]` | `existing` | Edita evento e troca status administrativo para `scheduled`, `completed` ou `cancelled`. |
| `DELETE` | `/api/events/[eventId]` | `existing` | Exclui evento apenas quando ainda nao houver participantes. |
| `POST` | `/api/events/[eventId]/participants` | `existing` | Adiciona participante. |
| `DELETE` | `/api/events/[eventId]/participants` | `existing` | Remove participante por query param `participantId`. |
| `PATCH` | `/api/events/[eventId]/participants` | `existing` | Atualiza status de participante, confirma pagamento ou altera abertura de inscricoes. |

Status canonicos do evento:

- `scheduled`
- `completed`
- `cancelled`

`draft/rascunho` nao faz mais parte do contrato nem da persistencia do modulo.

Status canonicos do participante:

- `invited`
- `confirmed`
- `maybe`
- `declined`
- `payment_pending`

Regras canonicas observadas:

- evento sem taxa:
  - admin/professor adicionam participante como `invited`;
  - aluno se autoinscreve como `confirmed`.
- evento com taxa:
  - admin/professor adicionam participante como `payment_pending`;
  - aluno se autoinscreve como `payment_pending`;
  - academia confirma manualmente o pagamento e o participante vira `confirmed`.
- participante confirmado ainda pode responder depois com `maybe` ou `declined`.

Payload base observado para criar evento:

```json
{
  "name": "Open Mat Solidario",
  "type": "seminar",
  "date": "YYYY-MM-DD",
  "time": "10:00",
  "modalityId": "string|null",
  "location": "string",
  "organizerName": "string|null",
  "teacherProfileId": "string|null",
  "capacity": 100,
  "hasRegistrationFee": false,
  "registrationsOpen": true,
  "registrationFeeAmount": null,
  "registrationFeeDueDays": null,
  "notes": "string|null"
}
```

Payload base observado para atualizar evento:

```json
{
  "name": "Open Mat Solidario",
  "type": "seminar",
  "date": "YYYY-MM-DD",
  "time": "10:00",
  "modalityId": "string|null",
  "location": "string",
  "organizerName": "string|null",
  "teacherProfileId": "string|null",
  "capacity": 100,
  "hasRegistrationFee": false,
  "registrationFeeAmount": null,
  "registrationFeeDueDays": null,
  "registrationsOpen": true,
  "notes": "string|null",
  "status": "scheduled|completed|cancelled"
}
```

Payloads observados para `PATCH /api/events/[eventId]/participants`:

```json
{
  "participantId": "string",
  "status": "invited|confirmed|maybe|declined"
}
```

```json
{
  "participantId": "string",
  "paymentMethod": "PIX|CARD|BOLETO|CASH"
}
```

```json
{
  "registrationsOpen": true
}
```

### APIs BFF do app

| Metodo | Endpoint | Status | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/app/teacher/events` | `existing` | Retorna `TeacherAppEventsData`. |
| `POST` | `/api/app/teacher/events/[eventId]/participants` | `existing` | Professor responsavel adiciona participante ao proprio evento, sujeito a permissao `manageEvents`. |
| `GET` | `/api/app/student/events` | `existing` | Retorna `StudentAppEventsData` com `upcomingEvents`, `myEvents` e `pastEvents`. |
| `POST` | `/api/app/student/events` | `existing` | Realiza a resposta inicial do aluno em evento elegivel por `eventId`, exigindo `initialStatus = confirmed|maybe|declined`. Em evento pago, `confirmed` cria o vinculo como `payment_pending`. |
| `PATCH` | `/api/app/student/events/[eventId]` | `existing` | Atualiza a resposta do proprio aluno para `confirmed`, `maybe` ou `declined`. |
| `DELETE` | `/api/app/student/events/[eventId]` | `existing` | Cancela a inscricao do proprio aluno no evento informado, refletindo `declined`. |

### Autorizacao

- admin: `EVENTS_READ` e `EVENTS_MANAGE`;
- professor: leitura do proprio escopo e adicao de participante apenas quando for responsavel pelo evento e `manageEvents` estiver ativo;
- aluno: leitura, autoinscricao e resposta ao convite apenas em eventos elegiveis ao seu escopo, sempre no tenant atual.

### Escopo multi-tenant

- evento sempre pertence a um tenant;
- participante sempre precisa pertencer ao tenant correto;
- exposicao no app deve respeitar o perfil do ator e o escopo do evento.

## Marketing

### Objetivo do modulo

Gerenciar identidade visual, configuracoes de IA, templates e geracao de conteudo de marketing da academia.

### APIs de dominio/admin

| Metodo | Endpoint | Status | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/marketing/brand-kit` | `existing` | Retorna o kit de marca do tenant. |
| `PUT` | `/api/marketing/brand-kit` | `existing` | Atualiza identidade visual e materiais do tenant. |
| `GET` | `/api/marketing/templates` | `existing` | Lista templates de marketing disponiveis. |
| `GET` | `/api/marketing/history` | `existing` | Lista historico de geracoes do tenant. |
| `GET` | `/api/marketing/ai-settings` | `existing` | Retorna configuracoes de IA do tenant. |
| `PUT` | `/api/marketing/ai-settings` | `existing` | Atualiza configuracoes de IA do tenant. |
| `GET` | `/api/marketing/academy-activities` | `existing` | Retorna as atividades principais da academia para uso no contexto de campanhas. |
| `POST` | `/api/marketing/generate` | `existing` | Gera o conteudo textual da peca e salva a geracao com o `input` canonico. |
| `POST` | `/api/marketing/generate-image` | `existing` | Gera ou regenera a imagem da peca ja criada. |

Payload base observado para `POST /api/marketing/generate`:

```json
{
  "input": {
    "objective": "attract|training|evolution|event|kids|trial",
    "contentType": "post|story|carousel|reels",
    "selectedAssetIds": ["string"],
    "uploadSource": "brand_kit|manual_upload|camera",
    "activityCategory": "jiu-jitsu|muay-thai",
    "selectedTemplateId": "string|null",
    "promptNotes": "string|null",
    "tone": "string|null",
    "callToAction": "string|null"
  }
}
```

Regras observadas:

- a aba `Identidade Visual` salva automaticamente qualquer alteracao de cor, tipografia, observacoes ou assets do `brand-kit`, sem CTA manual de salvar;
- cada autosave bem-sucedido deve informar o usuario por toast de sucesso;
- o seletor de cor do `brand-kit` usa picker visual + campo hexadecimal lado a lado, no mesmo padrao do layout de referencia;
- a etapa 3 de `Criar Conteúdo` usa `activityCategory` para contextualizar a peca;
- o campo `Atividade principal da campanha` fica no mesmo bloco de ajustes da etapa 3, ao lado de `Tom do conteúdo`;
- `activityCategory` representa atividade principal da academia, nao modalidade nem turma;
- texto e imagem recebem esse contexto no prompt de IA;
- a geracao salva o `input.activityCategory` no historico;
- cores, logotipo oficial e observacoes da marca entram automaticamente no contexto da geracao quando existirem no `brand-kit`;
- ao salvar o `brand-kit`, o logotipo selecionado passa por tratamento automatico no backend quando for imagem raster:
  - remocao de fundo quando o provider suportar;
  - melhoria de nitidez/qualidade do logo;
  - proibicao absoluta de alterar qualquer cor original do logotipo;
  - persistencia da versao tratada como logo canonico dos criativos;
  - preservacao do original em metadata do asset;
- esse tratamento de logo usa o mesmo multiprovider canonico do modulo `marketing`, obedecendo `primaryImageProvider` e `fallbackImageProvider` do tenant;
- `POST /api/marketing/generate-image` respeita a proporcao canonica da peca:
  - `post` -> `1:1`
  - `carousel` -> `4:5`
  - `story` e `reels` -> `9:16`
- as `promptNotes` da etapa 3 sao regra obrigatoria na geracao de imagem, nao apenas sugestao;
- a geracao de imagem deve produzir uma cena unica e integrada, sem colagem, mosaico, mockup, cartaz ou logo dominante;
- o preview do `Resultado` deve respeitar o formato gerado, sem forcacao visual para quadrado;
- `allowImageGeneration` passa a nascer habilitado por default para novos settings e registros existentes foram convergidos para `true`.
- quando houver logotipo oficial no `brand-kit`, a geracao de imagem deve tentar usa-lo apenas de forma discreta e natural no ambiente;
- se nao for possivel posicionar o logotipo oficial da academia de forma natural, a IA deve omitir qualquer logo da imagem;
- e proibido usar ou inventar logotipos de marcas, academias, equipes, patrocinadores ou concorrentes.

### Autorizacao

- leitura administrativa exige `MARKETING_READ`;
- mutacoes administrativas exigem `MARKETING_MANAGE`.

### Escopo multi-tenant

- kit de marca, settings, historico, atividades e geracoes pertencem sempre ao tenant atual do dashboard;
- a lista de atividades segue a fonte canonica da academia: modalidades ativas com `activityCategory`, com fallback para onboarding quando ainda nao houver modalidades ativas.

## Resumo Das Inconsistencias Mais Relevantes

- `attendance` ja possui superficie administrativa propria, mas ainda carrega legado de compatibilidade em `/api/classes/sessions`;
- parte dos contratos administrativos ainda esta implícita em route handlers, nao em contracts/DTOs do modulo;
- `events` ja possui BFF dedicado para `teacher` e `student`, mas ainda pode evoluir em UX mais avancada para detalhes e gerenciamento fino dos participantes;
- alguns endpoints administrativos estao corretos funcionalmente, mas ainda precisam de melhor alinhamento de fronteira e contratos.

## Mandatory Rules

- toda alteracao de endpoint MUST atualizar este documento quando afetar contrato, ownership, status ou autorizacao.
- `existing`, `planned` e `needs-refactor` MUST ser usados de forma literal, sem reclassificacao informal.
- endpoints administrativos MUST refletir o modulo dono da operacao.
- endpoints do app MUST continuar segregados por `teacher` e `student`.
- examples de payload neste documento MUST ser tratados como contrato de referencia, nao como sugestao descartavel.

## Examples (Correct vs Incorrect)

Correto:

- marcar um endpoint existente fora da fronteira ideal como `needs-refactor` e documentar a observacao de ownership.
- adicionar um endpoint novo do aluno em `/api/app/student/*` apenas quando a experiencia realmente exigir.

Incorreto:

- criar endpoint de professor em `/api/app/common/*` para “reuso”.
- alterar payload de um endpoint existente sem atualizar este documento.
- tratar um endpoint legado como padrao so porque ele ainda funciona.

## Checklist

- o endpoint esta no modulo HTTP correto;
- o status (`existing`, `planned`, `needs-refactor`) esta correto;
- autorizacao e escopo multi-tenant foram documentados;
- payload de request/response foi atualizado quando necessario;
- impacto em BFF de `teacher` ou `student` foi registrado;
- a alteracao nao contradiz `backend-architecture.md` nem `implementation-guidelines.md`.
