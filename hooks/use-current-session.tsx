"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { fetchJson } from "@/lib/api/client"
import type { SessionApiResponse } from "@/lib/domain/session-api"

interface CurrentSessionContextValue {
  session: SessionApiResponse | null
  isLoading: boolean
  error: string | null
  refreshSession: () => Promise<void>
}

const CurrentSessionContext = createContext<CurrentSessionContextValue | null>(null)

export function CurrentSessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [session, setSession] = useState<SessionApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadSession() {
    setIsLoading(true)

    try {
      const data = await fetchJson<SessionApiResponse>("/api/me/memberships")
      setSession(data)
      setError(null)
    } catch (err) {
      setSession(null)
      setError(err instanceof Error ? err.message : "Não foi possível carregar a sessão.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function guardedLoadSession() {
      setIsLoading(true)

      try {
        const data = await fetchJson<SessionApiResponse>("/api/me/memberships")

        if (!cancelled) {
          setSession(data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setSession(null)
          setError(err instanceof Error ? err.message : "Não foi possível carregar a sessão.")
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void guardedLoadSession()

    const handleRefresh = () => {
      void guardedLoadSession()
    }

    window.addEventListener("dojo-session-refresh", handleRefresh)

    return () => {
      cancelled = true
      window.removeEventListener("dojo-session-refresh", handleRefresh)
    }
  }, [])

  const value = useMemo<CurrentSessionContextValue>(
    () => ({
      session,
      isLoading,
      error,
      refreshSession: loadSession,
    }),
    [error, isLoading, session]
  )

  return <CurrentSessionContext.Provider value={value}>{children}</CurrentSessionContext.Provider>
}

export function useCurrentSession() {
  const context = useContext(CurrentSessionContext)

  if (!context) {
    throw new Error("useCurrentSession deve ser usado dentro de CurrentSessionProvider.")
  }

  return context
}
