"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TxType } from "@/lib/schemas/definitions"
import { CategoryBudget } from "@/lib/schemas/category"
import { availableColors } from "@/lib/quick-spend-constants"
import { Button } from "../ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

export default function CategoryDonutChart({ budgetedCategories }: { budgetedCategories: CategoryBudget[] }) {
	const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
	const [viewType, setViewType] = useState<TxType.EXPENSE | TxType.INCOME>(TxType.EXPENSE)

	const filtered = budgetedCategories.filter((t) => t.type === viewType)
	const total = filtered.reduce((sum, t) => sum + t.totalExpenses, 0)

	const segments = budgetedCategories
		.filter(cat => cat.totalExpenses > 0)
		.map(cat => {
			const percentage = (cat.totalExpenses / total) * 100

			return {
				id: cat.id,
				name: cat.name,
				amount: cat.totalExpenses,
				percentage,
				budget: cat.budget,
				color: availableColors.find(c => c.id === cat.color)?.hex
			}
		})
		.sort((a, b) => b.amount - a.amount)

	const [expanded, setExpanded] = useState(false)
	const VISIBLE_COUNT = 5
	const visibleItems = expanded ? segments : segments.slice(0, VISIBLE_COUNT)

	const hasMore = segments.length > VISIBLE_COUNT


	// SVG donut math
	const size = 200
	const strokeWidth = 28
	const radius = (size - strokeWidth) / 2
	const circumference = 2 * Math.PI * radius
	const center = size / 2

	let cumulativePercentage = 0
	const arcs = segments.map((seg) => {
		const startPct = cumulativePercentage
		cumulativePercentage += seg.percentage
		const dashLength = (seg.percentage / 100) * circumference
		const dashOffset = circumference - (startPct / 100) * circumference
		return { ...seg, dashLength, dashOffset, startPct }
	})

	const hoveredSeg = hoveredCategory ? segments.find((s) => s.id === hoveredCategory) : null

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-base">
						{viewType === TxType.EXPENSE ? "Gastos" : "Ingresos"} por Categoria
					</CardTitle>
					<div className="flex rounded-lg border overflow-hidden">
						<button
							type="button"
							onClick={() => setViewType(TxType.EXPENSE)}
							className={cn(
								"px-3 py-1.5 text-xs font-medium transition-colors",
								viewType === TxType.EXPENSE
									? "bg-foreground text-background"
									: "bg-transparent text-muted-foreground hover:bg-muted",
							)}
						>
							Gastos
						</button>
						<button
							type="button"
							onClick={() => setViewType(TxType.INCOME)}
							className={cn(
								"px-3 py-1.5 text-xs font-medium transition-colors",
								viewType === TxType.INCOME
									? "bg-foreground text-background"
									: "bg-transparent text-muted-foreground hover:bg-muted",
							)}
						>
							Ingresos
						</button>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{total > 0 ? (
					<>
						{/* Donut Chart */}
						<div className="flex justify-center">
							<div className="relative" style={{ width: size, height: size }}>
								<svg width={size} height={size} className="-rotate-90">
									{/* Background circle */}
									<circle
										cx={center}
										cy={center}
										r={radius}
										fill="none"
										stroke="hsl(var(--muted))"
										strokeWidth={strokeWidth}
									/>
									{/* Category arcs */}
									{arcs.map((arc) => (
										<circle
											key={arc.id}
											cx={center}
											cy={center}
											r={radius}
											fill="none"
											stroke={arc.color}
											strokeWidth={strokeWidth}
											strokeDasharray={`${arc.dashLength} ${circumference - arc.dashLength}`}
											strokeDashoffset={arc.dashOffset}
											strokeLinecap="butt"
											className={cn(
												"transition-opacity duration-200 cursor-pointer",
												hoveredCategory && hoveredCategory !== arc.id ? "opacity-25" : "opacity-100",
											)}
											onMouseEnter={() => setHoveredCategory(arc.id)}
											onMouseLeave={() => setHoveredCategory(null)}
										/>
									))}
								</svg>

								{/* Center content */}
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="text-center">
										{hoveredSeg ? (
											<>
												<p className="text-xs text-muted-foreground">{hoveredSeg.name}</p>
												<p className="text-xl font-bold tabular-nums">${hoveredSeg.amount.toFixed(0)}</p>
												<p className="text-xs text-muted-foreground">{hoveredSeg.percentage.toFixed(0)}%</p>
											</>
										) : (
											<>
												<p className="text-xs text-muted-foreground">Total</p>
												<p className="text-xl font-bold tabular-nums">${total.toFixed(0)}</p>
												<p className="text-xs text-muted-foreground">
													{segments.length} {segments.length === 1 ? "categoria" : "categorias"}
												</p>
											</>
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Category table */}
						<div className="border-t pt-3">
							<div className="grid grid-cols-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pb-2 px-1">
								<span>Categoria</span>
								<span className="text-right">Gastado</span>
								<span className="text-right">
									{viewType === TxType.EXPENSE ? "Restante" : "% del Total"}
								</span>
							</div>

							<div className="space-y-0.5">
								{visibleItems.map((seg) => {
									const remaining = seg.budget > 0 ? seg.budget - seg.amount : 0
									const isOver = seg.budget > 0 && seg.amount > seg.budget

									return (
										<button
											key={seg.id}
											type="button"
											className={cn(
												"grid grid-cols-3 items-center w-full py-2 px-1 rounded-md text-left transition-all duration-200",
												hoveredCategory === seg.id ? "bg-muted" : "hover:bg-muted/50",
												hoveredCategory && hoveredCategory !== seg.id ? "opacity-40" : "opacity-100",
											)}
											onMouseEnter={() => setHoveredCategory(seg.id)}
											onMouseLeave={() => setHoveredCategory(null)}
										>
											<div className="flex items-center gap-2 min-w-0">
												<span
													className="w-2.5 h-2.5 rounded-full shrink-0"
													style={{ backgroundColor: seg.color }}
												/>
												<span className="text-sm font-medium truncate">{seg.name}</span>
											</div>
											<span className="text-sm tabular-nums text-right font-medium">
												${seg.amount.toFixed(0)}
											</span>
											<span className={cn(
												"text-sm tabular-nums text-right",
												viewType === TxType.EXPENSE
													? seg.budget > 0
														? isOver
															? "text-red-600 font-medium"
															: "text-muted-foreground"
														: "text-muted-foreground"
													: "text-muted-foreground",
											)}>
												{viewType === TxType.EXPENSE ? (
													seg.budget > 0 ? (
														isOver ? `-$${(seg.amount - seg.budget).toFixed(0)}` : `$${remaining.toFixed(0)}`
													) : (
														<span className="text-xs">--</span>
													)
												) : (
													`${seg.percentage.toFixed(0)}%`
												)}
											</span>
										</button>
									)
								})}
							</div>

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
											Ver {segments.length - VISIBLE_COUNT} mas <ChevronDown className="w-3.5 h-3.5" />
										</>
									)}
								</Button>
							)}
						</div>
					</>
				) : (
					<div className="text-center py-8 text-sm text-muted-foreground">
						No hay {viewType === TxType.EXPENSE ? "gastos" : "ingresos"} en este periodo
					</div>
				)}
			</CardContent>
		</Card>
	)
}
