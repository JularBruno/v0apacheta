"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AssetFormModal from "@/components/asset-form-modal"
import AssetCard from "@/components/asset-card"
import AddTransactionModal from "@/components/add-transaction-modal" // Import the new modal

interface FinancialItem {
  id: string
  name: string
  type: "asset" | "liability"
  currentValue: number
}

interface TransactionData {
  type: "gasto" | "ingreso"
  amount: number
  title: string
  category: string
  date: string
  time: string
}

export default function AssetsPage() {
  const [financialItems, setFinancialItems] = useState<FinancialItem[]>([
    { id: "1", name: "Cuenta de Ahorro", type: "asset", currentValue: 1500.0 },
    { id: "2", name: "Tarjeta de Crédito", type: "liability", currentValue: 300.0 },
    { id: "3", name: "Inversiones en Bolsa", type: "asset", currentValue: 5000.0 },
    { id: "4", name: "Préstamo Personal", type: "liability", currentValue: 1200.0 },
    { id: "5", name: "Efectivo", type: "asset", currentValue: 200.0 },
  ])
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FinancialItem | null>(null)
  const [filterType, setFilterType] = useState<"all" | "asset" | "liability">("all")

  // State for the new transaction modal
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [transactionModalType, setTransactionModalType] = useState<"gasto" | "ingreso">("gasto") // Changed to "gasto" | "ingreso"
  const [selectedItemForTransaction, setSelectedItemForTransaction] = useState<FinancialItem | null>(null)

  // Calculate Net Worth
  const totalAssets = useMemo(() => {
    return financialItems.filter((item) => item.type === "asset").reduce((sum, item) => sum + item.currentValue, 0)
  }, [financialItems])

  const totalLiabilities = useMemo(() => {
    return financialItems.filter((item) => item.type === "liability").reduce((sum, item) => sum + item.currentValue, 0)
  }, [financialItems])

  const netWorth = totalAssets - totalLiabilities

  // Filtered items for display
  const filteredItems = useMemo(() => {
    if (filterType === "all") {
      return financialItems
    }
    return financialItems.filter((item) => item.type === filterType)
  }, [financialItems, filterType])

  const handleSaveItem = (item: { id?: string; name: string; type: "asset" | "liability"; currentValue: number }) => {
    if (item.id) {
      // Edit existing item
      setFinancialItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, name: item.name, type: item.type, currentValue: item.currentValue } : i,
        ),
      )
    } else {
      // Add new item
      setFinancialItems((prev) => [
        ...prev,
        { ...item, id: Date.now().toString() }, // Simple unique ID
      ])
    }
    setEditingItem(null)
    setIsFormModalOpen(false)
  }

  const handleEditItem = (item: FinancialItem) => {
    setEditingItem(item)
    setIsFormModalOpen(true)
  }

  const handleDeleteItem = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este elemento?")) {
      setFinancialItems((prev) => prev.filter((item) => item.id !== id))
    }
  }

  // Functions to open the new transaction modal
  const handleOpenIncomeModal = (item: FinancialItem) => {
    setSelectedItemForTransaction(item)
    setTransactionModalType("ingreso")
    setIsTransactionModalOpen(true)
  }

  const handleOpenExpenseModal = (item: FinancialItem) => {
    setSelectedItemForTransaction(item)
    setTransactionModalType("gasto")
    setIsTransactionModalOpen(true)
  }

  // Function to save transaction from the modal
  const handleSaveTransaction = (data: TransactionData) => {
    if (!selectedItemForTransaction) return

    setFinancialItems((prev) =>
      prev.map((item) => {
        if (item.id === selectedItemForTransaction.id) {
          let newCurrentValue = item.currentValue
          if (data.type === "ingreso") {
            newCurrentValue = item.type === "asset" ? item.currentValue + data.amount : item.currentValue - data.amount
          } else {
            // gasto
            newCurrentValue = item.type === "asset" ? item.currentValue - data.amount : item.currentValue + data.amount
          }
          return { ...item, currentValue: newCurrentValue }
        }
        return item
      }),
    )
    alert(
      `${data.type === "ingreso" ? "Ingreso" : "Gasto"} de $${data.amount} (${data.title}) registrado para ${selectedItemForTransaction.name}.`,
    )
    setSelectedItemForTransaction(null)
    setIsTransactionModalOpen(false)
  }

  const handleViewHistory = (id: string) => {
    alert(`Ver historial para el elemento con ID: ${id} (funcionalidad en desarrollo).`)
    // In the future, this would open a dedicated history view for the item
  }

  return (
    <div className="space-y-6">
      {/* Net Worth Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Mi Patrimonio Neto</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Activos Totales</p>
            <p className="text-2xl font-bold text-green-600">${totalAssets.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Pasivos Totales</p>
            <p className="text-2xl font-bold text-red-600">-${totalLiabilities.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Patrimonio Neto</p>
            <p className={`text-2xl font-bold ${netWorth >= 0 ? "text-primary-600" : "text-red-600"}`}>
              ${netWorth.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Assets/Liabilities List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Mis Elementos Financieros</CardTitle>
            <div className="flex items-center gap-3">
              <Select value={filterType} onValueChange={(value: "all" | "asset" | "liability") => setFilterType(value)}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="asset">Activos</SelectItem>
                  <SelectItem value="liability">Pasivos</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => {
                  setEditingItem(null)
                  setIsFormModalOpen(true)
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar Nuevo
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No se encontraron elementos financieros.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <AssetCard
                  key={item.id}
                  item={item}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                  onAddIncome={handleOpenIncomeModal}
                  onAddExpense={handleOpenExpenseModal}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AssetFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveItem}
        initialData={editingItem}
      />

      {/* New Transaction Modal */}
      <AddTransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={handleSaveTransaction}
        item={selectedItemForTransaction}
        initialTransactionType={transactionModalType}
      />
    </div>
  )
}
