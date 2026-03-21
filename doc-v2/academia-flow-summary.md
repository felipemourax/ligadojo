## Status das alterações

1. **Onboarding e tenant**
   - O `POST /api/onboarding/academy` agora distingue entre owner novo e owner existente; o serviço principal foi dividido em `academy-owner-resolution.service.ts` + `academy-provisioning.service.ts` + contratos (`create-academy-from-self-service.*`). O seed inicial foi unificado com a mesma fonte usada pelo onboarding (`academy-modality-seeds.ts`). O fluxo se limita às 6 etapas oficiais (`academy_info`, `location`, `class_structure`, `plans`, `branding`, `payments`) e não reabre o setup após conclusão.
   - As APIs `/api/onboarding/academy` e `/api/onboarding/academy-setup` tratam erros específicos (`unauthorized_existing_owner`, validação de modalidades/pagamentos) e já normalizam `ownerEmail` e `slug` para evitar duplicações.

2. **Modalidades e planos**
   - A exclusão física virou desativação: modalidade e plano são marcados como inativos e o histórico dos alunos e professores é preservado.
   - Os planos agora exigem pelo menos uma modalidade vinculada, aceitam `amountCents = 0` (gratuito), desativam em vez de excluir quando há alunos ativos e só são excluídos depois que os alunos migram.
   - A restauração reaproveita o mesmo `id` e reativa turmas/turmas e professores ligados.
   - O novo modelo `ClassGroupEnrollment` conecta alunos fixos à turma, sincronizando `currentStudents`, limitando presença (`ClassGroupService.normalizeSessionInput`) e alimentando o dashboard do professor e do aluno.

3. **Professores e turmas**
   - O fluxo de professores agora mostra `status` consistente (`pending`/`active`), removendo o campo `grau` e alinhando os dados no dashboard e no app.
   - Turmas só são criadas com professor ativo e modalidade ativa; o backend deriva `teacherName/modalityName` do banco.
   - O modal “Gerenciar alunos” (dashboard) e a tela de presença foram ajustados para destacar os alunos matriculados, mostrar limite/max students e bloquear checkboxes quando a turma está cheia.
   - A presença no app do professor agora consome `enrolledStudentIds`, exibindo somente alunos matriculados e adicionando legenda explicativa.
   - O aluno usa `POST`/`DELETE /api/app/student/classes/:id` para entrar/sair; os dados retornados (`joined`, `currentStudents`) já refletem o estado real da turma.

4. **Validações executadas**
   - Admin/painel: `PUT /api/classes/:id/students` com cookies de `dojo-centro.localhost`.
   - Professor: `GET /api/app/teacher/attendance` após mudanças de matrícula.
   - Aluno: `POST/DELETE /api/app/student/classes/:id`, verificando que a resposta atualiza `classes`.
   - Presença: o `classGroupService` só aceita IDs de `ClassGroupEnrollment` e bloqueia `present/absent` fora do vínculo.
   - O `prisma migrate dev --name class-group-enrollments` gerou `prisma/migrations/20260318201627_class_group_enrollments/migration.sql`.

## O que falta

1. Revalidar visualmente:
   - “Turmas → Gerenciar alunos” (botão destacado, tooltips de capacidade, estado `checked`).
   - Tela de presença (`AttendanceDashboardScreen`) para confirmar legendas e botões habilitados/desabilitados.
2. Garantir que o front do professor e do aluno fazem fetch dos novos endpoints após cada alteração (após o `POST/DELETE` de `student/classes/:id`, recarregar os dados do app).
3. Em futuros commits, incluir o migration acima e os novos handlers (`app/api/classes/[classId]/students/route.ts`, `app/api/app/student/classes/[classId]/route.ts`); precise manter `doc-v2` atualizado para refletir essas APIs.

## Orientações para o próximo Codex

1. Antes de qualquer mudança, leia **todo o projeto** (especialmente `app/api`, `apps/api/src/modules`, `modules`, `prisma/schema.prisma`) e a pasta `doc-v2` (arquitetura, especificação de APIs).
2. Sempre valide admin → professor → aluno ao modificar o fluxo de turmas para manter coerência. Use os cookies de `dojo-centro.localhost` para os testes reais.
3. Mantenha o padrão: handlers finos em `app/api`, serviços/repositórios em `apps/api/src/modules`, componentes em `modules/...`; preserve Clean Code/SOLID/DDD enquanto refatora.
4. Documente novos endpoints e ajustes em `doc-v2` (README, frontend/backed specs) antes de seguir para outro módulo.

## Referências úteis

- `doc-v2/project-structure.md`
- `doc-v2/backend-architecture.md`
- `doc-v2/frontend-architecture.md`
- `doc-v2/api-specification.md`
- `prisma/migrations/20260318201627_class_group_enrollments/migration.sql`
