import { render } from "@testing-library/react"
import TrailMap from "../trail-map"
import type { TrailNode, TrailSegment } from "../types"

const nodes: TrailNode[] = [
	{ id: "a", x: 100, y: 400, label: "Uno" },
	{ id: "b", x: 200, y: 300, label: "Dos" },
	{ id: "c", x: 300, y: 200, locked: true },
]
const segments: TrailSegment[] = [
	{ d: "M 100,400 L 200,300" },
	{ d: "M 200,300 L 300,200", locked: true },
]

function setup(activeIndex: number) {
	return render(<TrailMap nodes={nodes} segments={segments} activeIndex={activeIndex} fogHeight={150} />)
}

test("renders one marker group per node", () => {
	const { container } = setup(-1)
	// each node draws a <text> badge with its number
	expect(container.querySelectorAll("text")).not.toHaveLength(0)
	expect(container.querySelector("svg")).toBeInTheDocument()
})

test("hides all segments before the first node is passed", () => {
	const { container } = setup(0)
	const paths = [...container.querySelectorAll("path[stroke-dasharray='1000']")]
	expect(paths).toHaveLength(2)
	expect(paths.every((p) => p.getAttribute("stroke-dashoffset") === "1000")).toBe(true)
})

test("reveals segment 0 once node 1 is active", () => {
	const { container } = setup(1)
	const paths = [...container.querySelectorAll("path[stroke-dasharray='1000']")]
	expect(paths[0].getAttribute("stroke-dashoffset")).toBe("0")
	expect(paths[1].getAttribute("stroke-dashoffset")).toBe("1000")
})

test("shows the label tag only for reached, unlocked nodes", () => {
	const { container, rerender } = render(
		<TrailMap nodes={nodes} segments={segments} activeIndex={-1} />,
	)
	expect(container.textContent).not.toContain("Uno")

	rerender(<TrailMap nodes={nodes} segments={segments} activeIndex={0} />)
	expect(container.textContent).toContain("Uno")
})

test("omits the fog rect when fogHeight is 0", () => {
	const withFog = render(<TrailMap nodes={nodes} segments={segments} activeIndex={0} fogHeight={150} />)
	expect(withFog.container.querySelector('rect[fill*="-fog"]')).not.toBeNull()

	const noFog = render(<TrailMap nodes={nodes} segments={segments} activeIndex={0} fogHeight={0} />)
	expect(noFog.container.querySelector('rect[fill*="-fog"]')).toBeNull()
})
