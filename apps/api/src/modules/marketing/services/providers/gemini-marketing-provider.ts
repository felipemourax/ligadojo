import type {
  MarketingImageGenerationRequest,
  MarketingImageGenerationResponse,
  MarketingLogoEnhancementRequest,
  MarketingLogoEnhancementResponse,
  MarketingTextGenerationRequest,
  MarketingTextGenerationResponse,
} from "@/apps/api/src/modules/marketing/domain/marketing-ai"
import type { MarketingAiProviderClient } from "@/apps/api/src/modules/marketing/services/providers/marketing-ai-provider"

export class GeminiMarketingProvider implements MarketingAiProviderClient {
  readonly provider = "gemini" as const

  async generateText(input: {
    model: string
    request: MarketingTextGenerationRequest
  }): Promise<MarketingTextGenerationResponse> {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY nao configurada.")
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${input.model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: input.request.systemInstruction
            ? {
                parts: [{ text: input.request.systemInstruction }],
              }
            : undefined,
          contents: [
            {
              parts: [{ text: input.request.prompt }],
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Gemini retornou ${response.status}.`)
    }

    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }

    const text =
      payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("\n").trim() ?? ""

    if (!text) {
      throw new Error("Gemini nao retornou texto utilizavel.")
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
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY nao configurada.")
    }

    const referenceParts = await Promise.all(
      (input.request.references ?? []).map(async (reference) => {
        const inlineData = await resolveImageReferenceToInlineData(reference.imageUrl, reference.mimeType)
        return {
          inlineData,
        }
      })
    )

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${input.model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [...referenceParts, { text: input.request.prompt }],
            },
          ],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
            imageConfig: {
              aspectRatio: input.request.aspectRatio,
              imageSize: "1K",
            },
          },
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Gemini retornou ${response.status} na geracao de imagem.`)
    }

    const payload = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            inlineData?: { data?: string; mimeType?: string }
          }>
        }
      }>
    }

    const inlineData = payload.candidates?.[0]?.content?.parts?.find((part) => part.inlineData)?.inlineData
    const base64 = inlineData?.data?.trim() ?? ""
    const mimeType = inlineData?.mimeType?.trim() ?? "image/png"

    if (!base64) {
      throw new Error("Gemini nao retornou imagem utilizavel.")
    }

    return {
      provider: this.provider,
      model: input.model,
      imageUrl: `data:${mimeType};base64,${base64}`,
      mimeType,
    }
  }

  async enhanceLogo(input: {
    model: string
    request: MarketingLogoEnhancementRequest
  }): Promise<MarketingLogoEnhancementResponse> {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY nao configurada.")
    }

    const inlineData = await resolveImageReferenceToInlineData(
      input.request.sourceImage.imageUrl,
      input.request.sourceImage.mimeType
    )

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${input.model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData,
                },
                {
                  text: input.request.prompt,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
            imageConfig: {
              aspectRatio: "1:1",
              imageSize: "1K",
            },
          },
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Gemini retornou ${response.status} no tratamento do logotipo.`)
    }

    const payload = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            inlineData?: { data?: string; mimeType?: string }
          }>
        }
      }>
    }

    const output = payload.candidates?.[0]?.content?.parts?.find((part) => part.inlineData)?.inlineData
    const base64 = output?.data?.trim() ?? ""
    const mimeType = output?.mimeType?.trim() ?? "image/png"

    if (!base64) {
      throw new Error("Gemini nao retornou logotipo utilizavel.")
    }

    return {
      provider: this.provider,
      model: input.model,
      imageUrl: `data:${mimeType};base64,${base64}`,
      mimeType,
    }
  }
}

async function resolveImageReferenceToInlineData(imageUrl: string, fallbackMimeType?: string | null) {
  if (imageUrl.startsWith("data:")) {
    const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/)
    if (!match) {
      throw new Error("Imagem de referencia invalida para Gemini.")
    }

    return {
      mimeType: match[1],
      data: match[2],
    }
  }

  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error("Nao foi possivel baixar a imagem de referencia para Gemini.")
  }

  const arrayBuffer = await response.arrayBuffer()
  const mimeType = fallbackMimeType || response.headers.get("content-type") || "image/png"
  const data = Buffer.from(arrayBuffer).toString("base64")

  return {
    mimeType,
    data,
  }
}
