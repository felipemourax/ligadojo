"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  Search,
  Check,
  X,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Save,
} from "lucide-react"

// Dados simulados
const turmas = [
  { id: 1, nome: "Jiu-Jitsu Adulto", horario: "08:00", alunos: 14, status: "aberta" },
  { id: 2, nome: "Jiu-Jitsu Kids", horario: "10:00", alunos: 12, status: "aguardando" },
  { id: 3, nome: "No-Gi", horario: "14:00", alunos: 8, status: "aguardando" },
  { id: 4, nome: "Jiu-Jitsu Avançado", horario: "19:00", alunos: 10, status: "aguardando" },
]

const alunosTurma: Record<number, Array<{
  id: number
  nome: string
  faixa: string
  presenca: "presente" | "falta" | "justificado" | null
  observacao?: string
}>> = {
  1: [
    { id: 1, nome: "Pedro Santos", faixa: "Azul", presenca: "presente" },
    { id: 2, nome: "Ana Costa", faixa: "Branca", presenca: "presente" },
    { id: 3, nome: "Lucas Oliveira", faixa: "Azul", presenca: "falta" },
    { id: 4, nome: "Maria Silva", faixa: "Roxa", presenca: "presente" },
    { id: 5, nome: "João Pereira", faixa: "Branca", presenca: null },
    { id: 6, nome: "Carla Souza", faixa: "Azul", presenca: null },
    { id: 7, nome: "Rafael Lima", faixa: "Branca", presenca: null },
    { id: 8, nome: "Fernanda Alves", faixa: "Azul", presenca: null },
    { id: 9, nome: "Bruno Martins", faixa: "Roxa", presenca: null },
    { id: 10, nome: "Julia Santos", faixa: "Branca", presenca: null },
    { id: 11, nome: "Diego Costa", faixa: "Azul", presenca: "justificado", observacao: "Atestado médico" },
    { id: 12, nome: "Amanda Oliveira", faixa: "Branca", presenca: null },
    { id: 13, nome: "Thiago Silva", faixa: "Marrom", presenca: null },
    { id: 14, nome: "Camila Pereira", faixa: "Azul", presenca: null },
  ],
  2: [
    { id: 15, nome: "Miguel Junior", faixa: "Branca", presenca: null },
    { id: 16, nome: "Sofia Santos", faixa: "Branca", presenca: null },
    { id: 17, nome: "Gabriel Lima", faixa: "Cinza", presenca: null },
    { id: 18, nome: "Laura Costa", faixa: "Branca", presenca: null },
    { id: 19, nome: "Enzo Oliveira", faixa: "Amarela", presenca: null },
    { id: 20, nome: "Valentina Silva", faixa: "Branca", presenca: null },
  ],
  3: [],
  4: [],
}

export default function PresencaProfessorPage() {
  const [turmaSelecionada, setTurmaSelecionada] = useState<number>(1)
  const [busca, setBusca] = useState("")
  const [presencas, setPresencas] = useState<Record<number, "presente" | "falta" | "justificado" | null>>({})
  const [chamadaFinalizada, setChamadaFinalizada] = useState(false)
  const [dialogConfirmar, setDialogConfirmar] = useState(false)
  const [dialogReabrir, setDialogReabrir] = useState(false)

  const turmaAtual = turmas.find(t => t.id === turmaSelecionada)
  const alunos = alunosTurma[turmaSelecionada] || []
  
  const alunosFiltrados = alunos.filter(a => 
    a.nome.toLowerCase().includes(busca.toLowerCase())
  )

  const getPresenca = (alunoId: number) => {
    if (presencas[alunoId] !== undefined) return presencas[alunoId]
    const aluno = alunos.find(a => a.id === alunoId)
    return aluno?.presenca || null
  }

  const setPresenca = (alunoId: number, status: "presente" | "falta" | "justificado") => {
    setPresencas(prev => ({ ...prev, [alunoId]: status }))
  }

  const marcarTodosPresentes = () => {
    const novasPresencas: Record<number, "presente"> = {}
    alunos.forEach(a => {
      if (getPresenca(a.id) === null) {
        novasPresencas[a.id] = "presente"
      }
    })
    setPresencas(prev => ({ ...prev, ...novasPresencas }))
  }

  const limparPresencas = () => {
    const novasPresencas: Record<number, null> = {}
    alunos.forEach(a => {
      novasPresencas[a.id] = null
    })
    setPresencas(prev => ({ ...prev, ...novasPresencas }))
  }

  const finalizarChamada = () => {
    setChamadaFinalizada(true)
    setDialogConfirmar(false)
  }

  const reabrirChamada = () => {
    setChamadaFinalizada(false)
    setDialogReabrir(false)
  }

  const contadores = {
    presentes: alunos.filter(a => getPresenca(a.id) === "presente").length,
    faltas: alunos.filter(a => getPresenca(a.id) === "falta").length,
    justificados: alunos.filter(a => getPresenca(a.id) === "justificado").length,
    pendentes: alunos.filter(a => getPresenca(a.id) === null).length,
  }

  const getFaixaColor = (faixa: string) => {
    const cores: Record<string, string> = {
      "Branca": "bg-white text-black border border-gray-300",
      "Cinza": "bg-gray-400 text-white",
      "Amarela": "bg-yellow-400 text-black",
      "Laranja": "bg-orange-500 text-white",
      "Verde": "bg-green-600 text-white",
      "Azul": "bg-blue-600 text-white",
      "Roxa": "bg-purple-600 text-white",
      "Marrom": "bg-amber-800 text-white",
      "Preta": "bg-black text-white border border-white/20",
    }
    return cores[faixa] || "bg-gray-500 text-white"
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Presença</h1>
        <p className="text-muted-foreground">Registre a presença dos alunos</p>
      </div>

      {/* Seletor de Turma */}
      <Card>
        <CardContent className="p-4">
          <Select 
            value={turmaSelecionada.toString()} 
            onValueChange={(v) => setTurmaSelecionada(parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a turma" />
            </SelectTrigger>
            <SelectContent>
              {turmas.map((turma) => (
                <SelectItem key={turma.id} value={turma.id.toString()}>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{turma.horario}</span>
                    <span className="font-medium">{turma.nome}</span>
                    <Badge variant="outline" className="ml-2">
                      {turma.alunos} alunos
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Status da Chamada */}
      {chamadaFinalizada && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-green-500">Chamada finalizada</span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setDialogReabrir(true)}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reabrir
          </Button>
        </div>
      )}

      {/* Contadores */}
      <div className="grid grid-cols-4 gap-2">
        <div className="text-center p-2 rounded-lg bg-green-500/10 border border-green-500/20">
          <p className="text-lg font-bold text-green-500">{contadores.presentes}</p>
          <p className="text-[10px] text-muted-foreground">Presentes</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-lg font-bold text-red-500">{contadores.faltas}</p>
          <p className="text-[10px] text-muted-foreground">Faltas</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <p className="text-lg font-bold text-yellow-500">{contadores.justificados}</p>
          <p className="text-[10px] text-muted-foreground">Justificados</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-secondary">
          <p className="text-lg font-bold text-muted-foreground">{contadores.pendentes}</p>
          <p className="text-[10px] text-muted-foreground">Pendentes</p>
        </div>
      </div>

      {/* Ações Rápidas */}
      {!chamadaFinalizada && (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={marcarTodosPresentes}
          >
            <Check className="h-4 w-4 mr-1" />
            Marcar todos presentes
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={limparPresencas}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar aluno..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Lista de Alunos */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            {turmaAtual?.nome}
            <Badge variant="outline">{alunos.length} alunos</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {alunosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum aluno encontrado</p>
            </div>
          ) : (
            alunosFiltrados.map((aluno) => {
              const presencaAtual = getPresenca(aluno.id)
              
              return (
                <div
                  key={aluno.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-colors",
                    presencaAtual === "presente" && "bg-green-500/10 border border-green-500/20",
                    presencaAtual === "falta" && "bg-red-500/10 border border-red-500/20",
                    presencaAtual === "justificado" && "bg-yellow-500/10 border border-yellow-500/20",
                    presencaAtual === null && "bg-secondary/50"
                  )}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={cn(
                      "text-xs",
                      presencaAtual === "presente" && "bg-green-500/20 text-green-500",
                      presencaAtual === "falta" && "bg-red-500/20 text-red-500",
                      presencaAtual === "justificado" && "bg-yellow-500/20 text-yellow-500",
                      presencaAtual === null && "bg-primary/20 text-primary",
                    )}>
                      {aluno.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{aluno.nome}</p>
                      <Badge className={cn("text-[10px] px-1.5", getFaixaColor(aluno.faixa))}>
                        {aluno.faixa}
                      </Badge>
                    </div>
                    {aluno.observacao && (
                      <p className="text-xs text-muted-foreground">{aluno.observacao}</p>
                    )}
                  </div>

                  {!chamadaFinalizada ? (
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant={presencaAtual === "presente" ? "default" : "outline"}
                        className={cn(
                          "h-9 w-9",
                          presencaAtual === "presente" && "bg-green-600 hover:bg-green-700"
                        )}
                        onClick={() => setPresenca(aluno.id, "presente")}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant={presencaAtual === "falta" ? "default" : "outline"}
                        className={cn(
                          "h-9 w-9",
                          presencaAtual === "falta" && "bg-red-600 hover:bg-red-700"
                        )}
                        onClick={() => setPresenca(aluno.id, "falta")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant={presencaAtual === "justificado" ? "default" : "outline"}
                        className={cn(
                          "h-9 w-9",
                          presencaAtual === "justificado" && "bg-yellow-600 hover:bg-yellow-700"
                        )}
                        onClick={() => setPresenca(aluno.id, "justificado")}
                      >
                        <AlertCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      {presencaAtual === "presente" && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      {presencaAtual === "falta" && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      {presencaAtual === "justificado" && (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                      {presencaAtual === null && (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* Botão Finalizar */}
      {!chamadaFinalizada && contadores.pendentes === 0 && (
        <Button 
          className="w-full" 
          size="lg"
          onClick={() => setDialogConfirmar(true)}
        >
          <Save className="h-5 w-5 mr-2" />
          Finalizar Chamada
        </Button>
      )}

      {/* Dialog Confirmar */}
      <Dialog open={dialogConfirmar} onOpenChange={setDialogConfirmar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Chamada</DialogTitle>
            <DialogDescription>
              Confirma a finalização da chamada para {turmaAtual?.nome}?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="text-center p-3 rounded-lg bg-green-500/10">
              <p className="text-2xl font-bold text-green-500">{contadores.presentes}</p>
              <p className="text-sm text-muted-foreground">Presentes</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-500/10">
              <p className="text-2xl font-bold text-red-500">{contadores.faltas}</p>
              <p className="text-sm text-muted-foreground">Faltas</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-yellow-500/10">
              <p className="text-2xl font-bold text-yellow-500">{contadores.justificados}</p>
              <p className="text-sm text-muted-foreground">Justificados</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogConfirmar(false)}>
              Cancelar
            </Button>
            <Button onClick={finalizarChamada}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Reabrir */}
      <Dialog open={dialogReabrir} onOpenChange={setDialogReabrir}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reabrir Chamada</DialogTitle>
            <DialogDescription>
              Deseja reabrir a chamada para editar as presenças?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogReabrir(false)}>
              Cancelar
            </Button>
            <Button onClick={reabrirChamada}>
              Reabrir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
