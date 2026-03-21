import { routes } from "@/lib/routes"

export const graduationRoutes = {
  list: routes.graduations,
  create: `${routes.graduations}/new`,
  view: (id: string) => `${routes.graduations}/${id}`,
  belts: `${routes.graduations}/belts`,
  exams: `${routes.graduations}/exams`,
} as const
