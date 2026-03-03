"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { z } from 'zod';
import { paymentReminderSchema, PaymentType, PaymentReminder } from "@/lib/schemas/paymentReminder"
import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod';
import { CategoryBudget } from "@/lib/schemas/category"
import { BalanceInput } from "../balance-input/balance-input-form"

type PaymentReminderFormData = z.infer<typeof paymentReminderSchema>;

interface CreatePaymentModalProps {
	showPaymentReminder: boolean,
	setShowPaymentReminder: (open: boolean) => void,
	cats: CategoryBudget[],
	onSubmit: (payment?: {
		name: string
		amount: number
		dueDay?: number
		period?: string
		categoryId?: string
		type: "monthly" | "random"
		id?: string
	}) => void,
	setPaymentType: (kind: PaymentType.MONTHLY | PaymentType.ONE_TIME) => void,
	paymentReminderType: PaymentType.MONTHLY | PaymentType.ONE_TIME,
	editingPaymentReminder?: PaymentReminder,
}

const PERIODS = [
	{ value: "1", label: "Mensual (cada mes)" },
	{ value: "2", label: "Bimensual (cada 2 meses)" },
	{ value: "3", label: "Trimestral (cada 3 meses)" },
	{ value: "6", label: "Semestral (cada 6 meses)" },
	{ value: "12", label: "Anual (cada 12 meses)" },
]

export function PaymentReminderModal({
	showPaymentReminder,
	setShowPaymentReminder,
	cats,
	onSubmit,
	paymentReminderType,
	setPaymentType,
	editingPaymentReminder,
}: CreatePaymentModalProps) {

	//
	const { toast } = useToast()

	const [name, setName] = useState("")
	const [amount, setAmount] = useState("")
	const [dueDay, setDueDay] = useState("1")
	const [period, setPeriod] = useState("1")
	const [categoryId, setCategoryId] = useState("")

	/** Form zod validator, values, handlers, errors and loading */
	const {
		control,
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
		clearErrors,
	} = useForm<PaymentReminderFormData>({
		// resolver: zodResolver(paymentReminderSchema)
		// ,
		defaultValues: {
			title: '',
			amount: 0,
			type: paymentReminderType,
			period: undefined,
			categoryId: undefined,
			tagId: undefined
		}
	});

	const inputAmountRef = useRef<HTMLInputElement>(null)

	const onSubmitHandler = async (data?: any) => {
		console.log('asd asd');
		// onSubmit();
		console.log('data ', data);


	}

	// const handleCreatePaymentReminder = () => {

	// 	toast({
	// 		variant: "success",
	// 		title: editingPaymentReminder ? "Pago actualizado" : "Pago creado",
	// 		description: editingPaymentReminder ? `"${name}" se actualizó exitosamente` : `"${name}" se agregó exitosamente`,
	// 	})
	// }

	// const isEditing = !!editingPaymentReminder
	const isEditing = false

	return (
		<>
			<Dialog open={showPaymentReminder} onOpenChange={setShowPaymentReminder} >
				<DialogContent className="w-[95vw] max-w-md">
					<form onSubmit={handleSubmit(onSubmitHandler)}>
						{/* <form onSubmit={(e) => {
						e.preventDefault();
						console.log('asd');
					}}> */}

						<DialogHeader>
							<DialogTitle>{isEditing ? "Editar Pago" : "Nuevo Pago"}</DialogTitle>
						</DialogHeader>

						<div className="space-y-4 py-2">
							<div className="flex bg-gray-100 rounded-lg p-1" role="tablist" aria-label="Tipo de pago">
								<button
									role="tab"
									aria-selected={paymentReminderType === PaymentType.MONTHLY}
									onClick={() => setPaymentType(PaymentType.MONTHLY)}
									disabled={isEditing}
									className={cn(
										"flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
										paymentReminderType === PaymentType.MONTHLY
											? "bg-white text-gray-900 shadow-sm border border-gray-200 ring-2 ring-blue-200"
											: "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
										isEditing && "opacity-50 cursor-not-allowed",
									)}
								>
									📅 Mensual
								</button>
								<button
									role="tab"
									aria-selected={paymentReminderType === PaymentType.ONE_TIME}
									onClick={() => setPaymentType(PaymentType.ONE_TIME)}
									disabled={isEditing}
									className={cn(
										"flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
										paymentReminderType === PaymentType.ONE_TIME
											? "bg-white text-gray-900 shadow-sm border border-gray-200 ring-2 ring-yellow-200"
											: "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
										isEditing && "opacity-50 cursor-not-allowed",
									)}
								>
									⚡ Ocasional
								</button>
							</div>

							<div>
								<Label htmlFor="title">Título</Label>
								<Input
									id="title"
									placeholder="Ej: Alquiler, Reparación Auto"
									{...register('title')}
								/>
								{errors.title && (
									<p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
								)}
							</div>

							<div>
								<Label htmlFor="amount">Monto Base</Label>
								{/* <BalanceInput
									{...register('amount')}
								/> */}
								<BalanceInput
									errors={errors}
									clearErrors={clearErrors}
									inputAmountRef={inputAmountRef}
									control={control}
								/>
								{/* {errors.title && (
									<p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
								)} */}
							</div>

							{cats.length > 0 && (
								<div>
									<Label htmlFor="payment-category">Categoría (Opcional)</Label>
									<Select value={categoryId} onValueChange={setCategoryId}>
										<SelectTrigger id="payment-category">
											<SelectValue placeholder="Seleccioná una categoría" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">Sin categoría</SelectItem>
											{cats.map((cat) => (
												<SelectItem key={cat.id} value={cat.id}>
													<div className="flex items-center gap-2">
														<div className={cn("w-3 h-3 rounded-full", cat.color)} />
														{cat.name}
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}

							{paymentReminderType === "monthly" && (
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
							{/* <Button type="button" variant="outline" onClick={() => setShowPaymentReminder(false)}> */}
							<Button type="button" variant="outline">
								Cancelar
							</Button>
							{/* <Button type="submit" onClick={() => setShowPaymentReminder(false)}>{isEditing ? "Guardar Cambios" : "Crear Pago"}</Button> */}
							<Button type="submit" >{isEditing ? "Guardar Cambios" : "Crear Pago"}</Button>
						</DialogFooter>
					</form>

				</DialogContent>
			</Dialog>
		</>

	)
}
