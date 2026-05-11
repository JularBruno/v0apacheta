"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import AssetCard from "@/components/assets/asset-card"
import AssetFormModal from "@/components/assets/asset-form-modal"
import { getFinancialElementsByUser, revalidateFinancialElements } from "@/lib/actions/financialElements"
import { FinancialElement, FinancialElements } from '@/lib/schemas/financialElement';

export default function AssetsPage() {

	const [assets, setAssets] = useState<FinancialElements[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const [isModalOpen, setIsModalOpen] = useState(false);

	const fetchFinancialElements = async () => {
		setIsLoading(true);
		try {
			const financialElements = await getFinancialElementsByUser();
			setAssets(financialElements.elements);
		}
		catch (error: any) {
			return;
		}
		finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		fetchFinancialElements();
	}, []);

	const handleSaveAsset = (item: FinancialElements) => {
		revalidateFinancialElements();
		if (assets?.some(asset => asset.id === item.id)) {
			// Edit existing asset
			setAssets(assets?.map((asset) => (asset.id === item.id ? { ...asset, ...item } : asset)))
		} else {
			setAssets([...assets, item])
		}

	}

	const totalAssets = 0
	// assets
	// 	.filter((asset) => asset.type === "asset")
	// 	.reduce((sum, asset) => sum + asset.currentValue, 0)

	const totalLiabilities = 0
	// assets
	// 	.filter((asset) => asset.type === "liability")
	// 	.reduce((sum, asset) => sum + asset.currentValue, 0)

	const netWorth = 0
	//  totalAssets - totalLiabilities

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
				{assets?.map((asset) => (
					<AssetCard
						key={asset.id}
						id={asset.id}
						name={asset.name}
						type={asset.type}
						currentValue={0}
						change={0}
						changePercent={0}
						history={[]}
					// currentValue={asset.currentValue}
					// change={asset.change}
					// changePercent={asset.changePercent}
					// history={asset.history}
					/>
				))}
			</div>

			{/* Add Asset Modal */}
			<AssetFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveAsset} />
		</div>
	)
}
