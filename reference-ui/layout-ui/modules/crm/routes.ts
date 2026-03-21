import { routes } from "@/lib/routes"

export const crmRoutes = {
  list: routes.crm,
  create: `${routes.crm}/new`,
  view: (id: string) => `${routes.crm}/${id}`,
  pipeline: `${routes.crm}/pipeline`,
  campaigns: `${routes.crm}/campaigns`,
} as const
