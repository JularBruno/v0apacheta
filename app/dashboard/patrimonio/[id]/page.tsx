"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2, Filter, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import AssetFormModal from "@/components/assets/asset-form-modal"
import QuickSpendCard from "@/components/transactions/quick-spend-card"
import EditTransactionModal from "@/components/assets/edit-transaction-modal"
import DeleteConfirmationModal from "@/components/assets/delete-confirmation-modal"
import {
	Utensils,
	ShoppingCart,
	Car,
	Home,
	Gamepad2,
	Zap,
	Gift,
	Sparkles,
	Briefcase,
	Plane,
	DollarSign,
	TrendingUp,
	CreditCard,
} from "lucide-react"
import { TxType } from "@/lib/schemas/definitions";

// Mock data - replace with real data later
const mockAssets: FinancialItem[] = [
	{ id: "1", name: "Cuenta de Ahorro", type: "asset", currentValue: 1500.0 },
	{ id: "2", name: "Tarjeta de Crédito", type: "liability", currentValue: 300.0 },
	{ id: "3", name: "Inversiones en Bolsa", type: "asset", currentValue: 5000.0 },
	{ id: "4", name: "Préstamo Personal", type: "liability", currentValue: 1200.0 },
	{ id: "5", name: "Efectivo", type: "asset", currentValue: 200.0 },
]

const mockTransactions = [
	{
		id: "trans1",
		assetId: "1",
		title: "Depósito de Salario",
		amount: 1000.0,
		type: "ingreso" as const,
		category: "trabajo",
		date: "2024-07-10",
		time: "09:00",
	},
	{
		id: "trans2",
		assetId: "1",
		title: "Retiro para Gastos",
		amount: 200.0,
		type: "gasto" as const,
		category: "efectivo",
		date: "2024-07-09",
		time: "15:30",
	},
	{
		id: "trans3",
		assetId: "2",
		title: "Compra en Supermercado",
		amount: 85.5,
		type: "gasto" as const,
		category: "comestibles",
		date: "2024-07-08",
		time: "18:00",
	},
	{
		id: "trans4",
		assetId: "2",
		title: "Pago de Tarjeta",
		amount: 150.0,
		type: "ingreso" as const,
		category: "pago_deuda",
		date: "2024-07-05",
		time: "10:00",
	},
	{
		id: "trans5",
		assetId: "3",
		title: "Compra de Acciones",
		amount: 500.0,
		type: "gasto" as const,
		category: "inversion",
		date: "2024-07-07",
		time: "11:00",
	},
	{
		id: "trans6",
		assetId: "3",
		title: "Dividendos Recibidos",
		amount: 50.0,
		type: "ingreso" as const,
		category: "inversion",
		date: "2024-07-01",
		time: "14:00",
	},
]

const categoryIcons = {
	comida: Utensils,
	comestibles: ShoppingCart,
	transporte: Car,
	hogar: Home,
	entretenimiento: Gamepad2,
	servicios: Zap,
	regalos: Gift,
	belleza: Sparkles,
	trabajo: Briefcase,
	viajes: Plane,
	ingreso: DollarSign,
	efectivo: DollarSign,
	inversion: TrendingUp,
	pago_deuda: CreditCard,
} as const

interface Transaction {
	id: string
	assetId: string
	title: string
	amount: number
	type: "gasto" | "ingreso"
	category: string
	date: string
	time: string
}

interface FinancialItem {
	id: string
	name: string
	type: "asset" | "liability"
	currentValue: number
}

export default function AssetDetailPage() {
	const router = useRouter()
	const params = useParams()
	const searchParams = useSearchParams()
	const assetId = params.id as string
	const actionParam = searchParams.get("action") as TxType.INCOME | TxType.EXPENSE | null

	const [isLoading, setIsLoading] = useState(true)
	const [filterType, setFilterType] = useState<"all" | "gasto" | "ingreso">("all")
	const [transactions, setTransactions] = useState<Transaction[]>([])
	const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
	const [asset, setAsset] = useState<FinancialItem | null>(null)
	const [isEditModalOpen, setIsEditModalOpen] = useState(false)
	const [showQuickSpend, setShowQuickSpend] = useState(false)
	const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)
	const [isEditTransactionModalOpen, setIsEditTransactionModalOpen] = useState(false)
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

	useEffect(() => {
		setIsLoading(true)
		const timer = setTimeout(() => {
			const foundAsset = mockAssets.find((a) => a.id === assetId)
			setAsset(foundAsset || null)

			const filteredByAsset = mockTransactions.filter((t) => t.assetId === assetId)
			setTransactions(filteredByAsset)
			setIsLoading(false)

			// Show QuickSpendCard if action parameter is present
			if (actionParam === TxType.INCOME || actionParam === TxType.EXPENSE) {
				setShowQuickSpend(true)
			}
		}, 500)

		return () => clearTimeout(timer)
	}, [assetId, actionParam])

	const filteredTransactions = useMemo(() => {
		return transactions.filter((transaction) => {
			if (filterType === "all") return true
			return transaction.type === filterType
		})
	}, [transactions, filterType])

	const formatDate = (dateString: string) => {
		const date = new Date(dateString)
		const today = new Date()
		const yesterday = new Date(today)
		yesterday.setDate(yesterday.getDate() - 1)

		if (date.toDateString() === today.toDateString()) {
			return "Hoy"
		} else if (date.toDateString() === yesterday.toDateString()) {
			return "Ayer"
		} else {
			return date.toLocaleDateString("es-AR", { day: "numeric", month: "short" })
		}
	}

	const handleEditTransaction = (transaction: Transaction) => {
		setEditingTransaction(transaction)
		// Here you would open an edit modal
		setIsEditTransactionModalOpen(true)
	}

	const handleSaveTransaction = (updatedTransaction: Transaction) => {
		setTransactions((prev) => prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t)))
		setEditingTransaction(null)
	}

	const handleDeleteTransaction = (transaction: Transaction) => {
		setDeletingTransaction(transaction)
		setIsDeleteModalOpen(true)
	}

	const handleConfirmDelete = () => {
		if (deletingTransaction) {
			setTransactions((prev) => prev.filter((t) => t.id !== deletingTransaction.id))
			setDeletingTransaction(null)
		}
	}

	const handleEditAsset = () => {
		setIsEditModalOpen(true)
	}

	const handleDeleteAsset = () => {
		if (confirm("¿Estás seguro de que quieres eliminar este elemento financiero? Esta acción no se puede deshacer.")) {
			// TODO: Delete asset and redirect
			router.push("/dashboard/patrimonio")
		}
	}

	const handleSaveAsset = (item: { id?: string; name: string; type: "asset" | "liability"; currentValue: number }) => {
		if (asset && item.id === asset.id) {
			setAsset({ ...asset, name: item.name, type: item.type, currentValue: item.currentValue })
		}
		setIsEditModalOpen(false)
	}

	// const handleQuickSpend = (data: QuickSpendData) => {
	// 	console.log("Quick spend for asset:", asset?.name, data)
	// 	alert(`${data.type === TxType.INCOME ? "Ingreso" : "Gasto"} • ${data.amount} • ${data.tagId} agregado a ${asset?.name}`)
	// 	// TODO: Add transaction to this specific asset
	// 	setShowQuickSpend(false)
	// 	// Remove action parameter from URL
	// 	router.replace(`/dashboard/patrimonio/${assetId}`)
	// }

	const handleShowQuickSpend = () => {
		setShowQuickSpend(true)
	}

	const handleHideQuickSpend = () => {
		setShowQuickSpend(false)
		// Remove action parameter from URL if present
		if (actionParam) {
			router.replace(`/dashboard/patrimonio/${assetId}`)
		}
	}

	if (!asset) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<p className="text-gray-500 mb-4">Elemento financiero no encontrado</p>
					<Button onClick={() => router.push("/dashboard/patrimonio")}>Volver a la lista</Button>
				</div>
			</div>
		)
	}

	const isAsset = asset.type === "asset"
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
					<h1 className="text-2xl font-bold text-gray-900 truncate">{asset.name}</h1>
					<p className="text-sm text-gray-500 capitalize">{asset.type === "asset" ? "Activo" : "Pasivo"}</p>
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
							{asset.currentValue.toFixed(2)}
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Quick Spend Card - Show conditionally */}
			{/* {showQuickSpend ? (
        <QuickSpendCard
          onAdd={handleQuickSpend}
          initialType={actionParam || undefined}
          onCancel={handleHideQuickSpend}
        />
      ) : ( */}
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
			{/* )} */}

			{/* Transaction History */}
			<Card>
				<CardHeader>
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<CardTitle>Historial de Transacciones</CardTitle>
						<div className="flex flex-wrap gap-2">
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
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
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
					) : filteredTransactions.length === 0 ? (
						<div className="text-center py-8 text-gray-500">
							<p>No hay transacciones para mostrar.</p>
						</div>
					) : (
						<div className="space-y-3">
							{filteredTransactions.map((transaction) => {
								const IconComponent = categoryIcons[transaction.category as keyof typeof categoryIcons] || Filter
								const isIncome = transaction.type === "ingreso"
								return (
									<div
										key={transaction.id}
										className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
									>
										<div className="flex items-center space-x-3 min-w-0 flex-1">
											<div
												className={cn(
													"w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
													isIncome ? "bg-green-500" : "bg-gray-400",
												)}
											>
												<IconComponent className="w-5 h-5 text-white" />
											</div>
											<div className="min-w-0 flex-1">
												<p className="font-medium text-sm text-gray-900 truncate">{transaction.title}</p>
												<p className="text-xs text-gray-500">
													{formatDate(transaction.date)} {transaction.time}
												</p>
												<span className={cn(" lg:hidden font-semibold text-sm", isIncome ? "text-green-600" : "text-gray-900")}>
													{isIncome ? "+" : "-"}${transaction.amount.toFixed(2)}
												</span>
											</div>
										</div>
										<div className="flex items-center gap-2 shrink-0">
											<span className={cn("hidden lg:block font-semibold text-sm", isIncome ? "text-green-600" : "text-gray-900")}>
												{isIncome ? "+" : "-"}${transaction.amount.toFixed(2)}
											</span>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleEditTransaction(transaction)}
												className="w-8 h-8"
											>
												<Edit className="w-4 h-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleDeleteTransaction(transaction)}
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
			{/* Transaction Edit Modal */}
			<EditTransactionModal
				isOpen={isEditTransactionModalOpen}
				onClose={() => {
					setIsEditTransactionModalOpen(false)
					setEditingTransaction(null)
				}}
				onSave={handleSaveTransaction}
				transaction={editingTransaction}
			/>

			{/* Delete Confirmation Modal */}
			<DeleteConfirmationModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false)
					setDeletingTransaction(null)
				}}
				onConfirm={handleConfirmDelete}
				title={deletingTransaction?.title || ""}
				description="Esta transacción será eliminada permanentemente."
			/>
		</div>
	)
}
