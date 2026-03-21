import { NextResponse } from "next/server"

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { status: 200, ...init })
}

export function created<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { status: 201, ...init })
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    {
      error: "bad_request",
      message,
      details,
    },
    { status: 400 }
  )
}

export function notFound(message: string) {
  return NextResponse.json(
    {
      error: "not_found",
      message,
    },
    { status: 404 }
  )
}

export function conflict(message: string) {
  return NextResponse.json(
    {
      error: "conflict",
      message,
    },
    { status: 409 }
  )
}
