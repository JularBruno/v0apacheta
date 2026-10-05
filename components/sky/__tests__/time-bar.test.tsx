import { fireEvent, render, screen } from "@testing-library/react"
import TimeBar from "@/components/sky/time-bar"

function setup(overrides: Partial<React.ComponentProps<typeof TimeBar>> = {}) {
	const props = {
		minutes: 13 * 60 + 15,
		onChange: jest.fn(),
		playing: false,
		onTogglePlay: jest.fn(),
		presets: [
			{ label: "Amanecer", minutes: 6 * 60 + 9 },
			{ label: "Mediodía solar", minutes: 13 * 60 + 15 },
			{ label: "Atardecer", minutes: 20 * 60 + 21 },
			{ label: "Ahora", minutes: 12 * 60 },
		],
		...overrides,
	}
	const view = render(
		<TimeBar {...props}>
			<p>lectura</p>
		</TimeBar>,
	)
	return { ...view, props }
}

describe("TimeBar", () => {
	test("has a slider for the minute of the day and shows the time big", () => {
		setup()
		const slider = screen.getByLabelText("Hora del día") as HTMLInputElement
		expect(slider.type).toBe("range")
		expect(slider.min).toBe("0")
		expect(slider.max).toBe("1439")
		expect(slider.value).toBe(String(13 * 60 + 15))
		expect(screen.getByText("13:15")).toBeInTheDocument()
	})

	test("moving the slider reports the new minute", () => {
		const { props } = setup()
		fireEvent.change(screen.getByLabelText("Hora del día"), { target: { value: "480" } })
		expect(props.onChange).toHaveBeenCalledWith(480)
	})

	test("the slider and every button are finger-sized (44px)", () => {
		setup()
		const buttons = screen.getAllByRole("button")
		expect(buttons.length).toBeGreaterThanOrEqual(9)
		for (const button of buttons) expect(button.className).toMatch(/min-h-11/)
		expect(screen.getByLabelText("Hora del día").className).toMatch(/range/)
	})

	test("steppers move by 10 minutes and by 1 hour, in both directions", () => {
		const { props } = setup({ minutes: 600 })
		fireEvent.click(screen.getByRole("button", { name: "10 minutos antes" }))
		expect(props.onChange).toHaveBeenLastCalledWith(590)
		fireEvent.click(screen.getByRole("button", { name: "10 minutos después" }))
		expect(props.onChange).toHaveBeenLastCalledWith(610)
		fireEvent.click(screen.getByRole("button", { name: "Una hora antes" }))
		expect(props.onChange).toHaveBeenLastCalledWith(540)
		fireEvent.click(screen.getByRole("button", { name: "Una hora después" }))
		expect(props.onChange).toHaveBeenLastCalledWith(660)
	})

	test("the steppers wrap around midnight", () => {
		const early = setup({ minutes: 5 })
		fireEvent.click(screen.getByRole("button", { name: "10 minutos antes" }))
		expect(early.props.onChange).toHaveBeenLastCalledWith(1435)
		early.unmount()
		const late = setup({ minutes: 1435 })
		fireEvent.click(screen.getByRole("button", { name: "10 minutos después" }))
		expect(late.props.onChange).toHaveBeenLastCalledWith(5)
	})

	test("play and pause", () => {
		const idle = setup()
		const play = screen.getByRole("button", { name: "Reproducir" })
		expect(play).toHaveAttribute("aria-pressed", "false")
		fireEvent.click(play)
		expect(idle.props.onTogglePlay).toHaveBeenCalledTimes(1)
		idle.unmount()
		setup({ playing: true })
		expect(screen.getByRole("button", { name: "Pausar" })).toHaveAttribute("aria-pressed", "true")
	})

	test("presets jump to their minute", () => {
		const { props } = setup()
		fireEvent.click(screen.getByRole("button", { name: "Amanecer" }))
		expect(props.onChange).toHaveBeenLastCalledWith(6 * 60 + 9)
		fireEvent.click(screen.getByRole("button", { name: "Atardecer" }))
		expect(props.onChange).toHaveBeenLastCalledWith(20 * 60 + 21)
	})

	test("a preset with no time (no sunrise in polar night) is disabled", () => {
		setup({ presets: [{ label: "Amanecer", minutes: null }] })
		expect(screen.getByRole("button", { name: "Amanecer" })).toBeDisabled()
	})

	test("an action preset runs its own handler instead of just setting a minute", () => {
		const onNow = jest.fn()
		const { props } = setup({ presets: [{ label: "Ahora", minutes: null, onSelect: onNow }] })
		fireEvent.click(screen.getByRole("button", { name: "Ahora" }))
		expect(onNow).toHaveBeenCalledTimes(1)
		expect(props.onChange).not.toHaveBeenCalled()
	})

	test("the presets scroll sideways instead of wrapping into a tall block", () => {
		setup()
		const row = screen.getByRole("button", { name: "Amanecer" }).parentElement as HTMLElement
		expect(row.className).toMatch(/overflow-x-auto/)
	})

	test("the controls stick to the bottom of the screen on phones while the chart is in view, and sit normally on desktop; the readout does not stick", () => {
		setup()
		const controls = screen.getByLabelText("Hora del día").closest("[class*='sticky']") as HTMLElement
		expect(controls).not.toBeNull()
		expect(controls.className).toMatch(/bottom-/)
		expect(controls.className).toMatch(/lg:static/)
		expect(controls).not.toContainElement(screen.getByText("lectura"))
	})

	test("renders what the parent puts inside, such as the sun readout", () => {
		setup()
		expect(screen.getByText("lectura")).toBeInTheDocument()
	})
})
