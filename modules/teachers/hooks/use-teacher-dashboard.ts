import { useCallback, useEffect, useState } from "react"
import { fetchTeacherDashboardRecords } from "@/modules/teachers/services/teacher-dashboard"
import type {
  TeacherDashboardRecord,
  TeacherGraduationCatalogItem,
} from "@/apps/api/src/modules/teachers/domain/teacher-dashboard"

export function useTeacherDashboard() {
  const [teacherRecords, setTeacherRecords] = useState<TeacherDashboardRecord[]>([])
  const [graduationCatalog, setGraduationCatalog] = useState<TeacherGraduationCatalogItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    setIsLoading(true)
    setError(null)

    void fetchTeacherDashboardRecords(controller.signal)
      .then((response) => {
        if (!active) {
          return
        }
        setTeacherRecords(response.teachers)
        setGraduationCatalog(response.graduationCatalog)
      })
      .catch((err) => {
        if (!active) {
          return
        }
        setError(err instanceof Error ? err : new Error("Não foi possível carregar os professores."))
      })
      .finally(() => {
        if (!active) {
          return
        }
        setIsLoading(false)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [reloadKey])

  const refresh = useCallback(() => {
    setReloadKey((current) => current + 1)
  }, [])

  return {
    teacherRecords,
    graduationCatalog,
    setTeacherRecords,
    isLoading,
    error,
    refresh,
  }
}
