import robots from "@/app/robots"

describe("robots", () => {
	test("allows blog, herramientas and donaciones", () => {
		const rules = robots().rules as { allow: string[] }
		for (const path of ["/blog", "/blog/*", "/herramientas", "/herramientas/*", "/donaciones"]) {
			expect(rules.allow).toContain(path)
		}
	})

	test("still blocks the dashboard", () => {
		const rules = robots().rules as { disallow: string[] }
		expect(rules.disallow).toContain("/dashboard")
	})
})
