import type { ReactNode } from "react"
import ApachetaBlurb from "@/components/content/apacheta-blurb"
import Breadcrumbs from "@/components/content/breadcrumbs"
import DonationCard from "@/components/content/donation-card"
import JsonLd from "@/components/content/json-ld"
import { breadcrumbJsonLd } from "@/lib/content/seo"
import type { ContentKind } from "@/lib/content/types"
import { sectionCrumbs } from "@/lib/content/urls"

/** Chrome for /blog and /herramientas: blurb, breadcrumbs, donation card. No sidebar (nothing to relate to). */
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
			<ApachetaBlurb variant="index" />
			<main className="mx-auto max-w-4xl px-5 py-10 sm:px-6">
				<Breadcrumbs crumbs={crumbs} />
				<h1 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{title}</h1>
				<p className="mt-3 max-w-2xl text-lg text-foreground/80">{intro}</p>
				<div className="mt-10 space-y-12">{children}</div>
				<DonationCard className="mt-16" />
			</main>
			<JsonLd data={[breadcrumbJsonLd(crumbs)]} />
		</div>
	)
}
