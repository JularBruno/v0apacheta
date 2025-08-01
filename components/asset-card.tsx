"use client"

import { useState } from "react" // Import useState
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpCircle, ArrowDownCircle, Edit, Trash2, History, ChevronDown, ChevronUp } from "lucide-react" // Added Chevron icons
import { cn } from "@/lib/utils"
import AssetHistoryList from "./asset-history-list" // Import the new history list component

interface FinancialItem {
  id: string
  name: string
  type: "asset" | "liability"
  currentValue: number
}

interface AssetCardProps {
  item: FinancialItem
  onEdit: (item: FinancialItem) => void
  onDelete: (id: string) => void
  onAddIncome: (item: FinancialItem) => void
  onAddExpense: (item: FinancialItem) => void
  // onViewHistory prop is removed as history is now internal
}

export default function AssetCard({ item, onEdit, onDelete, onAddIncome, onAddExpense }: AssetCardProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false) // State to manage history visibility

  const isAsset = item.type === "asset"
  const valueColorClass = isAsset ? "text-green-600" : "text-red-600"
  const valuePrefix = isAsset ? "$" : "-$"

  return (
    <Card className="w-full">
      <CardContent className="p-4 flex flex-col gap-4">
        {/* Main Card Content */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{item.type === "asset" ? "Activo" : "Pasivo"}</p>
            <p className={cn("text-xl font-bold mt-1", valueColorClass)}>
              {valuePrefix}
              {item.currentValue.toFixed(2)}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button variant="outline" size="sm" onClick={() => onAddIncome(item)} className="flex items-center gap-1">
              <ArrowUpCircle className="w-4 h-4" />
              Ingreso
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAddExpense(item)} className="flex items-center gap-1">
              <ArrowDownCircle className="w-4 h-4" />
              Gasto
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryOpen(!isHistoryOpen)} // Toggle history visibility
              className="flex items-center gap-1"
            >
              <History className="w-4 h-4" />
              Historial
              {isHistoryOpen ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
              <Edit className="w-4 h-4" />
              <span className="sr-only">Editar</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
              <Trash2 className="w-4 h-4 text-red-500" />
              <span className="sr-only">Eliminar</span>
            </Button>
          </div>
        </div>

        {/* Collapsible History Section */}
        {isHistoryOpen && (
          <div className="w-full">
            <AssetHistoryList assetId={item.id} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
