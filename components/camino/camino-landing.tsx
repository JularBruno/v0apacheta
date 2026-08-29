"use client"

import { useMemo } from "react"
import TrailMap from "@/components/trail-map/trail-map"
import { CHAPTERS, TRAIL_FOG_HEIGHT, TRAIL_NODES, TRAIL_SEGMENTS } from "@/lib/trail/chapters"
import CaminoNav from "./nav"
import CaminoFooter from "./camino-footer"
import { ChapterStop, ClosingStop, HeroStop } from "./stops"
import { useActiveSection } from "./use-active-section"

// Sections: hero (0) · chapters 1..5 · closing (6)
const SECTION_COUNT = CHAPTERS.length + 2

export default function CaminoLanding() {
	const { active, setRef } = useActiveSection(SECTION_COUNT)

	// hero → -1 (nothing reached), chapter i → i, closing → last chapter stays current
	const activeIndex = useMemo(
		() => Math.min(Math.max(active - 1, -1), CHAPTERS.length - 1),
		[active],
	)

	const mapProps = {
		nodes: TRAIL_NODES,
		segments: TRAIL_SEGMENTS,
		activeIndex,
		fogHeight: TRAIL_FOG_HEIGHT,
	}

	return (
		<div className="bg-background text-foreground">
			<CaminoNav />

			<div className="relative pt-14">
				{/* Mobile: map pinned as a band above the scrolling chapters */}
				<div className="sticky top-14 z-30 h-[42vh] overflow-hidden border-b border-[color:var(--map-parchment-edge)] bg-[color:var(--map-parchment-light)] md:hidden">
					<TrailMap {...mapProps} className="h-full w-full" />
				</div>

				<div className="md:flex md:items-start">
					<div className="md:min-w-0 md:flex-1">
						<section ref={setRef(0)}>
							<HeroStop />
						</section>

						{CHAPTERS.map((chapter, i) => (
							<section key={chapter.chapter} ref={setRef(i + 1)}>
								<ChapterStop chapter={chapter} index={i} />
							</section>
						))}

						<section ref={setRef(SECTION_COUNT - 1)}>
							<ClosingStop />
						</section>
					</div>

					{/* Desktop: map sticky on the right */}
					<div className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[48%] shrink-0 items-center justify-center p-6 md:flex lg:p-10">
						<div
							className="aspect-[700/530] w-full overflow-hidden rounded-2xl border border-[color:var(--map-parchment-edge)]"
							style={{ boxShadow: "0 4px 40px rgba(45,26,14,0.18)" }}
						>
							<TrailMap {...mapProps} className="h-full w-full" />
						</div>
					</div>
				</div>
			</div>

			<CaminoFooter />
		</div>
	)
}
