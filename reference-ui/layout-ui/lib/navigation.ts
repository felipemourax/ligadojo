import {
  LayoutDashboard,
  Users,
  Calendar,
  GraduationCap,
  Wallet,
  ClipboardCheck,
  Trophy,
  BookOpen,
  UserPlus,
  Settings,
  Dumbbell,
  CreditCard,
  Globe,
  ShoppingBag,
  UserCircle,
  Megaphone,
  PlusCircle,
  Lightbulb,
  CalendarDays,
  LayoutTemplate,
  Palette,
  Smartphone,
  Rocket,
  Search,
  Medal,
  FileText,
  type LucideIcon,
} from "lucide-react"
import { routes } from "./routes"

export interface NavItem {
  href: string
  icon: LucideIcon
  label: string
  description?: string
  badge?: string | number
}

export interface NavSection {
  title: string
  items: NavItem[]
}

// Main navigation sections for desktop sidebar
export const navSections: NavSection[] = [
  {
    title: "Principal",
    items: [
      { href: routes.dashboard, icon: LayoutDashboard, label: "Dashboard", description: "Visão geral" },
      { href: routes.onboarding, icon: Rocket, label: "Onboarding", description: "Configuração inicial" },
      { href: routes.modalities, icon: Dumbbell, label: "Modalidades", description: "Atividades oferecidas" },
      { href: routes.plans, icon: CreditCard, label: "Planos", description: "Planos e preços" },
      { href: routes.classes, icon: Calendar, label: "Turmas", description: "Gerenciar turmas" },
      { href: routes.students, icon: Users, label: "Alunos", description: "Cadastro de alunos" },
      { href: routes.teachers, icon: Users, label: "Professores", description: "Corpo docente" },
    ],
  },
  {
    title: "Gestão",
    items: [
      { href: routes.attendance, icon: ClipboardCheck, label: "Presença", description: "Controle de frequência" },
      { href: routes.graduations, icon: GraduationCap, label: "Graduação", description: "Faixas e graus" },
      { href: routes.finance, icon: Wallet, label: "Financeiro", description: "Pagamentos e cobranças" },
    ],
  },
  {
    title: "Presença Online",
    items: [
      { href: routes.site, icon: Globe, label: "Site", description: "Construtor de site" },
      { href: routes.landing, icon: FileText, label: "Landing Page", description: "Página institucional" },
      { href: routes.store, icon: ShoppingBag, label: "Loja Virtual", description: "Venda de produtos" },
    ],
  },
  {
    title: "Marketing",
    items: [
      { href: routes.marketing, icon: Megaphone, label: "Marketing", description: "Identidade e conteúdo" },
      { href: routes.marketingIdeas, icon: Lightbulb, label: "Ideias", description: "Ideias de conteúdo" },
      { href: routes.marketingCalendar, icon: CalendarDays, label: "Calendário", description: "Calendário de posts" },
    ],
  },
  {
    title: "Outros",
    items: [
      { href: routes.events, icon: Trophy, label: "Eventos", description: "Competições e seminários" },
      { href: routes.techniques, icon: BookOpen, label: "Técnicas", description: "Biblioteca de técnicas" },
      { href: routes.crm, icon: UserPlus, label: "CRM", description: "Gestão de leads" },
      { href: routes.athletes, icon: Medal, label: "Atletas", description: "Títulos e competições" },
    ],
  },
  {
    title: "Explorar",
    items: [
      { href: routes.explorer, icon: Search, label: "Busca Global", description: "Academias e atletas" },
    ],
  },
  {
    title: "Conta",
    items: [
      { href: routes.settings, icon: UserCircle, label: "Meu perfil", description: "Configurações da conta" },
      { href: routes.appAluno, icon: Smartphone, label: "App do Aluno", description: "Visualizar app do aluno" },
      { href: routes.appProfessor, icon: GraduationCap, label: "App do Professor", description: "Visualizar app do professor" },
    ],
  },
]

// Mobile bottom navigation (limited items)
export const mobileNavItems: NavItem[] = [
  { href: routes.dashboard, icon: LayoutDashboard, label: "Início" },
  { href: routes.students, icon: Users, label: "Alunos" },
  { href: routes.classes, icon: Calendar, label: "Turmas" },
  { href: routes.graduations, icon: GraduationCap, label: "Faixas" },
  { href: routes.finance, icon: Wallet, label: "Financeiro" },
]

// All navigation items flattened for mobile menu
export const allNavItems: NavItem[] = navSections.flatMap((section) => section.items)

// Settings navigation
export const settingsNavItems: NavItem[] = [
  { href: "/dashboard/settings", icon: Settings, label: "Configurações", description: "Preferências do sistema" },
  { href: "/dashboard/settings/academy", icon: LayoutDashboard, label: "Academia", description: "Dados da academia" },
  { href: "/dashboard/settings/users", icon: Users, label: "Usuários", description: "Permissões e acessos" },
  { href: "/dashboard/settings/plans", icon: Wallet, label: "Planos", description: "Mensalidades e pacotes" },
  { href: "/dashboard/settings/modalities", icon: GraduationCap, label: "Modalidades", description: "Artes marciais oferecidas" },
]

// Helper to check if a path is active
export function isActivePath(pathname: string, href: string): boolean {
  if (href === routes.dashboard) {
    return pathname === href
  }
  return pathname.startsWith(href)
}

// Get all routes for a module
export function getModuleRoutes(moduleSlug: string): string[] {
  const baseRoute = `/dashboard/${moduleSlug}`
  return [
    baseRoute,
    `${baseRoute}/new`,
    `${baseRoute}/[id]`,
    `${baseRoute}/[id]/edit`,
  ]
}
