import type { LucideIcon } from "lucide-react"
import {
  Calendar,
  Film,
  GraduationCap,
  Sparkles,
  Target,
  Users,
  Wand2,
} from "lucide-react"
import type {
  MarketingAssetType,
  MarketingBrandKitEntity,
  MarketingGenerationEntity,
  MarketingGenerationInput,
} from "@/apps/api/src/modules/marketing/domain/marketing"
import {
  resolveMarketingImageAspectRatio,
  resolveMarketingImageFrame,
} from "@/apps/api/src/modules/marketing/domain/marketing-format"
import type {
  MarketingTemplateCategory,
  MarketingTemplateFormat,
  MarketingTemplateView,
} from "@/apps/api/src/modules/marketing/domain/marketing-templates"

export type CreateStep = 1 | 2 | 3 | 4
export type MarketingMaterialSource = "library" | "ai" | "template"

export const assetTypeLabels: Record<MarketingAssetType, string> = {
  logo: "Logotipo",
  academy_photo: "Fotos da academia",
  space_photo: "Espaço",
  team_photo: "Equipe",
  professor_photo: "Professor",
  general_photo: "Fotos gerais",
}

export const typographyOptions = [
  "Oswald",
  "Inter",
  "Poppins",
  "Montserrat",
  "Bebas Neue",
  "DM Sans",
] as const

export const templateCategoryLabels: Record<MarketingTemplateCategory, string> = {
  enrollment: "Matrícula",
  kids: "Turma kids",
  graduation: "Graduação",
  trial: "Aula experimental",
  event: "Evento",
  transformation: "Transformação",
}

export const templateFormatLabels: Record<MarketingTemplateFormat, string> = {
  post: "Post",
  story: "Story",
  carousel: "Carrossel",
}

export const templateCategoryIcons: Record<MarketingTemplateCategory, LucideIcon> = {
  enrollment: Users,
  kids: Users,
  graduation: GraduationCap,
  trial: Sparkles,
  event: Calendar,
  transformation: Wand2,
}

export const contentObjectives: Array<{
  value: MarketingGenerationInput["objective"]
  label: string
  description: string
  icon: LucideIcon
}> = [
  { value: "attract", label: "Atrair novos alunos", description: "Campanhas de matrícula e descoberta.", icon: Users },
  { value: "training", label: "Mostrar treino", description: "Apresente rotina, intensidade e ambiente.", icon: Film },
  { value: "evolution", label: "Mostrar evolução", description: "Conquistas e progresso dos alunos.", icon: GraduationCap },
  { value: "event", label: "Promover evento", description: "Divulgue seminários, campeonatos e encontros.", icon: Calendar },
  { value: "kids", label: "Promover turma kids", description: "Atraia pais e novos alunos infantis.", icon: Sparkles },
  { value: "trial", label: "Promover aula experimental", description: "Convide novos contatos para testar a academia.", icon: Target },
]

export const contentFormats: Array<{
  value: MarketingGenerationInput["contentType"]
  label: string
  description: string
  icon: LucideIcon
}> = [
  { value: "post", label: "Post", description: "Imagem única com CTA direto.", icon: Target },
  { value: "story", label: "Story", description: "Mensagem curta e vertical.", icon: Sparkles },
  { value: "carousel", label: "Carrossel", description: "Narrativa em múltiplas telas.", icon: Users },
  { value: "reels", label: "Reels", description: "Roteiro curto para vídeo vertical.", icon: Film },
]

export const toneOptions = [
  "inspirador",
  "direto",
  "acolhedor",
  "competitivo",
] as const

const objectiveTemplateCategories: Record<
  MarketingGenerationInput["objective"],
  MarketingTemplateCategory[]
> = {
  attract: ["enrollment", "trial"],
  training: ["transformation"],
  evolution: ["graduation", "transformation"],
  event: ["event"],
  kids: ["kids"],
  trial: ["trial"],
}

export function isTemplateCompatible(
  template: MarketingTemplateView,
  input: Pick<MarketingGenerationInput, "objective" | "contentType">
) {
  const categoryMatches = objectiveTemplateCategories[input.objective].includes(template.category)
  const formatMatches = input.contentType === "reels" ? false : template.format === input.contentType
  return categoryMatches && formatMatches
}

export function getObjectiveLabel(value: MarketingGenerationInput["objective"]) {
  return contentObjectives.find((objective) => objective.value === value)?.label ?? "Conteúdo"
}

export function resolveMaterialSource(input: MarketingGenerationInput): MarketingMaterialSource {
  if (input.selectedTemplateId) {
    return "template"
  }

  if (input.uploadSource === "manual_upload") {
    return "ai"
  }

  return "library"
}

export function updateInputForMaterialSource(
  current: MarketingGenerationInput,
  source: MarketingMaterialSource,
  fallbackTemplateId?: string
): MarketingGenerationInput {
  if (source === "template") {
    return {
      ...current,
      uploadSource: "brand_kit",
      selectedTemplateId: current.selectedTemplateId ?? fallbackTemplateId,
    }
  }

  return {
    ...current,
    uploadSource: source === "ai" ? "manual_upload" : "brand_kit",
    selectedTemplateId: source === "library" || source === "ai" ? undefined : current.selectedTemplateId,
  }
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "")
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo selecionado."))
    reader.readAsDataURL(file)
  })
}

export function downloadFromUrl(href: string, fileName: string) {
  const link = document.createElement("a")
  link.href = href
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function getMarketingResultAspectClass(format: MarketingGenerationInput["contentType"]) {
  const aspectRatio = resolveMarketingImageAspectRatio(format)
  if (aspectRatio === "9:16") {
    return "aspect-[9/16]"
  }

  if (aspectRatio === "4:5") {
    return "aspect-[4/5]"
  }

  return "aspect-square"
}

export function getMarketingResultMaxWidthClass(format: MarketingGenerationInput["contentType"]) {
  const aspectRatio = resolveMarketingImageAspectRatio(format)
  if (aspectRatio === "9:16") {
    return "max-w-[22rem]"
  }

  if (aspectRatio === "4:5") {
    return "max-w-[24rem]"
  }

  return "max-w-[28rem]"
}

export async function convertSvgDataUrlToPng(svgDataUrl: string) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = image.width
      canvas.height = image.height
      const context = canvas.getContext("2d")

      if (!context) {
        reject(new Error("Não foi possível preparar o canvas para exportação."))
        return
      }

      context.drawImage(image, 0, 0)
      resolve(canvas.toDataURL("image/png"))
    }
    image.onerror = () => reject(new Error("Não foi possível renderizar o template para PNG."))
    image.src = svgDataUrl
  })
}

export function buildTemplateDownloadDataUrl(template: MarketingTemplateView) {
  const title = escapeSvgText(template.headline)
  const body = escapeSvgText(template.body)
  const cta = escapeSvgText(template.cta ?? "Saiba mais")
  const primary = template.colors[0] ?? "#111827"
  const secondary = template.colors[1] ?? "#475569"
  const logo = template.logoUrl
  const image = template.previewImageUrl
  const background = `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${primary}"/>
        <stop offset="100%" stop-color="${secondary}"/>
      </linearGradient>
    </defs>
    <rect width="1080" height="1080" rx="72" fill="url(#bg)"/>
  `
  const logoMarkup = logo
    ? `<image href="${logo}" x="884" y="76" width="120" height="120" preserveAspectRatio="xMidYMid meet" />`
    : ""
  const imageHero = image
    ? `<image href="${image}" x="0" y="0" width="1080" height="1080" preserveAspectRatio="xMidYMid slice" />`
    : `<rect x="0" y="0" width="1080" height="1080" fill="rgba(255,255,255,0.08)" />`

  const layout =
    template.designKey === "impact-hero"
      ? `
        ${background}
        <g>
          ${imageHero}
          <rect width="1080" height="1080" fill="${primary}" fill-opacity="0.46"/>
          <rect x="64" y="64" width="952" height="952" rx="40" fill="none" stroke="rgba(255,255,255,0.16)"/>
          ${logoMarkup}
          <text x="76" y="154" fill="#ffffff" font-family="Arial, sans-serif" font-size="28" letter-spacing="4">CAMPANHA DE MATRÍCULA</text>
          <text x="76" y="332" fill="#ffffff" font-family="Arial, sans-serif" font-size="96" font-weight="700">${title}</text>
          <foreignObject x="76" y="380" width="640" height="170">
            <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; color: rgba(255,255,255,0.9); font-size: 34px; line-height: 1.35;">${body}</div>
          </foreignObject>
          <rect x="76" y="880" width="360" height="96" rx="24" fill="#ffffff"/>
          <text x="118" y="942" fill="${primary}" font-family="Arial, sans-serif" font-size="38" font-weight="700">${cta}</text>
        </g>
      `
      : template.designKey === "clean-invite"
        ? `
          <rect width="1080" height="1080" rx="72" fill="#f8fafc"/>
          ${logo ? `<image href="${logo}" x="80" y="84" width="128" height="128" preserveAspectRatio="xMidYMid meet" />` : ""}
          <text x="80" y="288" fill="${primary}" font-family="Arial, sans-serif" font-size="94" font-weight="700">${title}</text>
          <foreignObject x="80" y="334" width="620" height="170">
            <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; color: ${secondary}; font-size: 34px; line-height: 1.38;">${body}</div>
          </foreignObject>
          ${image ? `<image href="${image}" x="640" y="268" width="360" height="590" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 36px)" />` : ""}
          <rect x="80" y="860" width="430" height="104" rx="28" fill="${primary}"/>
          <text x="124" y="926" fill="#ffffff" font-family="Arial, sans-serif" font-size="38" font-weight="700">${cta}</text>
        `
        : template.designKey === "kids-split"
          ? `
            ${background}
            <rect x="0" y="0" width="1080" height="1080" fill="${primary}" fill-opacity="0.12"/>
            <rect x="66" y="66" width="432" height="948" rx="44" fill="${primary}"/>
            ${image ? `<image href="${image}" x="524" y="66" width="490" height="948" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 44px)" />` : ""}
            ${logo ? `<image href="${logo}" x="94" y="94" width="110" height="110" preserveAspectRatio="xMidYMid meet" />` : ""}
            <text x="94" y="278" fill="#ffffff" font-family="Arial, sans-serif" font-size="78" font-weight="700">${title}</text>
            <foreignObject x="94" y="332" width="340" height="250">
              <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; color: rgba(255,255,255,0.88); font-size: 30px; line-height: 1.45;">${body}</div>
            </foreignObject>
            <rect x="94" y="852" width="300" height="96" rx="28" fill="#ffffff"/>
            <text x="136" y="914" fill="${primary}" font-family="Arial, sans-serif" font-size="34" font-weight="700">${cta}</text>
          `
          : template.designKey === "premium-belt"
            ? `
              ${background}
              <rect width="1080" height="1080" fill="#0f172a" fill-opacity="0.58"/>
              <circle cx="870" cy="210" r="180" fill="#ffffff" fill-opacity="0.08"/>
              ${image ? `<image href="${image}" x="524" y="118" width="430" height="844" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 40px)" />` : ""}
              ${logoMarkup}
              <text x="86" y="184" fill="#ffffff" font-family="Arial, sans-serif" font-size="28" letter-spacing="4">DESTAQUE DE GRADUAÇÃO</text>
              <text x="86" y="346" fill="#ffffff" font-family="Arial, sans-serif" font-size="86" font-weight="700">${title}</text>
              <foreignObject x="86" y="396" width="370" height="250">
                <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; color: rgba(255,255,255,0.88); font-size: 30px; line-height: 1.42;">${body}</div>
              </foreignObject>
              <rect x="86" y="850" width="320" height="96" rx="28" fill="#ffffff"/>
              <text x="128" y="912" fill="${primary}" font-family="Arial, sans-serif" font-size="34" font-weight="700">${cta}</text>
            `
            : template.designKey === "event-agenda"
              ? `
                <rect width="1080" height="1080" rx="72" fill="#ffffff"/>
                <rect x="0" y="0" width="1080" height="290" fill="${primary}"/>
                ${logo ? `<image href="${logo}" x="80" y="72" width="120" height="120" preserveAspectRatio="xMidYMid meet" />` : ""}
                <text x="80" y="234" fill="#ffffff" font-family="Arial, sans-serif" font-size="92" font-weight="700">${title}</text>
                ${image ? `<image href="${image}" x="80" y="340" width="920" height="360" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 36px)" />` : ""}
                <foreignObject x="80" y="740" width="610" height="170">
                  <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; color: ${secondary}; font-size: 30px; line-height: 1.42;">${body}</div>
                </foreignObject>
                <rect x="760" y="760" width="240" height="180" rx="28" fill="${primary}"/>
                <text x="790" y="834" fill="#ffffff" font-family="Arial, sans-serif" font-size="28">VAGAS</text>
                <text x="790" y="888" fill="#ffffff" font-family="Arial, sans-serif" font-size="46" font-weight="700">ABERTAS</text>
                <text x="790" y="932" fill="#ffffff" font-family="Arial, sans-serif" font-size="26">${cta}</text>
              `
              : `
                <rect width="1080" height="1080" rx="72" fill="#f8fafc"/>
                ${image ? `<image href="${image}" x="0" y="0" width="1080" height="540" preserveAspectRatio="xMidYMid slice" />` : ""}
                <rect x="64" y="472" width="952" height="544" rx="40" fill="#ffffff"/>
                ${logo ? `<image href="${logo}" x="84" y="498" width="104" height="104" preserveAspectRatio="xMidYMid meet" />` : ""}
                <text x="84" y="666" fill="${primary}" font-family="Arial, sans-serif" font-size="82" font-weight="700">${title}</text>
                <foreignObject x="84" y="708" width="720" height="170">
                  <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; color: ${secondary}; font-size: 30px; line-height: 1.42;">${body}</div>
                </foreignObject>
                <rect x="84" y="900" width="320" height="94" rx="28" fill="${primary}"/>
                <text x="124" y="960" fill="#ffffff" font-family="Arial, sans-serif" font-size="34" font-weight="700">${cta}</text>
              `

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">${layout}</svg>`.trim()
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function buildGenerationDownloadDataUrl(
  generation: MarketingGenerationEntity,
  input?: {
    brandKit: MarketingBrandKitEntity | null
    template: MarketingTemplateView | null
  }
) {
  const format =
    generation.result?.suggestedFormat === "story" ||
    generation.result?.suggestedFormat === "carousel" ||
    generation.result?.suggestedFormat === "reels" ||
    generation.result?.suggestedFormat === "post"
      ? generation.result.suggestedFormat
      : generation.input.contentType
  const frame = resolveMarketingImageFrame(format)
  const primary = input?.brandKit?.config.colors.primary ?? input?.template?.colors[0] ?? "#111827"
  const secondary = input?.brandKit?.config.colors.secondary ?? input?.template?.colors[1] ?? "#475569"
  const accent = input?.brandKit?.config.colors.accent ?? "#dc2626"
  const logo = input?.template?.logoUrl ?? null
  const aiImage = generation.result?.imageUrl ?? null
  const title = escapeSvgText(generation.result?.headline ?? "Conteúdo de marketing")
  const caption = escapeSvgText(generation.result?.caption ?? "")
  const cta = escapeSvgText(generation.result?.callToAction ?? "Saiba mais")
  const template = input?.template
  const imageHero = aiImage
    ? `<image href="${aiImage}" x="0" y="0" width="1080" height="1080" preserveAspectRatio="xMidYMid slice" />`
    : `<rect x="0" y="0" width="1080" height="1080" fill="rgba(255,255,255,0.08)" />`
  const logoMarkup = logo
    ? `<image href="${logo}" x="884" y="76" width="120" height="120" preserveAspectRatio="xMidYMid meet" />`
    : ""
  const background = `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${primary}"/>
        <stop offset="100%" stop-color="${secondary}"/>
      </linearGradient>
    </defs>
    <rect width="${frame.width}" height="${frame.height}" rx="${frame.radius}" fill="url(#bg)"/>
  `

  if (format === "story" || format === "reels") {
    const storySvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${frame.width}" height="${frame.height}" viewBox="0 0 ${frame.width} ${frame.height}">
        ${background}
        ${aiImage ? `<image href="${aiImage}" x="0" y="0" width="${frame.width}" height="${frame.height}" preserveAspectRatio="xMidYMid slice" />` : ""}
        <rect width="${frame.width}" height="${frame.height}" fill="${primary}" fill-opacity="0.42"/>
        ${logo ? `<image href="${logo}" x="80" y="82" width="120" height="120" preserveAspectRatio="xMidYMid meet" />` : ""}
        <rect x="56" y="1220" width="968" height="620" rx="44" fill="#0f172a" fill-opacity="0.6" />
        <text x="88" y="1360" fill="#ffffff" font-family="Arial, sans-serif" font-size="86" font-weight="700">${title}</text>
        <foreignObject x="88" y="1408" width="848" height="220">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; color: rgba(255,255,255,0.92); font-size: 34px; line-height: 1.38;">${caption}</div>
        </foreignObject>
        <rect x="88" y="1708" width="420" height="96" rx="28" fill="#ffffff"/>
        <text x="130" y="1770" fill="${primary}" font-family="Arial, sans-serif" font-size="38" font-weight="700">${cta}</text>
      </svg>
    `.trim()

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(storySvg)}`
  }

  if (format === "carousel") {
    const carouselSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${frame.width}" height="${frame.height}" viewBox="0 0 ${frame.width} ${frame.height}">
        ${background}
        ${aiImage ? `<image href="${aiImage}" x="0" y="0" width="${frame.width}" height="620" preserveAspectRatio="xMidYMid slice" />` : ""}
        <rect x="54" y="540" width="972" height="756" rx="44" fill="#ffffff"/>
        ${logo ? `<image href="${logo}" x="84" y="574" width="104" height="104" preserveAspectRatio="xMidYMid meet" />` : ""}
        <text x="84" y="760" fill="${primary}" font-family="Arial, sans-serif" font-size="78" font-weight="700">${title}</text>
        <foreignObject x="84" y="808" width="760" height="260">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; color: ${secondary}; font-size: 30px; line-height: 1.42;">${caption}</div>
        </foreignObject>
        <rect x="84" y="1168" width="340" height="96" rx="28" fill="${primary}"/>
        <text x="126" y="1230" fill="#ffffff" font-family="Arial, sans-serif" font-size="34" font-weight="700">${cta}</text>
      </svg>
    `.trim()

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(carouselSvg)}`
  }

  const layout =
    template?.designKey === "impact-hero"
      ? `
        ${background}
        ${imageHero}
        <rect width="1080" height="1080" fill="${primary}" fill-opacity="0.42"/>
        ${logoMarkup}
        <text x="76" y="154" fill="#ffffff" font-family="Arial, sans-serif" font-size="28" letter-spacing="4">CAMPANHA</text>
        <text x="76" y="320" fill="#ffffff" font-family="Arial, sans-serif" font-size="94" font-weight="700">${title}</text>
        <foreignObject x="76" y="366" width="650" height="170">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; color: rgba(255,255,255,0.9); font-size: 34px; line-height: 1.35;">${caption}</div>
        </foreignObject>
        <rect x="76" y="886" width="360" height="96" rx="26" fill="#ffffff"/>
        <text x="118" y="948" fill="${primary}" font-family="Arial, sans-serif" font-size="38" font-weight="700">${cta}</text>
      `
      : template?.designKey === "clean-invite"
        ? `
          <rect width="1080" height="1080" rx="72" fill="#f8fafc"/>
          ${logo ? `<image href="${logo}" x="80" y="84" width="128" height="128" preserveAspectRatio="xMidYMid meet" />` : ""}
          <text x="80" y="274" fill="${primary}" font-family="Arial, sans-serif" font-size="92" font-weight="700">${title}</text>
          <foreignObject x="80" y="320" width="570" height="210">
            <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; color: ${secondary}; font-size: 32px; line-height: 1.42;">${caption}</div>
          </foreignObject>
          ${aiImage ? `<image href="${aiImage}" x="630" y="248" width="370" height="620" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 36px)" />` : ""}
          <rect x="80" y="876" width="430" height="104" rx="28" fill="${primary}"/>
          <text x="124" y="942" fill="#ffffff" font-family="Arial, sans-serif" font-size="38" font-weight="700">${cta}</text>
        `
        : template?.designKey === "kids-split"
          ? `
            ${background}
            <rect x="0" y="0" width="1080" height="1080" fill="${accent}" fill-opacity="0.18"/>
            <rect x="66" y="66" width="432" height="948" rx="44" fill="${primary}"/>
            ${aiImage ? `<image href="${aiImage}" x="524" y="66" width="490" height="948" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 44px)" />` : ""}
            ${logo ? `<image href="${logo}" x="94" y="94" width="110" height="110" preserveAspectRatio="xMidYMid meet" />` : ""}
            <text x="94" y="268" fill="#ffffff" font-family="Arial, sans-serif" font-size="76" font-weight="700">${title}</text>
            <foreignObject x="94" y="316" width="340" height="300">
              <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; color: rgba(255,255,255,0.88); font-size: 30px; line-height: 1.45;">${caption}</div>
            </foreignObject>
            <rect x="94" y="864" width="300" height="96" rx="28" fill="#ffffff"/>
            <text x="136" y="926" fill="${primary}" font-family="Arial, sans-serif" font-size="34" font-weight="700">${cta}</text>
          `
          : template?.designKey === "premium-belt"
            ? `
              ${background}
              ${imageHero}
              <rect width="1080" height="1080" fill="#0f172a" fill-opacity="0.54"/>
              ${logoMarkup}
              <text x="86" y="184" fill="#ffffff" font-family="Arial, sans-serif" font-size="28" letter-spacing="4">CONQUISTA</text>
              <text x="86" y="334" fill="#ffffff" font-family="Arial, sans-serif" font-size="84" font-weight="700">${title}</text>
              <foreignObject x="86" y="382" width="390" height="260">
                <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; color: rgba(255,255,255,0.88); font-size: 30px; line-height: 1.42;">${caption}</div>
              </foreignObject>
              <rect x="86" y="862" width="320" height="96" rx="28" fill="#ffffff"/>
              <text x="128" y="924" fill="${primary}" font-family="Arial, sans-serif" font-size="34" font-weight="700">${cta}</text>
            `
            : template?.designKey === "event-agenda"
              ? `
                <rect width="1080" height="1080" rx="72" fill="#ffffff"/>
                <rect x="0" y="0" width="1080" height="290" fill="${primary}"/>
                ${logo ? `<image href="${logo}" x="80" y="72" width="120" height="120" preserveAspectRatio="xMidYMid meet" />` : ""}
                <text x="80" y="234" fill="#ffffff" font-family="Arial, sans-serif" font-size="90" font-weight="700">${title}</text>
                ${aiImage ? `<image href="${aiImage}" x="80" y="340" width="920" height="360" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 36px)" />` : ""}
                <foreignObject x="80" y="742" width="610" height="170">
                  <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; color: ${secondary}; font-size: 30px; line-height: 1.42;">${caption}</div>
                </foreignObject>
                <rect x="760" y="760" width="240" height="180" rx="28" fill="${primary}"/>
                <text x="790" y="834" fill="#ffffff" font-family="Arial, sans-serif" font-size="28">AGENDA</text>
                <text x="790" y="888" fill="#ffffff" font-family="Arial, sans-serif" font-size="46" font-weight="700">${cta}</text>
              `
              : `
                <rect width="1080" height="1080" rx="72" fill="#f8fafc"/>
                ${aiImage ? `<image href="${aiImage}" x="0" y="0" width="1080" height="540" preserveAspectRatio="xMidYMid slice" />` : ""}
                <rect x="64" y="472" width="952" height="544" rx="40" fill="#ffffff"/>
                ${logo ? `<image href="${logo}" x="84" y="498" width="104" height="104" preserveAspectRatio="xMidYMid meet" />` : ""}
                <text x="84" y="650" fill="${primary}" font-family="Arial, sans-serif" font-size="80" font-weight="700">${title}</text>
                <foreignObject x="84" y="696" width="720" height="190">
                  <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; color: ${secondary}; font-size: 30px; line-height: 1.42;">${caption}</div>
                </foreignObject>
                <rect x="84" y="908" width="320" height="94" rx="28" fill="${primary}"/>
                <text x="124" y="968" fill="#ffffff" font-family="Arial, sans-serif" font-size="34" font-weight="700">${cta}</text>
              `

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${frame.width}" height="${frame.height}" viewBox="0 0 ${frame.width} ${frame.height}">${layout}</svg>`.trim()
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}
