"use client"

import type React from "react"

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
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Category } from "@/lib/schemas/category";
import { Tag } from "@/lib/schemas/tag";
import { availableColors, availableIcons, iconComponents } from "./quick-spend-constants"
import { TxType } from "@/lib/schemas/definitions";

type Props = {
    cats: Category[],
    allTags: Tag[],
    showCreateCategory: boolean,
    setShowCreateCategory: (open: boolean) => void,
    newCatType: TxType.EXPENSE | TxType.INCOME,
    setNewCatType: (kind: TxType.EXPENSE | TxType.INCOME) => void,
    newCatName: string,
    setNewCatName: (name: string) => void,
    newCatIconId: string,
    setNewCatIconId: (id: string) => void,
    newCatColorId: string,
    setNewCatColorId: (id: string) => void,
    createCategory: () => void,
    showManageCategories: boolean,
    setShowManageCategories: (open: boolean) => void,
    deleteCategory: (id: string) => void,
    editingCategory: Category | null,
    setEditingCategory: (category: Category | null) => void,
    startEditCategory: (category: Category) => void,
    editCatName: string,
    setEditCatName: (name: string) => void,
    editCatIconId: string,
    setEditCatIconId: (id: string) => void,
    editCatColorId: string,
    setEditCatColorId: (id: string) => void,
    saveEditCategory: () => void,
}

/**
 * Dialogs for creating and managing categories (used in QuickSpendCard component)
 * @param cats Categories array
 * @param allTags All tags array
 * @param showCreateCategory Boolean to control the visibility of the create category dialog
 * @param setShowCreateCategory Function to set the visibility of the create category dialog
 * @param newCatType Type of the new category (TxType.EXPENSE or TxType.INCOME)
 * @param setNewCatType Function to set the kind of the new category
 * @param newCatName Name of the new category
 * @param setNewCatName Function to set the name of the new category
 * @param newCatIconId ID of the icon for the new category
 * @param setNewCatIconId Function to set the icon ID for the new category
 * @param newCatColorId ID of the color for the new category
 * @param setNewCatColorId Function to set the color ID for the new category
 * @param createCategory Function to create the new category
 * @param showManageCategories Boolean to control the visibility of the manage categories dialog
 * @param setShowManageCategories Function to set the visibility of the manage categories dialog
 * @param deleteCategory Function to delete a category
 * @param editingCategory Category being edited
 * @param setEditingCategory Function to set the category being edited
 * @param startEditCategory Function to start editing a category
 * @param editCatName Name of the category being edited
 * @param setEditCatName Function to set the name of the category being edited
 * @param editCatIconId ID of the icon for the category being edited
 * @param setEditCatIconId Function to set the icon ID for the category being edited
 * @param editCatColorId ID of the color for the category being edited
 * @param setEditCatColorId Function to set the color ID for the category being edited
 * @param saveEditCategory Function to save the edited category
 */
export function QuickSpendCategoryDialogs({
    cats,
    allTags,
    showCreateCategory,
    setShowCreateCategory,
    newCatType,
    setNewCatType,
    newCatName,
    setNewCatName,
    newCatIconId,
    setNewCatIconId,
    newCatColorId,
    setNewCatColorId,
    createCategory,
    showManageCategories,
    setShowManageCategories,
    deleteCategory,
    editingCategory,
    setEditingCategory,
    startEditCategory,
    editCatName,
    setEditCatName,
    editCatIconId,
    setEditCatIconId,
    editCatColorId,
    setEditCatColorId,
    saveEditCategory,
}: Props) {
    
    return (
        <>
        <Dialog open={showCreateCategory} onOpenChange={setShowCreateCategory}>
            <DialogContent className="w-[95vw] max-w-md">
            <DialogHeader>
                <DialogTitle>Nueva categoría</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
                <div className="flex bg-gray-100 rounded-lg p-1" role="tablist" aria-label="Tipo de categoría">
                <button
                    role="tab"
                    aria-selected={newCatType === TxType.EXPENSE}
                    onClick={() => setNewCatType(TxType.EXPENSE)}
                    className={cn(
                    "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
                    newCatType === TxType.EXPENSE
                        ? "bg-white text-gray-900 shadow-sm border border-gray-200 ring-2 ring-red-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                    )}
                >
                    💸 Gasto
                </button>
                <button
                    role="tab"
                    aria-selected={newCatType === TxType.INCOME}
                    onClick={() => setNewCatType(TxType.INCOME)}
                    className={cn(
                    "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
                    newCatType === TxType.INCOME
                        ? "bg-white text-gray-900 shadow-sm border border-gray-200 ring-2 ring-green-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                    )}
                >
                    💰 Ingreso
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
                <Button type="button" variant="outline" onClick={() => {setShowCreateCategory(false); setNewCatName("")}}>
                Cancelar
                </Button>
                <Button type="button" onClick={createCategory}>Crear</Button>
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
                // const Icon = cat.icon
                const Icon = iconComponents[cat.icon as keyof typeof iconComponents] // MAPPING icon to category string 
                    
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
                            {cat.type === "expense" ? "Gasto" : "Ingreso"} • {relatedTagsCount} tag(s)
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
        </>
    )
}