import { render, screen } from "@testing-library/react"
import PortfolioPage from "@/app/brunojular/page"
import ProjectPage, { generateStaticParams } from "@/app/brunojular/[slug]/page"
import {
	getAdjacentProjects,
	getProjectBySlug,
	projects,
} from "@/lib/portfolio/projects"

describe("portfolio data", () => {
	test("getProjectBySlug finds a project and returns undefined for unknown slugs", () => {
		expect(getProjectBySlug("cyberpsi")?.title).toBe("CyberPsi")
		expect(getProjectBySlug("does-not-exist")).toBeUndefined()
	})

	test("getAdjacentProjects wraps around the list", () => {
		const first = projects[0].slug
		const last = projects[projects.length - 1].slug
		expect(getAdjacentProjects(first).prev?.slug).toBe(last)
		expect(getAdjacentProjects(last).next?.slug).toBe(first)
	})

	test("generateStaticParams covers every project", () => {
		expect(generateStaticParams()).toHaveLength(projects.length)
	})
})

describe("portfolio index", () => {
	test("lists every project with a link to its case study", () => {
		render(<PortfolioPage />)
		for (const project of projects) {
			const link = screen.getByRole("link", { name: new RegExp(project.title, "i") })
			expect(link).toHaveAttribute("href", `/brunojular/${project.slug}`)
		}
	})
})

describe("portfolio case study", () => {
	test("renders the narrative blocks for a known slug", async () => {
		render(await ProjectPage({ params: Promise.resolve({ slug: "disfren" }) }))
		expect(screen.getByRole("heading", { level: 1, name: "Disfren" })).toBeInTheDocument()
		for (const label of ["Problema", "Objetivo", "Solución", "Resultado"]) {
			expect(screen.getByRole("heading", { name: label })).toBeInTheDocument()
		}
	})

	test("calls notFound for an unknown slug", async () => {
		await expect(
			ProjectPage({ params: Promise.resolve({ slug: "nope" }) })
		).rejects.toThrow()
	})
})
