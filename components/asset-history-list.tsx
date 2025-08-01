"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
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
  Filter,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock transaction data for assets (replace with real data later)
const mockAssetTransactions = [
  {
    id: "trans1",
    assetId: "1", // Cuenta de Ahorro
    title: "Depósito de Salario",
    amount: 1000.0,
    type: "ingreso" as const,
    category: "trabajo",
    date: "2024-07-10",
    time: "09:00",
  },
  {
    id: "trans2",
    assetId: "1",
    title: "Retiro para Gastos",
    amount: 200.0,
    type: "gasto" as const,
    category: "efectivo",
    date: "2024-07-09",
    time: "15:30",
  },
  {
    id: "trans3",
    assetId: "2", // Tarjeta de Crédito
    title: "Compra en Supermercado",
    amount: 85.5,
    type: "gasto" as const,
    category: "comestibles",
    date: "2024-07-08",
    time: "18:00",
  },
  {
    id: "trans4",
    assetId: "2",
    title: "Pago de Tarjeta",
    amount: 150.0,
    type: "ingreso" as const, // Payment to liability reduces it, so it's like an 'income' for the liability
    category: "pago_deuda",
    date: "2024-07-05",
    time: "10:00",
  },
  {
    id: "trans5",
    assetId: "3", // Inversiones en Bolsa
    title: "Compra de Acciones",
    amount: 500.0,
    type: "gasto" as const,
    category: "inversion",
    date: "2024-07-07",
    time: "11:00",
  },
  {
    id: "trans6",
    assetId: "3",
    title: "Dividendos Recibidos",
    amount: 50.0,
    type: "ingreso" as const,
    category: "inversion",
    date: "2024-07-01",
    time: "14:00",
  },
  {
    id: "trans7",
    assetId: "4", // Préstamo Personal
    title: "Cuota de Préstamo",
    amount: 100.0,
    type: "gasto" as const,
    category: "pago_deuda",
    date: "2024-07-03",
    time: "09:30",
  },
  {
    id: "trans8",
    assetId: "5", // Efectivo
    title: "Retiro de Cajero",
    amount: 100.0,
    type: "ingreso" as const, // Cash received
    category: "retiro",
    date: "2024-07-06",
    time: "17:00",
  },
  {
    id: "trans9",
    assetId: "5",
    title: "Compra de Café",
    amount: 5.0,
    type: "gasto" as const,
    category: "comida",
    date: "2024-07-06",
    time: "17:15",
  },
]

// Categories with icons (simplified for history list)
const categoryIcons = {
  comida: Utensils,
  comestibles: ShoppingCart,
  transporte: Car,
  hogar: Home,
  entretenimiento: Gamepad2,
  servicios: Zap,
  regalos: Gift,
  belleza: Sparkles,
  trabajo: Briefcase,
  viajes: Plane,
  ingreso: DollarSign,
  efectivo: DollarSign, // Example for cash withdrawals
  inversion: TrendingUp, // Assuming TrendingUp is imported
  pago_deuda: CreditCard, // Assuming CreditCard is imported
} as const // Use 'as const' for type safety

// Re-using icons from previous components, ensure they are imported where needed
import { TrendingUp, CreditCard } from "lucide-react"

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

interface AssetHistoryListProps {
  assetId: string
}

export default function AssetHistoryList({ assetId }: AssetHistoryListProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState<"all" | "gasto" | "ingreso">("all")
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    setIsLoading(true)
    // Simulate fetching data
    const timer = setTimeout(() => {
      const filteredByAsset = mockAssetTransactions.filter((t) => t.assetId === assetId)
      setTransactions(filteredByAsset)
      setIsLoading(false)
    }, 500) // Simulate network delay

    return () => clearTimeout(timer)
  }, [assetId])

  const filteredTransactions = transactions.filter((transaction) => {
    if (filterType === "all") return true
    return transaction.type === filterType
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Hoy"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ayer"
    } else {
      return date.toLocaleDateString("es-AR", { day: "numeric", month: "short" })
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-md font-semibold text-gray-800">Historial de Transacciones</h4>
        <div className="flex gap-2">
          <Badge
            variant={filterType === "all" ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-colors",
              filterType === "all" ? "bg-primary-600 text-white hover:bg-primary-700" : "hover:bg-gray-100",
            )}
            onClick={() => setFilterType("all")}
          >
            Todas
          </Badge>
          <Badge
            variant={filterType === "ingreso" ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-colors",
              filterType === "ingreso" ? "bg-primary-600 text-white hover:bg-primary-700" : "hover:bg-gray-100",
            )}
            onClick={() => setFilterType("ingreso")}
          >
            Ingresos
          </Badge>
          <Badge
            variant={filterType === "gasto" ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-colors",
              filterType === "gasto" ? "bg-primary-600 text-white hover:bg-primary-700" : "hover:bg-gray-100",
            )}
            onClick={() => setFilterType("gasto")}
          >
            Gastos
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-100 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gray-200" />
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-4 text-gray-500 text-sm">No hay transacciones para mostrar.</div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => {
            const IconComponent = categoryIcons[transaction.category as keyof typeof categoryIcons] || Filter // Fallback icon
            const isIncome = transaction.type === "ingreso"
            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      isIncome ? "bg-green-500" : "bg-gray-400",
                    )}
                  >
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{transaction.title}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(transaction.date)} {transaction.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn("font-semibold text-sm", isIncome ? "text-green-600" : "text-gray-900")}>
                    {isIncome ? "+" : "-"}${transaction.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
