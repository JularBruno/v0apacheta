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

describe("SkyChart pinned to one body (the post shows a Sun chart and a Moon chart, each in its own section)", () => {
	test("fixedBody=luna starts in Moon mode, with no Sol/Luna switch", () => {
		const { container } = render(<SkyChart initialDate="2026-10-02" syncToNow={false} fixedBody="luna" />)
		expect(screen.queryByRole("radiogroup", { name: "Astro" })).not.toBeInTheDocument()
		expect(container.querySelectorAll('path[data-curve="extremo-sur"]')).toHaveLength(1)
		expect(legendRow("Extremo norte del mes")).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Próxima luna llena" })).toBeInTheDocument()
		expect(screen.getByRole("region", { name: /Mapa de la Luna/ })).toBeInTheDocument()
	})

	test("fixedBody=sol is the Sun chart, with no switch and no Moon controls", () => {
		render(<SkyChart initialDate={DEC_21} syncToNow={false} fixedBody="sol" />)
		expect(screen.queryByRole("radiogroup", { name: "Astro" })).not.toBeInTheDocument()
		expect(legendRow("21 de diciembre")).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: "Próxima luna llena" })).not.toBeInTheDocument()
		expect(screen.getByRole("region", { name: /Mapa del Sol/ })).toBeInTheDocument()
	})

	test("two charts on one page do not clash: unique field ids and independent state", () => {
		render(
			<>
				<SkyChart initialDate={DEC_21} syncToNow={false} fixedBody="sol" />
				<SkyChart initialDate="2026-10-02" syncToNow={false} fixedBody="luna" />
			</>,
		)
		const dates = screen.getAllByLabelText("Fecha") as HTMLInputElement[]
		expect(dates).toHaveLength(2)
		expect(new Set(dates.map((d) => d.id)).size).toBe(2)
		fireEvent.change(dates[0], { target: { value: "2026-06-21" } })
		expect(dates[0].value).toBe("2026-06-21")
		expect(dates[1].value).toBe("2026-10-02")
	})

	test("without fixedBody the switch is still there (default behaviour unchanged)", () => {
		setup()
		expect(screen.getByRole("radiogroup", { name: "Astro" })).toBeInTheDocument()
	})
})

// ---------------------------------------------------------------------------------------------
// Mobile experience
// ---------------------------------------------------------------------------------------------

import { CORDOBA as CORDOBA_PLACE, formatClock, project, sunAtClock, sunDay } from "@/lib/astro/chart"
import { dayOfYear } from "@/lib/astro/sun"

const afterNode = (a: Element, b: Element) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)
const DEC21 = dayOfYear(2026, 12, 21)

describe("SkyChart mobile: card order", () => {
	test("goes chart, time control, day summary, date, place, then the legend", () => {
		const { container } = setup()
		const chart = container.querySelector('svg[role="img"]') as Element
		const slider = input("Hora del día")
		const status = screen.getByRole("status")
		const date = input("Fecha")
		const place = screen.getByRole("group", { name: "Lugar" })
		const table = screen.getByRole("table")
		const order = [chart, slider, status, date, place, table]
		for (let i = 1; i < order.length; i++) expect(afterNode(order[i - 1], order[i])).toBe(true)
	})
})

describe("SkyChart mobile: time presets use the day's real times", () => {
	const day = sunDay(CORDOBA_PLACE, DEC21, -3)
	const minute = (hours: number) => Math.round(hours * 60)

	test("Amanecer, Mediodía solar and Atardecer jump to sunrise, solar noon and sunset of the chosen day", () => {
		setup()
		const slider = () => Number(input("Hora del día").value)
		fireEvent.click(screen.getByRole("button", { name: "Mediodía solar" }))
		expect(Math.abs(slider() - minute(day.noon))).toBeLessThanOrEqual(1)
		fireEvent.click(screen.getByRole("button", { name: "Amanecer" }))
		expect(Math.abs(slider() - minute(day.sunrise as number))).toBeLessThanOrEqual(1)
		fireEvent.click(screen.getByRole("button", { name: "Atardecer" }))
		expect(Math.abs(slider() - minute(day.sunset as number))).toBeLessThanOrEqual(1)
	})

	test("they follow the date: in June sunrise is later", () => {
		setup()
		type("Fecha", "2026-06-21")
		const june = sunDay(CORDOBA_PLACE, dayOfYear(2026, 6, 21), -3)
		fireEvent.click(screen.getByRole("button", { name: "Amanecer" }))
		expect(Math.abs(Number(input("Hora del día").value) - minute(june.sunrise as number))).toBeLessThanOrEqual(1)
	})

	test("in polar night there is no sunrise or sunset to jump to", () => {
		setup("2026-12-21")
		type("Latitud", "80")
		expect(screen.getByRole("button", { name: "Amanecer" })).toBeDisabled()
		expect(screen.getByRole("button", { name: "Atardecer" })).toBeDisabled()
	})
})

describe("SkyChart mobile: Ahora", () => {
	beforeEach(() => jest.useFakeTimers({ now: new Date("2026-10-02T15:00:00Z") }))
	afterEach(() => jest.useRealTimers())

	test("sets today's date and the current time on the Argentine clock", () => {
		setup()
		fireEvent.click(screen.getByRole("button", { name: "Ahora" }))
		expect(input("Fecha").value).toBe("2026-10-02")
		expect(input("Hora del día").value).toBe(String(12 * 60))
	})
})

describe("SkyChart mobile: date row", () => {
	test("day arrows step one day, across month and year boundaries", () => {
		setup("2026-03-01")
		fireEvent.click(screen.getByRole("button", { name: "Día anterior" }))
		expect(input("Fecha").value).toBe("2026-02-28")
		fireEvent.click(screen.getByRole("button", { name: "Día siguiente" }))
		fireEvent.click(screen.getByRole("button", { name: "Día siguiente" }))
		expect(input("Fecha").value).toBe("2026-03-02")
		type("Fecha", "2026-12-31")
		fireEvent.click(screen.getByRole("button", { name: "Día siguiente" }))
		expect(input("Fecha").value).toBe("2027-01-01")
		fireEvent.click(screen.getByRole("button", { name: "Día anterior" }))
		expect(input("Fecha").value).toBe("2026-12-31")
	})

	test("the arrows and the date field are finger-sized", () => {
		setup()
		expect(screen.getByRole("button", { name: "Día anterior" }).className).toMatch(/min-h-11/)
		expect(screen.getByRole("button", { name: "Día siguiente" }).className).toMatch(/min-h-11/)
		expect(input("Fecha").className).toMatch(/min-h-11/)
	})

	test("the solstice and equinox chips scroll sideways in one row, each finger-sized", () => {
		setup()
		const chip = screen.getByRole("button", { name: "Solsticio de junio" })
		expect(chip.parentElement?.className).toMatch(/overflow-x-auto/)
		expect(chip.className).toMatch(/min-h-11/)
	})
})

describe("SkyChart place card: coordinates are always on screen", () => {
	const placeCard = () => screen.getByRole("group", { name: "Lugar" })

	test("the latitude, longitude and time zone fields are visible from the start, not hidden in a collapsed section", () => {
		const { container } = setup()
		for (const name of ["Latitud", "Longitud", "Huso horario (UTC)"]) {
			const field = input(name)
			expect(placeCard()).toContainElement(field)
			expect(field.closest("details")).toBeNull()
		}
		expect(container.querySelector("details")).toBeNull()
	})

	test("says where you are: the place name and the time zone", () => {
		setup()
		expect(placeCard()).toHaveTextContent("Córdoba, Argentina")
		expect(placeCard()).toHaveTextContent("UTC-3")
	})

	test("the place follows the typed coordinates", () => {
		setup()
		type("Latitud", "40,4")
		type("Longitud", "-3.7")
		expect(placeCard()).toHaveTextContent("40,4° N, 3,7° O")
	})

	test("the fields are finger-sized and 16px on phones (so iOS does not zoom the page)", () => {
		setup()
		for (const name of ["Latitud", "Longitud", "Huso horario (UTC)"]) {
			expect(input(name).className).toMatch(/min-h-11/)
			expect(input(name).className).toMatch(/text-base/)
		}
	})

	test("latitude and longitude sit side by side and the time zone takes the full width below them", () => {
		setup()
		expect(input("Latitud").closest("div")?.className ?? "").not.toMatch(/col-span-2/)
		expect(input("Longitud").closest("div")?.className ?? "").not.toMatch(/col-span-2/)
		expect(input("Huso horario (UTC)").closest("div")?.className).toMatch(/col-span-2/)
	})

	test("invalid values still show their message right inside the card", () => {
		setup()
		type("Latitud", "abc")
		expect(placeCard()).toContainElement(screen.getByRole("alert"))
	})
})

describe("SkyChart place card: Usar mi ubicación", () => {
	type Success = (position: { coords: { latitude: number; longitude: number } }) => void
	type Failure = (error: { code: number }) => void

	let getCurrentPosition: jest.Mock
	const originalGeolocation = Object.getOwnPropertyDescriptor(window.navigator, "geolocation")

	function mockGeolocation(value: unknown) {
		Object.defineProperty(window.navigator, "geolocation", { value, configurable: true })
	}

	beforeEach(() => {
		getCurrentPosition = jest.fn()
		mockGeolocation({ getCurrentPosition })
		jest.spyOn(Date.prototype, "getTimezoneOffset").mockReturnValue(180) // the browser is on UTC-3
	})

	afterEach(() => {
		jest.restoreAllMocks()
		if (originalGeolocation) Object.defineProperty(window.navigator, "geolocation", originalGeolocation)
		else delete (window.navigator as unknown as { geolocation?: unknown }).geolocation
	})

	const useMyLocation = () => screen.getByRole("button", { name: "Usar mi ubicación" })
	const succeed = (latitude: number, longitude: number) =>
		act(() => (getCurrentPosition.mock.calls[0][0] as Success)({ coords: { latitude, longitude } }))
	const fail = (code: number) => act(() => (getCurrentPosition.mock.calls[0][1] as Failure)({ code }))

	test("the button is there, finger-sized, and explains that the location stays in the browser", () => {
		setup()
		expect(useMyLocation().className).toMatch(/min-h-11/)
		expect(screen.getByRole("group", { name: "Lugar" })).toHaveTextContent(/no sale de tu navegador/i)
	})

	test("asks the browser for the position once, with a timeout and without needing high accuracy", () => {
		setup()
		fireEvent.click(useMyLocation())
		expect(getCurrentPosition).toHaveBeenCalledTimes(1)
		const options = getCurrentPosition.mock.calls[0][2]
		expect(options.timeout).toBeGreaterThan(0)
		expect(options.enableHighAccuracy).toBe(false)
	})

	test("while waiting it says so, disables the button, and ignores a second tap", () => {
		setup()
		fireEvent.click(useMyLocation())
		const busy = screen.getByRole("button", { name: /Buscando tu ubicación/ })
		expect(busy).toBeDisabled()
		fireEvent.click(busy)
		expect(getCurrentPosition).toHaveBeenCalledTimes(1)
	})

	test("on success it fills latitude and longitude, takes the time zone from the device, and recalculates", () => {
		setup()
		fireEvent.click(useMyLocation())
		succeed(-34.603722, -58.381592)
		expect(input("Latitud").value).toBe("-34.6037")
		expect(input("Longitud").value).toBe("-58.3816")
		expect(input("Huso horario (UTC)").value).toBe("-3")
		expect(screen.getByRole("group", { name: "Lugar" })).toHaveTextContent("34,6° S, 58,38° O")
		expect(legendRow("Equinoccios").textContent).toContain("55,4°")
		expect(screen.getByRole("button", { name: "Usar mi ubicación" })).toBeEnabled()
	})

	test("says the place came from the device, until you edit a field", () => {
		setup()
		fireEvent.click(useMyLocation())
		succeed(-34.6, -58.4)
		expect(screen.getByRole("group", { name: "Lugar" })).toHaveTextContent(/Detectada con tu dispositivo/i)
		type("Latitud", "-35")
		expect(screen.getByRole("group", { name: "Lugar" })).not.toHaveTextContent(/Detectada con tu dispositivo/i)
	})

	test("fractional time zones come through (a device on UTC+5:30)", () => {
		jest.spyOn(Date.prototype, "getTimezoneOffset").mockReturnValue(-330)
		setup()
		fireEvent.click(useMyLocation())
		succeed(28.6139, 77.209)
		expect(input("Huso horario (UTC)").value).toBe("5.5")
	})

	test("a device with an out-of-range offset leaves the time zone alone", () => {
		jest.spyOn(Date.prototype, "getTimezoneOffset").mockReturnValue(-900) // UTC+15 is not valid here
		setup()
		fireEvent.click(useMyLocation())
		succeed(-34.6, -58.4)
		expect(input("Huso horario (UTC)").value).toBe("-3")
	})

	test("a success replaces whatever invalid text was typed, so the error goes away", () => {
		setup()
		type("Latitud", "abc")
		expect(screen.getByRole("alert")).toBeInTheDocument()
		fireEvent.click(useMyLocation())
		succeed(-34.6, -58.4)
		expect(screen.queryByRole("alert")).not.toBeInTheDocument()
		expect(input("Latitud")).not.toHaveAttribute("aria-invalid", "true")
	})

	test.each([
		[1, /permiso/i],
		[2, /no se pudo determinar/i],
		[3, /tardó demasiado/i],
	])("when the browser says error %i, a clear message appears and the place does not change", (code, message) => {
		setup()
		fireEvent.click(useMyLocation())
		fail(code)
		expect(screen.getByRole("alert")).toHaveTextContent(message)
		expect(screen.getByRole("alert")).toHaveTextContent(/coordenadas/i)
		expect(input("Latitud").value).toBe("-31.42")
		expect(screen.getByRole("button", { name: "Usar mi ubicación" })).toBeEnabled()
	})

	test("the message goes away when you try again", () => {
		setup()
		fireEvent.click(useMyLocation())
		fail(1)
		expect(screen.getByRole("alert")).toBeInTheDocument()
		fireEvent.click(useMyLocation())
		expect(screen.queryByRole("alert")).not.toBeInTheDocument()
	})

	test("a browser without geolocation gets a disabled button and an explanation, not a crash", () => {
		mockGeolocation(undefined)
		setup()
		expect(useMyLocation()).toBeDisabled()
		expect(screen.getByRole("group", { name: "Lugar" })).toHaveTextContent(/no permite obtener la ubicación/i)
		expect(input("Latitud")).toBeEnabled()
	})

	test("Volver a Córdoba undoes it: Córdoba, no device note, no error", () => {
		setup()
		fireEvent.click(useMyLocation())
		succeed(-34.6, -58.4)
		fireEvent.click(screen.getByRole("button", { name: "Volver a Córdoba" }))
		const card = screen.getByRole("group", { name: "Lugar" })
		expect(card).toHaveTextContent("Córdoba, Argentina")
		expect(card).not.toHaveTextContent(/Detectada con tu dispositivo/i)
		expect(input("Latitud").value).toBe("-31.42")
	})

	test("a late answer after the chart is gone does not blow up", () => {
		const { unmount } = setup()
		fireEvent.click(useMyLocation())
		unmount()
		expect(() => succeed(-34.6, -58.4)).not.toThrow()
	})

	test("works in Moon mode too", () => {
		toMoon()
		fireEvent.click(useMyLocation())
		succeed(40.4168, -3.7038)
		expect(input("Latitud").value).toBe("40.4168")
		expect(legendRow("Extremo norte del mes")).toBeInTheDocument()
	})
})

describe("SkyChart mobile: the day summary as tiles", () => {
	const day = sunDay(CORDOBA_PLACE, DEC21, -3)

	test("four tiles: Sale, Mediodía solar, Se pone and Duración, with the real values", () => {
		setup()
		const status = screen.getByRole("status")
		for (const label of ["Sale", "Mediodía solar", "Se pone", "Duración"]) {
			expect(within(status).getByText(label)).toBeInTheDocument()
		}
		expect(within(status).getByText(formatClock(day.sunrise as number))).toBeInTheDocument()
		expect(within(status).getByText(formatClock(day.noon))).toBeInTheDocument()
		expect(within(status).getByText(formatClock(day.sunset as number))).toBeInTheDocument()
		expect(within(status).getByText("14 h 12 min")).toBeInTheDocument()
		expect(within(status).getByText(/118° SE/)).toBeInTheDocument()
	})

	test("polar day and polar night replace the tiles with one clear message", () => {
		setup("2026-06-21")
		type("Latitud", "80")
		const status = screen.getByRole("status")
		expect(within(status).getByText(/Sol de medianoche/)).toBeInTheDocument()
		expect(within(status).queryByText("Sale")).not.toBeInTheDocument()
	})
})

describe("SkyChart mobile: the legend reflows into cards", () => {
	test("the header row is only for screen readers on phones, and each value cell carries its label", () => {
		setup()
		const table = screen.getByRole("table")
		expect(table.querySelector("thead")?.className).toMatch(/max-md:sr-only/)
		const row = legendRow("21 de diciembre")
		const labels = Array.from(row.querySelectorAll("td")).slice(1).map((td) => td.getAttribute("data-label"))
		expect(labels).toEqual(["Orto", "Ocaso", "Alt. máx", "Día"])
	})

	test("in Moon mode the cells are labelled for the Moon", () => {
		toMoon()
		const row = legendRow("Cruce del ecuador")
		const labels = Array.from(row.querySelectorAll("td")).slice(1).map((td) => td.getAttribute("data-label"))
		expect(labels).toEqual(["Sale", "Se pone", "Alt. máx", "Declin."])
	})
})

describe("SkyChart mobile: the chart is readable at phone width", () => {
	// The chart is drawn in a 1000-unit box and scaled down, so on a 360px phone one unit is 0.36px.
	test("all the labels are large enough in chart units (>= 16 => ~6px+ at 360px, ~11px at desktop)", () => {
		const { container } = setup()
		const texts = Array.from(container.querySelectorAll('svg[role="img"] text'))
		expect(texts.length).toBeGreaterThan(20)
		for (const text of texts) expect(Number(text.getAttribute("font-size"))).toBeGreaterThanOrEqual(16)
	})

	test("the minor 15° compass labels are hidden on small screens, the N E S O ones are not", () => {
		const { container } = setup()
		const texts = Array.from(container.querySelectorAll('svg[role="img"] text'))
		const minor = texts.find((t) => t.textContent === "15°") as Element
		expect(minor.getAttribute("class")).toMatch(/max-sm:hidden/)
		const north = texts.find((t) => t.textContent === "N") as Element
		expect(north.getAttribute("class") ?? "").not.toMatch(/max-sm:hidden/)
	})

	test("the curves are thick enough to see", () => {
		const { container } = setup()
		const paths = Array.from(container.querySelectorAll("path[data-curve]"))
		expect(paths.length).toBe(8)
		for (const path of paths) expect(Number(path.getAttribute("stroke-width"))).toBeGreaterThanOrEqual(4)
	})

	test("the Sun marker is big and has an even bigger invisible touch area", () => {
		const { container } = setup()
		const radii = Array.from(container.querySelectorAll("[data-sun-marker] circle")).map((c) => Number(c.getAttribute("r")))
		expect(Math.max(...radii)).toBeGreaterThanOrEqual(60)
		expect(radii.some((r) => r >= 18 && r < 40)).toBe(true)
	})
})

describe("SkyChart mobile: drag the Sun along its path", () => {
	function withChartRect(container: HTMLElement) {
		const svg = container.querySelector('svg[role="img"]') as SVGSVGElement
		svg.getBoundingClientRect = () =>
			({ x: 0, y: 0, left: 0, top: 0, right: 1000, bottom: 1000, width: 1000, height: 1000, toJSON: () => ({}) }) as DOMRect
	}
	const spotAt = (minute: number) => {
		const sun = sunAtClock(CORDOBA_PLACE, DEC21, -3, minute / 60)
		return project(sun.alt, sun.az)
	}

	test("dragging the marker sets the time to where the Sun is closest on its path", () => {
		const { container } = setup()
		withChartRect(container)
		const marker = container.querySelector("[data-sun-marker]") as Element
		const start = spotAt(13 * 60 + 15)
		fireEvent.pointerDown(marker, { clientX: start.x, clientY: start.y, pointerId: 1 })
		const target = spotAt(8 * 60)
		fireEvent.pointerMove(marker, { clientX: target.x, clientY: target.y, pointerId: 1 })
		expect(Math.abs(Number(input("Hora del día").value) - 8 * 60)).toBeLessThanOrEqual(3)
		const further = spotAt(17 * 60)
		fireEvent.pointerMove(marker, { clientX: further.x, clientY: further.y, pointerId: 1 })
		expect(Math.abs(Number(input("Hora del día").value) - 17 * 60)).toBeLessThanOrEqual(3)
	})

	test("moving without pressing does nothing, and letting go ends the drag", () => {
		const { container } = setup()
		withChartRect(container)
		const marker = container.querySelector("[data-sun-marker]") as Element
		const before = input("Hora del día").value
		const away = spotAt(8 * 60)
		fireEvent.pointerMove(marker, { clientX: away.x, clientY: away.y, pointerId: 1 })
		expect(input("Hora del día").value).toBe(before)
		const start = spotAt(13 * 60 + 15)
		fireEvent.pointerDown(marker, { clientX: start.x, clientY: start.y, pointerId: 1 })
		fireEvent.pointerUp(marker, { pointerId: 1 })
		fireEvent.pointerMove(marker, { clientX: away.x, clientY: away.y, pointerId: 1 })
		expect(input("Hora del día").value).toBe(before)
	})

	test("grabbing the Sun pauses the animation", () => {
		jest.useFakeTimers()
		try {
			const { container } = setup()
			withChartRect(container)
			fireEvent.click(screen.getByRole("button", { name: "Reproducir" }))
			expect(screen.getByRole("button", { name: "Pausar" })).toBeInTheDocument()
			const marker = container.querySelector("[data-sun-marker]") as Element
			const start = spotAt(13 * 60 + 15)
			fireEvent.pointerDown(marker, { clientX: start.x, clientY: start.y, pointerId: 1 })
			expect(screen.getByRole("button", { name: "Reproducir" })).toBeInTheDocument()
		} finally {
			jest.useRealTimers()
		}
	})

	test("the marker does not capture page scrolling anywhere but on itself (the rest of the chart scrolls the page)", () => {
		const { container } = setup()
		const marker = container.querySelector("[data-sun-marker]") as SVGElement
		expect(marker.style.touchAction).toBe("none")
		const svg = container.querySelector('svg[role="img"]') as SVGElement
		expect(svg.style.touchAction).not.toBe("none")
	})
})

describe("SkyChart mobile: nothing can push the cards wider than the screen", () => {
	// A grid with no explicit tracks sizes its single column to the widest min-content inside it. The presets row
	// (nine buttons in a horizontal scroller) is ~600px wide, which stretched the chart and every card past a
	// 360px phone. The fix: a track that can shrink to zero, and columns that are allowed to shrink below their content.
	test("the layout grid has a shrinkable single track on phones", () => {
		const { container } = setup()
		const grid = container.querySelector("section .grid.gap-5") as HTMLElement
		expect(grid.className).toMatch(/grid-cols-\[minmax\(0,1fr\)\]/)
		expect(grid.className).toMatch(/lg:grid-cols-\[minmax\(0,1\.5fr\)_minmax\(0,1fr\)\]/)
	})

	test("both columns may shrink below their content, so a scrolling row cannot widen them", () => {
		const { container } = setup()
		const grid = container.querySelector("section .grid.gap-5") as HTMLElement
		expect(grid.children).toHaveLength(2)
		for (const column of Array.from(grid.children)) expect(column.className).toMatch(/\bmin-w-0\b/)
	})
})

describe("SkyChart Moon mode: drag the Moon along its path", () => {
	const dayStart = Date.UTC(2026, 9, 2) + 3 * 3_600_000 // 00:00 ART of 2 Oct 2026
	const upMinutes = () => {
		const minutes: number[] = []
		for (let m = 0; m < 1440; m += 5) if (moonAltAz(CORDOBA_LOC, dayStart + m * 60_000).alt > 8) minutes.push(m)
		return minutes
	}
	const spotAt = (minute: number) => {
		const { alt, az } = moonAltAz(CORDOBA_LOC, dayStart + minute * 60_000)
		return project(alt, az)
	}
	function withChartRect(container: HTMLElement) {
		const svg = container.querySelector('svg[role="img"]') as SVGSVGElement
		svg.getBoundingClientRect = () =>
			({ x: 0, y: 0, left: 0, top: 0, right: 1000, bottom: 1000, width: 1000, height: 1000, toJSON: () => ({}) }) as DOMRect
	}
	/** a Moon chart on 2 Oct 2026 with the time moved to a minute where the Moon is up, so its marker is on screen */
	function moonChartAt(minute: number) {
		const view = toMoon("2026-10-02")
		fireEvent.change(input("Hora del día"), { target: { value: String(minute) } })
		withChartRect(view.container)
		return view
	}

	test("dragging the marker sets the time to where the Moon is closest on its path", () => {
		const up = upMinutes()
		const start = up[Math.floor(up.length / 3)]
		const target = up[up.length - 2]
		const { container } = moonChartAt(start)
		const marker = container.querySelector("[data-moon-marker]") as Element
		const from = spotAt(start)
		fireEvent.pointerDown(marker, { clientX: from.x, clientY: from.y, pointerId: 1 })
		const to = spotAt(target)
		fireEvent.pointerMove(marker, { clientX: to.x, clientY: to.y, pointerId: 1 })
		expect(Math.abs(Number(input("Hora del día").value) - target)).toBeLessThanOrEqual(3)
		const earlier = up[1]
		const back = spotAt(earlier)
		fireEvent.pointerMove(marker, { clientX: back.x, clientY: back.y, pointerId: 1 })
		expect(Math.abs(Number(input("Hora del día").value) - earlier)).toBeLessThanOrEqual(3)
	})

	test("moving without pressing does nothing, and letting go ends the drag", () => {
		const up = upMinutes()
		const start = up[Math.floor(up.length / 3)]
		const { container } = moonChartAt(start)
		const marker = container.querySelector("[data-moon-marker]") as Element
		const away = spotAt(up[up.length - 2])
		fireEvent.pointerMove(marker, { clientX: away.x, clientY: away.y, pointerId: 1 })
		expect(Number(input("Hora del día").value)).toBe(start)
		const from = spotAt(start)
		fireEvent.pointerDown(marker, { clientX: from.x, clientY: from.y, pointerId: 1 })
		fireEvent.pointerUp(marker, { pointerId: 1 })
		fireEvent.pointerMove(marker, { clientX: away.x, clientY: away.y, pointerId: 1 })
		expect(Number(input("Hora del día").value)).toBe(start)
	})

	test("grabbing the Moon pauses the animation", () => {
		jest.useFakeTimers()
		try {
			const up = upMinutes()
			const start = up[Math.floor(up.length / 3)]
			const { container } = moonChartAt(start)
			fireEvent.click(screen.getByRole("button", { name: "Reproducir" }))
			expect(screen.getByRole("button", { name: "Pausar" })).toBeInTheDocument()
			const marker = container.querySelector("[data-moon-marker]") as Element
			const from = spotAt(start)
			fireEvent.pointerDown(marker, { clientX: from.x, clientY: from.y, pointerId: 1 })
			expect(screen.getByRole("button", { name: "Reproducir" })).toBeInTheDocument()
		} finally {
			jest.useRealTimers()
		}
	})

	test("the Moon marker is as big and as easy to grab as the Sun one, and only it captures touches", () => {
		const up = upMinutes()
		const { container } = moonChartAt(up[Math.floor(up.length / 3)])
		const marker = container.querySelector("[data-moon-marker]") as SVGElement
		const sunRadii = Array.from(setupSunMarkerRadii())
		const moonRadii = Array.from(marker.querySelectorAll("circle")).map((c) => Number(c.getAttribute("r")))
		expect(Math.max(...moonRadii)).toBeGreaterThanOrEqual(60)
		expect(moonRadii.sort()).toEqual(sunRadii.sort())
		expect(marker.style.touchAction).toBe("none")
		expect((container.querySelector('svg[role="img"]') as SVGElement).style.touchAction).not.toBe("none")
	})

	test("the caption tells you that you can drag the Moon", () => {
		toMoon("2026-10-02")
		expect(screen.getByText(/Arrastrá la Luna/)).toBeInTheDocument()
	})
})

/** The radii of the Sun marker's circles (glow, disc, touch area), for comparing the Moon marker with it. */
function setupSunMarkerRadii(): number[] {
	const { container, unmount } = render(<SkyChart initialDate="2026-12-21" syncToNow={false} fixedBody="sol" />)
	const radii = Array.from(container.querySelectorAll("[data-sun-marker] circle")).map((c) => Number(c.getAttribute("r")))
	unmount()
	return radii
}

describe("SkyChart place buttons above the chart", () => {
	const row = () => screen.getByRole("group", { name: "Lugares" })
	const pick = (name: string) => fireEvent.click(screen.getByRole("button", { name }))
	const huso = () => input("Huso horario (UTC)").value

	test("a row of buttons (Córdoba, Noruega, Antártida) sits above the chart", () => {
		const { container } = setup()
		const labels = Array.from(row().querySelectorAll("button")).map((b) => b.textContent)
		expect(labels).toEqual(["Córdoba", "Noruega", "Antártida"])
		expect(afterNode(row(), container.querySelector('svg[role="img"]') as Element)).toBe(true)
	})

	test("the buttons are finger-sized, scroll sideways if they do not fit, and explain themselves in a tooltip", () => {
		setup()
		expect(row().className).toMatch(/overflow-x-auto/)
		for (const button of Array.from(row().querySelectorAll("button"))) expect(button.className).toMatch(/min-h-11/)
		expect(screen.getByRole("button", { name: "Noruega" })).toHaveAttribute("title", expect.stringMatching(/polar/i))
	})

	test("Córdoba starts selected", () => {
		setup()
		expect(screen.getByRole("button", { name: "Córdoba" })).toHaveAttribute("aria-pressed", "true")
		expect(screen.getByRole("button", { name: "Noruega" })).toHaveAttribute("aria-pressed", "false")
	})

	test("clicking Noruega fills its coordinates and its clock offset, and names the place", () => {
		setup()
		pick("Noruega")
		expect(input("Latitud").value).toBe("69.65")
		expect(input("Longitud").value).toBe("18.96")
		expect(huso()).toBe("1") // 21 December: winter time in Norway
		expect(screen.getByRole("group", { name: "Lugar" })).toHaveTextContent("Tromsø, Noruega")
		expect(screen.getByRole("button", { name: "Noruega" })).toHaveAttribute("aria-pressed", "true")
		expect(screen.getByRole("button", { name: "Córdoba" })).toHaveAttribute("aria-pressed", "false")
	})

	test("Noruega has polar night in December and midnight sun in June, and the clock offset follows daylight saving", () => {
		setup()
		pick("Noruega")
		expect(screen.getByRole("status")).toHaveTextContent(/Noche polar/)
		type("Fecha", "2026-06-21")
		expect(screen.getByRole("status")).toHaveTextContent(/Sol de medianoche/)
		expect(huso()).toBe("2") // summer time
		type("Fecha", "2026-01-15")
		expect(huso()).toBe("1")
	})

	test("Antártida is the other way round: midnight sun in December, polar night in June, still UTC-3", () => {
		setup()
		pick("Antártida")
		expect(input("Latitud").value).toBe("-77.87")
		expect(input("Longitud").value).toBe("-34.63")
		expect(screen.getByRole("status")).toHaveTextContent(/Sol de medianoche/)
		expect(screen.getByRole("group", { name: "Lugar" })).toHaveTextContent("Base Belgrano II, Antártida")
		type("Fecha", "2026-06-21")
		expect(screen.getByRole("status")).toHaveTextContent(/Noche polar/)
		expect(huso()).toBe("-3")
	})

	test("clicking Córdoba again (or Volver a Córdoba) brings the default place back", () => {
		setup()
		pick("Noruega")
		pick("Córdoba")
		expect(input("Latitud").value).toBe("-31.42")
		expect(huso()).toBe("-3")
		expect(screen.getByRole("button", { name: "Córdoba" })).toHaveAttribute("aria-pressed", "true")
		pick("Antártida")
		fireEvent.click(screen.getByRole("button", { name: "Volver a Córdoba" }))
		expect(screen.getByRole("button", { name: "Córdoba" })).toHaveAttribute("aria-pressed", "true")
		expect(screen.getByRole("group", { name: "Lugar" })).toHaveTextContent("Córdoba, Argentina")
	})

	test("typing your own coordinates unselects every button", () => {
		setup()
		pick("Noruega")
		type("Latitud", "40")
		for (const name of ["Córdoba", "Noruega", "Antártida"]) {
			expect(screen.getByRole("button", { name })).toHaveAttribute("aria-pressed", "false")
		}
	})

	test("the time zone is worked out for you and says so, until you type your own", () => {
		setup()
		pick("Noruega")
		expect(screen.getByRole("group", { name: "Lugar" })).toHaveTextContent(/se calcula solo/i)
		type("Huso horario (UTC)", "5")
		expect(huso()).toBe("5")
		expect(screen.getByRole("group", { name: "Lugar" })).not.toHaveTextContent(/se calcula solo/i)
	})

	test("a time zone you typed is kept when the date changes (it stops following the place)", () => {
		setup()
		pick("Noruega")
		type("Huso horario (UTC)", "5")
		type("Fecha", "2026-07-15")
		expect(huso()).toBe("5")
	})

	test("the chart's clock times use the place's offset: Tromsø in June has its sunrise-less day at UTC+2", () => {
		setup()
		pick("Noruega")
		type("Fecha", "2026-06-21")
		expect(screen.getByRole("group", { name: "Lugar" })).toHaveTextContent("UTC+2")
	})

	test("the buttons work in Moon mode too", () => {
		toMoon()
		pick("Noruega")
		expect(input("Latitud").value).toBe("69.65")
		expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(1 + 5 + 1)
	})
})
