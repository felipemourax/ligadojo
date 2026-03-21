import { routes } from "@/lib/routes"

export const attendanceRoutes = {
  list: routes.attendance,
  register: `${routes.attendance}/register`,
  history: (studentId: string) => `${routes.attendance}/student/${studentId}`,
  report: `${routes.attendance}/report`,
} as const
