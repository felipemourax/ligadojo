import { randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { NextResponse } from "next/server"
import { requireDashboardTenantCapability } from "@/app/api/_lib/dashboard-tenant-access"
import { capabilities } from "@/lib/capabilities"

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Map([
  ["image/png", ".png"],
  ["image/jpeg", ".jpg"],
  ["image/webp", ".webp"],
  ["image/svg+xml", ".svg"],
])

function sanitizeKind(value: FormDataEntryValue | null) {
  return value === "logo" || value === "banner" ? value : null
}

export async function POST(request: Request) {
  const access = await requireDashboardTenantCapability({
    capability: capabilities.SITE_MANAGE,
  })

  if (!access.ok) {
    return access.response
  }

  const formData = await request.formData()
  const file = formData.get("file")
  const kind = sanitizeKind(formData.get("kind"))

  if (!(file instanceof File) || !kind) {
    return NextResponse.json(
      {
        error: "bad_request",
        message: "Envie um arquivo válido e informe se ele é logo ou banner.",
      },
      { status: 400 }
    )
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      {
        error: "bad_request",
        message: "A imagem deve ter no máximo 5 MB.",
      },
      { status: 400 }
    )
  }

  const extension = ALLOWED_TYPES.get(file.type)

  if (!extension) {
    return NextResponse.json(
      {
        error: "bad_request",
        message: "Formato inválido. Use PNG, JPG, WEBP ou SVG.",
      },
      { status: 400 }
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const fileName = `${kind}-${Date.now()}-${randomUUID()}${extension}`
  const targetDir = path.join(process.cwd(), "public", "uploads", "branding")
  const filePath = path.join(targetDir, fileName)

  await mkdir(targetDir, { recursive: true })
  await writeFile(filePath, buffer)

  return NextResponse.json(
    {
      url: `/uploads/branding/${fileName}`,
    },
    { status: 201 }
  )
}
