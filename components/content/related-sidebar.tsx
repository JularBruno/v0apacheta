import Link from "next/link"
import { CATEGORY_LABELS } from "@/lib/content/types"
import { contentPath } from "@/lib/content/urls"
import type { Related } from "@/lib/content/related"

const GROUPS = [
	{ key: "tools", title: "Herramientas relacionadas" },
	{ key: "posts", title: "Artículos relacionados" },
] as const

/** Empty groups are omitted (no empty headings); renders nothing when both are empty. */
export default function RelatedSidebar({ related }: { related: Related }) {
	return (
		<>
			{GROUPS.map(({ key, title }) => {
				const items = related[key]
				if (items.length === 0) return null
				return (
					<section key={key} aria-labelledby={`related-${key}`}>
						<h2 id={`related-${key}`} className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
							{title}
						</h2>
						<ul className="mt-3 space-y-3">
							{items.map((item) => (
								<li key={item.slug}>
									<Link href={contentPath(item)} className="group block">
										<span className="text-sm font-semibold text-foreground/90 group-hover:text-foreground group-hover:underline">
											{item.title}
										</span>
										{item.category && (
											<span className="block font-mono text-[11px] text-muted-foreground">
												{CATEGORY_LABELS[item.category]}
											</span>
										)}
									</Link>
								</li>
							))}
						</ul>
					</section>
				)
			})}
		</>
	)
}
