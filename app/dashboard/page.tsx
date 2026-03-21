import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ClipboardCheck, TrendingUp, Users, Wallet } from "lucide-react"
import { resolveAuthenticatedUser } from "@/app/api/_lib/resolve-authenticated-user"
import { DashboardOverviewService } from "@/apps/api/src/modules/dashboard/services/dashboard-overview.service"
import { TenantRepository } from "@/apps/api/src/modules/tenancy/repositories/tenant.repository"
import { resolvePreferredDashboardMembership } from "@/lib/auth/dashboard-tenant"
import { AUTH_DASHBOARD_TENANT_COOKIE } from "@/lib/auth/session"
import { routes } from "@/lib/routes"
import { getResolvedTenantSurfaceContext } from "@/lib/tenancy"
import { StatCard } from "@/modules/dashboard/components/stat-card"
import { QuickActions } from "@/modules/dashboard/components/quick-actions"
import { RecentStudents } from "@/modules/dashboard/components/recent-students"
import { TodayClasses } from "@/modules/dashboard/components/today-classes"
import { AlertStudents } from "@/modules/dashboard/components/alert-students"
import { AttendanceChart } from "@/modules/dashboard/components/attendance-chart"

const dashboardOverviewService = new DashboardOverviewService()
const tenantRepository = new TenantRepository()

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 1,
  })
}

export default async function DashboardPage() {
  const auth = await resolveAuthenticatedUser()

  if (!auth.session) {
    redirect(routes.login)
  }

  const tenantContext = await getResolvedTenantSurfaceContext()
  const cookieStore = await cookies()
  const preferredDashboardTenantId = cookieStore.get(AUTH_DASHBOARD_TENANT_COOKIE)?.value ?? null
  const membership =
    tenantContext.resolvedTenant
      ? auth.session.tenantMemberships.find(
          (item) => item.tenantId === tenantContext.resolvedTenant?.id && item.status === "active"
        ) ?? null
      : resolvePreferredDashboardMembership(auth.session.tenantMemberships, preferredDashboardTenantId)

  if (!membership) {
    redirect(routes.login)
  }

  const tenant =
    tenantContext.resolvedTenant ??
    (membership.tenantId ? await tenantRepository.findById(membership.tenantId) : null)

  if (!tenant) {
    redirect(routes.login)
  }

  const overview = await dashboardOverviewService.getOverviewData(tenant.id)

  return (
    <div className="space-y-6">
      {/* Page Header - Desktop only */}
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua academia</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          title="Total de Alunos"
          value={overview.stats.totalStudents.value}
          icon={Users}
          trend={{ value: Math.abs(overview.stats.totalStudents.trend), isPositive: overview.stats.totalStudents.trend >= 0 }}
        />
        <StatCard
          title="Novos este mês"
          value={overview.stats.newStudentsThisMonth.value}
          icon={TrendingUp}
          trend={{ value: Math.abs(overview.stats.newStudentsThisMonth.trend), isPositive: overview.stats.newStudentsThisMonth.trend >= 0 }}
        />
        <StatCard
          title="Faturamento"
          value={formatCurrency(overview.stats.revenueThisMonth.value)}
          icon={Wallet}
          trend={{ value: Math.abs(overview.stats.revenueThisMonth.trend), isPositive: overview.stats.revenueThisMonth.trend >= 0 }}
        />
        <StatCard
          title="Presença Média"
          value={`${overview.stats.attendanceAverage.value}%`}
          icon={ClipboardCheck}
          trend={{ value: Math.abs(overview.stats.attendanceAverage.trend), isPositive: overview.stats.attendanceAverage.trend >= 0 }}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        {/* Left Column */}
        <div className="space-y-4 md:space-y-6">
          <AttendanceChart attendance={overview.attendance} />
          <RecentStudents students={overview.recentStudents} />
        </div>

        {/* Right Column */}
        <div className="space-y-4 md:space-y-6">
          <TodayClasses classes={overview.todayClasses} />
          <AlertStudents students={overview.alerts} />
        </div>
      </div>
    </div>
  )
}
