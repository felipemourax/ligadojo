"use client"

import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis,
  Tooltip
} from "recharts"

const data = [
  { day: "Seg", presenca: 45 },
  { day: "Ter", presenca: 52 },
  { day: "Qua", presenca: 48 },
  { day: "Qui", presenca: 61 },
  { day: "Sex", presenca: 55 },
  { day: "Sáb", presenca: 38 },
  { day: "Dom", presenca: 12 },
]

export function AttendanceChart() {
  return (
    <div className="bg-card rounded-2xl p-4 md:p-5 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Presença Semanal</h3>
          <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">311</p>
          <p className="text-xs text-primary">+12% vs semana anterior</p>
        </div>
      </div>

      <div className="h-[180px] md:h-[200px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPresenca" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              dy={10}
            />
            <YAxis 
              hide 
              domain={[0, 'dataMax + 20']}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
                      <p className="text-xs text-muted-foreground">{payload[0].payload.day}</p>
                      <p className="text-sm font-semibold text-foreground">
                        {payload[0].value} check-ins
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey="presenca"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#colorPresenca)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
