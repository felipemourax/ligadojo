export interface DashboardOverviewStat {
  value: number
  trend: number
}

export interface DashboardOverviewData {
  stats: {
    totalStudents: DashboardOverviewStat
    newStudentsThisMonth: DashboardOverviewStat
    revenueThisMonth: DashboardOverviewStat
    attendanceAverage: DashboardOverviewStat
  }
  attendance: {
    totalLast7Days: number
    trend: number
    series: Array<{
      day: string
      attendanceCount: number
    }>
  }
  recentStudents: Array<{
    id: string
    name: string
    belt: string
    beltColorHex: string | null
    modality: string
    joinedAtLabel: string
  }>
  todayClasses: Array<{
    id: string
    name: string
    time: string
    instructor: string
    students: number
    maxStudents: number
    status: "upcoming" | "ongoing" | "completed" | "cancelled"
  }>
  alerts: Array<{
    id: string
    name: string
    issue: string
    type: "inactive" | "overdue"
  }>
}
