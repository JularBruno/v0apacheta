"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Utensils,
  ShoppingCart,
  Car,
  Home,
  Gamepad2,
  Zap,
  Gift,
  Sparkles,
  Plane,
  Plus,
  Trash2,
  Wallet,
  Lightbulb,
  Map,
  CalendarDays,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Define categories with initial budget values
const categoriesWithBudget = [
  { id: "comida", name: "Comida", icon: Utensils, color: "bg-orange-500", initialBudget: 200 },
  { id: "comestibles", name: "Comestibles", icon: ShoppingCart, color: "bg-green-500", initialBudget: 300 },
  { id: "transporte", name: "Transporte", icon: Car, color: "bg-blue-500", initialBudget: 150 },
  { id: "hogar", name: "Hogar", icon: Home, color: "bg-purple-500", initialBudget: 100 },
  { id: "entretenimiento", name: "Entretenimiento", icon: Gamepad2, color: "bg-red-500", initialBudget: 80 },
  { id: "servicios", name: "Servicios", icon: Zap, color: "bg-yellow-500", initialBudget: 120 },
  { id: "regalos", name: "Regalos", icon: Gift, color: "bg-pink-500", initialBudget: 50 },
  { id: "belleza", name: "Belleza", icon: Sparkles, color: "bg-indigo-500", initialBudget: 60 },
  { id: "viajes", name: "Viajes", icon: Plane, color: "bg-cyan-500", initialBudget: 200 },
]

// Mock expenses for budget tracking (simplified for this page)
const mockExpenses = [
  { category: "comida", amount: 45.5 },
  { category: "comestibles", amount: 89.2 },
  { category: "transporte", amount: 12.75 },
  { category: "entretenimiento", amount: 8.99 },
  { category: "comida", amount: 15.3 },
  { category: "transporte", amount: 35.0 },
  { category: "belleza", amount: 22.5 },
  { category: "servicios", amount: 50.0 },
]

interface PaymentItem {
  id: string
  name: string
  amount: number
  dueDate?: string // Optional for random payments
}

export default function PresupuestoPage() {
  const [monthlyBudget, setMonthlyBudget] = useState(1500) // Overall monthly budget
  const [categoryBudgets, setCategoryBudgets] = useState(
    categoriesWithBudget.map((cat) => ({
      ...cat,
      currentSpent: mockExpenses.filter((exp) => exp.category === cat.id).reduce((sum, exp) => sum + exp.amount, 0),
    })),
  )
  const [monthlyPayments, setMonthlyPayments] = useState<PaymentItem[]>([
    { id: "1", name: "Alquiler", amount: 500, dueDate: "01/mes" },
    { id: "2", name: "Internet", amount: 30, dueDate: "15/mes" },
    { id: "3", name: "Electricidad", amount: 70, dueDate: "20/mes" },
  ])
  const [randomPayments, setRandomPayments] = useState<PaymentItem[]>([
    { id: "4", name: "Regalo de Cumpleaños", amount: 40 },
    { id: "5", name: "Reparación Auto", amount: 150 },
  ])

  const totalBudgeted = useMemo(() => {
    return categoryBudgets.reduce((sum, cat) => sum + cat.initialBudget, 0)
  }, [categoryBudgets])

  const totalSpent = useMemo(() => {
    return categoryBudgets.reduce((sum, cat) => sum + cat.currentSpent, 0)
  }, [categoryBudgets])

  const monthlyBudgetRemaining = monthlyBudget - totalSpent

  const handleCategoryBudgetChange = (id: string, newBudget: number) => {
    setCategoryBudgets((prev) => prev.map((cat) => (cat.id === id ? { ...cat, initialBudget: newBudget } : cat)))
  }

  const addPayment = (type: "monthly" | "random") => {
    const name = prompt("Nombre del pago:")
    const amountStr = prompt("Monto del pago:")
    const amount = Number.parseFloat(amountStr || "0")
    if (!name || isNaN(amount) || amount <= 0) {
      alert("Por favor, ingresa un nombre y un monto válido.")
      return
    }

    const newPayment: PaymentItem = { id: Date.now().toString(), name, amount }
    if (type === "monthly") {
      const dueDate = prompt("Fecha de vencimiento (ej: 01/mes):")
      newPayment.dueDate = dueDate || "N/A"
      setMonthlyPayments((prev) => [...prev, newPayment])
    } else {
      setRandomPayments((prev) => [...prev, newPayment])
    }
  }

  const removePayment = (type: "monthly" | "random", id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este pago?")) {
      if (type === "monthly") {
        setMonthlyPayments((prev) => prev.filter((p) => p.id !== id))
      } else {
        setRandomPayments((prev) => prev.filter((p) => p.id !== id))
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary-600" /> Presupuesto Mensual
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Presupuesto Total</p>
            <Input
              type="number"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(Number.parseFloat(e.target.value) || 0)}
              className="text-2xl font-bold text-primary-600 border-none text-center focus:ring-0 focus:outline-none"
            />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Gastado</p>
            <p className="text-2xl font-bold text-red-600">-${totalSpent.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Restante</p>
            <p className={`text-2xl font-bold ${monthlyBudgetRemaining >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${monthlyBudgetRemaining.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Category Budgeting */}
      <Card>
        <CardHeader>
          <CardTitle>Presupuesto por Categoría</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categoryBudgets.map((category) => {
            const percentageUsed =
              category.initialBudget > 0 ? (category.currentSpent / category.initialBudget) * 100 : 0
            const isOverBudget = category.currentSpent > category.initialBudget
            const IconComponent = category.icon

            return (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", category.color)}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{category.name}</p>
                      <p className="text-xs text-gray-500">
                        ${category.currentSpent.toFixed(2)} de ${category.initialBudget.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={category.initialBudget}
                      onChange={(e) => handleCategoryBudgetChange(category.id, Number.parseFloat(e.target.value) || 0)}
                      className="w-24 text-right text-sm"
                    />
                    <span className={cn("font-semibold text-sm", isOverBudget ? "text-red-600" : "text-gray-900")}>
                      {percentageUsed.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <Progress
                  value={Math.min(100, percentageUsed)}
                  className={cn("h-2", isOverBudget ? "[&>div]:bg-red-500" : "[&>div]:bg-primary-500")}
                />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Payment Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-600" /> Pagos Mensuales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {monthlyPayments.length === 0 ? (
              <p className="text-gray-500 text-sm text-center">No hay pagos mensuales registrados.</p>
            ) : (
              monthlyPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div>
                    <p className="font-medium text-gray-900">{payment.name}</p>
                    <p className="text-sm text-gray-600">
                      ${payment.amount.toFixed(2)} {payment.dueDate && `• Vence: ${payment.dueDate}`}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removePayment("monthly", payment.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span className="sr-only">Eliminar pago</span>
                  </Button>
                </div>
              ))
            )}
            <Button onClick={() => addPayment("monthly")} className="w-full mt-4 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Agregar Pago Mensual
            </Button>
          </CardContent>
        </Card>

        {/* Random Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" /> Pagos Aleatorios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {randomPayments.length === 0 ? (
              <p className="text-gray-500 text-sm text-center">No hay pagos aleatorios registrados.</p>
            ) : (
              randomPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div>
                    <p className="font-medium text-gray-900">{payment.name}</p>
                    <p className="text-sm text-gray-600">${payment.amount.toFixed(2)}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removePayment("random", payment.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span className="sr-only">Eliminar pago</span>
                  </Button>
                </div>
              ))
            )}
            <Button onClick={() => addPayment("random")} className="w-full mt-4 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Agregar Pago Aleatorio
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Insights & Map Reminder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Insights de Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Aquí podrás ver análisis y tendencias de tus gastos a lo largo del tiempo.
              <br />
              (Funcionalidad en desarrollo)
            </p>
          </CardContent>
        </Card>

        {/* Map Reminder */}
        <Card>
          <CardHeader>
            <CardTitle>¡No olvides tu camino!</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Map className="w-16 h-16 text-primary-600 mb-4" />
            <p className="text-gray-600 mb-4">
              Tu mapa financiero te espera. ¡Sigue avanzando en tu educación y alcanza nuevas metas!
            </p>
            <Link href="/dashboard/mapa" className="w-full">
              <Button className="w-full">Ir al Mapa</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
