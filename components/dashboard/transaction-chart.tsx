"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Movement, Movements } from "@/lib/schemas/movement"
import { useDashboard } from '@/app/dashboard/dashboardContext';
import { TxType } from "@/lib/schemas/definitions"
import { CategoryBudget } from "@/lib/schemas/category"
import { availableColors } from "@/lib/quick-spend-constants"

export default function TransactionChart({ budgetedCategories }: { budgetedCategories: CategoryBudget[] }) {
	const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

	const expenses = budgetedCategories.filter((t) => t.type === TxType.EXPENSE)
	const incomeTotalAllCats = budgetedCategories.filter((t) => t.type === TxType.INCOME).reduce((sum, t) => sum + t.totalExpenses, 0)
	const totalExpensesAllCats = expenses.reduce((sum, t) => sum + t.totalExpenses, 0)

	const segments = budgetedCategories
		.filter(cat => cat.totalExpenses > 0)
		.map(cat => {
			const percentage = (cat.totalExpenses / totalExpensesAllCats) * 100
			return {
				id: cat.id,
				name: cat.name,
				amount: cat.totalExpenses,
				percentage,
				color: availableColors.find(c => c.id === cat.color)?.hex
			}
		})
		.sort((a, b) => b.amount - a.amount)

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-base">Resumen de Gastos</CardTitle>
					<div className="text-right">
						<p className="text-lg font-bold tabular-nums">${totalExpensesAllCats.toFixed(0)}</p>
						<p className="text-xs text-muted-foreground">gastado</p>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Single multi-color bar */}
				{totalExpensesAllCats > 0 ? (
					<div className="space-y-3">
						<div className="flex h-4 w-full overflow-hidden rounded-full bg-gray-100">
							{segments.map((seg) => (
								<div
									key={seg.id}
									className={cn(
										"h-full transition-opacity duration-200",
										hoveredCategory && hoveredCategory !== seg.id ? "opacity-30" : "opacity-100",
									)}
									style={{
										width: `${seg.percentage}%`,
										backgroundColor: seg.color,
										minWidth: seg.percentage > 0 ? "3px" : "0",
									}}
									onMouseEnter={() => setHoveredCategory(seg.id)}
									onMouseLeave={() => setHoveredCategory(null)}
								/>
							))}
						</div>

						{/* Hovered detail */}
						{/* {hoveredCategory && (
							<div className="text-center text-sm text-muted-foreground">
								{segments.find((s) => s.id === hoveredCategory)?.name}:{" "}
								<span className="font-semibold text-foreground">
									${segments.find((s) => s.id === hoveredCategory)?.amount.toFixed(0)}
								</span>{" "}
								({segments.find((s) => s.id === hoveredCategory)?.percentage.toFixed(0)}%)
							</div>
						)} */}

						{/* Legend */}
						<div className="flex flex-wrap gap-x-4 gap-y-1.5">
							{segments.map((seg) => (
								<button
									key={seg.id}
									type="button"
									className={cn(
										"flex items-center gap-1.5 text-xs transition-opacity duration-200 cursor-pointer",
										hoveredCategory && hoveredCategory !== seg.id ? "opacity-40" : "opacity-100",
									)}
									onMouseEnter={() => setHoveredCategory(seg.id)}
									onMouseLeave={() => setHoveredCategory(null)}
								>
									<span
										className="w-2.5 h-2.5 rounded-full shrink-0"
										style={{ backgroundColor: seg.color }}
									/>
									<span className="text-muted-foreground">{seg.name}</span>
									<span className="font-medium tabular-nums">${seg.amount.toFixed(0)}</span>
								</button>
							))}
						</div>

						{/* Income vs Expense summary */}
						{incomeTotalAllCats > 0 && (
							<div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
								<span>
									Ingresos: <span className="font-semibold text-emerald-600">${incomeTotalAllCats.toFixed(0)}</span>
								</span>
								<span>
									Balance:{" "}
									<span className={cn("font-semibold", incomeTotalAllCats - totalExpensesAllCats >= 0 ? "text-emerald-600" : "text-red-600")}>
										{incomeTotalAllCats - totalExpensesAllCats >= 0 ? "+" : ""}${(incomeTotalAllCats - totalExpensesAllCats).toFixed(0)}
									</span>
								</span>
							</div>
						)}
					</div>
				) : (
					<div className="text-center py-4 text-sm text-muted-foreground">
						No hay gastos en este periodo
					</div>
				)}
			</CardContent>
		</Card>
	)
}
