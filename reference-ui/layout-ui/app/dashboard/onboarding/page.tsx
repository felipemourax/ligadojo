"use client"

import { useState } from "react"
import { 
  Building2, 
  MapPin, 
  GraduationCap, 
  Users, 
  CreditCard, 
  Palette, 
  Wallet,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Trash2,
  Search,
  Upload,
  Rocket
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Step definitions
const steps = [
  { id: 1, title: "Academia", icon: Building2, required: true },
  { id: 2, title: "Localização", icon: MapPin, required: true },
  { id: 3, title: "Modalidades", icon: GraduationCap, required: true },
  { id: 4, title: "Professores", icon: Users, required: false },
  { id: 5, title: "Planos", icon: CreditCard, required: true },
  { id: 6, title: "Visual", icon: Palette, required: true },
  { id: 7, title: "Pagamentos", icon: Wallet, required: true },
]

// Types
interface Modalidade {
  id: number
  atividade: string
  nome: string
  faixaEtaria: string
  duracao: number
  capacidade: number
}

interface Professor {
  id: number
  nome: string
  email: string
  telefone: string
  faixa: string
  especialidade: string
  convidar: boolean
}

interface Plano {
  id: number
  nome: string
  preco: string
  frequencia: string
  frequenciaSemanal: number
  limiteAulas: string
  modalidades: string[]
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  
  // Form states
  const [academiaData, setAcademiaData] = useState({
    nome: "",
    telefone: "",
    email: "",
    cnpj: "",
    anoFundacao: "",
    atividades: "",
    naoTenhoCnpj: false,
  })
  
  const [localizacaoData, setLocalizacaoData] = useState({
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    cidade: "",
    estado: "",
  })
  
  const [modalidades, setModalidades] = useState<Modalidade[]>([
    { id: 1, atividade: "Jiu Jitsu", nome: "Jiu-Jitsu Kids", faixaEtaria: "Kids", duracao: 60, capacidade: 20 }
  ])
  
  const [professores, setProfessores] = useState<Professor[]>([
    { id: 1, nome: "", email: "", telefone: "", faixa: "", especialidade: "", convidar: false }
  ])
  
  const [planos, setPlanos] = useState<Plano[]>([
    { id: 1, nome: "", preco: "", frequencia: "Mensal", frequenciaSemanal: 3, limiteAulas: "Ilimitado", modalidades: [] }
  ])
  
  const [visualData, setVisualData] = useState({
    nomeApp: "",
    corPrimaria: "#16a34a",
    corSecundaria: "#0f172a",
    logo: null as File | null,
    banner: null as File | null,
  })

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 7) {
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep])
      }
      setCurrentStep(step)
    }
  }

  const nextStep = () => goToStep(currentStep + 1)
  const prevStep = () => goToStep(currentStep - 1)

  const addModalidade = () => {
    setModalidades([...modalidades, {
      id: Date.now(),
      atividade: "Jiu Jitsu",
      nome: "",
      faixaEtaria: "",
      duracao: 60,
      capacidade: 20
    }])
  }

  const removeModalidade = (id: number) => {
    if (modalidades.length > 1) {
      setModalidades(modalidades.filter(m => m.id !== id))
    }
  }

  const addProfessor = () => {
    setProfessores([...professores, {
      id: Date.now(),
      nome: "",
      email: "",
      telefone: "",
      faixa: "",
      especialidade: "",
      convidar: false
    }])
  }

  const removeProfessor = (id: number) => {
    if (professores.length > 1) {
      setProfessores(professores.filter(p => p.id !== id))
    }
  }

  const addPlano = () => {
    setPlanos([...planos, {
      id: Date.now(),
      nome: "",
      preco: "",
      frequencia: "Mensal",
      frequenciaSemanal: 3,
      limiteAulas: "Ilimitado",
      modalidades: []
    }])
  }

  const removePlano = (id: number) => {
    if (planos.length > 1) {
      setPlanos(planos.filter(p => p.id !== id))
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <StepAcademia data={academiaData} setData={setAcademiaData} />
      case 2:
        return <StepLocalizacao data={localizacaoData} setData={setLocalizacaoData} />
      case 3:
        return (
          <StepModalidades 
            modalidades={modalidades} 
            setModalidades={setModalidades}
            onAdd={addModalidade}
            onRemove={removeModalidade}
          />
        )
      case 4:
        return (
          <StepProfessores 
            professores={professores} 
            setProfessores={setProfessores}
            onAdd={addProfessor}
            onRemove={removeProfessor}
          />
        )
      case 5:
        return (
          <StepPlanos 
            planos={planos} 
            setPlanos={setPlanos}
            onAdd={addPlano}
            onRemove={removePlano}
            modalidades={modalidades}
          />
        )
      case 6:
        return <StepVisual data={visualData} setData={setVisualData} />
      case 7:
        return <StepPagamentos />
      default:
        return null
    }
  }

  const currentStepData = steps.find(s => s.id === currentStep)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - Compact */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Rocket className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-semibold text-foreground truncate">Configuração Inicial</h1>
              <p className="text-xs text-muted-foreground">
                {completedSteps.length} de {steps.length} etapas
              </p>
            </div>
          </div>
          
          {/* Step Indicator - Horizontal Dots */}
          <div className="flex items-center justify-between gap-1">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id)
              const isCurrent = currentStep === step.id
              const Icon = step.icon
              
              return (
                <button
                  key={step.id}
                  onClick={() => goToStep(step.id)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1 py-1 rounded-lg transition-all",
                    isCurrent && "bg-primary/10",
                    !isCurrent && "hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && !isCompleted && "bg-primary text-primary-foreground",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                  )}>
                    {isCompleted && !isCurrent ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium hidden sm:block",
                    isCurrent ? "text-primary" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-auto pb-24">
        <div className="p-4 max-w-2xl mx-auto">
          {/* Step Title */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-foreground">
                {currentStepData?.title}
              </h2>
              {currentStepData?.required ? (
                <Badge variant="secondary" className="text-[10px]">Obrigatório</Badge>
              ) : (
                <Badge variant="outline" className="text-[10px]">Opcional</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {getStepDescription(currentStep)}
            </p>
          </div>

          {/* Step Content */}
          {renderStepContent()}
        </div>
      </div>

      {/* Footer - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border p-4 z-20">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex-1 sm:flex-none"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          
          <div className="flex-1 hidden sm:block" />
          
          <Button
            onClick={currentStep === 7 ? () => console.log("Finalizar") : nextStep}
            className="flex-1 sm:flex-none"
          >
            {currentStep === 7 ? "Finalizar" : "Continuar"}
            {currentStep !== 7 && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

function getStepDescription(step: number): string {
  const descriptions: Record<number, string> = {
    1: "Defina os dados principais do seu negócio.",
    2: "Informe o endereço da academia.",
    3: "Configure as modalidades e turmas oferecidas.",
    4: "Cadastre os professores da equipe.",
    5: "Defina os planos que você vai vender.",
    6: "Personalize a aparência do app e painel.",
    7: "Configure como você vai receber pagamentos.",
  }
  return descriptions[step] || ""
}

// Step 1: Academia
function StepAcademia({ data, setData }: { data: typeof OnboardingPage.prototype.academiaData, setData: Function }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Nome da academia</Label>
        <Input 
          value={data.nome}
          onChange={(e) => setData({ ...data, nome: e.target.value })}
          placeholder="Ex.: Academia Força Total"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Telefone</Label>
          <Input 
            value={data.telefone}
            onChange={(e) => setData({ ...data, telefone: e.target.value })}
            placeholder="(00) 00000-0000"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input 
            type="email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            placeholder="contato@academia.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>CNPJ</Label>
          <Input 
            value={data.cnpj}
            onChange={(e) => setData({ ...data, cnpj: e.target.value })}
            placeholder="00.000.000/0000-00"
            disabled={data.naoTenhoCnpj}
          />
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <Checkbox 
              checked={data.naoTenhoCnpj}
              onCheckedChange={(checked) => setData({ ...data, naoTenhoCnpj: checked as boolean })}
            />
            Não tenho CNPJ
          </label>
        </div>
        <div className="space-y-1.5">
          <Label>Ano de fundação</Label>
          <Input 
            value={data.anoFundacao}
            onChange={(e) => setData({ ...data, anoFundacao: e.target.value })}
            placeholder="2020"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Atividades que atua</Label>
        <Input 
          value={data.atividades}
          onChange={(e) => setData({ ...data, atividades: e.target.value })}
          placeholder="Jiu Jitsu, Muay Thai, Wrestling..."
        />
      </div>
    </div>
  )
}

// Step 2: Localização
function StepLocalizacao({ data, setData }: { data: any, setData: Function }) {
  const buscarCep = () => {
    // Simula busca de CEP
    if (data.cep.length >= 8) {
      setData({
        ...data,
        rua: "Rua Exemplo",
        cidade: "São Paulo",
        estado: "SP"
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>CEP</Label>
        <div className="flex gap-2">
          <Input 
            value={data.cep}
            onChange={(e) => setData({ ...data, cep: e.target.value })}
            placeholder="00000-000"
            className="flex-1"
          />
          <Button variant="outline" onClick={buscarCep}>
            <Search className="h-4 w-4 mr-1" />
            Buscar
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Rua</Label>
        <Input 
          value={data.rua}
          onChange={(e) => setData({ ...data, rua: e.target.value })}
          placeholder="Nome da rua"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Número</Label>
          <Input 
            value={data.numero}
            onChange={(e) => setData({ ...data, numero: e.target.value })}
            placeholder="123"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Complemento</Label>
          <Input 
            value={data.complemento}
            onChange={(e) => setData({ ...data, complemento: e.target.value })}
            placeholder="Sala 1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Cidade</Label>
          <Input 
            value={data.cidade}
            onChange={(e) => setData({ ...data, cidade: e.target.value })}
            placeholder="São Paulo"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Estado</Label>
          <Input 
            value={data.estado}
            onChange={(e) => setData({ ...data, estado: e.target.value })}
            placeholder="SP"
          />
        </div>
      </div>
    </div>
  )
}

// Step 3: Modalidades
function StepModalidades({ modalidades, setModalidades, onAdd, onRemove }: {
  modalidades: Modalidade[]
  setModalidades: Function
  onAdd: () => void
  onRemove: (id: number) => void
}) {
  const updateModalidade = (id: number, field: string, value: any) => {
    setModalidades(modalidades.map(m => m.id === id ? { ...m, [field]: value } : m))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {modalidades.length} modalidade(s) cadastrada(s)
        </p>
        <Button variant="outline" size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>

      <div className="space-y-3">
        {modalidades.map((mod, index) => (
          <Card key={mod.id} className="border-border">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Modalidade {index + 1}</span>
                {modalidades.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onRemove(mod.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Atividade principal</Label>
                  <Select 
                    value={mod.atividade} 
                    onValueChange={(v) => updateModalidade(mod.id, "atividade", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Jiu Jitsu">Jiu Jitsu</SelectItem>
                      <SelectItem value="Muay Thai">Muay Thai</SelectItem>
                      <SelectItem value="Wrestling">Wrestling</SelectItem>
                      <SelectItem value="Boxe">Boxe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Nome da turma</Label>
                  <Input 
                    value={mod.nome}
                    onChange={(e) => updateModalidade(mod.id, "nome", e.target.value)}
                    placeholder="Jiu-Jitsu Kids"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Faixa etária</Label>
                  <Select 
                    value={mod.faixaEtaria} 
                    onValueChange={(v) => updateModalidade(mod.id, "faixaEtaria", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kids">Kids</SelectItem>
                      <SelectItem value="Juvenil">Juvenil</SelectItem>
                      <SelectItem value="Adulto">Adulto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Duração (min)</Label>
                  <Input 
                    type="number"
                    value={mod.duracao}
                    onChange={(e) => updateModalidade(mod.id, "duracao", parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Capacidade</Label>
                  <Input 
                    type="number"
                    value={mod.capacidade}
                    onChange={(e) => updateModalidade(mod.id, "capacidade", parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Step 4: Professores
function StepProfessores({ professores, setProfessores, onAdd, onRemove }: {
  professores: Professor[]
  setProfessores: Function
  onAdd: () => void
  onRemove: (id: number) => void
}) {
  const updateProfessor = (id: number, field: string, value: any) => {
    setProfessores(professores.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Cadastre os professores ou deixe para depois.
        </p>
        <Button variant="outline" size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>

      <div className="space-y-3">
        {professores.map((prof, index) => (
          <Card key={prof.id} className="border-border">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Professor {index + 1}</span>
                {professores.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onRemove(prof.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nome</Label>
                  <Input 
                    value={prof.nome}
                    onChange={(e) => updateProfessor(prof.id, "nome", e.target.value)}
                    placeholder="Nome completo"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Email</Label>
                  <Input 
                    type="email"
                    value={prof.email}
                    onChange={(e) => updateProfessor(prof.id, "email", e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Telefone</Label>
                  <Input 
                    value={prof.telefone}
                    onChange={(e) => updateProfessor(prof.id, "telefone", e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Faixa</Label>
                  <Input 
                    value={prof.faixa}
                    onChange={(e) => updateProfessor(prof.id, "faixa", e.target.value)}
                    placeholder="Preta"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Especialidade</Label>
                  <Input 
                    value={prof.especialidade}
                    onChange={(e) => updateProfessor(prof.id, "especialidade", e.target.value)}
                    placeholder="Jiu Jitsu"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <Checkbox 
                  checked={prof.convidar}
                  onCheckedChange={(checked) => updateProfessor(prof.id, "convidar", checked)}
                />
                Enviar convite por email
              </label>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Step 5: Planos
function StepPlanos({ planos, setPlanos, onAdd, onRemove, modalidades }: {
  planos: Plano[]
  setPlanos: Function
  onAdd: () => void
  onRemove: (id: number) => void
  modalidades: Modalidade[]
}) {
  const updatePlano = (id: number, field: string, value: any) => {
    setPlanos(planos.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const toggleModalidade = (planoId: number, modalidadeNome: string) => {
    const plano = planos.find(p => p.id === planoId)
    if (plano) {
      const newModalidades = plano.modalidades.includes(modalidadeNome)
        ? plano.modalidades.filter(m => m !== modalidadeNome)
        : [...plano.modalidades, modalidadeNome]
      updatePlano(planoId, "modalidades", newModalidades)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {planos.length} plano(s) configurado(s)
        </p>
        <Button variant="outline" size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>

      <div className="space-y-3">
        {planos.map((plano, index) => (
          <Card key={plano.id} className="border-border">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Plano {index + 1}</span>
                {planos.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onRemove(plano.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nome do plano</Label>
                  <Input 
                    value={plano.nome}
                    onChange={(e) => updatePlano(plano.id, "nome", e.target.value)}
                    placeholder="Plano Mensal"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Preço (R$)</Label>
                  <Input 
                    value={plano.preco}
                    onChange={(e) => updatePlano(plano.id, "preco", e.target.value)}
                    placeholder="150,00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Frequência</Label>
                  <Select 
                    value={plano.frequencia} 
                    onValueChange={(v) => updatePlano(plano.id, "frequencia", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mensal">Mensal</SelectItem>
                      <SelectItem value="Trimestral">Trimestral</SelectItem>
                      <SelectItem value="Semestral">Semestral</SelectItem>
                      <SelectItem value="Anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Aulas/semana</Label>
                  <Input 
                    type="number"
                    value={plano.frequenciaSemanal}
                    onChange={(e) => updatePlano(plano.id, "frequenciaSemanal", parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Limite</Label>
                  <Select 
                    value={plano.limiteAulas} 
                    onValueChange={(v) => updatePlano(plano.id, "limiteAulas", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ilimitado">Ilimitado</SelectItem>
                      <SelectItem value="12">12 aulas</SelectItem>
                      <SelectItem value="8">8 aulas</SelectItem>
                      <SelectItem value="4">4 aulas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {modalidades.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Modalidades incluídas</Label>
                  <div className="flex flex-wrap gap-2">
                    {modalidades.map(mod => (
                      <label 
                        key={mod.id}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer text-xs transition-colors",
                          plano.modalidades.includes(mod.nome)
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <Checkbox 
                          checked={plano.modalidades.includes(mod.nome)}
                          onCheckedChange={() => toggleModalidade(plano.id, mod.nome)}
                          className="hidden"
                        />
                        {mod.nome || mod.atividade}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Step 6: Visual
function StepVisual({ data, setData }: { data: any, setData: Function }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Nome do app</Label>
        <Input 
          value={data.nomeApp}
          onChange={(e) => setData({ ...data, nomeApp: e.target.value })}
          placeholder="Nome que aparece no app do aluno"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Logotipo</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-2">
            Arraste ou clique para enviar
          </p>
          <input 
            type="file" 
            accept="image/*"
            className="hidden"
            onChange={(e) => setData({ ...data, logo: e.target.files?.[0] })}
          />
          <Button variant="outline" size="sm">Escolher arquivo</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Cor primária</Label>
          <div className="flex items-center gap-2">
            <input 
              type="color"
              value={data.corPrimaria}
              onChange={(e) => setData({ ...data, corPrimaria: e.target.value })}
              className="h-10 w-12 rounded border border-border cursor-pointer"
            />
            <Input 
              value={data.corPrimaria}
              onChange={(e) => setData({ ...data, corPrimaria: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Cor secundária</Label>
          <div className="flex items-center gap-2">
            <input 
              type="color"
              value={data.corSecundaria}
              onChange={(e) => setData({ ...data, corSecundaria: e.target.value })}
              className="h-10 w-12 rounded border border-border cursor-pointer"
            />
            <Input 
              value={data.corSecundaria}
              onChange={(e) => setData({ ...data, corSecundaria: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Banner de apresentação</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-2">
            Imagem para a tela inicial do app
          </p>
          <input 
            type="file" 
            accept="image/*"
            className="hidden"
            onChange={(e) => setData({ ...data, banner: e.target.files?.[0] })}
          />
          <Button variant="outline" size="sm">Escolher arquivo</Button>
        </div>
      </div>
    </div>
  )
}

// Step 7: Pagamentos
function StepPagamentos() {
  return (
    <div className="space-y-4">
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-medium mb-1">Configuração de pagamentos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Conecte sua conta para receber pagamentos dos alunos.
            </p>
            <Button>
              Configurar pagamentos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
