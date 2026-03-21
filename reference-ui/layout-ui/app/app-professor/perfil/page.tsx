"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  GraduationCap,
  Edit,
  Camera,
  Save,
  X,
  Dumbbell,
  Users,
  Clock,
  Star,
  Trophy,
  Plus,
  Trash2,
} from "lucide-react"

// Dados simulados
const professorData = {
  nome: "Mestre Carlos Silva",
  email: "carlos.silva@email.com",
  telefone: "(11) 99999-8888",
  endereco: "Rua das Artes Marciais, 100 - Centro",
  dataNascimento: "15/03/1980",
  dataAdmissao: "01/01/2015",
  faixa: "Preta",
  grau: "3º Grau",
  registro: "CBJJ-12345",
  bio: "Professor de Jiu-Jitsu há mais de 15 anos, com foco em desenvolvimento técnico e formação de atletas competidores.",
}

const modalidadesLecionadas = [
  { id: 1, nome: "Jiu-Jitsu", nivel: "Todos os níveis", cor: "bg-blue-500" },
  { id: 2, nome: "No-Gi", nivel: "Intermediário/Avançado", cor: "bg-purple-500" },
  { id: 3, nome: "Defesa Pessoal", nivel: "Iniciante", cor: "bg-green-500" },
]

const estatisticas = {
  alunosAtivos: 76,
  turmasAtivas: 5,
  aulasNoMes: 42,
  alunosFormados: 156,
  anosDeLecionar: 11,
}

const certificacoes = [
  { id: 1, nome: "Faixa Preta 3º Grau - CBJJ", data: "2022" },
  { id: 2, nome: "Instrutor de Defesa Pessoal", data: "2018" },
  { id: 3, nome: "Curso de Primeiros Socorros", data: "2023" },
  { id: 4, nome: "Treinador de Atletas - CBJJ", data: "2020" },
]

interface Titulo {
  id: number
  titulo: string
  competicao: string
  ano: string
}

const titulosIniciais: Titulo[] = [
  { id: 1, titulo: "Ouro", competicao: "Campeonato Brasileiro de Jiu-Jitsu", ano: "2022" },
  { id: 2, titulo: "Prata", competicao: "Campeonato Paulista", ano: "2021" },
  { id: 3, titulo: "Bronze", competicao: "Copa América", ano: "2020" },
]

export default function PerfilProfessorPage() {
  const [tab, setTab] = useState("dados")
  const [editando, setEditando] = useState(false)
  const [dialogFoto, setDialogFoto] = useState(false)
  const [dados, setDados] = useState(professorData)
  const [titulos, setTitulos] = useState<Titulo[]>(titulosIniciais)
  const [dialogTitulo, setDialogTitulo] = useState(false)
  const [novoTitulo, setNovoTitulo] = useState({ titulo: "", competicao: "", ano: "" })

  const getFaixaColor = (faixa: string) => {
    const cores: Record<string, string> = {
      "Branca": "bg-white text-black border border-gray-300",
      "Azul": "bg-blue-600 text-white",
      "Roxa": "bg-purple-600 text-white",
      "Marrom": "bg-amber-800 text-white",
      "Preta": "bg-black text-white border border-white/20",
    }
    return cores[faixa] || "bg-gray-500 text-white"
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
    <div className="p-4 space-y-4">
      {/* Header com Avatar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  CS
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                onClick={() => setDialogFoto(true)}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <h1 className="text-xl font-bold mt-4">{dados.nome}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={cn("text-sm", getFaixaColor(dados.faixa))}>
                {dados.faixa} - {dados.grau}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Professor desde {dados.dataAdmissao.split("/")[2]}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">{estatisticas.alunosAtivos}</p>
            <p className="text-xs text-muted-foreground">Alunos ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{estatisticas.turmasAtivas}</p>
            <p className="text-xs text-muted-foreground">Turmas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{estatisticas.aulasNoMes}</p>
            <p className="text-xs text-muted-foreground">Aulas/mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dados">
            <User className="h-4 w-4 mr-1" />
            Dados
          </TabsTrigger>
          <TabsTrigger value="modalidades">
            <Dumbbell className="h-4 w-4 mr-1" />
            Modalidades
          </TabsTrigger>
          <TabsTrigger value="titulos">
            <Trophy className="h-4 w-4 mr-1" />
            Títulos
          </TabsTrigger>
          <TabsTrigger value="certificacoes">
            <Award className="h-4 w-4 mr-1" />
            Cert.
          </TabsTrigger>
        </TabsList>

        {/* Dados Pessoais */}
        <TabsContent value="dados" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Dados Pessoais</CardTitle>
                {!editando ? (
                  <Button variant="ghost" size="sm" onClick={() => setEditando(true)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditando(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={() => setEditando(false)}>
                      <Save className="h-4 w-4 mr-1" />
                      Salvar
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editando ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome completo</label>
                    <Input 
                      value={dados.nome}
                      onChange={(e) => setDados({ ...dados, nome: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">E-mail</label>
                      <Input 
                        type="email"
                        value={dados.email}
                        onChange={(e) => setDados({ ...dados, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Telefone</label>
                      <Input 
                        value={dados.telefone}
                        onChange={(e) => setDados({ ...dados, telefone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Endereço</label>
                    <Input 
                      value={dados.endereco}
                      onChange={(e) => setDados({ ...dados, endereco: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bio</label>
                    <Textarea 
                      value={dados.bio}
                      onChange={(e) => setDados({ ...dados, bio: e.target.value })}
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">E-mail</p>
                      <p className="font-medium">{dados.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <p className="font-medium">{dados.telefone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Endereço</p>
                      <p className="font-medium">{dados.endereco}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Data de nascimento</p>
                      <p className="font-medium">{dados.dataNascimento}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Registro CBJJ</p>
                      <p className="font-medium">{dados.registro}</p>
                    </div>
                  </div>

                  {dados.bio && (
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-sm text-muted-foreground mb-1">Bio</p>
                      <p className="text-sm">{dados.bio}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modalidades */}
        <TabsContent value="modalidades" className="mt-4 space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                Modalidades que Leciono
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {modalidadesLecionadas.map((modalidade) => (
                <div 
                  key={modalidade.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                >
                  <div className={cn("w-2 h-10 rounded-full", modalidade.cor)} />
                  <div className="flex-1">
                    <p className="font-medium">{modalidade.nome}</p>
                    <p className="text-sm text-muted-foreground">{modalidade.nivel}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Resumo de Carreira */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Resumo de Carreira
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-secondary/50">
                  <p className="text-3xl font-bold text-primary">{estatisticas.anosDeLecionar}</p>
                  <p className="text-sm text-muted-foreground">Anos lecionando</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary/50">
                  <p className="text-3xl font-bold">{estatisticas.alunosFormados}</p>
                  <p className="text-sm text-muted-foreground">Alunos formados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meus Títulos */}
        <TabsContent value="titulos" className="mt-4 space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
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
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
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
        </TabsContent>

        {/* Certificações */}
        <TabsContent value="certificacoes" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Certificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {certificacoes.map((cert) => (
                <div 
                  key={cert.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{cert.nome}</p>
                    <p className="text-sm text-muted-foreground">{cert.data}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Foto */}
      <Dialog open={dialogFoto} onOpenChange={setDialogFoto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar foto de perfil</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                CS
              </AvatarFallback>
            </Avatar>
            <div className="flex gap-2">
              <Button variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                Tirar foto
              </Button>
              <Button>
                Escolher da galeria
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogFoto(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Adicionar Título */}
      <Dialog open={dialogTitulo} onOpenChange={setDialogTitulo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Título</DialogTitle>
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
    </div>
  )
}
