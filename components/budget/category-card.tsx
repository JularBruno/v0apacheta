"use client"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import IconComponent from "@/components/movements/icon-component"
import { formatToBalance } from "@/lib/quick-spend-constants"
import { BalanceInput } from "@/components/balance-input/balance-input-mock"

import React, { useRef } from "react";

export default function CategoryCard({ category, updateCategoryBudget, percentageUsed, isOverBudget, getProgressColor }: any) {

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
					<span className={cn(
						"text-xs font-semibold",
						percentageUsed > 100 ? "text-red-600" :
							percentageUsed > 75 ? "text-orange-600" :
								percentageUsed > 50 ? "text-amber-600" :
									"text-emerald-600"
					)}>
						{category.budget === 0
							? "Presupuesto no definido"
							: `${percentageUsed.toFixed(0)}% usado`}
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
}