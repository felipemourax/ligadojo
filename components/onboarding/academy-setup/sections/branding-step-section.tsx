"use client"

import Image from "next/image"
import { Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface BrandingState {
  appName: string
  logoUrl: string
  bannerUrl: string
  primaryColor: string
  secondaryColor: string
}

interface BrandingStepSectionProps {
  data: BrandingState
  isUploadingBranding: "logo" | null
  normalizeHexColor: (value: string) => string
  onChangeField: (field: keyof BrandingState, value: string) => void
  onUpload: (kind: "logo", file: File) => void
}

export function BrandingStepSection({
  data,
  isUploadingBranding,
  normalizeHexColor,
  onChangeField,
  onUpload,
}: BrandingStepSectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <Label>Nome do app</Label>
        <Input value={data.appName} onChange={(event) => onChangeField("appName", event.target.value)} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Logotipo</Label>
        <div className="rounded-2xl border border-dashed border-border p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/40">
              {data.logoUrl ? (
                <Image alt="Prévia do logotipo" className="h-full w-full object-cover" height={96} src={data.logoUrl} width={96} />
              ) : (
                <Upload className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-sm text-muted-foreground">
                Envie o logotipo da sua academia para personalizar o painel e o app.
              </p>
              <Input
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) {
                    onUpload("logo", file)
                  }
                }}
                type="file"
              />
              {isUploadingBranding === "logo" ? <p className="text-xs text-muted-foreground">Enviando logotipo...</p> : null}
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Cor primária</Label>
        <div className="flex gap-3">
          <input
            className="h-11 w-14 cursor-pointer rounded-xl border border-input bg-transparent p-1"
            onChange={(event) => onChangeField("primaryColor", event.target.value)}
            type="color"
            value={data.primaryColor || "#16a34a"}
          />
          <Input
            onChange={(event) => onChangeField("primaryColor", normalizeHexColor(event.target.value))}
            value={data.primaryColor}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Cor secundária</Label>
        <div className="flex gap-3">
          <input
            className="h-11 w-14 cursor-pointer rounded-xl border border-input bg-transparent p-1"
            onChange={(event) => onChangeField("secondaryColor", event.target.value)}
            type="color"
            value={data.secondaryColor || "#0f172a"}
          />
          <Input
            onChange={(event) => onChangeField("secondaryColor", normalizeHexColor(event.target.value))}
            value={data.secondaryColor}
          />
        </div>
      </div>
    </div>
  )
}
