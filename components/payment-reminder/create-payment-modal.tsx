"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface PaymentItem {
	id: string
	name: string
	amount: number
	dueDay?: number
	period?: string
	categoryId?: string
}

interface CreatePaymentModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onCreatePayment: (payment: {
		name: string
		amount: number
		dueDay?: number
		period?: string
		categoryId?: string
		type: "monthly" | "random"
		id?: string
	}) => void
	categories?: Array<{ id: string; name: string; color: string }>
	editingPayment?: PaymentItem & { type: "monthly" | "random" }
}

const PERIODS = [
	{ value: "1", label: "Mensual (cada mes)" },
	{ value: "2", label: "Bimensual (cada 2 meses)" },
	{ value: "3", label: "Trimestral (cada 3 meses)" },
	{ value: "6", label: "Semestral (cada 6 meses)" },
	{ value: "12", label: "Anual (cada 12 meses)" },
]

export function CreatePaymentModal({
	open,
	onOpenChange,
	onCreatePayment,
	categories = [],
	editingPayment,
}: CreatePaymentModalProps) {
	const { toast } = useToast()
	const [paymentType, setPaymentType] = useState<"monthly" | "random">("monthly")
	const [name, setName] = useState("")
	const [amount, setAmount] = useState("")
	const [dueDay, setDueDay] = useState("1")
	const [period, setPeriod] = useState("1")
	const [categoryId, setCategoryId] = useState("")

	useEffect(() => {
		if (editingPayment) {
			setPaymentType(editingPayment.type)
			setName(editingPayment.name)
			setAmount(editingPayment.amount.toString())
			setDueDay(editingPayment.dueDay?.toString() || "1")
			setPeriod(editingPayment.period || "1")
			setCategoryId(editingPayment.categoryId || "")
		} else {
			setPaymentType("monthly")
			setName("")
			setAmount("")
			setDueDay("1")
			setPeriod("1")
			setCategoryId("")
		}
	}, [editingPayment, open])

	const handleCreatePayment = () => {
		if (!name.trim()) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Ingresá un nombre de pago",
			})
			return
		}

		const parsedAmount = Number.parseFloat(amount)
		if (isNaN(parsedAmount) || parsedAmount <= 0) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Ingresá un monto válido",
			})
			return
		}

		if (paymentType === "monthly" && !dueDay) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Seleccioná el día de vencimiento",
			})
			return
		}

		onCreatePayment({
			id: editingPayment?.id,
			name: name.trim(),
			amount: parsedAmount,
			dueDay: paymentType === "monthly" ? Number.parseInt(dueDay) : undefined,
			period: paymentType === "monthly" ? period : undefined,
			categoryId: categoryId || undefined,
			type: paymentType,
		})

		setName("")
		setAmount("")
		setDueDay("1")
		setPeriod("1")
		setCategoryId("")
		setPaymentType("monthly")
		onOpenChange(false)

		toast({
			variant: "success",
			title: editingPayment ? "Pago actualizado" : "Pago creado",
			description: editingPayment ? `"${name}" se actualizó exitosamente` : `"${name}" se agregó exitosamente`,
		})
	}

	const isEditing = !!editingPayment

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[95vw] max-w-md">
				<DialogHeader>
					<DialogTitle>{isEditing ? "Editar Pago" : "Nuevo Pago"}</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 py-2">
					<div className="flex bg-gray-100 rounded-lg p-1" role="tablist" aria-label="Tipo de pago">
						<button
							role="tab"
							aria-selected={paymentType === "monthly"}
							onClick={() => setPaymentType("monthly")}
							disabled={isEditing}
							className={cn(
								"flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
								paymentType === "monthly"
									? "bg-white text-gray-900 shadow-sm border border-gray-200 ring-2 ring-blue-200"
									: "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
								isEditing && "opacity-50 cursor-not-allowed",
							)}
						>
							📅 Mensual
						</button>
						<button
							role="tab"
							aria-selected={paymentType === "random"}
							onClick={() => setPaymentType("random")}
							disabled={isEditing}
							className={cn(
								"flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
								paymentType === "random"
									? "bg-white text-gray-900 shadow-sm border border-gray-200 ring-2 ring-yellow-200"
									: "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
								isEditing && "opacity-50 cursor-not-allowed",
							)}
						>
							⚡ Ocasional
						</button>
					</div>

					<div>
						<Label htmlFor="payment-name">Nombre del Pago</Label>
						<Input
							id="payment-name"
							placeholder="Ej: Alquiler, Reparación Auto"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>

					<div>
						<Label htmlFor="payment-amount">Monto Base</Label>
						<Input
							id="payment-amount"
							type="number"
							placeholder="Ej: 500"
							min="0"
							step="0.01"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
						/>
					</div>

					{categories.length > 0 && (
						<div>
							<Label htmlFor="payment-category">Categoría (Opcional)</Label>
							<Select value={categoryId} onValueChange={setCategoryId}>
								<SelectTrigger id="payment-category">
									<SelectValue placeholder="Seleccioná una categoría" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">Sin categoría</SelectItem>
									{categories.map((cat) => (
										<SelectItem key={cat.id} value={cat.id}>
											{cat.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}

					{paymentType === "monthly" && (
						<>
							<div>
								<Label htmlFor="payment-due-day">Día de Vencimiento (del mes)</Label>
								<Select value={dueDay} onValueChange={setDueDay}>
									<SelectTrigger id="payment-due-day">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Array.from({ length: 31 }, (_, i) => (i + 1).toString()).map((day) => (
											<SelectItem key={day} value={day}>
												Día {day}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label htmlFor="payment-period">Frecuencia (Opcional)</Label>
								<Select value={period} onValueChange={setPeriod}>
									<SelectTrigger id="payment-period">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{PERIODS.map((p) => (
											<SelectItem key={p.value} value={p.value}>
												{p.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancelar
					</Button>
					<Button onClick={handleCreatePayment}>{isEditing ? "Guardar Cambios" : "Crear Pago"}</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
