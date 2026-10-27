import { render, screen, fireEvent } from "@testing-library/react"
import { ActiveFilters } from "@/components/movements/active-filters"

const noop = () => {}
const base = {
	periodLabel: "Últimos 6 meses",
	onPeriodClick: noop,
	onClearSearch: noop,
	onClearCategory: noop,
	onClearType: noop,
	onClearAll: noop,
}

describe("ActiveFilters", () => {
	it("always shows the period and no clear button when nothing else is active", () => {
		render(<ActiveFilters {...base} />)
		expect(screen.getByText("Últimos 6 meses")).toBeTruthy()
		expect(screen.queryByText("Limpiar")).toBeNull()
	})

	it("opens the filters when the period chip is clicked", () => {
		const onPeriodClick = jest.fn()
		render(<ActiveFilters {...base} onPeriodClick={onPeriodClick} />)
		fireEvent.click(screen.getByText("Últimos 6 meses"))
		expect(onPeriodClick).toHaveBeenCalled()
	})

	it("shows search, category and type chips, each removable on its own", () => {
		const onClearSearch = jest.fn()
		const onClearCategory = jest.fn()
		const onClearType = jest.fn()
		render(
			<ActiveFilters
				{...base}
				searchTerm="alquiler"
				onClearSearch={onClearSearch}
				category={{ name: "Hogar", color: "bg-blue-500" }}
				onClearCategory={onClearCategory}
				typeLabel="Gastos"
				onClearType={onClearType}
			/>
		)
		expect(screen.getByText("Búsqueda: alquiler")).toBeTruthy()
		fireEvent.click(screen.getByLabelText("Quitar filtro Búsqueda: alquiler"))
		fireEvent.click(screen.getByLabelText("Quitar filtro Hogar"))
		fireEvent.click(screen.getByLabelText("Quitar filtro Gastos"))
		expect(onClearSearch).toHaveBeenCalled()
		expect(onClearCategory).toHaveBeenCalled()
		expect(onClearType).toHaveBeenCalled()
	})

	it("clears everything from the Limpiar button", () => {
		const onClearAll = jest.fn()
		render(<ActiveFilters {...base} typeLabel="Ingresos" onClearAll={onClearAll} />)
		fireEvent.click(screen.getByText("Limpiar"))
		expect(onClearAll).toHaveBeenCalled()
	})
})
