"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import AssetCard from "@/components/asset-card"
import AssetFormModal from "@/components/asset-form-modal"

// Mock data - replace with real data later
const mockAssets = [
  {
    id: "1",
    name: "Cuenta de Ahorro",
    type: "asset" as const,
    currentValue: 1500.0,
    change: 150.0,
    changePercent: 11.1,
    history: [
      { date: "Jul 10", value: 1500.0 },
      { date: "Jul 9", value: 1350.0 },
      { date: "Jul 8", value: 1200.0 },
      { date: "Jul 7", value: 1100.0 },
      { date: "Jul 6", value: 1000.0 },
    ],
  },
  {
    id: "2",
    name: "Tarjeta de Crédito",
    type: "liability" as const,
    currentValue: 300.0,
    change: -50.0,
    changePercent: -14.3,
    history: [
      { date: "Jul 10", value: 300.0 },
      { date: "Jul 9", value: 350.0 },
      { date: "Jul 8", value: 400.0 },
    ],
  },
  {
    id: "3",
    name: "Inversiones en Bolsa",
    type: "asset" as const,
    currentValue: 5000.0,
    change: 250.0,
    changePercent: 5.3,
    history: [
      { date: "Jul 10", value: 5000.0 },
      { date: "Jul 9", value: 4800.0 },
      { date: "Jul 8", value: 4750.0 },
    ],
  },
  {
    id: "4",
    name: "Préstamo Personal",
    type: "liability" as const,
    currentValue: 1200.0,
    change: -100.0,
    changePercent: -7.7,
  },
  {
    id: "5",
    name: "Efectivo",
    type: "asset" as const,
    currentValue: 200.0,
    change: 50.0,
    changePercent: 33.3,
  },
]

interface FinancialItem {
  id?: string
  name: string
  type: "asset" | "liability"
  currentValue: number
}

export default function AssetsPage() {
  const [assets, setAssets] = useState(mockAssets)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSaveAsset = (item: FinancialItem) => {
    if (item.id) {
      // Edit existing asset
      setAssets(assets.map((asset) => (asset.id === item.id ? { ...asset, ...item } : asset)))
    } else {
      // Add new asset
      const newAsset = {
        ...item,
        id: Date.now().toString(),
        change: 0,
        changePercent: 0,
        history: [
          {
            date: new Date().toLocaleDateString("es-AR", { month: "short", day: "numeric" }),
            value: item.currentValue,
          },
        ],
      }
      setAssets([...assets, newAsset])
    }
    setIsModalOpen(false)
  }

  const totalAssets = assets
    .filter((asset) => asset.type === "asset")
    .reduce((sum, asset) => sum + asset.currentValue, 0)

  const totalLiabilities = assets
    .filter((asset) => asset.type === "liability")
    .reduce((sum, asset) => sum + asset.currentValue, 0)

  const netWorth = totalAssets - totalLiabilities

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Elementos Financieros</h1>
          <p className="text-gray-600 mt-1">Gestiona tus activos y pasivos</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Agregar Elemento
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">${totalAssets.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Pasivos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">${totalLiabilities.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Patrimonio Neto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${netWorth >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${netWorth.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            id={asset.id}
            name={asset.name}
            type={asset.type}
            currentValue={asset.currentValue}
            change={asset.change}
            changePercent={asset.changePercent}
            history={asset.history}
          />
        ))}
      </div>

      {/* Add Asset Modal */}
      <AssetFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveAsset} />
    </div>
  )
}
