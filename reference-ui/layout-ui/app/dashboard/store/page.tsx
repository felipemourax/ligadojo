"use client"

import { SiteBuilder, storeTemplates } from "@/components/site-builder/site-builder"
import { StatCard } from "@/modules/dashboard/components/stat-card"
import { ShoppingBag, DollarSign, Package, TrendingUp } from "lucide-react"

export default function StorePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Loja Virtual</h1>
        <p className="text-muted-foreground">
          Venda produtos e equipamentos diretamente pelo seu site. Configure sua loja com nosso editor visual.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Vendas do mês"
          value="R$ 4.850"
          description="Receita de produtos"
          icon={DollarSign}
          trend={{ value: 23, isPositive: true }}
        />
        <StatCard
          title="Pedidos"
          value="32"
          description="Pedidos este mês"
          icon={ShoppingBag}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Produtos"
          value="24"
          description="Itens cadastrados"
          icon={Package}
        />
        <StatCard
          title="Ticket médio"
          value="R$ 151,56"
          description="Por pedido"
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Store Builder */}
      <div className="min-h-[600px]">
        <SiteBuilder type="store" templates={storeTemplates} />
      </div>
    </div>
  )
}
