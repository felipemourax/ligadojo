"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  Check,
  ExternalLink,
  Facebook,
  Flame,
  Instagram,
  MapPin,
  Menu,
  Phone,
  Shield,
  Swords,
  Target,
  X,
  Youtube,
  MessageCircle,
} from "lucide-react"
import type { PublicTenantSiteView, SiteTemplateId } from "@/apps/api/src/modules/site/domain/site"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const siteNavItems = [
  { label: "Início", href: "#inicio" },
  { label: "Quem Somos", href: "#quem-somos" },
  { label: "Modalidades", href: "#modalidades" },
  { label: "Planos", href: "#planos" },
  { label: "Contato", href: "#contato" },
] as const

function formatCurrency(amountCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amountCents / 100)
}

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
  }
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
}

const templateLabel: Record<SiteTemplateId, string> = {
  traditional: "Tradicional",
  modern: "Moderno",
  competitive: "Competitivo",
  community: "Comunidade",
}

function modalityIcon(name: string) {
  if (name.toLowerCase().includes("jiu")) return Swords
  if (name.toLowerCase().includes("muay")) return Flame
  if (name.toLowerCase().includes("box")) return Shield
  return Target
}

export function SitePublicPage({ view }: { view: PublicTenantSiteView }) {
  const [showTrialDialog, setShowTrialDialog] = useState(false)
  const [isSubmittingTrial, setIsSubmittingTrial] = useState(false)
  const [trialForm, setTrialForm] = useState({
    name: "",
    whatsapp: "",
    email: "",
    modalityId: "",
    notes: "",
    consent: false,
  })

  const visibleSections = useMemo(
    () =>
      [...view.site.config.sections]
        .filter((section) => section.visible)
        .sort((left, right) => left.sortOrder - right.sortOrder),
    [view.site.config.sections]
  )

  const hero = visibleSections.find((section) => section.id === "hero")
  const about = visibleSections.find((section) => section.id === "about")
  const modalities = visibleSections.find((section) => section.id === "modalities")
  const plans = visibleSections.find((section) => section.id === "plans")
  const teachers = visibleSections.find((section) => section.id === "teachers")
  const trial = visibleSections.find((section) => section.id === "trial_class")
  const location = visibleSections.find((section) => section.id === "location")
  const templateId = view.site.config.templateId

  async function submitTrialClass() {
    setIsSubmittingTrial(true)
    try {
      const response = await fetch("/api/site/trial-class", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(trialForm),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Não foi possível solicitar a aula experimental.")
      }

      setShowTrialDialog(false)
      setTrialForm({
        name: "",
        whatsapp: "",
        email: "",
        modalityId: "",
        notes: "",
        consent: false,
      })
      toast({
        title: "Solicitação enviada",
        description: "Seu contato foi enviado para a academia. Em breve eles entram em contato.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao solicitar aula",
        description: error instanceof Error ? error.message : "Tente novamente em instantes.",
      })
    } finally {
      setIsSubmittingTrial(false)
    }
  }

  function scrollToSection(sectionId: string) {
    if (typeof window === "undefined") return
    const target = document.getElementById(sectionId)
    if (!target) return

    const headerOffset = 96
    const elementPosition = target.getBoundingClientRect().top + window.scrollY
    const offsetPosition = Math.max(0, elementPosition - headerOffset)

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    })
  }

  return (
    <>
      <div
        className={cn(
          "min-h-screen scroll-smooth",
          templateId === "traditional" && "bg-[#121212] text-[#f1f1f1]",
          templateId === "modern" && "bg-white text-[#141922]",
          templateId === "competitive" && "bg-black text-white",
          templateId === "community" && "bg-[#f7faf8] text-[#21332b]"
        )}
      >
        <SiteHeader
          templateId={templateId}
          academyName={view.tenant.displayName}
          trialLabel={typeof trial?.content.ctaText === "string" ? trial.content.ctaText : "Aula experimental"}
          onTrialClick={() => setShowTrialDialog(true)}
          onNavigate={scrollToSection}
        />

        <main>
          {hero ? <HeroSection templateId={templateId} hero={hero} view={view} onTrialClick={() => setShowTrialDialog(true)} /> : null}
          {about ? <AboutSection templateId={templateId} about={about} view={view} /> : null}
          {modalities ? <ModalitiesSection templateId={templateId} modalities={modalities} view={view} /> : null}
          {teachers ? <TeachersSection templateId={templateId} teachers={teachers} view={view} /> : null}
          {plans ? <PlansSection templateId={templateId} plans={plans} view={view} /> : null}
          {trial ? <TrialSection templateId={templateId} trial={trial} onTrialClick={() => setShowTrialDialog(true)} /> : null}
          {location ? <LocationSection templateId={templateId} location={location} view={view} /> : null}
          <FooterSection templateId={templateId} view={view} />
        </main>
      </div>

      <Dialog open={showTrialDialog} onOpenChange={setShowTrialDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar aula experimental</DialogTitle>
            <DialogDescription>
              Preencha seus dados. A academia receberá esse contato como lead no CRM.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Seu nome</Label>
              <Input
                value={trialForm.name}
                onChange={(event) => setTrialForm((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>WhatsApp</Label>
              <Input
                value={trialForm.whatsapp}
                onChange={(event) =>
                  setTrialForm((current) => ({ ...current, whatsapp: maskPhone(event.target.value) }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={trialForm.email}
                onChange={(event) => setTrialForm((current) => ({ ...current, email: event.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Modalidade de interesse</Label>
              <Select
                value={trialForm.modalityId || "none"}
                onValueChange={(value) =>
                  setTrialForm((current) => ({ ...current, modalityId: value === "none" ? "" : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma modalidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não definido</SelectItem>
                  {view.modalities.map((modality) => (
                    <SelectItem key={modality.id} value={modality.id}>
                      {modality.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Observações</Label>
              <Textarea
                value={trialForm.notes}
                onChange={(event) => setTrialForm((current) => ({ ...current, notes: event.target.value }))}
              />
            </div>
            <label className="flex items-start gap-3 rounded-xl border px-3 py-3 text-sm">
              <input
                type="checkbox"
                checked={trialForm.consent}
                onChange={(event) => setTrialForm((current) => ({ ...current, consent: event.target.checked }))}
              />
              <span>Autorizo o envio dos meus dados para contato da academia sobre a aula experimental.</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTrialDialog(false)}>
              Fechar
            </Button>
            <Button disabled={isSubmittingTrial} onClick={() => void submitTrialClass()}>
              Enviar solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function SiteHeader({
  templateId,
  academyName,
  trialLabel,
  onTrialClick,
  onNavigate,
}: {
  templateId: SiteTemplateId
  academyName: string
  trialLabel: string
  onTrialClick: () => void
  onNavigate: (sectionId: string) => void
}) {
  const themeClasses: Record<SiteTemplateId, string> = {
    traditional: "border-b border-white/10 bg-[#111111]",
    modern: "bg-white",
    competitive: "bg-black text-white",
    community: "bg-white shadow-sm",
  }

  const logoClasses: Record<SiteTemplateId, string> = {
    traditional: "text-2xl uppercase tracking-[0.22em] text-white",
    modern: "text-[2rem] font-semibold tracking-tight text-[#141922]",
    competitive: "text-2xl uppercase italic tracking-[0.08em] text-white",
    community: "text-2xl font-semibold text-[#0f6a4f]",
  }

  const linkClasses: Record<SiteTemplateId, string> = {
    traditional: "text-sm uppercase tracking-[0.18em] text-white/70 hover:text-[#e11d2f]",
    modern: "text-base text-[#7a8498] hover:text-[#141922]",
    competitive: "text-sm font-black uppercase italic tracking-[0.04em] text-white hover:text-white/85",
    community: "text-sm text-slate-500 hover:text-[#0f6a4f]",
  }

  const ctaClasses: Record<SiteTemplateId, string> = {
    traditional: "bg-[#e11d2f] text-white hover:bg-[#c81a29]",
    modern: "rounded-[1.1rem] bg-[#2f5cff] text-white hover:bg-[#284fdc]",
    competitive: "rounded-md bg-[#ffe84f] text-black hover:bg-[#f0da4b]",
    community: "rounded-full bg-[#3d8f65] text-white hover:bg-[#347b57]",
  }

  const mobilePanelClasses: Record<SiteTemplateId, string> = {
    traditional: "border-t border-white/10 bg-[#111111]/95 text-white backdrop-blur-xl",
    modern: "border-t border-slate-200 bg-white/95 text-[#141922] backdrop-blur-xl",
    competitive: "border-t border-black/10 bg-[#ffe84f]/95 text-black backdrop-blur-xl",
    community: "border-t border-[#dde7e2] bg-white/95 text-[#21332b] backdrop-blur-xl",
  }

  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className={cn("sticky top-0 z-40", themeClasses[templateId])}>
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6 lg:px-12">
        <span className={logoClasses[templateId]}>{academyName}</span>
        <nav className="hidden items-center gap-8 lg:flex">
          {siteNavItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={linkClasses[templateId]}
              onClick={(event) => {
                event.preventDefault()
                onNavigate(item.href.replace("#", ""))
              }}
            >
              {item.label}
            </a>
          ))}
          <button type="button" className={cn("h-11 rounded-xl px-5 text-sm font-semibold", ctaClasses[templateId])} onClick={onTrialClick}>
            {trialLabel}
          </button>
        </nav>
        <button
          type="button"
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-colors lg:hidden",
            templateId === "traditional" && "border-white/10 bg-white/5 text-white",
            templateId === "modern" && "border-slate-200 bg-white text-[#141922]",
            templateId === "competitive" && "border-black/10 bg-black/5 text-black",
            templateId === "community" && "border-[#dde7e2] bg-white text-[#21332b]"
          )}
          onClick={() => setMenuOpen((current) => !current)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <div
        className={cn(
          "overflow-hidden transition-[max-height,opacity] duration-300 lg:hidden",
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className={cn("px-6 py-5", mobilePanelClasses[templateId])}>
          <nav className="flex flex-col gap-4">
            {siteNavItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={linkClasses[templateId]}
                onClick={(event) => {
                  event.preventDefault()
                  setMenuOpen(false)
                  onNavigate(item.href.replace("#", ""))
                }}
              >
                {item.label}
              </a>
            ))}
            <button
              type="button"
              className={cn("mt-2 h-12 rounded-2xl px-5 text-sm font-semibold", ctaClasses[templateId])}
              onClick={() => {
                setMenuOpen(false)
                onTrialClick()
              }}
            >
              {trialLabel}
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}

function HeroSection({
  templateId,
  hero,
  view,
  onTrialClick,
}: {
  templateId: SiteTemplateId
  hero: NonNullable<ReturnType<typeof Array.prototype.find>>
  view: PublicTenantSiteView
  onTrialClick: () => void
}) {
  const title = typeof hero.content.headline === "string" ? hero.content.headline : "Treine com os melhores"
  const subtitle =
    typeof hero.content.subheadline === "string"
      ? hero.content.subheadline
      : "Conheça a academia, veja nossos planos e agende uma aula experimental."

  if (templateId === "traditional") {
    const heroImageUrl = typeof hero.content.imageUrl === "string" ? hero.content.imageUrl : null

    return (
      <section id="inicio" className="relative min-h-[84vh] overflow-hidden border-b border-white/5 bg-[#111111]">
        {heroImageUrl ? (
          <img src={heroImageUrl} alt={title} className="absolute inset-0 h-full w-full object-cover opacity-35" />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.72),rgba(0,0,0,0.82))]" />
        <Reveal className="relative z-10 mx-auto flex min-h-[84vh] max-w-6xl items-center justify-center px-6 text-center lg:px-12">
          <div className="max-w-4xl">
            <h2 className="text-5xl uppercase leading-[0.92] tracking-[0.02em] text-white md:text-7xl lg:text-[6.5rem]">
              {title}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base text-white/70 md:text-xl">{subtitle}</p>
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={onTrialClick}
                className="h-14 bg-[#cf2e22] px-10 text-base font-bold uppercase tracking-[0.06em] text-white transition-colors duration-300 hover:bg-[#bb271c] md:h-16 md:px-14 md:text-lg"
              >
                {typeof hero.content.primaryCtaText === "string" ? hero.content.primaryCtaText : "Agende sua aula experimental"}
              </button>
            </div>
          </div>
        </Reveal>
      </section>
    )
  }

  if (templateId === "modern") {
    const heroImageUrl = typeof hero.content.imageUrl === "string" ? hero.content.imageUrl : null

    return (
      <section id="inicio" className="grid min-h-[78vh] grid-cols-1 items-center gap-16 px-6 py-20 lg:grid-cols-12 lg:px-12">
        <Reveal className="lg:col-span-5">
          <h2 className="max-w-xl text-5xl font-medium leading-[0.94] tracking-tight text-[#141922] md:text-7xl">
            {title}
          </h2>
          <p className="mt-8 max-w-lg text-[1.7rem] leading-10 text-[#7d8697] md:text-[2rem]">{subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={onTrialClick} className="h-12 rounded-[1.1rem] bg-[#2f5cff] px-6 text-sm font-medium text-white shadow-[0_18px_36px_-18px_rgba(47,92,255,0.45)] transition-transform duration-300 hover:-translate-y-0.5">
              {typeof hero.content.primaryCtaText === "string" ? hero.content.primaryCtaText : "Agende sua Aula Experimental"}
            </button>
          </div>
        </Reveal>
        <Reveal className="lg:col-span-7" delayMs={120}>
          <div className="overflow-hidden rounded-[1.6rem] bg-[#eef2f7] shadow-[0_24px_60px_-34px_rgba(20,25,34,0.22)]">
            {heroImageUrl ? (
              <img src={heroImageUrl} alt={title} className="aspect-[1.35/1] w-full object-cover" />
            ) : (
              <div className="aspect-[1.35/1] w-full bg-[linear-gradient(135deg,#f4f7fb,#e8eef7)]" />
            )}
          </div>
        </Reveal>
      </section>
    )
  }

  if (templateId === "competitive") {
    const heroImageUrl = typeof hero.content.imageUrl === "string" ? hero.content.imageUrl : null

    return (
      <section id="inicio" className="relative min-h-[84vh] overflow-hidden bg-black">
        {heroImageUrl ? (
          <img src={heroImageUrl} alt={title} className="absolute inset-0 h-full w-full object-cover opacity-55" />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.78),rgba(0,0,0,0.32)_45%,rgba(0,0,0,0.72))]" />
        <Reveal className="relative z-10 flex min-h-[84vh] max-w-6xl items-center px-6 lg:px-12">
          <div className="max-w-4xl">
            <h2 className="text-6xl uppercase italic leading-[0.88] tracking-[0.01em] text-white md:text-8xl lg:text-[7.5rem]">
              {title}
            </h2>
            <p className="mt-8 max-w-2xl text-base text-white/70 md:text-2xl">{subtitle}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onTrialClick}
                className="h-14 rounded-md bg-[#ffe84f] px-10 text-base font-bold uppercase text-black shadow-[0_20px_40px_-22px_rgba(255,232,79,0.45)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                {typeof hero.content.primaryCtaText === "string" ? hero.content.primaryCtaText : "Agende sua aula experimental"}
              </button>
            </div>
          </div>
        </Reveal>
      </section>
    )
  }

  return (
    <section id="inicio" className="relative min-h-[76vh] overflow-hidden bg-[#f7faf8]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.28),rgba(255,255,255,0.58))]" />
      {typeof hero.content.imageUrl === "string" ? (
        <img
          src={hero.content.imageUrl}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover opacity-42"
        />
      ) : null}
      <Reveal className="relative z-10 flex min-h-[76vh] items-center px-6 py-24 lg:px-12">
        <div className="max-w-3xl">
          <h2 className="text-5xl font-semibold leading-[0.94] tracking-tight text-[#1f2937] md:text-7xl">
            {title}
          </h2>
          <p className="mt-5 max-w-2xl text-xl text-slate-500">{subtitle}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onTrialClick}
              className="h-14 rounded-full bg-[#3d8f65] px-8 text-lg font-semibold text-white shadow-[0_18px_36px_-20px_rgba(61,143,101,0.35)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              {typeof hero.content.primaryCtaText === "string" ? hero.content.primaryCtaText : "Agende sua Aula Experimental"}
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function AboutSection({
  templateId,
  about,
  view,
}: {
  templateId: SiteTemplateId
  about: NonNullable<ReturnType<typeof Array.prototype.find>>
  view: PublicTenantSiteView
}) {
  const title = typeof about.content.title === "string" ? about.content.title : "Sobre a academia"
  const description =
    typeof about.content.description === "string"
      ? about.content.description
      : "Apresente aqui a história, os diferenciais e a proposta da academia."
  const aboutImageUrl = typeof about.content.imageUrl === "string" ? about.content.imageUrl : ""

  const contactBlock = (
    <div
      className={cn(
        "space-y-4 text-sm",
        templateId === "traditional" || templateId === "competitive" ? "text-white/70" : "text-slate-500"
      )}
    >
      {view.profile.phone ? (
        <div className="flex items-center gap-3">
          <Phone className="h-4 w-4" />
          <span>{view.profile.phone}</span>
        </div>
      ) : null}
      {view.location.city || view.location.state ? (
        <div className="flex items-center gap-3">
          <MapPin className="h-4 w-4" />
          <span>{[view.location.city, view.location.state].filter(Boolean).join(" - ")}</span>
        </div>
      ) : null}
    </div>
  )

  if (templateId === "competitive") {
    return (
      <section id="quem-somos" className="border-t border-white/10 bg-[#222222] px-6 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-14 py-6 lg:grid-cols-2">
          <Reveal>
            <h3 className="text-5xl uppercase italic text-white md:text-6xl">{title}</h3>
            <p className="mt-8 max-w-xl text-lg leading-10 text-white/60">{description}</p>
            <div className="mt-8">{contactBlock}</div>
          </Reveal>
          <Reveal delayMs={120} className="overflow-hidden rounded-md bg-[#111111] shadow-[0_24px_50px_-28px_rgba(255,255,255,0.08)]">
            {aboutImageUrl ? (
              <img src={aboutImageUrl} alt={title} className="aspect-[1.15/1] w-full object-cover" />
            ) : (
              <div className="aspect-[1.15/1] bg-[linear-gradient(135deg,#191919,#0f0f0f)]" />
            )}
          </Reveal>
        </div>
      </section>
    )
  }

  if (templateId === "modern") {
    return (
      <section id="quem-somos" className="bg-white px-6 py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
          <Reveal className="overflow-hidden rounded-[1.5rem] bg-[#eef2f7] shadow-[0_20px_50px_-26px_rgba(20,25,34,0.16)]">
            {aboutImageUrl ? (
              <img src={aboutImageUrl} alt={title} className="aspect-[1.15/1] w-full object-cover" />
            ) : (
              <div className="aspect-[1.15/1] bg-[linear-gradient(135deg,#dbe6ff,#f4f7fb)]" />
            )}
          </Reveal>
          <Reveal delayMs={120}>
            <p className="text-sm font-semibold tracking-[0.12em] text-[#2f5cff]">SOBRE NÓS</p>
            <h3 className="mt-3 text-5xl font-medium tracking-tight text-[#141922] md:text-6xl">{title}</h3>
            <p className="mt-6 text-xl leading-10 text-[#7d8697]">{description}</p>
            <div className="mt-8">{contactBlock}</div>
          </Reveal>
        </div>
      </section>
    )
  }

  if (templateId === "community") {
    return (
      <section id="quem-somos" className="bg-white px-6 py-24">
        <div className="mx-auto max-w-5xl text-center">
          <Reveal>
            <h3 className="text-5xl font-semibold text-[#21332b]">{title}</h3>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-9 text-slate-500">{description}</p>
          </Reveal>
          <Reveal delayMs={120} className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-[1.8rem] bg-black shadow-[0_24px_56px_-34px_rgba(15,106,79,0.18)]">
            {aboutImageUrl ? (
              <img src={aboutImageUrl} alt={title} className="aspect-[1.55/1] w-full object-cover" />
            ) : (
              <div className="aspect-[1.55/1] bg-[linear-gradient(135deg,#111827,#030712)]" />
            )}
          </Reveal>
        </div>
      </section>
    )
  }

  return (
    <section id="quem-somos" className="bg-[#141414] px-6 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <Reveal>
          <h3 className="text-4xl uppercase tracking-[0.02em] text-white md:text-5xl">{title}</h3>
          <div className="mt-6 h-1 w-16 bg-[#cf2e22]" />
          <p className="mt-10 max-w-xl text-lg leading-9 text-white/65">{description}</p>
          <div className="mt-8">{contactBlock}</div>
        </Reveal>
        <Reveal delayMs={120} className="border border-white/10 bg-[#181818] p-3 shadow-[8px_8px_0_rgba(0,0,0,0.75)]">
          {aboutImageUrl ? (
            <div className="overflow-hidden border border-white/10">
              <img src={aboutImageUrl} alt={title} className="aspect-[1.15/1] w-full object-cover" />
            </div>
          ) : (
            <div className="aspect-[1.15/1] bg-[linear-gradient(135deg,#252525,#111111)]" />
          )}
        </Reveal>
      </div>
    </section>
  )
}

function ModalitiesSection({
  templateId,
  modalities,
  view,
}: {
  templateId: SiteTemplateId
  modalities: NonNullable<ReturnType<typeof Array.prototype.find>>
  view: PublicTenantSiteView
}) {
  const title = typeof modalities.content.title === "string" ? modalities.content.title : "Modalidades"
  const sectionBg: Record<SiteTemplateId, string> = {
    traditional: "bg-[#323232]",
    modern: "bg-white",
    competitive: "bg-[#222222]",
    community: "bg-[#f7faf8]",
  }

  return (
    <section id="modalidades" className={cn("px-6 py-24", sectionBg[templateId])}>
      <div className="mx-auto max-w-6xl">
        <h3
          className={cn(
            "mb-12 text-center text-4xl",
            templateId === "traditional" && "uppercase text-white",
            templateId === "modern" && "font-semibold tracking-tight text-[#141922]",
            templateId === "competitive" && "uppercase italic text-white",
            templateId === "community" && "font-semibold text-[#21332b]"
          )}
        >
          {title}
        </h3>
        {templateId === "modern" ? <div className="mb-12 h-px w-full bg-[#eceef3]" /> : null}
        <div className={cn("grid gap-6", templateId === "modern" ? "md:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4")}>
          {view.modalities.map((modality) => {
            const Icon = modalityIcon(modality.name)
            return (
              <Reveal
                key={modality.id}
                delayMs={60}
                className={cn(
                  "p-6 transition-transform duration-300 hover:-translate-y-1",
                  templateId === "traditional" && "border border-white/10 bg-[#242424] text-center shadow-[6px_6px_0_rgba(0,0,0,0.75)] hover:border-[#cf2e22]/35",
                  templateId === "modern" && "flex items-start gap-5 rounded-[1.25rem] border border-[#e9edf4] bg-white p-8 shadow-[0_20px_50px_-30px_rgba(20,25,34,0.12)]",
                  templateId === "competitive" && "relative overflow-hidden rounded-md border border-white/10 bg-[#111111] shadow-none hover:border-[#ffe84f]/35",
                  templateId === "community" && "rounded-[1.5rem] border border-[#e3ece7] bg-white text-center shadow-[0_18px_36px_-26px_rgba(15,106,79,0.16)]"
                )}
              >
                {templateId === "competitive" ? <div className="absolute left-0 top-0 h-1.5 w-full bg-[#ffe84f]" /> : null}
                <div className={cn(
                  templateId === "modern" && "rounded-xl bg-[#f3f5f9] p-3",
                  templateId === "community" && "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0f6a4f]/10"
                )}>
                  <Icon
                    className={cn(
                      "mb-4",
                      templateId === "traditional" && "mx-auto text-[#cf2e22]",
                      templateId === "modern" && "mb-0 text-[#141922]",
                      templateId === "competitive" && "text-[#ffe84f]",
                      templateId === "community" && "mb-0 text-[#0f6a4f]"
                    )}
                    size={templateId === "modern" || templateId === "community" ? 28 : 36}
                  />
                </div>
                <div className={cn(templateId === "modern" && "flex-1")}>
                  <p className={cn(
                    "text-lg",
                    templateId === "traditional" && "uppercase text-white",
                    templateId === "modern" && "font-medium text-[#141922]",
                    templateId === "competitive" && "uppercase italic text-white",
                    templateId === "community" && "font-semibold text-[#21332b]"
                  )}>
                    {modality.name}
                  </p>
                  <p className={cn(
                    "mt-2 text-sm",
                    templateId === "traditional" || templateId === "competitive" ? "text-white/60" : "text-slate-500"
                  )}>
                    {modality.activityCategory ?? "Atividade"} • {modality.ageGroups.join(", ")}
                  </p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function TeachersSection({
  templateId,
  teachers,
  view,
}: {
  templateId: SiteTemplateId
  teachers: NonNullable<ReturnType<typeof Array.prototype.find>>
  view: PublicTenantSiteView
}) {
  if ((templateId !== "traditional" && templateId !== "modern" && templateId !== "competitive" && templateId !== "community") || view.teachers.length === 0) {
    return null
  }

  const title = typeof teachers.content.title === "string" ? teachers.content.title : "Atletas da equipe"

  if (templateId === "modern") {
    return (
      <section className="bg-white px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <h3 className="mb-12 text-center text-4xl font-medium tracking-tight text-[#141922] md:text-6xl">{title}</h3>
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {view.teachers.slice(0, 3).map((teacher) => (
              <Reveal key={teacher.id} delayMs={60}>
                <div className="overflow-hidden rounded-[1.4rem] bg-white shadow-none">
                  <div className="overflow-hidden rounded-[1.4rem] bg-[#eef2f7]">
                    <div className="aspect-[0.86/1] bg-[linear-gradient(180deg,#f4f7fb,#e9eef6)]" />
                  </div>
                  <div className="px-1 py-4">
                    <p className="text-2xl font-medium text-[#141922]">{teacher.name}</p>
                    <p className="mt-1 text-base text-[#7d8697]">
                      {[teacher.rank, teacher.roleTitle].filter(Boolean).join(" - ") || "Equipe técnica"}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (templateId === "competitive") {
    return (
      <section className="bg-[#222222] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h3 className="mb-12 text-center text-4xl uppercase italic tracking-[0.02em] text-white md:text-6xl">{title}</h3>
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {view.teachers.slice(0, 3).map((teacher, index) => (
              <Reveal key={teacher.id} delayMs={60}>
                <div className="overflow-hidden rounded-md bg-[#111111]">
                  <div
                    className={cn(
                      "aspect-[0.8/1] overflow-hidden",
                      index === 0 ? "bg-[#d8c63e]" : "bg-[#111111]"
                    )}
                  >
                    <div className={cn("h-full w-full bg-[linear-gradient(180deg,#1a1a1a,#0c0c0c)]", index === 0 && "opacity-35")} />
                  </div>
                  <div className={cn("px-4 py-5", index === 0 ? "bg-[#d8c63e] text-black" : "bg-[#222222] text-white")}>
                    <p className="text-2xl uppercase italic font-bold">{teacher.name}</p>
                    <p className={cn("mt-1 text-base", index === 0 ? "text-black/75" : "text-white/60")}>
                      {[teacher.rank, teacher.roleTitle].filter(Boolean).join(" - ") || "Equipe técnica"}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (templateId === "community") {
    return (
      <section className="bg-[#f7faf8] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h3 className="mb-12 text-center text-4xl font-semibold text-[#21332b] md:text-6xl">{title}</h3>
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {view.teachers.slice(0, 3).map((teacher) => (
              <Reveal key={teacher.id} delayMs={60}>
                <div className="overflow-hidden rounded-[1.6rem] border border-[#e4ece7] bg-white shadow-[0_18px_40px_-30px_rgba(15,106,79,0.14)]">
                  <div className="flex justify-center pt-10">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(180deg,#dbe6df,#eef3ef)] text-3xl font-semibold text-[#0f6a4f]">
                      {teacher.name.slice(0, 1).toUpperCase()}
                    </div>
                  </div>
                  <div className="px-6 py-6 text-center">
                    <p className="text-2xl font-semibold text-[#21332b]">{teacher.name}</p>
                    <p className="mt-1 text-base text-slate-500">
                      {[teacher.rank, teacher.roleTitle].filter(Boolean).join(" - ") || "Equipe técnica"}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-[#141414] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h3 className="mb-12 text-center text-4xl uppercase tracking-[0.02em] text-white">{title}</h3>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {view.teachers.slice(0, 3).map((teacher) => (
            <Reveal
              key={teacher.id}
              delayMs={60}
              className="overflow-hidden border border-white/10 bg-[#242424] shadow-[6px_6px_0_rgba(0,0,0,0.75)]"
            >
              <div className="aspect-[0.86/1] bg-[linear-gradient(180deg,#1d1d1d,#0f0f0f)]" />
              <div className="space-y-2 border-t border-white/10 bg-[#242424] px-4 py-5">
                <p className="text-xl uppercase text-white">{teacher.name}</p>
                <p className="text-sm text-white/60">
                  {[teacher.rank, teacher.roleTitle].filter(Boolean).join(" • ") || "Equipe técnica"}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function PlansSection({
  templateId,
  plans,
  view,
}: {
  templateId: SiteTemplateId
  plans: NonNullable<ReturnType<typeof Array.prototype.find>>
  view: PublicTenantSiteView
}) {
  const title = typeof plans.content.title === "string" ? plans.content.title : "Nossos Planos"
  const subtitle =
    typeof plans.content.subtitle === "string"
      ? plans.content.subtitle
      : "Escolha o plano ideal para você e comece a treinar hoje mesmo."

  return (
    <section
      id="planos"
      className={cn(
        "px-6 py-24",
        templateId === "traditional" && "bg-[#141414]",
        templateId === "modern" && "bg-slate-50",
        templateId === "community" && "bg-white",
        templateId !== "modern" && templateId !== "community" && "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-6xl">
        <h3
          className={cn(
            "text-center text-4xl",
            templateId === "traditional" && "uppercase text-white",
            templateId === "modern" && "font-semibold tracking-tight text-[#141922]",
            templateId === "competitive" && "uppercase italic text-white",
            templateId === "community" && "font-semibold text-[#21332b]"
          )}
        >
          {title}
        </h3>
        <p className={cn("mx-auto mt-4 max-w-xl text-center", templateId === "traditional" || templateId === "competitive" ? "text-white/60" : "text-slate-500")}>
          {subtitle}
        </p>
        <div className="mt-10 flex gap-6 overflow-x-auto pb-4">
          {view.plans.map((plan, index) => (
            <Reveal
              key={plan.id}
              delayMs={80}
              className={cn(
                "max-w-[360px] min-w-[300px] shrink-0 p-6 transition-transform duration-300 hover:-translate-y-1",
                templateId === "traditional" && "border border-white/10 bg-[#242424] shadow-[6px_6px_0_rgba(0,0,0,0.75)]",
                templateId === "modern" && "rounded-[1.4rem] border border-[#edf0f5] bg-white p-8 shadow-[0_18px_38px_-26px_rgba(20,25,34,0.12)]",
                templateId === "competitive" && "relative overflow-hidden rounded-md border border-white/10 bg-[#111111] shadow-none",
                templateId === "community" && "rounded-[1.6rem] border border-[#edf2ee] bg-[#fcfdfc] text-center shadow-[0_20px_38px_-30px_rgba(15,106,79,0.12)]"
              )}
            >
              {templateId === "competitive" ? <div className="absolute left-0 top-0 h-1.5 w-full bg-[#ffe84f]" /> : null}
              {index === 1 ? (
                <span
                    className={cn(
                      "mb-4 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]",
                    templateId === "traditional"
                      ? "bg-[#cf2e22] text-white"
                      : templateId === "modern"
                        ? "bg-[#141922] text-white"
                      : templateId === "competitive"
                        ? "bg-black text-white"
                        : "bg-[#4f996d] text-white"
                  )}
                >
                  Popular
                </span>
              ) : null}
              <p className={cn(
                "text-xl",
                templateId === "traditional" && "uppercase text-white",
                templateId === "modern" && "font-medium text-[#141922]",
                templateId === "competitive" && "uppercase italic text-white",
                templateId === "community" && "font-semibold text-[#21332b]"
              )}>
                {plan.name}
              </p>
              <div className="mt-4">
                <span className={cn("text-4xl font-bold", templateId === "traditional" || templateId === "competitive" ? "text-white" : "text-[#141922]")}>
                  {formatCurrency(plan.amountCents)}
                </span>
                <span className={cn("ml-1 text-sm", templateId === "traditional" || templateId === "competitive" ? "text-white/60" : "text-slate-500")}>
                  /mês
                </span>
              </div>
              <div className="mt-5 space-y-3">
                {plan.includedModalityIds.slice(0, 4).map((modalityId) => {
                  const modality = view.modalities.find((item) => item.id === modalityId)
                  return (
                    <div key={modalityId} className={cn("flex items-center gap-2 text-sm", templateId === "traditional" || templateId === "competitive" ? "text-white/70" : "text-slate-500")}>
                      <Check className={cn("h-4 w-4", templateId === "competitive" ? "text-[#ffe84f]" : "text-primary")} />
                      <span>{modality?.name ?? "Modalidade incluída"}</span>
                    </div>
                  )
                })}
              </div>
              <Link
                href={`/app?source=site&planId=${plan.id}`}
                className={cn(
                  "mt-6 inline-flex h-12 w-full items-center justify-center font-semibold transition-colors",
                  templateId === "traditional" && "bg-[#cf2e22] text-white",
                  templateId === "modern" && "rounded-[1.1rem] bg-[#f2f4f8] text-[#141922] hover:bg-[#e8edf5]",
                  templateId === "competitive" && "rounded-md border border-white/10 bg-black text-white",
                  templateId === "community" &&
                    (index === 1
                      ? "rounded-full bg-[#3d8f65] text-white shadow-[0_18px_36px_-24px_rgba(61,143,101,0.28)]"
                      : "rounded-full bg-[#f6edd8] text-[#8a5f22] shadow-none")
                )}
              >
                Escolher plano
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrialSection({
  templateId,
  trial,
  onTrialClick,
}: {
  templateId: SiteTemplateId
  trial: NonNullable<ReturnType<typeof Array.prototype.find>>
  onTrialClick: () => void
}) {
  const title = typeof trial.content.title === "string" ? trial.content.title : "Agende uma aula experimental"
  const subtitle =
    typeof trial.content.subtitle === "string"
      ? trial.content.subtitle
      : "Envie seus dados e nossa equipe entrará em contato."

  const sectionClasses: Record<SiteTemplateId, string> = {
    traditional: "bg-[#e11d2f] text-white",
    modern: "bg-white text-[#141922]",
    competitive: "bg-[#ffe84f] text-black",
    community: "bg-[#f6edd8] text-[#7b5520]",
  }

  const buttonClasses: Record<SiteTemplateId, string> = {
    traditional: "bg-[#121212] text-white border-2 border-[#121212]",
    modern: "rounded-[1.1rem] bg-[#2f5cff] text-white",
    competitive: "rounded-md bg-black text-white",
    community: "rounded-full bg-[#3d8f65] text-white shadow-lg shadow-[#3d8f65]/10",
  }

  return (
    <section id="aula-experimental" className={cn("px-6 py-24", sectionClasses[templateId])}>
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <h3 className={cn(
          "text-4xl",
          templateId === "traditional" && "uppercase",
          templateId === "competitive" && "uppercase italic",
          (templateId === "modern" || templateId === "community") && "font-semibold"
        )}>
          {title}
          </h3>
          <p className={cn("mt-4 text-lg", templateId === "traditional" ? "text-white/80" : templateId === "competitive" ? "text-black/75" : "text-current/80")}>
          {subtitle}
          </p>
          <button
            type="button"
            className={cn(
              "mt-8 h-14 px-8 text-base font-semibold",
              buttonClasses[templateId],
              templateId === "competitive" && "rounded-2xl shadow-[0_20px_50px_-26px_rgba(0,0,0,0.55)]",
              templateId === "community" && "shadow-[0_20px_40px_-24px_rgba(61,143,101,0.24)]"
            )}
            onClick={onTrialClick}
          >
            {typeof trial.content.ctaText === "string" ? trial.content.ctaText : "Quero agendar"}
          </button>
        </Reveal>
      </div>
    </section>
  )
}

function LocationSection({
  templateId,
  location,
  view,
}: {
  templateId: SiteTemplateId
  location: NonNullable<ReturnType<typeof Array.prototype.find>>
  view: PublicTenantSiteView
}) {
  const title = typeof location.content.title === "string" ? location.content.title : "Localização"
  const address =
    [view.location.street, view.location.number].filter(Boolean).join(", ") || "Atualize a localização da academia."
  const city = [view.location.city, view.location.state].filter(Boolean).join(" - ")
  const mapImageUrl = typeof location.content.mapImageUrl === "string" ? location.content.mapImageUrl : ""
  const mapsQuery = [address, city].filter(Boolean).join(", ")
  const mapsEmbedUrl =
    address && address !== "Atualize a localização da academia."
      ? `https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&z=15&output=embed`
      : null

  const sectionClasses: Record<SiteTemplateId, string> = {
    traditional: "bg-[#222222]",
    modern: "bg-slate-50",
    competitive: "bg-black",
    community: "bg-white",
  }

  return (
    <section id="contato" className={cn("px-6 py-24", sectionClasses[templateId])}>
      <div className="mx-auto max-w-4xl text-center">
        <h3 className={cn(
          "text-4xl",
          templateId === "traditional" && "uppercase text-white",
          templateId === "modern" && "font-semibold tracking-tight text-[#141922]",
          templateId === "competitive" && "uppercase italic text-white",
          templateId === "community" && "font-semibold text-[#21332b]"
        )}>
          {title}
        </h3>
        <div className={cn("mt-5 flex items-center justify-center gap-2", templateId === "traditional" || templateId === "competitive" ? "text-white/70" : "text-slate-500")}>
          <MapPin className="h-4 w-4" />
          <span>{address}</span>
        </div>
        <p className={cn("mt-2", templateId === "traditional" || templateId === "competitive" ? "text-white/60" : "text-slate-500")}>{city}</p>
        <Reveal className={cn(
          "mt-8 aspect-[16/7] w-full border",
          templateId === "traditional" && "border-white/10 bg-[#3a3a3a] shadow-none",
          templateId === "modern" && "rounded-[1.5rem] border-slate-200 bg-white shadow-[0_22px_50px_-28px_rgba(20,25,34,0.14)]",
          templateId === "competitive" && "rounded-md border-white/10 bg-[#242424] shadow-none",
          templateId === "community" && "rounded-[1.6rem] border-[#e6ece8] bg-[#f4f6f4] shadow-none"
        )}>
          {mapsEmbedUrl ? (
            <iframe
              title="Mapa da academia"
              src={mapsEmbedUrl}
              className="h-full w-full rounded-[inherit]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : mapImageUrl ? (
            <img src={mapImageUrl} alt={title} className="h-full w-full rounded-[inherit] object-cover" />
          ) : null}
        </Reveal>
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent([address, city].filter(Boolean).join(", "))}`}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "mt-8 inline-flex h-12 items-center gap-2 px-6 font-semibold",
            templateId === "traditional" && "bg-[#cf2e22] text-white",
            templateId === "modern" && "rounded-2xl bg-[#141922] text-white",
            templateId === "competitive" && "rounded-md bg-[#ffe84f] text-black",
            templateId === "community" && "rounded-full bg-[#3d8f65] text-white"
          )}
        >
          <ExternalLink className="h-4 w-4" />
          Abrir no Google Maps
        </a>
      </div>
    </section>
  )
}

function Reveal({
  children,
  className,
  delayMs = 0,
}: {
  children?: React.ReactNode
  className?: string
  delayMs?: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.18 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0px)" : "translateY(24px)",
        transition: `opacity 600ms ease ${delayMs}ms, transform 600ms ease ${delayMs}ms`,
      }}
    >
      {children}
    </div>
  )
}

function FooterSection({
  templateId,
  view,
}: {
  templateId: SiteTemplateId
  view: PublicTenantSiteView
}) {
  const sectionClasses: Record<SiteTemplateId, string> = {
    traditional: "bg-[#161616] border-t-2 border-[#e11d2f]",
    modern: "bg-[#141922]",
    competitive: "bg-[#111111] border-t-2 border-[#f4e11f]",
    community: "bg-[#0f6a4f]",
  }

  const textClasses: Record<SiteTemplateId, string> = {
    traditional: "text-white/65",
    modern: "text-white/70",
    competitive: "text-white/65",
    community: "text-white/80",
  }

  const titleClasses: Record<SiteTemplateId, string> = {
    traditional: "uppercase text-white",
    modern: "font-semibold text-white",
    competitive: "uppercase italic text-white",
    community: "font-semibold text-white",
  }

  const address = [view.location.street, view.location.number, view.location.city, view.location.state]
    .filter(Boolean)
    .join(", ")

  if (templateId === "traditional") {
    return (
      <footer className="bg-[#151515]">
        <div className="border-b border-white/10 px-6 py-20">
          <div className="mx-auto max-w-6xl text-center">
            <h4 className="text-4xl uppercase text-white">Siga-nos</h4>
            <div className="mt-10 flex items-center justify-center gap-8 text-white/60">
              {[Instagram, Facebook, Youtube, MessageCircle].map((Icon, index) => (
                <span key={index} className="inline-flex h-12 w-12 items-center justify-center">
                  <Icon className="h-10 w-10" />
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t-2 border-[#cf2e22] bg-[#242424] px-6 py-14">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-10 md:grid-cols-3">
              <div>
                <h4 className="text-2xl uppercase text-white">{view.tenant.displayName}</h4>
                <p className="mt-6 text-base text-white/65">Formando campeões dentro e fora dos tatames.</p>
              </div>
              <div>
                <h5 className="text-xl uppercase text-white">Contato</h5>
                <div className="mt-6 space-y-4 text-base text-white/65">
                  {view.profile.phone ? (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5" />
                      <span>{view.profile.phone}</span>
                    </div>
                  ) : null}
                  {view.profile.contactEmail ? (
                    <div className="flex items-center gap-3">
                      <ExternalLink className="h-5 w-5" />
                      <span>{view.profile.contactEmail}</span>
                    </div>
                  ) : null}
                </div>
              </div>
              <div>
                <h5 className="text-xl uppercase text-white">Endereço</h5>
                <div className="mt-6 flex items-start gap-3 text-base text-white/65">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>{address || "Endereço não informado"}</span>
                </div>
              </div>
            </div>
            <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-white/55">
              © 2026 {view.tenant.displayName}. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    )
  }

  if (templateId === "community") {
    return (
      <footer className="bg-white">
        <div className="px-6 py-16">
          <div className="mx-auto max-w-6xl text-center">
            <h4 className="text-4xl font-semibold text-[#21332b]">Siga-nos</h4>
            <div className="mt-8 flex items-center justify-center gap-6 text-slate-500">
              {[Instagram, Facebook, Youtube, MessageCircle].map((Icon, index) => (
                <span key={index} className="inline-flex h-10 w-10 items-center justify-center">
                  <Icon className="h-8 w-8" />
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-[#4a9468] px-6 py-14">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-10 md:grid-cols-3">
              <div>
                <h4 className="text-2xl font-semibold text-white">{view.tenant.displayName}</h4>
                <p className="mt-6 text-base text-white/85">Formando campeões dentro e fora dos tatames.</p>
              </div>
              <div>
                <h5 className="text-xl font-semibold text-white">Contato</h5>
                <div className="mt-6 space-y-4 text-base text-white/85">
                  {view.profile.phone ? (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5" />
                      <span>{view.profile.phone}</span>
                    </div>
                  ) : null}
                  {view.profile.contactEmail ? (
                    <div className="flex items-center gap-3">
                      <ExternalLink className="h-5 w-5" />
                      <span>{view.profile.contactEmail}</span>
                    </div>
                  ) : null}
                </div>
              </div>
              <div>
                <h5 className="text-xl font-semibold text-white">Endereço</h5>
                <div className="mt-6 flex items-start gap-3 text-base text-white/85">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>{address || "Endereço não informado"}</span>
                </div>
              </div>
            </div>
            <div className="mt-12 border-t border-white/40 pt-8 text-center text-sm text-white/80">
              © 2026 {view.tenant.displayName}. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className={cn("px-6 py-12", sectionClasses[templateId])}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 grid gap-8 md:grid-cols-3">
          <div>
            <h4 className={cn("text-xl", titleClasses[templateId])}>{view.tenant.displayName}</h4>
            <p className={cn("mt-4 text-sm", textClasses[templateId])}>
              Formando campeões dentro e fora dos tatames.
            </p>
          </div>
          <div>
            <h5 className={cn("mb-4 text-base", titleClasses[templateId])}>Contato</h5>
            <div className={cn("space-y-2 text-sm", textClasses[templateId])}>
              {view.profile.phone ? <div className="flex items-center gap-2"><Phone className="h-4 w-4" />{view.profile.phone}</div> : null}
            </div>
          </div>
          <div>
            <h5 className={cn("mb-4 text-base", titleClasses[templateId])}>Endereço</h5>
            <div className={cn("flex items-start gap-2 text-sm", textClasses[templateId])}>
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{address || "Endereço não informado"}</span>
            </div>
          </div>
        </div>
        <div className={cn("border-t pt-6 text-center text-xs", textClasses[templateId], templateId === "competitive" ? "border-white/10" : templateId === "modern" ? "border-white/10" : "border-white/20")}>
          © 2026 {view.tenant.displayName}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
