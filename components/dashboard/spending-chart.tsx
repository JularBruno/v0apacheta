"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Mock data for the chart
const mockData = [
  { date: "28 jun", amount: 45 },
  { date: "29 jun", amount: 32 },
  { date: "30 jun", amount: 78 },
  { date: "1 jul", amount: 25 },
  { date: "2 jul", amount: 56 },
  { date: "3 jul", amount: 89 },
  { date: "4 jul", amount: 34 },
  { date: "5 jul", amount: 67 },
  { date: "6 jul", amount: 43 },
  { date: "7 jul", amount: 91 },
  { date: "8 jul", amount: 28 },
  { date: "9 jul", amount: 75 },
]

const timeFilters = [
  { id: "7d", label: "7 días", active: true },
  { id: "30d", label: "30 días", active: false },
  { id: "todo", label: "Todo", active: false },
]

export default function SpendingChart() {
  const [activeTimeFilter, setActiveTimeFilter] = useState("7d")

  // Calculate max value for scaling
  const maxAmount = Math.max(...mockData.map((d) => d.amount))

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Resumen de Gastos</CardTitle>

          {/* Filter Badges - Simplified */}
          <div className="flex gap-2">
            {timeFilters.map((filter) => (
              <Badge
                key={filter.id}
                variant={activeTimeFilter === filter.id ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors",
                  activeTimeFilter === filter.id
                    ? "bg-primary-600 text-white hover:bg-primary-700"
                    : "hover:bg-gray-100",
                )}
                onClick={() => setActiveTimeFilter(filter.id)}
              >
                {filter.label}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Simple Bar Chart */}
        <div className="space-y-6">
          {/* Chart Area */}
          <div className="h-64 flex items-end justify-between gap-1 bg-gray-50 rounded-lg p-4">
            {mockData.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="w-full bg-primary-500 rounded-t-sm transition-all duration-300 hover:bg-primary-600 min-h-[4px]"
                  style={{
                    height: `${(data.amount / maxAmount) * 100}%`,
                  }}
                  title={`${data.date}: $${data.amount}`}
                />
              </div>
            ))}
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between text-xs text-gray-500 px-4">
            <span>{mockData[0]?.date}</span>
            <span>{mockData[Math.floor(mockData.length / 2)]?.date}</span>
            <span>{mockData[mockData.length - 1]?.date}</span>
          </div>

          {/* Summary Stats - Simplified to 2 */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">$156</div>
              <div className="text-sm text-gray-500">Total gastado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">$52</div>
              <div className="text-sm text-gray-500">Promedio diario</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
