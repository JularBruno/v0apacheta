"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Utensils, ShoppingCart, Car, Gamepad2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock recent expenses data
const recentExpenses = [
  {
    id: "1",
    title: "Almuerzo en restaurante",
    amount: 45.5,
    category: "Comida",
    categoryIcon: Utensils,
    categoryColor: "bg-orange-500",
    date: "Hoy",
    time: "14:30",
  },
  {
    id: "2",
    title: "Supermercado Coto",
    amount: 89.2,
    category: "Comestibles",
    categoryIcon: ShoppingCart,
    categoryColor: "bg-green-500",
    date: "Ayer",
    time: "18:45",
  },
  {
    id: "3",
    title: "Uber al centro",
    amount: 12.75,
    category: "Transporte",
    categoryIcon: Car,
    categoryColor: "bg-blue-500",
    date: "Ayer",
    time: "16:20",
  },
  {
    id: "4",
    title: "Netflix suscripción",
    amount: 8.99,
    category: "Entretenimiento",
    categoryIcon: Gamepad2,
    categoryColor: "bg-red-500",
    date: "2 jul",
    time: "10:00",
  },
  {
    id: "5",
    title: "Café con amigos",
    amount: 15.3,
    category: "Comida",
    categoryIcon: Utensils,
    categoryColor: "bg-orange-500",
    date: "2 jul",
    time: "16:15",
  },
]

export default function RecentExpenses() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Últimos Gastos</CardTitle>
          <Button variant="ghost" size="sm">
            Ver todos
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentExpenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Left side: Icon and details */}
              <div className="flex items-center space-x-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", expense.categoryColor)}>
                  <expense.categoryIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{expense.title}</p>
                  <p className="text-xs text-gray-500">
                    {expense.category} • {expense.date} {expense.time}
                  </p>
                </div>
              </div>

              {/* Right side: Amount */}
              <div className="flex items-center">
                <span className="font-semibold text-gray-900">-${expense.amount}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary at bottom */}
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total últimos 5 gastos</span>
            <span className="font-semibold text-gray-900">-$171.74</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
