import { act, fireEvent, render, screen, within } from "@testing-library/react"
import BreathingWidget from "../breathing-widget"

const engine = { start: jest.fn(), setVolume: jest.fn(), cue: jest.fn(), stop: jest.fn() }
jest.mock("@/lib/breathing/sounds", () => {
	const actual = jest.requireActual("@/lib/breathing/sounds")
	return { ...actual, createSoundEngine: () => engine }
})

const release = jest.fn(async () => {})
const request = jest.fn(async () => ({ release }))

beforeEach(() => {
	jest.useFakeTimers()
	jest.setSystemTime(new Date("2026-10-13T12:00:00Z"))
	Object.values(engine).forEach((fn) => fn.mockClear())
	request.mockClear()
	release.mockClear()
	Object.defineProperty(navigator, "wakeLock", { value: { request }, configurable: true })
})

afterEach(() => {
	jest.useRealTimers()
})

// React flushes effects (which schedule the next timer) when act() exits, so time moves in small steps
const advance = (ms: number) => {
	for (let left = ms; left > 0; left -= 250) act(() => void jest.advanceTimersByTime(Math.min(250, left)))
}

function begin() {
	fireEvent.click(screen.getByRole("button", { name: /empezar/i }))
}

function setup(rounds: number, breaths: number) {
	fireEvent.change(screen.getByLabelText(/rondas/i), { target: { value: String(rounds) } })
	fireEvent.change(screen.getByLabelText(/respiraciones por ronda/i), { target: { value: String(breaths) } })
}

describe("before starting", () => {
	test("shows the disclaimer before the start button, with no confirmation step", () => {
		render(<BreathingWidget />)
		const disclaimer = screen.getByText(/no te tomes el método y las técnicas a la ligera/i)
		const start = screen.getByRole("button", { name: /empezar/i })
		expect(Boolean(disclaimer.compareDocumentPosition(start) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true)
		expect(screen.getByText(/piscina/i)).toBeInTheDocument()
		expect(screen.getByText(/manejando/i)).toBeInTheDocument()
		expect(screen.queryByRole("checkbox")).toBeNull()
		expect(start).toBeEnabled()
	})

	test("defaults to 3 rounds of 30 breaths and lets you pick the ambience and volume", () => {
		render(<BreathingWidget />)
		expect(screen.getByLabelText(/rondas/i)).toHaveValue("3")
		expect(screen.getByLabelText(/respiraciones por ronda/i)).toHaveValue("30")
		expect(screen.getByRole("radio", { name: "Silencio" })).toBeChecked()
		for (const name of ["Grave", "Aire", "Cuenco"]) expect(screen.getByRole("radio", { name })).toBeInTheDocument()
		expect(screen.getByLabelText(/volumen/i)).toBeInTheDocument()
	})
})

describe("the breathing circle", () => {
	const start = () => {
		render(<BreathingWidget />)
		setup(2, 10)
		fireEvent.click(screen.getByRole("button", { name: /empezar/i }))
	}

	test("shows the counter in the centre of the circle, and no visible Inhalá / Soltá text", () => {
		start()
		const circle = document.querySelector("[data-breath-circle]") as HTMLElement
		expect(circle).not.toBeNull()
		expect(within(circle).getByText("0 / 10")).toBeInTheDocument()
		advance(3_000)
		expect(within(circle).getByText("1 / 10")).toBeInTheDocument()
		for (const word of ["Inhalá", "Soltá"]) {
			for (const el of screen.queryAllByText(word)) expect(el.closest(".sr-only")).not.toBeNull()
		}
	})

	test("the circle only grows and shrinks a little (between 85 % and 100 %), and it is big", () => {
		start()
		const circle = document.querySelector("[data-breath-circle]") as HTMLElement
		const scale = () => Number(/scale\(([\d.]+)\)/.exec(circle.style.transform)?.[1])
		const scales = new Set<number>()
		for (let i = 0; i < 8; i++) {
			scales.add(scale())
			advance(1_500)
		}
		expect(Math.min(...scales)).toBeGreaterThanOrEqual(0.85)
		expect(Math.max(...scales)).toBeLessThanOrEqual(1)
		expect(scales.size).toBeGreaterThan(1)
		expect(circle.className).toMatch(/w-\[min\(2[0-9]rem/)
	})
})

describe("a full session", () => {
	test("counts the breaths, one every 3 seconds, with the round shown", () => {
		render(<BreathingWidget />)
		setup(2, 10)
		fireEvent.click(screen.getByRole("radio", { name: "Grave" }))
		begin()
		expect(engine.start).toHaveBeenCalledWith("grave", expect.any(Number))
		expect(screen.getByText(/ronda 1 de 2/i)).toBeInTheDocument()
		expect(screen.getByText("0 / 10")).toBeInTheDocument()
		advance(3_000)
		expect(screen.getByText("1 / 10")).toBeInTheDocument()
		advance(3_000 * 4)
		expect(screen.getByText("5 / 10")).toBeInTheDocument()
		// no sound goes back and forth with the breath: the ambience is the only thing you hear while breathing
		expect(engine.cue).not.toHaveBeenCalled()
	})

	test("after the last breath the hold timer runs and a single tap does not stop it", () => {
		render(<BreathingWidget />)
		setup(1, 10)
		begin()
		advance(3_000 * 10)
		const pad = screen.getByRole("button", { name: /tocá dos veces/i })
		advance(5_000)
		fireEvent.click(pad)
		advance(400 + 100)
		expect(screen.getByRole("button", { name: /tocá dos veces/i })).toBeInTheDocument()
		expect(screen.getByText(/0:05|0:06/)).toBeInTheDocument()
	})

	test("a double tap records the hold and starts the 15 second recovery, then the next round", () => {
		render(<BreathingWidget />)
		setup(2, 10)
		begin()
		advance(3_000 * 10)
		advance(12_300)
		const pad = screen.getByRole("button", { name: /tocá dos veces/i })
		fireEvent.click(pad)
		advance(100)
		fireEvent.click(pad)
		expect(screen.getByText(/sostené/i)).toBeInTheDocument()
		expect(screen.getByText("15")).toBeInTheDocument()
		advance(5_000)
		expect(screen.getByText("10")).toBeInTheDocument()
		advance(10_000)
		expect(screen.getByText(/ronda 2 de 2/i)).toBeInTheDocument()
		expect(screen.getByText("0 / 10")).toBeInTheDocument()
	})

	test("after the last round it shows every hold time, the best and the average", () => {
		render(<BreathingWidget />)
		setup(2, 10)
		begin()
		const holdFor = (ms: number) => {
			advance(3_000 * 10)
			const pad = screen.getByRole("button", { name: /tocá dos veces/i })
			advance(ms)
			fireEvent.click(pad)
			advance(50)
			fireEvent.click(pad)
			advance(15_000)
		}
		holdFor(30_000)
		holdFor(45_000)
		const summary = screen.getByRole("region", { name: /resultados/i })
		expect(within(summary).getAllByText("0:30.0").length).toBeGreaterThan(0)
		expect(within(summary).getAllByText("0:45.0").length).toBeGreaterThan(0)
		expect(within(summary).getByText(/mejor/i).parentElement).toHaveTextContent("0:45.0")
		expect(within(summary).getByText(/promedio/i).parentElement).toHaveTextContent("0:37.5")
		advance(2_000)
		expect(engine.cue).toHaveBeenCalledWith("end")
		expect(engine.stop).toHaveBeenCalled()
		expect(screen.getByRole("button", { name: /volver a empezar/i })).toBeInTheDocument()
	})

	test("you can end a session at any time and go back to the setup", () => {
		render(<BreathingWidget />)
		begin()
		advance(3_000 * 2)
		fireEvent.click(screen.getByRole("button", { name: /terminar ahora/i }))
		expect(engine.stop).toHaveBeenCalled()
		expect(screen.getByRole("button", { name: /empezar/i })).toBeInTheDocument()
		advance(10_000)
		expect(screen.queryByText(/ronda 1/i)).toBeNull()
	})

	test("keeps the screen on during the session and releases it at the end", async () => {
		render(<BreathingWidget />)
		begin()
		await act(async () => {})
		expect(request).toHaveBeenCalledWith("screen")
		fireEvent.click(screen.getByRole("button", { name: /terminar ahora/i }))
		await act(async () => {})
		expect(release).toHaveBeenCalled()
	})

	test("works when the browser has no wake lock", () => {
		Object.defineProperty(navigator, "wakeLock", { value: undefined, configurable: true })
		render(<BreathingWidget />)
		expect(() => begin()).not.toThrow()
	})
})
