"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import QuickSpendCard from "@/components/transactions/quick-spend-card"
import {
	Wallet,
	Map,
	CalendarDays,
	MoreHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { getDateStringsForFilter, getLastNMonths, getMonthName } from "@/lib/dateUtils"
import { getBudgetByUserAndPeriod, putCategory } from "@/lib/actions/categories"
import { CategoryBudget } from "@/lib/schemas/category"
import IconComponent from "@/components/transactions/icon-component"
import { formatToBalance } from "@/lib/quick-spend-constants"
import { BalanceInput } from "@/components/balance-input/balance-input-mock"

import React, { useRef } from "react";
import PaymentReminder from "@/components/payment-reminder/payment-reminder-card"
import { useDashboard } from '@/app/dashboard/dashboardContext';
import { putUser, revalidateUser } from "@/lib/actions/user"
import { useToast } from '@/hooks/use-toast';
import Loading from "../patrimonio/[id]/loading"
import TransactionChart from "@/components/dashboard/transaction-chart"
import { BudgetOverviewSkeleton } from "@/components/budget/budget-skeletons"

export default function PresupuestoPage() {
	const { toast } = useToast();

	// const [cats, setCats] = useState<CategoryBudget[]>([])
	const [userBudgetRemaining, setUserBudgetRemaining] = useState<number>(0)
	// const [loadingCats, setLoadingCats] = useState<boolean>(true)

	const { user, loadingUser, error, budgetedCats, setBudgetedCats, loadingBudgetedCats } = useDashboard();

	const totalSpent = useMemo(() => {
		return budgetedCats.reduce((sum, cat) => sum + cat.totalExpenses, 0)
	}, [budgetedCats])

	useEffect(() => {
		setUserBudgetRemaining((user?.totalBudget || 0) - totalSpent)
	}, [user, totalSpent])

	function updateCategoryBudget(id: any, budget: any) {
		let cat = budgetedCats.find(cat => cat.id === id)
		if (cat?.budget !== budget) {
			setBudgetedCats(prev =>
				prev.map(cat =>
					cat.id === id ? { ...cat, budget: budget } : cat
				)
			);
			putCategory(id, { budget: budget });
		}
	}

	function setUserBudget(number: number) {
		if (user?.totalBudget !== number) {
			try {
				putUser({ totalBudget: number });
				revalidateUser(); // get user from api!

				setUserBudgetRemaining((number) - totalSpent);

				toast({
					title: `Presupuesto actualizado`,
					description: `Se actualizó tu presupuesto personal`,
					variant: "success",
				})
			} catch (error) {
				console.log(error);
			}
		}
	}

	return (
		<div className="space-y-6">
			{/* Budget Overview */}
			{loadingUser ? (
				<BudgetOverviewSkeleton></BudgetOverviewSkeleton>
			) : (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Wallet className="w-5 h-5 text-primary-600" /> Presupuesto personal {getMonthName()}
						</CardTitle>
					</CardHeader>

					<CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="text-center">
							<p className="text-sm text-gray-500">Presupuesto Total</p>
							{loadingUser ? <Loading></Loading> :
								<BalanceInput
									id='user-budget'
									defaultValue={user?.totalBudget || 0}
									onBlur={(value) => setUserBudget(value)}
								/>
							}
						</div>
						<div className="text-center">
							<p className="text-sm text-gray-500">Gastado</p>
							<p className="text-2xl font-bold text-red-600">{formatToBalance(totalSpent)}</p>
						</div>
						<div className="text-center">
							<p className="text-sm text-gray-500">Restante</p>
							<p className={`text-2xl font-bold ${userBudgetRemaining >= 0 ? "text-green-600" : "text-red-600"}`}>
								{formatToBalance(userBudgetRemaining)}
							</p>
						</div>
					</CardContent>

				</Card>
			)}


			<TransactionChart />

			{/* Category Budgeting */}

			<Card>
				<CardHeader>
					<CardTitle>Presupuesto por Categoría de {getMonthName()}</CardTitle>
				</CardHeader>

				<CardContent className="space-y-4">
					{loadingBudgetedCats ? (
						// Show loading state once
						<div className="space-y-4">
							{[1, 2, 3].map(i => (
								<div key={i} className="h-20 bg-gray-300 rounded-lg animate-pulse" />
							))}
						</div>
					) : (
						budgetedCats.map((category) => {
							const percentageUsed =
								category.budget > 0 ? (category.totalExpenses / category.budget) * 100 : 0
							const isOverBudget = category.totalExpenses > category.budget

							const getProgressColor = (pct: number) => {
								if (pct > 100) return "[&>div]:bg-red-600"
								if (pct > 90) return "[&>div]:bg-red-500"
								if (pct > 75) return "[&>div]:bg-orange-500"
								if (pct > 50) return "[&>div]:bg-amber-500"
								if (pct > 25) return "[&>div]:bg-emerald-500"
								return "[&>div]:bg-green-500"
							}

							return (
								<div key={category.id} className="space-y-2">

									<div className="flex-col gap-2 md:flex-row md:items-center md:justify-between">
										<div className="flex items-center gap-3">
											<div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", category.color)}>
												<IconComponent icon={category?.icon} className="w-4 h-4 text-white" />
											</div>

											<div className="min-w-0">
												<p className="font-medium text-sm truncate">{category.name}</p>
												<p className="text-xs text-gray-500">
													{formatToBalance(category.totalExpenses)} de {formatToBalance(category.budget)}
												</p>
											</div>
											<div className="ml-auto">
												<BalanceInput
													defaultValue={category.budget}
													id={category.id}
													onBlur={(value) => updateCategoryBudget(category.id, value)}
												/>
											</div>
										</div>

										{/* Row 2: Percentage */}
										<div className="flex items-center justify-between px-1">
											<span className={cn(
												"text-xs font-semibold",
												percentageUsed > 100 ? "text-red-600" :
													percentageUsed > 75 ? "text-orange-600" :
														percentageUsed > 50 ? "text-amber-600" :
															"text-emerald-600"
											)}>
												{percentageUsed.toFixed(0)}% usado
											</span>
											<span className="text-xs text-gray-400">
												{isOverBudget
													? `-$${(category.totalExpenses - category.budget).toFixed(2)} excedido`
													: `$${(category.budget - category.totalExpenses).toFixed(2)} restante`
												}
											</span>
										</div>

										{/* Row 3: Progress bar */}
										<Progress
											value={Math.min(100, percentageUsed)}
											className={cn("h-2.5 rounded-full", getProgressColor(percentageUsed))}
										/>
									</div>
								</div>
							)
						})
					)}


				</CardContent>
			</Card>

			{/* Payment Reminders */}
			<PaymentReminder
				cats={budgetedCats}
			/>

			{/* Insights & Map Reminder */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Expense Insights */}
				<Card>
					<CardHeader>
						<CardTitle>Insights de Gastos</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-gray-600">
							{/* Aquí podrás ver análisis y tendencias de tus gastos a lo largo del tiempo. */}
							<br />
							(Funcionalidad en desarrollo)
							<br />
							RECURRE AL HISTORIAL para información de meses anteriores

						</p>
					</CardContent>
				</Card>

				{/* Map Reminder */}
				<Card>
					<CardHeader>
						<CardTitle>¡No olvides tu camino!</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col items-center text-center">
						<Map className="w-16 h-16 text-primary-600 mb-4" />
						<p className="text-gray-600 mb-4">
							Tu mapa financiero te espera. ¡Sigue avanzando en tu educación y alcanza nuevas metas!
						</p>
						<Link href="/dashboard/mapa" className="w-full">
							<Button className="w-full">Ir al Mapa</Button>
						</Link>
					</CardContent>
				</Card>
			</div>

		</div>
	)
}
