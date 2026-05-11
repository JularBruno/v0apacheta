"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2, Filter, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import AssetFormModal from "@/components/assets/asset-form-modal"
import QuickSpendCard from "@/components/movements/quick-spend-card"
import EditTransactionModal from "@/components/assets/edit-transaction-modal"
import DeleteConfirmationModal from "@/components/assets/delete-confirmation-modal"
import { FinancialElementType, TxType } from "@/lib/schemas/definitions";
import { deleteFinancialElementById, getFinancialElementById, revalidateFinancialElements } from "@/lib/actions/financialElements"
import { FinancialElement, FinancialElements } from "@/lib/schemas/financialElement"
import { toast } from "@/hooks/use-toast"
import { Movement, Movements } from "@/lib/schemas/movement"
import IconComponent from "@/components/movements/icon-component";
import { formatToBalance } from "@/lib/quick-spend-constants"
import Loading from "./loading"


export default function AssetDetailPage() {
	const router = useRouter()
	const params = useParams()
	const searchParams = useSearchParams()
	const assetId = params.id as string

	const actionParam = searchParams.get("action") as TxType.INCOME | TxType.EXPENSE | null

	const [asset, setAsset] = useState<FinancialElements | undefined>()
	const [notFound, setNotFound] = useState<boolean>(false)
	const [showQuickSpend, setShowQuickSpend] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	// const [filterType, setFilterType] = useState<"all" | "gasto" | "ingreso">("all")
	// const [transactions, setTransactions] = useState<Transaction[]>([])

	// const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
	// const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)

	const [isEditModalOpen, setIsEditModalOpen] = useState(false)
	const [isEditTransactionModalOpen, setIsEditTransactionModalOpen] = useState(false)
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

	// useEffect(() => {
	// 	setIsLoading(true)
	// 	const timer = setTimeout(() => {
	// 		const foundAsset = mockAssets.find((a) => a.id === assetId)
	// 		setAsset(foundAsset || null)

	// 		const filteredByAsset = mockTransactions.filter((t) => t.assetId === assetId)
	// 		setTransactions(filteredByAsset)
	// 		setIsLoading(false)

	// 		// Show QuickSpendCard if action parameter is present
	// 		if (actionParam === TxType.INCOME || actionParam === TxType.EXPENSE) {
	// 			setShowQuickSpend(true)
	// 		}
	// 	}, 500)

	// 	return () => clearTimeout(timer)
	// }, [assetId, actionParam])

	// const filteredTransactions = useMemo(() => {
	// 	return transactions.filter((transaction) => {
	// 		if (filterType === "all") return true
	// 		return transaction.type === filterType
	// 	})
	// }, [transactions, filterType])

	// const formatDate = (dateString: string) => {
	// 	const date = new Date(dateString)
	// 	const today = new Date()
	// 	const yesterday = new Date(today)
	// 	yesterday.setDate(yesterday.getDate() - 1)

	// 	if (date.toDateString() === today.toDateString()) {
	// 		return "Hoy"
	// 	} else if (date.toDateString() === yesterday.toDateString()) {
	// 		return "Ayer"
	// 	} else {
	// 		return date.toLocaleDateString("es-AR", { day: "numeric", month: "short" })
	// 	}
	// }

	// const handleEditTransaction = (transaction: Transaction) => {
	// 	// setEditingTransaction(transaction)
	// 	// // Here you would open an edit modal
	// 	// setIsEditTransactionModalOpen(true)
	// }

	// const handleSaveTransaction = (updatedTransaction: Transaction) => {
	// 	// setTransactions((prev) => prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t)))
	// 	// setEditingTransaction(null)
	// }

	// const handleDeleteTransaction = (transaction: Transaction) => {
	// 	// setDeletingTransaction(transaction)
	// 	// setIsDeleteModalOpen(true)
	// }

	const handleConfirmDelete = () => {
		// if (deletingTransaction) {
		// 	setTransactions((prev) => prev.filter((t) => t.id !== deletingTransaction.id))
		// 	setDeletingTransaction(null)
		// }
	}

	const handleEditAsset = () => {
		setIsEditModalOpen(true)
	}

	const handleDeleteAsset = async () => {
		if (!confirm("¿Estás seguro de que quieres eliminar este elemento financiero? Esta acción no se puede deshacer.")) return;
		console.log('about to delete asset id ', assetId);
		setIsLoading(true);

		try {
			await deleteFinancialElementById(assetId);
			await revalidateFinancialElements();
		} catch (error) {
			console.error(error);
		} finally {
			router.push("/dashboard/patrimonio");
			// setIsLoading(false);
		}
	}

	const handleSaveAsset = (item: any) => {
		setIsLoading(true);
		if (asset && item.id === asset.id) {
			setAsset({ ...asset, name: item.name, type: item.type, currentAmount: asset.currentAmount })
		}
		setIsEditModalOpen(false)
		setIsLoading(false);
		toast({
			variant: "success",
			title: "Se actualizó tu patrimonio!",
			description: `Se realizó tu actualización de ${item.amount}`,
		});
	}

	const handleQuickSpend = (
		data: any // Movement
	) => {
		asset?.movements.push(data);

		toast({
			variant: "success",
			title: "Movimiento realizado!",
			description: `Se realizó tu ${data.type === TxType.INCOME ? "Ingreso" : "Gasto"} de $${data.amount}`,
		});
	}

	const handleShowQuickSpend = () => {
		setShowQuickSpend(true)
	}

	const handleHideQuickSpend = () => {
		// setShowQuickSpend(false)
		// Remove action parameter from URL if present
		// if (actionParam) {
		// 	router.replace(`/dashboard/patrimonio/${assetId}`)
		// }
	}

	const fetchFinancialElement = async () => {
		// Show QuickSpendCard if action parameter is present
		if (actionParam === TxType.INCOME || actionParam === TxType.EXPENSE) {
			setShowQuickSpend(true)
		}
		try {
			const financialElement = await getFinancialElementById(assetId);

			await new Promise(f => setTimeout(f, 1000));

			if (!financialElement) {
				// setAsset(null);
				setNotFound(true);
			} else {
				setNotFound(false);
				setAsset(financialElement);
			}
		}
		catch (error: any) {
			// setError(error);
			setNotFound(true);
			console.log(error);

			return;
		}
		finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		fetchFinancialElement();
	}, []);

	if (isLoading) return (
		<Loading />
	);

	if (notFound) return (
		<div className="flex items-center justify-center min-h-[400px]">
			<div className="text-center">
				<p className="text-gray-500 mb-4">Elemento financiero no encontrado</p>
				<Button onClick={() => router.push("/dashboard/patrimonio")}>Volver a la lista</Button>
			</div>
		</div>
	);

	const isAsset = asset?.type === "asset"
	const valueColorClass = isAsset ? "text-green-600" : "text-red-600"
	const valuePrefix = isAsset ? "$" : "-$"

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/patrimonio")} className="shrink-0">
					<ArrowLeft className="w-4 h-4" />
				</Button>
				<div className="min-w-0 flex-1">
					<h1 className="text-2xl font-bold text-gray-900 truncate">{asset?.name}</h1>
					<p className="text-sm text-gray-500 capitalize">{asset?.type === FinancialElementType.ASSET ? "Activo" : "Pasivo"}</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="icon" onClick={handleEditAsset}>
						<Edit className="w-4 h-4" />
					</Button>
					<Button variant="outline" size="icon" onClick={handleDeleteAsset}>
						<Trash2 className="w-4 h-4 text-red-500" />
					</Button>
				</div>
			</div>

			{/* Asset Summary */}
			<Card>
				<CardContent className="p-6">
					<div className="text-center">
						<p className="text-sm text-gray-500 mb-2">Valor Actual</p>
						<p className={cn("text-4xl font-bold", valueColorClass)}>
							{valuePrefix}
							{asset?.currentAmount}
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Quick Spend Card - Show conditionally */}
			{showQuickSpend ? (
				<QuickSpendCard
					onAdd={handleQuickSpend}
					initialType={actionParam || undefined}
					financialElementId={assetId}
					onCancel={handleHideQuickSpend}
				/>
			) : (
				<Card>
					<CardContent className="p-4">
						<Button
							onClick={handleShowQuickSpend}
							className="w-full flex items-center gap-2 bg-transparent"
							variant="outline"
						>
							<Plus className="w-4 h-4" />
							Agregar Transacción
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Transaction History */}
			<Card>
				<CardHeader>
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<CardTitle>Historial de Transacciones</CardTitle>
						{/* <div className="flex flex-wrap gap-2">
							<Badge
								variant={filterType === "all" ? "default" : "outline"}
								className={cn(
									"cursor-pointer transition-colors",
									filterType === "all" ? "bg-primary-600 text-white hover:bg-primary-700" : "hover:bg-gray-100",
								)}
								onClick={() => setFilterType("all")}
							>
								Todas
							</Badge>
							<Badge
								variant={filterType === "ingreso" ? "default" : "outline"}
								className={cn(
									"cursor-pointer transition-colors",
									filterType === "ingreso" ? "bg-primary-600 text-white hover:bg-primary-700" : "hover:bg-gray-100",
								)}
								onClick={() => setFilterType("ingreso")}
							>
								Ingresos
							</Badge>
							<Badge
								variant={filterType === "gasto" ? "default" : "outline"}
								className={cn(
									"cursor-pointer transition-colors",
									filterType === "gasto" ? "bg-primary-600 text-white hover:bg-primary-700" : "hover:bg-gray-100",
								)}
								onClick={() => setFilterType("gasto")}
							>
								Gastos
							</Badge>
						</div> */}
					</div>
				</CardHeader>
				<CardContent>
					{
						isLoading ? (
							<div className="space-y-3">
								{[...Array(5)].map((_, i) => (
									<div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-100 animate-pulse">
										<div className="flex items-center space-x-3">
											<div className="w-10 h-10 rounded-lg bg-gray-200" />
											<div>
												<div className="h-4 bg-gray-200 rounded w-32 mb-2" />
												<div className="h-3 bg-gray-200 rounded w-24" />
											</div>
										</div>
										<div className="flex items-center gap-2">
											<div className="h-4 bg-gray-200 rounded w-16" />
											<div className="w-8 h-8 bg-gray-200 rounded" />
											<div className="w-8 h-8 bg-gray-200 rounded" />
										</div>
									</div>
								))}
							</div>
						) :
							asset?.movements.length === 0 ? (
								<div className="text-center py-8 text-gray-500">
									<p>No hay transacciones para mostrar.</p>
								</div>
							) : (
								<div className="space-y-3">
									{asset?.movements.map((movement) => {
										// const IconComponent = categoryIcons[transaction.category as keyof typeof categoryIcons] || Filter
										// const isIncome = transaction.type === "ingreso"
										return (
											<div
												key={movement.id}
												className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
											>
												<div className="flex items-center space-x-3 min-w-0 flex-1">
													<div
														className={cn(
															"w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
															movement.type === TxType.INCOME ? "bg-green-500" : "bg-gray-400",
														)}
													>
														<IconComponent icon={movement.category?.icon} className="w-5 h-5 text-white" />
													</div>
													<div className="min-w-0 flex-1">
														<p className="font-medium text-sm text-gray-900 truncate">{movement.description}</p>
														<p className="text-xs text-gray-500">
															{/* {formatDate(transaction.date)} {transaction.time} */}
														</p>
														<span
															className={cn(
																"lg:hidden font-semibold text-sm",
																movement.type === TxType.INCOME ? "text-emerald-600" : "text-red-600",
															)}
														>
															{/* <span className={cn("lg:hidden font-semibold text-sm", movement.type === TxType.INCOME ? "text-green-600" : "text-gray-900")}> */}
															{movement.type === TxType.INCOME ? "+" : "-"}${movement.amount}
															{formatToBalance(movement.amount)}
														</span>
													</div>
												</div>
												<div className="flex items-center gap-2 shrink-0">
													<span className={cn("hidden lg:block font-semibold text-sm", movement.type === TxType.INCOME ? "text-green-600" : "text-gray-900")}>
														{movement.type === TxType.INCOME ? "+" : "-"}${movement.amount.toFixed(2)}
													</span>
													<Button
														variant="ghost"
														size="icon"
														// onClick={() => handleEditTransaction(transaction)}
														className="w-8 h-8"
													>
														<Edit className="w-4 h-4" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														// onClick={() => handleDeleteTransaction(transaction)}
														className="w-8 h-8"
													>
														<Trash2 className="w-4 h-4 text-red-500" />
													</Button>
												</div>
											</div>
										)
									})}
								</div>
							)}
				</CardContent>
			</Card>

			{/* Quick Chart Placeholder - Moved to bottom */}
			<Card>
				<CardHeader>
					<CardTitle>Gráfico de Tendencia</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
						<p className="text-gray-500">Gráfico de tendencia - Por implementar</p>
					</div>
				</CardContent>
			</Card>

			{/* Asset Edit Modal */}
			<AssetFormModal
				isOpen={isEditModalOpen}
				onClose={() => setIsEditModalOpen(false)}
				onSave={handleSaveAsset}
				initialData={asset}
			/>

			{/* MOVEMENTS */}
			{/* Transaction Edit Modal */}
			{/* <EditTransactionModal
				isOpen={isEditTransactionModalOpen}
				onClose={() => {
					setIsEditTransactionModalOpen(false)
					setEditingTransaction(null)
				}}
				onSave={handleSaveTransaction}
				transaction={editingTransaction}
			/> */}

			{/* Delete Confirmation Modal */}
			{/* <DeleteConfirmationModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false)
					setDeletingTransaction(null)
				}}
				onConfirm={handleConfirmDelete}
				title={deletingTransaction?.title || ""}
				description="Esta transacción será eliminada permanentemente."
			/> */}
		</div>
	)
}
