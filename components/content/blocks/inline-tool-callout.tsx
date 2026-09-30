import Link from "next/link"
import { findEntry } from "@/lib/content/registry"
import { contentPath } from "@/lib/content/urls"

/** Mid-article pointer to a tool. Renders nothing for an unknown slug or a slug that isn't a tool. */
export default function InlineToolCallout({ slug }: { slug: string }) {
	const tool = findEntry(slug)
	if (!tool || tool.kind !== "tool") return null
	return (
		<div className="rounded-2xl border border-border bg-card p-5">
			<p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Probá la herramienta</p>
			<Link href={contentPath(tool)} className="mt-1 block text-lg font-bold text-foreground hover:underline">
				{tool.title}
			</Link>
			<p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
		</div>
	)
}
