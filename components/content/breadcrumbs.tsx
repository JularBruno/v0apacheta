import Link from "next/link"
import type { Crumb } from "@/lib/content/urls"

export default function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
	return (
		<nav aria-label="Breadcrumb" className="font-mono text-xs text-muted-foreground">
			<ol className="flex flex-wrap items-center gap-1.5">
				{crumbs.map((crumb, index) => {
					const isLast = index === crumbs.length - 1
					return (
						<li key={crumb.path} className="inline-flex items-center gap-1.5">
							{isLast ? (
								<span aria-current="page" className="text-foreground/80">
									{crumb.name}
								</span>
							) : (
								<Link href={crumb.path} className="transition-colors hover:text-foreground">
									{crumb.name}
								</Link>
							)}
							{!isLast && <span aria-hidden="true">/</span>}
						</li>
					)
				})}
			</ol>
		</nav>
	)
}
