"use client"

import { useState } from "react"
import { 
  Palette, 
  Upload, 
  Trash2, 
  Plus,
  ImageIcon,
  X
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { BrandColors, BrandMaterial } from "../types"

interface BrandIdentityTabProps {
  onChangesMade: () => void
}

const fontOptions = [
  { value: "oswald", label: "Oswald" },
  { value: "montserrat", label: "Montserrat" },
  { value: "roboto", label: "Roboto" },
  { value: "poppins", label: "Poppins" },
  { value: "inter", label: "Inter" },
  { value: "lato", label: "Lato" },
  { value: "open-sans", label: "Open Sans" },
]

const categoryLabels: Record<string, string> = {
  logo: "Logotipo",
  equipe: "Equipe",
  professor: "Professor",
  espaco: "Espaco",
  treino: "Treino",
  outro: "Outro",
}

const mockMaterials: BrandMaterial[] = [
  {
    id: "1",
    name: "Alliance Equipe",
    type: "image/jpeg",
    category: "equipe",
    url: "/placeholder.svg?height=300&width=400",
  },
  {
    id: "2",
    name: "Alliance Faixa Preta",
    type: "image/jpeg",
    category: "professor",
    url: "/placeholder.svg?height=300&width=400",
  },
]

export function BrandIdentityTab({ onChangesMade }: BrandIdentityTabProps) {
  const [colors, setColors] = useState<BrandColors>({
    primary: "#0d1b4c",
    secondary: "#1f2937",
    accent: "#f8fafc",
  })
  const [titleFont, setTitleFont] = useState("oswald")
  const [bodyFont, setBodyFont] = useState("inter")
  const [notes, setNotes] = useState("Alliance - teste de composicao com logo, equipe e faixa preta.")
  const [logo, setLogo] = useState<BrandMaterial | null>({
    id: "logo",
    name: "Alliance Logo",
    type: "image/png",
    category: "logo",
    url: "/placeholder.svg?height=200&width=200",
  })
  const [materials, setMaterials] = useState<BrandMaterial[]>(mockMaterials)

  const handleColorChange = (key: keyof BrandColors, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }))
    onChangesMade()
  }

  const removeMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id))
    onChangesMade()
  }

  const updateMaterialCategory = (id: string, category: string) => {
    setMaterials(prev => prev.map(m => 
      m.id === id ? { ...m, category: category as BrandMaterial["category"] } : m
    ))
    onChangesMade()
  }

  return (
    <div className="space-y-6">
      {/* Brand Configuration */}
      <Card className="border-border bg-card">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Identidade da marca</h3>
          </div>
          
          <div className="grid gap-6 lg:grid-cols-2">
            
            {/* Colors - Compact */}
            <div className="space-y-3">
              <Label className="text-sm text-muted-foreground">Paleta de cores</Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <div className="relative">
                    <div 
                      className="h-14 rounded-lg border border-border cursor-pointer transition-all hover:ring-2 hover:ring-primary/30"
                      style={{ backgroundColor: colors.primary }}
                    />
                    <Input
                      type="color"
                      value={colors.primary}
                      onChange={(e) => handleColorChange("primary", e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center uppercase tracking-wide">Principal</p>
                  <p className="text-xs font-mono text-center text-foreground">{colors.primary}</p>
                </div>
                <div className="space-y-1.5">
                  <div className="relative">
                    <div 
                      className="h-14 rounded-lg border border-border cursor-pointer transition-all hover:ring-2 hover:ring-primary/30"
                      style={{ backgroundColor: colors.secondary }}
                    />
                    <Input
                      type="color"
                      value={colors.secondary}
                      onChange={(e) => handleColorChange("secondary", e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center uppercase tracking-wide">Secundaria</p>
                  <p className="text-xs font-mono text-center text-foreground">{colors.secondary}</p>
                </div>
                <div className="space-y-1.5">
                  <div className="relative">
                    <div 
                      className="h-14 rounded-lg border border-border cursor-pointer transition-all hover:ring-2 hover:ring-primary/30"
                      style={{ backgroundColor: colors.accent }}
                    />
                    <Input
                      type="color"
                      value={colors.accent}
                      onChange={(e) => handleColorChange("accent", e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center uppercase tracking-wide">Destaque</p>
                  <p className="text-xs font-mono text-center text-foreground">{colors.accent}</p>
                </div>
              </div>
            </div>

            {/* Typography - Compact */}
            <div className="space-y-3">
              <Label className="text-sm text-muted-foreground">Tipografia</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Titulos</p>
                  <Select value={titleFont} onValueChange={(v) => { setTitleFont(v); onChangesMade(); }}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map(font => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Corpo</p>
                  <Select value={bodyFont} onValueChange={(v) => { setBodyFont(v); onChangesMade(); }}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map(font => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Notes - Compact */}
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Observacoes da marca</Label>
              <Textarea 
                value={notes}
                onChange={(e) => { setNotes(e.target.value); onChangesMade(); }}
                placeholder="Ex.: Usar sempre a versao escura do logo..."
                rows={2}
                className="resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo and Materials: Two Columns */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Logo Upload */}
        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Logotipo</h3>
            </div>
            
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
              {logo ? (
                <div className="space-y-3">
                  <div className="w-24 h-24 mx-auto bg-background rounded-xl flex items-center justify-center border border-border">
                    <span className="text-3xl font-bold text-foreground">A</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{logo.name}</p>
                    <p className="text-xs text-muted-foreground">Clique para trocar</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Arraste ou clique</p>
                    <p className="text-xs text-muted-foreground">PNG, SVG ou JPG (max 2MB)</p>
                  </div>
                </div>
              )}
            </div>
            
            {logo && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Trocar logo
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => { setLogo(null); onChangesMade(); }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visual Materials */}
        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Materiais visuais</h3>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1.5" />
                Adicionar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Fotos da academia, equipe e professor para usar em templates e conteudo.
            </p>
            
            {materials.length === 0 ? (
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum material cadastrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {materials.map((material) => (
                  <div 
                    key={material.id} 
                    className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-border bg-muted"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <Badge className="absolute top-2 left-2 text-[10px]">
                      {categoryLabels[material.category]}
                    </Badge>
                    <button
                      onClick={() => removeMaterial(material.id)}
                      className="absolute top-2 right-2 h-6 w-6 bg-destructive/80 hover:bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-xs font-medium text-white truncate">{material.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
