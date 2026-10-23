"use client"

import { CalendarDays, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ActiveFiltersProps {
	periodLabel: string
	onPeriodClick: () => void
	searchTerm?: string
	onClearSearch: () => void
	category?: { name: string; color?: string }
	onClearCategory: () => void
	typeLabel?: string
	onClearType: () => void
	onClearAll: () => void
}

const chipClass = "inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-900 shadow-sm"

/** Always-visible summary of the filters applied to a movements list, even with the filter panel collapsed. */
export function ActiveFilters({
	periodLabel,
	onPeriodClick,
	searchTerm,
	onClearSearch,
	category,
	onClearCategory,
	typeLabel,
	onClearType,
	onClearAll,
}: ActiveFiltersProps) {
	const removable = [
		searchTerm ? { key: "search", label: `Búsqueda: ${searchTerm}`, onClear: onClearSearch } : null,
		category ? { key: "category", label: category.name, color: category.color, onClear: onClearCategory } : null,
		typeLabel ? { key: "type", label: typeLabel, onClear: onClearType } : null,
	].filter((chip): chip is NonNullable<typeof chip> => chip !== null)

	return (
		<div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Filtros aplicados">
			<span className="text-sm font-semibold text-gray-700">Mostrando:</span>
			<button type="button" onClick={onPeriodClick} className={cn(chipClass, "border-primary bg-primary/10 hover:bg-primary/20")}>
				<CalendarDays className="h-4 w-4" />
				{periodLabel}
			</button>

			{removable.map((chip) => (
				<span key={chip.key} className={chipClass}>
					{"color" in chip && chip.color && <span className={cn("h-3 w-3 rounded-full", chip.color)} />}
					<span className="max-w-[14rem] truncate">{chip.label}</span>
					<button type="button" onClick={chip.onClear} aria-label={`Quitar filtro ${chip.label}`} className="-mr-1 rounded-full p-1 hover:bg-gray-200">
						<X className="h-4 w-4" />
					</button>
				</span>
			))}

			{removable.length > 0 && (
				<Button variant="ghost" size="sm" onClick={onClearAll} className="h-9 px-3 text-sm">
					Limpiar
				</Button>
			)}
		</div>
	)
}
