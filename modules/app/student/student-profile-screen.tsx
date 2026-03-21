"use client"

import Link from "next/link"
import { useState } from "react"
import { Camera, CreditCard, ShieldCheck, User } from "lucide-react"
import type {
  StudentAppPaymentsData,
  StudentAppPlansData,
  StudentAppProfileGraduationsData,
  StudentAppProfileTitlesData,
} from "@/apps/api/src/modules/app/domain/student-app"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProfileGraduationsTab } from "@/modules/app/features/profile/base/profile-graduations-tab"
import { ProfileTitlesTab } from "@/modules/app/features/profile/base/profile-titles-tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { routes } from "@/lib/routes"

interface ProfileAccess {
  user: { name?: string; email: string } | null
  membership: { role: string } | null
}

interface StudentProfileScreenProps {
  access: ProfileAccess
  payments: StudentAppPaymentsData | null
  plans: StudentAppPlansData | null
  graduations: StudentAppProfileGraduationsData | null
  titles: StudentAppProfileTitlesData | null
  isSavingGraduation?: boolean
  isSavingTitle?: boolean
  removingTitleId?: string | null
  onRegisterGraduation: (payload: {
    activityId: string
    activityCategory: string | null
    toBelt: string
    toStripes: number
    graduatedAtMonth: string
    notes?: string | null
  }) => Promise<void> | void
  onUpdateGraduation: (payload: {
    graduationId: string
    activityId: string
    activityCategory: string | null
    toBelt: string
    toStripes: number
    graduatedAtMonth: string
    notes?: string | null
  }) => Promise<void> | void
  onCreateTitle: (payload: {
    placement: "gold" | "silver" | "bronze" | "champion" | "runner_up"
    competition: string
    year: number
  }) => Promise<void> | void
  onRemoveTitle: (titleId: string) => Promise<void> | void
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? "")
    .join("")
}

function formatDate(value: string | null) {
  if (!value) return null
  const [year, month, day] = value.split("-")
  return `${day}/${month}/${year}`
}

export function StudentProfileScreen({
  access,
  payments,
  plans,
  graduations,
  titles,
  isSavingGraduation = false,
  isSavingTitle = false,
  removingTitleId = null,
  onRegisterGraduation,
  onUpdateGraduation,
  onCreateTitle,
  onRemoveTitle,
}: StudentProfileScreenProps) {
  const [activeTab, setActiveTab] = useState("dados")
  const userName = access.user?.name ?? "Aluno"

  return (
    <div className="flex flex-col">
      <div className="relative">
        <div className="h-24 bg-gradient-to-r from-primary/30 to-primary/10" />

        <div className="px-4 pb-4">
          <div className="flex items-end gap-4 -mt-10">
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-background">
                <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full"
                disabled
              >
                <Camera className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="flex-1 pb-1">
              <h1 className="text-xl font-bold">{userName}</h1>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-2 text-center">
                <p className="text-lg font-bold text-primary">{plans?.currentPlanName ? 1 : 0}</p>
                <p className="text-[10px] text-muted-foreground">Plano ativo</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 text-center">
                <p className="text-lg font-bold text-primary">
                  {payments?.paymentStatus === "paid"
                    ? "Em dia"
                    : payments?.paymentStatus === "overdue"
                      ? "Atraso"
                      : "Pendente"}
                </p>
                <p className="text-[10px] text-muted-foreground">Financeiro</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 text-center">
                <p className="text-lg font-bold text-primary">
                  {payments?.nextPayment ? formatDate(payments.nextPayment) : "--"}
                </p>
                <p className="text-[10px] text-muted-foreground">Vencimento</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="px-4 pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="plano">Plano</TabsTrigger>
            <TabsTrigger value="graduacoes">Graduações</TabsTrigger>
            <TabsTrigger value="titulos">Títulos</TabsTrigger>
            <TabsTrigger value="conta">Conta</TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-4 w-4 text-primary" />
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium text-foreground">Nome:</span>{" "}
                      <span className="text-muted-foreground">{access.user?.name ?? "Não informado"}</span>
                    </p>
                    <p>
                      <span className="font-medium text-foreground">E-mail:</span>{" "}
                      <span className="text-muted-foreground">{access.user?.email ?? "Não informado"}</span>
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Perfil:</span>{" "}
                      <span className="text-muted-foreground">Aluno</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plano" className="space-y-4">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      {plans?.currentPlanName ?? payments?.planName ?? "Sem plano ativo"}
                    </p>
                    {payments?.nextPayment ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Próximo vencimento: {formatDate(payments.nextPayment)}
                      </p>
                    ) : null}
                    <p className="mt-2 text-sm text-muted-foreground">
                      Você pode ativar um plano ou consultar sua assinatura pela área de planos.
                    </p>
                    <Link
                      href={routes.tenantAppStudentPlans}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary"
                    >
                      Abrir planos
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="graduacoes" className="space-y-4">
            <ProfileGraduationsTab
              activities={graduations?.activities ?? []}
              isSaving={isSavingGraduation}
              onSubmit={onRegisterGraduation}
              onUpdate={onUpdateGraduation}
            />
          </TabsContent>

          <TabsContent value="titulos" className="space-y-4">
            <ProfileTitlesTab
              athleteName={titles?.athlete.name ?? userName}
              titles={titles?.titles ?? []}
              isSaving={isSavingTitle}
              removingTitleId={removingTitleId}
              onSubmit={onCreateTitle}
              onRemove={onRemoveTitle}
            />
          </TabsContent>

          <TabsContent value="conta" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Acesso ao app</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      O app do aluno usa sua conta ativa nesta academia para liberar presença, turmas, planos e pagamentos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
