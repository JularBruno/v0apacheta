"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { PaymentReminderModal } from "@/components/payment-reminder/payment-reminder-dialog"
import QuickSpendCard from "@/components/transactions/quick-spend-card"
import {
	Utensils,
	ShoppingCart,
	Car,
	Home,
	Gamepad2,
	Zap,
	Gift,
	Sparkles,
	Plane,
	Plus,
	Wallet,
	Lightbulb,
	Map,
	CalendarDays,
	MoreHorizontal,
} from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { getDateStringsForFilter, getLastNMonths } from "@/lib/dateUtils"
import { getBudgetByUserAndPeriod, putCategory } from "@/lib/actions/categories"
import { Category, CategoryBudget } from "@/lib/schemas/category"
import IconComponent from "@/components/transactions/icon-component"
import { formatToBalance } from "@/lib/quick-spend-constants"
import { BalanceInput } from "@/components/balance-input/balance-input-mock"

import { FieldErrors, Control, UseFormClearErrors } from "react-hook-form";
import { useForm } from "react-hook-form";
import React, { useRef } from "react";
import { PaymentModal } from "./payment-modal"
import { PaymentReminder, PaymentType } from "@/lib/schemas/paymentReminder"

interface PaymentItem {
	id: string
	name: string
	amount: number
	dueDay?: number
	period?: string
	categoryId?: string
}

export default function PaymentReminderCard({
	cats
}: {
	cats: CategoryBudget[]
}) {

	const [monthlyPayments, setMonthlyPayments] = useState<PaymentItem[]>([
		{ id: "1", name: "Alquiler", amount: 500, dueDay: 1 },
		{ id: "2", name: "Internet", amount: 30, dueDay: 15 },
		{ id: "3", name: "Electricidad", amount: 70, dueDay: 20 },
	])
	const [randomPayments, setRandomPayments] = useState<PaymentItem[]>([
		{ id: "4", name: "Regalo de Cumpleaños", amount: 40 },
		{ id: "5", name: "Reparación Auto", amount: 150 },
	])

	const [showPaymentReminder, setShowPaymentReminder] = useState(false);
	const [paymentReminderType, setPaymentReminderType] = useState<PaymentType.MONTHLY | PaymentType.ONE_TIME>(PaymentType.MONTHLY)
	const [editingPaymentReminder, setEditingPaymentReminder] = useState<PaymentReminder | undefined>()

	const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null)

	const [showPaymentModal, setShowPaymentModal] = useState(false)

	const handleCreatePayment = (
	) => {
		console.log('handle create');

	}

	const removePayment = (type: "monthly" | "random", id: string) => {
		if (type === "monthly") {
			setMonthlyPayments((prev) => prev.filter((p) => p.id !== id))
		} else {
			setRandomPayments((prev) => prev.filter((p) => p.id !== id))
		}
	}

	const handlePayment = (payment: PaymentItem) => {
		// setSelectedPayment(payment)
		setShowPaymentModal(true)
	}

	const handleEditPayment = () => { }

	return (
		<>
			{/* Payment Reminders */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Monthly Payments */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CalendarDays className="w-5 h-5 text-blue-600" /> Recordar Pagos Mensuales
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{monthlyPayments.length === 0 ? (
							<p className="text-gray-500 text-sm text-center">No hay pagos mensuales registrados.</p>
						) : (
							monthlyPayments.map((payment) => (
								<div
									key={payment.id}
									className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
								>
									<div className="flex-1">
										<p className="font-medium text-gray-900">{payment.name}</p>
										<p className="text-sm text-gray-600">
											${payment.amount.toFixed(2)} • Día {payment.dueDay}
											{payment.period && payment.period !== "1" && ` (cada ${payment.period} meses)`}
										</p>
									</div>
									<div className="flex gap-2">
										<Button size="sm" variant="outline" onClick={() => handlePayment(payment)}>
											Pagar
										</Button>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon" className="p-1">
													<MoreHorizontal className="w-4 h-4 text-gray-500" />
													<span className="sr-only">Opciones de pago</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem onClick={() => handleEditPayment()}>
													Editar
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => removePayment("monthly", payment.id)}
													className="text-red-600 focus:text-red-600 focus:bg-red-50"
												>
													Eliminar
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>
							))
						)}
						<Button
							onClick={() => {
								setPaymentReminderType(PaymentType.MONTHLY)
								setShowPaymentReminder(true)
							}}
							className="w-full mt-4 flex items-center gap-2"
						>
							<Plus className="w-4 h-4" /> Agregar Recordatorio Mensual
						</Button>
					</CardContent>
				</Card>

				{/* Random Payments */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Lightbulb className="w-5 h-5 text-yellow-600" /> Recordatorio Pago
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{randomPayments.length === 0 ? (
							<p className="text-gray-500 text-sm text-center">No hay pagos aleatorios registrados.</p>
						) : (
							randomPayments.map((payment) => (
								<div
									key={payment.id}
									className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
								>
									<div className="flex-1">
										<p className="font-medium text-gray-900">{payment.name}</p>
										<p className="text-sm text-gray-600">${payment.amount.toFixed(2)}</p>
									</div>
									<div className="flex gap-2">
										<Button size="sm" variant="outline" onClick={() => handlePayment(payment)}>
											Pagar
										</Button>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon" className="p-1">
													<MoreHorizontal className="w-4 h-4 text-gray-500" />
													<span className="sr-only">Opciones de pago</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem onClick={() => handleEditPayment()}>Editar</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => removePayment("random", payment.id)}
													className="text-red-600 focus:text-red-600 focus:bg-red-50"
												>
													Eliminar
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>
							))
						)}
						<Button
							onClick={() => {
								setPaymentReminderType(PaymentType.ONE_TIME)
								setShowPaymentReminder(true)
							}}
							className="w-full mt-4 flex items-center gap-2"
						>
							<Plus className="w-4 h-4" /> Agregar Recordatorio de Pago
						</Button>
					</CardContent>
				</Card>
			</div>

			<PaymentReminderModal
				showPaymentReminder={showPaymentReminder}
				setShowPaymentReminder={setShowPaymentReminder}
				cats={cats}
				onSubmit={handleCreatePayment}
				paymentReminderType={paymentReminderType}
				setPaymentType={setPaymentReminderType}
				editingPaymentReminder={editingPaymentReminder}

			/>

			<PaymentModal open={showPaymentModal} onOpenChange={setShowPaymentModal} payment={selectedPayment || undefined} />
		</>
	)
}