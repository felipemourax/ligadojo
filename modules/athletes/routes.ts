import { athletesModule } from "./manifest"

export const athletesRoutes = {
  list: athletesModule.path,
} as const
