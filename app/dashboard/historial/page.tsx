"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Search,
  Filter,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import TransactionDonutChart from "@/components/dashboard/transaction-donut-chart"

// Categories with budget data
const categories = [
  { id: "all", name: "Todas", icon: Filter, color: "bg-gray-500", budget: 0 },
  { id: "comida", name: "Comida", icon: Utensils, color: "bg-orange-500", budget: 200 },
  { id: "comestibles", name: "Comestibles", icon: ShoppingCart, color: "bg-green-500", budget: 300 },
  { id: "transporte", name: "Transporte", icon: Car, color: "bg-blue-500", budget: 150 },
  { id: "hogar", name: "Hogar", icon: Home, color: "bg-purple-500", budget: 100 },
  { id: "entretenimiento", name: "Entretenimiento", icon: Gamepad2, color: "bg-red-500", budget: 80 },
  { id: "servicios", name: "Servicios", icon: Zap, color: "bg-yellow-500", budget: 120 },
  { id: "regalos", name: "Regalos", icon: Gift, color: "bg-pink-500", budget: 50 },
  { id: "belleza", name: "Belleza", icon: Sparkles, color: "bg-indigo-500", budget: 60 },
  { id: "trabajo", name: "Trabajo", icon: Briefcase, color: "bg-gray-500", budget: 0 },
  { id: "viajes", name: "Viajes", icon: Plane, color: "bg-cyan-500", budget: 200 },
  { id: "ingreso", name: "Ingreso", icon: DollarSign, color: "bg-green-600", budget: 0 },
]

// Mock transaction data
const mockTransactions = [
  {
    id: "1",
    title: "Almuerzo en restaurante",
    amount: 45.5,
    type: "gasto" as const,
    category: "comida",
    date: "2024-07-09",
    time: "14:30",
  },
  {
    id: "2",
    title: "Supermercado Coto",
    amount: 89.2,
    type: "gasto" as const,
    category: "comestibles",
    date: "2024-07-08",
    time: "18:45",
  },
  {
    id: "3",
    title: "Uber al centro",
    amount: 12.75,
    type: "gasto" as const,
    category: "transporte",
    date: "2024-07-08",
    time: "16:20",
  },
  {
    id: "4",
    title: "Salario mensual",
    amount: 2500.0,
    type: "ingreso" as const,
    category: "trabajo",
    date: "2024-07-01",
    time: "09:00",
  },
  {
    id: "5",
    title: "Netflix suscripción",
    amount: 8.99,
    type: "gasto" as const,
    category: "entretenimiento",
    date: "2024-07-02",
    time: "10:00",
  },
  {
    id: "6",
    title: "Café con amigos",
    amount: 15.3,
    type: "gasto" as const,
    category: "comida",
    date: "2024-07-02",
    time: "16:15",
  },
  {
    id: "7",
    title: "Gasolina",
    amount: 35.0,
    type: "gasto" as const,
    category: "transporte",
    date: "2024-07-01",
    time: "08:30",
  },
  {
    id: "8",
    title: "Compras en farmacia",
    amount: 22.5,
    type: "gasto" as const,
    category: "belleza",
    date: "2024-06-30",
    time: "19:15",
  },
]

const dateFilters = [
  { id: "today", label: "Hoy" },
  { id: "week", label: "Esta semana" },
  { id: "month", label: "Este mes" },
  { id: "3months", label: "Últimos 3 meses" },
  { id: "custom", label: "Personalizado" },
]

export default function HistorialPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedDateFilter, setSelectedDateFilter] = useState("month")
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Filter transactions based on current filters
  const filteredTransactions = mockTransactions.filter((transaction) => {
    const matchesSearch = transaction.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory
    const matchesType = selectedType === "all" || transaction.type === selectedType
    const matchesMinAmount = !minAmount || transaction.amount >= Number.parseFloat(minAmount)
    const matchesMaxAmount = !maxAmount || transaction.amount <= Number.parseFloat(maxAmount)

    return matchesSearch && matchesCategory && matchesType && matchesMinAmount && matchesMaxAmount
  })

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId) || categories[0]
  }

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

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setSelectedType("all")
    setSelectedDateFilter("month")
    setMinAmount("")
    setMaxAmount("")
  }

  const activeFiltersCount = [
    searchTerm,
    selectedCategory !== "all" ? selectedCategory : "",
    selectedType !== "all" ? selectedType : "",
    minAmount,
    maxAmount,
  ].filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Donut Chart */}
      <TransactionDonutChart transactions={filteredTransactions} categories={categories} />

      {/* Transactions List with integrated search and filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center justify-between">
              <CardTitle>Transacciones ({filteredTransactions.length})</CardTitle>
              <div className="text-sm text-gray-500 lg:hidden">
                {selectedDateFilter === "month" ? "Este mes" : "Período seleccionado"}
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1 sm:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar transacciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              {/* I LIKED THIS but it should be different also the button to undo */}
              <div className="hidden lg:block text-md text-gray-500">
                {selectedDateFilter === "month" ? "Este mes" : "Período seleccionado"}
              </div>

              <Button variant="destructive" size="sm" onClick={() => console.log("Undo Last Clicked")}>
                  Deshacer Último
                </Button>

            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <Label>Categoría</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div className={cn("w-3 h-3 rounded-full", category.color)} />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Type Filter */}
                <div>
                  <Label>Tipo</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="gasto">Gastos</SelectItem>
                      <SelectItem value="ingreso">Ingresos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Filter */}
                <div>
                  <Label>Período</Label>
                  <Select value={selectedDateFilter} onValueChange={setSelectedDateFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dateFilters.map((filter) => (
                        <SelectItem key={filter.id} value={filter.id}>
                          {filter.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Range */}
                <div>
                  <Label>Monto</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Min"
                      type="number"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                    />
                    <Input
                      placeholder="Max"
                      type="number"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="flex items-center gap-1">
                    <X className="w-4 h-4" />
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No se encontraron transacciones con los filtros aplicados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => {
                const categoryInfo = getCategoryInfo(transaction.category)
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    {/* Left side: Icon and details */}
                    <div className="flex items-center space-x-3">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", categoryInfo.color)}>
                        <categoryInfo.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{transaction.title}</p>
                        <p className="text-xs text-gray-500">
                          {categoryInfo.name} • {formatDate(transaction.date)} {transaction.time}
                        </p>
                      </div>
                    </div>

                    {/* Right side: Amount */}
                    <div className="text-right">
                      <span
                        className={cn(
                          "font-semibold",
                          transaction.type === "ingreso" ? "text-green-600" : "text-gray-900",
                        )}
                      >
                        {transaction.type === "ingreso" ? "+" : "-"}${transaction.amount}
                      </span>
                      <p className="text-xs text-gray-500 capitalize">{transaction.type}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
