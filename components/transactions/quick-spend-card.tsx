"use client"

import type React from "react"

import { useMemo, useRef, useState } from "react"
import { useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import {
  Settings,
  Plus,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"

import { Tag } from "@/lib/schemas/tag";
import { Movement } from "@/lib/schemas/movement";
import { TxType } from "@/lib/schemas/definitions";
import { Category } from "@/lib/schemas/category";
import { getCategoriesByUser, postCategory, deleteCategoryById } from "@/lib/actions/categories";
import { getTagsByUser } from "@/lib/actions/tags";

import { QuickSpendCategoryDialogs } from "./quick-spend-category-dialogs"
import { availableIcons, availableColors, iconComponents } from "./quick-spend-constants"
import { CategoryHeaderDesktop, CategoryHeaderMobile, CategoryGrid, TagRow } from "./quick-spend-ui-pieces"


// this very nice but not sure how it works TODO review
function nowInfo() {
  const d = new Date()
  return {
    date: d.toLocaleDateString("es-AR"),
    time: d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
  }
}

/**
 * @title Quick Spend Card used in home and asset
 * @param onAdd Callback with the data of MOVEMENT when added
 * @param defaultType Default type to open form with (gasto/ingreso)
 * @param onManageCategories
 * @param initialType Initial type to use when opening asset (gasto/ingreso)
 * @param onCancel Callback on cancel used on asset (TODO is this required?)
 * @returns 
 */
export default function QuickSpendCard({
  onAdd,
  defaultType = TxType.EXPENSE,
  onManageCategories,
  initialType,
  onCancel,
}: {
  onAdd: (data: Movement) => void
  defaultType?: TxType
  onManageCategories?: () => void
  initialType?: TxType
  onCancel?: () => void
}) {
  // type selection and useful for when opening modal with an already selected option
  const [type, setType] = useState<TxType>(initialType || defaultType)
  
  /**
   * 
   * CATEGORY cats and card handlers
   * 
   */
  
  // Categories state (allows creation, setsnewone after created)
  const [cats, setCats] = useState<Category[]>([]) // TODO Validate what to do when null or empty

  /**
   * Fetch Categories
   * TODO Validate if this should be on parent component
   * This is the "lift state up" pattern. If it gets too deep (prop drilling), use Context.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const cats = await getCategoriesByUser();
        setCats(cats);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    
    fetchData();
  }, []);

  // fitlered cats
  const expenseCats = useMemo(() => cats.filter((c) => c.type === TxType.EXPENSE), [cats]) 
  const incomeCats = useMemo(() => cats.filter((c) => c.type === TxType.INCOME), [cats])

  // Track a selected category per type so switching is smooth
  const [selectedExpenseCat, setSelectedExpenseCat] = useState<string>(expenseCats[0]?.id ) // || "comida" // TODO Validate what to do when null or empty or not this id
  const [selectedIncomeCat, setSelectedIncomeCat] = useState<string>(incomeCats[0]?.id)

  // Selected category
  const categoryId = type === TxType.EXPENSE ? selectedExpenseCat : selectedIncomeCat

  /** By using an ARIA live region, you make your app accessible (A11y = accessibility). */
  // A11y live region
  const liveRegionRef = useRef<HTMLDivElement>(null)
  // screen readers (used by blind/visually impaired users) will read that message out loud, even though it's invisible on screen.
  const announce = (msg: string) => { 
    if (!liveRegionRef.current) return
    liveRegionRef.current.textContent = msg
    setTimeout(() => {
      if (liveRegionRef.current) liveRegionRef.current.textContent = ""
    }, 800)
  }

  // Switch between "gasto" (expense) and "ingreso" (income) types
  // and make sure a valid category is selected for the new type
  const switchType = (next: TxType) => { // next: the type we're switching TO
    setType(next)// Update the transaction type
    // Get the first available category for the new type (or undefined if none exist)
    const first = next === TxType.EXPENSE ? expenseCats[0]?.id : incomeCats[0]?.id
    if (next === TxType.EXPENSE) {
      // For expenses: keep current selection, OR use first available, OR fallback to "comida"
      setSelectedExpenseCat((prev) => prev || first || "comida")
    } else {
      setSelectedIncomeCat((prev) => prev || first || "trabajo")
    }
  }

  /**
   * Set selected Category
   * @param id 
   */
  const setCategory = (id: string) => {
    const c = cats.find((x) => x.id === id)
    if (!c) return
    if (c.type === TxType.EXPENSE) {
      setSelectedExpenseCat(id)
      if (type !== TxType.EXPENSE) setType(TxType.EXPENSE)
    } else {
      setSelectedIncomeCat(id)
      if (type !== TxType.INCOME) setType(TxType.INCOME)
    }
    announce(`Categoría ${c.name} seleccionada`)
  }

  // Categories to display based on selected type
  const shownCategories = type === TxType.EXPENSE ? expenseCats : incomeCats

  /**
   * 
   * Tags
   * 
   */

  // Selected tag to be used in form
  const [tagId, setTagId] = useState<string>("")
  // Selected tag name te be used as selected reference
  const [tagInput, setTagInput] = useState<string>("")
  // Amount in form. This also allows that when tag selected input amount is set with value.
  const [amount, setAmount] = useState<string>("")

  // Tags (global suggestions; not filtered by category initially)
  const [allTags, setAllTags] = useState<Tag[]>([])
  
  /**
   * Fetch Tags
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const allTags = await getTagsByUser();
        setAllTags(allTags);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      }
    };
    
    fetchData();
  }, []);
  
  // Match the amount of tag pills to diplay
  const matchingSuggestions = useMemo(() => {
    return allTags.slice(0, 12)
  }, [allTags])

  const matchingSuggestionsMobile = useMemo(() => {
    return allTags.slice(0, 4)
  }, [allTags])

  // Selecting tag and its actions
  const selectTag = (id: string) => {
    const t = allTags.find((tg) => tg.id === id)
    if (!t) return
    setTagId(t.id)
    setTagInput(t.name)
    setAmount(String(t.amount || ""))
    // match category and type to tag
    const cat = cats.find((c) => c.id === t.categoryId)
    if (cat) {
      if (cat.type === TxType.EXPENSE) setSelectedExpenseCat(cat.id)
      else setSelectedIncomeCat(cat.id)
      setType(cat.type)
    }
    announce(`Tag ${t.name} seleccionado`)
  }

  // const clearToNew = () => {
  //   setTagId("")
  //   setTagInput("")
  //   setAmount("")
  //   announce("Nuevo tag. Escribe el nombre y presiona Enter para crearlo.")
  //   setTimeout(() => tagInputRef.current?.focus(), 0)
  // }

  // TODO REVIEW Create Tag helper that returns the tag object (avoids stale reads)
  const createTagObject = (name: string, amount?: number): Tag => {
    const cat = cats.find((c) => c.id === categoryId)!
    return {
      id: `t-${Date.now()}`,
      name: name.trim(),
      categoryId: cat.id,
      amount: Number.isFinite(amount || 0) && (amount || 0) > 0 ? (amount as number) : 0,
      color: cat.color,
    }
  }

  // TODO this is after creation, should handle with api response instead of this
  const createTagAndSelect = (name: string) => {
    const newTag = createTagObject(name, Number.parseFloat(amount || "0"))
    setAllTags((prev) => [newTag, ...prev])
    setTagId(newTag.id)
    setTagInput(newTag.name)
    // category stays as-is; tag inherits current category
    announce(`Tag ${newTag.name} creado`)
  }

  // TODO this works wrongly
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

  /**
   * Movement submit
   * TODO describe process and improve with api
   */
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
      const updated = { ...currentTag, amount: a }
      setAllTags((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    }

    const { date, time } = nowInfo()
    // onAdd({
    //   type,
    //   categoryId,
    //   tagId: currentTag?.id || "",
    //   tagName: currentTag?.name || trimmed,
    //   amount: a,
    //   date,
    //   time,
    // })

    // Keep amount set to last used for fast re-entry
    setAmount(String(a))
  }

  /**
   * 
   * UI PIECES
   * 
   */

  // UI pieces

  // TAG ROW Ref to directly access the tag input DOM element (e.g., to focus or clear it programmatically)
  // const tagInputRef = useRef<HTMLInputElement>(null)

  /**
   * 
   * CATEGORY dialog handlers and functions
   * 
   */

  // Create Category dialog state and handlers
  const [showCreateCategory, setShowCreateCategory] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [newCatIconId, setNewCatIconId] = useState(availableIcons[0].id)
  const [newCatColorId, setNewCatColorId] = useState(availableColors[0].id)
  const [newCatType, setNewCatType] = useState<TxType>(type)

  const createCategory = async () => {
    if (!newCatName.trim()) {
      alert("Ingresá un nombre de categoría.")
      return
    }

    // building cat object
    const iconObj = availableIcons.find((i) => i.id === newCatIconId) || availableIcons[0]
    const colorObj = availableColors.find((c) => c.id === newCatColorId) || availableColors[0]

    try {
      // API call FIRST
      const result = await postCategory({
        name: newCatName.trim(),
        icon: iconObj.id,
        color: colorObj.class,
        type: newCatType,
      })

      console.log("result", result);
      
      // if ('errors' in result || 'message' in result) {
      //   alert(result.message || "Error al crear categoría")
      //   return
      // }

      const cat = result as Category
      setCats((prev) => [cat, ...prev]) // setCats! 

      // set filtered cats based on creations
      if (cat.type === TxType.EXPENSE) {
        setSelectedExpenseCat(cat.id)
        setType(TxType.EXPENSE)
      } else {
        setSelectedIncomeCat(cat.id)
        setType(TxType.INCOME)
      }

      // close dialog and clean form
      setShowCreateCategory(false)
      setNewCatName("")
      setNewCatIconId(availableIcons[0].id)
      setNewCatColorId(availableColors[0].id)
      setNewCatType(type)

      announce(`Categoría ${cat.name} creada`)
    } catch (error) {
      console.log('error ', error);
      
      alert("Error al crear categoría")
    }
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
    const Icon = iconComponents[cat.icon as keyof typeof iconComponents] // MAPPING icon to category string

    const iconObj = availableIcons.find((i) => i.icon === Icon)
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
      icon: iconObj.icon.name,
      color: colorObj.class,
    }

    setCats((prev) => prev.map((c) => (c.id === editingCategory.id ? updatedCat : c)))
    setEditingCategory(null)
    announce(`Categoría ${updatedCat.name} actualizada`)
  }

  /* deletion */
  const deleteCategory = async (catId: string) => {
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

    await deleteCategoryById(cat.id);

    setCats((prev) => prev.filter((c) => c.id !== catId))

    // Reset selection if deleted category was selected
    if (categoryId === catId) {
      const remaining = cats.filter((c) => c.id !== catId && c.type === type)
      if (remaining.length > 0) {
        if (type === TxType.EXPENSE) setSelectedExpenseCat(remaining[0].id)
        else setSelectedIncomeCat(remaining[0].id)
      }
    }

    announce(`Categoría ${cat.name} eliminada`)
  }


  /**
   * 
   * ADD TRANSACTION
   * 
   */
  return (
    <Card className="w-full max-w-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Agregar transacción</CardTitle>
          {onCancel && (
            <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {/* A11y live region */}
        <div ref={liveRegionRef} className="sr-only" aria-live="polite" aria-atomic="true"></div>

        {/* Type selector - Big buttons */}
        <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Tipo de transacción">
          <button
            role="tab"
            aria-selected={type === TxType.EXPENSE}
            onClick={() => switchType(TxType.EXPENSE)}
            className={cn(
              "py-3 px-4 rounded-lg text-base font-semibold transition-all border-2 md:py-4 md:px-6 md:text-lg",
              type === TxType.EXPENSE
                ? "bg-red-50 border-red-500 text-red-700 shadow-md ring-2 ring-red-200"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100",
            )}
          >
            <span className="block sm:inline">💸</span> Gasto
          </button>
          <button
            role="tab"
            aria-selected={type === TxType.INCOME}
            onClick={() => switchType(TxType.INCOME)}
            className={cn(
              "py-3 px-4 rounded-lg text-base font-semibold transition-all border-2 md:py-4 md:px-6 md:text-lg",
              type === TxType.INCOME
                ? "bg-green-50 border-green-500 text-green-700 shadow-md ring-2 ring-green-200"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100",
            )}
          >
            <span className="block sm:inline">💰</span> Ingreso
          </button>
        </div>

        {/* Category: mobile header */}
        <CategoryHeaderMobile 
          setShowCreateCategory={setShowCreateCategory} 
          setShowManageCategories={setShowManageCategories}
        />

        {/* Category: desktop header*/}
        <CategoryHeaderDesktop 
          setShowCreateCategory={setShowCreateCategory} 
          setShowManageCategories={setShowManageCategories}
        />

        {/* Category: grid */}
        <CategoryGrid 
          items={shownCategories} 
          categoryId={categoryId}
          setCategory={setCategory}
        />

        {/* Tags */}
        <TagRow 
          tagInput={tagInput}
          setTagInput={setTagInput}
          tagId={tagId}
          setTagId={ setTagId}
          matchingSuggestions={matchingSuggestions}
          matchingSuggestionsMobile={matchingSuggestionsMobile}
          selectTag={selectTag}
          // clearToNew={ clearToNew}
          // onTagInputKeyDown={ onTagInputKeyDown }
        />

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
          {type === TxType.EXPENSE ? "Gastar" : "Agregar"}
        </Button>
      </CardContent>
      
      {/* Category Dialogs */}
      <QuickSpendCategoryDialogs
        // objects
        cats={cats}
        allTags={allTags}
        // handlers for popup
        showCreateCategory={showCreateCategory}
        setShowCreateCategory={setShowCreateCategory}
        showManageCategories={showManageCategories}
        setShowManageCategories={setShowManageCategories}
        // new form
        newCatName={newCatName}
        setNewCatName={setNewCatName}
        newCatIconId={newCatIconId}
        setNewCatIconId={setNewCatIconId}
        newCatColorId={newCatColorId}
        setNewCatColorId={setNewCatColorId}
        newCatType={newCatType}
        setNewCatType={setNewCatType}
        // edit form
        startEditCategory={startEditCategory}
        editingCategory={editingCategory}
        setEditingCategory={setEditingCategory}

        editCatName={editCatName}
        setEditCatName={setEditCatName}
        editCatIconId={editCatIconId}
        setEditCatIconId={setEditCatIconId}
        editCatColorId={editCatColorId}
        setEditCatColorId={setEditCatColorId}
        // actions
        createCategory={createCategory}
        saveEditCategory={saveEditCategory}
        deleteCategory={deleteCategory}
      />

    </Card>
  )
}
