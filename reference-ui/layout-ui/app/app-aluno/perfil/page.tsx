"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Camera,
  Edit,
  Trophy,
  Star,
  Flame,
  Target,
  Medal,
  Award,
  Zap,
  Shield,
  Crown,
  Calendar,
  CreditCard,
  FileText,
  ChevronRight,
  Download,
  Share2,
  Copy,
  Check,
  Plus,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const conquistas = [
  { id: 1, nome: "Primeira Aula", descricao: "Completou sua primeira aula", icon: Star, conquistado: true, data: "15/08/2023" },
  { id: 2, nome: "10 Presenças", descricao: "Compareceu a 10 aulas", icon: Flame, conquistado: true, data: "01/09/2023" },
  { id: 3, nome: "Mês Completo", descricao: "100% de presença em um mês", icon: Target, conquistado: true, data: "30/09/2023" },
  { id: 4, nome: "Faixa Azul", descricao: "Alcançou a faixa azul", icon: Award, conquistado: true, data: "05/03/2025" },
  { id: 5, nome: "Competidor", descricao: "Participou de uma competição", icon: Trophy, conquistado: true, data: "15/06/2025" },
  { id: 6, nome: "50 Presenças", descricao: "Compareceu a 50 aulas", icon: Medal, conquistado: false, progresso: 42 },
  { id: 7, nome: "Medalha de Ouro", descricao: "Ganhou ouro em competição", icon: Crown, conquistado: false },
  { id: 8, nome: "Veterano", descricao: "1 ano de academia", icon: Shield, conquistado: false, progresso: 80 },
  { id: 9, nome: "100 Presenças", descricao: "Compareceu a 100 aulas", icon: Zap, conquistado: false, progresso: 42 },
]

const documentos = [
  { id: 1, nome: "Contrato de matrícula", data: "15/08/2023", tipo: "PDF" },
  { id: 2, nome: "Comprovante de pagamento - Mar/2026", data: "01/03/2026", tipo: "PDF" },
  { id: 3, nome: "Comprovante de pagamento - Fev/2026", data: "01/02/2026", tipo: "PDF" },
  { id: 4, nome: "Atestado médico", data: "10/01/2026", tipo: "PDF" },
]

interface TituloAluno {
  id: number
  titulo: string
  competicao: string
  ano: string
}

const titulosIniciaisAluno: TituloAluno[] = [
  { id: 1, titulo: "Ouro", competicao: "Copa Kids de Jiu-Jitsu", ano: "2025" },
]

export default function PerfilPage() {
  const [editando, setEditando] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [titulos, setTitulos] = useState<TituloAluno[]>(titulosIniciaisAluno)
  const [dialogTitulo, setDialogTitulo] = useState(false)
  const [novoTitulo, setNovoTitulo] = useState({ titulo: "", competicao: "", ano: "" })
  const [dados, setDados] = useState({
    nome: "João da Silva",
    email: "joao@email.com",
    telefone: "(11) 99999-0000",
    cpf: "123.456.789-00",
    dataNascimento: "15/05/1990",
    endereco: "Rua das Flores, 123 - Centro",
  })

  const copiarLink = () => {
    navigator.clipboard.writeText("https://dojo.app/aluno/joao-silva")
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const adicionarTitulo = () => {
    if (novoTitulo.titulo && novoTitulo.competicao && novoTitulo.ano) {
      setTitulos([
        ...titulos,
        { ...novoTitulo, id: Date.now() },
      ])
      setNovoTitulo({ titulo: "", competicao: "", ano: "" })
      setDialogTitulo(false)
    }
  }

  const removerTitulo = (id: number) => {
    setTitulos(titulos.filter((t) => t.id !== id))
  }

  return (
    <div className="flex flex-col">
      {/* Header do Perfil */}
      <div className="relative">
        {/* Cover */}
        <div className="h-24 bg-gradient-to-r from-primary/30 to-primary/10" />

        {/* Avatar e Info */}
        <div className="px-4 pb-4">
          <div className="flex items-end gap-4 -mt-10">
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-background">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  JD
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full"
              >
                <Camera className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="flex-1 pb-1">
              <h1 className="text-xl font-bold">{dados.nome}</h1>
              <p className="text-sm text-muted-foreground">Faixa Azul - 2 graus</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <Card>
              <CardContent className="p-2 text-center">
                <p className="text-lg font-bold text-primary">42</p>
                <p className="text-[10px] text-muted-foreground">Presenças</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 text-center">
                <p className="text-lg font-bold text-primary">5</p>
                <p className="text-[10px] text-muted-foreground">Conquistas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 text-center">
                <p className="text-lg font-bold text-primary">15</p>
                <p className="text-[10px] text-muted-foreground">Sequência</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="conquistas" className="flex-1">
        <div className="px-4">
          <TabsList className="w-full">
            <TabsTrigger value="conquistas" className="flex-1">
              Conquistas
            </TabsTrigger>
            <TabsTrigger value="titulos" className="flex-1">
              Títulos
            </TabsTrigger>
            <TabsTrigger value="dados" className="flex-1">
              Dados
            </TabsTrigger>
            <TabsTrigger value="plano" className="flex-1">
              Plano
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="conquistas" className="p-4 space-y-4">
          {/* Compartilhar Perfil */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Compartilhar perfil</p>
                  <p className="text-sm text-muted-foreground">
                    Mostre suas conquistas
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={copiarLink} className="gap-2">
                  {copiado ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      Compartilhar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Conquistas */}
          <div>
            <h3 className="font-medium mb-3">
              Conquistas ({conquistas.filter((c) => c.conquistado).length}/{conquistas.length})
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {conquistas.map((conquista) => (
                <Dialog key={conquista.id}>
                  <DialogTrigger asChild>
                    <div
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer transition-colors",
                        conquista.conquistado
                          ? "bg-primary/10 border border-primary/30 hover:bg-primary/20"
                          : "bg-secondary opacity-50 hover:opacity-70"
                      )}
                    >
                      <conquista.icon
                        className={cn(
                          "h-8 w-8",
                          conquista.conquistado
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      />
                      <span className="text-[10px] text-center font-medium line-clamp-2">
                        {conquista.nome}
                      </span>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <div className="flex justify-center mb-4">
                        <div
                          className={cn(
                            "h-16 w-16 rounded-full flex items-center justify-center",
                            conquista.conquistado
                              ? "bg-primary/20"
                              : "bg-secondary"
                          )}
                        >
                          <conquista.icon
                            className={cn(
                              "h-8 w-8",
                              conquista.conquistado
                                ? "text-primary"
                                : "text-muted-foreground"
                            )}
                          />
                        </div>
                      </div>
                      <DialogTitle className="text-center">
                        {conquista.nome}
                      </DialogTitle>
                      <DialogDescription className="text-center">
                        {conquista.descricao}
                      </DialogDescription>
                    </DialogHeader>
                    {conquista.conquistado ? (
                      <div className="text-center">
                        <Badge className="bg-primary/20 text-primary">
                          Conquistado em {conquista.data}
                        </Badge>
                      </div>
                    ) : conquista.progresso ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="text-primary">{conquista.progresso}%</span>
                        </div>
                        <Progress value={conquista.progresso} />
                      </div>
                    ) : (
                      <p className="text-center text-sm text-muted-foreground">
                        Continue treinando para desbloquear!
                      </p>
                    )}
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
</TabsContent>

        {/* Meus Títulos */}
        <TabsContent value="titulos" className="p-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Meus Títulos
                </CardTitle>
                <Button size="sm" onClick={() => setDialogTitulo(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {titulos.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Nenhum título cadastrado</p>
                  <p className="text-sm">Adicione seus títulos de competições</p>
                </div>
              ) : (
                titulos.map((titulo) => (
                  <div 
                    key={titulo.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary"
                  >
                    <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{titulo.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        {titulo.competicao} - {titulo.ano}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removerTitulo(titulo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Dialog Adicionar Título */}
          <Dialog open={dialogTitulo} onOpenChange={setDialogTitulo}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Título</DialogTitle>
                <DialogDescription>
                  Registre seus títulos conquistados em competições
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Colocação</label>
                  <Input 
                    placeholder="Ex: Ouro, Prata, Bronze, Campeão..."
                    value={novoTitulo.titulo}
                    onChange={(e) => setNovoTitulo({ ...novoTitulo, titulo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Competição</label>
                  <Input 
                    placeholder="Ex: Campeonato Brasileiro de Jiu-Jitsu"
                    value={novoTitulo.competicao}
                    onChange={(e) => setNovoTitulo({ ...novoTitulo, competicao: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ano</label>
                  <Input 
                    placeholder="Ex: 2024"
                    value={novoTitulo.ano}
                    onChange={(e) => setNovoTitulo({ ...novoTitulo, ano: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogTitulo(false)}>
                  Cancelar
                </Button>
                <Button onClick={adicionarTitulo}>
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="dados" className="p-4 space-y-4">
          {/* Dados Pessoais */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Dados pessoais</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditando(!editando)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {editando ? "Salvar" : "Editar"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Nome</Label>
                  {editando ? (
                    <Input
                      value={dados.nome}
                      onChange={(e) => setDados({ ...dados, nome: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{dados.nome}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">CPF</Label>
                  <p className="text-sm font-medium">{dados.cpf}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">E-mail</Label>
                  {editando ? (
                    <Input
                      value={dados.email}
                      onChange={(e) => setDados({ ...dados, email: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{dados.email}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Telefone</Label>
                  {editando ? (
                    <Input
                      value={dados.telefone}
                      onChange={(e) => setDados({ ...dados, telefone: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{dados.telefone}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Data de nascimento
                  </Label>
                  <p className="text-sm font-medium">{dados.dataNascimento}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Endereço</Label>
                  {editando ? (
                    <Input
                      value={dados.endereco}
                      onChange={(e) =>
                        setDados({ ...dados, endereco: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm font-medium">{dados.endereco}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documentos */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Documentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {documentos.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{doc.nome}</p>
                      <p className="text-xs text-muted-foreground">{doc.data}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plano" className="p-4 space-y-4">
          {/* Plano Atual */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="mb-2">Plano atual</Badge>
                  <h3 className="text-lg font-bold">Mensal Completo</h3>
                  <p className="text-2xl font-bold text-primary mt-1">
                    R$ 189,90<span className="text-sm font-normal">/mês</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Vencimento</p>
                  <p className="font-medium">15/04/2026</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm font-medium mb-2">Modalidades incluídas:</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Jiu-Jitsu</Badge>
                  <Badge variant="secondary">No-Gi</Badge>
                  <Badge variant="secondary">Muay Thai</Badge>
                  <Badge variant="secondary">Open Mat</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Alterar forma de pagamento
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Histórico de pagamentos
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between text-destructive hover:text-destructive">
              <span>Cancelar plano</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Outros Planos */}
          <div>
            <h3 className="font-medium mb-3">Outros planos disponíveis</h3>
            <div className="space-y-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Trimestral</p>
                      <p className="text-sm text-muted-foreground">
                        Economize 10%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">R$ 512,70</p>
                      <p className="text-xs text-muted-foreground">
                        R$ 170,90/mês
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Anual</p>
                      <p className="text-sm text-muted-foreground">
                        Economize 20%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">R$ 1.823,04</p>
                      <p className="text-xs text-muted-foreground">
                        R$ 151,92/mês
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
