import type { MarketingBrandKitEntity } from "@/apps/api/src/modules/marketing/domain/marketing"

export type MarketingTemplateCategory =
  | "enrollment"
  | "kids"
  | "graduation"
  | "trial"
  | "event"
  | "transformation"

export type MarketingTemplateFormat = "post" | "story" | "carousel"
export type MarketingTemplateDesignKey =
  | "impact-hero"
  | "clean-invite"
  | "kids-split"
  | "premium-belt"
  | "event-agenda"
  | "testimonial-proof"

export interface MarketingTemplateEntity {
  id: string
  name: string
  category: MarketingTemplateCategory
  format: MarketingTemplateFormat
  designKey: MarketingTemplateDesignKey
  headline: string
  body: string
  cta?: string
  isNew?: boolean
  isPremium?: boolean
}

export interface MarketingTemplateView extends MarketingTemplateEntity {
  colors: string[]
  logoUrl?: string | null
  previewImageUrl?: string | null
}

export const marketingTemplateCatalog: MarketingTemplateEntity[] = [
  {
    id: "template-enrollment-open",
    name: "Matrícula Impacto",
    category: "enrollment",
    format: "post",
    designKey: "impact-hero",
    headline: "Matrículas abertas",
    body: "Campanha forte para primeira dobra, com chamada grande, foto dominante e CTA direto.",
    cta: "Garanta sua vaga",
    isNew: true,
  },
  {
    id: "template-enrollment-plan-offer",
    name: "Oferta de Plano",
    category: "enrollment",
    format: "post",
    designKey: "impact-hero",
    headline: "Treine com condição especial",
    body: "Template promocional para plano de entrada, mensalidade ou campanha com urgência.",
    cta: "Fale com a academia",
  },
  {
    id: "template-trial-class",
    name: "Aula Experimental Clean",
    category: "trial",
    format: "story",
    designKey: "clean-invite",
    headline: "Sua primeira aula pode ser hoje",
    body: "Convite limpo, direto e confiável para captação de novos contatos.",
    cta: "Quero agendar",
    isNew: true,
  },
  {
    id: "template-trial-invite-team",
    name: "Convite com Equipe",
    category: "trial",
    format: "post",
    designKey: "clean-invite",
    headline: "Venha fazer sua aula experimental",
    body: "Modelo para usar equipe, clima de recepção e prova visual do ambiente da academia.",
    cta: "Agende sem custo",
  },
  {
    id: "template-kids-values",
    name: "Kids com Confiança",
    category: "kids",
    format: "carousel",
    designKey: "kids-split",
    headline: "Disciplina, respeito e confiança desde cedo",
    body: "Template com composição mais leve e familiar, ideal para falar com pais e responsáveis.",
    cta: "Agende uma aula",
  },
  {
    id: "template-kids-enrollment",
    name: "Matrícula Kids",
    category: "kids",
    format: "post",
    designKey: "kids-split",
    headline: "Turma kids com vagas abertas",
    body: "Peça focada em captação para turmas infantis com mensagem de disciplina, valores e segurança.",
    cta: "Quero saber mais",
  },
  {
    id: "template-graduation-highlight",
    name: "Graduação Premium",
    category: "graduation",
    format: "post",
    designKey: "premium-belt",
    headline: "Parabéns por mais uma conquista",
    body: "Peça de conquista com linguagem premium para troca de faixa, medalha ou destaque técnico.",
    cta: "Celebre a conquista",
  },
  {
    id: "template-graduation-honor",
    name: "Honra e Evolução",
    category: "graduation",
    format: "story",
    designKey: "premium-belt",
    headline: "Respeito à jornada no tatame",
    body: "Modelo para comunicar faixa nova, reconhecimento técnico e momento importante da equipe.",
    cta: "Parabéns pela evolução",
  },
  {
    id: "template-event-invite",
    name: "Evento com Agenda",
    category: "event",
    format: "post",
    designKey: "event-agenda",
    headline: "Reserve a data",
    body: "Estrutura visual para seminários, workshops, festivais internos e campeonatos.",
    cta: "Inscrições abertas",
  },
  {
    id: "template-event-seminar",
    name: "Seminário Especial",
    category: "event",
    format: "story",
    designKey: "event-agenda",
    headline: "Seminário confirmado",
    body: "Template para data, professor convidado, local e chamada para inscrição.",
    cta: "Reserve sua vaga",
  },
  {
    id: "template-transformation",
    name: "Prova Social",
    category: "transformation",
    format: "carousel",
    designKey: "testimonial-proof",
    headline: "Resultados reais no tatame",
    body: "Modelo para evolução, depoimento, transformação e resultado percebido pelo aluno.",
    cta: "Conheça a academia",
    isPremium: true,
  },
  {
    id: "template-transformation-testimonial",
    name: "Depoimento Forte",
    category: "transformation",
    format: "post",
    designKey: "testimonial-proof",
    headline: "Treino que transforma",
    body: "Peça para depoimento, antes e depois e história real de aluno, com linguagem de confiança.",
    cta: "Comece sua jornada",
    isPremium: true,
  },
]

export function buildMarketingTemplateViews(input: {
  brandKit: MarketingBrandKitEntity
}): MarketingTemplateView[] {
  const logo = input.brandKit.config.assets.find(
    (asset) => asset.id === input.brandKit.config.selectedLogoAssetId
  )

  const preferredImage =
    input.brandKit.config.assets.find((asset) => asset.type !== "logo") ?? null

  const primary = input.brandKit.config.colors.primary ?? "#111827"
  const secondary = input.brandKit.config.colors.secondary ?? "#475569"
  const accent = input.brandKit.config.colors.accent ?? "#dc2626"

  return marketingTemplateCatalog.map((template, index) => ({
    ...template,
    colors:
      template.category === "kids"
        ? [accent, secondary]
        : template.category === "trial"
          ? [accent, primary]
          : index % 2 === 0
            ? [primary, accent]
            : [primary, secondary],
    logoUrl: logo?.thumbnailUrl ?? logo?.fileUrl ?? null,
    previewImageUrl: preferredImage?.thumbnailUrl ?? preferredImage?.fileUrl ?? null,
  }))
}
