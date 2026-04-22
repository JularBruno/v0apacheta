"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { quickFilters } from "@/lib/quick-spend-constants"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const MONTHS = [
	"Enero",
	"Febrero",
	"Marzo",
	"Abril",
	"Mayo",
	"Junio",
	"Julio",
	"Agosto",
	"Septiembre",
	"Octubre",
	"Noviembre",
	"Diciembre",
]

interface PeriodSelectorProps {
	selected: string
	onSelect: (periodId: string) => void
}

export function PeriodSelector({ selected, onSelect }: PeriodSelectorProps) {
	const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

	const monthId = (monthIndex: number) => `month-${monthIndex}-${currentYear}`
	const isCurrentYear = currentYear === new Date().getFullYear()
	const currentMonth = new Date().getMonth()

	return (
		<div className="space-y-3">
			{/* Quick filters */}
			<div className="flex gap-2 flex-wrap">
				{quickFilters.map((filter) => (
					<Button
						key={filter.id}
						variant={selected === filter.id ? "default" : "outline"}
						size="sm"
						onClick={() => onSelect(filter.id)}
						className="text-xs"
					>
						{filter.label}
					</Button>
				))}
			</div>

			{/* Calendar grid */}
			<Card className="p-4">
				<div className="flex items-center justify-between mb-4">
					<h3 className="font-semibold text-sm">{currentYear}</h3>
					<div className="flex gap-2">
						<Button variant="ghost" size="sm" onClick={() => setCurrentYear(currentYear - 1)}>
							<ChevronLeft className="w-4 h-4" />
						</Button>
						<Button variant="ghost" size="sm" onClick={() => setCurrentYear(currentYear + 1)}>
							<ChevronRight className="w-4 h-4" />
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
					{MONTHS.map((month, index) => {
						const id = monthId(index)
						const isCurrent = isCurrentYear && index === currentMonth
						const isSelected = selected === id

						return (
							<Button
								key={id}
								variant={isSelected ? "default" : isCurrent ? "outline" : "ghost"}
								size="sm"
								onClick={() => onSelect(id)}
								className={cn("text-xs h-10", isCurrent && !isSelected && "border-2 border-primary")}
							>
								{month.slice(0, 3)}
							</Button>
						)
					})}
				</div>
			</Card>
		</div>
	)
}
