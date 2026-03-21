import { routes } from "@/lib/routes"

export const techniqueRoutes = {
  list: routes.techniques,
  create: `${routes.techniques}/new`,
  view: (id: string) => `${routes.techniques}/${id}`,
  edit: (id: string) => `${routes.techniques}/${id}/edit`,
  categories: `${routes.techniques}/categories`,
} as const
