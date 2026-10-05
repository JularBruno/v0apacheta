import { render, screen } from "@testing-library/react"
import EconomicsTopicStarter, { starterMeta, starterSeo } from "@/components/content/starters/economics-topic.starter"
import { parseMeta, parseSeo } from "@/lib/content/schema"

describe("economics-topic starter", () => {
	test("its meta and seo are valid, so the starter never rots", () => {
		expect(() => parseMeta(starterMeta)).not.toThrow()
		expect(() => parseSeo(starterSeo)).not.toThrow()
	})

	test("renders inside ContentShell with one h1 and the mandatory chrome", () => {
		const { container } = render(<EconomicsTopicStarter />)
		expect(container.querySelectorAll("h1")).toHaveLength(1)
		expect(screen.getByText(/no constituye asesoramiento financiero/)).toBeInTheDocument()
		expect(container.querySelector("aside")).not.toBeNull()
	})

	test("composes the kit: summary, toc, sections, faq", () => {
		render(<EconomicsTopicStarter />)
		expect(screen.getByRole("heading", { name: "En resumen" })).toBeInTheDocument()
		expect(screen.getByRole("navigation", { name: "Contenido del artículo" })).toBeInTheDocument()
		expect(screen.getByRole("heading", { name: "Preguntas frecuentes" })).toBeInTheDocument()
	})
})
