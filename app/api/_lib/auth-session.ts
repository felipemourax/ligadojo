import { NextResponse } from "next/server"
import {
  AUTH_DASHBOARD_TENANT_COOKIE,
  AUTH_SESSION_COOKIE,
  AUTH_SESSION_COOKIE_MAX_AGE,
} from "@/lib/auth/session"

export function attachAuthSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_SESSION_COOKIE_MAX_AGE,
  })

  return response
}

export function attachDashboardTenantCookie(response: NextResponse, tenantId: string) {
  response.cookies.set(AUTH_DASHBOARD_TENANT_COOKIE, tenantId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_SESSION_COOKIE_MAX_AGE,
  })

  return response
}

export function clearAuthSessionCookie(response: NextResponse) {
  response.cookies.set(AUTH_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })

  return response
}

export function clearDashboardTenantCookie(response: NextResponse) {
  response.cookies.set(AUTH_DASHBOARD_TENANT_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })

  return response
}
