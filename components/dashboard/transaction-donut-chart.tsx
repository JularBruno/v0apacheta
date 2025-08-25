"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  Briefcase,
  Plane,
  DollarSign,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const categoryMap = {
  comida: { name: "Comida", icon: Utensils, color: "bg-orange-500", chartColor: "#f97316" },
  comestibles: { name: "Comestibles", icon: ShoppingCart, color: "bg-green-500", chartColor: "#22c55e" },
  transporte: { name: "Transporte", icon: Car, color: "bg-blue-500", chartColor: "#3b82f6" },
  hogar: { name: "Hogar", icon: Home, color: "bg-purple-500", chartColor: "#a855f7" },
  entretenimiento: { name: "Entretenimiento", icon: Gamepad2, color: "bg-red-500", chartColor: "#ef4444" },
  servicios: { name: "Servicios", icon: Zap, color: "bg-yellow-500", chartColor: "#eab308" },
  regalos: { name: "Regalos", icon: Gift, color: "bg-pink-500", chartColor: "#ec4899" },
  belleza: { name: "Belleza", icon: Sparkles, color: "bg-indigo-500", chartColor: "#6366f1" },
  trabajo: { name: "Trabajo", icon: Briefcase, color: "bg-gray-500", chartColor: "#6b7280" },
  viajes: { name: "Viajes", icon: Plane, color: "bg-cyan-500", chartColor: "#06b6d4" },
  ingreso: { name: "Ingreso", icon: DollarSign, color: "bg-green-600", chartColor: "#16a34a" },
}

interface Transaction {
  id: string
  title: string
  amount: number
  type: "gasto" | "ingreso"
  category: string
  date: string
  time: string
}

interface Category {
  id: string
  name: string
  icon: any
  color: string
  budget: number
}

interface TransactionDonutChartProps {
  transactions: Transaction[]
  categories: Category[]
}

export default function TransactionDonutChart({ transactions, categories }: TransactionDonutChartProps) {
  // Calculate spending by category (only gastos)
  const expenses = transactions.filter((t) => t.type === "gasto")
  const categoryTotals = expenses.reduce(
    (acc, transaction) => {
      const category = transaction.category
      acc[category] = (acc[category] || 0) + transaction.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0)
  const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0)
  const budgetRemaining = totalBudget - totalExpenses

  // Create chart data with budget information
  const chartData = categories
    .filter((cat) => cat.budget > 0) // Only show categories with budgets
    .map((category) => {
      const spent = categoryTotals[category.id] || 0
      const remaining = category.budget - spent
      const percentage = totalExpenses > 0 ? (spent / totalExpenses) * 100 : 0
      const budgetPercentage = (spent / category.budget) * 100

      return {
        category: category.id,
        // name: category.name,
        spent,
        budget: category.budget,
        remaining: Math.max(0, remaining),
        percentage,
        budgetPercentage: Math.min(100, budgetPercentage),
        isOverBudget: spent > category.budget,
        ...categoryMap[category.id as keyof typeof categoryMap],
      }
    })
    .sort((a, b) => b.spent - a.spent)

  const overallBudgetPercentage = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Gastos por Categoría</CardTitle>
          <Button variant="default" size="sm" className="flex items-center gap-2 ">
            <Settings className="w-4 h-4" />
            Gestionar Presupuestos 
            {/* THis button is probably wronlgy setted */}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6">
          {/* Enhanced Chart with Double Ring */}

          {/* THE CHART WORKS LIKE SHIT MIGHT REQUIRE SOME LIBRARY */}
          <div className="flex items-center justify-center">

            <div className="relative w-60 h-60">
            {/* <div className="relative w-56 h-56"> */}
              {/* Outer ring - Budget */}
              <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
              <div
                className="absolute inset-0 rounded-full border-8 border-primary-200"
                // style={{
                //   background: `conic-gradient(#16a34a 0deg ${overallBudgetPercentage * 3.6}deg, transparent ${overallBudgetPercentage * 3.6}deg 360deg)`,
                //   borderRadius: "50%",
                //   mask: "radial-gradient(circle, transparent 60px, black 60px)",
                //   WebkitMask: "radial-gradient(circle, transparent 60px, black 60px)",
                // }}
              ></div>

              {/* Inner ring - Spent */}
              <div className="absolute inset-4 rounded-full border-8 border-gray-100"></div>
              <div
                className="absolute inset-4 rounded-full border-8 border-red-500"
                // style={{
                //   background: `conic-gradient(#ef4444 0deg ${overallBudgetPercentage * 3.6}deg, transparent ${overallBudgetPercentage * 3.6}deg 360deg)`,
                //   borderRadius: "50%",
                //   mask: "radial-gradient(circle, transparent 40px, black 40px)",
                //   WebkitMask: "radial-gradient(circle, transparent 40px, black 40px)",
                // }}
              ></div>

              {/* Center content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">${totalExpenses.toFixed(0)}</div>
                  <div className="text-sm text-gray-500">de ${totalBudget}</div>
                  <div className="text-xs text-gray-400 mt-1">{overallBudgetPercentage.toFixed(0)}% usado</div>
                </div>
              </div>

              {/* Legend for rings */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                  <span>Gastado</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary-200 rounded-full"></div>
                  <span>Presupuesto</span>
                </div>
              </div>
            </div>
          </div>

        </div>
        
      </CardContent>
    </Card>
  )
}
