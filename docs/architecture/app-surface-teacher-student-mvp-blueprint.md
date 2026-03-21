# App Surface MVP Blueprint

## Objective

Define the scalable architecture for the `app` surface used by the two remaining tenant-facing roles:

- `teacher`
- `student`

This blueprint keeps the current domain modules as the source of truth and uses the `app` surface as a role-aware experience layer.

## Architectural Decision

The `app` surface must not create parallel domain modules such as:

- `teacher-attendance`
- `student-attendance`
- `teacher-classes`
- `student-classes`

That would duplicate rules, drift from the academy dashboard, and raise maintenance cost.

The correct boundary is:

- domain modules remain where they already live
  - `attendance`
  - `classes`
  - `students`
  - `teachers`
  - `graduations`
  - `finance`
  - `events`
- the `app` surface aggregates and filters domain data by role
- `app` pages render mobile-first experiences for teacher and student

## Surface Model

### Dashboard

Used by the academy management layer.

### App

Used by:

- `teacher`
- `student`

The `app` surface is not a mini-dashboard of the academy. It is a guided operational/personal experience.

## Product Scope

### Teacher App

Primary goal: operational execution.

Core features for MVP:

- `Resumo`
  - upcoming classes
  - classes today
  - quick access to attendance
- `Agenda`
  - teacher weekly schedule
  - assigned classes
- `Presença`
  - attendance flow for classes taught by the teacher
  - recent attendance snapshots
- `Turmas`
  - teacher classes
  - students per class
  - modality/category per class

Second phase:

- `Evolução`
  - eligible students
  - linked exams
  - graduation-related visibility for the teacher scope
- `Eventos`
  - events where the teacher is responsible or participating
- `Perfil`
  - personal data
  - modalities taught

Out of scope for teacher MVP:

- academy finance management
- CRM
- marketing
- site builder
- academy-wide management settings

### Student App

Primary goal: personal journey.

Core features for MVP:

- `Resumo`
  - next class
  - attendance summary
  - current belt/progress
  - payment status
- `Presença`
  - personal attendance history
- `Turmas`
  - classes the student belongs to
  - class schedule
- `Evolução`
  - current modalities
  - belt / stripes
  - graduation history
- `Pagamentos`
  - current plan
  - pending/paid/overdue status
  - basic billing history

Second phase:

- `Agenda`
  - consolidated class and event schedule
- `Eventos`
  - participation and confirmation
- `Perfil`
  - personal data
  - practiced modalities

Out of scope for student MVP:

- attendance management
- academy-wide student list
- CRM
- marketing
- admin settings

## UX Principles

The `app` surface must be mobile-first while still working well on web.

### Mobile

- bottom navigation remains the primary shell
- large touch targets
- dense admin tables must not be reused
- cards, compact lists and clear primary actions
- sticky context actions when needed

### Web

- same IA and hierarchy
- content can expand into 2-column layouts where useful
- no dashboard-style heavy side management UI

### Experience split

- teacher = operational
- student = personal

## Integration Map

### Teacher app reuses

- `attendance`
  - attendance recording
  - recent attendance state
- `classes`
  - assigned classes
  - schedules
- `students`
  - students of the teacher classes only
- `graduations`
  - eligible students and linked exams in teacher scope
- `events`
  - responsible events or class-linked events

### Student app reuses

- `students`
  - own profile and modalities
- `attendance`
  - personal attendance history
- `graduations`
  - belt, stripes, graduation history, exams linked to the student
- `finance`
  - own charges and payment state
- `events`
  - joined events and confirmation status

## API and Service Strategy

The `app` surface should be served by dedicated application services that orchestrate existing domains.

These services should not own domain rules. They should:

- filter by current tenant membership
- aggregate data for the current role
- shape responses for mobile-first UI

Recommended layer:

- `apps/api/src/modules/app/domain/*`
- `apps/api/src/modules/app/services/*`
- `app/api/app/*`

## Exact MVP File Tree

```text
apps/api/src/modules/app/
  domain/
    teacher-app.ts
    student-app.ts
  services/
    teacher-app-home.service.ts
    teacher-app-agenda.service.ts
    teacher-app-attendance.service.ts
    teacher-app-classes.service.ts
    student-app-home.service.ts
    student-app-attendance.service.ts
    student-app-classes.service.ts
    student-app-progress.service.ts
    student-app-payments.service.ts

app/api/app/
  teacher/
    home/route.ts
    agenda/route.ts
    attendance/route.ts
    classes/route.ts
  student/
    home/route.ts
    attendance/route.ts
    classes/route.ts
    progress/route.ts
    payments/route.ts

modules/app/
  components/
    app-shell-header.tsx
    app-stat-card.tsx
    app-empty-state.tsx
    app-section-card.tsx
    teacher/
      teacher-home-screen.tsx
      teacher-agenda-screen.tsx
      teacher-attendance-screen.tsx
      teacher-classes-screen.tsx
    student/
      student-home-screen.tsx
      student-attendance-screen.tsx
      student-classes-screen.tsx
      student-progress-screen.tsx
      student-payments-screen.tsx
  services/
    teacher-app.ts
    student-app.ts

app/app/
  page.tsx
  agenda/page.tsx
  attendance/page.tsx
  classes/page.tsx
  progress/page.tsx
  payments/page.tsx
  profile/page.tsx
```

## Responsibility by File Layer

### `apps/api/src/modules/app/domain`

Contains DTO contracts for the `app` surface only.

Examples:

- teacher home cards
- student progress payload
- student payments list payload

### `apps/api/src/modules/app/services`

Server orchestration layer.

Responsibilities:

- load data from existing domain modules / Prisma aggregates
- apply role filtering
- return app-friendly DTOs

### `app/api/app/*`

Thin route handlers only.

Responsibilities:

- auth / membership guard
- call one app service
- return normalized payload

### `modules/app/components`

UI layer for teacher/student app experiences.

Responsibilities:

- mobile-first cards and lists
- shared touch-friendly UI blocks
- role-specific screens

### `modules/app/services`

Client-side fetch helpers for the `app` surface.

## Routing Strategy

Keep the existing `app` routes and switch content by role, not by URL tree duplication.

Examples:

- `/app`
  - teacher home if role = teacher
  - student home if role = student
- `/app/teacher/attendance`
  - teacher attendance management
- `/app/student/attendance`
  - student attendance history
- `/app/teacher/classes`
  - teacher classes
- `/app/student/classes`
  - student classes

This keeps the shell stable and reduces route sprawl.

## MVP Implementation Stages

### Stage 1: Foundation

- create `apps/api/src/modules/app/domain`
- create `apps/api/src/modules/app/services`
- create `app/api/app/teacher/*`
- create `app/api/app/student/*`
- create `modules/app/components`
- create `modules/app/services`

Deliverable:

- role-aware `app` API foundation
- no duplicated domain logic

### Stage 2: Teacher MVP

Implement:

- `Resumo`
- `Agenda`
- `Presença`
- `Turmas`

Data sources:

- `teachers`
- `classes`
- `attendance`
- `students`

Deliverable:

- teacher can operate day-to-day class flow from the `app`

### Stage 3: Student MVP

Implement:

- `Resumo`
- `Presença`
- `Turmas`
- `Evolução`
- `Pagamentos`

Data sources:

- `students`
- `attendance`
- `graduations`
- `finance`

Deliverable:

- student has a real personal journey app

### Stage 4: Teacher Phase 2

Implement:

- `Evolução`
- event linkage when relevant
- profile improvements

### Stage 5: Student Phase 2

Implement:

- `Agenda`
- `Eventos`
- profile refinements

## Why This Structure Is The Best Fit

This structure is the best tradeoff for the project because it:

- preserves current domain ownership
- avoids parallel modules
- reduces maintenance cost
- keeps UI role-aware without exploding routes
- supports mobile-first product evolution
- keeps the academy dashboard and the app surface aligned

## Anti-Patterns To Avoid

- creating new domain modules per role
- copying dashboard services into `app`
- exposing academy management UI inside the app surface
- designing student/teacher pages as table-heavy admin screens
- mixing teacher and student data visibility rules in UI only instead of service layer

## Recommended Next Step

Start implementation with:

1. `Stage 1`
2. `Stage 2`
3. `Stage 3`

This order maximizes reuse of the operational core that already exists.
