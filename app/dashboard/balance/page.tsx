"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Edit2, Check, X, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loading } from "@/components/ui/loading"
import { formatToBalance } from "@/lib/quick-spend-constants"
import { TxType } from "@/lib/schemas/definitions"
import { useDashboard } from "@/app/dashboard/dashboardContext"
import { useCreateMovement } from "@/lib/hooks/use-create-movements"
import { useCreateCategory } from "@/lib/hooks/use-create-category"

/** Name shared by the auto-created "Balance" categories (one per type — a category
 *  can only be income OR expense) used exclusively for these adjustment movements,
 *  so they're easy to spot/filter in el historial instead of hiding in a real
 *  spending/income category. */
const BALANCE_CATEGORY_NAME = "Balance"
const BALANCE_CATEGORY_ICON = "Wallet"

export default function AcomodarBalancePage() {
	const { userBalance, loadingUser, cats, loadingCats } = useDashboard()
	const createMovement = useCreateMovement()
	const createCategory = useCreateCategory()
	const { toast } = useToast()

	const [isEditing, setIsEditing] = useState(false)
	const [newBalance, setNewBalance] = useState("")

	const isSaving = createMovement.isPending || createCategory.isPending

	const handleEdit = () => {
		setNewBalance(String(userBalance))
		setIsEditing(true)
	}

	const handleCancel = () => {
		setIsEditing(false)
	}

	const handleSave = async () => {
		const parsedBalance = Number.parseFloat(newBalance)

		if (isNaN(parsedBalance)) {
			toast({
				title: "Error",
				description: "Por favor ingresa un número válido",
				variant: "destructive",
			})
			return
		}

		const delta = parsedBalance - userBalance

		if (delta === 0) {
			toast({ title: "Sin cambios", description: "El balance ya es ese." })
			setIsEditing(false)
			return
		}

		// A balance adjustment is just a movement for the difference — income if the
		// real balance is higher than what we have registered, expense if it's lower.
		// This keeps userBalance and el historial in sync automatically (useCreateMovement
		// updates both cached queries), instead of a separate "set balance" endpoint.
		const type = delta > 0 ? TxType.INCOME : TxType.EXPENSE

		try {
			// Find (or lazily create, first time this is used) the dedicated "Balance"
			// category for this type — keeps adjustments out of real spending/income
			// categories instead of forcing the user to pick one.
			let category = cats.find((c) => c.type === type && c.name === BALANCE_CATEGORY_NAME)
			if (!category) {
				category = await createCategory.mutateAsync({
					name: BALANCE_CATEGORY_NAME,
					icon: BALANCE_CATEGORY_ICON,
					color: type === TxType.INCOME ? "bg-teal-500" : "bg-slate-500",
					type,
				})
			}

			await createMovement.mutateAsync({
				type,
				categoryId: category.id,
				tagName: "Ajuste de balance",
				description: "Ajuste manual de balance",
				amount: Math.abs(delta),
			})

			toast({
				title: "Balance actualizado",
				description: `Tu balance ahora es ${formatToBalance(parsedBalance)}`,
			})
			setIsEditing(false)
		} catch (error) {
			console.error("Balance adjustment failed:", error)
			toast({
				title: "Error",
				description: "No se pudo actualizar el balance. Volvé a intentarlo.",
				variant: "destructive",
			})
		}
	}

	return (
		<div className="container mx-auto max-w-3xl px-4 md:px-6 py-6 space-y-6">
			{/* Header */}
			<div className="flex items-start gap-3">
				<Wallet className="w-8 h-8 text-primary-600 flex-shrink-0" />
				<div>
					<h1 className="text-2xl font-bold">Acomodar Balance</h1>
					<p className="text-sm text-muted-foreground">Actualiza tu balance actual manualmente</p>
				</div>
			</div>

			{/* Current Balance Display */}
			<Card className="border-primary-200 bg-primary-50">
				<CardHeader>
					<CardTitle className="text-primary-900">Balance Actual</CardTitle>
					<CardDescription className="text-primary-700">Este es tu balance registrado en el sistema</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center py-8">
						<div className="text-center">
							{loadingUser ? (
								<Loading></Loading>
							) : (
								<div className="text-5xl font-bold text-primary-600">{formatToBalance(userBalance)}</div>
							)}
							<p className="text-sm text-muted-foreground mt-2">Saldo disponible</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Update Balance Section */}
			<Card>
				<CardHeader>
					<CardTitle>Actualizar Balance</CardTitle>
					<CardDescription>Ajusta tu balance actual si necesitas corregirlo o actualizarlo manualmente</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{!isEditing ? (
						<div className="flex items-center justify-between p-6 bg-muted rounded-lg border border-border">
							<div>
								<p className="text-sm text-muted-foreground mb-1">Balance registrado</p>
								<p className="text-2xl font-bold text-foreground">{formatToBalance(userBalance)}</p>
							</div>
							<Button onClick={handleEdit} className="flex items-center gap-2" disabled={loadingUser || loadingCats}>
								<Edit2 className="w-4 h-4" />
								Editar
							</Button>
						</div>
					) : (
						<div className="space-y-4 p-6 bg-primary-50 rounded-lg border border-primary-200">
							<div>
								<label htmlFor="new-balance" className="text-sm font-medium text-foreground mb-2 block">
									Nuevo Balance
								</label>
								<Input
									id="new-balance"
									type="number"
									step="0.01"
									value={newBalance}
									onChange={(e) => setNewBalance(e.target.value)}
									placeholder="Ingresa el nuevo balance"
									className="text-lg"
									disabled={isSaving}
									autoFocus
								/>
							</div>
							<div className="flex gap-3">
								<Button
									onClick={handleSave}
									className="flex-1 flex items-center justify-center gap-2"
									disabled={isSaving}
								>
									{isSaving ? <Loading /> : <Check className="w-4 h-4" />}
									Guardar
								</Button>
								<Button
									onClick={handleCancel}
									variant="outline"
									className="flex-1 flex items-center justify-center gap-2 bg-transparent"
									disabled={isSaving}
								>
									<X className="w-4 h-4" />
									Cancelar
								</Button>
							</div>
						</div>
					)}

					{/* Warning Message */}
					<div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
						<h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
							<Wallet className="w-4 h-4" />
							Importante
						</h4>
						<ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
							<li>Esto crea un movimiento de ajuste por la diferencia — no reemplaza tu historial</li>
							<li>Usa esta función solo si necesitas corregir un error o actualizar manualmente</li>
							<li>El ajuste queda registrado en tu historial como cualquier otro movimiento</li>
						</ul>
					</div>
				</CardContent>
			</Card>

			{/* Pointer to the real history — adjustments show up there like any movement */}
			<Card>
				<CardContent className="flex items-center justify-between p-6">
					<div className="flex items-center gap-3">
						<History className="w-5 h-5 text-muted-foreground" />
						<div>
							<p className="text-sm font-medium text-foreground">Historial de movimientos</p>
							<p className="text-sm text-muted-foreground">Tus ajustes de balance aparecen ahí, junto al resto</p>
						</div>
					</div>
					<Button variant="outline" asChild>
						<Link href="/dashboard/historial">Ver historial</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}
