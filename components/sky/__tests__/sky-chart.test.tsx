import { act, fireEvent, render, screen, within } from "@testing-library/react"
import SkyChart from "@/components/sky/sky-chart"

const DEC_21 = "2026-12-21"

function setup(initialDate = DEC_21) {
	return render(<SkyChart initialDate={initialDate} syncToNow={false} />)
}

const input = (name: RegExp | string) => screen.getByLabelText(name) as HTMLInputElement
const type = (name: RegExp | string, value: string) => fireEvent.change(input(name), { target: { value } })

function legendRow(text: string): HTMLElement {
	const table = screen.getByRole("table")
	const row = within(table)
		.getAllByRole("row")
		.find((r) => r.textContent?.includes(text))
	if (!row) throw new Error(`no legend row containing "${text}"`)
	return row
}

describe("SkyChart defaults (Córdoba)", () => {
	test("renders an accessible chart and starts centred on Córdoba, Argentina time", () => {
		setup()
		expect(screen.getByRole("img", { name: /mapa del cielo/i })).toBeInTheDocument()
		expect(input("Latitud").value).toBe("-31.42")
		expect(input("Longitud").value).toBe("-64.18")
		expect(input(/Huso horario/i).value).toBe("-3")
		expect(input("Fecha").value).toBe(DEC_21)
	})

	test("the legend has the 7 reference curves plus today, with Córdoba's textbook maximum altitudes", () => {
		setup()
		const table = screen.getByRole("table")
		expect(within(table).getAllByRole("row")).toHaveLength(1 + 7 + 1)
		expect(legendRow("21 de diciembre").textContent).toContain("82,0°")
		expect(legendRow("Equinoccios").textContent).toContain("58,6°")
		expect(legendRow("21 de junio").textContent).toContain("35,1°")
	})

	test("draws one path per reference curve plus today's", () => {
		const { container } = setup()
		expect(container.querySelectorAll("path[data-curve]")).toHaveLength(8)
		expect(container.querySelectorAll('path[data-curve="hoy"]')).toHaveLength(1)
	})

	test("the status summarises the day: place, solar noon, sunrise and sunset directions, day length", () => {
		setup()
		const status = screen.getByRole("status")
		expect(status).toHaveTextContent("Córdoba, Argentina")
		expect(status).toHaveTextContent("13:15")
		expect(status).toHaveTextContent("SE")
		expect(status).toHaveTextContent("14 h 12 min")
	})
})

describe("SkyChart date", () => {
	test("changing the date recomputes the day", () => {
		setup()
		type("Fecha", "2026-06-21")
		expect(screen.getByRole("status")).toHaveTextContent("10 h")
		expect(screen.getByRole("status")).toHaveTextContent("NE")
	})

	test("a cleared or invalid date is ignored and keeps the last good one", () => {
		setup()
		type("Fecha", "")
		expect(input("Fecha").value).toBe(DEC_21)
	})

	test("quick buttons jump to the solstices and equinoxes of the selected year", () => {
		setup()
		fireEvent.click(screen.getByRole("button", { name: "Solsticio de junio" }))
		expect(input("Fecha").value).toBe("2026-06-21")
		fireEvent.click(screen.getByRole("button", { name: "Equinoccio de septiembre" }))
		expect(input("Fecha").value).toBe("2026-09-23")
		fireEvent.click(screen.getByRole("button", { name: "Equinoccio de marzo" }))
		expect(input("Fecha").value).toBe("2026-03-20")
		fireEvent.click(screen.getByRole("button", { name: "Solsticio de diciembre" }))
		expect(input("Fecha").value).toBe("2026-12-21")
	})
})

describe("SkyChart coordinates", () => {
	test("typing other coordinates (dot or comma) recalculates everything", () => {
		setup()
		type("Latitud", "40,4")
		type("Longitud", "-3.7")
		type(/Huso horario/i, "1")
		expect(legendRow("Equinoccios").textContent).toContain("49,6°")
		expect(screen.getByRole("status")).toHaveTextContent("40,4° N, 3,7° O")
	})

	test("an invalid value shows an alert, marks the field and keeps the last good result", () => {
		setup()
		type("Latitud", "abc")
		expect(screen.getByRole("alert")).toHaveTextContent(/latitud/i)
		expect(input("Latitud")).toHaveAttribute("aria-invalid", "true")
		expect(legendRow("Equinoccios").textContent).toContain("58,6°")
		type("Latitud", "95")
		expect(screen.getByRole("alert")).toHaveTextContent(/-90.*90/)
		type("Latitud", "-31.42")
		expect(screen.queryByRole("alert")).not.toBeInTheDocument()
		expect(input("Latitud")).not.toHaveAttribute("aria-invalid", "true")
	})

	test("longitude and time zone are validated too", () => {
		setup()
		type("Longitud", "200")
		expect(screen.getByRole("alert")).toHaveTextContent(/longitud/i)
		type("Longitud", "-64.18")
		type(/Huso horario/i, "20")
		expect(screen.getByRole("alert")).toHaveTextContent(/huso/i)
	})

	test("far north in June there is midnight Sun, in December polar night, and the legend says so", () => {
		setup("2026-06-21")
		type("Latitud", "80")
		expect(screen.getByRole("status")).toHaveTextContent(/Sol de medianoche/)
		expect(legendRow("HOY").textContent).toContain("24 h 00 min")
		type("Fecha", "2026-12-21")
		expect(screen.getByRole("status")).toHaveTextContent(/Noche polar/)
	})

	test("polar night draws no curve for today", () => {
		const { container } = setup("2026-12-21")
		type("Latitud", "80")
		expect(container.querySelectorAll('path[data-curve="hoy"]')).toHaveLength(0)
	})

	test("the reset button brings Córdoba back", () => {
		setup()
		type("Latitud", "10")
		type("Longitud", "20")
		type(/Huso horario/i, "2")
		fireEvent.click(screen.getByRole("button", { name: "Volver a Córdoba" }))
		expect(input("Latitud").value).toBe("-31.42")
		expect(input("Longitud").value).toBe("-64.18")
		expect(input(/Huso horario/i).value).toBe("-3")
		expect(screen.queryByRole("alert")).not.toBeInTheDocument()
	})
})

describe("SkyChart time of day", () => {
	test("at solar noon in December the Sun is almost overhead, to the north", () => {
		setup()
		fireEvent.change(input("Hora del día"), { target: { value: String(13 * 60 + 15) } })
		const readout = screen.getByTestId("sun-readout")
		expect(readout).toHaveTextContent("13:15")
		expect(readout).toHaveTextContent("82")
		expect(readout).toHaveTextContent("N")
	})

	test("at night it says the Sun is below the horizon", () => {
		setup()
		fireEvent.change(input("Hora del día"), { target: { value: String(3 * 60) } })
		expect(screen.getByTestId("sun-readout")).toHaveTextContent(/debajo del horizonte/i)
	})
})

describe("SkyChart play", () => {
	beforeEach(() => jest.useFakeTimers())
	afterEach(() => jest.useRealTimers())

	test("plays the day: the slider advances, and pausing stops it", () => {
		setup()
		const slider = input("Hora del día")
		const start = slider.value
		const play = screen.getByRole("button", { name: "Reproducir" })
		expect(play).toHaveAttribute("aria-pressed", "false")
		fireEvent.click(play)
		expect(screen.getByRole("button", { name: "Pausar" })).toHaveAttribute("aria-pressed", "true")
		act(() => {
			jest.advanceTimersByTime(1000)
		})
		expect(slider.value).not.toBe(start)
		fireEvent.click(screen.getByRole("button", { name: "Pausar" }))
		const paused = slider.value
		act(() => {
			jest.advanceTimersByTime(1000)
		})
		expect(slider.value).toBe(paused)
	})

	test("the day loops around midnight instead of running out", () => {
		setup()
		fireEvent.change(input("Hora del día"), { target: { value: "1438" } })
		fireEvent.click(screen.getByRole("button", { name: "Reproducir" }))
		act(() => {
			jest.advanceTimersByTime(500)
		})
		expect(Number(input("Hora del día").value)).toBeLessThan(1439)
		expect(Number(input("Hora del día").value)).toBeGreaterThanOrEqual(0)
	})
})

describe("SkyChart syncToNow", () => {
	beforeEach(() => jest.useFakeTimers({ now: new Date("2026-10-02T15:00:00Z") }))
	afterEach(() => jest.useRealTimers())

	test("after mounting it shows today's date and time at the chosen location's clock (UTC-3: 12:00)", () => {
		render(<SkyChart initialDate="2020-01-01" />)
		expect(input("Fecha").value).toBe("2026-10-02")
		expect(input("Hora del día").value).toBe(String(12 * 60))
	})

	test("late at night in Córdoba it is still today's date there (22:30 ART is 01:30 UTC of the next day)", () => {
		jest.setSystemTime(new Date("2026-10-03T01:30:00Z"))
		render(<SkyChart initialDate="2020-01-01" />)
		expect(input("Fecha").value).toBe("2026-10-02")
		expect(input("Hora del día").value).toBe(String(22 * 60 + 30))
	})
})
