"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "lucide-react"
import SpendingChart from "@/components/dashboard/spending-chart"
import RecentExpenses from "@/components/dashboard/recent-expenses"
import TransactionForm from "@/components/transaction-form" // Import the new form

// Default categories with icons
const defaultCategories = [
  { id: "comida", name: "Comida", icon: Utensils, color: "bg-orange-500" },
  { id: "comestibles", name: "Comestibles", icon: ShoppingCart, color: "bg-green-500" },
  { id: "transporte", name: "Transporte", icon: Car, color: "bg-blue-500" },
  { id: "hogar", name: "Hogar", icon: Home, color: "bg-purple-500" },
  { id: "entretenimiento", name: "Entretenimiento", icon: Gamepad2, color: "bg-red-500" },
  { id: "servicios", name: "Servicios", icon: Zap, color: "bg-yellow-500" },
  { id: "regalos", name: "Regalos", icon: Gift, color: "bg-pink-500" },
  { id: "belleza", name: "Belleza", icon: Sparkles, color: "bg-indigo-500" },
  { id: "trabajo", name: "Trabajo", icon: Briefcase, color: "bg-gray-500" },
  { id: "viajes", name: "Viajes", icon: Plane, color: "bg-cyan-500" },
  { id: "ingreso", name: "Ingreso", icon: DollarSign, color: "bg-green-600" },
]

interface TransactionFormData {
  type: "gasto" | "ingreso"
  amount: number
  title: string
  category: string
  date: string
  time: string
}

export default function InicioPage() {
  // Budget state
  const [budget] = useState({
    total: 800,
    spent: 0,
    remaining: 800,
  })

  // Transaction form state (now simplified as logic is in TransactionForm)
  // We'll just use a placeholder for now, as the form is extracted
  const handleTransactionComplete = (data: TransactionFormData) => {
    console.log("Transaction completed:", data)
    alert("Transacción agregada exitosamente!")
    // Here you would typically save the transaction to a global state or backend
  }

  const progressPercentage = budget.total > 0 ? ((budget.total - budget.remaining) / budget.total) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Banco</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0 USD</div>
            <p className="text-sm text-gray-500">0 transacciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-sm text-gray-500">Balance actual</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content: Budget Progress and Add Transaction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Presupuesto</h3>
              <span className="text-sm text-gray-500">Hoy</span>
            </div>
            <div className="text-2xl font-bold mb-2">
              ${budget.remaining} restante de ${budget.total}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>1 jul</span>
              <span>{progressPercentage.toFixed(0)}%</span>
              <span>31 jul</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Puede gastar $200/día para 4 más días</p>
          </CardContent>
        </Card>

        {/* Add Transaction Section - Now uses the reusable TransactionForm */}
        <Card>
          <CardHeader>
            <CardTitle>Agregar Transacción</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionForm onComplete={handleTransactionComplete} onCancel={() => console.log("Cancelled")} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Recent Expenses and Spending Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <RecentExpenses />

        {/* Spending Chart */}
        <SpendingChart />
      </div>
    </div>
  )
}
