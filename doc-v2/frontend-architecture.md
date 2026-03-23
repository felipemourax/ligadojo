# Frontend Architecture

## Objetivo

Definir como o frontend do app deve ser organizado para suportar duas experiencias distintas, `teacher` e `student`, sem duplicar dominio e sem perder consistencia de layout, navegacao e manutencao.

## Estado Atual

### Segmentacao de rotas por role

Hoje ja existem rotas explicitas por papel:

```text
app/app/teacher/*
app/app/student/*
app/access
```

As rotas genericas legadas em `app/app/*` foram removidas. A superficie do app agora deve continuar estritamente segmentada por role.

### Shell compartilhado

Professor:

- usa shell dedicada em `modules/app/ui/teacher-app-shell.tsx`

Aluno:

- usa shell dedicada em `modules/app/ui/student-app-shell.tsx`

Conclusao:

- a segmentacao por role esta correta;
- o shell ja esta modularizado por role para professor e aluno.

### Modularizacao encontrada

Estrutura atual:

```text
modules/app/
  components/
    teacher/
  student/
  services/
  ui/
```

Isso esta mais aderente ao padrao alvo, mas ainda falta separar explicitamente:

- UI compartilhada;
- features compartilhadas;
- composicoes especificas de `teacher`;
- composicoes especificas de `student`.

Snapshot consolidado:

- o aluno ja usa composicao dedicada em `modules/app/student/*`
- o aluno ja usa shell dedicada em `modules/app/ui/student-app-shell.tsx`
- `modules/app/components/student/*` nao deve receber novo crescimento; o legado residual deve ser tratado apenas como migracao, nao como padrao
- a proxima frente estrutural do app continua sendo reduzir dependencia de `modules/app/components/teacher/*`

## Estado Alvo

## Shell Compartilhado

O app deve ter um conjunto de shells e primitives compartilhadas em `modules/app/ui/*`, capaz de suportar diferentes telas sem obrigar todo mundo a usar a mesma casca para intencoes muito diferentes.

Exemplo alvo:

```text
modules/app/ui/
  app-shell.tsx
  teacher-app-shell.tsx
  student-app-shell.tsx
  app-topbar.tsx
  app-bottom-nav.tsx
  layout-variant.ts
```

Regra:

- o shell compartilha estrutura;
- a configuracao de navegacao, menus e chrome visual pode variar por role;
- uma tela so deve usar o shell quando fizer sentido para aquela experiencia.

## Route Segmentation Por Papel

Regra oficial:

- intencoes diferentes devem ter rotas diferentes;
- professor e aluno nao devem depender da mesma rota para experiencias semanticamente distintas.

Padrao atual correto:

```text
/app/teacher/...
/app/student/...
/access
```

Diretriz:

- manter o codigo em ingles;
- manter o texto exibido em portugues;
- tratar rotas genericas de `/app/*` como removidas e nao reintroduzir nenhuma delas.
- tratar `/access` como tela de escolha de contexto do host da plataforma, nao como dashboard e nao como app de tenant.

## Selecao De Contexto No Host Da Plataforma

Quando o usuario entra pelo host da plataforma:

- `platform_admin` segue para `/platform`;
- visitante nao autenticado deve ver a landing publica do SaaS em `/`;
- usuarios com memberships de academia nao devem cair direto em `/dashboard`;
- usuarios com memberships de professor/aluno nao devem ser promovidos ao painel da academia;
- a navegacao correta e a tela `/access`, onde o usuario escolhe:
  - entrar como professor/aluno em uma academia vinculada;
  - abrir o dashboard de uma academia onde ja e `academy_admin`;
  - criar nova academia.

Regra de UX:

- esta escolha deve ser tela propria, nao modal improvisado;
- a decisao de troca de tenant continua no backend por `tenant-switch`/`dashboard-tenant`;
- o frontend so apresenta os contextos disponiveis da sessao.
- no host da academia, o autocadastro de `student` deve listar apenas as atividades principais oferecidas pela academia;
- turma nao deve ser pre-requisito visual nem tecnico para liberar o primeiro acesso do aluno ao app.

## Superficie Publica Da Plataforma

O projeto deve distinguir explicitamente:

- `site`:
  - site publico da academia;
  - servido no host do tenant;
- `platform-site`:
  - landing publica institucional do SaaS;
  - servida no host da plataforma.

Diretriz:

- nao reutilizar o modulo `site` para a landing institucional do produto;
- a home `/` do host da plataforma deve renderizar a landing apenas para visitante nao autenticado;
- `/login` continua sendo a rota propria de autenticacao e nao deve ser fundida com a landing.
- em producao, a entrada publica da plataforma deve viver em `ligadojo.com.br`;
- os tenants gerenciados devem usar `slug.ligadojo.com.br`;
- no host do tenant, `/` continua podendo servir o site publico da academia quando publicado;
- a entrada direta do app do tenant deve permanecer acessivel em `/app`.

## Superficie Administrativa Da Plataforma

- `/platform` e uma superficie dedicada de `platform_admin`;
- a UI dessa superficie deve viver em `modules/platform-admin`;
- o recorte atual implementado nessa superficie foi reduzido para:
  - `Dashboard`
  - `Academias`
- a navegacao dessa area nao deve depender de tenant ativo.

## Layout Variants

O sistema deve padronizar variantes de layout na camada de UI. Mesmo quando ainda nao implementadas em toda a superficie, elas devem orientar novas telas.

### `standard`

Uso:

- home;
- listagens;
- telas com navegacao completa.

Caracteristicas:

- top bar;
- bottom nav ou side nav;
- conteudo em scroll padrao;
- cards e secoes.

### `focus`

Uso:

- formularios;
- fluxos de conclusao;
- edicoes concentradas.

Caracteristicas:

- menos distracoes;
- CTA principal evidente;
- navegacao reduzida.

### `split`

Uso:

- agenda detalhada;
- presenca com painel e detalhe;
- comparacao de dados e contexto auxiliar.

Caracteristicas:

- duas areas principais;
- lista + detalhe;
- util quando a mesma tarefa exige contexto paralelo.

### `immersive`

Uso:

- experiencias de consumo mais profundas;
- possiveis visoes futuras de treino, progresso detalhado ou eventos especiais.

Caracteristicas:

- chrome reduzido;
- foco forte em uma unica tarefa ou narrativa.

## Feature Modules Com `base | teacher | student`

A organizacao recomendada para features compartilhadas e:

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
  profile/
    teacher/
    student/
```

### `base`

Deve conter:

- componentes visuais reaproveitaveis da feature;
- mappers de apresentacao compartilhados;
- hooks de interface genericos;
- tipos de view model.

Nao deve conter:

- regra de negocio;
- assumptos exclusivos de um papel quando nao forem compartilhados.

### `teacher`

Deve conter:

- composicao da feature para professor;
- componentes exclusivos da experiencia do professor;
- adaptadores de contrato da API de professor.

### `student`

Deve conter:

- composicao da feature para aluno;
- componentes exclusivos da experiencia do aluno;
- adaptadores de contrato da API de aluno.

## Composicao De Tela Por Role

Fluxo recomendado:

```text
Route page -> screen module -> feature composition -> ui shared
```

### `screen`

Responsabilidade:

- ser a entrada da rota;
- chamar os modulos necessarios;
- selecionar shell/layout variant;
- coordenar o fluxo da tela.

Nao deve:

- carregar regra de dominio;
- acumular JSX demais;
- repetir parsing de contrato em varios lugares.

### `component`

Responsabilidade:

- renderizar um trecho claro da interface;
- receber props estaveis;
- manter foco visual/interacional.

### `hook`

Responsabilidade:

- encapsular estado de interface;
- lidar com filtros, selecao, modal, feedback e submit;
- orquestrar chamadas de API do frontend.

Nao deve:

- recomputar regra canonica do dominio.

### `mapper`

Responsabilidade:

- transformar payload do BFF em view model;
- proteger a UI de detalhes de contrato bruto;
- evitar logica de formatacao espalhada.

### `state`

Responsabilidade:

- guardar estado de interface;
- armazenar filtros, ordenacao, aba ativa, formulario ou selecao local.

Nao deve:

- virar fonte oficial de verdade do dominio.

## Anti-patterns A Evitar

- usar a mesma rota para professor e aluno quando a intencao for diferente;
- duplicar componentes de feature com pequenas variacoes em pastas de role;
- colocar regra de negocio de presenca, elegibilidade ou cobranca no frontend;
- deixar `page.tsx` grande e com muita logica;
- acoplar componente diretamente a contrato bruto de varias APIs ao mesmo tempo;
- criar shell ou navegacao especifica espalhada fora de `modules/app/ui`;
- manter rotas genericas `/app/*` como destino primario de novas funcionalidades;
- misturar texto de UI em portugues com naming interno em portugues no codigo.

## Ajustes Prioritarios Identificados

- criar um shell padronizado para `student` dentro de `modules/app/ui/*`;
- evoluir `modules/app` de `components/services` para `ui/features/teacher/student`;
- tratar as rotas genericas de `/app/*` como legado e nao expandi-las;
- consolidar mappers e composicoes por feature para reduzir duplicacao futura.

## Mandatory Rules

- novas telas do app MUST nascer em rotas por role, nunca em rotas genericas legadas.
- `page.tsx` MUST funcionar como entrada de rota e composicao, nao como concentrador de regra e JSX extenso.
- `modules/app/ui/*` MUST ser a casa oficial de shell e layout variants.
- `modules/app/features/*` MUST concentrar UI compartilhada por feature quando houver reuso entre roles.
- hooks de frontend MUST NOT recalcular regra canonica de dominio.
- mappers MUST existir quando o contrato bruto da API nao for adequado para consumo direto da view.

## Examples (Correct vs Incorrect)

Correto:

- `app/app/teacher/attendance/page.tsx` compoe a tela usando feature module e BFF do professor.
- `modules/app/features/classes/base/*` concentra componentes e view models compartilhados.
- `modules/app/student/*` consome payload vindo de `/api/app/student/*` sem replicar regra de negocio.

Incorreto:

- criar nova tela de professor em `/app/classes` em vez de usar as rotas explicitas por role.
- colocar calculo de elegibilidade em `useStudentProgress`.
- colocar navegacao especifica do aluno em `components/layout/*` fora da estrutura do app.

## Checklist

- a rota e explicita por role;
- a tela usa shell/layout variant coerente com a experiencia;
- a composicao esta em `ui/features/teacher/student` conforme responsabilidade;
- nenhum hook ou component carrega regra de negocio;
- contrato bruto de API nao esta vazando de forma descontrolada para o JSX;
- a tela nao ampliou o uso do legado `/app/*`.
