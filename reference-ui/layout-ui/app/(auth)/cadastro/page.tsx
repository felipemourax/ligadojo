"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Loader2, ArrowLeft, Check } from "lucide-react"

const modalidades = [
  { value: "jiu-jitsu", label: "Jiu-Jitsu" },
  { value: "muay-thai", label: "Muay Thai" },
  { value: "judo", label: "Judô" },
  { value: "karate", label: "Karatê" },
  { value: "taekwondo", label: "Taekwondo" },
  { value: "boxe", label: "Boxe" },
  { value: "mma", label: "MMA" },
  { value: "outras", label: "Outras" },
]

export default function CadastroPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nomeAcademia: "",
    modalidade: "",
    cidade: "",
    telefone: "",
    nome: "",
    email: "",
    password: "",
  })

  const handleNext = () => {
    if (step < 2) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simula cadastro - em produção, conectar com backend
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard")
    }, 1500)
  }

  const isStep1Valid = formData.nomeAcademia && formData.modalidade && formData.cidade
  const isStep2Valid = formData.nome && formData.email && formData.password

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background safe-top safe-bottom">
      {/* Logo */}
      <div className="mb-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-3">
          <span className="text-xl font-bold text-primary-foreground">D</span>
        </div>
        <h1 className="text-xl font-bold text-foreground">Criar conta</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
          step >= 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
        }`}>
          {step > 1 ? <Check className="h-5 w-5" /> : "1"}
        </div>
        <div className={`w-16 h-1 rounded-full ${step > 1 ? "bg-primary" : "bg-secondary"}`} />
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
          step >= 2 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
        }`}>
          2
        </div>
      </div>

      <Card className="w-full max-w-[400px] bg-card border-border">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-lg font-semibold">
            {step === 1 ? "Dados da Academia" : "Seus dados"}
          </CardTitle>
          <CardDescription>
            {step === 1 
              ? "Informações básicas da sua academia" 
              : "Crie suas credenciais de acesso"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeAcademia">Nome da Academia</Label>
                  <Input
                    id="nomeAcademia"
                    placeholder="Ex: Academia Força Total"
                    value={formData.nomeAcademia}
                    onChange={(e) => setFormData({ ...formData, nomeAcademia: e.target.value })}
                    required
                    className="bg-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modalidade">Modalidade Principal</Label>
                  <Select 
                    value={formData.modalidade} 
                    onValueChange={(value) => setFormData({ ...formData, modalidade: value })}
                  >
                    <SelectTrigger className="bg-input">
                      <SelectValue placeholder="Selecione a modalidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {modalidades.map((mod) => (
                        <SelectItem key={mod.value} value={mod.value}>
                          {mod.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    placeholder="Ex: São Paulo, SP"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    required
                    className="bg-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone (opcional)</Label>
                  <Input
                    id="telefone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="bg-input"
                  />
                </div>

                <Button 
                  type="button" 
                  className="w-full"
                  onClick={handleNext}
                  disabled={!isStep1Valid}
                >
                  Continuar
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Seu nome</Label>
                  <Input
                    id="nome"
                    placeholder="Nome completo"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                    className="bg-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={8}
                      className="bg-input pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Ocultar senha" : "Mostrar senha"}
                      </span>
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={isLoading || !isStep2Valid}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      "Criar conta"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Já tem uma conta? </span>
            <Link href="/login" className="text-primary hover:underline font-medium">
              Fazer login
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Footer mobile */}
      <p className="mt-6 text-xs text-muted-foreground text-center max-w-xs">
        Ao criar sua conta, você concorda com nossos{" "}
        <Link href="/termos" className="underline">Termos de Uso</Link>
        {" "}e{" "}
        <Link href="/privacidade" className="underline">Política de Privacidade</Link>
      </p>
    </div>
  )
}
