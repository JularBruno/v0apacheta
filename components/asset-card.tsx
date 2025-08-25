"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Eye, Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface AssetCardProps {
  id: string
  name: string
  type: "asset" | "liability"
  currentValue: number
  change?: number
  changePercent?: number
  history?: Array<{ date: string; value: number }>
}

export default function AssetCard({ id, name, type, currentValue, change, changePercent, history }: AssetCardProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)

  const isAsset = type === "asset"
  const isPositiveChange = (change || 0) >= 0
  const valueColorClass = isAsset ? "text-green-600" : "text-red-600"
  const changeColorClass = isPositiveChange ? "text-green-600" : "text-red-600"
  const valuePrefix = isAsset ? "$" : "-$"

  const handleIncomeClick = () => {
    router.push(`/dashboard/patrimonio/${id}?action=ingreso`)
  }

  const handleExpenseClick = () => {
    router.push(`/dashboard/patrimonio/${id}?action=gasto`)
  }

  const handleViewDetails = () => {
    router.push(`/dashboard/patrimonio/${id}`)
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 truncate">{name}</CardTitle>
            <Badge variant="outline" className="mt-1 text-xs">
              {isAsset ? "Activo" : "Pasivo"}
            </Badge>
          </div>
          <div className="text-right">
            <p className={cn("text-2xl font-bold", valueColorClass)}>
              {valuePrefix}
              {currentValue.toFixed(2)}
            </p>
            {change !== undefined && changePercent !== undefined && (
              <div className={cn("flex items-center justify-end gap-1 text-sm", changeColorClass)}>
                {isPositiveChange ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>
                  {isPositiveChange ? "+" : ""}
                  {change.toFixed(2)} ({isPositiveChange ? "+" : ""}
                  {changePercent.toFixed(1)}%)
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-4 md:grid-cols-4">
          <Button
            onClick={handleIncomeClick}
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span className="hidden sm:inline">Ingreso</span>
          </Button>
          <Button
            onClick={handleExpenseClick}
            size="sm"
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1 bg-transparent"
          >
            <Minus className="w-3 h-3" />
            <span className="hidden sm:inline">Gasto</span>
          </Button>
          <Button
            onClick={handleViewDetails}
            size="sm"
            variant="outline"
            className="col-span-2 md:col-span-2 flex items-center gap-1 bg-transparent"
          >
            <Eye className="w-3 h-3" />
            Ver Detalles
          </Button>
        </div>

        {/* History - Hidden on mobile */}
        {history && history.length > 0 && (
          <div className="hidden lg:block">
            <div className="border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Historial Reciente</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs px-2 py-1"
                >
                  {isExpanded ? "Ocultar" : "Ver más"}
                </Button>
              </div>
              <div className="space-y-2">
                {(isExpanded ? history : history.slice(0, 3)).map((entry, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{entry.date}</span>
                    <span className={cn("font-medium", valueColorClass)}>
                      {valuePrefix}
                      {entry.value.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
