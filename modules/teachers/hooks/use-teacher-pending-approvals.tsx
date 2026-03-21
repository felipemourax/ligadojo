"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { fetchTeacherPendingApprovalsCount } from "@/modules/teachers/services/teacher-dashboard"

interface TeacherPendingApprovalsContextValue {
  pendingApprovalsCount: number
  isLoading: boolean
  refreshPendingApprovals: () => Promise<void>
}

const TeacherPendingApprovalsContext =
  createContext<TeacherPendingApprovalsContextValue | null>(null)

export function TeacherPendingApprovalsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const refreshPendingApprovals = useCallback(async () => {
    setIsLoading(true)

    try {
      const response = await fetchTeacherPendingApprovalsCount()
      setPendingApprovalsCount(response.count)
    } catch {
      setPendingApprovalsCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshPendingApprovals()

    const handleRefresh = () => {
      void refreshPendingApprovals()
    }

    window.addEventListener("dojo-session-refresh", handleRefresh)

    return () => {
      window.removeEventListener("dojo-session-refresh", handleRefresh)
    }
  }, [refreshPendingApprovals])

  const value = useMemo<TeacherPendingApprovalsContextValue>(
    () => ({
      pendingApprovalsCount,
      isLoading,
      refreshPendingApprovals,
    }),
    [isLoading, pendingApprovalsCount, refreshPendingApprovals]
  )

  return (
    <TeacherPendingApprovalsContext.Provider value={value}>
      {children}
    </TeacherPendingApprovalsContext.Provider>
  )
}

export function useTeacherPendingApprovals() {
  const context = useContext(TeacherPendingApprovalsContext)

  if (!context) {
    throw new Error(
      "useTeacherPendingApprovals deve ser usado dentro de TeacherPendingApprovalsProvider."
    )
  }

  return context
}
