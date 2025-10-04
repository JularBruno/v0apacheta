
"use client"

import type React from "react"

import { useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Category } from "@/lib/schemas/category";

import {
  Settings,
  Plus,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

import {  iconComponents } from "./quick-spend-constants"

type CategoryHeaderProps = {
    setShowCreateCategory: (open: boolean) => void,
    setShowManageCategories: (open: boolean) => void,
}

export function CategoryHeaderDesktop({
    setShowManageCategories,
    setShowCreateCategory
}: CategoryHeaderProps) {
    return (
        <>
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
        </>
    )
}

export function CategoryHeaderMobile({
    setShowManageCategories,
    setShowCreateCategory
}: CategoryHeaderProps) {
    return (
        <>
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
        </>
    )
}



type CategoryGridProps = {
    items: Category[],
    categoryId: string,
    setCategory: (id: string) => void
}

export function CategoryGrid({
    items,
    categoryId,
    setCategory
}: CategoryGridProps
) {
    return (
        <>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
                {items.map((c) => {
                    const Icon = iconComponents[c.icon as keyof typeof iconComponents]
                    const active = categoryId === c.id
                    return (
                    <button
                        key={c.id}
                        onClick={() => setCategory(c.id)}
                        className={cn(
                        "p-3 rounded-lg border flex items-center gap-2 transition-all text-left min-w-0",
                        active
                            ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200 shadow-md"
                            : "border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm",
                        )}
                    >
                        <span className={cn("w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0", c.color)}>
                        <Icon className="w-4 h-4 text-white" />
                        </span>
                        <span className={cn("text-sm font-medium truncate", active ? "text-blue-900" : "text-gray-700")}>
                        {c.name}
                        </span>
                    </button>
                    )
                })}
            </div>
        </>
    )
}
