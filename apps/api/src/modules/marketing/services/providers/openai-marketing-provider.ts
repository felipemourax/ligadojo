import type {
  MarketingImageGenerationRequest,
  MarketingImageGenerationResponse,
  MarketingLogoEnhancementRequest,
  MarketingLogoEnhancementResponse,
  MarketingTextGenerationRequest,
  MarketingTextGenerationResponse,
} from "@/apps/api/src/modules/marketing/domain/marketing-ai"
import type { MarketingAiProviderClient } from "@/apps/api/src/modules/marketing/services/providers/marketing-ai-provider"

export class OpenAiMarketingProvider implements MarketingAiProviderClient {
  readonly provider = "openai" as const

  private resolveImageSize(aspectRatio: MarketingImageGenerationRequest["aspectRatio"]) {
    if (aspectRatio === "1:1") {
      return "1024x1024"
    }

    return "1024x1536"
  }

  async generateText(input: {
    model: string
    request: MarketingTextGenerationRequest
  }): Promise<MarketingTextGenerationResponse> {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY nao configurada.")
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: input.model,
        instructions: input.request.systemInstruction,
        input: input.request.prompt,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI retornou ${response.status}.`)
    }

    const payload = (await response.json()) as {
      output_text?: string
    }

    const text = payload.output_text?.trim() ?? ""
    if (!text) {
      throw new Error("OpenAI nao retornou texto utilizavel.")
    }

    return {
      provider: this.provider,
      model: input.model,
      text,
    }
  }

  async generateImage(input: {
    model: string
    request: MarketingImageGenerationRequest
  }): Promise<MarketingImageGenerationResponse> {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY nao configurada.")
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: input.model,
        prompt: [
          input.request.prompt,
          ...(input.request.references?.length
            ? [
                `Use estas referencias visuais quando possivel: ${input.request.references
                  .map((reference) => `${reference.name} (${reference.role})`)
                  .join(", ")}.`,
              ]
            : []),
        ].join("\n"),
        size: this.resolveImageSize(input.request.aspectRatio),
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI retornou ${response.status} na geracao de imagem.`)
    }

    const payload = (await response.json()) as {
      data?: Array<{ b64_json?: string }>
    }

    const base64 = payload.data?.[0]?.b64_json?.trim() ?? ""
    if (!base64) {
      throw new Error("OpenAI nao retornou imagem utilizavel.")
    }

    return {
      provider: this.provider,
      model: input.model,
      imageUrl: `data:image/png;base64,${base64}`,
      mimeType: "image/png",
    }
  }

  async enhanceLogo(input: {
    model: string
    request: MarketingLogoEnhancementRequest
  }): Promise<MarketingLogoEnhancementResponse> {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY nao configurada.")
    }

    const formData = new FormData()
    formData.append("model", input.model)
    formData.append("prompt", input.request.prompt)
    formData.append("background", "transparent")
    formData.append("quality", "high")
    formData.append("size", "1024x1024")
    formData.append("output_format", "png")
    formData.append(
      "image",
      resolveDataUrlToBlob(
        input.request.sourceImage.imageUrl,
        input.request.sourceImage.mimeType
      ),
      input.request.sourceImage.name || "logo.png"
    )

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`OpenAI retornou ${response.status} no tratamento do logotipo.`)
    }

    const payload = (await response.json()) as {
      data?: Array<{ b64_json?: string }>
    }

    const base64 = payload.data?.[0]?.b64_json?.trim() ?? ""
    if (!base64) {
      throw new Error("OpenAI nao retornou logotipo utilizavel.")
    }

    return {
      provider: this.provider,
      model: input.model,
      imageUrl: `data:image/png;base64,${base64}`,
      mimeType: "image/png",
    }
  }
}

function resolveDataUrlToBlob(dataUrl: string, fallbackMimeType?: string | null) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) {
    throw new Error("Imagem invalida para o provider OpenAI.")
  }

  const mimeType = match[1] || fallbackMimeType || "image/png"
  const buffer = Buffer.from(match[2], "base64")
  return new Blob([buffer], { type: mimeType })
}
