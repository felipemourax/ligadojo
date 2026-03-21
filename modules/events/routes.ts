import { eventsModule } from "./manifest"

export const eventRoutes = {
  list: eventsModule.path,
} as const
