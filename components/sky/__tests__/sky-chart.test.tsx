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

// ---------------------------------------------------------------------------------------------
// Moon mode
// ---------------------------------------------------------------------------------------------

import { moonAltAz } from "@/lib/astro/moon"
import { moonPassOnDay } from "@/lib/astro/moon-chart"

const CORDOBA_LOC = { lat: -31.42, lon: -64.18 }

function toMoon(date = "2026-10-02") {
	const view = setup(date)
	fireEvent.click(screen.getByRole("radio", { name: "Luna" }))
	return view
}

describe("SkyChart Sol / Luna switch", () => {
	test("starts on the Sun and switches with a radio group", () => {
		setup()
		const group = screen.getByRole("radiogroup", { name: "Astro" })
		expect(within(group).getByRole("radio", { name: "Sol" })).toHaveAttribute("aria-checked", "true")
		expect(within(group).getByRole("radio", { name: "Luna" })).toHaveAttribute("aria-checked", "false")
		fireEvent.click(within(group).getByRole("radio", { name: "Luna" }))
		expect(within(group).getByRole("radio", { name: "Luna" })).toHaveAttribute("aria-checked", "true")
		expect(within(group).getByRole("radio", { name: "Sol" })).toHaveAttribute("aria-checked", "false")
	})

	test("switching back restores the Sun chart", () => {
		toMoon()
		fireEvent.click(screen.getByRole("radio", { name: "Sol" }))
		expect(legendRow("21 de diciembre")).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Solsticio de junio" })).toBeInTheDocument()
	})

	test("the Sun-only date buttons go away in Moon mode, and the Moon-only ones appear there only", () => {
		setup()
		expect(screen.queryByRole("button", { name: "Próxima luna llena" })).not.toBeInTheDocument()
		fireEvent.click(screen.getByRole("radio", { name: "Luna" }))
		expect(screen.queryByRole("button", { name: "Solsticio de junio" })).not.toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Próxima luna llena" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Próxima luna nueva" })).toBeInTheDocument()
	})
})

describe("SkyChart Moon mode: the chart", () => {
	test("draws the five cycle curves in order, plus the chosen day's", () => {
		const { container } = toMoon()
		const ids = Array.from(container.querySelectorAll("path[data-curve]")).map((p) => p.getAttribute("data-curve"))
		expect(ids).toEqual(["extremo-sur", "cuarto-sur", "nodo", "cuarto-norte", "extremo-norte", "hoy"])
	})

	test("the legend lists the five moments and today, and no Sun rows", () => {
		toMoon()
		const table = screen.getByRole("table")
		expect(within(table).getAllByRole("row")).toHaveLength(1 + 5 + 1)
		expect(legendRow("Extremo sur del mes")).toBeInTheDocument()
		expect(legendRow("Cruce del ecuador")).toBeInTheDocument()
		expect(legendRow("Extremo norte del mes")).toBeInTheDocument()
		expect(within(table).queryByText(/21 de diciembre/)).not.toBeInTheDocument()
	})

	test("on 2 Oct 2026 (the day the original file collapsed) the five curves are different", () => {
		toMoon("2026-10-02")
		const south = legendRow("Extremo sur del mes").textContent as string
		const north = legendRow("Extremo norte del mes").textContent as string
		expect(south).not.toEqual(north)
		expect(south).toMatch(/-2[5-9],\d/)
		expect(north).toMatch(/2[5-9],\d/)
	})

	test("the legend's maximum altitudes follow the latitude", () => {
		toMoon()
		const altitude = () => {
			const cells = legendRow("Extremo norte del mes").querySelectorAll("td")
			return parseFloat((cells[3].textContent as string).replace(",", "."))
		}
		const inCordoba = altitude()
		type("Latitud", "40")
		expect(altitude()).toBeGreaterThan(inCordoba + 20)
	})
})

describe("SkyChart Moon mode: phase and status", () => {
	test("on the day of the August 2026 new moon it says Luna nueva, ~0% lit", () => {
		toMoon("2026-08-12")
		const status = screen.getByRole("status")
		expect(status).toHaveTextContent("Luna nueva")
		expect(status).toHaveTextContent("0%")
	})

	test("on the day of the March 2026 full moon it says Luna llena, ~100% lit", () => {
		toMoon("2026-03-03")
		const status = screen.getByRole("status")
		expect(status).toHaveTextContent("Luna llena")
		expect(status).toHaveTextContent("100%")
	})

	test("tells when the Moon rises and sets that day, in the clock of the chosen zone", () => {
		toMoon("2026-10-02")
		const { pass } = moonPassOnDay(CORDOBA_LOC, -3, 2026, 10, 2)
		expect(pass).not.toBeNull()
		expect(screen.getByRole("status")).toHaveTextContent(/La Luna sale a las \d\d:\d\d/)
		expect(screen.getByRole("status")).toHaveTextContent(/se pone a las \d\d:\d\d/)
	})

	test("describes the month's declination cycle with its dates", () => {
		toMoon("2026-10-02")
		expect(screen.getByRole("status")).toHaveTextContent(/extremo sur/i)
		expect(screen.getByRole("status")).toHaveTextContent(/extremo norte/i)
	})
})

describe("SkyChart Moon mode: next phase buttons", () => {
	test("Próxima luna llena jumps to 26 Oct 2026 at ~01:13 Argentina time (04:13 UTC)", () => {
		toMoon("2026-10-02")
		fireEvent.click(screen.getByRole("button", { name: "Próxima luna llena" }))
		expect(input("Fecha").value).toBe("2026-10-26")
		expect(Math.abs(Number(input("Hora del día").value) - 73)).toBeLessThanOrEqual(2)
	})

	test("Próxima luna nueva jumps to 10 Oct 2026 at ~12:50 Argentina time (15:50 UTC)", () => {
		toMoon("2026-10-02")
		fireEvent.click(screen.getByRole("button", { name: "Próxima luna nueva" }))
		expect(input("Fecha").value).toBe("2026-10-10")
		expect(Math.abs(Number(input("Hora del día").value) - 770)).toBeLessThanOrEqual(2)
	})
})

describe("SkyChart Moon mode: time of day", () => {
	test("at the Moon's culmination the readout gives its altitude, and when it is down it says so", () => {
		toMoon("2026-10-02")
		const { pass } = moonPassOnDay(CORDOBA_LOC, -3, 2026, 10, 2)
		const dayStart = Date.UTC(2026, 9, 2) + 3 * 3_600_000
		const transitMinute = Math.round(((pass as { transit: number }).transit - dayStart) / 60_000)
		fireEvent.change(input("Hora del día"), { target: { value: String(Math.min(1439, Math.max(0, transitMinute))) } })
		expect(screen.getByTestId("sun-readout")).toHaveTextContent(/la Luna está a/i)

		// find a minute where the Moon is clearly below the horizon
		let down = -1
		for (let m = 0; m < 1440; m += 10) {
			if (moonAltAz(CORDOBA_LOC, dayStart + m * 60_000).alt < -10) {
				down = m
				break
			}
		}
		expect(down).toBeGreaterThanOrEqual(0)
		fireEvent.change(input("Hora del día"), { target: { value: String(down) } })
		expect(screen.getByTestId("sun-readout")).toHaveTextContent(/La Luna está debajo del horizonte/i)
	})
})

describe("SkyChart Moon mode: extreme places", () => {
	test("at 80° N some curves have no moonrise or never set, and the legend says so without breaking", () => {
		toMoon("2026-10-02")
		type("Latitud", "80")
		const table = screen.getByRole("table")
		expect(within(table).getAllByRole("row")).toHaveLength(1 + 5 + 1)
		expect(table.textContent).toMatch(/No sale|Todo el día arriba/)
	})
})
