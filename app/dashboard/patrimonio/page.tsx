"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, RotateCw } from "lucide-react"
import AssetCard from "@/components/assets/asset-card"
import AssetFormModal from "@/components/assets/asset-form-modal"
import MainCurrencyCard from "@/components/assets/main-currency-card"
import { toast } from "@/hooks/use-toast"
import { useFinancialElements } from "@/lib/hooks/use-financial-elements"
import { useCurrencies } from "@/lib/hooks/use-currencies"
import { useProfile } from "@/lib/hooks/use-profile"
import { useUpdateUser } from "@/lib/hooks/use-update-user"
import { useQueryClient } from "@tanstack/react-query"
import { formatToBalance } from "@/lib/quick-spend-constants"
import { Currency } from "@/lib/schemas/definitions"
import { Loading } from "@/components/ui/loading"
import { cn } from "@/lib/utils"

/** Placeholder for a total while it's being recomputed in a new currency. */
function TotalLoading() {
	return <span data-testid="total-loading" aria-label="Cargando" className="inline-block h-7 w-32 animate-pulse rounded bg-muted align-middle" />
}

export default function AssetsPage() {
	const queryClient = useQueryClient();
	const { data, isLoading, isError, refetch } = useFinancialElements();

	const { data: currencies } = useCurrencies();
	const { data: profile } = useProfile();
	const updateUserMutation = useUpdateUser();

	// Sourced straight from the profile — updateUserMutation writes the new value
	// back into the user-profile cache on success, so this stays in sync on its own.
	const mainCurrency = profile?.preferredCurrency || Currency.ARS;

	const sortedCurrencies = useMemo(
		() => [...(currencies ?? [])].sort((a, b) => a.currency.localeCompare(b.currency)),
		[currencies]
	);

	const assets = data?.elements ?? [];

	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleSaveAsset = () => {
		queryClient.invalidateQueries({ queryKey: ['financial-elements-patrimony'] });
	}

	// true from the pick until the totals come back in the new currency
	const [changingCurrency, setChangingCurrency] = useState(false);

	const handleCurrencyChange = async (value: string) => {
		if (value === mainCurrency) return;
		setChangingCurrency(true);
		try {
			await updateUserMutation.mutateAsync({ preferredCurrency: value });
			// convertedAmount/totals are computed server-side off preferredCurrency, so the
			// elements refetch has to wait until the user update actually lands
			await queryClient.invalidateQueries({ queryKey: ['financial-elements-patrimony'] });
		} catch {
			// the profile cache wasn't touched, so the picker shows the saved currency again
			toast({ title: "No pudimos cambiar la moneda", description: "Probá de nuevo en unos segundos.", variant: "destructive" });
		} finally {
			setChangingCurrency(false);
		}
	}

	const totalAssets = data?.totalAssets ?? 0;
	const totalLiabilities = data?.totalLiabilities ?? 0;
	const netWorth = totalAssets - totalLiabilities;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div data-testid="patrimonio-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Elementos Financieros</h1>
					<p className="text-gray-600 mt-1">Gestiona tus activos y pasivos</p>
				</div>
				<Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
					<Plus className="w-4 h-4" />
					Agregar Elemento
				</Button>
			</div>

			{isLoading ? (
				<Loading />
			) : isError ? (
				// Don't show $0 totals or "you have nothing" here — that's misleading on a
				// fetch failure, not an actual empty patrimony.
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<p className="text-muted-foreground text-sm">No pudimos cargar tu patrimonio.</p>
					<Button variant="outline" className="mt-4" onClick={() => refetch()}>
						<RotateCw className="w-4 h-4 mr-2" />
						Reintentar
					</Button>
				</div>
			) : (
				<>
					<MainCurrencyCard
						currencies={sortedCurrencies}
						value={mainCurrency}
						saving={changingCurrency}
						onChange={handleCurrencyChange}
					/>

					{/* Summary Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium text-gray-600">Total Activos</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-2xl font-bold text-green-600">{changingCurrency ? <TotalLoading /> : formatToBalance(totalAssets, mainCurrency)}</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium text-gray-600">Total Pasivos</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-2xl font-bold text-red-600">{changingCurrency ? <TotalLoading /> : formatToBalance(totalLiabilities, mainCurrency)}</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium text-gray-600">Patrimonio Neto</CardTitle>
							</CardHeader>
							<CardContent>
								<p className={`text-2xl font-bold ${netWorth >= 0 ? "text-green-600" : "text-red-600"}`}>
									{changingCurrency ? <TotalLoading /> : formatToBalance(netWorth, mainCurrency)}
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Assets Grid */}
					{assets.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 text-center">
							<p className="text-muted-foreground text-sm">Todavía no tenés elementos financieros.</p>
							<Button variant="outline" className="mt-4" onClick={() => setIsModalOpen(true)}>
								<Plus className="w-4 h-4 mr-2" />
								Agregar tu primer elemento
							</Button>
						</div>
					) : (
						// dimmed while the amounts are recomputed in a new currency: the cards would
						// otherwise show the old numbers with the new currency's symbol for a moment
						<div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6 transition-opacity", changingCurrency && "opacity-40")} aria-busy={changingCurrency || undefined}>
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
				</>
			)}

			{/* Add Asset Modal */}
			<AssetFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveAsset} />
		</div>
	)
}
