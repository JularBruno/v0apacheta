import type { Metadata } from "next"
import type { ContentMeta, ContentSeo, FaqItem } from "./types"
import { SITE_URL, breadcrumbsFor, contentUrl, type Crumb } from "./urls"

export type JsonLd = Record<string, unknown>

const CONTEXT = "https://schema.org"
const LANGUAGE = "es-AR"
const PUBLISHER = { "@type": "Organization", name: "Apacheta", url: SITE_URL }

/**
 * The root app/opengraph-image.tsx only reaches pages that don't set their own `openGraph`
 * (Next replaces that object wholesale), so every page here carries its own image.
 */
export const DEFAULT_SHARE_IMAGE = "/opengraph-image"

/** Use as `generateMetadata` output; the `%s | Apacheta` template lives in the blog/herramientas layouts. */
export function buildMetadata(meta: ContentMeta): Metadata {
	const url = contentUrl(meta)
	const images = [meta.cover ?? DEFAULT_SHARE_IMAGE]
	const common = {
		url,
		title: meta.title,
		description: meta.description,
		locale: "es_AR",
		siteName: "Apacheta",
		images,
	}
	return {
		title: meta.title,
		description: meta.description,
		alternates: { canonical: url },
		openGraph:
			meta.kind === "post"
				? {
						type: "article",
						...common,
						publishedTime: meta.publishedAt,
						modifiedTime: meta.updatedAt ?? meta.publishedAt,
					}
				: { type: "website", ...common },
		twitter: { card: "summary_large_image", title: meta.title, description: meta.description, images },
	}
}

/**
 * Metadata for index-style pages (/blog, /herramientas, /donaciones). `title` goes through the
 * segment's title template; `socialTitle` is the already-final title used for og/twitter, which
 * templates don't apply to.
 */
export function buildPageMetadata({
	title,
	socialTitle,
	description,
	path,
}: {
	title: string
	socialTitle: string
	description: string
	path: string
}): Metadata {
	const url = `${SITE_URL}${path}`
	return {
		title,
		description,
		alternates: { canonical: url },
		openGraph: {
			type: "website",
			url,
			title: socialTitle,
			description,
			locale: "es_AR",
			siteName: "Apacheta",
			images: [DEFAULT_SHARE_IMAGE],
		},
		twitter: { card: "summary_large_image", title: socialTitle, description, images: [DEFAULT_SHARE_IMAGE] },
	}
}

export function articleJsonLd(meta: ContentMeta): JsonLd {
	return {
		"@context": CONTEXT,
		"@type": "Article",
		headline: meta.title,
		description: meta.description,
		datePublished: meta.publishedAt,
		dateModified: meta.updatedAt ?? meta.publishedAt,
		inLanguage: LANGUAGE,
		mainEntityOfPage: contentUrl(meta),
		author: PUBLISHER,
		publisher: PUBLISHER,
		...(meta.cover ? { image: `${SITE_URL}${meta.cover}` } : {}),
	}
}

export function webApplicationJsonLd(meta: ContentMeta): JsonLd {
	return {
		"@context": CONTEXT,
		"@type": "WebApplication",
		name: meta.title,
		description: meta.description,
		url: contentUrl(meta),
		applicationCategory: "FinanceApplication",
		operatingSystem: "Any",
		inLanguage: LANGUAGE,
		offers: { "@type": "Offer", price: "0", priceCurrency: "ARS" },
	}
}

export function faqJsonLd(faq: FaqItem[]): JsonLd {
	return {
		"@context": CONTEXT,
		"@type": "FAQPage",
		mainEntity: faq.map((item) => ({
			"@type": "Question",
			name: item.question,
			acceptedAnswer: { "@type": "Answer", text: item.answer },
		})),
	}
}

export function breadcrumbJsonLd(crumbs: Crumb[]): JsonLd {
	return {
		"@context": CONTEXT,
		"@type": "BreadcrumbList",
		itemListElement: crumbs.map((crumb, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: crumb.name,
			item: `${SITE_URL}${crumb.path}`,
		})),
	}
}

export function buildJsonLd(meta: ContentMeta, seo: ContentSeo): JsonLd[] {
	return [
		meta.kind === "post" ? articleJsonLd(meta) : webApplicationJsonLd(meta),
		breadcrumbJsonLd(breadcrumbsFor(meta)),
		...(seo.faq && seo.faq.length > 0 ? [faqJsonLd(seo.faq)] : []),
	]
}

/** JSON for an inline <script type="application/ld+json">; `<` is escaped so content can never close the tag. */
export function serializeJsonLd(data: JsonLd): string {
	return JSON.stringify(data).replace(/</g, "\\u003c")
}
