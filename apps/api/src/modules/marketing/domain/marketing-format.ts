import type { MarketingGenerationInput } from "@/apps/api/src/modules/marketing/domain/marketing"

export type MarketingContentType = MarketingGenerationInput["contentType"]
export type MarketingImageAspectRatio = "1:1" | "4:5" | "9:16"

export function resolveMarketingImageAspectRatio(
  contentType: MarketingContentType
): MarketingImageAspectRatio {
  if (contentType === "story" || contentType === "reels") {
    return "9:16"
  }

  if (contentType === "carousel") {
    return "4:5"
  }

  return "1:1"
}

export function resolveMarketingImageFrame(contentType: MarketingContentType) {
  if (contentType === "story" || contentType === "reels") {
    return { width: 1080, height: 1920, radius: 56 }
  }

  if (contentType === "carousel") {
    return { width: 1080, height: 1350, radius: 56 }
  }

  return { width: 1080, height: 1080, radius: 72 }
}
