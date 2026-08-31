"use client"

import { useRef } from "react"
import Link from "next/link"
import { CHAPTERS, CLOSING, HERO } from "@/lib/trail/chapters"
import CaminoNav from "./nav"
import CaminoFooter from "./camino-footer"
import ChapterStation from "./chapter-station"
import Scenery from "./scenery"
import { useTrail } from "./use-trail"
import styles from "./camino.module.css"

function ArrowRight() {
	return (
		<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
			<path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
		</svg>
	)
}

export default function CaminoLanding() {
	const trailRef = useRef<HTMLDivElement>(null)
	const fullRef = useRef<SVGPathElement>(null)
	const walkedRef = useRef<SVGPathElement>(null)

	const { activeIndex, reachedCount, inView, geometry } = useTrail({
		trailRef,
		fullRef,
		walkedRef,
		count: CHAPTERS.length,
	})

	return (
		<div className="bg-background text-foreground">
			<CaminoNav />

			<header className="mx-auto max-w-2xl px-5 pb-8 pt-16 sm:px-6">
				<p className="font-mono text-xs font-medium uppercase tracking-[0.17em] text-primary">
					{HERO.eyebrow}
				</p>
				<h1 className="mb-4 mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl">
					{HERO.title}
					<br />
					<span className="text-primary">{HERO.titleAccent}</span>
				</h1>
				<p className="mb-6 max-w-[42ch] text-lg leading-relaxed text-muted-foreground">{HERO.body}</p>
				<Link
					href="/onboarding"
					className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-base font-bold text-accent-foreground transition-opacity hover:opacity-90"
				>
					{HERO.cta}
					<ArrowRight />
				</Link>
				<div className="mt-7 flex items-center gap-2 font-mono text-xs tracking-wide text-muted-foreground">
					<svg
						width="15"
						height="15"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.4"
						className="motion-safe:animate-bounce"
						aria-hidden="true"
					>
						<path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
					{HERO.scrollHint}
				</div>
			</header>

			<div ref={trailRef} className={styles.trail}>
				<div className={styles.bg} aria-hidden="true" />
				<Scenery geometry={geometry} />
				<svg className={styles.svg} aria-hidden="true">
					<path ref={fullRef} className={styles.full} />
					<path ref={walkedRef} className={styles.walked} />
				</svg>

				{CHAPTERS.map((chapter, i) => (
					<ChapterStation
						key={chapter.n}
						chapter={chapter}
						index={i}
						reached={i < reachedCount}
						here={i === activeIndex}
						inView={inView[i]}
					/>
				))}
			</div>

			<section id="empezar" className="mx-auto max-w-2xl px-5 pb-2 pt-10 text-center sm:px-6">
				<p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.17em] text-primary">
					{CLOSING.eyebrow}
				</p>
				<h2 className="mb-3 text-3xl font-extrabold leading-tight tracking-tight text-balance sm:text-4xl">
					{CLOSING.title}
				</h2>
				<p className="mx-auto mb-6 max-w-[34ch] text-muted-foreground">{CLOSING.body}</p>
				<Link
					href="/onboarding"
					className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-base font-bold text-accent-foreground transition-opacity hover:opacity-90"
				>
					{CLOSING.cta}
					<ArrowRight />
				</Link>
			</section>

			<CaminoFooter />
		</div>
	)
}
