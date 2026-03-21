"use client"

import { useState } from "react"
import { Medal, Plus, Trash2, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  athleteTitlePlacementOptions,
  resolveAthleteTitlePlacementStyle,
} from "@/lib/ui/title-placements"

interface ProfileTitlesTabProps {
  athleteName: string
  titles: Array<{
    id: string
    placement: "gold" | "silver" | "bronze" | "champion" | "runner_up" | null
    title: string
    competition: string
    year: number
  }>
  isSaving?: boolean
  removingTitleId?: string | null
  onSubmit: (payload: {
    placement: "gold" | "silver" | "bronze" | "champion" | "runner_up"
    competition: string
    year: number
  }) => Promise<void> | void
  onRemove: (titleId: string) => Promise<void> | void
}

function createTitleForm() {
  return {
    placement: "",
    competition: "",
    year: String(new Date().getFullYear()),
  }
}

export function ProfileTitlesTab({
  athleteName,
  titles,
  isSaving = false,
  removingTitleId = null,
  onSubmit,
  onRemove,
}: ProfileTitlesTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [form, setForm] = useState(createTitleForm)

  const years = Array.from({ length: 41 }, (_, index) => String(new Date().getFullYear() - index))

  async function handleSubmit() {
    await onSubmit({
      placement: form.placement as "gold" | "silver" | "bronze" | "champion" | "runner_up",
      competition: form.competition,
      year: Number(form.year),
    })
    setForm(createTitleForm())
    setIsDialogOpen(false)
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Meus títulos</CardTitle>
            <p className="text-sm text-muted-foreground">
              Registre seus resultados em competições e mantenha seu histórico atualizado.
            </p>
          </div>
          <Button type="button" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {titles.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-4 font-medium">{athleteName} ainda não possui títulos cadastrados.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Use o botão acima para adicionar o primeiro título.
              </p>
            </div>
          ) : (
            titles.map((title) => (
              <div key={title.id} className="flex items-start justify-between gap-3 rounded-2xl border p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 rounded-full p-2 ${resolveAthleteTitlePlacementStyle(title.placement).badgeClassName}`}
                  >
                    <Medal className={`h-4 w-4 ${resolveAthleteTitlePlacementStyle(title.placement).iconClassName}`} />
                  </div>
                  <div>
                    <p className="font-medium">{title.title}</p>
                  <p className="text-sm text-muted-foreground">{title.competition}</p>
                  <p className="mt-1 text-xs font-medium text-primary">{title.year}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  disabled={removingTitleId === title.id}
                  onClick={() => void onRemove(title.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar título</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-title-placement">Colocação</Label>
              <Select
                value={form.placement}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    placement: value,
                  }))
                }
              >
                <SelectTrigger id="profile-title-placement">
                  <SelectValue placeholder="Selecione a colocação" />
                </SelectTrigger>
                <SelectContent>
                  {athleteTitlePlacementOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} ({option.description})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-title-competition">Competição</Label>
              <Input
                id="profile-title-competition"
                value={form.competition}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    competition: event.target.value,
                  }))
                }
                placeholder="Mundial IBJJF 2024"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-title-year">Ano</Label>
              <Select
                value={form.year}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    year: value,
                  }))
                }
              >
                <SelectTrigger id="profile-title-year">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={() => void handleSubmit()} disabled={isSaving}>
              Salvar título
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
