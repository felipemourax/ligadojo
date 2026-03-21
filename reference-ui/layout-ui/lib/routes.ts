// Fonte única de rotas do sistema
export const routes = {
  // Auth
  login: "/login",
  cadastro: "/cadastro",

  // Dashboard
  dashboard: "/dashboard",
  onboarding: "/dashboard/onboarding",

  // Explorar (Busca Global)
  explorer: "/dashboard/explorer",

  // Módulos
  students: "/dashboard/students",
  teachers: "/dashboard/teachers",
  classes: "/dashboard/classes",
  modalities: "/dashboard/modalities",
  plans: "/dashboard/plans",
  attendance: "/dashboard/attendance",
  graduations: "/dashboard/graduations",
  finance: "/dashboard/finance",
  crm: "/dashboard/crm",
  events: "/dashboard/events",
  techniques: "/dashboard/techniques",
  athletes: "/dashboard/athletes",
  site: "/dashboard/site",
  landing: "/dashboard/landing",
  store: "/dashboard/store",
  settings: "/dashboard/settings",
  // Marketing
  marketing: "/dashboard/marketing",
  marketingCreate: "/dashboard/marketing/create",
  marketingIdeas: "/dashboard/marketing/ideas",
  marketingCalendar: "/dashboard/marketing/calendar",
  marketingTemplates: "/dashboard/marketing/templates",
  marketingBranding: "/dashboard/marketing/branding",
  // App Aluno
  appAluno: "/app-aluno",
  // App Professor
  appProfessor: "/app-professor",
} as const

export type RouteKey = keyof typeof routes
export type Route = (typeof routes)[RouteKey]
