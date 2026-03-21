"use client"

import { useEffect, useState } from "react"
import {
  Camera,
  Calendar,
  Dumbbell,
  Edit,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Save,
  Star,
  Trophy,
  User,
  X,
} from "lucide-react"
import type {
  TeacherAppProfileData,
  TeacherAppProfileGraduationsData,
  TeacherAppProfileTitlesData,
  TeacherAppProfileUpdateInput,
} from "@/apps/api/src/modules/app/domain/teacher-app"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { AppRoleGuard } from "@/modules/app/components/app-role-guard"
import { ProfileGraduationsTab } from "@/modules/app/features/profile/base/profile-graduations-tab"
import { ProfileTitlesTab } from "@/modules/app/features/profile/base/profile-titles-tab"
import {
  createTeacherAppProfileTitle,
  createTeacherAppProfileGraduation,
  fetchTeacherAppProfile,
  fetchTeacherAppProfileGraduations,
  fetchTeacherAppProfileTitles,
  removeTeacherAppProfileTitle,
  saveTeacherAppProfile,
  updateTeacherAppProfileGraduation,
} from "@/modules/app/services/teacher-app"

export default function TeacherAppProfilePage() {
  const [data, setData] = useState<TeacherAppProfileData | null>(null)
  const [activeTab, setActiveTab] = useState("data")
  const [isEditing, setIsEditing] = useState(false)
  const [showPhotoDialog, setShowPhotoDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingGraduation, setIsSavingGraduation] = useState(false)
  const [isSavingTitle, setIsSavingTitle] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [graduations, setGraduations] = useState<TeacherAppProfileGraduationsData | null>(null)
  const [titles, setTitles] = useState<TeacherAppProfileTitlesData | null>(null)
  const [removingTitleId, setRemovingTitleId] = useState<string | null>(null)
  const [form, setForm] = useState<TeacherAppProfileUpdateInput>({
    name: "",
    email: "",
    phone: "",
    address: "",
    birthDate: "",
    registry: "",
    bio: "",
  })

  async function load() {
    setIsLoading(true)
    setFeedback(null)

    try {
      const [profileResponse, graduationResponse, titlesResponse] = await Promise.all([
        fetchTeacherAppProfile(),
        fetchTeacherAppProfileGraduations(),
        fetchTeacherAppProfileTitles(),
      ])
      setData(profileResponse.data)
      setGraduations(graduationResponse.data)
      setTitles(titlesResponse.data)
      setForm({
        name: profileResponse.data.profile.name,
        email: profileResponse.data.profile.email,
        phone: profileResponse.data.profile.phone,
        address: profileResponse.data.profile.address,
        birthDate: profileResponse.data.profile.birthDate,
        registry: profileResponse.data.profile.registry,
        bio: profileResponse.data.profile.bio,
      })
    } catch (error) {
      setData(null)
      setGraduations(null)
      setTitles(null)
      setFeedback(error instanceof Error ? error.message : "Não foi possível carregar o perfil.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateTitle(payload: {
    placement: "gold" | "silver" | "bronze" | "champion" | "runner_up"
    competition: string
    year: number
  }) {
    setIsSavingTitle(true)
    try {
      const response = await createTeacherAppProfileTitle(payload)
      setTitles(response.data)
      toast({
        title: "Título adicionado",
        description: response.message,
      })
    } catch (error) {
      toast({
        title: "Falha ao adicionar título",
        description: error instanceof Error ? error.message : "Tente novamente.",
      })
    } finally {
      setIsSavingTitle(false)
    }
  }

  async function handleRemoveTitle(titleId: string) {
    setRemovingTitleId(titleId)
    try {
      const response = await removeTeacherAppProfileTitle(titleId)
      setTitles(response.data)
      toast({
        title: "Título removido",
        description: response.message,
      })
    } catch (error) {
      toast({
        title: "Falha ao remover título",
        description: error instanceof Error ? error.message : "Tente novamente.",
      })
    } finally {
      setRemovingTitleId(null)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function handleSave() {
    setIsSaving(true)
    try {
      const response = await saveTeacherAppProfile(form)
      setData(response.data)
      setIsEditing(false)
      toast({
        title: "Perfil atualizado",
        description: response.message,
      })
    } catch (error) {
      toast({
        title: "Falha ao salvar perfil",
        description: error instanceof Error ? error.message : "Tente novamente.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleRegisterGraduation(payload: {
    activityId: string
    activityCategory: string | null
    toBelt: string
    toStripes: number
    graduatedAtMonth: string
    notes?: string | null
  }) {
    if (!payload.activityCategory) {
      toast({
        title: "Falha ao registrar graduação",
        description: "Selecione uma atividade válida para o professor.",
      })
      return
    }

    setIsSavingGraduation(true)
    try {
      const response = await createTeacherAppProfileGraduation({
        activityCategory: payload.activityCategory,
        toBelt: payload.toBelt,
        toStripes: payload.toStripes,
        graduatedAtMonth: payload.graduatedAtMonth,
        notes: payload.notes ?? null,
      })
      setGraduations(response.data)
      await load()
      toast({
        title: "Graduação registrada",
        description: response.message,
      })
    } catch (error) {
      toast({
        title: "Falha ao registrar graduação",
        description: error instanceof Error ? error.message : "Tente novamente.",
      })
    } finally {
      setIsSavingGraduation(false)
    }
  }

  async function handleUpdateGraduation(payload: {
    graduationId: string
    activityId: string
    activityCategory: string | null
    toBelt: string
    toStripes: number
    graduatedAtMonth: string
    notes?: string | null
  }) {
    if (!payload.activityCategory) {
      toast({
        title: "Falha ao atualizar graduação",
        description: "Selecione uma atividade válida para o professor.",
      })
      return
    }

    setIsSavingGraduation(true)
    try {
      const response = await updateTeacherAppProfileGraduation(payload.graduationId, {
        activityCategory: payload.activityCategory,
        toBelt: payload.toBelt,
        toStripes: payload.toStripes,
        graduatedAtMonth: payload.graduatedAtMonth,
        notes: payload.notes ?? null,
      })
      setGraduations(response.data)
      await load()
      toast({
        title: "Graduação atualizada",
        description: response.message,
      })
    } catch (error) {
      toast({
        title: "Falha ao atualizar graduação",
        description: error instanceof Error ? error.message : "Tente novamente.",
      })
    } finally {
      setIsSavingGraduation(false)
    }
  }

  const content = (() => {
    if (isLoading) {
      return <section className="text-sm text-muted-foreground">Carregando perfil...</section>
    }

    if (feedback) {
      return (
        <section className="space-y-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{feedback}</p>
          <Button type="button" variant="outline" onClick={() => void load()}>
            Tentar novamente
          </Button>
        </section>
      )
    }

    if (!data) {
      return <section className="text-sm text-muted-foreground">Sem dados de perfil disponíveis.</section>
    }

    const initials = (form.name || "PR")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((value) => value[0])
      .join("")
      .toUpperCase()

    return (
      <div className="space-y-4 p-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                  onClick={() => setShowPhotoDialog(true)}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <h1 className="mt-4 text-xl font-bold">{form.name}</h1>
              <div className="mt-2 flex items-center gap-2">
                <Badge className="border border-white/20 bg-black text-sm text-white">{data.profile.rank}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{data.profile.roleTitle}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <Card className="border-primary/20 bg-primary/10">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-primary">{data.stats.activeStudents}</p>
              <p className="text-xs text-muted-foreground">Alunos ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{data.stats.activeClasses}</p>
              <p className="text-xs text-muted-foreground">Turmas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{data.stats.monthlyClasses}</p>
              <p className="text-xs text-muted-foreground">Aulas/mês</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="data">
              <User className="mr-1 h-4 w-4" />
              Dados
            </TabsTrigger>
            <TabsTrigger value="modalities">
              <Dumbbell className="mr-1 h-4 w-4" />
              Modalidades
            </TabsTrigger>
            <TabsTrigger value="graduations">
              <GraduationCap className="mr-1 h-4 w-4" />
              Graduações
            </TabsTrigger>
            <TabsTrigger value="titles">
              <Trophy className="mr-1 h-4 w-4" />
              Títulos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Dados Pessoais</CardTitle>
                  {!isEditing ? (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="mr-1 h-4 w-4" />
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving}>
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={() => void handleSave()} disabled={isSaving}>
                        <Save className="mr-1 h-4 w-4" />
                        Salvar
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome completo</label>
                      <Input
                        value={form.name}
                        onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">E-mail</label>
                        <Input
                          type="email"
                          value={form.email}
                          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Telefone</label>
                        <Input
                          value={form.phone}
                          onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Endereço</label>
                      <Input
                        value={form.address}
                        onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Data de nascimento</label>
                        <Input
                          type="date"
                          value={form.birthDate}
                          onChange={(event) => setForm((current) => ({ ...current, birthDate: event.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Registro</label>
                        <Input
                          value={form.registry}
                          onChange={(event) => setForm((current) => ({ ...current, registry: event.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bio</label>
                      <Textarea
                        rows={3}
                        value={form.bio}
                        onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">E-mail</p>
                        <p className="font-medium">{form.email || "Não informado"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Telefone</p>
                        <p className="font-medium">{form.phone || "Não informado"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Endereço</p>
                        <p className="font-medium">{form.address || "Não informado"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Data de nascimento</p>
                        <p className="font-medium">{form.birthDate || "Não informado"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                      <GraduationCap className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Registro</p>
                        <p className="font-medium">{form.registry || "Não informado"}</p>
                      </div>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-3">
                      <p className="mb-1 text-sm text-muted-foreground">Bio</p>
                      <p className="text-sm">{form.bio || "Sem descrição."}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modalities" className="mt-4 space-y-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Modalidades que Leciono</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.profile.modalities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma modalidade vinculada.</p>
                ) : (
                  data.profile.modalities.map((modality) => (
                    <div key={modality.id} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                      <div className="h-10 w-2 rounded-full bg-primary" />
                      <div className="flex-1">
                        <p className="font-medium">{modality.name}</p>
                        <p className="text-sm text-muted-foreground">Ativa para este professor</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5 text-primary" />
                  Resumo de Carreira
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-secondary/50 p-4 text-center">
                    <p className="text-3xl font-bold text-primary">{data.stats.monthlyClasses}</p>
                    <p className="text-sm text-muted-foreground">Aulas no mês</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-4 text-center">
                    <p className="text-3xl font-bold">{data.stats.activeStudents}</p>
                    <p className="text-sm text-muted-foreground">Alunos ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="graduations" className="mt-4">
            <ProfileGraduationsTab
              activities={graduations?.activities ?? []}
              isSaving={isSavingGraduation}
              onSubmit={handleRegisterGraduation}
              onUpdate={handleUpdateGraduation}
            />
          </TabsContent>

          <TabsContent value="titles" className="mt-4">
            <ProfileTitlesTab
              athleteName={titles?.athlete.name ?? form.name}
              titles={titles?.titles ?? []}
              isSaving={isSavingTitle}
              removingTitleId={removingTitleId}
              onSubmit={handleCreateTitle}
              onRemove={handleRemoveTitle}
            />
          </TabsContent>
        </Tabs>

        <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Atualizar foto</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              A atualização de foto será habilitada na próxima fase de integração.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPhotoDialog(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  })()

  return (
    <AppRoleGuard requiredRole="teacher">
      {content}
    </AppRoleGuard>
  )
}
