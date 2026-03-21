"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  Search,
  Building2,
  Users,
  MapPin,
  Trophy,
  ChevronRight,
  Medal,
  ArrowLeft,
  Instagram,
  Facebook,
  Globe,
  Phone,
  ChevronLeft,
  ChevronRightIcon,
} from "lucide-react"

// Dados simulados de academias do SaaS
const academias = [
  {
    id: "1",
    nome: "Gracie Barra São Paulo",
    cidade: "São Paulo",
    estado: "SP",
    descricao: "A Gracie Barra São Paulo é referência no ensino de Jiu-Jitsu brasileiro, com mais de 15 anos de tradição formando campeões em todas as categorias. Nossa metodologia única combina técnica, disciplina e respeito.",
    modalidades: ["Jiu-Jitsu", "No-Gi"],
    totalAtletas: 156,
    totalTitulos: 45,
    logo: null,
    imagem: "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=800&h=400&fit=crop",
    telefone: "(11) 99999-0001",
    instagram: "@graciebarrasp",
    facebook: "graciebarrasp",
    site: "www.graciebarrasp.com.br",
    atletas: [
      {
        id: "a1",
        nome: "Carlos Silva",
        faixa: "Preta",
        grau: "2º Grau",
        foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
        titulos: [
          { titulo: "Ouro", competicao: "Campeonato Brasileiro CBJJ", ano: "2024" },
          { titulo: "Prata", competicao: "Pan American", ano: "2023" },
          { titulo: "Bronze", competicao: "Campeonato Mundial IBJJF", ano: "2023" },
        ],
      },
      {
        id: "a2",
        nome: "Maria Santos",
        faixa: "Marrom",
        grau: "3º Grau",
        foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
        titulos: [
          { titulo: "Ouro", competicao: "Campeonato Paulista", ano: "2024" },
          { titulo: "Ouro", competicao: "Copa São Paulo", ano: "2023" },
        ],
      },
      {
        id: "a3",
        nome: "João Pereira",
        faixa: "Roxa",
        grau: "2º Grau",
        foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
        titulos: [
          { titulo: "Ouro", competicao: "Copa Kids CBJJ", ano: "2024" },
        ],
      },
      {
        id: "a4",
        nome: "Lucas Mendes",
        faixa: "Preta",
        grau: "1º Grau",
        foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
        titulos: [
          { titulo: "Ouro", competicao: "Campeonato Brasileiro CBJJ", ano: "2023" },
          { titulo: "Prata", competicao: "Campeonato Paulista", ano: "2024" },
        ],
      },
    ],
  },
  {
    id: "2",
    nome: "Alliance Rio de Janeiro",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    descricao: "A Alliance Rio de Janeiro é uma das academias mais tradicionais do Brasil, berço de diversos campeões mundiais. Nossa equipe conta com professores renomados e uma infraestrutura de ponta.",
    modalidades: ["Jiu-Jitsu", "No-Gi", "Wrestling"],
    totalAtletas: 230,
    totalTitulos: 78,
    logo: null,
    imagem: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop",
    telefone: "(21) 99999-0002",
    instagram: "@alliancerj",
    facebook: "alliancerj",
    site: "www.alliancerj.com.br",
    atletas: [
      {
        id: "a5",
        nome: "Pedro Costa",
        faixa: "Preta",
        grau: "3º Grau",
        foto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
        titulos: [
          { titulo: "Ouro", competicao: "Campeonato Mundial IBJJF", ano: "2024" },
          { titulo: "Ouro", competicao: "Pan American", ano: "2024" },
          { titulo: "Ouro", competicao: "Campeonato Brasileiro CBJJ", ano: "2023" },
        ],
      },
      {
        id: "a6",
        nome: "Ana Oliveira",
        faixa: "Preta",
        grau: "1º Grau",
        foto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
        titulos: [
          { titulo: "Ouro", competicao: "Campeonato Mundial IBJJF (Feminino)", ano: "2024" },
          { titulo: "Prata", competicao: "Pan American (Feminino)", ano: "2024" },
        ],
      },
    ],
  },
  {
    id: "3",
    nome: "Checkmat Belo Horizonte",
    cidade: "Belo Horizonte",
    estado: "MG",
    descricao: "A Checkmat BH representa a tradição mineira no Jiu-Jitsu, com foco no desenvolvimento técnico e competitivo de nossos atletas desde as categorias de base.",
    modalidades: ["Jiu-Jitsu", "No-Gi"],
    totalAtletas: 89,
    totalTitulos: 23,
    logo: null,
    imagem: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=400&fit=crop",
    telefone: "(31) 99999-0003",
    instagram: "@checkmatbh",
    facebook: "checkmatbh",
    site: "www.checkmatbh.com.br",
    atletas: [
      {
        id: "a7",
        nome: "Lucas Ferreira",
        faixa: "Marrom",
        grau: "2º Grau",
        foto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop",
        titulos: [
          { titulo: "Ouro", competicao: "Campeonato Mineiro", ano: "2024" },
          { titulo: "Prata", competicao: "Campeonato Brasileiro CBJJ", ano: "2024" },
        ],
      },
    ],
  },
  {
    id: "4",
    nome: "Atos Curitiba",
    cidade: "Curitiba",
    estado: "PR",
    descricao: "A Atos Curitiba traz para o sul do Brasil a metodologia de uma das equipes mais vencedoras do mundo, com foco em competição e desenvolvimento integral do atleta.",
    modalidades: ["Jiu-Jitsu", "No-Gi", "MMA"],
    totalAtletas: 112,
    totalTitulos: 34,
    logo: null,
    imagem: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&h=400&fit=crop",
    telefone: "(41) 99999-0004",
    instagram: "@atoscuritiba",
    facebook: "atoscuritiba",
    site: "www.atoscuritiba.com.br",
    atletas: [
      {
        id: "a8",
        nome: "Rafael Lima",
        faixa: "Preta",
        grau: "1º Grau",
        foto: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&h=200&fit=crop",
        titulos: [
          { titulo: "Ouro", competicao: "Campeonato Sul-Brasileiro", ano: "2024" },
          { titulo: "Ouro", competicao: "Copa Paraná", ano: "2024" },
          { titulo: "Bronze", competicao: "Campeonato Brasileiro CBJJ", ano: "2023" },
        ],
      },
      {
        id: "a9",
        nome: "Fernanda Souza",
        faixa: "Roxa",
        grau: "3º Grau",
        foto: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=200&h=200&fit=crop",
        titulos: [
          { titulo: "Ouro", competicao: "Copa Paraná (Feminino)", ano: "2024" },
        ],
      },
    ],
  },
  {
    id: "5",
    nome: "Nova União Porto Alegre",
    cidade: "Porto Alegre",
    estado: "RS",
    descricao: "A Nova União POA é referência no Rio Grande do Sul, formando atletas completos com base técnica sólida e mentalidade competitiva.",
    modalidades: ["Jiu-Jitsu", "Muay Thai"],
    totalAtletas: 78,
    totalTitulos: 19,
    logo: null,
    imagem: "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800&h=400&fit=crop",
    telefone: "(51) 99999-0005",
    instagram: "@novauniaopoa",
    facebook: "novauniaopoa",
    site: "www.novauniaopoa.com.br",
    atletas: [
      {
        id: "a10",
        nome: "Marcos Ribeiro",
        faixa: "Marrom",
        grau: "4º Grau",
        foto: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop",
        titulos: [
          { titulo: "Ouro", competicao: "Campeonato Gaúcho", ano: "2024" },
          { titulo: "Prata", competicao: "Campeonato Sul-Brasileiro", ano: "2024" },
        ],
      },
    ],
  },
]

const estados = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
]

const modalidades = [
  { id: "all", nome: "Todas", icone: "Trophy" },
  { id: "jiu-jitsu", nome: "Jiu-Jitsu", icone: "🥋" },
  { id: "no-gi", nome: "No-Gi", icone: "🤼" },
  { id: "muay-thai", nome: "Muay Thai", icone: "🥊" },
  { id: "boxing", nome: "Boxe", icone: "🥊" },
  { id: "mma", nome: "MMA", icone: "🦾" },
  { id: "wrestling", nome: "Wrestling", icone: "🤼" },
  { id: "judo", nome: "Judô", icone: "🥋" },
  { id: "karate", nome: "Karatê", icone: "🥋" },
]

type Academia = typeof academias[0]
type Atleta = Academia["atletas"][0]

export default function ExplorerPage() {
  const [search, setSearch] = useState("")
  const [estado, setEstado] = useState<string>("all")
  const [modalidade, setModalidade] = useState<string>("all")
  const [academiaSelecionada, setAcademiaSelecionada] = useState<Academia | null>(null)
  const [carouselIndex, setCarouselIndex] = useState(0)

  const getFaixaColor = (faixa: string) => {
    const cores: Record<string, string> = {
      "Branca": "bg-white text-foreground border border-border",
      "Azul": "bg-blue-600 text-white",
      "Roxa": "bg-purple-600 text-white",
      "Marrom": "bg-amber-800 text-white",
      "Preta": "bg-black text-white",
    }
    return cores[faixa] || "bg-muted text-muted-foreground"
  }

  const getTituloColor = (titulo: string) => {
    const cores: Record<string, string> = {
      "Ouro": "text-yellow-500",
      "Prata": "text-gray-400",
      "Bronze": "text-amber-600",
    }
    return cores[titulo] || "text-primary"
  }

  const getTituloBg = (titulo: string) => {
    const cores: Record<string, string> = {
      "Ouro": "bg-yellow-500/10",
      "Prata": "bg-gray-400/10",
      "Bronze": "bg-amber-600/10",
    }
    return cores[titulo] || "bg-primary/10"
  }

  // Filtrar academias pelo termo de busca, estado e modalidade
  const academiasFiltradas = academias.filter((academia) => {
    const matchesSearch =
      academia.nome.toLowerCase().includes(search.toLowerCase()) ||
      academia.cidade.toLowerCase().includes(search.toLowerCase()) ||
      academia.atletas.some((atleta) =>
        atleta.nome.toLowerCase().includes(search.toLowerCase())
      )
    const matchesEstado = estado === "all" || academia.estado === estado
    const matchesModalidade = modalidade === "all" || academia.modalidades.some(
      (mod) => mod.toLowerCase().replace("-", " ").includes(modalidade.replace("-", " "))
    )
    return matchesSearch && matchesEstado && matchesModalidade
  })

  const handleNextCarousel = () => {
    if (academiaSelecionada) {
      const maxIndex = Math.max(0, academiaSelecionada.atletas.length - 3)
      setCarouselIndex((prev) => Math.min(prev + 1, maxIndex))
    }
  }

  const handlePrevCarousel = () => {
    setCarouselIndex((prev) => Math.max(prev - 1, 0))
  }

  const handleSelectAcademia = (academia: Academia) => {
    setAcademiaSelecionada(academia)
    setCarouselIndex(0)
  }

  // Página da Academia Selecionada
  if (academiaSelecionada) {
    const visibleAtletas = academiaSelecionada.atletas.slice(carouselIndex, carouselIndex + 3)
    const canGoNext = carouselIndex < academiaSelecionada.atletas.length - 3
    const canGoPrev = carouselIndex > 0

    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        {/* Header com imagem de fundo */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img
            src={academiaSelecionada.imagem}
            alt={academiaSelecionada.nome}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          {/* Botão voltar */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onClick={() => setAcademiaSelecionada(null)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Info da academia sobreposta */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
            <div className="flex items-end gap-4">
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-background flex items-center justify-center shadow-lg border border-border">
                <Building2 className="h-10 w-10 md:h-12 md:w-12 text-primary" />
              </div>
              <div className="flex-1 pb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {academiaSelecionada.nome}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{academiaSelecionada.cidade}, {academiaSelecionada.estado}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 p-4 md:p-6">
          {/* Stats */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{academiaSelecionada.totalAtletas}</p>
                <p className="text-xs text-muted-foreground">Atletas</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{academiaSelecionada.totalTitulos}</p>
                <p className="text-xs text-muted-foreground">Títulos</p>
              </div>
            </div>
          </div>

          {/* Descrição */}
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {academiaSelecionada.descricao}
          </p>

          {/* Redes Sociais */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {academiaSelecionada.instagram && (
              <Button variant="outline" size="sm" className="gap-2">
                <Instagram className="h-4 w-4" />
                {academiaSelecionada.instagram}
              </Button>
            )}
            {academiaSelecionada.facebook && (
              <Button variant="outline" size="sm" className="gap-2">
                <Facebook className="h-4 w-4" />
                {academiaSelecionada.facebook}
              </Button>
            )}
            {academiaSelecionada.site && (
              <Button variant="outline" size="sm" className="gap-2">
                <Globe className="h-4 w-4" />
                {academiaSelecionada.site}
              </Button>
            )}
            {academiaSelecionada.telefone && (
              <Button variant="outline" size="sm" className="gap-2">
                <Phone className="h-4 w-4" />
                {academiaSelecionada.telefone}
              </Button>
            )}
          </div>

          {/* Modalidades */}
          <div className="flex flex-wrap gap-2 mb-8">
            {academiaSelecionada.modalidades.map((mod) => (
              <Badge key={mod} variant="secondary" className="px-3 py-1">
                {mod}
              </Badge>
            ))}
          </div>

          {/* Carrossel de Atletas */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Medal className="h-5 w-5 text-primary" />
                Atletas Campeões
              </h2>
              {academiaSelecionada.atletas.length > 3 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handlePrevCarousel}
                    disabled={!canGoPrev}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleNextCarousel}
                    disabled={!canGoNext}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Grid de Cards dos Atletas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleAtletas.map((atleta) => (
                <Card key={atleta.id} className="overflow-hidden group">
                  {/* Imagem do Atleta */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={atleta.foto}
                      alt={atleta.nome}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Info sobreposta */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-lg font-semibold text-white">{atleta.nome}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={cn("text-xs", getFaixaColor(atleta.faixa))}>
                          {atleta.faixa} - {atleta.grau}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Títulos */}
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{atleta.titulos.length} títulos</span>
                    </div>
                    <div className="space-y-2">
                      {atleta.titulos.map((titulo, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-lg",
                            getTituloBg(titulo.titulo)
                          )}
                        >
                          <Medal className={cn("h-4 w-4", getTituloColor(titulo.titulo))} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {titulo.titulo} - {titulo.competicao}
                            </p>
                            <p className="text-xs text-muted-foreground">{titulo.ano}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Indicadores do carrossel (mobile) */}
            {academiaSelecionada.atletas.length > 3 && (
              <div className="flex justify-center gap-1 mt-4 md:hidden">
                {Array.from({ length: Math.ceil(academiaSelecionada.atletas.length / 3) }).map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "h-2 w-2 rounded-full transition-colors",
                      Math.floor(carouselIndex / 3) === idx ? "bg-primary" : "bg-muted"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Página de Busca
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-4 md:p-6">
      {/* Header */}
      <div className="text-center mb-8 pt-8">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4">
          <Trophy className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Ranking de Academias</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Pesquise e descubra academias e seus atletas campeões cadastrados na plataforma
        </p>
      </div>

      {/* Seletor de Modalidades */}
      <div className="max-w-3xl mx-auto w-full mb-6">
        <div className="flex flex-wrap justify-center gap-2">
          {modalidades.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setModalidade(mod.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                "border hover:shadow-md",
                modalidade === mod.id
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-background text-foreground border-border hover:border-primary/50"
              )}
            >
              {mod.id === "all" ? (
                <Trophy className="h-4 w-4" />
              ) : (
                <span className="text-base">{mod.icone}</span>
              )}
              {mod.nome}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto w-full mb-8">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar academia ou atleta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>
          <Select value={estado} onValueChange={setEstado}>
            <SelectTrigger className="w-full sm:w-[140px] h-12">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {estados.map((uf) => (
                <SelectItem key={uf} value={uf}>
                  {uf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resultados */}
      {(search || estado !== "all" || modalidade !== "all") && (
        <div className="max-w-2xl mx-auto w-full">
          {academiasFiltradas.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                {academiasFiltradas.length} academia{academiasFiltradas.length !== 1 ? "s" : ""} encontrada{academiasFiltradas.length !== 1 ? "s" : ""}
              </p>
              {academiasFiltradas.map((academia) => (
                <Card
                  key={academia.id}
                  className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                  onClick={() => handleSelectAcademia(academia)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{academia.nome}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {academia.cidade}, {academia.estado}
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-lg font-bold">{academia.totalAtletas}</p>
                          <p className="text-xs text-muted-foreground">atletas</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-yellow-500">{academia.totalTitulos}</p>
                          <p className="text-xs text-muted-foreground">títulos</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">Nenhuma academia encontrada</p>
              <p className="text-sm text-muted-foreground/70">Tente ajustar os termos de busca</p>
            </div>
          )}
        </div>
      )}

      {/* Estado inicial - Sugestões */}
      {!search && estado === "all" && modalidade === "all" && (
        <div className="max-w-2xl mx-auto w-full">
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Ou selecione uma das academias em destaque
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {academias.slice(0, 4).map((academia) => (
              <Card
                key={academia.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                onClick={() => handleSelectAcademia(academia)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{academia.nome}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {academia.totalAtletas}
                        </span>
                        <span className="flex items-center gap-1">
                          <Trophy className="h-3 w-3 text-yellow-500" />
                          {academia.totalTitulos}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
