"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Flame,
  Award,
  ChevronDown,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const historicoMensal = [
  { mes: "Março 2026", presencas: 18, faltas: 2, total: 20 },
  { mes: "Fevereiro 2026", presencas: 16, faltas: 4, total: 20 },
  { mes: "Janeiro 2026", presencas: 14, faltas: 6, total: 20 },
  { mes: "Dezembro 2025", presencas: 12, faltas: 4, total: 16 },
]

const historicoAulas = [
  { id: 1, data: "17/03/2026", horario: "19:00", modalidade: "Jiu-Jitsu", professor: "Prof. Carlos", status: "presente" },
  { id: 2, data: "16/03/2026", horario: "19:00", modalidade: "No-Gi", professor: "Prof. Ricardo", status: "presente" },
  { id: 3, data: "15/03/2026", horario: "10:00", modalidade: "Open Mat", professor: "-", status: "presente" },
  { id: 4, data: "14/03/2026", horario: "19:00", modalidade: "Jiu-Jitsu", professor: "Prof. Carlos", status: "presente" },
  { id: 5, data: "13/03/2026", horario: "19:00", modalidade: "Muay Thai", professor: "Prof. André", status: "falta" },
  { id: 6, data: "12/03/2026", horario: "19:00", modalidade: "Jiu-Jitsu", professor: "Prof. Ricardo", status: "presente" },
  { id: 7, data: "11/03/2026", horario: "19:00", modalidade: "Jiu-Jitsu", professor: "Prof. Carlos", status: "presente" },
  { id: 8, data: "10/03/2026", horario: "19:00", modalidade: "No-Gi", professor: "Prof. Ricardo", status: "presente" },
  { id: 9, data: "09/03/2026", horario: "10:00", modalidade: "Open Mat", professor: "-", status: "falta" },
  { id: 10, data: "08/03/2026", horario: "19:00", modalidade: "Jiu-Jitsu", professor: "Prof. Carlos", status: "presente" },
]

const graduacoes = [
  { id: 1, faixa: "Azul", graus: 2, data: "15/01/2026", professor: "Prof. Carlos" },
  { id: 2, faixa: "Azul", graus: 1, data: "10/08/2025", professor: "Prof. Carlos" },
  { id: 3, faixa: "Azul", graus: 0, data: "05/03/2025", professor: "Prof. Carlos" },
  { id: 4, faixa: "Branca", graus: 4, data: "20/11/2024", professor: "Prof. Ricardo" },
  { id: 5, faixa: "Branca", graus: 3, data: "15/07/2024", professor: "Prof. Ricardo" },
  { id: 6, faixa: "Branca", graus: 2, data: "10/03/2024", professor: "Prof. Ricardo" },
  { id: 7, faixa: "Branca", graus: 1, data: "01/12/2023", professor: "Prof. Ricardo" },
  { id: 8, faixa: "Branca", graus: 0, data: "15/08/2023", professor: "Prof. Ricardo" },
]

const getFaixaColor = (faixa: string) => {
  switch (faixa.toLowerCase()) {
    case "branca":
      return "bg-white"
    case "azul":
      return "bg-blue-500"
    case "roxa":
      return "bg-purple-600"
    case "marrom":
      return "bg-amber-800"
    case "preta":
      return "bg-black"
    default:
      return "bg-gray-500"
  }
}

export default function HistoricoPage() {
  const [filtroModalidade, setFiltroModalidade] = useState<string | null>(null)

  const aulasExibidas = filtroModalidade
    ? historicoAulas.filter((aula) => aula.modalidade === filtroModalidade)
    : historicoAulas

  const modalidades = [...new Set(historicoAulas.map((a) => a.modalidade))]

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold">Histórico</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe sua evolução na academia
        </p>
      </div>

      {/* Stats Rápidas */}
      <div className="p-4 border-b border-border">
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <Flame className="h-4 w-4" />
              </div>
              <p className="text-xl font-bold">15</p>
              <p className="text-[10px] text-muted-foreground uppercase">
                Sequência
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <TrendingUp className="h-4 w-4" />
              </div>
              <p className="text-xl font-bold">90%</p>
              <p className="text-[10px] text-muted-foreground uppercase">
                Frequência
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <Award className="h-4 w-4" />
              </div>
              <p className="text-xl font-bold">8</p>
              <p className="text-[10px] text-muted-foreground uppercase">
                Graduações
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="presencas" className="flex-1">
        <div className="px-4 pt-4">
          <TabsList className="w-full">
            <TabsTrigger value="presencas" className="flex-1">
              Presenças
            </TabsTrigger>
            <TabsTrigger value="graduacoes" className="flex-1">
              Graduações
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="presencas" className="p-4 space-y-4">
          {/* Resumo Mensal */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Resumo mensal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {historicoMensal.slice(0, 3).map((mes) => (
                <div key={mes.mes}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{mes.mes}</span>
                    <span className="text-sm text-muted-foreground">
                      {mes.presencas}/{mes.total} ({Math.round((mes.presencas / mes.total) * 100)}%)
                    </span>
                  </div>
                  <Progress
                    value={(mes.presencas / mes.total) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Filtro */}
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Últimas aulas</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  {filtroModalidade || "Todas"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por modalidade</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFiltroModalidade(null)}>
                  Todas as modalidades
                </DropdownMenuItem>
                {modalidades.map((mod) => (
                  <DropdownMenuItem
                    key={mod}
                    onClick={() => setFiltroModalidade(mod)}
                  >
                    {mod}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Lista de Aulas */}
          <div className="space-y-2">
            {aulasExibidas.map((aula) => (
              <Card key={aula.id}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                        aula.status === "presente"
                          ? "bg-primary/20 text-primary"
                          : "bg-destructive/20 text-destructive"
                      )}
                    >
                      {aula.status === "presente" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{aula.modalidade}</p>
                        <Badge
                          variant={aula.status === "presente" ? "default" : "destructive"}
                          className="text-[10px] shrink-0"
                        >
                          {aula.status === "presente" ? "Presente" : "Falta"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {aula.data}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {aula.horario}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="graduacoes" className="p-4 space-y-4">
          {/* Graduação Atual */}
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-4 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Graduação atual</p>
                  <p className="text-lg font-bold">Faixa Azul - 2 graus</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Desde 15/01/2026
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline de Graduações */}
          <div>
            <h3 className="font-medium mb-3">Histórico de graduações</h3>
            <div className="relative">
              {/* Linha vertical */}
              <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-4">
                {graduacoes.map((grad, index) => (
                  <div key={grad.id} className="flex gap-4 relative">
                    {/* Marcador */}
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full border-4 border-background shrink-0 z-10",
                        getFaixaColor(grad.faixa)
                      )}
                    />
                    {/* Conteúdo */}
                    <Card className="flex-1">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              Faixa {grad.faixa}
                              {grad.graus > 0 && ` - ${grad.graus} grau${grad.graus > 1 ? "s" : ""}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {grad.professor}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {grad.data}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
