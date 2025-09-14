"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
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
  TrendingUp,
  CreditCard,
} from "lucide-react"

const categories = [
  { id: "comida", name: "Comida", icon: Utensils },
  { id: "comestibles", name: "Comestibles", icon: ShoppingCart },
  { id: "transporte", name: "Transporte", icon: Car },
  { id: "hogar", name: "Hogar", icon: Home },
  { id: "entretenimiento", name: "Entretenimiento", icon: Gamepad2 },
  { id: "servicios", name: "Servicios", icon: Zap },
  { id: "regalos", name: "Regalos", icon: Gift },
  { id: "belleza", name: "Belleza", icon: Sparkles },
  { id: "trabajo", name: "Trabajo", icon: Briefcase },
  { id: "viajes", name: "Viajes", icon: Plane },
  { id: "efectivo", name: "Efectivo", icon: DollarSign },
  { id: "inversion", name: "Inversión", icon: TrendingUp },
  { id: "pago_deuda", name: "Pago Deuda", icon: CreditCard },
]

interface Transaction {
  id: string
  assetId: string
  title: string
  amount: number
  type: "gasto" | "ingreso"
  category: string
  date: string
  time: string
}

interface EditTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (transaction: Transaction) => void
  transaction: Transaction | null
}

export default function EditTransactionModal({ isOpen, onClose, onSave, transaction }: EditTransactionModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "gasto" as "gasto" | "ingreso",
    category: "",
    date: "",
    time: "",
  })

  useEffect(() => {
    if (transaction) {
      setFormData({
        title: transaction.title,
        amount: transaction.amount.toString(),
        type: transaction.type,
        category: transaction.category,
        date: transaction.date,
        time: transaction.time,
      })
    }
  }, [transaction])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!transaction) return

    const updatedTransaction: Transaction = {
      ...transaction,
      title: formData.title,
      amount: Number.parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      date: formData.date,
      time: formData.time,
    }

    onSave(updatedTransaction)
    onClose()
  }

  const handleClose = () => {
    onClose()
  }

  if (!transaction) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Transacción</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selection */}
          <div className="space-y-2">
            <Label>Tipo</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.type === "gasto" ? "default" : "outline"}
                className={cn("flex-1", formData.type === "gasto" && "bg-red-500 hover:bg-red-600")}
                onClick={() => setFormData({ ...formData, type: "gasto" })}
              >
                Gasto
              </Button>
              <Button
                type="button"
                variant={formData.type === "ingreso" ? "default" : "outline"}
                className={cn("flex-1", formData.type === "ingreso" && "bg-green-500 hover:bg-green-600")}
                onClick={() => setFormData({ ...formData, type: "ingreso" })}
              >
                Ingreso
              </Button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Descripción de la transacción"
              required
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label>Categoría</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {categories.map((category) => {
                const IconComponent = category.icon
                const isSelected = formData.category === category.id
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: category.id })}
                    className={cn(
                      "p-2 sm:p-3 rounded-lg border-2 transition-all hover:shadow-sm",
                      isSelected
                        ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300",
                    )}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                      <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                        {category.name}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
