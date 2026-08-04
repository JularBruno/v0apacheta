"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import AssetCard from "@/components/assets/asset-card"
import AssetFormModal from "@/components/assets/asset-form-modal"
import { useFinancialElements } from "@/lib/hooks/use-financial-elements"
import { useCurrencies } from "@/lib/hooks/use-currencies"
import { useProfile } from "@/lib/hooks/use-profile"
import { useUpdateUser } from "@/lib/hooks/use-update-user"
import { useQueryClient } from "@tanstack/react-query"
import { formatToBalance } from "@/lib/quick-spend-constants"
import { Currency } from "@/lib/schemas/definitions"
import { Loading } from "@/components/ui/loading"

export default function AssetsPage() {
	const queryClient = useQueryClient();
	const { data, isLoading } = useFinancialElements();

	const { data: currencies } = useCurrencies();
	const { data: profile } = useProfile();
	const updateUserMutation = useUpdateUser();

	// Sourced straight from the profile — updateUserMutation writes the new value
	// back into the user-profile cache on success, so this stays in sync on its own.
	const mainCurrency = profile?.preferredCurrency || Currency.ARS;

	const sortedCurrencies = useMemo(
		() => [...(currencies ?? [])].sort((a, b) => a.label.localeCompare(b.label)),
		[currencies]
	);

	const assets = data?.elements ?? [];

	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleSaveAsset = () => {
		queryClient.invalidateQueries({ queryKey: ['financial-elements-patrimony'] });
	}

	const handleCurrencyChange = async (value: string) => {
		await updateUserMutation.mutateAsync({ preferredCurrency: value });
		// convertedAmount/totals are computed server-side off preferredCurrency, so the
		// elements refetch has to wait until the user update actually lands
		queryClient.invalidateQueries({ queryKey: ['financial-elements-patrimony'] });
	}

	const totalAssets = data?.totalAssets ?? 0;
	const totalLiabilities = data?.totalLiabilities ?? 0;
	const netWorth = totalAssets - totalLiabilities;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Elementos Financieros</h1>
					<p className="text-gray-600 mt-1">Gestiona tus activos y pasivos</p>
				</div>
				<div className="flex items-center gap-2 order-first sm:order-none">
					<span className="text-sm text-gray-600">Moneda principal</span>
					<Select value={mainCurrency} onValueChange={handleCurrencyChange}>
						<SelectTrigger className="w-24">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{sortedCurrencies.map((currency) => (
								<SelectItem key={currency.currency} value={currency.currency}>
									{currency.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
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
			{isLoading ? (
				<Loading />
			) : assets.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<p className="text-muted-foreground text-sm">Todavía no tenés elementos financieros.</p>
					<Button variant="outline" className="mt-4" onClick={() => setIsModalOpen(true)}>
						<Plus className="w-4 h-4 mr-2" />
						Agregar tu primer elemento
					</Button>
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{assets.map((asset) => (
						<AssetCard
							key={asset.id}
							id={asset.id}
							name={asset.name}
							type={asset.type}
							currentValue={asset.currentAmount}
							convertedValue={asset.convertedAmount}
							currency={asset.currency}
							mainCurrency={mainCurrency}
						/>
					))}
				</div>
			)}

			{/* Add Asset Modal */}
			<AssetFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveAsset} />
		</div>
	)
}
