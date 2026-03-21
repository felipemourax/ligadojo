"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Package,
  CreditCard,
  Truck,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const categorias = [
  { id: "todos", label: "Todos" },
  { id: "kimonos", label: "Kimonos" },
  { id: "rashguards", label: "Rashguards" },
  { id: "shorts", label: "Shorts" },
  { id: "acessorios", label: "Acessórios" },
]

const produtos = [
  { id: 1, nome: "Kimono Adulto Branco", categoria: "kimonos", preco: 299.90, precoAntigo: 349.90, imagem: "/placeholder.svg", tamanhos: ["A1", "A2", "A3", "A4"], estoque: 5 },
  { id: 2, nome: "Kimono Adulto Azul", categoria: "kimonos", preco: 319.90, imagem: "/placeholder.svg", tamanhos: ["A1", "A2", "A3", "A4"], estoque: 3 },
  { id: 3, nome: "Rashguard Manga Longa", categoria: "rashguards", preco: 149.90, imagem: "/placeholder.svg", tamanhos: ["P", "M", "G", "GG"], estoque: 10 },
  { id: 4, nome: "Rashguard Manga Curta", categoria: "rashguards", preco: 129.90, imagem: "/placeholder.svg", tamanhos: ["P", "M", "G", "GG"], estoque: 8 },
  { id: 5, nome: "Short No-Gi", categoria: "shorts", preco: 99.90, imagem: "/placeholder.svg", tamanhos: ["P", "M", "G", "GG"], estoque: 12 },
  { id: 6, nome: "Short Muay Thai", categoria: "shorts", preco: 89.90, precoAntigo: 109.90, imagem: "/placeholder.svg", tamanhos: ["P", "M", "G", "GG"], estoque: 6 },
  { id: 7, nome: "Faixa Branca", categoria: "acessorios", preco: 39.90, imagem: "/placeholder.svg", tamanhos: ["A1", "A2", "A3", "A4"], estoque: 20 },
  { id: 8, nome: "Faixa Azul", categoria: "acessorios", preco: 49.90, imagem: "/placeholder.svg", tamanhos: ["A1", "A2", "A3", "A4"], estoque: 15 },
  { id: 9, nome: "Protetor Bucal", categoria: "acessorios", preco: 29.90, imagem: "/placeholder.svg", tamanhos: ["Único"], estoque: 30 },
  { id: 10, nome: "Bag Grande", categoria: "acessorios", preco: 159.90, imagem: "/placeholder.svg", tamanhos: ["Único"], estoque: 4 },
]

type CartItem = {
  produto: typeof produtos[0]
  tamanho: string
  quantidade: number
}

export default function LojaPage() {
  const [categoriaAtiva, setCategoriaAtiva] = useState("todos")
  const [busca, setBusca] = useState("")
  const [carrinho, setCarrinho] = useState<CartItem[]>([])
  const [produtoSelecionado, setProdutoSelecionado] = useState<typeof produtos[0] | null>(null)
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<string>("")
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)

  const produtosFiltrados = produtos.filter((p) => {
    const matchCategoria = categoriaAtiva === "todos" || p.categoria === categoriaAtiva
    const matchBusca = p.nome.toLowerCase().includes(busca.toLowerCase())
    return matchCategoria && matchBusca
  })

  const totalCarrinho = carrinho.reduce(
    (acc, item) => acc + item.produto.preco * item.quantidade,
    0
  )

  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0)

  const adicionarAoCarrinho = () => {
    if (!produtoSelecionado || !tamanhoSelecionado) return

    const itemExistente = carrinho.find(
      (item) =>
        item.produto.id === produtoSelecionado.id &&
        item.tamanho === tamanhoSelecionado
    )

    if (itemExistente) {
      setCarrinho(
        carrinho.map((item) =>
          item.produto.id === produtoSelecionado.id &&
          item.tamanho === tamanhoSelecionado
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        )
      )
    } else {
      setCarrinho([
        ...carrinho,
        { produto: produtoSelecionado, tamanho: tamanhoSelecionado, quantidade: 1 },
      ])
    }

    setProdutoSelecionado(null)
    setTamanhoSelecionado("")
  }

  const removerDoCarrinho = (produtoId: number, tamanho: string) => {
    setCarrinho(
      carrinho.filter(
        (item) => !(item.produto.id === produtoId && item.tamanho === tamanho)
      )
    )
  }

  const atualizarQuantidade = (produtoId: number, tamanho: string, delta: number) => {
    setCarrinho(
      carrinho
        .map((item) =>
          item.produto.id === produtoId && item.tamanho === tamanho
            ? { ...item, quantidade: Math.max(0, item.quantidade + delta) }
            : item
        )
        .filter((item) => item.quantidade > 0)
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">Loja</h1>
            <p className="text-sm text-muted-foreground">
              Produtos oficiais da academia
            </p>
          </div>
          <Sheet open={carrinhoAberto} onOpenChange={setCarrinhoAberto}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItens > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                    {totalItens}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col">
              <SheetHeader>
                <SheetTitle>Carrinho ({totalItens} itens)</SheetTitle>
              </SheetHeader>

              {carrinho.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="font-medium">Carrinho vazio</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Adicione produtos para continuar
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-auto py-4 space-y-3">
                    {carrinho.map((item) => (
                      <Card key={`${item.produto.id}-${item.tamanho}`}>
                        <CardContent className="p-3">
                          <div className="flex gap-3">
                            <div className="h-16 w-16 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {item.produto.nome}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Tamanho: {item.tamanho}
                              </p>
                              <p className="text-sm font-semibold text-primary mt-1">
                                R$ {(item.produto.preco * item.quantidade).toFixed(2).replace(".", ",")}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                onClick={() =>
                                  removerDoCarrinho(item.produto.id, item.tamanho)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    atualizarQuantidade(
                                      item.produto.id,
                                      item.tamanho,
                                      -1
                                    )
                                  }
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-6 text-center text-sm">
                                  {item.quantidade}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    atualizarQuantidade(
                                      item.produto.id,
                                      item.tamanho,
                                      1
                                    )
                                  }
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        R$ {totalCarrinho.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Frete</span>
                      <span className="text-sm text-primary">Retirada na academia</span>
                    </div>
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">
                        R$ {totalCarrinho.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                    <Button className="w-full gap-2">
                      <CreditCard className="h-4 w-4" />
                      Finalizar compra
                    </Button>
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>
        </div>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Categorias */}
      <div className="px-4 py-3 border-b border-border overflow-x-auto">
        <div className="flex gap-2">
          {categorias.map((cat) => (
            <Button
              key={cat.id}
              variant={categoriaAtiva === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoriaAtiva(cat.id)}
              className="shrink-0"
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid de Produtos */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {produtosFiltrados.map((produto) => (
            <Card
              key={produto.id}
              className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => {
                setProdutoSelecionado(produto)
                setTamanhoSelecionado("")
              }}
            >
              <div className="aspect-square bg-secondary flex items-center justify-center relative">
                <Package className="h-12 w-12 text-muted-foreground" />
                {produto.precoAntigo && (
                  <Badge className="absolute top-2 left-2 bg-destructive text-[10px]">
                    Oferta
                  </Badge>
                )}
                {produto.estoque <= 3 && (
                  <Badge variant="secondary" className="absolute top-2 right-2 text-[10px]">
                    Últimas unidades
                  </Badge>
                )}
              </div>
              <CardContent className="p-3">
                <p className="font-medium text-sm line-clamp-2">{produto.nome}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-bold text-primary">
                    R$ {produto.preco.toFixed(2).replace(".", ",")}
                  </span>
                  {produto.precoAntigo && (
                    <span className="text-xs text-muted-foreground line-through">
                      R$ {produto.precoAntigo.toFixed(2).replace(".", ",")}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Dialog do Produto */}
      <Dialog
        open={!!produtoSelecionado}
        onOpenChange={() => {
          setProdutoSelecionado(null)
          setTamanhoSelecionado("")
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{produtoSelecionado?.nome}</DialogTitle>
            <DialogDescription>
              Selecione o tamanho para adicionar ao carrinho
            </DialogDescription>
          </DialogHeader>

          {produtoSelecionado && (
            <div className="space-y-4">
              <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
                <Package className="h-16 w-16 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-primary">
                    R$ {produtoSelecionado.preco.toFixed(2).replace(".", ",")}
                  </span>
                  {produtoSelecionado.precoAntigo && (
                    <span className="ml-2 text-sm text-muted-foreground line-through">
                      R$ {produtoSelecionado.precoAntigo.toFixed(2).replace(".", ",")}
                    </span>
                  )}
                </div>
                <Badge variant="secondary">
                  {produtoSelecionado.estoque} em estoque
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tamanho</label>
                <div className="flex gap-2 flex-wrap">
                  {produtoSelecionado.tamanhos.map((tam) => (
                    <Button
                      key={tam}
                      variant={tamanhoSelecionado === tam ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTamanhoSelecionado(tam)}
                    >
                      {tam}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="h-4 w-4" />
                <span>Retirada na academia</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              className="w-full gap-2"
              disabled={!tamanhoSelecionado}
              onClick={adicionarAoCarrinho}
            >
              <ShoppingCart className="h-4 w-4" />
              Adicionar ao carrinho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
