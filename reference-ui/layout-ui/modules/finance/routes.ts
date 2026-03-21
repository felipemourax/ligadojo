import { routes } from "@/lib/routes"

export const financeRoutes = {
  index: routes.finance,
  invoices: `${routes.finance}/invoices`,
  payments: `${routes.finance}/payments`,
  plans: `${routes.finance}/plans`,
  reports: `${routes.finance}/reports`,
} as const
