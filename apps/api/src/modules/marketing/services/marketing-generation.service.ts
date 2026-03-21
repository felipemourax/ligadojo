import type {
  MarketingAcademyActivity,
  MarketingGenerationEntity,
  MarketingGenerationInput,
  MarketingGenerationResult,
} from "@/apps/api/src/modules/marketing/domain/marketing"
import type { MarketingImageReference } from "@/apps/api/src/modules/marketing/domain/marketing-ai"
import {
  resolveMarketingImageAspectRatio,
  resolveMarketingImageFrame,
} from "@/apps/api/src/modules/marketing/domain/marketing-format"
import { normalizeGenerationInput } from "@/apps/api/src/modules/marketing/domain/marketing-generation-mappers"
import { marketingTemplateCatalog } from "@/apps/api/src/modules/marketing/domain/marketing-templates"
import { formatActivityCategory } from "@/apps/api/src/modules/modalities/domain/modality"
import { MarketingAiOrchestratorService } from "@/apps/api/src/modules/marketing/services/marketing-ai-orchestrator.service"
import { MarketingBrandKitRepository } from "@/apps/api/src/modules/marketing/repositories/marketing-brand-kit.repository"
import { MarketingGenerationRepository } from "@/apps/api/src/modules/marketing/repositories/marketing-generation.repository"

const objectiveCopy: Record<
  MarketingGenerationInput["objective"],
  {
    headline: string
    caption: string
    hashtags: string[]
    defaultCta: string
  }
> = {
  attract: {
    headline: "Matriculas abertas para novos alunos",
    caption:
      "Conheca a metodologia da academia e venha treinar com acompanhamento de verdade.",
    hashtags: ["#academia", "#artesmarciais", "#novosalunos", "#treino", "#disciplina"],
    defaultCta: "Agende sua primeira visita",
  },
  training: {
    headline: "Treino forte, ambiente certo",
    caption: "Mostre a intensidade e a consistencia dos treinos para atrair mais interesse.",
    hashtags: ["#treino", "#tatame", "#rotina", "#jiujitsu", "#evolucao"],
    defaultCta: "Venha treinar com a gente",
  },
  evolution: {
    headline: "A evolucao acontece um treino por vez",
    caption: "Use a jornada dos alunos como prova social e inspiracao para a comunidade.",
    hashtags: ["#evolucao", "#conquista", "#dedicacao", "#faixa", "#resultado"],
    defaultCta: "Conheca nossa metodologia",
  },
  event: {
    headline: "Reserve a data do proximo evento",
    caption: "Crie urgencia e engajamento para seminarios, campeonatos e encontros especiais.",
    hashtags: ["#evento", "#seminario", "#campeonato", "#academia", "#agenda"],
    defaultCta: "Garanta sua participacao",
  },
  kids: {
    headline: "Formacao, disciplina e confianca para os pequenos",
    caption: "Apresente a turma kids com foco em desenvolvimento, valores e ambiente seguro.",
    hashtags: ["#kids", "#jiujitsukids", "#disciplina", "#confianca", "#familia"],
    defaultCta: "Agende uma aula kids",
  },
  trial: {
    headline: "Sua aula experimental pode ser hoje",
    caption: "Convide novos contatos para conhecer a estrutura e viver a experiencia da academia.",
    hashtags: ["#aulaexperimental", "#primeiraaula", "#academia", "#comecehoje", "#treino"],
    defaultCta: "Quero agendar",
  },
}

const objectiveVisualDirection: Record<MarketingGenerationInput["objective"], string> = {
  attract:
    "peça de captação de novos alunos, moderna, direta, acolhedora e comercial, sem clima de campeonato ou convite para evento",
  training:
    "peça de treino, intensidade, rotina, energia esportiva e disciplina, sem linguagem de evento",
  evolution:
    "peça de evolução e conquista, com orgulho, disciplina, respeito e prova de progresso",
  event:
    "peça promocional de evento, com clima de agenda, presença, destaque para convidado e senso de data",
  kids:
    "peça kids leve, segura, familiar e positiva, com clima de confiança para pais e responsáveis",
  trial:
    "peça de aula experimental, clara, acolhedora, com convite objetivo e sensação de acesso fácil",
}

const objectiveTemplateCategories: Record<MarketingGenerationInput["objective"], string[]> = {
  attract: ["enrollment", "trial"],
  training: ["transformation"],
  evolution: ["graduation", "transformation"],
  event: ["event"],
  kids: ["kids"],
  trial: ["trial"],
}

export class MarketingGenerationService {
  constructor(
    private readonly brandKitRepository = new MarketingBrandKitRepository(),
    private readonly generationRepository = new MarketingGenerationRepository(),
    private readonly aiOrchestrator = new MarketingAiOrchestratorService()
  ) {}

  async listForTenant(tenantId: string) {
    return this.generationRepository.listByTenantId(tenantId)
  }

  async generate(input: { tenantId: string; generationInput: unknown }) {
    const generationInput = normalizeGenerationInput(input.generationInput)
    const brandKit = await this.brandKitRepository.ensureForTenant(input.tenantId)
    const activity = this.resolveActivity(generationInput.activityCategory)
    const selectedLogoAsset =
      brandKit.config.selectedLogoAssetId != null
        ? brandKit.config.assets.find((asset) => asset.id === brandKit.config.selectedLogoAssetId) ?? null
        : null

    const template = generationInput.selectedTemplateId
      ? marketingTemplateCatalog.find((item) => item.id === generationInput.selectedTemplateId) ?? null
      : null

    const result = await this.buildResult({
      generationInput,
      brandName: "academia",
      brandKitColors: brandKit.config.colors,
      brandNotes: brandKit.config.notes ?? "",
      selectedLogoAssetName: selectedLogoAsset?.name ?? null,
      template,
      activity,
      tenantId: input.tenantId,
    })

    return this.generationRepository.create({
      tenantId: input.tenantId,
      brandKitId: brandKit.id,
      templateId: template?.id ?? null,
      generationInput,
      generationResult: result,
    })
  }

  async generateImage(input: { tenantId: string; generationId: string }) {
    const generation = await this.generationRepository.findById({
      tenantId: input.tenantId,
      generationId: input.generationId,
    })

    if (!generation || !generation.result) {
      throw new Error("Conteudo nao encontrado para gerar imagem.")
    }

    const brandKit = await this.brandKitRepository.ensureForTenant(input.tenantId)
    const selectedAssets = brandKit.config.assets.filter((asset) =>
      generation.input.selectedAssetIds.includes(asset.id)
    )
    const selectedLogoAsset =
      brandKit.config.selectedLogoAssetId != null
        ? brandKit.config.assets.find((asset) => asset.id === brandKit.config.selectedLogoAssetId) ?? null
        : null
    const imageAssets =
      selectedLogoAsset && !selectedAssets.some((asset) => asset.id === selectedLogoAsset.id)
        ? [selectedLogoAsset, ...selectedAssets]
        : selectedAssets

    try {
      const references = imageAssets
        .slice(0, 4)
        .map((asset): MarketingImageReference => ({
          name: asset.name,
          mimeType: asset.mimeType,
          imageUrl: asset.fileUrl,
          role: asset.type === "logo" ? "logo" : "photo",
        }))

      const response = await this.aiOrchestrator.generateImage({
        tenantId: input.tenantId,
        request: {
          prompt: this.buildImagePrompt({
            generation,
            brandKitColors: brandKit.config.colors,
            brandNotes: brandKit.config.notes ?? "",
            selectedAssets: imageAssets,
          }),
          aspectRatio: resolveMarketingImageAspectRatio(generation.input.contentType),
          references,
        },
      })

      return this.generationRepository.attachGeneratedImage({
        tenantId: input.tenantId,
        generationId: generation.id,
        brandKitId: generation.brandKitId,
        imageUrl: response.imageUrl,
        provider: `${response.provider}:${response.model}`,
      })
    } catch {
      return this.generationRepository.attachGeneratedImage({
        tenantId: input.tenantId,
        generationId: generation.id,
        brandKitId: generation.brandKitId,
        imageUrl: this.buildFallbackImage({
          generation,
          brandKitColors: brandKit.config.colors,
          selectedLogoAssetUrl: selectedLogoAsset?.fileUrl ?? null,
        }),
        provider: "internal-deterministic-image",
      })
    }
  }

  private async buildResult(input: {
    generationInput: MarketingGenerationInput
    brandName: string
    brandKitColors: { primary?: string; secondary?: string; accent?: string }
    brandNotes: string
    selectedLogoAssetName: string | null
    template: {
      id: string
      name: string
      category: string
      format: string
      headline: string
      body: string
      cta?: string
    } | null
    activity: MarketingAcademyActivity | null
    tenantId: string
  }): Promise<MarketingGenerationResult> {
    const base = this.resolveObjectiveCopy({
      objective: input.generationInput.objective,
      activity: input.activity,
    })
    const templateMatchesObjective = input.template
      ? objectiveTemplateCategories[input.generationInput.objective].includes(input.template.category)
      : false
    const templateHeadline = templateMatchesObjective ? input.template?.headline : null
    const templateBody = templateMatchesObjective ? input.template?.body : null
    const cta = input.generationInput.callToAction || (templateMatchesObjective ? input.template?.cta : null) || base.defaultCta
    const fallbackResult = {
      headline: templateHeadline ?? base.headline,
      caption: `${input.generationInput.tone ? `Tom ${input.generationInput.tone}. ` : ""}${templateBody ?? base.caption}\n\n${cta}.${input.generationInput.promptNotes ? ` Detalhes adicionais: ${input.generationInput.promptNotes.trim()}.` : ""}`.trim(),
      hashtags: base.hashtags,
      callToAction: cta,
      suggestedFormat: input.generationInput.contentType,
    }

    try {
      const response = await this.aiOrchestrator.generateText({
        tenantId: input.tenantId,
        request: {
          systemInstruction:
            "Voce e um assistente de marketing para academias. Responda apenas JSON valido com headline, caption, hashtags e callToAction. O objetivo e o formato enviados pelo usuario sao obrigatorios e nao podem ser trocados. Nao invente eventos, copas, campeonatos ou seminarios se o objetivo nao for evento.",
          prompt: JSON.stringify({
            objective: input.generationInput.objective,
            contentType: input.generationInput.contentType,
            brandName: input.brandName,
            activityCategory: input.activity?.value ?? null,
            activityLabel: input.activity?.label ?? null,
            brandNotes: input.brandNotes || null,
            brandLogoName: input.selectedLogoAssetName,
            templateId: input.template?.id ?? null,
            templateName: input.template?.name ?? null,
            templateCategory: templateMatchesObjective ? input.template?.category ?? null : null,
            templateFormat: input.template?.format ?? null,
            visualDirection:
              input.generationInput.objective === "trial"
                ? "peça direta, acolhedora, com energia de convite para aula experimental"
                : input.generationInput.objective === "attract"
                  ? "peça forte de matrícula com urgência e destaque para chamada principal"
                  : input.generationInput.objective === "kids"
                    ? "peça leve, positiva e familiar, com foco em confiança e desenvolvimento"
                    : input.generationInput.objective === "evolution"
                      ? "peça de conquista, respeito e evolução no tatame"
                      : input.generationInput.objective === "event"
                        ? "peça de divulgação com senso de data, agenda e participação"
                        : input.generationInput.objective === "training"
                          ? "prova social forte, antes e depois, evolução e disciplina"
                          : "peça moderna de marketing para academia",
            templateHeadline: templateHeadline ?? null,
            templateBody: templateBody ?? null,
            cta,
            tone: input.generationInput.tone ?? null,
            promptNotes: input.generationInput.promptNotes ?? null,
            brandColors: input.brandKitColors,
            fallback: fallbackResult,
            rules: [
              "respeitar exatamente o objetivo informado",
              "respeitar exatamente o formato informado",
              "quando houver atividade informada, manter o contexto dela em todo o texto",
              "quando houver observacoes da marca, usar esse contexto como regra da campanha",
              "quando houver cores da marca, respeitar essa identidade visual",
              "usar portugues do Brasil",
              "nao misturar espanhol",
              "nao transformar campanha de captacao em convite para evento",
            ],
          }),
        },
      })

      const parsed = JSON.parse(response.text) as Partial<MarketingGenerationResult>
      return {
        headline: typeof parsed.headline === "string" ? parsed.headline : fallbackResult.headline,
        caption: typeof parsed.caption === "string" ? parsed.caption : fallbackResult.caption,
        hashtags: Array.isArray(parsed.hashtags)
          ? parsed.hashtags.filter((item): item is string => typeof item === "string")
          : fallbackResult.hashtags,
        callToAction:
          typeof parsed.callToAction === "string" ? parsed.callToAction : fallbackResult.callToAction,
        suggestedFormat: fallbackResult.suggestedFormat,
      }
    } catch {
      return fallbackResult
    }
  }

  private buildImagePrompt(input: {
    generation: MarketingGenerationEntity
    brandKitColors: { primary?: string; secondary?: string; accent?: string }
    brandNotes: string
    selectedAssets: Array<{ name: string; type: string }>
  }) {
    const selectedAssetSummary = input.selectedAssets.reduce(
      (summary, asset) => {
        if (asset.type === "professor_photo") summary.professor += 1
        if (asset.type === "team_photo") summary.team += 1
        if (asset.type === "space_photo" || asset.type === "academy_photo") summary.space += 1
        if (asset.type === "logo") summary.logo += 1
        return summary
      },
      { professor: 0, team: 0, space: 0, logo: 0 }
    )

    const formatInstruction =
      input.generation.input.contentType === "story" || input.generation.input.contentType === "reels"
        ? "Composição vertical 9:16, pensada para story."
        : input.generation.input.contentType === "carousel"
          ? "Composição vertical 4:5, pensada para capa de carrossel."
          : "Composição quadrada 1:1, pensada para post de feed."

    const subjectInstruction =
      selectedAssetSummary.professor > 0
        ? "Use a foto do professor como sujeito principal e dominante da peça."
        : selectedAssetSummary.team > 0
          ? "Use a foto da equipe como principal referência humana da peça."
          : selectedAssetSummary.space > 0
            ? "Use a estrutura da academia como referência visual principal."
            : "Crie uma composição esportiva coerente com academia."

    return [
      "Crie uma unica imagem fotografica publicitaria para rede social de academia.",
      "Idioma e contexto cultural: portugues do Brasil.",
      "Nao escreva nenhuma palavra, letra, numero, selo, CTA ou headline dentro da imagem.",
      "A imagem deve vir limpa, sem tipografia, sem texto misturado em espanhol e sem texto inventado.",
      "A composicao precisa ser uma cena unica, integrada e realista, ocupando o quadro inteiro.",
      "Proibido fazer colagem, montagem, mosaico, cartaz, flyer, mockup, scrapbook, split screen, varias fotos juntas ou foto colada dentro de card.",
      "Proibido colocar logo grande no centro, flutuando ou como elemento principal da peca.",
      "Se houver logo, use apenas de forma discreta e coerente com o ambiente, sem competir com a cena humana principal.",
      "Se nao for possivel usar o logotipo oficial da academia de forma natural em uniforme, parede, placa ou ambiente, nao coloque logotipo nenhum.",
      "Nunca invente, substitua ou use logotipos de outras marcas, academias, equipes, patrocinadores ou concorrentes.",
      "Nao transforme a peça em cartaz de evento se o objetivo nao for evento.",
      "As instrucoes adicionais e observacoes da marca sao obrigatorias e devem ser seguidas literalmente.",
      "Use as referencias apenas para composicao, roupas, cores, ambiente, enquadramento e identidade visual.",
      `Titulo: ${input.generation.result?.headline ?? ""}`,
      `Legenda base: ${input.generation.result?.caption ?? ""}`,
      `Formato: ${input.generation.result?.suggestedFormat ?? input.generation.input.contentType}`,
      `CTA: ${input.generation.result?.callToAction ?? ""}`,
      `Objetivo da peça: ${input.generation.input.objective}.`,
      input.generation.input.activityCategory
        ? `Atividade principal da peça: ${formatActivityCategory(input.generation.input.activityCategory)}.`
        : "Atividade principal da peça: geral da academia.",
      input.brandNotes.trim().length > 0
        ? `Observacoes obrigatorias da marca: ${input.brandNotes.trim()}.`
        : "Sem observacoes adicionais da marca.",
      input.generation.input.promptNotes?.trim()
        ? `Instrucoes adicionais obrigatorias do usuario: ${input.generation.input.promptNotes.trim()}.`
        : "Sem instrucoes adicionais do usuario.",
      `Direcao visual: ${objectiveVisualDirection[input.generation.input.objective]}.`,
      formatInstruction,
      subjectInstruction,
      `Cores da marca: primaria ${input.brandKitColors.primary ?? "#111827"}, secundaria ${input.brandKitColors.secondary ?? "#475569"}, destaque ${input.brandKitColors.accent ?? "#dc2626"}.`,
      input.selectedAssets.length > 0
        ? `Referencias visuais: ${input.selectedAssets.map((asset) => `${asset.name} (${asset.type})`).join(", ")}.`
        : "Sem referencias visuais anexadas; crie uma composicao esportiva e moderna.",
      selectedAssetSummary.logo > 0
        ? "Use o logotipo oficial da academia como referencia obrigatoria de identidade visual."
        : "Se nao houver logotipo, preserve a identidade visual apenas pelas cores e observacoes da marca.",
      "Estilo: moderno, premium, alto contraste, forte apelo visual e pronto para receber texto depois no template.",
    ].join("\n")
  }

  private buildFallbackImage(input: {
    generation: MarketingGenerationEntity
    brandKitColors: { primary?: string; secondary?: string; accent?: string }
    selectedLogoAssetUrl: string | null
  }) {
    const frame = resolveMarketingImageFrame(input.generation.input.contentType)
    const title = escapeSvgText(input.generation.result?.headline ?? "Sua academia em destaque")
    const cta = escapeSvgText(input.generation.result?.callToAction ?? "Agende agora")
    const primary = input.brandKitColors.primary ?? "#111827"
    const secondary = input.brandKitColors.secondary ?? "#475569"
    const accent = input.brandKitColors.accent ?? "#dc2626"
    const titleFontSize = frame.height > frame.width ? 92 : 86
    const labelFontSize = frame.height > frame.width ? 38 : 42
    const ctaFontSize = frame.height > frame.width ? 38 : 42
    const panelY = frame.height > frame.width ? frame.height - 560 : frame.height - 288
    const panelHeight = frame.height > frame.width ? 400 : 196
    const ctaY = panelY + panelHeight - 108
    const logoMarkup = input.selectedLogoAssetUrl
      ? `<image href="${input.selectedLogoAssetUrl}" x="${frame.width - 220}" y="116" width="120" height="120" preserveAspectRatio="xMidYMid meet" />`
      : ""
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${frame.width}" height="${frame.height}" viewBox="0 0 ${frame.width} ${frame.height}">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${primary}"/>
            <stop offset="100%" stop-color="${secondary}"/>
          </linearGradient>
        </defs>
        <rect width="${frame.width}" height="${frame.height}" rx="${frame.radius}" fill="url(#bg)"/>
        <circle cx="${frame.width - 180}" cy="180" r="180" fill="${accent}" fill-opacity="0.22"/>
        <circle cx="180" cy="${frame.height - 160}" r="220" fill="#ffffff" fill-opacity="0.07"/>
        <rect x="88" y="92" width="${frame.width - 176}" height="${frame.height - 184}" rx="56" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.12"/>
        ${logoMarkup}
        <text x="120" y="260" fill="#ffffff" font-family="Arial, sans-serif" font-size="${labelFontSize}" opacity="0.72">MARKETING DA ACADEMIA</text>
        <text x="120" y="380" fill="#ffffff" font-family="Arial, sans-serif" font-size="${titleFontSize}" font-weight="700">${title}</text>
        <rect x="88" y="${panelY}" width="${frame.width - 176}" height="${panelHeight}" rx="44" fill="#0f172a" fill-opacity="0.18"/>
        <rect x="120" y="${ctaY}" width="${frame.height > frame.width ? 520 : 420}" height="108" rx="28" fill="${accent}"/>
        <text x="160" y="${ctaY + 66}" fill="#ffffff" font-family="Arial, sans-serif" font-size="${ctaFontSize}" font-weight="700">${cta}</text>
      </svg>
    `.trim()

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  }

  private resolveActivity(activityCategory?: string): MarketingAcademyActivity | null {
    if (!activityCategory) {
      return null
    }

    return {
      value: activityCategory,
      label: formatActivityCategory(activityCategory),
    }
  }

  private resolveObjectiveCopy(input: {
    objective: MarketingGenerationInput["objective"]
    activity: MarketingAcademyActivity | null
  }) {
    const base = objectiveCopy[input.objective]
    if (!input.activity) {
      return base
    }

    switch (input.objective) {
      case "attract":
        return {
          ...base,
          headline: `Matriculas abertas para ${input.activity.label}`,
          caption: `Apresente o ${input.activity.label} da academia com uma mensagem de entrada clara, acolhedora e comercial.`,
          defaultCta: `Agende sua primeira aula de ${input.activity.label}`,
        }
      case "training":
        return {
          ...base,
          headline: `${input.activity.label}: treino forte, ambiente certo`,
          caption: `Mostre a intensidade, a rotina e o ambiente de treino do ${input.activity.label} para gerar interesse real.`,
          defaultCta: `Venha treinar ${input.activity.label}`,
        }
      case "evolution":
        return {
          ...base,
          headline: `A evolucao no ${input.activity.label} acontece um treino por vez`,
          caption: `Use a jornada dos alunos do ${input.activity.label} como prova social, inspiracao e demonstracao de progresso.`,
          defaultCta: `Conheca nossa metodologia em ${input.activity.label}`,
        }
      case "event":
        return {
          ...base,
          headline: `Reserve a data do proximo evento de ${input.activity.label}`,
          caption: `Crie urgencia e engajamento para um evento especial ligado ao ${input.activity.label}.`,
          defaultCta: "Garanta sua participacao",
        }
      case "kids":
        return {
          ...base,
          headline: `${input.activity.label} kids com disciplina e confianca`,
          caption: `Apresente o ${input.activity.label} kids com foco em desenvolvimento, valores e ambiente seguro.`,
          defaultCta: "Agende uma aula kids",
        }
      case "trial":
        return {
          ...base,
          headline: `Sua aula experimental de ${input.activity.label} pode ser hoje`,
          caption: `Convide novos contatos para conhecer o ${input.activity.label} da academia e viver a experiencia do treino.`,
          defaultCta: `Quero agendar minha aula de ${input.activity.label}`,
        }
      default:
        return base
    }
  }
}

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}
