"use client"

import { useState } from "react"
import { 
  Building2, 
  MapPin, 
  CreditCard, 
  Palette, 
  Users, 
  Shield,
  Save,
  Plus,
  Trash2,
  Upload,
  Check,
  Clock,
  Briefcase
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Types
interface AcademyInfo {
  name: string
  tradeName: string
  whatsapp: string
  email: string
  cnpj: string
  foundedYear: string
  website: string
  description: string
}

interface LocationInfo {
  cep: string
  country: string
  state: string
  city: string
  street: string
  number: string
  complement: string
  neighborhood: string
}

interface BusinessHour {
  day: string
  enabled: boolean
  openTime: string
  closeTime: string
}

interface Teacher {
  id: string
  name: string
  email: string
  role: string
  modalities: string[]
  active: boolean
}

interface PlanConfig {
  id: string
  name: string
  value: number
  cycle: string
  active: boolean
}

interface BrandingConfig {
  primaryColor: string
  secondaryColor: string
  logo: string | null
  favicon: string | null
  darkMode: boolean
}

interface PaymentConfig {
  pix: boolean
  card: boolean
  boleto: boolean
  gateway: string
}

interface AccountConfig {
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
  twoFactor: boolean
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("geral")
  
  // Academy Info State
  const [academyInfo, setAcademyInfo] = useState<AcademyInfo>({
    name: "João",
    tradeName: "Dojo Centro",
    whatsapp: "(11) 99999-0000",
    email: "joao@academia.com",
    cnpj: "",
    foundedYear: "",
    website: "",
    description: ""
  })

  // Location State
  const [location, setLocation] = useState<LocationInfo>({
    cep: "40325-660",
    country: "Brasil",
    state: "",
    city: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: ""
  })

  // Business Hours State
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([
    { day: "Segunda-feira", enabled: true, openTime: "06:00", closeTime: "22:00" },
    { day: "Terça-feira", enabled: true, openTime: "06:00", closeTime: "22:00" },
    { day: "Quarta-feira", enabled: true, openTime: "06:00", closeTime: "22:00" },
    { day: "Quinta-feira", enabled: true, openTime: "06:00", closeTime: "22:00" },
    { day: "Sexta-feira", enabled: true, openTime: "06:00", closeTime: "22:00" },
    { day: "Sábado", enabled: true, openTime: "08:00", closeTime: "14:00" },
    { day: "Domingo", enabled: false, openTime: "08:00", closeTime: "12:00" },
  ])

  // Teachers State
  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: "1", name: "Carlos Silva", email: "carlos@academia.com", role: "Professor", modalities: ["Jiu-Jitsu", "No-Gi"], active: true },
    { id: "2", name: "Ana Santos", email: "ana@academia.com", role: "Professora", modalities: ["Jiu-Jitsu Infantil"], active: true },
    { id: "3", name: "Pedro Lima", email: "pedro@academia.com", role: "Auxiliar", modalities: ["Jiu-Jitsu"], active: false },
  ])

  // Plans Config State
  const [plansConfig, setPlansConfig] = useState<PlanConfig[]>([
    { id: "1", name: "Mensal Básico", value: 18000, cycle: "mensal", active: true },
    { id: "2", name: "Trimestral", value: 48000, cycle: "trimestral", active: true },
    { id: "3", name: "Semestral", value: 90000, cycle: "semestral", active: true },
    { id: "4", name: "Anual", value: 160000, cycle: "anual", active: false },
  ])

  // Branding State
  const [branding, setBranding] = useState<BrandingConfig>({
    primaryColor: "#22c55e",
    secondaryColor: "#1a1a1a",
    logo: null,
    favicon: null,
    darkMode: true
  })

  // Payment State
  const [payment, setPayment] = useState<PaymentConfig>({
    pix: true,
    card: true,
    boleto: true,
    gateway: "none"
  })

  // Account State
  const [account, setAccount] = useState<AccountConfig>({
    email: "joao@academia.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactor: false,
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  })

  const handleSave = (section: string) => {
    // Simulate save
    console.log(`Saving ${section}...`)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Edite as informações da academia, a estrutura do negócio, o branding do app e a segurança da conta.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-background border border-border p-1 h-auto flex-wrap">
          <TabsTrigger value="geral" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Geral
          </TabsTrigger>
          <TabsTrigger value="estrutura" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Estrutura
          </TabsTrigger>
          <TabsTrigger value="professores" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Professores
          </TabsTrigger>
          <TabsTrigger value="planos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Planos
          </TabsTrigger>
          <TabsTrigger value="identidade" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Identidade visual
          </TabsTrigger>
          <TabsTrigger value="pagamentos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="conta" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Conta
          </TabsTrigger>
        </TabsList>

        {/* Tab: Geral */}
        <TabsContent value="geral" className="space-y-6">
          {/* Informações da Academia */}
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Informações da academia</CardTitle>
                  <CardDescription>
                    Atualize os dados institucionais e comerciais do seu negócio.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="academy-name">Nome da academia</Label>
                  <Input
                    id="academy-name"
                    value={academyInfo.name}
                    onChange={(e) => setAcademyInfo({ ...academyInfo, name: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trade-name">Nome comercial</Label>
                  <Input
                    id="trade-name"
                    value={academyInfo.tradeName}
                    onChange={(e) => setAcademyInfo({ ...academyInfo, tradeName: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={academyInfo.whatsapp}
                    onChange={(e) => setAcademyInfo({ ...academyInfo, whatsapp: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail de contato</Label>
                  <Input
                    id="email"
                    type="email"
                    value={academyInfo.email}
                    onChange={(e) => setAcademyInfo({ ...academyInfo, email: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={academyInfo.cnpj}
                    onChange={(e) => setAcademyInfo({ ...academyInfo, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="founded-year">Ano de fundação</Label>
                  <Input
                    id="founded-year"
                    value={academyInfo.foundedYear}
                    onChange={(e) => setAcademyInfo({ ...academyInfo, foundedYear: e.target.value })}
                    placeholder="2010"
                    className="bg-background border-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Site</Label>
                <Input
                  id="website"
                  value={academyInfo.website}
                  onChange={(e) => setAcademyInfo({ ...academyInfo, website: e.target.value })}
                  placeholder="https://suaacademia.com.br"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={academyInfo.description}
                  onChange={(e) => setAcademyInfo({ ...academyInfo, description: e.target.value })}
                  placeholder="Descreva sua academia, sua história, diferenciais..."
                  className="bg-background border-border min-h-[100px]"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave('academy')} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar informações
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Localização */}
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Localização</CardTitle>
                  <CardDescription>
                    Esses dados são usados para landing page, mapa e contato.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={location.cep}
                    onChange={(e) => setLocation({ ...location, cep: e.target.value })}
                    placeholder="00000-000"
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    value={location.country}
                    onChange={(e) => setLocation({ ...location, country: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={location.state}
                    onChange={(e) => setLocation({ ...location, state: e.target.value })}
                    placeholder="SP"
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={location.city}
                    onChange={(e) => setLocation({ ...location, city: e.target.value })}
                    placeholder="São Paulo"
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={location.neighborhood}
                    onChange={(e) => setLocation({ ...location, neighborhood: e.target.value })}
                    placeholder="Centro"
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street">Rua</Label>
                  <Input
                    id="street"
                    value={location.street}
                    onChange={(e) => setLocation({ ...location, street: e.target.value })}
                    placeholder="Rua das Flores"
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={location.number}
                    onChange={(e) => setLocation({ ...location, number: e.target.value })}
                    placeholder="123"
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={location.complement}
                    onChange={(e) => setLocation({ ...location, complement: e.target.value })}
                    placeholder="Sala 101"
                    className="bg-background border-border"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave('location')} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar localização
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Estrutura */}
        <TabsContent value="estrutura" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Horário de funcionamento</CardTitle>
                  <CardDescription>
                    Configure os horários de abertura e fechamento da academia.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {businessHours.map((hour, index) => (
                <div key={hour.day} className="flex items-center gap-4 p-3 rounded-lg bg-background border border-border">
                  <div className="flex items-center gap-3 min-w-[160px]">
                    <Switch
                      checked={hour.enabled}
                      onCheckedChange={(checked) => {
                        const newHours = [...businessHours]
                        newHours[index].enabled = checked
                        setBusinessHours(newHours)
                      }}
                    />
                    <span className={`text-sm font-medium ${hour.enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {hour.day}
                    </span>
                  </div>
                  {hour.enabled ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        value={hour.openTime}
                        onChange={(e) => {
                          const newHours = [...businessHours]
                          newHours[index].openTime = e.target.value
                          setBusinessHours(newHours)
                        }}
                        className="bg-card border-border w-[120px]"
                      />
                      <span className="text-muted-foreground">até</span>
                      <Input
                        type="time"
                        value={hour.closeTime}
                        onChange={(e) => {
                          const newHours = [...businessHours]
                          newHours[index].closeTime = e.target.value
                          setBusinessHours(newHours)
                        }}
                        className="bg-card border-border w-[120px]"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Fechado</span>
                  )}
                </div>
              ))}
              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSave('hours')} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar horários
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Espaços/Salas */}
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Espaços e salas</CardTitle>
                    <CardDescription>
                      Configure os espaços disponíveis para aulas e treinos.
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-border">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar espaço
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "Tatame Principal", capacity: 30, active: true },
                  { name: "Sala de Musculação", capacity: 15, active: true },
                  { name: "Tatame Kids", capacity: 20, active: true },
                ].map((space, index) => (
                  <div key={index} className="p-4 rounded-lg bg-background border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-foreground">{space.name}</span>
                      <Badge variant={space.active ? "default" : "secondary"} className={space.active ? "bg-primary/10 text-primary border-0" : ""}>
                        {space.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Capacidade: {space.capacity} pessoas</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 border-border text-xs">
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" className="border-border text-destructive hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Professores */}
        <TabsContent value="professores" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Equipe de professores</CardTitle>
                    <CardDescription>
                      Gerencie os professores e suas permissões no sistema.
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-border">
                  <Plus className="h-4 w-4 mr-2" />
                  Convidar professor
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teachers.map((teacher) => (
                  <div key={teacher.id} className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {teacher.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{teacher.name}</span>
                          <Badge variant={teacher.active ? "default" : "secondary"} className={teacher.active ? "bg-primary/10 text-primary border-0 text-xs" : "text-xs"}>
                            {teacher.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{teacher.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-foreground">{teacher.role}</p>
                        <p className="text-xs text-muted-foreground">{teacher.modalities.join(", ")}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-border">
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" className="border-border text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Planos */}
        <TabsContent value="planos" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Configuração de planos</CardTitle>
                    <CardDescription>
                      Gerencie os planos disponíveis para matrícula dos alunos.
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-border">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo plano
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {plansConfig.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{plan.name}</span>
                          <Badge variant={plan.active ? "default" : "secondary"} className={plan.active ? "bg-primary/10 text-primary border-0 text-xs" : "text-xs"}>
                            {plan.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">Ciclo {plan.cycle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold text-foreground">{formatCurrency(plan.value)}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-border">
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" className="border-border text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Identidade Visual */}
        <TabsContent value="identidade" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Identidade visual</CardTitle>
                  <CardDescription>
                    Personalize as cores e o logo da sua academia no sistema.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Cor primária</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                        className="h-10 w-14 rounded cursor-pointer border-0"
                      />
                      <Input
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                        className="bg-background border-border flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Cor secundária</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={branding.secondaryColor}
                        onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                        className="h-10 w-14 rounded cursor-pointer border-0"
                      />
                      <Input
                        value={branding.secondaryColor}
                        onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                        className="bg-background border-border flex-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Logo da academia</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Clique ou arraste para enviar</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou SVG até 2MB</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Favicon</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                      <p className="text-xs text-muted-foreground">ICO ou PNG 32x32</p>
                    </div>
                  </div>
                </div>
              </div>
              <Separator className="bg-border" />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Modo escuro</Label>
                  <p className="text-sm text-muted-foreground">Usar tema escuro como padrão</p>
                </div>
                <Switch
                  checked={branding.darkMode}
                  onCheckedChange={(checked) => setBranding({ ...branding, darkMode: checked })}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave('branding')} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar identidade
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Pagamentos */}
        <TabsContent value="pagamentos" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Pagamentos</CardTitle>
                  <CardDescription>
                    Defina os meios de pagamento e gateway desejado.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Formas de pagamento aceitas</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="flex items-center gap-3 p-4 rounded-lg bg-background border border-border cursor-pointer hover:border-primary/50 transition-colors">
                    <Checkbox
                      checked={payment.pix}
                      onCheckedChange={(checked) => setPayment({ ...payment, pix: !!checked })}
                    />
                    <span className="font-medium text-foreground">Pix</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 rounded-lg bg-background border border-border cursor-pointer hover:border-primary/50 transition-colors">
                    <Checkbox
                      checked={payment.card}
                      onCheckedChange={(checked) => setPayment({ ...payment, card: !!checked })}
                    />
                    <span className="font-medium text-foreground">Cartão</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 rounded-lg bg-background border border-border cursor-pointer hover:border-primary/50 transition-colors">
                    <Checkbox
                      checked={payment.boleto}
                      onCheckedChange={(checked) => setPayment({ ...payment, boleto: !!checked })}
                    />
                    <span className="font-medium text-foreground">Boleto</span>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Gateway</Label>
                <Select value={payment.gateway} onValueChange={(value) => setPayment({ ...payment, gateway: value })}>
                  <SelectTrigger className="bg-background border-border w-full md:w-[200px]">
                    <SelectValue placeholder="Selecione o gateway" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem gateway</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                    <SelectItem value="pagseguro">PagSeguro</SelectItem>
                    <SelectItem value="asaas">Asaas</SelectItem>
                    <SelectItem value="pagar.me">Pagar.me</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave('payment')} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar pagamentos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Conta */}
        <TabsContent value="conta" className="space-y-6">
          {/* Dados da conta */}
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Segurança da conta</CardTitle>
                  <CardDescription>
                    Altere sua senha e configure opções de segurança.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="account-email">E-mail da conta</Label>
                <Input
                  id="account-email"
                  type="email"
                  value={account.email}
                  onChange={(e) => setAccount({ ...account, email: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
              <Separator className="bg-border" />
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Alterar senha</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Senha atual</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={account.currentPassword}
                      onChange={(e) => setAccount({ ...account, currentPassword: e.target.value })}
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova senha</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={account.newPassword}
                      onChange={(e) => setAccount({ ...account, newPassword: e.target.value })}
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={account.confirmPassword}
                      onChange={(e) => setAccount({ ...account, confirmPassword: e.target.value })}
                      className="bg-background border-border"
                    />
                  </div>
                </div>
              </div>
              <Separator className="bg-border" />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Autenticação em dois fatores</Label>
                  <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                </div>
                <Switch
                  checked={account.twoFactor}
                  onCheckedChange={(checked) => setAccount({ ...account, twoFactor: checked })}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave('account')} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar alterações
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notificações */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Notificações</CardTitle>
              <CardDescription>
                Configure como deseja receber notificações do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                <div>
                  <span className="font-medium text-foreground">E-mail</span>
                  <p className="text-sm text-muted-foreground">Receber notificações por e-mail</p>
                </div>
                <Switch
                  checked={account.notifications.email}
                  onCheckedChange={(checked) => setAccount({
                    ...account,
                    notifications: { ...account.notifications, email: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                <div>
                  <span className="font-medium text-foreground">Push</span>
                  <p className="text-sm text-muted-foreground">Receber notificações push no navegador</p>
                </div>
                <Switch
                  checked={account.notifications.push}
                  onCheckedChange={(checked) => setAccount({
                    ...account,
                    notifications: { ...account.notifications, push: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                <div>
                  <span className="font-medium text-foreground">SMS</span>
                  <p className="text-sm text-muted-foreground">Receber notificações por SMS</p>
                </div>
                <Switch
                  checked={account.notifications.sms}
                  onCheckedChange={(checked) => setAccount({
                    ...account,
                    notifications: { ...account.notifications, sms: checked }
                  })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Zona de perigo */}
          <Card className="border-destructive/50 bg-card">
            <CardHeader>
              <CardTitle className="text-lg text-destructive">Zona de perigo</CardTitle>
              <CardDescription>
                Ações irreversíveis. Tenha cuidado.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <div>
                  <span className="font-medium text-foreground">Excluir conta</span>
                  <p className="text-sm text-muted-foreground">Remover permanentemente sua conta e todos os dados</p>
                </div>
                <Button variant="destructive" size="sm">
                  Excluir conta
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
