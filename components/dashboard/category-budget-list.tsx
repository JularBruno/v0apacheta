"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CategoryBudget } from "@/lib/schemas/category"
import { availableColors } from "@/lib/quick-spend-constants"

export default function CategoryBudgetList({ budgetedCategories }: { budgetedCategories: CategoryBudget[] }) {
	const [expanded, setExpanded] = useState(false)
	const VISIBLE_COUNT = 5

	// const expenses = budgetedCategories.filter((t) => t.type === TxType.EXPENSE)

	const categoryTotals = budgetedCategories.reduce(
		(acc, t) => {
			acc[t.id] = (acc[t.id] || 0) + t.totalExpenses
			return acc
		},
		{} as Record<string, number>,
	)

	const totalBudget = budgetedCategories
		.filter((c) => c.id !== "all" && c.budget > 0)
		.reduce((sum, c) => sum + c.budget, 0)
	const totalSpent = Object.values(categoryTotals).reduce((sum, a) => sum + a, 0)

	const items = budgetedCategories
		.filter((c) => c.id !== "all" && (c.budget > 0 || categoryTotals[c.id]))
		.map((cat) => {
			const spent = categoryTotals[cat.id] || 0
			const budget = cat.budget
			const percentage = budget > 0 ? (spent / budget) * 100 : 0
			return {
				id: cat.id,
				name: cat.name,
				spent,
				budget,
				percentage,
				color: availableColors.find(c => c.id === cat.color)?.hex

			}
		})
		.sort((a, b) => b.spent - a.spent)

	const visibleItems = expanded ? items : items.slice(0, VISIBLE_COUNT)
	const hasMore = items.length > VISIBLE_COUNT

	const getBarColor = (pct: number) => {
		if (pct > 100) return "bg-red-500"
		if (pct > 90) return "bg-red-400"
		if (pct > 75) return "bg-orange-400"
		if (pct > 50) return "bg-amber-400"
		if (pct > 25) return "bg-emerald-400"
		return "bg-green-400"
	}

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-base">Presupuesto por Categoria</CardTitle>
					<div className="text-right">
						<p className="text-lg font-bold tabular-nums">${totalSpent.toFixed(0)}</p>
						<p className="text-xs text-muted-foreground">de ${totalBudget.toFixed(0)}</p>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-1">
				{items.length > 0 ? (
					<>
						{visibleItems.map((item) => (
							<div key={item.id} className="flex items-center gap-3 py-2">
								{/* Color dot */}
								<span
									className="w-3 h-3 rounded-full shrink-0"
									style={{ backgroundColor: item.color }}
								/>

								{/* Name + bar */}
								<div className="flex-1 min-w-0">
									<div className="flex items-center justify-between mb-1">
										<span className="text-sm font-medium truncate">{item.name}</span>
										<div className="flex items-center gap-2 shrink-0 ml-2">
											<span className="text-sm tabular-nums font-semibold">${item.spent.toFixed(0)}</span>
											{item.budget > 0 && (
												<span className="text-xs text-muted-foreground tabular-nums">/ ${item.budget.toFixed(0)}</span>
											)}
										</div>
									</div>

									{/* Progress bar */}
									{item.budget > 0 ? (
										<div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
											<div
												className={cn("h-full rounded-full transition-all duration-300", getBarColor(item.percentage))}
												style={{ width: `${Math.min(100, item.percentage)}%` }}
											/>
										</div>
									) : (
										<div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
											<div className="h-full rounded-full bg-gray-300 w-full" />
										</div>
									)}

									{/* Percentage / status */}
									<div className="flex items-center justify-between mt-1">
										<span
											className={cn(
												"text-[11px] font-medium",
												item.percentage > 100
													? "text-red-600"
													: item.percentage > 75
														? "text-orange-600"
														: "text-muted-foreground",
											)}
										>
											{item.budget > 0 ? `${item.percentage.toFixed(0)}% usado` : "Sin presupuesto"}
										</span>
										{item.budget > 0 && (
											<span
												className={cn(
													"text-[11px]",
													item.spent > item.budget ? "text-red-600 font-medium" : "text-muted-foreground",
												)}
											>
												{item.spent > item.budget
													? `-$${(item.spent - item.budget).toFixed(0)} excedido`
													: `$${(item.budget - item.spent).toFixed(0)} restante`}
											</span>
										)}
									</div>
								</div>
							</div>
						))}

						{/* Expand / Collapse */}
						{hasMore && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setExpanded(!expanded)}
								className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground gap-1"
							>
								{expanded ? (
									<>
										Ver menos <ChevronUp className="w-3.5 h-3.5" />
									</>
								) : (
									<>
										Ver {items.length - VISIBLE_COUNT} mas <ChevronDown className="w-3.5 h-3.5" />
									</>
								)}
							</Button>
						)}
					</>
				) : (
					<div className="text-center py-4 text-sm text-muted-foreground">
						No hay gastos en este periodo
					</div>
				)}
			</CardContent>
		</Card>
	)
}
