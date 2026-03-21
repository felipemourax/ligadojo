"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  FolderOpen,
  ImageIcon,
  Library,
  Loader2,
  RefreshCw,
  Sparkles,
  Wand2,
} from "lucide-react"
import type {
  MarketingAcademyActivity,
  MarketingBrandKitEntity,
  MarketingGenerationEntity,
  MarketingGenerationInput,
} from "@/apps/api/src/modules/marketing/domain/marketing"
import type { MarketingTemplateView } from "@/apps/api/src/modules/marketing/domain/marketing-templates"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import {
  contentFormats,
  contentObjectives,
  getMarketingResultAspectClass,
  getMarketingResultMaxWidthClass,
  isTemplateCompatible,
  resolveMaterialSource,
  toneOptions,
  type CreateStep,
  type MarketingMaterialSource,
  updateInputForMaterialSource,
} from "@/modules/marketing/lib/marketing-dashboard"

interface CreateContentTabProps {
  brandKit: MarketingBrandKitEntity | null
  templates: MarketingTemplateView[]
  latestGeneration: MarketingGenerationEntity | null
  generationInput: MarketingGenerationInput
  createStep: CreateStep
  academyActivities: MarketingAcademyActivity[]
  isGenerating: boolean
  isGeneratingImage: boolean
  onCreateStepChange: (step: CreateStep) => void
  onGenerationInputChange: (
    updater: (current: MarketingGenerationInput) => MarketingGenerationInput
  ) => void
  onGenerateContent: () => Promise<void>
  onGenerateContentFlow: () => Promise<void>
  onGenerateImage: () => Promise<void>
  onDownloadGeneration: () => Promise<void>
  onResetFlow: () => void
}

const steps: Array<{ number: CreateStep; title: string; description: string }> = [
  { number: 1, title: "Objetivo", description: "Intenção do conteúdo" },
  { number: 2, title: "Formato", description: "Tipo de publicação" },
  { number: 3, title: "Composição", description: "Materiais e ajustes" },
  { number: 4, title: "Resultado", description: "Gerar e baixar" },
]

export function CreateContentTab({
  brandKit,
  templates,
  latestGeneration,
  generationInput,
  createStep,
  academyActivities,
  isGenerating,
  isGeneratingImage,
  onCreateStepChange,
  onGenerationInputChange,
  onGenerateContent,
  onGenerateContentFlow,
  onGenerateImage,
  onDownloadGeneration,
  onResetFlow,
}: CreateContentTabProps) {
  const assets = brandKit?.config.assets ?? []
  const materialSource = resolveMaterialSource(generationInput)
  const compatibleTemplates = useMemo(
    () => templates.filter((template) => isTemplateCompatible(template, generationInput)),
    [templates, generationInput]
  )
  const hasGeneratedFinalImage =
    typeof latestGeneration?.result?.imageUrl === "string" &&
    latestGeneration.result.imageUrl.length > 0
  const resultFormat =
    latestGeneration?.result?.suggestedFormat === "story" ||
    latestGeneration?.result?.suggestedFormat === "carousel" ||
    latestGeneration?.result?.suggestedFormat === "reels" ||
    latestGeneration?.result?.suggestedFormat === "post"
      ? latestGeneration.result.suggestedFormat
      : generationInput.contentType

  const [draftTitle, setDraftTitle] = useState("")
  const [draftCaption, setDraftCaption] = useState("")
  const [draftHashtags, setDraftHashtags] = useState<string[]>([])

  useEffect(() => {
    setDraftTitle(latestGeneration?.result?.headline ?? "")
    setDraftCaption(latestGeneration?.result?.caption ?? "")
    setDraftHashtags(latestGeneration?.result?.hashtags ?? [])
  }, [latestGeneration])

  function handleToggleAsset(assetId: string) {
    onGenerationInputChange((current) => ({
      ...current,
      selectedAssetIds: current.selectedAssetIds.includes(assetId)
        ? current.selectedAssetIds.filter((id) => id !== assetId)
        : [...current.selectedAssetIds, assetId],
    }))
  }

  function canProceed() {
    switch (createStep) {
      case 1:
        return Boolean(generationInput.objective)
      case 2:
        return Boolean(generationInput.contentType)
      case 3:
        return Boolean(materialSource) && (academyActivities.length === 0 || Boolean(generationInput.activityCategory))
      default:
        return false
    }
  }

  async function handleNext() {
    if (createStep === 3) {
      await onGenerateContentFlow()
      return
    }

    onCreateStepChange((createStep + 1) as CreateStep)
  }

  function handleBack() {
    if (createStep === 1) {
      return
    }

    onCreateStepChange((createStep - 1) as CreateStep)
  }

  function copyToClipboard(text: string) {
    void navigator.clipboard.writeText(text)
    toast({
      title: "Copiado",
      description: "O conteúdo foi copiado para a área de transferência.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-2">
        {steps.map((step, index) => (
          <div key={step.number} className="flex flex-1 items-center">
            <button
              type="button"
              onClick={() => createStep > step.number && onCreateStepChange(step.number)}
              disabled={createStep < step.number}
              className={cn(
                "flex flex-1 items-center gap-2 rounded-lg px-3 py-2 transition-all",
                createStep === step.number && "bg-primary/10",
                createStep > step.number && "hover:bg-muted"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  createStep === step.number
                    ? "bg-primary text-primary-foreground"
                    : createStep > step.number
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {createStep > step.number ? <Check className="h-3.5 w-3.5" /> : step.number}
              </div>
              <div className="hidden text-left md:block">
                <p
                  className={cn(
                    "text-sm font-medium",
                    createStep >= step.number ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </p>
              </div>
            </button>
            {index < steps.length - 1 ? (
              <div className={cn("mx-1 hidden h-px w-8 sm:block", createStep > step.number ? "bg-primary/30" : "bg-border")} />
            ) : null}
          </div>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardContent className={cn("p-6", createStep < 4 && "pb-28 md:pb-6")}>
          {createStep === 1 ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Qual o objetivo do conteúdo?</h3>
                <p className="text-sm text-muted-foreground">
                  Escolha a intenção principal antes de continuar.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {contentObjectives.map((objective) => {
                  const Icon = objective.icon
                  const selected = generationInput.objective === objective.value
                  return (
                    <button
                      key={objective.value}
                      type="button"
                      onClick={() =>
                        onGenerationInputChange((current) => ({
                          ...current,
                          objective: objective.value,
                        }))
                      }
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-4 text-left transition-all hover:border-primary/50",
                        selected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border bg-background"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                          selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{objective.label}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{objective.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}

          {createStep === 2 ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Qual o formato?</h3>
                <p className="text-sm text-muted-foreground">
                  Escolha o tipo de publicação que deseja criar.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {contentFormats.map((format) => {
                  const Icon = format.icon
                  const selected = generationInput.contentType === format.value
                  return (
                    <button
                      key={format.value}
                      type="button"
                      onClick={() =>
                        onGenerationInputChange((current) => ({
                          ...current,
                          contentType: format.value,
                        }))
                      }
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border p-5 text-center transition-all hover:border-primary/50",
                        selected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border bg-background"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-xl",
                          selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <p className="font-medium text-foreground">{format.label}</p>
                      <p className="text-xs text-muted-foreground">{format.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}

          {createStep === 3 ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Como deseja criar o conteúdo?</h3>
                <p className="text-sm text-muted-foreground">
                  Escolha a fonte dos materiais visuais para a composição.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() =>
                    onGenerationInputChange((current) =>
                      updateInputForMaterialSource(current, "library")
                    )
                  }
                  className={cn(
                    "flex flex-col items-center gap-3 rounded-xl border p-6 text-center transition-all hover:border-primary/50",
                    materialSource === "library"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-background"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-xl",
                      materialSource === "library"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <FolderOpen className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Minha biblioteca</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Usar fotos e logo cadastrados na identidade visual
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onGenerationInputChange((current) =>
                      updateInputForMaterialSource(current, "ai")
                    )
                  }
                  className={cn(
                    "flex flex-col items-center gap-3 rounded-xl border p-6 text-center transition-all hover:border-primary/50",
                    materialSource === "ai"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-background"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-xl",
                      materialSource === "ai"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Wand2 className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Gerar com IA</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Deixar a IA criar a imagem do zero com suas cores
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onGenerationInputChange((current) =>
                      updateInputForMaterialSource(current, "template", compatibleTemplates[0]?.id)
                    )
                  }
                  className={cn(
                    "flex flex-col items-center gap-3 rounded-xl border p-6 text-center transition-all hover:border-primary/50",
                    materialSource === "template"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-background"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-xl",
                      materialSource === "template"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Library className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Usar template salvo</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Escolher um modelo pronto para começar mais rápido
                    </p>
                  </div>
                </button>
              </div>

              {materialSource === "library" ? (
                <div className="space-y-4 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Selecione os materiais</h4>
                      <p className="text-xs text-muted-foreground">
                        Escolha quais fotos e logo usar na composição
                      </p>
                    </div>
                    <Badge variant="outline">{generationInput.selectedAssetIds.length} selecionado(s)</Badge>
                  </div>

                  {assets.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                      Cadastre materiais na aba <strong>Identidade Visual</strong> para reutilizar aqui.
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-3">
                      {assets.map((asset) => {
                        const selected = generationInput.selectedAssetIds.includes(asset.id)
                        return (
                          <button
                            key={asset.id}
                            type="button"
                            onClick={() => handleToggleAsset(asset.id)}
                            className={cn(
                              "relative aspect-square overflow-hidden rounded-xl border transition-all",
                              selected ? "border-primary ring-2 ring-primary" : "border-border hover:border-primary/50"
                            )}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={asset.thumbnailUrl ?? asset.fileUrl}
                              alt={asset.name}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-left">
                              <p className="text-sm font-medium text-white">{asset.name}</p>
                              <p className="text-xs text-white/70">{asset.type}</p>
                            </div>
                            {selected ? (
                              <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                                <Check className="h-4 w-4 text-primary-foreground" />
                              </div>
                            ) : null}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : null}

              {materialSource === "ai" ? (
                <div className="space-y-4 border-t border-border pt-4">
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Geração automatica</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          A IA vai criar uma imagem original usando suas cores e tipografia. Você poderá ajustar o resultado depois.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {materialSource === "template" ? (
                <div className="space-y-4 border-t border-border pt-4">
                  <div>
                    <h4 className="font-medium text-foreground">Escolha um template</h4>
                    <p className="text-xs text-muted-foreground">
                      Modelos compatíveis com o objetivo e formato selecionados
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {compatibleTemplates.length === 0 ? (
                      <div className="sm:col-span-3 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                        Nenhum template compatível encontrado para esta combinação.
                      </div>
                    ) : (
                      compatibleTemplates.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() =>
                            onGenerationInputChange((current) => ({
                              ...current,
                              selectedTemplateId: template.id,
                            }))
                          }
                          className={cn(
                            "flex flex-col gap-2 rounded-xl border p-4 text-left transition-all hover:border-primary/50",
                            generationInput.selectedTemplateId === template.id
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-border bg-background"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-foreground">{template.name}</p>
                            <Badge variant="outline" className="text-[10px]">
                              {template.format}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{template.headline}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : null}

              {materialSource ? (
                <div className="space-y-4 border-t border-border pt-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Atividade principal da campanha</Label>
                      <Select
                        value={generationInput.activityCategory}
                        onValueChange={(value) =>
                          onGenerationInputChange((current) => ({
                            ...current,
                            activityCategory: value || undefined,
                          }))
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Selecione a atividade" />
                        </SelectTrigger>
                        <SelectContent>
                          {academyActivities.map((activity) => (
                            <SelectItem key={activity.value} value={activity.value}>
                              {activity.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Essa atividade entra no contexto da IA.</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Tom do conteúdo</Label>
                      <select
                        value={generationInput.tone ?? ""}
                        onChange={(event) =>
                          onGenerationInputChange((current) => ({
                            ...current,
                            tone: event.target.value,
                          }))
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Selecione um tom</option>
                        {toneOptions.map((tone) => (
                          <option key={tone} value={tone}>
                            {tone}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>CTA principal</Label>
                      <Input
                        value={generationInput.callToAction ?? ""}
                        onChange={(event) =>
                          onGenerationInputChange((current) => ({
                            ...current,
                            callToAction: event.target.value,
                          }))
                        }
                        placeholder="Ex.: Agende sua aula experimental"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Instruções adicionais (opcional)</Label>
                    <Textarea
                      value={generationInput.promptNotes ?? ""}
                      onChange={(event) =>
                        onGenerationInputChange((current) => ({
                          ...current,
                          promptNotes: event.target.value,
                        }))
                      }
                      placeholder="Ex.: destacar a estrutura da academia, falar com pais, reforçar vagas limitadas."
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {createStep === 4 && latestGeneration?.result ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Resultado</h3>
                  <p className="text-sm text-muted-foreground">
                    Revise o conteúdo e ajuste a peça gerada.
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={onResetFlow}>
                  Criar outro
                </Button>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <Label>Imagem do conteúdo</Label>
                  <div
                    className={cn(
                      "mx-auto w-full rounded-xl border-2 border-dashed transition-all",
                      getMarketingResultAspectClass(resultFormat),
                      getMarketingResultMaxWidthClass(resultFormat),
                      hasGeneratedFinalImage ? "border-primary bg-primary/5" : "border-border bg-muted/30"
                    )}
                  >
                    {isGeneratingImage ? (
                      <div className="flex h-full flex-col items-center justify-center space-y-3 text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <div>
                          <p className="font-medium text-foreground">Gerando imagem...</p>
                          <p className="text-sm text-muted-foreground">Isso pode levar alguns segundos</p>
                        </div>
                      </div>
                    ) : hasGeneratedFinalImage ? (
                      <div className="h-full w-full p-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={latestGeneration.result.imageUrl ?? ""}
                          alt={draftTitle}
                          className="h-full w-full rounded-lg object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center space-y-3 p-6 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Imagem final indisponível</p>
                          <p className="text-sm text-muted-foreground">Tente gerar outra nova imagem.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {!hasGeneratedFinalImage ? (
                    <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>A imagem final não ficou disponível. Gere outra nova imagem para atualizar o criativo.</span>
                    </div>
                  ) : null}

                  <Button className="w-full" onClick={() => void onGenerateImage()} disabled={isGeneratingImage}>
                    {isGeneratingImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Gerar outra nova imagem
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título sugerido</Label>
                    <Input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} className="bg-background" />
                  </div>

                  <div className="space-y-2">
                    <Label>Legenda</Label>
                    <Textarea
                      value={draftCaption}
                      onChange={(event) => setDraftCaption(event.target.value)}
                      rows={4}
                      className="resize-none bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Hashtags</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {draftHashtags.map((hashtag, index) => (
                        <Badge
                          key={`${hashtag}-${index}`}
                          variant="secondary"
                          className="cursor-pointer text-xs hover:bg-primary/20"
                          onClick={() => copyToClipboard(hashtag)}
                        >
                          {hashtag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => copyToClipboard(draftCaption)}
                    >
                      <Copy className="mr-1.5 h-4 w-4" />
                      Copiar texto
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => void onGenerateContent()}
                      disabled={isGenerating}
                    >
                      <RefreshCw className={cn("mr-1.5 h-4 w-4", isGenerating && "animate-spin")} />
                      Reescrever
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!hasGeneratedFinalImage}
                  variant={hasGeneratedFinalImage ? "default" : "outline"}
                  onClick={() => void onDownloadGeneration()}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {hasGeneratedFinalImage ? "Baixar peça completa" : "Gere a imagem primeiro para baixar"}
                </Button>
              </div>
            </div>
          ) : null}

          {createStep < 4 ? (
            <>
              <div className="mt-6 hidden justify-between border-t border-border pt-6 md:flex">
                <Button variant="outline" onClick={handleBack} disabled={createStep === 1}>
                  Voltar
                </Button>
                <Button
                  onClick={() => void handleNext()}
                  disabled={!canProceed() || isGenerating}
                  className="min-w-[120px]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : createStep === 3 ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Gerar conteúdo
                    </>
                  ) : (
                    "Continuar"
                  )}
                </Button>
              </div>

              <div className="fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
                <div className="mx-auto flex w-full max-w-[1680px] items-center justify-between gap-3">
                  <Button variant="outline" onClick={handleBack} disabled={createStep === 1} className="flex-1">
                    Voltar
                  </Button>
                  <Button
                    onClick={() => void handleNext()}
                    disabled={!canProceed() || isGenerating}
                    className="flex-1"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando...
                      </>
                    ) : createStep === 3 ? (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Gerar conteúdo
                      </>
                    ) : (
                      "Continuar"
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
