"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { LayoutTemplate, Loader2, Megaphone, Palette, PlusCircle } from "lucide-react"
import type {
  MarketingAcademyActivity,
  MarketingAssetEntity,
  MarketingAssetType,
  MarketingBrandKitEntity,
  MarketingGenerationEntity,
  MarketingGenerationInput,
} from "@/apps/api/src/modules/marketing/domain/marketing"
import type { MarketingTemplateView } from "@/apps/api/src/modules/marketing/domain/marketing-templates"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { BrandIdentityTab } from "@/modules/marketing/components/brand-identity-tab"
import { CreateContentTab } from "@/modules/marketing/components/create-content-tab"
import { TemplatesTab } from "@/modules/marketing/components/templates-tab"
import {
  buildGenerationDownloadDataUrl,
  buildTemplateDownloadDataUrl,
  convertSvgDataUrlToPng,
  downloadFromUrl,
  isTemplateCompatible,
  readFileAsDataUrl,
  slugify,
  type CreateStep,
} from "@/modules/marketing/lib/marketing-dashboard"
import {
  fetchMarketingBrandKit,
  fetchMarketingAcademyActivities,
  fetchMarketingHistory,
  fetchMarketingTemplates,
  generateMarketingContent,
  generateMarketingImage,
  saveMarketingBrandKit,
} from "@/modules/marketing/services"

type MarketingTab = "identity" | "create" | "templates"

const initialGenerationInput: MarketingGenerationInput = {
  objective: "attract",
  contentType: "post",
  selectedAssetIds: [],
  uploadSource: "brand_kit",
  activityCategory: undefined,
  selectedTemplateId: undefined,
  promptNotes: "",
  tone: "",
  callToAction: "",
}

const tabDescriptions: Record<MarketingTab, string> = {
  identity: "Configure cores, tipografia e materiais visuais da sua academia.",
  create: "Crie posts, stories e carrosséis usando sua identidade visual.",
  templates: "Escolha modelos prontos para acelerar a criação de conteúdo.",
}

function resolveTab(value: string | null): MarketingTab {
  if (value === "create" || value === "templates") {
    return value
  }

  return "identity"
}

function readSelectedLogoProcessingLabel(brandKit: MarketingBrandKitEntity) {
  const logoAsset =
    brandKit.config.selectedLogoAssetId != null
      ? brandKit.config.assets.find((asset) => asset.id === brandKit.config.selectedLogoAssetId) ?? null
      : null

  const metadata = logoAsset?.metadata
  if (!metadata || typeof metadata !== "object" || !("logoEnhancement" in metadata)) {
    return null
  }

  const value = metadata.logoEnhancement
  if (!value || typeof value !== "object" || !("status" in value)) {
    return null
  }

  if (value.status === "succeeded") {
    return "O logo foi tratado pela IA e salvo pronto para reutilizar nos criativos."
  }

  if (value.status === "skipped_vector") {
    return "O logo vetorial foi preservado como arquivo oficial da marca."
  }

  if (value.status === "failed") {
    return "A identidade foi salva, mas o tratamento automático do logo não pôde ser concluído."
  }

  return null
}

export function MarketingDashboardScreen() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<MarketingTab>(() => resolveTab(searchParams.get("tab")))
  const [brandKit, setBrandKit] = useState<MarketingBrandKitEntity | null>(null)
  const [academyActivities, setAcademyActivities] = useState<MarketingAcademyActivity[]>([])
  const [templates, setTemplates] = useState<MarketingTemplateView[]>([])
  const [history, setHistory] = useState<MarketingGenerationEntity[]>([])
  const [latestGeneration, setLatestGeneration] = useState<MarketingGenerationEntity | null>(null)
  const [generationInput, setGenerationInput] = useState<MarketingGenerationInput>(initialGenerationInput)
  const [createStep, setCreateStep] = useState<CreateStep>(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const logoInputRef = useRef<HTMLInputElement | null>(null)
  const galleryInputRef = useRef<HTMLInputElement | null>(null)
  const brandKitChangeVersionRef = useRef(0)

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === generationInput.selectedTemplateId) ?? null,
    [templates, generationInput.selectedTemplateId]
  )
  const latestGenerationTemplate = useMemo(
    () =>
      latestGeneration?.input.selectedTemplateId
        ? templates.find((template) => template.id === latestGeneration.input.selectedTemplateId) ?? null
        : null,
    [latestGeneration, templates]
  )

  useEffect(() => {
    setActiveTab(resolveTab(searchParams.get("tab")))
  }, [searchParams])

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const [brandKitResponse, templatesResponse, historyResponse, academyActivitiesResponse] = await Promise.all([
          fetchMarketingBrandKit(),
          fetchMarketingTemplates(),
          fetchMarketingHistory(),
          fetchMarketingAcademyActivities(),
        ])

        if (!active) {
          return
        }

        setBrandKit(brandKitResponse)
        setTemplates(templatesResponse)
        setHistory(historyResponse)
        setAcademyActivities(academyActivitiesResponse)
        setLatestGeneration(historyResponse[0] ?? null)
        setHasUnsavedChanges(false)
      } catch (error) {
        if (!active) {
          return
        }

        toast({
          variant: "destructive",
          title: "Não foi possível carregar o marketing",
          description: error instanceof Error ? error.message : "Tente novamente em instantes.",
        })
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (
      generationInput.activityCategory &&
      academyActivities.some((activity) => activity.value === generationInput.activityCategory)
    ) {
      return
    }

    if (!generationInput.activityCategory) {
      return
    }

    setGenerationInput((current) => ({
      ...current,
      activityCategory: undefined,
    }))
  }, [academyActivities, generationInput.activityCategory])

  useEffect(() => {
    if (!generationInput.selectedTemplateId) {
      return
    }

    if (!selectedTemplate) {
      return
    }

    if (isTemplateCompatible(selectedTemplate, generationInput)) {
      return
    }

    setGenerationInput((current) => ({
      ...current,
      selectedTemplateId: undefined,
    }))

    toast({
      title: "Template removido da seleção",
      description: "O modelo anterior não combina mais com o objetivo ou formato escolhidos.",
    })
  }, [generationInput, selectedTemplate])

  useEffect(() => {
    if (activeTab !== "identity" || !brandKit || !hasUnsavedChanges || isLoading || isSaving) {
      return
    }

    const targetVersion = brandKitChangeVersionRef.current
    const timeoutId = window.setTimeout(() => {
      void handleSaveIdentity(targetVersion)
    }, 700)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [activeTab, brandKit, hasUnsavedChanges, isLoading, isSaving])

  function handleTabChange(nextTab: string) {
    const resolvedTab = resolveTab(nextTab)
    setActiveTab(resolvedTab)

    const params = new URLSearchParams(searchParams.toString())
    if (resolvedTab === "identity") {
      params.delete("tab")
    } else {
      params.set("tab", resolvedTab)
    }

    const nextUrl = params.size > 0 ? `${pathname}?${params.toString()}` : pathname
    router.replace(nextUrl, { scroll: false })
  }

  function markDirty() {
    brandKitChangeVersionRef.current += 1
    setHasUnsavedChanges(true)
  }

  function updateConfig(
    updater: (current: MarketingBrandKitEntity["config"]) => MarketingBrandKitEntity["config"]
  ) {
    setBrandKit((current) => (current ? { ...current, config: updater(current.config) } : current))
    markDirty()
  }

  function updateAsset(assetId: string, updater: (asset: MarketingAssetEntity) => MarketingAssetEntity) {
    updateConfig((current) => ({
      ...current,
      assets: current.assets.map((asset) => (asset.id === assetId ? updater(asset) : asset)),
    }))
  }

  function removeAsset(assetId: string) {
    updateConfig((current) => ({
      ...current,
      selectedLogoAssetId: current.selectedLogoAssetId === assetId ? undefined : current.selectedLogoAssetId,
      assets: current.assets.filter((asset) => asset.id !== assetId),
    }))
  }

  async function handleFilesSelected(files: FileList | null, type: MarketingAssetType) {
    if (!files || files.length === 0) {
      return
    }

    const nextAssets = await Promise.all(
      Array.from(files).map(async (file) => {
        const dataUrl = await readFileAsDataUrl(file)
        const now = new Date().toISOString()

        return {
          id: crypto.randomUUID(),
          tenantId: brandKit?.tenantId ?? "",
          type,
          source: "brand_kit" as const,
          name: file.name,
          fileUrl: dataUrl,
          thumbnailUrl: dataUrl,
          mimeType: file.type || null,
          metadata: { size: file.size },
          createdAt: now,
          updatedAt: now,
        } satisfies MarketingAssetEntity
      })
    )

    updateConfig((current) => ({
      ...current,
      selectedLogoAssetId:
        type === "logo" ? nextAssets[0]?.id ?? current.selectedLogoAssetId : current.selectedLogoAssetId,
      assets: [...nextAssets, ...current.assets],
    }))

    toast({
      title: "Arquivos adicionados",
      description:
        type === "logo" ? "O logotipo foi carregado." : "Os materiais visuais foram adicionados ao kit.",
    })
  }

  async function handleSaveIdentity(targetVersion = brandKitChangeVersionRef.current) {
    if (!brandKit) {
      return
    }

    const snapshotConfig = brandKit.config
    setIsSaving(true)

    try {
      const response = await saveMarketingBrandKit(snapshotConfig)
      if (brandKitChangeVersionRef.current === targetVersion) {
        setBrandKit(response.brandKit)
        setTemplates(await fetchMarketingTemplates())
        setHasUnsavedChanges(false)
        const logoProcessingLabel = readSelectedLogoProcessingLabel(response.brandKit)
        toast({
          title: "Alteração salva com sucesso",
          description: logoProcessingLabel ?? "A identidade visual da academia foi atualizada.",
        })
      }
    } catch (error) {
      if (brandKitChangeVersionRef.current === targetVersion) {
        toast({
          variant: "destructive",
          title: "Não foi possível salvar",
          description: error instanceof Error ? error.message : "Tente novamente em instantes.",
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  function updateGenerationInput(
    updater: (current: MarketingGenerationInput) => MarketingGenerationInput
  ) {
    setGenerationInput((current) => updater(current))
  }

  function upsertGeneration(generation: MarketingGenerationEntity) {
    setLatestGeneration(generation)
    setHistory((current) => [generation, ...current.filter((item) => item.id !== generation.id)])
  }

  async function handleGenerateContent() {
    setIsGenerating(true)

    try {
      const response = await generateMarketingContent(generationInput)
      upsertGeneration(response.generation)
      toast({
        title: "Conteúdo reescrito com sucesso",
        description: "O texto do criativo foi atualizado.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Não foi possível criar o conteúdo",
        description: error instanceof Error ? error.message : "Tente novamente em instantes.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleGenerateContentFlow() {
    setIsGenerating(true)
    setIsGeneratingImage(true)

    try {
      const contentResponse = await generateMarketingContent(generationInput)
      upsertGeneration(contentResponse.generation)

      const imageResponse = await generateMarketingImage(contentResponse.generation.id)
      upsertGeneration(imageResponse.generation)

      setCreateStep(4)
      setActiveTab("create")
      toast({
        title: "Conteúdo gerado com sucesso",
        description: "O texto e a imagem final do criativo já ficaram prontos para revisão.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Não foi possível gerar o criativo",
        description: error instanceof Error ? error.message : "Tente novamente em instantes.",
      })
    } finally {
      setIsGenerating(false)
      setIsGeneratingImage(false)
    }
  }

  async function handleGenerateImage() {
    if (!latestGeneration) {
      return
    }

    setIsGeneratingImage(true)

    try {
      const response = await generateMarketingImage(latestGeneration.id)
      upsertGeneration(response.generation)
      toast({
        title: "Imagem gerada com sucesso",
        description: "A peça visual foi salva junto com o conteúdo no histórico.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Não foi possível gerar a imagem",
        description: error instanceof Error ? error.message : "Tente novamente em instantes.",
      })
    } finally {
      setIsGeneratingImage(false)
    }
  }

  function handleResetCreateFlow() {
    setGenerationInput(initialGenerationInput)
    setCreateStep(1)
  }

  function handleUseTemplate(template: MarketingTemplateView) {
    setGenerationInput((current) => ({
      ...current,
      selectedTemplateId: template.id,
      contentType:
        template.format === "story"
          ? "story"
          : template.format === "carousel"
            ? "carousel"
            : "post",
      objective:
        template.category === "trial"
          ? "trial"
          : template.category === "kids"
            ? "kids"
            : template.category === "event"
              ? "event"
              : template.category === "graduation" || template.category === "transformation"
                ? "evolution"
                : "attract",
      callToAction: template.cta ?? current.callToAction,
      uploadSource: "brand_kit",
    }))
    setCreateStep(3)
    handleTabChange("create")
    toast({
      title: "Template selecionado",
      description: `O modelo ${template.name} foi aplicado com objetivo e formato compatíveis.`,
    })
  }

  async function handleDownloadTemplate(template: MarketingTemplateView) {
    const href = await convertSvgDataUrlToPng(buildTemplateDownloadDataUrl(template))
    downloadFromUrl(href, `${slugify(template.name)}.png`)
    toast({
      title: "Template exportado",
      description: `O modelo ${template.name} foi baixado em PNG com a identidade da academia.`,
    })
  }

  async function handleDownloadGeneration() {
    if (!latestGeneration?.result) {
      return
    }

    if (latestGeneration.result.imageUrl) {
      const extension = latestGeneration.result.imageUrl.startsWith("data:image/svg+xml")
        ? "svg"
        : latestGeneration.result.imageUrl.startsWith("data:image/webp")
          ? "webp"
          : latestGeneration.result.imageUrl.startsWith("data:image/jpeg")
            ? "jpg"
            : "png"

      downloadFromUrl(
        latestGeneration.result.imageUrl,
        `${slugify(latestGeneration.result.headline || "peca-marketing")}.${extension}`
      )
      toast({
        title: "Arte baixada",
        description: "A peça gerada foi exportada para o seu computador.",
      })
      return
    }

    const preview = buildGenerationDownloadDataUrl(latestGeneration, {
      brandKit,
      template: latestGenerationTemplate,
    })
    const fallback = await convertSvgDataUrlToPng(preview)
    downloadFromUrl(fallback, `${slugify(latestGeneration.result.headline || "peca-marketing")}.png`)
    toast({
      title: "Arte exportada",
      description: "A versão estrutural da peça foi baixada em PNG.",
    })
  }

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Megaphone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Marketing</h1>
            <p className="text-sm text-muted-foreground">{tabDescriptions[activeTab]}</p>
          </div>
        </div>

        {activeTab === "identity" && isSaving ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Salvando alterações...</span>
          </div>
        ) : null}
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-5">
        <TabsList className="inline-flex h-auto bg-muted/50 p-1">
          <TabsTrigger
            value="identity"
            className="gap-2 px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Identidade Visual</span>
            <span className="sm:hidden">Identidade</span>
          </TabsTrigger>
          <TabsTrigger
            value="create"
            className="gap-2 px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Criar Conteúdo</span>
            <span className="sm:hidden">Criar</span>
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="gap-2 px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <LayoutTemplate className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="identity" className="mt-0">
          <BrandIdentityTab
            brandKit={brandKit}
            isLoading={isLoading}
            logoInputRef={logoInputRef}
            galleryInputRef={galleryInputRef}
            onConfigChange={updateConfig}
            onUpdateAsset={updateAsset}
            onRemoveAsset={removeAsset}
            onFilesSelected={handleFilesSelected}
          />
        </TabsContent>

        <TabsContent value="create" className="mt-0">
        <CreateContentTab
          brandKit={brandKit}
          templates={templates}
          latestGeneration={latestGeneration}
          generationInput={generationInput}
          createStep={createStep}
          academyActivities={academyActivities}
          isGenerating={isGenerating}
          isGeneratingImage={isGeneratingImage}
            onCreateStepChange={setCreateStep}
            onGenerationInputChange={updateGenerationInput}
            onGenerateContent={handleGenerateContent}
            onGenerateContentFlow={handleGenerateContentFlow}
            onGenerateImage={handleGenerateImage}
            onDownloadGeneration={handleDownloadGeneration}
            onResetFlow={handleResetCreateFlow}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-0">
          <TemplatesTab
            templates={templates}
            isLoading={isLoading}
            onUseTemplate={handleUseTemplate}
            onDownloadTemplate={handleDownloadTemplate}
          />
        </TabsContent>
      </Tabs>

      {!brandKit && !isLoading ? (
        <Card className="border-border bg-card">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Não foi possível carregar a identidade visual da academia. Recarregue a página e tente novamente.
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
