import { routes } from "@/lib/routes"

export const eventRoutes = {
  list: routes.events,
  create: `${routes.events}/new`,
  view: (id: string) => `${routes.events}/${id}`,
  edit: (id: string) => `${routes.events}/${id}/edit`,
  calendar: `${routes.events}/calendar`,
} as const
