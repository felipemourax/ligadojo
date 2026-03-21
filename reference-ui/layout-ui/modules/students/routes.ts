import { routes } from "@/lib/routes"

export const studentRoutes = {
  list: routes.students,
  create: `${routes.students}/new`,
  view: (id: string) => `${routes.students}/${id}`,
  edit: (id: string) => `${routes.students}/${id}/edit`,
} as const
