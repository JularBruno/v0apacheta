"use client"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import IconComponent from "@/components/movements/icon-component"
import { formatToBalance } from "@/lib/quick-spend-constants"
import { BalanceInput } from "@/components/balance-input/balance-input-mock"
import { budgetTone, type BudgetKind } from "@/lib/budget/progress-tone"
import { TONE_CLASSES } from "@/components/budget/tone-classes"

import React, { useRef } from "react";

export default function CategoryCard({ category, kind, updateCategoryBudget }: { category: any; kind: BudgetKind; updateCategoryBudget: (id: string, value: number) => void }) {
	const { tone, percent, overPercent } = budgetTone(kind, category.totalExpenses, category.budget)
	const { bar, text } = TONE_CLASSES[tone]
	const isOverBudget = tone === "over"
	// income past its goal: more came in than expected
	const isAboveGoal = kind === "income" && category.totalExpenses > category.budget && category.budget > 0

	return (
		<div className="space-y-2">

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
					<span className={cn("text-xs font-semibold", text)}>
						{category.budget === 0
							? "Presupuesto no definido"
							: `${percent.toFixed(0)}% usado`}
					</span>
					<span className={cn("text-xs", isOverBudget ? "font-medium text-red-600" : isAboveGoal ? "font-medium text-emerald-600" : "text-gray-400")}>
						{/* no budget but money spent: same quiet "excedido" as before, not a negative "restante" */}
						{isOverBudget || (category.budget === 0 && category.totalExpenses > 0)
							? `-$${(category.totalExpenses - category.budget).toFixed(2)} excedido`
							: isAboveGoal
								? `+$${(category.totalExpenses - category.budget).toFixed(2)} sobre lo esperado`
								: `$${(category.budget - category.totalExpenses).toFixed(2)} restante`
						}
					</span>
				</div>

				{/* Row 3: Progress bar (capped at 100; past it, the "+N%" says by how much) */}
				<div className="flex items-center gap-2">
					<Progress
						value={Math.min(100, percent)}
						className={cn("h-3 flex-1 rounded-full", bar)}
					/>
					{isOverBudget && (
						<span className="shrink-0 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
							+{overPercent}%
						</span>
					)}
				</div>
			</div>
		</div>
	)
}