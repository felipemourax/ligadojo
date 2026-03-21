import { NextResponse, type NextRequest } from "next/server"
import { routes } from "@/lib/routes"
import { TENANCY_HEADERS } from "@/lib/tenancy/config"
import { resolveTenantFromHost } from "@/lib/tenancy/resolve-tenant"

function withTenantHeaders(request: NextRequest) {
  const tenant = resolveTenantFromHost(
    request.headers.get("x-forwarded-host") ?? request.headers.get("host")
  )

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(TENANCY_HEADERS.kind, tenant.kind)
  requestHeaders.set(TENANCY_HEADERS.host, tenant.host)
  requestHeaders.set(TENANCY_HEADERS.slug, tenant.tenantSlug ?? "")
  requestHeaders.set(TENANCY_HEADERS.name, tenant.tenantName ?? "")
  requestHeaders.set(TENANCY_HEADERS.customDomain, String(tenant.isCustomDomain))

  return { tenant, requestHeaders }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { tenant, requestHeaders } = withTenantHeaders(request)

  if (pathname === "/app/professor" || pathname.startsWith("/app/professor/")) {
    const teacherAppUrl = request.nextUrl.clone()
    const legacyTeacherPathMap: Record<string, string> = {
      "/app/professor": "/app/teacher",
      "/app/professor/agenda": "/app/teacher/agenda",
      "/app/professor/attendance": "/app/teacher/attendance",
      "/app/professor/turmas": "/app/teacher/classes",
      "/app/professor/evolucao": "/app/teacher/evolution",
      "/app/professor/eventos": "/app/teacher/events",
      "/app/professor/perfil": "/app/teacher/profile",
    }
    teacherAppUrl.pathname = legacyTeacherPathMap[pathname] ?? "/app/teacher"
    return NextResponse.redirect(teacherAppUrl)
  }

  if (pathname === "/app/aluno" || pathname.startsWith("/app/aluno/")) {
    const studentAppUrl = request.nextUrl.clone()
    const legacyStudentPathMap: Record<string, string> = {
      "/app/aluno": "/app/student",
      "/app/aluno/presenca": "/app/student/attendance",
      "/app/aluno/turmas": "/app/student/classes",
      "/app/aluno/evolucao": "/app/student/progress",
      "/app/aluno/pagamentos": "/app/student/payments",
      "/app/aluno/perfil": "/app/student/profile",
    }
    studentAppUrl.pathname = legacyStudentPathMap[pathname] ?? "/app/student"
    return NextResponse.redirect(studentAppUrl)
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  }

  if (tenant.kind !== "tenant" && pathname.startsWith(routes.tenantApp)) {
    const platformFallbackUrl = request.nextUrl.clone()
    platformFallbackUrl.pathname = routes.login
    return NextResponse.redirect(platformFallbackUrl)
  }

  if (tenant.kind === "tenant" && pathname.startsWith(routes.platform)) {
    const tenantFallbackUrl = request.nextUrl.clone()
    tenantFallbackUrl.pathname = routes.tenantApp
    return NextResponse.redirect(tenantFallbackUrl)
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
}
