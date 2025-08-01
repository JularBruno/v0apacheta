"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Plus,
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
  Calendar,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Default categories with icons (copied from inicio/page.tsx)
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

interface TransactionFormProps {
  onComplete: (data: TransactionFormData) => void
  onCancel: () => void
  initialType?: "gasto" | "ingreso"
}

export default function TransactionForm({ onComplete, onCancel, initialType = "gasto" }: TransactionFormProps) {
  const [step, setStep] = useState<"details" | "category">("details")
  const [transactionType, setTransactionType] = useState<"gasto" | "ingreso">(initialType)
  const [amount, setAmount] = useState("")
  const [title, setTitle] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [categories, setCategories] = useState(defaultCategories)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [showAddCategory, setShowAddCategory] = useState(false)

  // Reset form when component mounts or initialType changes
  useEffect(() => {
    setStep("details")
    setTransactionType(initialType)
    setAmount("")
    setTitle("")
    setSelectedCategory("")
    setNewCategoryName("")
    setShowAddCategory(false)
  }, [initialType])

  // Get current date and time
  const now = new Date()
  const currentDate = now.toLocaleDateString("es-AR")
  const currentTime = now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })

  const handleNextStep = () => {
    if (!amount || Number.parseFloat(amount) <= 0 || !title) {
      alert("Por favor, ingresa un monto válido y un título.")
      return
    }
    setStep("category")
  }

  const handleBackStep = () => {
    setStep("details")
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    onComplete({
      type: transactionType,
      amount: Number.parseFloat(amount),
      title,
      category: categoryId,
      date: currentDate,
      time: currentTime,
    })
  }

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return

    const newCategory = {
      id: `custom-${Date.now()}`,
      name: newCategoryName,
      icon: Plus,
      color: "bg-gray-400", // Default color for custom categories
    }

    setCategories([...categories, newCategory])
    setNewCategoryName("")
    setShowAddCategory(false)
  }

  return (
    <div className="space-y-4">
      {step === "details" && (
        <>
          {/* Transaction Type Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setTransactionType("gasto")}
              className={cn(
                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
                transactionType === "gasto" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900",
              )}
            >
              Gasto
            </button>
            <button
              onClick={() => setTransactionType("ingreso")}
              className={cn(
                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
                transactionType === "ingreso"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900",
              )}
            >
              Ingreso
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <Label htmlFor="amount">Monto</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 text-2xl font-bold h-12"
              />
            </div>
          </div>

          {/* Title Input */}
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Ingrese el título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Date and Time Display */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Hoy</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{currentTime}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={onCancel} variant="outline" className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button onClick={handleNextStep} className="flex-1">
              Continuar
            </Button>
          </div>
        </>
      )}

      {step === "category" && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Selecciona una Categoría</h3>
            <Button variant="ghost" size="sm" onClick={handleBackStep}>
              Atrás
            </Button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-3 gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-2", category.color)}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-center font-medium">{category.name}</span>
              </button>
            ))}

            {/* Add New Category Button */}
            <button
              onClick={() => setShowAddCategory(true)}
              className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors border-2 border-dashed border-gray-300"
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-2 bg-gray-200">
                <Plus className="w-6 h-6 text-gray-600" />
              </div>
              <span className="text-xs text-center font-medium text-gray-600">Agregar</span>
            </button>
          </div>

          {/* Add New Category Form */}
          {showAddCategory && (
            <div className="border-t pt-4 space-y-3">
              <Label htmlFor="newCategory">Nueva Categoría</Label>
              <div className="flex space-x-2">
                <Input
                  id="newCategory"
                  placeholder="Nombre de la categoría"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <Button onClick={handleAddCategory} size="sm">
                  Agregar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddCategory(false)
                    setNewCategoryName("")
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
