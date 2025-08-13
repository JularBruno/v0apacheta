"use client"

import type React from "react"

import { useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Utensils,
  ShoppingCart,
  Car,
  Home,
  Gamepad2,
  Zap,
  Gift,
  Sparkles,
  Briefcase,
  Plane,
  DollarSign,
  Coffee,
  Heart,
  Music,
  Camera,
  Book,
  Dumbbell,
  Palette,
  Wrench,
  Smartphone,
  Laptop,
  Settings,
  Plus,
  Edit,
  Trash2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type TxType = "gasto" | "ingreso"

type Category = {
  id: string
  name: string
  color: string
  icon: LucideIcon
  kind: TxType
}

type Tag = {
  id: string
  name: string
  categoryId: string
  defaultAmount: number
  color: string
}

export type QuickSpendData = {
  type: TxType
  categoryId: string
  tagId: string
  tagName: string
  amount: number
  date: string
  time: string
}

const initialCategories: Category[] = [
  // Gastos
  { id: "comida", name: "Comida", color: "bg-orange-500", icon: Utensils, kind: "gasto" },
  { id: "comestibles", name: "Comestibles", color: "bg-green-500", icon: ShoppingCart, kind: "gasto" },
  { id: "transporte", name: "Transporte", color: "bg-blue-500", icon: Car, kind: "gasto" },
  { id: "hogar", name: "Hogar", color: "bg-purple-500", icon: Home, kind: "gasto" },
  { id: "entretenimiento", name: "Entretenimiento", color: "bg-red-500", icon: Gamepad2, kind: "gasto" },
  { id: "servicios", name: "Servicios", color: "bg-yellow-500", icon: Zap, kind: "gasto" },
  { id: "regalos", name: "Regalos", color: "bg-pink-500", icon: Gift, kind: "gasto" },
  { id: "belleza", name: "Belleza", color: "bg-indigo-500", icon: Sparkles, kind: "gasto" },
  { id: "viajes", name: "Viajes", color: "bg-cyan-500", icon: Plane, kind: "gasto" },

  // Ingresos
  { id: "trabajo", name: "Trabajo", color: "bg-gray-500", icon: Briefcase, kind: "ingreso" },
  { id: "ingreso", name: "Ingreso", color: "bg-green-600", icon: DollarSign, kind: "ingreso" },
]

const initialTags: Tag[] = [
  // Gastos
  { id: "t-cafe", name: "Café", categoryId: "comida", defaultAmount: 120, color: "bg-orange-400" },
  { id: "t-almuerzo", name: "Almuerzo", categoryId: "comida", defaultAmount: 250, color: "bg-orange-600" },
  { id: "t-coto", name: "Coto", categoryId: "comestibles", defaultAmount: 850, color: "bg-green-600" },
  { id: "t-gas", name: "Gasolina", categoryId: "transporte", defaultAmount: 400, color: "bg-blue-600" },
  { id: "t-uber", name: "Uber", categoryId: "transporte", defaultAmount: 150, color: "bg-blue-400" },
  // Ingresos
  { id: "t-sueldo", name: "Sueldo", categoryId: "trabajo", defaultAmount: 2500, color: "bg-gray-600" },
  { id: "t-intereses", name: "Intereses", categoryId: "ingreso", defaultAmount: 300, color: "bg-green-700" },
]

const availableIcons: { id: string; name: string; icon: LucideIcon }[] = [
  { id: "utensils", name: "Comida", icon: Utensils },
  { id: "shopping-cart", name: "Compras", icon: ShoppingCart },
  { id: "car", name: "Transporte", icon: Car },
  { id: "home", name: "Hogar", icon: Home },
  { id: "gamepad", name: "Juegos", icon: Gamepad2 },
  { id: "zap", name: "Servicios", icon: Zap },
  { id: "gift", name: "Regalos", icon: Gift },
  { id: "sparkles", name: "Belleza", icon: Sparkles },
  { id: "briefcase", name: "Trabajo", icon: Briefcase },
  { id: "plane", name: "Viajes", icon: Plane },
  { id: "dollar", name: "Ingreso", icon: DollarSign },
  { id: "coffee", name: "Café", icon: Coffee },
  { id: "heart", name: "Salud", icon: Heart },
  { id: "music", name: "Música", icon: Music },
  { id: "camera", name: "Fotos", icon: Camera },
  { id: "book", name: "Educación", icon: Book },
  { id: "dumbbell", name: "Ejercicio", icon: Dumbbell },
  { id: "palette", name: "Arte", icon: Palette },
  { id: "wrench", name: "Herramientas", icon: Wrench },
  { id: "smartphone", name: "Teléfono", icon: Smartphone },
  { id: "laptop", name: "Tecnología", icon: Laptop },
]

const availableColors = [
  { id: "orange-500", class: "bg-orange-500", name: "Naranja" },
  { id: "green-500", class: "bg-green-500", name: "Verde" },
  { id: "blue-500", class: "bg-blue-500", name: "Azul" },
  { id: "purple-500", class: "bg-purple-500", name: "Morado" },
  { id: "red-500", class: "bg-red-500", name: "Rojo" },
  { id: "yellow-500", class: "bg-yellow-500", name: "Amarillo" },
  { id: "pink-500", class: "bg-pink-500", name: "Rosa" },
  { id: "indigo-500", class: "bg-indigo-500", name: "Índigo" },
  { id: "gray-500", class: "bg-gray-500", name: "Gris" },
  { id: "cyan-500", class: "bg-cyan-500", name: "Cian" },
  { id: "emerald-500", class: "bg-emerald-500", name: "Esmeralda" },
  { id: "violet-500", class: "bg-violet-500", name: "Violeta" },
]

function nowInfo() {
  const d = new Date()
  return {
    date: d.toLocaleDateString("es-AR"),
    time: d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
  }
}

export default function QuickSpendCard({
  onAdd,
  defaultType = "gasto",
  onManageCategories,
}: {
  onAdd: (data: QuickSpendData) => void
  defaultType?: TxType
  onManageCategories?: () => void
}) {
  const [type, setType] = useState<TxType>(defaultType)

  // Categories state (allows creation)
  const [cats, setCats] = useState<Category[]>(initialCategories)
  const expenseCats = useMemo(() => cats.filter((c) => c.kind === "gasto"), [cats])
  const incomeCats = useMemo(() => cats.filter((c) => c.kind === "ingreso"), [cats])

  // Track a selected category per type so switching is smooth
  const [selectedExpenseCat, setSelectedExpenseCat] = useState<string>(expenseCats[0]?.id || "comida")
  const [selectedIncomeCat, setSelectedIncomeCat] = useState<string>(incomeCats[0]?.id || "trabajo")
  const categoryId = type === "gasto" ? selectedExpenseCat : selectedIncomeCat

  // Tags (global suggestions; not filtered by category initially)
  const [allTags, setAllTags] = useState<Tag[]>(initialTags)
  const [tagId, setTagId] = useState<string>("")
  const [tagInput, setTagInput] = useState<string>("")

  // Amount
  const [amount, setAmount] = useState<string>("")

  // A11y live region
  const liveRegionRef = useRef<HTMLDivElement>(null)
  const announce = (msg: string) => {
    if (!liveRegionRef.current) return
    liveRegionRef.current.textContent = msg
    setTimeout(() => {
      if (liveRegionRef.current) liveRegionRef.current.textContent = ""
    }, 800)
  }

  // Switch type and ensure category matches the type
  const switchType = (next: TxType) => {
    setType(next)
    // ensure there is a selected category of that type
    const first = next === "gasto" ? expenseCats[0]?.id : incomeCats[0]?.id
    if (next === "gasto") {
      setSelectedExpenseCat((prev) => prev || first || "comida")
    } else {
      setSelectedIncomeCat((prev) => prev || first || "trabajo")
    }
  }

  const setCategory = (id: string) => {
    const c = cats.find((x) => x.id === id)
    if (!c) return
    if (c.kind === "gasto") {
      setSelectedExpenseCat(id)
      if (type !== "gasto") setType("gasto")
    } else {
      setSelectedIncomeCat(id)
      if (type !== "ingreso") setType("ingreso")
    }
    announce(`Categoría ${c.name} seleccionada`)
  }

  const matchingSuggestions = useMemo(() => {
    return allTags.slice(0, 12)
  }, [allTags])

  const matchingSuggestionsMobile = useMemo(() => {
    return allTags.slice(0, 4)
  }, [allTags])

  const selectTag = (id: string) => {
    const t = allTags.find((tg) => tg.id === id)
    if (!t) return
    setTagId(t.id)
    setTagInput(t.name)
    setAmount(String(t.defaultAmount || ""))
    // match category and type to tag
    const cat = cats.find((c) => c.id === t.categoryId)
    if (cat) {
      if (cat.kind === "gasto") setSelectedExpenseCat(cat.id)
      else setSelectedIncomeCat(cat.id)
      setType(cat.kind)
    }
    announce(`Tag ${t.name} seleccionado`)
  }

  const clearToNew = () => {
    setTagId("")
    setTagInput("")
    setAmount("")
    announce("Nuevo tag. Escribe el nombre y presiona Enter para crearlo.")
    setTimeout(() => tagInputRef.current?.focus(), 0)
  }

  // Create Tag helper that returns the tag object (avoids stale reads)
  const createTagObject = (name: string, defaultAmount?: number): Tag => {
    const cat = cats.find((c) => c.id === categoryId)!
    return {
      id: `t-${Date.now()}`,
      name: name.trim(),
      categoryId: cat.id,
      defaultAmount: Number.isFinite(defaultAmount || 0) && (defaultAmount || 0) > 0 ? (defaultAmount as number) : 0,
      color: cat.color,
    }
  }

  const createTagAndSelect = (name: string) => {
    const newTag = createTagObject(name, Number.parseFloat(amount || "0"))
    setAllTags((prev) => [newTag, ...prev])
    setTagId(newTag.id)
    setTagInput(newTag.name)
    // category stays as-is; tag inherits current category
    announce(`Tag ${newTag.name} creado`)
  }

  const onTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const trimmed = tagInput.trim()
      if (!trimmed) return
      const byName = allTags.find((t) => t.name.toLowerCase() === trimmed.toLowerCase())
      if (byName) selectTag(byName.id)
      else createTagAndSelect(trimmed)
    }
  }

  const submit = () => {
    const a = Number.parseFloat(amount)
    if (!categoryId) return alert("Seleccioná una categoría.")
    if (!tagInput.trim()) return alert("Escribí o seleccioná un tag.")
    if (!a || a <= 0) return alert("Ingresá un monto válido.")

    // Ensure tag exists or create it deterministically
    let currentTag = allTags.find((t) => t.id === tagId)
    const trimmed = tagInput.trim()
    if (!currentTag || currentTag.name.toLowerCase() !== trimmed.toLowerCase()) {
      const byName = allTags.find((t) => t.name.toLowerCase() === trimmed.toLowerCase())
      if (byName) {
        currentTag = byName
        setTagId(byName.id)
      } else {
        const newTag = createTagObject(trimmed, a)
        currentTag = newTag
        setAllTags((prev) => [newTag, ...prev])
        setTagId(newTag.id)
      }
    }

    // Always update tag default amount to last used
    if (currentTag) {
      const updated = { ...currentTag, defaultAmount: a }
      setAllTags((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    }

    const { date, time } = nowInfo()
    onAdd({
      type,
      categoryId,
      tagId: currentTag?.id || "",
      tagName: currentTag?.name || trimmed,
      amount: a,
      date,
      time,
    })

    // Keep amount set to last used for fast re-entry
    setAmount(String(a))
  }

  // UI pieces

  const tagInputRef = useRef<HTMLInputElement>(null)

  const CategoryHeaderDesktop = () => (
    <div className="hidden md:flex items-center justify-between">
      <Label className="text-sm text-gray-600">Categoría</Label>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCreateCategory(true)}
          className="flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Nueva
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowManageCategories(true)}
          className="flex items-center gap-1"
        >
          <Settings className="w-4 h-4" />
          Gestionar
        </Button>
      </div>
    </div>
  )

  const CategoryGrid = ({ items }: { items: Category[] }) => (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
      {items.map((c) => {
        const Icon = c.icon
        const active = categoryId === c.id
        return (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={cn(
              "p-2 rounded-lg border flex items-center gap-2 transition-colors text-left min-w-0",
              active
                ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                : "border-gray-200 hover:bg-gray-50 hover:border-gray-300",
            )}
          >
            <span className={cn("w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0", c.color)}>
              <Icon className="w-3.5 h-3.5 text-white" />
            </span>
            <span className="text-sm truncate">{c.name}</span>
          </button>
        )
      })}
    </div>
  )

  const TagRow = () => {
    const listId = "tag-suggestions"
    return (
      <div className="space-y-2">
        <Label className="text-sm text-gray-600">Tag</Label>
        <p id="tag-hint" className="sr-only">
          Escribe para buscar o crear un nuevo tag. Presiona Enter para crear.
        </p>
        <div className="flex gap-2">
          <Input
            ref={tagInputRef}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={matchingSuggestions.length > 0}
            aria-controls={listId}
            aria-haspopup="listbox"
            aria-describedby="tag-hint"
            placeholder="Escribe para buscar o crear (Enter)"
            value={tagInput}
            onChange={(e) => {
              setTagInput(e.target.value)
              setTagId("") // typing implies "draft" new tag selection
            }}
            onKeyDown={onTagInputKeyDown}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            enterKeyHint="done"
            className="flex-1"
          />
        </div>

        {/* Desktop suggestions with "Nuevo" pill */}
        <div id={listId} role="listbox" className="hidden md:flex md:flex-wrap gap-2">
          <button
            type="button"
            onClick={clearToNew}
            className="px-3 py-1.5 rounded-full border text-sm border-blue-600 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            aria-label="Crear nuevo tag"
            role="option"
            aria-selected={tagId === ""}
          >
            Nuevo
          </button>
          {matchingSuggestions.map((t) => (
            <button
              key={t.id}
              role="option"
              aria-selected={t.id === tagId}
              onClick={() => selectTag(t.id)}
              className={cn(
                "px-3 py-1.5 rounded-full border text-sm transition-colors",
                t.id === tagId
                  ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-200"
                  : "border-gray-200 hover:bg-gray-50 hover:border-gray-300",
              )}
            >
              {t.name} <span className="text-xs text-gray-500 ml-1">${t.defaultAmount}</span>
            </button>
          ))}
        </div>

        {/* Mobile suggestions with "Nuevo" pill */}
        <div role="listbox" className="md:hidden">
          <div 
          // className="flex gap-2 overflow-x-auto pb-2" 
              className="flex flex-col sm:flex-row gap-2 pb-2"

            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            <button
              type="button"
              onClick={clearToNew}
              className="shrink-0 px-3 py-1.5 rounded-full border text-sm border-blue-600 bg-blue-50 text-blue-700 transition-colors"
              aria-label="Crear nuevo tag"
              role="option"
              aria-selected={tagId === ""}
            >
              Nuevo
            </button>
            {matchingSuggestionsMobile.map((t) => (
              <button
                key={t.id}
                role="option"
                aria-selected={t.id === tagId}
                onClick={() => selectTag(t.id)}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-full border text-sm transition-colors whitespace-nowrap",
                  t.id === tagId
                    ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-200"
                    : "border-gray-200 hover:bg-gray-50 hover:border-gray-300",
                )}
              >
                {t.name} <span className="text-xs text-gray-500 ml-1">${t.defaultAmount}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Create Category dialog state and handlers
  const [showCreateCategory, setShowCreateCategory] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [newCatIconId, setNewCatIconId] = useState(availableIcons[0].id)
  const [newCatColorId, setNewCatColorId] = useState(availableColors[0].id)
  const [newCatKind, setNewCatKind] = useState<TxType>(type)

  const createCategory = () => {
    if (!newCatName.trim()) {
      alert("Ingresá un nombre de categoría.")
      return
    }
    const iconObj = availableIcons.find((i) => i.id === newCatIconId) || availableIcons[0]
    const colorObj = availableColors.find((c) => c.id === newCatColorId) || availableColors[0]
    const cat: Category = {
      id: `c-${Date.now()}`,
      name: newCatName.trim(),
      icon: iconObj.icon,
      color: colorObj.class,
      kind: newCatKind,
    }
    setCats((prev) => [cat, ...prev])
    if (cat.kind === "gasto") {
      setSelectedExpenseCat(cat.id)
      setType("gasto")
    } else {
      setSelectedIncomeCat(cat.id)
      setType("ingreso")
    }
    setShowCreateCategory(false)
    setNewCatName("")
    setNewCatIconId(availableIcons[0].id)
    setNewCatColorId(availableColors[0].id)
    setNewCatKind(type)
    announce(`Categoría ${cat.name} creada`)
  }

  // Manage Categories dialog state and handlers
  const [showManageCategories, setShowManageCategories] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editCatName, setEditCatName] = useState("")
  const [editCatIconId, setEditCatIconId] = useState("")
  const [editCatColorId, setEditCatColorId] = useState("")

  const startEditCategory = (cat: Category) => {
    setEditingCategory(cat)
    setEditCatName(cat.name)
    const iconObj = availableIcons.find((i) => i.icon === cat.icon)
    setEditCatIconId(iconObj?.id || availableIcons[0].id)
    const colorObj = availableColors.find((c) => c.class === cat.color)
    setEditCatColorId(colorObj?.id || availableColors[0].id)
  }

  const saveEditCategory = () => {
    if (!editingCategory || !editCatName.trim()) return

    const iconObj = availableIcons.find((i) => i.id === editCatIconId) || availableIcons[0]
    const colorObj = availableColors.find((c) => c.id === editCatColorId) || availableColors[0]

    const updatedCat: Category = {
      ...editingCategory,
      name: editCatName.trim(),
      icon: iconObj.icon,
      color: colorObj.class,
    }

    setCats((prev) => prev.map((c) => (c.id === editingCategory.id ? updatedCat : c)))
    setEditingCategory(null)
    announce(`Categoría ${updatedCat.name} actualizada`)
  }

  const deleteCategory = (catId: string) => {
    const cat = cats.find((c) => c.id === catId)
    if (!cat) return

    // Check if there are tags using this category
    const relatedTags = allTags.filter((t) => t.categoryId === catId)
    if (relatedTags.length > 0) {
      const confirmDelete = confirm(
        `Esta categoría tiene ${relatedTags.length} tag(s) asociado(s). ¿Estás seguro de que quieres eliminarla? Esto también eliminará todos los tags asociados.`,
      )
      if (!confirmDelete) return

      // Remove related tags
      setAllTags((prev) => prev.filter((t) => t.categoryId !== catId))
    }

    setCats((prev) => prev.filter((c) => c.id !== catId))

    // Reset selection if deleted category was selected
    if (categoryId === catId) {
      const remaining = cats.filter((c) => c.id !== catId && c.kind === type)
      if (remaining.length > 0) {
        if (type === "gasto") setSelectedExpenseCat(remaining[0].id)
        else setSelectedIncomeCat(remaining[0].id)
      }
    }

    announce(`Categoría ${cat.name} eliminada`)
  }

  const shownCategories = type === "gasto" ? expenseCats : incomeCats

  return (
    <Card className="w-full max-w-none">
      <CardHeader>
        <CardTitle className="text-base">Agregar transacción</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {/* A11y live region */}
        <div ref={liveRegionRef} className="sr-only" aria-live="polite" aria-atomic="true"></div>

        {/* Type selector - Big buttons */}
        <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Tipo de transacción">
          <button
            role="tab"
            aria-selected={type === "gasto"}
            onClick={() => switchType("gasto")}
            className={cn(
              "py-3 px-4 rounded-lg text-base font-semibold transition-all border-2 md:py-4 md:px-6 md:text-lg",
              type === "gasto"
                ? "bg-red-50 border-red-500 text-red-700 shadow-md"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100",
            )}
          >
            <span className="block sm:inline">💸</span> Gasto
          </button>
          <button
            role="tab"
            aria-selected={type === "ingreso"}
            onClick={() => switchType("ingreso")}
            className={cn(
              "py-3 px-4 rounded-lg text-base font-semibold transition-all border-2 md:py-4 md:px-6 md:text-lg",
              type === "ingreso"
                ? "bg-green-50 border-green-500 text-green-700 shadow-md"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100",
            )}
          >
            <span className="block sm:inline">💰</span> Ingreso
          </button>
        </div>

        {/* Category: mobile header */}
        <div className="md:hidden flex items-center justify-between">
          <Label className="text-sm text-gray-600">Categoría</Label>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateCategory(true)}
              className="flex items-center gap-1 text-xs px-2 py-1"
            >
              <Plus className="w-3 h-3" />
              Nueva
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowManageCategories(true)}
              className="flex items-center gap-1 text-xs px-2 py-1"
            >
              <Settings className="w-3 h-3" />
              Gestionar
            </Button>
          </div>
        </div>

        {/* Category: desktop header and grid */}
        <CategoryHeaderDesktop />
        <CategoryGrid items={shownCategories} />

        {/* Tags */}
        <TagRow />

        {/* Amount */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-600">Monto</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <Input
              id="amount-input"
              aria-label="Monto"
              inputMode="decimal"
              pattern="[0-9]*"
              enterKeyHint="done"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-8 h-12 text-xl font-semibold md:text-2xl"
              placeholder="0"
            />
          </div>
        </div>

        <Button onClick={submit} className="w-full h-12 text-base font-semibold">
          {type === "gasto" ? "Gastar" : "Agregar"}
        </Button>
      </CardContent>

      {/* Create Category Dialog */}
      <Dialog open={showCreateCategory} onOpenChange={setShowCreateCategory}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva categoría</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex bg-gray-100 rounded-lg p-1" role="tablist" aria-label="Tipo de categoría">
              <button
                role="tab"
                aria-selected={newCatKind === "gasto"}
                onClick={() => setNewCatKind("gasto")}
                className={cn(
                  "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
                  newCatKind === "gasto"
                    ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                Gasto
              </button>
              <button
                role="tab"
                aria-selected={newCatKind === "ingreso"}
                onClick={() => setNewCatKind("ingreso")}
                className={cn(
                  "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
                  newCatKind === "ingreso"
                    ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                Ingreso
              </button>
            </div>

            <div>
              <Label htmlFor="new-cat-name">Nombre</Label>
              <Input
                id="new-cat-name"
                placeholder="Ej: Mascotas"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
              />
            </div>

            <div>
              <Label>Ícono</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {availableIcons.map((i) => {
                  const Icon = i.icon
                  const active = newCatIconId === i.id
                  return (
                    <button
                      key={i.id}
                      onClick={() => setNewCatIconId(i.id)}
                      className={cn(
                        "p-2 rounded-lg border flex items-center justify-center",
                        active ? "border-primary-600 bg-primary-50" : "border-gray-200 hover:bg-gray-50",
                      )}
                      title={i.name}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <Label>Color</Label>
              <div className="grid grid-cols-8 gap-2 mt-2">
                {availableColors.map((c) => {
                  const active = newCatColorId === c.id
                  return (
                    <button
                      key={c.id}
                      onClick={() => setNewCatColorId(c.id)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2",
                        c.class,
                        active ? "border-gray-900" : "border-white",
                      )}
                      title={c.name}
                    />
                  )
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateCategory(false)}>
              Cancelar
            </Button>
            <Button onClick={createCategory}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Categories Dialog */}
      <Dialog open={showManageCategories} onOpenChange={() => setShowManageCategories(false)}>
        <DialogContent className="w-[95vw] max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gestionar Categorías</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-96 overflow-y-auto">
            {cats.map((cat) => {
              const Icon = cat.icon
              const isEditing = editingCategory?.id === cat.id
              const relatedTagsCount = allTags.filter((t) => t.categoryId === cat.id).length

              return (
                <div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", cat.color)}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{cat.name}</p>
                      <p className="text-sm text-gray-500">
                        {cat.kind === "gasto" ? "Gasto" : "Ingreso"} • {relatedTagsCount} tag(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditCategory(cat)}
                      className="flex items-center gap-1 text-xs px-2 py-1"
                    >
                      <Edit className="w-3 h-3" />
                      <span className="hidden sm:inline">Editar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCategory(cat.id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 text-xs px-2 py-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span className="hidden sm:inline">Eliminar</span>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowManageCategories(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="edit-cat-name">Nombre</Label>
              <Input
                id="edit-cat-name"
                placeholder="Nombre de la categoría"
                value={editCatName}
                onChange={(e) => setEditCatName(e.target.value)}
              />
            </div>

            <div>
              <Label>Ícono</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {availableIcons.map((i) => {
                  const Icon = i.icon
                  const active = editCatIconId === i.id
                  return (
                    <button
                      key={i.id}
                      onClick={() => setEditCatIconId(i.id)}
                      className={cn(
                        "p-2 rounded-lg border flex items-center justify-center",
                        active ? "border-primary-600 bg-primary-50" : "border-gray-200 hover:bg-gray-50",
                      )}
                      title={i.name}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <Label>Color</Label>
              <div className="grid grid-cols-8 gap-2 mt-2">
                {availableColors.map((c) => {
                  const active = editCatColorId === c.id
                  return (
                    <button
                      key={c.id}
                      onClick={() => setEditCatColorId(c.id)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2",
                        c.class,
                        active ? "border-gray-900" : "border-white",
                      )}
                      title={c.name}
                    />
                  )
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>
              Cancelar
            </Button>
            <Button onClick={saveEditCategory}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
