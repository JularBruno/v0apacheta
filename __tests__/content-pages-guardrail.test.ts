import fs from "fs"
import path from "path"
import { entries } from "@/lib/content/registry"
import type { ContentKind } from "@/lib/content/types"

const ROOT = path.resolve(__dirname, "..")
const SECTIONS: { dir: string; kind: ContentKind }[] = [
	{ dir: "app/blog", kind: "post" },
	{ dir: "app/herramientas", kind: "tool" },
]

function pageSlugs(dir: string): string[] {
	const abs = path.join(ROOT, dir)
	if (!fs.existsSync(abs)) return []
	return fs
		.readdirSync(abs, { withFileTypes: true })
		.filter((d) => d.isDirectory() && fs.existsSync(path.join(abs, d.name, "page.tsx")))
		.map((d) => d.name)
}

describe.each(SECTIONS)("content pages in $dir", ({ dir, kind }) => {
	const slugs = pageSlugs(dir)

	test("every page follows the CLAUDE.md rules", () => {
		const violations: string[] = []
		for (const slug of slugs) {
			const source = fs.readFileSync(path.join(ROOT, dir, slug, "page.tsx"), "utf8")
			const where = `${dir}/${slug}`
			if (!source.includes("ContentShell")) violations.push(`${where}: does not use ContentShell`)
			if (/<h1[\s>]/.test(source)) violations.push(`${where}: has a stray <h1> (the shell owns it)`)
			if (!/dynamic\s*=\s*["']force-static["']/.test(source)) violations.push(`${where}: missing force-static`)
			if (!source.includes("generateMetadata") || !source.includes("buildMetadata")) {
				violations.push(`${where}: generateMetadata must use buildMetadata(meta)`)
			}
			if (!fs.existsSync(path.join(ROOT, dir, slug, "meta.ts"))) violations.push(`${where}: missing meta.ts`)
		}
		expect(violations).toEqual([])
	})

	test("every page folder is registered with the right kind", () => {
		const missing = slugs
			.filter((slug) => !entries.some((e) => e.slug === slug && e.kind === kind))
			.map(
				(slug) =>
					`${dir}/${slug} is not registered: add its meta import at "// [registry:imports]" and the entry at "// [registry:entries]" in lib/content/registry.ts`,
			)
		expect(missing).toEqual([])
	})

	test("every registry entry of this kind has a page folder", () => {
		const orphans = entries.filter((e) => e.kind === kind && !slugs.includes(e.slug)).map((e) => e.slug)
		expect(orphans).toEqual([])
	})
})
