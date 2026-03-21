import { Building2, LifeBuoy, LineChart, Wallet } from "lucide-react"

const platformHighlights = [
  {
    title: "Academias ativas",
    value: "128",
    description: "Tenants em operação na plataforma",
    icon: Building2,
  },
  {
    title: "MRR estimado",
    value: "R$ 96.400",
    description: "Receita recorrente mensal da plataforma",
    icon: Wallet,
  },
  {
    title: "Health score",
    value: "97%",
    description: "Disponibilidade e estabilidade operacional",
    icon: LineChart,
  },
  {
    title: "Tickets abertos",
    value: "14",
    description: "Demandas de suporte aguardando triagem",
    icon: LifeBuoy,
  },
]

export default function PlatformPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Plataforma</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Superfície dedicada ao time operador da plataforma, separada do contexto das academias.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {platformHighlights.map((item) => (
          <article key={item.title} className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-4 text-2xl font-semibold text-foreground">{item.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
