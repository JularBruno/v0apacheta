import type { ReactNode } from "react"
import { render } from "@testing-library/react"
import { entries } from "@/lib/content/registry"

// Loads each registered post page for real (meta + seo validation run inside ContentShell), so a
// broken post fails here instead of failing the production build.
describe("every registered post page renders", () => {
	const posts = entries.filter((entry) => entry.kind === "post")

	test("there are posts to check", () => {
		expect(posts.length).toBeGreaterThan(1)
	})

	for (const post of posts) {
		test(`${post.slug}: one h1 with its title, a FAQ in the HTML, and its JSON-LD`, () => {
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const Page = require(`@/app/blog/${post.slug}/page`).default as () => ReactNode
			const { container } = render(<Page />)
			const h1s = container.querySelectorAll("h1")
			expect(h1s).toHaveLength(1)
			expect(h1s[0]).toHaveTextContent(post.title)
			expect(container.querySelectorAll("details").length).toBeGreaterThan(0)
			const types = Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map(
				(script) => JSON.parse(script.textContent ?? "{}")["@type"],
			)
			expect(types).toEqual(["Article", "BreadcrumbList", "FAQPage"])
		})
	}
})
