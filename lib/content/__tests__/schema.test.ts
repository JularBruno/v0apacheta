import { assertValidRegistry, metaSchema, parseMeta, parseSeo, seoSchema } from "../schema"
import { makeMeta, makeTool } from "../__fixtures__/meta"
import { CATEGORY_LABELS } from "../types"

describe("metaSchema", () => {
	test("accepts a valid post and a valid tool", () => {
		expect(metaSchema.safeParse(makeMeta()).success).toBe(true)
		expect(metaSchema.safeParse(makeTool()).success).toBe(true)
	})

	test("rejects a title over 60 chars", () => {
		expect(metaSchema.safeParse(makeMeta({ title: "x".repeat(61) })).success).toBe(false)
		expect(metaSchema.safeParse(makeMeta({ title: "x".repeat(60) })).success).toBe(true)
	})

	test("rejects a description over 155 chars", () => {
		expect(metaSchema.safeParse(makeMeta({ description: "x".repeat(156) })).success).toBe(false)
		expect(metaSchema.safeParse(makeMeta({ description: "x".repeat(155) })).success).toBe(true)
	})

	test("accepts the pensar-argentino category, labelled \"El problema de pensar como Argentino\"", () => {
		expect(metaSchema.safeParse(makeMeta({ category: "pensar-argentino" })).success).toBe(true)
		expect(CATEGORY_LABELS["pensar-argentino"]).toBe("El problema de pensar como Argentino")
		expect(metaSchema.safeParse(makeMeta({ category: "inventada" as never })).success).toBe(false)
	})

	test("requires category on posts and forbids it on tools", () => {
		expect(metaSchema.safeParse(makeMeta({ category: undefined })).success).toBe(false)
		expect(metaSchema.safeParse(makeTool({ category: "economia" })).success).toBe(false)
	})

	test("rejects updatedAt before publishedAt", () => {
		const result = metaSchema.safeParse(makeMeta({ publishedAt: "2026-09-10", updatedAt: "2026-09-01" }))
		expect(result.success).toBe(false)
	})

	test("rejects slugs that are not kebab-case", () => {
		expect(metaSchema.safeParse(makeMeta({ slug: "Mi Post" })).success).toBe(false)
		expect(metaSchema.safeParse(makeMeta({ slug: "mi-post-2" })).success).toBe(true)
	})
})

describe("seoSchema", () => {
	const valid = { summary: "Resumen.", sources: [{ name: "INDEC", url: "https://www.indec.gob.ar/" }] }

	test("accepts a valid seo object, with or without faq", () => {
		expect(seoSchema.safeParse(valid).success).toBe(true)
		expect(seoSchema.safeParse({ ...valid, faq: [{ question: "¿Q?", answer: "A." }] }).success).toBe(true)
	})

	test("only accepts https source urls (no http:, javascript: or data: links in the footer)", () => {
		for (const url of ["http://example.com/", "javascript:alert(1)", "data:text/html,hola"]) {
			expect(seoSchema.safeParse({ ...valid, sources: [{ name: "x", url }] }).success).toBe(false)
		}
		expect(seoSchema.safeParse({ ...valid, sources: [{ name: "x", url: "https://example.com/a" }] }).success).toBe(true)
	})

	test("requires at least one source with a valid url", () => {
		expect(seoSchema.safeParse({ ...valid, sources: [] }).success).toBe(false)
		expect(seoSchema.safeParse({ ...valid, sources: [{ name: "x", url: "not-a-url" }] }).success).toBe(false)
	})
})

describe("parseMeta / parseSeo", () => {
	test("throw an error naming the slug and the failing field", () => {
		expect(() => parseMeta(makeMeta({ slug: "ejemplo", title: "x".repeat(61) }))).toThrow(
			/Invalid content meta for slug "ejemplo": title/,
		)
	})

	test("parseSeo throws on empty sources", () => {
		expect(() => parseSeo({ summary: "Resumen.", sources: [] })).toThrow(/Invalid seo/)
	})
})

describe("assertValidRegistry", () => {
	test("passes for a valid registry", () => {
		expect(() => assertValidRegistry([makeMeta(), makeTool()])).not.toThrow()
	})

	test("fails on a slug shared by a post and a tool", () => {
		expect(() => assertValidRegistry([makeMeta({ slug: "calculadora" }), makeTool({ slug: "calculadora" })])).toThrow(
			/Duplicate slug "calculadora"/,
		)
	})

	test("fails on a pinnedRelated slug that does not exist", () => {
		expect(() => assertValidRegistry([makeMeta({ pinnedRelated: ["no-existe"] })])).toThrow(
			/pinnedRelated "no-existe" on "ejemplo"/,
		)
	})

	test("fails on an entry that breaks the schema, naming its slug", () => {
		expect(() => assertValidRegistry([makeMeta({ title: "" })])).toThrow(/Invalid content meta for slug "ejemplo"/)
	})
})
