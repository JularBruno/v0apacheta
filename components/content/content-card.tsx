import Link from "next/link"
import { formatDate } from "@/lib/content/format"
import type { ContentMeta } from "@/lib/content/types"
import { contentPath } from "@/lib/content/urls"

export default function ContentCard({ meta }: { meta: ContentMeta }) {
	return (
		<article className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
			<h3 className="text-lg font-bold leading-snug text-foreground">
				<Link href={contentPath(meta)} className="hover:underline">
					{meta.title}
				</Link>
			</h3>
			<p className="mt-2 text-sm text-muted-foreground">{meta.description}</p>
			<p className="mt-3 font-mono text-[11px] text-muted-foreground">
				<time dateTime={meta.publishedAt}>{formatDate(meta.publishedAt)}</time>
			</p>
		</article>
	)
}
