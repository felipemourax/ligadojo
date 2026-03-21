"use client"

import { useState } from "react"
import { 
  Target, 
  LayoutTemplate, 
  ImageIcon, 
  Sparkles,
  Users,
  Calendar,
  Baby,
  Clock,
  TrendingUp,
  Film,
  Instagram,
  Grid3X3,
  Square,
  Check,
  Copy,
  RefreshCw,
  Download,
  Wand2,
  FolderOpen,
  Library,
  Loader2,
  AlertCircle
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ContentObjective, ContentFormat, ContentTone, GeneratedContent } from "../types"

const objectives = [
  { 
    id: "attract" as ContentObjective, 
    label: "Atrair novos alunos", 
    description: "Campanhas de matricula e descoberta.", 
    icon: Users 
  },
  { 
    id: "training" as ContentObjective, 
    label: "Mostrar treino", 
    description: "Apresente rotina, intensidade e ambiente.", 
    icon: Target 
  },
  { 
    id: "evolution" as ContentObjective, 
    label: "Mostrar evolucao", 
    description: "Conquistas e progresso dos alunos.", 
    icon: TrendingUp 
  },
  { 
    id: "event" as ContentObjective, 
    label: "Promover evento", 
    description: "Divulgue seminarios e campeonatos.", 
    icon: Calendar 
  },
  { 
    id: "kids" as ContentObjective, 
    label: "Promover turma kids", 
    description: "Atraia pais e alunos infantis.", 
    icon: Baby 
  },
  { 
    id: "trial" as ContentObjective, 
    label: "Aula experimental", 
    description: "Convide para testar a academia.", 
    icon: Clock 
  },
]

const formats = [
  { 
    id: "post" as ContentFormat, 
    label: "Post", 
    description: "Imagem unica com CTA direto.", 
    icon: Square 
  },
  { 
    id: "story" as ContentFormat, 
    label: "Story", 
    description: "Mensagem curta e vertical.", 
    icon: Instagram 
  },
  { 
    id: "carousel" as ContentFormat, 
    label: "Carrossel", 
    description: "Narrativa em multiplas telas.", 
    icon: Grid3X3 
  },
  { 
    id: "reels" as ContentFormat, 
    label: "Reels", 
    description: "Roteiro para video vertical.", 
    icon: Film 
  },
]

const tones = [
  { id: "professional" as ContentTone, label: "Profissional" },
  { id: "casual" as ContentTone, label: "Casual" },
  { id: "inspiring" as ContentTone, label: "Inspirador" },
  { id: "urgent" as ContentTone, label: "Urgente" },
]

type MaterialSource = "library" | "ai" | "template"

const mockMaterials = [
  { id: "logo", name: "Alliance Logo", category: "Logotipo", selected: false },
  { id: "equipe", name: "Alliance Equipe", category: "Equipe", selected: false },
  { id: "professor", name: "Alliance Faixa Preta", category: "Professor", selected: false },
]

const mockSavedTemplates = [
  { id: "1", name: "Matriculas Abertas", preview: "Template para campanha de matriculas", format: "post" },
  { id: "2", name: "Aula Experimental", preview: "Convite para primeira aula", format: "story" },
  { id: "3", name: "Evento Seminario", preview: "Divulgacao de seminarios", format: "post" },
]

const mockGeneratedContent: GeneratedContent = {
  title: "Matriculas abertas para novos alunos",
  caption: "Conheca a metodologia da academia e venha treinar com acompanhamento de verdade.\n\nAgende sua primeira visita.",
  hashtags: ["#academia", "#artesmarciais", "#novosalunos", "#treino", "#disciplina"],
}

export function CreateContentTab() {
  const [step, setStep] = useState(1)
  const [objective, setObjective] = useState<ContentObjective | null>(null)
  const [format, setFormat] = useState<ContentFormat | null>(null)
  
  // Step 3 - Material Source
  const [materialSource, setMaterialSource] = useState<MaterialSource | null>(null)
  const [selectedMaterials, setSelectedMaterials] = useState<Set<string>>(new Set())
  const [selectedSavedTemplate, setSelectedSavedTemplate] = useState<string | null>(null)
  const [tone, setTone] = useState<ContentTone | null>(null)
  const [cta, setCta] = useState("")
  const [additionalInstructions, setAdditionalInstructions] = useState("")
  
  // Step 4 - Result
  const [isGeneratingText, setIsGeneratingText] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [imageGenerated, setImageGenerated] = useState(false)

  const steps = [
    { number: 1, title: "Objetivo", description: "Intencao do conteudo" },
    { number: 2, title: "Formato", description: "Tipo de publicacao" },
    { number: 3, title: "Composicao", description: "Materiais e ajustes" },
    { number: 4, title: "Resultado", description: "Gerar e baixar" },
  ]

  const canProceed = () => {
    switch (step) {
      case 1: return objective !== null
      case 2: return format !== null
      case 3: return materialSource !== null
      default: return false
    }
  }

  const handleNext = () => {
    if (step === 3) {
      setIsGeneratingText(true)
      setTimeout(() => {
        setGeneratedContent(mockGeneratedContent)
        setIsGeneratingText(false)
        setImageGenerated(false)
        setStep(4)
      }, 1500)
    } else {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const toggleMaterial = (id: string) => {
    setSelectedMaterials(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleGenerateImage = () => {
    setIsGeneratingImage(true)
    setTimeout(() => {
      setIsGeneratingImage(false)
      setImageGenerated(true)
    }, 2000)
  }

  const regenerateContent = () => {
    setIsGeneratingText(true)
    setImageGenerated(false)
    setTimeout(() => {
      setGeneratedContent({
        ...mockGeneratedContent,
        title: mockGeneratedContent.title + " (v2)",
      })
      setIsGeneratingText(false)
    }, 1000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const resetFlow = () => {
    setStep(1)
    setObjective(null)
    setFormat(null)
    setMaterialSource(null)
    setSelectedMaterials(new Set())
    setSelectedSavedTemplate(null)
    setTone(null)
    setCta("")
    setAdditionalInstructions("")
    setGeneratedContent(null)
    setImageGenerated(false)
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps - Compact */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl p-2">
        {steps.map((s, index) => (
          <div key={s.number} className="flex items-center flex-1">
            <button
              onClick={() => step > s.number && setStep(s.number)}
              disabled={step < s.number}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg transition-all flex-1",
                step === s.number && "bg-primary/10",
                step > s.number && "cursor-pointer hover:bg-muted"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  step === s.number
                    ? "bg-primary text-primary-foreground"
                    : step > s.number
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {step > s.number ? <Check className="h-3.5 w-3.5" /> : s.number}
              </div>
              <div className="hidden md:block text-left">
                <p className={cn(
                  "text-sm font-medium",
                  step >= s.number ? "text-foreground" : "text-muted-foreground"
                )}>
                  {s.title}
                </p>
              </div>
            </button>
            {index < steps.length - 1 && (
              <div className={cn(
                "hidden sm:block w-8 h-px mx-1",
                step > s.number ? "bg-primary/30" : "bg-border"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          {/* Step 1: Objective */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Qual o objetivo do conteudo?</h3>
                <p className="text-sm text-muted-foreground">
                  Escolha a intencao principal antes de continuar.
                </p>
              </div>
              
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {objectives.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => setObjective(obj.id)}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-xl border text-left transition-all hover:border-primary/50",
                      objective === obj.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-background"
                    )}
                  >
                    <div className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      objective === obj.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}>
                      <obj.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm">{obj.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{obj.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Format */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Qual o formato?</h3>
                <p className="text-sm text-muted-foreground">
                  Escolha o tipo de publicacao que deseja criar.
                </p>
              </div>
              
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {formats.map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setFormat(fmt.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-5 rounded-xl border text-center transition-all hover:border-primary/50",
                      format === fmt.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-background"
                    )}
                  >
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl",
                      format === fmt.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}>
                      <fmt.icon className="h-6 w-6" />
                    </div>
                    <p className="font-medium text-foreground">{fmt.label}</p>
                    <p className="text-xs text-muted-foreground">{fmt.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Composition - Material Source */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Como deseja criar o conteudo?</h3>
                <p className="text-sm text-muted-foreground">
                  Escolha a fonte dos materiais visuais para a composicao.
                </p>
              </div>

              {/* Material Source Options */}
              <div className="grid gap-4 sm:grid-cols-3">
                <button
                  onClick={() => setMaterialSource("library")}
                  className={cn(
                    "flex flex-col items-center gap-3 p-6 rounded-xl border text-center transition-all hover:border-primary/50",
                    materialSource === "library"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-background"
                  )}
                >
                  <div className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-xl",
                    materialSource === "library"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}>
                    <FolderOpen className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Minha biblioteca</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Usar fotos e logo cadastrados na identidade visual
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setMaterialSource("ai")}
                  className={cn(
                    "flex flex-col items-center gap-3 p-6 rounded-xl border text-center transition-all hover:border-primary/50",
                    materialSource === "ai"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-background"
                  )}
                >
                  <div className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-xl",
                    materialSource === "ai"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}>
                    <Wand2 className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Gerar com IA</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Deixar a IA criar a imagem do zero com suas cores
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setMaterialSource("template")}
                  className={cn(
                    "flex flex-col items-center gap-3 p-6 rounded-xl border text-center transition-all hover:border-primary/50",
                    materialSource === "template"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-background"
                  )}
                >
                  <div className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-xl",
                    materialSource === "template"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}>
                    <Library className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Usar template salvo</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Escolher um modelo que voce ja salvou antes
                    </p>
                  </div>
                </button>
              </div>

              {/* Conditional Content Based on Source */}
              {materialSource === "library" && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Selecione os materiais</h4>
                      <p className="text-xs text-muted-foreground">
                        Escolha quais fotos e logo usar na composicao
                      </p>
                    </div>
                    <Badge variant="outline">{selectedMaterials.size} selecionado(s)</Badge>
                  </div>
                  
                  <div className="grid gap-3 sm:grid-cols-3">
                    {mockMaterials.map((material) => (
                      <button
                        key={material.id}
                        onClick={() => toggleMaterial(material.id)}
                        className={cn(
                          "relative aspect-square rounded-xl border overflow-hidden transition-all",
                          selectedMaterials.has(material.id)
                            ? "border-primary ring-2 ring-primary"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="absolute inset-0 bg-muted flex items-center justify-center">
                          <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <p className="text-sm font-medium text-white">{material.name}</p>
                          <p className="text-xs text-white/70">{material.category}</p>
                        </div>
                        {selectedMaterials.has(material.id) && (
                          <div className="absolute top-2 right-2 h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {materialSource === "ai" && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Geracao automatica</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          A IA vai criar uma imagem original usando suas cores e tipografia. Voce podera ajustar o resultado depois.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {materialSource === "template" && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div>
                    <h4 className="font-medium text-foreground">Escolha um template salvo</h4>
                    <p className="text-xs text-muted-foreground">
                      Templates que voce salvou anteriormente
                    </p>
                  </div>
                  
                  <div className="grid gap-3 sm:grid-cols-3">
                    {mockSavedTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedSavedTemplate(template.id)}
                        className={cn(
                          "flex flex-col gap-2 p-4 rounded-xl border text-left transition-all hover:border-primary/50",
                          selectedSavedTemplate === template.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border bg-background"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground text-sm">{template.name}</p>
                          <Badge variant="outline" className="text-[10px]">{template.format}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{template.preview}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tone & CTA - Always visible when source is selected */}
              {materialSource && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Tom do conteudo</Label>
                      <Select value={tone || ""} onValueChange={(v) => setTone(v as ContentTone)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tom" />
                        </SelectTrigger>
                        <SelectContent>
                          {tones.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>CTA principal</Label>
                      <Input 
                        value={cta}
                        onChange={(e) => setCta(e.target.value)}
                        placeholder="Ex.: Agende sua aula experimental"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Instrucoes adicionais (opcional)</Label>
                    <Textarea
                      value={additionalInstructions}
                      onChange={(e) => setAdditionalInstructions(e.target.value)}
                      placeholder="Ex.: destacar a estrutura da academia, falar com pais, reforcar vagas limitadas."
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Result */}
          {step === 4 && generatedContent && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Resultado</h3>
                  <p className="text-sm text-muted-foreground">
                    Revise, ajuste e gere a imagem final.
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={resetFlow}>
                  Criar outro
                </Button>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Left: Image Generation */}
                <div className="space-y-4">
                  <Label>Imagem do conteudo</Label>
                  <div className={cn(
                    "aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all",
                    imageGenerated 
                      ? "border-primary bg-primary/5" 
                      : "border-border bg-muted/30"
                  )}>
                    {isGeneratingImage ? (
                      <div className="text-center space-y-3">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
                        <div>
                          <p className="font-medium text-foreground">Gerando imagem...</p>
                          <p className="text-sm text-muted-foreground">Isso pode levar alguns segundos</p>
                        </div>
                      </div>
                    ) : imageGenerated ? (
                      <div className="w-full h-full p-4">
                        <div className="w-full h-full bg-gradient-to-b from-primary/80 to-primary rounded-lg flex items-end p-4">
                          <div className="bg-white rounded-lg p-4 w-full">
                            <h4 className="font-bold text-primary text-lg leading-tight">
                              {generatedContent.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {generatedContent.caption.split("\n")[0]}
                            </p>
                            <div className="mt-2 bg-primary text-white text-xs font-medium px-3 py-1.5 rounded inline-block">
                              {cta || "Saiba mais"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-3 p-6">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Imagem ainda nao gerada</p>
                          <p className="text-sm text-muted-foreground">
                            Clique no botao abaixo para gerar a imagem final
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 px-3 py-2 rounded-lg">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>A previa acima e apenas um rascunho. Gere a imagem para ter o resultado final.</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage}
                  >
                    {isGeneratingImage ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : imageGenerated ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Gerar nova versao
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Gerar imagem final
                      </>
                    )}
                  </Button>
                </div>

                {/* Right: Text Content */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Titulo sugerido</Label>
                    <Input 
                      value={generatedContent.title} 
                      className="bg-background"
                      onChange={() => {}}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Legenda</Label>
                    <Textarea 
                      defaultValue={generatedContent.caption} 
                      rows={4}
                      className="bg-background resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Hashtags</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {generatedContent.hashtags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary/20 text-xs"
                          onClick={() => copyToClipboard(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => copyToClipboard(generatedContent.caption)}
                    >
                      <Copy className="h-4 w-4 mr-1.5" />
                      Copiar texto
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={regenerateContent}
                      disabled={isGeneratingText}
                    >
                      <RefreshCw className={cn("h-4 w-4 mr-1.5", isGeneratingText && "animate-spin")} />
                      Reescrever
                    </Button>
                  </div>
                </div>
              </div>

              {/* Download Button */}
              <div className="pt-4 border-t border-border">
                <Button 
                  className="w-full" 
                  size="lg"
                  disabled={!imageGenerated}
                  variant={imageGenerated ? "default" : "outline"}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {imageGenerated ? "Baixar peca completa" : "Gere a imagem primeiro para baixar"}
                </Button>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step < 4 && (
            <div className="flex justify-between pt-6 mt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
              >
                Voltar
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed() || isGeneratingText}
                className="min-w-[120px]"
              >
                {isGeneratingText ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : step === 3 ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar conteudo
                  </>
                ) : (
                  "Continuar"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
