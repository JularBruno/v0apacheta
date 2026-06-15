"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import AssetCard from "@/components/assets/asset-card"
import AssetFormModal from "@/components/assets/asset-form-modal"
import { useFinancialElements } from "@/lib/hooks/use-financial-elements"
import { useQueryClient } from "@tanstack/react-query"
import { formatToBalance } from "@/lib/quick-spend-constants"

export default function AssetsPage() {
	const queryClient = useQueryClient();
	const { data } = useFinancialElements();
	const assets = data?.elements ?? [];

	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleSaveAsset = () => {
		queryClient.invalidateQueries({ queryKey: ['financial-elements-patrimony'] });
	}

	const totalAssets = data?.totalAssets ?? 0;
	const totalLiabilities = data?.totalLiabilities ?? 0;
	const netWorth = data?.netWorth ?? 0;

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
						<p className="text-2xl font-bold text-green-600">{formatToBalance(totalAssets)}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-gray-600">Total Pasivos</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold text-red-600">{formatToBalance(totalLiabilities)}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-gray-600">Patrimonio Neto</CardTitle>
					</CardHeader>
					<CardContent>
						<p className={`text-2xl font-bold ${netWorth >= 0 ? "text-green-600" : "text-red-600"}`}>
							{formatToBalance(netWorth)}
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Assets Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{assets?.map((asset) => (
					<AssetCard
						key={asset.id}
						id={asset.id}
						name={asset.name}
						type={asset.type}
						currentValue={asset.currentAmount}
					/>
				))}
			</div>

			{/* Add Asset Modal */}
			<AssetFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveAsset} />
		</div>
	)
}
