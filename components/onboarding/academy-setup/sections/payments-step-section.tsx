"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { PaymentsStepData } from "@/apps/api/src/modules/onboarding/domain/tenant-onboarding"

interface PaymentsStepSectionProps {
  data: PaymentsStepData
  onAcceptedMethodsChange: (methods: PaymentsStepData["acceptedMethods"]) => void
  onGatewayChange: (gateway: PaymentsStepData["gateway"] | "") => void
}

export function PaymentsStepSection({
  data,
  onAcceptedMethodsChange,
  onGatewayChange,
}: PaymentsStepSectionProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <Label>Formas de pagamento aceitas</Label>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { key: "pix", label: "Pix" },
            { key: "card", label: "Cartao" },
            { key: "boleto", label: "Boleto" },
          ].map((method) => {
            const checked = data.acceptedMethods.includes(method.key as PaymentsStepData["acceptedMethods"][number])

            return (
              <label key={method.key} className="flex items-center gap-3 rounded-xl border border-border px-3 py-3">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(nextChecked) => {
                    const key = method.key as PaymentsStepData["acceptedMethods"][number]
                    const nextMethods = nextChecked
                      ? [...data.acceptedMethods, key]
                      : data.acceptedMethods.filter((item) => item !== key)
                    onAcceptedMethodsChange(nextMethods)
                  }}
                />
                <span className="text-sm text-foreground">{method.label}</span>
              </label>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Gateway futuro</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={data.gateway}
          onChange={(event) => onGatewayChange(event.target.value as PaymentsStepData["gateway"] | "")}
        >
          <option value="">Selecionar depois</option>
          <option value="mercado_pago">Mercado Pago</option>
          <option value="asaas">Asaas</option>
          <option value="stripe">Stripe</option>
        </select>
      </div>
    </div>
  )
}
