import {
	articleJsonLd,
	breadcrumbJsonLd,
	buildJsonLd,
	buildMetadata,
	faqJsonLd,
	serializeJsonLd,
	webApplicationJsonLd,
} from "../seo"
import { makeMeta, makeTool } from "../__fixtures__/meta"

const seo = { summary: "Resumen.", sources: [{ name: "INDEC", url: "https://www.indec.gob.ar/" }] }

describe("buildMetadata", () => {
	test("sets canonical, es_AR open graph and twitter card for a post", () => {
		const meta = makeMeta({ slug: "mi-post", publishedAt: "2026-09-01" })
		const metadata = buildMetadata(meta)
		expect(metadata.title).toBe(meta.title)
		expect(metadata.description).toBe(meta.description)
		expect(metadata.alternates?.canonical).toBe("https://apacheta.ar/blog/mi-post")
		expect(metadata.openGraph).toMatchObject({
			type: "article",
			locale: "es_AR",
			url: "https://apacheta.ar/blog/mi-post",
			publishedTime: "2026-09-01",
			modifiedTime: "2026-09-01",
		})
		expect(metadata.twitter).toMatchObject({ card: "summary_large_image" })
	})

	test("uses updatedAt for modifiedTime when present", () => {
		const metadata = buildMetadata(makeMeta({ publishedAt: "2026-09-01", updatedAt: "2026-09-20" }))
		expect(metadata.openGraph).toMatchObject({ modifiedTime: "2026-09-20" })
	})

	test("tools are website og type with no article times, and cover becomes an image", () => {
		const metadata = buildMetadata(makeTool({ slug: "calc", cover: "/herramientas/calc.webp" }))
		expect(metadata.alternates?.canonical).toBe("https://apacheta.ar/herramientas/calc")
		expect(metadata.openGraph).toMatchObject({ type: "website", images: ["/herramientas/calc.webp"] })
		expect(metadata.openGraph).not.toHaveProperty("publishedTime")
	})
})

describe("JSON-LD", () => {
	test("article dateModified falls back to publishedAt", () => {
		const ld = articleJsonLd(makeMeta({ publishedAt: "2026-09-01" }))
		expect(ld["@type"]).toBe("Article")
		expect(ld.datePublished).toBe("2026-09-01")
		expect(ld.dateModified).toBe("2026-09-01")
		expect(ld.inLanguage).toBe("es-AR")
	})

	test("article dateModified uses updatedAt when present", () => {
		const ld = articleJsonLd(makeMeta({ publishedAt: "2026-09-01", updatedAt: "2026-09-20" }))
		expect(ld.dateModified).toBe("2026-09-20")
	})

	test("tools are WebApplication", () => {
		const ld = webApplicationJsonLd(makeTool({ slug: "calc" }))
		expect(ld["@type"]).toBe("WebApplication")
		expect(ld.url).toBe("https://apacheta.ar/herramientas/calc")
	})

	test("faq maps to FAQPage questions", () => {
		const ld = faqJsonLd([{ question: "¿Q?", answer: "A." }])
		expect(ld["@type"]).toBe("FAQPage")
		expect(ld.mainEntity).toEqual([
			{ "@type": "Question", name: "¿Q?", acceptedAnswer: { "@type": "Answer", text: "A." } },
		])
	})

	test("breadcrumbs are positioned and absolute", () => {
		const ld = breadcrumbJsonLd([
			{ name: "Inicio", path: "/" },
			{ name: "Cuadernito", path: "/blog" },
		])
		expect(ld.itemListElement).toEqual([
			{ "@type": "ListItem", position: 1, name: "Inicio", item: "https://apacheta.ar/" },
			{ "@type": "ListItem", position: 2, name: "Cuadernito", item: "https://apacheta.ar/blog" },
		])
	})

	test("buildJsonLd includes FAQPage only when there is a faq", () => {
		const types = (faq?: { question: string; answer: string }[]) =>
			buildJsonLd(makeMeta(), { ...seo, faq }).map((ld) => ld["@type"])
		expect(types()).toEqual(["Article", "BreadcrumbList"])
		expect(types([])).toEqual(["Article", "BreadcrumbList"])
		expect(types([{ question: "¿Q?", answer: "A." }])).toEqual(["Article", "BreadcrumbList", "FAQPage"])
	})

	test("buildJsonLd uses WebApplication for tools", () => {
		expect(buildJsonLd(makeTool(), seo).map((ld) => ld["@type"])).toEqual(["WebApplication", "BreadcrumbList"])
	})

	test("serializeJsonLd cannot break out of a script tag and round-trips", () => {
		const nasty = `</script><script>alert("x")</script> & <b>"q"</b>`
		const output = serializeJsonLd(faqJsonLd([{ question: nasty, answer: nasty }]))
		expect(output).not.toContain("</script>")
		expect(output).not.toContain("<")
		const parsed = JSON.parse(output)
		expect(parsed.mainEntity[0].name).toBe(nasty)
	})
})
