import type { ContentMeta } from "../types"

export function makeMeta(overrides: Partial<ContentMeta> = {}): ContentMeta {
	return {
		slug: "ejemplo",
		kind: "post",
		title: "Un título de ejemplo",
		description: "Una descripción de ejemplo para tests.",
		publishedAt: "2026-09-01",
		category: "economia",
		tags: ["inflacion"],
		...overrides,
	}
}

export function makeTool(overrides: Partial<ContentMeta> = {}): ContentMeta {
	return makeMeta({ slug: "calculadora", kind: "tool", category: undefined, ...overrides })
}
