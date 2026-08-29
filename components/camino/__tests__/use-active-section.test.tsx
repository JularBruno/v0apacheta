import { render, screen, act } from "@testing-library/react"
import { useActiveSection } from "../use-active-section"

declare const MockIntersectionObserver: {
	instances: Array<{
		elements: Set<Element>
		fire: (entries: Array<{ isIntersecting: boolean }>) => void
	}>
}

function Harness({ count }: { count: number }) {
	const { active, setRef } = useActiveSection(count)
	return (
		<div>
			<span data-testid="active">{active}</span>
			{Array.from({ length: count }).map((_, i) => (
				<section key={i} ref={setRef(i)}>
					section {i}
				</section>
			))}
		</div>
	)
}

test("starts at section 0", () => {
	render(<Harness count={4} />)
	expect(screen.getByTestId("active")).toHaveTextContent("0")
})

test("creates one observer per section", () => {
	render(<Harness count={4} />)
	expect(MockIntersectionObserver.instances).toHaveLength(4)
})

test("activates the section whose observer reports intersection", () => {
	render(<Harness count={4} />)

	act(() => {
		MockIntersectionObserver.instances[2].fire([{ isIntersecting: true }])
	})
	expect(screen.getByTestId("active")).toHaveTextContent("2")

	act(() => {
		MockIntersectionObserver.instances[1].fire([{ isIntersecting: true }])
	})
	expect(screen.getByTestId("active")).toHaveTextContent("1")
})

test("ignores non-intersecting entries", () => {
	render(<Harness count={3} />)
	act(() => {
		MockIntersectionObserver.instances[1].fire([{ isIntersecting: true }])
	})
	act(() => {
		MockIntersectionObserver.instances[2].fire([{ isIntersecting: false }])
	})
	expect(screen.getByTestId("active")).toHaveTextContent("1")
})
