import { Users, TrendingUp, Wallet, ClipboardCheck } from "lucide-react"
import { StatCard } from "@/modules/dashboard/components/stat-card"
import { QuickActions } from "@/modules/dashboard/components/quick-actions"
import { RecentStudents } from "@/modules/dashboard/components/recent-students"
import { TodayClasses } from "@/modules/dashboard/components/today-classes"
import { AlertStudents } from "@/modules/dashboard/components/alert-students"
import { AttendanceChart } from "@/modules/dashboard/components/attendance-chart"

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Page Header - Desktop only */}
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua academia</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          title="Total de Alunos"
          value="248"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Novos este mês"
          value="18"
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Faturamento"
          value="R$ 42.5k"
          icon={Wallet}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Presença Média"
          value="78%"
          icon={ClipboardCheck}
          trend={{ value: 3, isPositive: false }}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        {/* Left Column */}
        <div className="space-y-4 md:space-y-6">
          <AttendanceChart />
          <RecentStudents />
        </div>

        {/* Right Column */}
        <div className="space-y-4 md:space-y-6">
          <TodayClasses />
          <AlertStudents />
        </div>
      </div>
    </div>
  )
}
