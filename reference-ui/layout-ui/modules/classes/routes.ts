import { routes } from "@/lib/routes"

export const classRoutes = {
  list: routes.classes,
  create: `${routes.classes}/new`,
  view: (id: string) => `${routes.classes}/${id}`,
  edit: (id: string) => `${routes.classes}/${id}/edit`,
  schedule: `${routes.classes}/schedule`,
} as const
