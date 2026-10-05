import { z } from "zod"
import type { ContentMeta, ContentSeo } from "./types"

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?$/, "must be an ISO date like 2026-09-30")

export const metaSchema = z
	.object({
		slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be kebab-case"),
		kind: z.enum(["post", "tool"]),
		title: z.string().min(1).max(60),
		description: z.string().min(1).max(155),
		publishedAt: isoDate,
		updatedAt: isoDate.optional(),
		category: z.enum(["economia", "apacheta", "random"]).optional(),
		tags: z.array(z.string().min(1)),
		pinnedRelated: z.array(z.string().min(1)).optional(),
		cover: z.string().startsWith("/").optional(),
	})
	.superRefine((meta, ctx) => {
		if (meta.kind === "post" && !meta.category) {
			ctx.addIssue({ code: "custom", path: ["category"], message: "category is required for posts" })
		}
		if (meta.kind === "tool" && meta.category) {
			ctx.addIssue({ code: "custom", path: ["category"], message: "tools have no category" })
		}
		if (meta.updatedAt && Date.parse(meta.updatedAt) < Date.parse(meta.publishedAt)) {
			ctx.addIssue({ code: "custom", path: ["updatedAt"], message: "updatedAt is before publishedAt" })
		}
	})

export const seoSchema = z.object({
	summary: z.string().min(1),
	faq: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })).optional(),
	sources: z
		.array(
			z.object({
				name: z.string().min(1),
				url: z
					.string()
					.url()
					.refine((url) => url.startsWith("https://"), "source urls must be https"),
			}),
		)
		.min(1, "at least one source is required"),
})

function formatIssues(error: z.ZodError): string {
	return error.issues.map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`).join("; ")
}

/** Validates and returns the same object, throws with the slug and failing fields (fails the static build). */
export function parseMeta(meta: ContentMeta): ContentMeta {
	const result = metaSchema.safeParse(meta)
	if (!result.success) {
		throw new Error(`Invalid content meta for slug "${meta.slug}": ${formatIssues(result.error)}`)
	}
	return meta
}

export function parseSeo(seo: ContentSeo): ContentSeo {
	const result = seoSchema.safeParse(seo)
	if (!result.success) {
		throw new Error(`Invalid seo: ${formatIssues(result.error)}`)
	}
	return seo
}

export function assertValidRegistry(entries: ContentMeta[]): void {
	const slugs = new Set<string>()
	for (const entry of entries) {
		parseMeta(entry)
		if (slugs.has(entry.slug)) {
			throw new Error(`Duplicate slug "${entry.slug}" in content registry`)
		}
		slugs.add(entry.slug)
	}
	for (const entry of entries) {
		for (const pinned of entry.pinnedRelated ?? []) {
			if (!slugs.has(pinned)) {
				throw new Error(`pinnedRelated "${pinned}" on "${entry.slug}" is not in the content registry`)
			}
		}
	}
}
