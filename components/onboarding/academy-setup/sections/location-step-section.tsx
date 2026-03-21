"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LocationState {
  zipCode: string
  street: string
  number: string
  complement: string
  city: string
  state: string
  country: string
}

interface LocationStepSectionProps {
  data: LocationState
  isLookingUpZipCode: boolean
  onZipCodeChange: (value: string) => void
  onZipCodeBlur: () => void
  onLookupZipCode: () => void
  onChangeField: (field: keyof LocationState, value: string) => void
}

export function LocationStepSection({
  data,
  isLookingUpZipCode,
  onZipCodeChange,
  onZipCodeBlur,
  onLookupZipCode,
  onChangeField,
}: LocationStepSectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>CEP</Label>
        <div className="flex gap-2">
          <Input
            inputMode="numeric"
            placeholder="00000-000"
            value={data.zipCode}
            onBlur={onZipCodeBlur}
            onChange={(event) => onZipCodeChange(event.target.value)}
          />
          <Button disabled={isLookingUpZipCode} onClick={onLookupZipCode} type="button" variant="outline">
            {isLookingUpZipCode ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Rua</Label>
        <Input value={data.street} onChange={(event) => onChangeField("street", event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Numero</Label>
        <Input value={data.number} onChange={(event) => onChangeField("number", event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Complemento</Label>
        <Input value={data.complement} onChange={(event) => onChangeField("complement", event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Cidade</Label>
        <Input value={data.city} onChange={(event) => onChangeField("city", event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Estado</Label>
        <Input value={data.state} onChange={(event) => onChangeField("state", event.target.value)} />
      </div>
    </div>
  )
}
