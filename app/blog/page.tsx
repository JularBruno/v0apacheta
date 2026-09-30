import type { Metadata } from "next"
import CommunitySection from "@/components/content/community-section"
import ContentCard from "@/components/content/content-card"
import ContentIndexLayout from "@/components/content/index-layout"
import { listByKind } from "@/lib/content/registry"
import { buildPageMetadata } from "@/lib/content/seo"
import { CATEGORY_LABELS, type BlogCategory } from "@/lib/content/types"

export const dynamic = "force-static"

export const metadata: Metadata = buildPageMetadata({
	title: "Cuadernito",
	socialTitle: "Cuadernito | Apacheta",
	description: "El Cuadernito de Apacheta: economía explicada simple, finanzas personales y novedades de la app, para Argentina.",
	path: "/blog",
})

const CATEGORY_ORDER: BlogCategory[] = ["economia", "apacheta", "random"]

export default function BlogIndexPage() {
	const posts = listByKind("post")
	const groups = CATEGORY_ORDER.map((category) => ({
		category,
		posts: posts.filter((post) => post.category === category),
	})).filter((group) => group.posts.length > 0)

	return (
		<ContentIndexLayout
			section="post"
			title="Cuadernito de Apacheta"
			intro="Economía explicada simple, finanzas personales y novedades de la app, pensado para Argentina."
		>
			{groups.length === 0 ? (
				<p className="text-muted-foreground">Pronto vas a encontrar artículos acá.</p>
			) : (
				<>
					<nav aria-label="Categorías" className="flex flex-wrap gap-2">
						{groups.map((group) => (
							<a
								key={group.category}
								href={`#${group.category}`}
								className="rounded-full bg-muted px-3 py-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
							>
								{CATEGORY_LABELS[group.category]} ({group.posts.length})
							</a>
						))}
					</nav>
					{groups.map((group) => (
						<section key={group.category} id={group.category} aria-labelledby={`${group.category}-heading`} className="scroll-mt-20">
							<h2 id={`${group.category}-heading`} className="text-2xl font-bold tracking-tight text-foreground">
								{CATEGORY_LABELS[group.category]}
							</h2>
							<div className="mt-4 grid gap-4 sm:grid-cols-2">
								{group.posts.map((post) => (
									<ContentCard key={post.slug} meta={post} />
								))}
							</div>
						</section>
					))}
				</>
			)}
			<CommunitySection />
		</ContentIndexLayout>
	)
}
