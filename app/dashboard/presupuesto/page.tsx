"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import QuickSpendCard from "@/components/movements/quick-spend-card"
import {
	Wallet,
	Map,
	CalendarDays,
	MoreHorizontal,
	TrendingUp,
	TrendingDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { getDateStringsForFilter, getLastNMonths, getMonthName } from "@/lib/dateUtils"
import { getBudgetByUserAndPeriod, putCategory } from "@/lib/actions/categories"
import { CategoryBudget } from "@/lib/schemas/category"
import IconComponent from "@/components/movements/icon-component"
import { formatToBalance } from "@/lib/quick-spend-constants"
import { BalanceInput } from "@/components/balance-input/balance-input-mock"

import React, { useRef } from "react";
import PaymentReminder from "@/components/payment-reminder/payment-reminder-card"
import { useDashboard } from '@/app/dashboard/dashboardContext';
import { putUser } from "@/lib/actions/user"
import { useToast } from '@/hooks/use-toast';
import Loading from "../patrimonio/[id]/loading"
import TransactionChart from "@/components/dashboard/transaction-chart"
import { BudgetOverviewSkeleton } from "@/components/budget/budget-skeletons"
import CategoryCard from "@/components/budget/category-card"
import { TxType } from "@/lib/schemas/definitions"
import { useUpdateCategory } from "@/lib/hooks/use-update-category"
import { useUpdateUser } from "@/lib/hooks/use-update-user"

export default function PresupuestoPage() {
	const { toast } = useToast();
	const updateCategory = useUpdateCategory();
	const updateUser = useUpdateUser();

	const { user, loadingUser, error, budgetedCats, budgetLoading } = useDashboard();


	const categoryTotals = budgetedCats.reduce(
		(acc, t) => {
			acc[t.id] = (acc[t.id] || 0) + t.totalExpenses
			return acc
		},
		{} as Record<string, number>,
	)

	const expenseCategories = budgetedCats.filter((c) => c.id !== "all" && c.type === TxType.EXPENSE)

	const totalSpent = expenseCategories.reduce((sum, c) => sum + (categoryTotals[c.id] || 0), 0)

	// const totalSpent = useMemo(() =>
	// 	// budgetedCats.reduce((sum, cat) => if (cat.type == TxType) sum + cat.totalExpenses, 0),
	// 	budgetedCats.reduce((sum, cat) => sum + cat.totalExpenses, 0),
	// 	[budgetedCats]);

	const totalBudgeted = useMemo(() =>
		budgetedCats.reduce((sum, item) => item.type === TxType.EXPENSE ? sum + item.budget : sum, 0),
		[budgetedCats]);

	const userBudgetRemaining = (user?.totalBudget || 0) - totalSpent;

	const incomeOrderRef = useRef<string[] | null>(null);
	const expenseOrderRef = useRef<string[] | null>(null);

	const sortedIncomeCats = useMemo(() => {
		const income = budgetedCats.filter(c => c.type === TxType.INCOME);

		if (!incomeOrderRef.current && income.length > 0)
			incomeOrderRef.current = [...income].sort((a, b) => b.budget - a.budget).map(c => c.id);

		if (!incomeOrderRef.current) return income;
		return incomeOrderRef.current.map(id => income.find(c => c.id === id)).filter(Boolean) as typeof income;

	}, [budgetedCats]);

	const sortedExpenseCats = useMemo(() => {
		const expense = budgetedCats.filter(c => c.type === TxType.EXPENSE);
		if (!expenseOrderRef.current && expense.length > 0)
			expenseOrderRef.current = [...expense].sort((a, b) => b.budget - a.budget).map(c => c.id);
		if (!expenseOrderRef.current) return expense;
		return expenseOrderRef.current.map(id => expense.find(c => c.id === id)).filter(Boolean) as typeof expense;
	}, [budgetedCats]);

	async function updateCategoryBudget(id: any, budget: any) {
		let cat = budgetedCats.find(cat => cat.id === id)
		if (budget == 0) {
			toast({
				title: `Intenta presupuestar todo`,
				description: `Debes poner un presupuesto mayor a cero`,
				variant: "default",
			})
			// this should revert the value to the previous one 

			return;
		}
		if (cat?.budget !== budget) {
			await updateCategory.mutateAsync({ id, data: { budget } });

			toast({
				title: `Presupuesto actualizado`,
				description: `Se actualizó el presupuesto`,
				variant: "success",
			})
		}
	}

	async function setUserBudget(number: number) {
		if (user?.totalBudget !== number) {
			try {
				await updateUser.mutateAsync({ totalBudget: number });
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

			{/* 
				Horizontal chart 
			*/}
			<TransactionChart />

			{/* Category Budgeting Incomes */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="w-5 h-5 text-emerald-600" /> Fuentes de Ingreso
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{budgetLoading ? (
						// Show loading state once
						<div className="space-y-4">
							{[1, 2, 3].map(i => (
								<div key={i} className="h-20 bg-gray-300 rounded-lg animate-pulse" />
							))}
						</div>
					) : (
						sortedIncomeCats
							.map((category) => {
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
									<CategoryCard
										key={category.id}
										category={category}
										updateCategoryBudget={updateCategoryBudget}
										percentageUsed={percentageUsed}
										isOverBudget={isOverBudget}
										getProgressColor={getProgressColor}
									/>
								)
							})
					)}
				</CardContent>
			</Card>

			{/* Category Budgeting Expenses */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingDown className="w-5 h-5 text-red-600" />
						Presupuesto por Categoría de {getMonthName()}.
						<br />
						Total distribuido: {formatToBalance(totalBudgeted)}
					</CardTitle>
				</CardHeader>

				<CardContent className="space-y-4">
					{budgetLoading ? (
						// Show loading state once
						<div className="space-y-4">
							{[1, 2, 3].map(i => (
								<div key={i} className="h-20 bg-gray-300 rounded-lg animate-pulse" />
							))}
						</div>
					) : (
						sortedExpenseCats
							.map((category) => {
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
									<CategoryCard
										key={category.id}
										category={category}
										updateCategoryBudget={updateCategoryBudget}
										percentageUsed={percentageUsed}
										isOverBudget={isOverBudget}
										getProgressColor={getProgressColor}
									/>
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

