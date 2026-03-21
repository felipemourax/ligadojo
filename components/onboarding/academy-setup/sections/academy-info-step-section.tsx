"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { activityCategoryOptions } from "@/apps/api/src/modules/modalities/domain/modality"

interface AcademyInfoState {
  legalName: string
  phone: string
  contactEmail: string
  document: string
  hasNoDocument: boolean
  foundedYear: string
  activityCategories: string[]
}

interface AcademyInfoStepSectionProps {
  data: AcademyInfoState
  showStepErrors: boolean
  getFieldErrorClass: (hasError: boolean) => string
  formatPhone: (value: string) => string
  normalizeEmail: (value: string) => string
  formatCnpj: (value: string) => string
  onChangeField: (field: keyof AcademyInfoState, value: string | boolean | string[]) => void
}

export function AcademyInfoStepSection({
  data,
  showStepErrors,
  getFieldErrorClass,
  formatPhone,
  normalizeEmail,
  formatCnpj,
  onChangeField,
}: AcademyInfoStepSectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <Label>Nome da academia</Label>
        <Input
          className={getFieldErrorClass(showStepErrors && !data.legalName.trim())}
          value={data.legalName}
          onChange={(event) => onChangeField("legalName", event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Telefone da academia</Label>
        <Input
          className={getFieldErrorClass(showStepErrors && !data.phone.trim())}
          inputMode="tel"
          placeholder="(11) 99999-9999"
          value={data.phone}
          onChange={(event) => onChangeField("phone", formatPhone(event.target.value))}
        />
      </div>
      <div className="space-y-2">
        <Label>Email de acesso ao sistema</Label>
        <Input
          className={getFieldErrorClass(showStepErrors && !data.contactEmail.trim())}
          inputMode="email"
          type="email"
          placeholder="contato@academia.com"
          value={data.contactEmail}
          onChange={(event) => onChangeField("contactEmail", normalizeEmail(event.target.value))}
        />
      </div>
      <div className="space-y-2">
        <Label>CNPJ</Label>
        <Input
          className={getFieldErrorClass(showStepErrors && !data.hasNoDocument && !data.document.trim())}
          disabled={data.hasNoDocument}
          inputMode="numeric"
          placeholder="00.000.000/0000-00"
          value={data.document}
          onChange={(event) => onChangeField("document", formatCnpj(event.target.value))}
        />
        <label className="flex items-center gap-3 rounded-xl border border-border px-3 py-3">
          <Checkbox
            checked={data.hasNoDocument}
            onCheckedChange={(checked) => {
              const enabled = Boolean(checked)
              onChangeField("hasNoDocument", enabled)
              if (enabled) {
                onChangeField("document", "")
              }
            }}
          />
          <span className="text-sm text-foreground">Não tenho CNPJ</span>
        </label>
      </div>
      <div className="space-y-2">
        <Label>Ano de fundação</Label>
        <Input
          inputMode="numeric"
          maxLength={4}
          value={data.foundedYear}
          onChange={(event) => onChangeField("foundedYear", event.target.value.replace(/\D/g, "").slice(0, 4))}
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Atividades que atuo</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className={cn(
                "w-full justify-between",
                getFieldErrorClass(showStepErrors && data.activityCategories.length === 0)
              )}
              type="button"
              variant="outline"
            >
              <span className="truncate">
                {data.activityCategories.length > 0
                  ? activityCategoryOptions
                      .filter((option) => data.activityCategories.includes(option.value))
                      .map((option) => option.label)
                      .join(", ")
                  : "Selecione as atividades"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            {activityCategoryOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={data.activityCategories.includes(option.value)}
                onCheckedChange={(checked) => {
                  const nextCategories = checked
                    ? [...data.activityCategories, option.value]
                    : data.activityCategories.filter((item) => item !== option.value)
                  onChangeField("activityCategories", nextCategories)
                }}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
