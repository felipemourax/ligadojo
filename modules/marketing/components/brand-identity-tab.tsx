"use client"

import { useEffect, useState, type RefObject } from "react"
import { ImageIcon, Palette, Plus, Trash2, Type, Upload, X } from "lucide-react"
import type {
  MarketingAssetEntity,
  MarketingAssetType,
  MarketingBrandKitEntity,
} from "@/apps/api/src/modules/marketing/domain/marketing"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { assetTypeLabels, typographyOptions } from "@/modules/marketing/lib/marketing-dashboard"

interface BrandIdentityTabProps {
  brandKit: MarketingBrandKitEntity | null
  isLoading: boolean
  logoInputRef: RefObject<HTMLInputElement | null>
  galleryInputRef: RefObject<HTMLInputElement | null>
  onConfigChange: (
    updater: (current: MarketingBrandKitEntity["config"]) => MarketingBrandKitEntity["config"]
  ) => void
  onUpdateAsset: (assetId: string, updater: (asset: MarketingAssetEntity) => MarketingAssetEntity) => void
  onRemoveAsset: (assetId: string) => void
  onFilesSelected: (files: FileList | null, type: MarketingAssetType) => Promise<void>
}

const defaultBrandColors = {
  primary: "#111827",
  secondary: "#475569",
  accent: "#dc2626",
} as const

const colorFields = [
  { key: "primary", label: "Cor primária", fallback: defaultBrandColors.primary },
  { key: "secondary", label: "Cor secundária", fallback: defaultBrandColors.secondary },
  { key: "accent", label: "Cor de destaque", fallback: defaultBrandColors.accent },
] as const

function normalizeHexDraft(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return "#"
  }

  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`
}

function isCompleteHexColor(value: string) {
  return /^#([0-9a-fA-F]{6})$/.test(value.trim())
}

function readLogoEnhancementState(asset: MarketingAssetEntity | null) {
  const metadata = asset?.metadata
  if (!metadata || typeof metadata !== "object" || !("logoEnhancement" in metadata)) {
    return null
  }

  const value = metadata.logoEnhancement
  if (!value || typeof value !== "object" || !("status" in value)) {
    return null
  }

  if (value.status === "succeeded") {
    return {
      label: "Fundo removido pela IA",
      variant: "default" as const,
    }
  }

  if (value.status === "skipped_vector") {
    return {
      label: "Logo vetorial preservado",
      variant: "secondary" as const,
    }
  }

  if (value.status === "failed") {
    return {
      label: "Não foi possível tratar o logo",
      variant: "outline" as const,
    }
  }

  return null
}

export function BrandIdentityTab({
  brandKit,
  isLoading,
  logoInputRef,
  galleryInputRef,
  onConfigChange,
  onUpdateAsset,
  onRemoveAsset,
  onFilesSelected,
}: BrandIdentityTabProps) {
  const assets = brandKit?.config.assets ?? []
  const logoAsset = assets.find((asset) => asset.id === brandKit?.config.selectedLogoAssetId) ?? null
  const galleryAssets = assets.filter((asset) => asset.type !== "logo")
  const logoEnhancementState = readLogoEnhancementState(logoAsset)
  const [colorDrafts, setColorDrafts] = useState({
    primary: brandKit?.config.colors.primary ?? defaultBrandColors.primary,
    secondary: brandKit?.config.colors.secondary ?? defaultBrandColors.secondary,
    accent: brandKit?.config.colors.accent ?? defaultBrandColors.accent,
  })

  useEffect(() => {
    setColorDrafts({
      primary: brandKit?.config.colors.primary ?? defaultBrandColors.primary,
      secondary: brandKit?.config.colors.secondary ?? defaultBrandColors.secondary,
      accent: brandKit?.config.colors.accent ?? defaultBrandColors.accent,
    })
  }, [brandKit?.config.colors.accent, brandKit?.config.colors.primary, brandKit?.config.colors.secondary])

  function commitColorChange(key: keyof typeof colorDrafts, value: string) {
    const normalizedValue = value.toLowerCase()
    setColorDrafts((current) => ({
      ...current,
      [key]: normalizedValue,
    }))
    onConfigChange((current) => ({
      ...current,
      colors: {
        ...current.colors,
        [key]: normalizedValue,
      },
    }))
  }

  function handleColorDraftChange(key: keyof typeof colorDrafts, value: string) {
    const normalizedDraft = normalizeHexDraft(value)
    setColorDrafts((current) => ({
      ...current,
      [key]: normalizedDraft,
    }))

    if (!isCompleteHexColor(normalizedDraft)) {
      return
    }

    commitColorChange(key, normalizedDraft)
  }

  function handleColorDraftBlur(key: keyof typeof colorDrafts) {
    const persistedValue = brandKit?.config.colors[key] ?? defaultBrandColors[key]
    setColorDrafts((current) => ({
      ...current,
      [key]: persistedValue,
    }))
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardContent className="space-y-6 p-6">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Identidade da marca</h3>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <Label className="text-sm text-muted-foreground">Paleta de cores</Label>
              <div className="space-y-3">
                {colorFields.map(({ key, label, fallback }) => (
                  <div key={key} className="space-y-2">
                    <Label className="text-xs text-muted-foreground">{label}</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={isCompleteHexColor(colorDrafts[key]) ? colorDrafts[key] : fallback}
                        disabled={isLoading || !brandKit}
                        onChange={(event) => commitColorChange(key, event.target.value)}
                        className="h-10 w-14 cursor-pointer rounded border-0 bg-transparent p-0"
                      />
                      <Input
                        value={colorDrafts[key]}
                        disabled={isLoading || !brandKit}
                        onChange={(event) => handleColorDraftChange(key, event.target.value)}
                        onBlur={() => handleColorDraftBlur(key)}
                        className="flex-1 bg-background font-mono uppercase"
                        maxLength={7}
                        spellCheck={false}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm text-muted-foreground">Tipografia</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Títulos</p>
                  <select
                    value={brandKit?.config.typography.headingFont ?? typographyOptions[0]}
                    disabled={isLoading || !brandKit}
                    onChange={(event) =>
                      onConfigChange((current) => ({
                        ...current,
                        typography: {
                          ...current.typography,
                          headingFont: event.target.value,
                        },
                      }))
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {typographyOptions.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Corpo</p>
                  <select
                    value={brandKit?.config.typography.bodyFont ?? typographyOptions[1]}
                    disabled={isLoading || !brandKit}
                    onChange={(event) =>
                      onConfigChange((current) => ({
                        ...current,
                        typography: {
                          ...current.typography,
                          bodyFont: event.target.value,
                        },
                      }))
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {typographyOptions.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 lg:col-span-2">
              <Label className="text-sm text-muted-foreground">Observações da marca</Label>
              <Textarea
                rows={3}
                value={brandKit?.config.notes ?? ""}
                disabled={isLoading || !brandKit}
                onChange={(event) =>
                  onConfigChange((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                placeholder="Ex.: usar sempre logo escuro, linguagem acolhedora, foco em disciplina e performance."
                className="resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Logotipo</h3>
            </div>

            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void onFilesSelected(event.target.files, "logo")}
            />

            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="w-full rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/50"
            >
              {logoAsset ? (
                <div className="space-y-3">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-xl border border-border bg-background">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoAsset.thumbnailUrl ?? logoAsset.fileUrl}
                      alt={logoAsset.name}
                      className="h-16 w-16 rounded-lg object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{logoAsset.name}</p>
                    <p className="text-xs text-muted-foreground">Clique para trocar</p>
                    {logoEnhancementState ? (
                      <div className="mt-2">
                        <Badge variant={logoEnhancementState.variant}>
                          {logoEnhancementState.label}
                        </Badge>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Arraste ou clique</p>
                    <p className="text-xs text-muted-foreground">PNG, SVG ou JPG</p>
                  </div>
                </div>
              )}
            </button>

            {logoAsset ? (
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => logoInputRef.current?.click()}>
                  Trocar logo
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onRemoveAsset(logoAsset.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Type className="h-4 w-4 text-primary" />
                  Tipografia
                </div>
                <p className="text-sm text-muted-foreground">
                  {brandKit?.config.typography.headingFont ?? "--"} / {brandKit?.config.typography.bodyFont ?? "--"}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Palette className="h-4 w-4 text-primary" />
                  Cores ativas
                </div>
                <div className="flex gap-2">
                  {[brandKit?.config.colors.primary, brandKit?.config.colors.secondary, brandKit?.config.colors.accent]
                    .filter(Boolean)
                    .map((color) => (
                      <span
                        key={color}
                        className="h-8 w-8 rounded-lg border border-border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Materiais visuais</h3>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => galleryInputRef.current?.click()}>
                <Plus className="mr-1.5 h-4 w-4" />
                Adicionar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Fotos da academia, equipe e professor para usar em templates e conteúdo.
            </p>

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => void onFilesSelected(event.target.files, "academy_photo")}
            />

            {galleryAssets.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Nenhum material cadastrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {galleryAssets.map((asset) => (
                  <div key={asset.id} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted">
                    <div className="absolute inset-0 bg-muted/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={asset.thumbnailUrl ?? asset.fileUrl}
                        alt={asset.name}
                        className="h-full w-full object-cover"
                      />
                      <Badge className="absolute left-2 top-2 text-[10px]">
                        {assetTypeLabels[asset.type]}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => onRemoveAsset(asset.id)}
                        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive/80 opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <Input
                          value={asset.name}
                          onChange={(event) =>
                            onUpdateAsset(asset.id, (current) => ({
                              ...current,
                              name: event.target.value,
                              updatedAt: new Date().toISOString(),
                            }))
                          }
                          className="h-7 border-0 bg-transparent px-0 text-xs font-medium text-white shadow-none focus-visible:ring-0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
