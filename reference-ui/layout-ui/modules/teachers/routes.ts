import { routes } from "@/lib/routes"

export const teacherRoutes = {
  list: routes.teachers,
  create: `${routes.teachers}/new`,
  view: (id: string) => `${routes.teachers}/${id}`,
  edit: (id: string) => `${routes.teachers}/${id}/edit`,
} as const
