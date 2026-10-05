import type { ReactNode } from "react"
import ApachetaHeader from "@/components/content/apacheta-header"
import Breadcrumbs from "@/components/content/breadcrumbs"
import JsonLd from "@/components/content/json-ld"
import { breadcrumbJsonLd } from "@/lib/content/seo"
import type { ContentKind } from "@/lib/content/types"
import { sectionCrumbs } from "@/lib/content/urls"

/** Chrome for /blog and /herramientas: the trail header (with the donation button) and breadcrumbs. No sidebar (nothing to relate to). */
export default function ContentIndexLayout({
	section,
	title,
	intro,
	children,
}: {
	section: ContentKind
	title: string
	intro: string
	children: ReactNode
}) {
	const crumbs = sectionCrumbs(section)
	return (
		<div className="min-h-screen bg-background">
			<ApachetaHeader variant="index" />
			<main className="mx-auto max-w-4xl px-5 pb-10 pt-4 sm:px-6">
				<Breadcrumbs crumbs={crumbs} />
				<h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{title}</h1>
				<p className="mt-3 max-w-2xl text-lg text-foreground/80">{intro}</p>
				<div className="mt-10 space-y-12">{children}</div>
			</main>
			<JsonLd data={[breadcrumbJsonLd(crumbs)]} />
		</div>
	)
}
