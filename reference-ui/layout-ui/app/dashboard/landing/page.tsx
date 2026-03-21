"use client"

import * as React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  ArrowRight,
  Globe,
  Smartphone,
  CreditCard,
  Users,
  Award,
  Calendar,
  BarChart3,
  Sparkles,
  Star,
  ChevronRight,
  Building2,
  GraduationCap,
  UserCircle,
  Trophy,
  DollarSign,
  Layout,
  Zap,
  Instagram,
  Facebook,
  Youtube,
  ExternalLink,
  Clock,
  AlertCircle,
  TrendingUp,
  Target,
  Wrench,
  Bot,
  MessageSquare,
  Image,
  Send,
  Menu,
  X,
} from "lucide-react"
import Link from "next/link"
import NextImage from "next/image"

// Navbar com scroll suave
function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { label: "Inicio", href: "#inicio" },
    { label: "Problema", href: "#problema" },
    { label: "Solucao", href: "#solucao" },
    { label: "Funcionalidades", href: "#funcionalidades" },
    { label: "Marketing IA", href: "#marketing" },
    { label: "Para quem", href: "#para-quem" },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const targetId = href.replace("#", "")
    const element = document.getElementById(targetId)
    if (element) {
      const navHeight = 80
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo({
        top: elementPosition - navHeight,
        behavior: "smooth"
      })
    }
    setIsMobileMenuOpen(false)
  }, [])

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-zinc-900/95 backdrop-blur-md shadow-lg py-2 sm:py-3"
          : "bg-transparent py-4 sm:py-6"
      )}
    >
      <div className="container px-4 sm:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="#inicio" onClick={(e) => scrollToSection(e, "#inicio")} className="flex items-center gap-2">
            <NextImage
              src="/logo-ligadojo.svg"
              alt="Liga Dojo"
              width={120}
              height={76}
              className="h-8 sm:h-10 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className="px-3 py-2 text-sm text-zinc-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* CTA Buttons - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-white/10">
              Entrar
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Comecar agora
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-zinc-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-zinc-700/50 pt-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.href)}
                  className="px-4 py-3 text-sm text-zinc-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  {item.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-zinc-700/50">
                <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-white/10 justify-start">
                  Entrar
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Comecar agora
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

// Hook para animação de entrada
function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true)
      }
    }, { threshold: 0.1, ...options })

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [options])

  return { ref, isInView }
}

// Componente de animação
function AnimatedSection({ 
  children, 
  className,
  delay = 0 
}: { 
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const { ref, isInView } = useInView()
  
  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isInView 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-8",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// Mock de tela do dashboard animada
function DashboardPreview() {
  const [activeTab, setActiveTab] = useState(0)
  const tabs = ["Dashboard", "App Professor", "App Aluno"]
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % tabs.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full max-w-[600px] mx-auto">
      {/* Janela do navegador mockada */}
      <div className="rounded-xl border bg-card shadow-2xl overflow-hidden">
        {/* Barra do navegador */}
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-muted/50 border-b">
          <div className="flex gap-1 sm:gap-1.5">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500/80" />
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80" />
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-2 sm:px-4 py-1 rounded-md bg-background text-[10px] sm:text-xs text-muted-foreground">
              suaacademia.ligadojo.com.br
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b bg-muted/30">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={cn(
                "flex-1 px-2 sm:px-4 py-2 text-[10px] sm:text-xs font-medium transition-colors",
                activeTab === i 
                  ? "bg-background border-b-2 border-primary text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Conteúdo do dashboard */}
        <div className="p-3 sm:p-4 bg-background min-h-[250px] sm:min-h-[300px]">
          {activeTab === 0 && (
            <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">Dashboard</p>
                  <h3 className="text-xs sm:text-sm font-semibold">Sua academia no controle</h3>
                </div>
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Card className="p-2 sm:p-3 bg-zinc-900 text-white">
                  <p className="text-[8px] sm:text-[9px] text-zinc-400">Alunos ativos</p>
                  <p className="text-lg sm:text-xl font-bold">127</p>
                </Card>
                <Card className="p-2 sm:p-3">
                  <p className="text-[8px] sm:text-[9px] text-muted-foreground">Receita do mes</p>
                  <p className="text-lg sm:text-xl font-bold">R$ 18.5k</p>
                </Card>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-[9px] sm:text-[10px] font-medium">Cobrancas automaticas</p>
                  <p className="text-[8px] sm:text-[9px] text-muted-foreground">Mensalidades rodando sem voce precisar cobrar.</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-[9px] sm:text-[10px] font-medium">Leads novos esta semana</p>
                  <p className="text-[8px] sm:text-[9px] text-muted-foreground">14 interessados captados pelo seu site.</p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 1 && (
            <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">App do Professor</p>
                  <h3 className="text-xs sm:text-sm font-semibold">Agenda do dia</h3>
                </div>
                <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
              </div>
              <Card className="p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-950/30">
                <p className="text-[8px] sm:text-[9px] text-emerald-600 dark:text-emerald-400">Aulas hoje</p>
                <p className="text-lg sm:text-xl font-bold text-emerald-700 dark:text-emerald-300">5 turmas</p>
              </Card>
              <div className="space-y-1">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/20" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] sm:text-[10px] font-medium truncate">Jiu Jitsu Iniciantes - 08:00</p>
                    <p className="text-[8px] sm:text-[9px] text-muted-foreground">12 alunos</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/20" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] sm:text-[10px] font-medium truncate">Muay Thai - 10:00</p>
                    <p className="text-[8px] sm:text-[9px] text-muted-foreground">8 alunos</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 2 && (
            <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">App do Aluno</p>
                  <h3 className="text-xs sm:text-sm font-semibold">Meu progresso</h3>
                </div>
                <UserCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
              </div>
              <Card className="p-2 sm:p-3 bg-amber-50 dark:bg-amber-950/30">
                <p className="text-[8px] sm:text-[9px] text-amber-600 dark:text-amber-400">Plano ativo</p>
                <p className="text-sm sm:text-lg font-bold text-amber-700 dark:text-amber-300">Jiu Jitsu Mensal</p>
              </Card>
              <div className="flex gap-2">
                <div className="flex-1 p-2 rounded-lg bg-muted/50 text-center">
                  <p className="text-base sm:text-lg font-bold">23</p>
                  <p className="text-[8px] sm:text-[9px] text-muted-foreground">Presencas</p>
                </div>
                <div className="flex-1 p-2 rounded-lg bg-muted/50 text-center">
                  <p className="text-base sm:text-lg font-bold">Azul</p>
                  <p className="text-[8px] sm:text-[9px] text-muted-foreground">Faixa</p>
                </div>
                <div className="flex-1 p-2 rounded-lg bg-muted/50 text-center">
                  <p className="text-base sm:text-lg font-bold">2</p>
                  <p className="text-[8px] sm:text-[9px] text-muted-foreground">Titulos</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Indicadores de tab */}
      <div className="flex justify-center gap-2 mt-3 sm:mt-4">
        {tabs.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              activeTab === i ? "bg-primary w-5 sm:w-6" : "bg-muted-foreground/30"
            )}
          />
        ))}
      </div>
    </div>
  )
}

// Contador animado
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const { ref, isInView } = useInView()
  
  useEffect(() => {
    if (isInView && count === 0) {
      const duration = 2000
      const steps = 60
      const increment = target / steps
      let current = 0
      
      const timer = setInterval(() => {
        current += increment
        if (current >= target) {
          setCount(target)
          clearInterval(timer)
        } else {
          setCount(Math.floor(current))
        }
      }, duration / steps)
      
      return () => clearInterval(timer)
    }
  }, [isInView, target, count])
  
  return <span ref={ref}>{count}{suffix}</span>
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section id="inicio" className="relative min-h-screen flex items-center pt-20">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-emerald-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="container relative z-10 px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left content */}
            <div className="space-y-6 sm:space-y-8">
              <AnimatedSection>
                <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
                  <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  Feito para academias de luta
                </Badge>
              </AnimatedSection>
              
              <AnimatedSection delay={100}>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance">
                  Sua academia pronta para crescer como uma marca profissional
                </h1>
              </AnimatedSection>
              
              <AnimatedSection delay={200}>
                <p className="text-base sm:text-lg text-zinc-400 max-w-xl text-pretty">
                  Voce nao abriu sua academia para ficar cobrando mensalidade, organizando planilha e respondendo mensagem o dia inteiro. E hora de colocar a operacao em ordem.
                </p>
              </AnimatedSection>
              
              <AnimatedSection delay={300}>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">
                    Comecar agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 w-full sm:w-auto">
                    Ver como funciona
                  </Button>
                </div>
              </AnimatedSection>
              
              <AnimatedSection delay={400}>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6 text-xs sm:text-sm text-zinc-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Site + App + Gestao + Marketing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Sem complicacao</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Comece em minutos</span>
                  </div>
                </div>
              </AnimatedSection>
            </div>
            
            {/* Right content - Dashboard Preview */}
            <AnimatedSection delay={500} className="lg:pl-4 xl:pl-8">
              <DashboardPreview />
            </AnimatedSection>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
          <div className="w-6 h-10 rounded-full border-2 border-zinc-600 flex justify-center pt-2">
            <div className="w-1 h-2 bg-zinc-600 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Problema - Identificacao */}
      <section id="problema" className="py-16 sm:py-24 bg-gradient-to-b from-stone-100 to-white dark:from-zinc-900 dark:to-zinc-950">
        <div className="container px-4 sm:px-6">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-16">
              <p className="text-xs sm:text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3 sm:mb-4">O problema</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-balance">
                Enquanto voce ensina no tatame, o resto do negocio fica travado
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                Mas hoje... e isso que mais consome seu tempo.
              </p>
            </div>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                icon: DollarSign,
                title: "Alunos esquecem de pagar",
                description: "Voce fica correndo atras de pagamento em vez de focar no que importa.",
                color: "bg-red-100 dark:bg-red-900/30",
                iconColor: "text-red-600",
              },
              {
                icon: Clock,
                title: "Leads perdem o timing",
                description: "Interessados chegam e voce perde a oportunidade por nao responder rapido.",
                color: "bg-orange-100 dark:bg-orange-900/30",
                iconColor: "text-orange-600",
              },
              {
                icon: Instagram,
                title: "Redes sociais paradas",
                description: "Sem tempo para criar conteudo, suas redes ficam abandonadas.",
                color: "bg-pink-100 dark:bg-pink-900/30",
                iconColor: "text-pink-600",
              },
              {
                icon: AlertCircle,
                title: "Organizacao vira improviso",
                description: "Planilhas espalhadas, informacoes perdidas, tudo no achismo.",
                color: "bg-amber-100 dark:bg-amber-900/30",
                iconColor: "text-amber-600",
              },
            ].map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 100}>
                <Card className={cn("p-4 sm:p-6 h-full border-0", item.color)}>
                  <div className={cn("h-10 w-10 sm:h-12 sm:w-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4 bg-white/50 dark:bg-black/20")}>
                    <item.icon className={cn("h-5 w-5 sm:h-6 sm:w-6", item.iconColor)} />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
                </Card>
              </AnimatedSection>
            ))}
          </div>
          
          <AnimatedSection delay={500}>
            <p className="text-center text-base sm:text-lg font-medium text-muted-foreground mt-8 sm:mt-12">
              E o pior: <span className="text-foreground">voce sabe que poderia estar maior.</span>
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Solucao */}
      <section id="solucao" className="py-16 sm:py-24 bg-zinc-900 text-white">
        <div className="container px-4 sm:px-6">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-16">
              <p className="text-xs sm:text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3 sm:mb-4">A solucao</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-balance">
                Transforme sua academia em um negocio estruturado, automatizado e escalavel
              </h2>
              <p className="text-base sm:text-lg text-zinc-400">
                Com a nossa plataforma, voce cria em minutos tudo que precisa para profissionalizar sua academia.
              </p>
            </div>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: Globe, title: "Seu site profissional", check: true },
              { icon: Smartphone, title: "Seu aplicativo com sua marca", check: true },
              { icon: Layout, title: "Seu sistema completo de gestao", check: true },
              { icon: Sparkles, title: "Seu marketing automatico", check: true },
            ].map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 100}>
                <Card className="p-4 sm:p-6 bg-zinc-800 border-zinc-700 h-full">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-emerald-600/20 flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      </div>
                      <h3 className="font-semibold text-sm sm:text-base text-white">{item.title}</h3>
                    </div>
                  </div>
                </Card>
              </AnimatedSection>
            ))}
          </div>
          
          <AnimatedSection delay={500}>
            <p className="text-center text-sm sm:text-base text-emerald-400 mt-8 sm:mt-12 font-medium">
              Tudo integrado. Tudo pensado para academias de luta.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Feature 1 - Site */}
      <section className="py-16 sm:py-24 bg-white dark:bg-zinc-950">
        <div className="container px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <AnimatedSection>
              <div className="space-y-4 sm:space-y-6">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">
                  Seu site que realmente traz alunos
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground">
                  Pare de depender so do Instagram. Tenha um canal proprio que trabalha por voce todos os dias.
                </p>
                <ul className="space-y-3 sm:space-y-4">
                  {[
                    "Site profissional com sua identidade",
                    "Pagina de modalidades, horarios e equipe",
                    "Captacao automatica de interessados",
                    "Leads entrando direto no seu sistema",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 sm:gap-3">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
            
            <AnimatedSection delay={200}>
              <Card className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-0">
                {/* Browser window mockup */}
                <div className="w-full max-w-lg mx-auto rounded-xl bg-zinc-800 shadow-2xl overflow-hidden">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-zinc-700/80">
                    <div className="flex gap-1.5 sm:gap-2">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500" />
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="flex items-center gap-2 px-2 sm:px-4 py-1 sm:py-1.5 rounded-md bg-zinc-600 text-[10px] sm:text-xs text-zinc-300 max-w-[200px] sm:max-w-none truncate">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400 shrink-0">
                          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                        </div>
                        <span className="truncate">suaacademia.ligadojo.com.br</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Website content */}
                  <div className="bg-zinc-900">
                    {/* Hero section */}
                    <div className="relative h-36 sm:h-44 md:h-52 bg-gradient-to-br from-zinc-800 via-zinc-900 to-emerald-950 overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/30 via-transparent to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
                        <div className="text-center space-y-2 sm:space-y-3">
                          <div className="flex justify-center">
                            <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-lg bg-emerald-600 flex items-center justify-center">
                              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
                            </div>
                          </div>
                          <h3 className="text-white font-bold text-sm sm:text-base md:text-lg">ELITE FIGHT ACADEMY</h3>
                          <p className="text-emerald-400 text-[10px] sm:text-xs md:text-sm">Jiu Jitsu | Muay Thai | MMA</p>
                          <div className="flex justify-center gap-2 pt-1 sm:pt-2">
                            <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-emerald-600 text-white text-[9px] sm:text-[10px] md:text-xs rounded-full font-medium">AGENDE SUA AULA</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Navigation */}
                    <div className="flex justify-center gap-2 sm:gap-4 md:gap-6 py-2 sm:py-3 bg-zinc-800/50 text-[9px] sm:text-[11px] md:text-xs text-zinc-400">
                      <span className="text-emerald-400">Inicio</span>
                      <span className="hidden xs:inline">Modalidades</span>
                      <span>Horarios</span>
                      <span>Equipe</span>
                      <span>Contato</span>
                    </div>
                    
                    {/* Content */}
                    <div className="p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4">
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <div className="text-center p-2 sm:p-3 bg-zinc-800 rounded-lg">
                          <p className="text-emerald-400 font-bold text-base sm:text-lg md:text-xl">12+</p>
                          <p className="text-[8px] sm:text-[10px] md:text-xs text-zinc-500">Anos</p>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-zinc-800 rounded-lg">
                          <p className="text-emerald-400 font-bold text-base sm:text-lg md:text-xl">200+</p>
                          <p className="text-[8px] sm:text-[10px] md:text-xs text-zinc-500">Alunos</p>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-zinc-800 rounded-lg">
                          <p className="text-emerald-400 font-bold text-base sm:text-lg md:text-xl">50+</p>
                          <p className="text-[8px] sm:text-[10px] md:text-xs text-zinc-500">Titulos</p>
                        </div>
                      </div>
                      
                      {/* Modalidades */}
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <div className="aspect-square rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-800 flex flex-col items-center justify-center p-2 sm:p-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-emerald-600/30 flex items-center justify-center mb-1 sm:mb-2">
                            <Award className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-emerald-400" />
                          </div>
                          <span className="text-[8px] sm:text-[10px] md:text-xs text-white font-medium">Jiu Jitsu</span>
                        </div>
                        <div className="aspect-square rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-800 flex flex-col items-center justify-center p-2 sm:p-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-amber-600/30 flex items-center justify-center mb-1 sm:mb-2">
                            <Zap className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-amber-400" />
                          </div>
                          <span className="text-[8px] sm:text-[10px] md:text-xs text-white font-medium">Muay Thai</span>
                        </div>
                        <div className="aspect-square rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-800 flex flex-col items-center justify-center p-2 sm:p-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-red-600/30 flex items-center justify-center mb-1 sm:mb-2">
                            <Trophy className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-red-400" />
                          </div>
                          <span className="text-[8px] sm:text-[10px] md:text-xs text-white font-medium">MMA</span>
                        </div>
                      </div>
                      
                      {/* CTA */}
                      <div className="p-3 sm:p-4 bg-emerald-600 rounded-lg text-center">
                        <p className="text-white font-semibold text-[10px] sm:text-xs md:text-sm">QUERO CONHECER A ACADEMIA</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Feature 2 - App */}
      <section className="py-16 sm:py-24 bg-stone-100 dark:bg-zinc-900">
        <div className="container px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <AnimatedSection delay={200} className="order-2 lg:order-1">
              <Card className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border-0">
                <div className="flex justify-center">
                  {/* Phone mockup - App do Aluno */}
                  <div className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] rounded-[32px] sm:rounded-[40px] bg-zinc-900 shadow-2xl overflow-hidden border-4 sm:border-[6px] border-zinc-700 relative">
                    {/* Phone notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-28 md:w-32 h-6 sm:h-7 md:h-8 bg-zinc-900 rounded-b-2xl z-10 flex items-center justify-center">
                      <div className="w-12 sm:w-14 md:w-16 h-1.5 sm:h-2 bg-zinc-800 rounded-full" />
                    </div>
                    
                    {/* App content */}
                    <div className="pt-7 sm:pt-8 md:pt-9 bg-gradient-to-b from-zinc-800 to-zinc-900">
                      {/* Header com logo */}
                      <div className="px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-xl bg-amber-500 flex items-center justify-center">
                            <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-[10px] sm:text-xs text-zinc-400">Bem-vindo</p>
                            <p className="text-xs sm:text-sm md:text-base text-white font-semibold">Elite Fight</p>
                          </div>
                        </div>
                        <div className="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 rounded-full bg-zinc-700 flex items-center justify-center">
                          <UserCircle className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-400" />
                        </div>
                      </div>
                      
                      {/* User card */}
                      <div className="mx-4 sm:mx-5 mt-2 sm:mt-3 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="h-11 w-11 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-white font-bold text-sm sm:text-base md:text-lg">RC</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-xs sm:text-sm md:text-base truncate">Rafael Costa</p>
                            <p className="text-amber-100 text-[10px] sm:text-xs">Faixa Azul - Jiu Jitsu</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-white font-bold text-base sm:text-lg md:text-xl">47</p>
                            <p className="text-amber-100 text-[8px] sm:text-[10px]">presencas</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Quick stats */}
                      <div className="grid grid-cols-3 gap-2 sm:gap-3 px-4 sm:px-5 mt-4 sm:mt-5">
                        <div className="text-center p-2 sm:p-3 bg-zinc-800 rounded-xl">
                          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 mx-auto mb-1 sm:mb-2" />
                          <p className="text-[8px] sm:text-[10px] text-zinc-400">Proxima aula</p>
                          <p className="text-[10px] sm:text-xs md:text-sm text-white font-medium">18:00</p>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-zinc-800 rounded-xl">
                          <Award className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 mx-auto mb-1 sm:mb-2" />
                          <p className="text-[8px] sm:text-[10px] text-zinc-400">Graduacao</p>
                          <p className="text-[10px] sm:text-xs md:text-sm text-white font-medium">15 dias</p>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-zinc-800 rounded-xl">
                          <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-sky-400 mx-auto mb-1 sm:mb-2" />
                          <p className="text-[8px] sm:text-[10px] text-zinc-400">Ranking</p>
                          <p className="text-[10px] sm:text-xs md:text-sm text-white font-medium">#12</p>
                        </div>
                      </div>
                      
                      {/* Menu items */}
                      <div className="px-4 sm:px-5 mt-4 sm:mt-5 space-y-2 sm:space-y-3 pb-4 sm:pb-5">
                        <div className="flex items-center gap-3 p-3 sm:p-4 bg-zinc-800/50 rounded-xl">
                          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-emerald-600/20 flex items-center justify-center shrink-0">
                            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
                          </div>
                          <span className="text-[10px] sm:text-xs md:text-sm text-white flex-1">Agendar Aula</span>
                          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-600" />
                        </div>
                        <div className="flex items-center gap-3 p-3 sm:p-4 bg-zinc-800/50 rounded-xl">
                          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-amber-600/20 flex items-center justify-center shrink-0">
                            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                          </div>
                          <span className="text-[10px] sm:text-xs md:text-sm text-white flex-1">Meu Plano</span>
                          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-600" />
                        </div>
                      </div>
                      
                      {/* Bottom nav */}
                      <div className="flex justify-around py-3 sm:py-4 bg-zinc-800 border-t border-zinc-700">
                        <div className="flex flex-col items-center">
                          <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />
                          <span className="text-[8px] sm:text-[10px] text-amber-400 mt-1">Inicio</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-500" />
                          <span className="text-[8px] sm:text-[10px] text-zinc-500 mt-1">Agenda</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Award className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-500" />
                          <span className="text-[8px] sm:text-[10px] text-zinc-500 mt-1">Graduacao</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <UserCircle className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-500" />
                          <span className="text-[8px] sm:text-[10px] text-zinc-500 mt-1">Perfil</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </AnimatedSection>
            
            <AnimatedSection className="order-1 lg:order-2">
              <div className="space-y-4 sm:space-y-6">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">
                  Seu app personalizado com sua marca
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground">
                  Sua academia deixa de ser "mais uma" e vira uma marca. Experiencia profissional que aumenta retencao.
                </p>
                <ul className="space-y-3 sm:space-y-4">
                  {[
                    "App com sua logo",
                    "Area do aluno completa",
                    "Presenca, graduacoes e planos",
                    "Comunicacao direta",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 sm:gap-3">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Feature 3 - Cobranca */}
      <section className="py-16 sm:py-24 bg-white dark:bg-zinc-950">
        <div className="container px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <AnimatedSection>
              <div className="space-y-4 sm:space-y-6">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-sky-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">
                  Cobranca automatica e controle financeiro total
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground">
                  Chega de correr atras de pagamento. Mais previsibilidade, menos dor de cabeca.
                </p>
                <ul className="space-y-3 sm:space-y-4">
                  {[
                    "Mensalidades automatizadas",
                    "Links de pagamento inteligentes",
                    "Controle de inadimplencia",
                    "Visao clara do seu faturamento",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 sm:gap-3">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-sky-500 shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
            
            <AnimatedSection delay={200}>
              <Card className="p-4 sm:p-6 bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-950/30 dark:to-sky-900/20 border-0">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-zinc-800 rounded-lg shadow">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-xs sm:text-sm truncate">Mensalidade Jiu Jitsu</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Pago automaticamente</p>
                      </div>
                    </div>
                    <span className="text-emerald-600 font-bold text-sm sm:text-base shrink-0">R$ 180</span>
                  </div>
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-zinc-800 rounded-lg shadow">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-xs sm:text-sm truncate">Mensalidade Muay Thai</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Pago automaticamente</p>
                      </div>
                    </div>
                    <span className="text-emerald-600 font-bold text-sm sm:text-base shrink-0">R$ 150</span>
                  </div>
                  <div className="p-3 sm:p-4 bg-sky-600 text-white rounded-lg">
                    <p className="text-[10px] sm:text-xs opacity-80">Total recebido este mes</p>
                    <p className="text-xl sm:text-2xl font-bold">R$ 18.540</p>
                  </div>
                </div>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Mais funcionalidades */}
      <section id="funcionalidades" className="py-16 sm:py-24 bg-stone-100 dark:bg-zinc-900">
        <div className="container px-4 sm:px-6">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
              <p className="text-xs sm:text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-3 sm:mb-4">Tudo que voce precisa</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                Um sistema completo para sua academia
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                Gestao de alunos, graduacoes, eventos e muito mais.
              </p>
            </div>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Users,
                title: "Gestao completa dos alunos",
                description: "Cadastro completo, controle de presenca, historico individual, gestao por turmas.",
              },
              {
                icon: Award,
                title: "Sistema de graduacao",
                description: "Registro de faixas, historico de evolucao, organizacao por nivel. Mais engajamento e retencao.",
              },
              {
                icon: Calendar,
                title: "Eventos e seminarios",
                description: "Crie eventos com facilidade, gerencie inscricoes, divulgue para alunos. Mais faturamento.",
              },
              {
                icon: BarChart3,
                title: "CRM de leads",
                description: "Leads captados direto do site, organizacao automatica. Quem demonstrou interesse nao se perde.",
              },
              {
                icon: GraduationCap,
                title: "App do professor",
                description: "Agenda do dia, lista de alunos, chamada digital. Tudo na mao de quem ensina.",
              },
              {
                icon: Trophy,
                title: "Ranking e titulos",
                description: "Acompanhe competicoes, registre titulos, valorize seus atletas.",
              },
            ].map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 100}>
                <Card className="p-4 sm:p-6 h-full hover:shadow-lg transition-shadow">
                  <item.icon className="h-7 w-7 sm:h-8 sm:w-8 text-emerald-600 mb-3 sm:mb-4" />
                  <h3 className="font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Marketing com IA */}
      <section id="marketing" className="py-16 sm:py-24 bg-gradient-to-br from-zinc-900 via-zinc-800 to-emerald-950 text-white">
        <div className="container px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <AnimatedSection>
              <div className="space-y-4 sm:space-y-6">
                <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-500/30 text-xs sm:text-sm">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  Diferencial exclusivo
                </Badge>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">
                  Marketing automatico com Inteligencia Artificial
                </h2>
                <p className="text-base sm:text-lg text-zinc-400">
                  Aqui esta o diferencial que muda o jogo. Sua academia passa a ter um time de marketing rodando sozinho.
                </p>
                <ul className="space-y-3 sm:space-y-4">
                  {[
                    "Artes prontas para redes sociais",
                    "Legendas persuasivas",
                    "Conteudos personalizados com sua marca",
                    "Ideias de posts que geram engajamento",
                    "Agendamento automatico",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 sm:gap-3">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base text-zinc-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs sm:text-sm text-emerald-400 font-medium">
                  Em minutos, voce cria semanas de conteudo.
                </p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection delay={200}>
              <Card className="p-4 sm:p-6 bg-zinc-800/50 border-zinc-700">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-400" />
                    <div>
                      <p className="font-semibold text-sm sm:text-base">Assistente de Marketing</p>
                      <p className="text-[10px] sm:text-xs text-zinc-400">Criando conteudo para sua academia...</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="aspect-square bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-lg flex items-center justify-center">
                      <Image className="h-6 w-6 sm:h-8 sm:w-8 text-white/80" />
                    </div>
                    <div className="aspect-square bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center">
                      <Image className="h-6 w-6 sm:h-8 sm:w-8 text-white/80" />
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 bg-zinc-700/50 rounded-lg">
                    <p className="text-[10px] sm:text-xs text-zinc-400 mb-1">Legenda gerada:</p>
                    <p className="text-xs sm:text-sm text-zinc-200">"O tatame e onde voce descobre do que e feito. Venha treinar com a gente!"</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm h-8 sm:h-9">
                      <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Publicar
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 border-zinc-600 text-xs sm:text-sm h-8 sm:h-9">
                      Agendar
                    </Button>
                  </div>
                </div>
              </Card>
            </AnimatedSection>
          </div>
          
          <AnimatedSection delay={400}>
            <Card className="mt-10 sm:mt-16 p-4 sm:p-8 bg-zinc-800/50 border-zinc-700 text-center">
              <Bot className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold mb-2">Como se voce tivesse um social media 24h trabalhando pra voce</h3>
              <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
                O sistema entende sua academia e cria conteudos baseados em seu publico, seu estilo e o que mais atrai alunos. Voce foca no tatame. O marketing roda sozinho.
              </p>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      {/* Numeros */}
      <section className="py-16 sm:py-24 bg-white dark:bg-zinc-950">
        <div className="container px-4 sm:px-6">
          <AnimatedSection>
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                O que acontece quando voce usa tudo isso junto?
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                Voce sai do improviso e entra no controle.
              </p>
            </div>
          </AnimatedSection>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {[
              { value: 95, suffix: "%", label: "Reducao no tempo administrativo", color: "text-emerald-600" },
              { value: 40, suffix: "%", label: "Aumento na retencao de alunos", color: "text-sky-600" },
              { value: 3, suffix: "x", label: "Mais leads convertidos", color: "text-amber-600" },
              { value: 100, suffix: "%", label: "Controle sobre a operacao", color: "text-emerald-600" },
            ].map((item, i) => (
              <AnimatedSection key={item.label} delay={i * 100}>
                <Card className="p-4 sm:p-6 text-center h-full">
                  <p className={cn("text-3xl sm:text-4xl md:text-5xl font-bold mb-2", item.color)}>
                    <AnimatedCounter target={item.value} suffix={item.suffix} />
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{item.label}</p>
                </Card>
              </AnimatedSection>
            ))}
          </div>
          
          <AnimatedSection delay={500}>
            <div className="mt-10 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                "Mais alunos entrando",
                "Mais retencao",
                "Mais organizacao",
                "Mais autoridade no mercado",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-sm sm:text-base font-medium text-muted-foreground mt-6 sm:mt-8">
              Sua academia vira um <span className="text-foreground">negocio profissional de verdade.</span>
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Para quem e */}
      <section id="para-quem" className="py-16 sm:py-24 bg-stone-100 dark:bg-zinc-900">
        <div className="container px-4 sm:px-6">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
              <p className="text-xs sm:text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3 sm:mb-4">Para quem e</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                Feito para a realidade das academias de luta
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                Nao e um sistema generico. Foi pensado especificamente para quem vive o dia a dia do tatame.
              </p>
            </div>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Target,
                title: "Quem esta comecando",
                description: "Comece ja com estrutura profissional desde o primeiro aluno.",
              },
              {
                icon: TrendingUp,
                title: "Academias em expansao",
                description: "Escale sua operacao sem perder o controle do negocio.",
              },
              {
                icon: Trophy,
                title: "Equipes competitivas",
                description: "Gerencie atletas, titulos e prepare sua equipe para crescer.",
              },
            ].map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 100}>
                <Card className="p-4 sm:p-6 h-full text-center">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <item.icon className="h-6 w-6 sm:h-7 sm:w-7 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-emerald-600 to-emerald-800">
        <div className="container px-4 sm:px-6">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto text-center text-white">
              <Badge className="bg-white/20 text-white border-white/30 mb-4 sm:mb-6 text-xs sm:text-sm">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Comece em minutos
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-balance">
                Crie agora o sistema completo da sua academia
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-emerald-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Site + App + Gestao + Marketing automatico. Sem complicacao. Sem precisar de equipe tecnica. Sem dor de cabeca.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 w-full sm:w-auto text-sm sm:text-base">
                  Comecar agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 w-full sm:w-auto text-sm sm:text-base">
                  Ja tenho conta
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 bg-zinc-900 text-white border-t border-zinc-800">
        <div className="container px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <NextImage
                src="/logo-ligadojo.svg"
                alt="Liga Dojo"
                width={100}
                height={63}
                className="h-8 w-auto"
              />
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 text-center">
              2024 Liga Dojo. Plataforma para academias de luta.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
              <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
              <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
                <Youtube className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
