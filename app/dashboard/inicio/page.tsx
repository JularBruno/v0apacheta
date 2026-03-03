"use client"

import { useEffect, useState } from 'react';

import { getMovementsByUserAndFilter, deleteMovement } from "@/lib/actions/movements"
import { Movement, Movements } from "@/lib/schemas/movement"
import { TxType } from "@/lib/schemas/definitions";

import { formatToBalance } from "@/lib/quick-spend-constants"
import { getCurrentDateTimeInfo, getCurrentMonthRange, getDateStringsForFilter, getDaysRemainingInMonth, getLastNMonths, getMonthName } from "@/lib/dateUtils"
import { useDashboard } from '@/app/dashboard/dashboardContext';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loading } from "@/components/ui/loading"
import { toast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress" // Import Progress component
import SpendingChart from "@/components/dashboard/spending-chart"
import RecentExpenses from "@/components/dashboard/recent-expenses"
import QuickSpendCard from "@/components/transactions/quick-spend-card"

export default function InicioPage() {

	const { user, userBalance, setUserBalance, loadingUser, error, cats, setCats, loadingCats, loadingTags, budgetedCats, loadingBudgetedCats } = useDashboard();

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

	// used in childs
	const [allMovements, setAllMovements] = useState<Movements[]>([]);

	// Five last movements and amount to use in quick history
	const [movements, setMovements] = useState<Movements[]>([]);
	const [lastFiveAmount, setlastFiveAmount] = useState<number>(0);
	const [loadingMovements, setLoadingMovements] = useState(true);

	/**
	 * Fetch Movements
	 */

	// Fetch movements function (extract it so you can reuse)
	const fetchMovements = async () => {

		try {
			const filters: any = {};

			// last month (30 days ago to now)
			const { start, end } = getLastNMonths(1);
			const result = getDateStringsForFilter(start, end);
			filters.startDate = result.startDate;
			filters.endDate = result.endDate;

			const movements = await getMovementsByUserAndFilter(filters);

			const sortedMovements = movements.sort(
				(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);

			setAllMovements(sortedMovements);

			const lastFive = sortedMovements.slice(0, 5); // First 5 (most recent)
			const lastFiveAmount = lastFive.reduce((sum, item) => {

				if (item.type === TxType.EXPENSE) {
					return sum + item.amount;
				}
				return sum;
			}, 0);

			setMovements(lastFive);
			setlastFiveAmount(lastFiveAmount);

			setLoadingMovements(false);
		} catch (error) {
			// console.error('Failed to fetch movements:', error);
			return error;
		}
	};

	// Initial fetch of movements
	useEffect(() => {
		fetchMovements();
	}, []);

	/**
	 * On balance update add or remove balance, to not call api again
	 */
	const onBalanceUpdate = async (data: Movement, isDelete: boolean) => {
		let newBalance = 0;

		// Update balance immediately 
		if (isDelete) { // If is updated on delete should change the values contrary as a normal movement
			newBalance = data.type === TxType.INCOME
				? userBalance - data.amount
				: userBalance + data.amount;
		} else {
			newBalance = data.type === TxType.INCOME
				? userBalance + data.amount
				: userBalance - data.amount;
		}

		setUserBalance(newBalance);
	}

	/**
	 * After adding movement
	 */
	const onAddMovement = async (data: Movement) => {
		// Update balance immediately
		onBalanceUpdate(data, false);

		// Refetch movements to get populated data
		await fetchMovements();

		toast({
			variant: "success",
			title: "Movimiento realizado!",
			description: `Se realizó tu ${data.type === TxType.INCOME ? "Ingreso" : "Gasto"} de $${data.amount}`,
		});
	}

	/**
	 * Delete latest movement based on array last item id
	 */
	const deleteLatestMovement = async () => {
		setLoadingMovements(true);

		const last = movements[0];
		if (last) {
			deleteMovement(last.id);
			onBalanceUpdate(last, true);
		}

		// Refetch movements to get populated data
		await fetchMovements();

		toast({
			variant: "success",
			title: "Movimiento borrado!",
			description: `Se eliminó tu último movimiento`,
		});
		setLoadingMovements(false);
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
							<div className="text-2xl font-bold">{formatToBalance(userBalance)} ARS</div>
						) : (
							<div className="text-2xl font-bold">$0 ARS</div>
						)}
						<p className="text-sm text-gray-500">{allMovements.length} transacciones en el último mes</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-gray-600">Presupuesto {getMonthName()}</CardTitle>
					</CardHeader>
					<CardContent>

						{loadingBudgetedCats ? (
							<Loading></Loading>
						) : (
							<div>
								<div className="text-2xl font-bold mb-2">
									${monthlyBudgetRemaining.toFixed(2)} restante de ${monthlyBudget.toFixed(2)}
								</div>
								<Progress value={progressPercentage} className="h-2 mb-4" />

								<div className="flex justify-between text-sm text-gray-500">
									<span>1 jul</span> {/* Mock start date */}

									<span>{progressPercentage.toFixed(0)}%</span>

									<span>31 jul</span> {/* Mock end date */}
								</div>
								<p className="text-sm text-gray-500 mt-2">
									Puede gastar ${dailySpendSuggestion.toFixed(2)}/día para {daysRemaining} más días.
								</p>
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
				<RecentExpenses loading={loadingMovements} cats={cats} movements={movements} lastFiveAmount={lastFiveAmount} deleteLatestMovement={deleteLatestMovement} />

				<SpendingChart movements={allMovements.filter(a => a.type === TxType.EXPENSE)} />

			</div>

		</div>
	)
}
