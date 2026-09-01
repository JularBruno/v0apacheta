"use client"

import { useRef, type ReactNode } from "react"
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

function CtaButton({ children }: { children: ReactNode }) {
	return (
		<Link
			href="/onboarding"
			className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-base font-bold text-primary-foreground shadow-lg transition-colors hover:bg-primary-500 hover:shadow-xl"
		>
			{children}
			<ArrowRight />
		</Link>
	)
}

export default function CaminoLanding() {
	const pageRef = useRef<HTMLDivElement>(null)
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
		<div ref={pageRef} className={styles.page}>
			<Scenery pageRef={pageRef} geometry={geometry} />

			<div className={styles.content}>
				<CaminoNav />

				<header data-clear className={`mx-auto max-w-2xl px-5 pb-10 pt-20 sm:px-6 ${styles.textZone}`}>
					<h1 className="mb-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl">
						{HERO.title}
						<br />
						<span className="text-primary">{HERO.titleAccent}</span>
					</h1>
					<p className="mb-7 max-w-[42ch] text-lg leading-relaxed text-muted-foreground">{HERO.body}</p>
					<CtaButton>{HERO.cta}</CtaButton>
					<div className="mt-8 flex items-center gap-2 font-mono text-xs tracking-wide text-muted-foreground">
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

				<div ref={trailRef} data-trail className={styles.trail}>
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

				<section
					data-clear
					id="empezar"
					className={`mx-auto max-w-2xl px-5 pb-4 pt-10 text-center sm:px-6 ${styles.textZone}`}
				>
					<h2 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-balance sm:text-4xl">
						{CLOSING.title}
					</h2>
					<p className="mx-auto mb-7 max-w-[34ch] text-muted-foreground">{CLOSING.body}</p>
					<CtaButton>{CLOSING.cta}</CtaButton>
				</section>

				<section data-clear className="mx-auto max-w-4xl px-5 py-12 sm:px-6">
					<a href="https://malvinas.argentinadatos.com/" target="_blank" rel="noopener noreferrer">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="https://malvinas.argentinadatos.com/header.png"
							width={1500}
							height={500}
							alt="Islas Malvinas Argentinas — Portada de perfil"
							className="h-auto w-full rounded-xl"
						/>
					</a>
				</section>

				<CaminoFooter />
			</div>
		</div>
	)
}
