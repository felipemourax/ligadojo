# Project Structure

## Objetivo

Mapear a estrutura atual encontrada no projeto e registrar a estrutura alvo esperada para manter consistencia com o padrao arquitetural definido.

## Visao Geral Do Estado Atual

### Backend de dominio

```text
apps/api/src/modules/
  academy-memberships/
  app/
  attendance/
  classes/
  crm/
  dashboard/
  enrollment-requests/
  events/
  finance/
  graduations/
  iam/
  invitations/
  marketing/
  modalities/
  onboarding/
  plans/
  site/
  students/
  teachers/
  tenancy/
```

### Web transport e BFF

```text
app/api/
  _lib/
  app/
    teacher/
    student/
  attendance/
  classes/
  events/
  finance/
  graduations/
  students/
  teachers/
  ...
```

### App frontend

```text
app/app/
  teacher/
  student/
  page.tsx

app/access/
  page.tsx

app/page.tsx
```

### Modulos de UI do app

```text
modules/app/
  components/
    teacher/
    student/
  services/
  ui/
```

### Superficie publica da plataforma

```text
modules/platform-site/
  components/
    platform-landing-page.tsx
```

Responsabilidade:

- landing publica do SaaS no host da plataforma;
- CTA institucionais e entrada para login, onboarding da academia e ranking publico;
- nao deve compartilhar ownership com o modulo `site`, que continua sendo o site publico da academia.

Modelo de host em producao:

- `ligadojo.com.br` = plataforma;
- `slug.ligadojo.com.br` = tenant gerenciado da academia;
- `slug.ligadojo.com.br/site` = rota explicita do site publico da academia;
- `slug.ligadojo.com.br/app` = entrada direta do app/login do tenant.

## Estrutura Atual Por Diretorio

### `apps/api/src/modules/*`

Responsabilidade:

- concentrar dominio e aplicacao de backend;
- encapsular regra de negocio;
- organizar services, repositories e modelos de dominio por modulo.

Padrao encontrado:

- mais maduro em modulos como `classes`, `modalities`, `plans`, `onboarding`, `tenancy`;
- mais enxuto em modulos como `teachers`, `students`, `events`, `finance`, `graduations`, onde ainda ha forte concentracao em services.

Exemplos atuais:

```text
apps/api/src/modules/classes/
  domain/
  repositories/
  services/

apps/api/src/modules/teachers/
  domain/
  services/

apps/api/src/modules/app/
  domain/
  services/
```

### `app/api/app/teacher/*`

Responsabilidade:

- BFF do app do professor;
- auth por tenant + role `teacher`;
- retorno de payloads voltados a experiencia do professor.

Estrutura atual:

```text
app/api/app/teacher/
  agenda/route.ts
  attendance/route.ts
  classes/route.ts
  events/route.ts
  evolution/route.ts
  home/route.ts
  profile/route.ts
```

### `app/api/app/student/*`

Responsabilidade:

- BFF do app do aluno;
- auth por tenant + role `student`;
- retorno de payloads voltados a experiencia do aluno.

Estrutura atual:

```text
app/api/app/student/
  attendance/route.ts
  classes/route.ts
  home/route.ts
  payments/route.ts
  progress/route.ts
```

### `modules/app/ui/*`

Responsabilidade alvo:

- shells;
- layout variants;
- primitivas compartilhadas do app.

Estado atual:

- existe `modules/app/ui/teacher-app-shell.tsx`;
- existe `modules/app/ui/student-app-shell.tsx`;
- existe uma tela de selecao de contexto no host da plataforma em `app/access/page.tsx`.

### `modules/app/features/*`

Estado atual:

- ainda nao existe como camada consolidada.

Estado alvo:

- concentrar features compartilhadas do app por dominio de tela;
- permitir composicao `base`, `teacher` e `student` sem duplicar regra ou UI desnecessariamente.

Exemplo alvo:

```text
modules/app/features/
  attendance/
    base/
    teacher/
    student/
  classes/
    base/
    teacher/
    student/
  agenda/
    base/
    teacher/
```

### `modules/app/teacher/*`

Estado atual:

- ainda nao existe como pasta dedicada;
- hoje o codigo do professor esta majoritariamente em `modules/app/components/teacher/*`.

Estado alvo:

- concentrar screens, mappers e composicoes especificas do professor.

### `modules/app/student/*`

Estado atual:

- ja existe como pasta dedicada;
- o codigo real do aluno deve viver em `modules/app/student/*`.

Estado alvo:

- concentrar screens, mappers e composicoes especificas do aluno.

## Regras De Superficie E Entrada

- `/dashboard/*` e uma superficie exclusiva de `academy_admin`.
- `/app/teacher/*` e `/app/student/*` exigem host de tenant e membership ativa naquele tenant.
- no host da plataforma local (`localhost:3000`), a home `/` para visitante nao autenticado deve renderizar a landing publica do SaaS;
- em producao, o host raiz da plataforma deve ser `ligadojo.com.br` e os tenants devem usar o padrao `slug.ligadojo.com.br`;
- o dominio raiz da plataforma e configuravel por `PLATFORM_ROOT_DOMAIN`, e os hosts publicos da plataforma podem ser complementados via `PLATFORM_HOSTS`;
- no host da plataforma (`localhost:3000` / `ligadojo.com.br`), usuarios autenticados que nao sao `platform_admin` devem passar primeiro pela selecao de contexto em `/access`.
- no host do tenant (`slug.ligadojo.com.br`), a raiz `/` continua sendo a superficie publica da academia quando o site estiver publicado;
- a entrada explicita do app do tenant deve continuar disponivel em `/app`.
- a tela `/access` deve listar:
  - academias onde o usuario entra como `teacher` ou `student`;
  - academias onde o usuario entra como `academy_admin`;
  - CTA para `Criar academia`.

## Estrutura Alvo Recomendada

```text
app/
  app/
    teacher/
      ...
    student/
      ...
  api/
    app/
      teacher/
        ...
      student/
        ...
    classes/
    students/
    teachers/
    graduations/
    finance/
    events/

apps/
  api/
    src/
      modules/
        app/
        attendance/
        classes/
        students/
        teachers/
        graduations/
        finance/
        events/
        ...

modules/
  app/
    ui/
    features/
      attendance/
      classes/
      agenda/
      progress/
      payments/
      events/
      profile/
    teacher/
    student/
```

## Regras De Responsabilidade Por Diretorio

### `apps/api/src/modules/*`

Deve conter:

- regra de negocio;
- services de dominio/aplicacao;
- contratos de dominio;
- repositorios;
- mapeadores de persistencia.

Nao deve conter:

- detalhes de tela;
- navegacao;
- componentes de interface.

### `app/api/*`

Deve conter:

- transporte HTTP;
- auth e authz;
- parse/validacao de entrada na fronteira;
- chamada de services;
- serializacao de resposta.

Nao deve conter:

- regra de negocio canonica espalhada;
- consultas soltas sem passar por servico/repositorio bem definido quando o modulo ja existir.

### `app/app/*`

Deve conter:

- screens por rota;
- composicao de layout;
- redirecionamento de fluxo de interface;
- fetch de dados da experiencia por meio do BFF correspondente.

Nao deve conter:

- regra de acesso como unica protecao;
- logica de dominio decisoria.

### `modules/app/*`

Deve conter:

- UI compartilhada;
- composicao por feature;
- componentes e mappers de experiencia;
- estados de interface.

Nao deve conter:

- duplicacao de regra entre professor e aluno;
- dependencia direta do banco;
- conhecimento de persistencia.

## Divergencias Estruturais Encontradas

- `modules/app/features/*` e `modules/app/teacher/*` ainda nao existem como padrao consolidado.
- `modules/app/student/*` ja foi introduzido e deve permanecer como fronteira de composicao do aluno.
- as rotas genericas legadas em `app/app/*` foram removidas; novas telas do app devem continuar apenas em `/app/teacher/*` e `/app/student/*`.
- o modulo `app` do backend esta correto como camada de experiencia/BFF, mas precisa continuar claramente separado do dominio central.
- a configuracao financeira da academia nao vive mais em rota dedicada propria; a superficie oficial agora esta em:
  - `app/dashboard/settings/page.tsx` com `?tab=payments`
- `app/dashboard/profile/page.tsx` foi removida para evitar duas fontes de verdade para politica financeira.

## Mandatory Rules

- nenhum novo diretorio estrutural MUST ser introduzido fora do padrao descrito neste documento sem atualizacao explicita da documentacao.
- `apps/api/src/modules/*` MUST continuar sendo a raiz do dominio.
- `app/api/app/teacher/*` e `app/api/app/student/*` MUST continuar restritos a transporte/BFF por experiencia.
- `modules/app/ui/*` MUST concentrar shell, layout e primitivas compartilhadas do app.
- `modules/app/features/*` MUST ser a direcao para features compartilhadas do app.
- `modules/app/teacher/*` e `modules/app/student/*` MUST concentrar composicoes especificas por role, sem duplicar dominio.

## Examples (Correct vs Incorrect)

Correto:

- mover composicoes de tela do professor de `modules/app/components/teacher/*` para `modules/app/teacher/*` ou `modules/app/features/*` durante a refatoracao.
- criar uma feature compartilhada em `modules/app/features/attendance/base/*` e extensoes por role em `teacher/*` e `student/*`.

Incorreto:

- criar `modules/app/shared-logic/attendance-business.ts` para centralizar regra de presenca no frontend.
- criar `app/api/app/common/*` para evitar segmentacao por role em endpoints do app.
- criar novos modulos de dominio fora de `apps/api/src/modules/*`.

## Checklist

- o arquivo novo esta sendo criado no diretorio dono da responsabilidade;
- a estrutura escolhida ja existe no estado alvo deste documento;
- a mudanca nao aumenta dependencia do legado `modules/app/components/*`;
- a mudanca nao cria novo ponto de duplicacao entre `teacher` e `student`;
- a alteracao preserva a separacao entre dominio, BFF e frontend.
