import type { ContentKind, ContentMeta } from "./types"
import { assertValidRegistry } from "./schema"
import { byNewest } from "./sort"
import { meta as queEsLaInflacion } from "@/app/blog/que-es-la-inflacion/meta"
import { meta as queEsUnaPwa } from "@/app/blog/que-es-una-pwa-y-como-crear-una-en-nextjs/meta"
// [registry:imports] one import line per post/tool, appended by the generator

export const entries: ContentMeta[] = [
	queEsLaInflacion,
	queEsUnaPwa,
	// [registry:entries]
]

// Fails the build (and every test importing this) on an invalid or inconsistent registry.
assertValidRegistry(entries)

export function findEntry(slug: string): ContentMeta | undefined {
	return entries.find((entry) => entry.slug === slug)
}

export function listByKind(kind: ContentKind): ContentMeta[] {
	return entries.filter((entry) => entry.kind === kind).sort(byNewest)
}
