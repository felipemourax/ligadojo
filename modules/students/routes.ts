import { studentsModule } from "./manifest"

export const studentRoutes = {
  list: studentsModule.path,
} as const
