import { teachersModule } from "./manifest"

export const teacherRoutes = {
  list: teachersModule.path,
} as const
