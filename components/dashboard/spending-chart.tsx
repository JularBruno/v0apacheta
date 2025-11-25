"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Movements } from "@/lib/schemas/movement"
import { formatToBalance } from "@/lib/quick-spend-constants"

const timeFilters = [
	{ id: "7d", label: "7 días", active: true },
	{ id: "30d", label: "30 días", active: false },
	// { id: "todo", label: "Todo", active: false },
]

export default function SpendingChart({
	movements, // ONLY expenses
}: {
	movements: Movements[]
}) {
	// dates for applying later in filters
	const now = new Date();
	const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
	const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

	// the actual time selected for filtering
	const [activeTimeFilter, setActiveTimeFilter] = useState("7d");

	// basic object for chart 
	const [movementsForChart, setMovementsForChart] = useState<{ date: string; amount: number }[]>([]);
	// Calculate max value for scaling chart
	const maxAmount = Math.max(...movementsForChart.map((d) => d.amount));

	// stats to display under the chart
	const [totalSpent, setTotalSpent] = useState(0);
	const [dailyAverage, setDailyAverage] = useState(0);

	/**
	 * Filter Movements
	 */


	// Fetch movements function (extract it so you can reuse)
	const filterMovements = async () => {

		let mockMovementsForChart: { date: string; amount: number }[] = []

		if (activeTimeFilter === "7d") {
			// Filter movements from the last 7 days
			const last7Days = movements.filter(m => new Date(m.createdAt) >= weekAgo);

			// Create a map to accumulate amounts by date
			const dailyTotals = new Map<string, number>();

			// sum for stats under chart
			let totalSum = 0;

			// Initialize all 7 days with 0
			for (let i = 6; i >= 0; i--) {
				const date = new Date();
				date.setDate(date.getDate() - i);
				const dateKey = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

				// - **Key**: string (date like "18 nov")
				// - **Value**: number (total amount for that day)
				dailyTotals.set(dateKey, 0);
			}

			// Sum up amounts for each day
			last7Days.forEach(movement => {
				// Format date day-month
				const dateKey = new Date(movement.createdAt).toLocaleDateString('es-ES', {
					day: 'numeric',
					month: 'short'
				});
				const currentAmount = dailyTotals.get(dateKey) || 0;
				totalSum += movement.amount; // sum
				dailyTotals.set(dateKey, currentAmount + movement.amount);
			});

			// Convert map to array format
			// this is the coolest way to behave with this, this destructures map like this { date: date, amount: amount }
			mockMovementsForChart = Array.from(dailyTotals.entries()).map(([date, amount]) => ({
				date,
				amount
			}));

			setTotalSpent(totalSum);
			// setDailyAverage(last7Days.length > 0 ? Math.round(totalSum / last7Days.length) : 0); // i cant decide if this is better
			setDailyAverage(last7Days.length > 0 ? Math.round(totalSum / 7) : 0);

			setMovementsForChart(mockMovementsForChart);
		}

		if (activeTimeFilter === "30d") {
			// Filter movements from the last  days
			const last30Days = movements.filter(m => new Date(m.createdAt) >= monthAgo);

			// Create a map to accumulate amounts by date
			const dailyTotals = new Map<string, number>();
			// sum for stats under chart
			let totalSum = 0;

			// Initialize all 30 days with 0
			for (let i = 29; i >= 0; i--) {
				const date = new Date();
				date.setDate(date.getDate() - i);
				const dateKey = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
				dailyTotals.set(dateKey, 0);
			}

			// Sum up amounts for each day
			last30Days.forEach(movement => {
				// Format date day-month
				const dateKey = new Date(movement.createdAt).toLocaleDateString('es-ES', {
					day: 'numeric',
					month: 'short'
				});
				const currentAmount = dailyTotals.get(dateKey) || 0;
				totalSum += movement.amount; // sum
				dailyTotals.set(dateKey, currentAmount + movement.amount);
			});

			// Convert map to array format
			mockMovementsForChart = Array.from(dailyTotals.entries()).map(([date, amount]) => ({
				date,
				amount
			}));

			setTotalSpent(totalSum);
			// setDailyAverage(last30Days.length > 0 ? Math.round(totalSum / last30Days.length) : 0); // i cant decide if this is better
			setDailyAverage(last30Days.length > 0 ? Math.round(totalSum / 30) : 0);

			setMovementsForChart(mockMovementsForChart);
		}
	};

	// Initial fetch of movements
	useEffect(() => {
		filterMovements();
	}, [movements, activeTimeFilter]);

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<CardTitle>Resumen de Gastos</CardTitle>

					{/* Filter Badges - Simplified */}
					<div className="flex gap-2">
						{timeFilters.map((filter) => (
							<Badge
								key={filter.id}
								variant={activeTimeFilter === filter.id ? "default" : "outline"}
								className={cn(
									"cursor-pointer transition-colors",
									activeTimeFilter === filter.id
										? "bg-primary-600 text-white hover:bg-primary-700"
										: "hover:bg-gray-100",
								)}
								onClick={() => setActiveTimeFilter(filter.id)}
							>
								{filter.label}
							</Badge>
						))}
					</div>
				</div>
			</CardHeader>

			<CardContent>
				{/* Simple Bar Chart */}
				<div className="space-y-6">
					{/* Chart Area */}
					<div className="h-64 bg-gray-50 rounded-lg p-4">
						<div className="h-full flex items-end justify-between gap-1">
							{movementsForChart.map((data, index) => (
								<div key={index} className="flex flex-col items-center flex-1 h-full">
									<div className="w-full flex items-end h-full">
										<div
											className="w-full bg-primary-500 rounded-t-sm transition-all duration-300 hover:bg-primary-600 min-h-[4px]"
											style={{
												height: `${(data.amount / maxAmount) * 100}%`,
											}}
											title={`${data.date}: $${data.amount}`}
										/>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* X-axis labels displaying first and last date*/}
					<div className="flex justify-between text-xs text-gray-500 px-4">
						<span>{movementsForChart[0]?.date}</span>
						{/* <span>{movementsForChart[Math.floor(mockData.length / 2)]?.date}</span> */}
						<span>{movementsForChart[movementsForChart.length - 1]?.date}</span>
					</div>

					{/* Summary Stats - Simplified to 2 */}
					<div className="grid grid-cols-2 gap-4 pt-4 border-t">
						<div className="text-center">
							<div className="text-2xl font-bold text-gray-900">{formatToBalance(totalSpent)}</div>
							<div className="text-sm text-gray-500">Total gastado</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-gray-900">{formatToBalance(dailyAverage)}</div>
							<div className="text-sm text-gray-500">Promedio diario</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
