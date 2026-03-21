"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Megaphone, Palette, PlusCircle, LayoutTemplate, Save, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { BrandIdentityTab } from "@/modules/marketing/components/brand-identity-tab"
import { CreateContentTab } from "@/modules/marketing/components/create-content-tab"
import { TemplatesTab } from "@/modules/marketing/components/templates-tab"

export default function MarketingPage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(() => {
    if (tabParam === "create") return "create"
    if (tabParam === "templates") return "templates"
    return "identity"
  })

  useEffect(() => {
    if (tabParam === "create") setActiveTab("create")
    else if (tabParam === "templates") setActiveTab("templates")
  }, [tabParam])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveIdentity = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setHasUnsavedChanges(false)
    }, 1000)
  }

  const tabDescriptions: Record<string, string> = {
    identity: "Configure cores, tipografia e materiais visuais da sua academia.",
    create: "Crie posts, stories e carrosseis usando sua identidade visual.",
    templates: "Escolha modelos prontos para acelerar a criacao de conteudo.",
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Compact Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Megaphone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Marketing</h1>
            <p className="text-sm text-muted-foreground">
              {tabDescriptions[activeTab]}
            </p>
          </div>
        </div>
        {activeTab === "identity" && (
          <Button 
            onClick={handleSaveIdentity}
            disabled={isSaving}
            size="sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar alteracoes
              </>
            )}
          </Button>
        )}
      </div>

      {/* Tabs with Icons */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
        <TabsList className="inline-flex h-auto p-1 bg-muted/50">
          <TabsTrigger 
            value="identity" 
            className="px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
          >
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Identidade Visual</span>
            <span className="sm:hidden">Identidade</span>
          </TabsTrigger>
          <TabsTrigger 
            value="create" 
            className="px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Criar Conteudo</span>
            <span className="sm:hidden">Criar</span>
          </TabsTrigger>
          <TabsTrigger 
            value="templates" 
            className="px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
          >
            <LayoutTemplate className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="identity" className="mt-0">
          <BrandIdentityTab onChangesMade={() => setHasUnsavedChanges(true)} />
        </TabsContent>

        <TabsContent value="create" className="mt-0">
          <CreateContentTab />
        </TabsContent>

        <TabsContent value="templates" className="mt-0">
          <TemplatesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
