import type { ReactNode } from "react"
import ApachetaHeader from "@/components/content/apacheta-header"
import Breadcrumbs from "@/components/content/breadcrumbs"
import DonationCard from "@/components/content/donation-card"
import JsonLd from "@/components/content/json-ld"
import RelatedSidebar from "@/components/content/related-sidebar"
import { formatDate } from "@/lib/content/format"
import { entries } from "@/lib/content/registry"
import { getRelated } from "@/lib/content/related"
import { parseMeta, parseSeo } from "@/lib/content/schema"
import { buildJsonLd } from "@/lib/content/seo"
import type { ContentMeta, ContentSeo } from "@/lib/content/types"
import { breadcrumbsFor } from "@/lib/content/urls"

const DISCLAIMER =
	"Este contenido es informativo y no constituye asesoramiento financiero, legal ni impositivo. Las cifras y condiciones cambian: verificá los datos en las fuentes oficiales antes de tomar decisiones."

interface ContentShellProps {
	meta: ContentMeta
	seo: ContentSeo
	children: ReactNode
}

/**
 * Mandatory wrapper for every blog/tool page. Owns the trail header, the only <h1>, the sidebar,
 * the donation CTAs (header + desktop sidebar), sources, disclaimer and JSON-LD. The page body (children) is free-form.
 * Invalid meta/seo throws, which fails the static build.
 */
export default function ContentShell({ meta, seo, children }: ContentShellProps) {
	parseMeta(meta)
	parseSeo(seo)
	const related = getRelated(entries, meta.slug)
	const updated = meta.updatedAt ?? meta.publishedAt

	return (
		<div className="min-h-screen bg-background">
			<ApachetaHeader variant={meta.kind} />
			<div className="mx-auto max-w-5xl gap-10 px-5 pb-8 pt-4 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem]">
				<main>
					<Breadcrumbs crumbs={breadcrumbsFor(meta)} />
					<article className="mt-4">
						<header>
							<h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
								{meta.title}
							</h1>
							<p className="mt-3 font-mono text-xs text-muted-foreground">
								{meta.updatedAt && (
									<>
										<time dateTime={meta.publishedAt}>Publicado el {formatDate(meta.publishedAt)}</time>
										{" · "}
									</>
								)}
								<time dateTime={updated}>Actualizado el {formatDate(updated)}</time>
							</p>
						</header>
						<div className="mt-8 space-y-8 leading-relaxed text-foreground/90">{children}</div>
						<footer className="mt-12 border-t border-border pt-6">
							<h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Fuentes</h2>
							<ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
								{seo.sources.map((source) => (
									<li key={source.url}>
										<a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
											{source.name}
										</a>
									</li>
								))}
							</ul>
							<p className="mt-6 text-xs text-muted-foreground">{DISCLAIMER}</p>
						</footer>
					</article>
				</main>
				<aside aria-label="Recomendaciones" className="mt-10 space-y-8 lg:sticky lg:top-6 lg:mt-0 lg:self-start">
					<RelatedSidebar related={related} />
					<DonationCard className="hidden lg:block" />
				</aside>
			</div>
			<JsonLd data={buildJsonLd(meta, seo)} />
		</div>
	)
}
