"use client"

import { useMemo } from 'react';

import { useEffect, useState } from 'react';
import { getMovementsByUserAndFilter } from "@/lib/actions/movements"

import { Movement, Movements } from "@/lib/schemas/movement"

import { useDeleteMovement } from "@/lib/hooks/use-delete-movement"
import { TxType } from "@/lib/schemas/definitions";

import { formatToBalance } from "@/lib/quick-spend-constants"
import { getDateStringsForFilter, getDaysRemainingInMonth, getLastNMonths, getMonthName } from "@/lib/dateUtils"
import { useDashboard } from '@/app/dashboard/dashboardContext';
import { useMovements } from "@/lib/hooks/use-movements"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loading } from "@/components/ui/loading"
import { toast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress" // Import Progress component

import SpendingChart from "@/components/dashboard/spending-chart"
import RecentExpenses from "@/components/dashboard/recent-expenses"
import QuickSpendCard from "@/components/movements/quick-spend-card"

// const { start: _start, end: _end } = getLastNMonths(1);
// const { startDate, endDate } = getDateStringsForFilter(_start, _end);


export default function InicioPage() {

	const { user, userBalance, loadingUser, error, cats, loadingCats, loadingTags, budgetedCats, budgetLoading } = useDashboard();

	/**
	 * 
	 * This for the chart
	 * 
	 */
	// Mock data for budget summary and progress
	const monthlyBudget = user?.totalBudget || 0
	const totalSpent = budgetedCats.filter((t) => t.type === TxType.EXPENSE).reduce((sum, t) => sum + t.totalExpenses, 0)
	const monthlyBudgetRemaining = monthlyBudget - totalSpent
	const progressPercentage = (totalSpent / monthlyBudget) * 100

	// Calculate daily spending suggestion (mock for now, assuming 4 days remaining)
	const daysRemaining = getDaysRemainingInMonth();
	const dailySpendSuggestion = monthlyBudgetRemaining > 0 ? monthlyBudgetRemaining / daysRemaining : 0

	/**
	 * 
	 * Movements
	 * 
	 */

	const movementsFilters = useMemo(() => {
		const { start, end } = getLastNMonths(1);
		return getDateStringsForFilter(start, end);
	}, []);

	const { data: rawMovements = [], isLoading: loadingMovements } = useMovements(movementsFilters);

	const allMovements = useMemo(() =>
		[...rawMovements].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
		[rawMovements]
	);

	/**
	 * Fetch Movements
	 */
	const onAddMovement = async (data: Movement) => {
		toast({
			variant: "success",
			title: "Movimiento realizado!",
			description: `Se realizó tu ${data.type === TxType.INCOME ? "Ingreso" : "Gasto"} de $${data.amount}`,
		});
	}

	const onDeleteLatestMovement = async () => {
		toast({
			variant: "success",
			title: "Movimiento borrado!",
			description: `Se eliminó tu último movimiento`,
		});
	};

	return (
		<div className="space-y-6">
			{/* Budget Overview*/}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-gray-600">Balance personal</CardTitle>
					</CardHeader>
					<CardContent>
						{loadingUser ? (
							<Loading></Loading>
						) : userBalance ? (
							// <div className="text-2xl font-bold">{formatToBalance(userBalance)} ARS</div>
							<div data-testid="user-balance" className="text-2xl font-bold">{formatToBalance(userBalance)}</div>
						) : (
							<div data-testid="user-balance" className="text-2xl font-bold">$0</div>
						)}
						<p className="text-sm text-gray-500">{allMovements.length} transacciones en el último mes</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<CardTitle className="text-sm font-medium text-gray-600">Presupuesto {getMonthName()}</CardTitle>
							<a href="/dashboard/presupuesto" className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1">
								Gestionar →
							</a>
						</div>
					</CardHeader>
					<CardContent>

						{budgetLoading ? (
							<Loading></Loading>
						) : monthlyBudget ? (
							<div>
								<div className="text-2xl font-bold mb-2">
									{formatToBalance(monthlyBudgetRemaining)} restante de {formatToBalance(monthlyBudget)}
								</div>
								<Progress value={progressPercentage} className="h-2 mb-4" />

								<div className="flex justify-between text-sm text-gray-500">
									<span>1 jul</span> {/* Mock start date */}

									<span>{progressPercentage.toFixed(0)}%</span>

									<span>31 jul</span> {/* Mock end date */}
								</div>
								<p className="text-sm text-gray-500 mt-2">
									Puede gastar {formatToBalance(dailySpendSuggestion)}/día para {daysRemaining} más días.
								</p>
							</div>
						) : (
							<div>
								<div className="text-2xl font-bold mb-2">
									Presupuesto mensual sin definir
								</div>
							</div>
						)}
					</CardContent>
				</Card>

			</div>


			<QuickSpendCard
				/**
				 * QuickSpendCard onAdd callback! useful for actions after movement
				 */
				onAdd={onAddMovement}
			/>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* History of last expenses */}
				<RecentExpenses onDeleteLatestMovement={onDeleteLatestMovement} />

				<SpendingChart movements={allMovements.filter(a => a.type === TxType.EXPENSE)} />

			</div>

		</div>
	)
}
